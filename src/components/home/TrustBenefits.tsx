import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Box,
  Truck,
  BookOpen,
  Heart,
  Leaf,
  Award,
  Clock,
  CheckCircle2,
  Phone,
  Zap,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  ArrowRight,
  X,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { TrustBenefitItem } from '../../types';
import { initialTrustBenefits } from '../../data/initialData';

// Available Lucide Icons for selection
const ICON_MAP: Record<string, React.ElementType> = {
  ShieldCheck,
  Sparkles,
  Box,
  Truck,
  BookOpen,
  Heart,
  Leaf,
  Award,
  Clock,
  CheckCircle2,
  Phone,
  Zap,
  Shield,
};

const COLOR_STYLES: Record<string, string> = {
  emerald: 'text-emerald-700 bg-emerald-50 border border-emerald-100',
  amber: 'text-amber-600 bg-amber-50 border border-amber-100',
  green: 'text-emerald-800 bg-green-50 border border-green-100',
  cyan: 'text-cyan-700 bg-cyan-50 border border-cyan-100',
  rose: 'text-rose-600 bg-rose-50 border border-rose-100',
  blue: 'text-blue-700 bg-blue-50 border border-blue-100',
  purple: 'text-purple-700 bg-purple-50 border border-purple-100',
};

const COLOR_OPTIONS = [
  { id: 'emerald', label: 'Emerald', bgClass: 'bg-emerald-500' },
  { id: 'amber', label: 'Amber Gold', bgClass: 'bg-amber-500' },
  { id: 'green', label: 'Leaf Green', bgClass: 'bg-green-600' },
  { id: 'cyan', label: 'Cyan Teal', bgClass: 'bg-cyan-500' },
  { id: 'rose', label: 'Rose Pink', bgClass: 'bg-rose-500' },
  { id: 'blue', label: 'Royal Blue', bgClass: 'bg-blue-500' },
  { id: 'purple', label: 'Violet', bgClass: 'bg-purple-500' },
];

