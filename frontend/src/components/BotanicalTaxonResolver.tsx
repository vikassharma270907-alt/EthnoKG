import React, { useState } from 'react';
import { Search, Sparkles, CheckCircle2, AlertCircle, ExternalLink, Atom, BookOpen, ShieldCheck, ArrowRight } from 'lucide-react';
import { resolveBotanicalTaxon } from '../api/client';
import type { BotanicalTaxonResolution } from '../types';
import { GlowCard } from './GlowCard';

interface Props {
  onSelectPlant?: (plantId: number) => void;
}

export const BotanicalTaxonResolver: React.FC<Props> = ({ onSelectPlant }) => {
  const [query, setQuery] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [result, setResult] = useState<BotanicalTaxonResolution | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleQueries = [
    'Ashwagandha',
    'Qinghao',
    'Sweet Wormwood',
    'Sarpagandha',
    'Madagascar Periwinkle',
    'Neem',
    'Turmeric',
    'Ginkgo'
  ];

  const handleResolve = async (nameToResolve?: string) => {
    const q = (nameToResolve || query).trim();
    if (!q) return;
    setIsResolving(true);
    setError(null);
    try {
      const res = await resolveBotanicalTaxon(q);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || 'Taxonomic resolution probe encountered an error.');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <GlowCard glowColor="silver" className="p-5 border border-zinc-800 rounded-2xl bg-[#101218]/95 backdrop-blur-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-zinc-200">
            <Sparkles className="w-4 h-4 text-zinc-300" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <span>Botanical Taxonomic Nomenclature Resolver</span>
              <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full">
                Kew POWO / MPNS
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Verify traditional and vernacular vernacular folk names against Kew authoritative accepted binomials & synonym registries.
            </p>
          </div>
        </div>
      </div>

      {/* Input row */}
      <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Type any folk or vernacular name (e.g., Ashwagandha, Qinghao, Opium Poppy)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleResolve()}
            className="w-full pl-9 pr-3 py-2 bg-[#151722] border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
        </div>
        <button
          onClick={() => handleResolve()}
          disabled={isResolving || !query.trim()}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-mono font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          {isResolving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              <span>Resolving...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
              <span>Resolve Taxon</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Pills */}
      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] text-zinc-500 font-mono">Suggested vouchers:</span>
        {sampleQueries.map((name) => (
          <button
            key={name}
            onClick={() => {
              setQuery(name);
              handleResolve(name);
            }}
            className="text-[10px] px-2 py-0.5 rounded-md bg-[#151722] hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors font-mono cursor-pointer"
          >
            {name}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-950/30 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="mt-4 p-4 rounded-xl bg-[#151722] border border-zinc-800 space-y-3 animate-in fade-in duration-200">
          {result.matched ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-white font-mono italic">
                      {result.scientific_name}
                    </span>
                    <span className="text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{result.kew_status}</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Confidence: {(result.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 font-mono">
                    Authority: <span className="text-zinc-200">{result.authority || 'N/A'}</span> • Family: <span className="text-zinc-200 font-semibold">{result.family}</span> • Genus: <span className="text-zinc-200">{result.genus}</span>
                  </p>
                </div>

                {result.plant_id && onSelectPlant && (
                  <button
                    onClick={() => onSelectPlant(result.plant_id!)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-mono text-zinc-200 transition-colors cursor-pointer shrink-0 self-start"
                  >
                    <span>View Species Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Vernacular synonyms */}
                <div>
                  <span className="text-zinc-500 font-mono text-[11px] block mb-1">Vernacular Synonyms:</span>
                  <div className="flex flex-wrap gap-1">
                    {(result.common_names || []).map((cn, i) => (
                      <span key={i} className="text-[11px] bg-[#101218] border border-zinc-700/60 px-2 py-0.5 rounded text-zinc-300 font-mono">
                        {cn}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Verified Bioactive Metabolites */}
                <div>
                  <span className="text-zinc-500 font-mono text-[11px] flex items-center gap-1 mb-1">
                    <Atom className="w-3 h-3 text-zinc-400" />
                    <span>Verified Phytochemical Metabolites:</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(result.verified_bioactive_compounds || []).length > 0 ? (
                      result.verified_bioactive_compounds!.map((c, i) => (
                        <span key={i} className="text-[11px] bg-[#101218] border border-zinc-700/60 px-2 py-0.5 rounded text-zinc-200 font-mono">
                          {c}
                        </span>
                      ))
                    ) : (
                      <span className="text-zinc-500 italic">None cataloged yet</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Traditional Indications */}
              {(result.principal_traditional_uses || []).length > 0 && (
                <div className="pt-2 border-t border-zinc-800/60">
                  <span className="text-zinc-500 font-mono text-[11px] flex items-center gap-1 mb-1">
                    <BookOpen className="w-3 h-3 text-zinc-400" />
                    <span>Documented Traditional Health Indications:</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {result.principal_traditional_uses!.map((cond, i) => (
                      <span key={i} className="text-[11px] bg-[#101218] border border-zinc-700/40 px-2 py-0.5 rounded text-zinc-300">
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>Source: {result.source}</span>
                <span className="text-zinc-400">{result.resolution_type}</span>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-300 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{result.message}</span>
              </div>
              {result.suggestion && (
                <p className="text-xs text-zinc-400 pl-6">{result.suggestion}</p>
              )}
              {result.kew_powo_url && (
                <div className="pl-6 pt-1">
                  <a
                    href={result.kew_powo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white underline font-mono"
                  >
                    <span>Search Kew Plants of the World Online (POWO)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </GlowCard>
  );
};
