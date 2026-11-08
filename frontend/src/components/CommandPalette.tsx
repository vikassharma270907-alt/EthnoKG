import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CornerDownLeft, Sparkles, FileVideo, Cpu, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NAV_ITEMS } from './navConfig';

export interface PaletteAction {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: LucideIcon;
  hotkey?: string;
  onSelect: () => void;
  badge?: string | number;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
  pendingCount?: number;
  onOpenVideoWalkthrough?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  pendingCount = 0,
  onOpenVideoWalkthrough
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const actions: PaletteAction[] = useMemo(() => {
    const list: PaletteAction[] = [];

    if (onOpenVideoWalkthrough) {
      list.push({
        id: 'action-video',
        title: 'Watch 10-Minute Video Presentation',
        subtitle: 'Comprehensive video walkthrough of the EthnoKG platform and methodology',
        category: 'Quick Action',
        icon: FileVideo,
        hotkey: 'V',
        badge: '10m',
        onSelect: () => {
          onOpenVideoWalkthrough();
          onClose();
        }
      });
    }

    list.push({
      id: 'action-mine',
      title: 'Run Literature Mining Pipeline',
      subtitle: 'Extract new traditional knowledge claims, compounds, and disease links',
      category: 'Quick Action',
      icon: Cpu,
      hotkey: '6',
      badge: 'NLP',
      onSelect: () => {
        setActiveTab('extraction');
        onClose();
      }
    });

    NAV_ITEMS.forEach((item) => {
      const badge =
        item.id === 'verification' && pendingCount > 0
          ? `${pendingCount} Pending`
          : item.statusTag;

      list.push({
        id: `nav-${item.id}`,
        title: item.label,
        subtitle: item.description,
        category: 'Navigation',
        icon: item.icon,
        hotkey: item.hotkey,
        badge,
        onSelect: () => {
          setActiveTab(item.id);
          onClose();
        }
      });
    });

    return list;
  }, [onOpenVideoWalkthrough, onClose, setActiveTab, pendingCount]);

  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (action) =>
        action.title.toLowerCase().includes(q) ||
        action.subtitle.toLowerCase().includes(q) ||
        action.category.toLowerCase().includes(q) ||
        (action.badge && String(action.badge).toLowerCase().includes(q))
    );
  }, [query, actions]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setQuery('');
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredActions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length)
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredActions[selectedIndex];
      if (current) {
        current.onSelect();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selectedEl = list.children[selectedIndex] as HTMLElement | undefined;
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="EthnoKG Command Palette"
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -16 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="relative w-full max-w-xl rounded-2xl bg-[#0c0e16] border border-zinc-700/80 shadow-2xl shadow-black/90 overflow-hidden z-10"
          >
            <div className="flex items-center px-4 py-3.5 border-b border-zinc-800 gap-3">
              <Search className="w-5 h-5 text-zinc-300 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search modules, plants, evidence, or commands... (e.g. Graph, Neem, Video)"
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-hidden"
              />
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800/80 border border-zinc-700 rounded">
                ESC
              </kbd>
            </div>

            <div
              ref={listRef}
              className="max-h-[380px] overflow-y-auto p-2 scrollbar-none space-y-1"
            >
              {filteredActions.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  <Sparkles className="w-6 h-6 mx-auto mb-2 text-zinc-600 animate-pulse" />
                  No matching module or action found for "{query}".
                </div>
              ) : (
                filteredActions.map((action, idx) => {
                  const Icon = action.icon;
                  const isSelected = idx === selectedIndex;

                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={action.onSelect}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-800/90 border-zinc-500/70 text-white shadow-sm'
                          : 'bg-transparent border-transparent text-zinc-300 hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-lg border shrink-0 ${
                            isSelected
                              ? 'bg-zinc-700/80 text-white border-zinc-600'
                              : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/40'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold truncate">{action.title}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 shrink-0">
                              {action.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate">{action.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        {action.badge && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {action.badge}
                          </span>
                        )}
                        {isSelected && (
                          <CornerDownLeft className="w-3.5 h-3.5 text-zinc-300" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="px-4 py-2.5 bg-zinc-950/90 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
              <div className="flex items-center gap-3">
                <span>
                  <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-400 font-mono">↑↓</kbd>{' '}
                  Navigate
                </span>
                <span>
                  <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-400 font-mono">↵</kbd>{' '}
                  Select
                </span>
              </div>
              <span className="text-zinc-400 flex items-center gap-1 font-mono text-[10px]">
                EthnoKG Command Core
                <ArrowRight className="w-3 h-3 text-zinc-400" />
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
