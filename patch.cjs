const fs = require('fs');
let code = fs.readFileSync('src/components/common/Header.tsx', 'utf8');

const target = `            <a
              href="https://wa.me/918848276403?text=Hi%207Seasonsplants%20Team,%20I%20have%20an%20inquiry%20about%20your%20plants"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-2 text-xs font-medium text-emerald-950 dark:text-emerald-50 bg-emerald-50 dark:bg-[#0a1f18] hover:bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-900/10 dark:border-emerald-900/40 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>+91 88482 76403</span>
            </a>
            {/* Theme Toggle Button */}`;

const replacement = `            <a
              href="https://wa.me/918848276403?text=Hi%207Seasonsplants%20Team,%20I%20have%20an%20inquiry%20about%20your%20plants"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-2 text-xs font-medium text-emerald-950 dark:text-emerald-50 bg-emerald-50 dark:bg-[#0a1f18] hover:bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-900/10 dark:border-emerald-900/40 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>+91 88482 76403</span>
            </a>

            {/* Delivery State Selector */}
            <div className="relative hidden lg:block" ref={stateDropdownRef}>
              <button
                onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-950 dark:text-emerald-50 hover:bg-emerald-50 dark:bg-[#0a1f18] transition-colors cursor-pointer border border-transparent hover:border-emerald-900/10 dark:hover:border-emerald-900/40"
                title="Select Delivery State"
              >
                <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span className="truncate max-w-[120px]">
                  {selectedDeliveryState || 'Deliver to...'}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {isStateDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#06120e] rounded-2xl shadow-xl border border-emerald-900/10 dark:border-emerald-900/40 overflow-hidden z-50 py-2">
                  <div className="px-4 py-2 border-b border-emerald-900/10 dark:border-emerald-900/40">
                    <p className="text-[10px] font-bold text-emerald-800/60 dark:text-emerald-400/60 uppercase tracking-wider">Choose your state</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1">
                    <button
                      onClick={() => {
                        setSelectedDeliveryState(null);
                        setIsStateDropdownOpen(false);
                      }}
                      className={\`w-full text-left px-3 py-2 text-sm rounded-xl transition-colors cursor-pointer \${
                        !selectedDeliveryState 
                          ? 'bg-emerald-50 dark:bg-[#0a1f18] font-bold text-emerald-950 dark:text-emerald-50' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }\`}
                    >
                      All States
                    </button>
                    {storeSettings.supportedStates?.map(stateName => (
                      <button
                        key={stateName}
                        onClick={() => {
                          setSelectedDeliveryState(stateName);
                          setIsStateDropdownOpen(false);
                        }}
                        className={\`w-full text-left px-3 py-2 text-sm rounded-xl transition-colors cursor-pointer \${
                          selectedDeliveryState === stateName 
                            ? 'bg-emerald-50 dark:bg-[#0a1f18] font-bold text-emerald-950 dark:text-emerald-50' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }\`}
                      >
                        {stateName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/common/Header.tsx', code);
