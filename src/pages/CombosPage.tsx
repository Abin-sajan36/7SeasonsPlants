import React, { useState } from 'react';
import { Sparkles, ShieldCheck, CheckCircle2, MessageCircle, Package, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ComboCard } from '../components/common/ComboCard';

interface CombosPageProps {
  onNavigate: (view: string, param?: string) => void;
  initialCategory?: string;
}

export const CombosPage: React.FC<CombosPageProps> = ({ onNavigate, initialCategory }) => {
  const { combos } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');

  const comboCategories = [
    'All',
    'Air Purifying Combos',
    'Living Room & Balcony',
    'Low Maintenance Combos',
    'Desk & Workspace',
    'Hanging Basket Duos',
    'Flowering Balcony Pairs',
  ];

  const filteredCombos = combos.filter((combo) => {
    if (combo.status !== 'published') return false;
    if (selectedCategory === 'All') return true;
    return combo.category === selectedCategory;
  });

  return (
    <div className="bg-[#F4FAF5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* 1. Header Banner */}
        <div className="bg-gradient-to-br from-[#062919] via-[#0D4A2B] to-[#0A3D22] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-emerald-800/30">
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-400/30 text-[#A7F3D0] text-xs font-black uppercase tracking-wider backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>7Seasons Signature Offerings</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Curated Plant Combos
            </h1>

            <p className="text-xs sm:text-sm text-[#D1FAE5]/90 leading-relaxed font-normal">
              Designed by Mannarathayil Nursery horticulturists. Each combination brings together plants
              with matching sunlight and watering rhythms, complete with self-draining nursery planters and
              up to 35% bundled savings.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-[#D1FAE5]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Synchronized Care Needs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Matching Pots Included</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Save ₹150 – ₹450 vs Singles</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {comboCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-emerald-700 to-green-600 text-white shadow-md'
                  : 'bg-white text-emerald-950 hover:bg-emerald-50 border border-emerald-900/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. Combos Grid or Empty State */}
        {filteredCombos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredCombos.map((combo, idx) => (
              <ComboCard
                key={combo.id}
                combo={combo}
                onNavigate={onNavigate}
                featured={idx === 0}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-emerald-900/10 shadow-xs flex flex-col items-center justify-center space-y-4">
            <Package className="w-12 h-12 text-emerald-200" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-emerald-950">
                No combos available
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Sorry, we currently don't have any ready-made combos in the "{selectedCategory}" category. Check back soon or request a custom bundle below!
              </p>
            </div>
            <button
              onClick={() => setSelectedCategory('All')}
              className="px-6 py-2.5 mt-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-full transition-colors cursor-pointer"
            >
              View All Combos
            </button>
          </div>
        )}

        {/* 4. Custom Nursery Bundle Consultation Card */}
        <div className="bg-white rounded-3xl p-8 border border-emerald-900/10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <Package className="w-4 h-4 text-emerald-700" />
              <span>Need a Custom Combination for Your Space?</span>
            </div>
            <h3 className="text-xl font-bold text-emerald-950">
              Personalized Balcony & Indoor Combo Consultation
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Tell our Mannarathayil Nursery team your balcony orientation, light conditions, and budget.
              We will assemble a personalized combo bundle with special pricing just for you!
            </p>
          </div>

          <a
            href="https://wa.me/919567274176?text=Hi%207Seasonsplants%20Team!%20I%20want%20to%20create%20a%20custom%20plant%20combo%20for%20my%20home."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat on WhatsApp (+91 95672 74176)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
