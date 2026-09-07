import React, { useState } from 'react';
import { ArrowRight, Leaf } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../common/ProductCard';

interface BestSellersSectionProps {
  onNavigate: (view: string, param?: string) => void;
}

export const BestSellersSection: React.FC<BestSellersSectionProps> = ({ onNavigate }) => {
  const { products } = useStore();
  const [activeTab, setActiveTab] = useState<'bestseller' | 'indoor' | 'flowering' | 'easy'>('bestseller');

  const filteredProducts = React.useMemo(() => {
    let list = [...products];
    if (activeTab === 'bestseller') {
      list = list.filter((p) => p.isBestseller);
    } else if (activeTab === 'indoor') {
      list = list.filter((p) => p.category === 'Indoor Plants');
    } else if (activeTab === 'flowering') {
      list = list.filter((p) => p.category === 'Flowering Plants');
    } else if (activeTab === 'easy') {
      list = list.filter((p) => p.attributes.difficulty === 'Beginner Friendly');
    }
    return list.slice(0, 8);
  }, [products, activeTab]);

  return (
    <section className="py-16 bg-[#F4FAF5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700 mb-2">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nursery Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
              Best Selling & Popular Plants
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Top requested varieties acclimated for optimal growth in homes and balconies across Kerala & TN.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-emerald-50 rounded-2xl overflow-x-auto border border-emerald-100">
            <button
              onClick={() => setActiveTab('bestseller')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'bestseller'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-900 hover:text-emerald-700'
              }`}
            >
              Best Sellers
            </button>
            <button
              onClick={() => setActiveTab('indoor')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'indoor'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-900 hover:text-emerald-700'
              }`}
            >
              Indoor Air Purifiers
            </button>
            <button
              onClick={() => setActiveTab('flowering')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'flowering'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-900 hover:text-emerald-700'
              }`}
            >
              Tropical Flowering
            </button>
            <button
              onClick={() => setActiveTab('easy')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'easy'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-900 hover:text-emerald-700'
              }`}
            >
              Easy Care
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => onNavigate('plants')}
            className="px-8 py-3.5 bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-900/15 rounded-full text-xs font-black shadow-xs hover:shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Browse Complete 7Seasons Nursery Catalog ({products.length} Plants)</span>
            <ArrowRight className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      </div>
    </section>
  );
};
