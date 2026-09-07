import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';
import { ComboCard } from '../components/common/ComboCard';

interface WishlistPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate }) => {
  const { wishlist, products, combos, clearWishlist, addToCart, addToast } = useStore();

  const savedProducts = products.filter((p) => wishlist.includes(p.id));
  const savedCombos = combos.filter((c) => wishlist.includes(c.id));
  const totalSavedCount = savedProducts.length + savedCombos.length;

  const handleAddAllToCart = () => {
    savedCombos.forEach((c) => addToCart(c, 'combo', 1));
    if (savedProducts.length > 0) {
      addToast({
        title: 'Added Combos Only',
        message: `Added ${savedCombos.length} combos to bag. Individual plants are viewing only.`,
        type: 'info',
      });
    } else {
      addToast({
        title: 'Added to Cart',
        message: `Added all ${savedCombos.length} saved combos to your shopping bag.`,
        type: 'success',
      });
    }
  };

  return (
    <div className="bg-[#F4FAF5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-900/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500 mb-1">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>Saved Greenery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
              My Plant Wishlist ({totalSavedCount})
            </h1>
          </div>

          {totalSavedCount > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={clearWishlist}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Clear All
              </button>
              <button
                onClick={handleAddAllToCart}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full text-xs font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Move All to Bag</span>
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {totalSavedCount === 0 ? (
          <div className="bg-white rounded-3xl p-12 sm:p-16 border border-emerald-900/10 text-center max-w-md mx-auto space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-3xl mx-auto text-rose-500 border border-rose-100">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-emerald-950">Your Wishlist is Empty</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Save your favorite air purifiers, flowering plants, and curated combos while browsing our nursery catalog.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => onNavigate('combos')}
                className="w-full py-3 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Explore Plant Combos (Save 35%)</span>
              </button>
              <button
                onClick={() => onNavigate('plants')}
                className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 rounded-full text-xs font-semibold transition-colors cursor-pointer border border-emerald-100"
              >
                Browse All Plants
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Combos Section if any */}
            {savedCombos.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Saved Plant Combos ({savedCombos.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {savedCombos.map((combo) => (
                    <ComboCard key={combo.id} combo={combo} onNavigate={onNavigate} />
                  ))}
                </div>
              </div>
            )}

            {/* Products Section if any */}
            {savedProducts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-emerald-950">
                  Saved Plants ({savedProducts.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  {savedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
