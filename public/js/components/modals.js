// System Modals: Auth, About, Contact, Privacy, Terms
const Modals = {
    open(type) {
        const container = document.getElementById('modal-container');
        if (!container) return;

        if (type === 'citizen-login') {
            this.renderCitizenAuth(container, 'login');
        } else if (type === 'citizen-register') {
            this.renderCitizenAuth(container, 'register');
        } else if (type === 'staff-login') {
            this.renderStaffLogin(container);
        } else if (type === 'about') {
            this.renderAbout(container);
        } else if (type === 'contact') {
            this.renderContact(container);
        } else if (type === 'privacy') {
            this.renderPrivacy(container);
        } else if (type === 'terms') {
            this.renderTerms(container);
        }
    },

    close() {
        const container = document.getElementById('modal-container');
        if (container) container.innerHTML = '';
    },

    renderCitizenAuth(container, initialTab = 'login') {
        container.innerHTML = `
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div class="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8">
                <div class="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div class="flex space-x-4">
                        <button id="auth-tab-login" onclick="Modals.switchAuthTab('login')" class="font-extrabold text-base pb-1 border-b-2 ${initialTab === 'login' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-400'}">
                            Citizen Sign In
                        </button>
                        <button id="auth-tab-register" onclick="Modals.switchAuthTab('register')" class="font-extrabold text-base pb-1 border-b-2 ${initialTab === 'register' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-400'}">
                            New Registration
                        </button>
                    </div>
                    <button onclick="Modals.close()" class="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <!-- 1-Click Demo Credentials Chip -->
                <div class="my-4 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex items-center justify-between">
                    <div>
                        <span class="font-bold text-blue-900 block">Demo Citizen Account</span>
                        <span class="text-[11px] text-blue-700">citizen@example.com</span>
                    </div>
                    <button onclick="Modals.fillDemoCitizen()" class="px-2.5 py-1 rounded-lg bg-blue-700 text-white font-bold text-[10px] hover:bg-blue-800">
                        Autofill
                    </button>
                </div>

                <!-- Sign In Form -->
                <form id="auth-form-login" onsubmit="Modals.handleCitizenLogin(event)" class="${initialTab === 'login' ? '' : 'hidden'} space-y-4 text-xs">
                    <div>
                        <label class="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Email Address</label>
                        <input id="cit-login-email" type="email" required placeholder="name@example.com" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300" />
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Password</label>
                        <input id="cit-login-password" type="password" required placeholder="••••••••" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300" />
                    </div>
                    <button type="submit" class="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-xs transition">
                        Sign In as Citizen
                    </button>
                </form>

                <!-- Registration Form -->
                <form id="auth-form-register" onsubmit="Modals.handleCitizenRegister(event)" class="${initialTab === 'register' ? '' : 'hidden'} space-y-4 text-xs">
                    <div>
                        <label class="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Full Name *</label>
                        <input id="cit-reg-name" type="text" required placeholder="Ananya Sharma" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300" />
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Email Address *</label>
                        <input id="cit-reg-email" type="email" required placeholder="ananya@example.com" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300" />
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Mobile Contact</label>
                        <input id="cit-reg-phone" type="text" placeholder="+91 98765 43210" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300" />
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Password *</label>
                        <input id="cit-reg-password" type="password" required minlength="6" placeholder="At least 6 characters" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300" />
                    </div>
                    <button type="submit" class="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-xs transition">
                        Create Citizen Account
                    </button>
                </form>
            </div>
        </div>
        `;
    },

    switchAuthTab(tab) {
        const loginForm = document.getElementById('auth-form-login');
        const regForm = document.getElementById('auth-form-register');
        const loginTab = document.getElementById('auth-tab-login');
        const regTab = document.getElementById('auth-tab-register');

        if (tab === 'login') {
            if (loginForm) loginForm.classList.remove('hidden');
            if (regForm) regForm.classList.add('hidden');
            if (loginTab) loginTab.className = 'font-extrabold text-base pb-1 border-b-2 border-blue-700 text-blue-700';
            if (regTab) regTab.className = 'font-extrabold text-base pb-1 border-b-2 border-transparent text-slate-400';
        } else {
            if (loginForm) loginForm.classList.add('hidden');
            if (regForm) regForm.classList.remove('hidden');
            if (loginTab) loginTab.className = 'font-extrabold text-base pb-1 border-b-2 border-transparent text-slate-400';
            if (regTab) regTab.className = 'font-extrabold text-base pb-1 border-b-2 border-blue-700 text-blue-700';
        }
    },

    fillDemoCitizen() {
        const email = document.getElementById('cit-login-email');
        const pass = document.getElementById('cit-login-password');
        if (email && pass) {
            email.value = 'citizen@example.com';
            pass.value = 'Citizen@123';
        }
    },

    async handleCitizenLogin(e) {
        e.preventDefault();
        const email = document.getElementById('cit-login-email').value.trim();
        const pass = document.getElementById('cit-login-password').value;

        try {
            await API.auth.login(email, pass, 'citizen');
            App.showToast('Signed in successfully!', 'success');
            Modals.close();
            App.render();
        } catch (err) {
            App.showToast(`Login failed: ${err.message}`, 'error');
        }
    },

    async handleCitizenRegister(e) {
        e.preventDefault();
        const name = document.getElementById('cit-reg-name').value.trim();
        const email = document.getElementById('cit-reg-email').value.trim();
        const phone = document.getElementById('cit-reg-phone').value.trim();
        const pass = document.getElementById('cit-reg-password').value;

        try {
            await API.auth.register({ name, email, phone, password: pass });
            App.showToast('Registration successful! Welcome to JanSahayak.', 'success');
            Modals.close();
            App.render();
        } catch (err) {
            App.showToast(`Registration failed: ${err.message}`, 'error');
        }
    },

    renderStaffLogin(container) {
        container.innerHTML = `
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div class="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8">
                <div class="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">Authorized Personnel</span>
                        <h3 class="font-extrabold text-slate-900 text-lg mt-1">Staff & Officer Portal</h3>
                    </div>
                    <button onclick="Modals.close()" class="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <!-- Quick Test Role Presets Selector -->
                <div class="my-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <span class="font-bold text-slate-800 block mb-1.5">⚡ Quick Switch Demo Credentials:</span>
                    <div class="grid grid-cols-2 gap-1.5 font-semibold text-[10px]">
                        <button onclick="Modals.fillStaffRole('admin@jansahayak.gov.in', 'Admin@123')" class="p-1.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-left hover:bg-purple-100">
                            👑 Administrator
                        </button>
                        <button onclick="Modals.fillStaffRole('waste.officer@jansahayak.gov.in', 'Staff@123')" class="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-left hover:bg-emerald-100">
                            🗑️ Sanitation Officer
                        </button>
                        <button onclick="Modals.fillStaffRole('traffic.officer@jansahayak.gov.in', 'Staff@123')" class="p-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-left hover:bg-amber-100">
                            🚦 Traffic Inspector
                        </button>
                        <button onclick="Modals.fillStaffRole('energy.officer@jansahayak.gov.in', 'Staff@123')" class="p-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-left hover:bg-blue-100">
                            ⚡ Power Engineer
                        </button>
                    </div>
                </div>

                <form onsubmit="Modals.handleStaffLogin(event)" class="space-y-4 text-xs">
                    <div>
                        <label class="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Officer Email *</label>
                        <input id="staff-login-email" type="email" required placeholder="officer@jansahayak.gov.in" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono" />
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Password *</label>
                        <input id="staff-login-password" type="password" required placeholder="••••••••" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono" />
                    </div>
                    <button type="submit" class="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition">
                        Authenticate & Open Operations Portal
                    </button>
                </form>
            </div>
        </div>
        `;
    },

    fillStaffRole(email, password) {
        const elEmail = document.getElementById('staff-login-email');
        const elPass = document.getElementById('staff-login-password');
        if (elEmail && elPass) {
            elEmail.value = email;
            elPass.value = password;
        }
    },

    async handleStaffLogin(e) {
        e.preventDefault();
        const email = document.getElementById('staff-login-email').value.trim();
        const pass = document.getElementById('staff-login-password').value;

        try {
            const data = await API.auth.login(email, pass, 'staff');
            App.showToast(`Welcome back, ${data.user.name}.`, 'success');
            Modals.close();
            if (data.user.role === 'admin') {
                App.navigate('admin-panel');
            } else {
                App.navigate('staff-dashboard');
            }
        } catch (err) {
            App.showToast(`Authentication failed: ${err.message}`, 'error');
        }
    },

    renderAbout(container) {
        container.innerHTML = `
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div class="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs text-slate-600 leading-relaxed max-h-[85vh] overflow-y-auto">
                <div class="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 class="font-extrabold text-slate-900 text-lg">About JanSahayak AI (जनसहायक AI)</h3>
                    <button onclick="Modals.close()" class="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <p>
                    <strong>JanSahayak AI</strong> is an advanced, AI-powered public grievance redressal and tracking infrastructure built to revolutionize how Indian citizens report civic challenges to municipal corporations, road authorities, electricity boards, and water sanitation departments.
                </p>
                <div class="grid grid-cols-2 gap-3 my-3">
                    <div class="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-medium">
                        🤖 <strong>Intelligent Routing:</strong> Natural language processing categorizes grievances, assesses public safety urgency, and isolates duplicates within seconds.
                    </div>
                    <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
                        🛡️ <strong>Citizen Verification:</strong> A grievance is not permanently closed until the reporting citizen confirms that the repair was carried out on-site.
                    </div>
                </div>
                <p>
                    Built with modern, open civic standards, JanSahayak ensures transparency, eliminates administrative bottlenecks, and empowers citizens to co-create cleaner, safer cities.
                </p>
            </div>
        </div>
        `;
    },

    renderContact(container) {
        container.innerHTML = `
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div class="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs text-slate-600 max-h-[85vh] overflow-y-auto">
                <div class="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 class="font-extrabold text-slate-900 text-lg">Civic Helplines & Support</h3>
                    <button onclick="Modals.close()" class="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <p>For civic inquiries, portal technical support, or departmental contact:</p>
                <div class="space-y-2 font-mono text-xs">
                    <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                        <span class="font-bold text-slate-900">National Emergency:</span>
                        <span class="text-blue-700 font-bold">112</span>
                    </div>
                    <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                        <span class="font-bold text-slate-900">Municipal Solid Waste:</span>
                        <span class="text-emerald-700 font-bold">1800-11-2299</span>
                    </div>
                    <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                        <span class="font-bold text-slate-900">Traffic Police Control:</span>
                        <span class="text-amber-700 font-bold">1095</span>
                    </div>
                    <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                        <span class="font-bold text-slate-900">Power Outage Helpline:</span>
                        <span class="text-purple-700 font-bold">1912</span>
                    </div>
                    <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                        <span class="font-bold text-slate-900">Jal Seva Water Board:</span>
                        <span class="text-blue-700 font-bold">1916</span>
                    </div>
                </div>
                <p class="text-[11px] text-slate-400 mt-2">
                    Email Helpdesk: <strong>support@jansahayak.gov.in</strong>
                </p>
            </div>
        </div>
        `;
    },

    renderPrivacy(container) {
        container.innerHTML = `
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div class="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs text-slate-600 leading-relaxed max-h-[85vh] overflow-y-auto">
                <div class="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 class="font-extrabold text-slate-900 text-lg">Civic Privacy & Data Governance Notice</h3>
                    <button onclick="Modals.close()" class="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <h4 class="font-bold text-slate-900 text-sm">1. Location Data & Consent</h4>
                <p>
                    JanSahayak AI accesses browser geographic coordinates solely with explicit citizen permission during complaint filing. Location data is collected strictly to dispatch municipal field crews and identify localized clusters. We never perform continuous background tracking.
                </p>
                <h4 class="font-bold text-slate-900 text-sm">2. Public Map Privacy Protections</h4>
                <p>
                    Precise home street addresses and telephone numbers are NEVER published on the public statistics heatmap. Public dashboard markers are rounded to approximate coordinates (~100m) to protect citizen residential privacy.
                </p>
                <h4 class="font-bold text-slate-900 text-sm">3. Photographs and Evidence</h4>
                <p>
                    Uploaded photographs are validated for authentic image headers and inspected by field teams. Complainants are advised not to photograph private interior spaces or unrelated bystanders.
                </p>
                <h4 class="font-bold text-slate-900 text-sm">4. Internal Staff Notes</h4>
                <p>
                    Confidential internal administrative communications and contractor instructions remain sealed within authorized staff workspaces and are never exposed on public tracking pages.
                </p>
            </div>
        </div>
        `;
    },

    renderTerms(container) {
        container.innerHTML = `
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div class="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs text-slate-600 leading-relaxed max-h-[85vh] overflow-y-auto">
                <div class="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 class="font-extrabold text-slate-900 text-lg">Citizen Service Charter & Terms of Use</h3>
                    <button onclick="Modals.close()" class="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <h4 class="font-bold text-slate-900 text-sm">1. Citizen Rights & Service Level Commitments</h4>
                <p>
                    Every verified citizen grievance filed on JanSahayak AI receives a unique, timestamped reference ID within 2 seconds of receipt. Critical public hazards (exposed live cables, major intersection signal failure) receive immediate intake acknowledgment.
                </p>
                <h4 class="font-bold text-slate-900 text-sm">2. Factual Integrity & Neutral Redressal</h4>
                <p>
                    Allegations against public servants or private individuals are handled under neutral inquiry protocols and restricted to authorized vigilance review. Frivolous or abusive submissions may be disallowed with mandatory written justification.
                </p>
                <h4 class="font-bold text-slate-900 text-sm">3. Two-Way Transparency</h4>
                <p>
                    Municipal authorities commit to providing public progress updates and photographic evidence upon completing remediation. Citizens retain the right to reopen tickets if the on-site problem persists.
                </p>
            </div>
        </div>
        `;
    }
};

window.Modals = Modals;
