import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DiscoveryRadarPage } from './pages/DiscoveryRadarPage';
import { ExtractionPage } from './pages/ExtractionPage';
import { PlantExplorerPage } from './pages/PlantExplorerPage';
import { GraphPage } from './pages/GraphPage';
import { EvidencePage } from './pages/EvidencePage';
import { AssistantPage } from './pages/AssistantPage';
import { VerificationPage } from './pages/VerificationPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { SourcesPage } from './pages/SourcesPage';
import { fetchDashboardStats, fetchExtractionResults } from './api/client';
import { DashboardStatsResponse } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);

  // Sync hash with active tab for clean URL sharing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash && [
        'landing', 'dashboard', 'discovery', 'extraction', 'plants', 
        'graph', 'evidence', 'assistant', 'verification', 'methodology', 'sources'
      ].includes(hash)) {
        setActiveTab(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const refreshData = async () => {
    try {
      const [newStats, pendingRes] = await Promise.all([
        fetchDashboardStats().catch(() => null),
        fetchExtractionResults({ status: 'pending', limit: 1 }).catch(() => [])
      ]);
      if (newStats) setStats(newStats);
      if (newStats) {
        setPendingCount(newStats.pending_verifications);
      } else if (pendingRes) {
        setPendingCount(pendingRes.length);
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="min-h-screen bg-[#070c19] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        pendingCount={pendingCount} 
      />

      {/* Main Content Area */}
      <main className="flex-1 py-8">
        {activeTab === 'landing' && (
          <LandingPage setActiveTab={handleTabChange} stats={stats} />
        )}
        
        {activeTab === 'dashboard' && (
          <DashboardPage 
            stats={stats} 
            isLoading={isLoadingStats} 
            setActiveTab={handleTabChange} 
          />
        )}

        {activeTab === 'discovery' && (
          <DiscoveryRadarPage />
        )}

        {activeTab === 'extraction' && (
          <ExtractionPage 
            setActiveTab={handleTabChange} 
            onExtractionComplete={refreshData} 
          />
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

      {/* Global Footer */}
      <Footer setActiveTab={handleTabChange} />

    </div>
  );
}

export default App;
