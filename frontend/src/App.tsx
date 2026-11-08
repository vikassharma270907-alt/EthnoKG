import React, { useState, useEffect, useCallback } from 'react';
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
import { VideoWalkthroughModal } from './components/VideoWalkthroughModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { fetchDashboardStats } from './api/client';
import type { DashboardStatsResponse } from './types';
import { NAV_ITEMS } from './components/navConfig';

const VALID_TABS = [
  'landing',
  'dashboard',
  'discovery',
  'plants',
  'graph',
  'extraction',
  'evidence',
  'assistant',
  'verification',
  'methodology',
  'sources'
];

function getInitialTab(): string {
  if (typeof window === 'undefined') return 'landing';
  const path = window.location.pathname.replace(/^\/+/, '').split('/')[0].toLowerCase();
  if (!path || path === 'index.html') return 'landing';
  if (VALID_TABS.includes(path)) return path;
  return 'landing';
}

export function App() {
  const [activeTab, setActiveTabState] = useState<string>(getInitialTab);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const setActiveTab = useCallback((tab: string) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const targetPath = tab === 'landing' ? '/' : `/${tab}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getInitialTab());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global Rapid Navigation Hotkeys (1-9, 0, E)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      const key = e.key.toUpperCase();
      const match = NAV_ITEMS.find((item) => item.hotkey.toUpperCase() === key);
      if (match) {
        e.preventDefault();
        setActiveTab(match.id);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [setActiveTab]);

  const refreshStats = useCallback(() => {
    setIsLoadingStats(true);
    fetchDashboardStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to load stats:', err))
      .finally(() => setIsLoadingStats(false));
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    fetchDashboardStats()
      .then((data) => {
        if (isSubscribed) {
          setStats(data);
          setIsLoadingStats(false);
        }
      })
      .catch((err) => {
        if (isSubscribed) {
          console.error('Failed to load stats:', err);
          setIsLoadingStats(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-zinc-100 font-sans selection:bg-zinc-700 selection:text-white relative overflow-x-hidden">
      
      {/* Ambient Cool Grey & Dark Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-zinc-700/10 via-zinc-800/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/5 w-[500px] h-[400px] bg-zinc-800/10 rounded-full blur-3xl" />
        <div className="absolute top-2/3 right-1/4 w-[600px] h-[500px] bg-zinc-800/10 rounded-full blur-3xl" />
      </div>

      {/* Navbar with live badge */}
      <div className="relative z-50">
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          pendingCount={stats?.pending_verifications || 0}
          onOpenVideoWalkthrough={() => setIsVideoModalOpen(true)}
        />
      </div>

      {/* Main Content View */}
      <main className="flex-1 py-8 relative z-10">
        <ErrorBoundary fallbackTitle="View Rendering Interrupted">
          {activeTab === 'landing' && (
            <LandingPage 
              setActiveTab={setActiveTab} 
              stats={stats} 
              onOpenVideoWalkthrough={() => setIsVideoModalOpen(true)}
            />
          )}
          {activeTab === 'dashboard' && (
            <DashboardPage stats={stats} isLoading={isLoadingStats} setActiveTab={setActiveTab} />
          )}
          {activeTab === 'discovery' && (
            <DiscoveryRadarPage />
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
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <div className="relative z-10">
        <Footer setActiveTab={setActiveTab} />
      </div>

      {/* Interactive 10-Minute Video Walkthrough & Presentation Modal */}
      <VideoWalkthroughModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        setActiveTab={setActiveTab}
      />

    </div>
  );
}

export default App;
