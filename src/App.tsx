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
import { ToastContainer } from './components/common/ToastContainer';
import { GardenerAIChat } from './components/common/GardenerAIChat';
import { BottomNav } from './components/common/BottomNav';
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

const AppContent: React.FC = () => {
  const { currentUser, isAdminAuthenticated } = useStore();
  const isAuthenticated = !!currentUser || isAdminAuthenticated;

  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, viewParam]);

  const handleNavigate = (view: string, param?: string) => {
    setCurrentView(view);
    setViewParam(param);
  };

  const renderCurrentView = () => {
    const protectedViews = ['checkout', 'order-success', 'track-order', 'wishlist', 'account', 'admin'];

    if (!isAuthenticated && protectedViews.includes(currentView)) {
      return <AccountPage initialParam={viewParam === 'register' ? 'register' : 'login'} onNavigate={handleNavigate} />;
    }

    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;

      case 'plants':
        return <PlantsPage onNavigate={handleNavigate} initialFilter={viewParam} />;

      case 'combos':
        return <CombosPage onNavigate={handleNavigate} initialCategory={viewParam} />;

      case 'product-detail':
        return (
          <ProductDetailPage
            slug={viewParam || 'monstera-deliciosa-swiss-cheese-plant'}
            onNavigate={handleNavigate}
          />
        );

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
        return <ContactPage onNavigate={handleNavigate} />;

      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4FAF5] dark:bg-[#010a07] text-emerald-950 dark:text-emerald-50 flex flex-col font-sans transition-colors duration-300 selection:bg-emerald-700 selection:text-white">
      {/* 1. Global Header with navigation, search, wishlist & cart */}
      <Header currentView={currentView} onNavigate={handleNavigate} />

      {/* 2. Main Page Content View */}
      <main className="flex-1 pb-16 md:pb-0">{renderCurrentView()}</main>

      {/* 3. Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* 4. Drawers, Modals & Floating Helpers */}
      <CartDrawer onNavigate={handleNavigate} />
      <QuickViewModal onNavigate={handleNavigate} />
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
