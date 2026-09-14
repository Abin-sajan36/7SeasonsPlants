import React, { useState } from 'react';
import { Star, MessageCircle, AlertCircle, CheckCircle2, User as UserIcon, PartyPopper, Loader2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ReviewSection = ({ targetId, targetType, targetName }: { targetId: string; targetType: 'product' | 'combo'; targetName: string; }) => {
  const { reviews, addReview, currentUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const targetReviews = reviews.filter(
    (r) => r.targetId === targetId && r.targetType === targetType && (r.status === 'approved' || (currentUser && r.customerEmail === currentUser.email))
  );

  const avgRating = targetReviews.length > 0
    ? targetReviews.reduce((sum, r) => sum + r.rating, 0) / targetReviews.length
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newReview = {
      targetId,
      targetType,
      targetName,
      customerName: currentUser ? currentUser.name : guestName || 'Guest User',
      customerEmail: currentUser ? currentUser.email : guestEmail || 'guest@example.com',
      rating,
      title,
      comment,
      verifiedPurchase: !!currentUser,
      status: 'pending' as const
    };
    
    if (addReview) {
      await addReview(newReview);
    }
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    setTimeout(() => {
      setShowForm(false);
      setIsSubmitted(false);
      setTitle('');
      setComment('');
      setRating(5);
      if (!currentUser) {
        setGuestName('');
        setGuestEmail('');
      }
    }, 3000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-900/10 shadow-xs mt-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h2 className="text-2xl font-black text-emerald-950 mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= Math.round(avgRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-100 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-emerald-950 text-xl">{avgRating.toFixed(1)} <span className="text-sm text-gray-500 font-medium">out of 5</span></span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Based on {targetReviews.length} reviews</p>
        </div>
        
        <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-emerald-950 hover:bg-emerald-900 text-white font-bold rounded-full transition-colors cursor-pointer"
          >
            {showForm ? 'Cancel Review' : 'Write a Review'}
          </button>
      </div>

      {showForm && (
        <div className="mb-10 bg-[#F4FAF5] p-6 rounded-3xl border border-emerald-900/10 overflow-hidden relative">
          {isSubmitted ? (
            <>
            <style>
              {`
                @keyframes popIn {
                  0% { opacity: 0; transform: scale(0.9) translateY(10px); }
                  100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-pop-in { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
              `}
            </style>
            <div className="flex flex-col items-center justify-center py-12 text-center animate-pop-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <PartyPopper className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-emerald-950 mb-2">Review Submitted!</h3>
              <p className="text-emerald-700 max-w-md">
                Thank you for your feedback! Your review will be visible once approved by our team.
              </p>
            </div>
          </>
          ) : (
        <form onSubmit={handleSubmit}>
          <h3 className="font-bold text-emerald-950 mb-4">Leave your review for {targetName}</h3>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-emerald-950 mb-2">Overall Rating *</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-white text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {!currentUser && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-emerald-950 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-emerald-900/10 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-emerald-950 mb-1">Your Email *</label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-emerald-900/10 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-emerald-950 mb-1">Headline *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's most important to know?"
                className="w-full px-4 py-3 rounded-xl border border-emerald-900/10 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-emerald-950 mb-1">Written Review *</label>
              <textarea
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="What did you like or dislike?"
                className="w-full px-4 py-3 rounded-xl border border-emerald-900/10 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none resize-none"
              ></textarea>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
        )}
        </div>
      )}

      <div className="space-y-6">
        {targetReviews.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-emerald-950 mb-1">No reviews yet</h3>
            <p className="text-gray-500">Be the first to review this {targetType}!</p>
          </div>
        ) : (
          targetReviews.map((review) => (
            <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                {review.status === 'pending' && (
                  <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                    Pending Approval
                  </span>
                )}
              </div>
              <h4 className="font-bold text-emerald-950 mb-2">{review.title}</h4>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{review.comment}</p>
              
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
                    <UserIcon className="w-3 h-3" />
                  </div>
                  {review.customerName}
                </div>
                {review.verifiedPurchase && (
                  <div className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Purchase
                  </div>
                )}
                <span>{new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric'})}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
