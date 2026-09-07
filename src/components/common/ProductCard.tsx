import React from 'react';
import { Heart, ShoppingBag, Eye, Star, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onNavigate: (view: string, param?: string) => void;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { addToCart, toggleWishlist, isInWishlist, openQuickView } = useStore();

  const isSaved = isInWishlist(product.id);
  const savings = Math.max(0, product.originalPrice - product.price);
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-emerald-900/10 hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      {/* 1. Image Container & Overlay Badges */}
      <div className="relative aspect-square w-full bg-emerald-50/40 overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges: Discount, Bestseller, New */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isBestseller && (
            <span className="bg-emerald-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs tracking-wider uppercase">
              Bestseller
            </span>
          )}
          {product.isNewArrival && !product.isBestseller && (
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs tracking-wider uppercase">
              New Arrival
            </span>
          )}
          {product.discountPercentage > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs tracking-wider uppercase">
              {product.discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 cursor-pointer ${
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
            openQuickView(product, 'product');
          }}
          className="absolute bottom-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/95 text-emerald-950 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg hover:bg-white flex items-center gap-1.5 cursor-pointer whitespace-nowrap border border-emerald-900/10"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-700" />
          <span>Quick View</span>
        </button>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* 2. Product Details */}
      <div
        className="p-4 flex-1 flex flex-col justify-between cursor-pointer"
        onClick={() => onNavigate('product-detail', product.slug)}
      >
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-2 mb-1.5 text-xs text-gray-500">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-gray-400 font-normal">({product.reviewCount})</span>
            </div>
          </div>

          {/* Title & Botanical subtitle */}
          <h3 className="font-bold text-emerald-950 text-sm leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
            {product.name}
          </h3>

          {product.botanicalName && (
            <p className="text-[11px] text-emerald-800/70 italic mt-0.5 truncate font-medium">
              {product.botanicalName}
            </p>
          )}

          {/* Plant attribute quick tags */}
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-medium px-2 py-0.5 rounded-md border border-emerald-100/60">
              {product.attributes.light.split(' ')[0]}
            </span>
            {product.attributes.airPurifying && (
              <span className="text-[10px] bg-green-50 text-green-800 font-medium px-2 py-0.5 rounded-md border border-green-200/50">
                Air Purifier
              </span>
            )}
            {product.attributes.difficulty === 'Beginner Friendly' && (
              <span className="text-[10px] bg-amber-50 text-amber-800 font-medium px-2 py-0.5 rounded-md border border-amber-200/50">
                Easy Care
              </span>
            )}
          </div>
        </div>

        {/* 3. Pricing (No Add to Cart for individual plants) */}
        <div className="mt-4 pt-3 border-t border-emerald-900/8 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-emerald-950">₹{product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
              )}
            </div>
            {savings > 0 && (
              <p className="text-[10px] font-bold text-rose-600">Save ₹{savings}</p>
            )}
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right max-w-[70px] leading-tight">View Details</span>
        </div>
      </div>
    </div>
  );
};
