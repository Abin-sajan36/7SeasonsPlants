import React, { useState, useEffect } from 'react';
import {
  Search,
  Truck,
  CheckCircle2,
  Package,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';

interface TrackOrderPageProps {
  initialOrderId?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ initialOrderId, onNavigate }) => {
  const { orders } = useStore();
  const [searchInput, setSearchInput] = useState(initialOrderId || '');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialOrderId) {
      const q = initialOrderId.trim().toLowerCase();
      const match = orders.find(
        (o) =>
          o.id.toLowerCase() === q ||
          (o.orderNumber && o.orderNumber.toLowerCase() === q) ||
          (o.customer?.phone && o.customer.phone.includes(q)) ||
          (o.customer?.shippingAddress?.phoneNumber && o.customer.shippingAddress.phoneNumber.includes(q))
      );
      if (match) {
        setSearchedOrder(match);
        setHasSearched(true);
      }
    }
  }, [initialOrderId, orders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setHasSearched(true);
    const q = searchInput.trim().toLowerCase();
    const match = orders.find(
      (o) =>
        o.id.toLowerCase() === q ||
        (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
        (o.customer?.phone && o.customer.phone.includes(q)) ||
        (o.customer?.shippingAddress?.phoneNumber && o.customer.shippingAddress.phoneNumber.includes(q)) ||
        (o.customer?.name && o.customer.name.toLowerCase().includes(q)) ||
        (o.customer?.shippingAddress?.fullName && o.customer.shippingAddress.fullName.toLowerCase().includes(q)) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
    );

    setSearchedOrder(match || null);
  };

  const steps = [
    { key: 'Order Placed', title: 'Order Confirmed', desc: 'Payment verified & order queued at nursery' },
    { key: 'Processing', title: 'Plant Selection & Packing', desc: 'Healthy specimens watered & packed in 5-ply cartons' },
    { key: 'Shipped', title: 'Dispatched in Transit', desc: 'Handed to express logistics for Kerala & TN delivery' },
    { key: 'Delivered', title: 'Delivered Safely', desc: 'Received at doorstep in vibrant condition' },
  ];

  const getStepIndex = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('placed') || s.includes('confirm') || s.includes('pending')) return 0;
    if (s.includes('process') || s.includes('pack')) return 1;
    if (s.includes('ship') || s.includes('dispatch') || s.includes('transit') || s.includes('out for delivery')) return 2;
    if (s.includes('deliver')) return 3;
    return 1;
  };

  return (
    <div className="bg-[#F4FAF5] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200">
            <Truck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Nursery Dispatch Logistics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
            Track Your Plant Delivery
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
            Enter your Order ID (e.g. 7S-2026-1001), Order Number, or registered mobile number.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-emerald-900/10 shadow-xs max-w-xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Order ID, Order # or Mobile Number"
                className="w-full pl-10 pr-3 py-3 bg-[#F4FAF5] text-xs font-semibold text-emerald-950 rounded-full border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full text-xs font-black shadow-sm transition-colors cursor-pointer"
            >
              Track
            </button>
          </form>

          {/* Sample quick search pills */}
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-gray-500">
            <span>Try sample order:</span>
            <button
              onClick={() => {
                setSearchInput('7S-2026-1001');
                const match = orders.find((o) => o.orderNumber === '7S-2026-1001' || o.id === 'ord-7s-1001');
                if (match) {
                  setSearchedOrder(match);
                  setHasSearched(true);
                }
              }}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              7S-2026-1001 (Kochi)
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setSearchInput('7S-2026-1002');
                const match = orders.find((o) => o.orderNumber === '7S-2026-1002' || o.id === 'ord-7s-1002');
                if (match) {
                  setSearchedOrder(match);
                  setHasSearched(true);
                }
              }}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              7S-2026-1002 (Coimbatore)
            </button>
          </div>
        </div>

        {/* Tracking Results Card */}
        {hasSearched && searchedOrder && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-900/10 shadow-md space-y-8 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-emerald-900/10 gap-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Order #{searchedOrder.orderNumber || searchedOrder.id}
                </span>
                <h2 className="text-xl font-black text-emerald-950 mt-1">
                  Destination: {searchedOrder.customer?.shippingAddress?.district || searchedOrder.customer?.shippingAddress?.city || 'Kerala'}, {searchedOrder.customer?.shippingAddress?.state || 'Kerala'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Placed on {searchedOrder.createdAt ? new Date(searchedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'} • Total ₹{searchedOrder.total}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs font-bold text-gray-500 block">Current Status</span>
                <span className="inline-block mt-0.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {searchedOrder.orderStatus}
                </span>
                {searchedOrder.trackingNumber && (
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    AWB: {searchedOrder.trackingNumber} {searchedOrder.courierPartner ? `(${searchedOrder.courierPartner})` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* 4-Step Progress Tracker */}
            <div>
              <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-6">
                Delivery Milestones
              </h3>

              <div className="flex flex-col sm:flex-row relative z-0">
                {steps.map((step, idx) => {
                  const currentIdx = getStepIndex(searchedOrder.orderStatus);
                  const isCompleted = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  const isLast = idx === steps.length - 1;

                  return (
                    <div key={step.key} className="flex-1 relative flex sm:flex-col items-start gap-4 sm:gap-3 group pb-8 sm:pb-0">
                      {/* Connecting line */}
                      {!isLast && (
                        <>
                          {/* Mobile vertical line */}
                          <div className={`absolute left-[11px] top-6 bottom-0 w-[2px] sm:hidden transition-colors duration-300 ${isCompleted && !isCurrent ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                          {/* Desktop horizontal line */}
                          <div className={`absolute top-[11px] left-6 w-[calc(100%-24px)] h-[2px] hidden sm:block transition-colors duration-300 ${isCompleted && !isCurrent ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                        </>
                      )}

                      {/* Icon */}
                      <div className="relative z-10 shrink-0">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                            isCompleted
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                              : 'bg-white border-gray-300 text-gray-400'
                          } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 sm:pr-4 pt-1 sm:pt-0">
                        <h4 className={`font-bold text-xs leading-tight transition-colors duration-300 ${isCurrent ? 'text-emerald-800' : isCompleted ? 'text-emerald-950' : 'text-gray-400'}`}>
                          {step.title}
                        </h4>
                        <p className={`text-[11px] mt-1 leading-snug transition-colors duration-300 ${isCurrent ? 'text-emerald-700/80' : isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items in Package */}
            <div className="pt-4 border-t border-emerald-900/10">
              <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-3">
                Plants in this Parcel ({searchedOrder.items.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchedOrder.items.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 bg-[#F4FAF5] rounded-2xl border border-emerald-900/10 flex items-center gap-3"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-emerald-50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-emerald-950 truncate">{item.name}</h4>
                      <p className="text-[11px] text-gray-500">
                        Qty: {item.quantity} • ₹{item.price} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Actions */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-950 font-medium">
                <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Need assistance with your delivery? Contact nursery dispatch.</span>
              </div>
              <a
                href={`https://wa.me/919567274176?text=Hi%207Seasonsplants,%20I'm%20tracking%20order%20%23${searchedOrder.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#25D366] text-white font-bold rounded-full hover:bg-[#20bd5a] transition-colors shrink-0 shadow-xs"
              >
                WhatsApp +91 95672 74176
              </a>
            </div>
          </div>
        )}

        {hasSearched && !searchedOrder && (
          <div className="bg-white rounded-3xl p-10 border border-emerald-900/10 text-center max-w-md mx-auto space-y-4 shadow-xs">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto text-2xl border border-amber-100">
              🔍
            </div>
            <h3 className="text-base font-bold text-emerald-950">No Order Found</h3>
            <p className="text-xs text-gray-600">
              We couldn't find an order matching "{searchInput}". Please double check your order number or contact our WhatsApp helpline.
            </p>
            <a
              href="https://wa.me/919567274176"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              Contact Nursery Support on WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
