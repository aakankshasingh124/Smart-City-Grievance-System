-- JanSahayak AI: Database Schema (SQLite compatible)
-- AI-Powered Public Grievance Reporting and Tracking System

PRAGMA foreign_keys = ON;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    department_name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    contact_information TEXT,
    active_status INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Users Table (Citizens, Staff, Administrators)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('citizen', 'staff', 'admin')),
    department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY,
    complaint_number TEXT UNIQUE NOT NULL,
    citizen_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    guest_name TEXT,
    guest_contact TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('Waste Management', 'Traffic Management', 'Energy Issues', 'Miscellaneous Public Grievances')),
    subcategory TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT NOT NULL,
    landmark TEXT,
    priority TEXT NOT NULL CHECK(priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
    ai_priority_suggestion TEXT,
    ai_priority_reason TEXT,
    ai_category_suggestion TEXT,
    ai_summary TEXT,
    is_urgent INTEGER NOT NULL DEFAULT 0,
    current_status TEXT NOT NULL CHECK(current_status IN (
        'Submitted',
        'Under Review',
        'Assigned',
        'In Progress',
        'Resolved',
        'Closed',
        'Rejected',
        'More Information Required',
        'Reopened'
    )) DEFAULT 'Submitted',
    department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
    assigned_staff_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    estimated_resolution_at TEXT,
    resolved_at TEXT,
    rejection_reason TEXT,
    resolution_notes TEXT,
    citizen_feedback TEXT,
    citizen_rating INTEGER,
    voice_note_url TEXT,
    is_demo_data INTEGER NOT NULL DEFAULT 0
);

-- 4. Complaint Attachments Table
CREATE TABLE IF NOT EXISTS complaint_attachments (
    id TEXT PRIMARY KEY,
    complaint_id TEXT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    attachment_type TEXT NOT NULL CHECK(attachment_type IN ('citizen_evidence', 'progress_photo', 'resolution_photo')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 5. Complaint Updates Table (Timestamped Status & Progress Tracking)
CREATE TABLE IF NOT EXISTS complaint_updates (
    id TEXT PRIMARY KEY,
    complaint_id TEXT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    public_message TEXT NOT NULL,
    internal_note TEXT,
    progress_photo_path TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 6. Notifications Table (In-App Citizen & Staff Alerts)
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    complaint_id TEXT REFERENCES complaints(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 7. Audit Logs Table (Tamper-Resistant Administrative History)
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT,
    actor_name TEXT,
    actor_role TEXT,
    action TEXT NOT NULL,
    affected_record_type TEXT NOT NULL,
    affected_record_id TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for Fast Lookups
CREATE INDEX IF NOT EXISTS idx_complaints_number ON complaints(complaint_number);
CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(current_status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_dept ON complaints(department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_staff ON complaints(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_complaint_updates_cid ON complaint_updates(complaint_id);
CREATE INDEX IF NOT EXISTS idx_attachments_cid ON complaint_attachments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON audit_logs(affected_record_type, affected_record_id);
