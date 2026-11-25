// JanSahayak AI - API Client Library

const API = {
    TOKEN_KEY: 'jansahayak_auth_token',
    USER_KEY: 'jansahayak_auth_user',

    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },

    setSession(token, user) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    },

    clearSession() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    },

    getCurrentUser() {
        const u = localStorage.getItem(this.USER_KEY);
        try {
            return u ? JSON.parse(u) : null;
        } catch (e) {
            return null;
        }
    },

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const res = await fetch(endpoint, config);
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                const errorMsg = data.error || `Request failed with status ${res.status}`;
                throw new Error(errorMsg);
            }

            return data;
        } catch (err) {
            console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err);
            throw err;
        }
    },

    // Auth Endpoints
    auth: {
        async register(userData) {
            const res = await API.request('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            if (res.token && res.user) {
                API.setSession(res.token, res.user);
            }
            return res;
        },

        async login(email, password, portal = 'citizen') {
            const res = await API.request('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password, portal })
            });
            if (res.token && res.user) {
                API.setSession(res.token, res.user);
            }
            return res;
        },

        async getMe() {
            return await API.request('/api/auth/me');
        },

        logout() {
            API.clearSession();
        }
    },

    // Complaints Endpoints
    complaints: {
        async preCheck(data) {
            return await API.request('/api/complaints/pre-check', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        async submit(complaintData) {
            return await API.request('/api/complaints', {
                method: 'POST',
                body: JSON.stringify(complaintData)
            });
        },

        async track(identifier) {
            return await API.request(`/api/complaints/track/${encodeURIComponent(identifier)}`);
        },

        async getMy() {
            return await API.request('/api/complaints/my');
        },

        async getStaff(filters = {}) {
            const params = new URLSearchParams(filters);
            return await API.request(`/api/complaints/staff?${params.toString()}`);
        },

        async getById(id) {
            return await API.request(`/api/complaints/${id}`);
        },

        async updateStatus(id, updateData) {
            return await API.request(`/api/complaints/${id}/update-status`, {
                method: 'POST',
                body: JSON.stringify(updateData)
            });
        },

        async confirmResolution(id, feedbackData) {
            return await API.request(`/api/complaints/${id}/confirm-resolution`, {
                method: 'POST',
                body: JSON.stringify(feedbackData)
            });
        }
    },

    // Public Stats
    stats: {
        async getPublic(includeDemo = true) {
            return await API.request(`/api/stats/public?includeDemo=${includeDemo}`);
        }
    },

    // Notifications
    notifications: {
        async getAll() {
            return await API.request('/api/notifications');
        },

        async markAsRead(notificationId) {
            return await API.request('/api/notifications/read', {
                method: 'POST',
                body: JSON.stringify({ notificationId })
            });
        },

        async markAllAsRead() {
            return await API.request('/api/notifications/read', {
                method: 'POST',
                body: JSON.stringify({ markAll: true })
            });
        }
    },

    // Admin Endpoints
    admin: {
        async getOverview() {
            return await API.request('/api/admin/overview');
        },

        async getUsers() {
            return await API.request('/api/admin/users');
        },

        async createStaff(staffData) {
            return await API.request('/api/admin/staff', {
                method: 'POST',
                body: JSON.stringify(staffData)
            });
        },

        async getDepartments() {
            return await API.request('/api/admin/departments');
        },

        async getAuditLogs(limit = 50, offset = 0, type = null) {
            let url = `/api/admin/audit-logs?limit=${limit}&offset=${offset}`;
            if (type) url += `&type=${encodeURIComponent(type)}`;
            return await API.request(url);
        },

        async allotTask(allotData) {
            return await API.request('/api/admin/allot-task', {
                method: 'POST',
                body: JSON.stringify(allotData)
            });
        },

        async getStaffWorkload() {
            return await API.request('/api/admin/staff-workload');
        }
    },

    // AI Assistant
    ai: {
        async chat(message, conversationHistory = []) {
            return await API.request('/api/ai/chat', {
                method: 'POST',
                body: JSON.stringify({ message, conversationHistory })
            });
        },

        async analyze(title, description) {
            return await API.request('/api/ai/analyze', {
                method: 'POST',
                body: JSON.stringify({ title, description })
            });
        }
    }
};

window.API = API;
