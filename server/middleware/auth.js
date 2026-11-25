// Authentication & Role-Based Authorization
const crypto = require('node:crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'jansahayak_secure_key_2026_gov_delhi_blr_mum';

function base64UrlEncode(str) {
    return Buffer.from(str)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return Buffer.from(str, 'base64').toString('utf8');
}

function generateToken(payload, expiresInSeconds = 86400) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const body = {
        ...payload,
        iat: now,
        exp: now + expiresInSeconds
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedBody = base64UrlEncode(JSON.stringify(body));
    const signature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedBody}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    return `${encodedHeader}.${encodedBody}.${signature}`;
}

function verifyToken(token) {
    if (!token) return null;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const [encodedHeader, encodedBody, signature] = parts;
        const expectedSignature = crypto
            .createHmac('sha256', JWT_SECRET)
            .update(`${encodedHeader}.${encodedBody}`)
            .digest('base64')
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');

        if (signature !== expectedSignature) return null;

        const body = JSON.parse(base64UrlDecode(encodedBody));
        const now = Math.floor(Date.now() / 1000);
        if (body.exp && body.exp < now) {
            return null; // Expired
        }

        return body;
    } catch (e) {
        return null;
    }
}

function extractUserFromRequest(req) {
    let authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7).trim();
        return verifyToken(token);
    }
    // Also support cookies or custom header if passed
    if (req.headers['x-auth-token']) {
        return verifyToken(req.headers['x-auth-token']);
    }
    return null;
}

module.exports = {
    generateToken,
    verifyToken,
    extractUserFromRequest
};
