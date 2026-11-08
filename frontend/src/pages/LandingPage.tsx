import React from 'react';
import { 
  Network, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Activity,
  Leaf,
  ArrowRight, 
  Compass,
  FileVideo
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BotanicalConstellation } from '../components/BotanicalConstellation';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';
import { GlowCard } from '../components/GlowCard';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { RadarSonar } from '../components/RadarSonar';

interface LandingPageProps {
  setActiveTab: (tab: string) => void;
  stats?: any;
  onOpenVideoWalkthrough?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  setActiveTab, 
  stats,
  onOpenVideoWalkthrough
}) => {
  return (
    <div className="space-y-24 relative overflow-hidden">
      
      {/* Hero Section with Interactive Constellation */}
      <section className="relative pt-6 pb-16 sm:pt-12 sm:pb-24 text-center">
        {/* Canvas Background */}
        <BotanicalConstellation />

        {/* Ambient Dark Grey & Platinum Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-zinc-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 space-y-7">
          
          {/* Pill Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-zinc-300 text-xs font-semibold tracking-wide shadow-lg shadow-black/60 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
            </span>
            <span className="font-mono">EthnoHack 2026 | Traditional Knowledge Mining & Drug Discovery</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight font-mono leading-[1.12]"
          >
            Turning Traditional Knowledge into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-sky-300 to-teal-300 drop-shadow-[0_0_35px_rgba(255,255,255,0.2)]">
              Traceable Scientific Evidence
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-zinc-400 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed"
          >
            EthnoKG is an AI-powered literature mining and knowledge graph discovery platform.
            We reconcile centuries of traditional medicine reports with modern biomedical pharmacology,
            anchoring every claim to Kew MPNS botanical authorities and verbatim peer-reviewed excerpts.
          </motion.p>

          {/* Call to Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
          >
            {onOpenVideoWalkthrough && (
              <button
                onClick={onOpenVideoWalkthrough}
                className="px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-sky-300 font-semibold text-sm border border-sky-500/40 hover:border-sky-400 transition-all backdrop-blur-md hover:scale-105 flex items-center gap-2 cursor-pointer shadow-xl shadow-sky-950/40"
              >
                <FileVideo className="w-4 h-4 text-sky-400" />
                <span>Watch 10-Min Walkthrough</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('graph')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-zinc-200 via-slate-100 to-zinc-300 hover:from-white hover:to-zinc-200 text-zinc-950 font-bold text-sm transition-all shadow-xl shadow-black/80 hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <Network className="w-4 h-4 stroke-[2.5]" />
              <span>Explore Knowledge Graph</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('extraction')}
              className="px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-white font-semibold text-sm border border-zinc-700/80 hover:border-zinc-500 transition-all backdrop-blur-md hover:scale-105 flex items-center gap-2 cursor-pointer shadow-lg shadow-black/50"
            >
              <Search className="w-4 h-4 text-sky-400 stroke-[2.5]" />
              <span>Mine Literature</span>
            </button>

            <button
              onClick={() => setActiveTab('discovery')}
              className="px-6 py-3.5 rounded-xl bg-[#141722]/90 hover:bg-[#1a1e2c] text-zinc-200 border border-zinc-700/70 hover:border-sky-500/50 font-semibold text-sm transition-all backdrop-blur-md hover:scale-105 flex items-center gap-2 cursor-pointer shadow-lg shadow-black/50"
            >
              <Compass className="w-4 h-4 text-teal-400" />
              <span>Discovery Radar</span>
            </button>
          </motion.div>

          {/* Quick Stats Grid with Rolling Counters */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-4xl mx-auto pt-6"
          >
            <GlowCard glowColor="silver" className="p-4 text-center">
              <span className="text-3xl font-extrabold text-white font-mono block">
                <AnimatedCounter value={stats?.total_plants || 12} />
              </span>
              <span className="text-xs text-zinc-400 block mt-1 font-medium">Kew Harmonized Taxa</span>
            </GlowCard>

            <GlowCard glowColor="mint" className="p-4 text-center">
              <span className="text-3xl font-extrabold text-emerald-400 font-mono block">
                <AnimatedCounter value={stats?.total_relationships || 24} />
              </span>
              <span className="text-xs text-zinc-400 block mt-1 font-medium">Extracted Relations</span>
            </GlowCard>

            <GlowCard glowColor="cyan" className="p-4 text-center">
              <span className="text-3xl font-extrabold text-sky-400 font-mono block">
                <AnimatedCounter value={stats?.total_compounds || 16} />
              </span>
              <span className="text-xs text-zinc-400 block mt-1 font-medium">Bioactive Compounds</span>
            </GlowCard>

            <GlowCard glowColor="purple" className="p-4 text-center">
              <span className="text-3xl font-extrabold text-purple-400 font-mono block">
                <AnimatedCounter value={stats?.indexed_publications || 14} />
              </span>
              <span className="text-xs text-zinc-400 block mt-1 font-medium">Indexed Publications</span>
            </GlowCard>
          </motion.div>

        </div>
      </section>

      {/* Problem & Solution Comparison */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* The Problem */}
          <GlowCard glowColor="silver" className="p-6 sm:p-8 space-y-4">
            <div className="inline-flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              The Core Problem
            </div>
            <h3 className="text-xl font-bold text-white font-mono">Traditional Knowledge is Fragmented & Ambiguous</h3>
            <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-300">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span><strong className="text-zinc-100">Unstructured Literature:</strong> Millions of ethnomedical observations are locked in narrative books, regional surveys, and unindexed PDFs.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span><strong className="text-zinc-100">Taxonomic Confusion:</strong> A single plant species may possess dozens of vernacular and historical synonyms, leading to false data merging.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span><strong className="text-zinc-100">Evidence Conflation:</strong> Folkloric lore, in-vitro test-tube assays, animal models, and clinical trials are frequently mixed without distinction.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span><strong className="text-zinc-100">Lost Provenance:</strong> Claims circulate without traceable citations back to the originating voucher specimen or primary paper.</span>
              </li>
            </ul>
          </GlowCard>

          {/* The Solution */}
          <GlowCard glowColor="cyan" className="p-6 sm:p-8 space-y-4">
            <div className="inline-flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider font-mono">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              The EthnoKG Solution
            </div>
            <h3 className="text-xl font-bold text-white font-mono">Traceable, Grounded Knowledge Graph Pipeline</h3>
            <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span><strong className="text-zinc-100">12-Stage Literature Mining:</strong> Automatic biomedical NER, condition mapping, and relation extraction with strict JSON schemas.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span><strong className="text-zinc-100">Kew MPNS / WFO Resolution:</strong> Binomial standardization preventing false species conflation across traditional systems.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span><strong className="text-zinc-100">6-Tier Evidence Stratification:</strong> Explicit scientific separation between traditional reports, in-vitro bioassays, and clinical trials.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span><strong className="text-zinc-100">Verbatim Text Provenance:</strong> Every knowledge graph edge retains its verbatim excerpt, publication DOI, and curator audit trail.</span>
              </li>
            </ul>
          </GlowCard>

        </div>
      </section>

      {/* Architecture Visualization */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <ArchitectureDiagram />
      </section>

      {/* Feature Showcase Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white font-mono">Engineered for Rigorous Ethnopharmacology</h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">Explore the interactive modules built for researchers, natural product chemists, and curators.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <GlowCard 
            interactive
            glowColor="silver"
            onClick={() => setActiveTab('dashboard')}
            className="p-5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-zinc-200 font-mono">Research Discovery Dashboard</h4>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">Live quantitative metrics, confidence distributions, and evidence-tier analytics calculated directly from database records.</p>
          </GlowCard>

          <GlowCard 
            interactive
            glowColor="cyan"
            onClick={() => setActiveTab('extraction')}
            className="p-5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-sky-300 font-mono">AI Literature Mining Workspace</h4>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">Upload papers or paste excerpts. Our 12-stage pipeline extracts plant parts, preparations, compounds, and evidence tiers.</p>
          </GlowCard>

          <GlowCard 
            interactive
            glowColor="purple"
            onClick={() => setActiveTab('graph')}
            className="p-5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Network className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-purple-300 font-mono">Interactive Knowledge Graph</h4>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">Powered by Cytoscape.js. Trace multi-hop links between medicinal plants, bioactive compounds, ailments, and cultures.</p>
          </GlowCard>

          <GlowCard 
            interactive
            glowColor="mint"
            onClick={() => setActiveTab('plants')}
            className="p-5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Leaf className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 font-mono">Plant Intelligence Explorer</h4>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">Taxonomic dossiers reconciling Kew MPNS binomials, vernacular names across traditions, parts used, and pharmacological citations.</p>
          </GlowCard>

          <GlowCard 
            interactive
            glowColor="cyan"
            onClick={() => setActiveTab('assistant')}
            className="p-5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 font-mono">Grounded AI Research Assistant</h4>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">Conversational RAG assistant grounded exclusively in indexed scientific sources. Zero hallucination, explicit citations.</p>
          </GlowCard>

          <GlowCard 
            interactive
            glowColor="amber"
            onClick={() => setActiveTab('verification')}
            className="p-5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-300 font-mono">Human Verification Workspace</h4>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">Curator review loop allowing domain experts to inspect verbatim excerpts, approve/reject extractions, and edit binomials.</p>
          </GlowCard>

          {/* Discovery Radar Featured Span Card */}
          <GlowCard 
            interactive
            glowColor="cyan"
            onClick={() => setActiveTab('discovery')}
            className="p-6 sm:col-span-2 lg:col-span-3 group"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                  <Compass className="w-7 h-7 text-sky-400 animate-spin" style={{ animationDuration: '14s' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white group-hover:text-sky-300 font-mono">
                      Discovery Radar & Sovereignty Ledger
                    </h4>
                    <span className="text-[10px] font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-mono">
                      High-Priority Feature
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1.5 max-w-2xl leading-relaxed">
                    Translational opportunity scores, automated cross-tradition convergence detection across 6 continents, and downloadable cryptographic SHA-256 Sovereignty Certificates under the UN Nagoya Protocol.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="hidden sm:block">
                  <RadarSonar size={110} showTargets={false} />
                </div>
                <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Launch Radar</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </GlowCard>

        </div>
      </section>

    </div>
  );
};
