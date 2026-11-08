import React, { useState, useEffect } from 'react';
import { Info, Network, RotateCw, Zap } from 'lucide-react';
import { fetchGraph, fetchGraphCacheStats, clearGraphCache } from '../api/client';
import type { GraphResponse, GraphCacheStats } from '../types';
import { KnowledgeGraph } from '../components/KnowledgeGraph';

export const GraphPage: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvidenceTier, setSelectedEvidenceTier] = useState<string | undefined>(undefined);
  const [selectedTradition, setSelectedTradition] = useState<string | undefined>(undefined);
  const [cacheStats, setCacheStats] = useState<GraphCacheStats | null>(null);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let isSubscribed = true;
    fetchGraph({
      evidence_tier: selectedEvidenceTier,
      tradition: selectedTradition,
      max_edges: 200
    }).then(data => {
      if (isSubscribed) {
        setGraphData(data);
        setIsLoading(false);
        fetchGraphCacheStats().then((s: GraphCacheStats) => {
          if (isSubscribed) setCacheStats(s);
        }).catch(() => {});
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
  }, [selectedEvidenceTier, selectedTradition, refreshIndex]);

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      await clearGraphCache();
      setIsLoading(true);
      setRefreshIndex(prev => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleFilterChange = (filters: { evidence_tier?: string; tradition?: string }) => {
    setIsLoading(true);
    setSelectedEvidenceTier(filters.evidence_tier);
    setSelectedTradition(filters.tradition);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
              <Network className="w-5 h-5 text-zinc-300" />
              <span>Interactive Knowledge Graph</span>
            </h1>
            <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
              Cytoscape Network Engine
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Trace multi-relational networks connecting medicinal plants, traditional preparation forms, isolated phytochemicals, and clinical indications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {cacheStats && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-400 bg-[#101218] border border-zinc-800 px-2.5 py-1.5 rounded-xl font-mono">
              <Zap className="w-3.5 h-3.5 text-zinc-400" />
              <span>TTL {cacheStats.ttl_seconds}s</span>
              <span>•</span>
              <span className="text-zinc-200">{cacheStats.cache_hits} Hits</span>
            </div>
          )}

          <div className="text-xs text-zinc-300 bg-[#101218] border border-zinc-800 px-3 py-1.5 rounded-xl flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-pulse"></span>
            <span className="font-semibold text-white">{graphData?.nodes?.length || 0} Entities</span>
            <span>•</span>
            <span className="font-semibold text-zinc-300">{graphData?.edges?.length || 0} Relations</span>
          </div>

          <button
            onClick={handleClearCache}
            disabled={isClearingCache || isLoading}
            title="Flush in-memory graph cache and re-query database"
            className="p-2 rounded-xl bg-[#101218] hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isClearingCache ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Graph Component */}
      <KnowledgeGraph
        graphData={graphData}
        isLoading={isLoading}
        onFilterChange={handleFilterChange}
        selectedEvidenceTier={selectedEvidenceTier}
        selectedTradition={selectedTradition}
      />

      {/* Helpful Instructions */}
      <div className="bg-[#101218]/90 border border-zinc-800 p-4 rounded-2xl text-xs text-zinc-400 flex items-start gap-3 shadow-xl">
        <Info className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-zinc-200 font-mono">How to Navigate the Graph:</p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-zinc-400">
            <li><strong>Click any node:</strong> Centers the view and opens the Entity Details drawer with family, connections, and metadata.</li>
            <li><strong>Click any edge:</strong> Opens the Scientific Provenance drawer displaying the verbatim text passage and DOI reference.</li>
            <li><strong>Scroll / Drag:</strong> Use your mouse wheel to zoom and drag to pan across the network space.</li>
            <li><strong>Layout Selector:</strong> Switch between Force-Directed (CoSE), Concentric Rings, Circular Orbit, and Breadth-First tree hierarchies.</li>
          </ul>
        </div>
      </div>

    </div>
  );
};
