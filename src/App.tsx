/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { QuickViewModal } from './components/common/QuickViewModal';
import { StateSelectionModal } from './components/common/StateSelectionModal';
import { ToastContainer } from './components/common/ToastContainer';
import { GardenerAIChat } from './components/common/GardenerAIChat';
import { BottomNav } from './components/common/BottomNav';
import { LoginModal } from './components/common/LoginModal';
import { Logo } from './components/common/Logo';

// Pages
import { HomePage } from './pages/HomePage';
import { PlantsPage } from './pages/PlantsPage';
import { CombosPage } from './pages/CombosPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ComboDetailPage } from './pages/ComboDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { PlantCarePage } from './pages/PlantCarePage';
import { BlogPage } from './pages/BlogPage';
import { WishlistPage } from './pages/WishlistPage';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/AdminPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

const getInitialRoute = (): { view: string; param?: string } => {
  if (typeof window !== 'undefined') {
    const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
    if (rawHash) {
      const [hashView, hashParam] = rawHash.split('?');
      if (hashView) {
        if (hashView === 'plants' || hashView === 'product-detail') {
          return { view: 'combos', param: undefined };
        }
        return { view: hashView, param: hashParam ? decodeURIComponent(hashParam) : undefined };
      }
    }
    const savedView = sessionStorage.getItem('7seasons_current_view') || localStorage.getItem('7seasons_current_view');
    const savedParam = sessionStorage.getItem('7seasons_view_param') || localStorage.getItem('7seasons_view_param');
    if (savedView) {
      if (savedView === 'plants' || savedView === 'product-detail') {
        return { view: 'combos', param: undefined };
      }
      return { view: savedView, param: savedParam || undefined };
    }
  }
  return { view: 'home', param: undefined };
};

const AppContent: React.FC = () => {
  const { currentUser, isAdminAuthenticated } = useStore();
  const isAuthenticated = !!currentUser || isAdminAuthenticated;

  const initialRoute = getInitialRoute();
  const [currentView, setCurrentView] = useState<string>(initialRoute.view);
  const [viewParam, setViewParam] = useState<string | undefined>(initialRoute.param);

  // Sync route on hashchange (browser back/forward or direct hash links)
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
      if (rawHash) {
        const [hashView, hashParam] = rawHash.split('?');
        if (hashView) {
          const effectiveView = (hashView === 'plants' || hashView === 'product-detail') ? 'combos' : hashView;
          setCurrentView(effectiveView);
          setViewParam(effectiveView === 'combos' && (hashView === 'plants' || hashView === 'product-detail') ? undefined : (hashParam ? decodeURIComponent(hashParam) : undefined));
          try {
            sessionStorage.setItem('7seasons_current_view', effectiveView);
            localStorage.setItem('7seasons_current_view', effectiveView);
            if (hashParam && effectiveView !== 'combos') {
              sessionStorage.setItem('7seasons_view_param', decodeURIComponent(hashParam));
              localStorage.setItem('7seasons_view_param', decodeURIComponent(hashParam));
            } else {
              sessionStorage.removeItem('7seasons_view_param');
              localStorage.removeItem('7seasons_view_param');
            }
          } catch {
            // storage error safeguard
          }
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, viewParam]);

  const handleNavigate = (view: string, param?: string) => {
    // Restrict access to individual plants: force Combos flow for customers
    let targetView = view;
    let targetParam = param;
    if (targetView === 'plants' || targetView === 'product-detail') {
      targetView = 'combos';
      targetParam = undefined;
    }
    setCurrentView(targetView);
    setViewParam(targetParam);
    try {
      sessionStorage.setItem('7seasons_current_view', targetView);
      localStorage.setItem('7seasons_current_view', targetView);
      if (targetParam) {
        sessionStorage.setItem('7seasons_view_param', targetParam);
        localStorage.setItem('7seasons_view_param', targetParam);
        window.location.hash = `${targetView}?${encodeURIComponent(targetParam)}`;
      } else {
        sessionStorage.removeItem('7seasons_view_param');
        localStorage.removeItem('7seasons_view_param');
        window.location.hash = targetView;
      }
    } catch {
      // storage or url error safeguard
    }
  };

  const renderCurrentView = () => {
    const protectedViews = ['checkout', 'order-success', 'track-order', 'account'];

    if (!isAuthenticated && protectedViews.includes(currentView)) {
      return <AccountPage initialParam={viewParam === 'register' ? 'register' : 'login'} onNavigate={handleNavigate} />;
    }

    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;

      case 'plants':
      case 'product-detail':
      case 'combos':
        return <CombosPage onNavigate={handleNavigate} initialCategory={viewParam} />;

      case 'combo-detail':
        return (
          <ComboDetailPage
            slug={viewParam || 'triple-air-purifying-trio'}
            onNavigate={handleNavigate}
          />
        );

      case 'checkout':
        return <CheckoutPage onNavigate={handleNavigate} />;

      case 'order-success':
        return (
          <OrderSuccessPage
            orderId={viewParam || '7SP-88210'}
            onNavigate={handleNavigate}
          />
        );

      case 'track-order':
        return <TrackOrderPage initialOrderId={viewParam} onNavigate={handleNavigate} />;

      case 'plant-care':
        return <PlantCarePage initialParam={viewParam} onNavigate={handleNavigate} />;

      case 'blog':
        return <BlogPage onNavigate={handleNavigate} />;

      case 'wishlist':
        return <WishlistPage onNavigate={handleNavigate} />;

      case 'account':
        return <AccountPage initialParam={viewParam} onNavigate={handleNavigate} />;

      case 'admin':
        return <AdminPage onNavigate={handleNavigate} />;

      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;

      case 'contact':
        return <ContactPage initialParam={viewParam} onNavigate={handleNavigate} />;

      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4FAF5] dark:bg-[#010a07] text-emerald-950 dark:text-emerald-50 flex flex-col font-sans transition-colors duration-300 selection:bg-emerald-700 selection:text-white">
      {/* 1. Global Header with navigation, search, wishlist & cart */}
      <Header currentView={currentView} onNavigate={handleNavigate} />

      {/* 2. Main Page Content View */}
      <main className="flex-1 pb-20 lg:pb-0">{renderCurrentView()}</main>

      {/* 3. Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* 4. Drawers, Modals & Floating Helpers */}
      <CartDrawer onNavigate={handleNavigate} />
      <QuickViewModal onNavigate={handleNavigate} />
      <LoginModal onNavigate={handleNavigate} />
      <StateSelectionModal />
      <ToastContainer />
      <GardenerAIChat />
      <BottomNav currentView={currentView} onNavigate={handleNavigate} />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
