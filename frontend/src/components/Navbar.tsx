import React from 'react';
import {
  Network,
  Leaf,
  BarChart3,
  Search,
  Database,
  ShieldCheck,
  Sparkles,
  BookOpen,
  FileText,
  Globe2,
  Compass,
  Cpu,
  FileVideo
} from 'lucide-react';
import { motion } from 'framer-motion';

interface NavbarProps {
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
  const navItems = [
    { id: 'landing', label: 'Overview', icon: Globe2 },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'discovery', label: 'Discovery Radar', icon: Compass },
    { id: 'extraction', label: 'Literature Mining', icon: Search },
    { id: 'plants', label: 'Plant Intelligence', icon: Leaf },
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    { id: 'evidence', label: 'Evidence Explorer', icon: Database },
    { id: 'assistant', label: 'Research Assistant', icon: Sparkles },
    {
      id: 'verification',
      label: 'Verification',
      icon: ShieldCheck,
      badge: pendingCount > 0 ? pendingCount : undefined
    },
    { id: 'methodology', label: 'Methodology', icon: BookOpen },
    { id: 'sources', label: 'Sources & Ethics', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a0c12]/90 backdrop-blur-2xl border-b border-zinc-800/80 shadow-2xl shadow-black/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo & Identity */}
          <button
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group select-none text-left bg-transparent border-0 p-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500 rounded-xl"
            aria-label="Navigate to EthnoKG home overview"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-zinc-800 via-zinc-700 to-zinc-500 border border-zinc-600/50 flex items-center justify-center shadow-lg shadow-black/50 group-hover:scale-105 group-hover:border-zinc-400/70 transition-all duration-300">
                <Network className="w-5 h-5 text-zinc-100 stroke-[2.2]" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-mono">
                  Ethno<span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-sky-300 to-teal-300">KG</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-zinc-800/90 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full shadow-inner font-mono">
                  EthnoHack '26
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">Traceable Traditional Knowledge Discovery</p>
            </div>
          </button>

          {/* Navigation Links with animated indicator */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-zinc-800/90 border border-zinc-600/70 rounded-lg shadow-md shadow-black/40"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <Icon
                    className={`w-3.5 h-3.5 relative z-10 transition-colors ${
                      isActive ? 'text-sky-400' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  />
                  <span className="relative z-10">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="relative z-10 ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Live Heartbeat & Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenVideoWalkthrough && (
              <button
                onClick={onOpenVideoWalkthrough}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900/90 hover:bg-zinc-800 text-sky-300 border border-sky-500/40 hover:border-sky-400 transition-all shadow-md shadow-sky-950/40 hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer group"
                title="Watch full 10-minute video presentation and demonstration"
              >
                <FileVideo className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                <span>Video Demo</span>
                <span className="hidden md:inline-block text-[9px] font-mono uppercase bg-sky-500/20 text-sky-300 px-1 py-0.2 rounded border border-sky-500/30">
                  10m
                </span>
              </button>
            )}

            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-[10px] text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono">100% Traceable</span>
            </div>

            <button
              onClick={() => setActiveTab('extraction')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-zinc-200 via-slate-100 to-zinc-300 hover:from-white hover:to-zinc-200 text-zinc-950 transition-all shadow-md shadow-black/60 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-zinc-900 stroke-[2.4]" />
              <span>Mine Literature</span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="lg:hidden flex overflow-x-auto py-2 px-4 border-t border-zinc-800/80 gap-1.5 bg-[#0a0c12]/95 backdrop-blur-md scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors shrink-0 ${
                isActive
                  ? 'bg-zinc-800 text-white border border-zinc-600 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-amber-500/30 text-amber-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
