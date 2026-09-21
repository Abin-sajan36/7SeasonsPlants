import React, { useState } from 'react';
import { ArrowRight, Sparkles, MapPin } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ComboCard } from '../common/ComboCard';

interface BestSellersSectionProps {
  onNavigate: (view: string, param?: string) => void;
}

export const BestSellersSection: React.FC<BestSellersSectionProps> = ({ onNavigate }) => {
  const { combos, selectedDeliveryState, isItemDeliverable, openStateModal } = useStore();
  const [activeTab, setActiveTab] = useState<'all' | 'air-purifying' | 'balcony' | 'living-room'>('all');

  const filteredCombos = React.useMemo(() => {
    let list = combos.filter((c) => isItemDeliverable(c));
    if (activeTab === 'air-purifying') {
      list = list.filter((c) => /air|purif/i.test(c.name) || /air|purif/i.test(c.description || ''));
    } else if (activeTab === 'balcony') {
      list = list.filter((c) => /balcony|flower|outdoor/i.test(c.name) || /balcony|flower/i.test(c.description || ''));
    } else if (activeTab === 'living-room') {
      list = list.filter((c) => /living|decor|room|trio|duo/i.test(c.name) || /living|decor/i.test(c.description || ''));
    }
    return list.slice(0, 8);
  }, [combos, activeTab, isItemDeliverable]);

  return (
    <section className="py-16 bg-[#F4FAF5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Curated Botanical Sets</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
              Best Selling Plant Combos
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={openStateModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-semibold transition-colors cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-emerald-700" />
                <span>Showing combos for: <strong>{selectedDeliveryState || 'All India'}</strong></span>
                <span className="text-[10px] text-emerald-700 underline">Change</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1.5">
              Acclimated plant pairings bundled with matching premium pots and nursery potting mix. Save up to 35%!
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-emerald-50 rounded-2xl overflow-x-auto border border-emerald-100">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-900 hover:text-emerald-700'
              }`}
            >
              All Combos
            </button>
            <button
              onClick={() => setActiveTab('air-purifying')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'air-purifying'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-900 hover:text-emerald-700'
              }`}
            >
              Air Purifier Sets
            </button>
            <button
              onClick={() => setActiveTab('balcony')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'balcony'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-900 hover:text-emerald-700'
              }`}
            >
              Balcony & Flowering
            </button>
            <button
              onClick={() => setActiveTab('living-room')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'living-room'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-900 hover:text-emerald-700'
              }`}
            >
              Living Room Pairs
            </button>
          </div>
        </div>

        {/* Combo Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredCombos.map((combo) => (
            <ComboCard
              key={combo.id}
              combo={combo}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => onNavigate('combos')}
            className="px-8 py-3.5 bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-900/15 rounded-full text-xs font-black shadow-xs hover:shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Browse All Curated Combos ({combos.length} Sets Available)</span>
            <ArrowRight className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      </div>
    </section>
  );
};
