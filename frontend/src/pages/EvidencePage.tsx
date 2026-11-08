import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Database,
  ExternalLink,
  AlertTriangle,
  BookOpen,
  Quote,
  LayoutGrid,
  ChevronsLeftRight,
  Table,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Search,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import { fetchExtractionResults } from '../api/client';
import type { RelationshipDetail } from '../types';
import { GlowCard } from '../components/GlowCard';

export type EvidenceViewMode = 'list' | 'slide' | 'table';
export type EvidenceSortOption = 'confidence' | 'plant' | 'condition' | 'tier';
export type SortDirection = 'asc' | 'desc';

const TIERS = [
  'All Evidence Tiers',
  'Traditional Use Report',
  'Ethnobotanical Field Observation',
  'In-Vitro Experimental Bioassay',
  'In-Vivo Preclinical Model',
  'Clinical Human Trial',
  'In-Silico Prediction'
];

export const EvidencePage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  // Primary data state
  const [relationships, setRelationships] = useState<RelationshipDetail[]>([]);
  const [selectedTier, setSelectedTier] = useState('All Evidence Tiers');
  const [minConfidence, setMinConfidence] = useState<number>(0.7);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // View mode state with local storage persistence
  const [viewMode, setViewMode] = useState<EvidenceViewMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ethnokg_evidence_view_mode');
        if (saved === 'list' || saved === 'slide' || saved === 'table') {
          return saved;
        }
      } catch {
        // Ignore storage exceptions
      }
    }
    return 'list';
  });

  // Sort state
  const [sortBy, setSortBy] = useState<EvidenceSortOption>('confidence');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Slide mode carousel state
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<-1 | 1>(1);
  const slideContainerRef = useRef<HTMLDivElement | null>(null);

  // Radio button refs for accessibility
  const listRadioRef = useRef<HTMLButtonElement | null>(null);
  const slideRadioRef = useRef<HTMLButtonElement | null>(null);
  const tableRadioRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    fetchExtractionResults({
      evidence_tier: selectedTier === 'All Evidence Tiers' ? undefined : selectedTier,
      min_confidence: minConfidence,
      limit: 150
    })
      .then((data) => {
        if (isSubscribed) {
          setRelationships(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isSubscribed) {
          console.error('Failed to load evidence records:', err);
          setIsLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [selectedTier, minConfidence]);

  const handleViewModeChange = (newMode: EvidenceViewMode) => {
    setViewMode(newMode);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ethnokg_evidence_view_mode', newMode);
      } catch {
        // Ignore storage exceptions
      }
    }
  };

  const handleViewToggleKeyDown = (e: React.KeyboardEvent) => {
    const modes: EvidenceViewMode[] = ['list', 'slide', 'table'];
    const currentIndex = modes.indexOf(viewMode);
    let nextIndex = -1;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % modes.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + modes.length) % modes.length;
    }

    if (nextIndex !== -1) {
      const nextMode = modes[nextIndex];
      handleViewModeChange(nextMode);
      if (nextMode === 'list') listRadioRef.current?.focus();
      else if (nextMode === 'slide') slideRadioRef.current?.focus();
      else if (nextMode === 'table') tableRadioRef.current?.focus();
    }
  };

  // Filter and sort relationships
  const filteredRelationships = useMemo(() => {
    let list = relationships;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => {
        const plantMatch = r.plant_scientific_name?.toLowerCase().includes(q);
        const conditionMatch = r.condition_name?.toLowerCase().includes(q);
        const compoundMatch = r.compound_name?.toLowerCase().includes(q);
        const traditionMatch = r.knowledge_tradition?.toLowerCase().includes(q);
        const excerptMatch = r.supporting_excerpt?.toLowerCase().includes(q);
        return plantMatch || conditionMatch || compoundMatch || traditionMatch || excerptMatch;
      });
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'confidence') {
        const diff = (b.extraction_confidence ?? 0) - (a.extraction_confidence ?? 0);
        return sortDirection === 'desc' ? diff : -diff;
      }
      if (sortBy === 'plant') {
        const res = (a.plant_scientific_name || '').localeCompare(b.plant_scientific_name || '');
        return sortDirection === 'asc' ? res : -res;
      }
      if (sortBy === 'condition') {
        const res = (a.condition_name || '').localeCompare(b.condition_name || '');
        return sortDirection === 'asc' ? res : -res;
      }
      if (sortBy === 'tier') {
        const res = (a.evidence_tier || '').localeCompare(b.evidence_tier || '');
        return sortDirection === 'asc' ? res : -res;
      }
      return 0;
    });
  }, [relationships, searchQuery, sortBy, sortDirection]);

  // Derived safe slideIndex to prevent cascading render warnings
  const safeSlideIndex =
    filteredRelationships.length === 0
      ? 0
      : Math.min(slideIndex, filteredRelationships.length - 1);

  const handlePrevSlide = useCallback(() => {
    if (safeSlideIndex > 0) {
      setSlideDirection(-1);
      setSlideIndex(safeSlideIndex - 1);
    }
  }, [safeSlideIndex]);

  const handleNextSlide = useCallback(() => {
    if (safeSlideIndex < filteredRelationships.length - 1) {
      setSlideDirection(1);
      setSlideIndex(safeSlideIndex + 1);
    }
  }, [safeSlideIndex, filteredRelationships.length]);

  const handleGoToSlide = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < filteredRelationships.length && idx !== safeSlideIndex) {
        setSlideDirection(idx > safeSlideIndex ? 1 : -1);
        setSlideIndex(idx);
      }
    },
    [safeSlideIndex, filteredRelationships.length]
  );

  // Keyboard navigation for slide mode
  useEffect(() => {
    if (viewMode !== 'slide') return;

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
        handlePrevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === 'Home') {
        e.preventDefault();
        handleGoToSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        handleGoToSlide(filteredRelationships.length - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, handlePrevSlide, handleNextSlide, handleGoToSlide, filteredRelationships.length]);

  // CSV Export
  const exportEvidenceCSV = () => {
    if (!filteredRelationships.length) return;
    const headers = [
      'ID',
      'Plant Scientific Name',
      'Reported Condition',
      'Knowledge Tradition',
      'Evidence Tier',
      'Confidence',
      'Verification Status',
      'Plant Organ',
      'Preparation Method',
      'Reported Compound',
      'Pharmacological Activity',
      'Document Title',
      'Document DOI',
      'Verbatim Excerpt'
    ];
    const rows = filteredRelationships.map((r) => [
      r.id,
      `"${r.plant_scientific_name || ''}"`,
      `"${r.condition_name || ''}"`,
      `"${r.knowledge_tradition || ''}"`,
      `"${r.evidence_tier || ''}"`,
      r.extraction_confidence ?? '',
      `"${r.verification_status || ''}"`,
      `"${r.plant_part || ''}"`,
      `"${r.preparation_method || ''}"`,
      `"${r.compound_name || ''}"`,
      `"${r.pharmacological_activity || ''}"`,
      `"${r.document_title || ''}"`,
      `"${r.document_doi || ''}"`,
      `"${(r.supporting_excerpt || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EthnoKG_Evidence_Claims_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const slideVariants: Variants = {
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

  const reducedMotionSlideVariants: Variants = {
    enter: { opacity: 0 },
    center: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } }
  };

  const currentRel = filteredRelationships[safeSlideIndex];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" aria-hidden="true" />
              <span>Evidence Explorer & Provenance Inspector</span>
            </h1>
            <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
              6-Tier Taxonomy
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Inspect source-backed claims with side-by-side verbatim text excerpts. Strict demarcation
            between traditional lore and experimental bioassays.
          </p>
        </div>

        {/* View Switcher Pill & Count */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            role="radiogroup"
            aria-label="Evidence display layout mode"
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
              aria-label="Card list layout"
              onClick={() => handleViewModeChange('list')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 min-h-[30px] rounded-lg text-xs font-medium transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                viewMode === 'list' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {viewMode === 'list' && (
                <motion.div
                  layoutId={shouldReduceMotion ? undefined : 'evidenceViewPill'}
                  className="absolute inset-0 bg-gradient-to-b from-zinc-700/80 via-zinc-800/95 to-zinc-900 rounded-lg border border-zinc-600/70 shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 500, damping: 35 }
                  }
                >
                  <div className="absolute top-0 inset-x-2 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                </motion.div>
              )}
              <LayoutGrid
                className={`relative z-10 w-3.5 h-3.5 ${
                  viewMode === 'list' ? 'text-cyan-400' : 'text-zinc-400'
                }`}
                aria-hidden="true"
              />
              <span className="relative z-10">List</span>
            </motion.button>

            {/* Slide Deck Option */}
            <motion.button
              ref={slideRadioRef}
              type="button"
              role="radio"
              aria-checked={viewMode === 'slide'}
              tabIndex={viewMode === 'slide' ? 0 : -1}
              aria-label="Interactive claim slide deck layout"
              onClick={() => handleViewModeChange('slide')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 min-h-[30px] rounded-lg text-xs font-medium transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                viewMode === 'slide' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {viewMode === 'slide' && (
                <motion.div
                  layoutId={shouldReduceMotion ? undefined : 'evidenceViewPill'}
                  className="absolute inset-0 bg-gradient-to-b from-zinc-700/80 via-zinc-800/95 to-zinc-900 rounded-lg border border-zinc-600/70 shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 500, damping: 35 }
                  }
                >
                  <div className="absolute top-0 inset-x-2 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                </motion.div>
              )}
              <ChevronsLeftRight
                className={`relative z-10 w-3.5 h-3.5 ${
                  viewMode === 'slide' ? 'text-cyan-400' : 'text-zinc-400'
                }`}
                aria-hidden="true"
              />
              <span className="relative z-10">Slide</span>
            </motion.button>

            {/* Table Option */}
            <motion.button
              ref={tableRadioRef}
              type="button"
              role="radio"
              aria-checked={viewMode === 'table'}
              tabIndex={viewMode === 'table' ? 0 : -1}
              aria-label="Research data table layout"
              onClick={() => handleViewModeChange('table')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 min-h-[30px] rounded-lg text-xs font-medium transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                viewMode === 'table' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {viewMode === 'table' && (
                <motion.div
                  layoutId={shouldReduceMotion ? undefined : 'evidenceViewPill'}
                  className="absolute inset-0 bg-gradient-to-b from-zinc-700/80 via-zinc-800/95 to-zinc-900 rounded-lg border border-zinc-600/70 shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 500, damping: 35 }
                  }
                >
                  <div className="absolute top-0 inset-x-2 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                </motion.div>
              )}
              <Table
                className={`relative z-10 w-3.5 h-3.5 ${
                  viewMode === 'table' ? 'text-cyan-400' : 'text-zinc-400'
                }`}
                aria-hidden="true"
              />
              <span className="relative z-10">Table</span>
            </motion.button>
          </div>

          <div className="flex items-center gap-1.5 bg-[#151722] border border-zinc-700/90 px-3 py-1.5 rounded-xl text-xs font-mono">
            <span className="text-zinc-400">Claims:</span>
            <span className="text-cyan-400 font-bold">{filteredRelationships.length} Records</span>
          </div>

          <button
            type="button"
            onClick={exportEvidenceCSV}
            title="Download evidence claims as CSV"
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium bg-[#151722] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#101218]/90 border border-zinc-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl backdrop-blur-xl">
        {/* Tier Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {TIERS.map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedTier === tier
                  ? 'bg-zinc-200 text-zinc-950 shadow-md font-bold'
                  : 'bg-[#151722] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        {/* Confidence slider and Search Input */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Search */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search plant, disease, compound..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-[#151722] border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/80"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Slider */}
          <div className="flex items-center gap-2.5 text-xs text-zinc-300 bg-[#151722] px-3 py-1.5 rounded-xl border border-zinc-800 font-mono">
            <span>Min Confidence:</span>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-20 accent-cyan-400 cursor-pointer"
            />
            <span className="text-white font-bold">{Math.round(minConfidence * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Scientific Principle Notice Banner */}
      <div className="bg-zinc-900/90 border border-zinc-700/80 p-3.5 rounded-xl text-xs text-zinc-300 flex items-center gap-2 shadow-sm">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
        <span>
          <strong className="text-white">Scientific Principle:</strong> A reported traditional use does not
          automatically demonstrate clinical effectiveness. Each evidence category maintains its distinct evidential weight.
        </span>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-zinc-400 text-xs font-mono">Querying evidence database...</p>
        </div>
      ) : filteredRelationships.length === 0 ? (
        <div className="bg-[#101218] border border-zinc-800 rounded-2xl p-12 text-center text-zinc-400 font-mono">
          <Database className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
          <p className="text-sm text-zinc-300">No evidence records match the selected tier, search query, or confidence threshold.</p>
        </div>
      ) : (
        <>
          {/* ========================================================
              VIEW MODE: SLIDE DECK
             ======================================================== */}
          {viewMode === 'slide' && currentRel && (
            <div
              ref={slideContainerRef}
              role="region"
              aria-roledescription="carousel"
              aria-label="Evidence Claim Interactive Slide Deck"
              tabIndex={0}
              className="space-y-4 focus:outline-none"
            >
              {/* Carousel Top Navigation Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#101218]/80 border border-zinc-800 px-4 py-3 rounded-2xl backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-zinc-400">Current Claim:</span>
                  <span className="text-white font-bold bg-[#151722] border border-zinc-700/80 px-2.5 py-0.5 rounded-lg">
                    {safeSlideIndex + 1} of {filteredRelationships.length}
                  </span>
                  <span className="text-zinc-500 hidden md:inline">
                    (Use Left / Right arrow keys to navigate claims)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full sm:w-48 h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-300 rounded-full"
                    style={{ width: `${((safeSlideIndex + 1) / filteredRelationships.length) * 100}%` }}
                  />
                </div>

                {/* Prev / Next Buttons */}
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={handlePrevSlide}
                    disabled={safeSlideIndex === 0}
                    whileHover={safeSlideIndex > 0 ? { scale: 1.05 } : undefined}
                    whileTap={safeSlideIndex > 0 ? { scale: 0.95 } : undefined}
                    aria-label="Previous evidence claim"
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                      safeSlideIndex === 0
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
                        : 'bg-[#151722] border-zinc-700 text-zinc-200 hover:text-white hover:border-zinc-500 hover:bg-zinc-800'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={handleNextSlide}
                    disabled={safeSlideIndex === filteredRelationships.length - 1}
                    whileHover={safeSlideIndex < filteredRelationships.length - 1 ? { scale: 1.05 } : undefined}
                    whileTap={safeSlideIndex < filteredRelationships.length - 1 ? { scale: 0.95 } : undefined}
                    aria-label="Next evidence claim"
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                      safeSlideIndex === filteredRelationships.length - 1
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
                        : 'bg-[#151722] border-zinc-700 text-zinc-200 hover:text-white hover:border-zinc-500 hover:bg-zinc-800'
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Main Slide Card */}
              <div className="relative min-h-[380px] overflow-hidden" aria-live="polite">
                <AnimatePresence mode="wait" custom={slideDirection}>
                  <motion.div
                    key={currentRel.id}
                    custom={slideDirection}
                    variants={shouldReduceMotion ? reducedMotionSlideVariants : slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full"
                  >
                    <GlowCard
                      glowColor="silver"
                      className="p-6 sm:p-8 bg-gradient-to-b from-[#12151e]/95 via-[#10121a]/95 to-[#0e1017]/95 border border-zinc-800/90 rounded-2xl shadow-2xl relative overflow-hidden"
                    >
                      {/* Top Specular Rim */}
                      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

                      {/* Header Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold bg-zinc-800/90 text-zinc-200 border border-zinc-700/80 px-2.5 py-0.5 rounded-full">
                            Claim #{currentRel.id}
                          </span>
                          <span className="text-[11px] font-mono bg-cyan-950/70 text-cyan-300 border border-cyan-800/70 px-2.5 py-0.5 rounded-full">
                            {currentRel.knowledge_tradition}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold font-mono border px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-200 border-zinc-700">
                            {currentRel.evidence_tier}
                          </span>
                          <span className="text-xs font-mono text-cyan-400 font-bold">
                            {Math.round(currentRel.extraction_confidence * 100)}% Confidence
                          </span>
                          <span
                            className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full font-mono ${
                              currentRel.verification_status === 'approved'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            {currentRel.verification_status}
                          </span>
                        </div>
                      </div>

                      {/* Relationship Target Headline */}
                      <div className="mt-6 flex flex-wrap items-baseline gap-3">
                        <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white italic tracking-tight">
                          {currentRel.plant_scientific_name}
                        </h2>
                        <span className="text-xl text-zinc-500 font-mono">→</span>
                        <h3 className="text-2xl sm:text-3xl font-bold font-mono text-cyan-300 tracking-tight">
                          {currentRel.condition_name || 'General Health'}
                        </h3>
                      </div>

                      {/* Verbatim Excerpt */}
                      {currentRel.supporting_excerpt && (
                        <div className="mt-6 p-4 rounded-xl bg-[#151724] border border-cyan-900/40 relative">
                          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase mb-2">
                            <Quote className="w-4 h-4" />
                            <span>Verbatim Scientific Literature Excerpt</span>
                          </div>
                          <p className="text-zinc-200 italic leading-relaxed text-sm">
                            "{currentRel.supporting_excerpt}"
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
                            {currentRel.plant_part || 'Whole plant'} | {currentRel.preparation_method || 'Traditional extraction'}
                          </span>
                        </div>

                        <div className="bg-[#141622]/80 border border-zinc-800 p-3 rounded-xl">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                            Reported Molecule
                          </span>
                          <span className="text-zinc-200 font-mono font-medium">
                            {currentRel.compound_name || 'Phytochemical extract'}
                          </span>
                        </div>

                        <div className="bg-[#141622]/80 border border-zinc-800 p-3 rounded-xl">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                            Pharmacological Activity
                          </span>
                          <span className="text-zinc-200 font-medium">
                            {currentRel.pharmacological_activity || 'Empirical bioactivity'}
                          </span>
                        </div>
                      </div>

                      {/* Source Citation */}
                      <div className="mt-6 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400 font-mono">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-zinc-500 shrink-0" />
                          <span className="truncate max-w-xl">
                            {currentRel.document_title || 'Indexed Ethnopharmacological Document'}
                          </span>
                        </div>

                        {currentRel.document_doi && (
                          <a
                            href={`https://doi.org/${currentRel.document_doi}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-950 text-cyan-300 hover:text-cyan-200 border border-zinc-700 hover:border-cyan-700 text-xs transition-colors shrink-0"
                          >
                            <span>DOI: {currentRel.document_doi}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </GlowCard>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Quick Jump Rail */}
              <div className="pt-2">
                <div className="flex items-center justify-between pb-2 text-xs font-mono text-zinc-400">
                  <span>Claims Navigator ({filteredRelationships.length} items):</span>
                  <span>Click to inspect claim</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700">
                  {filteredRelationships.map((r, idx) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleGoToSlide(idx)}
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                        idx === safeSlideIndex
                          ? 'bg-cyan-950/80 border-cyan-500 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
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
              VIEW MODE: HIGH-DENSITY RESEARCH TABLE
             ======================================================== */}
          {viewMode === 'table' && (
            <div className="bg-[#101218]/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" aria-label="Evidence Claims Data Table">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-[#12151f] text-xs font-mono text-zinc-400 sticky top-0 z-10 select-none">
                      <th className="py-3 px-4 w-12 text-center text-zinc-500">#</th>
                      <th className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (sortBy === 'plant') setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
                            else { setSortBy('plant'); setSortDirection('asc'); }
                          }}
                          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer font-semibold"
                        >
                          <span>Plant</span>
                          {sortBy === 'plant' ? (
                            sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-cyan-400" /> : <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                          ) : <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600" />}
                        </button>
                      </th>
                      <th className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (sortBy === 'condition') setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
                            else { setSortBy('condition'); setSortDirection('asc'); }
                          }}
                          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer font-semibold"
                        >
                          <span>Condition</span>
                          {sortBy === 'condition' ? (
                            sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-cyan-400" /> : <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                          ) : <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600" />}
                        </button>
                      </th>
                      <th className="py-3 px-4 font-semibold">Tradition</th>
                      <th className="py-3 px-4 font-semibold">Reported Compound</th>
                      <th className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (sortBy === 'tier') setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
                            else { setSortBy('tier'); setSortDirection('asc'); }
                          }}
                          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer font-semibold"
                        >
                          <span>Tier</span>
                          {sortBy === 'tier' ? (
                            sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-cyan-400" /> : <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                          ) : <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600" />}
                        </button>
                      </th>
                      <th className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (sortBy === 'confidence') setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
                            else { setSortBy('confidence'); setSortDirection('desc'); }
                          }}
                          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer font-semibold"
                        >
                          <span>Confidence</span>
                          {sortBy === 'confidence' ? (
                            sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-cyan-400" /> : <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                          ) : <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600" />}
                        </button>
                      </th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">DOI Provenance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-xs">
                    {filteredRelationships.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 px-4 text-center font-mono text-zinc-500 text-[11px]">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono italic font-bold text-white block">{r.plant_scientific_name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">Claim #{r.id}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-cyan-300">
                          {r.condition_name || 'General Health'}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-300">
                          {r.knowledge_tradition}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-300">
                          {r.compound_name || <span className="text-zinc-600">—</span>}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-300 text-[11px]">
                          {r.evidence_tier}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                          {Math.round(r.extraction_confidence * 100)}%
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full font-mono ${
                            r.verification_status === 'approved'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}>
                            {r.verification_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {r.document_doi ? (
                            <a
                              href={`https://doi.org/${r.document_doi}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-300 hover:text-cyan-300"
                            >
                              <span>DOI</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-zinc-600 font-mono text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW MODE: CARD LIST (PRESERVED & ENHANCED)
             ======================================================== */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredRelationships.map((rel) => (
                  <GlowCard key={rel.id} glowColor="silver" className="p-5 space-y-3.5">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-mono">
                          {rel.plant_scientific_name}
                        </span>
                        <span className="text-xs text-zinc-500">→</span>
                        <span className="text-sm font-semibold text-zinc-200 font-mono">
                          {rel.condition_name || 'General Health'}
                        </span>
                        <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
                          {rel.knowledge_tradition}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-200 border border-zinc-700 px-2.5 py-0.5 rounded-full font-mono">
                          {rel.evidence_tier}
                        </span>
                        <span className="text-xs font-mono text-cyan-400 font-semibold">
                          Confidence: {Math.round(rel.extraction_confidence * 100)}%
                        </span>
                        <span
                          className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full font-mono ${
                            rel.verification_status === 'approved'
                              ? 'bg-zinc-800 text-zinc-200 border border-zinc-600'
                              : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {rel.verification_status}
                        </span>
                      </div>
                    </div>

                    {/* Context Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-zinc-500 font-semibold block font-mono">
                          Organ & Preparation
                        </span>
                        <span className="text-zinc-300">
                          {rel.plant_part || 'Whole plant'} | {rel.preparation_method || 'Traditional extraction'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-zinc-500 font-semibold block font-mono">
                          Reported Compound
                        </span>
                        <span className="text-zinc-200 font-mono">
                          {rel.compound_name || 'Phytochemical extract'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-zinc-500 font-semibold block font-mono">
                          Pharmacological Activity
                        </span>
                        <span className="text-zinc-300">
                          {rel.pharmacological_activity || 'Empirical bioactivity'}
                        </span>
                      </div>
                    </div>

                    {/* Verbatim Excerpt */}
                    {rel.supporting_excerpt && (
                      <div className="bg-[#151722] p-3.5 rounded-xl border border-zinc-800 text-xs">
                        <div className="flex items-center gap-1.5 text-zinc-300 font-bold uppercase text-[10px] mb-1 font-mono">
                          <Quote className="w-3 h-3 text-zinc-400" />
                          <span>Verbatim Literature Excerpt</span>
                        </div>
                        <p className="text-zinc-300 italic leading-relaxed">
                          "{rel.supporting_excerpt}"
                        </p>
                      </div>
                    )}

                    {/* Source Provenance */}
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-400 pt-1 font-mono">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{rel.document_title || 'Indexed Ethnopharmacological Document'}</span>
                      </div>

                      {rel.document_doi && (
                        <a
                          href={`https://doi.org/${rel.document_doi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-300 hover:text-white flex items-center gap-1 font-mono text-[10px]"
                        >
                          <span>DOI: {rel.document_doi}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </GlowCard>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
};
