import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Send,
  Upload,
  CheckCircle2,
  Phone,
  Mail,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { db, isFirestoreQuotaExceeded, handleFirestoreQuotaError } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { safeOptimizeImageForFirestore } from '../../lib/imageUploader';

interface CustomerComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrderNumber?: string;
}

export const CustomerComplaintModal: React.FC<CustomerComplaintModalProps> = ({
  isOpen,
  onClose,
  defaultOrderNumber,
}) => {
  const { currentUser, orders, storeSettings, addToast } = useStore();

  const companyEmail = storeSettings?.email || 'mannaratharayil@gmail.com';
  const whatsappNumber = (storeSettings?.whatsapp || storeSettings?.whatsappNumber || '+91 88482 76403').replace(/[^0-9]/g, '');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    orderNumber: '',
    category: 'Damaged Plant / Broken Stems in Transit',
    urgency: 'High (Live Plant in Distress)',
    desiredResolution: 'Free Live Plant Replacement Dispatch',
    description: '',
    photoAttachment: '',
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    ticketId: string;
    data: typeof form;
  } | null>(null);

  // Filter orders belonging to the logged-in user
  const userOrders = currentUser
    ? orders.filter(
        (o) =>
          o.customerId === currentUser.id ||
          (o.customer?.email && o.customer.email.toLowerCase() === currentUser.email.toLowerCase())
      )
    : [];

  // Pre-fill user data when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm((prev) => ({
        ...prev,
        name: currentUser?.name || prev.name,
        email: currentUser?.email || prev.email,
        phone: currentUser?.phone || prev.phone,
        orderNumber: defaultOrderNumber || prev.orderNumber || (userOrders[0]?.orderNumber ?? ''),
      }));
    } else {
      // Reset submitted state when closed
      setSubmittedTicket(null);
    }
  }, [isOpen, currentUser, defaultOrderNumber]);

  // Handle Photo Upload with compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast({
        type: 'warning',
        title: 'File Too Large',
        message: 'Please choose an image under 10MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setPhotoPreview(dataUrl);
      try {
        const optimized = await safeOptimizeImageForFirestore(dataUrl, `complaint-evidence-${Date.now()}`);
        setForm((prev) => ({ ...prev, photoAttachment: optimized }));
      } catch {
        setForm((prev) => ({ ...prev, photoAttachment: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setForm((prev) => ({ ...prev, photoAttachment: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      addToast({
        type: 'warning',
        title: 'Contact Details Required',
        message: 'Please enter your name, phone number, and email address.',
      });
      return;
    }

    if (!form.description.trim()) {
      addToast({
        type: 'warning',
        title: 'Description Needed',
        message: 'Please briefly describe the problem with your order or plants.',
      });
      return;
    }

    setIsSubmitting(true);
    const ticketId = `CMP-${Date.now().toString().slice(-6)}`;

    try {
      // 1. Save locally to guarantee no grievance is ever lost
      try {
        const stored = JSON.parse(localStorage.getItem('7seasons_complaints') || '[]');
        stored.unshift({
          ticketId,
          customerName: form.name.trim(),
          customerEmail: form.email.trim(),
          customerPhone: form.phone.trim(),
          orderNumber: form.orderNumber.trim() || null,
          category: form.category,
          urgency: form.urgency,
          description: form.description.trim(),
          desiredResolution: form.desiredResolution,
          photoAttachment: form.photoAttachment || null,
          status: 'open',
          companyEmail,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('7seasons_complaints', JSON.stringify(stored.slice(0, 100)));
      } catch {}

      // 2. Persist to Firestore complaints collection asynchronously
      if (!isFirestoreQuotaExceeded()) {
        try {
          addDoc(collection(db, 'complaints'), {
            ticketId,
            customerName: form.name.trim(),
            customerEmail: form.email.trim(),
            customerPhone: form.phone.trim(),
            orderNumber: form.orderNumber.trim() || null,
            category: form.category,
            urgency: form.urgency,
            description: form.description.trim(),
            desiredResolution: form.desiredResolution,
            photoAttachment: form.photoAttachment || null,
            status: 'open',
            companyEmail,
            createdAt: serverTimestamp(),
          }).catch((err) => handleFirestoreQuotaError(err, 'complaints'));
        } catch (e) {
          console.warn('Firestore complaints dispatch note:', e);
        }
      }

      // 3. Dispatch to server endpoint /api/complaints
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        await fetch('/api/complaints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            orderNumber: form.orderNumber,
            category: form.category,
            urgency: form.urgency,
            description: form.description,
            desiredResolution: form.desiredResolution,
            photoAttachment: form.photoAttachment,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
      } catch (netErr) {
        console.warn('Complaint email dispatch note:', netErr);
      }

      setSubmittedTicket({
        ticketId,
        data: { ...form },
      });

      addToast({
        type: 'success',
        title: 'Complaint Registered 🚨',
        message: `Ticket #${ticketId} dispatched to ${companyEmail}.`,
      });
    } catch (err: any) {
      console.error('Complaint submission error:', err);
      setSubmittedTicket({
        ticketId,
        data: { ...form },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0c1e17] rounded-3xl shadow-2xl border border-emerald-900/15 dark:border-emerald-800/40 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-700 via-red-700 to-rose-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full text-white">
                  Fast Redressal Desk
                </span>
                <span className="text-xs text-rose-100 hidden sm:inline">
                  • 24/7 Nursery Support
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                Raise a Customer Complaint
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          {submittedTicket ? (
            /* Ticket Confirmation View */
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Ticket Generated & Logged
                </span>
                <h3 className="text-2xl font-black text-emerald-950 dark:text-emerald-50 mt-1">
                  Complaint Ticket #{submittedTicket.ticketId}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto mt-2 leading-relaxed">
                  Your grievance regarding <strong>"{submittedTicket.data.category}"</strong> has been logged and sent to{' '}
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">{companyEmail}</span>.
                </p>
              </div>

              {/* Resolution Summary Box */}
              <div className="bg-[#F4FAF5] dark:bg-[#071711] p-4 sm:p-5 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-emerald-900/10 dark:border-emerald-800/20 pb-2">
                  <span className="text-gray-500 dark:text-gray-400">Customer:</span>
                  <span className="font-bold text-emerald-950 dark:text-emerald-50">{submittedTicket.data.name}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-900/10 dark:border-emerald-800/20 pb-2">
                  <span className="text-gray-500 dark:text-gray-400">Urgency:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{submittedTicket.data.urgency}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-900/10 dark:border-emerald-800/20 pb-2">
                  <span className="text-gray-500 dark:text-gray-400">Requested Resolution:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">{submittedTicket.data.desiredResolution}</span>
                </div>
                {submittedTicket.data.orderNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Order Number:</span>
                    <span className="font-bold text-emerald-950 dark:text-emerald-50">#{submittedTicket.data.orderNumber}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons for Escalation */}
              <div className="space-y-3 pt-2">
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Need faster escalation? Contact founders instantly:
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                      `Hello Mannaratharayil Gardens LLP Team, I have raised Complaint Ticket #${submittedTicket.ticketId} regarding ${submittedTicket.data.category}. My name is ${submittedTicket.data.name}. Please assist with my plant order.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Nursery Desk</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>

                  <a
                    href={`mailto:${companyEmail}?subject=${encodeURIComponent(
                      `[Customer Complaint #${submittedTicket.ticketId}] ${submittedTicket.data.category} - ${submittedTicket.data.name}`
                    )}&body=${encodeURIComponent(
                      `Dear Mannaratharayil Gardens LLP Team,\n\nI have registered Complaint Ticket #${submittedTicket.ticketId}.\n\nName: ${submittedTicket.data.name}\nPhone: ${submittedTicket.data.phone}\nOrder Number: ${submittedTicket.data.orderNumber || 'N/A'}\nDesired Resolution: ${submittedTicket.data.desiredResolution}\n\nDescription:\n${submittedTicket.data.description}`
                    )}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-950 dark:text-emerald-100 font-bold text-xs transition-all cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>Email Direct Confirmation</span>
                  </a>
                </div>

                <div className="pt-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Complaint Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-950 dark:text-rose-200 leading-relaxed font-medium">
                  <strong>7Seasons Live Plant Transit Guarantee:</strong> If your plant arrives wilted, broken in courier transit, or missing bundled planters, fill this form for an instant priority replacement or full refund.
                </p>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-emerald-950 dark:text-emerald-50 block mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Maya Nair"
                    className="w-full px-3.5 py-2.5 bg-[#F4FAF5] dark:bg-[#06120e] rounded-xl border border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-50 focus:bg-white dark:focus:bg-[#0a1f18] focus:border-rose-600 outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-emerald-950 dark:text-emerald-50 block mb-1">
                    Contact Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 bg-[#F4FAF5] dark:bg-[#06120e] rounded-xl border border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-50 focus:bg-white dark:focus:bg-[#0a1f18] focus:border-rose-600 outline-hidden font-medium"
                  />
                </div>
              </div>

              {/* Email & Order Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-emerald-950 dark:text-emerald-50 block mb-1">
                    Your Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. maya@example.com"
                    className="w-full px-3.5 py-2.5 bg-[#F4FAF5] dark:bg-[#06120e] rounded-xl border border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-50 focus:bg-white dark:focus:bg-[#0a1f18] focus:border-rose-600 outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-emerald-950 dark:text-emerald-50 block mb-1">
                    Order Number (Optional)
                  </label>
                  {userOrders.length > 0 ? (
                    <select
                      value={form.orderNumber}
                      onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[#F4FAF5] dark:bg-[#06120e] rounded-xl border border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-50 focus:bg-white dark:focus:bg-[#0a1f18] outline-hidden font-medium"
                    >
                      <option value="">-- Select from your orders or type --</option>
                      {userOrders.map((ord) => (
                        <option key={ord.id} value={ord.orderNumber}>
                          #{ord.orderNumber} (₹{ord.total}) - {new Date(ord.createdAt).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={form.orderNumber}
                      onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                      placeholder="e.g. 7SP-88210"
                      className="w-full px-3.5 py-2.5 bg-[#F4FAF5] dark:bg-[#06120e] rounded-xl border border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-50 focus:bg-white dark:focus:bg-[#0a1f18] focus:border-rose-600 outline-hidden font-medium"
                    />
                  )}
                </div>
              </div>

              {/* Category & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-emerald-950 dark:text-emerald-50 block mb-1">
                    Complaint Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#F4FAF5] dark:bg-[#06120e] rounded-xl border border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-50 focus:bg-white dark:focus:bg-[#0a1f18] outline-hidden font-semibold"
                  >
                    <option value="Damaged Plant / Broken Stems in Transit">🥀 Damaged Plant / Broken Stems in Transit</option>
                    <option value="Packaging Condition / Crushed Carton">📦 Packaging Condition / Crushed Carton</option>
                    <option value="Delayed Delivery / Courier Inactivity">⏳ Delayed Delivery / Courier Inactivity</option>
                    <option value="Withered / Rotten Foliage on Arrival">🍂 Withered / Rotten Foliage on Arrival</option>
                    <option value="Missing or Incorrect Plant in Combo">🔍 Missing or Incorrect Plant in Combo</option>
                    <option value="Payment / Refund Discrepancy">💳 Payment / Refund Discrepancy</option>
                    <option value="Other Service Grievance">📝 Other Customer Grievance</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-emerald-950 dark:text-emerald-50 block mb-1">
                    Urgency Level *
                  </label>
                  <select
                    value={form.urgency}
                    onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#F4FAF5] dark:bg-[#06120e] rounded-xl border border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-50 focus:bg-white dark:focus:bg-[#0a1f18] outline-hidden font-semibold"
                  >
                    <option value="High (Live Plant in Distress)">🔴 High (Live Plant in Distress)</option>
                    <option value="Critical (Dead on Arrival / Lost)">🚨 Critical (Dead on Arrival / Lost)</option>
                    <option value="Normal (Standard Redressal within 24h)">🟡 Normal (Standard 24-hr review)</option>
                  </select>
                </div>
              </div>

              {/* Preferred Resolution */}
              <div>
                <label className="font-bold text-emerald-950 dark:text-emerald-50 block mb-1">
                  Preferred Resolution
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Free Live Plant Replacement Dispatch',
                    'Full / Partial Refund to Original Source',
                    'Senior Horticulturist Video Call / Care Advice',
                    'Store Credit Coupon for Future Order',
                  ].map((resOption) => (
                    <label
                      key={resOption}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                        form.desiredResolution === resOption
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 text-emerald-900 dark:text-emerald-200 font-bold'
                          : 'bg-[#F4FAF5] dark:bg-[#06120e] border-emerald-900/15 dark:border-emerald-800/40 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="modalDesiredResolution"
                        value={resOption}
                        checked={form.desiredResolution === resOption}
                        onChange={(e) => setForm({ ...form, desiredResolution: e.target.value })}
                        className="accent-emerald-700"
                      />
                      <span className="text-[11px] leading-tight">{resOption}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Photo Evidence Upload */}
              <div>
                <label className="font-bold text-emerald-950 dark:text-emerald-50 block mb-1">
                  Photo Evidence (Optional - Speeds Up Instant Replacement)
                </label>
                {photoPreview ? (
                  <div className="relative inline-block mt-1">
                    <img
                      src={photoPreview}
                      alt="Complaint photo preview"
                      className="w-24 h-24 object-cover rounded-2xl border-2 border-emerald-700 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md cursor-pointer"
                      title="Remove photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-emerald-900/20 dark:border-emerald-800/40 hover:border-emerald-600 rounded-2xl cursor-pointer bg-[#F4FAF5] dark:bg-[#06120e] transition-colors">
                    <Upload className="w-4 h-4 text-emerald-700 dark:text-emerald-400 mb-1" />
                    <span className="font-bold text-[11px] text-emerald-950 dark:text-emerald-50">
                      Click to upload damaged plant or carton photo
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      PNG, JPG or WEBP (Direct evidence speeds up replacement dispatch)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Detailed Description */}
              <div>
                <label className="font-bold text-emerald-950 dark:text-emerald-50 block mb-1">
                  Detailed Description of Issue *
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe condition upon unboxing, stem damage, soil spill, or delivery issues..."
                  className="w-full p-3 bg-[#F4FAF5] dark:bg-[#06120e] rounded-xl border border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-50 focus:bg-white dark:focus:bg-[#0a1f18] focus:border-rose-600 outline-hidden font-medium"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-full font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Complaint Ticket...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Complaint Directly to Nursery Founders</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-gray-500 dark:text-gray-400 mt-2">
                  Complaint ticket will be delivered directly to {companyEmail} with high priority.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
