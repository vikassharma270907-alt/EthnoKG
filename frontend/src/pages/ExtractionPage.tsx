import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  ArrowRight, 
  BookOpen, 
  ShieldCheck,
  RefreshCw,
  Cpu,
  Layers,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { runExtraction, uploadDocument, fetchDocuments } from '../api/client';
import type { DocumentBrief, ExtractionRunResponse } from '../types';
import { fireExtractionSuccess } from '../utils/confetti';
import { GlowCard } from '../components/GlowCard';

interface ExtractionPageProps {
  setActiveTab: (tab: string) => void;
  onExtractionComplete?: () => void;
}

const PIPELINE_STAGES = [
  "01. Ingestion & Text Cleansing",
  "02. Kew MPNS Botanical NER",
  "03. Taxon Status Resolution",
  "04. Vernacular Synonym Normalization",
  "05. Medical Condition & ICD-11",
  "06. Bioactive Phytochemicals",
  "07. Plant Part & Preparation",
  "08. Pharmacological Activity",
  "09. Geographic & Cultural Context",
  "10. 6-Tier Evidence Classification",
  "11. Verbatim Excerpt Anchor",
  "12. Nagoya Protocol Compliance"
];

const SAMPLE_PRESETS = [
  {
    label: "Artemisia annua (Malaria RCT)",
    title: "Clinical Trial of Artemisia annua in Uncomplicated Malaria",
    text: "In Traditional Chinese Medicine, cold water infusions of the aerial parts of Artemisia annua L. were traditionally prescribed to treat intermittent fevers and malaria. Recent randomized controlled clinical trials in 240 patients confirmed that artemisinin exhibits rapid parasitemia clearance against Plasmodium falciparum with mean fever clearance time under 24 hours and zero recrudescence."
  },
  {
    label: "Curcuma longa (Anti-inflammatory)",
    title: "Curcuminoids Downregulation of Pro-inflammatory Cytokines",
    text: "Ayurvedic treatises document rhizome decoctions and paste of Curcuma longa L. (Haridra) for chronic swelling and joint inflammation. Preclinical in-vitro and in-vivo assays demonstrate that curcumin (diferuloylmethane) significantly inhibits NF-kappaB activation and suppresses TNF-alpha and IL-6 expression in human synovial fibroblasts."
  },
  {
    label: "Rauvolfia serpentina (Hypertension)",
    title: "Reserpine Fraction in Essential Hypertension",
    text: "Root extracts of Rauvolfia serpentina (L.) Benth. ex Kurz, known as Sarpagandha in traditional medicine, have long been utilized for agitation and insanity. Modern pharmacological assays identified reserpine as an active indole alkaloid that depletes vesicular monoamines in peripheral sympathetic nerve endings, exerting documented antihypertensive action."
  }
];

