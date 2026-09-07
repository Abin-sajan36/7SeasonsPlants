import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  HeartPulse,
  Sun,
  Droplets,
  Award,
  AlertCircle,
  CheckCircle2,
  Phone,
  ArrowRight,
  BookOpen,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface PlantCarePageProps {
  initialParam?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const PlantCarePage: React.FC<PlantCarePageProps> = ({ initialParam, onNavigate }) => {
  const { products, addToast } = useStore();

  // AI Doctor Form State
  const [plantName, setPlantName] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [environment, setEnvironment] = useState('indoor');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'doctor' | 'guides'>('doctor');

  useEffect(() => {
    if (initialParam) {
      if (initialParam.startsWith('symptom:')) {
        const sym = decodeURIComponent(initialParam.replace('symptom:', ''));
        setSelectedChips([sym]);
        setSymptoms(sym);
      }
    }
  }, [initialParam]);

  const symptomPills = [
    'Yellowing Leaves',
    'Brown Crispy Tips',
    'Drooping & Limp Stems',
    'White Powdery Mold',
    'Black Spots on Foliage',
    'Stunted New Growth',
    'Soil Smells Foul / Wet',
    'Leaves Falling Off',
  ];

  const handleToggleChip = (chip: string) => {
    let updated: string[];
    if (selectedChips.includes(chip)) {
      updated = selectedChips.filter((c) => c !== chip);
    } else {
      updated = [...selectedChips, chip];
    }
    setSelectedChips(updated);
    setSymptoms(updated.join(', '));
  };

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantName.trim() && !symptoms.trim()) {
      addToast({
        title: 'Missing Info',
        message: 'Please enter your plant name or select symptoms for diagnosis.',
        type: 'warning',
      });
      return;
    }

    setIsDiagnosing(true);
    setDiagnosisResult(null);

    try {
      const combinedSymptoms = [symptoms, ...selectedChips].filter(Boolean).join(', ');

      const res = await fetch('/api/gemini/diagnose-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantName: plantName || 'Houseplant',
          symptoms: combinedSymptoms || 'General wilting and leaf yellowing',
          environment,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDiagnosisResult(data);
        addToast({
          title: 'Diagnosis Complete 🌿',
          message: 'Personalized recovery plan ready for your plant.',
          type: 'success',
        });
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      // Offline fallback diagnosis
      setDiagnosisResult({
        diagnosis: {
          problem: 'Moisture Imbalance & Root Suffocation',
          cause: 'Overwatering combined with insufficient indirect sunlight or poor container drainage.',
          urgency: 'Medium',
          actionPlan: [
            'Check the drainage hole of your nursery pot to ensure no standing water in the saucer.',
            'Hold off watering until the top 2 inches of soil feel completely dry to the touch.',
            'Move the plant to a brighter spot with indirect morning sunlight.',
            'Trim off any fully yellowed or decayed leaves with sterilized shears.',
          ],
          preventativeTips: 'In humid Kerala/TN weather, water indoor foliage once every 4-7 days rather than daily.',
        },
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div className="bg-[#F4FAF5] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Title & Tab Switcher */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mannarathayil Nursery Plant Clinic</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-emerald-950 tracking-tight">
            Plant Doctor AI & Care Guides
          </h1>

          <p className="text-xs sm:text-sm text-gray-600">
            Expert botanical guidance tailored to South Indian tropical climates. Get instant symptom
            diagnosis powered by Gemini AI.
          </p>

          {/* Tab buttons */}
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={() => setActiveTab('doctor')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'doctor'
                  ? 'bg-gradient-to-r from-emerald-700 to-green-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-emerald-50 border border-emerald-900/10'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>Plant Doctor AI</span>
            </button>

            <button
              onClick={() => setActiveTab('guides')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'guides'
                  ? 'bg-gradient-to-r from-emerald-700 to-green-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-emerald-50 border border-emerald-900/10'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>Care Fundamentals</span>
            </button>
          </div>
        </div>

        {/* TAB 1: PLANT DOCTOR AI */}
        {activeTab === 'doctor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Form (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-5">
              <div>
                <h2 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-emerald-700" />
                  <span>Diagnose Plant Symptoms</span>
                </h2>
                <p className="text-xs text-gray-600 mt-1">
                  Describe what you're observing or tap the common symptom chips below.
                </p>
              </div>

              <form onSubmit={handleDiagnose} className="space-y-4 text-xs">
                {/* Plant Name */}
                <div>
                  <label className="font-bold text-emerald-950 block mb-1.5">
                    Plant Name or Variety (e.g. Peace Lily, Snake Plant, Hibiscus)
                  </label>
                  <input
                    type="text"
                    value={plantName}
                    onChange={(e) => setPlantName(e.target.value)}
                    placeholder="e.g. Monstera Deliciosa, Money Plant"
                    className="w-full px-4 py-2.5 bg-[#F4FAF5] text-xs text-emerald-950 rounded-full border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>

                {/* Common Symptom Chips */}
                <div>
                  <label className="font-bold text-emerald-950 block mb-1.5">
                    Tap any symptoms you notice:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {symptomPills.map((chip) => {
                      const isSelected = selectedChips.includes(chip);
                      return (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleToggleChip(chip)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {chip}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Detailed description */}
                <div>
                  <label className="font-bold text-emerald-950 block mb-1.5">
                    Additional Observations & Details
                  </label>
                  <textarea
                    rows={3}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g. The lower leaves are turning yellow and drooping, last watered 3 days ago..."
                    className="w-full p-3 bg-[#F4FAF5] text-xs text-emerald-950 rounded-2xl border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>

                {/* Environment Selection */}
                <div>
                  <label className="font-bold text-emerald-950 block mb-1.5">
                    Growing Location
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'indoor', label: 'Indoor / Bedroom' },
                      { id: 'balcony', label: 'Shaded Balcony' },
                      { id: 'outdoor', label: 'Direct Sun Garden' },
                    ].map((env) => (
                      <button
                        key={env.id}
                        type="button"
                        onClick={() => setEnvironment(env.id)}
                        className={`p-2.5 rounded-full text-xs font-semibold text-center transition-colors cursor-pointer ${
                          environment === env.id
                            ? 'bg-emerald-700 text-white font-bold'
                            : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {env.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diagnose Button */}
                <button
                  type="submit"
                  disabled={isDiagnosing}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isDiagnosing ? 'Consulting Botanical AI...' : 'Diagnose Symptoms Now'}</span>
                </button>
              </form>
            </div>

            {/* Results / Live Diagnosis Output (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              {diagnosisResult ? (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-md space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-4 border-b border-emerald-900/10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-100">
                        🌿
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-emerald-950">
                          {diagnosisResult.diagnosis.problem}
                        </h3>
                        <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                          Urgency: {diagnosisResult.diagnosis.urgency}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setDiagnosisResult(null)}
                      className="text-xs text-gray-500 hover:text-emerald-950 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Probable Cause */}
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs text-gray-700">
                    <strong className="text-emerald-950 block font-bold mb-1">
                      Probable Botanical Cause:
                    </strong>
                    <p className="leading-relaxed">{diagnosisResult.diagnosis.cause}</p>
                  </div>

                  {/* Step-by-Step Action Plan */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Recommended Treatment Steps</span>
                    </h4>
                    <ul className="space-y-2 text-xs text-gray-600">
                      {diagnosisResult.diagnosis.actionPlan.map((action: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50/80 text-emerald-950 border border-emerald-100">
                          <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-snug">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Prevention */}
                  <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950">
                    <strong className="block font-bold mb-0.5 text-amber-800">Prevention & Long Term Health:</strong>
                    <span>{diagnosisResult.diagnosis.preventativeTips}</span>
                  </div>

                  {/* WhatsApp Support CTA */}
                  <div className="pt-2">
                    <a
                      href="https://wa.me/919567274176?text=Hi%207Seasonsplants,%20I'm%20diagnosing%20my%20plant%20and%20would%20like%20expert%20human%20advice."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-[#25D366] text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-colors shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Chat with Nursery Horticulturist on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 border border-emerald-900/10 shadow-xs text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-3xl mx-auto border border-emerald-100">
                    🩺
                  </div>
                  <h3 className="text-base font-bold text-emerald-950">AI Plant Doctor Ready</h3>
                  <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                    Select your symptoms on the left to receive an immediate diagnosis, tailored recovery
                    checklist, and watering recommendations calibrated for Kerala and Tamil Nadu climates.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CARE FUNDAMENTALS */}
        {activeTab === 'guides' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Watering Card */}
              <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                  <Droplets className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-emerald-950">The 2-Inch Soil Rule</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Never water on a rigid calendar. Push your finger 2 inches deep into the soil. If damp, wait
                  2 more days. In Kerala monsoons, reduce watering frequency by 50%.
                </p>
              </div>

              {/* Sunlight Card */}
              <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                  <Sun className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-emerald-950">Bright Indirect Light</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Most tropical foliage plants thrive 3 to 5 feet from east or north-facing windows. Avoid
                  harsh midday scorching sun which burns fragile leaf tissues.
                </p>
              </div>

              {/* Fertilizer Card */}
              <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-emerald-950">Organic Feeding</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Feed with vermicompost, seaweed extract, or slow-release organic pellets once a month during
                  spring and summer active growing phases.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
