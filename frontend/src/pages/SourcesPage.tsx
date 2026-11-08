import React, { useState, useEffect } from 'react';
import { Database, ExternalLink, AlertTriangle } from 'lucide-react';
import { fetchSources } from '../api/client';
import type { SourceItem } from '../types';
import { GlowCard } from '../components/GlowCard';

export const SourcesPage: React.FC = () => {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSources().then(setSources).finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white font-mono">Data Sources Registry & Ethics</h1>
          <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
            Nagoya Protocol Aligned
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-0.5">
          Authoritative biodiversity registries, open-access biomedical literature sources, and ethical traditional knowledge governance guardrails.
        </p>
      </div>

      {/* Ethics & Responsible Research Principles */}
      <div className="bg-[#101218]/90 border border-zinc-700/80 rounded-2xl p-6 shadow-2xl space-y-4 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm uppercase tracking-wider font-mono">
          <AlertTriangle className="w-5 h-5 shrink-0 text-zinc-300" />
          <span>EthnoHack 2026 Responsible Research & Ethics Policy</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">

          <div className="bg-[#151722] p-4 rounded-xl border border-zinc-800 space-y-2">
            <h4 className="font-semibold text-white font-mono">1. Indigenous IP & Sovereignty</h4>
            <p className="text-zinc-400 leading-relaxed">
              Traditional knowledge originates within indigenous communities. EthnoKG preserves explicit cultural attribution (Ayurveda, TCM, African Folk) and adheres to Nagoya Protocol benefit-sharing principles.
            </p>
          </div>

          <div className="bg-[#151722] p-4 rounded-xl border border-zinc-800 space-y-2">
            <h4 className="font-semibold text-white font-mono">2. Biodiversity & Habitat Protection</h4>
            <p className="text-zinc-400 leading-relaxed">
              To prevent illegal wild-harvesting and over-exploitation of endangered medicinal taxa, EthnoKG restricts high-resolution geospatial coordinates for threatened species listed under IUCN or CITES appendices.
            </p>
          </div>

          <div className="bg-[#151722] p-4 rounded-xl border border-zinc-800 space-y-2">
            <h4 className="font-semibold text-white font-mono">3. Strict Non-Diagnostic Scope</h4>
            <p className="text-zinc-400 leading-relaxed">
              EthnoKG is exclusively a literature-mining and scientific discovery platform. It never generates clinical diagnoses, dosage instructions, or prescriptions. Traditional lore is never represented as proven clinical efficacy.
            </p>
          </div>

        </div>
      </div>

      {/* Data Source Registry Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Database className="w-4 h-4 text-zinc-300" />
            <span>Authoritative Data Sources & Reference Registries</span>
          </h3>
          <span className="text-xs text-zinc-500 font-mono">{sources.length} active integrations</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-zinc-400 font-mono">Loading source registry...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((src) => (
              <GlowCard
                key={src.id}
                glowColor="silver"
                className="p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white font-mono">{src.name}</h4>
                      <p className="text-[11px] text-zinc-400 font-medium">{src.organization}</p>
                    </div>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 transition-colors"
                      title="Open Official Website"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {src.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800 space-y-1.5 text-[11px] font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-medium">Category:</span>
                    <span className="text-zinc-300">{src.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-medium">License:</span>
                    <span className="text-zinc-400 text-[10px]">{src.license}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-medium">Status:</span>
                    <span className="text-zinc-200 font-semibold">{src.integration_status}</span>
                  </div>
                </div>
              </GlowCard>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
