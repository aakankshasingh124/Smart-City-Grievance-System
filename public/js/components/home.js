// Home Page Component
const Home = {
    statsData: null,
    mapInstance: null,

    async render() {
        return `
        <!-- Hero Section with Indian Civic Flag Theme & Citizens Imagery -->
        <section class="relative py-12 sm:py-20 border-b border-amber-900/10 overflow-hidden hero-mandala-bg">
            <!-- Subtle Tiranga radial gradient aura -->
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200/30 via-orange-100/15 to-emerald-100/20 pointer-events-none"></div>

            <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    <!-- Left Column: Civic Headings, Bilingual Motto & Actions (7 cols) -->
                    <div class="lg:col-span-7 text-left space-y-5">
                        <!-- National Motto & Emblem Badge -->
                        <div class="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 via-white to-emerald-100 border border-amber-300 text-slate-800 text-xs font-bold shadow-xs">
                            <svg viewBox="0 0 100 100" class="w-4 h-4 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="46" fill="#0b2545" stroke="#f59e0b" stroke-width="4"/>
                                <circle cx="50" cy="50" r="20" fill="#1e3a8a"/>
                                <g stroke="#38bdf8" stroke-width="2.5">
                                    <line x1="50" y1="12" x2="50" y2="88"/>
                                    <line x1="12" y1="50" x2="88" y2="50"/>
                                    <line x1="23" y1="23" x2="77" y2="77"/>
                                    <line x1="23" y1="77" x2="77" y2="23"/>
                                </g>
                                <circle cx="50" cy="50" r="8" fill="#f59e0b"/>
                            </svg>
                            <span class="text-amber-800 font-devanagari font-black tracking-wide">सत्यमेव जयते</span>
                            <span class="text-slate-300">•</span>
                            <span class="text-slate-700">राष्ट्रीय नागरिक शिकायत एवं निवारण प्रणाली</span>
                            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>

                        <!-- Main Bilingual Indian Headline -->
                        <div>
                            <span class="font-devanagari font-black text-2xl sm:text-3xl text-orange-700 tracking-wide block mb-1">
                                आपकी आवाज़ • आपका शहर • आपका समाधान
                            </span>
                            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                                Smart AI Civic Redressal for<br/>
                                <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700">
                                    Indian Cities & Municipalities
                                </span>
                            </h1>
                        </div>

                        <p class="text-base sm:text-lg text-slate-700 leading-relaxed font-normal max-w-2xl">
                            Report waste accumulation, potholes, power outages, and public civil grievances directly to your Municipal Corporation & Ward Officers. Verified with geo-tagging, duplicate detection, and live transparent tracking.
                        </p>

                        <!-- Action CTA Buttons with Indian Aesthetic -->
                        <div class="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                            <button onclick="App.openReportModal()" class="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-orange-500/25 hover:from-orange-700 hover:to-amber-700 hover:shadow-xl hover:shadow-orange-500/35 transform hover:-translate-y-0.5 transition flex items-center justify-center space-x-2 border border-orange-400/40">
                                <svg class="w-5 h-5 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>समस्या दर्ज करें (Report Issue)</span>
                            </button>

                            <button onclick="App.navigate('track')" class="px-7 py-3.5 rounded-2xl bg-white/95 border-2 border-slate-300 text-slate-800 font-extrabold text-sm sm:text-base shadow-xs hover:bg-amber-50 hover:border-amber-400 transition flex items-center justify-center space-x-2">
                                <svg class="w-5 h-5 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span>स्थिति जांचें (Track Status)</span>
                            </button>
                        </div>

                        <!-- Fast Demo Search Box -->
                        <div class="pt-1 max-w-lg">
                            <form onsubmit="Home.handleQuickTrack(event)" class="relative flex items-center">
                                <input id="quick-track-input" type="text" placeholder="Enter Complaint ID (e.g. JS-2026-000101)..."
                                       class="w-full pl-4 pr-24 py-3 rounded-2xl border-2 border-amber-300/80 bg-white/95 shadow-sm text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-500" />
                                <button type="submit" class="absolute right-1.5 px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition">
                                    Track
                                </button>
                            </form>
                        </div>

                        <!-- 3 Civic Trust Features -->
                        <div class="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                            <span class="inline-flex items-center space-x-1.5 bg-white/90 px-3 py-1.5 rounded-xl border border-amber-200">
                                <span>🛡️</span>
                                <span>100% Masked Privacy</span>
                            </span>
                            <span class="inline-flex items-center space-x-1.5 bg-white/90 px-3 py-1.5 rounded-xl border border-amber-200">
                                <span>📍</span>
                                <span>GPS Geo-tagged</span>
                            </span>
                            <span class="inline-flex items-center space-x-1.5 bg-white/90 px-3 py-1.5 rounded-xl border border-amber-200">
                                <span>⚡</span>
                                <span>Ward Officer Routing</span>
                            </span>
                        </div>
                    </div>

                    <!-- Right Column: Authentic Indian Citizens Illustration & Civic Pride Card (5 cols) -->
                    <div class="lg:col-span-5">
                        <div class="relative bg-white/95 rounded-3xl p-3 border-2 border-amber-300/80 shadow-2xl overflow-hidden group">
                            <!-- Top Indian Tricolor Ribbon -->
                            <div class="h-2 w-full rounded-t-xl bg-gradient-to-r from-orange-500 via-white to-emerald-600 mb-2"></div>

                            <!-- Indian Citizens Illustration -->
                            <div class="w-full rounded-2xl overflow-hidden border border-amber-200/60 shadow-inner bg-slate-50">
                                <img src="/images/indian_citizens_hero.svg" alt="JanSahayak Indian Citizens and Civic Redressal" class="w-full h-auto object-cover transform group-hover:scale-[1.02] transition duration-300" />
                            </div>

                            <!-- Card Caption & Live Civic Badge -->
                            <div class="pt-3 px-2 flex items-center justify-between text-xs">
                                <div>
                                    <span class="font-devanagari font-black text-slate-900 block text-sm">जनसहयोग से स्वच्छ और सुरक्षित शहर</span>
                                    <span class="text-[11px] text-slate-500">Citizen Participation • Municipal Action</span>
                                </div>
                                <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] flex items-center space-x-1">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span>Live 24x7</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Four Main Complaint Categories with Indian Civic Symbols -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div class="text-center max-w-3xl mx-auto mb-12">
                <span class="text-xs font-extrabold uppercase tracking-widest text-orange-800 bg-orange-100/80 border border-orange-200 px-3.5 py-1 rounded-full">
                    नागरिक सेवाएं • Civic Redressal Domains
                </span>
                <h2 class="text-3xl font-black text-slate-900 mt-3 font-devanagari">आप किस समस्या की शिकायत दर्ज करना चाहते हैं?</h2>
                <p class="text-slate-600 mt-2 text-sm sm:text-base">
                    Select your civic grievance category. Our automated AI engine inspects photos, pinpoints the municipal ward, and routes the ticket directly to the nodal officer.
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- 1. Waste Management (Swachh Bharat) -->
                <div class="category-card category-waste rounded-3xl p-6 shadow-sm flex flex-col justify-between border border-emerald-100">
                    <div class="indian-corner-accent"></div>
                    <div>
                        <div class="w-14 h-14 rounded-2xl bg-emerald-50 border-2 border-emerald-300 p-2 flex items-center justify-center mb-4 shadow-sm">
                            <svg viewBox="0 0 64 64" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="32" cy="32" r="28" fill="#D1FAE5" stroke="#10B981" stroke-width="2"/>
                                <path d="M22 26L25 50C25 51.1 25.9 52 27 52H37C38.1 52 39 51.1 39 50L42 26" fill="#059669"/>
                                <rect x="20" y="21" width="24" height="5" rx="2" fill="#047857"/>
                                <path d="M28 21V18C28 17.4 28.4 17 29 17H35C35.6 17 36 17.4 36 18V21" stroke="#047857" stroke-width="2.2"/>
                                <circle cx="28" cy="34" r="3.5" fill="#FFFFFF" stroke="#047857" stroke-width="1.6"/>
                                <circle cx="36" cy="34" r="3.5" fill="#FFFFFF" stroke="#047857" stroke-width="1.6"/>
                                <path d="M31.5 34H32.5" stroke="#047857" stroke-width="1.6"/>
                                <path d="M43 14C46 14 49 16 49 19C46 19 43 17 43 14Z" fill="#10B981"/>
                                <circle cx="50" cy="23" r="2.5" fill="#F59E0B"/>
                            </svg>
                        </div>
                        <span class="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full font-devanagari">स्वच्छ भारत अभियान</span>
                        <h3 class="text-base font-extrabold text-slate-900 mt-2 mb-1.5">अपशिष्ट एवं स्वच्छता<br/><span class="text-xs font-bold text-slate-600">Waste Management</span></h3>
                        <p class="text-xs text-slate-600 mb-4 leading-relaxed">
                            Report garbage piles, overflowing public dustbins, illegal dumping, and choked drains.
                        </p>
                        <ul class="text-xs text-slate-600 space-y-1.5 mb-6">
                            <li class="flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>Overflowing community dustbins</li>
                            <li class="flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>Illegal commercial dumping</li>
                            <li class="flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>Uncollected household waste</li>
                            <li class="flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>Drainage blocked by trash</li>
                        </ul>
                    </div>
                    <button onclick="App.openReportModal({ category: 'Waste Management' })"
                            class="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition flex items-center justify-center space-x-1.5 border border-emerald-200">
                        <span>Report Waste Issue • शिकायत करें</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                </div>

                <!-- 2. Traffic Management (Vahan & Road Suraksha) -->
                <div class="category-card category-traffic rounded-3xl p-6 shadow-sm flex flex-col justify-between border border-amber-100">
                    <div class="indian-corner-accent"></div>
                    <div>
                        <div class="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-300 p-2 flex items-center justify-center mb-4 shadow-sm">
                            <svg viewBox="0 0 64 64" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="32" cy="32" r="28" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/>
                                <path d="M32 11L47 17V33C47 42 40 50 32 53C24 50 17 42 17 33V17L32 11Z" fill="#B45309"/>
                                <path d="M32 14L44 19V32C44 40 38.5 47 32 50C25.5 47 20 40 20 32V19L32 14Z" fill="#D97706"/>
                                <rect x="27" y="21" width="10" height="24" rx="4" fill="#1E293B"/>
                                <circle cx="32" cy="25" r="2.8" fill="#EF4444"/>
                                <circle cx="32" cy="33" r="2.8" fill="#FBBF24"/>
                                <circle cx="32" cy="41" r="2.8" fill="#10B981"/>
                            </svg>
                        </div>
                        <div class="flex items-center justify-between mb-1.5">
                            <span class="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full font-devanagari">सड़क सुरक्षा</span>
                            <span class="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Urgent Flag</span>
                        </div>
                        <h3 class="text-base font-extrabold text-slate-900 mb-1.5">यातायात एवं सड़क सुरक्षा<br/><span class="text-xs font-bold text-slate-600">Traffic Management</span></h3>
                        <p class="text-xs text-slate-600 mb-4 leading-relaxed">
                            Signal blackouts, dangerous potholes, illegal encroachment, and damaged road dividers.
                        </p>
                        <ul class="text-xs text-slate-600 space-y-1.5 mb-6">
                            <li class="flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>Traffic signal blackout/malfunction</li>
                            <li class="flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>Hazardous potholes & craters</li>
                            <li class="flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>Illegal parking & encroachment</li>
                            <li class="flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>Broken dividers & traffic signs</li>
                        </ul>
                    </div>
                    <button onclick="App.openReportModal({ category: 'Traffic Management' })"
                            class="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition flex items-center justify-center space-x-1.5 border border-amber-200">
                        <span>Report Road Hazard • शिकायत करें</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                </div>

                <!-- 3. Energy Issues (Vidyut Board) -->
                <div class="category-card category-energy rounded-3xl p-6 shadow-sm flex flex-col justify-between border border-purple-100">
                    <div class="indian-corner-accent"></div>
                    <div>
                        <div class="w-14 h-14 rounded-2xl bg-purple-50 border-2 border-purple-300 p-2 flex items-center justify-center mb-4 shadow-sm">
                            <svg viewBox="0 0 64 64" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="32" cy="32" r="28" fill="#F3E8FF" stroke="#A855F7" stroke-width="2"/>
                                <path d="M23 52V22C23 16 27 13 33 13C37 13 41 15 41 19H45" stroke="#6B21A8" stroke-width="3" stroke-linecap="round"/>
                                <path d="M39 19H47L45 24H41L39 19Z" fill="#7E22CE"/>
                                <path d="M40 24L33 38H53L46 24Z" fill="#FDE047" opacity="0.45"/>
                                <path d="M33 21L22 36H31L27 50L43 32H33L38 21H33Z" fill="#EAB308" stroke="#A16207" stroke-width="1.5" stroke-linejoin="round"/>
                                <circle cx="48" cy="34" r="2.5" fill="#F97316"/>
                            </svg>
                        </div>
                        <span class="text-[11px] font-bold text-purple-800 bg-purple-100/80 px-2 py-0.5 rounded-full font-devanagari">विद्युत एवं प्रकाश व्यवस्था</span>
                        <h3 class="text-base font-extrabold text-slate-900 mt-2 mb-1.5">ऊर्जा एवं स्ट्रीट लाइट<br/><span class="text-xs font-bold text-slate-600">Energy & Power Issues</span></h3>
                        <p class="text-xs text-slate-600 mb-3 leading-relaxed">
                            Dark streetlights, severed power lines, transformer faults, and electrical hazards.
                        </p>
                        <!-- Electrical Warning Badge -->
                        <div class="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-800 mb-3 font-semibold">
                            ⚡ <strong>चेतावनी / Safety:</strong> Do not approach fallen cables or sparking poles.
                        </div>
                        <ul class="text-xs text-slate-600 space-y-1.5 mb-6">
                            <li class="flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2"></span>Streetlight circuit failure</li>
                            <li class="flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2"></span>Exposed high-tension live wire</li>
                            <li class="flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2"></span>Damaged transformer / junction box</li>
                            <li class="flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2"></span>Persistent neighborhood blackout</li>
                        </ul>
                    </div>
                    <button onclick="App.openReportModal({ category: 'Energy Issues' })"
                            class="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition flex items-center justify-center space-x-1.5 border border-purple-200">
                        <span>Report Energy Issue • शिकायत करें</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                </div>

                <!-- 4. Miscellaneous Public Grievances (Nagar Nigam) -->
                <div class="category-card category-misc rounded-3xl p-6 shadow-sm flex flex-col justify-between border border-blue-100">
                    <div class="indian-corner-accent"></div>
                    <div>
                        <div class="w-14 h-14 rounded-2xl bg-blue-50 border-2 border-blue-300 p-2 flex items-center justify-center mb-4 shadow-sm">
                            <svg viewBox="0 0 64 64" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="32" cy="32" r="28" fill="#DBEAFE" stroke="#3B82F6" stroke-width="2"/>
                                <path d="M19 35H45V49C45 50.1 44.1 51 43 51H21C19.9 51 19 50.1 19 49V35Z" fill="#1D4ED8"/>
                                <path d="M19 35C19 26 24.5 20 32 18C39.5 20 45 26 45 35H19Z" fill="#2563EB"/>
                                <path d="M32 12V18" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
                                <circle cx="32" cy="11" r="2.5" fill="#F59E0B"/>
                                <rect x="23" y="37" width="3" height="11" rx="1" fill="#FFFFFF" opacity="0.9"/>
                                <rect x="30.5" y="37" width="3" height="11" rx="1" fill="#FFFFFF" opacity="0.9"/>
                                <rect x="38" y="37" width="3" height="11" rx="1" fill="#FFFFFF" opacity="0.9"/>
                                <path d="M48 29C48 33.4 44.4 37 40 37C35.6 37 32 33.4 32 29C32 24.5 40 18 40 18C40 18 48 24.5 48 29Z" fill="#06B6D4" stroke="#0891B2" stroke-width="1" opacity="0.95"/>
                            </svg>
                        </div>
                        <span class="text-[11px] font-bold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-full font-devanagari">नागरिक एवं विविध सेवाएं • Civil & Misc</span>
                        <h3 class="text-base font-extrabold text-slate-900 mt-2 mb-1.5">नागरिक एवं विविध जन शिकायतें<br/><span class="text-xs font-bold text-slate-600">Civil & Miscellaneous Grievances</span></h3>
                        <p class="text-xs text-slate-600 mb-4 leading-relaxed">
                            Public property, parks, drainage, civic facilities, government services, and local civil amenities.
                        </p>
                        <ul class="text-xs text-slate-600 space-y-1.5 mb-6">
                            <li class="flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>Water supply & pipeline leakages (Civil)</li>
                            <li class="flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>Damaged public property & parks</li>
                            <li class="flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>Drainage, sewage & manhole issues</li>
                            <li class="flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>Public toilets & municipal amenities</li>
                        </ul>
                    </div>
                    <button onclick="App.openReportModal({ category: 'Miscellaneous Public Grievances' })"
                            class="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold transition flex items-center justify-center space-x-1.5 border border-blue-200">
                        <span>Report Civil / Misc Issue • शिकायत करें</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                </div>
            </div>
        </section>

        <!-- How It Works Section -->
        <section class="bg-white/60 backdrop-blur-xs border-y border-amber-900/10 py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center max-w-2xl mx-auto mb-12">
                    <span class="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-3 py-1 rounded-full">Transparent Process</span>
                    <h2 class="text-3xl font-extrabold text-slate-900 mt-2">How JanSahayak AI Operates</h2>
                    <p class="text-slate-600 mt-2 text-sm">
                        From submission to field verification: four transparent stages ensuring citizen accountability.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                    <!-- Step 1 -->
                    <div class="bg-white p-6 rounded-2xl border border-slate-200 text-center relative shadow-2xs">
                        <div class="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                            1
                        </div>
                        <h4 class="font-bold text-slate-900 text-base mb-2">Citizen Reports</h4>
                        <p class="text-xs text-slate-600 leading-relaxed">
                            Pin your location on the map, describe the problem, and upload photo evidence.
                        </p>
                    </div>

                    <!-- Step 2 -->
                    <div class="bg-white p-6 rounded-2xl border border-slate-200 text-center relative shadow-2xs">
                        <div class="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                            2
                        </div>
                        <h4 class="font-bold text-slate-900 text-base mb-2">AI Analyzes & Routes</h4>
                        <p class="text-xs text-slate-600 leading-relaxed">
                            AI validates duplicate reports, calculates priority level, and routes directly to the nodal officer.
                        </p>
                    </div>

                    <!-- Step 3 -->
                    <div class="bg-white p-6 rounded-2xl border border-slate-200 text-center relative shadow-2xs">
                        <div class="w-12 h-12 rounded-2xl bg-amber-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                            3
                        </div>
                        <h4 class="font-bold text-slate-900 text-base mb-2">Field Staff Action</h4>
                        <p class="text-xs text-slate-600 leading-relaxed">
                            Authorized personnel post timestamped progress updates, photos, and estimated resolution schedules.
                        </p>
                    </div>

                    <!-- Step 4 -->
                    <div class="bg-white p-6 rounded-2xl border border-slate-200 text-center relative shadow-2xs">
                        <div class="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                            4
                        </div>
                        <h4 class="font-bold text-slate-900 text-base mb-2">Citizen Verification</h4>
                        <p class="text-xs text-slate-600 leading-relaxed">
                            Complainant confirms if the problem was fixed or can request a reopen with a single click.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Public Statistics Dashboard -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-slate-200">
                <div>
                    <div class="flex items-center space-x-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                        <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Live Municipal Metrics</span>
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Public Grievance Dashboard</h2>
                </div>
                <div class="mt-4 sm:mt-0 flex items-center space-x-3">
                    <span class="text-xs text-slate-500 font-medium">Demonstration Data:</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input id="toggle-demo-stats" type="checkbox" checked onchange="Home.toggleDemoData(this.checked)" class="sr-only peer">
                        <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>

            <!-- KPI Metric Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <div class="text-xs font-bold uppercase text-slate-400">Total Grievances</div>
                    <div id="stat-total" class="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">--</div>
                    <div class="text-[11px] text-slate-500 mt-1">Logged across municipal wards</div>
                </div>

                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <div class="text-xs font-bold uppercase text-emerald-600">Resolved Complaints</div>
                    <div id="stat-resolved" class="text-3xl sm:text-4xl font-extrabold text-emerald-600 mt-2">--</div>
                    <div id="stat-percent" class="text-[11px] text-emerald-700 font-semibold mt-1">--% resolution rate</div>
                </div>

                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <div class="text-xs font-bold uppercase text-amber-600">In Active Progress</div>
                    <div id="stat-progress" class="text-3xl sm:text-4xl font-extrabold text-amber-600 mt-2">--</div>
                    <div class="text-[11px] text-slate-500 mt-1">Field teams deployed</div>
                </div>

                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <div class="text-xs font-bold uppercase text-blue-600">Intake / Pending</div>
                    <div id="stat-pending" class="text-3xl sm:text-4xl font-extrabold text-blue-600 mt-2">--</div>
                    <div class="text-[11px] text-slate-500 mt-1">Under review & assignment</div>
                </div>
            </div>

            <!-- Interactive Public Map & Category Breakdown -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Map View (2 columns) -->
                <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h3 class="font-bold text-slate-900 text-base">Civic Complaints Geographic Heatmap</h3>
                            <p class="text-xs text-slate-500">Approximate locations shown for public transparency & citizen privacy.</p>
                        </div>
                        <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">OpenStreetMap</span>
                    </div>
                    <div id="public-civic-map" class="h-96 w-full rounded-xl border border-slate-200 overflow-hidden"></div>
                </div>

                <!-- Category Breakdown (1 column) -->
                <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <h3 class="font-bold text-slate-900 text-base mb-4">Grievance Distribution</h3>
                        <div id="category-bars" class="space-y-4">
                            <!-- Populated dynamically -->
                            <p class="text-xs text-slate-400">Loading breakdown...</p>
                        </div>
                    </div>

                    <div class="mt-6 pt-4 border-t border-slate-100 bg-slate-50/80 -mx-5 -mb-5 p-4 rounded-b-2xl text-[11px] text-slate-500 leading-relaxed">
                        🔒 <strong>Privacy Assurance:</strong> Citizen phone numbers and precise personal addresses are strictly masked on the public transparency map per Municipal Data Protection Guidelines.
                    </div>
                </div>
            </div>
        </section>
        `;
    },

    async afterMount() {
        await this.loadStats(true);
    },

    async loadStats(includeDemo = true) {
        try {
            const data = await API.stats.getPublic(includeDemo);
            this.statsData = data;

            // Update Counters
            const sTotal = document.getElementById('stat-total');
            const sResolved = document.getElementById('stat-resolved');
            const sPercent = document.getElementById('stat-percent');
            const sProgress = document.getElementById('stat-progress');
            const sPending = document.getElementById('stat-pending');

            if (sTotal) sTotal.textContent = data.summary.totalComplaints;
            if (sResolved) sResolved.textContent = data.summary.resolvedComplaints;
            if (sPercent) sPercent.textContent = `${data.summary.resolutionPercentage}% resolution rate`;
            if (sProgress) sProgress.textContent = data.summary.inProgressComplaints;
            if (sPending) sPending.textContent = data.summary.pendingComplaints;

            // Render Category Bars
            const barsContainer = document.getElementById('category-bars');
            if (barsContainer && data.categoryBreakdown) {
                const total = Math.max(1, data.summary.totalComplaints);
                const categories = [
                    { name: 'Waste Management', color: 'bg-emerald-500', icon: '🗑️' },
                    { name: 'Traffic Management', color: 'bg-amber-500', icon: '🚦' },
                    { name: 'Energy Issues', color: 'bg-purple-500', icon: '⚡' },
                    { name: 'Miscellaneous Public Grievances', color: 'bg-blue-500', icon: '🏛️' }
                ];

                barsContainer.innerHTML = categories.map(cat => {
                    const count = (data.categoryBreakdown[cat.name] && data.categoryBreakdown[cat.name].total) || 0;
                    const pct = Math.round((count / total) * 100);
                    return `
                        <div>
                            <div class="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                                <span class="truncate">${cat.icon} ${cat.name.replace('Miscellaneous Public Grievances', 'Miscellaneous')}</span>
                                <span class="text-slate-900">${count} (${pct}%)</span>
                            </div>
                            <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div class="h-full rounded-full ${cat.color}" style="width: ${pct}%"></div>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            // Initialize or update Leaflet map
            this.renderPublicMap(data.publicMarkers || []);
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    },

    toggleDemoData(include) {
        this.loadStats(include);
    },

    renderPublicMap(markers) {
        const mapEl = document.getElementById('public-civic-map');
        if (!mapEl || typeof L === 'undefined') return;

        if (this.mapInstance) {
            this.mapInstance.remove();
            this.mapInstance = null;
        }

        // Center on India (Delhi default)
        this.mapInstance = L.map('public-civic-map').setView([28.6139, 77.2090], 11);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.mapInstance);

        const group = [];

        markers.forEach(m => {
            if (m.latitude && m.longitude) {
                const color = m.category === 'Waste Management' ? '#10b981'
                            : m.category === 'Traffic Management' ? '#f59e0b'
                            : m.category === 'Energy Issues' ? '#8b5cf6' : '#3b82f6';

                const marker = L.circleMarker([m.latitude, m.longitude], {
                    radius: 7,
                    fillColor: color,
                    color: '#ffffff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.85
                }).addTo(this.mapInstance);

                marker.bindPopup(`
                    <div style="font-family: inherit; font-size: 12px; max-width: 200px;">
                        <strong style="color: #0f172a;">${m.complaint_number}</strong><br/>
                        <span style="color: ${color}; font-weight: bold;">${m.category}</span><br/>
                        <span style="color: #475569;">${m.subcategory || ''}</span><br/>
                        <div style="margin-top: 4px; font-size: 11px; color: #64748b;">Status: <strong>${m.current_status}</strong></div>
                        <button onclick="App.navigate('track', { complaintNumber: '${m.complaint_number}' })"
                                style="margin-top: 6px; background: #1e40af; color: #fff; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px; font-weight: bold;">
                            Track Details
                        </button>
                    </div>
                `);

                group.push([m.latitude, m.longitude]);
            }
        });

        if (group.length > 0) {
            this.mapInstance.fitBounds(group, { padding: [20, 20], maxZoom: 13 });
        }
    },

    handleQuickTrack(e) {
        e.preventDefault();
        const input = document.getElementById('quick-track-input');
        if (input && input.value.trim()) {
            App.navigate('track', { complaintNumber: input.value.trim() });
        }
    }
};

window.Home = Home;