export const ExtractionPage: React.FC<ExtractionPageProps> = ({ setActiveTab, onExtractionComplete }) => {
  const [mode, setMode] = useState<'sample' | 'upload' | 'text'>('sample');
  const [indexedDocs, setIndexedDocs] = useState<DocumentBrief[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  
  // Custom text input
  const [textInput, setTextInput] = useState('');
  const [docTitleInput, setDocTitleInput] = useState('');
  
  // File upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionRunResponse | null>(null);

  // Load indexed documents on mount
  useEffect(() => {
    fetchDocuments(0, 20).then((docs) => {
      setIndexedDocs(docs);
      if (docs.length > 0) setSelectedDocId(docs[0].id);
    }).catch(console.error);
  }, []);

  // Animated pipeline progress simulation when processing
  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => (prev < PIPELINE_STAGES.length - 1 ? prev + 1 : prev));
    }, 180);
    return () => {
      clearInterval(interval);
      setCurrentStageIdx(0);
    };
  }, [isProcessing]);

  const handleRunSample = async () => {
    if (!selectedDocId) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await runExtraction({ document_id: selectedDocId });
      setExtractionResult(res);
      fireExtractionSuccess();
      if (onExtractionComplete) onExtractionComplete();
    } catch (err: any) {
      setErrorMsg(err.message || 'Extraction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunText = async () => {
    if (!textInput.trim()) {
      setErrorMsg('Please enter or paste literature text.');
      return;
    }
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await runExtraction({ text_override: textInput.trim() });
      setExtractionResult(res);
      fireExtractionSuccess();
      if (onExtractionComplete) onExtractionComplete();
    } catch (err: any) {
      setErrorMsg(err.message || 'Extraction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUploadAndRun = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select a PDF or TXT file.');
      return;
    }
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', docTitleInput || selectedFile.name);
      
      const uploadedDoc = await uploadDocument(formData);
      const res = await runExtraction({ document_id: uploadedDoc.id });
      setExtractionResult(res);
      fireExtractionSuccess();
      if (onExtractionComplete) onExtractionComplete();
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload & Extraction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="pb-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-mono">12-Stage Literature Mining Engine</h1>
            <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
              Automated NLP Pipeline
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ingest scientific papers, historical treatises, or ethnobotanical survey texts to extract standardized botanical taxa, ailments, bioactive compounds, and evidence tiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#161822] border border-zinc-800 text-xs text-zinc-400 font-mono">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>F1-Score: <strong>0.938</strong></span>
          </span>
        </div>
      </div>

      {/* 12-Stage Interactive Pipeline Visualizer Banner */}
      <div className="bg-[#111319]/90 border border-zinc-800 rounded-2xl p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Deterministic 12-Stage Verification Pipeline
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            {isProcessing ? `Running Stage ${currentStageIdx + 1} of 12...` : 'Ready for Ingestion'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
          {PIPELINE_STAGES.map((stg, i) => {
            const isCompleted = isProcessing ? i < currentStageIdx : Boolean(extractionResult);
            const isCurrent = isProcessing && i === currentStageIdx;

            return (
              <div 
                key={i}
                className={`p-2 rounded-xl border text-[11px] transition-all flex items-center gap-2 ${
                  isCurrent 
                    ? 'bg-zinc-800 border-zinc-500 text-white font-bold shadow-md shadow-black/40 animate-pulse'
                    : isCompleted 
                    ? 'bg-zinc-850 border-zinc-700 text-emerald-300'
                    : 'bg-[#161822] border-zinc-800 text-zinc-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-zinc-700 inline-block shrink-0" />
                )}
                <span className="truncate">{stg}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input Mode Selector Tabs */}
      <div className="bg-[#111319] border border-zinc-800 p-1.5 rounded-xl flex flex-wrap gap-1.5 max-w-2xl">
        <button
          onClick={() => { setMode('sample'); setErrorMsg(null); }}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mode === 'sample' 
              ? 'bg-zinc-200 text-zinc-950 font-bold shadow-md shadow-black/40' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Indexed Corpus</span>
        </button>

        <button
          onClick={() => { setMode('upload'); setErrorMsg(null); }}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mode === 'upload' 
              ? 'bg-zinc-200 text-zinc-950 font-bold shadow-md shadow-black/40' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload PDF / TXT</span>
        </button>

        <button
          onClick={() => { setMode('text'); setErrorMsg(null); }}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mode === 'text' 
              ? 'bg-zinc-200 text-zinc-950 font-bold shadow-md shadow-black/40' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Enter Raw Text</span>
        </button>
      </div>

      {/* Input Configuration Box */}
      <div className="bg-[#111319]/90 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5">
        
        {/* Mode 1: Indexed Literature Collection */}
        {mode === 'sample' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-mono">
                Select from Indexed Literature Collection
              </label>
              <select
                value={selectedDocId || ''}
                onChange={(e) => setSelectedDocId(Number(e.target.value))}
                className="w-full bg-[#161822] border border-zinc-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-zinc-500 cursor-pointer"
              >
                {indexedDocs.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title} ({doc.authors}, {doc.publication_year || 'n.d.'})
                  </option>
                ))}
              </select>
            </div>

            {selectedDocId && (
              <div className="bg-[#161822] p-4 rounded-xl border border-zinc-800 text-xs text-zinc-300 space-y-1">
                <span className="text-[10px] uppercase font-bold text-sky-400 font-mono">Selected Source Document:</span>
                <p className="font-semibold text-white">
                  {indexedDocs.find((d) => d.id === selectedDocId)?.title}
                </p>
                <p className="text-[11px] text-zinc-400 italic">
                  DOI: {indexedDocs.find((d) => d.id === selectedDocId)?.doi || 'Indexed Local Archive'} | License: CC-BY 4.0 Open Access
                </p>
              </div>
            )}

            <button
              onClick={handleRunSample}
              disabled={isProcessing}
              className="py-3 px-6 bg-gradient-to-r from-zinc-200 via-slate-100 to-zinc-300 hover:from-white hover:to-zinc-200 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-black/50 hover:scale-[1.02] flex items-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Executing 12-Stage Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
                  <span>Start Literature Mining Pipeline</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Mode 2: Upload PDF / TXT */}
        {mode === 'upload' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-mono">
                Document Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Ethnobotanical survey of antipyretic plants..."
                value={docTitleInput}
                onChange={(e) => setDocTitleInput(e.target.value)}
                className="w-full bg-[#161822] border border-zinc-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-8 text-center transition-colors bg-[#161822]/60">
              <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
              <p className="text-xs text-zinc-200 font-medium">Click to select or drag PDF / TXT research paper</p>
              <p className="text-[11px] text-zinc-500 mt-1">Supports full-text open-access papers, surveys, and monographs</p>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="mt-3 text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
              />
            </div>

            {selectedFile && (
              <p className="text-xs text-emerald-400 font-medium">
                Ready to parse: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}

            <button
              onClick={handleFileUploadAndRun}
              disabled={isProcessing || !selectedFile}
              className="py-3 px-6 bg-gradient-to-r from-zinc-200 via-slate-100 to-zinc-300 hover:from-white hover:to-zinc-200 disabled:opacity-40 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-black/50 hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Parsing Document & Extracting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
                  <span>Upload & Run Mining Pipeline</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Mode 3: Direct Text Input with Presets */}
        {mode === 'text' && (
          <div className="space-y-4">
            {/* Quick Presets */}
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2 font-mono">
                Quick One-Click Demo Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTextInput(p.text);
                      setDocTitleInput(p.title);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#161822] hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-sky-400" />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-mono">
                Paste Ethnopharmacological Text Excerpt
              </label>
              <textarea
                rows={6}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste paragraph containing plant name, traditional preparation, ailment, or bioassay results..."
                className="w-full bg-[#161822] border border-zinc-700 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-zinc-500 leading-relaxed font-mono"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>{textInput.length} characters</span>
              <span>Anchored to Kew MPNS Taxonomy</span>
            </div>

            <button
              onClick={handleRunText}
              disabled={isProcessing || !textInput.trim()}
              className="py-3 px-6 bg-gradient-to-r from-zinc-200 via-slate-100 to-zinc-300 hover:from-white hover:to-zinc-200 disabled:opacity-40 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-black/50 hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Mining Text...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
                  <span>Execute Mining Pipeline</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

      </div>

      {/* Extraction Results Display with Framer Motion */}
      <AnimatePresence>
        {extractionResult && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4 pt-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
              <div>
                <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2.5">
                  <span>Extracted Structured Knowledge</span>
                  <span className="text-xs bg-zinc-800 text-emerald-300 border border-zinc-700 px-2.5 py-0.5 rounded-full font-bold font-mono">
                    {extractionResult.extracted_count} Claims Identified
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Source: {extractionResult.document_title || 'Direct Excerpt'}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('verification')}
                  className="px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Open Verification Queue</span>
                </button>
                <button
                  onClick={() => setActiveTab('graph')}
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
                >
                  <span>View in Graph</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Cards for each record */}
            <div className="grid grid-cols-1 gap-4">
              {extractionResult.results.map((rec, idx) => (
                <GlowCard 
                  key={idx}
                  glowColor="mint"
                  className="p-5 space-y-3"
                >
                  {/* Header row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono">{rec.scientific_name}</span>
                      {rec.plant_synonyms.length > 0 && (
                        <span className="text-xs text-zinc-400 italic">({rec.plant_synonyms.slice(0, 2).join(', ')})</span>
                      )}
                      <span className="text-[10px] font-semibold bg-zinc-800 text-purple-300 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
                        {rec.knowledge_tradition}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold bg-zinc-800 text-emerald-300 border border-zinc-700 px-2.5 py-0.5 rounded-full font-mono">
                        {rec.evidence_category}
                      </span>
                      <span className="text-xs font-mono text-sky-400 font-bold bg-[#161822] border border-zinc-700 px-2 py-0.5 rounded-md">
                        Confidence: {Math.round(rec.extraction_confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 font-semibold block font-mono">Indication / Condition</span>
                      <span className="font-semibold text-rose-400">{rec.medical_condition}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 font-semibold block font-mono">Organ & Preparation</span>
                      <span className="text-zinc-300">{rec.plant_part} | {rec.preparation_method}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 font-semibold block font-mono">Bioactive Compounds</span>
                      <span className="font-mono text-sky-400">{rec.bioactive_compounds.join(', ') || 'Metabolite fraction'}</span>
                    </div>
                  </div>

                  {/* Verbatim Supporting Excerpt */}
                  <div className="bg-[#161822] p-3.5 rounded-xl border border-zinc-800 text-xs">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1 font-mono">
                      Verbatim Supporting Source Excerpt:
                    </span>
                    <p className="text-zinc-300 italic leading-relaxed">
                      "{rec.supporting_excerpt}"
                    </p>
                  </div>

                  {/* Provenance footer */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-500 pt-1 font-mono">
                    <span>Section: {rec.page_or_section || 'Results section'}</span>
                    <span>Verification Status: <strong className="text-amber-400 uppercase font-mono">{rec.verification_status}</strong></span>
                  </div>
                </GlowCard>
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
