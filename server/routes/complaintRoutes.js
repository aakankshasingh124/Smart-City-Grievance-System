// Complaint Management Routes
const crypto = require('node:crypto');
const { query, get, run, generateComplaintNumber } = require('../db/database');
const { extractUserFromRequest } = require('../middleware/auth');
const { saveBase64Image, saveBase64Audio } = require('../middleware/upload');
const { categorizeComplaint, detectDuplicates, suggestPriority, summarizeComplaint } = require('../services/aiService');
const { createNotification } = require('../services/notificationService');
const { logAudit } = require('../services/auditService');

function handleComplaintRoutes(req, res, parsedUrl, body) {
    const { pathname } = parsedUrl;
    const method = req.method;

    // 1. POST /api/complaints/pre-check (Real-time AI suggestions & duplicate detection)
    if (pathname === '/api/complaints/pre-check' && method === 'POST') {
        const { title, description, category, latitude, longitude, isUrgent } = body;

        const categorization = categorizeComplaint(title, description);
        const duplicateCheck = detectDuplicates({
            title,
            description,
            category: category || categorization.category,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
        });
        const prioritySuggestion = suggestPriority(
            category || categorization.category,
            title,
            description,
            Boolean(isUrgent)
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            categorization,
            duplicateCheck,
            prioritySuggestion
        }));
    }

    // 2. POST /api/complaints (Submit new complaint)
    if (pathname === '/api/complaints' && method === 'POST') {
        const user = extractUserFromRequest(req);
        const {
            title,
            description,
            category,
            subcategory,
            latitude,
            longitude,
            address,
            landmark,
            isUrgent,
            imageBase64,
            imageName,
            audioBase64,
            audioName,
            guestName,
            guestContact
        } = body;

        if (!title || !description || !category || latitude === undefined || longitude === undefined || !address) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Title, description, category, location coordinates, and address are required.' }));
        }

        const complaintId = `cmp-${crypto.randomUUID().slice(0, 8)}`;
        const complaintNumber = generateComplaintNumber();

        // AI enhancements
        const aiCat = categorizeComplaint(title, description);
        const aiPri = suggestPriority(category, title, description, Boolean(isUrgent));
        const aiSum = summarizeComplaint(title, description);

        // Find appropriate department
        const dept = get('SELECT id FROM departments WHERE id = ?', [aiCat.departmentId]);
        const departmentId = dept ? dept.id : 'dept-civil';

        const citizenId = user ? user.id : null;
        const finalGuestName = !user ? (guestName || 'Anonymous Citizen') : null;
        const finalGuestContact = !user ? (guestContact || '') : null;

        // Process Voice Audio Recording if attached
        let savedAudioUrl = null;
        if (audioBase64) {
            try {
                const audioMeta = saveBase64Audio(audioBase64, audioName || 'voice_recording.webm');
                savedAudioUrl = audioMeta.filePath;
            } catch (err) {
                console.warn('Audio save warning:', err.message);
            }
        }

        run(
            `INSERT INTO complaints (
                id, complaint_number, citizen_id, guest_name, guest_contact, title, description,
                category, subcategory, latitude, longitude, address, landmark, priority,
                ai_priority_suggestion, ai_priority_reason, ai_category_suggestion, ai_summary,
                is_urgent, current_status, department_id, voice_note_url, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', ?, ?, datetime('now'), datetime('now'))`,
            [
                complaintId,
                complaintNumber,
                citizenId,
                finalGuestName,
                finalGuestContact,
                title.trim(),
                description.trim(),
                category,
                subcategory || null,
                parseFloat(latitude),
                parseFloat(longitude),
                address.trim(),
                landmark ? landmark.trim() : null,
                aiPri.priority,
                aiPri.priority,
                aiPri.reason,
                aiCat.suggestedCategory,
                aiSum,
                isUrgent ? 1 : 0,
                departmentId,
                savedAudioUrl
            ]
        );

        // Handle Audio Attachment Record
        if (savedAudioUrl) {
            try {
                const audioAttId = `att-v-${crypto.randomUUID().slice(0, 8)}`;
                run(
                    `INSERT INTO complaint_attachments (id, complaint_id, uploaded_by, file_path, file_name, file_size, mime_type, attachment_type)
                     VALUES (?, ?, ?, ?, ?, ?, ?, 'citizen_evidence')`,
                    [
                        audioAttId,
                        complaintId,
                        citizenId,
                        savedAudioUrl,
                        audioName || 'voice_recording.webm',
                        0,
                        'audio/webm'
                    ]
                );
            } catch (err) {
                console.warn('Audio attachment record error:', err.message);
            }
        }

        // Handle Image Attachment if provided
        let savedAttachment = null;
        if (imageBase64) {
            try {
                const imgMeta = saveBase64Image(imageBase64, imageName || 'evidence.jpg');
                const attachmentId = `att-${crypto.randomUUID().slice(0, 8)}`;
                run(
                    `INSERT INTO complaint_attachments (id, complaint_id, uploaded_by, file_path, file_name, file_size, mime_type, attachment_type)
                     VALUES (?, ?, ?, ?, ?, ?, ?, 'citizen_evidence')`,
                    [
                        attachmentId,
                        complaintId,
                        citizenId,
                        imgMeta.filePath,
                        imgMeta.fileName,
                        imgMeta.fileSize,
                        imgMeta.mimeType
                    ]
                );
                savedAttachment = imgMeta.filePath;
            } catch (err) {
                console.warn('Image save warning:', err.message);
            }
        }

        // Record Initial Timeline Update
        const updateId = `upd-${crypto.randomUUID().slice(0, 8)}`;
        run(
            `INSERT INTO complaint_updates (id, complaint_id, updated_by, previous_status, new_status, public_message, internal_note)
             VALUES (?, ?, ?, 'None', 'Submitted', 'Complaint successfully logged and registered in the municipal intake system.', 'AI intake routing completed.')`,
            [updateId, complaintId, citizenId]
        );

        // In-App Notification if registered citizen
        if (citizenId) {
            createNotification({
                userId: citizenId,
                complaintId,
                type: 'complaint_submitted',
                title: `Complaint Submitted: ${complaintNumber}`,
                message: `Your grievance "${title.slice(0, 40)}..." has been recorded. Tracking ID: ${complaintNumber}`
            });
        }

        // Audit Log
        logAudit({
            actorId: citizenId || 'guest',
            actorName: user ? user.name : (finalGuestName || 'Guest Complainant'),
            actorRole: user ? user.role : 'guest',
            action: 'SUBMIT_COMPLAINT',
            affectedRecordType: 'complaint',
            affectedRecordId: complaintId,
            details: { complaintNumber, category, priority: aiPri.priority },
            ipAddress: req.socket.remoteAddress
        });

        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            message: 'Complaint submitted successfully',
            complaintId,
            complaintNumber,
            initialStatus: 'Submitted',
            category,
            priority: aiPri.priority,
            estimatedDepartment: aiCat.departmentName,
            attachmentUrl: savedAttachment,
            voiceNoteUrl: savedAudioUrl
        }));
    }

    // 3. GET /api/complaints/track/:identifier (Track Complaint with full public timeline)
    if (pathname.startsWith('/api/complaints/track/') && method === 'GET') {
        const identifier = decodeURIComponent(pathname.replace('/api/complaints/track/', '').trim());
        if (!identifier) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Complaint identifier is required' }));
        }

        const complaint = get(
            `SELECT c.id, c.complaint_number, c.title, c.description, c.category, c.subcategory,
                    c.latitude, c.longitude, c.address, c.landmark, c.priority, c.is_urgent,
                    c.current_status, c.created_at, c.updated_at, c.estimated_resolution_at,
                    c.resolved_at, c.rejection_reason, c.resolution_notes, c.citizen_feedback,
                    c.citizen_rating, c.ai_summary,
                    d.department_name, d.code as department_code, d.contact_information as department_contact,
                    u.name as assigned_staff_name
             FROM complaints c
             LEFT JOIN departments d ON c.department_id = d.id
             LEFT JOIN users u ON c.assigned_staff_id = u.id
             WHERE c.complaint_number = ? OR c.id = ?`,
            [identifier.toUpperCase(), identifier]
        );

        if (!complaint) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: `No complaint found with identifier "${identifier}".` }));
        }

        // Fetch Public Timeline Updates (internal notes strictly omitted)
        const updates = query(
            `SELECT cu.id, cu.previous_status, cu.new_status, cu.public_message,
                    cu.progress_photo_path, cu.created_at,
                    COALESCE(u.name, 'Municipal Officer') as updated_by_name,
                    COALESCE(u.role, 'staff') as updated_by_role
             FROM complaint_updates cu
             LEFT JOIN users u ON cu.updated_by = u.id
             WHERE cu.complaint_id = ?
             ORDER BY cu.created_at ASC`,
            [complaint.id]
        );

        // Fetch Attachments (photos)
        const attachments = query(
            `SELECT id, file_path, file_name, file_size, mime_type, attachment_type, created_at
             FROM complaint_attachments
             WHERE complaint_id = ?
             ORDER BY created_at ASC`,
            [complaint.id]
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            complaint,
            timeline: updates,
            attachments
        }));
    }

    // 4. GET /api/complaints/my (Citizen's submitted complaints)
    if (pathname === '/api/complaints/my' && method === 'GET') {
        const user = extractUserFromRequest(req);
        if (!user) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Please log in to view your complaints.' }));
        }

        const myComplaints = query(
            `SELECT c.*, d.department_name
             FROM complaints c
             LEFT JOIN departments d ON c.department_id = d.id
             WHERE c.citizen_id = ?
             ORDER BY c.created_at DESC`,
            [user.id]
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ complaints: myComplaints }));
    }

    // 5. GET /api/complaints/staff (Staff & Admin dashboard complaint listing with filters)
    if (pathname === '/api/complaints/staff' && method === 'GET') {
        const user = extractUserFromRequest(req);
        if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Access denied: Staff or Administrator permissions required.' }));
        }

        const urlParams = parsedUrl.query;
        let sql = `
            SELECT c.*,
                   d.department_name, d.code as department_code,
                   u.name as citizen_name, u.phone as citizen_phone, u.email as citizen_email,
                   s.name as assigned_staff_name
            FROM complaints c
            LEFT JOIN departments d ON c.department_id = d.id
            LEFT JOIN users u ON c.citizen_id = u.id
            LEFT JOIN users s ON c.assigned_staff_id = s.id
            WHERE 1=1
        `;
        const params = [];

        // If staff member has a specific department, optionally pre-filter or allow all if admin
        if (urlParams.departmentId) {
            sql += ` AND c.department_id = ?`;
            params.push(urlParams.departmentId);
        } else if (user.role === 'staff' && user.departmentId && urlParams.onlyMyDept === 'true') {
            sql += ` AND c.department_id = ?`;
            params.push(user.departmentId);
        }

        if (urlParams.status && urlParams.status !== 'all') {
            if (urlParams.status === 'unassigned') {
                sql += ` AND c.assigned_staff_id IS NULL`;
            } else {
                sql += ` AND c.current_status = ?`;
                params.push(urlParams.status);
            }
        }

        if (urlParams.staffId && urlParams.staffId !== 'all') {
            if (urlParams.staffId === 'unassigned') {
                sql += ` AND c.assigned_staff_id IS NULL`;
            } else {
                sql += ` AND c.assigned_staff_id = ?`;
                params.push(urlParams.staffId);
            }
        }

        if (urlParams.priority && urlParams.priority !== 'all') {
            sql += ` AND c.priority = ?`;
            params.push(urlParams.priority);
        }

        if (urlParams.category && urlParams.category !== 'all') {
            sql += ` AND c.category = ?`;
            params.push(urlParams.category);
        }

        if (urlParams.search) {
            const term = `%${urlParams.search.trim()}%`;
            sql += ` AND (c.complaint_number LIKE ? OR c.title LIKE ? OR c.address LIKE ? OR c.description LIKE ?)`;
            params.push(term, term, term, term);
        }

        sql += ` ORDER BY CASE c.priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END, c.created_at DESC`;

        const complaints = query(sql, params);

        // Calculate staff KPI metrics
        const totalAssigned = query(`SELECT COUNT(*) as count FROM complaints WHERE assigned_staff_id = ?`, [user.id])[0].count;
        const newComplaints = query(`SELECT COUNT(*) as count FROM complaints WHERE current_status = 'Submitted'`)[0].count;
        const underReview = query(`SELECT COUNT(*) as count FROM complaints WHERE current_status = 'Under Review'`)[0].count;
        const inProgress = query(`SELECT COUNT(*) as count FROM complaints WHERE current_status = 'In Progress'`)[0].count;
        const highPriority = query(`SELECT COUNT(*) as count FROM complaints WHERE priority IN ('High', 'Critical') AND current_status NOT IN ('Resolved', 'Closed', 'Rejected')`)[0].count;
        const resolved = query(`SELECT COUNT(*) as count FROM complaints WHERE current_status IN ('Resolved', 'Closed')`)[0].count;
        const unassigned = query(`SELECT COUNT(*) as count FROM complaints WHERE assigned_staff_id IS NULL AND current_status NOT IN ('Resolved', 'Closed', 'Rejected')`)[0].count;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            complaints,
            stats: {
                totalAssigned,
                newComplaints,
                underReview,
                inProgress,
                highPriority,
                resolved,
                unassigned
            }
        }));
    }

    // 6. GET /api/complaints/:id (Single complaint details with staff notes if authorized)
    if (pathname.match(/^\/api\/complaints\/cmp-[a-zA-Z0-9_-]+$/) && method === 'GET') {
        const id = pathname.replace('/api/complaints/', '');
        const user = extractUserFromRequest(req);
        const isStaff = user && (user.role === 'staff' || user.role === 'admin');

        const complaint = get(
            `SELECT c.*,
                    d.department_name, d.code as department_code,
                    cit.name as citizen_name, cit.email as citizen_email, cit.phone as citizen_phone,
                    stf.name as assigned_staff_name
             FROM complaints c
             LEFT JOIN departments d ON c.department_id = d.id
             LEFT JOIN users cit ON c.citizen_id = cit.id
             LEFT JOIN users stf ON c.assigned_staff_id = stf.id
             WHERE c.id = ?`,
            [id]
        );

        if (!complaint) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Complaint not found' }));
        }

        // Privacy check: citizens can only view their own complaints; guests via tracking endpoint
        if (!isStaff && (!user || complaint.citizen_id !== user.id)) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Access denied: You do not have permission to inspect this private record.' }));
        }

        const updatesSql = isStaff
            ? `SELECT cu.*, u.name as updated_by_name FROM complaint_updates cu LEFT JOIN users u ON cu.updated_by = u.id WHERE cu.complaint_id = ? ORDER BY cu.created_at ASC`
            : `SELECT cu.id, cu.previous_status, cu.new_status, cu.public_message, cu.progress_photo_path, cu.created_at, u.name as updated_by_name FROM complaint_updates cu LEFT JOIN users u ON cu.updated_by = u.id WHERE cu.complaint_id = ? ORDER BY cu.created_at ASC`;

        const updates = query(updatesSql, [id]);
        const attachments = query(`SELECT * FROM complaint_attachments WHERE complaint_id = ? ORDER BY created_at ASC`, [id]);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ complaint, updates, attachments }));
    }

    // 7. POST /api/complaints/:id/update-status (Staff status change with public/internal updates)
    if (pathname.match(/^\/api\/complaints\/cmp-[a-zA-Z0-9_-]+\/update-status$/) && method === 'POST') {
        const id = pathname.split('/')[3];
        const user = extractUserFromRequest(req);

        if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Only authorized staff and administrators can update complaints.' }));
        }

        const complaint = get('SELECT * FROM complaints WHERE id = ?', [id]);
        if (!complaint) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Complaint not found.' }));
        }

        const {
            newStatus,
            publicMessage,
            internalNote,
            progressImageBase64,
            estimatedResolutionAt,
            assignStaffId,
            rejectionReason,
            resolutionNotes
        } = body;

        const VALID_STATUSES = [
            'Submitted', 'Under Review', 'Assigned', 'In Progress',
            'Resolved', 'Closed', 'Rejected', 'More Information Required', 'Reopened'
        ];

        if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: `Invalid status. Permitted statuses: ${VALID_STATUSES.join(', ')}` }));
        }

        if (newStatus === 'Rejected' && (!rejectionReason || rejectionReason.trim().length < 5)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'A mandatory official explanation is required when rejecting a complaint.' }));
        }

        if (!publicMessage || publicMessage.trim().length < 5) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'A public progress message is required to communicate transparently with the complainant.' }));
        }

        let progressPhotoPath = null;
        if (progressImageBase64) {
            try {
                const img = saveBase64Image(progressImageBase64, `progress_${id}.jpg`);
                progressPhotoPath = img.filePath;
                run(
                    `INSERT INTO complaint_attachments (id, complaint_id, uploaded_by, file_path, file_name, file_size, mime_type, attachment_type)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        `att-${crypto.randomUUID().slice(0, 8)}`,
                        id,
                        user.id,
                        img.filePath,
                        img.fileName,
                        img.fileSize,
                        img.mimeType,
                        newStatus === 'Resolved' ? 'resolution_photo' : 'progress_photo'
                    ]
                );
            } catch (err) {
                console.warn('Progress photo error:', err.message);
            }
        }

        const prevStatus = complaint.current_status;
        const resolvedAt = (newStatus === 'Resolved' || newStatus === 'Closed') ? new Date().toISOString() : complaint.resolved_at;
        const estRes = estimatedResolutionAt || complaint.estimated_resolution_at;
        const staffToAssign = assignStaffId || complaint.assigned_staff_id || user.id;

        // Update Complaint Table
        run(
            `UPDATE complaints
             SET current_status = ?,
                 updated_at = datetime('now'),
                 assigned_staff_id = ?,
                 estimated_resolution_at = ?,
                 resolved_at = ?,
                 rejection_reason = ?,
                 resolution_notes = ?
             WHERE id = ?`,
            [
                newStatus,
                staffToAssign,
                estRes,
                resolvedAt,
                rejectionReason || complaint.rejection_reason,
                resolutionNotes || complaint.resolution_notes,
                id
            ]
        );

        // Insert Timestamped History
        const updateId = `upd-${crypto.randomUUID().slice(0, 8)}`;
        run(
            `INSERT INTO complaint_updates (id, complaint_id, updated_by, previous_status, new_status, public_message, internal_note, progress_photo_path)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                updateId,
                id,
                user.id,
                prevStatus,
                newStatus,
                publicMessage.trim(),
                internalNote ? internalNote.trim() : null,
                progressPhotoPath
            ]
        );

        // Notify Citizen
        if (complaint.citizen_id) {
            createNotification({
                userId: complaint.citizen_id,
                complaintId: id,
                type: newStatus === 'Resolved' ? 'resolved' : 'status_update',
                title: `Complaint ${complaint.complaint_number}: ${newStatus}`,
                message: publicMessage.trim()
            });
        }

        // Audit Log
        logAudit({
            actorId: user.id,
            actorName: user.name,
            actorRole: user.role,
            action: 'UPDATE_COMPLAINT_STATUS',
            affectedRecordType: 'complaint',
            affectedRecordId: id,
            details: { prevStatus, newStatus, publicMessage: publicMessage.slice(0, 100), hasInternalNote: Boolean(internalNote) },
            ipAddress: req.socket.remoteAddress
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            message: `Complaint status updated to ${newStatus}`,
            previousStatus: prevStatus,
            newStatus,
            updatedAt: new Date().toISOString()
        }));
    }

    // 8. POST /api/complaints/:id/confirm-resolution (Citizen feedback: confirmed resolved or reopen)
    if (pathname.match(/^\/api\/complaints\/cmp-[a-zA-Z0-9_-]+\/confirm-resolution$/) && method === 'POST') {
        const id = pathname.split('/')[3];
        const user = extractUserFromRequest(req);
        const { satisfied, feedback, rating, reopenReason } = body;

        const complaint = get('SELECT * FROM complaints WHERE id = ?', [id]);
        if (!complaint) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Complaint not found.' }));
        }

        // Only the reporting citizen (or verified guest) can confirm
        if (user && complaint.citizen_id && complaint.citizen_id !== user.id) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Only the original complainant can confirm resolution.' }));
        }

        const prevStatus = complaint.current_status;

        if (satisfied) {
            // Citizen confirms issue is fixed
            run(
                `UPDATE complaints
                 SET current_status = 'Closed',
                     citizen_feedback = ?,
                     citizen_rating = ?,
                     updated_at = datetime('now')
                 WHERE id = ?`,
                [feedback || 'Resolution confirmed by citizen.', rating || 5, id]
            );

            run(
                `INSERT INTO complaint_updates (id, complaint_id, updated_by, previous_status, new_status, public_message, internal_note)
                 VALUES (?, ?, ?, ?, 'Closed', 'Citizen inspected site and confirmed satisfactory resolution.', 'Citizen confirmed closing.')`,
                [`upd-${crypto.randomUUID().slice(0, 8)}`, id, user ? user.id : null, prevStatus]
            );

            logAudit({
                actorId: user ? user.id : 'citizen',
                actorName: user ? user.name : 'Citizen',
                actorRole: 'citizen',
                action: 'CONFIRM_RESOLUTION',
                affectedRecordType: 'complaint',
                affectedRecordId: id,
                details: { rating, feedback },
                ipAddress: req.socket.remoteAddress
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Thank you for confirming resolution. Complaint is now officially Closed.' }));
        } else {
            // Citizen states issue is unresolved -> Reopen
            const reason = reopenReason || feedback || 'Issue reported as still persisting by citizen.';
            run(
                `UPDATE complaints
                 SET current_status = 'Reopened',
                     citizen_feedback = ?,
                     updated_at = datetime('now')
                 WHERE id = ?`,
                [reason, id]
            );

            run(
                `INSERT INTO complaint_updates (id, complaint_id, updated_by, previous_status, new_status, public_message, internal_note)
                 VALUES (?, ?, ?, ?, 'Reopened', ?, 'Citizen escalated: issue remained unresolved on inspection.')`,
                [
                    `upd-${crypto.randomUUID().slice(0, 8)}`,
                    id,
                    user ? user.id : null,
                    prevStatus,
                    `Complaint reopened by citizen: "${reason}"`
                ]
            );

            // Notify assigned staff
            if (complaint.assigned_staff_id) {
                createNotification({
                    userId: complaint.assigned_staff_id,
                    complaintId: id,
                    type: 'reopened',
                    title: `Complaint Reopened: ${complaint.complaint_number}`,
                    message: `Citizen reported the problem is still unresolved: ${reason.slice(0, 100)}`
                });
            }

            logAudit({
                actorId: user ? user.id : 'citizen',
                actorName: user ? user.name : 'Citizen',
                actorRole: 'citizen',
                action: 'REOPEN_COMPLAINT',
                affectedRecordType: 'complaint',
                affectedRecordId: id,
                details: { reopenReason: reason },
                ipAddress: req.socket.remoteAddress
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Complaint has been Reopened and flagged for priority review by municipal supervisors.' }));
        }
    }

    return false;
}

module.exports = { handleComplaintRoutes };
