// Floating AI Chat Assistant ("Sahayak AI")
const AIChatbot = {
    isOpen: false,
    history: [],

    render() {
        return `
        <!-- Floating Trigger Button -->
        <div id="ai-chat-trigger" class="fixed bottom-6 right-6 z-50">
            <button onclick="AIChatbot.toggle()" class="flex items-center space-x-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white font-bold text-xs shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:scale-105 transition transform">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Sahayak AI • सहायक</span>
                <span class="text-base">🤖</span>
            </button>
        </div>

        <!-- Chat Modal / Drawer -->
        <div id="ai-chat-drawer" class="hidden fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[540px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col chat-window">
            <!-- Header -->
            <div class="px-5 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shadow-xs">
                <div class="flex items-center space-x-2.5">
                    <div class="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-base">
                        🤖
                    </div>
                    <div>
                        <div class="font-extrabold text-sm tracking-tight flex items-center space-x-1.5">
                            <span>Sahayak AI</span>
                            <span class="text-[9px] bg-emerald-400 text-slate-900 font-bold px-1.5 py-0.2 rounded-full uppercase">Verified</span>
                        </div>
                        <div class="text-[10px] text-blue-100 font-medium">JanSahayak Civic Redressal Companion</div>
                    </div>
                </div>
                <button onclick="AIChatbot.toggle()" class="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition">
                    ✕
                </button>
            </div>

            <!-- Messages Stream Area -->
            <div id="ai-messages-list" class="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
                <!-- Initial Welcome Message -->
                <div class="flex items-start space-x-2.5">
                    <div class="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        🤖
                    </div>
                    <div class="bg-slate-100 text-slate-800 p-3.5 rounded-2xl rounded-tl-none border border-slate-200/80 leading-relaxed">
                        <p class="font-bold text-slate-900 mb-1">Namaste! 🙏</p>
                        <p>I am <strong>Sahayak AI</strong>. <strong>How can I help you to use me?</strong> I can look up live grievance tickets, guide you through problem reporting, explain municipal categories, or share emergency civic numbers.</p>
                        <div class="mt-3 flex flex-wrap gap-1.5">
                            <button onclick="AIChatbot.sendPreset('Track complaint JS-2026-000101')" class="px-2 py-1 rounded-md bg-white border border-slate-300 text-[10px] font-semibold text-blue-700 hover:bg-blue-50">
                                🔍 Track JS-2026-000101
                            </button>
                            <button onclick="AIChatbot.sendPreset('How do I report an issue?')" class="px-2 py-1 rounded-md bg-white border border-slate-300 text-[10px] font-semibold text-blue-700 hover:bg-blue-50">
                                📋 How to report
                            </button>
                            <button onclick="AIChatbot.sendPreset('Civic Emergency Helplines')" class="px-2 py-1 rounded-md bg-white border border-slate-300 text-[10px] font-semibold text-red-700 hover:bg-red-50">
                                🚨 Emergencies
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Input Box -->
            <div class="p-3 bg-slate-50 border-t border-slate-200">
                <form onsubmit="AIChatbot.handleSubmit(event)" class="flex items-center space-x-2">
                    <input id="ai-chat-input" type="text" placeholder="How can I help you to use me?..."
                           class="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-blue-500 shadow-2xs" />
                    <button type="submit" class="p-2.5 rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition shadow-xs">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </button>
                </form>
            </div>
        </div>
        `;
    },

    toggle() {
        this.isOpen = !this.isOpen;
        const drawer = document.getElementById('ai-chat-drawer');
        const trigger = document.getElementById('ai-chat-trigger');
        if (drawer && trigger) {
            if (this.isOpen) {
                drawer.classList.remove('hidden');
                trigger.classList.add('hidden');
                setTimeout(() => {
                    const input = document.getElementById('ai-chat-input');
                    if (input) input.focus();
                }, 100);
            } else {
                drawer.classList.add('hidden');
                trigger.classList.remove('hidden');
            }
        }
    },

    sendPreset(text) {
        const input = document.getElementById('ai-chat-input');
        if (input) {
            input.value = text;
            this.handleSubmit(new Event('submit'));
        }
    },

    async handleSubmit(e) {
        if (e && e.preventDefault) e.preventDefault();
        const input = document.getElementById('ai-chat-input');
        if (!input || !input.value.trim()) return;

        const text = input.value.trim();
        input.value = '';

        this.appendMessage('user', text);

        // Typing indicator
        const typingId = this.appendTyping();

        try {
            const data = await API.ai.chat(text, this.history);
            this.removeMessage(typingId);

            this.appendMessage('assistant', data.reply, data.suggestedActions);
            this.history.push({ role: 'user', content: text });
            this.history.push({ role: 'assistant', content: data.reply });
        } catch (err) {
            this.removeMessage(typingId);
            this.appendMessage('assistant', 'Sorry, I encountered an issue connecting to the civic intelligence service.');
        }
    },

    appendMessage(role, text, suggestedActions = []) {
        const list = document.getElementById('ai-messages-list');
        if (!list) return;

        const isUser = role === 'user';
        const msgDiv = document.createElement('div');
        msgDiv.className = `flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`;

        const formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/•\s/g, '<span class="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span>')
            .replace(/\n/g, '<br/>');

        msgDiv.innerHTML = `
            <div class="w-6 h-6 rounded-lg ${isUser ? 'bg-slate-900 text-white' : 'bg-blue-100 text-blue-700'} flex items-center justify-center font-bold text-xs shrink-0">
                ${isUser ? '👤' : '🤖'}
            </div>
            <div class="${isUser ? 'bg-blue-700 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/80'} p-3.5 rounded-2xl max-w-[85%] leading-relaxed">
                <div>${formattedText}</div>
                ${suggestedActions && suggestedActions.length > 0 ? `
                <div class="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                    ${suggestedActions.map(a => `
                        <button onclick="AIChatbot.handleAction('${a.action}', '${a.complaintNumber || ''}')"
                                class="px-2 py-0.5 rounded bg-white text-blue-800 border border-slate-300 font-bold text-[10px] hover:bg-blue-50 transition">
                            ${a.label}
                        </button>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `;

        list.appendChild(msgDiv);
        list.scrollTop = list.scrollHeight;
    },

    appendTyping() {
        const list = document.getElementById('ai-messages-list');
        if (!list) return null;

        const id = `typing-${Date.now()}`;
        const div = document.createElement('div');
        div.id = id;
        div.className = 'flex items-center space-x-2 text-slate-400 text-xs italic pl-8';
        div.innerHTML = `
            <span class="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
            <span class="ml-1 text-[11px]">Sahayak is checking verified database...</span>
        `;
        list.appendChild(div);
        list.scrollTop = list.scrollHeight;
        return id;
    },

    removeMessage(id) {
        if (!id) return;
        const el = document.getElementById(id);
        if (el) el.remove();
    },

    handleAction(action, complaintNumber) {
        if (action === 'track' && complaintNumber) {
            this.toggle();
            App.navigate('track', { complaintNumber });
        } else if (action === 'report') {
            this.toggle();
            App.openReportModal();
        } else if (action === 'nav_track') {
            this.toggle();
            App.navigate('track');
        } else if (action === 'help_report') {
            this.sendPreset('How do I report an issue?');
        } else if (action === 'help_category') {
            this.sendPreset('Explain complaint categories');
        } else if (action === 'help_emergency') {
            this.sendPreset('Civic Emergency Helplines');
        }
    }
};

window.AIChatbot = AIChatbot;
