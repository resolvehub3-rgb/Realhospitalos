import React, { useState } from 'react';
import {
  HeartPulse,
  Bed,
  CheckCircle2,
  Clock,
  Sparkles,
  Pill,
  Users,
  Activity,
  AlertTriangle,
  Plus,
  RefreshCw,
  Droplet,
} from 'lucide-react';
import { BedRecord, CurrentUser, Patient } from '../../types/hospital';
import { hospitalDataService } from '../../services/hospitalDataService';

interface NurseDashboardProps {
  currentUser: CurrentUser;
  beds: BedRecord[];
  patients: Patient[];
  onOpenBedManager: () => void;
  onRefresh: () => void;
}

interface MedScheduleItem {
  id: string;
  patient_name: string;
  bed_code: string;
  medication: string;
  dosage: string;
  due_time: string;
  route: string;
  status: 'Pending' | 'Administered' | 'Delayed';
}

export const NurseDashboard: React.FC<NurseDashboardProps> = ({
  currentUser,
  beds,
  patients,
  onOpenBedManager,
  onRefresh,
}) => {
  const [administeredMap, setAdministeredMap] = useState<Record<string, boolean>>({});
  const [selectedWard, setSelectedWard] = useState<string>('all');

  // Dynamically derive medication tasks from actual admitted ward patients
  const meds: MedScheduleItem[] = patients
    .filter((p) => p.status === 'Admitted' || p.status === 'Observation')
    .map((p, idx) => ({
      id: `med-${p.id}`,
      patient_name: p.full_name,
      bed_code: p.bed_assigned || `BED-${idx + 101}`,
      medication: p.known_allergies?.[0] ? `Prescribed Care (${p.department})` : 'Daily Ward Regimen',
      dosage: 'Standard Hospital Dose',
      due_time: `${10 + (idx % 4)}:00 ${idx % 2 === 0 ? 'AM' : 'PM'}`,
      route: 'Oral / IV',
      status: administeredMap[p.id] ? 'Administered' : 'Pending',
    }));

  const occupiedBeds = beds.filter((b) => b.status === 'occupied');
  const cleaningBeds = beds.filter((b) => b.status === 'cleaning');
  const availableBeds = beds.filter((b) => b.status === 'available');

  const handleAdministerMed = (id: string) => {
    const rawId = id.replace('med-', '');
    setAdministeredMap((prev) => ({
      ...prev,
      [rawId]: !prev[rawId],
    }));
  };

  const handleSanitizeBed = async (bed: BedRecord) => {
    hospitalDataService.sanitizeBed(bed.id);
    onRefresh();
  };

  const filteredBeds = selectedWard === 'all' ? beds : beds.filter((b) => b.department.toLowerCase().includes(selectedWard.toLowerCase()));

  return (
    <div className="space-y-4">
      {/* Nurse Header Banner */}
      <div className="bg-gradient-to-r from-[#071D30] via-[#082A48] to-[#071D30] border border-[#27B9FF]/60 rounded-3xl p-4 sm:p-5 shadow-[0_0_30px_rgba(39,185,255,0.18)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#27B9FF]/20 border border-[#27B9FF] flex items-center justify-center text-[#27B9FF] shadow-[0_0_15px_rgba(39,185,255,0.4)]">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Nursing Station & Inpatient Ward
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#27B9FF]/20 text-[#27B9FF] border border-[#27B9FF]/60">
                Shift Active
              </span>
            </div>
            <p className="text-xs text-[#718BA5] font-medium mt-0.5">
              Nurse Station Lead: <strong className="text-white">{currentUser.name}</strong> · {currentUser.department}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenBedManager}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#087FC7] to-[#27B9FF] text-white font-bold text-xs shadow-[0_0_15px_rgba(39,185,255,0.4)] hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Bed className="w-4 h-4" />
            <span>Bed Allocation Console</span>
          </button>
        </div>
      </div>

      {/* 4 Nurse Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Occupied Beds</span>
            <Bed className="w-4 h-4 text-[#27B9FF]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">{occupiedBeds.length}</div>
          <div className="text-[10px] text-[#27B9FF] mt-0.5 font-medium">Patients currently in ward</div>
        </div>

        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Pending UV Sanitization</span>
            <Sparkles className="w-4 h-4 text-[#FF873D]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#FF873D] font-mono">{cleaningBeds.length}</div>
          <div className="text-[10px] text-[#FF873D] mt-0.5 font-medium">Awaiting decontamination</div>
        </div>

        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Available Beds</span>
            <CheckCircle2 className="w-4 h-4 text-[#18E1C1]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#18E1C1] font-mono">{availableBeds.length}</div>
          <div className="text-[10px] text-[#18E1C1] mt-0.5 font-medium">Ready for admissions</div>
        </div>

        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Medication Rounds Due</span>
            <Pill className="w-4 h-4 text-[#38DDF7]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">
            {meds.filter((m) => m.status === 'Pending').length}
          </div>
          <div className="text-[10px] text-[#38DDF7] mt-0.5 font-medium">Prescriptions scheduled</div>
        </div>
      </div>

      {/* Grid: Bed Allocation Status & Medication Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column (7 Cols): Ward Bed Census */}
        <div className="lg:col-span-7 bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-[#23D5F4]" />
                <h3 className="text-sm font-bold text-white">Inpatient Ward Bed Grid</h3>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                {['all', 'ICU', 'Cardiology', 'Emergency', 'Pediatrics'].map((w) => (
                  <button
                    key={w}
                    onClick={() => setSelectedWard(w)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                      selectedWard === w
                        ? 'bg-[#087FC7] text-white'
                        : 'bg-[#051625] text-[#718BA5] hover:text-white'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto custom-scrollbar">
              {filteredBeds.map((bed) => {
                const isOccupied = bed.status === 'occupied';
                const isCleaning = bed.status === 'cleaning';

                return (
                  <div
                    key={bed.id}
                    className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                      isOccupied
                        ? 'bg-[#051625] border-[#27B9FF]/50'
                        : isCleaning
                        ? 'bg-[#051625] border-[#FF873D]/60'
                        : 'bg-[#051625] border-[#18E1C1]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{bed.bed_code}</span>
                          <span className="text-[10px] text-[#718BA5]">Room {bed.room_number}</span>
                        </div>
                        <div className="text-[10px] text-[#718BA5]">{bed.department}</div>
                      </div>

                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          isOccupied
                            ? 'bg-[#27B9FF]/20 text-[#27B9FF]'
                            : isCleaning
                            ? 'bg-[#FF873D]/20 text-[#FF873D]'
                            : 'bg-[#18E1C1]/20 text-[#18E1C1]'
                        }`}
                      >
                        {bed.status}
                      </span>
                    </div>

                    {isOccupied && bed.patient_name && (
                      <div className="text-[11px] font-medium text-white bg-[#03101E] px-2 py-1 rounded border border-[#145B89]/50 truncate">
                        Patient: <strong>{bed.patient_name}</strong>
                      </div>
                    )}

                    {isCleaning && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#FF873D]">UV Cleaning in progress</span>
                        <button
                          onClick={() => handleSanitizeBed(bed)}
                          className="px-2 py-1 rounded bg-[#18E1C1]/20 hover:bg-[#18E1C1]/40 border border-[#18E1C1]/50 text-[#18E1C1] text-[10px] font-bold cursor-pointer"
                        >
                          Mark Sanitized
                        </button>
                      </div>
                    )}

                    {bed.status === 'available' && (
                      <div className="text-[10px] text-[#18E1C1] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ready for transfer or admit</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Medication Administration Schedule */}
        <div className="lg:col-span-5 bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#38DDF7]" />
                <h3 className="text-sm font-bold text-white">Medication Schedule</h3>
              </div>
              <span className="text-[10px] text-[#718BA5]">Shift Rounds</span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar">
              {meds.map((m) => {
                const isDone = m.status === 'Administered';

                return (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                      isDone
                        ? 'bg-[#051625]/60 border-[#145B89]/40 opacity-70'
                        : 'bg-[#051625] border-[#27B9FF]/50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white truncate">
                        <span>{m.patient_name}</span>
                        <span className="text-[10px] font-mono text-[#23D5F4]">({m.bed_code})</span>
                      </div>
                      <div className="text-[11px] text-[#38DDF7] font-semibold mt-0.5">
                        {m.medication} · {m.dosage}
                      </div>
                      <div className="text-[10px] text-[#718BA5] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#27B9FF]" />
                        <span>Due {m.due_time} ({m.route})</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAdministerMed(m.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 ${
                        isDone
                          ? 'bg-[#18E1C1]/20 text-[#18E1C1] border border-[#18E1C1]/50'
                          : 'bg-[#087FC7]/30 hover:bg-[#087FC7]/60 text-[#23D5F4] border border-[#27B9FF]/50'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isDone ? 'Given' : 'Give'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
