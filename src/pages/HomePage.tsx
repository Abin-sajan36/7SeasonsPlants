import React from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { TrustBenefits } from '../components/home/TrustBenefits';
import { FeaturedCombosSection } from '../components/home/FeaturedCombosSection';
import { CustomerComplaintSection } from '../components/home/CustomerComplaintSection';
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

      {/* 3. Signature Plant Combos Spotlight ("Curated Plant Combos") */}
      <FeaturedCombosSection onNavigate={onNavigate} />

      {/* 4. Raise a Customer Complaint Desk & Pop-up Trigger */}
      <CustomerComplaintSection onNavigate={onNavigate} />

      {/* 5. Best Selling Plant Combos Grid */}
      <BestSellersSection onNavigate={onNavigate} />

      {/* 5. Plant Doctor AI & Care Guidance */}
      <PlantCarePreview onNavigate={onNavigate} />

      {/* 6. Verified Customer Reviews */}
      <ReviewsSection onNavigate={onNavigate} />

      {/* 7. Instagram Nursery Feed */}
      <InstagramSection onNavigate={onNavigate} />

      {/* 8. FAQ Section */}
      <FAQSection />
    </div>
  );
};
