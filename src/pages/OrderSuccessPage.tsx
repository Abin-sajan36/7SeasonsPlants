import React, { useState, useEffect } from 'react';
import { CheckCircle2, Truck, ArrowRight, Phone, Printer, Package, Sparkles, AlertCircle, Loader2, Calendar, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, isFirestoreQuotaExceeded, handleFirestoreQuotaError } from '../lib/firebase';
import { Order } from '../types';

interface OrderSuccessPageProps {
  orderId: string;
  onNavigate: (view: string, param?: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ orderId, onNavigate }) => {
  const { orders } = useStore();
  const [order, setOrder] = useState<Order | null>(() => {
    if (!orderId) return null;
    const cleanId = orderId.trim();
    return (
      orders.find(
        (o) =>
          o.id === cleanId ||
          (o.orderNumber && o.orderNumber.toLowerCase() === cleanId.toLowerCase())
      ) || null
    );
  });
  const [isLoading, setIsLoading] = useState<boolean>(!order);

  // Directly fetch from Firestore to ensure persistent receipt display on refresh or direct links
  useEffect(() => {
    let isMounted = true;

    const fetchOrderFromFirestore = async () => {
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      const cleanId = orderId.trim();

      // 1. Check local store state first
      const localMatch = orders.find(
        (o) =>
          o.id === cleanId ||
          (o.orderNumber && o.orderNumber.toLowerCase() === cleanId.toLowerCase())
      );
      if (localMatch) {
        if (isMounted) {
          setOrder(localMatch);
          setIsLoading(false);
        }
        return;
      }

      // If quota is exhausted, do not hit backend
      if (isFirestoreQuotaExceeded()) {
        if (isMounted) setIsLoading(false);
        return;
      }

      // 2. Fetch directly from Cloud Firestore by Document ID
      try {
        const orderRef = doc(db, 'orders', cleanId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists() && isMounted) {
          setOrder({ ...(orderSnap.data() as Order), id: orderSnap.id });
          setIsLoading(false);
          return;
        }

        // 3. Fallback: Search by orderNumber field
        const q = query(collection(db, 'orders'), where('orderNumber', '==', cleanId));
        const qSnap = await getDocs(q);
        if (!qSnap.empty && isMounted) {
          const docData = qSnap.docs[0].data() as Order;
          setOrder({ ...docData, id: qSnap.docs[0].id });
          setIsLoading(false);
          return;
        }
      } catch (err) {
        handleFirestoreQuotaError(err, 'orderSuccessFetch');
        console.warn('Error fetching order from Firestore on OrderSuccessPage:', err);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    fetchOrderFromFirestore();
    return () => {
      isMounted = false;
    };
  }, [orderId, orders]);

  const displayOrderNumber = order?.orderNumber || order?.id || orderId || '7S-2026';
  const shipping = order?.customer?.shippingAddress || order?.shippingAddress;
  const recipientName = shipping?.fullName || order?.customer?.name || 'Valued Customer';
  const addressLine1 = shipping?.addressLine1 || (shipping as any)?.street || '';
  const addressLine2 = shipping?.addressLine2 || (shipping as any)?.apartment || '';
  const cityOrDistrict = shipping?.district || shipping?.city || '';
  const state = shipping?.state || 'Kerala';
  const pincode = shipping?.pincode || '';
  const phoneNumber = shipping?.phoneNumber || order?.customer?.phone || (shipping as any)?.phone || '';
  const orderTotal = order ? (typeof order.total === 'number' ? order.total : (order as any).totalAmount || 0) : 0;
  const subtotal = order ? (typeof order.subtotal === 'number' ? order.subtotal : orderTotal) : 0;
  const deliveryFee = order ? (typeof order.deliveryFee === 'number' ? order.deliveryFee : 0) : 0;
  const discount = order ? (typeof order.discount === 'number' ? order.discount : 0) : 0;

  if (isLoading) {
    return (
      <div className="bg-[#F4FAF5] min-h-screen py-16 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 border border-emerald-900/10 shadow-md text-center space-y-4">
          <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mx-auto" />
          <h2 className="text-lg font-black text-emerald-950">Loading Order Confirmation...</h2>
          <p className="text-xs text-gray-500">Retrieving verified order details from 7Seasons Nursery.</p>
        </div>
      </div>
    );
  }

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
              Payment Confirmed • Order Registered 🌸
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 mt-3">
              Thank You for Your Botanical Order!
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-lg mx-auto leading-relaxed">
              Your order <strong className="text-emerald-950 font-mono">#{displayOrderNumber}</strong> has been registered with Mannaratharayil Gardens LLP. Our botanists are preparing fresh, healthy plants with signature 5-ply protective packaging.
            </p>
          </div>

          {/* Delivery Timeline Card */}
          <div className="p-5 bg-[#F4FAF5] rounded-2xl border border-emerald-900/10 text-left space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pb-3 border-b border-emerald-900/10 gap-2">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>Estimated Delivery Window</span>
              </span>
              <span className="font-extrabold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200 w-fit">
                {order?.estimatedDelivery || '2 – 4 Business Days'} ({state})
              </span>
            </div>

            {order?.estimatedDispatchDate && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                      Scheduled Botanical Dispatch
                    </span>
                    <strong className="text-emerald-950 text-sm">
                      {order.estimatedDispatchDate}
                    </strong>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                  Direct from Nursery
                </span>
              </div>
            )}

            <div className="text-xs text-gray-600 space-y-1.5">
              {order?.courierPartner && (
                <p>
                  <strong>Courier Partner:</strong>{' '}
                  <span className="text-emerald-900 font-bold bg-emerald-100/60 px-2 py-0.5 rounded-md">
                    {order.courierPartner}
                  </span>
                </p>
              )}
              <p>
                <strong>Deliver To:</strong> <span className="font-semibold text-gray-900">{recipientName}</span>
                {addressLine1 ? `, ${addressLine1}` : ''}
                {addressLine2 ? `, ${addressLine2}` : ''}
                {cityOrDistrict ? `, ${cityOrDistrict}` : ''}
                {state ? `, ${state}` : ''}
                {pincode ? ` – ${pincode}` : ''}
              </p>
              {phoneNumber && (
                <p>
                  <strong>Contact Mobile:</strong> <span className="font-semibold text-gray-900">{phoneNumber}</span>
                </p>
              )}
              {order?.paymentMethod && (
                <p>
                  <strong>Payment Method:</strong>{' '}
                  <span className="capitalize font-semibold text-emerald-800">
                    {order.paymentMethod.replace('_', ' ')}
                  </span>
                  {order?.razorpayPaymentId && (
                    <span className="text-gray-400 font-mono text-[11px] ml-1">
                      ({order.razorpayPaymentId})
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Items Summary Table */}
          {order && order.items && order.items.length > 0 && (
            <div className="text-left border border-emerald-900/10 rounded-2xl overflow-hidden text-xs">
              <div className="bg-emerald-50 p-3.5 font-bold text-emerald-950 flex justify-between items-center border-b border-emerald-100">
                <span>Items Ordered ({order.items.length})</span>
                <span className="text-emerald-800 font-black text-sm">Total: ₹{orderTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3.5 space-y-3 divide-y divide-emerald-900/10 bg-white">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between pt-2.5 first:pt-0">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-11 h-11 rounded-lg object-cover bg-emerald-50 shrink-0 border border-emerald-100"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                          <Package className="w-5 h-5 text-emerald-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-emerald-950 text-xs">{item.name}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Qty: {item.quantity} × ₹{Number(item.price || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-950 text-xs">
                      ₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}

                {/* Price Breakdown Footer */}
                <div className="pt-3 space-y-1 text-[11px] text-gray-500">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium text-gray-700">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount:</span>
                      <span>-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Charges:</span>
                    <span className="font-medium text-gray-700">
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-black text-emerald-950 pt-1 border-t border-gray-100">
                    <span>Grand Total:</span>
                    <span className="text-emerald-700 text-sm">₹{orderTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate('track-order', displayOrderNumber)}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-md"
            >
              <Truck className="w-4 h-4" />
              <span>Track Live Delivery Status</span>
            </button>

            <a
              href={`https://wa.me/918848276403?text=${encodeURIComponent(`Hi 7Seasonsplants! I just placed order #${displayOrderNumber} for ₹${orderTotal} and would like nursery updates.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp Nursery Dispatch (+91 88482 76403)</span>
            </a>
          </div>

          <div className="pt-2 flex items-center justify-center gap-4 text-xs">
            <button
              onClick={() => onNavigate('combos')}
              className="font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              ← Continue Browsing Plant Combos
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => onNavigate('account', 'orders')}
              className="font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              View Order History in Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
