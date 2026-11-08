import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  ExternalLink, 
  ShieldAlert, 
  HelpCircle, 
  Leaf, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { queryAssistant } from '../api/client';
import { AssistantQueryResponse } from '../types';

export const AssistantPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [response, setResponse] = useState<AssistantQueryResponse | null>(null);
  const [history, setHistory] = useState<Array<{ q: string; a: AssistantQueryResponse }>>([]);

  const sampleQuestions = [
    "What plants have documented traditional uses associated with fever and malaria?",
    "Which species have clinical evidence for stress and anxiety in Ayurveda?",
    "What bioactive compounds are reported for Artemisia annua?",
    "Which traditional-use claims have supporting in-vitro experimental literature?",
    "Tell me about the traditional uses and active compounds in Curcuma longa."
  ];

  const handleAsk = async (qText?: string) => {
    const q = (qText || question).trim();
    if (!q) return;

    setIsQuerying(true);
    try {
      const res = await queryAssistant(q);
      setResponse(res);
      setHistory((prev) => [{ q, a: res }, ...prev]);
      if (!qText) setQuestion('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white font-mono">AI Research Assistant</h1>
          <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
            Grounded RAG Engine
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Ask questions against indexed ethnobotanical papers. The assistant cites exact source excerpts, reports evidence tiers, and enforces zero-hallucination.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-[#070c19] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
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
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
          />
          <button
            onClick={() => handleAsk()}
            disabled={isQuerying || !question.trim()}
            className="absolute right-3 bottom-3 p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold rounded-lg transition-colors shadow-md"
            title="Send Query"
          >
            {isQuerying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        {/* Sample Prompts */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Suggested Research Queries:</span>
          <div className="flex flex-wrap gap-1.5">
            {sampleQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleAsk(sq)}
                className="text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg text-left transition-colors"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Response Display */}
      {response && (
        <div className="bg-[#070c19] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white font-mono">Grounded Literature Synthesis</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">Confidence: {Math.round(response.confidence * 100)}%</span>
              <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                Verified RAG
              </span>
            </div>
          </div>

          {/* Answer Body */}
          <div className="text-xs text-slate-200 leading-relaxed space-y-3 font-sans whitespace-pre-line">
            {response.answer}
          </div>

          {/* Extracted Entity Tags */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-4 text-xs">
            {response.cited_plants.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Referenced Taxa:</span>
                <div className="flex flex-wrap gap-1">
                  {response.cited_plants.map((p, i) => (
                    <span key={i} className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] font-mono">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {response.evidence_tiers_involved.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Evidence Tiers:</span>
                <div className="flex flex-wrap gap-1">
                  {response.evidence_tiers_involved.map((t, i) => (
                    <span key={i} className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cited Primary Sources */}
          {response.cited_sources.length > 0 && (
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Bibliographic Evidence ({response.cited_sources.length} sources)
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {response.cited_sources.map((src, i) => (
                  <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-white">{src.document_title}</span>
                      {src.doi && (
                        <a
                          href={`https://doi.org/${src.doi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 shrink-0 flex items-center gap-1 font-mono text-[10px]"
                        >
                          <span>DOI</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {src.authors} ({src.year || 'n.d.'}) — <span className="text-emerald-400 font-semibold">{src.evidence_tier}</span>
                    </p>
                    <p className="text-[11px] text-slate-300 italic bg-slate-900/60 p-2 rounded border border-slate-800/50 mt-1">
                      "{src.excerpt}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medical Disclaimer Banner */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-[11px] text-amber-300/90 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>{response.medical_disclaimer}</span>
          </div>

        </div>
      )}

    </div>
  );
};
