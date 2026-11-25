// Dedicated Complaint Tracking Page with 6-Stage Timeline and Citizen Confirmation
const Track = {
    currentComplaint: null,
    miniMapInstance: null,

    async render(initialParams = {}) {
        const queryId = initialParams.complaintNumber || '';

        return `
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <!-- Search Header with Indian Civic Aesthetic -->
            <div class="text-center max-w-2xl mx-auto mb-8">
                <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-orange-900 text-xs font-bold mb-2">
                    <img src="images/favicon.svg" alt="JanSahayak" class="w-3.5 h-3.5" />
                    <span>नागरिक शिकायत स्थिति जांचें • Live Redressal Status</span>
                </div>
                <h1 class="text-3xl font-black text-slate-900 mt-1 font-devanagari">शिकायत की स्थिति • Track Grievance</h1>
                <p class="text-slate-600 mt-1.5 text-xs sm:text-sm">
                    Enter your unique ticket reference ID to inspect verified ward action, assigned inspectors, and on-site remediation photographs.
                </p>

                <!-- Search Input Form -->
                <form onsubmit="Track.handleSearch(event)" class="mt-6 flex items-center max-w-lg mx-auto gap-2">
                    <input id="track-input-id" type="text" value="${queryId}" placeholder="Enter Tracking ID (e.g. JS-2026-000101)..."
                           class="flex-1 px-4 py-3 rounded-2xl border-2 border-amber-200/90 bg-white/95 text-sm focus:ring-2 focus:ring-orange-500 uppercase tracking-wider font-mono font-bold shadow-2xs" />
                    <button type="submit" class="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-sm shadow-xs transition">
                        खोजें (Search)
                    </button>
                </form>

                <!-- Sample Complaint Quick Chips -->
                <div class="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
                    <span class="font-semibold text-slate-600 mr-1">Try Demo Tickets:</span>
                    <button onclick="Track.quickSearch('JS-2026-000101')" class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-mono font-bold transition">JS-2026-000101 (In Progress)</button>
                    <button onclick="Track.quickSearch('JS-2026-000102')" class="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-mono font-bold transition">JS-2026-000102 (Critical Signal)</button>
                    <button onclick="Track.quickSearch('JS-2026-000104')" class="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 font-mono font-bold transition">JS-2026-000104 (Resolved)</button>
                    <button onclick="Track.quickSearch('JS-2026-000108')" class="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 font-mono font-bold transition">JS-2026-000108 (Info Required)</button>
                </div>
            </div>

            <!-- Loading Spinner Container -->
            <div id="track-loading" class="hidden text-center py-12">
                <div class="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <div class="text-xs font-semibold text-slate-600">Retrieving verified municipal records...</div>
            </div>

            <!-- Result Details Section -->
            <div id="track-result-container"></div>
        </div>
        `;
    },

    async afterMount(params = {}) {
        if (params.complaintNumber) {
            await this.fetchComplaint(params.complaintNumber);
        }
    },

    quickSearch(id) {
        const input = document.getElementById('track-input-id');
        if (input) input.value = id;
        this.fetchComplaint(id);
    },

    handleSearch(e) {
        e.preventDefault();
        const input = document.getElementById('track-input-id');
        if (input && input.value.trim()) {
            this.fetchComplaint(input.value.trim());
        }
    },

    async fetchComplaint(id) {
        const loading = document.getElementById('track-loading');
        const container = document.getElementById('track-result-container');
        if (loading) loading.classList.remove('hidden');
        if (container) container.innerHTML = '';

        try {
            const data = await API.complaints.track(id);
            this.currentComplaint = data;
            if (loading) loading.classList.add('hidden');
            this.renderComplaintDetails(data);
        } catch (err) {
            if (loading) loading.classList.add('hidden');
            if (container) {
                container.innerHTML = `
                    <div class="bg-white rounded-3xl border border-red-200 p-8 text-center max-w-lg mx-auto shadow-xs">
                        <div class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl mx-auto mb-3">!</div>
                        <h3 class="text-lg font-bold text-slate-900">Record Not Found</h3>
                        <p class="text-xs text-slate-600 mt-1">${err.message}</p>
                        <p class="text-[11px] text-slate-400 mt-3">Please verify that your ticket ID matches format: <strong>JS-2026-XXXXXX</strong>.</p>
                    </div>
                `;
            }
        }
    },

    renderComplaintDetails(data) {
        const c = data.complaint;
        const timeline = data.timeline || [];
        const attachments = data.attachments || [];
        const container = document.getElementById('track-result-container');
        if (!container) return;

        const isResolved = c.current_status === 'Resolved';
        const isClosed = c.current_status === 'Closed';
        const isRejected = c.current_status === 'Rejected';
        const isInfoReq = c.current_status === 'More Information Required';
        const isReopened = c.current_status === 'Reopened';

        // Timeline Stages Array
        const STAGES = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
        const currentStageIndex = STAGES.indexOf(c.current_status);

        container.innerHTML = `
        <div class="space-y-6">
            <!-- Header Card -->
            <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div>
                        <div class="flex items-center space-x-2">
                            <span class="font-mono text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                                ${c.complaint_number}
                            </span>
                            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                c.category === 'Waste Management' ? 'bg-emerald-100 text-emerald-800' :
                                c.category === 'Traffic Management' ? 'bg-amber-100 text-amber-800' :
                                c.category === 'Energy Issues' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }">
                                ${c.category}
                            </span>
                            ${c.is_urgent ? `<span class="pulse-badge text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white">URGENT HAZARD</span>` : ''}
                        </div>
                        <h2 class="text-xl sm:text-2xl font-black text-slate-900 mt-2">${c.title}</h2>
                        <div class="text-xs text-slate-500 mt-1 flex items-center space-x-2">
                            <span>Reported on: <strong>${new Date(c.created_at).toLocaleString()}</strong></span>
                            <span>•</span>
                            <span>Ward Department: <strong>${c.department_name || 'Municipal Control'}</strong></span>
                        </div>
                    </div>

                    <!-- Current Status Large Pill -->
                    <div class="text-right">
                        <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Current Status</span>
                        <span class="px-4 py-2 rounded-2xl text-sm font-extrabold ${
                            isClosed ? 'bg-slate-900 text-white' :
                            isResolved ? 'bg-emerald-600 text-white' :
                            isRejected ? 'bg-red-600 text-white' :
                            isInfoReq ? 'bg-purple-600 text-white' :
                            isReopened ? 'bg-orange-600 text-white' :
                            'bg-blue-600 text-white'
                        }">
                            ${c.current_status}
                        </span>
                    </div>
                </div>

                <!-- 6-Stage Visual Timeline (If in normal lifecycle) -->
                ${!isRejected && !isInfoReq && !isReopened ? `
                <div class="py-8">
                    <div class="grid grid-cols-6 gap-2 text-center">
                        ${STAGES.map((st, idx) => {
                            const isDone = currentStageIndex >= idx;
                            const isCurrent = currentStageIndex === idx;
                            return `
                                <div class="flex flex-col items-center">
                                    <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition ${
                                        isCurrent ? 'bg-blue-700 text-white ring-4 ring-blue-100 scale-110 shadow-sm' :
                                        isDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'
                                    }">
                                        ${isDone && !isCurrent ? '✓' : idx + 1}
                                    </div>
                                    <span class="text-[11px] font-semibold mt-2 ${isCurrent ? 'text-blue-800 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'}">
                                        ${st}
                                    </span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                ` : `
                <!-- Alternate Status Banner (Rejected / More Info / Reopened) -->
                <div class="my-6 p-4 rounded-2xl ${
                    isRejected ? 'bg-red-50 border border-red-200 text-red-900' :
                    isInfoReq ? 'bg-purple-50 border border-purple-200 text-purple-900' :
                    'bg-orange-50 border border-orange-200 text-orange-900'
                }">
                    <div class="font-bold text-sm mb-1">
                        ${isRejected ? '⛔ Grievance Disallowed / Rejected by Municipal Office' :
                          isInfoReq ? '⚠️ Additional Information or Photo Evidence Requested' :
                          '🔄 Grievance Reopened for Supervisor Review'}
                    </div>
                    <p class="text-xs leading-relaxed">
                        ${c.rejection_reason || 'Staff have updated the status for this record. Review the chronological audit log below.'}
                    </p>
                </div>
                `}

                <!-- Problem Description & Voice Note Player -->
                <div class="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div class="text-[10px] uppercase font-bold text-slate-400 mb-1">Problem Description (समस्या का विवरण)</div>
                    <p class="text-xs text-slate-800 leading-relaxed">${c.description}</p>
                    ${(c.voice_note_url || (attachments.find(a => a.mime_type && a.mime_type.startsWith('audio/')))) ? `
                    <div class="mt-3 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                        <div class="flex items-center space-x-2 text-xs font-bold text-amber-900">
                            <span class="text-base">🎙️</span>
                            <div>
                                <div>Citizen Voice Note (नागरिक की आवाज में विवरण)</div>
                                <div class="text-[10px] font-normal text-amber-700">Listen to the recorded audio note submitted by citizen.</div>
                            </div>
                        </div>
                        <audio controls class="h-8 max-w-full sm:max-w-xs" src="${c.voice_note_url || (attachments.find(a => a.mime_type && a.mime_type.startsWith('audio/')).file_path)}"></audio>
                    </div>
                    ` : ''}
                </div>

                <!-- AI Executive Summary Banner (if present) -->
                ${c.ai_summary ? `
                <div class="mt-4 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 flex items-start space-x-2">
                    <span class="font-bold text-indigo-700 bg-indigo-200/80 px-2 py-0.5 rounded text-[10px] shrink-0">AI Summary</span>
                    <p class="leading-relaxed">${c.ai_summary}</p>
                </div>
                ` : ''}
            </div>

            <!-- Citizen Resolution Confirmation Card (When Resolved) -->
            ${isResolved ? `
            <div class="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 rounded-3xl border-2 border-emerald-300 p-6 sm:p-8 shadow-sm">
                <div class="flex items-start space-x-4">
                    <div class="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shrink-0">
                        ?
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg font-black text-slate-900">Citizen Verification Required</h3>
                        <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                            Authorized field personnel have marked this grievance as <strong>Resolved</strong>.
                            ${c.resolution_notes ? `<span class="block mt-1 p-2 rounded-lg bg-white/80 border border-emerald-200 text-slate-700 italic">"Official Resolution Note: ${c.resolution_notes}"</span>` : ''}
                            Please verify if the problem in your area has genuinely been resolved.
                        </p>

                        <div class="mt-5 flex flex-wrap gap-3">
                            <button onclick="Track.handleConfirmResolution(true)"
                                    class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5">
                                <span>✓ Yes, Issue Resolved (Confirm & Close)</span>
                            </button>
                            <button onclick="Track.openReopenForm()"
                                    class="px-5 py-2.5 rounded-xl bg-white border border-red-300 text-red-700 hover:bg-red-50 font-bold text-xs transition flex items-center space-x-1.5">
                                <span>✗ No, Issue Unresolved (Request Reopen)</span>
                            </button>
                        </div>

                        <!-- Reopen Form (Hidden by default) -->
                        <div id="reopen-form-box" class="hidden mt-4 p-4 rounded-xl bg-white border border-red-200 space-y-3">
                            <label class="block text-xs font-bold text-red-800">Please explain why the issue is still unresolved:</label>
                            <textarea id="reopen-reason-input" rows="2" placeholder="e.g. Garbage was only partially removed; large mound still blocks the corner..."
                                      class="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"></textarea>
                            <div class="flex justify-end space-x-2">
                                <button onclick="document.getElementById('reopen-form-box').classList.add('hidden')" class="px-3 py-1.5 text-xs text-slate-500">Cancel</button>
                                <button onclick="Track.handleConfirmResolution(false)" class="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700">Submit Reopen Request</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Metadata Grid: Location, Staff, Dates -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Location Mini Map -->
                <div class="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
                    <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Reported Site</h4>
                    <div id="track-mini-map" class="h-36 rounded-xl border border-slate-200 mb-2"></div>
                    <div class="text-xs text-slate-700 font-medium">${c.address}</div>
                    ${c.landmark ? `<div class="text-[11px] text-slate-400 mt-0.5">Landmark: ${c.landmark}</div>` : ''}
                </div>

                <!-- Assignment & Timing -->
                <div class="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Administrative Info</h4>
                    <div>
                        <div class="text-[10px] uppercase font-bold text-slate-400">Department</div>
                        <div class="text-xs font-bold text-slate-800">${c.department_name || 'General Municipal'}</div>
                        <div class="text-[10px] text-slate-500">${c.department_contact || ''}</div>
                    </div>
                    <div>
                        <div class="text-[10px] uppercase font-bold text-slate-400">Assigned Field Officer</div>
                        <div class="text-xs font-bold text-slate-800">${c.assigned_staff_name || 'Intake in progress'}</div>
                    </div>
                    <div>
                        <div class="text-[10px] uppercase font-bold text-slate-400">Estimated Target Date</div>
                        <div class="text-xs font-semibold text-blue-700">${c.estimated_resolution_at ? new Date(c.estimated_resolution_at).toLocaleDateString() : 'Pending inspection'}</div>
                    </div>
                </div>

                <!-- Citizen Feedback (if closed) or Evidence Photo Preview -->
                <div class="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Evidence & Photos</h4>
                        ${attachments.filter(a => !a.mime_type || !a.mime_type.startsWith('audio/')).length > 0 ? `
                        <div class="grid grid-cols-2 gap-2">
                            ${attachments.filter(a => !a.mime_type || !a.mime_type.startsWith('audio/')).map(a => `
                                <a href="${a.file_path}" target="_blank" class="block group relative rounded-lg overflow-hidden border border-slate-200">
                                    <img src="${a.file_path}" class="w-full h-20 object-cover group-hover:scale-105 transition" />
                                    <span class="absolute bottom-0 inset-x-0 bg-slate-900/70 text-white text-[9px] px-1 py-0.5 text-center truncate">${a.attachment_type.replace('_', ' ')}</span>
                                </a>
                            `).join('')}
                        </div>
                        ` : `
                        <p class="text-xs text-slate-400 py-6 text-center">No photographs attached.</p>
                        `}
                    </div>

                    ${c.citizen_feedback ? `
                    <div class="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                        <strong>Citizen Review:</strong> "${c.citizen_feedback}"
                        ${c.citizen_rating ? `<span class="text-amber-500 font-bold ml-1">★ ${c.citizen_rating}/5</span>` : ''}
                    </div>
                    ` : ''}
                </div>
            </div>

            <!-- Official Status Change Timeline Log -->
            <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                <h3 class="text-lg font-black text-slate-900 mb-6 flex items-center">
                    <span class="w-2.5 h-2.5 rounded-full bg-blue-600 mr-2"></span>
                    Verified Progress Audit Log
                </h3>

                ${timeline.length === 0 ? `
                <p class="text-xs text-slate-400 text-center py-6">No status updates logged yet.</p>
                ` : `
                <div class="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                    ${timeline.map(upd => `
                        <div class="relative flex items-start space-x-4">
                            <div class="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white z-10 shrink-0">
                                •
                            </div>
                            <div class="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                                <div class="flex items-center justify-between text-xs mb-1">
                                    <span class="font-bold text-slate-900">
                                        Status: <span class="text-blue-700">${upd.new_status}</span>
                                        ${upd.previous_status && upd.previous_status !== 'None' ? `<span class="text-slate-400 font-normal"> (from ${upd.previous_status})</span>` : ''}
                                    </span>
                                    <span class="text-[10px] text-slate-400 font-mono">${new Date(upd.created_at).toLocaleString()}</span>
                                </div>
                                <p class="text-xs text-slate-700 leading-relaxed">${upd.public_message}</p>
                                <div class="mt-2 text-[10px] text-slate-400 font-medium">Recorded by: ${upd.updated_by_name} (${upd.updated_by_role})</div>
                                ${upd.progress_photo_path ? `
                                <div class="mt-3">
                                    <a href="${upd.progress_photo_path}" target="_blank" class="inline-block border border-slate-300 rounded-lg overflow-hidden">
                                        <img src="${upd.progress_photo_path}" class="h-20 rounded" />
                                    </a>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                `}
            </div>
        </div>
        `;

        // Initialize mini-map
        setTimeout(() => {
            if (c.latitude && c.longitude && typeof L !== 'undefined') {
                if (this.miniMapInstance) {
                    this.miniMapInstance.remove();
                    this.miniMapInstance = null;
                }
                this.miniMapInstance = L.map('track-mini-map', { zoomControl: false }).setView([c.latitude, c.longitude], 14);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.miniMapInstance);
                L.marker([c.latitude, c.longitude]).addTo(this.miniMapInstance);
            }
        }, 100);
    },

    openReopenForm() {
        const formBox = document.getElementById('reopen-form-box');
        if (formBox) formBox.classList.remove('hidden');
    },

    async handleConfirmResolution(satisfied) {
        if (!this.currentComplaint) return;
        const cId = this.currentComplaint.complaint.id;
        const reopenReason = satisfied ? '' : (document.getElementById('reopen-reason-input') || {}).value || '';

        try {
            await API.complaints.confirmResolution(cId, {
                satisfied,
                feedback: satisfied ? 'Citizen inspected site and confirmed satisfactory resolution.' : reopenReason,
                rating: satisfied ? 5 : 1,
                reopenReason
            });

            App.showToast(satisfied ? 'Grievance confirmed and closed.' : 'Grievance reopened for supervisor review.', 'success');
            // Refresh
            await this.fetchComplaint(this.currentComplaint.complaint.complaint_number);
        } catch (err) {
            App.showToast(`Action failed: ${err.message}`, 'error');
        }
    }
};

window.Track = Track;
