import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Building,
  MapPin,
  Search,
  FileText,
  AlertCircle,
  XCircle,
  Stethoscope,
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../../types/hospital';
import { hospitalDataService } from '../../services/hospitalDataService';

interface AppointmentsViewProps {
  appointments: Appointment[];
  onOpenNewAppointment: () => void;
  onOpenEncounterModal: (encounterId?: string, patientName?: string, doctorName?: string) => void;
  onBackToOverview: () => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  onOpenNewAppointment,
  onOpenEncounterModal,
  onBackToOverview,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentUser = hospitalDataService.getCurrentUser();

  const filtered = appointments.filter((a) => {
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchDept = filterDepartment === 'all' || a.department === filterDepartment;
    const matchSearch =
      !searchQuery ||
      a.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.doctor_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchDept && matchSearch;
  });

  const handleUpdateStatus = (id: string, newStatus: AppointmentStatus) => {
    hospitalDataService.updateAppointmentStatus(id, newStatus);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Checked-In':
        return 'bg-[#0E4237] text-[#36D6A4] border-[#36D6A4]/40';
      case 'In Consultation':
        return 'bg-[#0E3554] text-[#23D5F4] border-[#23D5F4]/40';
      case 'Completed':
        return 'bg-[#0A2D46] text-[#A7BED3] border-[#145B89]';
      case 'Confirmed':
        return 'bg-[#18364F] text-[#38DDF7] border-[#38DDF7]/40';
      case 'Cancelled':
      case 'No Show':
        return 'bg-[#3A1414] text-[#FF634D] border-[#FF634D]/40';
      default:
        return 'bg-[#051625] text-[#A7BED3] border-[#145B89]';
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToOverview}
            className="p-2 rounded-xl bg-[#051625] border border-[#145B89] hover:border-[#23D5F4] text-[#718BA5] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-[#F1F7FF]">Hospital Appointments & Clinical Queue</h2>
            <p className="text-xs text-[#718BA5]">
              Daily clinic schedule: {appointments.length} consultations · Active status transitions & encounter linkage
            </p>
          </div>
        </div>

        <button
          onClick={onOpenNewAppointment}
          className="px-4 py-2 rounded-xl bg-[#087FC7] hover:bg-[#27B9FF] text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(39,185,255,0.4)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-2.5 bg-[#071D30]/70 p-3 rounded-2xl border border-[#145B89]/60 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#718BA5]" />
          <input
            type="text"
            placeholder="Search by patient name or attending doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#051625] border border-[#145B89] text-xs text-[#F1F7FF] outline-none"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-[#051625] border border-[#145B89] text-xs text-[#F1F7FF] outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Checked-In">Checked-In</option>
          <option value="In Consultation">In Consultation</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="No Show">No Show</option>
        </select>

        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-[#051625] border border-[#145B89] text-xs text-[#F1F7FF] outline-none"
        >
          <option value="all">All Departments</option>
          <option value="Cardiology">Cardiology</option>
          <option value="General Consultation">General Consultation</option>
          <option value="Pediatrics">Pediatrics</option>
          <option value="Orthopedics">Orthopedics</option>
          <option value="Radiology">Radiology</option>
        </select>
      </div>

      {/* Appointment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((apt) => (
          <div
            key={apt.id}
            className="bg-[#071D30]/90 border border-[#145B89]/70 hover:border-[#27B9FF]/60 rounded-2xl p-4 flex flex-col justify-between shadow-sm transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#0E3554] border border-[#23D5F4]/40 text-[#23D5F4]">
                  {apt.scheduled_time} · {apt.date}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(
                    apt.status
                  )}`}
                >
                  {apt.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <User className="w-4 h-4 text-[#18E1C1]" />
                <span>{apt.patient_name}</span>
                {apt.patient_mrn && (
                  <span className="text-[10px] font-mono text-[#718BA5] font-normal">
                    ({apt.patient_mrn})
                  </span>
                )}
              </h3>

              <div className="text-xs text-[#23D5F4] font-medium mb-2">
                {apt.appointment_type}
              </div>

              <div className="space-y-1 text-[11px] text-[#A7BED3] pt-2 border-t border-[#145B89]/40">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#718BA5]" />
                  <span>
                    {apt.department} · {apt.doctor_name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#718BA5]" />
                  <span>{apt.room}</span>
                </div>
                {apt.checked_in_at && (
                  <div className="text-[10px] text-[#36D6A4] font-mono">
                    Checked in at: {apt.checked_in_at}
                  </div>
                )}
              </div>
            </div>

            {/* Status Workflow Action Buttons */}
            <div className="mt-3.5 pt-2.5 border-t border-[#145B89]/40 flex flex-wrap items-center justify-end gap-1.5 text-xs">
              {apt.status === 'Scheduled' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(apt.id, 'Confirmed')}
                    className="px-2.5 py-1 rounded-lg bg-[#051625] hover:bg-[#071D30] border border-[#145B89] text-[11px] text-[#38DDF7] transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(apt.id, 'Checked-In')}
                    className="px-2.5 py-1 rounded-lg bg-[#0E4237] hover:bg-[#125849] border border-[#36D6A4] text-[11px] font-semibold text-[#36D6A4] flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Check In
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                    className="px-2 py-1 rounded-lg bg-[#051625] hover:bg-[#3A1414] text-[11px] text-[#FF634D] transition-colors"
                    title="Cancel Appointment"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              {apt.status === 'Confirmed' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(apt.id, 'Checked-In')}
                    className="px-2.5 py-1 rounded-lg bg-[#0E4237] hover:bg-[#125849] border border-[#36D6A4] text-[11px] font-semibold text-[#36D6A4] flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Check In Patient
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(apt.id, 'No Show')}
                    className="px-2.5 py-1 rounded-lg bg-[#051625] hover:bg-[#3A1E14] text-[11px] text-[#FF873D] transition-colors"
                  >
                    No Show
                  </button>
                </>
              )}

              {apt.status === 'Checked-In' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(apt.id, 'In Consultation');
                    onOpenEncounterModal(apt.encounter_id, apt.patient_name, apt.doctor_name);
                  }}
                  className="px-3 py-1 rounded-lg bg-[#087FC7] hover:bg-[#27B9FF] text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <Stethoscope className="w-3 h-3" /> Begin Consultation
                </button>
              )}

              {apt.status === 'In Consultation' && (
                <button
                  onClick={() => {
                    onOpenEncounterModal(apt.encounter_id, apt.patient_name, apt.doctor_name);
                  }}
                  className="px-3 py-1 rounded-lg bg-[#18E1C1] hover:bg-[#43E8B7] text-[#03101E] text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <FileText className="w-3 h-3" /> Document / Complete
                </button>
              )}

              {apt.status === 'Completed' && (
                <button
                  onClick={() => onOpenEncounterModal(apt.encounter_id, apt.patient_name, apt.doctor_name)}
                  className="text-[11px] text-[#23D5F4] hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" /> View Clinical Record
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
