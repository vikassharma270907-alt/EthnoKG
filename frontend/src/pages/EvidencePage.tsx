import React, { useState, useEffect } from 'react';
import { Database, ExternalLink, AlertTriangle, BookOpen, Quote } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { fetchExtractionResults } from '../api/client';
import type { RelationshipDetail } from '../types';
import { GlowCard } from '../components/GlowCard';

const TIERS = [
  'All Evidence Tiers',
  'Traditional Use Report',
  'Ethnobotanical Field Observation',
  'In-Vitro Experimental Bioassay',
  'In-Vivo Preclinical Model',
  'Clinical Human Trial',
  'In-Silico Prediction'
];

export const EvidencePage: React.FC = () => {
  const [relationships, setRelationships] = useState<RelationshipDetail[]>([]);
  const [selectedTier, setSelectedTier] = useState('All Evidence Tiers');
  const [minConfidence, setMinConfidence] = useState<number>(0.7);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    fetchExtractionResults({
      evidence_tier: selectedTier === 'All Evidence Tiers' ? undefined : selectedTier,
      min_confidence: minConfidence,
      limit: 150
    }).then(data => {
      if (isSubscribed) {
        setRelationships(data);
        setIsLoading(false);
      }
    }).catch(err => {
      if (isSubscribed) {
        console.error(err);
        setIsLoading(false);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [selectedTier, minConfidence]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white font-mono">Evidence Explorer & Provenance Inspector</h1>
          <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
            6-Tier Taxonomy
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-0.5">
          Inspect source-backed claims with side-by-side verbatim text excerpts. Strict demarcation between traditional lore and experimental bioassays.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#111319]/90 border border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl backdrop-blur-xl">
        
        {/* Tier Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {TIERS.map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedTier === tier
                  ? 'bg-zinc-200 text-zinc-950 shadow-md font-bold'
                  : 'bg-[#161822] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        {/* Confidence slider */}
        <div className="flex items-center gap-3 text-xs text-zinc-300 bg-[#161822] px-3.5 py-1.5 rounded-xl border border-zinc-800 font-mono">
          <span>Min Confidence:</span>
          <input
            type="range"
            min="0.5"
            max="0.95"
            step="0.05"
            value={minConfidence}
            onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
            className="w-24 accent-zinc-200 cursor-pointer"
          />
          <span className="text-sky-400 font-bold">{Math.round(minConfidence * 100)}%</span>
        </div>

      </div>

      {/* Notice Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-xs text-amber-300/90 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
        <span>
          <strong className="text-white">Scientific Principle:</strong> A reported traditional use does not automatically demonstrate clinical effectiveness. Each evidence category maintains its distinct evidential weight.
        </span>
      </div>

      {/* Evidence Cards List */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-zinc-400 text-xs font-mono">Querying evidence database...</p>
        </div>
      ) : relationships.length === 0 ? (
        <div className="bg-[#111319] border border-zinc-800 rounded-2xl p-12 text-center text-zinc-400">
          <Database className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
          <p className="text-sm">No evidence records match the selected tier or confidence threshold.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {relationships.map((rel) => (
              <GlowCard 
                key={rel.id}
                glowColor="silver"
                className="p-5 space-y-3.5"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">{rel.plant_scientific_name}</span>
                    <span className="text-xs text-zinc-500">→</span>
                    <span className="text-sm font-semibold text-rose-400 font-mono">{rel.condition_name || 'General Health'}</span>
                    <span className="text-[10px] font-semibold bg-zinc-800 text-purple-300 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
                      {rel.knowledge_tradition}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold bg-zinc-800 text-emerald-300 border border-zinc-700 px-2.5 py-0.5 rounded-full font-mono">
                      {rel.evidence_tier}
                    </span>
                    <span className="text-xs font-mono text-sky-400 font-semibold">
                      Confidence: {Math.round(rel.extraction_confidence * 100)}%
                    </span>
                    <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full font-mono ${
                      rel.verification_status === 'approved' 
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                      {rel.verification_status}
                    </span>
                  </div>
                </div>

                {/* Context Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 font-semibold block font-mono">Organ & Preparation</span>
                    <span className="text-zinc-300">{rel.plant_part || 'Whole plant'} | {rel.preparation_method || 'Traditional extraction'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 font-semibold block font-mono">Reported Compound</span>
                    <span className="text-sky-400 font-mono">{rel.compound_name || 'Phytochemical extract'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 font-semibold block font-mono">Pharmacological Activity</span>
                    <span className="text-zinc-200">{rel.pharmacological_activity || 'Empirical bioactivity'}</span>
                  </div>
                </div>

                {/* Verbatim Excerpt */}
                {rel.supporting_excerpt && (
                  <div className="bg-[#161822] p-3.5 rounded-xl border border-zinc-800 text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-300 font-bold uppercase text-[10px] mb-1 font-mono">
                      <Quote className="w-3 h-3 text-sky-400" />
                      <span>Verbatim Literature Excerpt</span>
                    </div>
                    <p className="text-zinc-300 italic leading-relaxed">
                      "{rel.supporting_excerpt}"
                    </p>
                  </div>
                )}

                {/* Source Provenance */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-400 pt-1">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{rel.document_title || 'Indexed Ethnopharmacological Document'}</span>
                  </div>

                  {rel.document_doi && (
                    <a
                      href={`https://doi.org/${rel.document_doi}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono text-[10px]"
                    >
                      <span>DOI: {rel.document_doi}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </GlowCard>
            ))}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
};
