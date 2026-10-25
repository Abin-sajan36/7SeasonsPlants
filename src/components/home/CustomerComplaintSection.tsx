import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  Truck,
  RotateCcw,
  MessageSquare,
  ArrowRight,
  Headphones,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CustomerComplaintModal } from '../common/CustomerComplaintModal';

interface CustomerComplaintSectionProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CustomerComplaintSection: React.FC<CustomerComplaintSectionProps> = ({ onNavigate }) => {
  const { storeSettings } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const companyEmail = storeSettings?.email || 'mannaratharayil@gmail.com';
  const whatsappNumber = (storeSettings?.whatsapp || storeSettings?.whatsappNumber || '+91 88482 76403').replace(/[^0-9]/g, '');

  // Auto-open modal if hash points to #raise-complaint
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('raise-complaint')) {
      setIsModalOpen(true);
    }
  }, []);

  return (
    <>
      <section className="py-10 bg-gradient-to-b from-[#F4FAF5] via-emerald-50/60 to-[#F4FAF5] dark:from-[#04100b] dark:via-[#061811] dark:to-[#04100b] border-y border-emerald-900/10 dark:border-emerald-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#062416] via-[#093522] to-[#041a10] text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-emerald-700/30">
            {/* Background Decorative Floral / Leaf Glow */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              {/* Left Column: Messaging & Trust Badges */}
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-black uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>7Seasons Nursery Guarantee & Grievance Desk</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                  Received a Damaged Plant or Facing Delivery Issues?
                </h2>

                <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
                  We pack live plants with utmost care in specialized ventilated cartons. If your plants arrive wilted, broken during transit, or missing bundled pots, raise a complaint directly with our founders for an{' '}
                  <strong className="text-white underline decoration-emerald-400 decoration-2">instant free replacement or full refund</strong>.
                </p>

                {/* Trust Points */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2.5 backdrop-blur-xs">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">Transit Guarantee</p>
                      <p className="text-[10px] text-emerald-200/70">100% Live Arrival</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2.5 backdrop-blur-xs">
                    <RotateCcw className="w-5 h-5 text-rose-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">Free Replacement</p>
                      <p className="text-[10px] text-emerald-200/70">No Return Shipping</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2.5 backdrop-blur-xs">
                    <Headphones className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">Founder Escalation</p>
                      <p className="text-[10px] text-emerald-200/70">Monitored 24/7</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: CTA Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 shrink-0 justify-center">
                {/* Main Action: Raise Complaint Pop-up Button */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-sm sm:text-base shadow-xl hover:shadow-rose-900/40 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer group"
                >
                  <AlertTriangle className="w-5 h-5 text-rose-200 group-hover:rotate-12 transition-transform" />
                  <span>Raise a Customer Complaint</span>
                  <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Secondary Action: Direct WhatsApp Hotline */}
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    'Hello Mannaratharayil Gardens LLP, I have an urgent complaint/query regarding my live plant order.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/15 transition-all cursor-pointer backdrop-blur-xs"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Direct WhatsApp Nursery Desk</span>
                </a>

                <p className="text-[11px] text-center text-emerald-200/60 font-medium">
                  Tickets logged directly to <strong>{companyEmail}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Complaint Modal Pop-up */}
      <CustomerComplaintModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
