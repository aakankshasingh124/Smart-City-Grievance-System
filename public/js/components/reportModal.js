// Complaint Reporting Modal & Workflow
const ReportModal = {
    selectedCategory: 'Waste Management',
    selectedSubcategory: '',
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'New Delhi, India',
    uploadedImageBase64: null,
    uploadedImageName: null,
    mediaRecorder: null,
    audioChunks: [],
    audioBlob: null,
    audioBase64: null,
    audioUrl: null,
    audioName: null,
    isRecording: false,
    recordTimerInterval: null,
    recordSeconds: 0,
    speechRecognition: null,
    isSpeechActive: false,
    isCancelled: false,
    mapInstance: null,
    markerInstance: null,
    aiCheckTimeout: null,

    SUBCATEGORIES: {
        'Waste Management': [
            'Garbage accumulation',
            'Overflowing public dustbins',
            'Illegal garbage dumping',
            'Uncollected household or public waste',
            'Dirty streets and public places',
            'Drainage blockage caused by waste',
            'Other sanitation-related problems'
        ],
        'Traffic Management': [
            'Traffic signal malfunction',
            'Damaged roads and potholes',
            'Road obstruction',
            'Illegal parking',
            'Broken traffic signs',
            'Damaged road dividers',
            'Other public traffic infrastructure issues'
        ],
        'Energy Issues': [
            'Streetlight failure',
            'Power supply interruptions',
            'Damaged electrical infrastructure',
            'Exposed electrical wires',
            'Damaged public electrical equipment',
            'Other electricity infrastructure issues'
        ],
        'Miscellaneous Public Grievances': [
            'Water supply',
            'Drainage and sewage',
            'Damaged public property',
            'Public toilets and sanitation facilities',
            'Public parks and public facilities',
            'Government service-related grievances',
            'Issues concerning a government department or public authority',
            'Other civic issues'
        ]
    },

    open(initialData = {}) {
        if (initialData.category) {
            this.selectedCategory = initialData.category;
        }
        this.selectedSubcategory = this.SUBCATEGORIES[this.selectedCategory][0];
        this.uploadedImageBase64 = null;
        this.uploadedImageName = null;
        this.audioChunks = [];
        this.audioBlob = null;
        this.audioBase64 = null;
        this.audioUrl = null;
        this.audioName = null;
        this.isRecording = false;
        this.recordSeconds = 0;

        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        const user = API.getCurrentUser();

        modalContainer.innerHTML = `
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div class="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
                <!-- Modal Header with Indian Civic Aesthetic -->
                <div class="px-6 py-5 bg-gradient-to-r from-orange-600 via-amber-600 to-blue-900 text-white flex items-center justify-between">
                    <div>
                        <div class="flex items-center space-x-2.5">
                            <div class="w-6 h-6 rounded-full bg-white p-0.5 shrink-0 flex items-center justify-center">
                                <svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="50" cy="50" r="46" fill="#0b2545" stroke="#f59e0b" stroke-width="4"/>
                                    <circle cx="50" cy="50" r="20" fill="#1e3a8a"/>
                                    <g stroke="#38bdf8" stroke-width="3">
                                        <line x1="50" y1="12" x2="50" y2="88"/>
                                        <line x1="12" y1="50" x2="88" y2="50"/>
                                        <line x1="23" y1="23" x2="77" y2="77"/>
                                        <line x1="23" y1="77" x2="77" y2="23"/>
                                    </g>
                                    <circle cx="50" cy="50" r="8" fill="#f59e0b"/>
                                </svg>
                            </div>
                            <h3 class="text-xl font-black tracking-tight font-devanagari">समस्या दर्ज करें • Report a Grievance</h3>
                        </div>
                        <p class="text-xs text-amber-100 mt-0.5">Municipal Corporation & Public Services Redressal • JanSahayak AI</p>
                    </div>
                    <button onclick="ReportModal.close()" class="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <!-- Form Content -->
                <form id="report-form" onsubmit="ReportModal.handleSubmit(event)" class="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                    <!-- 1. Category Selection -->
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">1. शिकायत श्रेणी चुनें (Select Problem Domain)</label>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <button type="button" onclick="ReportModal.selectCategory('Waste Management')"
                                    class="category-btn p-3 rounded-2xl border text-left text-xs font-bold transition flex flex-col items-center justify-center text-center ${this.selectedCategory === 'Waste Management' ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}">
                                <div class="w-9 h-9 mb-1.5 flex items-center justify-center">
                                    <svg viewBox="0 0 64 64" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="32" cy="32" r="28" fill="#D1FAE5" stroke="#10B981" stroke-width="2"/>
                                        <path d="M22 26L25 50C25 51.1 25.9 52 27 52H37C38.1 52 39 51.1 39 50L42 26" fill="#059669"/>
                                        <rect x="20" y="21" width="24" height="5" rx="2" fill="#047857"/>
                                        <path d="M28 21V18C28 17.4 28.4 17 29 17H35C35.6 17 36 17.4 36 18V21" stroke="#047857" stroke-width="2"/>
                                        <circle cx="28" cy="34" r="3" fill="#FFFFFF"/>
                                        <circle cx="36" cy="34" r="3" fill="#FFFFFF"/>
                                        <circle cx="49" cy="22" r="2.5" fill="#F59E0B"/>
                                    </svg>
                                </div>
                                <span class="font-devanagari font-bold">अपशिष्ट एवं कचरा</span>
                                <span class="text-[10px] text-slate-500">Waste</span>
                            </button>
                            <button type="button" onclick="ReportModal.selectCategory('Traffic Management')"
                                    class="category-btn p-3 rounded-2xl border text-left text-xs font-bold transition flex flex-col items-center justify-center text-center ${this.selectedCategory === 'Traffic Management' ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-2xs' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}">
                                <div class="w-9 h-9 mb-1.5 flex items-center justify-center">
                                    <svg viewBox="0 0 64 64" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="32" cy="32" r="28" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/>
                                        <path d="M32 12L46 17V33C46 41 39.5 48 32 51C24.5 48 18 41 18 33V17L32 12Z" fill="#D97706"/>
                                        <rect x="27" y="21" width="10" height="23" rx="4" fill="#1E293B"/>
                                        <circle cx="32" cy="25" r="2.5" fill="#EF4444"/>
                                        <circle cx="32" cy="32.5" r="2.5" fill="#FBBF24"/>
                                        <circle cx="32" cy="40" r="2.5" fill="#10B981"/>
                                    </svg>
                                </div>
                                <span class="font-devanagari font-bold">यातायात व सड़क</span>
                                <span class="text-[10px] text-slate-500">Traffic</span>
                            </button>
                            <button type="button" onclick="ReportModal.selectCategory('Energy Issues')"
                                    class="category-btn p-3 rounded-2xl border text-left text-xs font-bold transition flex flex-col items-center justify-center text-center ${this.selectedCategory === 'Energy Issues' ? 'bg-purple-50 border-purple-500 text-purple-800 shadow-2xs' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}">
                                <div class="w-9 h-9 mb-1.5 flex items-center justify-center">
                                    <svg viewBox="0 0 64 64" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="32" cy="32" r="28" fill="#F3E8FF" stroke="#A855F7" stroke-width="2"/>
                                        <path d="M23 51V22C23 16 27 13 33 13C37 13 41 15 41 19H45" stroke="#6B21A8" stroke-width="3" stroke-linecap="round"/>
                                        <path d="M33 21L22 36H31L27 50L43 32H33L38 21H33Z" fill="#EAB308" stroke="#A16207" stroke-width="1.2"/>
                                    </svg>
                                </div>
                                <span class="font-devanagari font-bold">विद्युत व लाइट</span>
                                <span class="text-[10px] text-slate-500">Energy</span>
                            </button>
                            <button type="button" onclick="ReportModal.selectCategory('Miscellaneous Public Grievances')"
                                    class="category-btn p-3 rounded-2xl border text-left text-xs font-bold transition flex flex-col items-center justify-center text-center ${this.selectedCategory === 'Miscellaneous Public Grievances' ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-2xs' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}">
                                <div class="w-9 h-9 mb-1.5 flex items-center justify-center">
                                    <svg viewBox="0 0 64 64" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="32" cy="32" r="28" fill="#DBEAFE" stroke="#3B82F6" stroke-width="2"/>
                                        <path d="M19 35H45V49C45 50.1 44.1 51 43 51H21C19.9 51 19 50.1 19 49V35Z" fill="#1D4ED8"/>
                                        <path d="M19 35C19 26 24.5 20 32 18C39.5 20 45 26 45 35H19Z" fill="#2563EB"/>
                                        <circle cx="32" cy="12" r="2.5" fill="#F59E0B"/>
                                        <rect x="24" y="37" width="3" height="11" rx="1" fill="#FFFFFF"/>
                                        <rect x="30.5" y="37" width="3" height="11" rx="1" fill="#FFFFFF"/>
                                        <rect x="37" y="37" width="3" height="11" rx="1" fill="#FFFFFF"/>
                                    </svg>
                                </div>
                                <span class="font-devanagari font-bold">नागरिक एवं विविध</span>
                                <span class="text-[10px] text-slate-500">Civil & Misc</span>
                            </button>
                        </div>
                    </div>

                    <!-- Category Specific Safety Warning Banners -->
                    <div id="category-warning-banner">
                        ${this.getCategoryBanner(this.selectedCategory)}
                    </div>

                    <!-- 2. Subcategory -->
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">2. Issue Type</label>
                        <select id="report-subcategory" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-blue-500">
                            ${this.SUBCATEGORIES[this.selectedCategory].map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                    </div>

                    <!-- 3. Title & Description -->
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">3. Problem Title *</label>
                        <input id="report-title" type="text" required placeholder="e.g. Overflowing garbage container blocking road..."
                               oninput="ReportModal.handleTextChange()"
                               class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                        <div class="flex items-center justify-between mb-1.5">
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                4. Detailed Description * (लिखित या बोलकर विवरण)
                            </label>
                            <!-- Voice Recording Studio Toggle -->
                            <button type="button" onclick="ReportModal.toggleVoiceRecorder()"
                                    id="voice-toggle-btn"
                                    class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold text-orange-800 bg-orange-100/90 border border-orange-300 hover:bg-orange-200 transition shadow-2xs">
                                <span class="text-sm">🎙️</span>
                                <span>बोलकर बताएं (Voice Record)</span>
                            </button>
                        </div>

                        <!-- Voice Recording Studio Card -->
                        <div id="voice-recording-studio" class="hidden mb-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-white border-2 border-orange-300 shadow-xs">
                            <div class="flex flex-col space-y-2.5">
                                <div class="flex items-center justify-between text-xs">
                                    <span class="font-bold text-orange-950 flex items-center space-x-1.5">
                                        <span>🎙️</span>
                                        <span>आवाज़ रिकॉर्डिंग स्टूडियो (Voice Recording)</span>
                                    </span>
                                    <span id="voice-timer-display" class="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-orange-200 text-slate-700">
                                        00:00 / 03:00
                                    </span>
                                </div>

                                <!-- State 1: Idle (Ready to record) -->
                                <div id="voice-idle-state" class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-1">
                                    <p class="text-[11px] text-slate-600 leading-snug">
                                        हिंदी, अंग्रेजी या अपनी भाषा में बोलें। आपकी आवाज रिकॉर्ड होकर शिकायत से जुड़ेगी और विवरण अपने-आप टाइप भी होगा।
                                    </p>
                                    <button type="button" onclick="ReportModal.startRecording()"
                                            class="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-xs shadow-xs transition flex items-center space-x-1.5 shrink-0">
                                        <span class="w-2.5 h-2.5 rounded-full bg-white"></span>
                                        <span>Start Recording (बोलना शुरू करें)</span>
                                    </button>
                                </div>

                                <!-- State 2: Actively Recording -->
                                <div id="voice-active-state" class="hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2.5 rounded-xl bg-red-50 border border-red-200">
                                    <div class="flex items-center space-x-2.5">
                                        <span class="w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
                                        <div>
                                            <div class="text-xs font-black text-red-700">Recording Audio... (आवाज रिकॉर्ड हो रही है)</div>
                                            <div class="text-[10px] text-red-600">Speak clearly near the mic. Live speech-to-text is transcribing into the box below.</div>
                                        </div>
                                    </div>
                                    <div class="flex items-center space-x-2 shrink-0">
                                        <button type="button" onclick="ReportModal.stopRecording()"
                                                class="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition flex items-center space-x-1.5 shadow-xs">
                                            <span>⏹️ Done (रोकें)</span>
                                        </button>
                                        <button type="button" onclick="ReportModal.cancelRecording()"
                                                class="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition">
                                            ✕ Cancel
                                        </button>
                                    </div>
                                </div>

                                <!-- State 3: Audio Recorded & Ready -->
                                <div id="voice-done-state" class="hidden flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-xl bg-white border border-emerald-300 shadow-2xs">
                                    <div class="flex items-center space-x-2.5 w-full sm:w-auto">
                                        <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-xs shrink-0">✓</span>
                                        <audio id="voice-preview-player" controls class="h-8 max-w-full sm:max-w-xs"></audio>
                                    </div>
                                    <div class="flex items-center space-x-2 shrink-0">
                                        <button type="button" onclick="ReportModal.startRecording()"
                                                class="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold transition flex items-center space-x-1">
                                            <span>🔄 Re-record</span>
                                        </button>
                                        <button type="button" onclick="ReportModal.deleteVoiceNote()"
                                                class="px-2.5 py-1 rounded-xl text-red-600 hover:bg-red-50 text-[11px] font-bold transition">
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <textarea id="report-description" rows="3" required placeholder="Type clear details or use the voice recording button above to speak in your language..."
                                  oninput="ReportModal.handleTextChange()"
                                  class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"></textarea>
                        <div class="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                            <span id="voice-auto-fill-hint">Voice recording automatically attaches audio & transcribes speech into text.</span>
                            <span id="voice-note-attached-indicator" class="hidden text-emerald-700 font-bold">🎙️ Voice Note Attached</span>
                        </div>
                    </div>

                    <!-- AI Intelligence Box (Live Suggestions & Duplicate Warnings) -->
                    <div id="ai-suggestion-box" class="hidden p-4 rounded-2xl ai-badge text-xs space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="font-bold text-indigo-900 flex items-center">
                                <span class="mr-1.5">🤖</span> JanSahayak AI Assistant Analysis
                            </span>
                            <span id="ai-priority-badge" class="px-2 py-0.5 rounded-full font-bold text-[10px]">Priority</span>
                        </div>
                        <div id="ai-reasoning-text" class="text-indigo-800 text-[11px] leading-relaxed"></div>
                        <div id="ai-duplicate-alert" class="hidden p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium"></div>
                    </div>

                    <!-- 5. Photograph Upload -->
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">5. Photograph / Supporting Evidence</label>
                        <div id="image-upload-area" class="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
                            <input type="file" id="report-image-input" accept="image/jpeg,image/png,image/webp" onchange="ReportModal.handleImageUpload(event)" class="hidden" />
                            <div id="upload-prompt" onclick="document.getElementById('report-image-input').click()">
                                <svg class="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                <span class="text-xs text-slate-600 font-semibold block">Click to upload photo or take picture</span>
                                <span class="text-[10px] text-slate-400 block mt-0.5">JPEG, PNG, WebP up to 5MB</span>
                            </div>
                            <!-- Image Preview -->
                            <div id="image-preview-wrapper" class="hidden flex items-center justify-between p-2 bg-slate-100 rounded-xl">
                                <div class="flex items-center space-x-3">
                                    <img id="image-preview" class="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                                    <div class="text-left text-xs">
                                        <div id="image-name-display" class="font-bold text-slate-800 truncate max-w-xs"></div>
                                        <div class="text-[10px] text-emerald-600 font-semibold">✓ Ready to attach</div>
                                    </div>
                                </div>
                                <button type="button" onclick="ReportModal.removeImage()" class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                    ✕ Remove
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 6. Location & Map Picker -->
                    <div>
                        <div class="flex items-center justify-between mb-1.5">
                            <label class="text-xs font-bold uppercase tracking-wider text-slate-700">6. Reported Location *</label>
                            <button type="button" onclick="ReportModal.detectLocation()" class="text-xs text-blue-700 font-bold hover:underline flex items-center">
                                <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                Detect My Current Location
                            </button>
                        </div>
                        <div id="report-map" class="w-full h-48 rounded-xl border border-slate-300 mb-2"></div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input id="report-address" type="text" required placeholder="Full Address / Street name *"
                                   class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500" />
                            <input id="report-landmark" type="text" placeholder="Nearby Landmark (Optional)"
                                   class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div class="text-[10px] text-slate-400 mt-1 flex justify-between">
                            <span>You can drag the pin on the map to pinpoint exact spot.</span>
                            <span id="coords-display">Lat: ${this.latitude.toFixed(4)}, Lng: ${this.longitude.toFixed(4)}</span>
                        </div>
                    </div>

                    <!-- 7. Urgency Checkbox -->
                    <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
                        <input id="report-urgent" type="checkbox" class="mt-0.5 rounded text-red-600 focus:ring-red-500 w-4 h-4" />
                        <div>
                            <label for="report-urgent" class="text-xs font-bold text-slate-800 cursor-pointer">Mark as Critical / Immediate Hazard</label>
                            <p class="text-[11px] text-slate-500">Check if this problem creates an immediate accident, electrocution, or severe public safety hazard.</p>
                        </div>
                    </div>

                    <!-- 8. Guest complainant fields if not logged in -->
                    ${!user ? `
                    <div class="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs space-y-3">
                        <div class="font-bold text-blue-900">Complainant Contact (Guest Filing)</div>
                        <p class="text-[11px] text-blue-700">You are submitting as a guest. Enter your details to receive tracking updates or <a href="javascript:void(0)" onclick="App.openModal('citizen-login')" class="underline font-bold">sign in</a> to view all your grievances in one dashboard.</p>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input id="report-guest-name" type="text" placeholder="Your Full Name" class="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white" />
                            <input id="report-guest-contact" type="text" placeholder="Mobile Number or Email" class="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white" />
                        </div>
                    </div>
                    ` : ''}

                    <!-- Submit Button -->
                    <div class="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                        <button type="button" onclick="ReportModal.close()" class="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition">
                            Cancel
                        </button>
                        <button id="submit-complaint-btn" type="submit" class="px-7 py-3 rounded-xl bg-blue-700 text-white text-sm font-bold shadow-md hover:bg-blue-800 transition flex items-center space-x-2">
                            <span>Submit Complaint</span>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
        `;

        setTimeout(() => {
            this.initMap();
        }, 100);
    },

    close() {
        this.stopRecording(true);
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) modalContainer.innerHTML = '';
        if (this.mapInstance) {
            this.mapInstance.remove();
            this.mapInstance = null;
        }
    },

    selectCategory(cat) {
        this.selectedCategory = cat;
        const subSelect = document.getElementById('report-subcategory');
        if (subSelect) {
            subSelect.innerHTML = this.SUBCATEGORIES[cat].map(s => `<option value="${s}">${s}</option>`).join('');
            this.selectedSubcategory = this.SUBCATEGORIES[cat][0];
        }

        const warningBanner = document.getElementById('category-warning-banner');
        if (warningBanner) {
            warningBanner.innerHTML = this.getCategoryBanner(cat);
        }

        // Update button visual styles
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.className = `category-btn p-3 rounded-xl border text-left text-xs font-bold transition flex flex-col items-center justify-center text-center border-slate-200 hover:bg-slate-50 text-slate-700`;
        });
        const currentBtn = event.currentTarget;
        if (currentBtn) {
            const activeColor = cat === 'Waste Management' ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                              : cat === 'Traffic Management' ? 'bg-amber-50 border-amber-500 text-amber-800'
                              : cat === 'Energy Issues' ? 'bg-purple-50 border-purple-500 text-purple-800'
                              : 'bg-blue-50 border-blue-500 text-blue-800';
            currentBtn.className = `category-btn p-3 rounded-xl border text-left text-xs font-bold transition flex flex-col items-center justify-center text-center shadow-2xs ${activeColor}`;
        }

        this.handleTextChange();
    },

    getCategoryBanner(cat) {
        if (cat === 'Energy Issues') {
            return `
            <div class="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start space-x-2">
                <span class="text-base">⚡</span>
                <div>
                    <strong>Electrical Safety Warning:</strong> Never attempt to touch, move, or approach fallen electrical cables, sparking transformers, or damaged meter boxes. Maintain minimum 15 feet distance.
                </div>
            </div>`;
        }
        if (cat === 'Traffic Management') {
            return `
            <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
                <span class="text-base">🚨</span>
                <div>
                    <strong>Traffic Hazard Alert:</strong> For active vehicle collisions or emergency highway blockages requiring immediate police response, please dial <strong>112</strong>.
                </div>
            </div>`;
        }
        if (cat === 'Miscellaneous Public Grievances') {
            return `
            <div class="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-start space-x-2">
                <span class="text-base">ℹ️</span>
                <div>
                    <strong>Civic Redressal Note:</strong> Provide factual observations and exact locations. Complaints involving municipal corruption or service fraud will be routed confidentially to vigilance authorities.
                </div>
            </div>`;
        }
        return '';
    },

    initMap() {
        const mapEl = document.getElementById('report-map');
        if (!mapEl || typeof L === 'undefined') return;

        this.mapInstance = L.map('report-map').setView([this.latitude, this.longitude], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap'
        }).addTo(this.mapInstance);

        this.markerInstance = L.marker([this.latitude, this.longitude], { draggable: true }).addTo(this.mapInstance);

        this.markerInstance.on('dragend', (e) => {
            const coord = e.target.getLatLng();
            this.latitude = coord.lat;
            this.longitude = coord.lng;
            this.updateCoordsDisplay();
        });

        this.mapInstance.on('click', (e) => {
            this.latitude = e.latlng.lat;
            this.longitude = e.latlng.lng;
            this.markerInstance.setLatLng(e.latlng);
            this.updateCoordsDisplay();
        });
    },

    detectLocation() {
        if (!navigator.geolocation) {
            App.showToast('Geolocation is not supported by your browser.', 'error');
            return;
        }

        App.showToast('Detecting location with your consent...', 'info');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                this.latitude = pos.coords.latitude;
                this.longitude = pos.coords.longitude;
                if (this.markerInstance) {
                    this.markerInstance.setLatLng([this.latitude, this.longitude]);
                    this.mapInstance.setView([this.latitude, this.longitude], 15);
                }
                this.updateCoordsDisplay();
                App.showToast('Location updated successfully.', 'success');

                // Pre-check for duplicates near detected location
                this.triggerAiPreCheck();
            },
            (err) => {
                console.warn('Geolocation error:', err.message);
                App.showToast('Location access denied. Please enter address manually.', 'warning');
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    },

    updateCoordsDisplay() {
        const el = document.getElementById('coords-display');
        if (el) {
            el.textContent = `Lat: ${this.latitude.toFixed(4)}, Lng: ${this.longitude.toFixed(4)}`;
        }
        this.triggerAiPreCheck();
    },

    handleTextChange() {
        clearTimeout(this.aiCheckTimeout);
        this.aiCheckTimeout = setTimeout(() => {
            this.triggerAiPreCheck();
        }, 500);
    },

    async triggerAiPreCheck() {
        const title = (document.getElementById('report-title') || {}).value || '';
        const desc = (document.getElementById('report-description') || {}).value || '';
        const urgent = (document.getElementById('report-urgent') || {}).checked;

        if (title.length < 5 && desc.length < 10) return;

        try {
            const result = await API.complaints.preCheck({
                title,
                description: desc,
                category: this.selectedCategory,
                latitude: this.latitude,
                longitude: this.longitude,
                isUrgent: urgent
            });

            const box = document.getElementById('ai-suggestion-box');
            const pBadge = document.getElementById('ai-priority-badge');
            const reason = document.getElementById('ai-reasoning-text');
            const dupAlert = document.getElementById('ai-duplicate-alert');

            if (box && pBadge && reason) {
                box.classList.remove('hidden');

                // Priority Badge
                const pri = result.prioritySuggestion.priority;
                pBadge.textContent = `${pri} Priority`;
                pBadge.className = `px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    pri === 'Critical' ? 'bg-red-600 text-white' :
                    pri === 'High' ? 'bg-amber-600 text-white' :
                    pri === 'Medium' ? 'bg-blue-600 text-white' : 'bg-slate-500 text-white'
                }`;

                reason.textContent = `${result.prioritySuggestion.reason} AI routing to ${result.categorization.departmentName}.`;

                // Duplicate Alert
                if (result.duplicateCheck && result.duplicateCheck.hasPotentialDuplicate) {
                    dupAlert.classList.remove('hidden');
                    const firstDup = result.duplicateCheck.duplicates[0];
                    dupAlert.innerHTML = `
                        ⚠️ <strong>Potential Duplicate Alert:</strong> A complaint (${firstDup.complaintNumber}) was reported ${firstDup.distanceMeters}m away ("${firstDup.title.slice(0, 50)}...").
                        <div class="mt-1 text-[10px] text-amber-700">You may still proceed if this is an additional or separate issue.</div>
                    `;
                } else if (dupAlert) {
                    dupAlert.classList.add('hidden');
                }
            }
        } catch (e) {
            console.warn('AI pre-check skipped:', e);
        }
    },

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            App.showToast('Image size exceeds 5MB limit. Please upload a smaller image.', 'error');
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            App.showToast('Only JPEG, PNG, and WebP files are supported.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            this.uploadedImageBase64 = loadEvent.target.result;
            this.uploadedImageName = file.name;

            const preview = document.getElementById('image-preview');
            const wrapper = document.getElementById('image-preview-wrapper');
            const prompt = document.getElementById('upload-prompt');
            const nameDisp = document.getElementById('image-name-display');

            if (preview && wrapper && prompt) {
                preview.src = this.uploadedImageBase64;
                wrapper.classList.remove('hidden');
                prompt.classList.add('hidden');
                nameDisp.textContent = file.name;
            }
        };
        reader.readAsDataURL(file);
    },

    removeImage() {
        this.uploadedImageBase64 = null;
        this.uploadedImageName = null;
        const wrapper = document.getElementById('image-preview-wrapper');
        const prompt = document.getElementById('upload-prompt');
        const input = document.getElementById('report-image-input');
        if (wrapper && prompt) {
            wrapper.classList.add('hidden');
            prompt.classList.remove('hidden');
        }
        if (input) input.value = '';
    },

    toggleVoiceRecorder() {
        const studio = document.getElementById('voice-recording-studio');
        if (!studio) return;
        studio.classList.toggle('hidden');
        if (!studio.classList.contains('hidden') && !this.audioBase64 && !this.isRecording) {
            studio.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    },

    async startRecording() {
        if (this.isRecording) return;

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            App.showToast('Microphone audio recording is not supported on this browser.', 'error');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioChunks = [];
            this.isCancelled = false;

            const options = { mimeType: 'audio/webm' };
            if (typeof MediaRecorder !== 'undefined' && !MediaRecorder.isTypeSupported('audio/webm')) {
                delete options.mimeType;
            }

            this.mediaRecorder = new MediaRecorder(stream, options);
            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    this.audioChunks.push(e.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.handleRecordingStop();
            };

            this.mediaRecorder.start(250);
            this.isRecording = true;
            this.recordSeconds = 0;
            this.updateTimerDisplay();

            clearInterval(this.recordTimerInterval);
            this.recordTimerInterval = setInterval(() => {
                this.recordSeconds++;
                this.updateTimerDisplay();
                if (this.recordSeconds >= 180) { // Max 3 minutes
                    this.stopRecording();
                    App.showToast('Max voice recording duration reached (3 min).', 'info');
                }
            }, 1000);

            // Update UI to active recording state
            const idle = document.getElementById('voice-idle-state');
            const active = document.getElementById('voice-active-state');
            const done = document.getElementById('voice-done-state');
            if (idle) idle.classList.add('hidden');
            if (active) active.classList.remove('hidden');
            if (done) done.classList.add('hidden');

            this.initSpeechRecognition();
            App.showToast('Microphone active. बोलें, आपकी आवाज़ रिकॉर्ड हो रही है...', 'info');
        } catch (err) {
            console.error('Microphone access error:', err);
            App.showToast('Microphone permission denied. You can still type details.', 'warning');
        }
    },

    initSpeechRecognition() {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) return;

        try {
            this.speechRecognition = new SpeechRec();
            this.speechRecognition.continuous = true;
            this.speechRecognition.interimResults = true;
            this.speechRecognition.lang = 'hi-IN';

            this.speechRecognition.onresult = (event) => {
                let speechText = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        speechText += event.results[i][0].transcript + ' ';
                    }
                }
                if (speechText.trim()) {
                    const descEl = document.getElementById('report-description');
                    if (descEl) {
                        const existing = descEl.value ? descEl.value.trim() + ' ' : '';
                        descEl.value = existing + speechText.trim();
                        this.handleTextChange();
                    }
                }
            };

            this.speechRecognition.onerror = (e) => {
                console.warn('Speech recognition warning:', e);
            };

            this.speechRecognition.start();
            this.isSpeechActive = true;
        } catch (e) {
            console.warn('SpeechRecognition failed to start:', e);
        }
    },

    stopRecording(cancelled = false) {
        if (!this.isRecording) return;
        this.isRecording = false;
        clearInterval(this.recordTimerInterval);

        if (this.speechRecognition && this.isSpeechActive) {
            try {
                this.speechRecognition.stop();
            } catch (e) {}
            this.isSpeechActive = false;
        }

        if (this.mediaRecorder) {
            if (cancelled) {
                this.isCancelled = true;
            }
            if (this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
            }
            if (this.mediaRecorder.stream) {
                this.mediaRecorder.stream.getTracks().forEach(t => t.stop());
            }
        }
    },

    handleRecordingStop() {
        const idle = document.getElementById('voice-idle-state');
        const active = document.getElementById('voice-active-state');
        const done = document.getElementById('voice-done-state');
        const indicator = document.getElementById('voice-note-attached-indicator');

        if (this.isCancelled) {
            this.isCancelled = false;
            this.audioChunks = [];
            this.audioBlob = null;
            this.audioBase64 = null;
            if (idle) idle.classList.remove('hidden');
            if (active) active.classList.add('hidden');
            if (done) done.classList.add('hidden');
            if (indicator) indicator.classList.add('hidden');
            return;
        }

        const mime = (this.mediaRecorder && this.mediaRecorder.mimeType) || 'audio/webm';
        this.audioBlob = new Blob(this.audioChunks, { type: mime });
        this.audioUrl = URL.createObjectURL(this.audioBlob);
        this.audioName = `voice_${Date.now()}.webm`;

        const player = document.getElementById('voice-preview-player');
        if (player) {
            player.src = this.audioUrl;
        }

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            this.audioBase64 = loadEvent.target.result;
            if (indicator) indicator.classList.remove('hidden');
            App.showToast('Voice note recorded & attached! (आवाज रिकॉर्ड हो गई)', 'success');
        };
        reader.readAsDataURL(this.audioBlob);

        if (idle) idle.classList.add('hidden');
        if (active) active.classList.add('hidden');
        if (done) done.classList.remove('hidden');
    },

    cancelRecording() {
        this.stopRecording(true);
        App.showToast('Voice recording cancelled.', 'info');
    },

    deleteVoiceNote() {
        this.audioBlob = null;
        this.audioBase64 = null;
        this.audioUrl = null;
        this.audioChunks = [];
        this.audioName = null;

        const player = document.getElementById('voice-preview-player');
        if (player) player.src = '';

        const idle = document.getElementById('voice-idle-state');
        const done = document.getElementById('voice-done-state');
        const active = document.getElementById('voice-active-state');
        const indicator = document.getElementById('voice-note-attached-indicator');
        const timer = document.getElementById('voice-timer-display');

        if (idle) idle.classList.remove('hidden');
        if (done) done.classList.add('hidden');
        if (active) active.classList.add('hidden');
        if (indicator) indicator.classList.add('hidden');
        if (timer) timer.textContent = '00:00 / 03:00';

        App.showToast('Voice note removed.', 'info');
    },

    updateTimerDisplay() {
        const timer = document.getElementById('voice-timer-display');
        if (!timer) return;
        const mins = String(Math.floor(this.recordSeconds / 60)).padStart(2, '0');
        const secs = String(this.recordSeconds % 60).padStart(2, '0');
        timer.textContent = `${mins}:${secs} / 03:00`;
    },

    async handleSubmit(e) {
        e.preventDefault();

        const title = document.getElementById('report-title').value.trim();
        let desc = document.getElementById('report-description').value.trim();
        const subcat = document.getElementById('report-subcategory').value;
        const address = document.getElementById('report-address').value.trim();
        const landmark = (document.getElementById('report-landmark') || {}).value || '';
        const urgent = (document.getElementById('report-urgent') || {}).checked;

        const guestName = (document.getElementById('report-guest-name') || {}).value || null;
        const guestContact = (document.getElementById('report-guest-contact') || {}).value || null;

        if (!desc && this.audioBase64) {
            desc = "[आवाज़ में दर्ज विवरण / Voice Recording Attached] Citizen grievance submitted via audio voice recording.";
            document.getElementById('report-description').value = desc;
        }

        if (!title || !desc || !address) {
            App.showToast('Please provide a title, description (written or voice note), and street address.', 'error');
            return;
        }

        const submitBtn = document.getElementById('submit-complaint-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Submitting to Portal...</span>`;
        }

        try {
            const response = await API.complaints.submit({
                title,
                description: desc,
                category: this.selectedCategory,
                subcategory: subcat,
                latitude: this.latitude,
                longitude: this.longitude,
                address,
                landmark,
                isUrgent: urgent,
                imageBase64: this.uploadedImageBase64,
                imageName: this.uploadedImageName,
                audioBase64: this.audioBase64,
                audioName: this.audioName || 'voice_recording.webm',
                guestName,
                guestContact
            });

            this.showSuccessModal(response);
        } catch (err) {
            App.showToast(`Submission failed: ${err.message}`, 'error');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>Submit Complaint</span>`;
            }
        }
    },

    showSuccessModal(data) {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div class="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-8">
                <!-- Success Icon -->
                <div class="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-3xl font-black shadow-xs">
                    ✓
                </div>

                <h3 class="text-2xl font-extrabold text-slate-900 tracking-tight">Grievance Registered!</h3>
                <p class="text-xs text-slate-600 mt-1">Your complaint has been verified and logged into the municipal system.</p>

                <!-- Complaint ID Pill -->
                <div class="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Your Tracking Number</span>
                    <span class="text-2xl font-mono font-black text-blue-700 tracking-wider select-all">${data.complaintNumber}</span>
                    <div class="mt-2 flex items-center justify-center space-x-2 text-xs">
                        <span class="px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">${data.category}</span>
                        <span class="px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">${data.priority} Priority</span>
                        <span class="px-2.5 py-0.5 rounded-full font-bold bg-slate-200 text-slate-700">Status: ${data.initialStatus}</span>
                    </div>
                    <div class="text-[11px] text-slate-500 mt-2">
                        Assigned: <strong>${data.estimatedDepartment || 'Department Dispatch'}</strong>
                    </div>
                </div>

                <!-- Guidance -->
                <p class="text-xs text-slate-500 mt-4 leading-relaxed">
                    Save this Tracking ID to check live inspection updates, field photos, and resolution confirmations.
                </p>

                <!-- Actions -->
                <div class="mt-6 space-y-2.5">
                    <button onclick="ReportModal.close(); App.navigate('track', { complaintNumber: '${data.complaintNumber}' })"
                            class="w-full py-3.5 px-4 rounded-xl bg-blue-700 text-white font-bold text-sm shadow-md hover:bg-blue-800 transition">
                        Track This Complaint Now
                    </button>
                    <button onclick="ReportModal.close(); App.navigate('home')"
                            class="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition">
                        Return to Homepage
                    </button>
                </div>
            </div>
        </div>
        `;
    }
};

window.ReportModal = ReportModal;
