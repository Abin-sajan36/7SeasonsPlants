import React from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { TrustBenefits } from '../components/home/TrustBenefits';
import { CategorySection } from '../components/home/CategorySection';
import { DailyDealsSection } from '../components/home/DailyDealsSection';
import { FeaturedCombosSection } from '../components/home/FeaturedCombosSection';
import { BestSellersSection } from '../components/home/BestSellersSection';
import { PlantCarePreview } from '../components/home/PlantCarePreview';
import { ReviewsSection } from '../components/home/ReviewsSection';
import { InstagramSection } from '../components/home/InstagramSection';
import { NewsletterSection } from '../components/home/NewsletterSection';

interface HomePageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-0">
      {/* 1. Hero Carousel Banner */}
      <HeroBanner onNavigate={onNavigate} />

      {/* 2. Trust Benefits Bar */}
      <TrustBenefits />

      {/* 3. Category Exploration */}
      <CategorySection onNavigate={onNavigate} />

      {/* 4. Daily Deals with Live Countdown */}
      <DailyDealsSection onNavigate={onNavigate} />

      {/* 5. Signature Plant Combos Spotlight */}
      <FeaturedCombosSection onNavigate={onNavigate} />

      {/* 6. Best Selling Plants Grid */}
      <BestSellersSection onNavigate={onNavigate} />

      {/* 7. Plant Doctor AI & Care Guidance */}
      <PlantCarePreview onNavigate={onNavigate} />

      {/* 8. Verified Customer Reviews */}
      <ReviewsSection />

      {/* 9. Instagram Nursery Feed */}
      <InstagramSection />

      {/* 10. Botanical VIP Newsletter */}
      <NewsletterSection />
    </div>
  );
};
