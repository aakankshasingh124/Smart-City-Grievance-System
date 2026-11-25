// Immutable Audit Logging Service
const crypto = require('node:crypto');
const { run, query } = require('../db/database');

function logAudit({ actorId, actorName, actorRole, action, affectedRecordType, affectedRecordId, details, ipAddress }) {
    const id = `aud-${crypto.randomUUID().slice(0, 8)}`;
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : (details || '');
    run(
        `INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, affected_record_type, affected_record_id, details, ip_address, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
            id,
            actorId || 'system',
            actorName || 'System',
            actorRole || 'system',
            action,
            affectedRecordType,
            affectedRecordId,
            detailsStr,
            ipAddress || '127.0.0.1'
        ]
    );
    return id;
}

function getAuditLogs(limit = 100, offset = 0, filterType = null) {
    if (filterType) {
        return query(
            `SELECT * FROM audit_logs WHERE affected_record_type = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
            [filterType, limit, offset]
        );
    }
    return query(
        `SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
        [limit, offset]
    );
}

module.exports = {
    logAudit,
    getAuditLogs
};
