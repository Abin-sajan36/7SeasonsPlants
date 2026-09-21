import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Check,
  X,
  Sparkles,
  Truck,
  ShieldCheck,
  Search,
  ChevronRight,
  Leaf,
  Navigation,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface StateOption {
  name: string;
  badge: string;
  badgeColor: string;
  transitTime: string;
  description: string;
  isHomeState?: boolean;
  featured?: boolean;
}

const PRIMARY_STATES: StateOption[] = [
  {
    name: 'Kerala',
    badge: 'Home Nursery',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    transitTime: '1 - 2 Days Express',
    description: '100% Full Nursery Catalog Available • Live Saplings, Hibiscus, Bonsai & All Curated Combos.',
    isHomeState: true,
    featured: true,
  },
  {
    name: 'Tamil Nadu',
    badge: 'Direct Express',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    transitTime: '2 - 3 Days Transit',
    description: 'Acclimated Flowering Varieties, Drought-Tolerant Tropicals & Curated Combos.',
    featured: true,
  },
  {
    name: 'Karnataka',
    badge: 'Fast Delivery',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    transitTime: '2 - 3 Days Transit',
    description: 'Indoor Air-Purifiers, Balcony Garden Bundles & Peat-Rooted Jiffy Plant Packs.',
    featured: true,
  },
  {
    name: 'All India',
    badge: 'Air Parcel',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    transitTime: '3 - 5 Days Air',
    description: 'Transit-Hardy Indoor Plants, Zero-Shock Jiffy Pellets, Succulents, Bonsai & Care Guides.',
    featured: true,
  },
];

const OTHER_INDIAN_STATES = [
  'Andhra Pradesh',
  'Telangana',
  'Maharashtra',
  'Goa',
  'Gujarat',
  'Delhi NCR',
  'Rajasthan',
  'Punjab',
  'Haryana',
  'Uttar Pradesh',
  'West Bengal',
  'Madhya Pradesh',
  'Odisha',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Uttarakhand',
];

