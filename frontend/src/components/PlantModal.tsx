import React from 'react';
import { X, Leaf, ExternalLink, Layers, Beaker } from 'lucide-react';
import type { PlantDetail } from '../types';

interface PlantModalProps {
  plant: PlantDetail | null;
  onClose: () => void;
}

export const PlantModal: React.FC<PlantModalProps> = ({ plant, onClose }) => {
  if (!plant) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0B132B] border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-slate-200">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#0B132B]/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-mono">{plant.scientific_name}</h3>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  {plant.taxonomic_status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Family: <span className="text-emerald-300 font-medium">{plant.family || 'Unknown'}</span> | Genus: <span className="text-slate-300">{plant.genus}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Common Names & Synonyms */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Vernacular & Historical Synonyms</h4>
            <div className="flex flex-wrap gap-1.5">
              {plant.common_names.map((cn, i) => (
                <span key={i} className="text-xs bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-md text-slate-200">
                  {cn}
                </span>
              ))}
              {plant.synonyms.map((s, i) => (
                <span key={`syn_${i}`} className="text-xs bg-slate-800/40 border border-slate-700/60 px-2.5 py-1 rounded-md text-slate-400 italic">
                  {s.synonym_name} ({s.synonym_type})
                </span>
              ))}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">Relations</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">{plant.relationships_count}</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">Conditions</span>
              <span className="text-lg font-bold text-rose-400 font-mono">{plant.reported_conditions.length}</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">Compounds</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">{plant.reported_compounds.length}</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">Publications</span>
              <span className="text-lg font-bold text-purple-400 font-mono">{plant.supporting_publications.length}</span>
            </div>
          </div>

          {/* Organs & Preparations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Plant Parts Documented</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {plant.parts_used.length > 0 ? (
                  plant.parts_used.map((part, i) => (
                    <span key={i} className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">
                      {part}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">Leaves and aerial parts</span>
                )}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Beaker className="w-4 h-4 text-cyan-400" />
                <span>Preparation Methods</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {plant.preparation_methods.length > 0 ? (
                  plant.preparation_methods.map((prep, i) => (
                    <span key={i} className="text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded">
                      {prep}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">Decoction / Infusion</span>
                )}
              </div>
            </div>
          </div>

          {/* Reported Conditions & Compounds */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Reported Health Indications</h4>
              <div className="flex flex-wrap gap-1.5">
                {plant.reported_conditions.map((cond, i) => (
                  <span key={i} className="text-xs bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2.5 py-1 rounded-md">
                    {cond}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Key Bioactive Compounds</h4>
              <div className="flex flex-wrap gap-1.5">
                {plant.reported_compounds.map((comp, i) => (
                  <span key={i} className="text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2.5 py-1 rounded-md font-mono">
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Supporting Publications */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Supporting Scientific Publications</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {plant.supporting_publications.map((pub, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-xs space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-white">{pub.title}</p>
                    {pub.doi && (
                      <a 
                        href={`https://doi.org/${pub.doi}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {pub.authors} ({pub.year || 'n.d.'}) — <span className="italic">{pub.journal || 'Indexed Archive'}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-900/80 px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
};
