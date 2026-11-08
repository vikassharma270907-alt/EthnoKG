import React from 'react';
import { BookOpen, Cpu, ShieldCheck, Network, Compass, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const ArchitectureDiagram: React.FC = () => {
  const steps = [
    {
      title: "Scientific Literature",
      desc: "Open access PMC, BHL & Herbaria",
      icon: BookOpen,
      accent: "text-zinc-200",
      iconBg: "bg-zinc-800/90 text-zinc-200 border-zinc-700",
      stepNum: "01"
    },
    {
      title: "12-Stage AI Extraction",
      desc: "NER, Taxon Resolver & S-P-O Tuples",
      icon: Cpu,
      accent: "text-sky-400",
      iconBg: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      stepNum: "02"
    },
    {
      title: "Evidence & Curation",
      desc: "6-Tier Stratification & Nagoya Audit",
      icon: ShieldCheck,
      accent: "text-amber-400",
      iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      stepNum: "03"
    },
    {
      title: "Knowledge Graph",
      desc: "Multi-relational NetworkX & Cytoscape",
      icon: Network,
      accent: "text-purple-400",
      iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      stepNum: "04"
    },
    {
      title: "Research Discovery",
      desc: "Grounded RAG & Reverse Pharmacology",
      icon: Compass,
      accent: "text-teal-400",
      iconBg: "bg-teal-500/10 text-teal-400 border-teal-500/30",
      stepNum: "05"
    }
  ];

  return (
    <div className="w-full bg-[#111319]/80 border border-zinc-800/90 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/60 relative overflow-hidden">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-zinc-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center max-w-2xl mx-auto mb-8 relative z-10">
        <span className="text-xs font-semibold tracking-wider uppercase text-zinc-300 bg-zinc-800/90 border border-zinc-700/80 px-3 py-1 rounded-full font-mono">
          Reproducible Pipeline Architecture
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-white mt-3 font-mono tracking-tight">
          From Unstructured Texts to Traceable Graph Discovery
        </h3>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
          How EthnoKG bridges centuries of ethnobotanical reports with modern molecular pharmacology through deterministic entity resolution and evidence provenance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 relative z-10">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="relative bg-[#161822]/90 border border-zinc-800 hover:border-zinc-600/80 rounded-xl p-4 flex flex-col justify-between transition-colors shadow-lg group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-transform group-hover:scale-110 ${step.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    {step.stepNum}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white font-mono group-hover:text-zinc-100">{step.title}</h4>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{step.desc}</p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-zinc-600">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
