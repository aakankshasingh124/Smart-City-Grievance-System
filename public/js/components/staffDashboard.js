// Staff Portal & Administrative Dashboard
const StaffDashboard = {
    complaints: [],
    stats: {},
    activeFilters: {
        status: 'all',
        priority: 'all',
        category: 'all',
        search: ''
    },
    selectedComplaint: null,

    async render() {
        const user = API.getCurrentUser();
        if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
            return `
            <div class="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-red-200 text-center shadow-xs">
                <div class="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xl mx-auto mb-3">⛔</div>
                <h2 class="text-xl font-bold text-slate-900">Restricted Portal Access</h2>
                <p class="text-xs text-slate-600 mt-2">This workspace is restricted to authorized municipal officers, ward engineers, and system administrators.</p>
                <div class="mt-6">
                    <button onclick="App.openModal('staff-login')" class="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition">
                        Sign in as Authorized Staff
                    </button>
                </div>
            </div>
            `;
        }

        return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 gap-4 mb-8">
                <div>
                    <div class="flex items-center space-x-2">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'}">
                            ${user.role} Workspace
                        </span>
                        <span class="text-xs text-slate-500 font-medium">• ${user.email}</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Municipal Operations Control Room</h1>
                </div>

                <div class="flex items-center space-x-3">
                    ${user.role === 'admin' ? `
                    <button onclick="App.navigate('admin-panel')" class="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition">
                        Admin Settings & Audit
                    </button>
                    ` : ''}
                    <button onclick="StaffDashboard.refresh()" class="p-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-bold transition flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                        Refresh
                    </button>
                </div>
            </div>

            <!-- KPI Counters -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <span class="text-[10px] font-bold uppercase text-slate-400">Total Assigned</span>
                    <div id="kpi-assigned" class="text-2xl font-black text-slate-900 mt-1">--</div>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <span class="text-[10px] font-bold uppercase text-blue-600">New Submitted</span>
                    <div id="kpi-new" class="text-2xl font-black text-blue-600 mt-1">--</div>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <span class="text-[10px] font-bold uppercase text-indigo-600">Under Review</span>
                    <div id="kpi-review" class="text-2xl font-black text-indigo-600 mt-1">--</div>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <span class="text-[10px] font-bold uppercase text-amber-600">In Progress</span>
                    <div id="kpi-progress" class="text-2xl font-black text-amber-600 mt-1">--</div>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <span class="text-[10px] font-bold uppercase text-red-600">High / Critical</span>
                    <div id="kpi-critical" class="text-2xl font-black text-red-600 mt-1">--</div>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <span class="text-[10px] font-bold uppercase text-emerald-600">Resolved</span>
                    <div id="kpi-resolved" class="text-2xl font-black text-emerald-600 mt-1">--</div>
                </div>
            </div>

            <!-- Search & Filters Toolbar -->
            <div class="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div class="w-full md:w-72">
                    <input id="staff-search-input" type="text" placeholder="Search ticket ID, street, title..."
                           oninput="StaffDashboard.handleFilterChange()"
                           class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500" />
                </div>

                <div class="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
                    <select id="staff-filter-status" onchange="StaffDashboard.handleFilterChange()" class="px-3 py-2 rounded-xl border border-slate-300 bg-white">
                        <option value="all">All Statuses</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                        <option value="More Information Required">More Info Req</option>
                        <option value="Reopened">Reopened</option>
                        <option value="Rejected">Rejected</option>
                    </select>

                    <select id="staff-filter-priority" onchange="StaffDashboard.handleFilterChange()" class="px-3 py-2 rounded-xl border border-slate-300 bg-white">
                        <option value="all">All Priorities</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>

                    <select id="staff-filter-category" onchange="StaffDashboard.handleFilterChange()" class="px-3 py-2 rounded-xl border border-slate-300 bg-white">
                        <option value="all">All Categories</option>
                        <option value="Waste Management">Waste</option>
                        <option value="Traffic Management">Traffic</option>
                        <option value="Energy Issues">Energy</option>
                        <option value="Miscellaneous Public Grievances">Miscellaneous</option>
                    </select>
                </div>
            </div>

            <!-- Complaints Table -->
            <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs text-slate-700">
                        <thead class="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                            <tr>
                                <th class="px-5 py-3.5">Ticket ID</th>
                                <th class="px-4 py-3.5">Category & Title</th>
                                <th class="px-3 py-3.5">Priority</th>
                                <th class="px-4 py-3.5">Location</th>
                                <th class="px-3 py-3.5">Status</th>
                                <th class="px-4 py-3.5">Assigned Officer</th>
                                <th class="px-4 py-3.5">Date</th>
                                <th class="px-4 py-3.5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody id="staff-table-body" class="divide-y divide-slate-100">
                            <tr>
                                <td colspan="8" class="text-center py-12 text-slate-400">Loading complaints...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Processing Modal Container -->
        <div id="staff-process-modal-container"></div>
        `;
    },

    async afterMount() {
        const user = API.getCurrentUser();
        if (!user || (user.role !== 'staff' && user.role !== 'admin')) return;
        await this.refresh();
    },

    async refresh() {
        const user = API.getCurrentUser();
        const search = (document.getElementById('staff-search-input') || {}).value || '';
        const status = (document.getElementById('staff-filter-status') || {}).value || 'all';
        const priority = (document.getElementById('staff-filter-priority') || {}).value || 'all';
        const category = (document.getElementById('staff-filter-category') || {}).value || 'all';

        try {
            const data = await API.complaints.getStaff({
                search,
                status,
                priority,
                category
            });

            this.complaints = data.complaints || [];
            this.stats = data.stats || {};

            // Render KPI counters
            const elAssigned = document.getElementById('kpi-assigned');
            const elNew = document.getElementById('kpi-new');
            const elReview = document.getElementById('kpi-review');
            const elProgress = document.getElementById('kpi-progress');
            const elCritical = document.getElementById('kpi-critical');
            const elResolved = document.getElementById('kpi-resolved');

            if (elAssigned) elAssigned.textContent = this.stats.totalAssigned || 0;
            if (elNew) elNew.textContent = this.stats.newComplaints || 0;
            if (elReview) elReview.textContent = this.stats.underReview || 0;
            if (elProgress) elProgress.textContent = this.stats.inProgress || 0;
            if (elCritical) elCritical.textContent = this.stats.highPriority || 0;
            if (elResolved) elResolved.textContent = this.stats.resolved || 0;

            this.renderTable();
        } catch (err) {
            console.error('Failed to load staff complaints:', err);
        }
    },

    handleFilterChange() {
        this.refresh();
    },

    renderTable() {
        const tbody = document.getElementById('staff-table-body');
        if (!tbody) return;

        if (this.complaints.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-12 text-slate-400">
                        No grievances found matching the selected filters.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.complaints.map(c => `
            <tr class="hover:bg-slate-50/80 transition">
                <td class="px-5 py-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                    ${c.complaint_number}
                </td>
                <td class="px-4 py-4 max-w-xs">
                    <div class="text-[10px] font-bold uppercase text-slate-400">${c.category}</div>
                    <div class="font-bold text-slate-900 truncate">${c.title}</div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        c.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                        c.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                        c.priority === 'Medium' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                    }">
                        ${c.priority}
                    </span>
                </td>
                <td class="px-4 py-4 max-w-xs truncate text-slate-500 text-[11px]">
                    ${c.address}
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        c.current_status === 'Resolved' || c.current_status === 'Closed' ? 'bg-emerald-100 text-emerald-800' :
                        c.current_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        c.current_status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                        c.current_status === 'Reopened' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                    }">
                        ${c.current_status}
                    </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-slate-700">
                    ${c.assigned_staff_name || '<span class="text-slate-400 italic">Unassigned</span>'}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-slate-400 text-[11px]">
                    ${new Date(c.created_at).toLocaleDateString()}
                </td>
                <td class="px-4 py-4 text-right whitespace-nowrap">
                    <button onclick="StaffDashboard.openProcessModal('${c.id}')"
                            class="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition">
                        Process →
                    </button>
                </td>
            </tr>
        `).join('');
    },

    async openProcessModal(complaintId) {
        try {
            const data = await API.complaints.getById(complaintId);
            this.selectedComplaint = data;
            const c = data.complaint;
            const updates = data.updates || [];
            const attachments = data.attachments || [];

            const modal = document.getElementById('staff-process-modal-container');
            if (!modal) return;

            modal.innerHTML = `
            <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div class="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
                    <!-- Modal Header -->
                    <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                        <div>
                            <div class="flex items-center space-x-2">
                                <span class="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-blue-600 text-white">${c.complaint_number}</span>
                                <span class="text-xs text-slate-300 font-semibold">${c.category} • ${c.priority} Priority</span>
                            </div>
                            <h3 class="text-lg font-black text-white mt-1">${c.title}</h3>
                        </div>
                        <button onclick="document.getElementById('staff-process-modal-container').innerHTML = ''" class="p-2 text-white/70 hover:text-white">
                            ✕
                        </button>
                    </div>

                    <!-- Main Grid: Info on left, Action Form on right -->
                    <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 max-h-[75vh] overflow-y-auto text-xs">
                        <!-- Left Column: Details, Photos, AI Summary -->
                        <div class="p-6 space-y-4">
                            <!-- Administrative Work Directive (if allotted by Admin) -->
                            ${(() => {
                                const adminDirective = updates.slice().reverse().find(u => u.internal_note && u.internal_note.includes('[ADMIN TASK ALLOTMENT DIRECTIVE'));
                                if (!adminDirective) return '';
                                const directiveText = adminDirective.internal_note.replace(/^\[ADMIN TASK ALLOTMENT DIRECTIVE[^\]]*\]:\s*/, '');
                                return `
                                <div class="p-3.5 rounded-xl bg-purple-50 border-2 border-purple-300 text-purple-900 shadow-2xs space-y-1">
                                    <div class="font-extrabold flex items-center justify-between text-xs text-purple-800">
                                        <span class="flex items-center"><span class="mr-1.5">📋</span> Admin Task Directive (प्रशासनिक कार्य निर्देश)</span>
                                        <span class="text-[9px] px-2 py-0.5 rounded-full bg-purple-200/80 font-bold uppercase">Official Order</span>
                                    </div>
                                    <p class="text-xs font-bold text-purple-950 mt-1 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-purple-200">${directiveText}</p>
                                    <div class="text-[10px] text-purple-600 flex justify-between pt-1">
                                        <span>Issued: ${new Date(adminDirective.created_at).toLocaleString()}</span>
                                        ${c.estimated_resolution_at ? `<span class="font-bold text-purple-800">Target SLA: ${new Date(c.estimated_resolution_at).toLocaleString()}</span>` : ''}
                                    </div>
                                </div>
                                `;
                            })()}

                            <!-- Citizen Description -->
                            <div>
                                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Citizen Description</span>
                                <p class="text-slate-800 text-xs mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">${c.description}</p>
                            </div>

                            <!-- AI Executive Summary & Routing Suggestion -->
                            <div class="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 space-y-1">
                                <div class="font-bold flex items-center">
                                    <span class="mr-1">🤖</span> AI Assessment
                                </div>
                                <p class="text-[11px]">${c.ai_summary || 'Standard intake analysis completed.'}</p>
                                <div class="text-[10px] text-indigo-700 font-semibold">Priority Recommendation: ${c.ai_priority_suggestion || c.priority} (${c.ai_priority_reason || 'Standard assessment'})</div>
                            </div>

                            <!-- Complainant Info (Protected, only shown to staff) -->
                            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Complainant Contact (Internal)</span>
                                <div class="mt-1 font-semibold text-slate-800">${c.citizen_name || c.guest_name || 'Citizen Complainant'}</div>
                                <div class="text-[11px] text-slate-500">${c.citizen_phone || c.guest_contact || ''} • ${c.citizen_email || ''}</div>
                                <div class="text-[11px] text-slate-500 mt-1">📍 ${c.address}</div>
                            </div>

                            <!-- Citizen Voice Recording (if available) -->
                            ${c.voice_note_url ? `
                            <div class="p-3 rounded-xl bg-amber-50 border border-amber-200">
                                <div class="flex items-center space-x-1.5 text-xs font-bold text-amber-900 mb-1.5">
                                    <span>🎙️</span>
                                    <span>Citizen Voice Recording (नागरिक ऑडियो विवरण)</span>
                                </div>
                                <audio controls class="w-full h-8" src="${c.voice_note_url}"></audio>
                            </div>
                            ` : ''}

                            <!-- Attached Photographs -->
                            <div>
                                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Attached Photos</span>
                                ${attachments.filter(a => !a.mime_type || !a.mime_type.startsWith('audio/')).length > 0 ? `
                                <div class="grid grid-cols-2 gap-2">
                                    ${attachments.filter(a => !a.mime_type || !a.mime_type.startsWith('audio/')).map(a => `
                                        <a href="${a.file_path}" target="_blank" class="block rounded-lg overflow-hidden border border-slate-200">
                                            <img src="${a.file_path}" class="w-full h-24 object-cover" />
                                            <div class="text-[9px] text-slate-600 p-1 truncate bg-slate-100">${a.attachment_type}</div>
                                        </a>
                                    `).join('')}
                                </div>
                                ` : '<p class="text-slate-400 italic">No photographs attached.</p>'}
                            </div>

                            <!-- Update History -->
                            <div>
                                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Audit Updates (${updates.length})</span>
                                <div class="space-y-2 max-h-40 overflow-y-auto pr-1">
                                    ${updates.map(u => `
                                        <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
                                            <div class="flex justify-between font-bold text-slate-800">
                                                <span>${u.new_status}</span>
                                                <span class="text-[9px] text-slate-400 font-mono">${new Date(u.created_at).toLocaleTimeString()}</span>
                                            </div>
                                            <p class="text-slate-600 mt-0.5">${u.public_message}</p>
                                            ${u.internal_note ? `<p class="text-red-700 bg-red-50 p-1 rounded text-[10px] mt-1 font-mono">🔒 Internal Note: ${u.internal_note}</p>` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Right Column: Action & Status Update Form -->
                        <form onsubmit="StaffDashboard.handleStatusSubmit(event, '${c.id}')" class="p-6 space-y-4">
                            <h4 class="font-bold text-slate-900 text-sm">Update Grievance Status</h4>

                            <!-- Status Dropdown -->
                            <div>
                                <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">New Status *</label>
                                <select id="staff-new-status" onchange="StaffDashboard.toggleFormFields(this.value)" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold">
                                    <option value="Under Review" ${c.current_status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                                    <option value="Assigned" ${c.current_status === 'Assigned' ? 'selected' : ''}>Assigned (Field Dispatch)</option>
                                    <option value="In Progress" ${c.current_status === 'In Progress' ? 'selected' : ''}>In Progress (Active Work)</option>
                                    <option value="Resolved" ${c.current_status === 'Resolved' ? 'selected' : ''}>Resolved (Remediation Complete)</option>
                                    <option value="More Information Required" ${c.current_status === 'More Information Required' ? 'selected' : ''}>More Information Required</option>
                                    <option value="Rejected" ${c.current_status === 'Rejected' ? 'selected' : ''}>Rejected (Disallowed)</option>
                                </select>
                            </div>

                            <!-- Mandatory Rejection Reason (Shown only if Rejected) -->
                            <div id="field-rejection" class="hidden">
                                <label class="block text-[10px] font-bold uppercase tracking-wider text-red-600 mb-1">Mandatory Official Rejection Reason *</label>
                                <textarea id="staff-rejection-reason" rows="2" placeholder="State official reason for rejecting this complaint..."
                                          class="w-full px-3 py-2 rounded-xl border border-red-300 bg-red-50/50 text-xs text-red-900"></textarea>
                            </div>

                            <!-- Resolution Notes (Shown if Resolved) -->
                            <div id="field-resolution" class="hidden">
                                <label class="block text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">Resolution Summary Note *</label>
                                <textarea id="staff-resolution-notes" rows="2" placeholder="Details of civil work / repair carried out per standards..."
                                          class="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50/50 text-xs text-emerald-900"></textarea>
                            </div>

                            <!-- Public Progress Message (Sent to citizen) -->
                            <div>
                                <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Public Progress Update *</label>
                                <textarea id="staff-public-message" rows="3" required placeholder="This update will appear on the citizen's tracking page and in their in-app notifications..."
                                          class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"></textarea>
                            </div>

                            <!-- Internal Note (STRICTLY PRIVATE) -->
                            <div>
                                <div class="flex items-center justify-between mb-1">
                                    <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Internal Staff Notes</label>
                                    <span class="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">🔒 Strictly Hidden from Citizen</span>
                                </div>
                                <textarea id="staff-internal-note" rows="2" placeholder="Private internal note for ward colleagues / contractors..."
                                          class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 font-mono"></textarea>
                            </div>

                            <!-- Progress Photo Upload -->
                            <div>
                                <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Upload Field / Resolution Photograph</label>
                                <input type="file" id="staff-progress-photo" accept="image/*" class="w-full text-xs text-slate-500" />
                            </div>

                            <!-- Estimated Target Resolution Date -->
                            <div>
                                <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Estimated Resolution Target</label>
                                <input id="staff-est-date" type="date" value="${c.estimated_resolution_at ? c.estimated_resolution_at.split(' ')[0] : ''}"
                                       class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs" />
                            </div>

                            <div class="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                                <button type="button" onclick="document.getElementById('staff-process-modal-container').innerHTML = ''"
                                        class="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold">
                                    Cancel
                                </button>
                                <button type="submit" class="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition">
                                    Apply Official Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            `;

            this.toggleFormFields(c.current_status);
        } catch (err) {
            App.showToast(`Failed to open complaint: ${err.message}`, 'error');
        }
    },

    toggleFormFields(status) {
        const rejBox = document.getElementById('field-rejection');
        const resBox = document.getElementById('field-resolution');
        if (rejBox) {
            if (status === 'Rejected') rejBox.classList.remove('hidden');
            else rejBox.classList.add('hidden');
        }
        if (resBox) {
            if (status === 'Resolved') resBox.classList.remove('hidden');
            else resBox.classList.add('hidden');
        }
    },

    async handleStatusSubmit(e, complaintId) {
        e.preventDefault();

        const newStatus = document.getElementById('staff-new-status').value;
        const publicMessage = document.getElementById('staff-public-message').value.trim();
        const internalNote = (document.getElementById('staff-internal-note') || {}).value || '';
        const rejectionReason = (document.getElementById('staff-rejection-reason') || {}).value || '';
        const resolutionNotes = (document.getElementById('staff-resolution-notes') || {}).value || '';
        const estDate = (document.getElementById('staff-est-date') || {}).value || null;

        if (newStatus === 'Rejected' && (!rejectionReason || rejectionReason.trim().length < 5)) {
            App.showToast('Please provide a mandatory written justification for rejecting this grievance.', 'error');
            return;
        }

        if (!publicMessage || publicMessage.length < 5) {
            App.showToast('Please provide a public update message for the complainant.', 'error');
            return;
        }

        // Handle optional progress image
        const photoInput = document.getElementById('staff-progress-photo');
        let progressImageBase64 = null;

        if (photoInput && photoInput.files[0]) {
            const file = photoInput.files[0];
            progressImageBase64 = await new Promise((resolve) => {
                const r = new FileReader();
                r.onload = ev => resolve(ev.target.result);
                r.readAsDataURL(file);
            });
        }

        try {
            await API.complaints.updateStatus(complaintId, {
                newStatus,
                publicMessage,
                internalNote,
                progressImageBase64,
                rejectionReason,
                resolutionNotes,
                estimatedResolutionAt: estDate ? `${estDate} 18:00:00` : null
            });

            App.showToast(`Complaint status successfully updated to ${newStatus}.`, 'success');
            document.getElementById('staff-process-modal-container').innerHTML = '';
            await this.refresh();
        } catch (err) {
            App.showToast(`Update error: ${err.message}`, 'error');
        }
    }
};

window.StaffDashboard = StaffDashboard;
