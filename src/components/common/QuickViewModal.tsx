import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  Sun,
  Droplets,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Product, PlantCombo } from '../../types';
import { useStore } from '../../context/StoreContext';

interface QuickViewModalProps {
  onNavigate: (view: string, param?: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ onNavigate }) => {
  const { quickViewItem, closeQuickView, addToCart, toggleWishlist, isInWishlist } = useStore();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!quickViewItem) return null;

  const { item, type } = quickViewItem;
  const isCombo = type === 'combo';
  const combo = isCombo ? (item as PlantCombo) : null;
  const product = !isCombo ? (item as Product) : null;

  const isSaved = isInWishlist(item.id);
  const isOutOfStock = item.stock <= 0;
  const savings = Math.max(0, item.originalPrice - item.price);

  const handleAddToCart = () => {
    addToCart(item, type, quantity);
    closeQuickView();
  };

  const handleViewFullPage = () => {
    closeQuickView();
    if (isCombo) {
      onNavigate('combo-detail', combo!.slug);
    } else {
      onNavigate('product-detail', product!.slug);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-white dark:bg-[#06120e] dark:bg-[#06120e] rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-emerald-900/15 dark:border-emerald-900/40 flex flex-col md:flex-row max-h-[90vh] transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white dark:bg-[#06120e]/90 text-gray-700 hover:text-emerald-800 flex items-center justify-center shadow-md transition-colors border border-gray-200 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Left: Image Gallery */}
        <div className="md:w-1/2 p-6 bg-emerald-50 dark:bg-[#0a1f18]/50 dark:bg-[#021a12] transition-colors duration-300 flex flex-col justify-between">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white dark:bg-[#06120e] shadow-xs border border-emerald-900/10 dark:border-emerald-900/40">
            <img
              src={item.images[selectedImageIdx] || item.images[0]}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            {isCombo && (
              <span className="absolute top-3 left-3 bg-emerald-700 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Curated Combo
              </span>
            )}
            {savings > 0 && (
              <span className="absolute bottom-3 left-3 bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                Save ₹{savings}
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {item.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {item.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    selectedImageIdx === idx ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Right: Content & Controls */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span className="font-bold text-emerald-700 uppercase tracking-wider">
                {item.category}
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{item.rating.toFixed(1)}</span>
                <span className="text-gray-400 font-normal">({item.reviewCount} reviews)</span>
              </div>
            </div>

            <h2 className="text-lg font-black text-emerald-950 dark:text-emerald-50 leading-snug">{item.name}</h2>

            {product?.botanicalName && (
              <p className="text-xs text-emerald-800/70 italic mt-0.5 font-medium">{product.botanicalName}</p>
            )}

            {/* Pricing */}
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-2xl font-black text-emerald-950 dark:text-emerald-50">₹{item.price}</span>
              {item.originalPrice > item.price && (
                <span className="text-sm text-gray-400 line-through">₹{item.originalPrice}</span>
              )}
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 dark:bg-[#0a1f18] border border-emerald-100 px-2 py-0.5 rounded-md">
                {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
              </span>
            </div>

            <p className="text-xs text-gray-600 mt-2.5 leading-relaxed line-clamp-3 font-medium">
              {item.shortDescription || item.description}
            </p>

            {/* If Combo: What's inside preview */}
            {isCombo && combo && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-[#0a1f18]/70 border border-emerald-100">
                <div className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider mb-1.5">
                  Items Included in this Combo:
                </div>
                <div className="space-y-1">
                  {combo.items.map((ci, i) => (
                    <div key={i} className="text-xs flex items-center justify-between text-emerald-950 dark:text-emerald-50 font-medium">
                      <span>• {ci.productName}</span>
                      <span className="font-bold text-emerald-700">×{ci.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* If Product: Attributes preview */}
            {product && (
              <div className="grid grid-cols-2 gap-2 mt-3.5 text-xs">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-[#0a1f18]/50 border border-emerald-100 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block">Light</span>
                    <span className="font-semibold text-emerald-950 dark:text-emerald-50 text-[11px] truncate">
                      {product.attributes.light}
                    </span>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-[#0a1f18]/50 border border-emerald-100 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-600" />
                  <div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block">Watering</span>
                    <span className="font-semibold text-emerald-950 dark:text-emerald-50 text-[11px] truncate">
                      {product.attributes.water.split('(')[0]}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls: Quantity & Buttons */}
          <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
            {isCombo ? (
              <div className="flex items-center gap-3">
                {/* Quantity selector */}
                <div className="flex items-center border border-emerald-900/15 rounded-xl overflow-hidden bg-white dark:bg-[#06120e]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-emerald-950 dark:text-emerald-50 hover:bg-emerald-50 dark:bg-[#0a1f18] font-bold text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-bold text-emerald-950 dark:text-emerald-50">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(item.stock, quantity + 1))}
                    disabled={quantity >= item.stock}
                    className="px-3 py-2 text-emerald-950 dark:text-emerald-50 hover:bg-emerald-50 dark:bg-[#0a1f18] font-bold text-sm disabled:opacity-40 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist(item.id)}
                  className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                    isSaved
                      ? 'border-rose-300 bg-rose-50 text-rose-500'
                      : 'border-emerald-900/15 text-gray-400 hover:text-rose-500'
                  }`}
                  title="Save to Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isOutOfStock
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white shadow-md'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Sold Out' : `Add ${quantity} to Bag`}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist(item.id)}
                  className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                    isSaved
                      ? 'border-rose-300 bg-rose-50 text-rose-500'
                      : 'border-emerald-900/15 text-gray-400 hover:text-rose-500'
                  }`}
                  title="Save to Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
                
                <div className="flex-1 bg-emerald-50 dark:bg-[#0a1f18] text-emerald-900 text-xs font-bold rounded-xl p-3 text-center border border-emerald-200">
                  🌱 Available in Combos Only
                </div>
              </div>
            )}

            {/* View Full Page Button */}
            <button
              onClick={handleViewFullPage}
              className="w-full py-2.5 bg-emerald-50 dark:bg-[#0a1f18] hover:bg-emerald-100 text-emerald-950 dark:text-emerald-50 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-100"
            >
              <span>View Full Botanical Details & Care Guide</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
