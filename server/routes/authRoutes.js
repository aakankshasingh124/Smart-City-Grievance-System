// Authentication Routes
const crypto = require('node:crypto');
const { query, get, run } = require('../db/database');
const { generateToken, extractUserFromRequest } = require('../middleware/auth');
const { hashPassword } = require('../db/seed');
const { getUserNotifications, getUnreadCount, markAsRead, markAllAsRead } = require('../services/notificationService');
const { logAudit } = require('../services/auditService');

function handleAuthRoutes(req, res, parsedUrl, body) {
    const { pathname } = parsedUrl;
    const method = req.method;

    // POST /api/auth/register
    if (pathname === '/api/auth/register' && method === 'POST') {
        const { name, email, phone, password } = body;

        if (!name || !email || !password) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Name, email, and password are required.' }));
        }

        if (password.length < 6) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Password must be at least 6 characters.' }));
        }

        const existing = get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
        if (existing) {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'An account with this email already exists.' }));
        }

        const userId = `usr-cit-${crypto.randomUUID().slice(0, 8)}`;
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = hashPassword(password, salt);

        run(
            `INSERT INTO users (id, name, email, phone, password_hash, salt, role)
             VALUES (?, ?, ?, ?, ?, ?, 'citizen')`,
            [userId, name.trim(), email.toLowerCase().trim(), phone || '', hash, salt]
        );

        logAudit({
            actorId: userId,
            actorName: name,
            actorRole: 'citizen',
            action: 'REGISTER_CITIZEN',
            affectedRecordType: 'user',
            affectedRecordId: userId,
            details: { email },
            ipAddress: req.socket.remoteAddress
        });

        const token = generateToken({
            id: userId,
            name,
            email: email.toLowerCase().trim(),
            role: 'citizen',
            departmentId: null
        });

        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            message: 'Registration successful',
            token,
            user: { id: userId, name, email, role: 'citizen', phone }
        }));
    }

    // POST /api/auth/login
    if (pathname === '/api/auth/login' && method === 'POST') {
        const { email, password, portal } = body;

        if (!email || !password) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Email and password are required.' }));
        }

        const user = get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
        if (!user || !user.is_active) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid credentials or inactive account.' }));
        }

        const hash = hashPassword(password, user.salt);
        if (hash !== user.password_hash) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid credentials or inactive account.' }));
        }

        // Check portal access restrictions
        if (portal === 'staff' && user.role !== 'staff' && user.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Access denied: Staff/Admin credentials required for this portal.' }));
        }

        const token = generateToken({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            departmentId: user.department_id
        });

        logAudit({
            actorId: user.id,
            actorName: user.name,
            actorRole: user.role,
            action: 'USER_LOGIN',
            affectedRecordType: 'user',
            affectedRecordId: user.id,
            details: { portal: portal || 'citizen' },
            ipAddress: req.socket.remoteAddress
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                departmentId: user.department_id,
                phone: user.phone
            }
        }));
    }

    // GET /api/auth/me
    if (pathname === '/api/auth/me' && method === 'GET') {
        const user = extractUserFromRequest(req);
        if (!user) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Unauthorized' }));
        }

        const dbUser = get('SELECT id, name, email, phone, role, department_id, created_at FROM users WHERE id = ?', [user.id]);
        if (!dbUser) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'User not found' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ user: dbUser }));
    }

    // GET /api/notifications
    if (pathname === '/api/notifications' && method === 'GET') {
        const user = extractUserFromRequest(req);
        if (!user) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Unauthorized' }));
        }

        const notifications = getUserNotifications(user.id);
        const unreadCount = getUnreadCount(user.id);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ notifications, unreadCount }));
    }

    // POST /api/notifications/read
    if (pathname === '/api/notifications/read' && method === 'POST') {
        const user = extractUserFromRequest(req);
        if (!user) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Unauthorized' }));
        }

        const { notificationId, markAll } = body;
        if (markAll) {
            markAllAsRead(user.id);
        } else if (notificationId) {
            markAsRead(notificationId, user.id);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true }));
    }

    return false;
}

module.exports = { handleAuthRoutes };
