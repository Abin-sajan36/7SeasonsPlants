import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Truck,
  ArrowRight,
  Lock,
  AlertCircle,
  Tag,
  ShieldCheck,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CustomerAddress, OrderItem, COURIER_SERVICES, CourierServiceOption } from '../types';
import {
  SUPPORTED_DELIVERY_STATES,
  SupportedDeliveryState,
  STATE_PIN_CONFIG,
  getDistrictsForState,
  detectStateFromPincode,
  checkAddressTextMismatch,
  validateDeliveryAddress,
} from '../lib/stateValidation';
import { startRazorpayCheckout } from '../lib/razorpay';

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
    selectedDeliveryState,
    setSelectedDeliveryState,
  } = useStore();

  // Form State
  const initialDeliveryState: SupportedDeliveryState =
    selectedDeliveryState === 'Tamil Nadu'
      ? 'Tamil Nadu'
      : selectedDeliveryState === 'Karnataka'
      ? 'Karnataka'
      : 'Kerala';

  interface CheckoutFormData {
    fullName: string;
    phone: string;
    email: string;
    street: string;
    apartment: string;
    city: string;
    district: string;
    state: SupportedDeliveryState;
    pincode: string;
    notes: string;
  }

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    street: '',
    apartment: '',
    city: STATE_PIN_CONFIG[initialDeliveryState].defaultCity,
    district: STATE_PIN_CONFIG[initialDeliveryState].defaultDistrict,
    state: initialDeliveryState,
    pincode: '',
    notes: '',
  });

  // Courier selection state
  const [selectedCourierId, setSelectedCourierId] = useState<string>('dtdc');
  const selectedCourier = React.useMemo(() => {
    return COURIER_SERVICES.find((c) => c.id === selectedCourierId) || COURIER_SERVICES[0];
  }, [selectedCourierId]);

  // Keep state synchronized if selectedDeliveryState updates from header
  useEffect(() => {
    if (selectedDeliveryState && SUPPORTED_DELIVERY_STATES.includes(selectedDeliveryState as SupportedDeliveryState)) {
      const validState = selectedDeliveryState as SupportedDeliveryState;
      setFormData((prev) => {
        if (prev.state === validState) return prev;
        const config = STATE_PIN_CONFIG[validState];
        return {
          ...prev,
          state: validState,
          city: config.defaultCity,
          district: config.defaultDistrict,
        };
      });
    }
  }, [selectedDeliveryState]);

  const invalidCartItems = React.useMemo(() => {
    return cart.filter((item) => {
      if (item.type !== 'combo') return false;
      const combo = combos.find((c) => c.id === item.id);
      if (!combo || !combo.sellableStates || combo.sellableStates.length === 0) return false;
      return !combo.sellableStates.includes(formData.state);
    });
  }, [cart, combos, formData.state]);

  // Real-time PIN code state match feedback
  const pinValidationFeedback = React.useMemo(() => {
    const clean = formData.pincode.replace(/\D/g, '');
    const stateConfig = STATE_PIN_CONFIG[formData.state as SupportedDeliveryState];
    if (!clean) {
      return {
        message: `${formData.state} PIN ${stateConfig?.prefixLabel || ''}`,
        isInvalid: false,
        isValid: false,
      };
    }
    if (clean.length < 2) {
      return {
        message: `${formData.state} PIN ${stateConfig?.prefixLabel || ''}`,
        isInvalid: false,
        isValid: false,
      };
    }
    const { detectedState } = detectStateFromPincode(clean);
    if (detectedState && detectedState !== formData.state) {
      return {
        message: `⚠️ PIN code belongs to ${detectedState}, but selected delivery state is ${formData.state}!`,
        isInvalid: true,
        isValid: false,
      };
    }
    if (clean.length === 6) {
      if (detectedState === formData.state) {
        return {
          message: `✓ Valid 6-digit postal PIN for ${formData.state}`,
          isInvalid: false,
          isValid: true,
        };
      } else {
        return {
          message: `⚠️ PIN code does not match ${formData.state} (${stateConfig?.prefixLabel})`,
          isInvalid: true,
          isValid: false,
        };
      }
    }
    return {
      message: `${formData.state} PIN ${stateConfig?.prefixLabel || ''}`,
      isInvalid: false,
      isValid: false,
    };
  }, [formData.pincode, formData.state]);

  // Real-time address cross-state text mismatch feedback
  const addressTextMismatchFeedback = React.useMemo(() => {
    const fullText = `${formData.street} ${formData.apartment}`;
    if (!fullText.trim()) return null;
    const result = checkAddressTextMismatch(fullText, formData.state as SupportedDeliveryState);
    if (result.hasMismatch) {
      return `⚠️ Warning: Your address mentions "${result.conflictingTerm}" (${result.conflictingState}), but selected delivery state is ${formData.state}. Live plant delivery will only dispatch to ${formData.state}.`;
    }
    return null;
  }, [formData.street, formData.apartment, formData.state]);

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Auto-populate from logged-in customer and default address
  useEffect(() => {
    if (currentUser) {
      const defaultAddr = currentUser.addresses?.find((a) => a.isDefault) || currentUser.addresses?.[0];
      if (defaultAddr) {
        const addrState: SupportedDeliveryState =
          defaultAddr.state === 'Tamil Nadu'
            ? 'Tamil Nadu'
            : defaultAddr.state === 'Karnataka'
            ? 'Karnataka'
            : 'Kerala';

        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || currentUser.name || '',
          phone: prev.phone || currentUser.phone || '',
          email: prev.email || currentUser.email || '',
          street: prev.street || defaultAddr.addressLine1 || '',
          apartment: prev.apartment || defaultAddr.addressLine2 || '',
          city: defaultAddr.city || prev.city,
          district: defaultAddr.district || prev.district,
          state: addrState,
          pincode: prev.pincode || defaultAddr.pincode || '',
        }));
      }
    }
  }, [currentUser]);

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
    const validState: SupportedDeliveryState =
      newState === 'Tamil Nadu' ? 'Tamil Nadu' : newState === 'Karnataka' ? 'Karnataka' : 'Kerala';
    const config = STATE_PIN_CONFIG[validState];
    setSelectedDeliveryState(validState);
    setFormData((prev) => ({
      ...prev,
      state: validState,
      city: config.defaultCity,
      district: config.defaultDistrict,
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

    // Comprehensive State & Address Consistency Validation
    const addressValidation = validateDeliveryAddress({
      state: formData.state,
      district: formData.district,
      pincode: formData.pincode,
      street: formData.street,
      apartment: formData.apartment,
      selectedDeliveryState: selectedDeliveryState,
    });

    if (!addressValidation.valid) {
      setFormError(addressValidation.error || 'Please provide a valid delivery address matching your chosen state.');
      scrollToError();
      return;
    }

    if (invalidCartItems.length > 0) {
      setFormError(
        `The following items in your cart cannot be delivered to ${formData.state}: ${invalidCartItems
          .map((i) => i.name)
          .join(', ')}. Please remove them or choose a supported delivery state.`
      );
      scrollToError();
      return;
    }

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

    setIsProcessing(true);

    // Launch official Razorpay Standard Web Checkout Modal
    await startRazorpayCheckout({
      amountInPaise: Math.round(cartTotal * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.phone,
      },
      notes: {
        customer_name: formData.fullName,
        customer_phone: formData.phone,
        customer_email: formData.email,
        state: formData.state,
        district: formData.district,
        pincode: formData.pincode,
        courier: selectedCourier.displayName,
      },
      onSuccess: async (verifyResult, paymentPayload) => {
        try {
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
            paymentMethod: 'razorpay',
            razorpayOrderId: paymentPayload.razorpay_order_id,
            razorpayPaymentId: paymentPayload.razorpay_payment_id,
            orderStatus: 'Payment Confirmed',
            courierPartner: selectedCourier.displayName,
            estimatedDelivery: selectedCourier.deliveryTime,
            notes: formData.notes
              ? `${formData.notes} | Preferred Courier: ${selectedCourier.displayName} | Razorpay Verified`
              : `Preferred Courier: ${selectedCourier.displayName} | Razorpay Verified`,
          });

          addToast({
            title: 'Payment Successful! 🌿',
            message: `Order #${createdOrder.orderNumber} confirmed. Payment verified via Razorpay.`,
            type: 'success',
            duration: 8000,
          });

          setIsProcessing(false);
          onNavigate('order-success', createdOrder.id);
        } catch (err: any) {
          setIsProcessing(false);
          setFormError(
            'Payment was verified via Razorpay, but registering the order encountered an issue. Please contact support with payment ID: ' +
              paymentPayload.razorpay_payment_id
          );
        }
      },
      onError: (errorMessage) => {
        setIsProcessing(false);
        setFormError(errorMessage);
        addToast({
          title: 'Payment Failed',
          message: errorMessage,
          type: 'error',
          duration: 9000,
        });
      },
      onDismiss: () => {
        setIsProcessing(false);
        addToast({
          title: 'Checkout Cancelled',
          message: 'Razorpay payment window was closed. You can retry payment whenever you are ready.',
          type: 'info',
        });
      },
    });
  };

  const processManualOrder = async (method: string) => {
    setShowPaymentModal(false);
    setIsProcessing(true);

    try {
      const addressValidation = validateDeliveryAddress({
        state: formData.state,
        district: formData.district,
        pincode: formData.pincode,
        street: formData.street,
        apartment: formData.apartment,
        selectedDeliveryState: selectedDeliveryState,
      });

      if (!addressValidation.valid) {
        setFormError(addressValidation.error || 'Address state mismatch detected.');
        setIsProcessing(false);
        return;
      }

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

      const orderItems: OrderItem[] = cart.map((item) => ({
        id: item.id,
        type: item.type,
        name: item.name,
        slug: item.slug,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;

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
        razorpayPaymentId: paymentId,
        orderStatus: 'Payment Confirmed',
        courierPartner: selectedCourier.displayName,
        estimatedDelivery: selectedCourier.deliveryTime,
        notes: formData.notes
          ? `${formData.notes} | Preferred Courier: ${selectedCourier.displayName}`
          : `Preferred Courier: ${selectedCourier.displayName}`,
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
                <h4 className="font-bold text-emerald-950">Direct Express Shipping to Kerala, Tamil Nadu & Karnataka</h4>
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
                <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{formError}</span>
                </div>
              )}

              {/* Undeliverable Cart Items Alert */}
              {invalidCartItems.length > 0 && (
                <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-0.5">Item(s) Not Deliverable to {formData.state}:</strong>
                    <span>
                      {invalidCartItems.map((i) => i.name).join(', ')} cannot be shipped to {formData.state}.
                      Please change delivery state or update your cart before proceeding.
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Saved Address Select for Logged In Customer */}
              {currentUser && currentUser.addresses && currentUser.addresses.length > 0 && (
                <div className="mb-4 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-900/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-950 block">
                      📍 Fill from Saved Addresses:
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">Click to populate form</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.addresses.map((addr) => {
                      const addrState: SupportedDeliveryState =
                        addr.state === 'Tamil Nadu'
                          ? 'Tamil Nadu'
                          : addr.state === 'Karnataka'
                          ? 'Karnataka'
                          : 'Kerala';
                      const isSameState = formData.state === addrState;

                      return (
                        <button
                          type="button"
                          key={addr.id}
                          onClick={() => {
                            handleStateChange(addrState);
                            setFormData((prev) => ({
                              ...prev,
                              fullName: addr.fullName,
                              phone: addr.phoneNumber,
                              street: addr.addressLine1,
                              apartment: addr.addressLine2 || '',
                              city: addr.city,
                              district: addr.district,
                              state: addrState,
                              pincode: addr.pincode,
                            }));
                            addToast({
                              type: 'info',
                              title: 'Address Applied',
                              message: `Filled address in ${addr.district}, ${addrState}.`,
                            });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer ${
                            isSameState
                              ? 'bg-white text-emerald-950 border-emerald-500 ring-2 ring-emerald-500/20'
                              : 'bg-white/80 text-emerald-900 hover:bg-white border-emerald-900/15'
                          }`}
                        >
                          <span>{addr.fullName} ({addr.district})</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                            {addrState}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.2 rounded-full">
                              Default
                            </span>
                          )}
                        </button>
                      );
                    })}
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
                  <label className="font-bold text-emerald-950 block mb-1.5 flex items-center justify-between">
                    <span>Landmark / Nearby Location *</span>
                    <span className="text-[10px] text-emerald-700 font-medium">Helps delivery agent</span>
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

                {/* Cross-state address text mismatch warning */}
                {addressTextMismatchFeedback && (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 text-amber-900 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">{addressTextMismatchFeedback}</span>
                  </div>
                )}

                {/* State & District & PIN */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-emerald-950 block mb-1.5 flex items-center justify-between text-xs">
                      <span>Delivery State *</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Mandatory
                      </span>
                    </label>
                    <select
                      id="checkout-delivery-state-select"
                      required
                      value={formData.state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F4FAF5] text-xs font-bold text-emerald-950 rounded-full border-2 border-emerald-600/50 focus:bg-white focus:border-emerald-600 outline-hidden transition-all shadow-xs cursor-pointer"
                    >
                      <option value="Kerala">Kerala (1-2 Days)</option>
                      <option value="Tamil Nadu">Tamil Nadu (2-3 Days)</option>
                      <option value="Karnataka">Karnataka (2-3 Days)</option>
                    </select>
                    <p className="text-[10px] text-emerald-700 mt-1 font-medium">
                      Select delivery state (Mandatory)
                    </p>
                  </div>

                  <div>
                    <label className="font-bold text-emerald-950 block mb-1.5 flex items-center justify-between text-xs">
                      <span>District *</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Mandatory
                      </span>
                    </label>
                    <select
                      id="checkout-delivery-district-select"
                      required
                      value={formData.district}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          district: e.target.value,
                          city: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 bg-[#F4FAF5] text-xs font-semibold text-emerald-950 rounded-full border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden cursor-pointer"
                    >
                      {getDistrictsForState(formData.state).map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {formData.state} District
                    </p>
                  </div>

                  <div>
                    <label className="font-bold text-emerald-950 block mb-1.5 flex items-center justify-between text-xs">
                      <span>Postal PIN *</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        6 Digits
                      </span>
                    </label>
                    <input
                      id="checkout-delivery-pincode-input"
                      type="text"
                      required
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                      placeholder={STATE_PIN_CONFIG[formData.state as SupportedDeliveryState]?.sample.split(' ')[0] || '682030'}
                      className={`w-full px-4 py-2.5 bg-[#F4FAF5] text-xs font-medium rounded-full border outline-hidden transition-all ${
                        pinValidationFeedback.isInvalid
                          ? 'border-red-500 bg-red-50/50 text-red-950 focus:border-red-600'
                          : pinValidationFeedback.isValid
                          ? 'border-emerald-600 bg-emerald-50/30 text-emerald-950'
                          : 'border-emerald-900/15 focus:border-emerald-600 focus:bg-white text-emerald-950'
                      }`}
                    />
                    {pinValidationFeedback.message && (
                      <p
                        className={`text-[10px] mt-1 font-semibold leading-tight ${
                          pinValidationFeedback.isInvalid ? 'text-red-600' : 'text-emerald-700'
                        }`}
                      >
                        {pinValidationFeedback.message}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* 2. Choose Courier Service */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-900/10">
                <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-700" />
                  <span>2. Choose Courier Service</span>
                </h2>
                <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
                  Doorstep Live Plant Logistics
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Choose your preferred courier service for transit to{' '}
                <strong className="text-emerald-950">{formData.district || 'Your District'}, {formData.state}</strong>. Live plants are packed with breathable corrugated safeguards.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {COURIER_SERVICES.map((courier) => {
                  const isSelected = selectedCourierId === courier.id;
                  return (
                    <div
                      key={courier.id}
                      onClick={() => setSelectedCourierId(courier.id)}
                      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-700 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-700'
                          : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="courierPartner"
                              value={courier.id}
                              checked={isSelected}
                              onChange={() => setSelectedCourierId(courier.id)}
                              className="w-4 h-4 text-emerald-700 accent-emerald-700 cursor-pointer"
                            />
                            <span className="text-xs font-bold text-emerald-950">
                              {courier.name}
                            </span>
                          </label>
                          {courier.badge && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isSelected
                                  ? 'bg-emerald-800 text-white'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {courier.badge}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                          {courier.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-emerald-900/10 flex items-center justify-between text-[11px]">
                        <span className="text-gray-500 font-medium">Est. Delivery:</span>
                        <span className="font-bold text-emerald-900">
                          {courier.deliveryTime}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Selected Partner: <strong>{selectedCourier.displayName}</strong>
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-200 w-fit">
                  Transit: {selectedCourier.deliveryTime}
                </span>
              </div>
            </div>

            {/* 3. Payment Method Notice Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-emerald-950 pb-3 border-b border-emerald-900/10 flex items-center justify-between">
                <span>3. Payment Method</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100">
                  <Lock className="w-3 h-3" />
                  Razorpay Verified
                </span>
              </h2>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-emerald-950">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <span>Razorpay Standard Web Checkout</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Instant & Automated
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed text-[11px]">
                  All major payment methods are supported via Razorpay's secure checkout modal:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-medium text-emerald-950">
                  <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>UPI (GPay / PhonePe)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Cards (Debit/Credit)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>Net Banking (50+)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Wallets & CRED</span>
                  </div>
                </div>
              </div>

              {/* Optional Manual UPI Fallback trigger */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600">
                <span>Prefer scanning a direct UPI QR code?</span>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                >
                  Open QR Code
                </button>
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

                <div className="flex justify-between text-gray-600">
                  <span>Courier Service</span>
                  <span className="font-semibold text-emerald-950 text-right">{selectedCourier.name}</span>
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
        onConfirm={processManualOrder} 
      />
    </div>
  );
};
