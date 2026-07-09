/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { OnboardingView } from './components/OnboardingView';
import { AuthView } from './components/AuthView';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { CustomersView } from './components/CustomersView';
import { AnalyticsView } from './components/AnalyticsView';
import { ManagementView } from './components/ManagementView';
import { ScannerModal } from './components/ScannerModal';

const AppContent: React.FC = () => {
  const { showOnboarding, setShowOnboarding, activeTab, lang } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [showScannerModal, setShowScannerModal] = useState(false);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = 'loya';
  }, [lang]);

  if (showOnboarding) {
    return (
      <OnboardingView
        onComplete={() => {
          setShowOnboarding(false);
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return <AuthView onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-24 text-[#18181B] flex flex-col font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Header />

      <main className="flex-1 w-full max-w-xl xl:max-w-7xl mx-auto p-4 sm:p-6 space-y-5">
        {activeTab === 'home' && <HomeView onOpenScanner={() => setShowScannerModal(true)} />}
        {activeTab === 'customers' && <CustomersView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'management' && <ManagementView />}
      </main>

      <Navbar onOpenScanner={() => setShowScannerModal(true)} />

      {showScannerModal && <ScannerModal onClose={() => setShowScannerModal(false)} />}
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
