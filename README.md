# JanSahayak AI (जनसहायक AI)
### AI-Powered Public Grievance Reporting and Tracking System
*Tagline: "Your Voice, Your City, Your Solution."*

---

## 1. Executive Summary

**JanSahayak AI** is a modern, responsive, full-stack civic redressal platform engineered to bridge the communication gap between Indian citizens and local municipal corporations, power utility boards, traffic authorities, and water sanitation boards. 

The application integrates real-time AI intelligence (NLP categorization, geographic duplicate detection, safety priority recommendation, executive summarization, and an interactive Sahayak assistant) with transparent, audit-verified workflows.

---

## 2. System Architecture

The application is structured into three unified pillars:

1. **Citizen Portal**:
   - Geolocation-assisted complaint filing with interactive OpenStreetMap integration.
   - Photograph upload with file type/size validation and preview.
   - Real-time duplicate complaint detection warning before submission.
   - 6-stage visual progress timeline tracking (`Submitted` ➔ `Under Review` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved` ➔ `Closed`).
   - Citizen resolution confirmation: citizen verifies on-site repair or requests immediate reopening.
   - In-app notification center for real-time status change alerts.

2. **Staff & Administration Portal**:
   - Authorized role-based access control (RBAC): `citizen`, `staff`, `admin`.
   - Real-time KPI dashboards (total assigned, new, under review, active progress, high/critical priority, resolved).
   - Multi-filter grievance registry (by status, priority, category, ward department, text search).
   - Complaint processing modal: view citizen photographs, map marker, AI summary, update status, upload progress/resolution photos, set estimated completion target.
   - **Internal Staff Notes**: Sealed, encrypted notes strictly hidden from the citizen tracking page.
   - **Mandatory Rejection Explanation**: Transparent written justification enforced when rejecting any complaint.
   - Administrator suite: Provision staff accounts, oversee department workloads, monitor overdue SLAs, and inspect the immutable audit log.

3. **AI-Powered Complaint Intelligence**:
   - **Automatic Categorization**: Analyzes text and image metadata to route to the correct municipal division.
   - **Duplicate Detection**: Combines Haversine distance calculations (within 800m), category matching, and token similarity to flag existing nearby tickets.
   - **Priority Recommendations**: Distinguishes normal maintenance from critical public hazards (e.g. exposed live electric wires, major intersection signal failures, water contamination).
   - **Executive Summarizer**: Compiles lengthy citizen descriptions into a 1-sentence operational summary for field inspectors.
   - **Sahayak AI Chat Assistant**: Floating conversational companion that looks up live complaint numbers (`JS-2026-XXXXXX`) against verified database records, explains categories, and provides civic emergency helplines.

---

## 3. The Four Main Complaint Categories

| Category | Typical Grievances | Safety Warnings & Guidance |
| :--- | :--- | :--- |
| **1. Waste Management** | Overflowing dustbins, garbage dumping, uncollected domestic waste, dirty streets, blocked drains | Auto-routed to Solid Waste Management Department |
| **2. Traffic Management** | Signal light blackouts, dangerous potholes/craters, illegal parking, divider damage | Urgency flag enabled; guidance to dial 112 for active vehicular collisions |
| **3. Energy Issues** | Streetlight darkness, severed cables, sparking transformers, power interruptions | Electrical safety warning banner instructing citizens to maintain 15ft distance |
| **4. Miscellaneous Grievances** | Contaminated water supply, sewage overflows, damaged parks, public toilet hygiene | Neutral intake workflow; confidential routing for vigilance grievances |

---

## 4. Default Demo Accounts

The database comes pre-seeded with realistic Indian civic complaints (Delhi, Mumbai, Bengaluru, Chennai, Gurugram) and test credentials:

| Role | Name | Email | Password | Department |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Dr. Rameshwar Sharma (IAS) | `admin@jansahayak.gov.in` | `Admin@123` | Central Municipal Governance |
| **Sanitation Officer** | Rajesh Meena | `waste.officer@jansahayak.gov.in` | `Staff@123` | Dept of Solid Waste Management |
| **Traffic Police Inspector** | Vikram Rathore | `traffic.officer@jansahayak.gov.in` | `Staff@123` | Traffic Police & Roads Authority |
| **Power Grid Engineer** | Er. Priya Sundaram | `energy.officer@jansahayak.gov.in` | `Staff@123` | Municipal Electricity Board |
| **Civil Works Officer** | Amitabh Sen | `civil.officer@jansahayak.gov.in` | `Staff@123` | Civil Works & Water Supply |
| **Registered Citizen** | Ananya Deshmukh | `citizen@example.com` | `Citizen@123` | General Citizen |

*Note: Guest complainants can also submit tickets without logging in and receive a unique tracking reference (e.g., `JS-2026-000109`).*

---

## 5. Quick Demo Complaint IDs for Instant Tracking

You can track any of these pre-populated complaints directly on the **Track Complaint** page or via the **Sahayak AI** chatbot:

- `JS-2026-000101`: Severe garbage overflow at Karol Bagh Market (*Status: In Progress*)
- `JS-2026-000102`: Critical traffic signal failure at Moti Bagh Junction (*Status: Assigned, Critical*)
- `JS-2026-000103`: Exposed live wire near Sector 14 playground (*Status: In Progress, Critical*)
- `JS-2026-000104`: Deep pothole cluster on Andheri-Kurla Link Road (*Status: Resolved — citizen verification ready*)
- `JS-2026-000108`: Demolition waste dumping on Yamuna Floodplain (*Status: More Information Required*)

---

## 6. Directory Structure

```text
jansahayak-ai/
├── package.json               # Package definitions & scripts
├── README.md                  # Comprehensive system documentation
├── .env.example               # Environment variables template
├── supabase_schema.sql        # Supabase PostgreSQL schema with RLS & Policies
├── jansahayak.sqlite          # SQLite persistent database (auto-initialized)
├── run.bat / node.cmd         # Portable Node 24 runtime wrapper
├── server/
│   ├── index.js               # Central HTTP server & API router
│   ├── db/
│   │   ├── database.js        # SQLite connection & query helpers (node:sqlite)
│   │   ├── schema.sql         # Table definitions, constraints, indexes
│   │   └── seed.js            # Realistic Indian civic seed data generator
│   ├── middleware/
│   │   ├── auth.js            # JWT token issuance, verification, RBAC
│   │   └── upload.js          # File type / size validation & safe storage
│   ├── services/
│   │   ├── aiService.js       # NLP categorization, duplicates, priority, chatbot
│   │   ├── notificationService.js # In-app notification dispatcher
│   │   └── auditService.js    # Immutable append-only audit logger
│   └── routes/
│       ├── authRoutes.js      # Register, login, profile, notification endpoints
│       ├── complaintRoutes.js # Pre-check, submit, track, staff update, confirm
│       ├── statsRoutes.js     # Public statistics & dashboard endpoints
│       ├── adminRoutes.js     # Staff provisioning, department workloads, audit
│       └── aiRoutes.js        # Chatbot assistant & text analysis endpoints
├── public/                    # Frontend Client Application
│   ├── index.html             # Single Page Application HTML shell
│   ├── css/
│   │   └── styles.css         # Custom civic palette, Tiranga bar, animations
│   ├── js/
│   │   ├── api.js             # API client library
│   │   ├── app.js             # Client SPA router & state manager
│   │   └── components/
│   │       ├── navbar.js      # Navigation, notification bell, profile
│   │       ├── footer.js      # Emergency civic helplines & legal links
│   │       ├── home.js        # Hero, 4 category cards, stats, OpenStreetMap
│   │       ├── reportModal.js # Complaint filing form with map & AI suggestions
│   │       ├── track.js       # 6-stage timeline tracker & citizen confirmation
│   │       ├── myComplaints.js# Citizen complaints registry
│   │       ├── staffDashboard.js # Staff complaint management & processing modal
│   │       ├── adminPanel.js  # Admin user management, workloads & audit logs
│   │       ├── aiChatbot.js   # Floating Sahayak AI conversational companion
│   │       └── modals.js      # Auth, About, Contact, Privacy, Terms modals
│   └── uploads/               # Uploaded evidence and progress photos
└── tests/
    └── test_suite.js          # 15 automated unit & integration tests
```

---

## 7. Setup & Execution Instructions

### A. Running the Application

In this environment or any Windows terminal, start the server using the provided wrapper or Node:

```powershell
cd C:\Users\HP\.gemini\antigravity\scratch\jansahayak-ai

# Start the server
.\node.cmd server/index.js
```

Or on standard systems with Node.js installed in PATH:
```bash
npm start
```

The server will initialize the SQLite database, seed realistic demo complaints, and start listening at:
👉 **`http://localhost:5000`**

### B. Running Automated Tests

Run the comprehensive 15-test test suite:

```powershell
.\node.cmd tests/test_suite.js
```
All 15 tests cover database integrity, JWT tokens, AI categorization, priority scoring, duplicate detection with Haversine distance, Sahayak chatbot verified database lookups, notifications, and tamper-resistant audit logs.

### C. Resetting or Re-Seeding the Database

To reset the database to a fresh initial state with default demo accounts:
```powershell
.\node.cmd server/db/seed.js
```

---

## 8. Supabase & PostgreSQL Production Deployment

To deploy on Supabase with PostgreSQL:
1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase project dashboard.
3. Paste the contents of `supabase_schema.sql` and click **Run**.
4. Configure your `.env` file with `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
5. Row-Level Security (RLS) is pre-configured so citizens can only read their own private data, while staff access records across their departmental jurisdictions.

---

## 9. Security, Privacy & Compliance Measures

1. **Password Protection**: Passwords are never stored in plaintext; salted with 16-byte random salts and derived using PBKDF2-SHA512 with 10,000 iterations.
2. **Citizen Privacy**: Precise house numbers and personal phone numbers are omitted from the public heatmap. Approximate coordinates (~100m) are used for public transparency.
3. **Internal Notes Confidentiality**: Staff internal communications are strictly separated from citizen-facing tracking pages.
4. **Tamper-Evident Audit Logging**: Every status transition, administrative account creation, and resolution confirmation is stored in an append-only audit trail with IP address and timestamp.
5. **Safe File Uploads**: Image uploads are verified for MIME signatures (JPEG, PNG, WebP) and size-restricted to 5MB.
