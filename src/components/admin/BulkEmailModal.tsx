import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Mail,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Tag,
  BookOpen,
  Crown,
  Eye,
  Check,
} from 'lucide-react';
import { User, Order } from '../../types';
import { useStore } from '../../context/StoreContext';

interface BulkEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsers?: User[];
  allUsers: User[];
  orders: Order[];
}

type AudienceType = 'selected' | 'all' | 'with-orders' | 'zero-orders';

const PRESET_TEMPLATES = [
  {
    id: 'seasonal-sale',
    label: '🌿 Seasonal Sale & New Combos',
    badge: 'Special Nursery Offer',
    subject: '🌿 Special Nursery Discounts & Fresh Plant Combos from 7Seasons!',
    headline: 'Bring Nature Indoors with Fresh Nursery Plant Bundles',
    body: `We have just released new acclimated plant combo bundles directly from our nursery in Kerala! Each bundle includes matching premium pots, nutrient-rich potting mix, and up to 35% bundled savings.

Use coupon code GREEN10 at checkout for an extra 10% discount on your order this week. Our plants are carefully packaged in custom ventilated cartons and delivered safely to your doorstep.`,
    ctaText: 'Explore Curated Plant Combos',
    ctaUrl: 'https://www.7seasonsplants.com/#combos',
  },
  {
    id: 'care-guide',
    label: '🪴 Plant Care & Unboxing Guide',
    badge: 'Nursery Care Advice',
    subject: '🌱 Caring for Your 7Seasons Plants: Simple Tips for Healthy Foliage',
    headline: 'Keep Your Foliage Thriving with Expert Nursery Advice',
    body: `Thank you for being part of the 7Seasons botanical family! To ensure your new specimens thrive in their new home:

1. Unbox immediately and place in bright, indirect light for 48 hours.
2. Check moisture with your finger—water only if topsoil feels dry.
3. Allow plants to acclimatize before moving them into direct sun.

Need personalized diagnosis or care instructions? Our team of horticulturists is always here to assist.`,
    ctaText: 'View Plant Care Library',
    ctaUrl: 'https://www.7seasonsplants.com/#care',
  },
  {
    id: 'exclusive-deal',
    label: '👑 Exclusive 1-Per-Account Deal',
    badge: 'Collector Exclusive',
    subject: '👑 Exclusive Deal: Limited Batch Plant Combo (1 Per Customer Account)',
    headline: 'Special Limited Release Botanical Bundle Available Now',
    body: `We've just launched an exclusive high-value botanical bundle! Because this deal includes premium acclimated specimens at nursery direct prices, each registered customer account is eligible to purchase this combo only once.

Stock is strictly limited to 20 units. Claim yours today before stock sells out!`,
    ctaText: 'Claim Your Exclusive Deal',
    ctaUrl: 'https://www.7seasonsplants.com/#combos',
  },
  {
    id: 'custom',
    label: '✍️ Custom Announcement',
    badge: 'Nursery Update',
    subject: '🌿 An Update from 7Seasons By Mannaratharayil Gardens LLP',
    headline: 'News and Updates from 7Seasons Nursery',
    body: `Dear Plant Lover,\n\nWe have exciting updates to share with you from our nursery! Browse our fresh catalog and discover curated live indoor and outdoor plants grown with love.`,
    ctaText: 'Visit 7Seasons Nursery',
    ctaUrl: 'https://www.7seasonsplants.com/#home',
  },
];

