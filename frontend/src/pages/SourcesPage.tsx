import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, Globe, ExternalLink, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { fetchSources } from '../api/client';
import { SourceItem } from '../types';

export const SourcesPage: React.FC = () => {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSources().then(setSources).finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white font-mono">Data Sources Registry & Ethics</h1>
          <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
            Nagoya Protocol Aligned
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Authoritative biodiversity registries, open-access biomedical literature sources, and ethical traditional knowledge governance guardrails.
        </p>
      </div>

      {/* Ethics & Responsible Research Principles */}
      <div className="bg-[#070c19] border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wide">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>EthnoHack 2026 Responsible Research & Ethics Policy</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-semibold text-white">1. Indigenous IP & Sovereignty</h4>
            <p className="text-slate-300 leading-relaxed">
              Traditional knowledge originates within indigenous communities. EthnoKG preserves explicit cultural attribution (Ayurveda, TCM, African Folk) and adheres to Nagoya Protocol benefit-sharing principles.
            </p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-semibold text-white">2. Biodiversity & Habitat Protection</h4>
            <p className="text-slate-300 leading-relaxed">
              To prevent illegal wild-harvesting and over-exploitation of endangered medicinal taxa, EthnoKG restricts high-resolution geospatial coordinates for threatened species listed under IUCN or CITES appendices.
            </p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-semibold text-white">3. Strict Non-Diagnostic Scope</h4>
            <p className="text-slate-300 leading-relaxed">
              EthnoKG is exclusively a literature-mining and scientific discovery platform. It never generates clinical diagnoses, dosage instructions, or prescriptions. Traditional lore is never represented as proven clinical efficacy.
            </p>
          </div>

        </div>
      </div>

      {/* Data Source Registry Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Authoritative Data Sources & Reference Registries</span>
          </h3>
          <span className="text-xs text-slate-500">{sources.length} active integrations</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading source registry...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((src) => (
              <div 
                key={src.id}
                className="bg-[#070c19] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white font-mono">{src.name}</h4>
                      <p className="text-[11px] text-emerald-400 font-medium">{src.organization}</p>
                    </div>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                      title="Open Official Website"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {src.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Category:</span>
                    <span className="text-slate-300">{src.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">License:</span>
                    <span className="text-slate-300 font-mono text-[10px]">{src.license}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Status:</span>
                    <span className="text-emerald-400 font-semibold">{src.integration_status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
