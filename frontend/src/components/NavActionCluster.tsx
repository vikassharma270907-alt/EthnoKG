import React from 'react';
import { motion } from 'framer-motion';
import { Search, FileVideo, Cpu, Menu } from 'lucide-react';

interface NavActionClusterProps {
  onOpenSearch: () => void;
  onOpenVideoWalkthrough?: () => void;
  onNavigateToMining: () => void;
  onOpenMobileMenu: () => void;
  isMobileMenuOpen?: boolean;
}

export const NavActionCluster: React.FC<NavActionClusterProps> = ({
  onOpenSearch,
  onOpenVideoWalkthrough,
  onNavigateToMining,
  onOpenMobileMenu,
  isMobileMenuOpen = false
}) => {
  return (
    <div className="flex items-center gap-2 sm:gap-2.5">
      {/* Quick Search Trigger */}
      <button
        type="button"
        onClick={onOpenSearch}
        aria-label="Open command palette and quick search"
        aria-keyshortcuts="Control+K Meta+K"
        className="flex items-center gap-2 px-2.5 py-1.5 min-h-[32px] rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer shadow-inner focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        <Search className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
        <span className="text-xs hidden xl:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-800/90 text-zinc-300 text-[10px] font-mono border border-zinc-700/60" aria-hidden="true">
          <span className="text-[9px]">⌘</span>K
        </kbd>
      </button>

      {/* Video Demo Button */}
      {onOpenVideoWalkthrough && (
        <button
          type="button"
          onClick={onOpenVideoWalkthrough}
          aria-label="Watch 10-minute video presentation and demonstration"
          className="relative px-3 py-1.5 min-h-[32px] rounded-xl text-xs font-semibold bg-zinc-900/90 hover:bg-zinc-800 text-sky-300 border border-sky-500/40 hover:border-sky-400 transition-all shadow-md shadow-sky-950/40 hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
          title="Watch full 10-minute video presentation and demonstration"
        >
          <FileVideo className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" aria-hidden="true" />
          <span className="hidden sm:inline">Video Demo</span>
          <span className="text-[9px] font-mono uppercase bg-sky-500/20 text-sky-300 px-1 py-0.5 rounded border border-sky-500/30">
            10m
          </span>
        </button>
      )}

      {/* Traceable Status Badge */}
      <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 min-h-[32px] rounded-xl bg-zinc-900/90 border border-zinc-800 text-[10px] text-zinc-300 select-none shadow-inner">
        <span className="relative flex h-2 w-2">
          <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]"></span>
        </span>
        <span className="font-mono text-zinc-300 font-medium tracking-tight">100% Traceable</span>
      </div>

      {/* Primary CTA: Mine Literature with Conic Glow & Shimmer */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="relative group p-[1px] rounded-xl overflow-hidden shadow-lg shadow-black/50 transition-shadow duration-300 hover:shadow-[0_0_24px_rgba(56,189,248,0.35)] shrink-0"
      >
        <span
          aria-hidden="true"
          className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] group-hover:animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,transparent_60%,#38bdf8_85%,#34d399_100%)] opacity-85 group-hover:opacity-100 transition-opacity"
        />

        <button
          type="button"
          onClick={onNavigateToMining}
          aria-label="Mine literature from scientific publications"
          className="relative z-10 px-3.5 py-1.5 min-h-[30px] rounded-[11px] text-xs font-bold bg-gradient-to-r from-zinc-100 via-slate-50 to-zinc-200 hover:from-white hover:to-slate-100 text-zinc-950 flex items-center gap-1.5 cursor-pointer select-none transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <Cpu className="w-3.5 h-3.5 text-zinc-950 stroke-[2.4] transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110" aria-hidden="true" />
          <span className="hidden md:inline font-mono tracking-tight">Mine Literature</span>
          <span className="md:hidden font-mono">Mine</span>

          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-[11px] overflow-hidden pointer-events-none"
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </span>
        </button>
      </motion.div>

      {/* Mobile Drawer Trigger */}
      <button
        type="button"
        onClick={onOpenMobileMenu}
        aria-label="Open mobile navigation menu"
        aria-haspopup="dialog"
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-nav-drawer"
        className="lg:hidden p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        <Menu className="w-4 h-4" />
      </button>
    </div>
  );
};
