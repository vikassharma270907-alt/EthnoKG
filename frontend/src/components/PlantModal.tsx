import React, { useState } from 'react';
import { 
  X, 
  Leaf, 
  ExternalLink, 
  Layers, 
  Beaker, 
  ShieldCheck, 
  FileCheck2,
  Printer,
  Copy,
  Download,
  ArrowLeft
} from 'lucide-react';
import type { PlantDetail, SovereigntyCertificate } from '../types';
import { fetchSovereigntyCertificate } from '../api/client';

interface PlantModalProps {
  plant: PlantDetail | null;
  onClose: () => void;
}

export const PlantModal: React.FC<PlantModalProps> = ({ plant, onClose }) => {
  const [isLoadingCert, setIsLoadingCert] = useState(false);
  const [activeCert, setActiveCert] = useState<SovereigntyCertificate | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  if (!plant) return null;

  const handleOpenCert = async () => {
    setIsLoadingCert(true);
    try {
      const c = await fetchSovereigntyCertificate(plant.id);
      setActiveCert(c);
    } catch (err) {
      console.error('Failed to generate certificate:', err);
    } finally {
      setIsLoadingCert(false);
    }
  };

  const handleDownloadCert = (c: SovereigntyCertificate) => {
    const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${c.certificate_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#101218] border border-zinc-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-zinc-200">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#101218]/95 backdrop-blur-md px-6 py-4 border-b border-zinc-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-200">
              <Leaf className="w-5 h-5 text-zinc-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-mono">{plant.scientific_name}</h3>
                <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-200 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
                  {plant.taxonomic_status}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Family: <span className="text-zinc-200 font-medium">{plant.family || 'Unknown'}</span> | Genus: <span className="text-zinc-300">{plant.genus}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {/* Modal Body: Either Certificate View or Standard Plant Dossier */}
        {activeCert ? (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <button
                onClick={() => setActiveCert(null)}
                className="text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 font-mono cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Plant Dossier</span>
              </button>
              <span className="text-[10px] font-mono font-bold bg-zinc-800 text-zinc-200 border border-zinc-700 px-2 py-0.5 rounded-full">
                UN CBD Article 8(j) Validated
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-[#151722] p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Certificate ID:</span>
                  <span className="font-mono text-white font-bold">{activeCert.certificate_id}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Botanical Binomial:</span>
                  <span className="font-mono text-white italic font-bold">{activeCert.scientific_name}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Originating Traditions:</span>
                  <span className="text-zinc-200 font-semibold">{(activeCert.certificate.originating_traditions || []).join(', ')}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>IUCN Red List Status:</span>
                  <span className="text-zinc-300 font-semibold">{activeCert.certificate.iucn_red_list_status}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>CITES Category:</span>
                  <span className="text-zinc-300 font-semibold">{activeCert.certificate.cites_trade_category}</span>
                </div>
              </div>

              {/* SHA-256 Provenance Fingerprint */}
              <div className="bg-zinc-900 border border-zinc-700 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-200 flex items-center gap-1.5 font-mono">
                    <FileCheck2 className="w-3.5 h-3.5 text-zinc-300" />
                    Cryptographic SHA-256 Provenance Fingerprint:
                  </span>
                  <button
                    onClick={() => handleCopyHash(activeCert.sha256_provenance_hash)}
                    className="text-[10px] text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer font-mono"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedHash ? 'Copied!' : 'Copy Hash'}
                  </button>
                </div>
                <p className="font-mono text-[10px] text-zinc-300 break-all bg-black/60 p-2 rounded border border-zinc-800">
                  {activeCert.sha256_provenance_hash}
                </p>
              </div>

              <p className="text-[11px] text-zinc-400 bg-[#151722] p-3 rounded-lg border border-zinc-800 leading-relaxed">
                <strong className="text-zinc-200">Legal Benefit-Sharing Guarantee:</strong> In accordance with UN CBD Article 8(j) and the Nagoya Protocol, 
                any industrial or commercial application derived from this record must adhere to Prior Informed Consent (PIC) 
                and Mutually Agreed Terms (MAT) with the originating indigenous custodians.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-[#151722] hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer font-mono"
              >
                <Printer className="w-3.5 h-3.5 text-zinc-300" />
                <span>Print / PDF</span>
              </button>
              <button
                onClick={() => handleDownloadCert(activeCert)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-zinc-200 to-white hover:from-white hover:to-zinc-200 text-zinc-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-black/40 cursor-pointer font-mono"
              >
                <Download className="w-3.5 h-3.5 text-zinc-900" />
                <span>Download JSON</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
          
          {/* Common Names & Synonyms */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">Vernacular & Historical Synonyms</h4>
            <div className="flex flex-wrap gap-1.5">
              {(plant.common_names || []).map((cn, i) => (
                <span key={i} className="text-xs bg-[#151722] border border-zinc-700 px-2.5 py-1 rounded-md text-zinc-200">
                  {cn}
                </span>
              ))}
              {(plant.synonyms || []).map((s, i) => (
                <span key={`syn_${i}`} className="text-xs bg-[#151722]/60 border border-zinc-800 px-2.5 py-1 rounded-md text-zinc-400 italic">
                  {s.synonym_name} ({s.synonym_type})
                </span>
              ))}
            </div>
          </div>

          {/* Quick Metrics in Monochromatic Titanium */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-[#151722] border border-zinc-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase text-zinc-400 font-semibold block font-mono">Relations</span>
              <span className="text-lg font-bold text-white font-mono">{plant.relationships_count ?? 0}</span>
            </div>
            <div className="bg-[#151722] border border-zinc-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase text-zinc-400 font-semibold block font-mono">Conditions</span>
              <span className="text-lg font-bold text-zinc-200 font-mono">{(plant.reported_conditions || []).length}</span>
            </div>
            <div className="bg-[#151722] border border-zinc-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase text-zinc-400 font-semibold block font-mono">Compounds</span>
              <span className="text-lg font-bold text-zinc-300 font-mono">{(plant.reported_compounds || []).length}</span>
            </div>
            <div className="bg-[#151722] border border-zinc-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase text-zinc-400 font-semibold block font-mono">Publications</span>
              <span className="text-lg font-bold text-zinc-100 font-mono">{(plant.supporting_publications || []).length}</span>
            </div>
          </div>

          {/* Organs & Preparations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#151722] border border-zinc-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 font-mono">
                <Layers className="w-4 h-4 text-zinc-300" />
                <span>Plant Parts Documented</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(plant.parts_used || []).length > 0 ? (
                  (plant.parts_used || []).map((part, i) => (
                    <span key={i} className="text-xs bg-zinc-800 text-zinc-200 border border-zinc-700 px-2 py-0.5 rounded">
                      {part}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500 italic">Leaves and aerial parts</span>
                )}
              </div>
            </div>

            <div className="bg-[#151722] border border-zinc-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 font-mono">
                <Beaker className="w-4 h-4 text-zinc-300" />
                <span>Preparation Methods</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(plant.preparation_methods || []).length > 0 ? (
                  (plant.preparation_methods || []).map((prep, i) => (
                    <span key={i} className="text-xs bg-zinc-800 text-zinc-200 border border-zinc-700 px-2 py-0.5 rounded">
                      {prep}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500 italic">Decoction / Infusion</span>
                )}
              </div>
            </div>
          </div>

          {/* Reported Conditions & Compounds */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">Reported Health Indications</h4>
              <div className="flex flex-wrap gap-1.5">
                {(plant.reported_conditions || []).map((cond, i) => (
                  <span key={i} className="text-xs bg-zinc-900 text-zinc-200 border border-zinc-700 px-2.5 py-1 rounded-md">
                    {cond}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">Key Bioactive Compounds</h4>
              <div className="flex flex-wrap gap-1.5">
                {(plant.reported_compounds || []).map((comp, i) => (
                  <span key={i} className="text-xs bg-zinc-800 text-zinc-200 border border-zinc-700 px-2.5 py-1 rounded-md font-mono">
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Supporting Publications */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">Supporting Scientific Publications</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(plant.supporting_publications || []).map((pub, i) => (
                <div key={i} className="bg-[#151722] border border-zinc-800 p-3 rounded-lg text-xs space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-white">{pub.title}</p>
                    {pub.doi && (
                      <a 
                        href={`https://doi.org/${pub.doi}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-zinc-300 hover:text-white shrink-0 font-mono text-[11px]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {pub.authors} ({pub.year || 'n.d.'}) — <span className="italic">{pub.journal || 'Indexed Archive'}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          </div>
        )}

        {/* Footer */}
        <div className="bg-[#151722] px-6 py-3 border-t border-zinc-800 flex items-center justify-between">
          {!activeCert ? (
            <button
              onClick={handleOpenCert}
              disabled={isLoadingCert}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 font-mono"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
              <span>
                {isLoadingCert ? 'Generating...' : 'View Nagoya ABS Certificate'}
              </span>
            </button>
          ) : (
            <span className="text-[11px] text-zinc-400 font-mono">
              Certificate Authority: EthnoKG Nagoya Protocol Registry
            </span>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors cursor-pointer font-mono"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
};
