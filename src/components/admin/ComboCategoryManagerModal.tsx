import React, { useState, useId } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Tag,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Upload,
  Search,
  ExternalLink,
  ChevronRight,
  FolderPlus,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types';
import { compressImageFile } from './ImageUploadPicker';

interface ComboCategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory?: (categoryName: string) => void;
}

const PRESET_COMBO_IMAGES = [
  {
    label: 'Air Purifying',
    url: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Balcony & Blooming',
    url: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Desk & Workspace',
    url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Lush Foliage Bundle',
    url: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Low Maintenance',
    url: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Hanging Sanctuary',
    url: 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=800&q=80',
  },
];

export const ComboCategoryManagerModal: React.FC<ComboCategoryManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
}) => {
  const { categories, products, combos, addCategory, updateCategory, deleteCategory, addToast } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'combo' | 'plant' | 'both'>('all');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState(PRESET_COMBO_IMAGES[0].url);
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);
  const [formIsFeatured, setFormIsFeatured] = useState(true);
  const [formType, setFormType] = useState<'combo' | 'plant' | 'both'>('combo');
  const [formError, setFormError] = useState('');

  const fileInputId = useId();

  if (!isOpen) return null;

  // Count combos assigned to each category
  const getComboCountForCategory = (catName: string) => {
    return combos.filter((c) => c.category?.trim().toLowerCase() === catName.trim().toLowerCase()).length;
  };

  // Count products assigned to each category
  const getProductCountForCategory = (catName: string) => {
    return products.filter((p) => p.category?.trim().toLowerCase() === catName.trim().toLowerCase()).length;
  };

  const filteredCategories = categories.filter((c) => {
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormName(name);
    if (!isSlugCustomized) {
      setFormSlug(slugify(name));
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormSlug('');
    setIsSlugCustomized(false);
    setFormDescription('');
    setFormImage(PRESET_COMBO_IMAGES[0].url);
    setFormDisplayOrder(categories.length + 1);
    setFormIsFeatured(true);
    setFormType('combo');
    setFormError('');
    setEditingCategory(null);
    setIsCreatingNew(false);
  };

  const handleStartCreate = () => {
    resetForm();
    setIsCreatingNew(true);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setIsSlugCustomized(true);
    setFormDescription(cat.description || '');
    setFormImage(cat.image || PRESET_COMBO_IMAGES[0].url);
    setFormDisplayOrder(cat.displayOrder || 1);
    setFormIsFeatured(cat.isFeatured ?? true);
    setFormType(cat.type || 'combo');
    setFormError('');
    setIsCreatingNew(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const dataUrl = await compressImageFile(file);
      setFormImage(dataUrl);
    } catch (err) {
      console.error('Failed to compress image:', err);
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: 'Could not process the selected image.',
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = formName.trim();
    if (!trimmedName) {
      setFormError('Category name is required.');
      return;
    }

    const finalSlug = (formSlug.trim() || slugify(trimmedName)) || `combo-${Date.now()}`;

    // Duplicate check
    const isDuplicate = categories.some(
      (c) =>
        c.name.toLowerCase() === trimmedName.toLowerCase() &&
        c.id !== editingCategory?.id
    );

    if (isDuplicate) {
      setFormError(`A category named "${trimmedName}" already exists.`);
      return;
    }

    const assignedComboCount = getComboCountForCategory(trimmedName);
    const assignedProductCount = getProductCountForCategory(trimmedName);
    const assignedCount = formType === 'combo' ? assignedComboCount : (assignedProductCount || assignedComboCount);

    if (editingCategory) {
      const updatedCat: Category = {
        ...editingCategory,
        name: trimmedName,
        slug: finalSlug,
        description: formDescription.trim(),
        image: formImage.trim() || PRESET_COMBO_IMAGES[0].url,
        displayOrder: Number(formDisplayOrder) || 1,
        isFeatured: formIsFeatured,
        type: formType,
        itemCount: assignedCount,
      };

      await updateCategory(updatedCat);
      addToast({
        type: 'success',
        title: 'Category Updated',
        message: `Category "${trimmedName}" has been updated.`,
      });
      if (onSelectCategory) {
        onSelectCategory(trimmedName);
      }
      resetForm();
    } else {
      const newCat: Omit<Category, 'id'> = {
        name: trimmedName,
        slug: finalSlug,
        description: formDescription.trim(),
        image: formImage.trim() || PRESET_COMBO_IMAGES[0].url,
        displayOrder: Number(formDisplayOrder) || categories.length + 1,
        isFeatured: formIsFeatured,
        type: formType,
        itemCount: assignedCount,
      };

      await addCategory(newCat);
      addToast({
        type: 'success',
        title: 'Category Created',
        message: `New category "${trimmedName}" is now active and visible on the site.`,
      });
      if (onSelectCategory) {
        onSelectCategory(trimmedName);
      }
      resetForm();
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    const activeCombos = getComboCountForCategory(cat.name);
    const activeProducts = getProductCountForCategory(cat.name);
    if ((activeCombos > 0 || activeProducts > 0) && deleteConfirmId !== cat.id) {
      setDeleteConfirmId(cat.id);
      return;
    }

    await deleteCategory(cat.id);
    addToast({
      type: 'info',
      title: 'Category Removed',
      message: `"${cat.name}" has been deleted and removed from the site.`,
    });
    setDeleteConfirmId(null);
    if (editingCategory?.id === cat.id) {
      resetForm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="combo-category-manager-title"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#062919] to-[#0D4A2B] text-white flex items-center justify-between border-b border-emerald-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800/80 border border-emerald-400/30 flex items-center justify-center text-amber-300 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 id="combo-category-manager-title" className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Site Categories Manager</span>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/20">
                  {categories.length} Total
                </span>
              </h2>
              <p className="text-xs text-emerald-200/80">
                Manage categories for plants and combos. Changes update the homepage instantly.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-900/60 hover:bg-emerald-800 text-white flex items-center justify-center transition-colors cursor-pointer border border-emerald-700/50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top Bar: Action & Search & Filters */}
          <div className="flex flex-col gap-3 bg-[#F4FAF5] p-3.5 rounded-2xl border border-emerald-900/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search categories by name, slug..."
                  className="w-full pl-9 pr-3 py-2 bg-white text-xs font-semibold text-emerald-950 rounded-full border border-emerald-900/15 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                {!isCreatingNew ? (
                  <button
                    type="button"
                    onClick={handleStartCreate}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-full shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Create New Category</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-full transition-all cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>

            {/* Type Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-emerald-900/5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider shrink-0 mr-1">
                Filter:
              </span>
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  typeFilter === 'all'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                All ({categories.length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('combo')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  typeFilter === 'combo'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Combos ({categories.filter((c) => c.type === 'combo').length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('plant')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  typeFilter === 'plant'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Plants ({categories.filter((c) => c.type === 'plant').length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('both')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  typeFilter === 'both'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Both ({categories.filter((c) => c.type === 'both').length})
              </button>
            </div>
          </div>

          {/* Creation / Edit Form Banner */}
          {isCreatingNew && (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-5 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                  <FolderPlus className="w-4 h-4 text-emerald-700" />
                  <span>{editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Combo Category'}</span>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-gray-500 hover:text-gray-800 font-semibold cursor-pointer"
                >
                  Close Form
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-emerald-950 block mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Monsoon Balcony Garden Packs"
                      className="w-full px-3.5 py-2.5 bg-white text-xs font-bold text-emerald-950 rounded-xl border border-emerald-900/20 focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-emerald-950 block mb-1 flex items-center justify-between">
                      <span>URL Slug *</span>
                      <span className="text-[10px] text-gray-500 font-normal">Auto-generated</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formSlug}
                      onChange={(e) => {
                        setIsSlugCustomized(true);
                        setFormSlug(slugify(e.target.value));
                      }}
                      placeholder="monsoon-balcony-garden-packs"
                      className="w-full px-3.5 py-2.5 bg-white text-xs font-semibold text-emerald-950 rounded-xl border border-emerald-900/20 focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-emerald-950 block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Briefly describe what botanical pairings this combo category contains..."
                    className="w-full px-3.5 py-2.5 bg-white text-xs text-gray-800 rounded-xl border border-emerald-900/20 focus:border-emerald-600 focus:outline-hidden resize-none"
                  />
                </div>

                {/* Image Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Category Cover / Thumbnail Image</span>
                    </label>
                    <label
                      htmlFor={fileInputId}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{isUploading ? 'Compressing...' : 'Upload Image'}</span>
                    </label>
                    <input
                      id={fileInputId}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-600 shrink-0 shadow-xs bg-gray-100">
                      <img
                        src={formImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PRESET_COMBO_IMAGES[0].url;
                        }}
                      />
                    </div>
                    <input
                      type="url"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="Paste image URL or pick a preset below..."
                      className="w-full px-3.5 py-2.5 bg-white text-xs font-medium text-gray-800 rounded-xl border border-emerald-900/20 focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  {/* Image Presets */}
                  <div className="pt-1">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">
                      Quick Nursery Presets:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COMBO_IMAGES.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setFormImage(preset.url)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            formImage === preset.url
                              ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                              : 'bg-white text-emerald-950 border-emerald-900/15 hover:bg-emerald-50'
                          }`}
                        >
                          <span>{preset.label}</span>
                          {formImage === preset.url && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category Type / Scope */}
                <div>
                  <label className="text-xs font-bold text-emerald-950 block mb-1.5">
                    Category Scope *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormType('combo')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        formType === 'combo'
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      🌿 Combo Packs
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType('plant')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        formType === 'plant'
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      🌱 Botanical Plant
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType('both')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        formType === 'both'
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      🌸 Both
                    </button>
                  </div>
                </div>

                {/* Additional Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-emerald-950 block mb-1">
                      Display Sequence Order
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={formDisplayOrder}
                      onChange={(e) => setFormDisplayOrder(parseInt(e.target.value) || 1)}
                      className="w-full px-3.5 py-2 bg-white text-xs font-semibold text-emerald-950 rounded-xl border border-emerald-900/20 focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-4 sm:pt-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formIsFeatured}
                        onChange={(e) => setFormIsFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500 border-gray-300"
                      />
                      <span className="text-xs font-bold text-emerald-950">
                        Feature in Category showcase
                      </span>
                    </label>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-emerald-200/60">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-full border border-gray-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>{editingCategory ? 'Update Category' : 'Save & Publish Category'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Existing Categories Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-emerald-700" />
                <span>Existing Categories ({filteredCategories.length})</span>
              </h3>
              <span className="text-[11px] text-gray-500">
                Sorted by display priority
              </span>
            </div>

            {filteredCategories.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-300 space-y-3">
                <Layers className="w-8 h-8 text-gray-400 mx-auto" />
                <div className="text-xs font-bold text-gray-700">No categories found</div>
                <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                  {searchQuery
                    ? `No categories match "${searchQuery}".`
                    : 'Click "+ Create New Category" above to add your first category.'}
                </p>
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-full cursor-pointer hover:bg-emerald-900"
                >
                  + Add First Category
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredCategories
                  .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99))
                  .map((cat) => {
                    const comboCount = getComboCountForCategory(cat.name);
                    const prodCount = getProductCountForCategory(cat.name);
                    const isDeleting = deleteConfirmId === cat.id;

                    const typeBadgeText = cat.type === 'combo' ? 'Combo' : cat.type === 'plant' ? 'Plant' : 'Both';
                    const typeBadgeColor = cat.type === 'combo'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : cat.type === 'plant'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200';

                    return (
                      <div
                        key={cat.id}
                        className={`p-3.5 bg-white rounded-2xl border transition-all flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-xs ${
                          editingCategory?.id === cat.id
                            ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 relative">
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = PRESET_COMBO_IMAGES[0].url;
                              }}
                            />
                            {cat.isFeatured && (
                              <div className="absolute top-1 left-1 bg-amber-500 text-white p-0.5 rounded-full shadow-2xs">
                                <Sparkles className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-extrabold text-xs sm:text-sm text-emerald-950 truncate">
                                {cat.name}
                              </h4>
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${typeBadgeColor}`}>
                                {typeBadgeText}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-gray-400 font-mono truncate">
                                /{cat.slug}
                              </span>
                              <span className="text-[10px] text-gray-500 font-semibold">
                                • {cat.type === 'combo'
                                  ? `${comboCount} Combos`
                                  : cat.type === 'plant'
                                  ? `${prodCount} Plants`
                                  : `${comboCount} Combos, ${prodCount} Plants`}
                              </span>
                            </div>

                            {cat.description && (
                              <p className="text-[11px] text-gray-600 line-clamp-2 mt-1 leading-snug">
                                {cat.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                          <span className="text-[10px] text-gray-500 font-semibold">
                            Order #{cat.displayOrder || 1}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {onSelectCategory && (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectCategory(cat.name);
                                  onClose();
                                }}
                                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                Select
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleStartEdit(cat)}
                              className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {isDeleting ? (
                              <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                                <span className="text-[10px] text-rose-700 font-bold px-1">
                                  Confirm?
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(cat)}
                                  className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                                >
                                  Yes, Delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-[10px] hover:bg-gray-300 cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat)}
                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600 shrink-0">
          <span className="flex items-center gap-1.5 text-gray-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Categories sync in real time across the website and checkout filters</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-full transition-all cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
