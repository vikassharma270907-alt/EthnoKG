import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Check, 
  Trash2, 
  Edit3, 
  Clock, 
  CheckCircle2, 
  Quote,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchExtractionResults, 
  approveVerification, 
  rejectVerification, 
  patchVerification 
} from '../api/client';
import type { RelationshipDetail } from '../types';
import { VerificationModal } from '../components/VerificationModal';
import { fireCuratorConfetti } from '../utils/confetti';
import { GlowCard } from '../components/GlowCard';

export const VerificationPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | ''>('pending');
  const [minConfidence, setMinConfidence] = useState<number>(0.5);
  const [relationships, setRelationships] = useState<RelationshipDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifiedToast, setVerifiedToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Active modal for editing
  const [activeRel, setActiveRel] = useState<RelationshipDetail | null>(null);

  const loadData = () => {
    fetchExtractionResults({
      status: filterStatus || undefined,
      min_confidence: minConfidence,
      limit: 100
    }).then(setRelationships).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchExtractionResults({
      status: filterStatus || undefined,
      min_confidence: minConfidence,
      limit: 100
    }).then(data => {
      if (isMounted) {
        setRelationships(data);
        setIsLoading(false);
      }
    }).catch(err => {
      if (isMounted) {
        console.error(err);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [filterStatus, minConfidence]);

  const handleQuickApprove = async (rel: RelationshipDetail) => {
    try {
      await approveVerification(rel.id, {
        reviewer_name: 'Dr. Vance (Expert Curator)',
        notes: 'Verified against primary excerpt text.'
      });
      fireCuratorConfetti();
      setVerifiedToast(`Successfully verified: ${rel.plant_scientific_name} ➔ ${rel.condition_name || rel.compound_name}`);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setVerifiedToast(null), 4000);
      loadData();
    } catch (err: any) {
      console.error(err);
      setErrorToast(err?.message || 'Failed to approve relationship.');
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setErrorToast(null), 4000);
    }
  };

  const handleQuickReject = async (rel: RelationshipDetail) => {
    try {
      await rejectVerification(rel.id, {
        reviewer_name: 'Dr. Vance (Expert Curator)',
        reason: 'Extraction inaccurate or not supported by excerpt.'
      });
      loadData();
    } catch (err: any) {
      console.error(err);
      setErrorToast(err?.message || 'Failed to reject relationship.');
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setErrorToast(null), 4000);
    }
  };

  const handleModalApprove = async (id: number, notes: string) => {
    try {
      await approveVerification(id, { reviewer_name: 'Dr. Vance (Expert Curator)', notes });
      fireCuratorConfetti();
      loadData();
    } catch (err: any) {
      setErrorToast(err?.message || 'Failed to approve relationship.');
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setErrorToast(null), 4000);
    }
  };

  const handleModalReject = async (id: number, reason: string) => {
    try {
      await rejectVerification(id, { reviewer_name: 'Dr. Vance (Expert Curator)', reason });
      loadData();
    } catch (err: any) {
      setErrorToast(err?.message || 'Failed to reject relationship.');
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setErrorToast(null), 4000);
    }
  };

  const handleModalUpdate = async (id: number, data: any) => {
    try {
      await patchVerification(id, data);
      loadData();
    } catch (err: any) {
      setErrorToast(err?.message || 'Failed to update relationship.');
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setErrorToast(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {verifiedToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-gradient-to-r from-zinc-200 to-white text-zinc-950 font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs border border-zinc-400"
          >
            <Sparkles className="w-4 h-4 fill-zinc-950" />
            <span>{verifiedToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="pb-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-mono">Human Verification Workspace</h1>
            <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
              Expert Curator Loop
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Curators review, correct, and validate AI-extracted claims against primary excerpts. Only verified records enter the certified knowledge base.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Total in Queue:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#161822] font-mono text-xs text-emerald-400 font-bold border border-zinc-800">
            {relationships.length}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Confidence Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111319]/90 border border-zinc-800 p-3 rounded-2xl shadow-xl backdrop-blur-xl">
        
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </button>

          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterStatus === 'approved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Claims</span>
          </button>

          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterStatus === 'rejected'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </button>

          <button
            onClick={() => setFilterStatus('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === ''
                ? 'bg-zinc-800 text-white border border-zinc-600'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>All Records</span>
          </button>
        </div>

        {/* Confidence slider */}
        <div className="flex items-center gap-3 bg-[#161822] px-3.5 py-1.5 rounded-xl border border-zinc-800 font-mono">
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[11px] text-zinc-400">Min Confidence:</span>
          <input
            type="range"
            min="0"
            max="0.95"
            step="0.05"
            value={minConfidence}
            onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
            className="w-24 accent-zinc-200 cursor-pointer"
          />
          <span className="font-mono text-xs text-sky-400 font-semibold">{Math.round(minConfidence * 100)}%</span>
        </div>

      </div>

      {/* List of Relationships with Curation Actions */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-zinc-400 text-xs font-mono">Loading curator queue...</p>
        </div>
      ) : relationships.length === 0 ? (
        <div className="bg-[#111319] border border-zinc-800 rounded-2xl p-12 text-center text-zinc-400">
          <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
          <p className="text-sm">No items in the curator queue for this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {relationships.map((rel, idx) => (
              <GlowCard 
                key={rel.id}
                glowColor="amber"
                className="p-5 space-y-3.5"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">{rel.plant_scientific_name}</span>
                    <span className="text-xs text-zinc-500">→</span>
                    <span className="text-sm font-semibold text-rose-400 font-mono">{rel.condition_name || rel.compound_name}</span>
                    <span className="text-[10px] font-semibold bg-zinc-800 text-purple-300 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
                      {rel.knowledge_tradition}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold bg-zinc-800 text-emerald-300 border border-zinc-700 px-2.5 py-0.5 rounded-full font-mono">
                      {rel.evidence_tier}
                    </span>
                    <span className="text-xs font-mono text-sky-400 font-bold bg-[#161822] border border-zinc-700 px-2 py-0.5 rounded-md">
                      Confidence: {Math.round(rel.extraction_confidence * 100)}%
                    </span>
                    <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full font-mono ${
                      rel.verification_status === 'approved' 
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                        : rel.verification_status === 'rejected'
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                      {rel.verification_status}
                    </span>
                  </div>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 font-semibold block font-mono">Part & Preparation</span>
                    <span className="text-zinc-300">{rel.plant_part || 'Whole plant'} ({rel.preparation_method || 'Traditional method'})</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 font-semibold block font-mono">Active Metabolite</span>
                    <span className="text-sky-400 font-mono">{rel.compound_name || 'Phytochemical extract'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 font-semibold block font-mono">Pharmacological Activity</span>
                    <span className="text-zinc-200">{rel.pharmacological_activity || 'Empirical bioactivity'}</span>
                  </div>
                </div>

                {/* Excerpt with Verbatim quote */}
                {rel.supporting_excerpt && (
                  <div className="bg-[#161822] p-3.5 rounded-xl border border-zinc-800 text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-400 font-bold uppercase text-[10px] mb-1 font-mono">
                      <Quote className="w-3 h-3 text-sky-400" />
                      <span>Verbatim Literature Excerpt:</span>
                    </div>
                    <p className="text-zinc-300 italic leading-relaxed">
                      "{rel.supporting_excerpt}"
                    </p>
                  </div>
                )}

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-zinc-800 gap-2">
                  <div className="text-[11px] text-zinc-500 font-mono">
                    <span>Source: {rel.document_title || 'Indexed Corpus'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveRel(rel)}
                      className="px-3 py-1.5 bg-[#161822] hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3 text-sky-400" />
                      <span>Review & Edit</span>
                    </button>

                    {rel.verification_status !== 'approved' && (
                      <button
                        onClick={() => handleQuickApprove(rel)}
                        className="px-3.5 py-1.5 bg-zinc-200 hover:bg-white text-zinc-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Quick Approve</span>
                      </button>
                    )}

                    {rel.verification_status !== 'rejected' && (
                      <button
                        onClick={() => handleQuickReject(rel)}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>
              </GlowCard>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit / Curation Modal */}
      <VerificationModal
        rel={activeRel}
        relationship={activeRel}
        onClose={() => setActiveRel(null)}
        onApprove={handleModalApprove}
        onReject={handleModalReject}
        onUpdate={handleModalUpdate}
      />

    </div>
  );
};
