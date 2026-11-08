import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, Layers, ArrowRight } from 'lucide-react';
import { NAV_CATEGORIES, NAV_ITEMS, getNavItemBadge } from './navConfig';
import type { NavCategoryId, NavItemConfig } from './navConfig';

interface NavMegaMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount?: number;
}

export const NavMegaMenu: React.FC<NavMegaMenuProps> = ({
  activeTab,
  setActiveTab,
  pendingCount = 0
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const activeItem = NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0];
  const activeCategory = NAV_CATEGORIES[activeItem.category];
  const ActiveIcon = activeItem.icon;

  const closeMenu = (restoreFocus = true) => {
    setIsOpen(false);
    if (restoreFocus) {
      setTimeout(() => triggerRef.current?.focus(), 10);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu(true);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (itemId: string) => {
    setActiveTab(itemId);
    closeMenu(true);
  };

  const categories: NavCategoryId[] = ['intelligence', 'evidence', 'governance'];

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs transition-all duration-200 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400 ${
          isOpen
            ? 'bg-zinc-800/95 border-sky-500/60 shadow-lg shadow-sky-950/40 text-white'
            : 'bg-zinc-900/90 border-zinc-700/80 hover:border-zinc-500/70 text-zinc-300 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <ActiveIcon className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold">{activeItem.label}</span>
        </div>

        <span className="text-[10px] text-zinc-400 hidden md:inline">
          • {activeCategory.shortLabel}
        </span>

        {activeItem.id === 'verification' && pendingCount > 0 && (
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/40">
            {pendingCount}
          </span>
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-sky-400' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2.5 w-[92vw] max-w-4xl p-5 rounded-2xl bg-[#0e111a]/95 backdrop-blur-2xl border border-zinc-700/80 shadow-2xl shadow-black/90 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800/80 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span className="font-semibold text-zinc-200">Platform Modules & Tools</span>
                <span className="text-[11px] text-zinc-500 hidden sm:inline">
                  (11 Specialized Discovery Components)
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                <span className="hidden sm:inline">
                  Use hotkeys{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">
                    1-9, 0, E
                  </kbd>
                </span>
                <span className="inline-flex items-center gap-1 text-sky-400/90">
                  <Sparkles className="w-3 h-3" />
                  Live Sync
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {categories.map((catId) => {
                const category = NAV_CATEGORIES[catId];
                const items = NAV_ITEMS.filter((item) => item.category === catId);

                return (
                  <div key={catId} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/50">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                        {category.label}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border bg-gradient-to-r ${category.badgeColor}`}
                      >
                        {items.length}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-1">
                      {items.map((item: NavItemConfig) => {
                        const Icon = item.icon;
                        const isSelected = activeTab === item.id;
                        const badgeVal = getNavItemBadge(item.id, pendingCount);

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelect(item.id)}
                            className={`group relative text-left p-2.5 rounded-xl border transition-all duration-150 cursor-pointer flex items-start gap-3 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400 ${
                              isSelected
                                ? 'bg-zinc-800/90 border-sky-500/50 shadow-md shadow-sky-950/20'
                                : 'bg-zinc-900/40 hover:bg-zinc-800/60 border-zinc-800/60 hover:border-zinc-700/80'
                            }`}
                          >
                            <div
                              className={`p-2 rounded-lg border shrink-0 transition-transform group-hover:scale-105 ${
                                isSelected
                                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                  : 'bg-zinc-800/70 text-zinc-400 group-hover:text-zinc-200 border-zinc-700/50'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span
                                  className={`text-xs font-semibold truncate ${
                                    isSelected
                                      ? 'text-white'
                                      : 'text-zinc-200 group-hover:text-white'
                                  }`}
                                >
                                  {item.label}
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {badgeVal !== undefined && (
                                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/40">
                                      {badgeVal}
                                    </span>
                                  )}
                                  <kbd className="hidden sm:inline-block text-[9px] font-mono px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                    {item.hotkey}
                                  </kbd>
                                </div>
                              </div>
                              <p className="text-[11px] text-zinc-400 line-clamp-1 group-hover:text-zinc-300">
                                {item.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                <span>Select any module to navigate directly</span>
              </span>
              <button
                type="button"
                onClick={() => closeMenu(true)}
                className="text-zinc-400 hover:text-zinc-200 text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <span>Close menu</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
