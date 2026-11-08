import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Check, 
  Trash2, 
  Edit3, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Quote,
  ExternalLink,
  History
} from 'lucide-react';
import { 
  fetchExtractionResults, 
  approveVerification, 
  rejectVerification, 
  patchVerification 
} from '../api/client';
import { RelationshipDetail } from '../types';
import { VerificationModal } from '../components/VerificationModal';

export const VerificationPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | ''>('pending');
  const [relationships, setRelationships] = useState<RelationshipDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active modal for editing
  const [activeRel, setActiveRel] = useState<RelationshipDetail | null>(null);

  const loadData = () => {
    setIsLoading(true);
    fetchExtractionResults({
      status: filterStatus || undefined,
      limit: 100
    }).then(setRelationships).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const handleQuickApprove = async (rel: RelationshipDetail) => {
    try {
      await approveVerification(rel.id, {
        reviewer_name: 'Dr. Vance (Expert Curator)',
        notes: 'Verified against primary excerpt text.'
      });
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
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white font-mono">Human Verification Workspace</h1>
          <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
            Expert Curator Loop
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Curators review, correct, and validate AI-extracted claims against primary excerpts. Only verified records enter the certified knowledge base.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#070c19] border border-slate-800 p-2 rounded-xl shadow-md">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              filterStatus === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </button>

          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              filterStatus === 'approved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved Records</span>
          </button>

          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              filterStatus === 'rejected'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Rejected Records</span>
          </button>

          <button
            onClick={() => setFilterStatus('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === ''
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Extractions
          </button>
        </div>

        <div className="text-xs text-slate-400 pr-2">
          <span>{relationships.length} records in queue</span>
        </div>
      </div>

      {/* Relationships Table / Cards */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-400 text-xs">Loading curation queue...</p>
        </div>
      ) : relationships.length === 0 ? (
        <div className="bg-[#070c19] border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
          <p className="text-sm">No records found matching status "{filterStatus || 'all'}".</p>
        </div>
      ) : (
        <div className="space-y-4">
          {relationships.map((rel) => (
            <div
              key={rel.id}
              className="bg-[#070c19] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white font-mono">{rel.plant_scientific_name}</span>
                  <span className="text-xs text-slate-400">→</span>
                  <span className="text-sm font-semibold text-rose-400">{rel.condition_name || 'General Indication'}</span>
                  <span className="text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">
                    {rel.knowledge_tradition}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded">
                    {rel.evidence_tier}
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-semibold">
                    Confidence: {Math.round(rel.extraction_confidence * 100)}%
                  </span>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                    rel.verification_status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : rel.verification_status === 'rejected'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {rel.verification_status}
                  </span>
                </div>
              </div>

              {/* Side-by-side details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Left: Extracted Structured Data */}
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Extracted Relationship Attributes</span>
                  <div>
                    <span className="text-slate-400">Organ used: </span>
                    <span className="text-white font-medium">{rel.plant_part || 'Whole plant'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Preparation: </span>
                    <span className="text-white font-medium">{rel.preparation_method || 'Traditional extraction'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Reported Activity: </span>
                    <span className="text-white font-medium">{rel.pharmacological_activity || 'Empirical bioactivity'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Compound: </span>
                    <span className="text-cyan-400 font-mono">{rel.compound_name || 'Phytochemical metabolite'}</span>
                  </div>
                </div>

                {/* Right: Verbatim Excerpt & Citation */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase text-[10px]">
                    <Quote className="w-3 h-3" />
                    <span>Supporting Source Excerpt</span>
                  </div>
                  <p className="text-slate-300 italic leading-relaxed text-[11px]">
                    "{rel.supporting_excerpt || 'No excerpt available'}"
                  </p>
                  <p className="text-[10px] text-slate-500 pt-1">
                    Document: {rel.document_title} ({rel.document_year || 'n.d.'})
                  </p>
                </div>
              </div>

              {/* Curator Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
                <div className="text-[11px] text-slate-500">
                  Section: {rel.page_or_section || 'Results section'}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveRel(rel)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Inspect & Edit</span>
                  </button>

                  {rel.verification_status !== 'approved' && (
                    <button
                      onClick={() => handleQuickApprove(rel)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {rel.verification_status !== 'rejected' && (
                    <button
                      onClick={() => handleQuickReject(rel)}
                      className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Verification & Edit Modal */}
      <VerificationModal
        relationship={activeRel}
        onClose={() => setActiveRel(null)}
        onApprove={handleModalApprove}
        onReject={handleModalReject}
        onUpdate={handleModalUpdate}
      />

    </div>
  );
};
