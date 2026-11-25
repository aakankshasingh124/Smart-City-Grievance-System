// JanSahayak AI - Core HTTP Server
const http = require('node:http');
const url = require('node:url');
const path = require('node:path');
const fs = require('node:fs');

const { initDb } = require('./db/database');
const { seedDatabase } = require('./db/seed');
const { handleAuthRoutes } = require('./routes/authRoutes');
const { handleComplaintRoutes } = require('./routes/complaintRoutes');
const { handleStatsRoutes } = require('./routes/statsRoutes');
const { handleAdminRoutes } = require('./routes/adminRoutes');
const { handleAiRoutes } = require('./routes/aiRoutes');

const PORT = parseInt(process.env.PORT, 10) || 5000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// MIME types for static asset serving
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webm': 'audio/webm',
    '.ogg': 'audio/ogg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.m4a': 'audio/mp4',
    '.mp4': 'video/mp4'
};

function serveStaticFile(req, res, filePath) {
    if (!fs.existsSync(filePath)) {
        // Fallback to index.html for client-side routing
        const indexPath = path.join(PUBLIC_DIR, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            return fs.createReadStream(indexPath).pipe(res);
        }
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
    }

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
        const indexPath = path.join(filePath, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            return fs.createReadStream(indexPath).pipe(res);
        }
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        return res.end('Directory listing forbidden');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stat.size,
        'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
}

function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
}

function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
            if (body.length > 10 * 1024 * 1024) { // 10MB limit
                reject(new Error('Payload too large'));
            }
        });
        req.on('end', () => {
            if (!body) return resolve({});
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

function startServer(port = PORT) {
    // Initialize DB and ensure seed records exist
    initDb();
    seedDatabase(false);

    const server = http.createServer(async (req, res) => {
        setCorsHeaders(res);

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            return res.end();
        }

        const parsedUrl = url.parse(req.url, true);
        const { pathname } = parsedUrl;

        try {
            // API Route dispatch
            if (pathname.startsWith('/api/')) {
                const body = (req.method === 'POST' || req.method === 'PUT')
                    ? await parseJsonBody(req)
                    : {};

                // 1. Auth routes
                if (handleAuthRoutes(req, res, parsedUrl, body)) return;

                // 2. Complaint routes
                if (handleComplaintRoutes(req, res, parsedUrl, body)) return;

                // 3. Stats routes
                if (handleStatsRoutes(req, res, parsedUrl)) return;

                // 4. Admin routes
                if (handleAdminRoutes(req, res, parsedUrl, body)) return;

                // 5. AI routes
                if (handleAiRoutes(req, res, parsedUrl, body)) return;

                // Unmatched API route
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: `API route ${req.method} ${pathname} not found.` }));
            }

            // Static file serving
            const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
            let filePath = path.join(PUBLIC_DIR, safePath === '/' ? 'index.html' : safePath);

            serveStaticFile(req, res, filePath);
        } catch (err) {
            console.error('Server error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
        }
    });

    server.listen(port, () => {
        console.log(`====================================================`);
        console.log(`  JanSahayak AI — Public Grievance Portal`);
        console.log(`  Status: Server running on http://localhost:${port}`);
        console.log(`  Database: SQLite persistent store initialized`);
        console.log(`  Ready for citizen and administrative access.`);
        console.log(`====================================================`);
    });

    return server;
}

if (require.main === module) {
    startServer();
}

module.exports = { startServer };
