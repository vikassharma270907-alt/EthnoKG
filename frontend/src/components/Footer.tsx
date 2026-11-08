import React from 'react';
import { Shield, ExternalLink } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-[#070b19] border-t border-slate-800/80 text-slate-400 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Identity & Scope */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white font-mono">Ethno<span className="text-emerald-400">KG</span></span>
              <span className="text-[10px] text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">v1.0.0</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              EthnoKG is an open-science ethnopharmacological literature-mining and knowledge graph discovery platform.
              Built for <strong className="text-slate-200">EthnoHack 2026</strong> under the Traditional Knowledge Mining and Natural Products & Drug Discovery tracks.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
              <Shield className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>Research Notice:</strong> Historical traditional uses are cultural empirical records and do not constitute validated clinical efficacy or medical advice.
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 tracking-wide uppercase text-[11px]">Knowledge Platform</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-emerald-400 transition-colors">
                  Research Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('extraction')} className="hover:text-emerald-400 transition-colors">
                  12-Stage Literature Mining
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('plants')} className="hover:text-emerald-400 transition-colors">
                  Plant Intelligence Explorer
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('graph')} className="hover:text-emerald-400 transition-colors">
                  Interactive Knowledge Graph
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('evidence')} className="hover:text-emerald-400 transition-colors">
                  6-Tier Evidence Explorer
                </button>
              </li>
            </ul>
          </div>

          {/* Standards & Nagoya Protocol */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 tracking-wide uppercase text-[11px]">Scientific Standards</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('methodology')} className="hover:text-emerald-400 transition-colors">
                  Research Methodology
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('sources')} className="hover:text-emerald-400 transition-colors">
                  Kew MPNS & WFO Standards
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('sources')} className="hover:text-emerald-400 transition-colors">
                  Nagoya Protocol Compliance
                </button>
              </li>
              <li>
                <a 
                  href="/docs" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors"
                >
                  <span>FastAPI Swagger Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© 2026 EthnoKG Team — Open Research for EthnoHack 2026. CC-BY 4.0 License.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Backend API Connected
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
