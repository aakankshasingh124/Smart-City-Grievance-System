// In-app and extensible notification service
const crypto = require('node:crypto');
const { run, query } = require('../db/database');

function createNotification({ userId, complaintId, type, title, message }) {
    if (!userId) return null;
    const id = `notif-${crypto.randomUUID().slice(0, 8)}`;
    run(
        `INSERT INTO notifications (id, user_id, complaint_id, notification_type, title, message, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))`,
        [id, userId, complaintId || null, type || 'system', title, message]
    );
    return id;
}

function getUserNotifications(userId, limit = 20) {
    return query(
        `SELECT n.*, c.complaint_number
         FROM notifications n
         LEFT JOIN complaints c ON n.complaint_id = c.id
         WHERE n.user_id = ?
         ORDER BY n.created_at DESC, n.rowid DESC
         LIMIT ?`,
        [userId, limit]
    );
}

function getUnreadCount(userId) {
    const res = query(
        `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`,
        [userId]
    );
    return res[0] ? res[0].count : 0;
}

function markAsRead(notificationId, userId) {
    run(
        `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
        [notificationId, userId]
    );
}

function markAllAsRead(userId) {
    run(
        `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
        [userId]
    );
}

module.exports = {
    createNotification,
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};
