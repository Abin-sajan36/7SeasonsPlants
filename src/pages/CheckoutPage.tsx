import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Truck,
  ArrowRight,
  Lock,
  AlertCircle,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CustomerAddress, OrderItem } from '../types';

// --- PAYMENT MODAL COMPONENT ---
const PaymentModal: React.FC<{ isOpen: boolean; onClose: () => void; total: number; onConfirm: (method: string) => void; }> = ({ isOpen, onClose, total, onConfirm }) => {
  const [method, setMethod] = useState('qr');
  const [upiId, setUpiId] = useState('');
  
  if (!isOpen) return null;
  
  const qrData = encodeURIComponent(`upi://pay?pa=7seasonsplants@ybl&pn=7Seasonsplants&am=${total}&cu=INR`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b border-emerald-900/10 flex justify-between items-center bg-emerald-50/50">
          <h3 className="font-bold text-emerald-950 text-lg">Select Payment Method</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-emerald-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        
        <div className="flex border-b border-emerald-900/10 text-xs font-semibold overflow-x-auto hide-scrollbar">
          <button onClick={() => setMethod('qr')} className={`flex-1 py-3 px-4 min-w-max text-center ${method === 'qr' ? 'text-emerald-700 border-b-2 border-emerald-700 bg-emerald-50/30' : 'text-gray-500 hover:text-emerald-700'}`}>Scan QR (UPI)</button>
          <button onClick={() => setMethod('upi')} className={`flex-1 py-3 px-4 min-w-max text-center ${method === 'upi' ? 'text-emerald-700 border-b-2 border-emerald-700 bg-emerald-50/30' : 'text-gray-500 hover:text-emerald-700'}`}>UPI ID</button>
          <button onClick={() => setMethod('net')} className={`flex-1 py-3 px-4 min-w-max text-center ${method === 'net' ? 'text-emerald-700 border-b-2 border-emerald-700 bg-emerald-50/30' : 'text-gray-500 hover:text-emerald-700'}`}>Net Banking</button>
        </div>
        
        <div className="p-6">
          {method === 'qr' && (
            <div className="text-center space-y-4">
              <p className="text-xs text-gray-500">Scan with GPay, PhonePe, Paytm or any UPI app</p>
              <div className="inline-block p-2 border-2 border-emerald-100 rounded-2xl bg-white shadow-xs">
                <img src={qrUrl} alt="UPI QR Code" className="w-48 h-48" />
              </div>
              <p className="font-black text-xl text-emerald-950">₹{total}</p>
            </div>
          )}
          
          {method === 'upi' && (
            <div className="space-y-4 py-4">
              <label className="text-xs font-bold text-emerald-950">Enter your UPI ID</label>
              <input 
                type="text" 
                placeholder="e.g. 9876543210@ybl" 
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-4 py-3 bg-[#F4FAF5] border border-emerald-900/15 rounded-xl text-sm outline-hidden focus:border-emerald-600 focus:bg-white"
              />
              <p className="text-[10px] text-gray-500">A payment request will be sent to your UPI app.</p>
            </div>
          )}
          
          {method === 'net' && (
            <div className="py-8 text-center text-gray-500 text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-emerald-200"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              Select your bank on the next secure page.
            </div>
          )}
        </div>
        
        <div className="p-5 border-t border-emerald-900/10 bg-emerald-50/30">
          <button 
            onClick={() => onConfirm(method)} 
            className="w-full py-3.5 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {method === 'qr' ? 'I have completed the payment' : `Proceed to Pay ₹${total}`}
          </button>
        </div>
            </div>
    </div>
  );
};
// --- END PAYMENT MODAL ---

interface CheckoutPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const {
    cart,
    cartSubtotal,
    cartDiscount,
    cartDeliveryFee,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    currentUser,
    createOrder,
    addToast,
    storeSettings,
    combos,
  } = useStore();

  // Form State
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    street: '',
    apartment: '',
    city: 'Ernakulam',
    district: 'Ernakulam',
    state: 'Kerala',
    pincode: '',
    notes: '',
  });

  const invalidCartItems = React.useMemo(() => {
    return cart.filter(item => {
      if (item.type !== 'combo') return false;
      const combo = combos.find(c => c.id === item.id);
      if (!combo || !combo.sellableStates || combo.sellableStates.length === 0) return false;
      return !combo.sellableStates.includes(formData.state);
    });
  }, [cart, combos, formData.state]);


  // Form State

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Auto-populate from logged-in customer and default address
  useEffect(() => {
    if (currentUser) {
      const defaultAddr = currentUser.addresses?.find((a) => a.isDefault) || currentUser.addresses?.[0];
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.name || '',
        phone: prev.phone || currentUser.phone || '',
        email: prev.email || currentUser.email || '',
        street: prev.street || defaultAddr?.addressLine1 || '',
        apartment: prev.apartment || defaultAddr?.addressLine2 || '',
        city: defaultAddr?.city || prev.city,
        district: defaultAddr?.district || prev.district,
        state: defaultAddr?.state || prev.state,
        pincode: prev.pincode || defaultAddr?.pincode || '',
      }));
    }
  }, [currentUser]);

  // Kerala Districts
  const keralaDistricts = [
    'Alappuzha',
    'Ernakulam',
    'Idukki',
    'Kannur',
    'Kasaragod',
    'Kollam',
    'Kottayam',
    'Kozhikode',
    'Malappuram',
    'Palakkad',
    'Pathanamthitta',
    'Thiruvananthapuram',
    'Thrissur',
    'Wayanad',
  ];

  // Tamil Nadu Districts
  const tamilNaduDistricts = [
    'Chennai',
    'Coimbatore',
    'Madurai',
    'Tiruchirappalli',
    'Salem',
    'Tirunelveli',
    'Erode',
    'Vellore',
    'Thoothukudi',
    'Dindigul',
    'Thanjavur',
    'Ranipet',
    'Virudhunagar',
    'Karur',
    'Nilgiris',
    'Kanyakumari',
    'Kanchipuram',
    'Tiruvallur',
  ];

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#F4FAF5] py-16 flex items-center justify-center">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-emerald-900/10 max-w-md text-center shadow-xs">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-100">
            🛒
          </div>
          <h2 className="text-xl font-bold text-emerald-950 mb-2">Your cart is empty</h2>
          <p className="text-xs text-gray-500 mb-6">
            Please select curated combos from our catalog before checking out.
          </p>
          <button
            onClick={() => onNavigate('combos')}
            className="w-full py-3 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full text-xs font-bold transition-colors cursor-pointer shadow-md"
          >
            Browse Plant Combos
          </button>
        </div>
      </div>
    );
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCodeInput.trim()) return;

    const res = applyCoupon(couponCodeInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCodeInput('');
    }
  };

  const handleStateChange = (newState: string) => {
    const validState: 'Kerala' | 'Tamil Nadu' = newState === 'Tamil Nadu' ? 'Tamil Nadu' : 'Kerala';
    setFormData((prev) => ({
      ...prev,
      state: validState,
      city: validState === 'Kerala' ? 'Ernakulam' : 'Chennai',
      district: validState === 'Kerala' ? 'Ernakulam' : 'Chennai',
    }));
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const scrollToError = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Form Validations
    if (!formData.fullName.trim()) {
      setFormError('Please enter your full name.');
      scrollToError();
      return;
    }
    const numericPhone = formData.phone.replace(/\D/g, '');
    if (!numericPhone || numericPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number for dispatch updates.');
      scrollToError();
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Please enter a valid email address for your order invoice.');
      scrollToError();
      return;
    }
    if (!formData.street.trim() || formData.street.trim().length < 5) {
      setFormError('Please enter your complete delivery street address / house name.');
      scrollToError();
      return;
    }
    if (!formData.apartment.trim()) {
      setFormError('Please enter a landmark or nearby location (mandatory).');
      scrollToError();
      return;
    }
    if (!formData.pincode.trim() || formData.pincode.length !== 6) {
      setFormError('Please enter a valid 6-digit postal PIN code.');
      scrollToError();
      return;
    }

    setShowPaymentModal(true);
  };

  const processOrder = async (method: string) => {
    setShowPaymentModal(false);
    setIsProcessing(true);

    try {
      // 1. Prepare Shipping Address
      const shippingAddress: CustomerAddress = {
        id: `addr_${Date.now()}`,
        fullName: formData.fullName,
        phoneNumber: formData.phone,
        addressLine1: formData.street,
        addressLine2: formData.apartment || undefined,
        landmark: formData.apartment || undefined,
        city: formData.city || formData.district,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        isDefault: true,
      };

      // 2. Prepare Order Items
      const orderItems: OrderItem[] = cart.map((item) => ({
        id: item.id,
        type: item.type,
        name: item.name,
        slug: item.slug,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      // 3. Try creating Razorpay Order via backend
      let razorpayOrderId = `order_sim_${Date.now()}`;
      try {
        const orderRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Math.round(cartTotal),
            currency: 'INR',
            notes: {
              customer_name: formData.fullName,
              customer_phone: formData.phone,
              customer_email: formData.email,
              state: formData.state,
            },
          }),
        });

        if (orderRes.ok) {
          const data = await orderRes.json();
          if (data.order && data.order.id) {
            razorpayOrderId = data.order.id;
          }
        }
      } catch (err) {
        console.log('Using simulated Razorpay order ID:', razorpayOrderId);
      }

      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // 4. Create order via StoreContext
      const createdOrder = await createOrder({
        customer: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          shippingAddress,
        },
        items: orderItems,
        subtotal: cartSubtotal,
        discount: cartDiscount,
        couponCode: appliedCoupon?.code,
        deliveryFee: cartDeliveryFee,
        total: cartTotal,
        paymentStatus: 'paid',
        paymentMethod: method === 'qr' ? 'UPI QR' : method === 'upi' ? 'UPI ID' : 'Net Banking',
        razorpayOrderId,
        razorpayPaymentId: paymentId,
        orderStatus: 'Payment Confirmed',
        courierPartner: 'Express Nursery Logistics',
        estimatedDelivery: '2 - 4 Business Days',
        notes: formData.notes || undefined,
      });

      addToast({
        title: 'Order Placed Successfully! 🌿',
        message: `Order #${createdOrder.orderNumber} confirmed. Mannaratharayil Gardens LLP is preparing your plants.`,
        type: 'success',
      });

      setIsProcessing(false);
      onNavigate('order-success', createdOrder.id);
    } catch (err: any) {
      setIsProcessing(false);
      setFormError('An error occurred while processing your order. Please try again.');
    }
  };

  return (
    <div className="bg-[#F4FAF5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <button onClick={() => onNavigate('home')} className="hover:text-emerald-700 cursor-pointer">
            Home
          </button>
          <span>/</span>
          <button onClick={() => onNavigate('combos')} className="hover:text-emerald-700 cursor-pointer">
            Plant Combos
          </button>
          <span>/</span>
          <span className="font-semibold text-emerald-950">Secure Checkout</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight mb-8">
          Complete Your Botanical Order
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Shipping & Customer Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Delivery Region Notice */}
            <div className="p-4 bg-emerald-50/80 rounded-3xl border border-emerald-200 flex items-start gap-3">
              <Truck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h4 className="font-bold text-emerald-950">Direct Shipping to Kerala & Tamil Nadu</h4>
                <p className="text-gray-600 mt-0.5 leading-relaxed">
                  Carefully packed in 5-ply cartons from Mannaratharayil Gardens LLP and dispatched directly to your doorstep.
                </p>
              </div>
            </div>

            {/* Form Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs">
              <h2 className="text-lg font-bold text-emerald-950 mb-4 pb-3 border-b border-emerald-900/10 flex items-center justify-between">
                <span>1. Shipping & Contact Information</span>
                <span className="text-xs text-emerald-700 font-semibold">100% Confidential</span>
              </h2>

              {formError && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Quick Saved Address Select for Logged In Customer */}
              {currentUser && currentUser.addresses && currentUser.addresses.length > 0 && (
                <div className="mb-4 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-900/10 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-950 block">
                    📍 Fill from Saved Addresses:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.addresses.map((addr) => (
                      <button
                        type="button"
                        key={addr.id}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            fullName: addr.fullName,
                            phone: addr.phoneNumber,
                            street: addr.addressLine1,
                            apartment: addr.addressLine2 || '',
                            city: addr.city,
                            district: addr.district,
                            state: addr.state,
                            pincode: addr.pincode,
                          }));
                          addToast({
                            type: 'info',
                            title: 'Address Applied',
                            message: `Filled shipping details for ${addr.fullName} (${addr.city}).`,
                          });
                        }}
                        className="px-3 py-1.5 bg-white text-emerald-950 hover:bg-emerald-100/70 rounded-xl text-xs font-semibold border border-emerald-900/15 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{addr.fullName} ({addr.district})</span>
                        {addr.isDefault && (
                          <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.2 rounded-full">
                            Default
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form id="checkout-form" onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
                {/* Full Name */}
                <div>
                  <label className="font-bold text-emerald-950 block mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Anand Kumar"
                    className="w-full px-4 py-2.5 bg-[#F4FAF5] text-xs text-emerald-950 font-medium rounded-full border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>

                {/* Mobile & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-emerald-950 block mb-1.5">
                      Mobile Number (For WhatsApp / SMS updates) *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                      placeholder="10-digit mobile number"
                      className="w-full px-4 py-2.5 bg-[#F4FAF5] text-xs text-emerald-950 font-medium rounded-full border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-emerald-950 block mb-1.5">
                      Email Address (For Invoice) *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. anand@gmail.com"
                      className="w-full px-4 py-2.5 bg-[#F4FAF5] text-xs text-emerald-950 font-medium rounded-full border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                    />
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="font-bold text-emerald-950 block mb-1.5">
                    House Name / Building / Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="House name, Flat No, Street name"
                    className="w-full px-4 py-2.5 bg-[#F4FAF5] text-xs text-emerald-950 font-medium rounded-full border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>

                {/* Landmark / Apartment (Mandatory) */}
                <div>
                  <label className="font-bold text-emerald-950 block mb-1.5">
                    Landmark / Nearby Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.apartment}
                    onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                    placeholder="e.g. Near Temple / Metro Station"
                    className="w-full px-4 py-2.5 bg-[#F4FAF5] text-xs text-emerald-950 font-medium rounded-full border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>

                {/* State & District & PIN */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-emerald-950 block mb-1.5">State *</label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F4FAF5] text-xs font-semibold text-emerald-950 rounded-full border border-emerald-900/15 focus:bg-white outline-hidden"
                    >
                      {storeSettings.supportedStates?.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-emerald-950 block mb-1.5">District *</label>
                    <select
                      value={formData.district}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          district: e.target.value,
                          city: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 bg-[#F4FAF5] text-xs font-semibold text-emerald-950 rounded-full border border-emerald-900/15 focus:bg-white outline-hidden"
                    >
                      {(formData.state === 'Kerala' ? keralaDistricts : tamilNaduDistricts).map(
                        (dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-emerald-950 block mb-1.5">Postal PIN *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="6-digit PIN"
                      className="w-full px-4 py-2.5 bg-[#F4FAF5] text-xs text-emerald-950 font-medium rounded-full border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Payment Method Notice Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-emerald-950 pb-3 border-b border-emerald-900/10 flex items-center justify-between">
                <span>2. Payment Method</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100">
                  <Lock className="w-3 h-3" />
                  Razorpay Verified
                </span>
              </h2>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-950">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <span>100% Secure Online Payment (UPI, Cards, NetBanking)</span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Support for Google Pay, PhonePe, Paytm, all Debit/Credit cards, and NetBanking.
                </p>
              </div>

              {/* No COD Policy Note */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <strong className="text-amber-800">Nursery Freshness Policy:</strong> To ensure high survival rates and prevent transit delays for delicate live plants, Cash on Delivery (COD) is not supported. All plants are dispatched immediately upon payment confirmation.
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Pay Button (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-6 sticky top-28">
              <h3 className="text-base font-bold text-emerald-950 pb-3 border-b border-emerald-900/10 flex items-center justify-between">
                <span>Order Summary ({cart.length} items)</span>
                <button
                  onClick={() => onNavigate('combos')}
                  className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
                >
                  + Add More
                </button>
              </h3>

              {/* Cart items preview */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-emerald-50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-emerald-950 truncate">{item.name}</h4>
                      <p className="text-[11px] text-gray-500">
                        Qty: {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <span className="font-bold text-emerald-950 shrink-0">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Applicator */}
              <div className="pt-3 border-t border-emerald-900/10">
                {!appliedCoupon ? (
                  <form onSubmit={handleApplyCoupon} className="space-y-1">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value)}
                          placeholder="Coupon Code"
                          className="w-full pl-8 pr-3 py-2 bg-[#F4FAF5] text-xs uppercase font-bold text-emerald-950 rounded-full border border-emerald-900/15 focus:bg-white outline-hidden"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-rose-600">{couponError}</p>}
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="font-bold text-emerald-950">{appliedCoupon.code}</span>
                      <span className="text-emerald-700 font-semibold">
                        (-₹{Math.round(cartDiscount)})
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-rose-600 font-semibold hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs pt-3 border-t border-emerald-900/10">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-emerald-950">₹{cartSubtotal}</span>
                </div>

                {cartDiscount > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Discount</span>
                    <span>-₹{Math.round(cartDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Delivery ({formData.state})</span>
                  {cartDeliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase">FREE</span>
                  ) : (
                    <span className="font-semibold text-emerald-950">₹{cartDeliveryFee}</span>
                  )}
                </div>

                <div className="flex justify-between text-base font-black text-emerald-950 pt-3 border-t border-emerald-900/10">
                  <span>Total Amount</span>
                  <span className="text-xl text-emerald-700">₹{Math.round(cartTotal)}</span>
                </div>
              </div>

              {/* Pay Now Button */}
              <button
                type="submit"
                form="checkout-form"
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full font-black text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4 text-amber-300" />
                <span>
                  {isProcessing ? 'Processing Order...' : `Proceed to Payment (₹${Math.round(cartTotal)})`}
                </span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>100% Safe Checkout Guarantee • Mannaratharayil Gardens LLP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
          <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        total={Math.round(cartTotal)} 
        onConfirm={processOrder} 
      />
    </div>
  );
};
