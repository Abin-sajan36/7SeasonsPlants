import React from 'react';
import { Flame, ArrowRight, ShoppingBag, Sparkles, Tag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { DealCountdown } from '../common/DealCountdown';

interface DailyDealsSectionProps {
  onNavigate: (view: string, param?: string) => void;
}

export const DailyDealsSection: React.FC<DailyDealsSectionProps> = ({ onNavigate }) => {
  const { dailyDeals, products, combos, addToCart } = useStore();

  const activeDeals = dailyDeals.filter((d) => d.isActive).filter(deal => {
    try {
      const [hours, minutes] = deal.endTime.split(':').map(Number);
      const target = new Date(`${deal.endDate}T${String(hours || 23).padStart(2, '0')}:${String(minutes || 59).padStart(2, '0')}:00`);
      const now = new Date();
      return target.getTime() > now.getTime();
    } catch (err) {
      return true;
    }
  });

  if (activeDeals.length === 0) return null;

  return (
    <section id="deals" className="py-16 bg-gradient-to-b from-[#062919] to-[#041A10] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Flame Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3">
              <Flame className="w-4 h-4 text-rose-400 animate-bounce" />
              <span>Limited Time Nursery Deals</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Today's Plant & Combo Deals
            </h2>
            <p className="text-xs sm:text-sm text-[#A7F3D0] mt-1 max-w-xl">
              Special promotional prices refreshed daily. Verified nursery stock with real-time expiration timers.
            </p>
          </div>

          <button
            onClick={() => onNavigate('combos')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>Explore All Bundle Savings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Deals Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {activeDeals.map((deal) => {
            const isCombo = deal.targetType === 'combo';
            const targetItem = isCombo
              ? combos.find((c) => c.id === deal.targetId)
              : products.find((p) => p.id === deal.targetId);

            if (!targetItem) return null;

            return (
              <div
                key={deal.id}
                className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/20 text-emerald-950 flex flex-col sm:flex-row group"
              >
                {/* Image Section */}
                <div className="sm:w-2/5 relative aspect-square sm:aspect-auto overflow-hidden bg-emerald-50 shrink-0">
                  <img
                    src={
                      deal.bannerImage ||
                      targetItem.images[0] ||
                      'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                    <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                      {deal.discountPercentage}% OFF
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Countdown Timer */}
                    <div className="mb-3">
                      <DealCountdown
                        endDate={deal.endDate}
                        endTime={deal.endTime}
                        variant="card"
                      />
                    </div>

                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                      {deal.badge || "TODAY'S SPECIAL"}
                    </span>

                    <h3 className="font-black text-lg text-emerald-950 leading-snug group-hover:text-emerald-700 transition-colors">
                      {deal.title}
                    </h3>

                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                      {deal.subtitle}
                    </p>

                    {/* Pricing Math */}
                    <div className="mt-4 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-500 block">Deal Price</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-emerald-950">
                            ₹{deal.dealPrice}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            ₹{deal.originalPrice}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-rose-600 bg-white px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs">
                          Save ₹{deal.savings}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-2.5">
                    <button
                      onClick={() =>
                        onNavigate(
                          isCombo ? 'combo-detail' : 'product-detail',
                          targetItem.slug
                        )
                      }
                      className="flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold text-xs rounded-full transition-colors text-center cursor-pointer border border-emerald-100"
                    >
                      View Details
                    </button>

                    {isCombo && (
                      <button
                        onClick={() => {
                          // Add with deal price override
                          const itemWithDealPrice = { ...targetItem, price: deal.dealPrice };
                          addToCart(itemWithDealPrice, 'combo', 1);
                        }}
                        className="py-2.5 px-4 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white font-bold text-xs rounded-full shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Claim Deal</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
