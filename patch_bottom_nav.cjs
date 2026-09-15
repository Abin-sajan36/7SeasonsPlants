const fs = require('fs');

const code = `import React from 'react';
import { Home, Sparkles, Heart, ShoppingBag, Leaf } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const { cartCount, wishlist, isCartOpen, setIsCartOpen, storeSettings } = useStore();
  const visibility = storeSettings.menuVisibility || {};

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#06120e]/95 backdrop-blur-md border-t border-emerald-900/10 dark:border-emerald-900/40 px-3 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {visibility.home !== false && (
          <button
            onClick={() => onNavigate('home')}
            className={\`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer \${
              currentView === 'home' ? 'text-emerald-700 font-bold' : 'text-gray-500'
            }\`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>
        )}
        {visibility.plants !== false && (
          <button
            onClick={() => onNavigate('plants')}
            className={\`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer \${
              currentView === 'plants' ? 'text-emerald-700 font-bold' : 'text-gray-500'
            }\`}
          >
            <Leaf className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Plants</span>
          </button>
        )}
        {visibility.combos !== false && (
          <button
            onClick={() => onNavigate('combos')}
            className={\`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer \${
              currentView === 'combos' ? 'text-emerald-700 font-bold' : 'text-gray-500'
            }\`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Combos</span>
          </button>
        )}
        {visibility.wishlist !== false && (
          <button
            onClick={() => onNavigate('wishlist')}
            className={\`relative flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer \${
              currentView === 'wishlist' ? 'text-emerald-700 font-bold' : 'text-gray-500'
            }\`}
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-0 right-2 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
            <span className="text-[10px] mt-0.5">Wishlist</span>
          </button>
        )}
        {visibility.cart !== false && (
          <button
            onClick={() => setIsCartOpen(true)}
            className={\`relative flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer \${
              isCartOpen ? 'text-emerald-700 font-bold' : 'text-gray-500'
            }\`}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-2 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span className="text-[10px] mt-0.5">Cart</span>
          </button>
        )}
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/common/BottomNav.tsx', code);
