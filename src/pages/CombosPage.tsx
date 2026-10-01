import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, ShieldCheck, CheckCircle2, MessageCircle, Package, ArrowRight, MapPin } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ComboCard } from '../components/common/ComboCard';

interface CombosPageProps {
  onNavigate: (view: string, param?: string) => void;
  initialCategory?: string;
}

export const CombosPage: React.FC<CombosPageProps> = ({ onNavigate, initialCategory }) => {
  const { combos, categories, selectedDeliveryState, storeSettings, isItemDeliverable, openStateModal } = useStore();
  const whatsappNum = storeSettings?.whatsapp || storeSettings?.whatsappNumber || '+91 88482 76403';
  const digits = whatsappNum.replace(/[^0-9]/g, '');
  const waNum = digits.startsWith('91') ? digits : digits.length === 10 ? `91${digits}` : digits;

  const parsedInitial = initialCategory
    ? (initialCategory.startsWith('category:') ? initialCategory.replace('category:', '') : initialCategory)
    : 'All';

  const [selectedCategory, setSelectedCategory] = useState<string>(parsedInitial);

  useEffect(() => {
    if (initialCategory) {
      const clean = initialCategory.startsWith('category:') ? initialCategory.replace('category:', '') : initialCategory;
      setSelectedCategory(clean);
    }
  }, [initialCategory]);

  const comboCategories = useMemo(() => {
    const storeComboCategories = categories
      .filter((c) => c.type === 'combo' || c.type === 'both')
      .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99))
      .map((c) => c.name);

    const comboNamesFromCombos = combos.map((c) => c.category?.trim()).filter(Boolean) as string[];

    const combinedSet = new Set<string>();
    storeComboCategories.forEach((cat) => combinedSet.add(cat));
    comboNamesFromCombos.forEach((cat) => combinedSet.add(cat));

    return ['All', ...Array.from(combinedSet)];
  }, [categories, combos]);

  const filteredCombos = combos.filter((combo) => {
    if (combo.status !== 'published') return false;
    if (!isItemDeliverable(combo)) return false;
    if (selectedCategory === 'All') return true;
    return combo.category?.trim().toLowerCase() === selectedCategory.trim().toLowerCase();
  });

  return (
    <div className="bg-[#F4FAF5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Category Filter Pills */}
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

        {/* Delivery State Info & Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-emerald-900/10 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <MapPin className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950">
                Delivering Combos to: <span className="text-emerald-700 font-extrabold">{selectedDeliveryState || 'All India'}</span>
              </div>
              <p className="text-[11px] text-gray-500">
                {selectedDeliveryState 
                  ? `Showing ${filteredCombos.length} plant combos acclimated for fast, safe delivery in ${selectedDeliveryState}.`
                  : 'Select your state for accurate delivery availability.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openStateModal}
            className="px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            Change State
          </button>
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
      </div>
    </div>
  );
};
