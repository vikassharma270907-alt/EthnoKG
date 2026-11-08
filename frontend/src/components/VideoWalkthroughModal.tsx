import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  X, 
  Download, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  FileVideo
} from 'lucide-react';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface ChapterItem {
  id: string;
  title: string;
  subtitle: string;
  duration: number; // in seconds
  audioSrc: string;
  slideImage: string;
  targetTab?: string;
  featureName?: string;
}

const CHAPTERS: ChapterItem[] = [
  {
    id: 'ch01_intro',
    title: '1. Introduction & Scientific Mission',
    subtitle: 'Bottlenecks in ethnopharmacology & the EthnoKG evidence-linked paradigm',
    duration: 94,
    audioSrc: '/walkthrough/ch01_intro.mp3',
    slideImage: '/walkthrough/01_title_card.png',
    targetTab: 'landing',
    featureName: 'Overview & Mission'
  },
  {
    id: 'ch02_architecture',
    title: '2. Full-Stack Architecture & Engineering',
    subtitle: 'Python 3.14, FastAPI, React 19, Cytoscape.js & SQLite FTS5',
    duration: 84,
    audioSrc: '/walkthrough/ch02_architecture.mp3',
    slideImage: '/walkthrough/02_architecture_diagram.png',
    targetTab: 'landing',
    featureName: 'Architecture View'
  },
  {
    id: 'ch03_pipeline',
    title: '3. 12-Stage AI Literature Mining Pipeline',
    subtitle: 'From raw PDFs/text to normalized Subject-Predicate-Object triples',
    duration: 124,
    audioSrc: '/walkthrough/ch03_pipeline.mp3',
    slideImage: '/walkthrough/03_pipeline_diagram.png',
    targetTab: 'extraction',
    featureName: 'Literature Mining Engine'
  },
  {
    id: 'ch04_dashboard',
    title: '4. Live Demonstration: Discovery Dashboard',
    subtitle: 'Real-time metrics, 6-tier evidence breakdown & cultural traditions radar',
    duration: 84,
    audioSrc: '/walkthrough/ch04_dashboard.mp3',
    slideImage: '/walkthrough/02_dashboard_overview.png',
    targetTab: 'dashboard',
    featureName: 'Open Live Dashboard'
  },
  {
    id: 'ch05_mining_demo',
    title: '5. Live Demonstration: 12-Stage Mining in Action',
    subtitle: 'Tu Youyou Nobel paper on Artemisia annua & verbatim excerpt anchor',
    duration: 81,
    audioSrc: '/walkthrough/ch05_mining_demo.mp3',
    slideImage: '/walkthrough/03_mining_results.png',
    targetTab: 'extraction',
    featureName: 'Execute Live Mining'
  },
  {
    id: 'ch06_graph_plants',
    title: '6. Live Demonstration: Knowledge Graph & Plant Dossier',
    subtitle: 'Cytoscape physics network, CoSE layouts & Kew MPNS botanical authority',
    duration: 89,
    audioSrc: '/walkthrough/ch06_graph_plants.mp3',
    slideImage: '/walkthrough/04_graph_network.png',
    targetTab: 'graph',
    featureName: 'Explore Knowledge Graph'
  },
  {
    id: 'ch07_assistant_curator',
    title: '7. Live Demonstration: Evidence, AI Assistant & Curator',
    subtitle: 'Strictly grounded RAG dialogue, non-diagnostic scope & curator ledger',
    duration: 78,
    audioSrc: '/walkthrough/ch07_assistant_curator.mp3',
    slideImage: '/walkthrough/05_grounded_assistant.png',
    targetTab: 'assistant',
    featureName: 'Ask Grounded Assistant'
  },
  {
    id: 'ch08_evaluation',
    title: '8. Quantitative Evaluation Benchmarks',
    subtitle: '96.97% NER F1, 94.1% resolution & 0.00% unsupported hallucination rate',
    duration: 80,
    audioSrc: '/walkthrough/ch08_evaluation.mp3',
    slideImage: '/walkthrough/08_evaluation_card.png',
    targetTab: 'methodology',
    featureName: 'View Scientific Proof'
  },
  {
    id: 'ch09_ethics_conclusion',
    title: '9. Ethics, Nagoya Protocol & Conclusion',
    subtitle: 'Access and benefit-sharing, endangered flora GPS masking & cultural honor',
    duration: 61,
    audioSrc: '/walkthrough/ch09_ethics_conclusion.mp3',
    slideImage: '/walkthrough/09_ethics_card.png',
    targetTab: 'sources',
    featureName: 'Nagoya Ethics Registry'
  }
];

