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
  Truck,
  Package,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import { User, Order } from '../../types';
import { useStore } from '../../context/StoreContext';

export type AudienceType = 'selected' | 'all' | 'with-orders' | 'by-order-status' | 'zero-orders';

export interface BulkEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsers?: User[];
  allUsers: User[];
  orders: Order[];
  initialAudience?: AudienceType;
  initialOrderStatuses?: string[];
}

const PRESET_TEMPLATES = [
  {
    id: 'order-update-prep',
    label: '📦 Order Confirmed & Packing',
    badge: 'Nursery Order Update',
    subject: '🌿 Order Confirmed: Your Plants are Being Selected & Packed at 7Seasons!',
    headline: 'Hand-Picking Healthy Acclimated Specimens for Your Garden',
    body: `Thank you for shopping with 7Seasons Nursery! We are currently hand-picking your live specimens directly from our nursery benches in Kerala.

Each plant undergoes quality inspection, gentle hydration, and root stabilization before being packed in custom 5-ply ventilated cartons with protective moisture retention collars.

We will notify you with courier tracking information the moment your package is dispatched!`,
    ctaText: 'Track Your Order Status',
    ctaUrl: 'https://www.7seasonsplants.com/#track',
  },
  {
    id: 'order-transit',
    label: '🚚 Dispatched in Transit Notice',
    badge: 'Express Dispatch Notice',
    subject: '🚚 In Transit: Your 7Seasons Live Plant Order Has Been Dispatched!',
    headline: 'Express Courier Dispatch for Kerala, Tamil Nadu & Karnataka',
    body: `Exciting news! Your live plant parcel has been safely dispatched from our nursery and is now in transit with our express logistics partner.

Our parcels are labeled with priority live plant handling instructions. You can track your package progress directly using your order number or registered mobile number.

Please ensure someone is available at your doorstep to receive and unpack your plants promptly upon arrival.`,
    ctaText: 'Track Plant Delivery in Real-Time',
    ctaUrl: 'https://www.7seasonsplants.com/#track',
  },
  {
    id: 'order-care-delivered',
    label: '🪴 Plant Care Guide (Post-Delivery)',
    badge: 'Plant Care Advice',
    subject: '🌱 Welcome Your New Plants Home: Essential Post-Delivery Care Tips',
    headline: 'Simple Steps to Help Your Foliage Acclimate & Flourish',
    body: `We hope your new green additions have arrived in vibrant health! Plants may feel a little tired after transit, which is completely normal. Here are 3 simple steps to help them thrive:

1. Unbox gently and place plants in a bright spot with indirect natural light for the first 48 hours. Avoid direct scorching sun immediately.
2. Check the potting mix: if the top 1 inch feels dry, give a thorough drink of water until it drains from the base.
3. Allow the plants 7-10 days to acclimate before repotting or fertilizing.

Need personalized care help or leaf inspection? Reply directly to this email or message our nursery team on WhatsApp.`,
    ctaText: 'View Complete Botanical Care Library',
    ctaUrl: 'https://www.7seasonsplants.com/#care',
  },
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
    label: '🪴 Nursery Care Advice',
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
  initialAudience,
  initialOrderStatuses,
}) => {
  const { storeSettings, addToast, recordUserLog, currentUser, currentAdmin, isCurrentSuperAdmin, adminAccounts } = useStore();
  const companyEmail = storeSettings?.email || 'mannaratharayil@gmail.com';

  const superAdminEmails = useMemo(() => {
    const set = new Set<string>(['abinsajan36@gmail.com']);
    adminAccounts.forEach((acc) => {
      if (acc.role === 'super_admin' && acc.email) {
        set.add(acc.email.toLowerCase().trim());
      }
    });
    return set;
  }, [adminAccounts]);

  const [audience, setAudience] = useState<AudienceType>(initialAudience || 'all');
  const [selectedOrderStatuses, setSelectedOrderStatuses] = useState<string[]>(
    initialOrderStatuses && initialOrderStatuses.length > 0
      ? initialOrderStatuses
      : ['Order Placed', 'Processing', 'Shipped']
  );
  const [showRecipientPreview, setShowRecipientPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(
    initialAudience === 'by-order-status' ? 'order-update-prep' : 'seasonal-sale'
  );

  const [badgeText, setBadgeText] = useState(
    initialAudience === 'by-order-status' ? PRESET_TEMPLATES[0].badge : PRESET_TEMPLATES[3].badge
  );
  const [subject, setSubject] = useState(
    initialAudience === 'by-order-status' ? PRESET_TEMPLATES[0].subject : PRESET_TEMPLATES[3].subject
  );
  const [headline, setHeadline] = useState(
    initialAudience === 'by-order-status' ? PRESET_TEMPLATES[0].headline : PRESET_TEMPLATES[3].headline
  );
  const [message, setMessage] = useState(
    initialAudience === 'by-order-status' ? PRESET_TEMPLATES[0].body : PRESET_TEMPLATES[3].body
  );
  const [ctaText, setCtaText] = useState(
    initialAudience === 'by-order-status' ? PRESET_TEMPLATES[0].ctaText : PRESET_TEMPLATES[3].ctaText
  );
  const [ctaUrl, setCtaUrl] = useState(
    initialAudience === 'by-order-status' ? PRESET_TEMPLATES[0].ctaUrl : PRESET_TEMPLATES[3].ctaUrl
  );
  const [includeCta, setIncludeCta] = useState(true);

  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sendResult, setSendResult] = useState<{
    sentCount: number;
    totalCount: number;
  } | null>(null);

  // Set default audience if users were pre-selected or initialAudience provided
  useEffect(() => {
    if (initialAudience) {
      setAudience(initialAudience);
      if (initialAudience === 'by-order-status') {
        setSelectedTemplate('order-update-prep');
        const tmpl = PRESET_TEMPLATES[0];
        setBadgeText(tmpl.badge);
        setSubject(tmpl.subject);
        setHeadline(tmpl.headline);
        setMessage(tmpl.body);
        setCtaText(tmpl.ctaText);
        setCtaUrl(tmpl.ctaUrl);
      }
    } else if (selectedUsers && selectedUsers.length > 0) {
      setAudience('selected');
    } else {
      setAudience('all');
    }
    if (initialOrderStatuses && initialOrderStatuses.length > 0) {
      setSelectedOrderStatuses(initialOrderStatuses);
    }
    setSendResult(null);
  }, [isOpen, selectedUsers, initialAudience, initialOrderStatuses]);

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

  // Helper to match an order against selected status filters
  const isOrderMatchingStatuses = (order: Order, statuses: string[]) => {
    if (!order || statuses.length === 0) return false;
    const s = (order.orderStatus || '').toLowerCase().trim();
    return statuses.some((targetStatus) => {
      const t = targetStatus.toLowerCase().trim();
      if (t === 'all-active') {
        return (
          s.includes('placed') ||
          s.includes('confirm') ||
          s.includes('process') ||
          s.includes('pack') ||
          s.includes('ship') ||
          s.includes('dispatch') ||
          s.includes('transit')
        );
      }
      if (t === 'order placed') {
        return s.includes('placed') || s.includes('confirm') || s === 'pending';
      }
      if (t === 'processing') {
        return s.includes('process') || s.includes('pack');
      }
      if (t === 'shipped') {
        return s.includes('ship') || s.includes('dispatch') || s.includes('transit') || s.includes('out for delivery');
      }
      if (t === 'delivered') {
        return s.includes('deliver');
      }
      if (t === 'cancelled') {
        return s.includes('cancel') || s.includes('refund') || s.includes('return');
      }
      return s === t;
    });
  };

  // Orders matching chosen statuses
  const matchingOrderStatusOrders = useMemo(() => {
    if (audience !== 'by-order-status' || selectedOrderStatuses.length === 0) {
      return [];
    }
    return orders.filter((o) => isOrderMatchingStatuses(o, selectedOrderStatuses));
  }, [orders, audience, selectedOrderStatuses]);

  // Order status recipients: Combines registered accounts & guest checkouts with deduplication
  const orderStatusRecipients = useMemo(() => {
    if (audience !== 'by-order-status') return [];

    const emailMap = new Map<
      string,
      {
        email: string;
        name: string;
        orderIds: string[];
        orderNumbers: string[];
        statuses: string[];
        user?: User;
      }
    >();

    const userByEmail = new Map<string, User>();
    allUsers.forEach((u) => {
      if (u.email) {
        userByEmail.set(u.email.toLowerCase().trim(), u);
      }
    });

    matchingOrderStatusOrders.forEach((o) => {
      const rawEmail = (
        o.customer?.email ||
        (o as any).customerEmail ||
        (o as any).email ||
        (o.customer?.shippingAddress as any)?.email ||
        (o as any).shippingAddress?.email ||
        ''
      )
        .toString()
        .trim()
        .toLowerCase();

      if (!rawEmail || !rawEmail.includes('@')) return;

      if (
        !isCurrentSuperAdmin &&
        (superAdminEmails.has(rawEmail) || userByEmail.get(rawEmail)?.role === 'super_admin')
      ) {
        return;
      }

      const rawName = (
        o.customer?.name ||
        (o as any).customerName ||
        o.customer?.shippingAddress?.fullName ||
        (o as any).shippingAddress?.fullName ||
        userByEmail.get(rawEmail)?.name ||
        'Valued Customer'
      )
        .toString()
        .trim();

      const orderNum = o.orderNumber || o.id;
      const statusLabel = o.orderStatus || 'Order Placed';

      if (!emailMap.has(rawEmail)) {
        emailMap.set(rawEmail, {
          email: rawEmail,
          name: rawName || 'Valued Customer',
          orderIds: [o.id],
          orderNumbers: [orderNum],
          statuses: [statusLabel],
          user: userByEmail.get(rawEmail),
        });
      } else {
        const item = emailMap.get(rawEmail)!;
        if (!item.orderIds.includes(o.id)) {
          item.orderIds.push(o.id);
          item.orderNumbers.push(orderNum);
        }
        if (!item.statuses.includes(statusLabel)) {
          item.statuses.push(statusLabel);
        }
      }
    });

    return Array.from(emailMap.values()).map((entry) => {
      return {
        ...(entry.user || {
          id: `cust-${entry.email.replace(/[^a-z0-9]/gi, '')}`,
          email: entry.email,
          name: entry.name,
          role: 'customer' as const,
          createdAt: new Date().toISOString(),
        }),
        name: entry.name,
        email: entry.email,
        matchingOrderNumbers: entry.orderNumbers,
        matchingOrderStatuses: entry.statuses,
      } as User & { matchingOrderNumbers?: string[]; matchingOrderStatuses?: string[] };
    });
  }, [audience, matchingOrderStatusOrders, allUsers, isCurrentSuperAdmin, superAdminEmails]);

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
      case 'by-order-status':
        return orderStatusRecipients;
      case 'zero-orders':
        return validUsers.filter((u) => {
          const ordCount = (userOrderCounts.get(u.email.toLowerCase().trim()) || 0) + (u.id ? (userOrderCounts.get(u.id) || 0) : 0);
          return ordCount === 0;
        });
      case 'all':
      default:
        return validUsers;
    }
  }, [audience, selectedUsers, allUsers, userOrderCounts, orderStatusRecipients, isCurrentSuperAdmin, superAdminEmails]);

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

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
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
                    onClick={() => {
                      setAudience('by-order-status');
                      if (selectedOrderStatuses.length === 0) {
                        setSelectedOrderStatuses(['Order Placed', 'Processing', 'Shipped']);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer relative ${
                      audience === 'by-order-status'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white dark:bg-[#0a1f18] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-400'
                    }`}
                  >
                    <div className="text-[11px] flex items-center justify-between">
                      <span>By Order Status</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-200 font-bold uppercase">
                        New
                      </span>
                    </div>
                    <div className="text-base font-black">
                      {orderStatusRecipients.length}
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

                {/* Sub-Panel: Order Status Filter Controls (Only shown when by-order-status is selected) */}
                {audience === 'by-order-status' && (
                  <div className="p-4 bg-white dark:bg-[#091812] rounded-2xl border border-emerald-900/15 dark:border-emerald-800/40 space-y-3.5 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-2.5">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-50 flex items-center gap-1.5">
                          <Filter className="w-3.5 h-3.5 text-emerald-700" />
                          Filter by Order Status
                        </span>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          Aggregates both registered accounts and guest checkout customers. Deduplicated by email.
                        </p>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrderStatuses(['Order Placed', 'Processing', 'Shipped']);
                            handleTemplateChange('order-update-prep');
                          }}
                          className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-200 font-bold hover:bg-emerald-100 cursor-pointer"
                        >
                          All Active Orders
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrderStatuses(['Shipped']);
                            handleTemplateChange('order-transit');
                          }}
                          className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border border-blue-200 font-bold hover:bg-blue-100 cursor-pointer"
                        >
                          Shipped (In Transit)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrderStatuses(['Delivered']);
                            handleTemplateChange('order-care-delivered');
                          }}
                          className="px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 border border-teal-200 font-bold hover:bg-teal-100 cursor-pointer"
                        >
                          Delivered Only
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrderStatuses(['Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']);
                          }}
                          className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 cursor-pointer"
                        >
                          Select All
                        </button>
                      </div>
                    </div>

                    {/* Status Checkbox Chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                      {[
                        {
                          key: 'Order Placed',
                          label: 'Order Placed',
                          badge: 'New Order',
                          color: 'text-amber-800 bg-amber-50 border-amber-200',
                          count: orders.filter((o) => (o.orderStatus || '').toLowerCase().includes('placed') || (o.orderStatus || '').toLowerCase().includes('confirm') || (o.orderStatus || '').toLowerCase().includes('pending')).length,
                        },
                        {
                          key: 'Processing',
                          label: 'Processing',
                          badge: 'Nursery Packing',
                          color: 'text-blue-800 bg-blue-50 border-blue-200',
                          count: orders.filter((o) => (o.orderStatus || '').toLowerCase().includes('process') || (o.orderStatus || '').toLowerCase().includes('pack')).length,
                        },
                        {
                          key: 'Shipped',
                          label: 'Shipped',
                          badge: 'In Transit',
                          color: 'text-indigo-800 bg-indigo-50 border-indigo-200',
                          count: orders.filter((o) => (o.orderStatus || '').toLowerCase().includes('ship') || (o.orderStatus || '').toLowerCase().includes('dispatch') || (o.orderStatus || '').toLowerCase().includes('transit')).length,
                        },
                        {
                          key: 'Delivered',
                          label: 'Delivered',
                          badge: 'Doorstep Arrival',
                          color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
                          count: orders.filter((o) => (o.orderStatus || '').toLowerCase().includes('deliver')).length,
                        },
                        {
                          key: 'Cancelled',
                          label: 'Cancelled',
                          badge: 'Void / Refund',
                          color: 'text-rose-800 bg-rose-50 border-rose-200',
                          count: orders.filter((o) => (o.orderStatus || '').toLowerCase().includes('cancel') || (o.orderStatus || '').toLowerCase().includes('refund')).length,
                        },
                      ].map((item) => {
                        const isChecked = selectedOrderStatuses.includes(item.key);
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => {
                              setSelectedOrderStatuses((prev) => {
                                if (prev.includes(item.key)) {
                                  return prev.filter((s) => s !== item.key);
                                } else {
                                  return [...prev, item.key];
                                }
                              });
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isChecked
                                ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-600 ring-2 ring-emerald-500/20'
                                : 'bg-gray-50/60 dark:bg-[#071711] border-gray-200 dark:border-gray-800 opacity-75 hover:opacity-100'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${isChecked ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-300 bg-white'}`}>
                                  {isChecked && <Check className="w-2.5 h-2.5" />}
                                </span>
                                <span>{item.label}</span>
                              </span>
                              <span className="text-[11px] font-black text-gray-600 dark:text-gray-300">
                                {item.count}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-500 mt-1 truncate">
                              {item.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Live Metric Banner & Expandable Preview Toggle */}
                    <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/80 dark:border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="text-emerald-950 dark:text-emerald-100 font-semibold">
                          Targeting <strong>{orderStatusRecipients.length}</strong> unique customer{orderStatusRecipients.length === 1 ? '' : 's'} across <strong>{matchingOrderStatusOrders.length}</strong> matching order{matchingOrderStatusOrders.length === 1 ? '' : 's'}.
                        </span>
                      </div>

                      {orderStatusRecipients.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowRecipientPreview(!showRecipientPreview)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 hover:underline cursor-pointer shrink-0"
                        >
                          <span>{showRecipientPreview ? 'Hide Recipient List' : 'Inspect Recipient Preview'}</span>
                          {showRecipientPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    {/* Expandable Recipient Detail Drawer */}
                    {showRecipientPreview && orderStatusRecipients.length > 0 && (
                      <div className="max-h-48 overflow-y-auto border border-emerald-200 dark:border-emerald-800/50 rounded-xl bg-white dark:bg-[#071711] p-2 space-y-1 text-xs">
                        {orderStatusRecipients.map((r: any, idx) => (
                          <div
                            key={r.email || idx}
                            className="p-2 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-100 dark:border-gray-800 last:border-0"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <div>
                                <strong className="text-gray-900 dark:text-gray-100">{r.name}</strong>
                                <span className="text-gray-500 text-[11px] ml-1.5 font-mono">({r.email})</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 text-[11px]">
                              {Array.isArray(r.matchingOrderNumbers) && r.matchingOrderNumbers.map((num: string) => (
                                <span
                                  key={num}
                                  className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-[10px] font-bold"
                                >
                                  #{num}
                                </span>
                              ))}
                              {Array.isArray(r.matchingOrderStatuses) && r.matchingOrderStatuses.map((st: string) => (
                                <span
                                  key={st}
                                  className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold"
                                >
                                  {st}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Recipient Chips Preview (for non order-status or quick overview) */}
                {audience !== 'by-order-status' && (
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
                )}

                {/* Anti-Spam Deliverability Safeguard Badge */}
                <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/70 dark:border-emerald-800/40 flex items-center gap-2 text-[11px] text-emerald-900 dark:text-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    <strong>Anti-Spam Protected:</strong> Includes RFC 8058 One-Click Unsubscribe, verified sender alignment (<code className="font-mono">mannaratharayil@gmail.com</code>), and delivery throttling (180ms delay per email) to ensure primary inbox delivery.
                  </span>
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
