import React, { useState } from 'react';
import {
  UserCheck,
  Calendar,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Users,
  Building2,
  FileCheck,
  Plus,
} from 'lucide-react';
import { Appointment, CurrentUser, Patient } from '../../types/hospital';
import { hospitalDataService } from '../../services/hospitalDataService';

interface ReceptionistDashboardProps {
  currentUser: CurrentUser;
  appointments: Appointment[];
  patients: Patient[];
  onOpenNewAppointment: () => void;
  onOpenAdmitModal: () => void;
  onRefresh: () => void;
}

export const ReceptionistDashboard: React.FC<ReceptionistDashboardProps> = ({
  currentUser,
  appointments,
  patients,
  onOpenNewAppointment,
  onOpenAdmitModal,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleUpdateStatus = async (
    id: string,
    newStatus: Appointment['status']
  ) => {
    await hospitalDataService.updateAppointmentStatus(id, newStatus);
    onRefresh();
  };

  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      a.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const checkedInCount = appointments.filter((a) => a.status === 'Checked-In').length;
  const scheduledCount = appointments.filter((a) => a.status === 'Scheduled').length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;

  return (
    <div className="space-y-4">
      {/* Receptionist Header Banner */}
      <div className="bg-gradient-to-r from-[#071D30] via-[#08303C] to-[#071D30] border border-[#36D6A4]/60 rounded-3xl p-4 sm:p-5 shadow-[0_0_30px_rgba(54,214,164,0.18)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#36D6A4]/20 border border-[#36D6A4] flex items-center justify-center text-[#36D6A4] shadow-[0_0_15px_rgba(54,214,164,0.4)]">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Patient Admissions & Reception Desk
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#36D6A4]/20 text-[#36D6A4] border border-[#36D6A4]/60">
                Front Desk Live
              </span>
            </div>
            <p className="text-xs text-[#718BA5] font-medium mt-0.5">
              Registrar: <strong className="text-white">{currentUser.name}</strong> · Patient Access Services
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAdmitModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#36D6A4] to-[#23D5F4] text-[#03101E] font-bold text-xs shadow-[0_0_15px_rgba(54,214,164,0.4)] hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Admit / Register Patient</span>
          </button>
          <button
            onClick={onOpenNewAppointment}
            className="px-4 py-2 rounded-xl bg-[#071D30] border border-[#27B9FF]/60 hover:border-[#27B9FF] text-[#23D5F4] hover:text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* 4 Receptionist Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Scheduled Today</span>
            <Calendar className="w-4 h-4 text-[#27B9FF]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">{appointments.length}</div>
          <div className="text-[10px] text-[#27B9FF] mt-0.5 font-medium">On today's master calendar</div>
        </div>

        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Checked-In Waiting</span>
            <Clock className="w-4 h-4 text-[#36D6A4]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#36D6A4] font-mono">{checkedInCount}</div>
          <div className="text-[10px] text-[#36D6A4] mt-0.5 font-medium">In waiting area</div>
        </div>

        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Completed Consults</span>
            <CheckCircle2 className="w-4 h-4 text-[#18E1C1]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">{completedCount}</div>
          <div className="text-[10px] text-[#18E1C1] mt-0.5 font-medium">Finished with doctor</div>
        </div>

        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Registered Patients</span>
            <Users className="w-4 h-4 text-[#23D5F4]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">{patients.length}</div>
          <div className="text-[10px] text-[#23D5F4] mt-0.5 font-medium">In hospital database</div>
        </div>
      </div>

      {/* Main Appointment Check-in & Intake Desk */}
      <div className="bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4">
        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718BA5]" />
            <input
              type="text"
              placeholder="Search by patient name, attending doctor, or clinic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-white placeholder-[#4D6982] outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {['all', 'Scheduled', 'Checked-In', 'Completed', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filterStatus === st
                    ? 'bg-[#36D6A4]/20 text-[#36D6A4] border border-[#36D6A4]/60'
                    : 'bg-[#051625] text-[#718BA5] hover:text-white border border-[#145B89]/50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Appointment Table */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar">
          {filteredAppointments.map((apt) => {
            const isCheckedIn = apt.status === 'Checked-In';
            const isCompleted = apt.status === 'Completed';

            return (
              <div
                key={apt.id}
                className="p-3 rounded-xl bg-[#051625] border border-[#145B89]/60 hover:border-[#27B9FF]/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="font-mono text-xs font-bold text-[#23D5F4] bg-[#071D30] px-2.5 py-1.5 rounded-lg border border-[#145B89] shrink-0 text-center">
                    <div>{apt.scheduled_time}</div>
                    <div className="text-[9px] text-[#718BA5]">{apt.room}</div>
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-2">
                      <span>{apt.patient_name}</span>
                      {apt.patient_mrn && (
                        <span className="font-mono text-[10px] text-[#A7BED3] bg-[#071D30] px-1.5 rounded border border-[#145B89]">
                          {apt.patient_mrn}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#718BA5] truncate">
                      {apt.appointment_type} · With <strong className="text-[#A7BED3]">{apt.doctor_name}</strong> ({apt.department})
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      isCheckedIn
                        ? 'bg-[#36D6A4]/15 text-[#36D6A4] border-[#36D6A4]/50'
                        : isCompleted
                        ? 'bg-[#18E1C1]/15 text-[#18E1C1] border-[#18E1C1]/50'
                        : 'bg-[#145B89]/30 text-[#718BA5] border-[#145B89]'
                    }`}
                  >
                    {apt.status}
                  </span>

                  {apt.status === 'Scheduled' && (
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'Checked-In')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#36D6A4]/20 hover:bg-[#36D6A4]/40 border border-[#36D6A4]/60 text-[#36D6A4] text-xs font-bold transition-colors cursor-pointer"
                    >
                      Check-In
                    </button>
                  )}

                  {apt.status === 'Checked-In' && (
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'Completed')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#18E1C1]/20 hover:bg-[#18E1C1]/40 border border-[#18E1C1]/60 text-[#18E1C1] text-xs font-bold transition-colors cursor-pointer"
                    >
                      Complete
                    </button>
                  )}

                  {apt.status !== 'Cancelled' && !isCompleted && (
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                      title="Cancel appointment"
                      className="p-1.5 rounded-lg text-[#718BA5] hover:text-[#FF873D] hover:bg-[#FF873D]/10 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredAppointments.length === 0 && (
            <div className="py-8 text-center text-xs text-[#718BA5]">
              No appointments matching search filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
