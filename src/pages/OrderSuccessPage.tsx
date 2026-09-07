import React from 'react';
import { CheckCircle2, Truck, ArrowRight, Phone, Printer, Package, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface OrderSuccessPageProps {
  orderId: string;
  onNavigate: (view: string, param?: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ orderId, onNavigate }) => {
  const { orders } = useStore();
  const order = orders.find((o) => o.id === orderId) || orders[0];

  return (
    <div className="bg-[#F4FAF5] min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-emerald-900/10 shadow-md text-center space-y-6">
          {/* Animated Success Badge */}
          <div className="w-20 h-20 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
            <CheckCircle2 className="w-10 h-10 text-emerald-700" />
          </div>

          <div>
            <span className="text-xs font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Payment Confirmed via Razorpay
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 mt-3">
              Thank You for Your Botanical Order!
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-lg mx-auto leading-relaxed">
              Your order <strong className="text-emerald-950">#{order?.id || orderId}</strong> has been placed with Mannarathayil Nursery. We are preparing fresh, healthy plants with our signature 5-ply protective packaging.
            </p>
          </div>

          {/* Delivery Timeline Card */}
          <div className="p-5 bg-[#F4FAF5] rounded-2xl border border-emerald-900/10 text-left space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-emerald-900/10">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>Estimated Delivery Time</span>
              </span>
              <span className="font-bold text-emerald-700">
                2 – 4 Business Days ({order?.shippingAddress?.state})
              </span>
            </div>

            <div className="text-xs text-gray-600 space-y-1">
              <p>
                <strong>Deliver To:</strong> {order?.shippingAddress?.fullName},{' '}
                {order?.shippingAddress?.street}, {order?.shippingAddress?.district},{' '}
                {order?.shippingAddress?.state} – {order?.shippingAddress?.pincode}
              </p>
              <p>
                <strong>Mobile:</strong> {order?.shippingAddress?.phone}
              </p>
            </div>
          </div>

          {/* Items Summary Table */}
          {order && (
            <div className="text-left border border-emerald-900/10 rounded-2xl overflow-hidden text-xs">
              <div className="bg-emerald-50 p-3 font-bold text-emerald-950 flex justify-between border-b border-emerald-100">
                <span>Items Ordered ({order.items.length})</span>
                <span className="text-emerald-700">Total: ₹{order.totalAmount}</span>
              </div>
              <div className="p-3 space-y-2.5 divide-y divide-emerald-900/10 bg-white">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between pt-2 first:pt-0">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-emerald-50 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-emerald-950">{item.name}</p>
                        <p className="text-[11px] text-gray-500">
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-950">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate('track-order', order?.id || orderId)}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Track Live Delivery Status</span>
            </button>

            <a
              href={`https://wa.me/919567274176?text=Hi%207Seasonsplants!%20I%20just%20placed%20order%20%23${order?.id || orderId}%20and%20would%20like%20updates.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp Nursery Dispatch (+91 95672 74176)</span>
            </a>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('plants')}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              ← Continue Browsing Plants
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
