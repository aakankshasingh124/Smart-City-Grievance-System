// Administrator Panel Component — JanSahayak AI
const AdminPanel = {
    overview: {},
    staffUsers: [],
    departments: [],
    auditLogs: [],
    complaints: [],
    staffWorkload: [],
    activeTab: 'allotment',
    allotFilters: {
        status: 'all',
        department: 'all',
        priority: 'all',
        search: ''
    },

    async render() {
        const user = API.getCurrentUser();
        if (!user || user.role !== 'admin') {
            return `
            <div class="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-red-200 text-center shadow-xs">
                <div class="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xl mx-auto mb-3">🔒</div>
                <h2 class="text-xl font-bold text-slate-900">Administrator Credentials Required</h2>
                <p class="text-xs text-slate-600 mt-2">This panel is reserved for municipal IT administrators and senior executive officers.</p>
                <div class="mt-6">
                    <button onclick="App.openModal('staff-login')" class="px-6 py-2.5 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 transition">
                        Log In as Administrator
                    </button>
                </div>
            </div>
            `;
        }

        return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 mb-8 gap-4">
                <div>
                    <div class="flex items-center space-x-2">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-800">
                            Central Administration
                        </span>
                        <span class="text-xs text-slate-500 font-medium">${user.name} (${user.email})</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Municipal Governance & Task Management</h1>
                    <p class="text-xs text-slate-500 mt-0.5">Allot citizen grievances to staff officers, manage jurisdictional workloads, and track SLAs.</p>
                </div>

                <div class="flex items-center space-x-2">
                    <button onclick="AdminPanel.openCreateStaffModal()" class="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition flex items-center">
                        <span class="mr-1.5">+</span> Provision Staff Officer
                    </button>
                </div>
            </div>

            <!-- Overview Stat Chips -->
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-8">
                <div class="bg-white/90 p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <span class="text-[10px] font-bold uppercase text-slate-400">Total System Users</span>
                    <div id="adm-users-count" class="text-2xl font-black text-slate-900 mt-1">--</div>
                </div>
                <div class="bg-white/90 p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <span class="text-[10px] font-bold uppercase text-indigo-600">Active Staff Officers</span>
                    <div id="adm-staff-count" class="text-2xl font-black text-indigo-600 mt-1">--</div>
                </div>
                <div class="bg-white/90 p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <span class="text-[10px] font-bold uppercase text-emerald-600">Registered Citizens</span>
                    <div id="adm-citizen-count" class="text-2xl font-black text-emerald-600 mt-1">--</div>
                </div>
                <div class="bg-white/90 p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <span class="text-[10px] font-bold uppercase text-blue-600">Total Grievances</span>
                    <div id="adm-complaints-count" class="text-2xl font-black text-blue-600 mt-1">--</div>
                </div>
                <div class="bg-white/90 p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <span class="text-[10px] font-bold uppercase text-red-600">Overdue SLA Grievances</span>
                    <div id="adm-overdue-count" class="text-2xl font-black text-red-600 mt-1">--</div>
                </div>
            </div>

            <!-- Tab Navigation with Indian Civic Style -->
            <div class="border-b border-slate-200 mb-6 flex flex-wrap gap-y-2 space-x-2 sm:space-x-6 text-xs font-bold">
                <button onclick="AdminPanel.switchTab('allotment')" id="tab-btn-allotment" class="pb-3 border-b-2 border-purple-600 text-purple-700 flex items-center">
                    <span class="mr-1.5">📋</span> Task Allotment (कार्य आवंटन)
                </button>
                <button onclick="AdminPanel.switchTab('staff')" id="tab-btn-staff" class="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center">
                    <span class="mr-1.5">👥</span> Staff Accounts & Roles
                </button>
                <button onclick="AdminPanel.switchTab('departments')" id="tab-btn-departments" class="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center">
                    <span class="mr-1.5">🏢</span> Department Workloads
                </button>
                <button onclick="AdminPanel.switchTab('audit')" id="tab-btn-audit" class="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center">
                    <span class="mr-1.5">📜</span> Immutable Audit Trail
                </button>
            </div>

            <!-- Tab Content -->
            <div id="admin-tab-content">
                <div class="text-center py-12 text-slate-400 text-xs">Loading administrative records...</div>
            </div>
        </div>

        <!-- Task Allotment & Staff Modal Container -->
        <div id="admin-modal-container"></div>
        `;
    },

    async afterMount() {
        const user = API.getCurrentUser();
        if (!user || user.role !== 'admin') return;

        try {
            const overview = await API.admin.getOverview();
            this.overview = overview;

            const elUsers = document.getElementById('adm-users-count');
            const elStaff = document.getElementById('adm-staff-count');
            const elCit = document.getElementById('adm-citizen-count');
            const elCmp = document.getElementById('adm-complaints-count');
            const elOvd = document.getElementById('adm-overdue-count');

            if (elUsers) elUsers.textContent = overview.counts.totalUsers;
            if (elStaff) elStaff.textContent = overview.counts.staffCount;
            if (elCit) elCit.textContent = overview.counts.citizenCount;
            if (elCmp) elCmp.textContent = overview.counts.totalComplaints;
            if (elOvd) elOvd.textContent = overview.counts.overdueComplaints;

            await this.switchTab(this.activeTab || 'allotment');
        } catch (err) {
            console.error('Failed to load admin overview:', err);
        }
    },

    async switchTab(tab) {
        this.activeTab = tab;

        ['allotment', 'staff', 'departments', 'audit'].forEach(t => {
            const btn = document.getElementById(`tab-btn-${t}`);
            if (btn) {
                if (t === tab) {
                    btn.className = 'pb-3 border-b-2 border-purple-600 text-purple-700 flex items-center font-bold';
                } else {
                    btn.className = 'pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center font-bold';
                }
            }
        });

        const container = document.getElementById('admin-tab-content');
        if (!container) return;

        if (tab === 'allotment') {
            await this.loadAllotmentData();
            this.renderAllotmentTab(container);
        } else if (tab === 'staff') {
            const data = await API.admin.getUsers();
            this.staffUsers = data.users || [];
            this.renderStaffTab(container);
        } else if (tab === 'departments') {
            const data = await API.admin.getDepartments();
            this.departments = data.departments || [];
            this.renderDepartmentsTab(container);
        } else if (tab === 'audit') {
            const data = await API.admin.getAuditLogs(50);
            this.auditLogs = data.logs || [];
            this.renderAuditTab(container);
        }
    },

    // --- Task Allotment Methods ---

    async loadAllotmentData() {
        try {
            const [complaintsRes, workloadRes] = await Promise.all([
                API.complaints.getStaff({ status: 'all' }),
                API.admin.getStaffWorkload()
            ]);

            this.complaints = complaintsRes.complaints || [];
            this.complaintStats = complaintsRes.stats || {};
            this.staffWorkload = workloadRes.staff || [];
        } catch (err) {
            console.error('Failed to load allotment data:', err);
        }
    },

    renderAllotmentTab(container) {
        const unassignedCount = this.complaints.filter(c => !c.assigned_staff_id && c.current_status !== 'Resolved' && c.current_status !== 'Closed').length;
        const inProgressCount = this.complaints.filter(c => c.current_status === 'In Progress').length;
        const resolvedCount = this.complaints.filter(c => c.current_status === 'Resolved' || c.current_status === 'Closed').length;

        container.innerHTML = `
        <div class="space-y-6">
            <!-- Allotment Sub-Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div class="bg-white/95 p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                    <div>
                        <span class="text-[10px] font-bold uppercase text-slate-400">Total Grievances</span>
                        <div class="text-2xl font-black text-slate-800 mt-0.5">${this.complaints.length}</div>
                    </div>
                    <span class="p-2.5 rounded-xl bg-slate-100 text-slate-600 text-lg">📑</span>
                </div>

                <div onclick="AdminPanel.quickFilterAllot('unassigned')" class="bg-amber-50/90 p-4 rounded-2xl border-2 border-amber-300 shadow-2xs flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition">
                    <div>
                        <span class="text-[10px] font-black uppercase tracking-wider text-amber-800">Pending Staff Allotment</span>
                        <div class="text-2xl font-black text-amber-900 mt-0.5">${unassignedCount} Tasks</div>
                        <span class="text-[10px] text-amber-700 underline font-semibold">Click to show unassigned →</span>
                    </div>
                    <span class="p-2.5 rounded-xl bg-amber-200 text-amber-900 text-lg">⚠️</span>
                </div>

                <div class="bg-blue-50/90 p-4 rounded-2xl border border-blue-200 shadow-2xs flex items-center justify-between">
                    <div>
                        <span class="text-[10px] font-bold uppercase text-blue-700">In-Progress Field Work</span>
                        <div class="text-2xl font-black text-blue-900 mt-0.5">${inProgressCount} Tasks</div>
                    </div>
                    <span class="p-2.5 rounded-xl bg-blue-100 text-blue-700 text-lg">⚡</span>
                </div>

                <div class="bg-emerald-50/90 p-4 rounded-2xl border border-emerald-200 shadow-2xs flex items-center justify-between">
                    <div>
                        <span class="text-[10px] font-bold uppercase text-emerald-700">Resolved / Closed</span>
                        <div class="text-2xl font-black text-emerald-900 mt-0.5">${resolvedCount} Tasks</div>
                    </div>
                    <span class="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 text-lg">✅</span>
                </div>
            </div>

            <!-- Filter Toolbar -->
            <div class="bg-white/95 rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div class="w-full md:w-80">
                    <input id="allot-search-input" type="text"
                           placeholder="Search ticket ID, title, address, citizen..."
                           value="${this.allotFilters.search}"
                           oninput="AdminPanel.handleAllotSearch(this.value)"
                           class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 bg-slate-50/60" />
                </div>

                <div class="flex flex-wrap items-center gap-2 text-xs">
                    <select id="allot-filter-status" onchange="AdminPanel.handleAllotFilter('status', this.value)" class="px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium">
                        <option value="all" ${this.allotFilters.status === 'all' ? 'selected' : ''}>All Statuses</option>
                        <option value="unassigned" ${this.allotFilters.status === 'unassigned' ? 'selected' : ''}>⚠️ Unallotted (Pending Staff)</option>
                        <option value="Submitted" ${this.allotFilters.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
                        <option value="Under Review" ${this.allotFilters.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                        <option value="Assigned" ${this.allotFilters.status === 'Assigned' ? 'selected' : ''}>Assigned</option>
                        <option value="In Progress" ${this.allotFilters.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Resolved" ${this.allotFilters.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select>

                    <select id="allot-filter-priority" onchange="AdminPanel.handleAllotFilter('priority', this.value)" class="px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium">
                        <option value="all" ${this.allotFilters.priority === 'all' ? 'selected' : ''}>All Priorities</option>
                        <option value="Critical" ${this.allotFilters.priority === 'Critical' ? 'selected' : ''}>Critical Only</option>
                        <option value="High" ${this.allotFilters.priority === 'High' ? 'selected' : ''}>High Priority</option>
                        <option value="Medium" ${this.allotFilters.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                        <option value="Low" ${this.allotFilters.priority === 'Low' ? 'selected' : ''}>Low</option>
                    </select>

                    <button onclick="AdminPanel.resetAllotFilters()" class="px-3 py-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 font-semibold transition">
                        Reset
                    </button>
                </div>
            </div>

            <!-- Task Allotment Table -->
            <div class="bg-white/95 rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                <div class="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                        <h3 class="font-extrabold text-slate-900 text-sm flex items-center">
                            <span>Citizen Grievances & Work Orders</span>
                            <span class="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-bold">${this.getFilteredComplaints().length} items</span>
                        </h3>
                        <p class="text-slate-500 text-xs">Allot unassigned tasks or redirect open work to specific ward officers with explicit directives.</p>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs text-slate-700">
                        <thead class="bg-slate-50/90 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                            <tr>
                                <th class="px-5 py-3.5">Ticket ID</th>
                                <th class="px-4 py-3.5">Category & Issue Title</th>
                                <th class="px-3 py-3.5">Priority</th>
                                <th class="px-4 py-3.5">Location / Ward</th>
                                <th class="px-3 py-3.5">Status</th>
                                <th class="px-4 py-3.5">Assigned Staff Officer</th>
                                <th class="px-4 py-3.5">Target SLA</th>
                                <th class="px-4 py-3.5 text-right">Work Action</th>
                            </tr>
                        </thead>
                        <tbody id="allot-table-body" class="divide-y divide-slate-100">
                            ${this.renderAllotmentTableRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        `;
    },

    getFilteredComplaints() {
        return this.complaints.filter(c => {
            // Status Filter
            if (this.allotFilters.status === 'unassigned') {
                if (c.assigned_staff_id) return false;
            } else if (this.allotFilters.status !== 'all') {
                if (c.current_status !== this.allotFilters.status) return false;
            }

            // Priority Filter
            if (this.allotFilters.priority !== 'all') {
                if (c.priority !== this.allotFilters.priority) return false;
            }

            // Search text
            if (this.allotFilters.search) {
                const q = this.allotFilters.search.toLowerCase();
                const matchNumber = (c.complaint_number || '').toLowerCase().includes(q);
                const matchTitle = (c.title || '').toLowerCase().includes(q);
                const matchAddress = (c.address || '').toLowerCase().includes(q);
                const matchStaff = (c.assigned_staff_name || '').toLowerCase().includes(q);
                const matchCitizen = (c.citizen_name || c.guest_name || '').toLowerCase().includes(q);
                if (!matchNumber && !matchTitle && !matchAddress && !matchStaff && !matchCitizen) return false;
            }

            return true;
        });
    },

    renderAllotmentTableRows() {
        const filtered = this.getFilteredComplaints();

        if (filtered.length === 0) {
            return `
            <tr>
                <td colspan="8" class="text-center py-12 text-slate-400">
                    No grievances match your filter criteria.
                </td>
            </tr>
            `;
        }

        return filtered.map(c => {
            const isUnassigned = !c.assigned_staff_id;
            const isOverdue = c.estimated_resolution_at && new Date(c.estimated_resolution_at) < new Date() && c.current_status !== 'Resolved' && c.current_status !== 'Closed';

            return `
            <tr class="hover:bg-purple-50/30 transition ${isUnassigned ? 'bg-amber-50/20' : ''}">
                <td class="px-5 py-4 font-mono font-bold text-purple-800 whitespace-nowrap">
                    ${c.complaint_number}
                </td>
                <td class="px-4 py-4 max-w-xs">
                    <div class="flex items-center space-x-1.5">
                        <span class="text-[10px] font-bold uppercase text-slate-400">${c.category}</span>
                        ${c.voice_note_url ? '<span class="px-1.5 py-0.5 rounded text-[9px] bg-amber-100 text-amber-800 font-bold">🎙️ Voice Note</span>' : ''}
                    </div>
                    <div class="font-bold text-slate-900 truncate mt-0.5" title="${c.title}">${c.title}</div>
                    <div class="text-[11px] text-slate-500 truncate">${c.citizen_name || c.guest_name || 'Citizen'}</div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        c.priority === 'Critical' ? 'bg-red-100 text-red-800 border border-red-200' :
                        c.priority === 'High' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        c.priority === 'Medium' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-slate-100 text-slate-700'
                    }">
                        ${c.priority}
                    </span>
                </td>
                <td class="px-4 py-4 max-w-xs truncate text-slate-600 text-[11px]">
                    📍 ${c.address}
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        c.current_status === 'Resolved' || c.current_status === 'Closed' ? 'bg-emerald-100 text-emerald-800' :
                        c.current_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        c.current_status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        c.current_status === 'Assigned' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-800'
                    }">
                        ${c.current_status}
                    </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                    ${isUnassigned ? `
                        <span class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                            <span>⚠️ Not Allotted</span>
                        </span>
                    ` : `
                        <div>
                            <div class="font-bold text-slate-800">${c.assigned_staff_name}</div>
                            <div class="text-[10px] text-slate-400">${c.department_name || 'Ward Officer'}</div>
                        </div>
                    `}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-[11px]">
                    ${c.estimated_resolution_at ? `
                        <div class="${isOverdue ? 'text-red-700 font-bold' : 'text-slate-600'}">
                            ${new Date(c.estimated_resolution_at).toLocaleDateString()}
                            ${isOverdue ? '<span class="text-[9px] block text-red-600 uppercase">Overdue</span>' : ''}
                        </div>
                    ` : '<span class="text-slate-400 italic">Not set</span>'}
                </td>
                <td class="px-4 py-4 text-right whitespace-nowrap">
                    ${isUnassigned ? `
                        <button onclick="AdminPanel.openAllotModal('${c.id}')"
                                class="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition flex items-center ml-auto">
                            <span class="mr-1">🎯</span> कार्य सौंपें (Allot)
                        </button>
                    ` : `
                        <button onclick="AdminPanel.openAllotModal('${c.id}')"
                                class="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs transition flex items-center ml-auto">
                            <span class="mr-1">🔄</span> Re-allot / Directive
                        </button>
                    `}
                </td>
            </tr>
            `;
        }).join('');
    },

    quickFilterAllot(status) {
        this.allotFilters.status = status;
        const select = document.getElementById('allot-filter-status');
        if (select) select.value = status;
        this.refreshAllotTable();
    },

    handleAllotFilter(key, value) {
        this.allotFilters[key] = value;
        this.refreshAllotTable();
    },

    handleAllotSearch(val) {
        this.allotFilters.search = val.trim();
        this.refreshAllotTable();
    },

    resetAllotFilters() {
        this.allotFilters = { status: 'all', department: 'all', priority: 'all', search: '' };
        const container = document.getElementById('admin-tab-content');
        if (container) this.renderAllotmentTab(container);
    },

    refreshAllotTable() {
        const tbody = document.getElementById('allot-table-body');
        if (tbody) {
            tbody.innerHTML = this.renderAllotmentTableRows();
        }
    },

    // --- Allot Task Modal ---

    async openAllotModal(complaintId) {
        const complaint = this.complaints.find(c => c.id === complaintId);
        if (!complaint) return;

        // Ensure fresh staff workload list
        if (!this.staffWorkload || this.staffWorkload.length === 0) {
            const res = await API.admin.getStaffWorkload();
            this.staffWorkload = res.staff || [];
        }

        const modal = document.getElementById('admin-modal-container');
        if (!modal) return;

        // Group staff by department
        const deptsMap = {};
        this.staffWorkload.forEach(s => {
            const deptName = s.department_name || 'General Municipal Jurisdiction';
            if (!deptsMap[deptName]) deptsMap[deptName] = [];
            deptsMap[deptName].push(s);
        });

        // Determine matching department or default staff selection
        let defaultStaffId = complaint.assigned_staff_id || '';
        if (!defaultStaffId && this.staffWorkload.length > 0) {
            // Find staff in matching department with lowest active workload
            const matching = this.staffWorkload.filter(s => s.department_id === complaint.department_id);
            if (matching.length > 0) {
                matching.sort((a, b) => a.active_tasks - b.active_tasks);
                defaultStaffId = matching[0].id;
            } else {
                defaultStaffId = this.staffWorkload[0].id;
            }
        }

        modal.innerHTML = `
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div class="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-purple-200 p-6 sm:p-8">
                <!-- Top Ribbon -->
                <div class="h-2 w-full rounded-t-xl bg-gradient-to-r from-purple-600 via-orange-500 to-emerald-600 -mt-6 sm:-mt-8 -mx-6 sm:-mx-8 mb-6"></div>

                <div class="flex items-start justify-between pb-4 border-b border-slate-100">
                    <div>
                        <div class="flex items-center space-x-2">
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800">
                                Administrative Task Allotment
                            </span>
                            <span class="font-mono text-xs font-bold text-purple-700">${complaint.complaint_number}</span>
                        </div>
                        <h3 class="font-extrabold text-slate-900 text-lg mt-1">कर्मचारी को कार्य सौंपें (Allot Task to Staff)</h3>
                    </div>
                    <button onclick="document.getElementById('admin-modal-container').innerHTML = ''" class="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
                </div>

                <!-- Complaint Context Summary Box -->
                <div class="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-slate-900 text-sm">${complaint.title}</span>
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            complaint.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                            complaint.priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }">${complaint.priority}</span>
                    </div>
                    <div class="text-slate-600 flex items-center space-x-2">
                        <span>🏷️ <strong>Category:</strong> ${complaint.category}</span>
                        <span>•</span>
                        <span>📍 <strong>Location:</strong> ${complaint.address}</span>
                    </div>
                    <div class="text-slate-500 text-[11px] leading-relaxed line-clamp-2">
                        "${complaint.description}"
                    </div>
                    ${complaint.voice_note_url ? `
                    <div class="pt-1 flex items-center space-x-2">
                        <span class="text-[10px] font-bold text-amber-900">🎙️ Citizen Voice Recording:</span>
                        <audio controls class="h-6 w-56" src="${complaint.voice_note_url}"></audio>
                    </div>
                    ` : ''}
                </div>

                <!-- Allotment Form -->
                <form onsubmit="AdminPanel.handleAllotSubmit(event, '${complaint.id}')" class="mt-5 space-y-4 text-xs">
                    <!-- Staff Officer Selection -->
                    <div>
                        <label class="block font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">
                            1. Select Staff Officer to Execute Task * (कार्यकारी अधिकारी)
                        </label>
                        <select id="allot-staff-id" required class="w-full px-3.5 py-2.5 rounded-xl border-2 border-purple-200 focus:border-purple-600 bg-white font-medium">
                            ${Object.keys(deptsMap).map(dept => `
                                <optgroup label="🏢 ${dept}">
                                    ${deptsMap[dept].map(s => `
                                        <option value="${s.id}" ${s.id === defaultStaffId ? 'selected' : ''}>
                                            ${s.name} (${s.email}) — ${s.active_tasks} Active Task${s.active_tasks === 1 ? '' : 's'}
                                        </option>
                                    `).join('')}
                                </optgroup>
                            `).join('')}
                        </select>
                        <p class="text-[10px] text-slate-400 mt-1">Officers with lowest active workload are prioritized for balanced municipal operations.</p>
                    </div>

                    <!-- Work Directives / Instructions from Admin -->
                    <div>
                        <div class="flex items-center justify-between mb-1">
                            <label class="block font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                                2. Admin Task Directives & Instructions * (प्रशासनिक कार्य निर्देश)
                            </label>
                            <span class="text-[10px] text-purple-700 font-semibold">Sent directly to officer</span>
                        </div>
                        <textarea id="allot-instructions" rows="3" required
                                  placeholder="Enter explicit directives for the field officer (e.g. Inspect the site immediately at Ward 42, clear solid dumping, verify storm drain clearance, and upload resolution photograph)..."
                                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500"></textarea>

                        <!-- Quick Directive Chips -->
                        <div class="flex flex-wrap items-center gap-1.5 mt-2">
                            <span class="text-[10px] text-slate-400 font-semibold">Quick Directives:</span>
                            <button type="button" onclick="AdminPanel.appendDirective('Inspect site immediately and submit on-ground verification.')" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-purple-100 hover:text-purple-800 text-[10px] text-slate-600 transition">⚡ Site Inspection</button>
                            <button type="button" onclick="AdminPanel.appendDirective('Deploy field sanitation team and clear all debris.')" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-purple-100 hover:text-purple-800 text-[10px] text-slate-600 transition">🧹 Clear Waste</button>
                            <button type="button" onclick="AdminPanel.appendDirective('High citizen impact: escalate work and complete within 24 hours.')" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-purple-100 hover:text-purple-800 text-[10px] text-slate-600 transition">⚠️ High Urgency</button>
                            <button type="button" onclick="AdminPanel.appendDirective('Mandatory resolution photograph required before ticket closure.')" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-purple-100 hover:text-purple-800 text-[10px] text-slate-600 transition">📷 Photo Required</button>
                        </div>
                    </div>

                    <!-- Priority & Target SLA in Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">
                                3. Target SLA / Completion Deadline (लक्ष्य समाधान समय)
                            </label>
                            <select id="allot-hours" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white">
                                <option value="12">Urgent — 12 Hours (आपातकालीन)</option>
                                <option value="24" selected>Standard — 24 Hours (1 दिन)</option>
                                <option value="48">48 Hours (2 दिन)</option>
                                <option value="72">72 Hours (3 दिन)</option>
                                <option value="168">7 Days (जटिल सिविल कार्य)</option>
                            </select>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">
                                4. Priority Level (प्राथमिकता स्तर)
                            </label>
                            <select id="allot-priority" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white">
                                <option value="${complaint.priority}">Retain Current (${complaint.priority})</option>
                                <option value="Critical">Critical (गंभीर)</option>
                                <option value="High">High (उच्च)</option>
                                <option value="Medium">Medium (मध्यम)</option>
                                <option value="Low">Low (सामान्य)</option>
                            </select>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span class="text-[10px] text-slate-400">Staff officer will receive instant notification & audit entry.</span>
                        <div class="flex space-x-2">
                            <button type="button" onclick="document.getElementById('admin-modal-container').innerHTML = ''" class="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-semibold transition">
                                Cancel
                            </button>
                            <button type="submit" id="btn-submit-allot" class="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold shadow-md transition flex items-center">
                                <span>🚀 कार्य आवंटित करें (Confirm Allotment)</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        `;
    },

    appendDirective(text) {
        const textarea = document.getElementById('allot-instructions');
        if (!textarea) return;
        if (textarea.value.trim().length > 0) {
            textarea.value = `${textarea.value.trim()} ${text}`;
        } else {
            textarea.value = text;
        }
        textarea.focus();
    },

    async handleAllotSubmit(e, complaintId) {
        e.preventDefault();

        const staffId = document.getElementById('allot-staff-id').value;
        const instructions = document.getElementById('allot-instructions').value.trim();
        const estimatedHours = document.getElementById('allot-hours').value;
        const priority = document.getElementById('allot-priority').value;
        const submitBtn = document.getElementById('btn-submit-allot');

        if (!staffId || !instructions) {
            App.showToast('Please select a staff officer and provide task directives.', 'warning');
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Allotting Task...';
        }

        try {
            const res = await API.admin.allotTask({
                complaintId,
                staffId,
                instructions,
                estimatedHours,
                priority
            });

            App.showToast(res.message || 'Task successfully allotted to staff officer!', 'success');
            document.getElementById('admin-modal-container').innerHTML = '';

            // Reload allotment data and refresh UI
            await this.loadAllotmentData();
            const container = document.getElementById('admin-tab-content');
            if (container) {
                this.renderAllotmentTab(container);
            }
        } catch (err) {
            App.showToast(`Task allotment failed: ${err.message}`, 'error');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Confirm Allotment';
            }
        }
    },

    // --- Staff Accounts Tab ---

    renderStaffTab(container) {
        container.innerHTML = `
        <div class="bg-white/95 rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div class="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                    <h3 class="font-bold text-slate-900 text-sm">Authorized Administrative & Field Personnel</h3>
                    <p class="text-slate-500 text-xs">Role assignments and departmental jurisdictions.</p>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-700">
                    <thead class="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                        <tr>
                            <th class="px-5 py-3">Officer Name</th>
                            <th class="px-4 py-3">Email Address</th>
                            <th class="px-4 py-3">Role</th>
                            <th class="px-4 py-3">Assigned Department</th>
                            <th class="px-4 py-3">Phone</th>
                            <th class="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        ${this.staffUsers.map(u => `
                            <tr class="hover:bg-slate-50 transition">
                                <td class="px-5 py-3.5 font-bold text-slate-900">${u.name}</td>
                                <td class="px-4 py-3.5 text-slate-600 font-mono text-[11px]">${u.email}</td>
                                <td class="px-4 py-3.5">
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                        u.role === 'staff' ? 'bg-indigo-100 text-indigo-800' :
                                        'bg-slate-100 text-slate-700'
                                    }">${u.role}</span>
                                </td>
                                <td class="px-4 py-3.5 text-slate-600">${u.department_name || '<span class="text-slate-400 italic">None</span>'}</td>
                                <td class="px-4 py-3.5 text-slate-500">${u.phone || '--'}</td>
                                <td class="px-4 py-3.5">
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
                                        ${u.is_active ? 'Active' : 'Disabled'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        `;
    },

    // --- Departments Tab ---

    renderDepartmentsTab(container) {
        container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${this.departments.map(d => `
                <div class="bg-white/95 rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">${d.code}</span>
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${d.active_status ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}">
                                ${d.active_status ? 'Active Jurisdiction' : 'Inactive'}
                            </span>
                        </div>
                        <h3 class="text-base font-bold text-slate-900 mb-1">${d.department_name}</h3>
                        <p class="text-xs text-slate-600 leading-relaxed mb-4">${d.description || 'Municipal domain authority.'}</p>
                        <div class="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            📞 <strong>Contact:</strong> ${d.contact_information || 'N/A'}
                        </div>
                    </div>

                    <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                            <span class="text-[10px] text-slate-400 uppercase font-bold block">Assigned Officers</span>
                            <span class="font-bold text-slate-800">${d.staff_count || 0} Officers</span>
                        </div>
                        <div class="text-right">
                            <span class="text-[10px] text-slate-400 uppercase font-bold block">Active Workload</span>
                            <span class="font-bold text-amber-700">${d.active_complaints_count || 0} Open Tickets</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        `;
    },

    // --- Audit Trail Tab ---

    renderAuditTab(container) {
        container.innerHTML = `
        <div class="bg-white/95 rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div class="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                    <h3 class="font-bold text-slate-900 text-sm">Tamper-Resistant Administrative Audit Trail</h3>
                    <p class="text-slate-500 text-xs">Immutable system records of user actions, status transitions, task allotments, and data updates.</p>
                </div>
                <span class="text-[10px] font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded">Append-Only Store</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-700 font-mono">
                    <thead class="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                        <tr>
                            <th class="px-5 py-3">Timestamp</th>
                            <th class="px-4 py-3">Actor</th>
                            <th class="px-4 py-3">Role</th>
                            <th class="px-4 py-3">Action</th>
                            <th class="px-4 py-3">Target Record</th>
                            <th class="px-4 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-[11px]">
                        ${this.auditLogs.map(l => `
                            <tr class="hover:bg-slate-50 transition">
                                <td class="px-5 py-3 text-slate-400 whitespace-nowrap">${new Date(l.timestamp).toLocaleString()}</td>
                                <td class="px-4 py-3 font-bold text-slate-800">${l.actor_name}</td>
                                <td class="px-4 py-3 text-slate-600">${l.actor_role}</td>
                                <td class="px-4 py-3 text-purple-700 font-bold">${l.action}</td>
                                <td class="px-4 py-3 text-blue-700">${l.affected_record_type}:${l.affected_record_id}</td>
                                <td class="px-4 py-3 text-slate-500 max-w-xs truncate">${l.details || '--'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        `;
    },

    // --- Create Staff Modal ---

    openCreateStaffModal() {
        const modal = document.getElementById('admin-modal-container');
        if (!modal) return;

        modal.innerHTML = `
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div class="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8">
                <div class="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 class="font-extrabold text-slate-900 text-lg">Provision New Staff Account</h3>
                    <button onclick="document.getElementById('admin-modal-container').innerHTML = ''" class="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <form onsubmit="AdminPanel.handleCreateStaff(event)" class="mt-5 space-y-4 text-xs">
                    <div>
                        <label class="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Full Name *</label>
                        <input id="staff-new-name" type="text" required placeholder="e.g. Er. Devendra Patil" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300" />
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Official Email Address *</label>
                        <input id="staff-new-email" type="email" required placeholder="e.g. devendra.patil@jansahayak.gov.in" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300" />
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Mobile Contact</label>
                        <input id="staff-new-phone" type="text" placeholder="+91 98123 45678" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300" />
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Temporary Password *</label>
                        <input id="staff-new-password" type="password" required value="Staff@123" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono" />
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Assigned Department *</label>
                        <select id="staff-new-dept" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white">
                            <option value="dept-waste">Solid Waste Management (SWM)</option>
                            <option value="dept-traffic">Traffic Police & Roads (TP-RIA)</option>
                            <option value="dept-energy">Electricity Board & Lighting (MEB)</option>
                            <option value="dept-civil">Civil Works & Water Board (CW-WSSB)</option>
                        </select>
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Permission Role *</label>
                        <select id="staff-new-role" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white">
                            <option value="staff">Field / Department Staff Officer</option>
                            <option value="admin">System Administrator</option>
                        </select>
                    </div>

                    <div class="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                        <button type="button" onclick="document.getElementById('admin-modal-container').innerHTML = ''" class="px-4 py-2 rounded-xl text-slate-500 font-semibold">Cancel</button>
                        <button type="submit" class="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold">Create Account</button>
                    </div>
                </form>
            </div>
        </div>
        `;
    },

    async handleCreateStaff(e) {
        e.preventDefault();

        const name = document.getElementById('staff-new-name').value.trim();
        const email = document.getElementById('staff-new-email').value.trim();
        const phone = document.getElementById('staff-new-phone').value.trim();
        const password = document.getElementById('staff-new-password').value;
        const departmentId = document.getElementById('staff-new-dept').value;
        const role = document.getElementById('staff-new-role').value;

        try {
            await API.admin.createStaff({
                name,
                email,
                phone,
                password,
                departmentId,
                role
            });

            App.showToast(`Staff account successfully created for ${name}.`, 'success');
            document.getElementById('admin-modal-container').innerHTML = '';
            await this.switchTab('staff');
        } catch (err) {
            App.showToast(`Creation failed: ${err.message}`, 'error');
        }
    }
};

window.AdminPanel = AdminPanel;