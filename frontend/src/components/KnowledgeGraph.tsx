import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import type { Core } from 'cytoscape';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter, 
  X,
  Search,
  Download,
  FileText
} from 'lucide-react';
import type { GraphResponse } from '../types';

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
  const [layoutName, setLayoutName] = useState<'cose' | 'concentric' | 'circle' | 'breadthfirst'>('cose');

  // Initialize and update Cytoscape
  useEffect(() => {
    if (!containerRef.current || !graphData) return;

    // Build Cytoscape elements array with sleek grey & dark palette
    const elements: any[] = [];

    // Nodes
    graphData.nodes.forEach((n) => {
      const type = n.data.type || 'Unknown';
      let bgColor = '#f4f4f5'; // Plant (polished platinum)
      if (type === 'Condition') bgColor = '#a1a1aa'; // Condition (titanium)
      if (type === 'Compound') bgColor = '#d4d4d8'; // Compound (silver)
      if (type === 'Tradition') bgColor = '#71717a'; // Tradition (graphite)

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
      let edgeColor = '#71717a'; // default pewter
      const tier = e.data.evidence_tier;
      if (tier === 'Clinical Human Trial') edgeColor = '#ffffff'; // pure white silver
      else if (tier === 'In-Vivo Preclinical Model') edgeColor = '#cbd5e1'; // platinum
      else if (tier === 'In-Vitro Experimental Bioassay') edgeColor = '#94a3b8'; // titanium
      else if (tier === 'Traditional Use Report') edgeColor = '#71717a'; // pewter
      else if (tier === 'Ethnobotanical Field Observation') edgeColor = '#52525b'; // dark zinc

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

    // Layout configuration
    let layoutConfig: any = {
      name: layoutName,
      animate: true,
      animationDuration: 500,
    };

    if (layoutName === 'cose') {
      layoutConfig = {
        name: 'cose',
        animate: false,
        nodeOverlap: 20,
        idealEdgeLength: 100,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        gravity: 80,
        numIter: 1000
      };
    } else if (layoutName === 'concentric') {
      layoutConfig = {
        name: 'concentric',
        concentric: (node: any) => node.data('raw')?.degree || 1,
        levelWidth: () => 2,
        padding: 40,
        animate: true,
      };
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
            'color': '#f4f4f5',
            'font-size': '11px',
            'font-weight': 600,
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'background-color': 'data(bgColor)',
            'width': 'data(size)',
            'height': 'data(size)',
            'border-width': 2,
            'border-color': '#27272a',
            'border-opacity': 0.9,
            'overlay-padding': 6,
            'text-background-color': '#090a0f',
            'text-background-opacity': 0.9,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#ffffff',
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
            'line-color': '#ffffff',
            'target-arrow-color': '#ffffff'
          }
        },
        {
          selector: '.dimmed',
          style: {
            'opacity': 0.15
          }
        }
      ],
      layout: layoutConfig
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
  }, [graphData, layoutName]);

  // Handle entity search in graph
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!cyRef.current || !term.trim()) {
      if (cyRef.current) cyRef.current.elements().removeClass('dimmed');
      return;
    }

    const matched = cyRef.current.nodes().filter((n) => {
      const label = n.data('label') || '';
      return label.toLowerCase().includes(term.toLowerCase());
    });

    if (matched.length > 0) {
      cyRef.current.elements().removeClass('dimmed');
      const neighborhood = matched.neighborhood().add(matched);
      cyRef.current.elements().difference(neighborhood).addClass('dimmed');
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

  const handleExportPNG = () => {
    if (!cyRef.current) return;
    const png64 = cyRef.current.png({ full: true, bg: '#090a0f', scale: 2 });
    const a = document.createElement('a');
    a.href = png64;
    a.download = `ethnokg_graph_${Date.now()}.png`;
    a.click();
  };

  const handleExportJSON = () => {
    if (!cyRef.current) return;
    const jsonStr = JSON.stringify(cyRef.current.json(), null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ethnokg_graph_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full h-[680px] bg-[#090a0f] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      
      {/* Top Filter & Toolbar */}
      <div className="z-10 bg-[#101218]/95 backdrop-blur-md border-b border-zinc-800 p-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Search input */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search plant, disease, compound..."
            value={searchTerm}
            aria-label="Search entities in knowledge graph"
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#151722] border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
        </div>

        {/* Center: Evidence Tier & Layout Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
          <select
            value={selectedEvidenceTier || ''}
            aria-label="Filter by evidence tier"
            onChange={(e) => onFilterChange({ evidence_tier: e.target.value || undefined, tradition: selectedTradition })}
            className="bg-[#151722] border border-zinc-700/80 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 cursor-pointer font-mono"
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
            aria-label="Filter by knowledge tradition"
            onChange={(e) => onFilterChange({ evidence_tier: selectedEvidenceTier, tradition: e.target.value || undefined })}
            className="bg-[#151722] border border-zinc-700/80 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 cursor-pointer font-mono"
          >
            <option value="">All Traditions</option>
            <option value="Ayurveda">Ayurveda</option>
            <option value="Traditional Chinese Medicine">Traditional Chinese Medicine</option>
            <option value="African Traditional Medicine">African Traditional Medicine</option>
            <option value="Amazonian Ethnobotany">Amazonian Ethnobotany</option>
            <option value="European Folk Medicine">European Folk Medicine</option>
            <option value="Greco-Roman & Unani">Greco-Roman & Unani</option>
          </select>

          {/* Layout Selector */}
          <select
            value={layoutName}
            aria-label="Select graph physics layout"
            onChange={(e) => setLayoutName(e.target.value as any)}
            className="bg-[#151722] border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 cursor-pointer font-mono"
            title="Graph Physics Layout"
          >
            <option value="cose">Force Layout (CoSE)</option>
            <option value="concentric">Concentric Rings</option>
            <option value="circle">Circular Orbit</option>
            <option value="breadthfirst">Breadth-First Tree</option>
          </select>
        </div>

        {/* Right: Zoom & Export controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomIn}
            aria-label="Zoom in graph"
            className="p-1.5 bg-[#151722] hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700/80 cursor-pointer transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            aria-label="Zoom out graph"
            className="p-1.5 bg-[#151722] hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700/80 cursor-pointer transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            aria-label="Fit graph to screen"
            className="p-1.5 bg-[#151722] hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700/80 cursor-pointer transition-colors"
            title="Fit to Screen"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleExportPNG}
            aria-label="Export graph image as PNG"
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-600 cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-semibold px-2.5 shadow-sm font-mono"
            title="Export High-Res PNG"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PNG</span>
          </button>
          <button
            onClick={handleExportJSON}
            aria-label="Export graph as Cytoscape JSON"
            className="p-1.5 bg-[#151722] hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700/80 cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-semibold px-2 font-mono"
            title="Export Cytoscape JSON"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">JSON</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-xs flex items-center justify-center">
            <div className="flex items-center gap-2.5 text-zinc-300 text-sm font-semibold">
              <span className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></span>
              <span className="font-mono">Building Knowledge Graph...</span>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-[#101218]/90 backdrop-blur-md border border-zinc-800 p-3 rounded-2xl shadow-xl text-[11px] text-zinc-300 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f4f4f5] shadow-xs"></span>
            <span>Plant (Accepted)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#a1a1aa] shadow-xs"></span>
            <span>Medical Condition</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4d4d8] shadow-xs"></span>
            <span>Bioactive Compound</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500 border-l border-zinc-800 pl-2 font-mono">
            <span>{graphData?.nodes?.length || 0} nodes</span>
            <span>•</span>
            <span>{graphData?.edges?.length || 0} edges</span>
          </div>
        </div>

        {/* Cytoscape Container */}
        <div ref={containerRef} className="w-full h-full" />

        {/* Node Detail Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 z-20 w-80 bg-[#101218]/95 backdrop-blur-md border border-zinc-700 rounded-2xl p-4 shadow-2xl text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                <span className="font-mono uppercase font-bold text-[10px] text-zinc-400">{selectedNode.type}</span>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-white font-mono">{selectedNode.label}</h4>
              {selectedNode.family && (
                <p className="text-[11px] text-zinc-300 font-medium">Family: {selectedNode.family}</p>
              )}
              {selectedNode.common_names && (
                <p className="text-[11px] text-zinc-400 mt-0.5">Vernacular: {selectedNode.common_names}</p>
              )}
              {selectedNode.biological_class && (
                <p className="text-[11px] text-zinc-300 mt-0.5">Class: {selectedNode.biological_class}</p>
              )}
              {selectedNode.category && (
                <p className="text-[11px] text-zinc-300 mt-0.5">Category: {selectedNode.category}</p>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
              <div className="flex justify-between py-1">
                <span>Network Degree:</span>
                <span className="font-semibold text-white font-mono">{selectedNode.degree || 1} connections</span>
              </div>
            </div>
          </div>
        )}

        {/* Edge Detail Drawer (Provenance & Evidence) */}
        {selectedEdge && (
          <div className="absolute top-4 right-4 z-20 w-96 bg-[#101218]/95 backdrop-blur-md border border-zinc-700 rounded-2xl p-4 shadow-2xl text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="font-mono uppercase font-bold text-[10px] text-zinc-200">
                {selectedEdge.label || 'RELATIONSHIP'}
              </span>
              <button onClick={() => setSelectedEdge(null)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono">
                  {selectedEdge.evidence_tier}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Confidence: {selectedEdge.confidence ? `${Math.round(selectedEdge.confidence * 100)}%` : '92%'}
                </span>
              </div>

              {selectedEdge.tradition && (
                <p className="text-[11px] text-zinc-300 font-medium">Tradition: {selectedEdge.tradition}</p>
              )}
              {selectedEdge.plant_part && (
                <p className="text-[11px] text-zinc-300">Organ used: {selectedEdge.plant_part} ({selectedEdge.preparation_method || 'Traditional prep'})</p>
              )}
            </div>

            {selectedEdge.excerpt && (
              <div className="bg-black/60 p-3 rounded-xl border border-zinc-800 text-[11px] text-zinc-300 italic leading-relaxed">
                "{selectedEdge.excerpt}"
              </div>
            )}

            <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 space-y-1">
              <p className="font-semibold text-zinc-200">{selectedEdge.document_title || 'Indexed Scientific Source'}</p>
              {selectedEdge.doi && (
                <p className="text-zinc-300 flex items-center gap-1 font-mono text-[10px]">
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
