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

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  return (
    <section className="relative overflow-hidden bg-[#062416] text-white">
      <div className="relative min-h-[480px] md:min-h-[560px] flex items-center">
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
          <div className="absolute inset-0 bg-gradient-to-r from-[#041A10]/70 via-[#093520]/40 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.1),transparent_70%)] pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full">
          <div className="max-w-2xl">
            {/* Badge */}
            {currentBanner.badge && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[#A7F3D0] text-xs font-bold tracking-wider uppercase mb-5 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{currentBanner.badge}</span>
              </div>
            )}

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
              {currentBanner.title}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#D1FAE5]/90 mt-4 leading-relaxed font-normal max-w-xl">
              {currentBanner.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mt-8">
              <button
                onClick={() => onNavigate(currentBanner.ctaLink.replace('/', '') || 'plants')}
                className="px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-full font-black text-sm shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer group"
              >
                <span>{currentBanner.ctaText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {currentBanner.secondaryCtaText && (
                <button
                  onClick={() =>
                    onNavigate(
                      currentBanner.secondaryCtaLink?.replace('/', '') || 'combos'
                    )
                  }
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-sm border border-white/20 backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{currentBanner.secondaryCtaText}</span>
                </button>
              )}
            </div>

            {/* Region Notice */}
            <div className="mt-8 pt-6 border-t border-emerald-800/60 flex items-center gap-2 text-xs text-[#A7F3D0]">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
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
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? 'w-8 bg-green-400' : 'w-2 bg-white/40 hover:bg-white/70'
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
