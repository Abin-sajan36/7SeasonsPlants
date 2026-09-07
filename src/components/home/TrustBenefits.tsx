import React from 'react';
import { ShieldCheck, Sparkles, Box, Truck, BookOpen } from 'lucide-react';

export const TrustBenefits: React.FC = () => {
  const benefits = [
    {
      icon: ShieldCheck,
      title: 'Carefully Selected Plants',
      description: 'Healthy, acclimated specimens nurtured at Mannarathayil Nursery with robust root systems.',
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
      description: 'Free WhatsApp support (+91 95672 74176) and our 7Seasons Plant Doctor AI tool.',
      color: 'text-rose-600 bg-rose-50 border border-rose-100',
    },
  ];

  return (
    <section className="py-10 bg-emerald-50/40 border-b border-emerald-900/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-emerald-900/8 hover:border-emerald-500/40 hover:shadow-lg transition-all duration-300 flex flex-col items-start"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3.5 ${benefit.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-emerald-950 mb-1.5 leading-snug">
                  {benefit.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed font-normal">
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
