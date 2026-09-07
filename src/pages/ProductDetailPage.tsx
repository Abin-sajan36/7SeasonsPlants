import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Star,
  Heart,
  ShoppingBag,
  ArrowRight,
  Sun,
  Droplets,
  Award,
  ShieldCheck,
  Truck,
  Sparkles,
  MapPin,
  CheckCircle2,
  Package,
  HelpCircle,
  Share2,
  Facebook,
  Twitter,
  MessageCircle,
  Link as LinkIcon
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';
import { ComboCard } from '../components/common/ComboCard';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (view: string, param?: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, onNavigate }) => {
  const {
    products,
    combos,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setIsCartOpen,
    addToast,
  } = useStore();

  const product = products.find((p) => p.slug === slug) || products[0];

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'care' | 'reviews'>('overview');
  const [showShareMenu, setShowShareMenu] = useState(false);

  const isSaved = isInWishlist(product.id);
  const savings = Math.max(0, product.originalPrice - product.price);
  const isOutOfStock = product.stock <= 0;

  // Matching combos that feature or complement this plant
  const relatedCombos = combos.filter((c) =>
    c.items.some((item) => item.productName.toLowerCase().includes(product.name.toLowerCase().split(' ')[0]))
  ).slice(0, 2);

  // Other related plants in same category
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, 'product', quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, 'product', quantity);
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

    // Kerala PIN codes typically start with 67x, 68x, 69x
    // Tamil Nadu PIN codes typically start with 60x, 61x, 62x, 63x, 64x
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
    const shareText = `Check out ${product.name} at 7Seasonsplants! 🌿\n\n${product.description}\n\nShop now:`;
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
        message: 'Product info copied to clipboard ready to share!',
        type: 'success',
      });
    }
  };

  return (
    <div className="bg-[#F4FAF5] min-h-screen py-8">
      <Helmet>
        <title>{product.name} - Buy Online | 7Seasonsplants</title>
        <meta name="description" content={product.description.substring(0, 155) + '...'} />
        <meta property="og:title" content={`${product.name} | 7Seasonsplants`} />
        <meta property="og:description" content={product.description.substring(0, 155) + '...'} />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <button onClick={() => onNavigate('home')} className="hover:text-emerald-700">
            Home
          </button>
          <span>/</span>
          <button onClick={() => onNavigate('plants')} className="hover:text-emerald-700">
            Plants
          </button>
          <span>/</span>
          <button
            onClick={() => onNavigate('plants', `category:${product.category}`)}
            className="hover:text-emerald-700 font-medium"
          >
            {product.category}
          </button>
          <span>/</span>
          <span className="font-semibold text-emerald-950 truncate max-w-[200px]">
            {product.name}
          </span>
        </div>

        {/* 1. Main Product Gallery & Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-900/10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Images Gallery (5 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-emerald-50/50 border border-emerald-900/10">
              <img
                src={product.images[selectedImageIdx] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                {product.isBestseller && (
                  <span className="bg-gradient-to-r from-emerald-700 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    Bestseller
                  </span>
                )}
                {product.discountPercentage > 0 && (
                  <span className="bg-amber-600 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    {product.discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* Share & Wishlist */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <div className="relative">
                  <button
                    onClick={handleShare}
                    className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-emerald-950 flex items-center justify-center shadow-md transition-colors cursor-pointer"
                    aria-label="Share product" title="Share product"
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
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer ${
                    isSaved
                      ? 'bg-rose-500 text-white'
                      : 'bg-white/90 hover:bg-white text-gray-700 hover:text-rose-500'
                  }`}
                  title="Save to Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                {product.images.map((img, idx) => (
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

          {/* Right: Buy Box & Information (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="font-bold text-emerald-700 uppercase tracking-wider">
                  {product.category}
                </span>
                <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-gray-500 font-normal">({product.reviewCount} verified reviews)</span>
                </div>
              </div>

              {/* Title & Botanical subtitle */}
              <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 leading-tight">
                {product.name}
              </h1>

              {product.botanicalName && (
                <p className="text-xs sm:text-sm text-gray-500 italic mt-1 font-medium">
                  Botanical: {product.botanicalName}
                </p>
              )}

              {/* Pricing Math */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-3xl font-black text-emerald-950">₹{product.price}</span>
                {product.originalPrice > product.price && (
                  <span className="text-lg text-gray-400 line-through">₹{product.originalPrice}</span>
                )}
                {savings > 0 && (
                  <span className="text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    Save ₹{savings} ({product.discountPercentage}% OFF)
                  </span>
                )}
              </div>

              {/* Inclusions Pill Bar */}
              <div className="flex flex-wrap gap-2 mt-4">
                {product.potIncluded && (
                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
                    <Package className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Nursery Pot & Nutrient Mix Included</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs bg-[#F4FAF5] text-emerald-900 border border-emerald-900/10 px-3 py-1 rounded-full font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>5-Ply Transit Warranty</span>
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 mt-4 leading-relaxed">
                {product.description}
              </p>

              {/* Quick Care Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6">
                <div className="p-3 bg-[#F4FAF5] rounded-2xl border border-emerald-900/10">
                  <Sun className="w-4 h-4 text-amber-500 mb-1" />
                  <span className="text-[10px] text-gray-500 block font-medium">Sunlight</span>
                  <span className="text-xs font-bold text-emerald-950 leading-tight block truncate">
                    {product.attributes.light}
                  </span>
                </div>

                <div className="p-3 bg-[#F4FAF5] rounded-2xl border border-emerald-900/10">
                  <Droplets className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-[10px] text-gray-500 block font-medium">Watering</span>
                  <span className="text-xs font-bold text-emerald-950 leading-tight block truncate">
                    {product.attributes.water.split('(')[0]}
                  </span>
                </div>

                <div className="p-3 bg-[#F4FAF5] rounded-2xl border border-emerald-900/10">
                  <Award className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-[10px] text-gray-500 block font-medium">Difficulty</span>
                  <span className="text-xs font-bold text-emerald-950 leading-tight block truncate">
                    {product.attributes.difficulty}
                  </span>
                </div>

                <div className="p-3 bg-[#F4FAF5] rounded-2xl border border-emerald-900/10">
                  <Sparkles className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-[10px] text-gray-500 block font-medium">Air Quality</span>
                  <span className="text-xs font-bold text-emerald-950 leading-tight block truncate">
                    {product.attributes.airPurifying ? 'NASA Certified' : 'Vibrant'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Buy Controls (Combos Only Notice) & PIN code check */}
            <div className="space-y-4 pt-4 border-t border-emerald-900/10">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                <p className="text-sm font-bold text-emerald-950">
                  🌱 Individual plants are currently for viewing only.
                </p>
                <p className="text-xs text-emerald-800 mt-1">
                  Please visit our <button onClick={() => onNavigate('combos')} className="underline font-bold hover:text-emerald-900">Plant Combos</button> section to make a purchase.
                </p>
              </div>

              {/* Kerala & Tamil Nadu Pincode Delivery Check */}
              <div className="p-4 bg-[#F4FAF5] rounded-2xl border border-emerald-900/10">
                <form onSubmit={handlePincodeCheck} className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      value={pincodeInput}
                      onChange={(e) => setPincodeInput(e.target.value)}
                      placeholder="Enter 6-digit PIN (e.g. 682001)"
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
                  <div className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Eligible for <strong>Kerala Fast Delivery (2-3 days)</strong></span>
                  </div>
                )}
                {pincodeStatus === 'tamilnadu' && (
                  <div className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Eligible for <strong>Tamil Nadu Express Delivery (2-4 days)</strong></span>
                  </div>
                )}
                {pincodeStatus === 'outside' && (
                  <p className="mt-2 text-xs text-gray-600 font-medium">
                    Note: 7Seasons specializes in live transit across Kerala & Tamil Nadu to ensure zero plant stress.
                  </p>
                )}
                {pincodeStatus === 'invalid' && (
                  <p className="mt-2 text-xs text-rose-600 font-medium">
                    Please enter a valid 6-digit postal PIN code.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Detailed Tabs: Detailed Care Guide, FAQ, AI Doctor */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-900/10 shadow-xs">
          {/* Tab headers */}
          <div className="flex border-b border-emerald-900/10 gap-6 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 text-sm font-bold transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'text-emerald-950 border-b-2 border-emerald-700'
                  : 'text-gray-500 hover:text-emerald-950'
              }`}
            >
              Botanical Specifications
            </button>
            <button
              onClick={() => setActiveTab('care')}
              className={`pb-3 text-sm font-bold transition-colors cursor-pointer ${
                activeTab === 'care'
                  ? 'text-emerald-950 border-b-2 border-emerald-700'
                  : 'text-gray-500 hover:text-emerald-950'
              }`}
            >
              Plant Care Schedule
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-sm font-bold transition-colors cursor-pointer ${
                activeTab === 'reviews'
                  ? 'text-emerald-950 border-b-2 border-emerald-700'
                  : 'text-gray-500 hover:text-emerald-950'
              }`}
            >
              Customer Reviews ({product.reviewCount})
            </button>
          </div>

          {/* Tab 1: Overview Specs */}
          {activeTab === 'overview' && (
            <div className="space-y-6 text-xs sm:text-sm text-emerald-950 leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#F4FAF5] border border-emerald-900/10 space-y-2">
                  <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                    Plant Anatomy & Characteristics
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-600">
                    <li>• <strong>Botanical Name:</strong> {product.botanicalName || product.name}</li>
                    <li>• <strong>Category:</strong> {product.category}</li>
                    <li>• <strong>Ideal Placement:</strong> {product.attributes.location}</li>
                    <li>• <strong>Pet Safety:</strong> {product.attributes.petFriendly ? 'Pet Safe / Non-Toxic' : 'Keep away from curious pets'}</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#F4FAF5] border border-emerald-900/10 space-y-2">
                  <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                    Packaging & Unboxing Guarantee
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-600">
                    <li>• Shipped in 5-ply reinforced corrugated packaging</li>
                    <li>• Soil sealed with breathable organic coco-peat retention film</li>
                    <li>• Free WhatsApp potting consultation included</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Care Instructions */}
          {activeTab === 'care' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-emerald-950">Mannarathayil Nursery Care Rhythm</h4>
                  <p className="text-gray-700 mt-1 leading-relaxed">
                    {typeof product.careInstructions === 'string'
                      ? product.careInstructions
                      : product.careInstructions?.overview || 'Follow standard watering and indirect sunlight routine.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#F4FAF5] border border-emerald-900/10">
                  <strong className="text-emerald-950 block font-bold mb-1">Watering Rhythm</strong>
                  <p className="text-gray-600">{product.attributes.water}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4FAF5] border border-emerald-900/10">
                  <strong className="text-emerald-950 block font-bold mb-1">Sunlight Needs</strong>
                  <p className="text-gray-600">{product.attributes.light}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4FAF5] border border-emerald-900/10">
                  <strong className="text-emerald-950 block font-bold mb-1">Soil & Fertilizer</strong>
                  <p className="text-gray-600">{product.attributes.fertilizer || 'Organic compost feed once a month.'}</p>
                </div>
              </div>

              <div className="pt-3 text-center">
                <button
                  onClick={() => onNavigate('plant-care', 'tool:doctor')}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Have questions about this plant? Ask 7Seasons Plant Doctor AI →</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#F4FAF5] rounded-2xl border border-emerald-900/10">
                <div>
                  <div className="text-2xl font-black text-emerald-950">{product.rating.toFixed(1)} / 5.0</div>
                  <p className="text-xs text-gray-500">Based on {product.reviewCount} customer ratings</p>
                </div>
                <button
                  onClick={() => {
                    addToast({
                      title: 'Write a Review',
                      message: 'Thank you for being a plant parent! You can submit reviews from your Account Orders page.',
                      type: 'info',
                    });
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white text-xs font-bold rounded-full transition-colors shadow-xs"
                >
                  Write Review
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-emerald-900/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-emerald-950">Anoop R.</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified Buyer • Kochi
                    </span>
                  </div>
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Received in perfect condition in Ernakulam within 2 days. Soil was still moist and leaves
                  were very fresh without any damage. Beautiful plant!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 3. Featured Plant Combos Containing/Complementing this plant */}
        {relatedCombos.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-black uppercase text-emerald-700 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Save More With Bundles</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-emerald-950">
                  Featured Combos Including Similar Varieties
                </h3>
              </div>
              <button
                onClick={() => onNavigate('combos')}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                View all combos →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedCombos.map((combo) => (
                <ComboCard key={combo.id} combo={combo} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        )}

        {/* 4. Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-black text-emerald-950">
              More {product.category} Varieties
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
