import React from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { TrustBenefits } from '../components/home/TrustBenefits';
import { FeaturedCombosSection } from '../components/home/FeaturedCombosSection';
import { BestSellersSection } from '../components/home/BestSellersSection';
import { PlantCarePreview } from '../components/home/PlantCarePreview';
import { ReviewsSection } from '../components/home/ReviewsSection';
import { InstagramSection } from '../components/home/InstagramSection';
import { FAQSection } from '../components/home/FAQSection';

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

      {/* 3. Signature Plant Combos Spotlight */}
      <FeaturedCombosSection onNavigate={onNavigate} />

      {/* 4. Best Selling Plants Grid */}
      <BestSellersSection onNavigate={onNavigate} />

      {/* 5. Plant Doctor AI & Care Guidance */}
      <PlantCarePreview onNavigate={onNavigate} />

      {/* 6. Verified Customer Reviews */}
      <ReviewsSection onNavigate={onNavigate} />

      {/* 7. Instagram Nursery Feed */}
      <InstagramSection />

      {/* 8. FAQ Section */}
      <FAQSection />
    </div>
  );
};
