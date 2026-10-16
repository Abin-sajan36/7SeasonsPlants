import React, { useState, useMemo } from 'react';
import {
  Instagram,
  ExternalLink,
  Heart,
  Play,
  Eye,
  ArrowRight,
  Film,
  Sparkles,
  Settings,
  Plus,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { InstagramReel } from '../../types';
import { ReelPlayerModal } from '../common/ReelPlayerModal';
import { HomeReelsPickerModal } from './HomeReelsPickerModal';

interface InstagramSectionProps {
  onNavigate?: (view: string, param?: string) => void;
}

export const InstagramSection: React.FC<InstagramSectionProps> = ({ onNavigate }) => {
  const { instagramReels, isAdminAuthenticated } = useStore();
  const [activeReelModal, setActiveReelModal] = useState<InstagramReel | null>(null);
  const [isPickerModalOpen, setIsPickerModalOpen] = useState(false);

  // Filter for active reels and limit strictly to 4 reels on the home page
  const homeReels = useMemo(() => {
    const activeReels = (instagramReels || []).filter((r) => r.isActive);
    // Explicitly selected reels for home page
    const explicitlySelected = activeReels.filter((r) => r.showOnHome === true);

    // If any reel has an explicit boolean setting for showOnHome, respect it strictly
    const hasAnyExplicitConfig = activeReels.some((r) => typeof r.showOnHome === 'boolean');
    const candidateList = hasAnyExplicitConfig
      ? explicitlySelected
      : activeReels.filter((r) => r.showOnHome !== false);

    return [...candidateList]
      .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99))
      .slice(0, 4); // Strictly capped to 4 reels on home page!
  }, [instagramReels]);

  return (
    <section className="py-12 sm:py-16 bg-white border-t border-emerald-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 mb-1.5">
              <Instagram className="w-4 h-4 text-rose-500" />
              <span>JOIN OUR PLANT COMMUNITY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
              Follow us @7seasonsplants
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
              Watch real nursery walkthroughs, delicate plant packaging routines, and quick potting tips uploaded by our horticulturists.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* IN-PLACE ADMIN CONTROL: Change reels directly from home screen! */}
            {isAdminAuthenticated && (
              <button
                type="button"
                onClick={() => setIsPickerModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
                title="Change or reorder the 4 video reels shown on the home screen"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Change Reels ({homeReels.length}/4)</span>
              </button>
            )}

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('blog')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer border border-emerald-200"
              >
                <span>View All Reels on Blog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <a
              href="https://instagram.com/7seasonsplants"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Instagram className="w-4 h-4 text-rose-300" />
              <span>Follow @7seasonsplants</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </a>
          </div>
        </div>

        {/* 4 Reels Responsive Grid */}
        {homeReels.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {homeReels.map((reel, idx) => (
              <div
                key={reel.id}
                onClick={() => setActiveReelModal(reel)}
                className="group relative aspect-9/14 w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-emerald-950 shadow-xs hover:shadow-2xl transition-all duration-300 cursor-pointer border border-emerald-900/10 flex flex-col justify-between"
              >
                {/* Reel Thumbnail */}
                <img
                  src={reel.thumbnailUrl}
                  alt={reel.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                  loading="lazy"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/35 group-hover:from-emerald-950/95 group-hover:via-black/30 transition-colors duration-300" />

                {/* Top Badge: Instagram Handle & Date + Admin Slot Tag */}
                <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between gap-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/50 backdrop-blur-md text-[9px] sm:text-[10px] font-bold text-white border border-white/20">
                    <Instagram className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-400" />
                    <span className="truncate max-w-[75px] sm:max-w-none">@7seasonsplants</span>
                  </span>

                  <div className="flex items-center gap-1">
                    {isAdminAuthenticated && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPickerModalOpen(true);
                        }}
                        className="px-2 py-0.5 rounded-full bg-amber-500/90 hover:bg-amber-500 text-white text-[9px] sm:text-[10px] font-black uppercase shadow-xs transition-transform hover:scale-105 cursor-pointer flex items-center gap-0.5"
                        title="Click to swap or reorder reels"
                      >
                        <span>Slot #{idx + 1}</span>
                      </button>
                    )}

                    <span className="text-[9px] sm:text-[10px] text-white/80 font-medium">
                      {reel.date || 'Recent'}
                    </span>
                  </div>
                </div>

                {/* Center Glowing Play Button */}
                <div className="relative z-10 self-center w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/40 shadow-xl group-hover:scale-115 group-hover:bg-rose-500 group-hover:border-rose-400 transition-all duration-300">
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                </div>

                {/* Bottom Details & Stats */}
                <div className="relative z-10 p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                  <h3 className="font-extrabold text-xs sm:text-sm text-white leading-tight line-clamp-2 drop-shadow-xs group-hover:text-emerald-300 transition-colors">
                    {reel.title}
                  </h3>

                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold pt-1.5 border-t border-white/20 text-white/90">
                    <span className="flex items-center gap-1 text-emerald-300">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{reel.viewsCount || '1K'}</span>
                    </span>

                    <span className="flex items-center gap-1 text-rose-300">
                      <Heart className="w-3.5 h-3.5 fill-current text-rose-400" />
                      <span>{reel.likesCount || 0}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center bg-emerald-50/70 rounded-3xl border border-emerald-900/10 space-y-3">
            <Film className="w-8 h-8 text-emerald-700/60 mx-auto" />
            <p className="text-xs sm:text-sm font-semibold text-gray-700 max-w-md mx-auto">
              No video reels currently selected for the home page showcase.
            </p>
            {isAdminAuthenticated && (
              <button
                type="button"
                onClick={() => setIsPickerModalOpen(true)}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Select 4 Reels for Home Screen</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reel Playback Modal */}
      <ReelPlayerModal reel={activeReelModal} onClose={() => setActiveReelModal(null)} />

      {/* Admin In-Place Reel Picker Modal */}
      {isAdminAuthenticated && (
        <HomeReelsPickerModal
          isOpen={isPickerModalOpen}
          onClose={() => setIsPickerModalOpen(false)}
          onNavigateToAdmin={() => onNavigate?.('admin', 'reels')}
        />
      )}
    </section>
  );
};
