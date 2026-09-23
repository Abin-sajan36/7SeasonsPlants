import React, { useMemo } from 'react';
import { ArrowRight, Sparkles, FolderTree } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types';

interface CategorySectionProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ onNavigate }) => {
  const { categories, products, combos } = useStore();

  // Calculate live item counts and determine categories present on the site
  const { presentCategories, getCategoryMetrics } = useMemo(() => {
    // Helper to calculate products & combos for each category
    const getCategoryMetrics = (cat: Category) => {
      const catName = cat.name.trim().toLowerCase();
      const catSlug = (cat.slug || '').trim().toLowerCase();

      const matchingProducts = products.filter((p) => {
        if (p.status === 'archived') return false;
        const pCat = (p.category || '').trim().toLowerCase();
        return (
          pCat === catName ||
          pCat === catSlug ||
          (catSlug === 'indoor-plants' && (pCat.includes('indoor') || pCat.includes('foliage'))) ||
          (catSlug === 'flowering-plants' && pCat.includes('flowering')) ||
          (catSlug === 'air-purifying-plants' && pCat.includes('air purifying')) ||
          (catSlug === 'bonsai' && pCat.includes('bonsai')) ||
          (catSlug === 'succulents-cactus' && (pCat.includes('succulent') || pCat.includes('cacti'))) ||
          (catSlug === 'trailing-vines' && (pCat.includes('trailing') || pCat.includes('vine') || pCat.includes('hanging')))
        );
      }).length;

      const matchingCombos = combos.filter((c) => {
        if (c.status === 'draft') return false;
        const cCat = (c.category || '').trim().toLowerCase();
        return (
          cCat === catName ||
          cCat === catSlug ||
          (cat.type === 'combo' && catSlug === 'plant-combos') || // "Plant Combos" represents all bundles
          (catSlug.includes('indoor') && cCat.includes('indoor')) ||
          (catSlug.includes('balcony') && cCat.includes('balcony'))
        );
      }).length;

      const totalItems = matchingProducts + matchingCombos;
      return { matchingProducts, matchingCombos, totalItems };
    };

    // Only show categories that are present on the site:
    // Either they have active products/combos, OR were explicitly created/customized by the admin
    const filtered = categories
      .filter((cat) => {
        const { totalItems } = getCategoryMetrics(cat);
        // Present if it has items on site, or is an admin-created category (has custom ID or explicitly ordered)
        const isCustomOrAdminCreated = cat.id.startsWith('cat-') && cat.id.length > 15;
        return totalItems > 0 || isCustomOrAdminCreated || cat.itemCount > 0;
      })
      .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));

    return { presentCategories: filtered, getCategoryMetrics };
  }, [categories, products, combos]);

  const handleCategoryClick = (cat: Category) => {
    const { matchingProducts, matchingCombos } = getCategoryMetrics(cat);
    if (cat.type === 'combo' || (matchingCombos > 0 && matchingProducts === 0)) {
      onNavigate('combos', `category:${cat.name}`);
    } else {
      onNavigate('plants', `category:${cat.name}`);
    }
  };

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
              Fresh nursery stock grown and acclimated at 7Seasons Nursery. Categories update dynamically as new species are harvested and curated.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('plants')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer group px-3.5 py-1.5 rounded-full bg-emerald-100/60 hover:bg-emerald-100 transition-colors"
            >
              <span>All Plants ({products.length})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('combos')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-3.5 py-1.5 rounded-full cursor-pointer group shadow-xs transition-colors"
            >
              <span>All Combos ({combos.length})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        {presentCategories.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-emerald-300 max-w-md mx-auto space-y-3">
            <FolderTree className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-emerald-950">No Categories Found</h3>
            <p className="text-xs text-gray-500">
              Categories added by administrators in the Admin Panel will automatically appear here.
            </p>
            <button
              onClick={() => onNavigate('admin')}
              className="px-4 py-2 bg-emerald-700 text-white rounded-full text-xs font-bold hover:bg-emerald-800 transition-colors"
            >
              Manage Categories
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {presentCategories.map((cat) => {
              const isCombo = cat.type === 'combo';
              const { matchingProducts, matchingCombos, totalItems } = getCategoryMetrics(cat);
              const displayCount = totalItems > 0 ? totalItems : (cat.itemCount || 1);
              const countLabel = isCombo
                ? `${displayCount} ${displayCount === 1 ? 'Combo Pack' : 'Combo Packs'}`
                : `${displayCount} ${displayCount === 1 ? 'Botanical Variety' : 'Varieties Available'}`;

              return (
                <button
                  key={cat.id}
                  id={`cat-card-${cat.id}`}
                  aria-label={`Shop ${cat.name} category`}
                  onClick={() => handleCategoryClick(cat)}
                  className={`group relative rounded-3xl overflow-hidden cursor-pointer border transition-all duration-300 flex flex-col justify-end min-h-[220px] sm:min-h-[260px] p-5 shadow-xs hover:shadow-xl w-full text-left ${
                    isCombo
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-emerald-900/10 hover:border-emerald-500/30'
                  }`}
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0 bg-emerald-950">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-90"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#041E11] via-[#08331E]/65 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />
                  </div>

                  {/* Badge for Combos or Specialty */}
                  {isCombo && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-200" />
                        Combo Bundle
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative z-10 text-white">
                    <span className="text-[11px] font-semibold text-[#A7F3D0] block mb-1">
                      {countLabel}
                    </span>
                    <h3 className="font-extrabold text-base sm:text-lg text-white leading-snug group-hover:text-emerald-300 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-[#D1FAE5]/90 line-clamp-2 mt-1 leading-relaxed hidden sm:block">
                      {cat.description}
                    </p>

                    <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#A7F3D0] group-hover:text-white transition-colors">
                      <span>Explore Collection</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