export const TrustBenefits: React.FC = () => {
  const { storeSettings, updateStoreSettings, isAdminAuthenticated, addToast } = useStore();
  const whatsapp = storeSettings?.whatsapp || storeSettings?.whatsappNumber || '+91 88482 76403';

  // Benefits list from storeSettings or default seed
  const benefits: TrustBenefitItem[] =
    storeSettings?.trustBenefits && Array.isArray(storeSettings.trustBenefits) && storeSettings.trustBenefits.length > 0
      ? storeSettings.trustBenefits
      : initialTrustBenefits;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TrustBenefitItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<TrustBenefitItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIconName, setFormIconName] = useState('ShieldCheck');
  const [formColor, setFormColor] = useState('emerald');

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormDescription('');
    setFormIconName('ShieldCheck');
    setFormColor('emerald');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: TrustBenefitItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormIconName(item.iconName || 'ShieldCheck');
    setFormColor(item.color || 'emerald');
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSaveBenefit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      addToast({
        title: 'Title Required',
        message: 'Please enter a title for the benefit item.',
        type: 'warning',
      });
      return;
    }

    let updatedList: TrustBenefitItem[];

    if (editingItem) {
      updatedList = benefits.map((b) =>
        b.id === editingItem.id
          ? {
              ...b,
              title: formTitle.trim(),
              description: formDescription.trim(),
              iconName: formIconName,
              color: formColor,
            }
          : b
      );
      addToast({
        title: 'Benefit Updated 🌿',
        message: `"${formTitle.trim()}" updated successfully.`,
        type: 'success',
      });
    } else {
      const newItem: TrustBenefitItem = {
        id: `benefit-${Date.now()}`,
        title: formTitle.trim(),
        description: formDescription.trim(),
        iconName: formIconName,
        color: formColor,
      };
      updatedList = [...benefits, newItem];
      addToast({
        title: 'Benefit Added 🌿',
        message: `"${formTitle.trim()}" added to the benefits bar.`,
        type: 'success',
      });
    }

    updateStoreSettings({ trustBenefits: updatedList });
    setIsModalOpen(false);
  };

  // Delete Benefit
  const handleDeleteBenefit = (item: TrustBenefitItem) => {
    const updatedList = benefits.filter((b) => b.id !== item.id);
    updateStoreSettings({ trustBenefits: updatedList });
    addToast({
      title: 'Benefit Removed',
      message: `"${item.title}" removed from the benefits bar.`,
      type: 'info',
    });
    setItemToDelete(null);
  };

  // Reorder Benefit (move left or right)
  const handleMoveBenefit = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= benefits.length) return;

    const updatedList = [...benefits];
    const [moved] = updatedList.splice(index, 1);
    updatedList.splice(targetIndex, 0, moved);

    updateStoreSettings({ trustBenefits: updatedList });
    addToast({
      title: 'Order Updated 🔄',
      message: `Moved "${moved.title}" to position #${targetIndex + 1}.`,
      type: 'success',
    });
  };

  // Reset to default benefits
  const handleResetDefaults = () => {
    if (window.confirm('Reset the Trust Benefits Bar to original nursery defaults?')) {
      updateStoreSettings({ trustBenefits: initialTrustBenefits });
      addToast({
        title: 'Defaults Restored',
        message: 'Trust benefits reset to original 7Seasons defaults.',
        type: 'info',
      });
    }
  };

  return (
    <section className="py-6 sm:py-10 bg-emerald-50/40 border-b border-emerald-900/8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* ADMIN BAR (Only visible to logged-in nursery administrators) */}
        {isAdminAuthenticated && (
          <div className="bg-amber-50/90 border border-amber-300/80 rounded-2xl p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Trust Benefits Bar (Admin Controls)</span>
              </span>
              <span className="text-[11px] text-amber-700/80 hidden md:inline">
                • {benefits.length} items active
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors cursor-pointer border border-amber-200 flex items-center gap-1"
                title="Reset benefits to default 7Seasons values"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-4 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Benefit</span>
              </button>
            </div>
          </div>
        )}

        {/* BENEFITS CARDS GRID */}
        {benefits.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-xs text-gray-500">No trust benefits configured.</p>
            {isAdminAuthenticated && (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="mt-3 px-4 py-2 bg-emerald-800 text-white rounded-full text-xs font-bold cursor-pointer hover:bg-emerald-900"
              >
                Add Your First Benefit
              </button>
            )}
          </div>
        ) : (
          <div
            className={`grid gap-2.5 sm:gap-5 ${
              benefits.length === 1
                ? 'grid-cols-1 max-w-md mx-auto'
                : benefits.length === 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
                : benefits.length === 3
                ? 'grid-cols-1 sm:grid-cols-3'
                : benefits.length === 4
                ? 'grid-cols-2 lg:grid-cols-4'
                : 'grid-cols-2 lg:grid-cols-5'
            }`}
          >
            {benefits.map((benefit, idx) => {
              const IconComponent = ICON_MAP[benefit.iconName] || ShieldCheck;
              const colorClass = COLOR_STYLES[benefit.color || 'emerald'] || COLOR_STYLES.emerald;
              const isLastOnMobile = idx === benefits.length - 1 && benefits.length % 2 !== 0;

              // Format description if it contains dynamic whatsapp
              const renderedDesc = benefit.description.replace('{whatsapp}', whatsapp);

              return (
                <div
                  key={benefit.id || idx}
                  className={`p-3.5 sm:p-5 rounded-2xl bg-white border border-emerald-900/8 hover:border-emerald-500/40 hover:shadow-md transition-all duration-300 flex flex-col items-start relative group ${
                    isLastOnMobile ? 'col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  {/* ADMIN ACTION OVERLAY BUTTONS (Edit, Delete, Move) */}
                  {isAdminAuthenticated && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs p-1 rounded-xl shadow-xs border border-gray-200 z-10">
                      <button
                        type="button"
                        onClick={() => handleMoveBenefit(idx, 'left')}
                        disabled={idx === 0}
                        className={`p-1 rounded-md transition-colors ${
                          idx === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
                        }`}
                        title="Move Left"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveBenefit(idx, 'right')}
                        disabled={idx === benefits.length - 1}
                        className={`p-1 rounded-md transition-colors ${
                          idx === benefits.length - 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
                        }`}
                        title="Move Right"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(benefit)}
                        className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                        title="Edit Benefit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setItemToDelete(benefit)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Delete Benefit"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Icon badge */}
                  <div
                    className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-2.5 sm:mb-3.5 ${colorClass}`}
                  >
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm text-emerald-950 mb-1 leading-snug">
                    {benefit.title}
                  </h3>

                  <p className="text-[11px] sm:text-xs text-gray-600 leading-normal sm:leading-relaxed font-normal">
                    {renderedDesc}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE / EDIT BENEFIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 border border-gray-200 shadow-2xl animate-fade-in my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    {editingItem ? 'Edit Trust Benefit' : 'Add New Trust Benefit'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Appears in the 7Seasons trust badge section on the Home Page
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBenefit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-800 block mb-1">Benefit Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. 100% Transit Live Plant Guarantee"
                  className="w-full px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Description / Subtitle</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Robust root systems nurtured at Mannaratharayil Gardens LLP with damage-free dispatch."
                  className="w-full px-3.5 py-2 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                />
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Tip: You can include &#123;whatsapp&#125; to automatically display your nursery WhatsApp number.
                </p>
              </div>

              {/* Icon Selector */}
              <div>
                <label className="font-bold text-gray-800 block mb-1.5">Select Icon</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {Object.keys(ICON_MAP).map((iconKey) => {
                    const CurrentIcon = ICON_MAP[iconKey];
                    const isSelected = formIconName === iconKey;
                    return (
                      <button
                        type="button"
                        key={iconKey}
                        onClick={() => setFormIconName(iconKey)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold shadow-2xs'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <CurrentIcon className="w-4 h-4" />
                        <span className="text-[9px] truncate max-w-full">{iconKey}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="font-bold text-gray-800 block mb-1.5">Color Accent</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((col) => {
                    const isSelected = formColor === col.id;
                    return (
                      <button
                        type="button"
                        key={col.id}
                        onClick={() => setFormColor(col.id)}
                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer text-xs ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-950 shadow-2xs'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${col.bgClass}`} />
                        <span>{col.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Live Card Preview
                </span>
                <div className="p-3.5 rounded-xl bg-white border border-emerald-900/10 shadow-2xs flex flex-col items-start">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${
                      COLOR_STYLES[formColor] || COLOR_STYLES.emerald
                    }`}
                  >
                    {React.createElement(ICON_MAP[formIconName] || ShieldCheck, { className: 'w-4 h-4' })}
                  </div>
                  <h4 className="font-bold text-xs text-emerald-950 mb-0.5">
                    {formTitle || 'Benefit Title Preview'}
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-snug">
                    {formDescription || 'Detailed benefit explanation will appear here.'}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {editingItem ? 'Save Updates' : 'Add Benefit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-gray-200 shadow-2xl animate-fade-in text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">Delete Benefit?</h3>
              <p className="text-xs text-gray-600 mt-1">
                Are you sure you want to remove <strong className="text-gray-900">&quot;{itemToDelete.title}&quot;</strong> from the Home Page trust benefits bar?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteBenefit(itemToDelete)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold text-xs cursor-pointer shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
