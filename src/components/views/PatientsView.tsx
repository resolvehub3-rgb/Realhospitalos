import React, { useState } from 'react';
import { Search, UserPlus, Heart, Activity, Thermometer, User, ArrowLeft, Phone, Calendar, Droplets, ShieldAlert, FileText, X } from 'lucide-react';
import { Patient } from '../../types/hospital';

interface PatientsViewProps {
  patients: Patient[];
  onOpenAdmitModal: () => void;
  onOpenEncounterForPatient: (patient: Patient) => void;
  onBackToOverview: () => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  onOpenAdmitModal,
  onOpenEncounterForPatient,
  onBackToOverview,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filtered = patients.filter((p) => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone && p.phone.includes(searchTerm));
    const matchesDept = filterDepartment === 'all' || p.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  const getTriageBadge = (level: Patient['triage_level']) => {
    switch (level) {
      case 'Immediate':
        return 'bg-[#FF634D]/20 text-[#FF634D] border-[#FF634D]';
      case 'Emergent':
        return 'bg-[#FF873D]/20 text-[#FF873D] border-[#FF873D]';
      case 'Urgent':
        return 'bg-[#FFB34F]/20 text-[#FFB34F] border-[#FFB34F]';
      default:
        return 'bg-[#23D5F4]/20 text-[#23D5F4] border-[#23D5F4]';
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToOverview}
            className="p-2 rounded-xl bg-[#051625] border border-[#145B89] hover:border-[#23D5F4] text-[#718BA5] hover:text-white transition-colors cursor-pointer"
            title="Back to Command Center Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-[#F1F7FF]">Hospital Patient Directory & Identity Registry</h2>
            <p className="text-xs text-[#718BA5]">
              Active census: {patients.length} registered patients · Duplicate identity prevention & telemetry
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAdmitModal}
          className="px-4 py-2 rounded-xl bg-[#087FC7] hover:bg-[#27B9FF] text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(39,185,255,0.4)] cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718BA5]" />
          <input
            type="text"
            placeholder="Search by patient legal name, MRN (e.g. MRN-90214), or telephone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#071D30] border border-[#145B89]/70 focus:border-[#23D5F4] text-xs text-[#F1F7FF] outline-none"
          />
        </div>

        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-[#071D30] border border-[#145B89]/70 focus:border-[#23D5F4] text-xs text-[#F1F7FF] outline-none w-full sm:w-auto"
        >
          <option value="all">All Departments</option>
          <option value="General Medicine">General Medicine</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Pediatrics">Pediatrics</option>
          <option value="Orthopedics">Orthopedics</option>
          <option value="Radiology">Radiology</option>
        </select>
      </div>

      {/* Patients Table */}
      <div className="bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#051625] text-[#718BA5] uppercase tracking-wider font-semibold border-b border-[#145B89]/70 text-[10px]">
              <tr>
                <th className="py-3 px-4">Patient & MRN</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Triage Acuity</th>
                <th className="py-3 px-3">Bed</th>
                <th className="py-3 px-3">Vitals (HR / BP / SpO2)</th>
                <th className="py-3 px-3">Attending Clinician</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#145B89]/40">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className="hover:bg-[#0A2640]/70 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#0E3554] border border-[#18E1C1]/60 flex items-center justify-center text-[#18E1C1]">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-[#F1F7FF] hover:text-[#23D5F4] transition-colors">{p.full_name}</div>
                        <div className="text-[10px] text-[#718BA5] font-mono">
                          {p.mrn} · {p.age}y / {p.gender} {p.blood_type && `· ${p.blood_type}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-[#A7BED3]">
                    {p.department}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getTriageBadge(
                        p.triage_level
                      )}`}
                    >
                      {p.triage_level}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[#F1F7FF]">
                    {p.bed_assigned || 'Unassigned'}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3 font-mono text-[11px] text-[#A7BED3]">
                      <span className="flex items-center gap-1 text-[#23D5F4]">
                        <Heart className="w-3 h-3 text-[#FF634D]" />
                        {p.vital_signs.heart_rate} bpm
                      </span>
                      <span>{p.vital_signs.blood_pressure}</span>
                      <span className="text-[#36D6A4]">{p.vital_signs.sp_o2}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#A7BED3]">
                    {p.attending_doctor}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-[#0E4237] text-[#36D6A4] text-[10px] font-semibold">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Patient Drawer Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#071D30] border border-[#27B9FF]/70 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#145B89]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0E3554] border border-[#18E1C1]/60 flex items-center justify-center text-[#18E1C1]">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedPatient.full_name}</h3>
                  <p className="text-xs text-[#718BA5] font-mono">
                    MRN: <strong className="text-[#23D5F4]">{selectedPatient.mrn}</strong> · {selectedPatient.department}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1.5 rounded-lg text-[#718BA5] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#051625] p-3 rounded-2xl border border-[#145B89]/50">
                <div>
                  <span className="text-[#718BA5] block text-[10px] uppercase">Demographics</span>
                  <div className="text-white font-medium mt-0.5">
                    {selectedPatient.age} yrs · {selectedPatient.gender}
                  </div>
                </div>
                <div>
                  <span className="text-[#718BA5] block text-[10px] uppercase">Blood Type</span>
                  <div className="text-[#FF873D] font-bold font-mono mt-0.5">
                    {selectedPatient.blood_type || 'Unknown'}
                  </div>
                </div>
                <div>
                  <span className="text-[#718BA5] block text-[10px] uppercase">Contact Phone</span>
                  <div className="text-[#F1F7FF] font-mono mt-0.5">
                    {selectedPatient.phone || 'Not recorded'}
                  </div>
                </div>
                <div>
                  <span className="text-[#718BA5] block text-[10px] uppercase">Assigned Bed</span>
                  <div className="text-[#18E1C1] font-mono font-bold mt-0.5">
                    {selectedPatient.bed_assigned || 'Unassigned'}
                  </div>
                </div>
              </div>

              {/* Vitals Telemetry */}
              <div className="bg-[#051625] p-3 rounded-2xl border border-[#145B89]/50">
                <span className="text-[#718BA5] block text-[10px] uppercase mb-1.5">Current Vital Signs</span>
                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="bg-[#071D30] p-1.5 rounded-lg">
                    <span className="text-[9px] text-[#718BA5] block">HR</span>
                    <strong className="text-[#FF634D]">{selectedPatient.vital_signs.heart_rate} bpm</strong>
                  </div>
                  <div className="bg-[#071D30] p-1.5 rounded-lg">
                    <span className="text-[9px] text-[#718BA5] block">BP</span>
                    <strong className="text-white">{selectedPatient.vital_signs.blood_pressure}</strong>
                  </div>
                  <div className="bg-[#071D30] p-1.5 rounded-lg">
                    <span className="text-[9px] text-[#718BA5] block">SpO2</span>
                    <strong className="text-[#36D6A4]">{selectedPatient.vital_signs.sp_o2}%</strong>
                  </div>
                  <div className="bg-[#071D30] p-1.5 rounded-lg">
                    <span className="text-[9px] text-[#718BA5] block">Temp</span>
                    <strong className="text-[#23D5F4]">{selectedPatient.vital_signs.temperature_c}°C</strong>
                  </div>
                </div>
              </div>

              {/* Known allergies */}
              {selectedPatient.known_allergies && selectedPatient.known_allergies.length > 0 && (
                <div className="p-2.5 rounded-xl bg-[#3A1E14]/40 border border-[#FF873D]/40 text-[#FF873D]">
                  <span className="font-semibold block text-[10px] uppercase">Allergies & Clinical Warnings:</span>
                  <span className="mt-0.5 block">{selectedPatient.known_allergies.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Footer action buttons */}
            <div className="pt-3 border-t border-[#145B89] flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 rounded-xl border border-[#145B89] text-xs text-[#A7BED3]"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  onOpenEncounterForPatient(selectedPatient);
                  setSelectedPatient(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#087FC7] hover:bg-[#27B9FF] text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(39,185,255,0.4)]"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Start / View Clinical Encounter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
