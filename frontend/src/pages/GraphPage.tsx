import React, { useState, useEffect } from 'react';
import { Info, Network } from 'lucide-react';
import { fetchGraph } from '../api/client';
import type { GraphResponse } from '../types';
import { KnowledgeGraph } from '../components/KnowledgeGraph';

export const GraphPage: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvidenceTier, setSelectedEvidenceTier] = useState<string | undefined>(undefined);
  const [selectedTradition, setSelectedTradition] = useState<string | undefined>(undefined);

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
  }, [selectedEvidenceTier, selectedTradition]);

  const handleFilterChange = (filters: { evidence_tier?: string; tradition?: string }) => {
    setSelectedEvidenceTier(filters.evidence_tier);
    setSelectedTradition(filters.tradition);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
              <Network className="w-6 h-6 text-emerald-400" />
              <span>Interactive Knowledge Graph</span>
            </h1>
            <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Cytoscape Network Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Trace multi-relational networks connecting medicinal plants, traditional preparation forms, isolated phytochemicals, and clinical indications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-white font-mono">{graphData?.nodes?.length || 0} Entities</span>
            <span>•</span>
            <span className="font-semibold text-emerald-400 font-mono">{graphData?.edges?.length || 0} Relations</span>
          </div>
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
      <div className="bg-[#070c19] border border-slate-800 p-4 rounded-2xl text-xs text-slate-400 flex items-start gap-3 shadow-lg">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-200">How to Navigate the Graph:</p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400">
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