interface VideoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
}

export const VideoWalkthroughModal: React.FC<VideoWalkthroughModalProps> = ({
  isOpen,
  onClose,
  setActiveTab
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const currentChapter = CHAPTERS[currentChapterIndex];

  const isPlayingRef = useRef(isPlaying);
  const playbackSpeedRef = useRef(playbackSpeed);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  const handleModalClose = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    onClose();
  }, [onClose]);

  // Hook for focus trap, escape key dismissal, and return focus
  const modalContainerRef = useFocusTrap<HTMLDivElement>({
    isOpen,
    onClose: handleModalClose,
    initialFocusRef: closeButtonRef
  });

  useEffect(() => {
    const audioEl = audioRef.current;
    return () => {
      if (audioEl) {
        audioEl.pause();
        audioEl.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (audioRef.current) {
      audioRef.current.src = currentChapter.audioSrc;
      audioRef.current.playbackRate = playbackSpeedRef.current;
      audioRef.current.load();
      if (isPlayingRef.current) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentChapterIndex, isOpen, currentChapter.audioSrc]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const nextChapter = () => {
    if (currentChapterIndex < CHAPTERS.length - 1) {
      setCurrentChapterIndex(prev => prev + 1);
      setCurrentTime(0);
    }
  };

  const prevChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(prev => prev - 1);
      setCurrentTime(0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || currentChapter.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const changeSpeed = (spd: number) => {
    setPlaybackSpeed(spd);
    if (audioRef.current) {
      audioRef.current.playbackRate = spd;
    }
  };

  const handleEnded = () => {
    if (currentChapterIndex < CHAPTERS.length - 1) {
      nextChapter();
    } else {
      setIsPlaying(false);
    }
  };

  const handleJumpToFeature = (tab?: string) => {
    if (tab) {
      setActiveTab(tab);
      handleModalClose();
    }
  };

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalPresentationSeconds = CHAPTERS.reduce((acc, c) => acc + c.duration, 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="walkthrough-modal-title"
      aria-describedby="walkthrough-modal-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleModalClose();
        }
      }}
    >
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Screen Reader Live Region for dynamic status updates */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isPlaying 
          ? `Playing Chapter ${currentChapterIndex + 1} of ${CHAPTERS.length}: ${currentChapter.title}. Time: ${formatTime(currentTime)} of ${formatTime(duration || currentChapter.duration)}.` 
          : `Walkthrough paused at Chapter ${currentChapterIndex + 1}: ${currentChapter.title}.`}
      </div>

      <div 
        ref={modalContainerRef}
        className="relative w-full max-w-7xl h-[92vh] flex flex-col bg-[#0e1017] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 focus:outline-none"
        tabIndex={-1}
      >
        {/* Top Modal Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#141620] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-xl bg-gradient-to-tr from-zinc-700 to-zinc-500 text-white shadow-md"
              aria-hidden="true"
            >
              <FileVideo className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="walkthrough-modal-title" className="text-lg font-bold tracking-tight text-white font-mono">
                  Ethno<span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">KG</span> Video Walkthrough & Presentation
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
                  10-Min Deep Dive
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold text-zinc-300 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
                  Voice: WisprFlow / Andrew Neural
                </span>
              </div>
              <p id="walkthrough-modal-desc" className="text-xs text-zinc-300 font-mono mt-0.5">
                Chapter {currentChapterIndex + 1} of {CHAPTERS.length}: {currentChapter.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct MP4 Download Link */}
            <a
              href="/walkthrough/EthnoKG_Complete_Project_Walkthrough.mp4"
              download="EthnoKG_Complete_Project_Walkthrough.mp4"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 min-h-[36px] rounded-lg text-xs font-semibold bg-[#161822] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
              title="Download standalone 1080p MP4 file"
              aria-label="Download full 1080p MP4 walkthrough video file"
            >
              <Download className="w-3.5 h-3.5 text-zinc-300" aria-hidden="true" />
              <span>Download MP4</span>
            </a>

            {/* Close Button with WCAG-compliant Target Size */}
            <button
              ref={closeButtonRef}
              onClick={handleModalClose}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
              title="Close Walkthrough"
              aria-label="Close walkthrough presentation"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Main Workspace (Split View) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left / Center: Cinema Stage */}
          <section 
            className="flex-1 flex flex-col bg-[#090a0f] relative overflow-hidden"
            aria-label="Presentation slide cinema stage"
          >
            {/* Visual Display Screen */}
            <div className="flex-1 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
              <div className="relative w-full h-full max-h-[64vh] aspect-video rounded-xl overflow-hidden border border-zinc-800 shadow-2xl bg-black group">
                <img 
                  src={currentChapter.slideImage} 
                  alt={`Slide visual for Chapter ${currentChapterIndex + 1}: ${currentChapter.title} - ${currentChapter.subtitle}`}
                  className="w-full h-full object-contain transition-all duration-700 select-none"
                />

                {/* Top Corner Chapter Pill */}
                <div 
                  className="absolute top-4 left-4 flex items-center gap-2 bg-black/85 backdrop-blur-md border border-zinc-800 px-3 py-1.5 rounded-xl shadow-lg"
                  aria-hidden="true"
                >
                  <span className="w-2 h-2 rounded-full bg-zinc-200 animate-pulse"></span>
                  <span className="text-xs font-semibold text-zinc-200 font-mono">
                    {currentChapter.id.toUpperCase()} • CHAPTER {currentChapterIndex + 1}/{CHAPTERS.length}
                  </span>
                </div>

                {/* Floating "Jump to Live Feature" action pill */}
                {currentChapter.targetTab && (
                  <button
                    onClick={() => handleJumpToFeature(currentChapter.targetTab)}
                    className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-2 min-h-[36px] rounded-xl text-xs font-semibold bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 backdrop-blur-md shadow-lg transition-all hover:scale-105 cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
                    aria-label={`Explore live feature: ${currentChapter.featureName || 'Explore Live'} (closes modal and navigates to ${currentChapter.targetTab} view)`}
                  >
                    <span>{currentChapter.featureName || 'Explore Live'}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-300" aria-hidden="true" />
                  </button>
                )}

                {/* Animated Waveform Bars (Decorative) */}
                {isPlaying && (
                  <div 
                    className="absolute bottom-4 right-4 flex items-end gap-1 bg-black/80 backdrop-blur-md px-3 py-2 rounded-xl border border-zinc-800"
                    aria-hidden="true"
                  >
                    <span className="text-[10px] font-mono text-zinc-300 mr-1.5 font-bold">Wispr Audio</span>
                    <span className="w-1 bg-zinc-100 rounded-full animate-bounce h-3"></span>
                    <span className="w-1 bg-zinc-300 rounded-full animate-bounce h-5 [animation-delay:0.1s]"></span>
                    <span className="w-1 bg-zinc-400 rounded-full animate-bounce h-4 [animation-delay:0.2s]"></span>
                    <span className="w-1 bg-zinc-200 rounded-full animate-bounce h-6 [animation-delay:0.15s]"></span>
                    <span className="w-1 bg-zinc-500 rounded-full animate-bounce h-2 [animation-delay:0.25s]"></span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Audio Player Bar */}
            <div className="px-6 py-4 bg-[#101218] border-t border-zinc-800 flex flex-col gap-3">
              
              {/* Scrubbing Bar */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-zinc-300 w-12 text-right" aria-hidden="true">
                  {formatTime(currentTime)}
                </span>
                <input 
                  type="range"
                  min="0"
                  max={duration || currentChapter.duration}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  aria-label="Walkthrough audio timeline scrubber"
                  aria-valuemin={0}
                  aria-valuemax={Math.round(duration || currentChapter.duration)}
                  aria-valuenow={Math.round(currentTime)}
                  aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration || currentChapter.duration)}`}
                  className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none transition-all"
                />
                <span className="text-xs font-mono text-zinc-300 w-12" aria-hidden="true">
                  {formatTime(duration || currentChapter.duration)}
                </span>
              </div>

              {/* Transport Controls */}
              <div className="flex items-center justify-between">
                
                {/* Left: Speed & Volume */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute narration" : "Mute narration"}
                    className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-rose-400" aria-hidden="true" />
                    ) : (
                      <Volume2 className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>

                  <div 
                    className="flex items-center gap-1 bg-[#161822] border border-zinc-800 rounded-lg p-0.5 text-xs"
                    role="group"
                    aria-label="Playback speed selection"
                  >
                    {[1.0, 1.25, 1.5].map(spd => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => changeSpeed(spd)}
                        aria-pressed={playbackSpeed === spd}
                        aria-label={`Playback speed ${spd}x`}
                        className={`px-2.5 py-1 min-h-[28px] rounded-md text-[11px] font-mono transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none ${
                          playbackSpeed === spd 
                            ? 'bg-zinc-800 text-white font-bold border border-zinc-600' 
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Center: Play/Pause and Skip buttons */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={prevChapter}
                    disabled={currentChapterIndex === 0}
                    aria-label="Previous chapter"
                    className="p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
                  >
                    <SkipBack className="w-5 h-5" aria-hidden="true" />
                  </button>

                  <button 
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause walkthrough narration" : "Play walkthrough narration"}
                    className="w-12 h-12 rounded-2xl bg-zinc-200 hover:bg-white text-zinc-950 flex items-center justify-center shadow-lg shadow-black/50 hover:scale-105 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-current stroke-[2.5]" aria-hidden="true" />
                    ) : (
                      <Play className="w-6 h-6 fill-current stroke-[2.5] ml-0.5" aria-hidden="true" />
                    )}
                  </button>

                  <button 
                    onClick={nextChapter}
                    disabled={currentChapterIndex === CHAPTERS.length - 1}
                    aria-label="Next chapter"
                    className="p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
                  >
                    <SkipForward className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>

                {/* Right: Quick Action */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleJumpToFeature(currentChapter.targetTab)}
                    className="px-3 py-2 min-h-[36px] rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
                    aria-label={`Explore live feature: ${currentChapter.featureName || 'Explore Live'}`}
                  >
                    <span>{currentChapter.featureName || 'Explore Live'}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-300" aria-hidden="true" />
                  </button>
                </div>

              </div>

            </div>

          </section>

          {/* Right Sidebar: Chapter Playlist */}
          <aside 
            className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-zinc-800 bg-[#111319] flex flex-col"
            aria-label="Walkthrough Chapters Playlist"
          >
            <div className="p-4 border-b border-zinc-800 bg-[#141620] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                  Chapter Directory
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono">
                  9 Chapters • ~{Math.round(totalPresentationSeconds / 60)} Minutes Total
                </p>
              </div>
              <span className="text-[10px] font-mono text-zinc-300 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-md">
                30 FPS • 1080p
              </span>
            </div>

            <div 
              role="listbox"
              aria-label="Selectable chapter playlist"
              className="flex-1 overflow-y-auto p-3 space-y-2"
            >
              {CHAPTERS.map((ch, idx) => {
                const isSelected = idx === currentChapterIndex;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => setCurrentChapterIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none ${
                      isSelected 
                        ? 'bg-zinc-800 text-white border-zinc-600 shadow-md ring-1 ring-zinc-500' 
                        : 'bg-[#161822] border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-mono font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                            {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                          </span>
                          <h4 className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                            {ch.title.replace(/^CHAPTER \d+ \/ \d+ • /, '')}
                          </h4>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                          {ch.subtitle}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-mono text-zinc-400">
                          {formatTime(ch.duration)}
                        </span>
                        {isSelected && isPlaying && (
                          <span className="flex h-2 w-2 relative" aria-label="Currently playing">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-300"></span>
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sidebar Bottom Card */}
            <div className="p-4 border-t border-zinc-800 bg-[#0e1017]">
              <div className="p-3 rounded-xl bg-[#161822] border border-zinc-800 text-xs flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px] font-mono">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>EthnoHack 2026 Judge Guarantee</span>
                </div>
                <p className="text-[11px] text-zinc-300">
                  Every claim is backed by 100% verbatim literature citations with 0.00% unsupported statements.
                </p>
              </div>
            </div>

          </aside>

        </div>

      </div>

    </div>
  );
};
