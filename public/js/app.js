// JanSahayak AI - Main Single Page Application Router & State Manager

const App = {
    currentView: 'home',
    viewParams: {},

    async init() {
        console.log('Initializing JanSahayak AI Application...');

        // Parse initial URL hash or route
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });

        // Check if token exists and fetch user profile
        const token = API.getToken();
        if (token) {
            try {
                const res = await API.auth.getMe();
                if (res.user) {
                    API.setSession(token, res.user);
                }
            } catch (e) {
                console.warn('Session expired or invalid, clearing local session.');
                API.clearSession();
            }
        }

        this.handleRoute();
    },

    handleRoute() {
        const hash = window.location.hash.replace(/^#\/?/, '') || 'home';
        const [route, queryString] = hash.split('?');
        const params = {};

        if (queryString) {
            const urlParams = new URLSearchParams(queryString);
            for (const [key, val] of urlParams.entries()) {
                params[key] = val;
            }
        }

        const validViews = ['home', 'track', 'my-complaints', 'staff-dashboard', 'admin-panel'];
        const view = validViews.includes(route) ? route : 'home';

        this.navigate(view, params, false);
    },

    async navigate(view, params = {}, pushState = true) {
        this.currentView = view;
        this.viewParams = params;

        let hash = `#${view}`;
        const query = new URLSearchParams(params).toString();
        if (query) hash += `?${query}`;

        if (pushState) {
            window.history.pushState(null, '', hash);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        await this.render();
    },

    async render() {
        const root = document.getElementById('app');
        if (!root) return;

        let viewHtml = '';

        if (this.currentView === 'home') {
            viewHtml = await Home.render();
        } else if (this.currentView === 'track') {
            viewHtml = await Track.render(this.viewParams);
        } else if (this.currentView === 'my-complaints') {
            viewHtml = await MyComplaints.render();
        } else if (this.currentView === 'staff-dashboard') {
            viewHtml = await StaffDashboard.render();
        } else if (this.currentView === 'admin-panel') {
            viewHtml = await AdminPanel.render();
        } else {
            viewHtml = await Home.render();
        }

        root.innerHTML = `
            ${Navbar.render()}
            <main class="min-h-[calc(100vh-280px)]">
                ${viewHtml}
            </main>
            ${Footer.render()}
            ${AIChatbot.render()}
        `;

        // Run afterMount lifecycle hooks
        setTimeout(() => {
            if (this.currentView === 'home' && Home.afterMount) {
                Home.afterMount();
            } else if (this.currentView === 'track' && Track.afterMount) {
                Track.afterMount(this.viewParams);
            } else if (this.currentView === 'my-complaints' && MyComplaints.afterMount) {
                MyComplaints.afterMount();
            } else if (this.currentView === 'staff-dashboard' && StaffDashboard.afterMount) {
                StaffDashboard.afterMount();
            } else if (this.currentView === 'admin-panel' && AdminPanel.afterMount) {
                AdminPanel.afterMount();
            }

            // Refresh notification badges if logged in
            if (API.getCurrentUser()) {
                Navbar.refreshNotifications();
            }
        }, 50);
    },

    openReportModal(initialData = {}) {
        ReportModal.open(initialData);
    },

    openModal(type) {
        Modals.open(type);
    },

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const id = `toast-${Date.now()}`;
        const toast = document.createElement('div');
        toast.id = id;

        const colors = {
            success: 'bg-emerald-600 text-white',
            error: 'bg-red-600 text-white',
            warning: 'bg-amber-600 text-white',
            info: 'bg-slate-900 text-white'
        };

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.className = `flex items-center space-x-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold ${colors[type] || colors.info} transform transition-all duration-300 translate-y-2 opacity-0`;
        toast.innerHTML = `
            <span class="text-sm font-bold">${icons[type] || ''}</span>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove('translate-y-2', 'opacity-0');
        }, 10);

        setTimeout(() => {
            toast.classList.add('translate-y-2', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
};

window.App = App;

// Bootstrap on DOM load or immediately if document is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });
} else {
    App.init();
}
