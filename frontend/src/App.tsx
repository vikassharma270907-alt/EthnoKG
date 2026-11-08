import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExtractionPage } from './pages/ExtractionPage';
import { PlantExplorerPage } from './pages/PlantExplorerPage';
import { GraphPage } from './pages/GraphPage';
import { EvidencePage } from './pages/EvidencePage';
import { AssistantPage } from './pages/AssistantPage';
import { VerificationPage } from './pages/VerificationPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { SourcesPage } from './pages/SourcesPage';
import { fetchDashboardStats } from './api/client';
import { DashboardStatsResponse } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const refreshStats = () => {
    setIsLoadingStats(true);
    fetchDashboardStats()
      .then(setStats)
      .catch((err) => console.error('Failed to load stats:', err))
      .finally(() => setIsLoadingStats(false));
  };

  useEffect(() => {
    refreshStats();
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B132B] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Navbar with live badge */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        pendingCount={stats?.pending_verifications || 0} 
      />

      {/* Main Content View */}
      <main className="flex-1 py-8">
        {activeTab === 'landing' && (
          <LandingPage setActiveTab={setActiveTab} stats={stats} />
        )}
        {activeTab === 'dashboard' && (
          <DashboardPage stats={stats} isLoading={isLoadingStats} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'extraction' && (
          <ExtractionPage setActiveTab={setActiveTab} onExtractionComplete={refreshStats} />
        )}
        {activeTab === 'plants' && (
          <PlantExplorerPage />
        )}
        {activeTab === 'graph' && (
          <GraphPage />
        )}
        {activeTab === 'evidence' && (
          <EvidencePage />
        )}
        {activeTab === 'assistant' && (
          <AssistantPage />
        )}
        {activeTab === 'verification' && (
          <VerificationPage />
        )}
        {activeTab === 'methodology' && (
          <MethodologyPage />
        )}
        {activeTab === 'sources' && (
          <SourcesPage />
        )}
      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />

    </div>
  );
}

export default App;
