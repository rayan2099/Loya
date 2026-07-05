/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  const { showOnboarding, setShowOnboarding, activeTab } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [showScannerModal, setShowScannerModal] = useState(false);

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
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-[#1E293B] flex flex-col font-sans">
      {/* Top Header */}
      <Header />

      {/* Main View Area */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {activeTab === 'home' && <HomeView onOpenScanner={() => setShowScannerModal(true)} />}
        {activeTab === 'customers' && <CustomersView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'management' && <ManagementView />}
      </main>

      {/* Bottom Navigation Bar */}
      <Navbar onOpenScanner={() => setShowScannerModal(true)} />

      {/* Instant POS Scanner Simulator Modal */}
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

