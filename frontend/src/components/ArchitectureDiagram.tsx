import React from 'react';
import { BookOpen, Cpu, ShieldCheck, Network, Compass, ArrowRight } from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  const steps = [
    {
      title: "Scientific Literature",
      desc: "Open access PMC, BHL & Herbaria",
      icon: BookOpen,
      color: "from-blue-500 to-indigo-600",
      accent: "text-blue-400",
      border: "border-blue-500/30"
    },
    {
      title: "12-Stage AI Extraction",
      desc: "NER, Taxon Resolver & S-P-O Tuples",
      icon: Cpu,
      color: "from-emerald-500 to-teal-600",
      accent: "text-emerald-400",
      border: "border-emerald-500/30"
    },
    {
      title: "Evidence & Curation",
      desc: "6-Tier Stratification & Nagoya Audit",
      icon: ShieldCheck,
      color: "from-amber-500 to-orange-600",
      accent: "text-amber-400",
      border: "border-amber-500/30"
    },
    {
      title: "Knowledge Graph",
      desc: "Multi-relational NetworkX & Cytoscape",
      icon: Network,
      color: "from-purple-500 to-violet-600",
      accent: "text-purple-400",
      border: "border-purple-500/30"
    },
    {
      title: "Research Discovery",
      desc: "Grounded RAG & Reverse Pharmacology",
      icon: Compass,
      color: "from-cyan-500 to-emerald-500",
      accent: "text-cyan-400",
      border: "border-cyan-500/30"
    }
  ];

  return (
    <div className="w-full bg-[#070c19]/80 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          Reproducible Pipeline Architecture
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-white mt-3 font-mono">
          From Unstructured Texts to Traceable Graph Discovery
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
          How EthnoKG bridges ancient ethnobotanical reports with modern molecular pharmacology through deterministic entity resolution and evidence provenance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="relative flex flex-col items-center">
              <div className={`w-full bg-slate-900/90 border ${s.border} rounded-xl p-4 flex flex-col items-center text-center hover:scale-[1.02] transition-transform duration-200 h-full shadow-lg`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${s.color} flex items-center justify-center mb-3 shadow-md`}>
                  <Icon className="w-6 h-6 text-white stroke-[2]" />
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                  Stage 0{idx + 1}
                </div>
                <h4 className={`text-sm font-bold text-slate-100 mb-1`}>{s.title}</h4>
                <p className="text-[11px] text-slate-400 leading-snug">{s.desc}</p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ArrowRight className="w-4 h-4 text-emerald-500/70" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
