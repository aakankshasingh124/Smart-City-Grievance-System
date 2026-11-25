// AI Complaint Intelligence & Assistant Service
// Includes NLP Categorization, Duplicate Detection, Priority Recommendation, Summarization, and Chatbot

const { query, get } = require('../db/database');

const CATEGORY_DEFINITIONS = {
    'Waste Management': {
        deptId: 'dept-waste',
        deptName: 'Department of Solid Waste Management',
        keywords: [
            'garbage', 'waste', 'trash', 'dump', 'dustbin', 'bin', 'litter', 'debris',
            'filth', 'stench', 'rotting', 'sanitation', 'uncollected', 'sweeping',
            'spill', 'dumping', 'rubbish', 'safai', 'kachra', 'malba'
        ],
        subcategories: [
            'Garbage accumulation',
            'Overflowing public dustbins',
            'Illegal garbage dumping',
            'Uncollected household or public waste',
            'Dirty streets and public places',
            'Drainage blockage caused by waste',
            'Other sanitation-related problems'
        ]
    },
    'Traffic Management': {
        deptId: 'dept-traffic',
        deptName: 'Traffic Police & Road Infrastructure Authority',
        keywords: [
            'traffic', 'signal', 'light', 'pothole', 'road', 'crater', 'divider',
            'parking', 'jam', 'congestion', 'intersection', 'zebra', 'crossing',
            'signboard', 'bollard', 'skid', 'accident', 'speed breaker', 'flyover'
        ],
        subcategories: [
            'Traffic signal malfunction',
            'Damaged roads and potholes',
            'Road obstruction',
            'Illegal parking',
            'Broken traffic signs',
            'Damaged road dividers',
            'Other public traffic infrastructure issues'
        ]
    },
    'Energy Issues': {
        deptId: 'dept-energy',
        deptName: 'Municipal Electricity Board & Public Lighting',
        keywords: [
            'electricity', 'power', 'current', 'wire', 'cable', 'streetlight',
            'pole', 'transformer', 'spark', 'shock', 'blackout', 'outage',
            'high tension', 'voltage', 'darkness', 'fuse', 'bijli'
        ],
        subcategories: [
            'Streetlight failure',
            'Power supply interruptions',
            'Damaged electrical infrastructure',
            'Exposed electrical wires',
            'Damaged public electrical equipment',
            'Other electricity infrastructure issues'
        ]
    },
    'Miscellaneous Public Grievances': {
        deptId: 'dept-civil',
        deptName: 'Civil Works, Water Supply & Sanitation Board',
        keywords: [
            'water', 'pipe', 'pipeline', 'tap', 'drinking water', 'drain',
            'sewer', 'sewage', 'canal', 'park', 'bench', 'toilet', 'public toilet',
            'corruption', 'office', 'ration', 'certificate', 'encroachment', 'noise'
        ],
        subcategories: [
            'Water supply',
            'Drainage and sewage',
            'Damaged public property',
            'Public toilets and sanitation facilities',
            'Public parks and public facilities',
            'Government service-related grievances',
            'Issues concerning a government department or public authority',
            'Other civic issues'
        ]
    }
};

const HAZARD_CRITICAL_KEYWORDS = [
    'exposed wire', 'sparking', 'live wire', 'electrocution', 'high tension wire',
    'open manhole', 'cave in', 'bridge crack', 'gas leak', 'major accident',
    'gridlock junction', 'crater accident', 'near miss collision'
];

const HAZARD_HIGH_KEYWORDS = [
    'contaminated water', 'pothole', 'overflowing', 'toxic', 'uncollected 4 days',
    'foul odor', 'severe odor', 'yellow water', 'stray cattle', 'blocked drain', 'illegal dumping',
    'signal failure', 'traffic light off', 'spilled', 'blocking road', 'blocking pedestrian',
    'walkway blocked', 'waterlogged'
];

function tokenize(text) {
    if (!text) return [];
    return text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2);
}

