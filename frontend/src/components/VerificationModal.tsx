import React, { useState, useRef } from 'react';
import { X, Check, Trash2, Edit3, Quote } from 'lucide-react';
import type { RelationshipDetail } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';

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
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Hook for focus trap, escape key dismissal, and focus restoration
  const modalContainerRef = useFocusTrap<HTMLDivElement>({
    isOpen: !!activeItem,
    onClose,
    initialFocusRef: closeButtonRef
  });

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
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="curator-modal-title"
      aria-describedby="curator-modal-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Live Region for Action Status */}
      <div className="sr-only" role="status" aria-live="polite">
        {isSubmitting ? 'Submitting verification decision...' : ''}
      </div>

      <div 
        ref={modalContainerRef}
        className="bg-[#101218] border border-zinc-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-zinc-200 focus:outline-none"
        tabIndex={-1}
      >
        {/* Header */}
        <header className="sticky top-0 bg-[#101218]/95 backdrop-blur-md px-6 py-4 border-b border-zinc-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <h2 id="curator-modal-title" className="text-xs font-semibold uppercase tracking-wider text-zinc-200 bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-full font-mono">
              Human Curator Workspace
            </h2>
            <span id="curator-modal-desc" className="text-xs text-zinc-400 font-mono">
              Record #{activeItem.id}
            </span>
          </div>
          <button 
            ref={closeButtonRef}
            type="button"
            onClick={onClose} 
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
            aria-label="Close verification modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </header>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Source Excerpt Comparison */}
          <section className="bg-[#151722] border border-zinc-800 p-4 rounded-xl space-y-2" aria-label="Verbatim primary source excerpt">
            <div className="flex items-center gap-2 text-zinc-300 font-semibold uppercase text-[10px] font-mono">
              <Quote className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
              <span>Verbatim Primary Source Excerpt</span>
            </div>
            <blockquote className="text-sm text-zinc-200 italic leading-relaxed bg-black/60 p-3.5 rounded-xl border border-zinc-800">
              "{activeItem.supporting_excerpt || 'No raw excerpt recorded.'}"
            </blockquote>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 font-mono">
              <span>Source: {activeItem.document_title}</span>
              <span className="text-white font-bold">Confidence: {Math.round(activeItem.extraction_confidence * 100)}%</span>
            </div>
          </section>

          {/* Extracted Fields (View vs Edit) */}
          <section className="bg-[#151722] border border-zinc-800 p-4 rounded-xl space-y-3" aria-label="Extracted relationship entities">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-200 font-mono text-sm">Extracted Scientific Relationship</h3>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[32px] text-xs text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none font-mono"
                aria-expanded={isEditing}
              >
                <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Entities'}</span>
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveUpdate(); }} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="edit-plant-name" className="block text-[11px] text-zinc-300 mb-1 font-mono font-medium">
                      Botanical Binomial
                    </label>
                    <input
                      id="edit-plant-name"
                      type="text"
                      value={plantName}
                      onChange={(e) => setPlantName(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-700 rounded-lg p-2 text-xs text-white focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-condition-name" className="block text-[11px] text-zinc-300 mb-1 font-mono font-medium">
                      Medical Condition
                    </label>
                    <input
                      id="edit-condition-name"
                      type="text"
                      value={conditionName}
                      onChange={(e) => setConditionName(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-700 rounded-lg p-2 text-xs text-white focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="edit-plant-part" className="block text-[11px] text-zinc-300 mb-1 font-mono font-medium">
                      Plant Part
                    </label>
                    <input
                      id="edit-plant-part"
                      type="text"
                      value={plantPart}
                      onChange={(e) => setPlantPart(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-700 rounded-lg p-2 text-xs text-white focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-prep-method" className="block text-[11px] text-zinc-300 mb-1 font-mono font-medium">
                      Preparation Method
                    </label>
                    <input
                      id="edit-prep-method"
                      type="text"
                      value={prepMethod}
                      onChange={(e) => setPrepMethod(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-700 rounded-lg p-2 text-xs text-white focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="edit-evidence-tier" className="block text-[11px] text-zinc-300 mb-1 font-mono font-medium">
                    Evidence Tier
                  </label>
                  <select
                    id="edit-evidence-tier"
                    value={evidenceTier}
                    onChange={(e) => setEvidenceTier(e.target.value)}
                    className="w-full bg-black/60 border border-zinc-700 rounded-lg p-2 text-xs text-white focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none font-mono"
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
                  <label htmlFor="edit-curator-notes" className="block text-[11px] text-zinc-300 mb-1 font-mono font-medium">
                    Curator Notes
                  </label>
                  <textarea
                    id="edit-curator-notes"
                    rows={2}
                    value={curatorNotes}
                    onChange={(e) => setCuratorNotes(e.target.value)}
                    placeholder="Enter reason for adjustments..."
                    className="w-full bg-black/60 border border-zinc-700 rounded-lg p-2 text-xs text-white focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 min-h-[44px] bg-zinc-200 hover:bg-white text-zinc-950 font-bold rounded-xl text-xs cursor-pointer shadow-md focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Corrections...' : 'Save Corrections & Approve'}
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-zinc-400 block font-mono">Plant Species</span>
                  <span className="font-semibold text-white font-mono text-sm">{activeItem.plant_scientific_name}</span>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 block font-mono">Condition / Indication</span>
                  <span className="font-semibold text-zinc-200 font-mono text-sm">{activeItem.condition_name || 'General Health'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 block font-mono">Organ & Preparation</span>
                  <span className="text-zinc-300 text-xs">{activeItem.plant_part || 'Whole plant'} ({activeItem.preparation_method || 'Traditional'})</span>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 block font-mono">Evidence Category</span>
                  <span className="text-zinc-200 font-mono font-semibold text-xs">{activeItem.evidence_tier}</span>
                </div>
              </div>
            )}
          </section>

          {/* Decision Notes */}
          {!isEditing && (
            <div className="space-y-3">
              <div>
                <label htmlFor="curator-reviewer-name" className="block text-[11px] text-zinc-300 mb-1 font-mono font-medium">
                  Curator Name / Reviewer
                </label>
                <input
                  id="curator-reviewer-name"
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full sm:w-64 bg-[#151722] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none font-mono"
                  placeholder="e.g. Dr. Vance"
                />
              </div>

              <div>
                <label htmlFor="curator-verification-notes" className="block text-[11px] text-zinc-300 mb-1 font-mono font-medium">
                  Curator Verification Notes
                </label>
                <textarea
                  id="curator-verification-notes"
                  rows={2}
                  value={curatorNotes}
                  onChange={(e) => setCuratorNotes(e.target.value)}
                  placeholder="Add verification notes, botanical synonyms checked, or voucher notes..."
                  className="w-full bg-[#151722] border border-zinc-700 rounded-xl p-3 text-xs text-white focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <footer className="bg-[#151722] px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-[11px] text-zinc-300 font-mono">
            <span>Status: <strong className="text-white uppercase">{activeItem.verification_status}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReject}
              disabled={isSubmitting}
              className="px-4 py-2 min-h-[40px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none font-mono"
              aria-label={`Reject scientific claim for ${activeItem.plant_scientific_name}`}
            >
              <Trash2 className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
              <span>Reject Claim</span>
            </button>

            <button
              type="button"
              onClick={handleApprove}
              disabled={isSubmitting}
              className="px-4 py-2 min-h-[40px] bg-zinc-200 hover:bg-white text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-black/40 cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none font-mono"
              aria-label={`Approve and certify scientific claim for ${activeItem.plant_scientific_name}`}
            >
              <Check className="w-3.5 h-3.5 text-zinc-950" aria-hidden="true" />
              <span>Approve & Certify</span>
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
};
