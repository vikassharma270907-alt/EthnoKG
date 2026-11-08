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
  Compass
} from 'lucide-react';
import { motion } from 'framer-motion';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, pendingCount = 0 }) => {
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
    <header className="sticky top-0 z-50 bg-[#070b19]/90 backdrop-blur-xl border-b border-emerald-500/20 shadow-2xl shadow-emerald-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo & Identity */}
          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 group-hover:shadow-emerald-400/50 transition-all duration-300">
                <Network className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-mono">
                  Ethno<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">KG</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full shadow-xs">
                  EthnoHack '26
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Traceable Traditional Knowledge Discovery</p>
            </div>
          </div>

          {/* Navigation Links with animated indicator */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 ${isActive
                      ? 'text-emerald-200 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-emerald-500/15 border border-emerald-500/40 rounded-lg shadow-sm shadow-emerald-500/20"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
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
          <div className="flex items-center gap-3">
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-emerald-500/20 text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>100% Traceable</span>
            </div>

            <button
              onClick={() => setActiveTab('extraction')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 transition-all shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Mine Literature</span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="lg:hidden flex overflow-x-auto py-2 px-4 border-t border-slate-800/60 gap-1.5 bg-[#070b19]/95 backdrop-blur-md">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white'
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
