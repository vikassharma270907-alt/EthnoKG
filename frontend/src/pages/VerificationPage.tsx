import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ShieldCheck, 
  Check, 
  Trash2, 
  Edit3, 
  Clock, 
  CheckCircle2, 
  Quote,
  Sparkles,
  SlidersHorizontal,
  LayoutGrid,
  ChevronsLeftRight,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import { 
  fetchExtractionResults, 
  approveVerification, 
  rejectVerification, 
  patchVerification 
} from '../api/client';
import type { RelationshipDetail } from '../types';
import { VerificationModal } from '../components/VerificationModal';
import { fireCuratorConfetti } from '../utils/confetti';
import { GlowCard } from '../components/GlowCard';

export type VerificationViewMode = 'list' | 'deck';

export const VerificationPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | ''>('pending');
  const [minConfidence, setMinConfidence] = useState<number>(0.5);
  const [relationships, setRelationships] = useState<RelationshipDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifiedToast, setVerifiedToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // View mode state with local storage persistence
  const [viewMode, setViewMode] = useState<VerificationViewMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ethnokg_verification_view_mode');
        if (saved === 'list' || saved === 'deck') {
          return saved;
        }
      } catch {
        // Ignore storage exceptions
      }
    }
    return 'list';
  });

  // Deck Mode state
  const [deckIndex, setDeckIndex] = useState(0);
  const [deckDirection, setDeckDirection] = useState<-1 | 1>(1);

  // References for accessibility
  const listRadioRef = useRef<HTMLButtonElement | null>(null);
  const deckRadioRef = useRef<HTMLButtonElement | null>(null);

  // Active modal for editing
  const [activeRel, setActiveRel] = useState<RelationshipDetail | null>(null);

  const loadData = useCallback(() => {
    fetchExtractionResults({
      status: filterStatus || undefined,
      min_confidence: minConfidence,
      limit: 100
    }).then(setRelationships).finally(() => setIsLoading(false));
  }, [filterStatus, minConfidence]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetchExtractionResults({
      status: filterStatus || undefined,
      min_confidence: minConfidence,
      limit: 100
    }).then(data => {
      if (isMounted) {
        setRelationships(data);
        setIsLoading(false);
      }
    }).catch(err => {
      if (isMounted) {
        console.error(err);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [filterStatus, minConfidence]);

  // Derived safeDeckIndex to avoid cascading render loops
  const safeDeckIndex =
    relationships.length === 0
      ? 0
      : Math.min(deckIndex, relationships.length - 1);

  const handleViewModeChange = (newMode: VerificationViewMode) => {
    setViewMode(newMode);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ethnokg_verification_view_mode', newMode);
      } catch {
        // Ignore storage exceptions
      }
    }
  };

  const handleViewToggleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleViewModeChange('deck');
      deckRadioRef.current?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      handleViewModeChange('list');
      listRadioRef.current?.focus();
    }
  };

  const handlePrevDeck = useCallback(() => {
    if (safeDeckIndex > 0) {
      setDeckDirection(-1);
      setDeckIndex(safeDeckIndex - 1);
    }
  }, [safeDeckIndex]);

  const handleNextDeck = useCallback(() => {
    if (safeDeckIndex < relationships.length - 1) {
      setDeckDirection(1);
      setDeckIndex(safeDeckIndex + 1);
    }
  }, [safeDeckIndex, relationships.length]);

  const handleQuickApprove = useCallback(async (rel: RelationshipDetail) => {
    try {
      await approveVerification(rel.id, {
        reviewer_name: 'Dr. Vance (Expert Curator)',
        notes: 'Verified against primary excerpt text.'
      });
      fireCuratorConfetti();
      setVerifiedToast(`Successfully verified: ${rel.plant_scientific_name} ➔ ${rel.condition_name || rel.compound_name}`);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setVerifiedToast(null), 4000);
      loadData();
    } catch (err: any) {
      console.error(err);
      setErrorToast(err?.message || 'Failed to approve relationship.');
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setErrorToast(null), 4000);
    }
  }, [loadData]);

  const handleQuickReject = useCallback(async (rel: RelationshipDetail) => {
    try {
      await rejectVerification(rel.id, {
        reviewer_name: 'Dr. Vance (Expert Curator)',
        reason: 'Extraction inaccurate or not supported by excerpt.'
      });
      loadData();
    } catch (err: any) {
      console.error(err);
      setErrorToast(err?.message || 'Failed to reject relationship.');
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setErrorToast(null), 4000);
    }
  }, [loadData]);

  // Keyboard navigation and actions in Deck mode
  useEffect(() => {
    if (viewMode !== 'deck' || activeRel !== null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevDeck();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextDeck();
      } else if (e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'y') {
        const current = relationships[safeDeckIndex];
        if (current && current.verification_status !== 'approved') {
          e.preventDefault();
          handleQuickApprove(current);
        }
      } else if (e.key.toLowerCase() === 'r' || e.key.toLowerCase() === 'n') {
        const current = relationships[safeDeckIndex];
        if (current && current.verification_status !== 'rejected') {
          e.preventDefault();
          handleQuickReject(current);
        }
      } else if (e.key.toLowerCase() === 'e') {
        const current = relationships[safeDeckIndex];
        if (current) {
          e.preventDefault();
          setActiveRel(current);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, safeDeckIndex, relationships, activeRel, handlePrevDeck, handleNextDeck, handleQuickApprove, handleQuickReject]);

  const handleModalApprove = async (id: number, notes: string) => {
    try {
      await approveVerification(id, { reviewer_name: 'Dr. Vance (Expert Curator)', notes });
      fireCuratorConfetti();
      loadData();
    } catch (err: any) {
      setErrorToast(err?.message || 'Failed to approve relationship.');
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setErrorToast(null), 4000);
    }
  };

  const handleModalReject = async (id: number, reason: string) => {
    try {
      await rejectVerification(id, { reviewer_name: 'Dr. Vance (Expert Curator)', reason });
      loadData();
    } catch (err: any) {
      setErrorToast(err?.message || 'Failed to reject relationship.');
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setErrorToast(null), 4000);
    }
  };

  const handleModalUpdate = async (id: number, data: any) => {
    try {
      await patchVerification(id, data);
      loadData();
    } catch (err: any) {
      setErrorToast(err?.message || 'Failed to update relationship.');
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setErrorToast(null), 4000);
    }
  };

  const deckVariants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 350, damping: 32 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 }
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 120 : -120,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring' as const, stiffness: 350, damping: 32 },
        opacity: { duration: 0.2 }
      }
    })
  };

  const reducedMotionDeckVariants: Variants = {
    enter: { opacity: 0 },
    center: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } }
  };

  const currentDeckRel = relationships[deckIndex];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {verifiedToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-gradient-to-r from-zinc-200 to-white text-zinc-950 font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs border border-zinc-400 font-mono"
          >
            <Sparkles className="w-4 h-4 fill-zinc-950" />
            <span>{verifiedToast}</span>
          </motion.div>
        )}
        {errorToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-zinc-900 text-zinc-200 font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs border border-zinc-700 backdrop-blur-md font-mono"
          >
            <Trash2 className="w-4 h-4 text-zinc-400" />
            <span>{errorToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="pb-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Human Verification Workspace</span>
            </h1>
            <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
              Expert Curator Loop
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Curators review, correct, and validate AI-extracted claims against primary excerpts.
            Only verified records enter the certified knowledge base.
          </p>
        </div>

        {/* View Mode Toggle & Total in Queue */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented View Mode Toggle */}
          <div
            role="radiogroup"
            aria-label="Verification workspace display mode"
            onKeyDown={handleViewToggleKeyDown}
            className="inline-flex items-center p-0.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 shadow-inner backdrop-blur-md"
          >
            {/* List Option */}
            <motion.button
              ref={listRadioRef}
              type="button"
              role="radio"
              aria-checked={viewMode === 'list'}
              tabIndex={viewMode === 'list' ? 0 : -1}
              aria-label="List review layout"
              onClick={() => handleViewModeChange('list')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 min-h-[30px] rounded-lg text-xs font-medium transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                viewMode === 'list' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {viewMode === 'list' && (
                <motion.div
                  layoutId={shouldReduceMotion ? undefined : 'verificationViewPill'}
                  className="absolute inset-0 bg-gradient-to-b from-zinc-700/80 via-zinc-800/95 to-zinc-900 rounded-lg border border-zinc-600/70 shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 500, damping: 35 }
                  }
                >
                  <div className="absolute top-0 inset-x-2 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
                </motion.div>
              )}
              <LayoutGrid
                className={`relative z-10 w-3.5 h-3.5 ${
                  viewMode === 'list' ? 'text-emerald-400' : 'text-zinc-400'
                }`}
                aria-hidden="true"
              />
              <span className="relative z-10">List</span>
            </motion.button>

            {/* Deck Option */}
            <motion.button
              ref={deckRadioRef}
              type="button"
              role="radio"
              aria-checked={viewMode === 'deck'}
              tabIndex={viewMode === 'deck' ? 0 : -1}
              aria-label="Adjudication deck layout"
              onClick={() => handleViewModeChange('deck')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 min-h-[30px] rounded-lg text-xs font-medium transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                viewMode === 'deck' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {viewMode === 'deck' && (
                <motion.div
                  layoutId={shouldReduceMotion ? undefined : 'verificationViewPill'}
                  className="absolute inset-0 bg-gradient-to-b from-zinc-700/80 via-zinc-800/95 to-zinc-900 rounded-lg border border-zinc-600/70 shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 500, damping: 35 }
                  }
                >
                  <div className="absolute top-0 inset-x-2 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
                </motion.div>
              )}
              <ChevronsLeftRight
                className={`relative z-10 w-3.5 h-3.5 ${
                  viewMode === 'deck' ? 'text-emerald-400' : 'text-zinc-400'
                }`}
                aria-hidden="true"
              />
              <span className="relative z-10">Deck</span>
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-mono">Queue:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#151722] font-mono text-xs text-emerald-400 font-bold border border-zinc-700">
              {relationships.length} Claims
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Confidence Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#101218]/90 border border-zinc-800 p-3 rounded-2xl shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-zinc-800 text-white border border-zinc-600 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pending Review</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterStatus === 'approved'
                ? 'bg-zinc-800 text-white border border-zinc-600 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Claims</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterStatus === 'rejected'
                ? 'bg-zinc-800 text-white border border-zinc-600 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Rejected</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === ''
                ? 'bg-zinc-200 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>All Records</span>
          </button>
        </div>

        {/* Confidence slider */}
        <div className="flex items-center gap-3 bg-[#151722] px-3.5 py-1.5 rounded-xl border border-zinc-800 font-mono">
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[11px] text-zinc-400">Min Confidence:</span>
          <input
            type="range"
            min="0"
            max="0.95"
            step="0.05"
            value={minConfidence}
            onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
            className="w-24 accent-emerald-400 cursor-pointer"
          />
          <span className="font-mono text-xs text-white font-semibold">{Math.round(minConfidence * 100)}%</span>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-zinc-400 text-xs font-mono">Loading curator queue...</p>
        </div>
      ) : relationships.length === 0 ? (
        <div className="bg-[#101218] border border-zinc-800 rounded-2xl p-12 text-center text-zinc-400 font-mono">
          <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
          <p className="text-sm">No items in the curator queue for this filter.</p>
        </div>
      ) : (
        <>
          {/* ========================================================
              VIEW MODE: CURATOR ADJUDICATION DECK
             ======================================================== */}
          {viewMode === 'deck' && currentDeckRel && (
            <div className="space-y-4">
              {/* Deck Navigation & Progress Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#101218]/80 border border-zinc-800 px-4 py-3 rounded-2xl backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-zinc-400">Reviewing Claim:</span>
                  <span className="text-white font-bold bg-[#151722] border border-zinc-700/80 px-2.5 py-0.5 rounded-lg">
                    {deckIndex + 1} of {relationships.length}
                  </span>
                  <span className="text-zinc-500 hidden md:inline">
                    (Shortcuts: [A] Approve, [R] Reject, [E] Edit, [← / →] Navigate)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full sm:w-48 h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                    style={{ width: `${((deckIndex + 1) / relationships.length) * 100}%` }}
                  />
                </div>

                {/* Prev / Next buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevDeck}
                    disabled={deckIndex === 0}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                      deckIndex === 0
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
                        : 'bg-[#151722] border-zinc-700 text-zinc-200 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextDeck}
                    disabled={deckIndex === relationships.length - 1}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                      deckIndex === relationships.length - 1
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
                        : 'bg-[#151722] border-zinc-700 text-zinc-200 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Deck Card */}
              <div className="relative min-h-[380px] overflow-hidden">
                <AnimatePresence mode="wait" custom={deckDirection}>
                  <motion.div
                    key={currentDeckRel.id}
                    custom={deckDirection}
                    variants={shouldReduceMotion ? reducedMotionDeckVariants : deckVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full"
                  >
                    <GlowCard
                      glowColor="silver"
                      className="p-6 sm:p-8 bg-gradient-to-b from-[#12151e]/95 via-[#10121a]/95 to-[#0e1017]/95 border border-zinc-800/90 rounded-2xl shadow-2xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />

                      {/* Top Meta Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold bg-zinc-800/90 text-zinc-200 border border-zinc-700/80 px-2.5 py-0.5 rounded-full">
                            Claim #{currentDeckRel.id}
                          </span>
                          <span className="text-[11px] font-mono bg-[#151722] text-zinc-300 border border-zinc-700 px-2.5 py-0.5 rounded-full">
                            {currentDeckRel.knowledge_tradition}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold font-mono border px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-200 border-zinc-700">
                            {currentDeckRel.evidence_tier}
                          </span>
                          <span className="text-xs font-mono text-emerald-400 font-bold bg-[#151722] border border-zinc-700 px-2 py-0.5 rounded-md">
                            {Math.round(currentDeckRel.extraction_confidence * 100)}% Confidence
                          </span>
                          <span
                            className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full font-mono ${
                              currentDeckRel.verification_status === 'approved'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80'
                                : currentDeckRel.verification_status === 'rejected'
                                ? 'bg-rose-950/80 text-rose-300 border border-rose-700/80'
                                : 'bg-amber-950/80 text-amber-300 border border-amber-700/80'
                            }`}
                          >
                            {currentDeckRel.verification_status}
                          </span>
                        </div>
                      </div>

                      {/* Scientific Relation Target */}
                      <div className="mt-6 flex flex-wrap items-baseline gap-3">
                        <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white italic tracking-tight">
                          {currentDeckRel.plant_scientific_name}
                        </h2>
                        <span className="text-xl text-zinc-500 font-mono">→</span>
                        <h3 className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 tracking-tight">
                          {currentDeckRel.condition_name || currentDeckRel.compound_name}
                        </h3>
                      </div>

                      {/* Verbatim Excerpt */}
                      {currentDeckRel.supporting_excerpt && (
                        <div className="mt-6 p-4 rounded-xl bg-[#151724] border border-zinc-800 relative">
                          <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs font-bold uppercase mb-2">
                            <Quote className="w-4 h-4 text-emerald-400" />
                            <span>Verbatim Scientific Literature Excerpt</span>
                          </div>
                          <p className="text-zinc-200 italic leading-relaxed text-sm">
                            "{currentDeckRel.supporting_excerpt}"
                          </p>
                        </div>
                      )}

                      {/* 3-Column Attributes Grid */}
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-[#141622]/80 border border-zinc-800 p-3 rounded-xl">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                            Plant Part & Preparation
                          </span>
                          <span className="text-zinc-200 font-medium">
                            {currentDeckRel.plant_part || 'Whole plant'} ({currentDeckRel.preparation_method || 'Traditional method'})
                          </span>
                        </div>

                        <div className="bg-[#141622]/80 border border-zinc-800 p-3 rounded-xl">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                            Active Metabolite
                          </span>
                          <span className="text-zinc-200 font-mono font-medium">
                            {currentDeckRel.compound_name || 'Phytochemical extract'}
                          </span>
                        </div>

                        <div className="bg-[#141622]/80 border border-zinc-800 p-3 rounded-xl">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                            Pharmacological Activity
                          </span>
                          <span className="text-zinc-200 font-medium">
                            {currentDeckRel.pharmacological_activity || 'Empirical bioactivity'}
                          </span>
                        </div>
                      </div>

                      {/* Source Citation */}
                      <div className="mt-6 text-xs text-zinc-400 font-mono flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-zinc-500" />
                        <span className="truncate">Source: {currentDeckRel.document_title || 'Indexed Corpus'}</span>
                      </div>

                      {/* Adjudication Actions */}
                      <div className="mt-8 pt-5 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveRel(currentDeckRel)}
                          className="px-4 py-2.5 bg-[#151722] hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer font-mono"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-zinc-300" />
                          <span>Review & Edit [E]</span>
                        </button>

                        <div className="flex items-center gap-3">
                          {currentDeckRel.verification_status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => handleQuickReject(currentDeckRel)}
                              className="px-4 py-2.5 bg-zinc-900 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-zinc-800 hover:border-rose-800/60 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer font-mono"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                              <span>Reject [R]</span>
                            </button>
                          )}

                          {currentDeckRel.verification_status !== 'approved' && (
                            <motion.button
                              type="button"
                              onClick={() => handleQuickApprove(currentDeckRel)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/50 cursor-pointer font-mono"
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                              <span>Quick Approve [A]</span>
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </GlowCard>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Quick Jump Ribbon */}
              <div className="pt-2">
                <div className="flex items-center justify-between pb-2 text-xs font-mono text-zinc-400">
                  <span>Queue Navigator ({relationships.length} items):</span>
                  <span>Click to select claim</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700">
                  {relationships.map((r, idx) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setDeckDirection(idx > deckIndex ? 1 : -1);
                        setDeckIndex(idx);
                      }}
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                        idx === deckIndex
                          ? 'bg-emerald-950/80 border-emerald-500 text-white font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                          : 'bg-[#12141d] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className="text-zinc-500 mr-1.5">#{r.id}</span>
                      <span className="italic">{r.plant_scientific_name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW MODE: LIST REVIEW (PRESERVED)
             ======================================================== */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              <AnimatePresence>
                {relationships.map((rel) => (
                  <GlowCard 
                    key={rel.id}
                    glowColor="silver"
                    className="p-5 space-y-3.5"
                  >
                    {/* Header row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-mono">{rel.plant_scientific_name}</span>
                        <span className="text-xs text-zinc-500">→</span>
                        <span className="text-sm font-semibold text-zinc-200 font-mono">{rel.condition_name || rel.compound_name}</span>
                        <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
                          {rel.knowledge_tradition}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-200 border border-zinc-700 px-2.5 py-0.5 rounded-full font-mono">
                          {rel.evidence_tier}
                        </span>
                        <span className="text-xs font-mono text-white font-bold bg-[#151722] border border-zinc-700 px-2 py-0.5 rounded-md">
                          Confidence: {Math.round(rel.extraction_confidence * 100)}%
                        </span>
                        <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full font-mono ${
                          rel.verification_status === 'approved' 
                            ? 'bg-zinc-800 text-zinc-200 border border-zinc-600' 
                            : rel.verification_status === 'rejected'
                            ? 'bg-zinc-900 text-zinc-400 border border-zinc-700'
                            : 'bg-zinc-850 text-zinc-300 border border-zinc-700'
                        }`}>
                          {rel.verification_status}
                        </span>
                      </div>
                    </div>

                    {/* Grid details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-zinc-500 font-semibold block font-mono">Part & Preparation</span>
                        <span className="text-zinc-300">{rel.plant_part || 'Whole plant'} ({rel.preparation_method || 'Traditional method'})</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-zinc-500 font-semibold block font-mono">Active Metabolite</span>
                        <span className="text-zinc-200 font-mono">{rel.compound_name || 'Phytochemical extract'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-zinc-500 font-semibold block font-mono">Pharmacological Activity</span>
                        <span className="text-zinc-300">{rel.pharmacological_activity || 'Empirical bioactivity'}</span>
                      </div>
                    </div>

                    {/* Excerpt with Verbatim quote */}
                    {rel.supporting_excerpt && (
                      <div className="bg-[#151722] p-3.5 rounded-xl border border-zinc-800 text-xs">
                        <div className="flex items-center gap-1.5 text-zinc-400 font-bold uppercase text-[10px] mb-1 font-mono">
                          <Quote className="w-3 h-3 text-zinc-400" />
                          <span>Verbatim Literature Excerpt:</span>
                        </div>
                        <p className="text-zinc-300 italic leading-relaxed">
                          "{rel.supporting_excerpt}"
                        </p>
                      </div>
                    )}

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-zinc-800 gap-2">
                      <div className="text-[11px] text-zinc-500 font-mono">
                        <span>Source: {rel.document_title || 'Indexed Corpus'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveRel(rel)}
                          className="px-3 py-1.5 bg-[#151722] hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer font-mono"
                        >
                          <Edit3 className="w-3 h-3 text-zinc-300" />
                          <span>Review & Edit</span>
                        </button>

                        {rel.verification_status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleQuickApprove(rel)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-zinc-200 to-white hover:from-white hover:to-zinc-200 text-zinc-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md shadow-black/40 cursor-pointer font-mono"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Quick Approve</span>
                          </button>
                        )}

                        {rel.verification_status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => handleQuickReject(rel)}
                            className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer font-mono"
                          >
                            <Trash2 className="w-3 h-3 text-zinc-400" />
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </GlowCard>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Edit / Curation Modal with fresh instance per queue item */}
      {activeRel && (
        <VerificationModal
          key={activeRel.id}
          rel={activeRel}
          relationship={activeRel}
          onClose={() => setActiveRel(null)}
          onApprove={handleModalApprove}
          onReject={handleModalReject}
          onUpdate={handleModalUpdate}
        />
      )}

    </div>
  );
};
