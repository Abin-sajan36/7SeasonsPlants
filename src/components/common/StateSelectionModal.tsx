import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Check,
  Truck,
  ShieldCheck,
  ChevronRight,
  Leaf,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface StateOption {
  name: 'Kerala' | 'Tamil Nadu' | 'Karnataka';
  tagline: string;
  badge: string;
  badgeColor: string;
  transitTime: string;
  description: string;
  highlightDistricts: string;
}

const SUPPORTED_STATES: StateOption[] = [
  {
    name: 'Kerala',
    tagline: 'Home Nursery Dispatch',
    badge: '1 - 2 Days Express',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    transitTime: '1 - 2 Days Express Transit',
    description: 'Direct dispatch from our botanical nursery in Kerala with zero transit stress and 100% fresh arrival guarantee.',
    highlightDistricts: 'Ernakulam, Thrissur, Kozhikode, Trivandrum, Wayanad & all 14 districts',
  },
  {
    name: 'Tamil Nadu',
    tagline: 'Direct Ground Express',
    badge: '2 - 3 Days Transit',
    badgeColor: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    transitTime: '2 - 3 Days Ground Transit',
    description: 'Acclimated tropical varieties packed in specialized moisture-lock packaging for direct doorstep delivery.',
    highlightDistricts: 'Coimbatore, Chennai, Madurai, Salem, Tiruchirappalli & all districts',
  },
  {
    name: 'Karnataka',
    tagline: 'Priority Interstate Transit',
    badge: '2 - 3 Days Transit',
    badgeColor: 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700',
    transitTime: '2 - 3 Days Express Transit',
    description: 'Curated balcony & indoor plant combos protected by shock-absorbing corrugated boxes for fast, safe arrival.',
    highlightDistricts: 'Bengaluru, Mysuru, Mangaluru, Belagavi, Hubballi & all districts',
  },
];

export const StateSelectionModal: React.FC = () => {
  const {
    selectedDeliveryState,
    setSelectedDeliveryState,
    isStateModalOpen,
    setIsStateModalOpen,
    combos,
  } = useStore();

  const isMandatory = !selectedDeliveryState;

  const [activeChoice, setActiveChoice] = useState<'Kerala' | 'Tamil Nadu' | 'Karnataka'>(() => {
    if (selectedDeliveryState === 'Tamil Nadu' || selectedDeliveryState === 'Karnataka') {
      return selectedDeliveryState;
    }
    return 'Kerala';
  });

  // Keep active choice in sync with selectedDeliveryState
  useEffect(() => {
    if (selectedDeliveryState === 'Kerala' || selectedDeliveryState === 'Tamil Nadu' || selectedDeliveryState === 'Karnataka') {
      setActiveChoice(selectedDeliveryState);
    }
  }, [selectedDeliveryState]);

  // Lock body scroll when modal is open or when selection is mandatory
  useEffect(() => {
    if (isStateModalOpen || isMandatory) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isStateModalOpen, isMandatory]);

  // Close on Escape only if not mandatory (i.e. user already has a selected state)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isStateModalOpen && !isMandatory) {
        setIsStateModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStateModalOpen, isMandatory, setIsStateModalOpen]);

  // Available combos count for a state
  const getComboCountForState = (stateName: string) => {
    return combos.filter((c) => {
      if (c.status !== 'published') return false;
      if (!c.sellableStates || c.sellableStates.length === 0) return true;
      return c.sellableStates.includes(stateName) || c.sellableStates.includes('All India');
    }).length;
  };

  const handleApplyState = (stateToApply: 'Kerala' | 'Tamil Nadu' | 'Karnataka') => {
    setSelectedDeliveryState(stateToApply);
    setIsStateModalOpen(false);
  };

  // If already selected and modal not opened, don't show
  if (!isStateModalOpen && !isMandatory) {
    return null;
  }

  return (
    <div
      id="state-selection-modal-overlay"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        // Prevent closing overlay if selection is mandatory
        if (e.target === e.currentTarget && !isMandatory) {
          setIsStateModalOpen(false);
        }
      }}
    >
      <div
        id="state-selection-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="state-selection-title"
        className="bg-white dark:bg-[#071711] rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-emerald-900/20 dark:border-emerald-800/40 overflow-hidden relative"
      >
        {/* Modal Header */}
        <div className="relative bg-gradient-to-br from-[#062919] via-[#0D4A2B] to-[#0A3D22] text-white p-6 sm:p-7 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-400/30 text-[#A7F3D0] text-xs font-bold tracking-wider mb-2.5">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span>Delivery Location Required</span>
          </div>

          <h2 id="state-selection-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Select Your Delivery State
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1.5 leading-relaxed">
            To guarantee live root health and zero transit shock, 7Seasons delivers fresh nursery plant combos exclusively across South India.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Mandatory notice */}
          {isMandatory && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/70 dark:border-amber-700/50 text-amber-900 dark:text-amber-200 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Please select your state to view catalog prices and enter the nursery.</span>
            </div>
          )}

          {/* 3 State Option Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">
              <span>Choose Your State</span>
              <span>Transit Time</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {SUPPORTED_STATES.map((state) => {
                const isSelected = activeChoice === state.name;
                const comboCount = getComboCountForState(state.name);

                return (
                  <button
                    key={state.name}
                    type="button"
                    id={`state-option-${state.name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setActiveChoice(state.name)}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/25 shadow-sm'
                        : 'border-emerald-900/10 dark:border-emerald-900/30 hover:border-emerald-400 bg-white dark:bg-[#0b2119]/50 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Radio checkmark circle */}
                      <div
                        className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 border transition-all ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[#071711]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-base text-emerald-950 dark:text-emerald-50">
                            {state.name}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${state.badgeColor}`}>
                            {state.badge}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold">
                              Selected
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1 leading-snug">
                          {state.description}
                        </p>

                        <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Districts:</span>
                          <span className="truncate">{state.highlightDistricts}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-2 text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
                          <span className="flex items-center gap-1">
                            <Leaf className="w-3 h-3 text-emerald-600" />
                            {comboCount} Curated Combos Ready for Dispatch
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 px-2.5 py-1 rounded-full">
                        <Truck className="w-3 h-3 text-emerald-600" />
                        {state.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plant Safety & Packaging Note */}
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <p>
              100% Live Arrival Guarantee • Packed with root-moisture hydration wrap and protective breathable corrugated cartons.
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-emerald-50/50 dark:bg-[#05140e] border-t border-emerald-900/10 dark:border-emerald-900/40 flex flex-col gap-2 shrink-0">
          <button
            type="button"
            id="apply-delivery-state-btn"
            onClick={() => handleApplyState(activeChoice)}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <span>Confirm Delivery to {activeChoice} & Enter Nursery</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
          
          <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center">
            You can change your state anytime from the header location button.
          </p>
        </div>
      </div>
    </div>
  );
};
