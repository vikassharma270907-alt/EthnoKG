import React from 'react';
import { 
  Network, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Leaf, 
  Database, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  Activity
} from 'lucide-react';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';

interface LandingPageProps {
  setActiveTab: (tab: string) => void;
  stats?: any;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveTab, stats }) => {
  return (
    <div className="space-y-16">
      
      {/* Hero Section */}
      <section className="relative pt-6 pb-12 sm:pt-12 sm:pb-16 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            EthnoHack 2026 | Traditional Knowledge Mining & Drug Discovery
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight font-mono leading-tight">
            Turning Traditional Knowledge into <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Traceable Scientific Evidence</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            EthnoKG is an AI-powered literature-mining and knowledge graph discovery platform.
            We reconcile centuries of traditional medicine reports with modern biomedical pharmacology, 
            anchoring every claim to botanical authorities and verbatim publication excerpts.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('graph')}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
            >
              <Network className="w-4 h-4" />
              <span>Explore Knowledge Graph</span>
            </button>

            <button
              onClick={() => setActiveTab('extraction')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Mine Literature</span>
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className="px-6 py-3 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-700/60 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Ask AI Assistant</span>
            </button>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-8">
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center">
              <span className="text-2xl font-bold text-white font-mono">{stats?.total_plants || 12}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Authoritative Taxa</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center">
              <span className="text-2xl font-bold text-emerald-400 font-mono">{stats?.total_relationships || 24}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Extracted Relations</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center">
              <span className="text-2xl font-bold text-cyan-400 font-mono">{stats?.total_compounds || 16}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Bioactive Compounds</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center">
              <span className="text-2xl font-bold text-purple-400 font-mono">{stats?.indexed_publications || 12}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Indexed Publications</span>
            </div>
          </div>

        </div>
      </section>

      {/* Problem & Solution Comparison */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* The Problem */}
          <div className="bg-slate-900/60 border border-rose-900/30 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="inline-flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              The Core Problem
            </div>
            <h3 className="text-xl font-bold text-white font-mono">Traditional Knowledge is Fragmented & Ambiguous</h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span><strong>Unstructured Text:</strong> Millions of ethnomedical observations are locked in narrative books, regional surveys, and unindexed PDFs.</span>
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
          <div className="bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              The EthnoKG Solution
            </div>
            <h3 className="text-xl font-bold text-white font-mono">Traceable, Grounded Knowledge Graph Pipeline</h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>12-Stage Literature Mining:</strong> Automatic biomedical NER, condition mapping, and relation extraction with strict JSON schemas.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Kew MPNS / WFO Resolution:</strong> Binomial standardization preventing false species conflation.</span>
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
            className="bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 cursor-pointer group transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-emerald-300">Research Discovery Dashboard</h4>
            <p className="text-xs text-slate-400 mt-1">Live quantitative metrics, confidence distributions, and evidence-tier analytics calculated directly from database records.</p>
          </div>

          <div 
            onClick={() => setActiveTab('extraction')}
            className="bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 cursor-pointer group transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-blue-300">AI Literature Mining Workspace</h4>
            <p className="text-xs text-slate-400 mt-1">Upload papers or paste excerpts. Our 12-stage pipeline extracts plant parts, preparations, compounds, and evidence tiers.</p>
          </div>

          <div 
            onClick={() => setActiveTab('graph')}
            className="bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 cursor-pointer group transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Network className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-purple-300">Interactive Knowledge Graph</h4>
            <p className="text-xs text-slate-400 mt-1">Powered by Cytoscape.js. Trace multi-hop links between medicinal plants, bioactive compounds, ailments, and cultures.</p>
          </div>

          <div 
            onClick={() => setActiveTab('plants')}
            className="bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 cursor-pointer group transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Leaf className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-teal-300">Plant Intelligence Explorer</h4>
            <p className="text-xs text-slate-400 mt-1">Taxonomic dossiers reconciling Kew MPNS binomials, vernacular names across traditions, parts used, and pharmacological citations.</p>
          </div>

          <div 
            onClick={() => setActiveTab('assistant')}
            className="bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 cursor-pointer group transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-indigo-300">Grounded AI Research Assistant</h4>
            <p className="text-xs text-slate-400 mt-1">Conversational RAG assistant grounded exclusively in indexed scientific sources. Zero hallucination, explicit citations.</p>
          </div>

          <div 
            onClick={() => setActiveTab('verification')}
            className="bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 cursor-pointer group transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-300">Human Verification Workspace</h4>
            <p className="text-xs text-slate-400 mt-1">Curator review loop allowing domain experts to inspect verbatim excerpts, approve/reject extractions, and edit binomials.</p>
          </div>

        </div>
      </section>

    </div>
  );
};
