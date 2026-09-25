import React, { useState } from 'react';
import {
  Ticket,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  Search,
  Filter,
  AlertCircle,
  Calendar,
  Sparkles,
  Layers,
  ShoppingBag,
  Percent,
  CheckCircle2,
  X,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Coupon } from '../../types';
import { useStore } from '../../context/StoreContext';

export const CouponsManagementTab: React.FC = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon, addToast } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'percentage' | 'fixed'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDiscountType, setFormDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [formDiscountValue, setFormDiscountValue] = useState<number>(10);
  const [formMinOrderValue, setFormMinOrderValue] = useState<number>(499);
  const [formMaxDiscount, setFormMaxDiscount] = useState<number | undefined>(150);
  const [formStartDate, setFormStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formExpiryDate, setFormExpiryDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [formUsageLimit, setFormUsageLimit] = useState<number>(500);
  const [formPerUserLimit, setFormPerUserLimit] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formCombosOnly, setFormCombosOnly] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast({
      title: 'Code Copied',
      message: `Coupon code ${code} copied to clipboard!`,
      type: 'info',
    });
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setFormCode('');
    setFormDescription('');
    setFormDiscountType('percentage');
    setFormDiscountValue(10);
    setFormMinOrderValue(499);
    setFormMaxDiscount(150);
    setFormStartDate(new Date().toISOString().split('T')[0]);
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setFormExpiryDate(d.toISOString().split('T')[0]);
    setFormUsageLimit(500);
    setFormPerUserLimit(1);
    setFormIsActive(true);
    setFormCombosOnly(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormCode(coupon.code);
    setFormDescription(coupon.description);
    setFormDiscountType(coupon.discountType);
    setFormDiscountValue(coupon.discountValue);
    setFormMinOrderValue(coupon.minOrderValue);
    setFormMaxDiscount(coupon.maxDiscount);
    setFormStartDate(coupon.startDate || new Date().toISOString().split('T')[0]);
    setFormExpiryDate(coupon.expiryDate);
    setFormUsageLimit(coupon.usageLimit);
    setFormPerUserLimit(coupon.perUserLimit || 1);
    setFormIsActive(coupon.isActive);
    setFormCombosOnly(coupon.applicableCombosOnly || false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanCode = formCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!cleanCode) {
      setFormError('Please enter a valid uppercase coupon code (letters, numbers, hyphens).');
      return;
    }

    if (!formDescription.trim()) {
      setFormError('Please enter a description for this coupon promotion.');
      return;
    }

    if (formDiscountValue <= 0) {
      setFormError('Discount value must be greater than 0.');
      return;
    }

    if (formDiscountType === 'percentage' && formDiscountValue > 100) {
      setFormError('Percentage discount cannot exceed 100%.');
      return;
    }

    // Check duplicate code if creating or changing code
    const isDuplicate = coupons.some(
      (c) => c.code.toLowerCase() === cleanCode.toLowerCase() && c.id !== editingCoupon?.id
    );
    if (isDuplicate) {
      setFormError(`A coupon with code "${cleanCode}" already exists. Please choose a unique code.`);
      return;
    }

    try {
      if (editingCoupon) {
        const updated: Coupon = {
          ...editingCoupon,
          code: cleanCode,
          description: formDescription.trim(),
          discountType: formDiscountType,
          discountValue: Number(formDiscountValue),
          minOrderValue: Number(formMinOrderValue) || 0,
          maxDiscount: formDiscountType === 'percentage' && formMaxDiscount ? Number(formMaxDiscount) : undefined,
          startDate: formStartDate,
          expiryDate: formExpiryDate,
          usageLimit: Number(formUsageLimit) || 100,
          perUserLimit: Number(formPerUserLimit) || 1,
          isActive: formIsActive,
          applicableCombosOnly: formCombosOnly,
        };
        await updateCoupon(updated);
        addToast({
          title: 'Coupon Updated',
          message: `Coupon ${cleanCode} has been saved.`,
          type: 'success',
        });
      } else {
        const newCoupon: Omit<Coupon, 'id' | 'usedCount'> = {
          code: cleanCode,
          description: formDescription.trim(),
          discountType: formDiscountType,
          discountValue: Number(formDiscountValue),
          minOrderValue: Number(formMinOrderValue) || 0,
          maxDiscount: formDiscountType === 'percentage' && formMaxDiscount ? Number(formMaxDiscount) : undefined,
          startDate: formStartDate,
          expiryDate: formExpiryDate,
          usageLimit: Number(formUsageLimit) || 100,
          perUserLimit: Number(formPerUserLimit) || 1,
          isActive: formIsActive,
          applicableCombosOnly: formCombosOnly,
        };
        await addCoupon(newCoupon);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save coupon.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;
    try {
      const code = couponToDelete.code;
      await deleteCoupon(couponToDelete.id);
      addToast({
        title: 'Coupon Removed',
        message: `Coupon code "${code}" has been permanently removed.`,
        type: 'info',
      });
      setCouponToDelete(null);
    } catch (err: any) {
      console.error('Failed to remove coupon:', err);
      addToast({
        title: 'Error',
        message: 'Could not remove coupon.',
        type: 'error',
      });
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const updated: Coupon = { ...coupon, isActive: !coupon.isActive };
      await updateCoupon(updated);
      addToast({
        title: updated.isActive ? 'Coupon Activated' : 'Coupon Deactivated',
        message: `Coupon ${coupon.code} is now ${updated.isActive ? 'active' : 'inactive'}.`,
        type: updated.isActive ? 'success' : 'info',
      });
    } catch (err) {
      console.error('Error toggling coupon status:', err);
    }
  };

  // Filtered coupons
  const filteredCoupons = coupons.filter((coupon) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      coupon.code.toLowerCase().includes(q) ||
      coupon.description.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && coupon.isActive) ||
      (statusFilter === 'inactive' && !coupon.isActive);

    const matchesType =
      typeFilter === 'all' || coupon.discountType === typeFilter;

    return matchesQuery && matchesStatus && matchesType;
  });

  // Calculate metrics
  const activeCount = coupons.filter((c) => c.isActive).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  const isExpired = (expiryDateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return expiryDateString < today;
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Ticket className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-emerald-950">Store Coupons & Discounts</h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {coupons.length} Total
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Create promotional coupon codes for customers, set percentage or flat rupee discounts, and remove any existing coupons anytime.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Coupon</span>
          </button>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100 text-xs">
          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <span className="text-gray-500 block text-[11px]">Total Coupons</span>
            <span className="text-lg font-black text-emerald-950">{coupons.length}</span>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <span className="text-gray-500 block text-[11px]">Active Promo Codes</span>
            <span className="text-lg font-black text-emerald-700">{activeCount}</span>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <span className="text-gray-500 block text-[11px]">Inactive / Paused</span>
            <span className="text-lg font-black text-gray-700">{coupons.length - activeCount}</span>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <span className="text-gray-500 block text-[11px]">Total Redemptions</span>
            <span className="text-lg font-black text-amber-700">{totalRedemptions}</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coupon by code (e.g. WELCOME10) or description..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 text-gray-900 rounded-full border border-gray-200 text-xs focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3.5 py-2 bg-gray-50 text-gray-700 rounded-full border border-gray-200 text-xs font-semibold focus:bg-white outline-hidden cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3.5 py-2 bg-gray-50 text-gray-700 rounded-full border border-gray-200 text-xs font-semibold focus:bg-white outline-hidden cursor-pointer"
            >
              <option value="all">All Discount Types</option>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Flat Rupee (₹)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Coupons List / Grid */}
      {filteredCoupons.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-800 text-base">No coupons found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'No coupons match your filter criteria. Try clearing filters or search terms.'
              : 'You have not created any promo coupons yet. Click "Create New Coupon" to start offering customer discounts.'}
          </p>
          {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-bold transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((coupon) => {
            const expired = isExpired(coupon.expiryDate);
            const usagePercent = coupon.usageLimit
              ? Math.min(100, Math.round(((coupon.usedCount || 0) / coupon.usageLimit) * 100))
              : 0;

            return (
              <div
                key={coupon.id}
                className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between shadow-2xs hover:shadow-md ${
                  !coupon.isActive || expired
                    ? 'border-gray-200 opacity-80 bg-gray-50/50'
                    : 'border-emerald-200/80 hover:border-emerald-500'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Top: Code & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm tracking-wider px-3 py-1 bg-emerald-950 text-amber-300 rounded-xl shadow-2xs flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 text-amber-400" />
                        <span>{coupon.code}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(coupon.code)}
                        title="Copy coupon code"
                        className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        {copiedCode === coupon.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {expired ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                          Expired
                        </span>
                      ) : coupon.isActive ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                          Paused
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-700 font-medium leading-relaxed min-h-[32px]">
                    {coupon.description}
                  </p>

                  {/* Discount Details Pill Strip */}
                  <div className="p-3 bg-[#FAF9F6] rounded-2xl border border-[#4A3E31]/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-[11px]">Discount Value:</span>
                      <span className="font-black text-emerald-950 text-sm">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}% OFF`
                          : `₹${coupon.discountValue} FLAT OFF`}
                      </span>
                    </div>

                    {coupon.discountType === 'percentage' && coupon.maxDiscount && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-500">Max Savings Cap:</span>
                        <span className="font-bold text-gray-800">Up to ₹{coupon.maxDiscount}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-500">Min Cart Threshold:</span>
                      <span className="font-bold text-gray-800">
                        {coupon.minOrderValue > 0 ? `₹${coupon.minOrderValue}` : 'No Minimum'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-500">Applies To:</span>
                      <span className="font-semibold text-emerald-800">
                        {coupon.applicableCombosOnly ? 'Combo Bundles Only' : 'All Products & Combos'}
                      </span>
                    </div>
                  </div>

                  {/* Usage & Expiry info */}
                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span>Redemptions</span>
                      <span className="font-bold text-gray-800">
                        {coupon.usedCount || 0} / {coupon.usageLimit}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all rounded-full ${
                          usagePercent >= 100
                            ? 'bg-rose-500'
                            : usagePercent >= 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
                      <span>Expires: {coupon.expiryDate}</span>
                      <span>Per User: {coupon.perUserLimit || 1}x</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(coupon)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                      coupon.isActive
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {coupon.isActive ? 'Pause' : 'Activate'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(coupon)}
                      className="p-2 text-gray-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                      title="Edit Coupon"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCouponToDelete(coupon)}
                      className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Remove Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT COUPON MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-7 space-y-5 border border-gray-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Ticket className="w-4 h-4" />
                </span>
                <h3 className="text-base font-black text-emerald-950">
                  {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Coupon Code'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
              {/* Code & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-900 block mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                    placeholder="e.g. MONSOON20"
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 font-mono font-bold uppercase rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    Uppercase alphanumeric (e.g. FESTIVE15, COMBO50)
                  </span>
                </div>

                <div>
                  <label className="font-bold text-gray-900 block mb-1">Discount Type *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormDiscountType('percentage')}
                      className={`py-2 px-3 rounded-xl font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                        formDiscountType === 'percentage'
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Percent className="w-3.5 h-3.5" />
                      <span>Percentage (%)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormDiscountType('fixed')}
                      className={`py-2 px-3 rounded-xl font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                        formDiscountType === 'fixed'
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>₹ Flat Off</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-900 block mb-1">Promotion Description *</label>
                <input
                  type="text"
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. 15% instant discount on exotic plant bundles above ₹699"
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                />
              </div>

              {/* Discount Value & Max Cap */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-900 block mb-1">
                    {formDiscountType === 'percentage' ? 'Discount Percentage (%) *' : 'Discount Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={formDiscountType === 'percentage' ? '100' : undefined}
                    value={formDiscountValue}
                    onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-900 block mb-1">
                    Max Savings Cap (₹)
                    {formDiscountType === 'fixed' && <span className="text-gray-400 font-normal"> (N/A)</span>}
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={formDiscountType === 'fixed'}
                    value={formMaxDiscount ?? ''}
                    onChange={(e) => setFormMaxDiscount(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Optional (e.g. 200)"
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden disabled:opacity-40"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-900 block mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formMinOrderValue}
                    onChange={(e) => setFormMinOrderValue(Number(e.target.value))}
                    placeholder="0 for none"
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>
              </div>

              {/* Dates & Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-900 block mb-1">Valid From</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-900 block mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-900 block mb-1">Total Usage Cap</label>
                  <input
                    type="number"
                    min="1"
                    value={formUsageLimit}
                    onChange={(e) => setFormUsageLimit(Number(e.target.value))}
                    placeholder="e.g. 500 total uses"
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-900 block mb-1">Uses Per Customer</label>
                  <input
                    type="number"
                    min="1"
                    value={formPerUserLimit}
                    onChange={(e) => setFormPerUserLimit(Number(e.target.value))}
                    placeholder="e.g. 1 use per customer"
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formCombosOnly}
                    onChange={(e) => setFormCombosOnly(e.target.checked)}
                    className="rounded text-emerald-800 focus:ring-emerald-700 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block">Applicable to Combo Bundles Only</span>
                    <span className="text-[11px] text-gray-500">
                      When checked, this coupon discount only applies if the cart contains plant combos.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded text-emerald-800 focus:ring-emerald-700 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block">Coupon Is Active</span>
                    <span className="text-[11px] text-gray-500">
                      Customers can immediately enter and apply this code during checkout.
                    </span>
                  </div>
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCoupon ? 'Update Coupon' : 'Create Coupon'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {couponToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-gray-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-gray-900">Remove Coupon Code?</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to permanently remove coupon{' '}
                <strong className="text-emerald-950 font-mono font-bold">"{couponToDelete.code}"</strong>?
              </p>
              <p className="text-[11px] text-rose-600 pt-1">
                Customers will immediately no longer be able to use or apply this discount code.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCouponToDelete(null)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Remove Coupon</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
