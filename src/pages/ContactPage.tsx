import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface ContactPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const { addToast } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Order Enquiry',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      addToast({
        title: 'Missing Fields',
        message: 'Please fill in your name, mobile, and message.',
        type: 'warning',
      });
      return;
    }

    setIsSubmitted(true);
    addToast({
      title: 'Enquiry Received 🌿',
      message: 'Our nursery team will contact you on WhatsApp / Phone shortly.',
      type: 'success',
    });
  };

  return (
    <div className="bg-[#F4FAF5] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>Nursery Customer Care</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-emerald-950 tracking-tight">
            Contact Mannarathayil Nursery
          </h1>

          <p className="text-xs sm:text-sm text-gray-600">
            Have questions regarding plant delivery, bulk corporate gifting, or custom balcony bundles?
            We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Contact Details & WhatsApp Banner (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* WhatsApp Card */}
            <div className="bg-gradient-to-br from-[#062919] via-[#0D4A2B] to-[#0A3D22] text-white p-6 sm:p-8 rounded-3xl space-y-4 shadow-md border border-emerald-800/30">
              <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                Instant Chat Assistance
              </span>
              <h3 className="text-xl font-bold text-white">Fastest Support on WhatsApp</h3>
              <p className="text-xs text-[#D1FAE5]/90 leading-relaxed">
                Connect directly with our master growers for plant health photos, unboxing advice, and
                order tracking.
              </p>
              <a
                href="https://wa.me/919567274176?text=Hi%207Seasonsplants%20Team!%20I%20have%20an%20enquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full text-xs font-bold shadow-md transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat on WhatsApp (+91 95672 74176)</span>
              </a>
            </div>

            {/* Nursery Info */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-900/10 shadow-xs space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950 block font-bold text-sm">
                    Mannarathayil Nursery
                  </strong>
                  <p className="text-gray-600 mt-0.5 leading-relaxed">
                    Main Propagation Facility & Dispatch Hub, Kerala, India.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-emerald-900/10">
                <Phone className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950 block font-bold">Helpline & WhatsApp</strong>
                  <p className="text-gray-600 mt-0.5">+91 95672 74176</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-emerald-900/10">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950 block font-bold">Dispatch & Operating Hours</strong>
                  <p className="text-gray-600 mt-0.5">Monday – Saturday: 8:30 AM – 7:30 PM</p>
                  <p className="text-emerald-800 font-medium text-[11px]">Sunday: Nursery Maintenance & Care</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Message Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-emerald-900/10 shadow-xs">
            {isSubmitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-2xl border border-emerald-100">
                  <CheckCircle2 className="w-8 h-8 text-emerald-700" />
                </div>
                <h3 className="text-xl font-bold text-emerald-950">Thank You for Reaching Out!</h3>
                <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                  We have received your enquiry. A representative from Mannarathayil Nursery will get back
                  to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: '', phone: '', email: '', subject: 'Order Enquiry', message: '' });
                  }}
                  className="px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-100"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h3 className="text-base font-bold text-emerald-950 pb-2 border-b border-emerald-900/10">
                  Send Us a Direct Message
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Maya Nair"
                      className="w-full px-4 py-2.5 bg-[#F4FAF5] rounded-full border border-emerald-900/15 text-emerald-950 focus:bg-white focus:border-emerald-600 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">
                      Mobile Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full px-4 py-2.5 bg-[#F4FAF5] rounded-full border border-emerald-900/15 text-emerald-950 focus:bg-white focus:border-emerald-600 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. maya@example.com"
                      className="w-full px-4 py-2.5 bg-[#F4FAF5] rounded-full border border-emerald-900/15 text-emerald-950 focus:bg-white focus:border-emerald-600 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">Enquiry Topic</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[#F4FAF5] rounded-full border border-emerald-900/15 text-emerald-950 focus:bg-white outline-hidden font-semibold"
                    >
                      <option value="Order Enquiry">Track / Status of Existing Order</option>
                      <option value="Custom Combo">Custom Balcony / Indoor Combo Consultation</option>
                      <option value="Bulk Corporate">Bulk & Corporate Plant Gifting</option>
                      <option value="Plant Health">Plant Health & Care Guidance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-emerald-950 block mb-1">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your plant enquiry or requirements..."
                    className="w-full p-3 bg-[#F4FAF5] rounded-2xl border border-emerald-900/15 text-emerald-950 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Enquiry to Nursery Team</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
