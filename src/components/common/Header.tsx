import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Phone,
  Flame,
  Moon,
  Sun,
  Truck,
  BookOpen,
  HelpCircle,
  LogOut,
  ShieldCheck,
  Package,
  Clock,
  History,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Logo } from './Logo';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const {
    storeSettings,
    cartCount,
    wishlist,
    currentUser,
    currentAdmin,
    isAdminAuthenticated,
    logoutCustomer,
    logoutAdmin,
    setIsCartOpen,
    products,
    combos,
    categories,
    orders,
    isDarkMode,
    toggleDarkMode,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showRecentOrderModal, setShowRecentOrderModal] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [plantsDropdownOpen, setPlantsDropdownOpen] = useState(false);
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up'|'down'>('up');
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Update isScrolled
      if (currentScrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      
      // Update scroll direction
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up');
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Close search suggestions on outside click
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try { setSearchHistory(JSON.parse(savedHistory)); } catch (e) {}
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products and combos for live search suggestions
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return { products: [], combos: [] };
    const q = searchQuery.toLowerCase();
    const matchedProducts = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 4);

    const matchedCombos = combos
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 3);

    return { products: matchedProducts, combos: matchedCombos };
  }, [searchQuery, products, combos]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      const q = searchQuery.trim();
      const newHistory = [q, ...searchHistory.filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      onNavigate('plants', `search:${encodeURIComponent(q)}`);
    }
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    setIsSearchFocused(false);
    const newHistory = [query, ...searchHistory.filter((item) => item.toLowerCase() !== query.toLowerCase())].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    onNavigate('plants', `search:${encodeURIComponent(query)}`);
  };

  const navLinks = [
    { label: 'Home', view: 'home' },
    {
      label: 'Plants',
      view: 'plants',
      hasDropdown: true,
    },
    {
      label: 'Plant Combos',
      view: 'combos',
      badge: 'Save 35%',
      badgeColor: 'bg-rose-500 text-white shadow-xs',
    },
    { label: 'Best Sellers', view: 'plants', param: 'filter:bestseller' },
    { label: 'New Arrivals', view: 'plants', param: 'filter:new' },
    {
      label: 'Deals',
      view: 'home',
      param: 'section:deals',
      icon: Flame,
      iconColor: 'text-amber-500',
    },
    { label: 'Plant Care', view: 'plant-care' },
    { label: 'Blog', view: 'blog' },
    { label: 'Track Order', view: 'track-order', icon: Truck },
  ];

  return (
    <header className={`sticky top-0 z-40 bg-white dark:bg-[#06120e] shadow-xs border-b border-emerald-900/10 dark:border-emerald-900/40 transition-all duration-300 ease-in-out transform ${scrollDirection === "down" && isScrolled ? "-translate-y-full" : "translate-y-0"}`}>
      {/* 1. TOP ANNOUNCEMENT BAR */}
      {storeSettings.announcementBarActive && (
        <div className="overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-800 text-white px-4 py-1.5 text-xs font-semibold text-center relative z-20 flex items-center justify-center gap-2 shadow-inner">
          <span>{storeSettings.announcementBarText}</span>
          <button
            onClick={() => onNavigate('combos')}
            className="hidden sm:inline-flex items-center text-amber-200 hover:text-white font-bold underline decoration-amber-300 ml-1 cursor-pointer transition-colors"
          >
            Explore Combos →
          </button>
        </div>
        </div>
      )}

      {/* 2. MAIN HEADER BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          {/* Mobile Hamburger & Logo */}
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-emerald-950 dark:text-emerald-50 hover:bg-emerald-50 dark:bg-[#0a1f18] transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            <div className="py-1 transform scale-[0.75] md:scale-100 origin-left -ml-2 md:ml-0">
              <Logo size="md" onClick={() => onNavigate('home')} />
            </div>
          </div>

          {/* Desktop Search Bar with Live Suggestions */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-md relative mx-4">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search indoor plants, combos, succulents, hibiscus..."
                className="w-full pl-10 pr-10 py-2.5 bg-emerald-50 dark:bg-[#0a1f18]/60 hover:bg-emerald-50 dark:bg-[#0a1f18] focus:bg-white dark:bg-[#06120e] text-sm text-emerald-950 dark:text-emerald-50 rounded-full border border-emerald-900/15 dark:border-emerald-900/40 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition-all placeholder:text-emerald-800/60 font-medium"
              />
              <Search className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-300 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </form>

            {/* Live Search Auto-complete Dropdown */}
            {isSearchFocused && (searchQuery.trim().length > 0 || searchHistory.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#06120e] rounded-2xl shadow-xl border border-emerald-900/10 dark:border-emerald-900/40 p-3 z-50 max-h-96 overflow-y-auto">
                {!searchQuery.trim() && searchHistory.length > 0 && (
                  <div className="mb-2">
                    <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2 flex items-center gap-1">
                      <History className="w-3 h-3" />
                      Recent Searches
                    </div>
                    {searchHistory.map((query, idx) => (
                      <div key={idx} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <button
                          type="button"
                          onClick={() => handleHistoryClick(query)}
                          className="flex-1 text-left text-sm text-gray-700 dark:text-gray-200 cursor-pointer outline-hidden focus:ring-2 focus:ring-emerald-500/20 rounded"
                        >
                          {query}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newHist = searchHistory.filter(q => q !== query);
                            setSearchHistory(newHist);
                            localStorage.setItem('searchHistory', JSON.stringify(newHist));
                          }}
                          className="text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-rose-500 cursor-pointer p-1 rounded-full outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                          aria-label={`Remove ${query} from search history`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {searchQuery.trim().length > 0 && searchResults.combos.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Plant Combos ({searchResults.combos.length})
                    </div>
                    {searchResults.combos.map((combo) => (
                      <button
                        type="button"
                        key={combo.id}
                        onClick={() => {
                          setIsSearchFocused(false);
                          onNavigate('combo-detail', combo.slug);
                        }}
                        className="w-full text-left flex items-center gap-3 p-2 hover:bg-emerald-50 dark:bg-[#0a1f18]/70 focus:bg-emerald-50 dark:bg-[#0a1f18]/70 rounded-xl cursor-pointer transition-colors outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <img
                          src={combo.images[0]}
                          alt={combo.name}
                          className="w-10 h-10 rounded-lg object-cover bg-emerald-50 dark:bg-[#0a1f18] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-50 truncate">{combo.name}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-emerald-700">₹{combo.price}</span>
                            <span className="text-gray-400 dark:text-gray-500 dark:text-gray-400 line-through">₹{combo.originalPrice}</span>
                            <span className="text-rose-600 font-semibold text-[10px]">Save ₹{combo.savings}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.products.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider px-2 mb-1.5">
                      Plants ({searchResults.products.length})
                    </div>
                    {searchResults.products.map((product) => (
                      <button
                        type="button"
                        key={product.id}
                        onClick={() => {
                          setIsSearchFocused(false);
                          onNavigate('product-detail', product.slug);
                        }}
                        className="w-full text-left flex items-center gap-3 p-2 hover:bg-emerald-50 dark:bg-[#0a1f18]/70 focus:bg-emerald-50 dark:bg-[#0a1f18]/70 rounded-xl cursor-pointer transition-colors outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-emerald-50 dark:bg-[#0a1f18] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-emerald-950 dark:text-emerald-50 truncate">{product.name}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-emerald-700">₹{product.price}</span>
                            {product.originalPrice > product.price && (
                              <span className="text-gray-400 dark:text-gray-500 dark:text-gray-400 line-through">₹{product.originalPrice}</span>
                            )}
                            <span className="text-xs text-emerald-800/80 capitalize">{product.category}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery.trim().length > 0 && searchResults.products.length === 0 && searchResults.combos.length === 0 && (
                  <div className="text-center py-6 px-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No plants found for "{searchQuery}"</p>
                    <button
                      onClick={() => {
                        setIsSearchFocused(false);
                        onNavigate('plants');
                      }}
                      className="mt-2 text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Browse all nursery plants →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons: Phone support, Wishlist, Account, Cart */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Direct WhatsApp / Phone Contact Link */}
            <a
              href="https://wa.me/919567274176?text=Hi%207Seasonsplants%20Team,%20I%20have%20an%20inquiry%20about%20your%20plants"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-2 text-xs font-medium text-emerald-950 dark:text-emerald-50 bg-emerald-50 dark:bg-[#0a1f18] hover:bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-900/10 dark:border-emerald-900/40 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>+91 95672 74176</span>
            </a>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="relative p-2.5 rounded-full text-emerald-950 dark:text-emerald-50 hover:bg-emerald-50 dark:bg-[#0a1f18] transition-colors cursor-pointer"
              aria-label="Toggle Theme"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Midnight Garden"}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-emerald-900" />
              )}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="hidden md:block relative p-2.5 rounded-full text-emerald-950 dark:text-emerald-50 hover:bg-emerald-50 dark:bg-[#0a1f18] transition-colors cursor-pointer"
              aria-label="Wishlist"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5 text-emerald-900" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Account / Login Dropdown */}
            <div ref={accountRef} className="relative flex items-center gap-0.5">
              {/* Quick Link Profile Icon */}
              {currentUser ? (
                <div className="relative group">
                  <button
                    onClick={() => onNavigate('account')}
                    className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-[11px] tracking-wider shadow-sm transition-all duration-300 hover:scale-110 cursor-pointer shrink-0 overflow-hidden"
                    title="My Profile"
                    aria-label="My Profile"
                  >
                    {currentUser.profileImage ? (
                      <img src={currentUser.profileImage} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                    )}
                  </button>
                  {/* Online Status Dot */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full z-10 pointer-events-none"></div>
                </div>
              ) : (
                <button
                  onClick={() => onNavigate('account', 'login')}
                  className="w-8 h-8 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center text-emerald-800 transition-colors cursor-pointer shrink-0"
                  title="Sign In"
                  aria-label="Sign In"
                >
                  <UserIcon className="w-4 h-4" />
                </button>
              )}

              {/* Account Dropdown Toggle */}
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center gap-1 p-1 sm:px-2 sm:py-2 rounded-full text-emerald-950 dark:text-emerald-50 hover:bg-emerald-50 dark:bg-[#0a1f18] transition-colors cursor-pointer"
                aria-label="Account menu"
              >
                <span className="hidden sm:inline-block text-xs font-medium text-emerald-950 dark:text-emerald-50 max-w-[90px] truncate">
                  {currentUser ? currentUser.name.split(' ')[0] : 'Account'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-700 hidden sm:inline-block" />
              </button>

              {/* Account Dropdown Menu */}
              {accountMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-[#06120e] rounded-2xl shadow-xl border border-emerald-900/10 dark:border-emerald-900/40 py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
                  {currentUser ? (
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                      <p className="font-semibold text-emerald-950 dark:text-emerald-50 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
                    </div>
                  ) : (
                    <div className="p-3 border-b border-gray-100 dark:border-gray-800 space-y-2">
                      <p className="text-xs text-gray-600 dark:text-gray-300 text-center">Sign in to track orders & view saved wishlist</p>
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            onNavigate('account', 'auth');
                          }}
                          className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-semibold shadow-xs transition-colors cursor-pointer text-center"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            onNavigate('account', 'register');
                          }}
                          className="w-full py-1.5 bg-emerald-50 dark:bg-[#0a1f18] hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold transition-colors cursor-pointer text-center"
                        >
                          Create New Account 🌿
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onNavigate('account');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-emerald-50 dark:bg-[#0a1f18]/70 flex items-center gap-2.5 text-emerald-950 dark:text-emerald-50 cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-emerald-700" />
                      <span>My Profile & Orders</span>
                    </button>
                    {currentUser && (
                      <button
                        onClick={() => {
                          setAccountMenuOpen(false);
                          setShowRecentOrderModal(true);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-emerald-50 dark:bg-[#0a1f18]/70 flex items-center gap-2.5 text-emerald-950 dark:text-emerald-50 cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-emerald-700" />
                        <span>Recent Order Status</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onNavigate('track-order');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-emerald-50 dark:bg-[#0a1f18]/70 flex items-center gap-2.5 text-emerald-950 dark:text-emerald-50 cursor-pointer"
                    >
                      <Truck className="w-4 h-4 text-emerald-700" />
                      <span>Track Order</span>
                    </button>
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onNavigate('wishlist');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-emerald-50 dark:bg-[#0a1f18]/70 flex items-center gap-2.5 text-emerald-950 dark:text-emerald-50 cursor-pointer"
                    >
                      <Heart className="w-4 h-4 text-emerald-700" />
                      <span>Saved Wishlist ({wishlist.length})</span>
                    </button>
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onNavigate('plant-care');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-emerald-50 dark:bg-[#0a1f18]/70 flex items-center gap-2.5 text-emerald-950 dark:text-emerald-50 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-emerald-700" />
                      <span>Plant Care Doctor</span>
                    </button>
                  </div>

                  {currentUser && (
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-1">
                      <button
                        onClick={() => {
                          setAccountMenuOpen(false);
                          logoutCustomer();
                          onNavigate('account', 'login');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 cursor-pointer text-xs font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white px-4 py-2.5 rounded-full shadow-sm transition-all hover:shadow-md cursor-pointer group"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-white group-hover:scale-105 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-rose-500 text-white font-black text-[10px] rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline-block font-bold text-xs text-white">Cart</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plants, combos, pots..."
              className="w-full pl-9 pr-8 py-2 bg-emerald-50 dark:bg-[#0a1f18]/60 text-sm text-emerald-950 dark:text-emerald-50 rounded-full border border-emerald-900/15 dark:border-emerald-900/40 outline-hidden focus:bg-white dark:bg-[#06120e] focus:border-emerald-600 font-medium"
            />
            <Search className="w-4 h-4 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      </div>

      {/* 3. DESKTOP NAVIGATION BAR WITH DROPDOWN MEGA MENU */}
      <nav className="hidden lg:block bg-emerald-50 dark:bg-[#0a1f18]/50 border-t border-emerald-900/8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-center gap-1 xl:gap-2 py-1.5">
            {navLinks.map((link) => {
              const isActive =
                currentView === link.view &&
                (!link.param || (link.param === 'filter:bestseller' && false));

              const Icon = link.icon;

              if (link.hasDropdown) {
                return (
                  <li
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setPlantsDropdownOpen(true)}
                    onMouseLeave={() => setPlantsDropdownOpen(false)}
                  >
                    <button
                      onClick={() => onNavigate(link.view)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                        currentView === 'plants'
                          ? 'text-white bg-emerald-700 shadow-xs'
                          : 'text-emerald-950 dark:text-emerald-50 hover:text-emerald-700 hover:bg-emerald-100/60'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronDown className="w-3 h-3 text-emerald-700" />
                    </button>

                    {/* Mega Dropdown Menu for Categories */}
                    {plantsDropdownOpen && (
                      <div className="absolute top-full left-0 w-80 bg-white dark:bg-[#06120e] rounded-2xl shadow-xl border border-emerald-900/10 dark:border-emerald-900/40 p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider px-2 mb-2 pb-1 border-b border-emerald-100 dark:border-emerald-900/40">
                          Shop by Plant Category
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          {categories
                            .filter((c) => c.type !== 'combo')
                            .map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => {
                                  setPlantsDropdownOpen(false);
                                  onNavigate('plants', `category:${cat.name}`);
                                }}
                                className="flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-emerald-50 dark:bg-[#0a1f18] text-xs text-emerald-950 dark:text-emerald-50 transition-colors cursor-pointer"
                              >
                                <span className="font-semibold">{cat.name}</span>
                                <span className="text-[11px] text-emerald-700/80 font-medium">{cat.itemCount} plants</span>
                              </button>
                            ))}
                          <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800">
                            <button
                              onClick={() => {
                                setPlantsDropdownOpen(false);
                                onNavigate('plants');
                              }}
                              className="w-full text-center text-xs font-bold text-emerald-700 hover:text-emerald-900 py-1 cursor-pointer"
                            >
                              View All Plants →
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                );
              }

              return (
                <li key={link.label}>
                  <button
                    onClick={() => onNavigate(link.view, link.param)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                      isActive
                        ? 'text-white bg-emerald-700 shadow-xs'
                        : 'text-emerald-950 dark:text-emerald-50 hover:text-emerald-700 hover:bg-emerald-100/60'
                    }`}
                  >
                    {Icon && <Icon className={`w-3.5 h-3.5 ${link.iconColor || 'text-emerald-700'}`} />}
                    <span>{link.label}</span>
                    {link.badge && (
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${link.badgeColor}`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* 4. MOBILE DRAWER NAVIGATION */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-white dark:bg-[#06120e] h-full overflow-y-auto p-5 shadow-2xl flex flex-col justify-between border-r border-emerald-900/10 dark:border-emerald-900/40">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <Logo size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-950 dark:text-emerald-50 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Delivery regions notification */}
              <div className="my-3 p-2.5 bg-emerald-50 dark:bg-[#0a1f18] rounded-2xl text-xs text-emerald-950 dark:text-emerald-50 flex items-center gap-2 border border-emerald-100 dark:border-emerald-900/40">
                <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Delivering across <strong>Kerala & Tamil Nadu</strong></span>
              </div>

              {/* Navigation list */}
              <ul className="space-y-1 py-2">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate(link.view, link.param);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-emerald-950 dark:text-emerald-50 hover:bg-emerald-50 dark:bg-[#0a1f18] cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        {link.icon && <link.icon className="w-4 h-4 text-emerald-700" />}
                        <span>{link.label}</span>
                      </div>
                      {link.badge && (
                        <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Mobile Category links */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-2">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider px-3 mb-2">
                  Popular Categories
                </p>
                <div className="grid grid-cols-2 gap-1 px-1">
                  {categories.slice(0, 6).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate(cat.type === 'combo' ? 'combos' : 'plants', `category:${cat.name}`);
                      }}
                      className="text-left p-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:bg-[#0a1f18] hover:text-emerald-950 dark:text-emerald-50 cursor-pointer"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Footer with contact */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-6 space-y-2 text-xs">
              <a
                href="https://wa.me/919567274176"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-700 text-white rounded-full font-bold shadow-xs hover:bg-emerald-800 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                WhatsApp Support (+91 95672 74176)
              </a>
            </div>
          </div>

          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Recent Order Modal */}
      {showRecentOrderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#06120e] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-emerald-950 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold">Recent Order Status</h3>
              </div>
              <button onClick={() => setShowRecentOrderModal(false)} className="text-emerald-400 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Content */}
            <div className="p-6">
              {(() => {
                if (!currentUser) return <p className="text-gray-500 dark:text-gray-400 text-sm text-center">Please log in to view orders.</p>;
                const userOrders = orders.filter((o) => {
                  const oEmail = (o.customer?.email || (o as any).customerEmail || '').toLowerCase();
                  const oPhone = o.customer?.phone || (o as any).customerPhone || '';
                  const oId = (o as any).customerId || '';
                  return oEmail === currentUser.email.toLowerCase() || oPhone === currentUser.phone || oId === currentUser.id;
                });
                if (userOrders.length === 0) return <p className="text-gray-500 dark:text-gray-400 text-sm text-center">No recent orders found.</p>;
                const latestOrder = userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Order Number</p>
                        <p className="font-bold text-emerald-950 dark:text-emerald-50">#{latestOrder.orderNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                        <p className="font-medium text-emerald-900">{new Date(latestOrder.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="bg-emerald-50 dark:bg-[#0a1f18] rounded-xl p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                        <Truck className="w-6 h-6 text-emerald-700" />
                      </div>
                      <div>
                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Current Status</p>
                        <p className="font-black text-emerald-950 dark:text-emerald-50 text-lg capitalize">{latestOrder.orderStatus}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setShowRecentOrderModal(false);
                        onNavigate('track-order', latestOrder.orderNumber);
                      }}
                      className="w-full mt-4 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-white rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      View Full Details
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
