import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Search, CornerDownLeft, Sparkles, FileVideo, Cpu, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NAV_ITEMS } from './navConfig';
import { useFocusTrap } from '../hooks/useFocusTrap';

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
  const shouldReduceMotion = useReducedMotion();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const isKeyboardNav = useRef(false);

  const modalRef = useFocusTrap<HTMLDivElement>({
    isOpen,
    onClose,
    initialFocusRef: inputRef
  });

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
      id: 'action-mining',
      title: 'Run Literature Mining Pipeline',
      subtitle: 'Extract new traditional knowledge claims, compounds, and disease links',
      category: 'Quick Action',
      icon: Cpu,
      badge: 'NLP',
      onSelect: () => {
        setActiveTab('extraction');
        onClose();
      }
    });

    NAV_ITEMS.forEach((item) => {
      let badge: string | number | undefined;
      if (item.id === 'verification' && pendingCount > 0) {
        badge = `${pendingCount} Pending`;
      } else {
        badge = item.statusTag;
      }

      list.push({
        id: item.id,
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
    if (!query.trim()) return actions;
    const lower = query.toLowerCase().trim();
    return actions.filter(
      (a) =>
        a.title.toLowerCase().includes(lower) ||
        a.subtitle.toLowerCase().includes(lower) ||
        a.category.toLowerCase().includes(lower) ||
        (a.hotkey && a.hotkey.toLowerCase() === lower)
    );
  }, [actions, query]);

  // Adjust selection bounds safely during render
  const safeSelectedIndex =
    filteredActions.length === 0 ? 0 : Math.min(selectedIndex, filteredActions.length - 1);

  if (safeSelectedIndex !== selectedIndex && filteredActions.length > 0) {
    setSelectedIndex(safeSelectedIndex);
  }

  // Scroll active item into view during keyboard navigation
  useEffect(() => {
    if (!isKeyboardNav.current) return;
    const list = listRef.current;
    if (!list) return;

    const activeEl = list.children[safeSelectedIndex] as HTMLElement | undefined;
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [safeSelectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredActions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      isKeyboardNav.current = true;
      setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      isKeyboardNav.current = true;
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredActions[safeSelectedIndex];
      if (selected) {
        selected.onSelect();
      }
    }
  };

  const activeDescendantId = filteredActions[safeSelectedIndex]
    ? `cmd-action-${filteredActions[safeSelectedIndex].id}`
    : undefined;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="EthnoKG Command Palette"
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6"
        >
          {/* Accessible Live Region */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {isOpen ? `${filteredActions.length} actions available for "${query}"` : ''}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
          />

          <motion.div
            ref={modalRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : -16 }}
            transition={shouldReduceMotion ? { duration: 0.05 } : { type: 'spring', stiffness: 450, damping: 30 }}
            className="relative w-full max-w-xl rounded-2xl bg-[#0c0e16] border border-zinc-700/80 shadow-2xl shadow-black/90 overflow-hidden z-10 focus:outline-hidden"
          >
            {/* Top Border Specular Beam */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 via-teal-400/50 to-transparent" />

            <div className="flex items-center px-4 py-3.5 border-b border-zinc-800 gap-3">
              <Search className="w-5 h-5 text-sky-400 shrink-0" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={isOpen}
                aria-autocomplete="list"
                aria-controls="command-palette-list"
                aria-activedescendant={activeDescendantId}
                aria-label="Search modules, plants, evidence, or commands"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search modules, plants, evidence, or commands... (e.g. Graph, Neem, Video)"
                className="w-full bg-transparent text-sm text-white placeholder-zinc-400 focus:outline-hidden"
              />
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-zinc-300 bg-zinc-800/80 border border-zinc-700 rounded" aria-hidden="true">
                ESC
              </kbd>
            </div>

            <div
              ref={listRef}
              id="command-palette-list"
              role="listbox"
              aria-label="Matching commands and modules"
              className="max-h-[380px] overflow-y-auto p-2 scrollbar-none space-y-1"
            >
              {filteredActions.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 text-xs">
                  <Sparkles className="w-6 h-6 mx-auto mb-2 text-zinc-500 animate-pulse" aria-hidden="true" />
                  No matching module or action found for "{query}".
                </div>
              ) : (
                filteredActions.map((action, idx) => {
                  const Icon = action.icon;
                  const isSelected = idx === safeSelectedIndex;

                  return (
                    <button
                      key={action.id}
                      id={`cmd-action-${action.id}`}
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={-1}
                      type="button"
                      onClick={action.onSelect}
                      onMouseEnter={() => {
                        isKeyboardNav.current = false;
                        setSelectedIndex(idx);
                      }}
                      className={`w-full text-left flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-800/90 border-sky-500/50 text-white shadow-sm'
                          : 'bg-transparent border-transparent text-zinc-300 hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-lg border shrink-0 ${
                            isSelected
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/40'
                          }`}
                        >
                          <Icon className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold truncate">{action.title}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60 shrink-0">
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
                          <CornerDownLeft className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="px-4 py-2.5 bg-zinc-950/90 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
              <div className="flex items-center gap-3">
                <span>
                  <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-300 font-mono">↑↓</kbd>{' '}
                  Navigate
                </span>
                <span>
                  <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-300 font-mono">↵</kbd>{' '}
                  Select
                </span>
              </div>
              <span className="text-sky-400/90 flex items-center gap-1 font-mono text-[10px]">
                EthnoKG Command Core
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