// 1. Categorization
function categorizeComplaint(title, description, optionalImageName = '') {
    const fullText = `${title || ''} ${description || ''} ${optionalImageName || ''}`.toLowerCase();
    const tokens = tokenize(fullText);

    const scores = {};
    for (const [category, meta] of Object.entries(CATEGORY_DEFINITIONS)) {
        let matchCount = 0;
        for (const kw of meta.keywords) {
            if (fullText.includes(kw)) matchCount += 2;
        }
        for (const token of tokens) {
            if (meta.keywords.includes(token)) matchCount += 1;
        }
        scores[category] = matchCount;
    }

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const topCategory = sorted[0][0];
    const topScore = sorted[0][1];
    const secondScore = sorted[1][1];

    let confidence = 0.5;
    if (topScore > 0) {
        confidence = Math.min(0.98, Math.max(0.4, (topScore / (topScore + secondScore + 1))));
    }

    // Determine subcategory
    let bestSubcategory = CATEGORY_DEFINITIONS[topCategory].subcategories[0];
    for (const sub of CATEGORY_DEFINITIONS[topCategory].subcategories) {
        const subTokens = tokenize(sub);
        const subMatches = subTokens.filter(t => fullText.includes(t)).length;
        if (subMatches > 0) {
            bestSubcategory = sub;
            break;
        }
    }

    const needsManualReview = topScore < 2 || (topScore - secondScore < 1 && topScore < 5);

    return {
        category: needsManualReview ? 'Miscellaneous Public Grievances' : topCategory,
        suggestedCategory: topCategory,
        subcategory: bestSubcategory,
        confidence: parseFloat(confidence.toFixed(2)),
        departmentId: CATEGORY_DEFINITIONS[topCategory].deptId,
        departmentName: CATEGORY_DEFINITIONS[topCategory].deptName,
        needsManualReview,
        explanation: needsManualReview
            ? 'The description matches multiple civic domains; citizen confirmation is advised.'
            : `Detected strong thematic match with ${topCategory} (${Math.round(confidence * 100)}% confidence).`
    };
}

// 2. Haversine distance in meters
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

// 3. Duplicate Detection
function detectDuplicates(newComplaint, radiusMeters = 800, maxDays = 30) {
    if (!newComplaint.latitude || !newComplaint.longitude) {
        return { hasPotentialDuplicate: false, duplicates: [] };
    }

    const recentComplaints = query(
        `SELECT id, complaint_number, title, description, category, latitude, longitude,
                current_status, created_at, address
         FROM complaints
         WHERE current_status NOT IN ('Closed', 'Rejected')
         ORDER BY created_at DESC
         LIMIT 100`
    );

    const newTokens = new Set(tokenize(`${newComplaint.title} ${newComplaint.description}`));
    const duplicates = [];

    for (const existing of recentComplaints) {
        if (newComplaint.id && existing.id === newComplaint.id) continue;

        const distance = calculateDistanceMeters(
            newComplaint.latitude,
            newComplaint.longitude,
            existing.latitude,
            existing.longitude
        );

        if (distance <= radiusMeters) {
            const existingTokens = new Set(tokenize(`${existing.title} ${existing.description}`));
            let intersection = 0;
            for (const t of newTokens) {
                if (existingTokens.has(t)) intersection++;
            }
            const union = new Set([...newTokens, ...existingTokens]).size;
            const jaccardSimilarity = union > 0 ? intersection / union : 0;
            const categoryMatch = existing.category === newComplaint.category;

            // Similarity score combines geographic proximity, category match, and text token overlap
            const distanceScore = Math.max(0, (radiusMeters - distance) / radiusMeters);
            const compositeScore = (distanceScore * 0.4) + (categoryMatch ? 0.35 : 0.0) + (jaccardSimilarity * 0.25);

            if (compositeScore >= 0.45 || (distance <= 200 && categoryMatch)) {
                duplicates.push({
                    complaintNumber: existing.complaint_number,
                    title: existing.title,
                    category: existing.category,
                    currentStatus: existing.current_status,
                    distanceMeters: distance,
                    similarityScore: Math.round(compositeScore * 100),
                    address: existing.address,
                    createdAt: existing.created_at
                });
            }
        }
    }

    duplicates.sort((a, b) => b.similarityScore - a.similarityScore);

    return {
        hasPotentialDuplicate: duplicates.length > 0,
        duplicateCount: duplicates.length,
        duplicates: duplicates.slice(0, 3),
        notice: duplicates.length > 0
            ? `Notice: ${duplicates.length} potentially related complaint(s) exist within ${radiusMeters}m. You may still submit your report if your issue is distinct.`
            : 'No duplicate complaints detected in the immediate vicinity.'
    };
}

