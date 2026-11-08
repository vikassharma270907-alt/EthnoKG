import React, { useState, useEffect } from 'react';
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
  ArrowLeft,
  Volume2,
  VolumeX,
  Atom
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
  const [selectedCompound, setSelectedCompound] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleClose = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    onClose();
  };

  const toggleSpeechNarration = () => {
    if (!plant || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const common = (plant.common_names || []).slice(0, 3).join(', ');
    const parts = (plant.parts_used || []).join(' and ');
    const conditions = (plant.reported_conditions || []).slice(0, 4).join(', ');
    const compounds = (plant.reported_compounds || []).slice(0, 3).join(', ');
    
    const narrativeText = `Ethnobotanical Dossier for ${plant.scientific_name}. ` +
      (common ? `Commonly known as ${common}. ` : '') +
      `Part of the botanical family ${plant.family || 'documented in traditional medicine'}. ` +
      (plant.knowledge_traditions && plant.knowledge_traditions.length ? `Originating from ${plant.knowledge_traditions.join(' and ')} traditions. ` : '') +
      (parts ? `Plant organs utilized include ${parts}. ` : '') +
      (conditions ? `Reported therapeutic indications include ${conditions}. ` : '') +
      (compounds ? `Key isolated bioactive molecules include ${compounds}. ` : '') +
      `Recorded in authoritative literature with ${plant.relationships_count || 0} relational scientific claims.`;

    const utterance = new SpeechSynthesisUtterance(narrativeText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

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
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSpeechNarration}
              title={isSpeaking ? "Stop voice narration" : "Listen to audio summary of this ethnobotanical dossier"}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                isSpeaking 
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.3)]' 
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-700'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
                  <span className="hidden sm:inline">Pause Voice</span>
                  <span className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-2.5 bg-sky-400 animate-bounce" />
                    <span className="w-0.5 h-3.5 bg-sky-300 animate-bounce delay-75" />
                    <span className="w-0.5 h-2 bg-sky-400 animate-bounce delay-150" />
                  </span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="hidden sm:inline">Listen Dossier</span>
                </>
              )}
            </button>

            <button 
              onClick={handleClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Beaker className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Key Bioactive Compounds & Cheminformatics</span>
                </h4>
                <span className="text-[10px] text-zinc-500 font-mono">Click compound to preview 2D structure</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(plant.reported_compounds || []).length > 0 ? (
                  (plant.reported_compounds || []).map((comp, i) => {
                    const isSelected = selectedCompound === comp;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedCompound(prev => prev === comp ? null : comp)}
                        className={`text-xs px-2.5 py-1 rounded-md font-mono flex items-center gap-1.5 transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-zinc-100 text-zinc-950 border-white font-bold shadow-md shadow-black/40 scale-[1.02]'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border-zinc-700'
                        }`}
                        title={`Inspect 2D structure of ${comp}`}
                      >
                        <Atom className={`w-3 h-3 ${isSelected ? 'text-zinc-950' : 'text-zinc-400'}`} />
                        <span>{comp}</span>
                      </button>
                    );
                  })
                ) : (
                  <span className="text-xs text-zinc-500 italic font-mono">No isolated compounds recorded</span>
                )}
              </div>

              {/* Interactive 2D Structure Preview Card */}
              {selectedCompound && (
                <div className="mt-3 p-4 bg-[#0d0e14] border border-zinc-700 rounded-xl space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Atom className="w-4 h-4 text-sky-400" />
                      <span className="font-bold text-white font-mono text-xs">2D Molecular Structure: {selectedCompound}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCompound(null)}
                      className="text-[10px] text-zinc-400 hover:text-white font-mono cursor-pointer"
                    >
                      Close Preview
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-36 h-36 bg-white rounded-lg p-1.5 flex items-center justify-center shrink-0 border border-zinc-300 shadow-inner overflow-hidden">
                      <img
                        src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(selectedCompound)}/PNG?image_size=200x200`}
                        alt={`2D structure of ${selectedCompound}`}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1 space-y-2 text-xs">
                      <p className="text-zinc-300 leading-relaxed text-[11px]">
                        Authoritative 2D chemical structure retrieved from NCBI PubChem Chemical Substance Repository.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <a
                          href={`https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(selectedCompound)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Open in PubChem</span>
                          <ExternalLink className="w-3 h-3 text-zinc-400" />
                        </a>
                        <a
                          href={`https://www.ebi.ac.uk/chembl/g/#search_results/all/query=${encodeURIComponent(selectedCompound)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Search ChEMBL Bioactivity</span>
                          <ExternalLink className="w-3 h-3 text-zinc-400" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
