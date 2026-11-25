// Administrator Panel Routes
const crypto = require('node:crypto');
const { query, get, run } = require('../db/database');
const { extractUserFromRequest } = require('../middleware/auth');
const { hashPassword } = require('../db/seed');
const { logAudit, getAuditLogs } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');
const { CATEGORY_DEFINITIONS } = require('../services/aiService');

function handleAdminRoutes(req, res, parsedUrl, body) {
    const { pathname, query: queryParams } = parsedUrl;
    const method = req.method;

    if (!pathname.startsWith('/api/admin/')) {
        return false;
    }

    const user = extractUserFromRequest(req);
    if (!user || user.role !== 'admin') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Access restricted to system administrators.' }));
    }

    // 1. GET /api/admin/overview
    if (pathname === '/api/admin/overview' && method === 'GET') {
        const totalUsers = query('SELECT COUNT(*) as count FROM users')[0].count;
        const staffCount = query("SELECT COUNT(*) as count FROM users WHERE role = 'staff'")[0].count;
        const citizenCount = query("SELECT COUNT(*) as count FROM users WHERE role = 'citizen'")[0].count;
        const totalComplaints = query('SELECT COUNT(*) as count FROM complaints')[0].count;
        const overdueComplaints = query(`
            SELECT COUNT(*) as count FROM complaints
            WHERE current_status NOT IN ('Resolved', 'Closed', 'Rejected')
              AND estimated_resolution_at IS NOT NULL
              AND datetime(estimated_resolution_at) < datetime('now')
        `)[0].count;

        const deptWorkloads = query(`
            SELECT d.id, d.department_name, d.code,
                   COUNT(c.id) as total_complaints,
                   SUM(CASE WHEN c.current_status IN ('Submitted', 'Under Review', 'Assigned') THEN 1 ELSE 0 END) as pending_complaints,
                   SUM(CASE WHEN c.current_status = 'In Progress' THEN 1 ELSE 0 END) as active_complaints,
                   SUM(CASE WHEN c.current_status IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) as resolved_complaints
            FROM departments d
            LEFT JOIN complaints c ON d.id = c.department_id
            GROUP BY d.id
        `);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            counts: {
                totalUsers,
                staffCount,
                citizenCount,
                totalComplaints,
                overdueComplaints
            },
            deptWorkloads
        }));
    }

    // 2. GET /api/admin/users
    if (pathname === '/api/admin/users' && method === 'GET') {
        const users = query(`
            SELECT u.id, u.name, u.email, u.phone, u.role, u.is_active, u.created_at,
                   d.department_name, d.code as department_code
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            ORDER BY u.created_at DESC
        `);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ users }));
    }

    // 3. POST /api/admin/staff (Create new staff member)
    if (pathname === '/api/admin/staff' && method === 'POST') {
        const { name, email, phone, password, departmentId, role } = body;

        if (!name || !email || !password || !departmentId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Name, email, password, and department are required.' }));
        }

        const existing = get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
        if (existing) {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'User with this email already exists.' }));
        }

        const staffId = `usr-staff-${crypto.randomUUID().slice(0, 8)}`;
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = hashPassword(password, salt);
        const finalRole = (role === 'admin') ? 'admin' : 'staff';

        run(
            `INSERT INTO users (id, name, email, phone, password_hash, salt, role, department_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [staffId, name.trim(), email.toLowerCase().trim(), phone || '', hash, salt, finalRole, departmentId]
        );

        logAudit({
            actorId: user.id,
            actorName: user.name,
            actorRole: user.role,
            action: 'CREATE_STAFF_ACCOUNT',
            affectedRecordType: 'user',
            affectedRecordId: staffId,
            details: { email, departmentId, role: finalRole },
            ipAddress: req.socket.remoteAddress
        });

        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            message: `Staff account created for ${name}`,
            staff: { id: staffId, name, email, role: finalRole, departmentId }
        }));
    }

    // 4. GET /api/admin/departments
    if (pathname === '/api/admin/departments' && method === 'GET') {
        const departments = query(`
            SELECT d.*,
                   COUNT(u.id) as staff_count,
                   (SELECT COUNT(*) FROM complaints WHERE department_id = d.id AND current_status NOT IN ('Resolved', 'Closed')) as active_complaints_count
            FROM departments d
            LEFT JOIN users u ON d.id = u.department_id AND u.role = 'staff'
            GROUP BY d.id
        `);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ departments }));
    }

    // 5. GET /api/admin/audit-logs
    if (pathname === '/api/admin/audit-logs' && method === 'GET') {
        const limit = parseInt(queryParams.limit, 10) || 50;
        const offset = parseInt(queryParams.offset, 10) || 0;
        const type = queryParams.type || null;

        const logs = getAuditLogs(limit, offset, type);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ logs }));
    }

    // 6. GET /api/admin/categories
    if (pathname === '/api/admin/categories' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ categories: CATEGORY_DEFINITIONS }));
    }

    // 7. POST /api/admin/allot-task (Assign a specific complaint/task to a staff member with directives)
    if (pathname === '/api/admin/allot-task' && method === 'POST') {
        const { complaintId, staffId, instructions, priority, estimatedHours, departmentId } = body || {};

        if (!complaintId || !staffId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Complaint ID and Staff Officer ID are required for task allotment.' }));
        }

        const complaint = get('SELECT * FROM complaints WHERE id = ? OR complaint_number = ?', [complaintId, complaintId]);
        if (!complaint) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Complaint not found.' }));
        }

        const staff = get(`
            SELECT u.*, d.department_name, d.code as department_code
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.id = ? AND u.role = 'staff' AND u.is_active = 1
        `, [staffId]);

        if (!staff) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Selected officer does not exist or is not an active staff member.' }));
        }

        const prevStatus = complaint.current_status;
        const prevStaffId = complaint.assigned_staff_id;

        // Transition status if currently unassigned or in early intake
        let newStatus = complaint.current_status;
        if (complaint.current_status === 'Submitted' || complaint.current_status === 'Under Review') {
            newStatus = 'Assigned';
        }

        // Calculate target SLA deadline if provided
        let estRes = complaint.estimated_resolution_at;
        if (estimatedHours) {
            const hours = parseInt(estimatedHours, 10);
            if (!isNaN(hours) && hours > 0) {
                estRes = new Date(Date.now() + hours * 3600 * 1000).toISOString();
            }
        }

        const finalPriority = priority || complaint.priority;
        const targetDeptId = departmentId || staff.department_id || complaint.department_id;

        // Update Complaint Table
        run(`
            UPDATE complaints
            SET assigned_staff_id = ?,
                department_id = ?,
                priority = ?,
                current_status = ?,
                estimated_resolution_at = ?,
                updated_at = datetime('now')
            WHERE id = ?
        `, [staff.id, targetDeptId, finalPriority, newStatus, estRes, complaint.id]);

        // Insert timestamped record into complaint_updates
        const updateId = `upd-${crypto.randomUUID().slice(0, 8)}`;
        const directiveText = (instructions && instructions.trim().length > 0)
            ? instructions.trim()
            : 'Proceed with field inspection, verify on-site conditions, and complete resolution.';
        const publicMsg = `Task officially allotted to Ward Staff Officer (${staff.name}, ${staff.department_name || 'Municipal Corp'}) by Municipal Administration.`;
        const internalMsg = `[ADMIN TASK ALLOTMENT DIRECTIVE by ${user.name}]: ${directiveText}`;

        run(`
            INSERT INTO complaint_updates (id, complaint_id, updated_by, previous_status, new_status, public_message, internal_note, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `, [updateId, complaint.id, user.id, prevStatus, newStatus, publicMsg, internalMsg]);

        // Notify Assigned Staff Officer
        createNotification({
            userId: staff.id,
            complaintId: complaint.id,
            type: 'task_allotted',
            title: `📋 New Task Allotted: ${complaint.complaint_number}`,
            message: `Admin ${user.name} has assigned you complaint "${complaint.title}". Directive: ${directiveText}`
        });

        // Notify Citizen Complainant (if registered)
        if (complaint.citizen_id) {
            createNotification({
                userId: complaint.citizen_id,
                complaintId: complaint.id,
                type: 'status_update',
                title: `Grievance Assigned: ${complaint.complaint_number}`,
                message: `Your grievance has been assigned to Officer ${staff.name} (${staff.department_name || 'Field Services'}) for resolution.`
            });
        }

        // Immutable Audit Log
        logAudit({
            actorId: user.id,
            actorName: user.name,
            actorRole: user.role,
            action: 'ALLOT_TASK_TO_STAFF',
            affectedRecordType: 'complaint',
            affectedRecordId: complaint.id,
            details: {
                complaintNumber: complaint.complaint_number,
                staffId: staff.id,
                staffName: staff.name,
                previousStaffId: prevStaffId,
                directive: directiveText,
                priority: finalPriority,
                estimatedHours: estimatedHours || null
            },
            ipAddress: req.socket.remoteAddress
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            success: true,
            message: `Task ${complaint.complaint_number} successfully allotted to ${staff.name}`,
            complaintId: complaint.id,
            complaintNumber: complaint.complaint_number,
            assignedStaff: {
                id: staff.id,
                name: staff.name,
                email: staff.email,
                department: staff.department_name
            },
            status: newStatus,
            priority: finalPriority,
            estimatedResolutionAt: estRes,
            directive: directiveText
        }));
    }

    // 8. GET /api/admin/staff-workload (List staff members with current active workload for intelligent allotment)
    if (pathname === '/api/admin/staff-workload' && method === 'GET') {
        const staffList = query(`
            SELECT u.id, u.name, u.email, u.phone, u.role, u.department_id,
                   d.department_name, d.code as department_code,
                   (SELECT COUNT(*) FROM complaints WHERE assigned_staff_id = u.id AND current_status NOT IN ('Resolved', 'Closed', 'Rejected')) as active_tasks,
                   (SELECT COUNT(*) FROM complaints WHERE assigned_staff_id = u.id AND current_status = 'In Progress') as in_progress_tasks,
                   (SELECT COUNT(*) FROM complaints WHERE assigned_staff_id = u.id AND current_status = 'Assigned') as assigned_tasks
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.role = 'staff' AND u.is_active = 1
            ORDER BY d.department_name ASC, active_tasks ASC, u.name ASC
        `);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ staff: staffList }));
    }

    return false;
}

module.exports = { handleAdminRoutes };
