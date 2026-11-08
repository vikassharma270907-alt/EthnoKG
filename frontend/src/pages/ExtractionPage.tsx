import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Layers, 
  Beaker, 
  BookOpen, 
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { runExtraction, uploadDocument, fetchDocuments } from '../api/client';
import { DocumentBrief, ExtractionRecord, ExtractionRunResponse } from '../types';

interface ExtractionPageProps {
  setActiveTab: (tab: string) => void;
  onExtractionComplete?: () => void;
}

export const ExtractionPage: React.FC<ExtractionPageProps> = ({ setActiveTab, onExtractionComplete }) => {
  const [mode, setMode] = useState<'sample' | 'upload' | 'text' | 'url'>('sample');
  const [indexedDocs, setIndexedDocs] = useState<DocumentBrief[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  
  // Custom text input
  const [textInput, setTextInput] = useState('');
  const [docTitleInput, setDocTitleInput] = useState('');
  
  // File upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState('');

  // Execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionRunResponse | null>(null);

  // Load indexed documents on mount
  useEffect(() => {
    fetchDocuments(0, 20).then((docs) => {
      setIndexedDocs(docs);
      if (docs.length > 0) setSelectedDocId(docs[0].id);
    }).catch(console.error);
  }, []);

  const handleRunSample = async () => {
    if (!selectedDocId) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await runExtraction({ document_id: selectedDocId });
      setExtractionResult(res);
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
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white font-mono">AI Literature Mining Engine</h1>
          <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
            12-Stage Pipeline
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Ingest scientific papers, historical treatises, or ethnobotanical survey texts to extract standardized botanical taxa, ailments, bioactive compounds, and evidence tiers.
        </p>
      </div>

      {/* Input Mode Selector Tabs */}
      <div className="bg-[#070c19] border border-slate-800 p-1.5 rounded-xl flex flex-wrap gap-1.5 max-w-2xl">
        <button
          onClick={() => { setMode('sample'); setErrorMsg(null); }}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
            mode === 'sample' 
              ? 'bg-emerald-600 text-slate-950 shadow-md' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Indexed Corpus</span>
        </button>

        <button
          onClick={() => { setMode('upload'); setErrorMsg(null); }}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
            mode === 'upload' 
              ? 'bg-emerald-600 text-slate-950 shadow-md' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload PDF / TXT</span>
        </button>

        <button
          onClick={() => { setMode('text'); setErrorMsg(null); }}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
            mode === 'text' 
              ? 'bg-emerald-600 text-slate-950 shadow-md' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Enter Raw Text</span>
        </button>
      </div>

      {/* Input Configuration Box */}
      <div className="bg-[#070c19] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        
        {/* Mode 1: Indexed Literature Collection */}
        {mode === 'sample' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select from Indexed Literature Collection
              </label>
              <select
                value={selectedDocId || ''}
                onChange={(e) => setSelectedDocId(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {indexedDocs.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title} ({doc.authors}, {doc.publication_year || 'n.d.'})
                  </option>
                ))}
              </select>
            </div>

            {selectedDocId && (
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Selected Source Document:</span>
                <p className="font-semibold text-white">
                  {indexedDocs.find((d) => d.id === selectedDocId)?.title}
                </p>
                <p className="text-[11px] text-slate-400 italic">
                  DOI: {indexedDocs.find((d) => d.id === selectedDocId)?.doi || 'Indexed Local Archive'} | License: CC-BY 4.0 Open Access
                </p>
              </div>
            )}

            <button
              onClick={handleRunSample}
              disabled={isProcessing}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing 12-Stage Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Document Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Ethnobotanical survey of antipyretic plants..."
                value={docTitleInput}
                onChange={(e) => setDocTitleInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl p-8 text-center transition-colors bg-slate-950/40">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-200 font-medium">Click to select or drag PDF / TXT research paper</p>
              <p className="text-[11px] text-slate-500 mt-1">Supports full-text open-access papers, surveys, and monographs</p>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="mt-3 text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer"
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
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Parsing Document & Extracting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload & Run Mining Pipeline</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Mode 3: Direct Text Input */}
        {mode === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Paste Ethnopharmacological Text Excerpt
              </label>
              <textarea
                rows={6}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste paragraph containing plant name, traditional preparation, ailment, or bioassay results (e.g. 'In Ayurveda, root decoctions of Withania somnifera are prescribed for debility...')."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed font-mono"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">{textInput.length} characters</span>
              <button
                onClick={() => setTextInput("In Traditional Chinese Medicine, cold water infusions of the aerial parts of Artemisia annua L. were traditionally prescribed to treat intermittent fevers and malaria. Recent in vitro bioassays confirmed that artemisinin exhibits potent inhibition against Plasmodium falciparum with IC50 under 10 nM.")}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                Insert Sample Text (Artemisia annua)
              </button>
            </div>

            <button
              onClick={handleRunText}
              disabled={isProcessing || !textInput.trim()}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mining Text...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Mining Pipeline</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

      </div>

      {/* Extraction Results Display */}
      {extractionResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <span>Extracted Structured Knowledge</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  {extractionResult.extracted_count} Claims Identified
                </span>
              </h2>
              <p className="text-xs text-slate-400">Source: {extractionResult.document_title}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('verification')}
                className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Open Verification Queue</span>
              </button>
              <button
                onClick={() => setActiveTab('graph')}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5"
              >
                <span>View in Graph</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Cards for each record */}
          <div className="grid grid-cols-1 gap-4">
            {extractionResult.results.map((rec, idx) => (
              <div 
                key={idx}
                className="bg-[#070c19] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">{rec.scientific_name}</span>
                    {rec.plant_synonyms.length > 0 && (
                      <span className="text-xs text-slate-400 italic">({rec.plant_synonyms.slice(0, 2).join(', ')})</span>
                    )}
                    <span className="text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">
                      {rec.knowledge_tradition}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded">
                      {rec.evidence_category}
                    </span>
                    <span className="text-xs font-mono text-cyan-400 font-semibold">
                      Confidence: {Math.round(rec.extraction_confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">Indication / Condition</span>
                    <span className="font-semibold text-rose-400">{rec.medical_condition}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">Organ & Preparation</span>
                    <span className="text-slate-300">{rec.plant_part} | {rec.preparation_method}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">Bioactive Compounds</span>
                    <span className="font-mono text-cyan-400">{rec.bioactive_compounds.join(', ') || 'Metabolite fraction'}</span>
                  </div>
                </div>

                {/* Verbatim Supporting Excerpt */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                    Verbatim Supporting Source Excerpt:
                  </span>
                  <p className="text-slate-300 italic leading-relaxed">
                    "{rec.supporting_excerpt}"
                  </p>
                </div>

                {/* Provenance footer */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Section: {rec.page_or_section || 'Results section'}</span>
                  <span>Verification Status: <strong className="text-amber-400 uppercase font-mono">{rec.verification_status}</strong></span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