// 4. Priority Recommendation
function suggestPriority(category, title, description, isUrgent = false) {
    const fullText = `${title || ''} ${description || ''}`.toLowerCase();

    // Critical Hazard check
    for (const kw of HAZARD_CRITICAL_KEYWORDS) {
        if (fullText.includes(kw)) {
            return {
                priority: 'Critical',
                confidence: 0.95,
                reason: `Identified immediate public safety keyword ("${kw}"). Requires emergency response intervention.`,
                isCritical: true,
                badgeColor: 'red'
            };
        }
    }

    if (isUrgent) {
        return {
            priority: 'Critical',
            confidence: 0.90,
            reason: 'Flagged as urgent by reporting citizen due to imminent hazard.',
            isCritical: true,
            badgeColor: 'red'
        };
    }

    // High check
    for (const kw of HAZARD_HIGH_KEYWORDS) {
        if (fullText.includes(kw)) {
            return {
                priority: 'High',
                confidence: 0.85,
                reason: `Identified significant infrastructure disruption or health hazard keyword ("${kw}").`,
                isCritical: false,
                badgeColor: 'orange'
            };
        }
    }

    // Category baseline
    if (category === 'Energy Issues') {
        return {
            priority: 'Medium',
            confidence: 0.75,
            reason: 'Electrical infrastructure grievance requiring technical safety inspection.',
            isCritical: false,
            badgeColor: 'yellow'
        };
    }

    if (category === 'Traffic Management') {
        return {
            priority: 'Medium',
            confidence: 0.75,
            reason: 'Traffic movement impact requiring municipal road safety review.',
            isCritical: false,
            badgeColor: 'yellow'
        };
    }

    return {
        priority: 'Low',
        confidence: 0.70,
        reason: 'Standard municipal civic grievance subject to routine ward maintenance schedule.',
        isCritical: false,
        badgeColor: 'blue'
    };
}

// 5. Executive Summarizer
function summarizeComplaint(title, description) {
    if (!description || description.length < 90) {
        return description || title;
    }
    const sentences = description.split(/(?<=[.!?])\s+/);
    if (sentences.length >= 1) {
        const lead = sentences[0].trim();
        if (lead.length > 25 && lead.length < 150) {
            return lead;
        }
    }
    // Truncate cleanly at word boundary
    const truncated = description.slice(0, 140);
    const lastSpace = truncated.lastIndexOf(' ');
    return `${truncated.slice(0, lastSpace)}...`;
}

// 5b. Department Recommendation
function recommendDepartment(category, subcategory = '', text = '') {
    const meta = CATEGORY_DEFINITIONS[category] || CATEGORY_DEFINITIONS['Miscellaneous Public Grievances'];
    return {
        departmentId: meta.deptId,
        departmentName: meta.deptName,
        routingNotice: 'Department suggested by AI routing. Official dispatch pending staff intake.'
    };
}

