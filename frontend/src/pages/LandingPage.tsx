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
  Compass
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BotanicalConstellation } from '../components/BotanicalConstellation';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';

interface LandingPageProps {
  setActiveTab: (tab: string) => void;
  stats?: any;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveTab, stats }) => {
  return (
    <div className="space-y-20 relative overflow-hidden">
      
      {/* Hero Section with Interactive Constellation */}
      <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 text-center">
        {/* Canvas Background */}
        <BotanicalConstellation />

        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 space-y-7">
          
          {/* Pill Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide shadow-lg shadow-emerald-950/50 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span>EthnoHack 2026 | Traditional Knowledge Mining & Drug Discovery</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight font-mono leading-[1.15]"
          >
            Turning Traditional Knowledge into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 drop-shadow-[0_0_35px_rgba(16,185,129,0.3)]">
              Traceable Scientific Evidence
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed"
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
            <button
              onClick={() => setActiveTab('graph')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-400/40 hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <Network className="w-4 h-4 stroke-[2.5]" />
              <span>Explore Knowledge Graph</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('extraction')}
              className="px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-sm border border-emerald-500/30 hover:border-emerald-400/60 transition-all backdrop-blur-md hover:scale-105 flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Search className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
              <span>Mine Literature</span>
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className="px-6 py-3.5 rounded-xl bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-700/60 font-semibold text-sm transition-all backdrop-blur-md hover:scale-105 flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Ask AI Assistant</span>
            </button>
          </motion.div>

          {/* Quick Stats Grid with Glass Glow */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-4xl mx-auto pt-6"
          >
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-emerald-500/40 p-4 rounded-2xl text-center transition-all hover:scale-105 shadow-xl">
              <span className="text-3xl font-extrabold text-white font-mono">{stats?.total_plants || 12}</span>
              <span className="text-xs text-slate-400 block mt-1 font-medium">Kew Harmonized Taxa</span>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-emerald-500/40 p-4 rounded-2xl text-center transition-all hover:scale-105 shadow-xl">
              <span className="text-3xl font-extrabold text-emerald-400 font-mono">{stats?.total_relationships || 24}</span>
              <span className="text-xs text-slate-400 block mt-1 font-medium">Extracted Relations</span>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-cyan-500/40 p-4 rounded-2xl text-center transition-all hover:scale-105 shadow-xl">
              <span className="text-3xl font-extrabold text-cyan-400 font-mono">{stats?.total_compounds || 16}</span>
              <span className="text-xs text-slate-400 block mt-1 font-medium">Bioactive Compounds</span>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-purple-500/40 p-4 rounded-2xl text-center transition-all hover:scale-105 shadow-xl">
              <span className="text-3xl font-extrabold text-purple-400 font-mono">{stats?.indexed_publications || 12}</span>
              <span className="text-xs text-slate-400 block mt-1 font-medium">Indexed Publications</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Problem & Solution Comparison */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* The Problem */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-rose-900/40 rounded-2xl p-6 sm:p-8 space-y-4 hover:border-rose-700/50 transition-colors shadow-2xl">
            <div className="inline-flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              The Core Problem
            </div>
            <h3 className="text-xl font-bold text-white font-mono">Traditional Knowledge is Fragmented & Ambiguous</h3>
            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span><strong>Unstructured Literature:</strong> Millions of ethnomedical observations are locked in narrative books, regional surveys, and unindexed PDFs.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span><strong>Taxonomic Confusion:</strong> A single plant species may possess dozens of vernacular and historical synonyms, leading to false data merging.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span><strong>Evidence Conflation:</strong> Folkloric lore, in-vitro test-tube assays, animal models, and clinical trials are frequently mixed without distinction.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span><strong>Lost Provenance:</strong> Claims circulate without traceable citations back to the originating voucher specimen or primary paper.</span>
              </li>
            </ul>
          </div>

          {/* The Solution */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-6 sm:p-8 space-y-4 hover:border-emerald-400/60 transition-colors shadow-2xl">
            <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              The EthnoKG Solution
            </div>
            <h3 className="text-xl font-bold text-white font-mono">Traceable, Grounded Knowledge Graph Pipeline</h3>
            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>12-Stage Literature Mining:</strong> Automatic biomedical NER, condition mapping, and relation extraction with strict JSON schemas.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Kew MPNS / WFO Resolution:</strong> Binomial standardization preventing false species conflation across traditional systems.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>6-Tier Evidence Stratification:</strong> Explicit scientific separation between traditional reports, in-vitro bioassays, and clinical trials.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Verbatim Text Provenance:</strong> Every knowledge graph edge retains its verbatim excerpt, publication DOI, and curator audit trail.</span>
              </li>
            </ul>
          </div>

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
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Explore the interactive modules built for researchers, natural product chemists, and curators.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer group transition-all hover:scale-[1.02] shadow-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-emerald-300">Research Discovery Dashboard</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Live quantitative metrics, confidence distributions, and evidence-tier analytics calculated directly from database records.</p>
          </div>

          <div 
            onClick={() => setActiveTab('extraction')}
            className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer group transition-all hover:scale-[1.02] shadow-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-blue-300">AI Literature Mining Workspace</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Upload papers or paste excerpts. Our 12-stage pipeline extracts plant parts, preparations, compounds, and evidence tiers.</p>
          </div>

          <div 
            onClick={() => setActiveTab('graph')}
            className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer group transition-all hover:scale-[1.02] shadow-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
              <Network className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-purple-300">Interactive Knowledge Graph</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Powered by Cytoscape.js. Trace multi-hop links between medicinal plants, bioactive compounds, ailments, and cultures.</p>
          </div>

          <div 
            onClick={() => setActiveTab('plants')}
            className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer group transition-all hover:scale-[1.02] shadow-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-teal-500/20 transition-all">
              <Leaf className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-teal-300">Plant Intelligence Explorer</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Taxonomic dossiers reconciling Kew MPNS binomials, vernacular names across traditions, parts used, and pharmacological citations.</p>
          </div>

          <div 
            onClick={() => setActiveTab('assistant')}
            className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer group transition-all hover:scale-[1.02] shadow-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-indigo-300">Grounded AI Research Assistant</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Conversational RAG assistant grounded exclusively in indexed scientific sources. Zero hallucination, explicit citations.</p>
          </div>

          <div 
            onClick={() => setActiveTab('verification')}
            className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer group transition-all hover:scale-[1.02] shadow-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-300">Human Verification Workspace</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Curator review loop allowing domain experts to inspect verbatim excerpts, approve/reject extractions, and edit binomials.</p>
          </div>

          <div 
            onClick={() => setActiveTab('discovery')}
            className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer group transition-all hover:scale-[1.02] shadow-xl sm:col-span-2 lg:col-span-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all">
                  <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '12s' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300">Discovery Radar & Sovereignty Ledger</h4>
                    <span className="text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                      Novel Feature
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Reverse pharmacology translational opportunity scores, automated cross-tradition convergence detection across 6 continents, and downloadable cryptographic SHA-256 Sovereignty Certificates under the UN Nagoya Protocol.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold shrink-0 group-hover:translate-x-1 transition-transform">
                <span>Explore Radar</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