export const StateSelectionModal: React.FC = () => {
  const {
    selectedDeliveryState,
    setSelectedDeliveryState,
    isStateModalOpen,
    setIsStateModalOpen,
    combos,
    products,
  } = useStore();

  const [activeChoice, setActiveChoice] = useState<string>(selectedDeliveryState || 'Kerala');
  const [searchQuery, setSearchQuery] = useState('');

  // 3-SECOND AUTOMATIC POPUP LOGIC
  useEffect(() => {
    // Check if user has already made a selection or seen the modal in this session
    const savedState = localStorage.getItem('7seasons_deliveryState');
    const hasPrompted = sessionStorage.getItem('7seasons_state_popup_shown');

    if (!savedState && !hasPrompted) {
      const timer = setTimeout(() => {
        setIsStateModalOpen(true);
        sessionStorage.setItem('7seasons_state_popup_shown', 'true');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [setIsStateModalOpen]);

  // Sync internal state when modal opens
  useEffect(() => {
    if (isStateModalOpen) {
      setActiveChoice(selectedDeliveryState || 'Kerala');
      setSearchQuery('');
    }
  }, [isStateModalOpen, selectedDeliveryState]);

  // Close with Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isStateModalOpen) {
        setIsStateModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStateModalOpen, setIsStateModalOpen]);

  // Calculate available item count for a given state
  const getItemCountForState = (stateName: string) => {
    const matchingCombos = combos.filter((c) => {
      if (c.status !== 'published') return false;
      if (!c.sellableStates || c.sellableStates.length === 0) return true;
      if (stateName === 'All India') return true;
      return c.sellableStates.includes(stateName) || c.sellableStates.includes('All India');
    }).length;

    const matchingProducts = products.filter((p) => {
      if (p.status !== 'published') return false;
      if (!p.sellableStates || p.sellableStates.length === 0) return true;
      if (stateName === 'All India') return true;
      return p.sellableStates.includes(stateName) || p.sellableStates.includes('All India');
    }).length;

    return { combos: matchingCombos, products: matchingProducts, total: matchingCombos + matchingProducts };
  };

  // Filter other states if user searches
  const filteredOtherStates = useMemo(() => {
    if (!searchQuery.trim()) return OTHER_INDIAN_STATES;
    const q = searchQuery.toLowerCase().trim();
    return OTHER_INDIAN_STATES.filter((s) => s.toLowerCase().includes(q));
  }, [searchQuery]);

  const handleApplyState = (stateToApply: string) => {
    setSelectedDeliveryState(stateToApply);
    setIsStateModalOpen(false);
    sessionStorage.setItem('7seasons_state_popup_shown', 'true');
  };

  if (!isStateModalOpen) return null;

  return (
    <div
      id="state-selection-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsStateModalOpen(false);
        }
      }}
    >
      <div
        id="state-selection-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="state-selection-title"
        className="bg-white dark:bg-[#06120e] rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-emerald-900/15 dark:border-emerald-900/40 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="relative bg-gradient-to-br from-[#062919] via-[#0D4A2B] to-[#0A3D22] text-white p-6 sm:p-7 shrink-0">
          {/* Close button */}
          <button
            id="close-state-modal-btn"
            onClick={() => setIsStateModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close location selector"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-400/30 text-[#A7F3D0] text-xs font-bold uppercase tracking-wider mb-3">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span>State-Based Plant Availability</span>
          </div>

          <h2 id="state-selection-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Where Should We Deliver Your Plants?
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1.5 leading-relaxed">
            Live nursery plants require specialized climate packaging and rapid transit. Select your state to see varieties certified safe for fast doorstep arrival.
          </p>
        </div>

        {/* Modal Body with Scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Search box for other states */}
          <div className="relative">
            <Search className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="state-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Kerala, Tamil Nadu, Karnataka, Delhi, Maharashtra..."
              className="w-full pl-10 pr-4 py-2.5 bg-emerald-50/50 dark:bg-[#0a1f18] text-emerald-950 dark:text-emerald-50 rounded-2xl border border-emerald-900/15 dark:border-emerald-900/40 focus:border-emerald-600 focus:bg-white dark:focus:bg-[#06120e] outline-hidden text-xs font-medium placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Primary Nursery Shipping States */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              <span>Primary Transit Hubs</span>
              <span>Delivery Time</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {PRIMARY_STATES.filter((st) =>
                searchQuery ? st.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) : true
              ).map((state) => {
                const isSelected = activeChoice === state.name;
                const stats = getItemCountForState(state.name);

                return (
                  <button
                    key={state.name}
                    type="button"
                    onClick={() => setActiveChoice(state.name)}
                    className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-emerald-900/10 dark:border-emerald-900/30 hover:border-emerald-400 bg-white dark:bg-[#0a1f18]/60 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 border transition-all ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-emerald-950 dark:text-emerald-50">
                            {state.name}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-black rounded-full border ${state.badgeColor}`}>
                            {state.badge}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                              Selected
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                          {state.description}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
                          <span className="flex items-center gap-1">
                            <Leaf className="w-3 h-3 text-emerald-600" />
                            {stats.combos} Combos Available
                          </span>
                          <span>•</span>
                          <span>{stats.products} Plants</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                        <Truck className="w-3 h-3" />
                        {state.transitTime}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Other States List */}
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-emerald-900/30">
            <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Other States & Territories (All-India Express Air Courier)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
              {filteredOtherStates.map((otherState) => {
                const isSelected = activeChoice === otherState;
                return (
                  <button
                    key={otherState}
                    type="button"
                    onClick={() => setActiveChoice(otherState)}
                    className={`text-left px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer truncate flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-50'
                        : 'border-gray-200 dark:border-emerald-900/30 text-gray-700 dark:text-gray-300 hover:border-emerald-400 bg-white dark:bg-[#0a1f18]'
                    }`}
                  >
                    <span className="truncate">{otherState}</span>
                    {isSelected && <Check className="w-3 h-3 text-emerald-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nursery Safety Note */}
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <p>
              Plants are shipped with moisture-lock root wrapping and corrugated protective boxes to ensure zero transit shock.
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-emerald-50/40 dark:bg-[#040e0b] border-t border-emerald-900/10 dark:border-emerald-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-gray-500 dark:text-gray-400 text-center sm:text-left">
            <span>Delivering to: </span>
            <span className="font-bold text-emerald-950 dark:text-emerald-50">{activeChoice}</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleApplyState('All India')}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full border border-gray-200 dark:border-emerald-900/40 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-[#0a1f18] text-xs font-bold transition-colors cursor-pointer"
            >
              Browse All
            </button>

            <button
              type="button"
              id="apply-delivery-state-btn"
              onClick={() => handleApplyState(activeChoice)}
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Show Available Plants</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
