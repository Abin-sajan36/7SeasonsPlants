import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';

interface HeroBannerProps {
  onNavigate: (view: string, param?: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onNavigate }) => {
  const { banners } = useStore();
  const activeBanners = banners.filter((b) => b.isActive).sort((a, b) => a.displayOrder - b.displayOrder);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Auto slide carousel every 6 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex];

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Helper to resolve button text and links so customers cannot access individual plants
  const resolveCta = (rawText: string | undefined, rawLink: string | undefined, isSecondary = false) => {
    let text = (rawText || '').trim();
    let link = (rawLink || '').replace(/^\//, '').trim();

    // Prevent any access to individual plant listings (redirect to curated combos or care guides)
    if (!link || link === 'plants' || link.startsWith('plants?') || link.startsWith('product-detail')) {
      link = isSecondary ? 'plant-care' : 'combos';
    }

    if (!text || /shop\s*plants/i.test(text) || /buy\s*plants/i.test(text)) {
      text = isSecondary ? 'Explore Combos' : 'Explore Plant Combos';
      link = 'combos';
    } else if (/best\s*sellers?/i.test(text)) {
      text = isSecondary ? 'Top Combos' : 'Best Selling Combos';
      link = 'combos';
    } else if (/all\s*plants/i.test(text)) {
      text = 'View All Combos';
      link = 'combos';
    }

    return { text, link };
  };

  const primaryCta = resolveCta(currentBanner.ctaText, currentBanner.ctaLink, false);
  const secondaryCta = currentBanner.secondaryCtaText
    ? resolveCta(currentBanner.secondaryCtaText, currentBanner.secondaryCtaLink, true)
    : null;

  // Sanitize subtitle if it references shopping individual plants
  const displaySubtitle = currentBanner.subtitle
    ? currentBanner.subtitle.replace(/beautiful plants and /i, 'Curated plant collections and ')
    : currentBanner.subtitle;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  return (
    <section
      className="relative overflow-hidden bg-[#062416] text-white select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative min-h-[420px] sm:min-h-[480px] md:min-h-[560px] flex items-center">
        {/* Background Image with botanical gradient overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#062416]">
          <AnimatePresence>
            <motion.img
              key={currentBanner.id || currentIndex}
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              initial={{ scale: 1.15, x: '2%', opacity: 0 }}
              animate={{ scale: 1.15, x: '-2%', opacity: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 1 },
                x: { duration: 25, ease: 'linear', repeat: Infinity, repeatType: 'reverse' },
              }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-[#041A10]/80 via-[#093520]/50 to-[#041A10]/20 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.1),transparent_70%)] pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 pb-14 sm:pb-16 relative z-10 w-full">
          <div className="max-w-2xl">
            {/* Badge */}
            {currentBanner.badge && (
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[#A7F3D0] text-[11px] sm:text-xs font-bold tracking-wider uppercase mb-3.5 sm:mb-5 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{currentBanner.badge}</span>
              </div>
            )}

            {/* Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
              {currentBanner.title}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base lg:text-lg text-[#D1FAE5]/90 mt-2.5 sm:mt-4 leading-relaxed font-normal max-w-xl">
              {displaySubtitle}
            </p>

            {/* CTA Buttons - Strictly Plant Combos & Nursery Care, No Individual Plants */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 mt-6 sm:mt-8">
              <button
                onClick={() => onNavigate(primaryCta.link)}
                className="w-full sm:w-auto justify-center px-6 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-full font-black text-xs sm:text-sm shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer group"
              >
                <span>{primaryCta.text}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {secondaryCta && (
                <button
                  onClick={() => onNavigate(secondaryCta.link)}
                  className="w-full sm:w-auto justify-center px-5 sm:px-6 py-2.5 sm:py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{secondaryCta.text}</span>
                </button>
              )}
            </div>

            {/* Region Notice */}
            <div className="mt-5 sm:mt-8 pt-4 sm:pt-6 border-t border-emerald-800/60 flex items-center gap-2 text-[11px] sm:text-xs text-[#A7F3D0]">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
              <span>
                Prompt Nursery Dispatch across <strong>Kerala & Tamil Nadu</strong> • Safe 5-Ply Packaging
              </span>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-emerald-800/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors hidden sm:flex cursor-pointer border border-white/10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-emerald-800/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors hidden sm:flex cursor-pointer border border-white/10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Carousel Dots */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-3.5 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? 'w-6 sm:w-8 bg-green-400' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
