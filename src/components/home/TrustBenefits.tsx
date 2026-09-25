import React from 'react';
import { ShieldCheck, Sparkles, Box, Truck, BookOpen } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const TrustBenefits: React.FC = () => {
  const { storeSettings } = useStore();
  const whatsapp = storeSettings?.whatsapp || storeSettings?.whatsappNumber || '+91 88482 76403';

  const benefits = [
    {
      icon: ShieldCheck,
      title: 'Carefully Selected Plants',
      description: 'Healthy, acclimated specimens nurtured at Mannaratharayil Gardens LLP with robust root systems.',
      color: 'text-emerald-700 bg-emerald-50 border border-emerald-100',
    },
    {
      icon: Sparkles,
      title: 'Curated Plant Combos',
      description: 'Expertly paired plant bundles with matching care rhythms and up to 35% bundled savings.',
      color: 'text-amber-600 bg-amber-50 border border-amber-100',
    },
    {
      icon: Box,
      title: 'Safe 5-Ply Packaging',
      description: 'Ventilated root pods and shock-resistant cartons protect foliage safely during transit.',
      color: 'text-emerald-800 bg-green-50 border border-green-100',
    },
    {
      icon: Truck,
      title: 'Kerala & Tamil Nadu Shipping',
      description: 'Direct dispatch to all PIN codes across Kerala and Tamil Nadu in 2-4 business days.',
      color: 'text-cyan-700 bg-cyan-50 border border-cyan-100',
    },
    {
      icon: BookOpen,
      title: 'Expert Care Guidance',
      description: `Free WhatsApp support (${whatsapp}) and our 7Seasons Plant Doctor AI tool.`,
      color: 'text-rose-600 bg-rose-50 border border-rose-100',
    },
  ];

  return (
    <section className="py-6 sm:py-10 bg-emerald-50/40 border-b border-emerald-900/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-5">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            const isLastOnMobile = idx === benefits.length - 1;
            return (
              <div
                key={idx}
                className={`p-3.5 sm:p-5 rounded-2xl bg-white border border-emerald-900/8 hover:border-emerald-500/40 hover:shadow-md transition-all duration-300 flex flex-col items-start ${
                  isLastOnMobile ? 'col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-2.5 sm:mb-3.5 ${benefit.color}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-emerald-950 mb-1 leading-snug">
                  {benefit.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-600 leading-normal sm:leading-relaxed font-normal">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