export const BulkEmailModal: React.FC<BulkEmailModalProps> = ({
  isOpen,
  onClose,
  selectedUsers = [],
  allUsers = [],
  orders = [],
}) => {
  const { storeSettings, addToast, recordUserLog, currentUser, currentAdmin, isCurrentSuperAdmin, adminAccounts } = useStore();
  const companyEmail = storeSettings?.email || 'mannaratharayil@gmail.com';

  const superAdminEmails = useMemo(() => {
    const set = new Set<string>(['annanvasu36@gmail.com', 'abinsajan36@gmail.com']);
    adminAccounts.forEach((acc) => {
      if (acc.role === 'super_admin' && acc.email) {
        set.add(acc.email.toLowerCase().trim());
      }
    });
    return set;
  }, [adminAccounts]);

  const [audience, setAudience] = useState<AudienceType>('all');
  const [selectedTemplate, setSelectedTemplate] = useState('seasonal-sale');

  const [badgeText, setBadgeText] = useState('Special Nursery Offer');
  const [subject, setSubject] = useState(PRESET_TEMPLATES[0].subject);
  const [headline, setHeadline] = useState(PRESET_TEMPLATES[0].headline);
  const [message, setMessage] = useState(PRESET_TEMPLATES[0].body);
  const [ctaText, setCtaText] = useState(PRESET_TEMPLATES[0].ctaText);
  const [ctaUrl, setCtaUrl] = useState(PRESET_TEMPLATES[0].ctaUrl);
  const [includeCta, setIncludeCta] = useState(true);

  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sendResult, setSendResult] = useState<{
    sentCount: number;
    totalCount: number;
  } | null>(null);

  // Set default audience if users were pre-selected
  useEffect(() => {
    if (selectedUsers && selectedUsers.length > 0) {
      setAudience('selected');
    } else {
      setAudience('all');
    }
    setSendResult(null);
  }, [isOpen, selectedUsers]);

  // Compute orders map per user email
  const userOrderCounts = useMemo(() => {
    const counts = new Map<string, number>();
    orders.forEach((o) => {
      const email = (o.customer?.email || '').toLowerCase().trim();
      if (email) {
        counts.set(email, (counts.get(email) || 0) + 1);
      }
      if (o.customerId) {
        counts.set(o.customerId, (counts.get(o.customerId) || 0) + 1);
      }
    });
    return counts;
  }, [orders]);

  // Determine target recipient list based on chosen audience - strictly excludes Super Admin for regular admins
  const recipientList = useMemo(() => {
    // Filter out accounts without valid emails and strictly omit super admin for standard admins
    const validUsers = allUsers.filter((u) => {
      if (!u.email || !u.email.includes('@')) return false;
      if (!isCurrentSuperAdmin) {
        const cleanEmail = u.email.toLowerCase().trim();
        if (superAdminEmails.has(cleanEmail) || u.role === 'super_admin') return false;
      }
      return true;
    });

    const validSelected = selectedUsers.filter((u) => {
      if (!u.email || !u.email.includes('@')) return false;
      if (!isCurrentSuperAdmin) {
        const cleanEmail = u.email.toLowerCase().trim();
        if (superAdminEmails.has(cleanEmail) || u.role === 'super_admin') return false;
      }
      return true;
    });

    switch (audience) {
      case 'selected':
        return validSelected;
      case 'with-orders':
        return validUsers.filter((u) => {
          const ordCount = (userOrderCounts.get(u.email.toLowerCase().trim()) || 0) + (u.id ? (userOrderCounts.get(u.id) || 0) : 0);
          return ordCount > 0;
        });
      case 'zero-orders':
        return validUsers.filter((u) => {
          const ordCount = (userOrderCounts.get(u.email.toLowerCase().trim()) || 0) + (u.id ? (userOrderCounts.get(u.id) || 0) : 0);
          return ordCount === 0;
        });
      case 'all':
      default:
        return validUsers;
    }
  }, [audience, selectedUsers, allUsers, userOrderCounts, isCurrentSuperAdmin, superAdminEmails]);

  // Apply template
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const tmpl = PRESET_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setBadgeText(tmpl.badge);
      setSubject(tmpl.subject);
      setHeadline(tmpl.headline);
      setMessage(tmpl.body);
      setCtaText(tmpl.ctaText);
      setCtaUrl(tmpl.ctaUrl);
    }
  };

  // Dispatch bulk email
  const handleSendBulkEmail = async () => {
    if (!subject.trim()) {
      addToast({
        type: 'warning',
        title: 'Subject Required',
        message: 'Please provide an email subject line.',
      });
      return;
    }

    if (!message.trim()) {
      addToast({
        type: 'warning',
        title: 'Message Required',
        message: 'Please write your message body.',
      });
      return;
    }

    if (recipientList.length === 0) {
      addToast({
        type: 'warning',
        title: 'No Recipients',
        message: 'There are no recipients matching the selected audience.',
      });
      return;
    }

    setIsSending(true);

    try {
      const payloadRecipients = recipientList.map((u) => ({
        email: u.email.trim(),
        name: u.name || 'Valued Customer',
      }));

      const res = await fetch('/api/admin/send-bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: payloadRecipients,
          subject: subject.trim(),
          headline: headline.trim(),
          badgeText: badgeText.trim(),
          message: message.trim(),
          callToActionText: includeCta ? ctaText.trim() : '',
          callToActionUrl: includeCta ? ctaUrl.trim() : '',
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSendResult({
          sentCount: data.sentCount ?? payloadRecipients.length,
          totalCount: payloadRecipients.length,
        });

        // Record in admin user audit trail
        recordUserLog({
          email: currentAdmin?.email || currentUser?.email || 'admin@7seasons.com',
          name: currentAdmin?.name || currentUser?.name || 'Store Administrator',
          role: 'admin',
          eventType: 'login_success',
          authMethod: 'admin_gate',
          status: 'success',
          details: `Dispatched bulk email "${subject}" to ${data.sentCount ?? payloadRecipients.length} customer accounts.`,
        }).catch(() => {});

        addToast({
          type: 'success',
          title: 'Bulk Email Dispatched ✉️',
          message: `Successfully emailed ${data.sentCount ?? payloadRecipients.length} customers.`,
        });
      } else {
        throw new Error(data.error || 'Failed to dispatch bulk email.');
      }
    } catch (err: any) {
      console.error('Bulk email failed:', err);
      addToast({
        type: 'error',
        title: 'Broadcast Failed',
        message: err.message || 'Could not send bulk email.',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0c1e17] rounded-3xl shadow-2xl border border-emerald-900/15 dark:border-emerald-800/40 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Mail className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                  Customer Email Broadcast
                </span>
                <span className="text-xs text-emerald-200/80 hidden sm:inline">
                  • Send updates to registered accounts
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                Send Bulk Email to Customers
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

        {/* Modal Body */}
        <div className="p-6 max-h-[calc(85vh-120px)] overflow-y-auto space-y-6">
          {sendResult ? (
            /* Success confirmation view */
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Broadcast Complete
                </span>
                <h3 className="text-2xl font-black text-emerald-950 dark:text-emerald-50 mt-1">
                  Bulk Email Sent Successfully!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto mt-2 leading-relaxed">
                  Sent <strong>"{subject}"</strong> to{' '}
                  <strong className="text-emerald-700 dark:text-emerald-400">{sendResult.sentCount}</strong> customer account(s).
                </p>
              </div>

              <div className="bg-[#F4FAF5] dark:bg-[#071711] p-4 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 max-w-md mx-auto text-xs text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">From Address:</span>
                  <span className="font-bold text-emerald-950 dark:text-emerald-50">{companyEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Recipient Count:</span>
                  <span className="font-bold text-emerald-700">{sendResult.sentCount} / {sendResult.totalCount} accounts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Subject:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 truncate max-w-[200px]">{subject}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setSendResult(null)}
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Send Another Campaign
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Audience Selector Bar */}
              <div className="bg-[#F4FAF5] dark:bg-[#06120e] p-4 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <span>Select Target Customer Audience</span>
                  </label>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                    {recipientList.length} Customer{recipientList.length === 1 ? '' : 's'} Selected
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {selectedUsers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAudience('selected')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                        audience === 'selected'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-[#0a1f18] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-400'
                      }`}
                    >
                      <div className="text-[11px]">Selected Accounts</div>
                      <div className="text-base font-black">{selectedUsers.length}</div>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setAudience('all')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      audience === 'all'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white dark:bg-[#0a1f18] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-400'
                    }`}
                  >
                    <div className="text-[11px]">All Accounts</div>
                    <div className="text-base font-black">
                      {allUsers.filter((u) => isCurrentSuperAdmin || (!superAdminEmails.has((u.email || '').toLowerCase().trim()) && u.role !== 'super_admin')).length}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAudience('with-orders')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      audience === 'with-orders'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white dark:bg-[#0a1f18] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-400'
                    }`}
                  >
                    <div className="text-[11px]">Accounts with Orders</div>
                    <div className="text-base font-black">
                      {allUsers.filter((u) => {
                        if (!isCurrentSuperAdmin) {
                          const clean = (u.email || '').toLowerCase().trim();
                          if (superAdminEmails.has(clean) || u.role === 'super_admin') return false;
                        }
                        return (userOrderCounts.get((u.email || '').toLowerCase().trim()) || 0) > 0;
                      }).length}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAudience('zero-orders')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      audience === 'zero-orders'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white dark:bg-[#0a1f18] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-400'
                    }`}
                  >
                    <div className="text-[11px]">Accounts with 0 Orders</div>
                    <div className="text-base font-black">
                      {allUsers.filter((u) => {
                        if (!isCurrentSuperAdmin) {
                          const clean = (u.email || '').toLowerCase().trim();
                          if (superAdminEmails.has(clean) || u.role === 'super_admin') return false;
                        }
                        return (userOrderCounts.get((u.email || '').toLowerCase().trim()) || 0) === 0;
                      }).length}
                    </div>
                  </button>
                </div>

                {/* Recipient Chips Preview */}
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                  {recipientList.slice(0, 15).map((u) => (
                    <span
                      key={u.id || u.email}
                      className="inline-flex items-center gap-1 text-[11px] bg-white dark:bg-[#0a1f18] border border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-100 px-2.5 py-0.5 rounded-full font-medium"
                    >
                      <Mail className="w-2.5 h-2.5 text-emerald-600" />
                      <span>{u.email}</span>
                    </span>
                  ))}
                  {recipientList.length > 15 && (
                    <span className="text-[11px] text-gray-500 font-bold px-2 py-0.5">
                      +{recipientList.length - 15} more
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Template Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                  Choose a Campaign Template or Start Fresh
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleTemplateChange(tmpl.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedTemplate === tmpl.id
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-bold shadow-xs'
                          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a1f18] text-gray-600 dark:text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xs truncate">{tmpl.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Toggle: Editor vs Preview */}
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Compose Email Content
                </span>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showPreview ? 'Edit Message' : 'Show Live Preview'}</span>
                </button>
              </div>

              {showPreview ? (
                /* Live Preview Card */
                <div className="bg-[#F4FAF5] dark:bg-[#071711] p-6 rounded-3xl border border-emerald-900/15 max-w-xl mx-auto shadow-sm space-y-4">
                  <div className="bg-gradient-to-br from-[#062416] to-[#041a10] text-white p-6 rounded-2xl text-center space-y-2">
                    <span className="inline-block bg-white/15 text-emerald-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                      🌿 {badgeText}
                    </span>
                    <h3 className="text-lg font-black text-white">{headline || subject}</h3>
                    <p className="text-xs text-emerald-200/80">7Seasons By Mannaratharayil Gardens LLP</p>
                  </div>

                  <div className="bg-white dark:bg-[#0a1f18] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                    <p className="font-bold text-emerald-950 dark:text-emerald-50">
                      Dear [Customer Name],
                    </p>
                    <div className="whitespace-pre-line">{message}</div>

                    {includeCta && ctaUrl && (
                      <div className="text-center pt-3 pb-1">
                        <span className="inline-block bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-md">
                          {ctaText} &rarr;
                        </span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-500 text-center">
                      Mannaratharayil Gardens LLP • Kerala, India • Helpline: +91 88482 76403
                    </div>
                  </div>
                </div>
              ) : (
                /* Email Editor Form */
                <div className="space-y-4 text-xs">
                  {/* Subject Line & Badge */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="font-bold text-gray-800 dark:text-gray-200 block mb-1">
                        Email Subject Line *
                      </label>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. 🌿 Special Nursery Discounts & Fresh Plant Combos!"
                        className="w-full px-3.5 py-2.5 bg-[#F4FAF5] dark:bg-[#06120e] rounded-xl border border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-50 focus:bg-white dark:focus:bg-[#0a1f18] focus:border-emerald-600 outline-hidden font-medium"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-800 dark:text-gray-200 block mb-1">
                        Top Badge Tag
                      </label>
                      <input
                        type="text"
                        value={badgeText}
                        onChange={(e) => setBadgeText(e.target.value)}
                        placeholder="e.g. Special Offer"
                        className="w-full px-3.5 py-2.5 bg-[#F4FAF5] dark:bg-[#06120e] rounded-xl border border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-50 focus:bg-white dark:focus:bg-[#0a1f18] outline-hidden font-medium"
                      />
                    </div>
                  </div>

                  {/* Headline */}
                  <div>
                    <label className="font-bold text-gray-800 dark:text-gray-200 block mb-1">
                      Header Title inside Email *
                    </label>
                    <input
                      type="text"
                      required
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Bring Nature Indoors with Fresh Nursery Plant Bundles"
                      className="w-full px-3.5 py-2.5 bg-[#F4FAF5] dark:bg-[#06120e] rounded-xl border border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-50 focus:bg-white dark:focus:bg-[#0a1f18] focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  {/* Message Body */}
                  <div>
                    <label className="font-bold text-gray-800 dark:text-gray-200 block mb-1">
                      Email Message Body *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your email announcement or newsletter here..."
                      className="w-full p-3.5 bg-[#F4FAF5] dark:bg-[#06120e] rounded-xl border border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-50 focus:bg-white dark:focus:bg-[#0a1f18] focus:border-emerald-600 outline-hidden font-medium leading-relaxed"
                    />
                  </div>

                  {/* Call to Action Button Toggle */}
                  <div className="bg-[#F4FAF5] dark:bg-[#06120e] p-4 rounded-2xl border border-emerald-900/15 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeCta}
                        onChange={(e) => setIncludeCta(e.target.checked)}
                        className="rounded accent-emerald-600"
                      />
                      <span className="font-bold text-emerald-950 dark:text-emerald-100">
                        Include Call to Action Button in Email
                      </span>
                    </label>

                    {includeCta && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 block mb-1">
                            Button Label
                          </label>
                          <input
                            type="text"
                            value={ctaText}
                            onChange={(e) => setCtaText(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-[#0a1f18] rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 block mb-1">
                            Destination Link
                          </label>
                          <input
                            type="text"
                            value={ctaUrl}
                            onChange={(e) => setCtaUrl(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-[#0a1f18] rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="text-[11px] text-gray-500">
                  Broadcast will send to <strong>{recipientList.length}</strong> verified email{recipientList.length === 1 ? '' : 's'}.
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-5 py-3 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSendBulkEmail}
                    disabled={isSending || recipientList.length === 0}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending to {recipientList.length} Customers...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Bulk Email ({recipientList.length})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
