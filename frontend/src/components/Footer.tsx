import React from 'react';
import { Shield, ExternalLink, Terminal } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-[#0a0c12] border-t border-zinc-800/80 text-zinc-400 text-xs mt-16 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Identity & Scope */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white font-mono">
                Ethno<span className="text-zinc-300">KG</span>
              </span>
              <span className="text-[10px] text-zinc-300 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
                v1.2.0 Obsidian Edition
              </span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-md">
              EthnoKG is an open-science ethnopharmacological literature-mining and knowledge graph discovery platform.
              Reconciling centuries of traditional healing reports with modern molecular pharmacology under <strong className="text-zinc-200">EthnoHack 2026</strong>.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-zinc-300 bg-zinc-900/80 border border-zinc-800 p-2.5 rounded-xl shadow-inner">
              <Shield className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong className="text-zinc-200">Research Notice:</strong> Historical traditional uses are cultural empirical records and do not constitute validated clinical efficacy or medical advice.
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-zinc-200 font-semibold mb-3 tracking-wider uppercase text-[11px] font-mono">Knowledge Platform</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-white transition-colors cursor-pointer">
                  Research Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('discovery')} className="hover:text-white transition-colors cursor-pointer">
                  Discovery Radar & Convergence
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('extraction')} className="hover:text-white transition-colors cursor-pointer">
                  12-Stage Literature Mining
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('plants')} className="hover:text-white transition-colors cursor-pointer">
                  Plant Intelligence Explorer
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('graph')} className="hover:text-white transition-colors cursor-pointer">
                  Interactive Knowledge Graph
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('evidence')} className="hover:text-white transition-colors cursor-pointer">
                  6-Tier Evidence Explorer
                </button>
              </li>
            </ul>
          </div>

          {/* Standards & Nagoya Protocol */}
          <div>
            <h4 className="text-zinc-200 font-semibold mb-3 tracking-wider uppercase text-[11px] font-mono">Scientific Standards</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('methodology')} className="hover:text-white transition-colors cursor-pointer">
                  Research Methodology
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('sources')} className="hover:text-white transition-colors cursor-pointer">
                  Kew MPNS & WFO Standards
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('sources')} className="hover:text-white transition-colors cursor-pointer">
                  Nagoya Protocol Compliance
                </button>
              </li>
              <li>
                <a 
                  href="/docs" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <Terminal className="w-3 h-3 text-zinc-300" />
                  <span>FastAPI Swagger Docs</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-4">
          <p>© 2026 EthnoKG Team — Open Research for EthnoHack 2026. CC-BY 4.0 License.</p>
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span className="flex items-center gap-1 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              API Status: Online
            </span>
            <span>•</span>
            <span>Zero-Hallucination Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
