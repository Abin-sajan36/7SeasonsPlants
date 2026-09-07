import React from 'react';
import { Heart, ShoppingBag, Sparkles, Star, PackageCheck, Eye } from 'lucide-react';
import { PlantCombo } from '../../types';
import { useStore } from '../../context/StoreContext';

interface ComboCardProps {
  combo: PlantCombo;
  onNavigate: (view: string, param?: string) => void;
  featured?: boolean;
}

export const ComboCard: React.FC<ComboCardProps> = ({ combo, onNavigate, featured = false }) => {
  const { addToCart, toggleWishlist, isInWishlist, openQuickView } = useStore();

  const isSaved = isInWishlist(combo.id);
  const isOutOfStock = combo.stock <= 0;

  return (
    <div
      className={`group relative bg-white rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
        featured
          ? 'border-emerald-500 shadow-xl hover:shadow-2xl ring-2 ring-emerald-500/30'
          : 'border-emerald-900/10 hover:border-emerald-500/50 hover:shadow-xl'
      }`}
    >
      {/* 1. Combo Image Header */}
      <div className="relative aspect-4/3 sm:aspect-16/10 w-full bg-emerald-50/40 overflow-hidden">
        <img
          src={combo.images[0] || 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=800&q=80'}
          alt={combo.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-1.5 bg-emerald-700 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Curated Combo</span>
          </div>

          <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider w-fit">
            Save ₹{combo.savings} • {combo.discountPercentage}% OFF
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(combo.id);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 cursor-pointer ${
            isSaved
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/90 text-gray-700 hover:text-rose-500 hover:bg-white shadow-xs'
          }`}
          aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            openQuickView(combo, 'combo');
          }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/95 text-emerald-950 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg hover:bg-white flex items-center gap-1.5 cursor-pointer whitespace-nowrap border border-emerald-900/10"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-700" />
          <span>Quick View Bundle</span>
        </button>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Combo Sold Out
            </span>
          </div>
        )}
      </div>

      {/* 2. Combo Content & "What's Inside" Breakdown */}
      <div
        className="p-5 flex-1 flex flex-col justify-between cursor-pointer"
        onClick={() => onNavigate('combo-detail', combo.slug)}
      >
        <div>
          {/* Rating and Category */}
          <div className="flex items-center justify-between gap-2 mb-1.5 text-xs text-gray-500">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              {combo.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{combo.rating.toFixed(1)}</span>
              <span className="text-gray-400 font-normal">({combo.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-extrabold text-emerald-950 text-base leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
            {combo.name}
          </h3>

          <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed font-medium">
            {combo.shortDescription}
          </p>

          {/* DYNAMIC COMBO CONTENTS PREVIEW (What's Inside) */}
          <div className="mt-3.5 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <div className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1">
              <PackageCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Bundle Includes ({combo.items.length} items):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {combo.items.slice(0, 4).map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-[11px] bg-white text-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-100 font-semibold shadow-2xs"
                >
                  {item.itemType === 'plant' ? '🌿' : item.itemType === 'pot' ? '🪴' : '📖'}{' '}
                  <span className="truncate max-w-[130px] ml-1">{item.productName}</span>
                  <span className="ml-1 text-emerald-700 font-bold">×{item.quantity}</span>
                </span>
              ))}
              {combo.items.length > 4 && (
                <span className="text-[10px] font-bold text-emerald-700 px-1 py-0.5 flex items-center">
                  +{combo.items.length - 4} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Pricing Math & Add Combo Button */}
        <div className="mt-5 pt-3.5 border-t border-emerald-900/8 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-gray-400 font-medium">
              Individual Value: <span className="line-through">₹{combo.originalPrice}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-emerald-950">₹{combo.price}</span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200/50">
                Save ₹{combo.savings}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(combo, 'combo', 1);
              }}
              disabled={isOutOfStock}
              className={`px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white shadow-sm hover:shadow-md'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add Combo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
