import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  ExternalLink, 
  ShieldAlert, 
  RefreshCw,
  Quote,
  Clock,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { queryAssistant } from '../api/client';
import type { AssistantQueryResponse } from '../types';
import { WaveformPulse } from '../components/WaveformPulse';

export const AssistantPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [response, setResponse] = useState<AssistantQueryResponse | null>(null);
  const [history, setHistory] = useState<Array<{ q: string; a: AssistantQueryResponse }>>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedAnswer, setCopiedAnswer] = useState(false);

  const sampleQuestions = [
    "What plants have documented traditional uses associated with fever and malaria?",
    "Which species have clinical evidence for stress and anxiety in Ayurveda?",
    "What bioactive compounds are reported for Artemisia annua?",
    "Which traditional-use claims have supporting in-vitro experimental literature?",
    "Tell me about the traditional uses and active compounds in Curcuma longa."
  ];

  const handleAsk = async (qText?: string) => {
    if (isQuerying) return;
    const q = (qText || question).trim();
    if (!q) return;

    setIsQuerying(true);
    setErrorMsg(null);
    try {
      const res = await queryAssistant(q);
      setResponse(res);
      setHistory((prev) => [{ q, a: res }, ...prev.slice(0, 5)]);
      if (!qText) setQuestion('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to query assistant. Please check backend connection.');
    } finally {
      setIsQuerying(false);
    }
  };

  const handleCopyAnswer = () => {
    if (!response) return;
    navigator.clipboard.writeText(response.answer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-sky-400" />
              <span>Grounded Research Assistant</span>
            </h1>
            <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
              Zero-Hallucination RAG
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ask questions against indexed ethnobotanical papers. The assistant cites exact source excerpts, reports evidence tiers, and enforces strict zero-hallucination.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <WaveformPulse isStreaming={isQuerying} />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kew Taxa Grounded</span>
          </span>
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-[#111319]/90 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4 backdrop-blur-xl">
        <div className="relative">
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            placeholder="Ask a scientific question (e.g. 'What traditional uses and in-vitro evidence exist for fever?')..."
            className="w-full bg-[#161822] border border-zinc-700/80 rounded-xl p-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 leading-relaxed font-sans"
          />
          <button
            onClick={() => handleAsk()}
            disabled={isQuerying || !question.trim()}
            className="absolute right-3 bottom-3 p-2.5 bg-gradient-to-r from-zinc-200 via-slate-100 to-zinc-300 hover:from-white hover:to-zinc-200 disabled:opacity-30 text-zinc-950 font-bold rounded-xl transition-all shadow-md cursor-pointer hover:scale-105"
            title="Send Query"
          >
            {isQuerying ? <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" /> : <Send className="w-4 h-4 stroke-[2.5]" />}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Sample Prompts */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block font-mono">Suggested Research Queries:</span>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleAsk(sq)}
                className="text-[11px] bg-[#161822] hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl text-left transition-all cursor-pointer font-sans"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Response Display */}
      <AnimatePresence>
        {response && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-[#111319]/90 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-zinc-800 gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white font-mono">Grounded Literature Synthesis</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-400 font-mono">
                  Confidence: <strong className="text-sky-400 font-bold">{Math.round(response.confidence * 100)}%</strong>
                </span>
                <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-200 border border-zinc-700 px-2.5 py-0.5 rounded-full font-mono">
                  Verified RAG
                </span>
                <button
                  onClick={handleCopyAnswer}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 ml-2 px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 cursor-pointer transition-colors"
                >
                  {copiedAnswer ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAnswer ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Answer Body */}
            <div className="text-xs text-zinc-200 leading-relaxed space-y-3 font-sans whitespace-pre-line bg-[#161822] p-4 rounded-xl border border-zinc-800">
              {response.answer}
            </div>

            {/* Extracted Entity Tags */}
            <div className="pt-2 border-t border-zinc-800 flex flex-wrap gap-4 text-xs">
              {(response.cited_plants || []).length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1 font-mono">Referenced Botanical Taxa:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(response.cited_plants || []).map((p, i) => (
                      <span key={i} className="bg-zinc-800 text-emerald-300 border border-zinc-700 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(response.evidence_tiers_involved || []).length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1 font-mono">Evidence Tiers:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(response.evidence_tiers_involved || []).map((t, i) => (
                      <span key={i} className="bg-zinc-800 text-purple-300 border border-zinc-700 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cited Primary Sources */}
            {(response.cited_sources || []).length > 0 && (
              <div className="pt-3 border-t border-zinc-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Quote className="w-3.5 h-3.5 text-sky-400" />
                  <h4 className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                    Verbatim Bibliographic Evidence ({(response.cited_sources || []).length} sources)
                  </h4>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {response.cited_sources.map((src, i) => (
                    <div key={i} className="bg-[#161822] p-3.5 rounded-xl border border-zinc-800 text-xs space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-white">{src.document_title}</span>
                        {src.doi && (
                          <a
                            href={`https://doi.org/${src.doi}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-400 hover:text-sky-300 shrink-0 flex items-center gap-1 font-mono text-[10px]"
                          >
                            <span>DOI</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {src.authors} ({src.year || 'n.d.'}) — <span className="text-sky-300 font-semibold">{src.evidence_tier}</span>
                      </p>
                      <p className="text-[11px] text-zinc-300 italic bg-black/40 p-2.5 rounded-lg border border-zinc-800">
                        "{src.excerpt}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Disclaimer Banner */}
            <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-[11px] text-amber-300/90 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>{response.medical_disclaimer}</span>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Query History */}
      {history.length > 1 && (
        <div className="space-y-3 pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold font-mono">
            <Clock className="w-4 h-4" />
            <span>Recent Session Queries</span>
          </div>
          <div className="space-y-2">
            {history.slice(1).map((h, idx) => (
              <button 
                key={`${h.q}-${idx}`}
                type="button"
                onClick={() => setResponse(h.a)}
                className="w-full bg-[#111319] hover:bg-zinc-800/80 border border-zinc-800 p-3 rounded-xl cursor-pointer text-xs text-zinc-300 flex items-center justify-between transition-colors text-left focus:outline-none focus:border-zinc-500"
              >
                <span className="truncate max-w-lg font-medium">{h.q}</span>
                <span className="text-[10px] text-sky-400 font-mono">Confidence: {Math.round(h.a.confidence * 100)}%</span>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