// 6. AI Chatbot Assistant with Verified Database Grounding
function handleChatbotQuery(userMessage, conversationHistory = []) {
    const text = userMessage.trim();
    const lower = text.toLowerCase();

    // Check for complaint number pattern (JS-YYYY-XXXXXX or numbers)
    const match = text.match(/JS-\d{4}-\d{6}/i) || text.match(/JS\d{4}\d{6}/i);
    if (match) {
        const cNum = match[0].toUpperCase().replace(/^JS(\d{4})(\d{6})$/, 'JS-$1-$2');
        const complaint = get(
            `SELECT c.*, d.department_name, u.name as staff_name
             FROM complaints c
             LEFT JOIN departments d ON c.department_id = d.id
             LEFT JOIN users u ON c.assigned_staff_id = u.id
             WHERE c.complaint_number = ?`,
            [cNum]
        );

        if (complaint) {
            const updates = query(
                `SELECT new_status, public_message, created_at
                 FROM complaint_updates
                 WHERE complaint_id = ?
                 ORDER BY created_at DESC
                 LIMIT 1`,
                [complaint.id]
            );

            const latestUpdate = updates[0];
            return {
                reply: `🔍 **Complaint Status for ${complaint.complaint_number}**\n\n` +
                       `• **Title:** ${complaint.title}\n` +
                       `• **Category:** ${complaint.category}\n` +
                       `• **Current Status:** **${complaint.current_status}**\n` +
                       `• **Assigned Department:** ${complaint.department_name || 'Pending assignment'}\n` +
                       `• **Assigned Officer:** ${complaint.staff_name || 'Field officer pending assignment'}\n` +
                       `• **Submission Date:** ${complaint.created_at}\n` +
                       (complaint.estimated_resolution_at ? `• **Estimated Resolution:** ${complaint.estimated_resolution_at}\n` : '') +
                       (latestUpdate ? `\n📌 **Latest Official Update (${latestUpdate.created_at}):**\n"${latestUpdate.public_message}"\n` : '') +
                       `\nYou can view the full progress timeline and photographs on the Track Complaint page.`,
                suggestedActions: [
                    { label: `View ${complaint.complaint_number}`, action: 'track', complaintNumber: complaint.complaint_number },
                    { label: 'Report another issue', action: 'report' }
                ]
            };
        } else {
            return {
                reply: `I searched the civic database for complaint ID **${cNum}**, but no matching record was found. Please double-check the ID from your receipt or SMS confirmation. Format example: **JS-2026-000101**.`,
                suggestedActions: [
                    { label: 'Track Complaint Page', action: 'nav_track' },
                    { label: 'How to report an issue', action: 'help_report' }
                ]
            };
        }
    }

    // Emergency inquiries
    if (lower.includes('emergency') || lower.includes('danger') || lower.includes('accident') || lower.includes('sparking') || lower.includes('ambulance') || lower.includes('police')) {
        return {
            reply: `🚨 **Civic Emergency Helplines (India)**\n\n` +
                   `If this is an immediate, life-threatening situation, please contact emergency responders directly:\n\n` +
                   `• **National Emergency Helpline:** **112**\n` +
                   `• **Police:** **100 / 112**\n` +
                   `• **Fire Brigade:** **101**\n` +
                   `• **Ambulance:** **108 / 102**\n` +
                   `• **Electricity Emergency Helpline:** **1912**\n` +
                   `• **Water & Sewage Emergency:** **1916**\n\n` +
                   `⚠️ *For exposed live wires or open electrical boxes, please maintain at least 15 feet distance and do not attempt to touch.*`,
            suggestedActions: [
                { label: 'Report urgent traffic hazard', action: 'report', category: 'Traffic Management', urgent: true },
                { label: 'Report exposed electric wire', action: 'report', category: 'Energy Issues', urgent: true }
            ]
        };
    }

    // How to report
    if (lower.includes('how to report') || lower.includes('file a complaint') || lower.includes('submit') || lower.includes('new issue')) {
        return {
            reply: `📋 **How to Report a Civic Problem in 4 Simple Steps:**\n\n` +
                   `1. Click **"Report an Issue"** on the top menu or homepage.\n` +
                   `2. Choose from the **4 main categories**: *Waste Management*, *Traffic Management*, *Energy Issues*, or *Miscellaneous Grievances*.\n` +
                   `3. Enter a title, description, and upload a photograph if available.\n` +
                   `4. Allow browser location to pin your exact spot, or enter the address manually.\n\n` +
                   `Once submitted, you will receive a unique tracking ID (e.g., **JS-2026-000101**) to track progress in real-time.`,
            suggestedActions: [
                { label: 'Start a Report Now', action: 'report' },
                { label: 'Which category should I choose?', action: 'help_category' }
            ]
        };
    }

    // Category guidance
    if (lower.includes('category') || lower.includes('which category') || lower.includes('where to file')) {
        return {
            reply: `🏷️ **Complaint Categories Explained:**\n\n` +
                   `• 🗑️ **Waste Management:** Overflowing bins, uncollected garbage, illegal dumping, dirty streets, or clogged drains due to waste.\n` +
                   `• 🚦 **Traffic Management:** Signal blackouts, dangerous potholes, illegal parking, broken traffic signs, or divider damage.\n` +
                   `• ⚡ **Energy Issues:** Dark streetlights, power interruptions, exposed live wires, or broken transformers.\n` +
                   `• 🏛️ **Miscellaneous Public Grievances:** Water supply issues, contaminated water, broken public benches, parks, public toilets, or municipal service issues.\n\n` +
                   `*Tip:* Our AI will automatically suggest the category when you describe the problem!`,
            suggestedActions: [
                { label: 'Report an Issue', action: 'report' },
                { label: 'Check Public Statistics', action: 'nav_stats' }
            ]
        };
    }

    // Status explanation
    if (lower.includes('status') || lower.includes('under review') || lower.includes('in progress') || lower.includes('resolved') || lower.includes('meaning')) {
        return {
            reply: `📊 **Complaint Status Definitions:**\n\n` +
                   `1. **Submitted:** Complaint received and logged in the municipal database.\n` +
                   `2. **Under Review:** AI has routed the grievance; department control room is reviewing jurisdiction.\n` +
                   `3. **Assigned:** A specific field officer or maintenance team has been assigned.\n` +
                   `4. **In Progress:** Repair or cleaning team is actively working on-site.\n` +
                   `5. **Resolved:** Staff completed remediation and submitted verification photo/notes.\n` +
                   `6. **Closed:** Citizen confirmed satisfactory resolution or 7-day auto-closure period elapsed.\n` +
                   `• **More Information Required:** Staff needs extra details or photo from you.\n` +
                   `• **Rejected:** Disallowed with official written justification.`,
            suggestedActions: [
                { label: 'Track a complaint now', action: 'nav_track' }
            ]
        };
    }

    // General greeting or fallback
    return {
        reply: `Namaste! 🙏 I am **Sahayak AI**, your civic assistance companion on JanSahayak.\n\n` +
               `I can assist you with:\n` +
               `• **Tracking an existing complaint** (just type your ID like \`JS-2026-000101\`)\n` +
               `• **Guiding you on filing a new complaint**\n` +
               `• **Explaining civic categories and safety measures**\n` +
               `• **Providing municipal emergency helplines**\n\n` +
               `How can I help your neighborhood today?`,
        suggestedActions: [
            { label: 'Report an Issue', action: 'report' },
            { label: 'Track JS-2026-000101 (Demo)', action: 'track', complaintNumber: 'JS-2026-000101' },
            { label: 'Emergency Contacts', action: 'help_emergency' }
        ]
    };
}

module.exports = {
    categorizeComplaint,
    detectDuplicates,
    suggestPriority,
    summarizeComplaint,
    recommendDepartment,
    handleChatbotQuery,
    calculateDistanceMeters,
    CATEGORY_DEFINITIONS
};
