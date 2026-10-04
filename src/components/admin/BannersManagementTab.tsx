import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  X,
  Upload,
  Link,
  RotateCcw,
  ExternalLink,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import { HeroBanner } from '../../types';
import { useStore } from '../../context/StoreContext';
import { compressImageFileWithStats, formatBytes } from '../../lib/imageUploader';
import { initialBanners } from '../../data/initialData';

interface BannersManagementTabProps {
  onNavigateToHome?: () => void;
}

const PRESET_BANNER_PHOTOS = [
  {
    title: 'Tropical Monstera & Foliage Sanctuary',
    category: 'Lush Foliage',
    url: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Indoor Living Room Plant Combos',
    category: 'Home Styling',
    url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Propagation Greenhouse & Nursery Beds',
    category: 'Nursery Growing',
    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Aesthetic Potted Plants on Sunlit Terrace',
    category: 'Balcony Garden',
    url: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Urban Green Corner with Ceramic Planters',
    category: 'Interior Plants',
    url: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Air Purifying Plants on Modern Wooden Stand',
    category: 'Air Purifiers',
    url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1600&q=80',
  },
];

const DESTINATION_OPTIONS = [
  { label: 'Plant Combos (/combos)', value: '/combos' },
  { label: 'Plant Care Guides (/plant-care)', value: '/plant-care' },
  { label: 'Today’s Deals (/#deals)', value: '/#deals' },
  { label: 'Contact Nursery (/contact)', value: '/contact' },
  { label: 'About Nursery (/about)', value: '/about' },
];

