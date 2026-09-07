import React, { useState } from 'react';
import {
  Sparkles,
  Star,
  Heart,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  PackageCheck,
  CheckCircle2,
  Share2,
  Facebook,
  Twitter,
  MessageCircle,
  Link as LinkIcon,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ComboCard } from '../components/common/ComboCard';

interface ComboDetailPageProps {
  slug: string;
  onNavigate: (view: string, param?: string) => void;
}

export const ComboDetailPage: React.FC<ComboDetailPageProps> = ({ slug, onNavigate }) => {
  const {
    combos,
    products,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setIsCartOpen,
    addToast,
  } = useStore();

  const combo = combos.find((c) => c.slug === slug) || combos[0];
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const isSaved = isInWishlist(combo.id);
  const isOutOfStock = combo.stock <= 0;

  const handleAddToCart = () => {
    addToCart(combo, 'combo', quantity);
  };

  const handleBuyNow = () => {
    addToCart(combo, 'combo', quantity);
    setIsCartOpen(false);
    onNavigate('checkout');
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = pincodeInput.trim();
    if (!pin || pin.length !== 6 || isNaN(Number(pin))) {
      setPincodeStatus('invalid');
      return;
    }
    const prefix = pin.substring(0, 2);
    if (['67', '68', '69'].includes(prefix)) {
      setPincodeStatus('kerala');
    } else if (['60', '61', '62', '63', '64'].includes(prefix)) {
      setPincodeStatus('tamilnadu');
    } else {
      setPincodeStatus('outside');
    }
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleShareOption = (platform: string) => {
    const shareText = `Check out the ${combo.name} bundle at 7Seasonsplants! 🌿\n\n${combo.description}\n\nSave ₹${combo.savings} when you shop now:`;
    const url = window.location.href;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(url);

    setShowShareMenu(false);

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(`${shareText} ${url}`);
      addToast({
        title: 'Details Copied',
        message: 'Combo info copied to clipboard ready to share!',
        type: 'success',
      });
    }
  };

  const otherCombos = combos.filter((c) => c.id !== combo.id).slice(0, 3);

  return (
    <div className="bg-[#F4FAF5] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <button onClick={() => onNavigate('home')} className="hover:text-emerald-700">
            Home
          </button>
          <span>/</span>
          <button onClick={() => onNavigate('combos')} className="hover:text-emerald-700">
            Plant Combos
          </button>
          <span>/</span>
          <span className="font-semibold text-emerald-950 truncate max-w-[200px]">
            {combo.name}
          </span>
        </div>

        {/* 1. Main Combo Buy Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-900/10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Combo Images (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-4/3 sm:aspect-square w-full rounded-3xl overflow-hidden bg-emerald-50/50 border border-emerald-900/10">
              <img
                src={combo.images[selectedImageIdx] || combo.images[0]}
                alt={combo.name}
                className="w-full h-full object-cover"
              />

              {/* Top Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                <span className="bg-gradient-to-r from-emerald-700 to-green-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Curated Combo Pack
                </span>
                <span className="bg-rose-500 text-white text-xs font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs w-fit">
                  Save ₹{combo.savings} • {combo.discountPercentage}% OFF
                </span>
              </div>

              {/* Share & Wishlist */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <div className="relative">
                  <button
                    onClick={handleShare}
                    aria-label="Share plant combo"
                    className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-emerald-950 flex items-center justify-center shadow-md transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  {showShareMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-emerald-900/10 overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                      <button onClick={() => handleShareOption('whatsapp')} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-950 flex items-center gap-2 cursor-pointer font-medium">
                        <MessageCircle className="w-4 h-4 text-[#25D366]" /> Share on WhatsApp
                      </button>
                      <button onClick={() => handleShareOption('facebook')} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-950 flex items-center gap-2 cursor-pointer font-medium">
                        <Facebook className="w-4 h-4 text-[#1877F2]" /> Share on Facebook
                      </button>
                      <button onClick={() => handleShareOption('twitter')} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-950 flex items-center gap-2 cursor-pointer font-medium">
                        <Twitter className="w-4 h-4 text-[#1DA1F2]" /> Share on Twitter
                      </button>
                      <button onClick={() => handleShareOption('copy')} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-950 flex items-center gap-2 cursor-pointer font-medium border-t border-gray-100">
                        <LinkIcon className="w-4 h-4 text-emerald-700" /> Copy Link
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => toggleWishlist(combo.id)}
                  aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer ${
                    isSaved
                      ? 'bg-rose-500 text-white'
                      : 'bg-white/90 hover:bg-white text-gray-700 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {combo.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                {combo.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      selectedImageIdx === idx
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Buy Controls & Breakdown (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="font-bold text-emerald-700 uppercase tracking-wider">
                  {combo.category}
                </span>
                <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{combo.rating.toFixed(1)}</span>
                  <span className="text-gray-500 font-normal">({combo.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 leading-tight">
                {combo.name}
              </h1>

              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                {combo.shortDescription}
              </p>

              {/* Bundle Pricing Breakdown Box */}
              <div className="mt-5 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Combined Value if bought separately:</span>
                  <span className="line-through font-semibold text-emerald-950">
                    ₹{combo.originalPrice}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1 border-t border-emerald-900/10">
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">7Seasons Combo Price:</span>
                    <span className="text-3xl font-black text-emerald-950">₹{combo.price}</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-rose-600 text-white font-black text-xs px-3 py-1.5 rounded-full shadow-xs">
                      Customer Saves ₹{combo.savings}
                    </span>
                  </div>
                </div>
              </div>

              {/* Benefits Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5 text-xs text-emerald-950">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Includes {combo.items.length} matched plants & planters</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Synchronized care rhythms</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Single safe 5-ply box packing</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Kerala & TN Delivery Guarantee</span>
                </div>
              </div>
            </div>

            {/* Actions: Quantity, Add to Bag, Buy Now */}
            <div className="space-y-4 pt-4 border-t border-emerald-900/10">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-emerald-900/10 rounded-full overflow-hidden bg-[#F4FAF5] p-1 w-full sm:w-auto justify-between sm:justify-start">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2 text-emerald-950 hover:bg-white font-bold text-sm rounded-full transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-bold text-emerald-950">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(combo.stock, quantity + 1))}
                    disabled={quantity >= combo.stock}
                    className="px-3.5 py-2 text-emerald-950 hover:bg-white font-bold text-sm rounded-full transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full sm:flex-1 py-3.5 px-6 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isOutOfStock
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 shadow-xs'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                  <span>{isOutOfStock ? 'Combo Sold Out' : 'Add Bundle to Bag'}</span>
                </button>

                {/* Buy Now */}
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`w-full sm:flex-1 py-3.5 px-6 rounded-full text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isOutOfStock
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  <span>Buy Bundle Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* PIN Code Check */}
              <div className="p-4 bg-[#F4FAF5] rounded-2xl border border-emerald-900/10">
                <form onSubmit={handlePincodeCheck} className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      value={pincodeInput}
                      onChange={(e) => setPincodeInput(e.target.value)}
                      placeholder="Check PIN delivery (e.g. 682001)"
                      className="w-full pl-8.5 pr-3 py-2 bg-white text-xs text-emerald-950 font-semibold rounded-full border border-emerald-900/10 focus:border-emerald-600 outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white text-xs font-bold rounded-full transition-colors cursor-pointer shadow-xs"
                  >
                    Check PIN
                  </button>
                </form>

                {pincodeStatus === 'kerala' && (
                  <p className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Eligible for <strong>Kerala Fast Delivery (2-3 business days)</strong></span>
                  </p>
                )}
                {pincodeStatus === 'tamilnadu' && (
                  <p className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Eligible for <strong>Tamil Nadu Delivery (2-4 business days)</strong></span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. "What's Inside This Combo" Full Itemized Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-900/10 shadow-xs space-y-6">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
              What's Inside This Curated Combo ({combo.items.length} Items)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {combo.items.map((item, idx) => {
              // Try to find the individual product for image & details
              const matchedProd = products.find((p) => p.name.toLowerCase() === item.productName.toLowerCase());

              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#F4FAF5] border border-emerald-900/10 flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        matchedProd?.images[0] ||
                        'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={item.productName}
                      className="w-16 h-16 rounded-xl object-cover bg-white shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm border border-emerald-100">
                        {item.itemType}
                      </span>
                      <h4 className="font-bold text-xs text-emerald-950 mt-1 leading-snug">
                        {item.productName}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium">Qty: {item.quantity}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-emerald-900/10 flex items-center justify-between text-xs">
                    <span className="text-gray-500 text-[11px]">Included in pack</span>
                    <span className="font-bold text-emerald-950">₹{item.itemPrice} value</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Care Guide & Overview */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-900/10 shadow-xs space-y-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
              Synchronized Care Routine for this Bundle
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-3xl">
            {combo.description}
          </p>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Mannarathayil Nursery Safe Delivery Guarantee</strong>
              <span>
                All plants in this combo are watered, treated with organic neem shield, and individually packed inside ventilated compartments. If any plant arrives damaged, our WhatsApp support (+91 95672 74176) provides instant replacement.
              </span>
            </div>
          </div>
        </div>

        {/* 4. More Plant Combos */}
        {otherCombos.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-black text-emerald-950">
              Other Popular Plant Combos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherCombos.map((c) => (
                <ComboCard key={c.id} combo={c} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
