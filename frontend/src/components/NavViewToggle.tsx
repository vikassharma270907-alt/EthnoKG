import React from 'react';
import { motion } from 'framer-motion';
import { ChevronsLeftRight, LayoutGrid } from 'lucide-react';
import type { NavMode } from './navConfig';

interface NavViewToggleProps {
  mode: NavMode;
  onModeChange: (mode: NavMode) => void;
}

export const NavViewToggle: React.FC<NavViewToggleProps> = ({ mode, onModeChange }) => {
  return (
    <div
      role="group"
      aria-label="Navigation layout mode"
      className="inline-flex items-center p-0.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 shadow-inner backdrop-blur-md"
    >
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'slide'}
        aria-label="Slide rail carousel navigation"
        onClick={() => onModeChange('slide')}
        className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-400 ${
          mode === 'slide' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        {mode === 'slide' && (
          <motion.div
            layoutId="navModePill"
            className="absolute inset-0 bg-gradient-to-r from-zinc-800 via-zinc-700/90 to-zinc-800 rounded-lg border border-zinc-600/70 shadow-sm"
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
        <ChevronsLeftRight
          className={`w-3.5 h-3.5 relative z-10 transition-colors ${
            mode === 'slide' ? 'text-white' : 'text-zinc-400'
          }`}
        />
        <span className="relative z-10 hidden sm:inline">Slide</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={mode === 'list'}
        aria-label="Categorized grid list navigation"
        onClick={() => onModeChange('list')}
        className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-400 ${
          mode === 'list' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        {mode === 'list' && (
          <motion.div
            layoutId="navModePill"
            className="absolute inset-0 bg-gradient-to-r from-zinc-800 via-zinc-700/90 to-zinc-800 rounded-lg border border-zinc-600/70 shadow-sm"
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
        <LayoutGrid
          className={`w-3.5 h-3.5 relative z-10 transition-colors ${
            mode === 'list' ? 'text-white' : 'text-zinc-400'
          }`}
        />
        <span className="relative z-10 hidden sm:inline">List</span>
      </button>
    </div>
  );
};
