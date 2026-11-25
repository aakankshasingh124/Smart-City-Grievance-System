// Citizen My Complaints Dashboard
const MyComplaints = {
    complaintsList: [],

    async render() {
        const user = API.getCurrentUser();
        if (!user) {
            return `
            <div class="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-xs">
                <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl mx-auto mb-3">🔒</div>
                <h2 class="text-xl font-bold text-slate-900">Sign In Required</h2>
                <p class="text-xs text-slate-600 mt-2">Log in with your citizen account to inspect all your submitted grievances, receive real-time updates, and manage your tickets.</p>
                <div class="mt-6 flex justify-center space-x-3">
                    <button onclick="App.openModal('citizen-login')" class="px-5 py-2.5 rounded-xl bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 transition">Log In</button>
                    <button onclick="App.openModal('citizen-register')" class="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition">Register</button>
                </div>
            </div>
            `;
        }

        return `
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 mb-8 gap-4">
                <div>
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">My Registered Grievances</h1>
                    <p class="text-xs text-slate-500 mt-1">Logged in as <strong>${user.name}</strong> (${user.email})</p>
                </div>
                <button onclick="App.openReportModal()" class="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition flex items-center space-x-1.5">
                    <span>+ Report New Issue</span>
                </button>
            </div>

            <!-- Complaints List Container -->
            <div id="my-complaints-container">
                <div class="text-center py-12 text-slate-400 text-xs">Loading your complaints...</div>
            </div>
        </div>
        `;
    },

    async afterMount() {
        const user = API.getCurrentUser();
        if (!user) return;

        try {
            const data = await API.complaints.getMy();
            this.complaintsList = data.complaints || [];
            this.renderList();
        } catch (err) {
            console.error('Failed to load my complaints:', err);
        }
    },

    renderList() {
        const container = document.getElementById('my-complaints-container');
        if (!container) return;

        if (this.complaintsList.length === 0) {
            container.innerHTML = `
                <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
                    <div class="text-4xl mb-3">🌱</div>
                    <h3 class="text-lg font-bold text-slate-900">No Complaints Submitted Yet</h3>
                    <p class="text-xs text-slate-500 mt-1 mb-6">You have not submitted any civic complaints with this account.</p>
                    <button onclick="App.openReportModal()" class="px-6 py-2.5 rounded-xl bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 transition">
                        File Your First Complaint
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${this.complaintsList.map(c => `
                    <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-mono text-xs font-bold text-blue-700">${c.complaint_number}</span>
                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    c.current_status === 'Resolved' || c.current_status === 'Closed' ? 'bg-emerald-100 text-emerald-800' :
                                    c.current_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                    c.current_status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                                    'bg-blue-100 text-blue-800'
                                }">
                                    ${c.current_status}
                                </span>
                                ${c.voice_note_url ? `
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center space-x-1" title="Voice note attached">
                                    <span>🎙️</span>
                                    <span>Voice Note</span>
                                </span>
                                ` : ''}
                            </div>
                            <h3 class="font-bold text-slate-900 text-sm mb-1 line-clamp-1">${c.title}</h3>
                            <p class="text-xs text-slate-500 line-clamp-2 mb-3">${c.description}</p>
                            <div class="text-[11px] text-slate-400 mb-4 flex items-center justify-between">
                                <span>📍 ${c.address.slice(0, 35)}...</span>
                                <span>${new Date(c.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">${c.category}</span>
                            <button onclick="App.navigate('track', { complaintNumber: '${c.complaint_number}' })"
                                    class="text-xs font-bold text-blue-700 hover:underline">
                                View Status & Timeline →
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

window.MyComplaints = MyComplaints;
