import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NAV_ITEMS } from './navConfig';
import type { NavItemConfig } from './navConfig';

interface NavSlideRailProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount?: number;
}

export const NavSlideRail: React.FC<NavSlideRailProps> = ({
  activeTab,
  setActiveTab,
  pendingCount = 0
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const activeTabRef = useRef<HTMLButtonElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScrollability();
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => checkScrollability();
    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkScrollability);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [checkScrollability]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const tabEl = activeTabRef.current;
    if (!container || !tabEl) return;

    const containerWidth = container.clientWidth;
    const tabOffsetLeft = tabEl.offsetLeft;
    const tabWidth = tabEl.clientWidth;

    const targetScrollLeft = tabOffsetLeft - containerWidth / 2 + tabWidth / 2;
    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: 'smooth'
    });
  }, [activeTab]);

  const handleScrollStep = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const delta = direction === 'left' ? -220 : 220;
    container.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % NAV_ITEMS.length;
      setActiveTab(NAV_ITEMS[nextIndex].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + NAV_ITEMS.length) % NAV_ITEMS.length;
      setActiveTab(NAV_ITEMS[prevIndex].id);
    }
  };

  return (
    <div
      className="relative flex items-center max-w-full overflow-hidden"
      role="region"
      aria-label="Sliding Navigation Tabs"
    >
      <AnimatePresence>
        {canScrollLeft && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 z-20 flex items-center h-full pl-0.5"
          >
            <button
              type="button"
              onClick={() => handleScrollStep('left')}
              aria-label="Scroll tabs left"
              className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 shadow-lg shadow-black/80 backdrop-blur-md transition-all cursor-pointer hover:scale-105 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`absolute left-0 top-0 bottom-0 w-8 pointer-events-none z-10 bg-gradient-to-r from-[#0a0c12] to-transparent transition-opacity duration-200 ${
          canScrollLeft ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        ref={scrollContainerRef}
        role="tablist"
        aria-label="EthnoKG Sections"
        className="flex items-center gap-1.5 overflow-x-auto scrollbar-none px-7 py-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {NAV_ITEMS.map((item: NavItemConfig, index: number) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badgeValue =
            item.id === 'verification' && pendingCount > 0 ? pendingCount : undefined;

          return (
            <button
              key={item.id}
              ref={isActive ? activeTabRef : null}
              role="tab"
              id={`nav-tab-${item.id}`}
              aria-selected={isActive}
              aria-controls={`nav-panel-${item.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(item.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`relative group shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer select-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                isActive
                  ? 'text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSlideTabPill"
                  className="absolute inset-0 bg-gradient-to-r from-zinc-800/95 via-zinc-800/90 to-zinc-700/80 border border-zinc-600/70 rounded-xl shadow-md shadow-black/50"
                  transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                />
              )}

              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
              )}

              <Icon
                className={`w-3.5 h-3.5 relative z-10 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                }`}
              />

              <span className="relative z-10 whitespace-nowrap">{item.label}</span>

              {badgeValue !== undefined && (
                <span className="relative z-10 ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 animate-pulse">
                  {badgeValue}
                </span>
              )}

              <span className="relative z-10 text-[9px] font-mono text-zinc-500 group-hover:text-zinc-400 hidden xl:inline opacity-0 group-hover:opacity-100 transition-opacity">
                {item.hotkey}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className={`absolute right-0 top-0 bottom-0 w-8 pointer-events-none z-10 bg-gradient-to-l from-[#0a0c12] to-transparent transition-opacity duration-200 ${
          canScrollRight ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <AnimatePresence>
        {canScrollRight && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-20 flex items-center h-full pr-0.5"
          >
            <button
              type="button"
              onClick={() => handleScrollStep('right')}
              aria-label="Scroll tabs right"
              className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 shadow-lg shadow-black/80 backdrop-blur-md transition-all cursor-pointer hover:scale-105 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
