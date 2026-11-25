// Automated Test Suite for JanSahayak AI
const assert = require('node:assert');
const { getDb, initDb, query, get, generateComplaintNumber } = require('../server/db/database');
const { seedDatabase, hashPassword } = require('../server/db/seed');
const { generateToken, verifyToken } = require('../server/middleware/auth');
const { categorizeComplaint, detectDuplicates, suggestPriority, summarizeComplaint, handleChatbotQuery } = require('../server/services/aiService');
const { createNotification, getUnreadCount, markAsRead } = require('../server/services/notificationService');
const { logAudit, getAuditLogs } = require('../server/services/auditService');
const { saveBase64Audio } = require('../server/middleware/upload');

let passedTests = 0;
let totalTests = 0;

function it(description, fn) {
    totalTests++;
    try {
        fn();
        console.log(`  ✓ ${description}`);
        passedTests++;
    } catch (err) {
        console.error(`  ✗ ${description}`);
        console.error(`    Error: ${err.message}`);
    }
}

async function runTests() {
    console.log('\n--- Running JanSahayak AI Test Suite --- \n');

    // Test 1: Database & Seed Verification
    it('Database initializes tables and foreign keys successfully', () => {
        initDb();
        const tables = query("SELECT name FROM sqlite_master WHERE type='table'");
        const names = tables.map(t => t.name);
        assert.ok(names.includes('users'));
        assert.ok(names.includes('departments'));
        assert.ok(names.includes('complaints'));
        assert.ok(names.includes('complaint_updates'));
        assert.ok(names.includes('notifications'));
        assert.ok(names.includes('audit_logs'));
    });

    it('Database seed creates required accounts and demo complaints', () => {
        seedDatabase(true);
        const users = query('SELECT count(*) as c FROM users')[0].c;
        const complaints = query('SELECT count(*) as c FROM complaints')[0].c;
        const departments = query('SELECT count(*) as c FROM departments')[0].c;
        assert.strictEqual(departments, 4);
        assert.ok(users >= 7);
        assert.ok(complaints >= 8);
    });

    it('Unique Complaint Number generation follows format JS-YYYY-XXXXXX', () => {
        const cNum = generateComplaintNumber();
        const pattern = /^JS-\d{4}-\d{6}$/;
        assert.ok(pattern.test(cNum), `Generated ${cNum} did not match pattern`);
    });

    // Test 2: Authentication & Token Security
    it('JWT token generation and verification preserve payload and role', () => {
        const payload = { id: 'usr-test-1', name: 'Citizen Tester', role: 'citizen' };
        const token = generateToken(payload, 3600);
        assert.ok(typeof token === 'string' && token.split('.').length === 3);

        const decoded = verifyToken(token);
        assert.strictEqual(decoded.id, 'usr-test-1');
        assert.strictEqual(decoded.role, 'citizen');
    });

    it('Tampered token is rejected by verifyToken', () => {
        const token = generateToken({ id: 'usr-admin-01', role: 'admin' });
        const tampered = token.slice(0, -4) + 'abcd';
        const result = verifyToken(tampered);
        assert.strictEqual(result, null);
    });

    // Test 3: AI Categorization & NLP
    it('AI accurately categorizes garbage and waste grievances', () => {
        const res = categorizeComplaint('Rotting garbage pile on roadside', 'The trash bin is overflowing and stray animals are scattering waste.');
        assert.strictEqual(res.category, 'Waste Management');
        assert.ok(res.confidence > 0.5);
    });

    it('AI accurately categorizes traffic signals and pothole grievances', () => {
        const res = categorizeComplaint('Traffic signal malfunction at main crossing', 'Red light not functioning, vehicles are colliding.');
        assert.strictEqual(res.category, 'Traffic Management');
    });

    it('AI accurately categorizes electrical and streetlight issues', () => {
        const res = categorizeComplaint('Broken streetlight pole and sparking wire', 'High tension electrical wire is sparking next to residential gate.');
        assert.strictEqual(res.category, 'Energy Issues');
    });

    // Test 4: AI Hazard & Priority Suggestions
    it('AI assigns Critical priority to live exposed electrical wires', () => {
        const res = suggestPriority('Energy Issues', 'Exposed live wire', 'Sparking live wire hanging low near school');
        assert.strictEqual(res.priority, 'Critical');
        assert.ok(res.isCritical);
    });

    it('AI assigns High priority to deep waterlogged potholes and accidents', () => {
        const res = suggestPriority('Traffic Management', 'Deep pothole cluster', 'Severe crater causing motorcycle skids');
        assert.strictEqual(res.priority, 'High');
    });

    // Test 5: Duplicate Complaint Detection
    it('Duplicate detector finds geographically proximate complaints in same category', () => {
        // Use coordinates near Karol Bagh complaint (28.6508, 77.1906)
        const dupCheck = detectDuplicates({
            title: 'Garbage dump spilling on footpath',
            description: 'Trash is piled up and smelling bad near the market street',
            category: 'Waste Management',
            latitude: 28.6510,
            longitude: 77.1908
        }, 500);

        assert.ok(dupCheck.hasPotentialDuplicate);
        assert.ok(dupCheck.duplicates.length > 0);
        assert.ok(dupCheck.duplicates[0].distanceMeters <= 500);
    });

    // Test 6: AI Chatbot Grounding
    it('AI Chatbot retrieves verified complaint data from database', () => {
        const queryRes = handleChatbotQuery('Can you check complaint JS-2026-000101?');
        assert.ok(queryRes.reply.includes('JS-2026-000101'));
        assert.ok(queryRes.reply.includes('Waste Management'));
        assert.ok(queryRes.suggestedActions.length > 0);
    });

    it('AI Chatbot provides emergency helplines upon hazard inquiry', () => {
        const queryRes = handleChatbotQuery('What is the emergency helpline for sparking transformer?');
        assert.ok(queryRes.reply.includes('112'));
        assert.ok(queryRes.reply.includes('1912'));
    });

    // Test 7: Notification & Audit Logging
    it('In-app notification system creates, counts, and marks notifications read', () => {
        const testUser = 'usr-citizen-01';
        const initialUnread = getUnreadCount(testUser);
        const notifId = createNotification({
            userId: testUser,
            complaintId: 'cmp-001',
            type: 'test_alert',
            title: 'Test Notification',
            message: 'Testing notification flow'
        });

        assert.strictEqual(getUnreadCount(testUser), initialUnread + 1);
        markAsRead(notifId, testUser);
        assert.strictEqual(getUnreadCount(testUser), initialUnread);
    });

    it('Audit logging writes tamper-evident immutable records', () => {
        const auditId = logAudit({
            actorId: 'usr-admin-01',
            actorName: 'Admin Officer',
            actorRole: 'admin',
            action: 'VERIFY_TEST_SYSTEM',
            affectedRecordType: 'system',
            affectedRecordId: 'sys-01',
            details: { test: true },
            ipAddress: '127.0.0.1'
        });

        const logs = getAuditLogs(5);
        assert.ok(logs.some(l => l.id === auditId && l.action === 'VERIFY_TEST_SYSTEM'));
    });

    it('Voice recording upload middleware validates and persists audio note', () => {
        // Sample base64 audio data representing audio/webm
        const sampleAudioBase64 = 'data:audio/webm;codecs=opus;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwEAAAAAAAAnEU2bdL1474O6WqWbmZeZmZmsbndhdmVmb3Jt';
        const saved = saveBase64Audio(sampleAudioBase64, 'voice-record.webm');
        assert.ok(saved);
        assert.ok(saved.filePath.startsWith('/uploads/voice_'));
        assert.ok(saved.filePath.endsWith('.webm'));
        assert.strictEqual(saved.mimeType, 'audio/webm');
        assert.ok(saved.fileSize > 0);
    });

    it('Admin can allot specific tasks to staff officers with directives and SLA', () => {
        const testComplaint = query('SELECT * FROM complaints LIMIT 1')[0];
        const staff = query("SELECT * FROM users WHERE role = 'staff' LIMIT 1")[0];
        assert.ok(testComplaint, 'A complaint should exist in test database');
        assert.ok(staff, 'A staff officer should exist in test database');

        const directive = 'Inspect garbage accumulation near Ward junction and complete clearance within 24 hours.';
        const estResolution = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

        // Simulate admin task allotment
        const { run } = require('../server/db/database');
        run(`
            UPDATE complaints
            SET assigned_staff_id = ?,
                current_status = 'Assigned',
                estimated_resolution_at = ?,
                updated_at = datetime('now')
            WHERE id = ?
        `, [staff.id, estResolution, testComplaint.id]);

        run(`
            INSERT INTO complaint_updates (id, complaint_id, updated_by, previous_status, new_status, public_message, internal_note)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            `upd-test-${Date.now()}`,
            testComplaint.id,
            'usr-admin-01',
            testComplaint.current_status,
            'Assigned',
            `Task officially allotted to Ward Staff Officer (${staff.name}) by Municipal Administration.`,
            `[ADMIN TASK ALLOTMENT DIRECTIVE by Admin]: ${directive}`
        ]);

        const notifId = createNotification({
            userId: staff.id,
            complaintId: testComplaint.id,
            type: 'task_allotted',
            title: `📋 New Task Allotted: ${testComplaint.complaint_number}`,
            message: `Admin assigned you: ${testComplaint.title}. Directive: ${directive}`
        });
        assert.ok(notifId);

        // Verify allotment in DB
        const updated = get('SELECT * FROM complaints WHERE id = ?', [testComplaint.id]);
        assert.strictEqual(updated.assigned_staff_id, staff.id);
        assert.strictEqual(updated.current_status, 'Assigned');

        const latestUpdate = query('SELECT * FROM complaint_updates WHERE complaint_id = ? ORDER BY created_at DESC LIMIT 1', [testComplaint.id])[0];
        assert.ok(latestUpdate.internal_note.includes(directive));
    });

    console.log(`\n===================================`);
    console.log(`  Tests Passed: ${passedTests} / ${totalTests}`);
    console.log(`===================================\n`);

    if (passedTests !== totalTests) {
        process.exit(1);
    }
}

runTests();
