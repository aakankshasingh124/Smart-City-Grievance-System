// Footer Component with Indian Civic Aesthetic
const Footer = {
    render() {
        return `
        <div class="tiranga-top-bar mt-20"></div>
        <footer class="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-amber-900/20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
                    <!-- Brand Info -->
                    <div class="space-y-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 rounded-full bg-white p-0.5 emblem-ring shrink-0 flex items-center justify-center">
                                <svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                            </div>
                            <div>
                                <span class="font-black text-xl text-white tracking-tight font-devanagari">जनसहायक AI</span>
                                <span class="block text-[10px] text-amber-400 font-bold uppercase tracking-wider">सत्यमेव जयते • Digital India</span>
                            </div>
                        </div>
                        <p class="text-xs text-slate-400 leading-relaxed">
                            A transparent civic redressal bridge connecting citizens across Indian cities with Municipal Corporations, Electricity Boards, and Traffic Police Authorities.
                        </p>
                        <p class="text-xs text-amber-300/80 font-devanagari font-semibold">
                            "आपकी आवाज़, आपका शहर, आपका समाधान"
                        </p>
                    </div>

                    <!-- Quick Navigation -->
                    <div>
                        <h4 class="text-amber-400 text-xs font-bold tracking-widest uppercase mb-4 font-devanagari">त्वरित लिंक • Quick Links</h4>
                        <ul class="space-y-2 text-xs text-slate-400">
                            <li><button onclick="App.navigate('home')" class="hover:text-white transition">Home / मुख्य पृष्ठ</button></li>
                            <li><button onclick="App.openReportModal()" class="hover:text-orange-400 transition font-bold text-amber-300">शिकायत दर्ज करें (Report Grievance)</button></li>
                            <li><button onclick="App.navigate('track')" class="hover:text-white transition">शिकायत की स्थिति (Track Status)</button></li>
                            <li><button onclick="App.openModal('citizen-login')" class="hover:text-white transition">Citizen Portal Login</button></li>
                            <li><button onclick="App.openModal('staff-login')" class="hover:text-white transition">Authorized Ward Staff Portal</button></li>
                        </ul>
                    </div>

                    <!-- Complaint Domains -->
                    <div>
                        <h4 class="text-amber-400 text-xs font-bold tracking-widest uppercase mb-4 font-devanagari">नागरिक श्रेणियां • Civic Domains</h4>
                        <ul class="space-y-2 text-xs text-slate-400">
                            <li><button onclick="App.openReportModal({ category: 'Waste Management' })" class="hover:text-emerald-400 transition flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>अपशिष्ट एवं स्वच्छता (Waste)</button></li>
                            <li><button onclick="App.openReportModal({ category: 'Traffic Management' })" class="hover:text-amber-400 transition flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>यातायात व सड़क सुरक्षा (Traffic)</button></li>
                            <li><button onclick="App.openReportModal({ category: 'Energy Issues' })" class="hover:text-purple-400 transition flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2"></span>विद्युत एवं प्रकाश (Energy)</button></li>
                            <li><button onclick="App.openReportModal({ category: 'Miscellaneous Public Grievances' })" class="hover:text-blue-400 transition flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>नागरिक एवं विविध सेवाएं (Civil & Misc)</button></li>
                        </ul>
                    </div>

                    <!-- Civic Helplines & Emergency -->
                    <div>
                        <h4 class="text-amber-400 text-xs font-bold tracking-widest uppercase mb-4 font-devanagari">आपातकालीन सेवाएं • Emergency Helplines</h4>
                        <div class="p-3.5 rounded-2xl bg-slate-900 border border-amber-900/40 text-xs space-y-2.5 text-slate-300 shadow-inner">
                            <div class="flex items-center space-x-1.5 text-amber-400 font-bold text-[11px]">
                                <span>⚠️</span>
                                <span>Immediate Life/Accident Hazard?</span>
                            </div>
                            <p class="text-[10px] text-slate-400">Do not wait for online ticket review. Dial 24x7 toll-free emergency responders:</p>
                            <div class="grid grid-cols-2 gap-1.5 font-mono text-[11px] pt-1">
                                <span class="bg-slate-950 px-2 py-1.5 rounded-lg text-center border border-slate-800 text-amber-200">Police: 112</span>
                                <span class="bg-slate-950 px-2 py-1.5 rounded-lg text-center border border-slate-800 text-red-300">Fire: 101</span>
                                <span class="bg-slate-950 px-2 py-1.5 rounded-lg text-center border border-slate-800 text-emerald-300">Ambulance: 108</span>
                                <span class="bg-slate-950 px-2 py-1.5 rounded-lg text-center border border-slate-800 text-yellow-300">Power: 1912</span>
                            </div>
                            <div class="text-[10px] text-center text-slate-400 pt-0.5 border-t border-slate-800 font-mono">
                                Jal Seva Helpline: <strong class="text-white">1916</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
                    <div class="flex items-center space-x-2">
                        <svg viewBox="0 0 100 100" class="w-5 h-5 shrink-0 opacity-80" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="46" fill="#1e293b" stroke="#f59e0b" stroke-width="3"/>
                            <g stroke="#38bdf8" stroke-width="2.5">
                                <line x1="50" y1="12" x2="50" y2="88"/>
                                <line x1="12" y1="50" x2="88" y2="50"/>
                                <line x1="23" y1="23" x2="77" y2="77"/>
                                <line x1="23" y1="77" x2="77" y2="23"/>
                            </g>
                            <circle cx="50" cy="50" r="7" fill="#f59e0b"/>
                        </svg>
                        <p>© 2026 JanSahayak AI • जनहितैषी नागरिक सेवा • Government & Municipal Civic Tech Standards</p>
                    </div>
                    <div class="flex space-x-6 mt-4 sm:mt-0 font-medium">
                        <button onclick="App.openModal('privacy')" class="hover:text-amber-400 transition">गोपनीयता नीति (Privacy)</button>
                        <button onclick="App.openModal('terms')" class="hover:text-amber-400 transition">नागरिक चार्टर (Terms)</button>
                        <button onclick="App.openModal('contact')" class="hover:text-amber-400 transition">सहायता कक्ष (Helpdesk)</button>
                    </div>
                </div>
            </div>
        </footer>
        `;
    }
};

window.Footer = Footer;
