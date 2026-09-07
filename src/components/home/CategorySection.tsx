import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface CategorySectionProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ onNavigate }) => {
  const { categories } = useStore();
  const sortedCategories = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <section className="py-16 bg-[#F4FAF5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700 mb-2">
              <span className="w-6 h-0.5 bg-emerald-600 rounded-full" />
              <span>Nursery Collections</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
              Shop by Botanical Category
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
              From NASA clean-air bedroom plants to vibrant balcony flowering shrubs acclimated for South Indian homes.
            </p>
          </div>

          <button
            onClick={() => onNavigate('plants')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {sortedCategories.map((cat) => {
            const isCombo = cat.type === 'combo';

            return (
              <button
                key={cat.id}
                aria-label={`Shop ${cat.name} category`}
                onClick={() => {
                  if (isCombo) {
                    onNavigate('combos');
                  } else {
                    onNavigate('plants', `category:${cat.name}`);
                  }
                }}
                className={`group relative rounded-3xl overflow-hidden cursor-pointer border transition-all duration-300 flex flex-col justify-end min-h-[220px] sm:min-h-[260px] p-5 shadow-xs hover:shadow-xl w-full text-left ${
                  isCombo
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-emerald-900/10 hover:border-emerald-500/30'
                }`}
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#041E11] via-[#08331E]/65 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />
                </div>

                {/* Badge for Combos */}
                {isCombo && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-200" />
                      Core Specialty
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="relative z-10 text-white">
                  <span className="text-[11px] font-semibold text-[#A7F3D0] block mb-1">
                    {cat.itemCount} Varieties Available
                  </span>
                  <h3 className="font-extrabold text-base sm:text-lg text-white leading-snug group-hover:text-emerald-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-[#D1FAE5]/90 line-clamp-2 mt-1 leading-relaxed hidden sm:block">
                    {cat.description}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#A7F3D0] group-hover:text-white transition-colors">
                    <span>Shop Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
