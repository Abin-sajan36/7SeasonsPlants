import React from 'react';
import {
  Phone,
  Mail,
  Instagram,
  MapPin,
  ShieldCheck,
  Truck,
  Heart,
  Sparkles,
  CreditCard,
  Lock,
  MessageCircle,
} from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#0A2618] text-[#E2F5EA] border-t border-emerald-800/40">
      {/* Top Value Banner */}
      <div className="border-b border-emerald-800/50 py-8 bg-[#071F13]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Kerala & Tamil Nadu Express</h4>
              <p className="text-xs text-[#A7F3D0]/75">Delivered in 2-4 business days</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">5-Ply Safe Box Packaging</h4>
              <p className="text-xs text-[#A7F3D0]/75">100% Healthy Plant Guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Curated Plant Combos</h4>
              <p className="text-xs text-[#A7F3D0]/75">Bundled with savings up to 35%</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Secure Online Payment</h4>
              <p className="text-xs text-[#A7F3D0]/75">Powered by Razorpay (No COD)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4-Column Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/95 p-3 rounded-2xl inline-block shadow-md">
              <Logo variant="dark" size="md" />
            </div>
            <p className="text-xs text-[#D1FAE5]/80 leading-relaxed max-w-sm">
              7Seasons is an online plant nursery delivering vibrant, fresh, nursery-grown tropical plants
              and curated plant combinations directly from Mannarathayil Nursery across Kerala and Tamil Nadu.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-700/40 text-xs text-[#A7F3D0]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Nursery Open 7 Days • Express Shipping</span>
              </div>
            </div>
          </div>

          {/* Col 2: Shop & Categories */}
          <div>
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3.5">
              Shop Greenery
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('combos')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 font-bold text-white cursor-pointer"
                >
                  <span>Plant Combos</span>
                  <span className="text-[9px] bg-rose-500 text-white font-extrabold px-1.5 py-0.5 rounded-full">
                    SAVE 35%
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('plants')}
                  className="text-[#A7F3D0]/80 hover:text-white transition-colors cursor-pointer"
                >
                  All Nursery Plants
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('plants', 'category:Indoor Plants')}
                  className="text-[#A7F3D0]/80 hover:text-white transition-colors cursor-pointer"
                >
                  Indoor Air Purifiers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('plants', 'category:Flowering Plants')}
                  className="text-[#A7F3D0]/80 hover:text-white transition-colors cursor-pointer"
                >
                  Tropical Flowering
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('plants', 'category:Low Maintenance')}
                  className="text-[#A7F3D0]/80 hover:text-white transition-colors cursor-pointer"
                >
                  Low Maintenance Plants
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('plants', 'category:Succulents & Cactus')}
                  className="text-[#A7F3D0]/80 hover:text-white transition-colors cursor-pointer"
                >
                  Succulents & Desert Rose
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home', 'section:deals')}
                  className="hover:text-amber-200 transition-colors text-amber-300 font-semibold cursor-pointer"
                >
                  Today's Daily Deals 🔥
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Help & Nursery Guides */}
          <div>
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3.5">
              Plant Care & Help
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('track-order')}
                  className="hover:text-white transition-colors font-semibold text-[#D1FAE5] cursor-pointer"
                >
                  Track Your Order
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('plant-care')}
                  className="text-[#A7F3D0]/80 hover:text-white transition-colors cursor-pointer"
                >
                  Plant Care Guides
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('plant-care', 'tool:doctor')}
                  className="hover:text-white transition-colors flex items-center gap-1 text-[#A7F3D0]/80 cursor-pointer"
                >
                  <span>Plant Doctor AI</span>
                  <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-md">AI</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('blog')}
                  className="text-[#A7F3D0]/80 hover:text-white transition-colors cursor-pointer"
                >
                  Gardening Blog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="text-[#A7F3D0]/80 hover:text-white transition-colors cursor-pointer"
                >
                  About Mannarathayil Nursery
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-[#A7F3D0]/80 hover:text-white transition-colors cursor-pointer"
                >
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Store Contact Details */}
          <div>
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3.5">
              Nursery Contact
            </h3>
            <div className="space-y-3 text-xs text-[#D1FAE5]/90">
              <a
                href="tel:08848276403"
                className="flex items-start gap-2.5 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>08848276403</span>
              </a>

              <a
                href="https://wa.me/919567274176"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>+91 95672 74176 (WhatsApp)</span>
              </a>

              <a
                href="mailto:7seasonsplants@gmail.com"
                className="flex items-start gap-2.5 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="break-all">7seasonsplants@gmail.com</span>
              </a>

              <a
                href="https://instagram.com/7seasonsplants"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4 text-rose-400 shrink-0" />
                <span>@7seasonsplants</span>
              </a>

              <div className="flex items-start gap-2.5 pt-1 text-[11px] text-emerald-300/70">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Mannarathayil Nursery, Kerala & Tamil Nadu Delivery Hub</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright, Payment Icons & Admin */}
      <div className="border-t border-emerald-800/40 bg-[#05170D] pt-6 pb-24 lg:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-4 text-xs text-[#A7F3D0]/70">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-[#A7F3D0]">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>Razorpay Verified</span>
            </span>
            <span>•</span>
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy & Shipping
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
          
          <p className="text-center mt-1">
            Copyright © 2026 <a href="https://www.zetozone.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline transition-colors">Zetozone Technologies</a>
          </p>
        </div>
      </div>
    </footer>
  );
};
