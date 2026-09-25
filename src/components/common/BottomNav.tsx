import React from 'react';
import { Home, Sparkles, Heart, ShoppingBag, User as UserIcon } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const { cartCount, wishlist, isCartOpen, setIsCartOpen, storeSettings, currentUser, openAuthModal } = useStore();
  const visibility = storeSettings.menuVisibility || {};

  return (
    <nav
      aria-label="Mobile navigation bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#06120e]/95 backdrop-blur-md border-t border-emerald-900/10 dark:border-emerald-900/40 px-2 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-lg select-none"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Home */}
        {visibility.home !== false && (
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
              currentView === 'home'
                ? 'text-emerald-700 dark:text-emerald-400 font-black'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            <div className="relative">
              <Home className={`w-5 h-5 transition-transform ${currentView === 'home' ? 'scale-110' : ''}`} />
              {currentView === 'home' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Home</span>
          </button>
        )}

        {/* Combos */}
        {visibility.combos !== false && (
          <button
            type="button"
            onClick={() => onNavigate('combos')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
              currentView === 'combos' || currentView === 'combo-detail'
                ? 'text-emerald-700 dark:text-emerald-400 font-black'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            <div className="relative">
              <Sparkles className={`w-5 h-5 transition-transform ${currentView === 'combos' || currentView === 'combo-detail' ? 'scale-110 text-amber-500' : ''}`} />
              {(currentView === 'combos' || currentView === 'combo-detail') && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Combos</span>
          </button>
        )}

        {/* Cart */}
        {visibility.cart !== false && (
          <button
            type="button"
            onClick={() => {
              if (!currentUser) {
                openAuthModal('Please sign in to access your shopping cart.');
              } else {
                setIsCartOpen(true);
              }
            }}
            className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
              isCartOpen
                ? 'text-emerald-700 dark:text-emerald-400 font-black'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            <div className="relative">
              <ShoppingBag className={`w-5 h-5 transition-transform ${isCartOpen ? 'scale-110' : ''}`} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center px-1 shadow-xs animate-in zoom-in-50">
                  {cartCount}
                </span>
              )}
              {isCartOpen && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Cart</span>
          </button>
        )}

        {/* Wishlist */}
        {visibility.wishlist !== false && (
          <button
            type="button"
            onClick={() => {
              if (!currentUser) {
                openAuthModal('Please sign in to access your saved botanical wishlist.');
              } else {
                onNavigate('wishlist');
              }
            }}
            className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
              currentView === 'wishlist'
                ? 'text-emerald-700 dark:text-emerald-400 font-black'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            <div className="relative">
              <Heart className={`w-5 h-5 transition-transform ${currentView === 'wishlist' ? 'scale-110 fill-rose-500 text-rose-500' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center px-1 shadow-xs">
                  {wishlist.length}
                </span>
              )}
              {currentView === 'wishlist' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Wishlist</span>
          </button>
        )}

        {/* Account / Sign In */}
        <button
          type="button"
          onClick={() => {
            if (!currentUser) {
              openAuthModal('Sign in to track orders & manage your profile.');
            } else {
              onNavigate('account');
            }
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
            currentView === 'account'
              ? 'text-emerald-700 dark:text-emerald-400 font-black'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          <div className="relative">
            <UserIcon className={`w-5 h-5 transition-transform ${currentView === 'account' ? 'scale-110' : ''}`} />
            {currentView === 'account' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">
            {currentUser ? 'Account' : 'Sign In'}
          </span>
        </button>
      </div>
    </nav>
  );
};
