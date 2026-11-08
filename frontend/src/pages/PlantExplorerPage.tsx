import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Leaf,
  Search,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  ChevronsLeftRight,
  Table,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  BookOpen,
  Network,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { fetchPlants, fetchPlantDetail } from '../api/client';
import type { PlantBrief, PlantDetail } from '../types';
import { PlantModal } from '../components/PlantModal';
import { GlowCard } from '../components/GlowCard';
import { BotanicalTaxonResolver } from '../components/BotanicalTaxonResolver';

export type ViewMode = 'grid' | 'slide' | 'table';
export type SortOption = 'relations' | 'name' | 'family';
export type SortDirection = 'asc' | 'desc';

export const PlantExplorerPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  // Primary data state
  const [plants, setPlants] = useState<PlantBrief[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('');
  const [selectedTradition, setSelectedTradition] = useState('');

  // View mode state with local storage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ethnokg_plant_view_mode');
        if (saved === 'grid' || saved === 'slide' || saved === 'table') {
          return saved;
        }
      } catch {
        // Ignore storage exceptions
      }
    }
    return 'grid';
  });

  // Sort state
  const [sortBy, setSortBy] = useState<SortOption>('relations');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Slide mode carousel state
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<-1 | 1>(1);
  const slideContainerRef = useRef<HTMLDivElement | null>(null);

  // References for view toggle radio buttons (WAI-ARIA compliance)
  const gridRadioRef = useRef<HTMLButtonElement | null>(null);
  const slideRadioRef = useRef<HTMLButtonElement | null>(null);
  const tableRadioRef = useRef<HTMLButtonElement | null>(null);

  // Modal state
  const [activePlantDetail, setActivePlantDetail] = useState<PlantDetail | null>(null);
  const [loadingPlantId, setLoadingPlantId] = useState<number | null>(null);

  // Fetch plants when query/family/tradition changes
  useEffect(() => {
    let isSubscribed = true;

    fetchPlants({
      query: searchQuery || undefined,
      family: selectedFamily || undefined,
      tradition: selectedTradition || undefined,
      limit: 100
    })
      .then((data) => {
        if (isSubscribed) {
          setPlants(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isSubscribed) {
          console.error('Failed to fetch botanical species:', err);
          setIsLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [searchQuery, selectedFamily, selectedTradition]);

  // Update view mode and persist
  const handleViewModeChange = (newMode: ViewMode) => {
    setViewMode(newMode);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ethnokg_plant_view_mode', newMode);
      } catch {
        // Ignore storage exceptions
      }
    }
  };

  // Keyboard navigation for view mode toggle
  const handleViewToggleKeyDown = (e: React.KeyboardEvent) => {
    const modes: ViewMode[] = ['grid', 'slide', 'table'];
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
      if (nextMode === 'grid') gridRadioRef.current?.focus();
      else if (nextMode === 'slide') slideRadioRef.current?.focus();
      else if (nextMode === 'table') tableRadioRef.current?.focus();
    }
  };

  // Sort change handler
  const handleSortChange = (newSort: SortOption) => {
    if (newSort === sortBy) {
      // Toggle direction if same sort clicked
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(newSort);
      // Sensible defaults: relations is high-to-low; name and family are A-Z
      setSortDirection(newSort === 'relations' ? 'desc' : 'asc');
    }
  };

  // Memoized sorted plants
  const sortedPlants = useMemo(() => {
    const list = [...plants];
    return list.sort((a, b) => {
      if (sortBy === 'relations') {
        const countA = a.relationships_count ?? 0;
        const countB = b.relationships_count ?? 0;
        return sortDirection === 'desc' ? countB - countA : countA - countB;
      }
      if (sortBy === 'name') {
        const res = a.scientific_name.localeCompare(b.scientific_name);
        return sortDirection === 'asc' ? res : -res;
      }
      if (sortBy === 'family') {
        const famA = a.family || '';
        const famB = b.family || '';
        const res = famA.localeCompare(famB);
        return sortDirection === 'asc' ? res : -res;
      }
      return 0;
    });
  }, [plants, sortBy, sortDirection]);

  // Derived safe slide index within bounds (avoids cascading render effect)
  const safeSlideIndex = sortedPlants.length === 0 ? 0 : Math.min(slideIndex, sortedPlants.length - 1);

  // Carousel controls
  const handlePrevSlide = useCallback(() => {
    if (slideIndex > 0) {
      setSlideDirection(-1);
      setSlideIndex((prev) => prev - 1);
    }
  }, [slideIndex]);

  const handleNextSlide = useCallback(() => {
    if (slideIndex < sortedPlants.length - 1) {
      setSlideDirection(1);
      setSlideIndex((prev) => prev + 1);
    }
  }, [slideIndex, sortedPlants.length]);

  const handleGoToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < sortedPlants.length && index !== slideIndex) {
        setSlideDirection(index > slideIndex ? 1 : -1);
        setSlideIndex(index);
      }
    },
    [slideIndex, sortedPlants.length]
  );

  // Global arrow navigation in slide mode when not typing in inputs
  useEffect(() => {
    if (viewMode !== 'slide') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (isInput) return;

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
        handleGoToSlide(sortedPlants.length - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, handlePrevSlide, handleNextSlide, handleGoToSlide, sortedPlants.length]);

  // Open modal detail handler
  const handleOpenDetail = async (id: number) => {
    setLoadingPlantId(id);
    try {
      const detail = await fetchPlantDetail(id);
      setActivePlantDetail(detail);
    } catch (err) {
      console.error('Failed to load plant detail:', err);
    } finally {
      setLoadingPlantId(null);
    }
  };

  // Taxonomic status badge color helper
  const getStatusBadgeStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('accepted')) {
      return 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60';
    }
    if (s.includes('synonym')) {
      return 'bg-amber-950/70 text-amber-300 border-amber-700/60';
    }
    return 'bg-zinc-800 text-zinc-300 border-zinc-700';
  };

  // Animation variants for slide mode transitions
  const slideVariants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 140 : -140,
      opacity: 0,
      scale: 0.97
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 350, damping: 32 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 }
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 140 : -140,
      opacity: 0,
      scale: 0.97,
      transition: {
        x: { type: 'spring', stiffness: 350, damping: 32 },
        opacity: { duration: 0.2 }
      }
    })
  };

  const reducedMotionSlideVariants: Variants = {
    enter: { opacity: 0 },
    center: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } }
  };

  const currentPlant = sortedPlants[safeSlideIndex];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="pb-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-400" aria-hidden="true" />
              <span>Plant Intelligence Explorer</span>
            </h1>
            <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
              Kew MPNS / WFO
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Standardized botanical catalog cross-referenced against Kew MPNS and World Flora Online.
            Reconciles historical synonyms without false species merging.
          </p>
        </div>

        {/* View Switcher Pill & Total Species Counter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented View Mode Toggle */}
          <div
            role="radiogroup"
            aria-label="Plant catalog display mode"
            onKeyDown={handleViewToggleKeyDown}
            className="inline-flex items-center p-0.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 shadow-inner backdrop-blur-md"
          >
            {/* Grid Option */}
            <motion.button
              ref={gridRadioRef}
              type="button"
              role="radio"
              aria-checked={viewMode === 'grid'}
              tabIndex={viewMode === 'grid' ? 0 : -1}
              aria-label="Grid card layout"
              onClick={() => handleViewModeChange('grid')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 min-h-[30px] rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                viewMode === 'grid' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {viewMode === 'grid' && (
                <motion.div
                  layoutId={shouldReduceMotion ? undefined : 'plantExplorerViewPill'}
                  className="absolute inset-0 bg-gradient-to-b from-zinc-700/80 via-zinc-800/95 to-zinc-900 rounded-lg border border-zinc-600/70 shadow-[0_2px_8px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)]"
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
                className={`relative z-10 w-3.5 h-3.5 transition-colors ${
                  viewMode === 'grid'
                    ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]'
                    : 'text-zinc-400'
                }`}
                aria-hidden="true"
              />
              <span className="relative z-10">Grid</span>
            </motion.button>

            {/* Slide Option */}
            <motion.button
              ref={slideRadioRef}
              type="button"
              role="radio"
              aria-checked={viewMode === 'slide'}
              tabIndex={viewMode === 'slide' ? 0 : -1}
              aria-label="Interactive slide carousel layout"
              onClick={() => handleViewModeChange('slide')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 min-h-[30px] rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                viewMode === 'slide' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {viewMode === 'slide' && (
                <motion.div
                  layoutId={shouldReduceMotion ? undefined : 'plantExplorerViewPill'}
                  className="absolute inset-0 bg-gradient-to-b from-zinc-700/80 via-zinc-800/95 to-zinc-900 rounded-lg border border-zinc-600/70 shadow-[0_2px_8px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)]"
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
                className={`relative z-10 w-3.5 h-3.5 transition-colors ${
                  viewMode === 'slide'
                    ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]'
                    : 'text-zinc-400'
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
              aria-label="High-density research table layout"
              onClick={() => handleViewModeChange('table')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 min-h-[30px] rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                viewMode === 'table' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {viewMode === 'table' && (
                <motion.div
                  layoutId={shouldReduceMotion ? undefined : 'plantExplorerViewPill'}
                  className="absolute inset-0 bg-gradient-to-b from-zinc-700/80 via-zinc-800/95 to-zinc-900 rounded-lg border border-zinc-600/70 shadow-[0_2px_8px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)]"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 500, damping: 35 }
                  }
                >
                  <div className="absolute top-0 inset-x-2 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
                </motion.div>
              )}
              <Table
                className={`relative z-10 w-3.5 h-3.5 transition-colors ${
                  viewMode === 'table'
                    ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]'
                    : 'text-zinc-400'
                }`}
                aria-hidden="true"
              />
              <span className="relative z-10">Table</span>
            </motion.button>
          </div>

          {/* Taxa Count Badge */}
          <div className="flex items-center gap-1.5 bg-[#151722] border border-zinc-700/90 px-3 py-1.5 rounded-xl text-xs font-mono">
            <span className="text-zinc-400">Total Taxa:</span>
            <span className="text-emerald-400 font-bold">{sortedPlants.length} Species</span>
          </div>
        </div>
      </div>

      {/* Kew MPNS Botanical Taxon Resolver */}
      <BotanicalTaxonResolver onSelectPlant={handleOpenDetail} />

      {/* Filter and Search Bar with Sort Controls */}
      <div className="bg-[#101218]/90 border border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-xl">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search binomial, vernacular name (e.g. Ashwagandha, Neem, Qinghao)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search plant species"
            className="w-full pl-10 pr-9 py-2 bg-[#151722] border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/80 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns & Sort Option */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Family Filter */}
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            aria-label="Filter by botanical family"
            className="bg-[#151722] border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/80 cursor-pointer font-mono"
          >
            <option value="">All Families</option>
            <option value="Asteraceae">Asteraceae (Daisy/Wormwood)</option>
            <option value="Solanaceae">Solanaceae (Nightshade)</option>
            <option value="Zingiberaceae">Zingiberaceae (Ginger/Turmeric)</option>
            <option value="Apocynaceae">Apocynaceae (Dogbane)</option>
            <option value="Meliaceae">Meliaceae (Mahogany/Neem)</option>
            <option value="Ginkgoaceae">Ginkgoaceae</option>
            <option value="Araliaceae">Araliaceae (Ginseng)</option>
            <option value="Rubiaceae">Rubiaceae (Coffee/Cinchona)</option>
            <option value="Plantaginaceae">Plantaginaceae (Plantain/Foxglove)</option>
            <option value="Salicaceae">Salicaceae (Willow)</option>
            <option value="Papaveraceae">Papaveraceae (Poppy)</option>
          </select>

          {/* Tradition Filter */}
          <select
            value={selectedTradition}
            onChange={(e) => setSelectedTradition(e.target.value)}
            aria-label="Filter by knowledge tradition"
            className="bg-[#151722] border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/80 cursor-pointer font-mono"
          >
            <option value="">All Traditions</option>
            <option value="Ayurveda">Ayurveda</option>
            <option value="Traditional Chinese Medicine">Traditional Chinese Medicine</option>
            <option value="African Traditional Medicine">African Traditional Medicine</option>
            <option value="Amazonian Ethnobotany">Amazonian Ethnobotany</option>
            <option value="European Folk Medicine">European Folk Medicine</option>
            <option value="Greco-Roman & Unani">Greco-Roman & Unani</option>
          </select>

          {/* Sort By Selector */}
          <div className="flex items-center bg-[#151722] border border-zinc-700/80 rounded-xl overflow-hidden">
            <label htmlFor="sort-by-select" className="sr-only">
              Sort plant species
            </label>
            <div className="flex items-center pl-2.5 pr-1 text-zinc-400">
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="bg-transparent py-2 pl-1 pr-3 text-xs text-zinc-200 focus:outline-none cursor-pointer font-mono"
            >
              <option value="relations" className="bg-[#151722] text-zinc-200">
                Most Documented
              </option>
              <option value="name" className="bg-[#151722] text-zinc-200">
                Scientific Name (A-Z)
              </option>
              <option value="family" className="bg-[#151722] text-zinc-200">
                Taxonomic Family
              </option>
            </select>

            {/* Sort Direction Toggle Button */}
            <button
              type="button"
              onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              title={`Sorting ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}. Click to reverse.`}
              aria-label={`Reverse sort direction, currently ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
              className="px-2.5 py-2 border-l border-zinc-700/80 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              {sortDirection === 'asc' ? (
                <ArrowUp className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Loading / Empty / Mode Views */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-9 h-9 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-zinc-400 text-xs font-mono">Querying botanical knowledge graph...</p>
        </div>
      ) : sortedPlants.length === 0 ? (
        <div className="bg-[#101218] border border-zinc-800 rounded-2xl p-12 text-center text-zinc-400 font-mono">
          <Leaf className="w-8 h-8 mx-auto mb-2 text-zinc-600" aria-hidden="true" />
          <p className="text-sm text-zinc-300 font-semibold">No plant species matching your query.</p>
          <p className="text-xs text-zinc-500 mt-1">
            Try adjusting your search terms, botanical family filter, or knowledge tradition.
          </p>
        </div>
      ) : (
        <>
          {/* ========================================================
              VIEW MODE: SLIDE CAROUSEL
             ======================================================== */}
          {viewMode === 'slide' && currentPlant && (
            <div
              ref={slideContainerRef}
              role="region"
              aria-roledescription="carousel"
              aria-label="Plant Species Interactive Slide Carousel"
              tabIndex={0}
              className="space-y-4 focus:outline-none"
            >
              {/* Carousel Top Navigation Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#101218]/80 border border-zinc-800 px-4 py-3 rounded-2xl backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-zinc-400">Current Species:</span>
                  <span className="text-white font-bold bg-[#151722] border border-zinc-700/80 px-2.5 py-0.5 rounded-lg">
                    {slideIndex + 1} of {sortedPlants.length}
                  </span>
                  <span className="text-zinc-500 hidden md:inline">
                    (Use Left / Right arrow keys to navigate)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full sm:w-48 h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                    style={{ width: `${((slideIndex + 1) / sortedPlants.length) * 100}%` }}
                  />
                </div>

                {/* Prev / Next Buttons */}
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={handlePrevSlide}
                    disabled={slideIndex === 0}
                    whileHover={slideIndex > 0 ? { scale: 1.05 } : undefined}
                    whileTap={slideIndex > 0 ? { scale: 0.95 } : undefined}
                    aria-label="Previous plant species slide"
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                      slideIndex === 0
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
                        : 'bg-[#151722] border-zinc-700 text-zinc-200 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 shadow-sm'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    <span>Prev</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={handleNextSlide}
                    disabled={slideIndex === sortedPlants.length - 1}
                    whileHover={slideIndex < sortedPlants.length - 1 ? { scale: 1.05 } : undefined}
                    whileTap={slideIndex < sortedPlants.length - 1 ? { scale: 0.95 } : undefined}
                    aria-label="Next plant species slide"
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                      slideIndex === sortedPlants.length - 1
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
                        : 'bg-[#151722] border-zinc-700 text-zinc-200 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 shadow-sm'
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </motion.button>
                </div>
              </div>

              {/* Main Slide Card with Smooth Transitions */}
              <div className="relative min-h-[360px] overflow-hidden" aria-live="polite">
                <AnimatePresence mode="wait" custom={slideDirection}>
                  <motion.div
                    key={currentPlant.id}
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
                      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent pointer-events-none" />

                      {/* Header Row: Classification & Status Tags */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold bg-zinc-800/90 text-zinc-200 border border-zinc-700/80 px-2.5 py-0.5 rounded-full">
                            Taxon #{(slideIndex + 1).toString().padStart(3, '0')}
                          </span>
                          <span className="text-[11px] font-mono bg-[#151722] text-zinc-300 border border-zinc-700/70 px-2.5 py-0.5 rounded-full">
                            Family: <strong className="text-white">{currentPlant.family || 'Unclassified'}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-semibold font-mono border px-2.5 py-0.5 rounded-full ${getStatusBadgeStyle(
                              currentPlant.taxonomic_status
                            )}`}
                          >
                            {currentPlant.taxonomic_status}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md">
                            Kew Verified
                          </span>
                        </div>
                      </div>

                      {/* Scientific Name Headline */}
                      <div className="mt-6 space-y-2">
                        <div className="flex flex-wrap items-baseline gap-2.5">
                          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono text-white italic tracking-tight">
                            {currentPlant.scientific_name}
                          </h2>
                          {currentPlant.authority && (
                            <span className="text-sm sm:text-base font-mono text-zinc-400 font-normal">
                              {currentPlant.authority}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 font-mono">
                          Binomial nomenclature authenticated via Kew Medicinal Plant Names Services (MPNS).
                        </p>
                      </div>

                      {/* Vernacular Names */}
                      <div className="mt-6 space-y-2">
                        <div className="text-xs font-mono font-semibold text-zinc-300 flex items-center gap-1.5">
                          <Leaf className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                          <span>Vernacular & Historical Folk Names:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(currentPlant.common_names || []).length > 0 ? (
                            (currentPlant.common_names || []).map((cn, i) => (
                              <span
                                key={i}
                                className="text-xs bg-[#161924] border border-zinc-700/80 px-2.5 py-1 rounded-lg text-zinc-200 font-medium"
                              >
                                {cn}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-zinc-500 italic">
                              No recorded vernacular folk synonyms in primary catalog.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 3-Column Dossier Metrics Grid */}
                      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-[#141622]/80 border border-zinc-800/90 p-3.5 rounded-xl">
                          <span className="text-[11px] font-mono text-zinc-400 block mb-1">
                            Knowledge Relations
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-bold font-mono text-emerald-400">
                              {currentPlant.relationships_count ?? 0}
                            </span>
                            <span className="text-xs text-zinc-400">documented links</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 block mt-1">
                            Cross-referenced claims in graph
                          </span>
                        </div>

                        <div className="bg-[#141622]/80 border border-zinc-800/90 p-3.5 rounded-xl">
                          <span className="text-[11px] font-mono text-zinc-400 block mb-1">
                            Taxonomic Resolution
                          </span>
                          <span className="text-sm font-bold font-mono text-white block truncate">
                            {currentPlant.genus || currentPlant.scientific_name.split(' ')[0]}
                          </span>
                          <span className="text-[10px] text-zinc-500 block mt-1">
                            Genus designation verified
                          </span>
                        </div>

                        <div className="bg-[#141622]/80 border border-zinc-800/90 p-3.5 rounded-xl">
                          <span className="text-[11px] font-mono text-zinc-400 block mb-1">
                            Monograph Status
                          </span>
                          <span className="text-sm font-bold font-mono text-zinc-200 block">
                            Full Dossier Ready
                          </span>
                          <span className="text-[10px] text-zinc-500 block mt-1">
                            Includes bioassays & compounds
                          </span>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="mt-8 pt-5 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Graph entity ID #{currentPlant.id}</span>
                        </div>

                        <motion.button
                          type="button"
                          disabled={loadingPlantId === currentPlant.id}
                          onClick={() => handleOpenDetail(currentPlant.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-mono text-xs font-bold shadow-lg shadow-emerald-950/50 cursor-pointer transition-all disabled:opacity-60"
                        >
                          <BookOpen className="w-4 h-4" aria-hidden="true" />
                          <span>
                            {loadingPlantId === currentPlant.id
                              ? 'Loading Dossier...'
                              : 'Explore Full Botanical Dossier'}
                          </span>
                          <ChevronRight className="w-4 h-4" aria-hidden="true" />
                        </motion.button>
                      </div>
                    </GlowCard>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Quick Jump Thumbnail Rail */}
              <div className="pt-2">
                <div className="flex items-center justify-between pb-2 text-xs font-mono text-zinc-400">
                  <span>Catalog Quick Navigator ({sortedPlants.length} species):</span>
                  <span>Click any taxon to inspect</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700">
                  {sortedPlants.map((plant, idx) => (
                    <button
                      key={plant.id}
                      type="button"
                      onClick={() => handleGoToSlide(idx)}
                      aria-label={`Jump to slide ${idx + 1}: ${plant.scientific_name}`}
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                        idx === slideIndex
                          ? 'bg-emerald-950/80 border-emerald-500 text-white font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                          : 'bg-[#12141d] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-zinc-500 mr-1.5">#{idx + 1}</span>
                      <span className="italic">{plant.scientific_name}</span>
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
                <table className="w-full text-left border-collapse" aria-label="Botanical Catalog Data Table">
                  <caption className="sr-only">
                    Standardized botanical catalog taxa with scientific authority, family, vernacular names, and relations count.
                  </caption>
                  <thead>
                    <tr className="border-b border-zinc-800 bg-[#12151f] text-xs font-mono text-zinc-400 sticky top-0 z-10 select-none">
                      <th scope="col" className="py-3 px-4 w-12 text-center text-zinc-500">
                        #
                      </th>

                      {/* Scientific Name (Sortable) */}
                      <th scope="col" className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleSortChange('name')}
                          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-left font-semibold"
                        >
                          <span>Scientific Name</span>
                          {sortBy === 'name' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600" aria-hidden="true" />
                          )}
                        </button>
                      </th>

                      {/* Authority */}
                      <th scope="col" className="py-3 px-4 font-semibold">
                        Authority
                      </th>

                      {/* Family (Sortable) */}
                      <th scope="col" className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleSortChange('family')}
                          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-left font-semibold"
                        >
                          <span>Family</span>
                          {sortBy === 'family' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600" aria-hidden="true" />
                          )}
                        </button>
                      </th>

                      {/* Vernacular Names */}
                      <th scope="col" className="py-3 px-4 font-semibold min-w-[200px]">
                        Vernacular Names
                      </th>

                      {/* Relations Count (Sortable) */}
                      <th scope="col" className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleSortChange('relations')}
                          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-left font-semibold"
                        >
                          <span>Relations</span>
                          {sortBy === 'relations' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600" aria-hidden="true" />
                          )}
                        </button>
                      </th>

                      {/* Taxonomic Status */}
                      <th scope="col" className="py-3 px-4 font-semibold">
                        Taxonomic Status
                      </th>

                      {/* Actions */}
                      <th scope="col" className="py-3 px-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-800/60 text-xs">
                    {sortedPlants.map((plant, index) => (
                      <tr
                        key={plant.id}
                        tabIndex={0}
                        onClick={() => handleOpenDetail(plant.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOpenDetail(plant.id);
                          }
                        }}
                        className="hover:bg-zinc-800/40 focus:bg-zinc-800/50 focus:outline-hidden transition-colors cursor-pointer group"
                      >
                        {/* Index */}
                        <td className="py-3 px-4 text-center font-mono text-zinc-500 text-[11px]">
                          {index + 1}
                        </td>

                        {/* Scientific Name */}
                        <td className="py-3 px-4">
                          <span className="font-mono italic font-bold text-white group-hover:text-emerald-300 transition-colors block">
                            {plant.scientific_name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            ID #{plant.id}
                          </span>
                        </td>

                        {/* Authority */}
                        <td className="py-3 px-4 font-mono text-zinc-400 text-[11px]">
                          {plant.authority || <span className="text-zinc-600">—</span>}
                        </td>

                        {/* Family */}
                        <td className="py-3 px-4 font-mono text-zinc-300">
                          {plant.family || <span className="text-zinc-500 italic">Unclassified</span>}
                        </td>

                        {/* Vernacular Names */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 items-center">
                            {(plant.common_names || []).slice(0, 3).map((cn, i) => (
                              <span
                                key={i}
                                className="text-[11px] bg-[#151722] border border-zinc-700/80 px-2 py-0.5 rounded-md text-zinc-300"
                              >
                                {cn}
                              </span>
                            ))}
                            {(plant.common_names || []).length > 3 && (
                              <span
                                title={(plant.common_names || []).slice(3).join(', ')}
                                className="text-[10px] text-zinc-400 font-mono bg-zinc-800 px-1.5 py-0.5 rounded"
                              >
                                +{(plant.common_names || []).length - 3}
                              </span>
                            )}
                            {(plant.common_names || []).length === 0 && (
                              <span className="text-[11px] text-zinc-600 italic">—</span>
                            )}
                          </div>
                        </td>

                        {/* Relations Count */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 font-mono font-semibold px-2 py-0.5 rounded-md bg-[#141622] border border-zinc-700/80 text-emerald-400">
                            <Network className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                            <span>{plant.relationships_count ?? 0}</span>
                          </span>
                        </td>

                        {/* Taxonomic Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-semibold font-mono border px-2 py-0.5 rounded-full inline-block ${getStatusBadgeStyle(
                              plant.taxonomic_status
                            )}`}
                          >
                            {plant.taxonomic_status}
                          </span>
                        </td>

                        {/* Quick Action */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            disabled={loadingPlantId === plant.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetail(plant.id);
                            }}
                            aria-label={`Open botanical dossier for ${plant.scientific_name}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-emerald-600 text-zinc-200 hover:text-white border border-zinc-700/80 text-[11px] font-mono transition-all cursor-pointer shadow-sm disabled:opacity-50"
                          >
                            <span>{loadingPlantId === plant.id ? 'Loading...' : 'Dossier'}</span>
                            <ExternalLink className="w-3 h-3" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="py-3 px-4 bg-[#0e1017] border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>
                  Displaying {sortedPlants.length} taxonomic records
                </span>
                <span>
                  Sorted by: <strong className="text-zinc-200 capitalize">{sortBy}</strong> ({sortDirection.toUpperCase()})
                </span>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW MODE: GRID (RETAINS BEAUTIFUL GLOWCARD GRID)
             ======================================================== */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {sortedPlants.map((plant) => (
                  <GlowCard
                    key={plant.id}
                    interactive
                    glowColor="silver"
                    onClick={() => handleOpenDetail(plant.id)}
                    className="p-5 flex flex-col justify-between group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-white font-mono group-hover:text-zinc-200 transition-colors">
                            {plant.scientific_name}
                          </h3>
                          <p className="text-xs text-zinc-400 font-medium">
                            Family: {plant.family || 'Unknown'}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full shrink-0 font-mono ${getStatusBadgeStyle(
                            plant.taxonomic_status
                          )}`}
                        >
                          {plant.taxonomic_status}
                        </span>
                      </div>

                      {/* Common names */}
                      <div className="flex flex-wrap gap-1">
                        {(plant.common_names || []).slice(0, 3).map((cn, i) => (
                          <span
                            key={i}
                            className="text-[11px] bg-[#151722] border border-zinc-700/80 px-2 py-0.5 rounded-md text-zinc-300"
                          >
                            {cn}
                          </span>
                        ))}
                        {(plant.common_names || []).length > 3 && (
                          <span className="text-[11px] text-zinc-500 self-center">
                            +{(plant.common_names || []).length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom stats row */}
                    <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-mono text-zinc-300 font-semibold flex items-center gap-1.5">
                        <Network className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                        <span>{plant.relationships_count ?? 0} documented relations</span>
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-zinc-400 group-hover:text-white transition-colors">
                        <span>Open Dossier</span>
                        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </GlowCard>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      <PlantModal
        plant={activePlantDetail}
        onClose={() => setActivePlantDetail(null)}
      />
    </div>
  );
};
