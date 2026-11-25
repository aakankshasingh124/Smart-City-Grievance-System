// Navbar Component
const Navbar = {
    render() {
        const user = API.getCurrentUser();
        const isStaff = user && (user.role === 'staff' || user.role === 'admin');
        const isAdmin = user && user.role === 'admin';
        const currentView = (typeof App !== 'undefined' && App.currentView) ? App.currentView : 'home';

        return `
        <div class="tiranga-top-bar"></div>
        <header class="sticky top-0 z-40 nav-glass shadow-xs">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <!-- Brand Logo with Indian Ashoka Chakra & Jan Emblem -->
                    <div class="flex items-center space-x-3 cursor-pointer" onclick="App.navigate('home')">
                        <div class="relative w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-md emblem-ring p-0.5 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" class="w-full h-full">
                                <circle cx="64" cy="64" r="62" fill="#FFFFFF" stroke="#FFB300" stroke-width="4"/>
                                <path d="M64,6 A58,58 0 0,1 120,48 L94,54 A32,32 0 0,0 64,32 Z M64,6 A58,58 0 0,0 8,48 L34,54 A32,32 0 0,1 64,32 Z" fill="#FF9933"/>
                                <path d="M64,122 A58,58 0 0,1 8,80 L34,74 A32,32 0 0,0 64,96 Z M64,122 A58,58 0 0,0 120,80 L94,74 A32,32 0 0,1 64,96 Z" fill="#138808"/>
                                <circle cx="64" cy="64" r="32" fill="#061c47" stroke="#FFE082" stroke-width="2"/>
                                <g stroke="#38bdf8" stroke-width="1.4">
                                    <line x1="64" y1="36" x2="64" y2="92"/>
                                    <line x1="64" y1="36" x2="64" y2="92" transform="rotate(15 64 64)"/>
                                    <line x1="64" y1="36" x2="64" y2="92" transform="rotate(30 64 64)"/>
                                    <line x1="64" y1="36" x2="64" y2="92" transform="rotate(45 64 64)"/>
                                    <line x1="64" y1="36" x2="64" y2="92" transform="rotate(60 64 64)"/>
                                    <line x1="64" y1="36" x2="64" y2="92" transform="rotate(75 64 64)"/>
                                    <line x1="64" y1="36" x2="64" y2="92" transform="rotate(90 64 64)"/>
                                    <line x1="64" y1="36" x2="64" y2="92" transform="rotate(105 64 64)"/>
                                    <line x1="64" y1="36" x2="64" y2="92" transform="rotate(120 64 64)"/>
                                    <line x1="64" y1="36" x2="64" y2="92" transform="rotate(135 64 64)"/>
                                    <line x1="64" y1="36" x2="64" y2="92" transform="rotate(150 64 64)"/>
                                    <line x1="64" y1="36" x2="64" y2="92" transform="rotate(165 64 64)"/>
                                </g>
                                <circle cx="64" cy="64" r="18" fill="#04122d" stroke="#FFB300" stroke-width="1.5"/>
                                <text x="64" y="73" font-family="'Noto Sans Devanagari', sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle">जन</text>
                            </svg>
                        </div>
                        <div>
                            <div class="flex items-center space-x-1.5">
                                <span class="font-extrabold text-xl tracking-tight text-slate-900 font-devanagari">जनसहायक</span>
                                <span class="font-bold text-lg tracking-tight text-blue-900">AI</span>
                                <span class="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200">भारत</span>
                            </div>
                            <p class="text-[10px] text-slate-500 font-semibold tracking-wide">नागरिक समाधान मंच • National Civic Redressal</p>
                        </div>
                    </div>

                    <!-- Desktop Nav Links -->
                    <nav class="hidden md:flex items-center space-x-1 font-medium text-sm text-slate-700">
                        <button onclick="App.navigate('home')" class="px-3 py-2 rounded-xl hover:text-orange-700 hover:bg-orange-50/70 transition ${currentView === 'home' ? 'text-orange-700 font-bold bg-orange-50 border border-orange-200/60' : ''}">
                            Home / मुख्य पृष्ठ
                        </button>
                        <button onclick="App.openReportModal()" class="px-3.5 py-2 rounded-xl text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-700 hover:to-amber-700 font-bold shadow-xs hover:shadow transition flex items-center space-x-1.5">
                            <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            <span>शिकायत दर्ज करें</span>
                        </button>
                        <button onclick="App.navigate('track')" class="px-3 py-2 rounded-xl hover:text-blue-700 hover:bg-blue-50/70 transition ${currentView === 'track' ? 'text-blue-800 font-bold bg-blue-50 border border-blue-200/60' : ''}">
                            Track Complaint
                        </button>
                        ${user ? `
                        <button onclick="App.navigate('my-complaints')" class="px-3 py-2 rounded-lg hover:text-blue-700 hover:bg-slate-100 transition ${currentView === 'my-complaints' ? 'text-blue-700 font-semibold bg-blue-50' : ''}">
                            My Complaints
                        </button>
                        ` : ''}
                        ${isStaff ? `
                        <button onclick="App.navigate('staff-dashboard')" class="px-3 py-2 rounded-lg text-indigo-700 hover:bg-indigo-50 font-semibold transition ${currentView === 'staff-dashboard' ? 'bg-indigo-100' : ''}">
                            Staff Portal
                        </button>
                        ` : ''}
                        ${isAdmin ? `
                        <button onclick="App.navigate('admin-panel')" class="px-3 py-2 rounded-lg text-purple-700 hover:bg-purple-50 font-semibold transition ${currentView === 'admin-panel' ? 'bg-purple-100' : ''}">
                            Admin
                        </button>
                        ` : ''}
                        <button onclick="App.openModal('about')" class="px-3 py-2 rounded-lg hover:text-blue-700 hover:bg-slate-100 transition">
                            About Us
                        </button>
                        <button onclick="App.openModal('contact')" class="px-3 py-2 rounded-lg hover:text-blue-700 hover:bg-slate-100 transition">
                            Contact
                        </button>
                    </nav>

                    <!-- Right Action Controls (Auth, Notifications, Staff Switcher) -->
                    <div class="flex items-center space-x-2.5">
                        ${user ? `
                        <!-- Notification Bell -->
                        <div class="relative">
                            <button id="notif-bell-btn" onclick="Navbar.toggleNotifications()" class="relative p-2 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-slate-100 transition" title="Notifications">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span id="notif-badge" class="hidden absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">0</span>
                            </button>
                            <!-- Notifications Dropdown -->
                            <div id="notif-dropdown" class="hidden absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                                <div class="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                    <span class="font-semibold text-sm text-slate-800">Notifications</span>
                                    <button onclick="Navbar.markAllRead()" class="text-xs text-blue-600 hover:underline">Mark all read</button>
                                </div>
                                <div id="notif-list" class="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs text-slate-600 p-2">
                                    <p class="text-center py-4 text-slate-400">Loading notifications...</p>
                                </div>
                            </div>
                        </div>

                        <!-- User Profile Pill -->
                        <div class="flex items-center space-x-2 pl-2 border-l border-slate-200">
                            <div class="text-right hidden sm:block">
                                <div class="text-xs font-bold text-slate-900">${user.name.split(' ')[0]}</div>
                                <div class="text-[10px] uppercase font-semibold tracking-wider ${user.role === 'admin' ? 'text-purple-600' : user.role === 'staff' ? 'text-indigo-600' : 'text-emerald-600'}">${user.role}</div>
                            </div>
                            <button onclick="Navbar.handleLogout()" class="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition" title="Log out">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                        ` : `
                        <!-- Citizen Login -->
                        <button onclick="App.openModal('citizen-login')" class="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition">
                            Citizen Login
                        </button>
                        <!-- Staff Login -->
                        <button onclick="App.openModal('staff-login')" class="px-3.5 py-1.5 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs">
                            Staff Portal
                        </button>
                        `}

                        <!-- Mobile Hamburger Button -->
                        <button onclick="Navbar.toggleMobileMenu()" class="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Mobile Menu Drawer -->
                <div id="mobile-menu" class="hidden md:hidden py-3 border-t border-slate-200 space-y-1">
                    <button onclick="App.navigate('home')" class="block w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100 font-medium">Home</button>
                    <button onclick="App.openReportModal()" class="block w-full text-left px-3 py-2 rounded-lg text-sm text-emerald-700 hover:bg-emerald-50 font-bold">Report an Issue</button>
                    <button onclick="App.navigate('track')" class="block w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100 font-medium">Track Complaint</button>
                    ${user ? `
                    <button onclick="App.navigate('my-complaints')" class="block w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100 font-medium">My Complaints</button>
                    ` : ''}
                    ${isStaff ? `
                    <button onclick="App.navigate('staff-dashboard')" class="block w-full text-left px-3 py-2 rounded-lg text-sm text-indigo-700 hover:bg-indigo-50 font-bold">Staff Portal</button>
                    ` : ''}
                    ${isAdmin ? `
                    <button onclick="App.navigate('admin-panel')" class="block w-full text-left px-3 py-2 rounded-lg text-sm text-purple-700 hover:bg-purple-50 font-bold">Administrator Panel</button>
                    ` : ''}
                    <button onclick="App.openModal('about')" class="block w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100">About Us</button>
                    <button onclick="App.openModal('contact')" class="block w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100">Contact</button>
                </div>
            </div>
        </header>
        `;
    },

    toggleMobileMenu() {
        const el = document.getElementById('mobile-menu');
        if (el) el.classList.toggle('hidden');
    },

    async toggleNotifications() {
        const dropdown = document.getElementById('notif-dropdown');
        if (!dropdown) return;
        dropdown.classList.toggle('hidden');

        if (!dropdown.classList.contains('hidden')) {
            await this.refreshNotifications();
        }
    },

    async refreshNotifications() {
        try {
            const data = await API.notifications.getAll();
            const badge = document.getElementById('notif-badge');
            const list = document.getElementById('notif-list');

            if (badge) {
                if (data.unreadCount > 0) {
                    badge.textContent = data.unreadCount > 9 ? '9+' : data.unreadCount;
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }

            if (list) {
                if (!data.notifications || data.notifications.length === 0) {
                    list.innerHTML = `<p class="text-center py-4 text-slate-400">No notifications yet.</p>`;
                    return;
                }

                list.innerHTML = data.notifications.map(n => `
                    <div class="p-2.5 rounded-lg hover:bg-slate-50 transition cursor-pointer ${n.is_read ? 'opacity-70' : 'bg-blue-50/50'}"
                         onclick="Navbar.handleNotificationClick('${n.id}', '${n.complaint_number || ''}')">
                        <div class="font-semibold text-slate-800">${n.title}</div>
                        <div class="text-slate-600 mt-0.5">${n.message}</div>
                        <div class="text-[10px] text-slate-400 mt-1">${new Date(n.created_at).toLocaleString()}</div>
                    </div>
                `).join('');
            }
        } catch (e) {
            console.error('Failed to load notifications:', e);
        }
    },

    async handleNotificationClick(id, complaintNumber) {
        await API.notifications.markAsRead(id);
        const dropdown = document.getElementById('notif-dropdown');
        if (dropdown) dropdown.classList.add('hidden');
        this.refreshNotifications();

        if (complaintNumber) {
            App.navigate('track', { complaintNumber });
        }
    },

    async markAllRead() {
        await API.notifications.markAllRead();
        this.refreshNotifications();
    },

    handleLogout() {
        API.auth.logout();
        App.showToast('You have logged out successfully.', 'info');
        App.render();
    }
};

window.Navbar = Navbar;
