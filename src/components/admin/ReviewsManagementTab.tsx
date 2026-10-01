import React, { useState } from 'react';
import {
  Star,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  MapPin,
  Package,
  Layers,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Plus,
  X,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Review } from '../../types';
import { initialReviews } from '../../data/initialData';

export const ReviewsManagementTab: React.FC = () => {
  const { reviews, deleteReview, addReview, products, combos, addToast } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | 'low'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'combo' | 'product'>('all');
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  // Add Review Modal State (Admin adding a customer review received from WhatsApp/Store)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formRating, setFormRating] = useState<number>(5);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formTargetType, setFormTargetType] = useState<'combo' | 'product'>('combo');
  const [formTargetId, setFormTargetId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Safe reviews list with fallback
  const rawReviews = reviews && reviews.length > 0 ? reviews : initialReviews;

  // Filtered reviews
  const filteredReviews = rawReviews.filter((review) => {
    const q = searchQuery.toLowerCase().trim();
    const customer = (review.customerName || review.userName || '').toLowerCase();
    const comment = (review.comment || '').toLowerCase();
    const title = (review.title || '').toLowerCase();
    const item = (review.targetName || '').toLowerCase();
    const location = (review.customerLocation || review.location || '').toLowerCase();

    const matchesQuery =
      !q ||
      customer.includes(q) ||
      comment.includes(q) ||
      title.includes(q) ||
      item.includes(q) ||
      location.includes(q);

    const matchesRating =
      ratingFilter === 'all' ||
      (ratingFilter === '5' && review.rating === 5) ||
      (ratingFilter === '4' && review.rating === 4) ||
      (ratingFilter === 'low' && review.rating < 4);

    const matchesType =
      typeFilter === 'all' || review.targetType === typeFilter;

    return matchesQuery && matchesRating && matchesType;
  });

  const handleDeleteConfirm = () => {
    if (!reviewToDelete) return;
    deleteReview(reviewToDelete.id);
    setReviewToDelete(null);
  };

  const handleAdminAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formComment.trim()) {
      setFormError('Please enter reviewer name and feedback.');
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
        title: formTitle.trim() || 'Verified Nursery Customer',
        comment: formComment.trim(),
        verifiedPurchase: true,
      });

      setIsAddModalOpen(false);
      setFormName('');
      setFormEmail('');
      setFormLocation('');
      setFormTitle('');
      setFormComment('');
      setFormRating(5);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to add review.');
    }
  };

  // Metrics
  const totalReviews = rawReviews.length;
  const fiveStarReviews = rawReviews.filter((r) => r.rating === 5).length;
  const avgRating = totalReviews > 0
    ? (rawReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviews).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <MessageSquare className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-emerald-950">Customer Reviews Moderation</h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {totalReviews} Total
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Manage and moderate customer testimonials displayed on the homepage. Delete any unwanted or spam reviews anytime.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer Review</span>
          </button>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100 text-xs">
          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <span className="text-gray-500 block text-[11px]">Total Published</span>
            <span className="text-lg font-black text-emerald-950">{totalReviews}</span>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <span className="text-gray-500 block text-[11px]">Average Rating</span>
            <span className="text-lg font-black text-amber-700 flex items-center gap-1">
              {avgRating} <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </span>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <span className="text-gray-500 block text-[11px]">5-Star Reviews</span>
            <span className="text-lg font-black text-emerald-700">{fiveStarReviews}</span>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <span className="text-gray-500 block text-[11px]">Verified Buyers</span>
            <span className="text-lg font-black text-emerald-900">{totalReviews}</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, location, comment, or plant name..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 text-gray-900 rounded-full border border-gray-200 text-xs focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value as any)}
              className="px-3.5 py-2 bg-gray-50 text-gray-700 rounded-full border border-gray-200 text-xs font-semibold focus:bg-white outline-hidden cursor-pointer"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars Only</option>
              <option value="low">Under 4 Stars</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3.5 py-2 bg-gray-50 text-gray-700 rounded-full border border-gray-200 text-xs font-semibold focus:bg-white outline-hidden cursor-pointer"
            >
              <option value="all">All Product Types</option>
              <option value="combo">Combos Only</option>
              <option value="product">Single Plants</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-800 text-base">No reviews found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            No customer reviews match your search or filter criteria.
          </p>
          {(searchQuery || ratingFilter !== 'all' || typeFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setRatingFilter('all');
                setTypeFilter('all');
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-bold transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReviews.map((review) => {
            const customerName = review.customerName || review.userName || 'Customer';
            const location = review.customerLocation || review.location || 'Kerala, India';
            const isVerified = review.verifiedPurchase ?? review.isVerifiedBuyer ?? true;

            return (
              <div
                key={review.id}
                className="bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Stars, Verified, and Delete Action */}
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
                      <span className="text-xs font-bold text-gray-700 ml-1">
                        {review.rating || 5}.0
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setReviewToDelete(review)}
                      className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 rounded-xl border border-rose-200 hover:border-rose-600 transition-colors cursor-pointer shadow-2xs"
                      title="Delete review from home page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Comment */}
                  {review.title && (
                    <h4 className="font-bold text-emerald-950 text-sm leading-snug">
                      "{review.title}"
                    </h4>
                  )}
                  <p className="text-xs text-gray-700 leading-relaxed font-normal">
                    {review.comment}
                  </p>

                  {/* Target Product Tag */}
                  {review.targetName && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-[11px] font-semibold text-emerald-900 border border-emerald-100">
                      {review.targetType === 'combo' ? (
                        <Layers className="w-3 h-3 text-emerald-600 shrink-0" />
                      ) : (
                        <Package className="w-3 h-3 text-emerald-600 shrink-0" />
                      )}
                      <span className="truncate max-w-[220px]">{review.targetName}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Row: Customer Name & Location */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-900 block">{customerName}</span>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                      <span>{location}</span>
                    </div>
                  </div>

                  {isVerified && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-gray-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-gray-900">Delete Review from Home Page?</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to permanently delete the review by{' '}
                <strong className="text-emerald-950 font-bold">
                  "{reviewToDelete.customerName || reviewToDelete.userName || 'Customer'}"
                </strong>?
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
                onClick={handleDeleteConfirm}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Review</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN ADD REVIEW MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 sm:p-7 space-y-5 border border-gray-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Star className="w-4 h-4 fill-emerald-700" />
                </span>
                <div>
                  <h3 className="text-base font-black text-emerald-950">Add Customer Review</h3>
                  <p className="text-[11px] text-gray-500">Publish genuine feedback received from WhatsApp or store visitors.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
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

            <form onSubmit={handleAdminAddReview} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-900 block mb-1.5">Rating *</label>
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
                    {formRating} Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-900 block mb-1">Headline / Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Stunning healthy plants, quick delivery to Kochi!"
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-gray-900 block mb-1">Review Feedback *</label>
                <textarea
                  rows={3}
                  required
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Customer feedback text..."
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden resize-none font-normal"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-900 block mb-1">Type</label>
                  <select
                    value={formTargetType}
                    onChange={(e) => {
                      setFormTargetType(e.target.value as any);
                      setFormTargetId('');
                    }}
                    className="w-full px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white outline-hidden cursor-pointer font-medium"
                  >
                    <option value="combo">Combo Bundle</option>
                    <option value="product">Single Plant</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-900 block mb-1">Variety</label>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-900 block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Arun Pillai"
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-900 block mb-1">City / State</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Kochi, Kerala"
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
