// Database management using Node 24 native node:sqlite
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'jansahayak.sqlite');

let dbInstance = null;

function getDb() {
    if (!dbInstance) {
        dbInstance = new DatabaseSync(DB_PATH);
        dbInstance.exec('PRAGMA foreign_keys = ON;');
        dbInstance.exec('PRAGMA journal_mode = WAL;');
    }
    return dbInstance;
}

function initDb() {
    const db = getDb();
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    db.exec(schemaSql);
    try {
        db.exec("ALTER TABLE complaints ADD COLUMN voice_note_url TEXT;");
    } catch (e) {
        // Column already exists
    }
    return db;
}

function query(sql, params = []) {
    const db = getDb();
    const stmt = db.prepare(sql);
    return stmt.all(...params);
}

function get(sql, params = []) {
    const db = getDb();
    const stmt = db.prepare(sql);
    return stmt.get(...params);
}

function run(sql, params = []) {
    const db = getDb();
    const stmt = db.prepare(sql);
    return stmt.run(...params);
}

function generateComplaintNumber() {
    const year = new Date().getFullYear();
    const prefix = `JS-${year}-`;
    const last = get(
        `SELECT complaint_number FROM complaints WHERE complaint_number LIKE ? ORDER BY complaint_number DESC LIMIT 1`,
        [`${prefix}%`]
    );

    let nextSeq = 1001;
    if (last && last.complaint_number) {
        const parts = last.complaint_number.split('-');
        if (parts.length === 3) {
            const parsed = parseInt(parts[2], 10);
            if (!isNaN(parsed)) {
                nextSeq = parsed + 1;
            }
        }
    }
    return `${prefix}${String(nextSeq).padStart(6, '0')}`;
}

module.exports = {
    getDb,
    initDb,
    query,
    get,
    run,
    generateComplaintNumber,
    DB_PATH
};
