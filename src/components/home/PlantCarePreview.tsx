import React from 'react';
import { Sparkles, ArrowRight, Activity, Sun, Droplets, HeartPulse, CheckCircle2 } from 'lucide-react';

interface PlantCarePreviewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const PlantCarePreview: React.FC<PlantCarePreviewProps> = ({ onNavigate }) => {
  const commonSymptoms = [
    'Yellowing Foliage',
    'Brown Crispy Tips',
    'Drooping Stems',
    'White Powdery Spots',
    'Slow Growth & Pale Leaves',
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#062B1A] via-[#0A3D25] to-[#041D12] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          {/* Background botanical illustration decoration */}
          <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-[#10b981]/20 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Content: Description & AI Feature */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#10b981]/20 border border-[#34d399]/40 text-[#A7F3D0] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI-Powered Botanical Assistant</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                7Seasons Plant Doctor AI & Care Guidance
              </h2>

              <p className="text-xs sm:text-sm text-[#D1FAE5]/90 leading-relaxed font-normal">
                Struggling with leaf discoloration, drooping stems, or watering confusion?
                Our Gemini-powered plant doctor analyzes your plant's symptoms and provides instant,
                personalized recovery steps tailored to South Indian climate conditions.
              </p>

              {/* Symptom pills */}
              <div className="pt-2">
                <p className="text-xs font-bold text-amber-300 mb-2">Instant diagnosis for common issues:</p>
                <div className="flex flex-wrap gap-2">
                  {commonSymptoms.map((sym, idx) => (
                    <button
                      key={idx}
                      onClick={() => onNavigate('plant-care', `symptom:${encodeURIComponent(sym)}`)}
                      className="text-xs bg-[#022c22]/80 hover:bg-[#064e3b] border border-[#047857]/50 text-[#D1FAE5] px-3.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Activity className="w-3 h-3 text-amber-300" />
                      <span>{sym}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('plant-care', 'tool:doctor')}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-full font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <HeartPulse className="w-4 h-4" />
                  <span>Launch Plant Doctor AI</span>
                </button>

                <button
                  onClick={() => onNavigate('plant-care')}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Care Guides Library</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Card: Quick Nursery Care Principles */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Nursery Care Tips</span>
              </h3>

              <div className="space-y-3 text-xs text-[#D1FAE5]">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-black/25 border border-[#065f46]/40">
                  <Droplets className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">The 2-Inch Soil Finger Test</strong>
                    <span>Water only when top 2 inches feel dry to touch. Overwatering is the #1 cause of root rot.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-black/25 border border-[#065f46]/40">
                  <Sun className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Bright, Indirect Tropical Sunlight</strong>
                    <span>Keep plants near east or north-facing windows away from scorching direct afternoon heat.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-black/25 border border-[#065f46]/40">
                  <Activity className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Free WhatsApp Consultations</strong>
                    <span>Chat directly with Mannarathayil Nursery horticulturists via +91 95672 74176.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
