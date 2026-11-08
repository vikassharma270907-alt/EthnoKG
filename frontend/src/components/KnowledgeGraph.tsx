import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Filter, 
  Layers, 
  Info, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  X,
  Search
} from 'lucide-react';
import { GraphResponse } from '../types';

interface KnowledgeGraphProps {
  graphData: GraphResponse | null;
  isLoading: boolean;
  onFilterChange: (filters: { evidence_tier?: string; tradition?: string }) => void;
  selectedEvidenceTier?: string;
  selectedTradition?: string;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  graphData,
  isLoading,
  onFilterChange,
  selectedEvidenceTier,
  selectedTradition,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize and update Cytoscape
  useEffect(() => {
    if (!containerRef.current || !graphData) return;

    // Build Cytoscape elements array
    const elements: any[] = [];

    // Nodes
    graphData.nodes.forEach((n) => {
      const type = n.data.type || 'Unknown';
      let bgColor = '#10b981'; // Plant (emerald)
      if (type === 'Condition') bgColor = '#f43f5e'; // Condition (rose)
      if (type === 'Compound') bgColor = '#06b6d4'; // Compound (cyan)
      if (type === 'Tradition') bgColor = '#a855f7'; // Tradition (purple)

      const size = Math.min(65, Math.max(32, 28 + (n.data.degree || 1) * 3));

      elements.push({
        group: 'nodes',
        data: {
          id: n.data.id,
          label: n.data.label,
          type: type,
          bgColor: bgColor,
          size: size,
          raw: n.data
        }
      });
    });

    // Edges
    graphData.edges.forEach((e) => {
      let edgeColor = '#3b82f6'; // default blue
      const tier = e.data.evidence_tier;
      if (tier === 'Clinical Human Trial') edgeColor = '#10b981'; // green
      else if (tier === 'In-Vivo Preclinical Model') edgeColor = '#38bdf8'; // sky
      else if (tier === 'In-Vitro Experimental Bioassay') edgeColor = '#f59e0b'; // amber
      else if (tier === 'Traditional Use Report') edgeColor = '#a855f7'; // purple
      else if (tier === 'Ethnobotanical Field Observation') edgeColor = '#ec4899'; // pink

      elements.push({
        group: 'edges',
        data: {
          id: e.data.id || `${e.data.source}_${e.data.target}`,
          source: e.data.source,
          target: e.data.target,
          label: e.data.label || 'RELATED_TO',
          edgeColor: edgeColor,
          raw: e.data
        }
      });
    });

    // Cleanup previous instance
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    // Initialize Cytoscape core
    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#f8fafc',
            'font-size': '11px',
            'font-weight': 600,
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'background-color': 'data(bgColor)',
            'width': 'data(size)',
            'height': 'data(size)',
            'border-width': 2,
            'border-color': '#ffffff',
            'border-opacity': 0.8,
            'overlay-padding': 6,
            'text-background-color': '#070c19',
            'text-background-opacity': 0.8,
            'text-background-padding': '2px',
            'text-background-shape': 'roundrectangle'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#38bdf8',
            'border-opacity': 1
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': 'data(edgeColor)',
            'target-arrow-color': 'data(edgeColor)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'opacity': 0.75,
            'arrow-scale': 1.1
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'width': 4,
            'opacity': 1,
            'line-color': '#38bdf8',
            'target-arrow-color': '#38bdf8'
          }
        }
      ],
      layout: {
        name: 'cose',
        animate: false,
        nodeOverlap: 20,
        idealEdgeLength: 100,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        gravity: 80,
        numIter: 1000
      }
    });

    // Event listeners
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode(node.data('raw'));
      setSelectedEdge(null);

      // Highlight 1-hop neighborhood
      cy.elements().removeClass('dimmed');
      const neighborhood = node.neighborhood().add(node);
      cy.elements().difference(neighborhood).addClass('dimmed');
    });

    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      setSelectedEdge(edge.data('raw'));
      setSelectedNode(null);
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        setSelectedEdge(null);
        cy.elements().removeClass('dimmed');
      }
    });

    cyRef.current = cy;

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [graphData]);

  // Handle entity search in graph
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!cyRef.current || !term.trim()) return;

    const matched = cyRef.current.nodes().filter((n) => {
      const label = n.data('label') || '';
      return label.toLowerCase().includes(term.toLowerCase());
    });

    if (matched.length > 0) {
      cyRef.current.center(matched);
      cyRef.current.zoom(1.4);
      matched.select();
      setSelectedNode(matched.first().data('raw'));
    }
  };

  const handleZoomIn = () => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 1.25);
  };

  const handleZoomOut = () => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  };

  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current.elements().removeClass('dimmed');
      cyRef.current.fit(undefined, 40);
      setSelectedNode(null);
      setSelectedEdge(null);
    }
  };

  return (
    <div className="relative w-full h-[680px] bg-[#070c19] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      
      {/* Top Filter & Toolbar */}
      <div className="z-10 bg-[#0B132B]/90 backdrop-blur-md border-b border-slate-800 p-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Search input */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search plant, disease, compound..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Center: Evidence Tier Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          <select
            value={selectedEvidenceTier || ''}
            onChange={(e) => onFilterChange({ evidence_tier: e.target.value || undefined, tradition: selectedTradition })}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Evidence Tiers</option>
            <option value="Traditional Use Report">Traditional Use Report</option>
            <option value="Ethnobotanical Field Observation">Ethnobotanical Observation</option>
            <option value="In-Vitro Experimental Bioassay">In-Vitro Bioassay</option>
            <option value="In-Vivo Preclinical Model">In-Vivo Preclinical</option>
            <option value="Clinical Human Trial">Clinical Human Trial</option>
            <option value="In-Silico Prediction">In-Silico Prediction</option>
          </select>

          {/* Tradition Filter */}
          <select
            value={selectedTradition || ''}
            onChange={(e) => onFilterChange({ evidence_tier: selectedEvidenceTier, tradition: e.target.value || undefined })}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Traditions</option>
            <option value="Ayurveda">Ayurveda</option>
            <option value="Traditional Chinese Medicine">Traditional Chinese Medicine</option>
            <option value="African Traditional Medicine">African Traditional Medicine</option>
            <option value="Amazonian Ethnobotany">Amazonian Ethnobotany</option>
            <option value="European Folk Medicine">European Folk Medicine</option>
            <option value="Greco-Roman & Unani">Greco-Roman & Unani</option>
          </select>
        </div>

        {/* Right: Zoom controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomIn}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-md border border-slate-700/80"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-md border border-slate-700/80"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-md border border-slate-700/80"
            title="Fit to Screen"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 z-20 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
            <div className="flex items-center gap-2.5 text-emerald-400 text-sm">
              <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
              <span>Building Knowledge Graph...</span>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl shadow-lg text-[11px] text-slate-300 flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Plant (Accepted)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Medical Condition</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
            <span>Bioactive Compound</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 border-l border-slate-700 pl-2">
            <span>{graphData?.nodes?.length || 0} nodes</span>
            <span>•</span>
            <span>{graphData?.edges?.length || 0} edges</span>
          </div>
        </div>

        {/* Cytoscape Container */}
        <div ref={containerRef} className="w-full h-full" />

        {/* Node Detail Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 z-20 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${selectedNode.type === 'Plant' ? 'bg-emerald-500' : selectedNode.type === 'Condition' ? 'bg-rose-500' : 'bg-cyan-500'}`} />
                <span className="font-mono uppercase font-bold text-[10px] text-slate-400">{selectedNode.type}</span>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-white font-mono">{selectedNode.label}</h4>
              {selectedNode.family && (
                <p className="text-[11px] text-emerald-400 font-medium">Family: {selectedNode.family}</p>
              )}
              {selectedNode.common_names && (
                <p className="text-[11px] text-slate-400 mt-0.5">Vernacular: {selectedNode.common_names}</p>
              )}
              {selectedNode.biological_class && (
                <p className="text-[11px] text-cyan-400 mt-0.5">Class: {selectedNode.biological_class}</p>
              )}
              {selectedNode.category && (
                <p className="text-[11px] text-rose-400 mt-0.5">Category: {selectedNode.category}</p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <div className="flex justify-between py-1">
                <span>Network Degree:</span>
                <span className="font-semibold text-white">{selectedNode.degree || 1} connections</span>
              </div>
            </div>
          </div>
        )}

        {/* Edge Detail Drawer (Provenance & Evidence) */}
        {selectedEdge && (
          <div className="absolute top-4 right-4 z-20 w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-mono uppercase font-bold text-[10px] text-emerald-400">
                {selectedEdge.label || 'RELATIONSHIP'}
              </span>
              <button onClick={() => setSelectedEdge(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {selectedEdge.evidence_tier}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Confidence: {selectedEdge.confidence ? `${Math.round(selectedEdge.confidence * 100)}%` : '92%'}
                </span>
              </div>

              {selectedEdge.tradition && (
                <p className="text-[11px] text-purple-300 font-medium">Tradition: {selectedEdge.tradition}</p>
              )}
              {selectedEdge.plant_part && (
                <p className="text-[11px] text-slate-300">Organ used: {selectedEdge.plant_part} ({selectedEdge.preparation_method || 'Traditional prep'})</p>
              )}
            </div>

            {selectedEdge.excerpt && (
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-300 italic">
                "{selectedEdge.excerpt}"
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-200">{selectedEdge.document_title || 'Indexed Scientific Source'}</p>
              {selectedEdge.doi && (
                <p className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                  <span>DOI: {selectedEdge.doi}</span>
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