export const BannersManagementTab: React.FC<BannersManagementTabProps> = ({ onNavigateToHome }) => {
  const { banners, addBanner, updateBanner, deleteBanner, addToast } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<HeroBanner | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState<{ original: number; compressed: number } | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formCtaText, setFormCtaText] = useState('Explore Plant Combos');
  const [formCtaLink, setFormCtaLink] = useState('/combos');
  const [formSecondaryCtaText, setFormSecondaryCtaText] = useState('');
  const [formSecondaryCtaLink, setFormSecondaryCtaLink] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formImageSourceTab, setFormImageSourceTab] = useState<'upload' | 'url' | 'presets'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sort banners by displayOrder ascending
  const sortedBanners = [...banners].sort((a, b) => a.displayOrder - b.displayOrder);
  const activeCount = banners.filter((b) => b.isActive).length;

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setFormTitle('Bring Nature Home with 7Seasons');
    setFormSubtitle(
      'Thoughtfully curated tropical plant combos and botanical collections, delivered across Kerala, Tamil Nadu & Karnataka.'
    );
    setFormBadge('FRESH FROM MANNARATHARAYIL GARDENS LLP');
    setFormCtaText('Explore Plant Combos');
    setFormCtaLink('/combos');
    setFormSecondaryCtaText('Plant Care Guides');
    setFormSecondaryCtaLink('/plant-care');
    setFormImageUrl(PRESET_BANNER_PHOTOS[0].url);
    setFormDisplayOrder(banners.length + 1);
    setFormIsActive(true);
    setFormImageSourceTab('upload');
    setUploadStats(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setFormTitle(banner.title || '');
    setFormSubtitle(banner.subtitle || '');
    setFormBadge(banner.badge || '');
    setFormCtaText(banner.ctaText || 'Explore Plant Combos');
    setFormCtaLink(banner.ctaLink || '/combos');
    setFormSecondaryCtaText(banner.secondaryCtaText || '');
    setFormSecondaryCtaLink(banner.secondaryCtaLink || '');
    setFormImageUrl(banner.imageUrl || '');
    setFormDisplayOrder(banner.displayOrder || 1);
    setFormIsActive(banner.isActive ?? true);
    setFormImageSourceTab('url');
    setUploadStats(null);
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast({
        title: 'Invalid File',
        message: 'Please choose an image file (JPEG, PNG, WEBP).',
        type: 'error',
      });
      return;
    }

    setIsUploading(true);
    try {
      // Compress to high-resolution landscape banner (1920x1080, quality 0.85)
      const stats = await compressImageFileWithStats(file, 1920, 1080, 0.85);
      setFormImageUrl(stats.dataUrl);
      setUploadStats({
        original: stats.originalSize,
        compressed: stats.compressedSize,
      });

      addToast({
        title: 'Image Loaded & Compressed',
        message: `Saved ${stats.savingsPercent}% (${formatBytes(stats.compressedSize)}). Ready to save!`,
        type: 'success',
      });
    } catch (err: any) {
      console.error('Image compression failed:', err);
      addToast({
        title: 'Upload Failed',
        message: 'Could not process the selected image.',
        type: 'error',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formImageUrl.trim()) {
      addToast({
        title: 'Missing Image',
        message: 'Please upload an image or provide a valid image URL for this banner.',
        type: 'error',
      });
      return;
    }

    if (!formTitle.trim()) {
      addToast({
        title: 'Missing Headline',
        message: 'Please provide a title for the banner slide.',
        type: 'error',
      });
      return;
    }

    const payload: Omit<HeroBanner, 'id'> = {
      title: formTitle.trim(),
      subtitle: formSubtitle.trim(),
      badge: formBadge.trim(),
      ctaText: formCtaText.trim() || 'Explore Plant Combos',
      ctaLink: formCtaLink.trim() || '/combos',
      secondaryCtaText: formSecondaryCtaText.trim() || undefined,
      secondaryCtaLink: formSecondaryCtaLink.trim() || undefined,
      imageUrl: formImageUrl.trim(),
      displayOrder: Number(formDisplayOrder) || 1,
      isActive: Boolean(formIsActive),
    };

    if (editingBanner) {
      await updateBanner({
        ...payload,
        id: editingBanner.id,
      });
      addToast({
        title: 'Banner Slide Updated 🌿',
        message: `"${payload.title}" has been saved to the homepage carousel.`,
        type: 'success',
      });
    } else {
      await addBanner(payload);
      addToast({
        title: 'New Banner Added 🌿',
        message: `"${payload.title}" has been added to the carousel.`,
        type: 'success',
      });
    }

    setIsModalOpen(false);
  };

  const handleToggleActive = async (banner: HeroBanner) => {
    const updated = { ...banner, isActive: !banner.isActive };
    await updateBanner(updated);
    addToast({
      title: updated.isActive ? 'Banner Activated' : 'Banner Hidden',
      message: `"${banner.title}" is now ${updated.isActive ? 'live in rotation' : 'hidden from visitors'}.`,
      type: 'info',
    });
  };

  const handleMoveOrder = async (banner: HeroBanner, direction: 'up' | 'down') => {
    const index = sortedBanners.findIndex((b) => b.id === banner.id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedBanners.length) return;

    const targetBanner = sortedBanners[targetIndex];
    const currentOrder = banner.displayOrder;
    const targetOrder = targetBanner.displayOrder;

    // Swap display order
    await updateBanner({ ...banner, displayOrder: targetOrder });
    await updateBanner({ ...targetBanner, displayOrder: currentOrder });

    addToast({
      title: 'Order Updated',
      message: `Slide moved ${direction}. Carousel order refreshed.`,
      type: 'info',
    });
  };

  const handleDeleteConfirm = async () => {
    if (!bannerToDelete) return;
    await deleteBanner(bannerToDelete.id);
    addToast({
      title: 'Banner Removed',
      message: `"${bannerToDelete.title}" has been deleted from the carousel.`,
      type: 'info',
    });
    setBannerToDelete(null);
  };

  const handleResetToDefaults = async () => {
    // Delete existing and seed initial
    for (const b of banners) {
      await deleteBanner(b.id);
    }
    for (const init of initialBanners) {
      await addBanner({
        title: init.title,
        subtitle: init.subtitle,
        badge: init.badge,
        ctaText: init.ctaText,
        ctaLink: init.ctaLink,
        secondaryCtaText: init.secondaryCtaText,
        secondaryCtaLink: init.secondaryCtaLink,
        imageUrl: init.imageUrl,
        displayOrder: init.displayOrder,
        isActive: init.isActive,
      });
    }
    setIsResetConfirmOpen(false);
    addToast({
      title: 'Default Banners Restored',
      message: 'The 3 initial nursery hero banners have been re-seeded.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header & Stats Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#062416] to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-emerald-800/50">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Homepage Hero Experience</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hero Banner Carousel Manager
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Upload your own nursery photography, change slide headlines, highlight seasonal combos, and control the primary full-width presentation customers see when visiting 7Seasonsplants.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-full font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Banner Slide</span>
            </button>

            {onNavigateToHome && (
              <button
                onClick={onNavigateToHome}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
                title="Open storefront to view carousel in action"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Storefront</span>
              </button>
            )}

            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-3.5 py-3 bg-white/5 hover:bg-white/10 text-emerald-200 hover:text-white rounded-full font-bold text-xs border border-emerald-700/50 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Reset to 3 default sample nursery banners"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-emerald-800/60 text-xs">
          <div className="bg-black/20 rounded-2xl p-3 border border-white/5">
            <span className="text-emerald-300 block text-[11px] font-bold">Total Slides</span>
            <span className="text-xl font-black text-white">{banners.length}</span>
          </div>
          <div className="bg-black/20 rounded-2xl p-3 border border-white/5">
            <span className="text-emerald-300 block text-[11px] font-bold">Live in Rotation</span>
            <span className="text-xl font-black text-emerald-400">
              {activeCount} / {banners.length}
            </span>
          </div>
          <div className="bg-black/20 rounded-2xl p-3 border border-white/5">
            <span className="text-emerald-300 block text-[11px] font-bold">Slide Interval</span>
            <span className="text-xl font-black text-white">6 Seconds</span>
          </div>
          <div className="bg-black/20 rounded-2xl p-3 border border-white/5">
            <span className="text-emerald-300 block text-[11px] font-bold">Delivery Tag</span>
            <span className="text-xs font-bold text-emerald-200 truncate block mt-1">
              KL • TN • KA
            </span>
          </div>
        </div>
      </div>

      {/* Preset Quick-Picks Banner Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-emerald-950 text-sm">
              Quick Pick: Botanical Nursery Photography
            </h3>
          </div>
          <span className="text-[11px] text-gray-500 font-medium hidden sm:inline">
            Click any photo below to instantly draft a new banner
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PRESET_BANNER_PHOTOS.map((preset, idx) => (
            <div
              key={idx}
              onClick={() => {
                handleOpenAddModal();
                setFormImageUrl(preset.url);
                setFormTitle(preset.title);
                setFormBadge('7SEASONS BOTANICAL CURATION');
              }}
              className="group relative rounded-2xl overflow-hidden aspect-video border border-gray-200 hover:border-emerald-500 shadow-2xs cursor-pointer transition-all hover:scale-[1.02]"
            >
              <img
                src={preset.url}
                alt={preset.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-end">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                  {preset.category}
                </span>
                <span className="text-[11px] font-bold text-white line-clamp-1">
                  {preset.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slides Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-emerald-950 text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>Active Slides in Order ({sortedBanners.length})</span>
          </h3>
          <span className="text-xs text-gray-500">
            Use the arrows to reorder which slide displays first
          </span>
        </div>

        {sortedBanners.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-2xs space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-emerald-950">No hero banners active</h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Your homepage needs at least one banner slide. Add a custom slide or click "Reset Defaults" to restore the standard 7Seasons hero banners.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 bg-emerald-800 text-white rounded-full font-bold text-xs hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                + Add First Slide
              </button>
              <button
                onClick={handleResetToDefaults}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-full font-bold text-xs hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Restore 3 Defaults
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {sortedBanners.map((banner, index) => (
              <div
                key={banner.id}
                className={`bg-white rounded-3xl border ${
                  banner.isActive ? 'border-gray-200 shadow-xs' : 'border-dashed border-gray-300 opacity-70 bg-gray-50/50'
                } p-5 sm:p-6 transition-all hover:border-emerald-300 relative`}
              >
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  {/* Banner 16:9 Image Preview Box with Real Overlay Preview */}
                  <div className="w-full lg:w-96 shrink-0 relative rounded-2xl overflow-hidden aspect-video bg-[#062416] border border-emerald-950/20 shadow-inner group">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent pointer-events-none" />

                    {/* Mini live overlay preview */}
                    <div className="absolute inset-0 p-3.5 flex flex-col justify-between text-white pointer-events-none">
                      <div>
                        {banner.badge && (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-[9px] font-bold text-emerald-200 tracking-wider uppercase mb-1">
                            {banner.badge}
                          </span>
                        )}
                        <h5 className="font-black text-xs sm:text-sm line-clamp-2 text-white drop-shadow-sm">
                          {banner.title}
                        </h5>
                      </div>
                      <div className="flex items-center gap-1.5 pt-2">
                        <span className="px-2.5 py-1 bg-emerald-600 rounded-full text-[9px] font-bold text-white flex items-center gap-1">
                          {banner.ctaText || 'Shop Now'} <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>

                    {/* Slide index badge */}
                    <div className="absolute top-2 right-2 px-2.5 py-0.5 bg-black/70 backdrop-blur-xs text-white rounded-full text-[10px] font-black border border-white/20">
                      Slide #{index + 1}
                    </div>
                  </div>

                  {/* Banner Details & Copy */}
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                          banner.isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-gray-100 text-gray-500 border-gray-300'
                        }`}
                      >
                        {banner.isActive ? '● Live in Rotation' : '○ Hidden / Paused'}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        Order Index: {banner.displayOrder}
                      </span>
                    </div>

                    <div>
                      {banner.badge && (
                        <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                          Badge: {banner.badge}
                        </p>
                      )}
                      <h4 className="text-lg font-black text-emerald-950 leading-tight">
                        {banner.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {banner.subtitle}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
                        <span className="text-emerald-700 text-[10px] uppercase font-black">Primary CTA:</span>
                        <span>"{banner.ctaText}"</span>
                        <span className="text-gray-400 font-mono text-[11px]">→ {banner.ctaLink}</span>
                      </div>

                      {banner.secondaryCtaText && (
                        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
                          <span className="text-gray-400 text-[10px] uppercase font-bold">Secondary:</span>
                          <span>"{banner.secondaryCtaText}"</span>
                          <span className="text-gray-400 font-mono text-[11px]">→ {banner.secondaryCtaLink}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex lg:flex-col items-center gap-2 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                    <button
                      onClick={() => handleOpenEditModal(banner)}
                      className="px-4 py-2 bg-emerald-800 text-white rounded-full text-xs font-bold hover:bg-emerald-900 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Slide</span>
                    </button>

                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                        banner.isActive
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                      title={banner.isActive ? 'Hide slide from visitors' : 'Make slide active'}
                    >
                      {banner.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{banner.isActive ? 'Hide' : 'Activate'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveOrder(banner, 'up')}
                        disabled={index === 0}
                        className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Move slide earlier in carousel"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(banner, 'down')}
                        disabled={index === sortedBanners.length - 1}
                        className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Move slide later in carousel"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => setBannerToDelete(banner)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                      title="Delete slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT BANNER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 border border-gray-200 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-emerald-950 text-lg">
                    {editingBanner ? 'Edit Hero Banner Slide' : 'Add New Hero Banner Slide'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Changes apply immediately to your live homepage carousel.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-6 text-xs">
              {/* IMAGE SELECTION BLOCK */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-emerald-950 block text-xs">
                    Banner Background Image (Landscape / 16:9 Recommended) *
                  </label>
                  <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-full">
                    <button
                      type="button"
                      onClick={() => setFormImageSourceTab('upload')}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        formImageSourceTab === 'upload'
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'text-gray-600 hover:text-emerald-900'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormImageSourceTab('url')}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        formImageSourceTab === 'url'
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'text-gray-600 hover:text-emerald-900'
                      }`}
                    >
                      Image URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormImageSourceTab('presets')}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        formImageSourceTab === 'presets'
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'text-gray-600 hover:text-emerald-900'
                      }`}
                    >
                      Nursery Presets
                    </button>
                  </div>
                </div>

                {formImageSourceTab === 'upload' && (
                  <div className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-gray-50/60 transition-colors">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileUpload}
                      accept="image/*"
                      className="hidden"
                      id="banner-image-upload"
                    />
                    <label
                      htmlFor="banner-image-upload"
                      className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-emerald-950 text-sm">
                        {isUploading ? 'Compressing & preparing image...' : 'Click to upload photo from your device'}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Supports JPEG, PNG, WEBP • Automatically optimized for instant loading
                      </span>
                    </label>
                  </div>
                )}

                {formImageSourceTab === 'url' && (
                  <div className="space-y-1.5">
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... or your hosted image URL"
                      className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                    <p className="text-[11px] text-gray-500">
                      Paste a direct HTTPS link to any image online.
                    </p>
                  </div>
                )}

                {formImageSourceTab === 'presets' && (
                  <div className="grid grid-cols-3 gap-2.5">
                    {PRESET_BANNER_PHOTOS.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => setFormImageUrl(preset.url)}
                        className={`relative rounded-xl overflow-hidden aspect-video border cursor-pointer transition-all ${
                          formImageUrl === preset.url
                            ? 'ring-3 ring-emerald-600 border-emerald-600'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 p-1.5 flex items-end">
                          <span className="text-[10px] text-white font-bold truncate">
                            {preset.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload savings info */}
                {uploadStats && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      Optimized for fast mobile loading: {formatBytes(uploadStats.compressed)} (was {formatBytes(uploadStats.original)})
                    </span>
                  </div>
                )}

                {/* Real-Time Live Preview Mockup Box */}
                {formImageUrl && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 text-[11px] flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-emerald-700" />
                        Live Slide Preview (as customers will see it):
                      </span>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden aspect-video bg-[#062416] border border-emerald-950/20 shadow-md">
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as any).src = PRESET_BANNER_PHOTOS[0].url;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent pointer-events-none" />

                      <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-center max-w-lg text-white pointer-events-none">
                        {formBadge && (
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase mb-2 w-max">
                            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                            <span>{formBadge}</span>
                          </div>
                        )}
                        <h4 className="text-base sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                          {formTitle || 'Slide Headline'}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-emerald-100/90 mt-1.5 line-clamp-2 max-w-sm">
                          {formSubtitle || 'Slide subtitle and nursery description...'}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-[10px] sm:text-xs font-black flex items-center gap-1 shadow-sm">
                            {formCtaText || 'Explore Combos'} <ArrowRight className="w-3 h-3" />
                          </span>
                          {formSecondaryCtaText && (
                            <span className="px-3 py-1.5 bg-white/15 text-white rounded-full text-[10px] sm:text-xs font-bold">
                              {formSecondaryCtaText}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SLIDE TEXT CONTENT */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                  Slide Content & Messaging
                </h4>

                <div>
                  <label className="font-bold text-emerald-950 block mb-1">
                    Top Badge / Tagline (Optional)
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. FRESH FROM MANNARATHARAYIL GARDENS LLP or POPULAR CHOICE"
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-semibold uppercase tracking-wider text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-bold text-emerald-950 block mb-1">
                    Main Headline Title *
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Bring Nature Home with 7Seasons"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-emerald-950 block mb-1">
                    Subtitle / Paragraph Description *
                  </label>
                  <textarea
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    rows={2}
                    placeholder="Describe your plant bundles, nursery dispatch promise, or special offer..."
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-2xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                  />
                </div>
              </div>

              {/* CALL TO ACTION BUTTONS */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                  Button Actions & Destinations
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">
                      Primary Button Text *
                    </label>
                    <input
                      type="text"
                      value={formCtaText}
                      onChange={(e) => setFormCtaText(e.target.value)}
                      placeholder="e.g. Explore Plant Combos"
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">
                      Primary Destination Link *
                    </label>
                    <select
                      value={formCtaLink}
                      onChange={(e) => setFormCtaLink(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-medium cursor-pointer"
                    >
                      {DESTINATION_OPTIONS.map((dest) => (
                        <option key={dest.value} value={dest.value}>
                          {dest.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">
                      Secondary Button Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={formSecondaryCtaText}
                      onChange={(e) => setFormSecondaryCtaText(e.target.value)}
                      placeholder="e.g. Plant Care Guides or Leave blank"
                      className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">
                      Secondary Destination Link
                    </label>
                    <select
                      value={formSecondaryCtaLink}
                      onChange={(e) => setFormSecondaryCtaLink(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-medium cursor-pointer"
                    >
                      <option value="">-- None / No Secondary Button --</option>
                      {DESTINATION_OPTIONS.map((dest) => (
                        <option key={dest.value} value={dest.value}>
                          {dest.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SLIDE SETTINGS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="font-bold text-emerald-950 block mb-1">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-semibold"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Lower numbers appear earlier in the slide rotation.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="banner-is-active"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                  />
                  <label
                    htmlFor="banner-is-active"
                    className="font-bold text-emerald-950 cursor-pointer"
                  >
                    Active in live homepage rotation
                  </label>
                </div>
              </div>

              {/* MODAL FOOTER ACTIONS */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingBanner ? 'Save Changes' : 'Publish Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {bannerToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-gray-200 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-emerald-950 text-base">
                Delete Banner Slide?
              </h3>
              <p className="text-xs text-gray-600">
                Are you sure you want to remove <strong>"{bannerToDelete.title}"</strong> from the homepage carousel?
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setBannerToDelete(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold cursor-pointer transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET TO DEFAULTS CONFIRMATION MODAL */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-gray-200 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-emerald-950 text-base">
                Restore Default Banners?
              </h3>
              <p className="text-xs text-gray-600">
                This will replace the current hero slides with the 3 default 7Seasons botanical banners.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetToDefaults}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-bold cursor-pointer transition-colors"
              >
                Yes, Restore Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
