import React from 'react';
import { ShieldCheck, Truck, Sparkles, Award, MapPin, Phone, Heart } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[#F4FAF5] min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#062919] via-[#0D4A2B] to-[#0A3D22] text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-xl border border-emerald-800/30">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A7F3D0] bg-white/10 px-3 py-1 rounded-full border border-white/20 inline-flex items-center gap-1.5 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Grown With Love at Mannarathayil Nursery
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-white">
              Rooted in Nature, Cultivated for Your Home
            </h1>

            <p className="text-xs sm:text-sm text-[#D1FAE5]/90 leading-relaxed font-normal">
              7Seasonsplants is the dedicated online e-commerce destination of <strong>Mannarathayil Nursery</strong>, bringing over decades of horticultural mastery directly to plant parents across Kerala and Tamil Nadu.
            </p>
          </div>
        </div>

        {/* Nursery Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-emerald-950">Our Story & Heritage</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Founded on the belief that every living space thrives with green companionship, Mannarathayil Nursery cultivates over 150+ varieties of exotic, indoor, and tropical foliage plants.
            </p>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Each plant is acclimatized to South Indian weather patterns, potted in nutrient-rich organic soil blends, and inspected thoroughly for strong root systems before dispatch.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-md border border-emerald-900/10">
            <img
              src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80"
              alt="Nursery greenhouse"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs space-y-2 hover:border-emerald-500/30 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
              🌿
            </div>
            <h3 className="text-sm font-black text-emerald-950">Acclimatized Plants</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Grown in tropical climates ensuring zero shock upon arrival in Kerala or TN.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs space-y-2 hover:border-emerald-500/30 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
              📦
            </div>
            <h3 className="text-sm font-black text-emerald-950">5-Ply Transit Shield</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Reinforced boxes with soil-lock wrap to keep foliage upright and fresh.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs space-y-2 hover:border-emerald-500/30 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
              ✨
            </div>
            <h3 className="text-sm font-black text-emerald-950">Curated Combos</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Harmoniously paired bundles with synchronized watering and up to 35% savings.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs space-y-2 hover:border-emerald-500/30 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
              🩺
            </div>
            <h3 className="text-sm font-black text-emerald-950">AI Plant Clinic</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              24/7 Gemini-powered diagnosis plus direct WhatsApp horticulturist guidance.
            </p>
          </div>
        </div>

        {/* Nursery Location Card */}
        <div className="bg-white rounded-3xl p-8 border border-emerald-900/10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Mannarathayil Nursery Hub</span>
            </div>
            <h3 className="text-xl font-bold text-emerald-950">Visit Our Greenhouses</h3>
            <p className="text-xs text-gray-600 leading-relaxed max-w-lg">
              Operating our primary propagation nursery in Kerala with direct courier connections across all districts of Kerala and Tamil Nadu.
            </p>
          </div>

          <button
            onClick={() => onNavigate('contact')}
            className="px-6 py-3 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer"
          >
            Contact Nursery Team
          </button>
        </div>
      </div>
    </div>
  );
};
