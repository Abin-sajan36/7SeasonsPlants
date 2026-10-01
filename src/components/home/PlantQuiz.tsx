import React, { useState } from 'react';
import { Sparkles, ArrowRight, Sun, Droplets, Home, Check } from 'lucide-react';

import { useStore } from '../../context/StoreContext';

const QUESTIONS = [
  {
    id: 'light',
    title: 'How much sunlight does your space get?',
    options: [
      { id: 'bright-direct', label: 'Bright Direct', desc: 'Sunny window, gets direct sun', icon: Sun },
      { id: 'bright-indirect', label: 'Bright Indirect', desc: 'Well-lit room, no direct sun', icon: Sun },
      { id: 'low-light', label: 'Low Light', desc: 'North-facing window, dimly lit', icon: Sun },
    ]
  },
  {
    id: 'attention',
    title: 'How often do you want to water your plant?',
    options: [
      { id: 'often', label: 'Frequently', desc: 'I love tending to my plants daily', icon: Droplets },
      { id: 'moderate', label: 'Weekly', desc: 'Once a week is perfect for me', icon: Droplets },
      { id: 'rarely', label: 'Rarely', desc: 'I might forget for weeks (cactus vibe)', icon: Droplets },
    ]
  },
  {
    id: 'space',
    title: 'Where will this plant live?',
    options: [
      { id: 'floor', label: 'On the Floor', desc: 'Looking for a large statement piece', icon: Home },
      { id: 'desk', label: 'Table / Desk', desc: 'Something small and cute', icon: Home },
      { id: 'hanging', label: 'Hanging', desc: 'I have ceiling hooks ready', icon: Home },
    ]
  }
];

export const PlantQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  
  
  const { products } = useStore();

  const handleSelect = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [QUESTIONS[currentStep].id]: optionId }));
    
    setTimeout(() => {
      if (currentStep < QUESTIONS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 400);
  };
  
  const getMatches = () => {
    // Simple mock logic for matching
    let matches = [...products];
    
    if (answers.light === 'low-light') {
      matches = matches.filter(p => (p.attributes?.light || '').toLowerCase().includes('low'));
    } else if (answers.light === 'bright-direct') {
      matches = matches.filter(p => (p.attributes?.light || '').toLowerCase().includes('bright') || (p.attributes?.light || '').toLowerCase().includes('direct'));
    }
    
    if (answers.attention === 'rarely') {
      matches = matches.filter(p => (p.attributes?.water || '').toLowerCase().includes('low') || (p.attributes?.water || '').toLowerCase().includes('dry'));
    }
    
    // Fallback if filtering was too aggressive
    if (matches.length === 0) {
      matches = products.slice(0, 3);
    }
    
    return matches.slice(0, 3); // top 3 recommendations
  };

  const matches = isFinished ? getMatches() : [];

  if (isFinished) {
    return (
      <section className="py-20 px-6 sm:px-12 xl:px-0 max-w-7xl mx-auto">
        <div className="bg-[#F4FAF5] rounded-3xl p-8 md:p-12 border border-emerald-900/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-emerald-950 mb-4">Your Perfect Matches</h2>
            <p className="text-emerald-800/80 text-lg">
              Based on your space and lifestyle, we think you'll love these green companions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {matches.map(plant => (
              <div key={plant.id} className="bg-white rounded-2xl p-4 border border-emerald-900/10 shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-emerald-50">
                  <img src={plant.images?.[0]} alt={plant.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-emerald-950 mb-1">{plant.name}</h3>
                <p className="text-emerald-600 font-bold mb-3">₹{plant.price}</p>
                <button 
                  onClick={() => window.location.href = `/product/${plant.slug}`}
                  className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl transition-colors text-sm"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center relative z-10">
            <button 
              onClick={() => {
                setAnswers({});
                setCurrentStep(0);
                setIsFinished(false);
              }}
              className="text-emerald-700 font-bold hover:text-emerald-900 text-sm"
            >
              Retake the Quiz
            </button>
          </div>
        </div>
      </section>
    );
  }

  const question = QUESTIONS[currentStep];

  return (
    <section className="py-20 px-6 sm:px-12 xl:px-0 max-w-7xl mx-auto">
      <div className="bg-[#1a3628] rounded-3xl p-8 md:p-12 relative overflow-hidden text-white">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2a4d3b] rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0a1f18] rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 mb-6">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span className="text-sm font-bold tracking-wide text-emerald-50">Find Your Match</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              Not sure which plant to get?
            </h2>
            <p className="text-emerald-100/80 text-lg mb-8 max-w-md">
              Take our 3-question quiz to find plants perfectly tailored to your space and lifestyle.
            </p>
            
            {/* Progress indicators */}
            <div className="flex gap-2">
              {QUESTIONS.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === currentStep ? 'w-8 bg-emerald-400' : 
                    idx < currentStep ? 'w-4 bg-emerald-400/60' : 'w-4 bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-bold mb-6">
              {question.title}
            </h3>
            
            <div className="space-y-3">
              {question.options.map(option => {
                const Icon = option.icon;
                const isSelected = answers[question.id] === option.id;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className={`w-full flex items-center p-4 rounded-xl transition-all duration-300 border cursor-pointer text-left ${
                      isSelected 
                        ? 'bg-emerald-500/20 border-emerald-400 text-white' 
                        : 'bg-white/5 border-white/10 text-emerald-50 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mr-4 transition-colors ${
                      isSelected ? 'bg-emerald-400 text-emerald-950' : 'bg-white/10 text-emerald-200'
                    }`}>
                      {isSelected ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-bold">{option.label}</div>
                      <div className="text-xs opacity-70 mt-0.5">{option.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
