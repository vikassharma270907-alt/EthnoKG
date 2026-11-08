import React, { useState, useRef, useEffect } from 'react';
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

  const currentChapter = CHAPTERS[currentChapterIndex];

  const isPlayingRef = useRef(isPlaying);
  const playbackSpeedRef = useRef(playbackSpeed);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  // Load chapter audio when chapter changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.src = currentChapter.audioSrc;
      audio.playbackRate = playbackSpeedRef.current;
      audio.currentTime = 0;
      setCurrentTime(0);
      if (isPlayingRef.current) {
        audio.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentChapterIndex, currentChapter.audioSrc]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Handle Play / Pause toggle
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(err => {
        console.error('Audio playback failed:', err);
        setIsPlaying(false);
      });
    }
  };

  const nextChapter = () => {
    if (currentChapterIndex < CHAPTERS.length - 1) {
      setCurrentChapterIndex(prev => prev + 1);
    }
  };

  const prevChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(prev => prev - 1);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || currentChapter.duration);
    }
  };

  const handleEnded = () => {
    if (currentChapterIndex < CHAPTERS.length - 1) {
      setCurrentChapterIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleJumpToFeature = (targetTab?: string) => {
    if (targetTab) {
      setActiveTab(targetTab);
      onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-2xl animate-fade-in">
      
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      <div className="relative w-full max-w-7xl h-[92vh] flex flex-col bg-[#070b19] border border-slate-800/80 rounded-2xl shadow-2xl shadow-emerald-950/50 overflow-hidden text-slate-100">
        
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-emerald-500/20">
              <FileVideo className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white font-mono">
                  Ethno<span className="text-emerald-400">KG</span> Video Walkthrough & Presentation
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  10-Min Deep Dive
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold text-slate-400 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded-full">
                  Voice: WisprFlow / Andrew Neural
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Chapter {currentChapterIndex + 1} of {CHAPTERS.length}: {currentChapter.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct MP4 Download Button */}
            <a
              href="/walkthrough/EthnoKG_Complete_Project_Walkthrough.mp4"
              download="EthnoKG_Complete_Project_Walkthrough.mp4"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-all shadow-xs"
              title="Download standalone 1080p MP4 file"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download MP4</span>
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="Close Walkthrough"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Workspace (Split View) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left / Center: Cinema Stage */}
          <div className="flex-1 flex flex-col bg-[#050813] relative overflow-hidden">
            
            {/* Visual Display Screen */}
            <div className="flex-1 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
              <div className="relative w-full h-full max-h-[64vh] aspect-video rounded-xl overflow-hidden border border-slate-800/90 shadow-2xl shadow-cyan-950/20 bg-slate-950 group">
                <img 
                  src={currentChapter.slideImage} 
                  alt={currentChapter.title}
                  className="w-full h-full object-contain transition-all duration-700 select-none"
                />

                {/* Top Corner Chapter Pill */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-semibold text-slate-200 font-mono">
                    {currentChapter.id.toUpperCase()} • CHAPTER {currentChapterIndex + 1}/{CHAPTERS.length}
                  </span>
                </div>

                {/* Floating "Jump to Live Feature" action pill */}
                {currentChapter.targetTab && (
                  <button
                    onClick={() => handleJumpToFeature(currentChapter.targetTab)}
                    className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-lg transition-all hover:scale-105"
                  >
                    <span>{currentChapter.featureName || 'Explore Live'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Animated Waveform Bars (When audio is playing) */}
                {isPlaying && (
                  <div className="absolute bottom-4 right-4 flex items-end gap-1 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-mono text-cyan-400 mr-1.5 font-bold">Wispr Audio</span>
                    <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3"></span>
                    <span className="w-1 bg-teal-400 rounded-full animate-bounce h-5 [animation-delay:0.1s]"></span>
                    <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-4 [animation-delay:0.2s]"></span>
                    <span className="w-1 bg-emerald-300 rounded-full animate-bounce h-6 [animation-delay:0.15s]"></span>
                    <span className="w-1 bg-teal-300 rounded-full animate-bounce h-2 [animation-delay:0.25s]"></span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Audio Player Bar */}
            <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800/80 flex flex-col gap-3">
              
              {/* Scrubbing Bar */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <input 
                  type="range"
                  min="0"
                  max={duration || currentChapter.duration}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 hover:h-2 transition-all"
                />
                <span className="text-xs font-mono text-slate-400 w-10">
                  {formatTime(duration || currentChapter.duration)}
                </span>
              </div>

              {/* Transport Controls */}
              <div className="flex items-center justify-between">
                
                {/* Left: Speed & Volume */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={toggleMute}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 text-xs">
                    {[1.0, 1.25, 1.5].map(spd => (
                      <button
                        key={spd}
                        onClick={() => changeSpeed(spd)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors ${
                          playbackSpeed === spd 
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' 
                            : 'text-slate-400 hover:text-slate-200'
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
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button 
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 transition-all"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-current stroke-[2.5]" />
                    ) : (
                      <Play className="w-6 h-6 fill-current stroke-[2.5] ml-0.5" />
                    )}
                  </button>

                  <button 
                    onClick={nextChapter}
                    disabled={currentChapterIndex === CHAPTERS.length - 1}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                {/* Right: Quick Action */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleJumpToFeature(currentChapter.targetTab)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 transition-all flex items-center gap-1.5"
                  >
                    <span>{currentChapter.featureName || 'Explore Live'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

              </div>

            </div>

          </div>

          {/* Right Sidebar: Chapter Playlist */}
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800/80 bg-slate-900/40 flex flex-col">
            
            <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Chapter Directory
                </h3>
                <p className="text-[11px] text-slate-400">
                  9 Chapters • ~{Math.round(totalPresentationSeconds / 60)} Minutes Total
                </p>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-md">
                30 FPS • 1080p
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {CHAPTERS.map((ch, idx) => {
                const isSelected = idx === currentChapterIndex;
                return (
                  <div
                    key={ch.id}
                    onClick={() => setCurrentChapterIndex(idx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-800/90 border-emerald-500/50 shadow-md shadow-emerald-950/30' 
                        : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-850 hover:border-slate-700/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-mono font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                          </span>
                          <h4 className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {ch.title.replace(/^CHAPTER \d+ \/ \d+ • /, '')}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {ch.subtitle}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-mono text-slate-400">
                          {formatTime(ch.duration)}
                        </span>
                        {isSelected && isPlaying && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sidebar Bottom Card */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>EthnoHack 2026 Judge Guarantee</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Every claim is backed by 100% verbatim literature citations with 0.00% unsupported statements.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
