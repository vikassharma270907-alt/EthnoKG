import React, { useState, useEffect } from 'react';
import { Network } from 'lucide-react';
import { NAV_ITEMS } from './navConfig';
import type { NavMode, NavItemConfig } from './navConfig';
import { NavViewToggle } from './NavViewToggle';
import { NavSlideRail } from './NavSlideRail';
import { NavMegaMenu } from './NavMegaMenu';
import { NavActionCluster } from './NavActionCluster';
import { CommandPalette } from './CommandPalette';
import { MobileNavDrawer } from './MobileNavDrawer';

export interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount?: number;
  onOpenVideoWalkthrough?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pendingCount = 0,
  onOpenVideoWalkthrough
}) => {
  const [navMode, setNavMode] = useState<NavMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ethnokg_nav_mode');
      if (saved === 'slide' || saved === 'list') return saved;
    }
    return 'slide';
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleModeChange = (newMode: NavMode) => {
    setNavMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ethnokg_nav_mode', newMode);
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      if (isInput) return;

      const key = e.key.toUpperCase();
      const matched = NAV_ITEMS.find((item: NavItemConfig) => item.hotkey === key);
      if (matched) {
        setActiveTab(matched.id);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [setActiveTab]);

  return (
    <>
      <header
        role="banner"
        className="sticky top-0 z-40 bg-[#0a0c12]/92 backdrop-blur-2xl border-b border-zinc-800/80 shadow-2xl shadow-black/80 transition-all select-none"
      >
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-500/35 to-transparent pointer-events-none" />

        <div className="max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 lg:gap-5">

            {/* Left Brand Area */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('landing')}
                className="flex items-center gap-3 cursor-pointer group select-none text-left bg-transparent border-0 p-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-xl"
                aria-label="Navigate to EthnoKG home overview"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-zinc-800 via-zinc-700 to-zinc-500 border border-zinc-600/50 flex items-center justify-center shadow-lg shadow-black/50 group-hover:scale-105 group-hover:border-zinc-400/70 transition-all duration-300">
                    <Network className="w-5 h-5 text-zinc-100 stroke-[2.2] group-hover:text-white transition-colors" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-zinc-300"></span>
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight text-white font-mono">
                      Ethno<span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">KG</span>
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-zinc-800/90 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full shadow-inner font-mono">
                      EthnoHack '26
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 hidden xl:block">
                    Traceable Traditional Knowledge Discovery
                  </p>
                </div>
              </button>
            </div>

            {/* Center Navigation: Dual-Mode with Slide & List Options */}
            <div className="hidden lg:flex items-center gap-3 flex-1 min-w-0 justify-center max-w-4xl">
              <div className="shrink-0">
                <NavViewToggle mode={navMode} onModeChange={handleModeChange} />
              </div>

              <div className="flex-1 min-w-0">
                {navMode === 'slide' ? (
                  <NavSlideRail
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    pendingCount={pendingCount}
                  />
                ) : (
                  <div className="flex justify-center">
                    <NavMegaMenu
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      pendingCount={pendingCount}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Action Cluster */}
            <div className="flex items-center shrink-0">
              <NavActionCluster
                onOpenSearch={() => setIsSearchOpen(true)}
                onOpenVideoWalkthrough={onOpenVideoWalkthrough}
                onNavigateToMining={() => setActiveTab('extraction')}
                onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
              />
            </div>

          </div>
        </div>
      </header>

      {/* Quick Command Palette (Cmd+K / Ctrl+K) */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        onOpenVideoWalkthrough={onOpenVideoWalkthrough}
      />

      {/* Responsive Mobile Drawer (< 1024px) */}
      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        onOpenVideoWalkthrough={onOpenVideoWalkthrough}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
    </>
  );
};
