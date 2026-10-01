import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Instagram,
  Heart,
  Eye,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Share2,
  Check,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { InstagramReel } from '../../types';
import { getInstagramEmbedUrl, isDirectVideoUrl, formatInstagramReelUrl } from '../../lib/instagram';

interface ReelPlayerModalProps {
  reel: InstagramReel | null;
  onClose: () => void;
}

export const ReelPlayerModal: React.FC<ReelPlayerModalProps> = ({ reel, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [embedLoadFailed, setEmbedLoadFailed] = useState(false);
  const [viewMode, setViewMode] = useState<'embed' | 'card'>('embed');
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Determine if direct video stream exists
  const hasDirectVideo = Boolean(reel?.videoUrl && isDirectVideoUrl(reel.videoUrl) && !videoError);
  const embedUrl = reel ? (reel.embedUrl || getInstagramEmbedUrl(reel.reelUrl)) : null;

  // Sync state whenever the active reel changes
  useEffect(() => {
    if (reel) {
      setLikeCount(reel.likesCount || 0);
      setHasLiked(false);
      setVideoError(false);
      setEmbedLoadFailed(false);
      // If we have an embed or direct video, default to embed/playback mode
      setViewMode(embedUrl || hasDirectVideo ? 'embed' : 'card');
    }
  }, [reel, embedUrl, hasDirectVideo]);

  // Handle ESC key and browser popstate (Back button closes modal instead of page getting stuck)
  useEffect(() => {
    if (!reel) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    // Freeze body scroll while modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
      document.body.style.overflow = originalOverflow;
    };
  }, [reel, onClose]);

  // Handle video element play/pause only if direct video is active
  useEffect(() => {
    if (videoRef.current && hasDirectVideo) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(() => {});
          }
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, hasDirectVideo]);

  if (!reel) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasLiked) {
      setHasLiked(false);
      setLikeCount((prev) => Math.max(0, prev - 1));
    } else {
      setHasLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const urlToCopy = reel.reelUrl || 'https://www.instagram.com/7seasonsplants/';
    navigator.clipboard.writeText(urlToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const directInstagramUrl = formatInstagramReelUrl(reel.reelUrl || 'https://www.instagram.com/7seasonsplants/');

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* 1. Global High-Contrast Floating Close Button - Top Right */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close reel player"
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[220] bg-white text-emerald-950 px-3 py-2 rounded-full shadow-2xl hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer border border-emerald-900/20 flex items-center gap-1.5 font-bold text-xs group"
      >
        <X className="w-5 h-5 text-emerald-950 group-hover:rotate-90 transition-transform duration-200" />
        <span className="hidden sm:inline">Close</span>
      </button>

      {/* 2. Main Reel Player Card */}
      <div
        className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full overflow-hidden shadow-2xl border border-emerald-900/20 my-auto flex flex-col relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: 'calc(100vh - 24px)' }}
      >
        {/* Top Navigation Bar: Back & Close Controls */}
        <div className="p-3 sm:p-3.5 bg-gradient-to-r from-[#062416] via-[#0A2618] to-emerald-950 text-white flex items-center justify-between shrink-0 border-b border-emerald-800/40">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-200 hover:text-white transition-colors cursor-pointer bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-full"
            title="Return to Articles & Blog"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blog</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-800/40">
              <Instagram className="w-3 h-3 text-rose-400" />
              <span>@7seasonsplants</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-rose-600 text-white transition-colors cursor-pointer"
              title="Close modal"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media / Video Stage */}
        <div className="relative bg-black w-full flex items-center justify-center overflow-hidden shrink-0 min-h-[300px] max-h-[50vh] sm:max-h-[55vh]">
          {/* Option A: Direct HTML5 Video Stream (.mp4/.webm ONLY) */}
          {hasDirectVideo ? (
            <div className="relative w-full h-full aspect-9/14">
              <video
                ref={videoRef}
                src={reel.videoUrl}
                poster={reel.thumbnailUrl}
                playsInline
                autoPlay
                loop
                muted={isMuted}
                onError={() => setVideoError(true)}
                onClick={togglePlay}
                className="w-full h-full object-cover cursor-pointer"
              />

              {/* Video Overlay Controls */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3.5 bg-gradient-to-t from-black/80 via-transparent to-black/30">
                <div className="flex items-center justify-between pointer-events-auto">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/20 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Nursery Video</span>
                  </span>

                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors pointer-events-auto cursor-pointer border border-white/20"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
                  </button>
                </div>

                {!isPlaying && (
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="self-center p-3.5 rounded-full bg-emerald-600/95 text-white shadow-2xl pointer-events-auto hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-white/60"
                  >
                    <Play className="w-7 h-7 fill-current ml-0.5" />
                  </button>
                )}

                <div className="pointer-events-auto flex items-center justify-between text-[11px] text-white/90">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                  <span className="text-[10px] text-white/70">Tap video to pause</span>
                </div>
              </div>
            </div>
          ) : viewMode === 'embed' && embedUrl && !embedLoadFailed ? (
            /* Option B: Official Instagram Embed Player */
            <div className="w-full h-full min-h-[340px] max-h-[52vh] relative bg-emerald-950 flex flex-col justify-center">
              <iframe
                src={embedUrl}
                className="w-full h-full min-h-[340px] border-0"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
                onError={() => setEmbedLoadFailed(true)}
                title={reel.title}
              />
            </div>
          ) : (
            /* Option C: Poster Showcase with Direct Watch on Instagram Action */
            <div className="w-full h-full relative aspect-9/14">
              <img
                src={reel.thumbnailUrl}
                alt={reel.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30 flex flex-col justify-between p-4 text-white">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/20">
                    <Instagram className="w-3 h-3 text-rose-400" />
                    <span>Instagram Reel</span>
                  </span>
                  <span className="text-[10px] text-white/80 font-medium">
                    {reel.date || 'Recent'}
                  </span>
                </div>

                {/* Big Center Action to Watch directly on Instagram */}
                <div className="self-center text-center space-y-2.5">
                  <a
                    href={directInstagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-white/80 group/play"
                    title="Watch Reel on Instagram"
                  >
                    <Play className="w-7 h-7 fill-current ml-1 text-white group-hover/play:scale-110 transition-transform" />
                  </a>
                  <div>
                    <p className="text-xs font-black tracking-wide text-white drop-shadow-md">
                      Watch Video on Instagram
                    </p>
                    <p className="text-[10px] text-white/75 mt-0.5">
                      Opens official @7seasonsplants Reel
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-white/20">
                  <span className="flex items-center gap-1.5 text-white/95">
                    <Eye className="w-4 h-4 text-emerald-300" />
                    <span>{reel.viewsCount || '1K'} views</span>
                  </span>
                  <span className="flex items-center gap-1 text-rose-300">
                    <Heart className="w-4 h-4 fill-current text-rose-400" />
                    <span>{likeCount} likes</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Details & Actions Drawer */}
        <div className="p-4 sm:p-5 space-y-3 bg-white overflow-y-auto flex-1">
          {/* Switcher & Status Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-xs">
            <span className="text-[11px] font-bold text-gray-500">
              {reel.date || 'Recent nursery upload'}
            </span>

            <div className="flex items-center gap-1">
              {embedUrl && (
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'embed' ? 'card' : 'embed')}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-600 hover:text-emerald-800 bg-gray-100 hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  {viewMode === 'embed' ? 'Switch to Card' : 'Embed Player'}
                </button>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-black text-sm sm:text-base text-emerald-950 leading-snug">
              {reel.title}
            </h4>
            {reel.caption && (
              <p className="text-xs text-gray-600 mt-1.5 line-clamp-3 leading-relaxed">
                {reel.caption}
              </p>
            )}
          </div>

          {/* Social Interactions Bar */}
          <div className="flex items-center justify-between py-2 border-y border-gray-100 text-xs">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleLike}
                className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                  hasLiked ? 'text-rose-600' : 'text-gray-600 hover:text-rose-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current text-rose-500' : ''}`} />
                <span>{likeCount}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 font-medium text-gray-600 hover:text-emerald-700 transition-colors cursor-pointer"
                title="Share Reel Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied Link!' : 'Share'}</span>
              </button>
            </div>

            <div className="text-[11px] text-gray-400 font-medium">
              <span>{reel.viewsCount || '1K'} views</span>
            </div>
          </div>

          {/* Primary Action Buttons: Open on Instagram & Close Button */}
          <div className="space-y-2 pt-1">
            <a
              href={directInstagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:opacity-95 text-white rounded-full text-xs font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Instagram className="w-4 h-4" />
              <span>Watch on Instagram App / Web</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close Video Player</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
