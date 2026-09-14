import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const FAQS = [
  {
    question: "How do you ensure plants survive shipping?",
    answer: "We use custom-designed, eco-friendly packaging that securely holds the plant pot in place while protecting the foliage. Our boxes have built-in ventilation, and we water the plants optimally just before dispatch to ensure they arrive fresh."
  },
  {
    question: "What is your return or replacement policy?",
    answer: "We offer a 7-day Plant Health Guarantee. If your plant arrives damaged or perishes within 7 days despite proper care, simply share a photo with our support team, and we will send a free replacement—no questions asked."
  },
  {
    question: "How do I know when to water my new plant?",
    answer: "Each plant comes with a detailed care card. As a general rule, check the top 1-2 inches of soil; if it feels completely dry to the touch, it is time to water. You can also use our Plant Doctor AI for specific, tailored advice."
  },
  {
    question: "Do you deliver all across India?",
    answer: "Currently, we specialize in prompt deliveries across Kerala and Tamil Nadu to ensure maximum freshness and minimum transit time. We are expanding to other regions soon!"
  },
  {
    question: "Are the decorative pots included?",
    answer: "Our curated Plant Combos include the decorative pots exactly as shown in the pictures. For individual plant purchases, they typically arrive in nursery grower pots unless a specific decorative pot is selected as an add-on."
  }
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-[#F4FAF5]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full mb-4 text-emerald-600">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-emerald-950">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-sm text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about plant care, shipping, and returns to ensure a seamless green journey.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => (
            <div 
              key={index} 
              className={`border rounded-2xl overflow-hidden transition-colors duration-200 ${
                openIndex === index ? 'border-emerald-500 bg-white shadow-sm' : 'border-emerald-900/10 bg-white hover:border-emerald-200'
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none cursor-pointer"
              >
                <span className="font-bold text-sm sm:text-base text-emerald-950 pr-8">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-emerald-600 shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="p-5 sm:p-6 pt-0 text-sm text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
