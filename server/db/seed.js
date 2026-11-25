// Seed database with realistic Indian civic data, departments, and demo accounts
const crypto = require('node:crypto');
const { getDb, initDb, query, run } = require('./database');

function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function seedDatabase(force = false) {
    initDb();

    const existingUsers = query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count > 0 && !force) {
        console.log('Database already has data. Skipping seed.');
        return;
    }

    if (force) {
        run('DELETE FROM audit_logs');
        run('DELETE FROM notifications');
        run('DELETE FROM complaint_updates');
        run('DELETE FROM complaint_attachments');
        run('DELETE FROM complaints');
        run('DELETE FROM users');
        run('DELETE FROM departments');
    }

    console.log('Seeding departments...');
    const departments = [
        {
            id: 'dept-waste',
            name: 'Department of Solid Waste Management',
            code: 'SWM',
            description: 'Responsible for municipal solid waste collection, segregated processing, sanitary landfills, and street cleanliness.',
            contact: 'Toll-free 1800-11-2299 | swm-support@jansahayak.gov.in'
        },
        {
            id: 'dept-traffic',
            name: 'Traffic Police & Road Infrastructure Authority',
            code: 'TP-RIA',
            description: 'Manages municipal traffic flow, signal calibration, pothole resurfacing, lane markings, and road hazard clearances.',
            contact: 'Control Room 1095 / 011-25844444 | traffic-grievance@jansahayak.gov.in'
        },
        {
            id: 'dept-energy',
            name: 'Municipal Electricity Board & Public Lighting',
            code: 'MEB',
            description: 'Supervises street lighting infrastructure, underground power cabling, transformer safety, and emergency electrical faults.',
            contact: 'Fault Helpline 1912 | meb-emergency@jansahayak.gov.in'
        },
        {
            id: 'dept-civil',
            name: 'Civil Works, Water Supply & Sanitation Board',
            code: 'CW-WSSB',
            description: 'Oversees potable water pipelines, drainage desilting, storm-water drains, public toilets, parks, and general municipal civic amenities.',
            contact: 'Jal Seva 1916 | civic-services@jansahayak.gov.in'
        }
    ];

    for (const d of departments) {
        run(
            `INSERT INTO departments (id, department_name, code, description, contact_information)
             VALUES (?, ?, ?, ?, ?)`,
            [d.id, d.name, d.code, d.description, d.contact]
        );
    }

    console.log('Seeding users (Admin, Staff, Citizens)...');
    const defaultSalt = 'jansahayak_salt_2026';
    const users = [
        {
            id: 'usr-admin-01',
            name: 'Dr. Rameshwar Sharma (IAS)',
            email: 'admin@jansahayak.gov.in',
            phone: '+91 98100 11223',
            password: 'Admin@123',
            role: 'admin',
            dept: null
        },
        {
            id: 'usr-staff-waste',
            name: 'Rajesh Meena (Sanitation Superintendent)',
            email: 'waste.officer@jansahayak.gov.in',
            phone: '+91 98200 44556',
            password: 'Staff@123',
            role: 'staff',
            dept: 'dept-waste'
        },
        {
            id: 'usr-staff-traffic',
            name: 'Inspector Vikram Rathore',
            email: 'traffic.officer@jansahayak.gov.in',
            phone: '+91 98300 77889',
            password: 'Staff@123',
            role: 'staff',
            dept: 'dept-traffic'
        },
        {
            id: 'usr-staff-energy',
            name: 'Er. Priya Sundaram (Executive Engineer)',
            email: 'energy.officer@jansahayak.gov.in',
            phone: '+91 98400 99001',
            password: 'Staff@123',
            role: 'staff',
            dept: 'dept-energy'
        },
        {
            id: 'usr-staff-civil',
            name: 'Amitabh Sen (Assistant Municipal Commissioner)',
            email: 'civil.officer@jansahayak.gov.in',
            phone: '+91 98500 22334',
            password: 'Staff@123',
            role: 'staff',
            dept: 'dept-civil'
        },
        {
            id: 'usr-citizen-01',
            name: 'Ananya Deshmukh',
            email: 'citizen@example.com',
            phone: '+91 98765 43210',
            password: 'Citizen@123',
            role: 'citizen',
            dept: null
        },
        {
            id: 'usr-citizen-02',
            name: 'Arjun Verma',
            email: 'arjun.verma@example.com',
            phone: '+91 98111 55667',
            password: 'Citizen@123',
            role: 'citizen',
            dept: null
        }
    ];

    for (const u of users) {
        const hash = hashPassword(u.password, defaultSalt);
        run(
            `INSERT INTO users (id, name, email, phone, password_hash, salt, role, department_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [u.id, u.name, u.email, u.phone, hash, defaultSalt, u.role, u.dept]
        );
    }

    console.log('Seeding realistic civic complaints...');
    const complaints = [
        {
            id: 'cmp-001',
            number: 'JS-2026-000101',
            citizen_id: 'usr-citizen-01',
            title: 'Severe garbage overflow and rotting waste at Ajmal Khan Road Market',
            description: 'Public community dumpster has been overflowing for the last 4 days. Waste is spilling onto the pedestrian footpath, attracting stray cattle and causing an intolerable stench. Shopkeepers and shoppers are facing severe health risks.',
            category: 'Waste Management',
            subcategory: 'Overflowing public dustbins',
            lat: 28.6508,
            lng: 77.1906,
            address: 'Opposite Central Bank, Ajmal Khan Road, Karol Bagh, New Delhi',
            landmark: 'Near Karol Bagh Metro Station Exit 2',
            priority: 'High',
            ai_priority_suggestion: 'High',
            ai_priority_reason: 'Overflowing waste blocking pedestrian pathway for >72 hrs with biohazard and pest accumulation.',
            ai_category_suggestion: 'Waste Management',
            ai_summary: 'Karol Bagh market community bin uncollected for 4 days, causing sanitary hazard and footpath obstruction.',
            urgent: 0,
            status: 'In Progress',
            dept: 'dept-waste',
            staff: 'usr-staff-waste',
            created_at: '2026-10-28 09:30:00',
            updated_at: '2026-10-30 14:15:00',
            est_res: '2026-11-02 18:00:00',
            is_demo: 1
        },
        {
            id: 'cmp-002',
            number: 'JS-2026-000102',
            citizen_id: 'usr-citizen-01',
            title: 'Critical traffic signal failure causing gridlock at Moti Bagh Junction',
            description: 'The automated signal lights at the central intersection of Ring Road and Shanti Path are completely blank since this morning. Multiple near-miss collisions observed. Morning office commute traffic is completely jammed.',
            category: 'Traffic Management',
            subcategory: 'Traffic signal malfunction',
            lat: 28.5833,
            lng: 77.1736,
            address: 'Ring Road & Benito Juarez Marg Crossing, South Moti Bagh, New Delhi',
            landmark: 'Under South Campus Flyover',
            priority: 'Critical',
            ai_priority_suggestion: 'Critical',
            ai_priority_reason: 'Major arterial intersection traffic light blackout creating severe collision risk and vehicular gridlock.',
            ai_category_suggestion: 'Traffic Management',
            ai_summary: 'Total signal blackout at Ring Road crossing creating high collision hazard and severe traffic congestion.',
            urgent: 1,
            status: 'Assigned',
            dept: 'dept-traffic',
            staff: 'usr-staff-traffic',
            created_at: '2026-11-01 08:15:00',
            updated_at: '2026-11-01 09:00:00',
            est_res: '2026-11-01 13:00:00',
            is_demo: 1
        },
        {
            id: 'cmp-003',
            number: 'JS-2026-000103',
            citizen_id: 'usr-citizen-02',
            title: 'Exposed live electric wire hanging low near children playground',
            description: 'A storm snapped an overhead branch which severed an electric pole feed. The high-tension black insulated wire is hanging barely 4 feet above the walking track adjacent to the children play area in Sector 14 HUDA park.',
            category: 'Energy Issues',
            subcategory: 'Exposed electrical wires',
            lat: 28.4735,
            lng: 77.0458,
            address: 'Community Park Gate 3, Sector 14, Gurugram, Haryana',
            landmark: 'Near Primary School Playground',
            priority: 'Critical',
            ai_priority_suggestion: 'Critical',
            ai_priority_reason: 'Live electrical cable within reachable human height adjacent to playground presents immediate electrocution danger.',
            ai_category_suggestion: 'Energy Issues',
            ai_summary: 'Hanging live cable within 4 feet height next to public playground requires emergency isolation.',
            urgent: 1,
            status: 'In Progress',
            dept: 'dept-energy',
            staff: 'usr-staff-energy',
            created_at: '2026-10-31 16:45:00',
            updated_at: '2026-11-01 10:20:00',
            est_res: '2026-11-01 15:00:00',
            is_demo: 1
        },
        {
            id: 'cmp-004',
            number: 'JS-2026-000104',
            citizen_id: 'usr-citizen-01',
            title: 'Dangerous deep pothole cluster on Andheri-Kurla Link Road',
            description: 'A 2-foot wide and 6-inch deep crater on the middle lane has caused two two-wheeler skids yesterday. Waterlogged during evening showers making it invisible to motorists.',
            category: 'Traffic Management',
            subcategory: 'Damaged roads and potholes',
            lat: 19.1136,
            lng: 72.8697,
            address: 'Opposite Metro Pillar 142, Andheri-Kurla Road, Mumbai, Maharashtra',
            landmark: 'Near Chakala Metro Station',
            priority: 'High',
            ai_priority_suggestion: 'High',
            ai_priority_reason: 'Hidden deep waterlogged pothole on high-speed corridor with documented motorcycle accidents.',
            ai_category_suggestion: 'Traffic Management',
            ai_summary: 'Dangerous pothole cluster on Andheri-Kurla corridor causing two-wheeler skid hazards.',
            urgent: 1,
            status: 'Resolved',
            dept: 'dept-traffic',
            staff: 'usr-staff-traffic',
            created_at: '2026-10-24 11:00:00',
            updated_at: '2026-10-27 17:30:00',
            est_res: '2026-10-28 18:00:00',
            is_demo: 1
        },
        {
            id: 'cmp-005',
            number: 'JS-2026-000105',
            citizen_id: 'usr-citizen-02',
            title: 'Contaminated muddy drinking water pipeline breach in Vasant Kunj Pocket C',
            description: 'Tap water received in Block C houses since yesterday morning is dark yellowish-brown and emits a sulfur smell. Suspected underground sewage pipe cross-contamination following recent drain excavation.',
            category: 'Miscellaneous Public Grievances',
            subcategory: 'Water supply',
            lat: 28.5292,
            lng: 77.1537,
            address: 'Pocket C-8, Vasant Kunj, South West Delhi',
            landmark: 'Near Mother Dairy Booth 41',
            priority: 'High',
            ai_priority_suggestion: 'High',
            ai_priority_reason: 'Suspected sewage cross-contamination of domestic drinking supply affecting residential pocket.',
            ai_category_suggestion: 'Miscellaneous Public Grievances',
            ai_summary: 'Contaminated tap water with foul odor in Vasant Kunj Pocket C; probable drain seepage.',
            urgent: 0,
            status: 'Under Review',
            dept: 'dept-civil',
            staff: 'usr-staff-civil',
            created_at: '2026-11-01 07:00:00',
            updated_at: '2026-11-01 07:30:00',
            est_res: '2026-11-03 18:00:00',
            is_demo: 1
        },
        {
            id: 'cmp-006',
            number: 'JS-2026-000106',
            citizen_id: 'usr-citizen-01',
            title: 'Continuous street lights failure along 1km stretch of Indiranagar 12th Main',
            description: 'All 24 LED sodium lamps on both sides of 12th Main road between 80ft road junction and HAL 2nd Stage are unlit for 5 consecutive nights. The area becomes pitch dark post 7 PM, creating safety concerns for women and senior citizens.',
            category: 'Energy Issues',
            subcategory: 'Streetlight failure',
            lat: 12.9719,
            lng: 77.6412,
            address: '12th Main Road, Indiranagar, Bengaluru, Karnataka',
            landmark: 'Between Corner House and 80ft Road Junction',
            priority: 'Medium',
            ai_priority_suggestion: 'Medium',
            ai_priority_reason: 'Prolonged dark stretch on commercial-residential corridor impacting pedestrian nighttime safety.',
            ai_category_suggestion: 'Energy Issues',
            ai_summary: '24 unlit streetlights along 1km stretch of Indiranagar 12th Main for 5 consecutive days.',
            urgent: 0,
            status: 'Submitted',
            dept: 'dept-energy',
            staff: null,
            created_at: '2026-11-01 14:00:00',
            updated_at: '2026-11-01 14:00:00',
            est_res: null,
            is_demo: 1
        },
        {
            id: 'cmp-007',
            number: 'JS-2026-000107',
            citizen_id: 'usr-citizen-02',
            title: 'Unlawful private reservation of public street parking with iron chains',
            description: 'A commercial establishment has installed heavy iron bollards with lockable chains on the public tarmac, blocking 8 legitimate public parking slots and demanding money from motorists.',
            category: 'Traffic Management',
            subcategory: 'Illegal parking',
            lat: 13.0418,
            lng: 80.2505,
            address: 'Cathedral Road, T. Nagar, Chennai, Tamil Nadu',
            landmark: 'Near Music Academy',
            priority: 'Medium',
            ai_priority_suggestion: 'Medium',
            ai_priority_reason: 'Unauthorized physical encroachment and extortion on designated public highway.',
            ai_category_suggestion: 'Traffic Management',
            ai_summary: 'Commercial entity installed illegal chain bollards blocking 8 public parking slots.',
            urgent: 0,
            status: 'Closed',
            dept: 'dept-traffic',
            staff: 'usr-staff-traffic',
            created_at: '2026-10-18 10:00:00',
            updated_at: '2026-10-22 16:00:00',
            est_res: '2026-10-23 18:00:00',
            is_demo: 1
        },
        {
            id: 'cmp-008',
            number: 'JS-2026-000108',
            citizen_id: 'usr-citizen-01',
            title: 'Illegal dumping of industrial construction debris along Yamuna Floodplain road',
            description: 'Tippers are repeatedly dumping concrete blocks, broken tiles, and plaster waste during night hours along the sensitive biodiversity buffer zone near Mayur Vihar Phase 1.',
            category: 'Waste Management',
            subcategory: 'Illegal garbage dumping',
            lat: 28.6083,
            lng: 77.2947,
            address: 'Pushta Road, Mayur Vihar Phase 1, East Delhi',
            landmark: 'Near Chilla Regulator',
            priority: 'High',
            ai_priority_suggestion: 'High',
            ai_priority_reason: 'Eco-sensitive zone C&D waste violation with repeated commercial offender activity.',
            ai_category_suggestion: 'Waste Management',
            ai_summary: 'Commercial night dumping of demolition debris on Yamuna eco-buffer road.',
            urgent: 0,
            status: 'More Information Required',
            dept: 'dept-waste',
            staff: 'usr-staff-waste',
            created_at: '2026-10-29 11:20:00',
            updated_at: '2026-10-31 15:40:00',
            est_res: '2026-11-05 18:00:00',
            is_demo: 1
        }
    ];

    for (const c of complaints) {
        run(
            `INSERT INTO complaints (
                id, complaint_number, citizen_id, title, description, category, subcategory,
                latitude, longitude, address, landmark, priority, ai_priority_suggestion,
                ai_priority_reason, ai_category_suggestion, ai_summary, is_urgent, current_status,
                department_id, assigned_staff_id, created_at, updated_at, estimated_resolution_at,
                is_demo_data, resolution_notes, citizen_feedback, citizen_rating
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                c.id, c.number, c.citizen_id, c.title, c.description, c.category, c.subcategory,
                c.lat, c.lng, c.address, c.landmark, c.priority, c.ai_priority_suggestion,
                c.ai_priority_reason, c.ai_category_suggestion, c.ai_summary, c.urgent, c.status,
                c.dept, c.staff, c.created_at, c.updated_at, c.est_res, c.is_demo,
                c.status === 'Resolved' || c.status === 'Closed' ? 'Issue verified on-site and necessary civil/traffic remediation carried out per municipal protocol.' : null,
                c.status === 'Closed' ? 'The illegal bollards were removed immediately. Thank you for the swift resolution!' : null,
                c.status === 'Closed' ? 5 : null
            ]
        );
    }

    console.log('Seeding sample attachments...');
    const attachments = [
        {
            id: 'att-001',
            cid: 'cmp-001',
            uid: 'usr-citizen-01',
            path: '/uploads/sample_garbage_overflow.jpg',
            name: 'karol_bagh_dumpster.jpg',
            size: 420112,
            mime: 'image/jpeg',
            type: 'citizen_evidence'
        },
        {
            id: 'att-002',
            cid: 'cmp-002',
            uid: 'usr-citizen-01',
            path: '/uploads/sample_traffic_signal.jpg',
            name: 'moti_bagh_signal.jpg',
            size: 389201,
            mime: 'image/jpeg',
            type: 'citizen_evidence'
        },
        {
            id: 'att-003',
            cid: 'cmp-003',
            uid: 'usr-citizen-02',
            path: '/uploads/sample_hanging_wire.jpg',
            name: 'sec14_exposed_wire.jpg',
            size: 512300,
            mime: 'image/jpeg',
            type: 'citizen_evidence'
        },
        {
            id: 'att-004',
            cid: 'cmp-004',
            uid: 'usr-citizen-01',
            path: '/uploads/sample_pothole_before.jpg',
            name: 'andheri_pothole.jpg',
            size: 489110,
            mime: 'image/jpeg',
            type: 'citizen_evidence'
        },
        {
            id: 'att-005',
            cid: 'cmp-004',
            uid: 'usr-staff-traffic',
            path: '/uploads/sample_pothole_after.jpg',
            name: 'andheri_pothole_repaired.jpg',
            size: 450120,
            mime: 'image/jpeg',
            type: 'resolution_photo'
        }
    ];

    for (const a of attachments) {
        run(
            `INSERT INTO complaint_attachments (id, complaint_id, uploaded_by, file_path, file_name, file_size, mime_type, attachment_type)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [a.id, a.cid, a.uid, a.path, a.name, a.size, a.mime, a.type]
        );
    }

    console.log('Seeding complaint progress history & updates...');
    const updates = [
        {
            id: 'upd-001',
            cid: 'cmp-001',
            uid: 'usr-staff-waste',
            prev: 'Submitted',
            next: 'Under Review',
            msg: 'Complaint intake registered by Ward 42 Sanitation Control Room. Field inspector dispatched.',
            internal: 'Coordinating with private concessionaire Ramky Enviro for JCB and compactor vehicle.',
            time: '2026-10-29 10:15:00'
        },
        {
            id: 'upd-002',
            cid: 'cmp-001',
            uid: 'usr-staff-waste',
            prev: 'Under Review',
            next: 'In Progress',
            msg: 'Mechanical sweeper and garbage tipper have arrived on-site. Waste clearance underway.',
            internal: 'Commercial dumpers issued warning notice under Municipal Solid Waste By-laws.',
            time: '2026-10-30 14:15:00'
        },
        {
            id: 'upd-003',
            cid: 'cmp-002',
            uid: 'usr-staff-traffic',
            prev: 'Submitted',
            next: 'Assigned',
            msg: 'Urgent traffic signal alert acknowledged. Maintenance van 04 assigned for controller board replacement.',
            internal: 'Traffic constables posted manually to regulate peak-hour traffic flow.',
            time: '2026-11-01 09:00:00'
        },
        {
            id: 'upd-004',
            cid: 'cmp-003',
            uid: 'usr-staff-energy',
            prev: 'Submitted',
            next: 'In Progress',
            msg: 'Substation feeder de-energized remotely for safety. Linemen crew on-site insulating and restringing cable.',
            internal: 'Branch pruning request forwarded to Horticulture dept.',
            time: '2026-11-01 10:20:00'
        },
        {
            id: 'upd-005',
            cid: 'cmp-004',
            uid: 'usr-staff-traffic',
            prev: 'In Progress',
            next: 'Resolved',
            msg: 'Road surface milled and hot-mix bituminous mastic asphalt applied. Pothole leveled and cured.',
            internal: 'Total 45 sqm resurfacing completed by contractor M/s Supreme Infra under defect liability.',
            time: '2026-10-27 17:30:00'
        },
        {
            id: 'upd-006',
            cid: 'cmp-008',
            uid: 'usr-staff-waste',
            prev: 'Under Review',
            next: 'More Information Required',
            msg: 'Please provide vehicle registration numbers or photographic timestamp of nocturnal dumping trucks to initiate police FIR.',
            internal: 'Liaising with Delhi Police Mayur Vihar beat constable for night checkpoint.',
            time: '2026-10-31 15:40:00'
        }
    ];

    for (const u of updates) {
        run(
            `INSERT INTO complaint_updates (id, complaint_id, updated_by, previous_status, new_status, public_message, internal_note, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [u.id, u.cid, u.uid, u.prev, u.next, u.msg, u.internal, u.time]
        );
    }

    console.log('Seeding in-app notifications...');
    const notifications = [
        {
            id: 'notif-001',
            uid: 'usr-citizen-01',
            cid: 'cmp-001',
            type: 'status_update',
            title: 'Complaint JS-2026-000101 is In Progress',
            msg: 'Sanitation team has deployed mechanical sweepers and compactor trucks to Karol Bagh market.',
            is_read: 0,
            time: '2026-10-30 14:15:00'
        },
        {
            id: 'notif-002',
            uid: 'usr-citizen-01',
            cid: 'cmp-002',
            type: 'status_update',
            title: 'Urgent Signal Repair Assigned',
            msg: 'Maintenance van 04 has been dispatched to Moti Bagh junction for signal repair.',
            is_read: 0,
            time: '2026-11-01 09:00:00'
        },
        {
            id: 'notif-003',
            uid: 'usr-citizen-01',
            cid: 'cmp-004',
            type: 'resolved',
            title: 'Issue Resolved: Andheri-Kurla Potholes',
            msg: 'Bituminous hot-mix leveling completed. Please confirm if the road condition is satisfactory.',
            is_read: 1,
            time: '2026-10-27 17:30:00'
        },
        {
            id: 'notif-004',
            uid: 'usr-citizen-01',
            cid: 'cmp-008',
            type: 'info_required',
            title: 'Action Needed on JS-2026-000108',
            msg: 'The sanitation department requires vehicle registration numbers or clearer night photographs.',
            is_read: 0,
            time: '2026-10-31 15:40:00'
        }
    ];

    for (const n of notifications) {
        run(
            `INSERT INTO notifications (id, user_id, complaint_id, notification_type, title, message, is_read, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [n.id, n.uid, n.cid, n.type, n.title, n.msg, n.is_read, n.time]
        );
    }

    console.log('Seeding audit logs...');
    const auditLogs = [
        {
            id: 'aud-001',
            actor_id: 'usr-citizen-01',
            actor_name: 'Ananya Deshmukh',
            actor_role: 'citizen',
            action: 'SUBMIT_COMPLAINT',
            type: 'complaint',
            record_id: 'cmp-001',
            details: JSON.stringify({ complaint_number: 'JS-2026-000101', category: 'Waste Management' }),
            ip: '192.168.1.101',
            time: '2026-10-28 09:30:00'
        },
        {
            id: 'aud-002',
            actor_id: 'usr-staff-waste',
            actor_name: 'Rajesh Meena',
            actor_role: 'staff',
            action: 'UPDATE_STATUS',
            type: 'complaint',
            record_id: 'cmp-001',
            details: JSON.stringify({ old: 'Under Review', new: 'In Progress', note_added: true }),
            ip: '10.0.12.44',
            time: '2026-10-30 14:15:00'
        },
        {
            id: 'aud-003',
            actor_id: 'usr-admin-01',
            actor_name: 'Dr. Rameshwar Sharma (IAS)',
            actor_role: 'admin',
            action: 'CREATE_STAFF_ACCOUNT',
            type: 'user',
            record_id: 'usr-staff-civil',
            details: JSON.stringify({ role: 'staff', dept: 'dept-civil', email: 'civil.officer@jansahayak.gov.in' }),
            ip: '10.0.1.1',
            time: '2026-10-20 11:00:00'
        }
    ];

    for (const a of auditLogs) {
        run(
            `INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, affected_record_type, affected_record_id, details, ip_address, timestamp)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [a.id, a.actor_id, a.actor_name, a.actor_role, a.action, a.type, a.record_id, a.details, a.ip, a.time]
        );
    }

    console.log('JanSahayak database seeded successfully!');
}

if (require.main === module) {
    seedDatabase(true);
}

module.exports = {
    seedDatabase,
    hashPassword
};
