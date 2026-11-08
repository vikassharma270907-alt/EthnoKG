import React, { useState } from 'react';
import { X, Check, Trash2, Edit3, Quote } from 'lucide-react';
import type { RelationshipDetail } from '../types';

interface VerificationModalProps {
  relationship?: RelationshipDetail | null;
  rel?: RelationshipDetail | null;
  onClose: () => void;
  onApprove: (id: number, notes: string) => Promise<void>;
  onReject: (id: number, reason: string) => Promise<void>;
  onUpdate: (id: number, data: any) => Promise<void>;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  relationship,
  rel,
  onClose,
  onApprove,
  onReject,
  onUpdate
}) => {
  const activeItem = relationship || rel;

  const [isEditing, setIsEditing] = useState(false);
  const [curatorNotes, setCuratorNotes] = useState('');
  const [reviewerName, setReviewerName] = useState('Dr. Vance');

  // Editable fields
  const [plantName, setPlantName] = useState(activeItem?.plant_scientific_name || '');
  const [conditionName, setConditionName] = useState(activeItem?.condition_name || '');
  const [plantPart, setPlantPart] = useState(activeItem?.plant_part || '');
  const [prepMethod, setPrepMethod] = useState(activeItem?.preparation_method || '');
  const [evidenceTier, setEvidenceTier] = useState(activeItem?.evidence_tier || 'Traditional Use Report');
  const [evidenceStatement] = useState(activeItem?.evidence_statement || '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!activeItem) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(activeItem.id, curatorNotes || 'Approved upon scientific text verification.');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await onReject(activeItem.id, curatorNotes || 'Claim not supported by verbatim text excerpt.');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveUpdate = async () => {
    setIsSubmitting(true);
    try {
      await onUpdate(activeItem.id, {
        plant_name: plantName,
        condition_name: conditionName,
        plant_part: plantPart,
        preparation_method: prepMethod,
        evidence_tier: evidenceTier,
        evidence_statement: evidenceStatement,
        reviewer_name: reviewerName,
        curator_notes: curatorNotes || 'Curator adjusted entities and approved.'
      });
      setIsEditing(false);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#111319] border border-zinc-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-zinc-200">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#111319]/95 backdrop-blur-md px-6 py-4 border-b border-zinc-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
              Human Curator Workspace
            </span>
            <span className="text-xs text-zinc-400 font-mono">Record #{activeItem.id}</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Source Excerpt Comparison */}
          <div className="bg-[#161822] border border-zinc-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-zinc-400 font-semibold uppercase text-[10px] font-mono">
              <Quote className="w-3.5 h-3.5 text-sky-400" />
              <span>Verbatim Primary Source Excerpt</span>
            </div>
            <p className="text-sm text-zinc-200 italic leading-relaxed bg-black/50 p-3.5 rounded-xl border border-zinc-800">
              "{activeItem.supporting_excerpt || 'No raw excerpt recorded.'}"
            </p>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 font-mono">
              <span>Source: {activeItem.document_title}</span>
              <span className="text-sky-400 font-bold">Confidence: {Math.round(activeItem.extraction_confidence * 100)}%</span>
            </div>
          </div>

          {/* Extracted Fields (View vs Edit) */}
          <div className="bg-[#161822] border border-zinc-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-zinc-200 font-mono">Extracted Scientific Relationship</h4>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Entities'}</span>
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1 font-mono">Botanical Binomial</label>
                    <input
                      type="text"
                      value={plantName}
                      onChange={(e) => setPlantName(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1 font-mono">Medical Condition</label>
                    <input
                      type="text"
                      value={conditionName}
                      onChange={(e) => setConditionName(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1 font-mono">Plant Part</label>
                    <input
                      type="text"
                      value={plantPart}
                      onChange={(e) => setPlantPart(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1 font-mono">Preparation Method</label>
                    <input
                      type="text"
                      value={prepMethod}
                      onChange={(e) => setPrepMethod(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1 font-mono">Evidence Tier</label>
                  <select
                    value={evidenceTier}
                    onChange={(e) => setEvidenceTier(e.target.value)}
                    className="w-full bg-black/60 border border-zinc-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="Traditional Use Report">Traditional Use Report</option>
                    <option value="Ethnobotanical Field Observation">Ethnobotanical Field Observation</option>
                    <option value="In-Vitro Experimental Bioassay">In-Vitro Experimental Bioassay</option>
                    <option value="In-Vivo Preclinical Model">In-Vivo Preclinical Model</option>
                    <option value="Clinical Human Trial">Clinical Human Trial</option>
                    <option value="In-Silico Prediction">In-Silico Prediction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1 font-mono">Curator Notes</label>
                  <textarea
                    rows={2}
                    value={curatorNotes}
                    onChange={(e) => setCuratorNotes(e.target.value)}
                    placeholder="Enter reason for adjustments..."
                    className="w-full bg-black/60 border border-zinc-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <button
                  onClick={handleSaveUpdate}
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-zinc-200 hover:bg-white text-zinc-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
                >
                  Save Corrections & Approve
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-zinc-500 block font-mono">Plant Species</span>
                  <span className="font-semibold text-white font-mono">{activeItem.plant_scientific_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block font-mono">Condition / Indication</span>
                  <span className="font-semibold text-rose-400 font-mono">{activeItem.condition_name || 'General Health'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block font-mono">Organ & Preparation</span>
                  <span className="text-zinc-300">{activeItem.plant_part || 'Whole plant'} ({activeItem.preparation_method || 'Traditional'})</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block font-mono">Evidence Category</span>
                  <span className="text-emerald-400 font-mono font-semibold">{activeItem.evidence_tier}</span>
                </div>
              </div>
            )}
          </div>

          {/* Decision Notes */}
          {!isEditing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-zinc-400 font-mono">Curator Name / Reviewer</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="bg-[#161822] border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
                  placeholder="e.g. Dr. Vance"
                />
              </div>
              <label className="block text-[10px] text-zinc-400 font-mono">Curator Verification Notes</label>
              <textarea
                rows={2}
                value={curatorNotes}
                onChange={(e) => setCuratorNotes(e.target.value)}
                placeholder="Add verification notes, botanical synonyms checked, or voucher notes..."
                className="w-full bg-[#161822] border border-zinc-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-zinc-500"
              />
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-[#161822] px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-[11px] text-zinc-400 font-mono">
            <span>Status: <strong className="text-amber-400 uppercase">{activeItem.verification_status}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReject}
              disabled={isSubmitting}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Reject Claim</span>
            </button>

            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="px-4 py-2 bg-zinc-200 hover:bg-white text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-black/40 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5 text-zinc-950" />
              <span>Approve & Certify</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
