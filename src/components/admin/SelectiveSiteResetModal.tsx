import React, { useState } from 'react';
import {
  ShieldAlert,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Package,
  Tag,
  Truck,
  Users,
  Video,
  BookOpen,
  X,
  RefreshCw,
  Lock,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface SelectiveSiteResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ResetOptionKey = 'orders' | 'combos' | 'categories' | 'products' | 'users' | 'reels' | 'blogs';

interface ResetOptionConfig {
  key: ResetOptionKey;
  label: string;
  description: string;
  icon: any;
  getCount: (store: any) => number;
  color: string;
}

const RESET_OPTIONS: ResetOptionConfig[] = [
  {
    key: 'orders',
    label: 'Existing Customer Orders',
    description: 'Purges all orders from database, tracking logs, and admin dashboards.',
    icon: Truck,
    getCount: (s) => (s.orders || []).length,
    color: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  {
    key: 'combos',
    label: 'Curated Combo Bundles',
    description: 'Purges all combo pack listings, bundle specs, and combos catalog.',
    icon: Layers,
    getCount: (s) => (s.combos || []).length,
    color: 'text-rose-700 bg-rose-50 border-rose-200',
  },
  {
    key: 'categories',
    label: 'Site Categories',
    description: 'Purges all plant and combo categories across homepage and catalog.',
    icon: Tag,
    getCount: (s) => (s.categories || []).length,
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  {
    key: 'products',
    label: 'Plant Catalog (Products)',
    description: 'Purges all individual plants, botanical attributes, and plant pricing.',
    icon: Package,
    getCount: (s) => (s.products || []).length,
    color: 'text-green-700 bg-green-50 border-green-200',
  },
  {
    key: 'users',
    label: 'Registered Customer Accounts',
    description: 'Purges customer user accounts and saved addresses (Admin accounts are preserved).',
    icon: Users,
    getCount: (s) => (s.registeredUsers || []).length,
    color: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  {
    key: 'reels',
    label: 'Instagram Reels Media',
    description: 'Purges all video reels and associated social feed records.',
    icon: Video,
    getCount: (s) => (s.instagramReels || []).length,
    color: 'text-purple-700 bg-purple-50 border-purple-200',
  },
  {
    key: 'blogs',
    label: 'Botanical Blogs & Guides',
    description: 'Purges all gardening blog posts, articles, and nursery guides.',
    icon: BookOpen,
    getCount: (s) => (s.blogs || []).length,
    color: 'text-teal-700 bg-teal-50 border-teal-200',
  },
];

export const SelectiveSiteResetModal: React.FC<SelectiveSiteResetModalProps> = ({
  isOpen,
  onClose,
}) => {
  const store = useStore();
  const { isCurrentSuperAdmin, selectiveResetSiteData, addToast } = store;

  const [selectedKeys, setSelectedKeys] = useState<Set<ResetOptionKey>>(new Set());
  const [confirmInput, setConfirmInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const toggleOption = (key: ResetOptionKey) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedKeys(new Set(RESET_OPTIONS.map((o) => o.key)));
  };

  const clearSelection = () => {
    setSelectedKeys(new Set());
  };

  const handleResetConfirm = async () => {
    if (!isCurrentSuperAdmin) {
      addToast({
        title: 'Unauthorized Action',
        message: 'Only Super Administrators can perform site resets.',
        type: 'error',
      });
      return;
    }

    if (selectedKeys.size === 0) {
      addToast({
        title: 'No Items Selected',
        message: 'Please choose at least one category to reset.',
        type: 'warning',
      });
      return;
    }

    if (confirmInput.trim().toUpperCase() !== 'RESET') {
      addToast({
        title: 'Confirmation Mismatch',
        message: 'Please type the word RESET to confirm.',
        type: 'error',
      });
      return;
    }

    try {
      setIsProcessing(true);
      const chosenArray = Array.from(selectedKeys);
      const result = await selectiveResetSiteData(chosenArray);

      addToast({
        title: 'Site Reset Complete ⚠️',
        message: `Successfully cleared ${chosenArray.length} category/categories from database.`,
        type: 'success',
      });

      setSelectedKeys(new Set());
      setConfirmInput('');
      onClose();
    } catch (err: any) {
      console.error('[Selective Site Reset Error]:', err);
      addToast({
        title: 'Site Reset Failed',
        message: err.message || 'An error occurred during database purging.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isConfirmed = confirmInput.trim().toUpperCase() === 'RESET' && selectedKeys.size > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 border border-rose-200 shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-rose-950">
                  Selective Site Data Reset
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Choose which data collections to purge from the database and local state.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-xl hover:bg-gray-100 cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Protected Assets Banner */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-[11px] text-emerald-950 space-y-0.5 leading-relaxed">
              <strong className="text-emerald-900 font-bold block">100% Protected Assets (Never Modified):</strong>
              <p className="text-emerald-900/80">
                Store Settings & Nursery Info, Razorpay Credentials, Gmail SMTP Passwords, Gemini API Keys, and Super Admin accounts are never affected.
              </p>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-gray-700">
              Select What to Reset ({selectedKeys.size} of {RESET_OPTIONS.length} selected):
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 hover:underline cursor-pointer"
              >
                Select All
              </button>
              <span className="text-gray-300">•</span>
              <button
                type="button"
                onClick={clearSelection}
                className="text-[11px] font-bold text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Options Grid */}
          <div className="space-y-2">
            {RESET_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedKeys.has(opt.key);
              const count = opt.getCount(store);

              return (
                <div
                  key={opt.key}
                  onClick={() => toggleOption(opt.key)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-rose-400 bg-rose-50/60 ring-2 ring-rose-500/20 shadow-xs'
                      : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                        isSelected
                          ? 'bg-rose-600 border-rose-600 text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${opt.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold truncate ${
                            isSelected ? 'text-rose-950' : 'text-gray-900'
                          }`}
                        >
                          {opt.label}
                        </span>
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-white border border-gray-200 text-gray-700">
                          {count} item{count === 1 ? '' : 's'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                        {opt.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="text-[10px] uppercase font-black text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full shrink-0 border border-rose-200">
                      Will Purge
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Confirmation Guard Section */}
          <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-rose-950">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Confirm Data Purge Action</span>
            </div>
            <p className="text-[11px] text-rose-900/80 leading-relaxed">
              This will permanently delete the selected collections from your Firebase Firestore database and local storage. This action cannot be undone.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-rose-950 mb-1">
                To confirm, type <span className="font-mono text-rose-700 uppercase bg-rose-100 px-1 py-0.5 rounded">RESET</span> below:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="Type RESET"
                disabled={isProcessing || selectedKeys.size === 0}
                className="w-full px-3.5 py-2 bg-white text-rose-950 font-mono text-xs font-bold rounded-xl border border-rose-300 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 outline-hidden uppercase"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-gray-500">
            {selectedKeys.size === 0
              ? 'No items selected'
              : `${selectedKeys.size} category/categories selected for purge`}
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleResetConfirm}
              disabled={!isConfirmed || isProcessing}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-black shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Purging Selected Collections...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Purge Selected ({selectedKeys.size})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
