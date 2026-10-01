import React, { useState, useRef } from 'react';
import {
  Video,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Instagram,
  Eye,
  Heart,
  Calendar,
  CheckCircle2,
  X,
  AlertTriangle,
  Play,
  Link,
  Image,
  Upload,
  BookOpen,
} from 'lucide-react';
import { InstagramReel } from '../../types';
import { useStore } from '../../context/StoreContext';
import {
  extractInstagramShortcode,
  formatInstagramReelUrl,
  getInstagramEmbedUrl,
  isDirectVideoUrl,
  SAMPLE_REEL_THUMBNAILS,
} from '../../lib/instagram';
import { compressImageFileWithStats } from '../../lib/imageUploader';
import { ReelPlayerModal } from '../common/ReelPlayerModal';

interface ReelsManagementTabProps {
  onNavigateToBlog?: () => void;
  onSwitchToBlogsTab?: () => void;
}

export const ReelsManagementTab: React.FC<ReelsManagementTabProps> = ({ onNavigateToBlog, onSwitchToBlogsTab }) => {
  const { instagramReels, addInstagramReel, updateInstagramReel, deleteInstagramReel, addToast } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<InstagramReel | null>(null);
  const [reelToDelete, setReelToDelete] = useState<InstagramReel | null>(null);
  const [previewReel, setPreviewReel] = useState<InstagramReel | null>(null);

  // Form State
  const [formUrl, setFormUrl] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formLikes, setFormLikes] = useState<number>(0);
  const [formViews, setFormViews] = useState<string>('');
  const [formDate, setFormDate] = useState<string>('');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Preview & Enhancement State
  const [modalPreviewTab, setModalPreviewTab] = useState<'card' | 'embed'>('card');
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const thumbnailFileInputRef = useRef<HTMLInputElement | null>(null);

  // Upload Custom Cover Thumbnail
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumbnail(true);
    try {
      const stats = await compressImageFileWithStats(file, 1080, 1080, 0.85);
      setFormThumbnail(stats.dataUrl);
      addToast({
        title: 'Cover Image Uploaded 📸',
        message: `Saved custom cover (${Math.round(stats.compressedSize / 1024)} KB).`,
        type: 'success',
      });
    } catch (err: any) {
      console.error('Thumbnail upload error:', err);
      addToast({
        title: 'Upload Failed',
        message: 'Could not process the selected image.',
        type: 'error',
      });
    } finally {
      setIsUploadingThumbnail(false);
      if (e.target) e.target.value = '';
    }
  };

  // Open modal for Create - CLEAN STATE (NO AUTOFILL)
  const handleOpenCreateModal = () => {
    setEditingReel(null);
    setFormUrl('');
    setFormVideoUrl('');
    setFormTitle('');
    setFormCaption('');
    setFormThumbnail('');
    setFormLikes(0);
    setFormViews('');
    setFormDate('');
    setFormDisplayOrder((instagramReels.length || 0) + 1);
    setFormIsActive(true);
    setFormError(null);
    setModalPreviewTab('card');
    setIsModalOpen(true);
  };

  // Open modal for Edit - EXACT REEL VALUES (NO AUTOFILL / OVERWRITES)
  const handleOpenEditModal = (reel: InstagramReel) => {
    setEditingReel(reel);
    setFormUrl(reel.reelUrl || '');
    setFormVideoUrl(reel.videoUrl || '');
    setFormTitle(reel.title || '');
    setFormCaption(reel.caption || '');
    setFormThumbnail(reel.thumbnailUrl || '');
    setFormLikes(typeof reel.likesCount === 'number' ? reel.likesCount : 0);
    setFormViews(reel.viewsCount || '');
    setFormDate(reel.date || '');
    setFormDisplayOrder(reel.displayOrder || 1);
    setFormIsActive(reel.isActive);
    setFormError(null);
    setModalPreviewTab('card');
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSaveReel = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanUrl = formUrl.trim();
    if (!cleanUrl) {
      setFormError('Instagram Reel or Post URL is required.');
      return;
    }

    const shortcode = extractInstagramShortcode(cleanUrl);
    if (!shortcode) {
      setFormError(
        'Please enter a valid Instagram Reel or Post URL (e.g., https://www.instagram.com/reel/CODE/ or https://www.instagram.com/7seasonsplants/reel/CODE/).'
      );
      return;
    }

    if (!formTitle.trim()) {
      setFormError('Please enter a descriptive title for this reel.');
      return;
    }

    const formattedReelUrl = formatInstagramReelUrl(cleanUrl);
    const embedUrl = getInstagramEmbedUrl(cleanUrl);
    const finalThumbnail = formThumbnail.trim() || SAMPLE_REEL_THUMBNAILS[0].url;

    if (editingReel) {
      updateInstagramReel({
        ...editingReel,
        title: formTitle.trim(),
        reelUrl: formattedReelUrl,
        embedUrl,
        videoUrl: isDirectVideoUrl(formVideoUrl.trim()) ? formVideoUrl.trim() : undefined,
        thumbnailUrl: finalThumbnail,
        caption: formCaption.trim(),
        likesCount: Number(formLikes) || 0,
        viewsCount: formViews.trim() || '1K',
        date: formDate.trim() || 'Recent',
        displayOrder: Number(formDisplayOrder) || 1,
        isActive: formIsActive,
      });

      addToast({
        title: 'Reel Updated',
        message: `"${formTitle.trim()}" updated successfully for the Blog page.`,
        type: 'success',
      });
    } else {
      addInstagramReel({
        title: formTitle.trim(),
        reelUrl: formattedReelUrl,
        embedUrl,
        videoUrl: isDirectVideoUrl(formVideoUrl.trim()) ? formVideoUrl.trim() : undefined,
        thumbnailUrl: finalThumbnail,
        caption: formCaption.trim(),
        likesCount: Number(formLikes) || 0,
        viewsCount: formViews.trim() || '1K',
        date: formDate.trim() || 'Recent',
        displayOrder: Number(formDisplayOrder) || 1,
        isActive: formIsActive,
        featuredOnBlog: true,
      });

      addToast({
        title: 'Instagram Reel Added 🎬',
        message: 'New reel added from @7seasonsplants and published to the Blog page.',
        type: 'success',
      });
    }

    setIsModalOpen(false);
  };

  // Toggle active status
  const handleToggleActive = (reel: InstagramReel) => {
    updateInstagramReel({
      ...reel,
      isActive: !reel.isActive,
    });
    addToast({
      title: reel.isActive ? 'Reel Hidden' : 'Reel Published',
      message: reel.isActive
        ? `"${reel.title}" is now hidden from the Blog page.`
        : `"${reel.title}" is now live on the Blog page.`,
      type: 'info',
    });
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!reelToDelete) return;
    deleteInstagramReel(reelToDelete.id);
    addToast({
      title: 'Reel Removed',
      message: `"${reelToDelete.title}" removed from the catalog.`,
      type: 'info',
    });
    setReelToDelete(null);
  };

  // Filtered reels list
  const filteredReels = instagramReels.filter((reel) => {
    const matchesSearch =
      reel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reel.caption || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      reel.reelUrl.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && reel.isActive) ||
      (filterStatus === 'inactive' && !reel.isActive);

    return matchesSearch && matchesStatus;
  });

  const activeCount = instagramReels.filter((r) => r.isActive).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner / Actions */}
      <div className="bg-gradient-to-r from-[#062416] via-[#0A2618] to-emerald-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl border border-emerald-800/40">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <Instagram className="w-4 h-4 text-rose-400" />
            <span>@7seasonsplants Social Integration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Instagram Reels on Blog</span>
            <span className="text-xs font-black uppercase bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-3 py-1 rounded-full">
              {activeCount} Active on Blog
            </span>
          </h2>
          <p className="text-xs text-emerald-200/80 max-w-2xl leading-relaxed">
            Curate and embed viral plant packing videos, greenhouse tours, and gardening tips from the official{' '}
            <strong className="text-white">@7seasonsplants</strong> Instagram account directly onto the customer-facing Blog page.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a
            href="https://instagram.com/7seasonsplants"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15"
          >
            <Instagram className="w-4 h-4 text-rose-400" />
            <span>Open @7seasonsplants</span>
            <ExternalLink className="w-3 h-3 text-white/60" />
          </a>

          {onSwitchToBlogsTab && (
            <button
              onClick={onSwitchToBlogsTab}
              type="button"
              className="px-4 py-2.5 rounded-full bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-700/50"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Botanical Blogs</span>
            </button>
          )}

          {onNavigateToBlog && (
            <button
              onClick={onNavigateToBlog}
              type="button"
              className="px-4 py-2.5 rounded-full bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-700/50"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>View Live Blog</span>
            </button>
          )}

          <button
            onClick={handleOpenCreateModal}
            type="button"
            className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Instagram Reel</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Reels</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">{instagramReels.length}</span>
          <span className="text-[11px] text-gray-500">In 7Seasons database</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Active on Blog</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{activeCount}</span>
          <span className="text-[11px] text-emerald-600/80">Visible to shoppers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Est. Video Views</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">85K+</span>
          <span className="text-[11px] text-gray-500">Across Instagram Reels</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">Account Handle</span>
          <span className="text-base font-black text-gray-900 mt-1 truncate block">@7seasonsplants</span>
          <span className="text-[11px] text-blue-600">Official Instagram</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reels by title or caption..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 text-gray-900 text-xs rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
          />
          <Instagram className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {(['all', 'active', 'inactive'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-emerald-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All Reels' : status === 'active' ? 'Published' : 'Hidden'}
            </button>
          ))}
        </div>
      </div>

      {/* Reels Grid */}
      {filteredReels.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Instagram className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">No Instagram Reels found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Add your first Instagram Reel from @7seasonsplants to showcase plant packing, daily garden updates, and video care tips on the Blog page.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-bold cursor-pointer transition-colors"
          >
            Add New Reel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredReels.map((reel) => (
            <div
              key={reel.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail Preview with Play Overlay */}
                <div className="relative aspect-9/14 w-full bg-emerald-950 overflow-hidden cursor-pointer" onClick={() => setPreviewReel(reel)}>
                  <img
                    src={reel.thumbnailUrl}
                    alt={reel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/30 flex flex-col justify-between p-3.5 text-white">
                    {/* Top badging */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white border border-white/20">
                        <Instagram className="w-3 h-3 text-rose-400" />
                        <span>@7seasonsplants</span>
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(reel);
                        }}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase cursor-pointer border ${
                          reel.isActive
                            ? 'bg-emerald-500/80 text-white border-emerald-400'
                            : 'bg-gray-800/80 text-gray-300 border-gray-600'
                        }`}
                        title="Click to toggle publish status"
                      >
                        {reel.isActive ? 'Published' : 'Hidden'}
                      </button>
                    </div>

                    {/* Center play icon */}
                    <div className="self-center w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/40 shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>

                    {/* Bottom stats */}
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="flex items-center gap-1 text-white/90">
                        <Eye className="w-3.5 h-3.5 text-white/70" />
                        {reel.viewsCount || '1K'}
                      </span>
                      <span className="flex items-center gap-1 text-rose-300">
                        <Heart className="w-3.5 h-3.5 fill-current text-rose-400" />
                        {reel.likesCount || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 space-y-2">
                  <h3 className="font-extrabold text-sm text-gray-900 leading-snug line-clamp-2">
                    {reel.title}
                  </h3>
                  {reel.caption && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {reel.caption}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                    <span>Order: #{reel.displayOrder || 1}</span>
                    <span>{reel.date || 'Recent'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewReel(reel)}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Watch reel preview"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Preview</span>
                </button>

                <div className="flex items-center gap-1">
                  <a
                    href={reel.reelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-rose-600 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                    title="Open on Instagram"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(reel)}
                    className="p-2 text-gray-500 hover:text-emerald-700 rounded-xl hover:bg-emerald-50 cursor-pointer transition-colors"
                    title="Edit Reel"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setReelToDelete(reel)}
                    className="p-2 text-gray-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 cursor-pointer transition-colors"
                    title="Delete Reel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT REEL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-gray-200 shadow-2xl my-8 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {editingReel ? 'Edit Instagram Reel' : 'Add Instagram Reel to Blog'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    From official @7seasonsplants account
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveReel} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  Instagram Reel / Post URL *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://www.instagram.com/reel/CODE/ or https://www.instagram.com/p/CODE/"
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-mono text-xs transition-colors"
                  />
                  <Link className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Paste the direct URL to the Instagram Reel or Post.
                </p>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  Video Title / Topic *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. How We Pack Live Plants for Safe Transit Across India 📦🌿"
                  className="w-full px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden text-xs font-semibold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-800">
                    Video Caption / Description
                  </label>
                  <span className="text-[10px] text-gray-400">
                    {formCaption.length} characters
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  placeholder="Key takeaways, plant care tips, or highlights shown in the reel..."
                  className="w-full px-3.5 py-2 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-800">
                    Cover / Thumbnail Image
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={thumbnailFileInputRef}
                      onChange={handleThumbnailUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => thumbnailFileInputRef.current?.click()}
                      disabled={isUploadingThumbnail}
                      className="px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Upload custom image from your device"
                    >
                      <Upload className="w-3 h-3 text-emerald-700" />
                      <span>{isUploadingThumbnail ? 'Uploading...' : 'Upload Cover'}</span>
                    </button>
                    <span className="text-[10px] text-gray-500 font-normal">or select preset</span>
                  </div>
                </div>
                <div className="relative mb-2">
                  <input
                    type="url"
                    value={formThumbnail}
                    onChange={(e) => setFormThumbnail(e.target.value)}
                    placeholder="https://images.unsplash.com/... or uploaded cover image"
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-mono text-xs"
                  />
                  <Image className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {SAMPLE_REEL_THUMBNAILS.map((thumb) => (
                    <button
                      type="button"
                      key={thumb.label}
                      onClick={() => setFormThumbnail(thumb.url)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
                        formThumbnail === thumb.url
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {thumb.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* LIVE PREVIEW OF AUTO-FILLED REEL */}
              {(formTitle || formThumbnail || formUrl) && (
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                      <span>Live Preview</span>
                    </span>
                    <div className="flex items-center bg-gray-200/80 p-0.5 rounded-lg text-[10px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setModalPreviewTab('card')}
                        className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                          modalPreviewTab === 'card'
                            ? 'bg-white text-emerald-950 font-bold shadow-2xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        📱 Blog Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalPreviewTab('embed')}
                        disabled={!getInstagramEmbedUrl(formUrl)}
                        className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                          modalPreviewTab === 'embed'
                            ? 'bg-white text-emerald-950 font-bold shadow-2xs'
                            : !getInstagramEmbedUrl(formUrl)
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        title={getInstagramEmbedUrl(formUrl) ? 'Test live Instagram player' : 'Enter a valid reel URL first'}
                      >
                        ▶️ Reel Player
                      </button>
                    </div>
                  </div>

                  {modalPreviewTab === 'embed' && getInstagramEmbedUrl(formUrl) ? (
                    <div className="bg-black rounded-xl overflow-hidden border border-gray-300 min-h-[300px] flex items-center justify-center">
                      <iframe
                        src={getInstagramEmbedUrl(formUrl) || ''}
                        className="w-full h-[320px] border-0"
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        allowFullScreen
                        title="Reel Preview"
                      />
                    </div>
                  ) : (
                    <div className="flex gap-3 bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-900">
                        <img
                          src={formThumbnail || SAMPLE_REEL_THUMBNAILS[0].url}
                          alt={formTitle || 'Preview'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = SAMPLE_REEL_THUMBNAILS[0].url;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow-xs">
                            <Play className="w-3 h-3 text-emerald-900 fill-emerald-900 ml-0.5" />
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-0.5">
                            <Instagram className="w-3 h-3 text-rose-500" />
                            <span className="font-semibold text-gray-700">@7seasonsplants</span>
                            <span>•</span>
                            <span>{formDate || 'Recent'}</span>
                          </div>
                          <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                            {formTitle || 'Enter video title...'}
                          </h4>
                          <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                            {formCaption || 'No caption entered'}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-gray-600 font-semibold pt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-gray-400" />
                            <span>{formViews || '1K'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                            <span>{formLikes || 0}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Views Display</label>
                  <input
                    type="text"
                    value={formViews}
                    onChange={(e) => setFormViews(e.target.value)}
                    placeholder="18.5K"
                    className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Likes Count</label>
                  <input
                    type="number"
                    value={formLikes}
                    onChange={(e) => setFormLikes(Number(e.target.value))}
                    placeholder="1240"
                    className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Date</label>
                  <input
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="3 days ago"
                    className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Order #</label>
                  <input
                    type="number"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    placeholder="1"
                    className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-950 block">Publish to Blog Page</span>
                  <span className="text-[11px] text-emerald-800">
                    When active, this reel appears on the 7Seasons Gardening Blog page.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingReel ? 'Save Reel Updates' : 'Add Reel to Blog'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WATCH REEL PREVIEW MODAL */}
      <ReelPlayerModal reel={previewReel} onClose={() => setPreviewReel(null)} />

      {/* CONFIRM DELETE MODAL */}
      {reelToDelete && (
        <div className="fixed inset-0 z-[120] bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-rose-200 shadow-2xl animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-gray-900">Delete Instagram Reel?</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to remove <strong>"{reelToDelete.title}"</strong> from the database and Blog page?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReelToDelete(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold text-xs cursor-pointer shadow-xs"
              >
                Yes, Delete Reel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
