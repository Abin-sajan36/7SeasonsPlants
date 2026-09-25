import React, { useState } from 'react';
import {
  Star,
  ShieldCheck,
  MapPin,
  Quote,
  Plus,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  X,
  AlertCircle,
  Package,
  Layers,
  Heart,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { initialReviews } from '../../data/initialData';
import { Review } from '../../types';

interface ReviewsSectionProps {
  onNavigate?: (view: string, param?: string) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ onNavigate }) => {
  const { reviews, addReview, deleteReview, products, combos, addToast, currentAdmin, isAdminAuthenticated } = useStore();

  const isAdmin = Boolean(currentAdmin || isAdminAuthenticated);
  const [activeFilter, setActiveFilter] = useState<'all' | 'combos' | 'products' | 'top'>('all');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formRating, setFormRating] = useState<number>(5);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formTargetType, setFormTargetType] = useState<'combo' | 'product'>('combo');
  const [formTargetId, setFormTargetId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Safe list of reviews: checks both status and legacy flags, with fallback to initialReviews
  const rawReviews = (reviews && reviews.length > 0) ? reviews : initialReviews;

  const validReviews: Review[] = rawReviews.filter((r) => {
    // If status is present, check approved; otherwise allow default sample reviews
    if (r.status) return r.status === 'approved';
    if (typeof r.isApproved === 'boolean') return r.isApproved;
    return true;
  });

  // Display reviews according to selected filter
  const displayedReviews = validReviews.filter((r) => {
    if (activeFilter === 'combos') return r.targetType === 'combo';
    if (activeFilter === 'products') return r.targetType === 'product';
    if (activeFilter === 'top') return r.rating === 5;
    return true;
  });

  // Calculate statistics
  const totalCount = validReviews.length;
  const averageRating = totalCount > 0
    ? (validReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalCount).toFixed(1)
    : '4.9';

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formComment.trim()) {
      setFormError('Please provide your name and your review feedback.');
      return;
    }

    let selectedTargetName = 'Plant Order';
    if (formTargetType === 'combo') {
      const foundCombo = combos.find((c) => c.id === formTargetId);
      selectedTargetName = foundCombo ? foundCombo.name : 'Curated Plant Combo';
    } else {
      const foundProd = products.find((p) => p.id === formTargetId);
      selectedTargetName = foundProd ? foundProd.name : 'Indoor Plant Sapling';
    }

    try {
      addReview({
        targetId: formTargetId || 'general-order',
        targetType: formTargetType,
        targetName: selectedTargetName,
        customerName: formName.trim(),
        customerEmail: formEmail.trim() || 'customer@example.com',
        customerLocation: formLocation.trim() || 'Kerala, India',
        rating: formRating,
        title: formTitle.trim() || 'Wonderful Nursery Plants',
        comment: formComment.trim(),
        verifiedPurchase: true,
      });

      setIsWriteModalOpen(false);
      setFormName('');
      setFormEmail('');
      setFormLocation('');
      setFormTitle('');
      setFormComment('');
      setFormRating(5);
    } catch (err: any) {
      setFormError(err?.message || 'Could not submit review. Please try again.');
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-[#F4FAF5] border-y border-emerald-900/8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#7D8F69]/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Verified Customer Stories • 4.9★ Nursery Quality</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-950 tracking-tight leading-tight">
              Loved by Plant Parents Across Kerala & Tamil Nadu
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Read authentic feedback from genuine gardeners and homeowners who received live, nursery-fresh plants packed in 5-ply ventilated nursery crates from Mannaratharayil Gardens LLP.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isAdmin && (
              <span className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                <span>Admin Mode: Click trash to remove reviews</span>
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsWriteModalOpen(true)}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-200" />
              <span>Share Your Plant Story</span>
            </button>
          </div>
        </div>

        {/* Rating Metrics & Trust Highlights Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-emerald-900/10 shadow-2xs flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center shrink-0">
              <span className="text-sm sm:text-base font-black text-amber-800 leading-none">{averageRating}</span>
              <div className="flex items-center gap-0.5 text-amber-500 mt-0.5">
                <Star className="w-2.5 h-2.5 fill-current" />
              </div>
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-emerald-950 block truncate">4.9 / 5 Rating</span>
              <span className="text-[10px] sm:text-[11px] text-gray-500 block truncate">Verified deliveries</span>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-emerald-900/10 shadow-2xs flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-emerald-950 block truncate">100% Transit Safe</span>
              <span className="text-[10px] sm:text-[11px] text-gray-500 block truncate">Zero damage guarantee</span>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-emerald-900/10 shadow-2xs flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-emerald-950 block truncate">5-Ply Safe Boxes</span>
              <span className="text-[10px] sm:text-[11px] text-gray-500 block truncate">Breathable root crates</span>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-emerald-900/10 shadow-2xs flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-emerald-950 block truncate">Free Care Support</span>
              <span className="text-[10px] sm:text-[11px] text-gray-500 block truncate">Lifelong doctor care</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { id: 'all', label: `All Reviews (${validReviews.length})` },
            { id: 'combos', label: 'Curated Combos' },
            { id: 'products', label: 'Single Plants' },
            { id: 'top', label: '5-Star Reviews Only' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-emerald-950 hover:bg-emerald-50 border border-emerald-900/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedReviews.map((review) => {
            const reviewerName = review.customerName || review.userName || 'Happy Customer';
            const location = review.customerLocation || review.location || 'Kerala, India';
            const isVerified = review.verifiedPurchase ?? review.isVerifiedBuyer ?? true;
            const initials = reviewerName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={review.id}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-emerald-900/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group space-y-3.5 sm:space-y-4"
              >
                <div className="space-y-3">
                  {/* Top: Star Rating & Verified Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < (review.rating || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isVerified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified Buyer</span>
                        </span>
                      )}

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReviewToDelete(review);
                          }}
                          title="Delete this review from Home Page (Admin)"
                          className="p-1 text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg border border-rose-200 hover:border-rose-600 transition-colors cursor-pointer shadow-2xs ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Review Title */}
                  {review.title && (
                    <h4 className="font-bold text-emerald-950 text-sm leading-snug group-hover:text-emerald-800 transition-colors">
                      "{review.title}"
                    </h4>
                  )}

                  {/* Comment */}
                  <p className="text-xs text-gray-700 leading-relaxed font-normal">
                    {review.comment}
                  </p>

                  {/* Purchased Item Tag */}
                  {review.targetName && (
                    <div className="pt-1">
                      <div
                        onClick={() => {
                          if (onNavigate) {
                            if (review.targetType === 'combo') onNavigate('combos');
                            else onNavigate('products');
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/70 border border-emerald-100 text-[11px] font-semibold text-emerald-900 ${
                          onNavigate ? 'hover:bg-emerald-100 cursor-pointer' : ''
                        }`}
                      >
                        {review.targetType === 'combo' ? (
                          <Layers className="w-3 h-3 text-emerald-600 shrink-0" />
                        ) : (
                          <Package className="w-3 h-3 text-emerald-600 shrink-0" />
                        )}
                        <span className="truncate max-w-[240px]">Item: {review.targetName}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer: Reviewer Info */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-900 text-amber-300 font-black text-xs flex items-center justify-center shadow-2xs shrink-0">
                      {initials || 'PL'}
                    </div>
                    <div>
                      <span className="font-bold text-emerald-950 text-xs block leading-tight">
                        {reviewerName}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{location}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-medium text-gray-400">
                    Verified Order
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner with WhatsApp Consultation Option */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#062919] to-emerald-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-emerald-800/40">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Heart className="w-4 h-4 fill-amber-300" />
              <span>100% Happiness Commitment</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Had an experience with our nursery plants?
            </h3>
            <p className="text-xs text-emerald-100/80 max-w-xl leading-relaxed">
              We value honest feedback from every plant lover. Help fellow gardeners choose the right varieties for their living spaces.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsWriteModalOpen(true)}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-full font-black text-xs transition-colors shadow-xs cursor-pointer"
            >
              Write a Plant Review
            </button>
          </div>
        </div>
      </div>

      {/* WRITE A REVIEW MODAL */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90dvh] sm:max-h-[92vh] overflow-y-auto p-4 sm:p-7 space-y-4 sm:space-y-5 border border-gray-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Star className="w-4 h-4 fill-emerald-700" />
                </span>
                <div>
                  <h3 className="text-base font-black text-emerald-950">Share Your Plant Review</h3>
                  <p className="text-[11px] text-gray-500">Help other plant parents choose the best greenery.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWriteModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              {/* Star Rating Selector */}
              <div>
                <label className="font-bold text-gray-900 block mb-1.5">Your Rating *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-gray-700 ml-2">
                    {formRating === 5
                      ? '5 Stars (Excellent)'
                      : formRating === 4
                      ? '4 Stars (Very Good)'
                      : formRating === 3
                      ? '3 Stars (Average)'
                      : `${formRating} Stars`}
                  </span>
                </div>
              </div>

              {/* Review Title */}
              <div>
                <label className="font-bold text-gray-900 block mb-1">Headline / Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Arrived perfectly fresh, thriving on my balcony!"
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className="font-bold text-gray-900 block mb-1">Your Review Feedback *</label>
                <textarea
                  rows={4}
                  required
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Tell us about the plant condition, packaging, growth, and delivery experience..."
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden resize-none font-normal"
                />
              </div>

              {/* Plant / Combo Purchased */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-900 block mb-1">Category Purchased</label>
                  <select
                    value={formTargetType}
                    onChange={(e) => {
                      setFormTargetType(e.target.value as any);
                      setFormTargetId('');
                    }}
                    className="w-full px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white outline-hidden cursor-pointer font-medium"
                  >
                    <option value="combo">Plant Combo / Bundle</option>
                    <option value="product">Single Plant Variety</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-900 block mb-1">Select Variety (Optional)</label>
                  <select
                    value={formTargetId}
                    onChange={(e) => setFormTargetId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white outline-hidden cursor-pointer font-medium"
                  >
                    <option value="">General Nursery Order</option>
                    {formTargetType === 'combo'
                      ? combos.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))
                      : products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              {/* Name & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-900 block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Anjali Nair"
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-900 block mb-1">Your City / State</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Ernakulam, Kerala"
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                  />
                </div>
              </div>

              {/* Email (not published) */}
              <div>
                <label className="font-bold text-gray-900 block mb-1">Your Email (Kept Private)</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. anjali@gmail.com"
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Submit Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* DELETE CONFIRMATION MODAL (ADMIN ONLY) */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-gray-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-gray-900">Delete Review from Home Page?</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to permanently delete the review by <strong className="text-emerald-950 font-bold">"{reviewToDelete.customerName || reviewToDelete.userName || 'Customer'}"</strong>?
              </p>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-left mt-2 space-y-1">
                <span className="text-[11px] font-bold text-emerald-950 block">
                  {reviewToDelete.title}
                </span>
                <p className="text-[11px] text-gray-600 italic">
                  "{reviewToDelete.comment}"
                </p>
              </div>
              <p className="text-[11px] text-rose-600 pt-1 font-semibold">
                This review will be permanently deleted and removed from the customer reviews section.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteReview(reviewToDelete.id);
                  setReviewToDelete(null);
                }}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Review</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
