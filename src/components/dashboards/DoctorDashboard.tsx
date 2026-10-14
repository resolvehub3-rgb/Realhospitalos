import React, { useState } from 'react';
import {
  Stethoscope,
  Users,
  Clock,
  Activity,
  FileText,
  AlertTriangle,
  Plus,
  Heart,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Appointment, ClinicalEncounter, CurrentUser, Patient } from '../../types/hospital';

interface DoctorDashboardProps {
  currentUser: CurrentUser;
  patients: Patient[];
  appointments: Appointment[];
  encounters: ClinicalEncounter[];
  onOpenEncounter: (encounterId?: string, patientName?: string, doctorName?: string) => void;
  onOpenNewAppointment: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  currentUser,
  patients,
  appointments,
  encounters,
  onOpenEncounter,
  onOpenNewAppointment,
}) => {
  const [filterDept, setFilterDept] = useState<string>('all');

  // Filter doctor's consultations
  const myAppointments = appointments.filter(
    (a) =>
      a.doctor_name.toLowerCase().includes(currentUser.name.toLowerCase()) ||
      currentUser.role === 'Administrator' ||
      currentUser.department === a.department
  );

  // Inpatients in ward
  const inpatients = patients.filter(
    (p) => p.status === 'Admitted' || p.status === 'Observation'
  );

  // Abnormal vitals trigger
  const alertVitals = patients.filter(
    (p) =>
      p.vital_signs.heart_rate > 100 ||
      p.vital_signs.heart_rate < 55 ||
      p.vital_signs.sp_o2 < 95 ||
      p.vital_signs.temperature_c > 38.0
  );

  return (
    <div className="space-y-4">
      {/* Doctor Header Banner */}
      <div className="bg-gradient-to-r from-[#071D30] via-[#0E3554] to-[#071D30] border border-[#18E1C1]/60 rounded-3xl p-4 sm:p-5 shadow-[0_0_30px_rgba(24,225,193,0.18)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#18E1C1]/20 border border-[#18E1C1] flex items-center justify-center text-[#18E1C1] shadow-[0_0_15px_rgba(24,225,193,0.4)]">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Physician Clinical Workstation
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#18E1C1]/20 text-[#18E1C1] border border-[#18E1C1]/60">
                Dr. Active Session
              </span>
            </div>
            <p className="text-xs text-[#718BA5] font-medium mt-0.5">
              Logged in as <strong className="text-white">{currentUser.name}</strong> · {currentUser.department} Specialty Ward
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenEncounter(undefined, undefined, currentUser.name)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#18E1C1] to-[#23D5F4] text-[#03101E] font-bold text-xs shadow-[0_0_15px_rgba(24,225,193,0.4)] hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record Clinical Encounter</span>
          </button>
        </div>
      </div>

      {/* 4 Clinical KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Inpatients Assigned</span>
            <Users className="w-4 h-4 text-[#18E1C1]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">{inpatients.length}</div>
          <div className="text-[10px] text-[#18E1C1] mt-0.5 font-medium">Currently in beds under care</div>
        </div>

        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Consultation Queue</span>
            <Calendar className="w-4 h-4 text-[#27B9FF]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">{myAppointments.length}</div>
          <div className="text-[10px] text-[#27B9FF] mt-0.5 font-medium">Scheduled for today</div>
        </div>

        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Clinical Encounters</span>
            <FileText className="w-4 h-4 text-[#38DDF7]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">{encounters.length}</div>
          <div className="text-[10px] text-[#38DDF7] mt-0.5 font-medium">Documented records</div>
        </div>

        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Abnormal Vitals Alerts</span>
            <AlertTriangle className="w-4 h-4 text-[#FF873D]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#FF873D] font-mono">{alertVitals.length}</div>
          <div className="text-[10px] text-[#FF873D] mt-0.5 font-medium">Patients requiring clinical review</div>
        </div>
      </div>

      {/* Main 2 Columns: Scheduled Consultations & Inpatient Ward Census */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column (7 Cols): Today's Consultations */}
        <div className="lg:col-span-7 bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#23D5F4]" />
                <h3 className="text-sm font-bold text-white">Today's Patient Consultations</h3>
              </div>
              <button
                onClick={onOpenNewAppointment}
                className="text-[11px] font-bold text-[#23D5F4] hover:text-white transition-colors cursor-pointer"
              >
                + Add Appointment
              </button>
            </div>

            <div className="space-y-2">
              {myAppointments.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => onOpenEncounter(apt.encounter_id, apt.patient_name, apt.doctor_name)}
                  className="p-3 rounded-xl bg-[#051625] hover:bg-[#0A2640] border border-[#145B89]/60 hover:border-[#23D5F4] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-bold text-[#23D5F4] bg-[#071D30] px-2 py-1 rounded border border-[#145B89]">
                      {apt.scheduled_time}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white group-hover:text-[#23D5F4] truncate">
                        {apt.patient_name}
                      </div>
                      <div className="text-[10px] text-[#718BA5] truncate">
                        {apt.appointment_type} · {apt.room}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#145B89]/40 text-[#A7BED3] border border-[#145B89]">
                      {apt.status}
                    </span>
                    <button className="px-2.5 py-1 rounded-lg bg-[#087FC7]/20 hover:bg-[#087FC7]/50 text-[#23D5F4] text-[10px] font-bold flex items-center gap-1 border border-[#27B9FF]/50 transition-colors">
                      <span>EHR Chart</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {myAppointments.length === 0 && (
                <div className="py-8 text-center text-xs text-[#718BA5]">
                  No consultations scheduled for this shift.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Inpatient Vitals & Census */}
        <div className="lg:col-span-5 bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#18E1C1]" />
                <h3 className="text-sm font-bold text-white">Inpatient Ward Census</h3>
              </div>
              <span className="text-[10px] font-mono text-[#18E1C1] bg-[#18E1C1]/10 px-2 py-0.5 rounded border border-[#18E1C1]/40">
                {inpatients.length} Inpatients
              </span>
            </div>

            <div className="space-y-2 max-h-[340px] overflow-y-auto custom-scrollbar">
              {inpatients.map((pat) => {
                const hasAbnormal =
                  pat.vital_signs.heart_rate > 100 ||
                  pat.vital_signs.sp_o2 < 95 ||
                  pat.vital_signs.temperature_c > 38.0;

                return (
                  <div
                    key={pat.id}
                    onClick={() => onOpenEncounter(undefined, pat.full_name, pat.attending_doctor)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      hasAbnormal
                        ? 'bg-[#051625] border-[#FF873D]/60 hover:border-[#FF873D]'
                        : 'bg-[#051625] border-[#145B89]/60 hover:border-[#18E1C1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{pat.full_name}</span>
                          {hasAbnormal && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF873D] animate-ping" />
                          )}
                        </div>
                        <div className="text-[10px] text-[#718BA5]">
                          {pat.department} · Bed {pat.bed_assigned || 'Unassigned'}
                        </div>
                      </div>

                      <span className="font-mono text-[10px] text-[#23D5F4] bg-[#071D30] px-1.5 py-0.5 rounded border border-[#145B89]">
                        {pat.mrn}
                      </span>
                    </div>

                    {/* Vitals Ribbon */}
                    <div className="grid grid-cols-4 gap-1 mt-2 pt-1.5 border-t border-[#145B89]/40 text-[10px] font-mono">
                      <div>
                        <span className="text-[#718BA5]">HR: </span>
                        <span className={pat.vital_signs.heart_rate > 100 ? 'text-[#FF873D] font-bold' : 'text-white'}>
                          {pat.vital_signs.heart_rate}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#718BA5]">BP: </span>
                        <span className="text-white">{pat.vital_signs.blood_pressure}</span>
                      </div>
                      <div>
                        <span className="text-[#718BA5]">O₂: </span>
                        <span className={pat.vital_signs.sp_o2 < 95 ? 'text-[#FF873D] font-bold' : 'text-white'}>
                          {pat.vital_signs.sp_o2}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[#718BA5]">T: </span>
                        <span className="text-white">{pat.vital_signs.temperature_c}°C</span>
                      </div>
                    </div>
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
