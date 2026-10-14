import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle, User, Clock, Stethoscope } from 'lucide-react';
import { EmergencyCase } from '../../types/hospital';

interface EmergencyTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<EmergencyCase, 'id' | 'case_number'>) => void;
}

export const EmergencyTriageModal: React.FC<EmergencyTriageModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState<number>(45);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [triageAcuity, setTriageAcuity] = useState<1 | 2 | 3 | 4 | 5>(2);
  const [assignedBay, setAssignedBay] = useState('Trauma Bay 2');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !chiefComplaint.trim()) return;

    onSubmit({
      patient_name: patientName.trim(),
      age: Number(age),
      chief_complaint: chiefComplaint.trim(),
      triage_acuity: triageAcuity,
      arrival_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      wait_time_minutes: 0,
      status: 'Treating',
      assigned_bay: assignedBay,
    });

    onClose();
    setPatientName('');
    setChiefComplaint('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#071D30] border border-[#FF873D]/80 rounded-3xl p-6 shadow-[0_0_30px_rgba(255,135,61,0.25)] relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#145B89]">
          <div>
            <h2 className="text-lg font-bold text-[#F1F7FF] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#FF873D]" />
              <span>Emergency Department Triage Intake</span>
            </h2>
            <p className="text-xs text-[#718BA5] mt-0.5">
              Rapid clinical acuity assessment & emergency bay assignment
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#718BA5] hover:text-white hover:bg-[#051625]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#A7BED3] mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#FF873D]" />
                <span>Patient Name / ID</span>
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Robert Kowalski"
                className="w-full px-3 py-2 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#FF873D] text-sm text-[#F1F7FF] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A7BED3] mb-1">Age</label>
              <input
                type="number"
                min="0"
                max="120"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#FF873D] text-sm text-[#F1F7FF] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A7BED3] mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#FF873D]" />
              <span>Chief Complaint / Clinical Presentation</span>
            </label>
            <textarea
              required
              rows={2}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g. Acute severe substernal chest pressure radiating to left jaw, diaphoresis..."
              className="w-full px-3 py-2 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#FF873D] text-xs text-[#F1F7FF] outline-none"
            />
          </div>

          {/* Acuity Level Selection */}
          <div>
            <label className="block text-xs font-medium text-[#A7BED3] mb-1.5">
              Triage Acuity Level (ESI Protocol)
            </label>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {[
                { level: 1 as const, label: '1: Resus', color: 'border-[#FF634D] text-[#FF634D] bg-[#FF634D]/20' },
                { level: 2 as const, label: '2: Emergent', color: 'border-[#FF873D] text-[#FF873D] bg-[#FF873D]/20' },
                { level: 3 as const, label: '3: Urgent', color: 'border-[#FFB34F] text-[#FFB34F] bg-[#FFB34F]/20' },
                { level: 4 as const, label: '4: Less Urg', color: 'border-[#23D5F4] text-[#23D5F4] bg-[#23D5F4]/20' },
                { level: 5 as const, label: '5: Non-Urg', color: 'border-[#36D6A4] text-[#36D6A4] bg-[#36D6A4]/20' },
              ].map((item) => (
                <button
                  key={item.level}
                  type="button"
                  onClick={() => setTriageAcuity(item.level)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all ${
                    triageAcuity === item.level
                      ? `${item.color} shadow-lg scale-105`
                      : 'border-[#145B89] text-[#718BA5] bg-[#051625]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A7BED3] mb-1 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-[#FF873D]" />
              <span>Assigned Emergency Bay</span>
            </label>
            <select
              value={assignedBay}
              onChange={(e) => setAssignedBay(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#FF873D] text-xs text-[#F1F7FF] outline-none"
            >
              <option value="Resus Bay 1">Resus Bay 1 (Critical)</option>
              <option value="Trauma Bay 2">Trauma Bay 2 (Major Trauma)</option>
              <option value="Trauma Bay 3">Trauma Bay 3</option>
              <option value="Cardiac Bay A">Cardiac Bay A</option>
              <option value="Observation Bay B">Observation Bay B</option>
              <option value="Fast Track Room 1">Fast Track Room 1</option>
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#145B89]/70">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#145B89] text-xs font-medium text-[#A7BED3]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#FF873D] hover:bg-[#FF634D] text-white text-xs font-semibold shadow-[0_0_15px_rgba(255,135,61,0.5)] transition-all"
            >
              Intake Emergency Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
