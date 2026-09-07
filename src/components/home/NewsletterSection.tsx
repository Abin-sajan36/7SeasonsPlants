import React, { useState } from 'react';
import { Mail, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const NewsletterSection: React.FC = () => {
  const { addToast } = useStore();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      addToast({
        title: 'Invalid Email',
        message: 'Please enter a valid email address.',
        type: 'error',
      });
      return;
    }

    setIsSubscribed(true);
    addToast({
      title: 'Welcome to the 7Seasons Family!',
      message: 'Use coupon WELCOME10 at checkout for 10% off your first nursery order.',
      type: 'success',
    });
    setEmail('');
  };

  return (
    <section className="py-14 bg-gradient-to-br from-[#062B1A] via-[#093822] to-[#041A10] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[#A7F3D0] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Nursery VIP Club</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Get 10% Off Your First Plant Order
          </h2>

          <p className="text-xs sm:text-sm text-[#D1FAE5]/90 mt-2 max-w-lg mx-auto leading-relaxed">
            Subscribe to our weekly botanical gazette. Receive seasonal Kerala & TN planting calendars,
            care alerts, and secret combo flash sale codes.
          </p>

          {isSubscribed ? (
            <div className="mt-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 inline-flex items-center gap-2 text-white text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>You're subscribed! Use coupon code <strong>WELCOME10</strong> for 10% OFF.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white text-xs text-emerald-950 rounded-full outline-hidden focus:ring-2 focus:ring-emerald-400 placeholder:text-gray-400 shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-full font-black text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <p className="text-[11px] text-[#A7F3D0]/70 mt-3">
            No spam, ever. Unsubscribe with 1-click anytime.
          </p>
        </div>
      </div>
    </section>
  );
};
