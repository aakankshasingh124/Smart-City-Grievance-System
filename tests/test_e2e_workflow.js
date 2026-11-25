// End-to-End Workflow Verification Script
const assert = require('node:assert');
const { getDb, initDb, query, get, generateComplaintNumber } = require('../server/db/database');
const { seedDatabase, hashPassword } = require('../server/db/seed');
const { generateToken, verifyToken } = require('../server/middleware/auth');
const { categorizeComplaint, detectDuplicates, suggestPriority, summarizeComplaint } = require('../server/services/aiService');
const { createNotification, getUserNotifications, getUnreadCount } = require('../server/services/notificationService');
const { logAudit, getAuditLogs } = require('../server/services/auditService');

async function runE2EWorkflow() {
    console.log('\n======================================================');
    console.log('   JanSahayak AI — End-to-End Civic Workflow Test   ');
    console.log('======================================================\n');

    // 0. Ensure fresh database state
    seedDatabase(true);

    // 1. Citizen Authentication
    console.log('Step 1: Citizen Login');
    const citizen = get('SELECT * FROM users WHERE email = ?', ['citizen@example.com']);
    assert.ok(citizen, 'Citizen account exists');
    assert.strictEqual(citizen.role, 'citizen');

    const citizenToken = generateToken({
        id: citizen.id,
        name: citizen.name,
        email: citizen.email,
        role: citizen.role,
        departmentId: null
    });
    assert.ok(verifyToken(citizenToken), 'Citizen token verified');
    console.log(`  ✓ Authenticated as Citizen: ${citizen.name} (${citizen.email})`);

    // 2. Complaint Submission by Citizen
    console.log('\nStep 2: Citizen Submits a New Grievance');
    const newTitle = 'Severe garbage spill blocking pedestrian walkway near Connaught Place Block B';
    const newDesc = 'A large metal dustbin has tipped over. Debris and rotten vegetable waste has spilled across the walking arcade. Pedestrians are forced onto the main vehicular lane. Severe odor.';
    const newCategory = 'Waste Management';
    const newLat = 28.6315;
    const newLng = 77.2167;
    const newAddress = 'Block B Inner Circle, Connaught Place, New Delhi';

    // AI Intake
    const aiCat = categorizeComplaint(newTitle, newDesc);
    const aiPri = suggestPriority(newCategory, newTitle, newDesc, false);
    const aiSum = summarizeComplaint(newTitle, newDesc);
    const cNum = generateComplaintNumber();
    const cId = 'cmp-e2e-test-01';

    console.log(`  • Generated Complaint Number: ${cNum}`);
    console.log(`  • AI Categorization: ${aiCat.category} (${Math.round(aiCat.confidence * 100)}% confidence)`);
    console.log(`  • AI Priority Suggestion: ${aiPri.priority} (${aiPri.reason})`);
    console.log(`  • AI Summary: "${aiSum}"`);

    // Insert into database
    getDb().prepare(`
        INSERT INTO complaints (
            id, complaint_number, citizen_id, title, description, category, subcategory,
            latitude, longitude, address, priority, ai_priority_suggestion, ai_priority_reason,
            ai_category_suggestion, ai_summary, is_urgent, current_status, department_id,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'Submitted', 'dept-waste', datetime('now'), datetime('now'))
    `).run(
        cId, cNum, citizen.id, newTitle, newDesc, newCategory, 'Garbage accumulation',
        newLat, newLng, newAddress, aiPri.priority, aiPri.priority, aiPri.reason,
        aiCat.suggestedCategory, aiSum
    );

    // Initial timeline record
    getDb().prepare(`
        INSERT INTO complaint_updates (id, complaint_id, updated_by, previous_status, new_status, public_message, internal_note)
        VALUES ('upd-e2e-1', ?, ?, 'None', 'Submitted', 'Grievance submitted by citizen and intake recorded.', 'Automated intake workflow.')
    `).run(cId, citizen.id);

    // In-app notification to citizen
    createNotification({
        userId: citizen.id,
        complaintId: cId,
        type: 'complaint_submitted',
        title: `Complaint Submitted: ${cNum}`,
        message: `Your grievance has been registered. Tracking ID: ${cNum}`
    });

    logAudit({
        actorId: citizen.id,
        actorName: citizen.name,
        actorRole: 'citizen',
        action: 'SUBMIT_COMPLAINT',
        affectedRecordType: 'complaint',
        affectedRecordId: cId,
        details: { complaint_number: cNum, category: newCategory }
    });

    console.log('  ✓ Complaint stored in database with status: Submitted');

    // 3. Citizen Tracks Complaint Immediately
    console.log('\nStep 3: Tracking Query for Complaint');
    const trackedRecord = get('SELECT * FROM complaints WHERE complaint_number = ?', [cNum]);
    assert.strictEqual(trackedRecord.current_status, 'Submitted');
    assert.strictEqual(trackedRecord.priority, 'High'); // Rotten waste + blocked walkway yields High
    console.log(`  ✓ Tracking confirmed: Status is "${trackedRecord.current_status}", Priority: "${trackedRecord.priority}"`);

    // 4. Staff Officer Authenticates
    console.log('\nStep 4: Authorized Sanitation Staff Login');
    const staff = get('SELECT * FROM users WHERE email = ?', ['waste.officer@jansahayak.gov.in']);
    assert.strictEqual(staff.role, 'staff');
    assert.strictEqual(staff.department_id, 'dept-waste');
    const staffToken = generateToken({
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        departmentId: staff.department_id
    });
    assert.ok(verifyToken(staffToken), 'Staff token verified');
    console.log(`  ✓ Authenticated as Staff: ${staff.name} (${staff.email})`);

    // 5. Staff Officer updates status to "In Progress"
    console.log('\nStep 5: Staff Processes Complaint & Updates Status to "In Progress"');
    const progressMessage = 'Ward 12 sanitation crew and mini-compactor dispatched. Tipped container uprighted; sweeping underway.';
    const internalNote = 'Coordinating with NDMC commercial vendor for heavy bin replacement.';

    getDb().prepare(`
        UPDATE complaints
        SET current_status = 'In Progress',
            assigned_staff_id = ?,
            estimated_resolution_at = '2026-11-02 18:00:00',
            updated_at = datetime('now')
        WHERE id = ?
    `).run(staff.id, cId);

    getDb().prepare(`
        INSERT INTO complaint_updates (id, complaint_id, updated_by, previous_status, new_status, public_message, internal_note)
        VALUES ('upd-e2e-2', ?, ?, 'Submitted', 'In Progress', ?, ?)
    `).run(cId, staff.id, progressMessage, internalNote);

    createNotification({
        userId: citizen.id,
        complaintId: cId,
        type: 'status_update',
        title: `Complaint ${cNum} In Progress`,
        message: progressMessage
    });

    logAudit({
        actorId: staff.id,
        actorName: staff.name,
        actorRole: 'staff',
        action: 'UPDATE_COMPLAINT_STATUS',
        affectedRecordType: 'complaint',
        affectedRecordId: cId,
        details: { newStatus: 'In Progress' }
    });

    console.log(`  ✓ Status updated to "In Progress". Public message and private internal note recorded.`);

    // 6. Verify Citizen Sees Progress and Notification
    console.log('\nStep 6: Citizen Receives In-App Notification & Inspects Progress');
    const notifs = getUserNotifications(citizen.id);
    const latestNotif = notifs[0];
    assert.ok(latestNotif.message.includes('Ward 12 sanitation crew'), 'Citizen received progress notification');
    console.log(`  ✓ Citizen Notification Verified: "${latestNotif.title}" — "${latestNotif.message}"`);

    // 7. Staff Marks Complaint as "Resolved"
    console.log('\nStep 7: Staff Resolves Grievance with Resolution Notes');
    const resolutionNote = 'Full site cleared, disinfected with lime powder. Replaced damaged hinge on municipal dumpster.';

    getDb().prepare(`
        UPDATE complaints
        SET current_status = 'Resolved',
            resolved_at = datetime('now'),
            resolution_notes = ?,
            updated_at = datetime('now')
        WHERE id = ?
    `).run(resolutionNote, cId);

    getDb().prepare(`
        INSERT INTO complaint_updates (id, complaint_id, updated_by, previous_status, new_status, public_message, internal_note)
        VALUES ('upd-e2e-3', ?, ?, 'In Progress', 'Resolved', 'Waste clearing and disinfection completed. Site returned to clean state.', 'Signed off by Sanitation Superintendent.')
    `).run(cId, staff.id);

    console.log(`  ✓ Status updated to "Resolved". Resolution note logged.`);

    // 8. Citizen Confirms Resolution & Closes Ticket
    console.log('\nStep 8: Citizen Verifies On-Site Remediation & Closes Grievance');
    getDb().prepare(`
        UPDATE complaints
        SET current_status = 'Closed',
            citizen_feedback = 'Inspected the area in the afternoon. Completely clean and smell free. Excellent response time!',
            citizen_rating = 5,
            updated_at = datetime('now')
        WHERE id = ?
    `).run(cId);

    getDb().prepare(`
        INSERT INTO complaint_updates (id, complaint_id, updated_by, previous_status, new_status, public_message, internal_note)
        VALUES ('upd-e2e-4', ?, ?, 'Resolved', 'Closed', 'Citizen inspected site and confirmed satisfactory closure.', '5-star citizen satisfaction rating recorded.')
    `).run(cId, citizen.id);

    logAudit({
        actorId: citizen.id,
        actorName: citizen.name,
        actorRole: 'citizen',
        action: 'CONFIRM_RESOLUTION',
        affectedRecordType: 'complaint',
        affectedRecordId: cId,
        details: { rating: 5 }
    });

    const finalRecord = get('SELECT * FROM complaints WHERE id = ?', [cId]);
    assert.strictEqual(finalRecord.current_status, 'Closed');
    assert.strictEqual(finalRecord.citizen_rating, 5);
    console.log(`  ✓ Grievance confirmed Closed with 5-star citizen rating: "${finalRecord.citizen_feedback}"`);

    // 9. Audit Log Verification
    console.log('\nStep 9: Audit Trail Verification');
    const auditEntries = query('SELECT * FROM audit_logs WHERE affected_record_id = ? ORDER BY timestamp ASC', [cId]);
    assert.ok(auditEntries.length >= 2, 'Audit entries recorded');
    console.log(`  ✓ Audit Trail has ${auditEntries.length} tamper-evident entries for this ticket.`);

    console.log('\n======================================================');
    console.log('  All End-to-End Civic Redressal Workflows PASSED!  ');
    console.log('======================================================\n');
}

runE2EWorkflow().catch(err => {
    console.error('E2E Test Failed:', err);
    process.exit(1);
});
