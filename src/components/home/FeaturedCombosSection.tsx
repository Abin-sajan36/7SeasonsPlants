import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ComboCard } from '../common/ComboCard';

interface FeaturedCombosSectionProps {
  onNavigate: (view: string, param?: string) => void;
}

export const FeaturedCombosSection: React.FC<FeaturedCombosSectionProps> = ({ onNavigate }) => {
  const { combos } = useStore();
  const featuredCombos = combos.filter((c) => c.status === 'published').slice(0, 3);

  return (
    <section className="py-16 bg-[#F4FAF5] border-b border-emerald-900/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-600 mb-2">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>7Seasons Signature Specialty</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-950 tracking-tight">
              Curated Plant Combos
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Why buy one when you can create a thriving green sanctuary? Expertly paired plant bundles with
              matching care routines, matching planters, and bundled savings up to 35%.
            </p>
          </div>

          <button
            onClick={() => onNavigate('combos')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <span>Explore All Combos</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Value Highlights Pill Bar */}
        <div className="mb-8 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-emerald-950">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Matching light & watering needs</span>
          </div>
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Free planters & organic fertilizer</span>
          </div>
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Save ₹150 to ₹450 per bundle</span>
          </div>
        </div>

        {/* Combos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {featuredCombos.map((combo, idx) => (
            <ComboCard
              key={combo.id}
              combo={combo}
              onNavigate={onNavigate}
              featured={idx === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
