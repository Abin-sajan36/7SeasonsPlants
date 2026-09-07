import React from 'react';
import { Star, ShieldCheck, MapPin } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ReviewsSection: React.FC = () => {
  const { reviews } = useStore();
  const approvedReviews = reviews.filter((r) => r.isApproved).slice(0, 4);

  return (
    <section className="py-16 bg-[#F4FAF5] border-b border-emerald-900/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Customer Stories</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
            Loved by Plant Parents Across Kerala & Tamil Nadu
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Read authentic feedback from customers who received healthy, fresh plants from Mannarathayil Nursery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {approvedReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-6 rounded-3xl border border-emerald-900/8 shadow-sm hover:shadow-lg transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-gray-700 leading-relaxed italic mb-4 font-normal">
                  "{review.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>{review.userName}</span>
                    {review.isVerifiedBuyer && (
                      <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                        Verified
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 text-gray-400" />
                    <span>{review.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
