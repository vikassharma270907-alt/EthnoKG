import React, { useState } from 'react';
import { X, Check, Trash2, Edit3, ShieldAlert, BookOpen, Quote } from 'lucide-react';
import { RelationshipDetail } from '../types';

interface VerificationModalProps {
  relationship: RelationshipDetail | null;
  onClose: () => void;
  onApprove: (id: number, notes: string) => Promise<void>;
  onReject: (id: number, reason: string) => Promise<void>;
  onUpdate: (id: number, data: any) => Promise<void>;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  relationship,
  onClose,
  onApprove,
  onReject,
  onUpdate
}) => {
  if (!relationship) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [curatorNotes, setCuratorNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [reviewerName, setReviewerName] = useState('Dr. Vance');

  // Editable fields
  const [plantName, setPlantName] = useState(relationship.plant_scientific_name);
  const [conditionName, setConditionName] = useState(relationship.condition_name || '');
  const [plantPart, setPlantPart] = useState(relationship.plant_part || '');
  const [prepMethod, setPrepMethod] = useState(relationship.preparation_method || '');
  const [evidenceTier, setEvidenceTier] = useState(relationship.evidence_tier);
  const [evidenceStatement, setEvidenceStatement] = useState(relationship.evidence_statement || '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(relationship.id, curatorNotes || 'Approved upon scientific text verification.');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await onReject(relationship.id, rejectReason || 'Claim not supported by verbatim text excerpt.');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveUpdate = async () => {
    setIsSubmitting(true);
    try {
      await onUpdate(relationship.id, {
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0B132B] border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-slate-200">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#0B132B]/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              Human Curator Workspace
            </span>
            <span className="text-xs text-slate-400">Record #{relationship.id}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Source Excerpt Comparison */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase text-[10px]">
              <Quote className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verbatim Primary Source Excerpt</span>
            </div>
            <p className="text-sm text-slate-200 italic leading-relaxed bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
              "{relationship.supporting_excerpt || 'No raw excerpt recorded.'}"
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Source: {relationship.document_title}</span>
              <span className="text-emerald-400 font-mono">Confidence: {Math.round(relationship.extraction_confidence * 100)}%</span>
            </div>
          </div>

          {/* Extracted Fields (View vs Edit) */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-200">Extracted Scientific Relationship</h4>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Entities'}</span>
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Botanical Binomial</label>
                    <input
                      type="text"
                      value={plantName}
                      onChange={(e) => setPlantName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Medical Condition</label>
                    <input
                      type="text"
                      value={conditionName}
                      onChange={(e) => setConditionName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Plant Part</label>
                    <input
                      type="text"
                      value={plantPart}
                      onChange={(e) => setPlantPart(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Preparation Method</label>
                    <input
                      type="text"
                      value={prepMethod}
                      onChange={(e) => setPrepMethod(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Evidence Tier</label>
                  <select
                    value={evidenceTier}
                    onChange={(e) => setEvidenceTier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white"
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
                  <label className="block text-[10px] text-slate-400 mb-1">Curator Notes</label>
                  <textarea
                    rows={2}
                    value={curatorNotes}
                    onChange={(e) => setCuratorNotes(e.target.value)}
                    placeholder="Enter reason for adjustments..."
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white"
                  />
                </div>

                <button
                  onClick={handleSaveUpdate}
                  disabled={isSubmitting}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs"
                >
                  Save Corrections & Approve
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">Plant Species</span>
                  <span className="font-semibold text-white font-mono">{relationship.plant_scientific_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Condition / Indication</span>
                  <span className="font-semibold text-rose-400">{relationship.condition_name || 'General Health'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Organ & Preparation</span>
                  <span className="text-slate-300">{relationship.plant_part || 'Whole plant'} ({relationship.preparation_method || 'Traditional'})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Evidence Tier</span>
                  <span className="text-emerald-400 font-semibold">{relationship.evidence_tier}</span>
                </div>
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Reviewer Attribution</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Approval or Rejection Remarks</label>
                <textarea
                  rows={2}
                  value={curatorNotes}
                  onChange={(e) => setCuratorNotes(e.target.value)}
                  placeholder="e.g. Verified against botanical voucher and primary abstract."
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Validate Relation</span>
                </button>
                <button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="py-2.5 px-4 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/80 text-rose-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
