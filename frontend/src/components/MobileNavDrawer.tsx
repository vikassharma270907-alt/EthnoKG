import React, { useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Network, FileVideo, Cpu, Search, Sparkles } from 'lucide-react';
import { NAV_CATEGORIES, NAV_ITEMS, getNavItemBadge } from './navConfig';
import type { NavCategoryId, NavItemConfig } from './navConfig';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount?: number;
  onOpenVideoWalkthrough?: () => void;
  onOpenSearch: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  pendingCount = 0,
  onOpenVideoWalkthrough,
  onOpenSearch
}) => {
  const shouldReduceMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const drawerRef = useFocusTrap<HTMLDivElement>({
    isOpen,
    onClose,
    initialFocusRef: closeButtonRef
  });

  const categories: NavCategoryId[] = ['intelligence', 'evidence', 'governance'];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className="fixed inset-0 z-50 lg:hidden flex justify-end"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            ref={drawerRef}
            tabIndex={-1}
            initial={{ x: shouldReduceMotion ? 0 : '100%', opacity: shouldReduceMotion ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: shouldReduceMotion ? 0 : '100%', opacity: shouldReduceMotion ? 0 : 1 }}
            transition={shouldReduceMotion ? { duration: 0.05 } : { type: 'spring', stiffness: 380, damping: 32 }}
            className="relative w-full max-w-sm h-full bg-[#0a0c12] border-l border-zinc-800/80 shadow-2xl flex flex-col z-10 overflow-hidden focus:outline-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                  <Network className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white font-mono text-sm">
                      Ethno<span className="text-sky-400">KG</span>
                    </span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                      '26
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400">Traditional Knowledge Core</p>
                </div>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-zinc-800/80">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSearch();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-sky-400" />
                  <span>Search modules & plants...</span>
                </div>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  ⌘K
                </kbd>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-none">
              {categories.map((catId) => {
                const category = NAV_CATEGORIES[catId];
                const items = NAV_ITEMS.filter((item) => item.category === catId);

                return (
                  <div key={catId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
                      <span>{category.label}</span>
                      <span className="text-[10px] font-mono text-zinc-400">{items.length}</span>
                    </div>

                    <div className="space-y-1">
                      {items.map((item: NavItemConfig) => {
                        const Icon = item.icon;
                        const isSelected = activeTab === item.id;
                        const badgeVal = getNavItemBadge(item.id, pendingCount);

                        return (
                          <button
                            key={item.id}
                            type="button"
                            aria-current={isSelected ? 'page' : undefined}
                            onClick={() => handleSelect(item.id)}
                            className={`w-full flex items-center justify-between p-2.5 min-h-[44px] rounded-xl border text-xs text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-zinc-800/90 border-sky-500/50 text-white font-medium shadow-sm'
                                : 'bg-zinc-900/30 border-transparent text-zinc-300 hover:bg-zinc-800/50 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`p-1.5 rounded-lg border ${
                                  isSelected
                                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                    : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/50'
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <div className="font-semibold">{item.label}</div>
                                <div className="text-[10px] text-zinc-400">{item.statusTag}</div>
                              </div>
                            </div>

                            {badgeVal !== undefined && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/40">
                                {badgeVal}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-zinc-800 bg-[#07090e] space-y-2">
              {onOpenVideoWalkthrough && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenVideoWalkthrough();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-sky-300 border border-sky-500/40 cursor-pointer"
                >
                  <FileVideo className="w-3.5 h-3.5 text-sky-400" />
                  <span>Watch 10-Minute Video Demo</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSelect('extraction')}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-white text-zinc-950 cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5 text-zinc-950" />
                <span>Mine Literature</span>
              </button>

              <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-zinc-400">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>100% Traceable Traditional Knowledge Discovery</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
