import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Instagram,
  CheckCircle2,
  Plus,
  ArrowLeft,
  ArrowRight,
  Search,
  ExternalLink,
  Film,
  Eye,
  Heart,
  Sparkles,
  Play,
  Settings,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { InstagramReel } from '../../types';

interface HomeReelsPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAdmin?: () => void;
}

export const HomeReelsPickerModal: React.FC<HomeReelsPickerModalProps> = ({
  isOpen,
  onClose,
  onNavigateToAdmin,
}) => {
  const { instagramReels, updateInstagramReel, addToast } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  // ESC key & scroll freeze
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Active reels
  const activeReels = useMemo(
    () => (instagramReels || []).filter((r) => r.isActive),
    [instagramReels]
  );

  // Check if any reel has explicit boolean setting for showOnHome
  const hasExplicitHome = useMemo(
    () => activeReels.some((r) => typeof r.showOnHome === 'boolean'),
    [activeReels]
  );

  // Selected candidate reels for home
  const candidateHomeReels = useMemo(() => {
    return hasExplicitHome
      ? activeReels.filter((r) => r.showOnHome === true)
      : activeReels.filter((r) => r.showOnHome !== false);
  }, [activeReels, hasExplicitHome]);

  // The 4 strictly displayed reels on the Home Page, sorted by displayOrder
  const displayedHomeReels = useMemo(() => {
    return [...candidateHomeReels]
      .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99))
      .slice(0, 4);
  }, [candidateHomeReels]);

  // Toggle home page assignment
  const handleToggleHomeReel = (reel: InstagramReel) => {
    const isCurrentlyOnHome = hasExplicitHome
      ? reel.showOnHome === true
      : reel.showOnHome !== false;

    const nextVal = !isCurrentlyOnHome;

    // If enabling, give it a sensible displayOrder so it displays in order
    let newDisplayOrder = reel.displayOrder || 1;
    if (nextVal) {
      const highestOrder = displayedHomeReels.reduce(
        (max, r) => Math.max(max, r.displayOrder || 0),
        0
      );
      newDisplayOrder = highestOrder + 1;
    }

    updateInstagramReel({
      ...reel,
      showOnHome: nextVal,
      displayOrder: newDisplayOrder,
    });

    const newCount = activeReels.filter((r) =>
      r.id === reel.id ? nextVal : r.showOnHome === true
    ).length;

    addToast({
      title: nextVal ? 'Added to Home Showcase 🏠' : 'Removed from Home',
      message: nextVal
        ? `"${reel.title}" will now show on the Home Page (${newCount > 4 ? 'Top 4 by Order # are displayed' : `Slot #${Math.min(newCount, 4)}`}).`
        : `"${reel.title}" removed from the Home Page showcase.`,
      type: nextVal ? 'success' : 'info',
    });
  };

  // Swap order of slots (move left / move right)
  const handleMoveSlot = (slotIndex: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? slotIndex - 1 : slotIndex + 1;
    if (targetIndex < 0 || targetIndex >= displayedHomeReels.length) return;

    const currentReel = displayedHomeReels[slotIndex];
    const targetReel = displayedHomeReels[targetIndex];

    const currentOrder = currentReel.displayOrder || slotIndex + 1;
    const targetOrder = targetReel.displayOrder || targetIndex + 1;

    // Swap their displayOrders
    updateInstagramReel({
      ...currentReel,
      displayOrder: targetOrder === currentOrder ? currentOrder + (direction === 'right' ? 1 : -1) : targetOrder,
    });
    updateInstagramReel({
      ...targetReel,
      displayOrder: currentOrder,
    });

    addToast({
      title: 'Reels Reordered 🔄',
      message: `Swapped positions between Slot #${slotIndex + 1} and Slot #${targetIndex + 1}.`,
      type: 'success',
    });
  };

  // Filtered available catalog reels for bottom search
  const filteredCatalogReels = useMemo(() => {
    return activeReels.filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        (r.caption || '').toLowerCase().includes(q) ||
        (r.date || '').toLowerCase().includes(q)
      );
    });
  }, [activeReels, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden animate-fade-in my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#0A2618] to-emerald-900 text-white p-5 sm:p-6 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
              <Film className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">
                  Change Home Page Video Reels
                </h3>
                <span className="text-[10px] font-black uppercase bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                  {displayedHomeReels.length} of 4 Slots Filled
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Select and reorder the 4 video reels shown in the customer Home Page video showcase.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* SECTION 1: 4 ACTIVE HOME SLOTS */}
          <div className="bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-white p-4 sm:p-5 rounded-2xl border border-amber-300/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Current 4 Home Screen Slots</span>
                </h4>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Use the left/right arrows to reorder slots, or click (X) to remove a reel from the home page.
                </p>
              </div>

              {onNavigateToAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToAdmin();
                  }}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer bg-white px-3 py-1.5 rounded-full border border-emerald-200 shadow-2xs hover:bg-emerald-50 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Full Admin Reels Tab</span>
                </button>
              )}
            </div>

            {/* 4 Visual Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((slotIndex) => {
                const reel = displayedHomeReels[slotIndex];

                if (reel) {
                  return (
                    <div
                      key={reel.id}
                      className="bg-white rounded-2xl p-3 border-2 border-amber-400 shadow-xs flex flex-col justify-between space-y-2 relative group hover:border-amber-500 transition-all"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="relative w-14 h-18 rounded-xl overflow-hidden bg-gray-900 shrink-0">
                          <img
                            src={reel.thumbnailUrl}
                            alt={reel.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                            #{slotIndex + 1}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 pr-5">
                          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                            Slot {slotIndex + 1}
                          </span>
                          <h5 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight mt-0.5">
                            {reel.title}
                          </h5>
                          <span className="text-[10px] text-gray-500 block mt-1">
                            {reel.viewsCount || '1K'} views
                          </span>
                        </div>

                        {/* Remove from Home Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleHomeReel(reel)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove from home showcase"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Reorder Buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => handleMoveSlot(slotIndex, 'left')}
                          disabled={slotIndex === 0}
                          className={`p-1 rounded-lg text-xs font-bold flex items-center gap-0.5 transition-colors ${
                            slotIndex === 0
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-600 hover:bg-amber-100 hover:text-amber-900 cursor-pointer'
                          }`}
                          title="Move Left"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Move Left</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMoveSlot(slotIndex, 'right')}
                          disabled={slotIndex === displayedHomeReels.length - 1}
                          className={`p-1 rounded-lg text-xs font-bold flex items-center gap-0.5 transition-colors ${
                            slotIndex === displayedHomeReels.length - 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-600 hover:bg-amber-100 hover:text-amber-900 cursor-pointer'
                          }`}
                          title="Move Right"
                        >
                          <span className="text-[10px]">Move Right</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={`empty-slot-${slotIndex}`}
                    className="rounded-2xl p-4 border-2 border-dashed border-gray-300 bg-white/60 flex flex-col items-center justify-center text-center space-y-1 min-h-[110px]"
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-xs font-black flex items-center justify-center">
                      #{slotIndex + 1}
                    </div>
                    <span className="text-xs font-bold text-gray-500">Empty Slot {slotIndex + 1}</span>
                    <span className="text-[10px] text-gray-400">Click &quot;+ Add to Home&quot; below</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: ALL REELS SELECTION LIST */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <span>Available Nursery Reels</span>
                  <span className="text-xs font-bold text-gray-500">
                    ({filteredCatalogReels.length} total)
                  </span>
                </h4>
                <p className="text-xs text-gray-500">
                  Click on any reel to toggle whether it appears in the 4-reel showcase on the Home Page.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reels..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Catalog Grid */}
            {filteredCatalogReels.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
                <p className="text-xs text-gray-500">No reels found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredCatalogReels.map((reel) => {
                  const isDisplayed = displayedHomeReels.some((r) => r.id === reel.id);
                  const slotNumber = displayedHomeReels.findIndex((r) => r.id === reel.id) + 1;

                  return (
                    <div
                      key={reel.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isDisplayed
                          ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-gray-900 shrink-0">
                          <img
                            src={reel.thumbnailUrl}
                            alt={reel.title}
                            className="w-full h-full object-cover"
                          />
                          {isDisplayed && (
                            <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center">
                              #{slotNumber}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-gray-900 truncate leading-snug">
                            {reel.title}
                          </h5>
                          <span className="text-[10px] text-gray-500 block truncate mt-0.5">
                            {reel.viewsCount || '1K'} views • {reel.date || 'Recent'}
                          </span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            Order #{reel.displayOrder || 1}
                          </span>
                        </div>
                      </div>

                      {/* Select / Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleHomeReel(reel)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                          isDisplayed
                            ? 'bg-amber-500 hover:bg-rose-500 text-white shadow-2xs group'
                            : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-2xs'
                        }`}
                        title={isDisplayed ? 'Click to remove from Home' : 'Add to Home'}
                      >
                        {isDisplayed ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 group-hover:hidden" />
                            <X className="w-3.5 h-3.5 hidden group-hover:inline" />
                            <span className="group-hover:hidden">Slot #{slotNumber}</span>
                            <span className="hidden group-hover:inline">Remove</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-gray-500">
            Changes take effect immediately on the live Home Screen.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Done & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
