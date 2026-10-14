import React, { useState } from 'react';
import { X, FileText, CheckCircle2, Lock, User, Clock, AlertCircle } from 'lucide-react';
import { ClinicalEncounter } from '../../types/hospital';
import { hospitalDataService } from '../../services/hospitalDataService';

interface ClinicalEncounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  encounter: ClinicalEncounter | null;
  onSaved?: () => void;
}

export const ClinicalEncounterModal: React.FC<ClinicalEncounterModalProps> = ({
  isOpen,
  onClose,
  encounter,
  onSaved,
}) => {
  if (!isOpen || !encounter) return null;

  const [clinicalNotes, setClinicalNotes] = useState(encounter.clinical_notes || '');
  const [assessmentFindings, setAssessmentFindings] = useState(encounter.assessment_findings || '');
  const [carePlan, setCarePlan] = useState(encounter.care_plan || '');
  const [prescriptionsSummary, setPrescriptionsSummary] = useState(encounter.prescriptions_summary || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentUser = hospitalDataService.getCurrentUser();
  const canEdit = currentUser.permissions.canDocumentClinical && !encounter.finalized;

  const handleSave = (finalizeRecord: boolean) => {
    setErrorMsg(null);
    const result = hospitalDataService.updateEncounter(encounter.id, {
      clinical_notes: clinicalNotes,
      assessment_findings: assessmentFindings,
      care_plan: carePlan,
      prescriptions_summary: prescriptionsSummary,
      finalized: finalizeRecord,
    });

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to update clinical documentation');
      return;
    }

    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#071D30] border border-[#27B9FF]/70 rounded-3xl p-6 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#145B89]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0E3554] border border-[#23D5F4]/60 flex items-center justify-center text-[#23D5F4]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Clinical Encounter Documentation</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#051625] border border-[#145B89] text-[#23D5F4]">
                  {encounter.encounter_number}
                </span>
                {encounter.finalized && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0E4237] text-[#36D6A4] flex items-center gap-1 border border-[#36D6A4]/40">
                    <Lock className="w-3 h-3" /> Finalized
                  </span>
                )}
              </div>
              <p className="text-xs text-[#718BA5] mt-0.5">
                Patient: <strong className="text-[#F1F7FF]">{encounter.patient_name}</strong> ({encounter.mrn}) · Attending: {encounter.attending_doctor}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#718BA5] hover:text-white hover:bg-[#051625]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-[#3A1414] border border-[#FF634D] text-xs text-[#FF634D] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Form */}
        <div className="flex-1 overflow-y-auto space-y-3.5 py-3 pr-1 text-xs">
          {/* Patient Complaint */}
          <div className="bg-[#051625] p-3 rounded-2xl border border-[#145B89]/60">
            <span className="text-[#718BA5] font-semibold block mb-1">Chief Presentation & History of Present Illness</span>
            <p className="text-[#F1F7FF] text-xs leading-relaxed">{encounter.chief_complaint}</p>
          </div>

          {/* Clinical Findings / Examination */}
          <div>
            <label className="block text-[#A7BED3] font-semibold mb-1">Subjective & Objective Clinical Findings</label>
            <textarea
              rows={3}
              disabled={!canEdit}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Document physical examination findings, review of systems, diagnostic readings..."
              className="w-full px-3 py-2 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-[#F1F7FF] outline-none disabled:opacity-70 leading-relaxed"
            />
          </div>

          {/* Assessment & Working Diagnosis */}
          <div>
            <label className="block text-[#A7BED3] font-semibold mb-1">Clinical Assessment & Working Diagnosis</label>
            <textarea
              rows={2}
              disabled={!canEdit}
              value={assessmentFindings}
              onChange={(e) => setAssessmentFindings(e.target.value)}
              placeholder="e.g. Acute Coronary Syndrome ruled out; Essential Hypertension stage 1..."
              className="w-full px-3 py-2 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-[#F1F7FF] outline-none disabled:opacity-70 leading-relaxed"
            />
          </div>

          {/* Prescriptions & Medical Orders */}
          <div>
            <label className="block text-[#A7BED3] font-semibold mb-1">Prescriptions & Medication Orders</label>
            <input
              type="text"
              disabled={!canEdit}
              value={prescriptionsSummary}
              onChange={(e) => setPrescriptionsSummary(e.target.value)}
              placeholder="e.g. Amlodipine 5mg PO daily #30, Aspirin 81mg PO daily..."
              className="w-full px-3 py-2 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-[#F1F7FF] outline-none disabled:opacity-70"
            />
          </div>

          {/* Care Plan & Follow-up */}
          <div>
            <label className="block text-[#A7BED3] font-semibold mb-1">Treatment Plan & Discharge/Follow-up Instructions</label>
            <textarea
              rows={2}
              disabled={!canEdit}
              value={carePlan}
              onChange={(e) => setCarePlan(e.target.value)}
              placeholder="Outline therapeutic interventions, consultations, dietary restrictions, and follow-up window..."
              className="w-full px-3 py-2 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-[#F1F7FF] outline-none disabled:opacity-70 leading-relaxed"
            />
          </div>

          {/* Author attribution metadata */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-[#718BA5] border-t border-[#145B89]/50">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#23D5F4]" />
              <span>Documenting Clinician: <strong className="text-white">{encounter.author_name}</strong> ({encounter.author_role})</span>
            </span>
            <span className="flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{encounter.updated_at}</span>
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#145B89] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#145B89] text-xs font-medium text-[#A7BED3] hover:text-white"
          >
            Close
          </button>

          {canEdit && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSave(false)}
                className="px-4 py-2 rounded-xl bg-[#071D30] border border-[#145B89] hover:border-[#23D5F4] text-xs font-semibold text-[#23D5F4] transition-colors"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="px-5 py-2 rounded-xl bg-[#087FC7] hover:bg-[#27B9FF] text-white text-xs font-semibold shadow-[0_0_15px_rgba(39,185,255,0.4)] flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finalize & Sign Clinical Record</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
