import React, { useState, useEffect } from 'react';
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

export const VerificationPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | ''>('pending');
  const [minConfidence, setMinConfidence] = useState<number>(0.5);
  const [relationships, setRelationships] = useState<RelationshipDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifiedToast, setVerifiedToast] = useState<string | null>(null);

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
      setTimeout(() => setVerifiedToast(null), 4000);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickReject = async (rel: RelationshipDetail) => {
    try {
      await rejectVerification(rel.id, {
        reviewer_name: 'Dr. Vance (Expert Curator)',
        reason: 'Extraction inaccurate or not supported by excerpt.'
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalApprove = async (id: number, notes: string) => {
    await approveVerification(id, { reviewer_name: 'Dr. Vance (Expert Curator)', notes });
    fireCuratorConfetti();
    loadData();
  };

  const handleModalReject = async (id: number, reason: string) => {
    await rejectVerification(id, { reviewer_name: 'Dr. Vance (Expert Curator)', reason });
    loadData();
  };

  const handleModalUpdate = async (id: number, data: any) => {
    await patchVerification(id, data);
    loadData();
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
            className="fixed top-20 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-950 font-bold px-4 py-3 rounded-xl shadow-2xl shadow-emerald-500/40 flex items-center gap-2 text-xs border border-emerald-300"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>{verifiedToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="pb-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-mono">Human Verification Workspace</h1>
            <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
              Expert Curator Loop
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Curators review, correct, and validate AI-extracted claims against primary excerpts. Only verified records enter the certified knowledge base.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Total in Queue:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 font-mono text-xs text-emerald-400 font-bold border border-slate-700">
            {relationships.length}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Confidence Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#070c19] border border-slate-800 p-3 rounded-2xl shadow-md">
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </button>

          <button
            onClick={() => setFilterStatus('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === ''
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>All Records</span>
          </button>
        </div>

        {/* Confidence slider */}
        <div className="flex items-center gap-3 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] text-slate-400">Min Confidence:</span>
          <input
            type="range"
            min="0"
            max="0.95"
            step="0.05"
            value={minConfidence}
            onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
            className="w-24 accent-emerald-500 cursor-pointer"
          />
          <span className="font-mono text-xs text-emerald-400 font-semibold">{Math.round(minConfidence * 100)}%</span>
        </div>

      </div>

      {/* List of Relationships with Curation Actions */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-400 text-xs">Loading curation queue...</p>
        </div>
      ) : relationships.length === 0 ? (
        <div className="bg-[#070c19] border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white font-mono">No Records in this Filter</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All records for this status have been curated or none match your minimum confidence filter ({Math.round(minConfidence * 100)}%).
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {relationships.map((rel) => {
              const isPending = rel.verification_status === 'pending';
              const isApproved = rel.verification_status === 'approved';
              const isRejected = rel.verification_status === 'rejected';

              return (
                <motion.div
                  key={rel.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#070c19] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl space-y-3.5 transition-all"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono">{rel.plant_scientific_name}</span>
                      <span className="text-xs text-emerald-400 font-mono font-semibold">[{rel.relation_type}]</span>
                      <span className="text-sm font-bold text-cyan-400 font-mono">
                        {rel.condition_name || rel.compound_name || 'Pharmacological Target'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                        {rel.evidence_tier}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Confidence: <strong className="text-cyan-400">{Math.round(rel.extraction_confidence * 100)}%</strong>
                      </span>
                    </div>
                  </div>

                  {/* Excerpt with Provenance */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                      <Quote className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verbatim Publication Provenance:</span>
                    </div>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      "{rel.supporting_excerpt || 'No excerpt available.'}"
                    </p>
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
                      <span>Source: <strong className="text-slate-300">{rel.document_title}</strong> ({rel.document_year || 'n.d.'})</span>
                      {rel.document_doi && (
                        <span className="font-mono text-cyan-400 text-[10px]">DOI: {rel.document_doi}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons for Expert Review */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Status:</span>
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${
                        isApproved 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                          : isRejected 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                      }`}>
                        {rel.verification_status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveRel(rel)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer hover:border-slate-500"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Inspect & Edit</span>
                      </button>

                      {isPending && (
                        <>
                          <button
                            onClick={() => handleQuickReject(rel)}
                            className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/80 text-rose-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>

                          <button
                            onClick={() => handleQuickApprove(rel)}
                            className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer hover:scale-105"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Certify Claim</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Verification Modal for Detailed Inspection */}
      {activeRel && (
        <VerificationModal
          relationship={activeRel}
          onClose={() => setActiveRel(null)}
          onApprove={handleModalApprove}
          onReject={handleModalReject}
          onUpdate={handleModalUpdate}
        />
      )}

    </div>
  );
};
