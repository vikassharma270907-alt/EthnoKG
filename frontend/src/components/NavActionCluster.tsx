import React from 'react';
import { Search, FileVideo, Cpu, Menu } from 'lucide-react';

interface NavActionClusterProps {
  onOpenSearch: () => void;
  onOpenVideoWalkthrough?: () => void;
  onNavigateToMining: () => void;
  onOpenMobileMenu: () => void;
}

export const NavActionCluster: React.FC<NavActionClusterProps> = ({
  onOpenSearch,
  onOpenVideoWalkthrough,
  onNavigateToMining,
  onOpenMobileMenu
}) => {
  return (
    <div className="flex items-center gap-2 sm:gap-2.5">
      <button
        type="button"
        onClick={onOpenSearch}
        aria-label="Open command palette and quick search"
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer shadow-inner focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        <Search className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-xs hidden xl:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-800/90 text-zinc-400 text-[10px] font-mono border border-zinc-700/60">
          <span className="text-[9px]">⌘</span>K
        </kbd>
      </button>

      {onOpenVideoWalkthrough && (
        <button
          type="button"
          onClick={onOpenVideoWalkthrough}
          aria-label="Watch 10-minute video presentation and demonstration"
          className="relative px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900/90 hover:bg-zinc-800 text-sky-300 border border-sky-500/40 hover:border-sky-400 transition-all shadow-md shadow-sky-950/40 hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
          title="Watch full 10-minute video presentation and demonstration"
        >
          <FileVideo className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Video Demo</span>
          <span className="text-[9px] font-mono uppercase bg-sky-500/20 text-sky-300 px-1 py-0.5 rounded border border-sky-500/30">
            10m
          </span>
        </button>
      )}

      <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[10px] text-zinc-300 select-none">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-mono text-zinc-300 font-medium">100% Traceable</span>
      </div>

      <button
        type="button"
        onClick={onNavigateToMining}
        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-zinc-200 via-slate-100 to-zinc-300 hover:from-white hover:to-zinc-200 text-zinc-950 transition-all shadow-md shadow-black/60 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer shrink-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        <Cpu className="w-3.5 h-3.5 text-zinc-950 stroke-[2.4]" />
        <span className="hidden md:inline">Mine Literature</span>
        <span className="md:hidden">Mine</span>
      </button>

      <button
        type="button"
        onClick={onOpenMobileMenu}
        aria-label="Open mobile navigation menu"
        className="lg:hidden p-2 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        <Menu className="w-4 h-4" />
      </button>
    </div>
  );
};
