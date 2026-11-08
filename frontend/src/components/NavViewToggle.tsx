import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronsLeftRight, LayoutGrid } from 'lucide-react';
import type { NavMode } from './navConfig';

interface NavViewToggleProps {
  mode: NavMode;
  onModeChange: (mode: NavMode) => void;
}

export const NavViewToggle: React.FC<NavViewToggleProps> = ({ mode, onModeChange }) => {
  const shouldReduceMotion = useReducedMotion();
  const slideRadioRef = useRef<HTMLButtonElement | null>(null);
  const listRadioRef = useRef<HTMLButtonElement | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      onModeChange('list');
      listRadioRef.current?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      onModeChange('slide');
      slideRadioRef.current?.focus();
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Navigation layout mode"
      onKeyDown={handleKeyDown}
      className="inline-flex items-center p-0.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 shadow-inner backdrop-blur-md"
    >
      <motion.button
        ref={slideRadioRef}
        type="button"
        role="radio"
        aria-checked={mode === 'slide'}
        tabIndex={mode === 'slide' ? 0 : -1}
        aria-label="Slide rail carousel navigation"
        onClick={() => onModeChange('slide')}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
        className={`relative flex items-center gap-1.5 px-2.5 py-1 min-h-[28px] rounded-lg text-[11px] font-medium transition-colors duration-150 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400 ${
          mode === 'slide' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        {mode === 'slide' && (
          <motion.div
            layoutId={shouldReduceMotion ? undefined : "navModePill"}
            className="absolute inset-0 bg-gradient-to-b from-zinc-700/80 via-zinc-800/95 to-zinc-900 rounded-lg border border-zinc-600/70 shadow-[0_2px_8px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)]"
            transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 35 }}
          >
            <div className="absolute top-0 inset-x-2 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />
          </motion.div>
        )}
        <motion.div
          animate={shouldReduceMotion ? undefined : (mode === 'slide' ? { scale: [1, 1.25, 1], rotate: [0, -8, 0] } : { scale: 1, rotate: 0 })}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative z-10"
        >
          <ChevronsLeftRight
            className={`w-3.5 h-3.5 transition-colors ${
              mode === 'slide' ? 'text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]' : 'text-zinc-400'
            }`}
            aria-hidden="true"
          />
        </motion.div>
        <span className="relative z-10 hidden sm:inline">Slide</span>
      </motion.button>

      <motion.button
        ref={listRadioRef}
        type="button"
        role="radio"
        aria-checked={mode === 'list'}
        tabIndex={mode === 'list' ? 0 : -1}
        aria-label="Categorized grid list navigation"
        onClick={() => onModeChange('list')}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
        className={`relative flex items-center gap-1.5 px-2.5 py-1 min-h-[28px] rounded-lg text-[11px] font-medium transition-colors duration-150 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400 ${
          mode === 'list' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        {mode === 'list' && (
          <motion.div
            layoutId={shouldReduceMotion ? undefined : "navModePill"}
            className="absolute inset-0 bg-gradient-to-b from-zinc-700/80 via-zinc-800/95 to-zinc-900 rounded-lg border border-zinc-600/70 shadow-[0_2px_8px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)]"
            transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 35 }}
          >
            <div className="absolute top-0 inset-x-2 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />
          </motion.div>
        )}
        <motion.div
          animate={shouldReduceMotion ? undefined : (mode === 'list' ? { scale: [1, 1.25, 1], rotate: [0, 8, 0] } : { scale: 1, rotate: 0 })}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative z-10"
        >
          <LayoutGrid
            className={`w-3.5 h-3.5 transition-colors ${
              mode === 'list' ? 'text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]' : 'text-zinc-400'
            }`}
            aria-hidden="true"
          />
        </motion.div>
        <span className="relative z-10 hidden sm:inline">List</span>
      </motion.button>
    </div>
  );
};
