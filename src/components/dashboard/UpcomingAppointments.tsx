import React, { useState } from 'react';
import { User, MoreVertical, Stethoscope, Heart, Baby, Bone, Scan, Plus, CheckCircle2, Clock } from 'lucide-react';
import { Appointment } from '../../types/hospital';

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
  onOpenNewAppointment: () => void;
  onSelectAppointment: (apt: Appointment) => void;
}

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({
  appointments,
  onOpenNewAppointment,
  onSelectAppointment,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const getDepartmentIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('cardio')) return Heart;
    if (lower.includes('pediatric')) return Baby;
    if (lower.includes('ortho')) return Bone;
    if (lower.includes('radio')) return Scan;
    return Stethoscope;
  };

  return (
    <div className="bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-3.5 shadow-sm">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-xs sm:text-sm font-semibold text-[#F1F7FF] tracking-wide">
          Upcoming Appointments
        </h3>
        <button
          onClick={onOpenNewAppointment}
          className="text-[11px] text-[#23D5F4] hover:text-[#38DDF7] flex items-center gap-1 font-medium hover:underline cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Book</span>
        </button>
      </div>

      <div className="space-y-1.5">
        {appointments.slice(0, 5).map((apt) => {
          const DeptIcon = getDepartmentIcon(apt.appointment_type || apt.department);
          const isMenuOpen = activeMenuId === apt.id;

          return (
            <div
              key={apt.id}
              className="relative group bg-[#051625]/60 hover:bg-[#0A2640] border border-[#145B89]/40 hover:border-[#23D5F4]/50 rounded-xl px-2.5 py-2 flex items-center justify-between gap-2.5 transition-colors"
            >
              {/* Left: Patient Icon */}
              <div
                onClick={() => onSelectAppointment(apt)}
                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#0E3554] border border-[#18E1C1]/60 flex items-center justify-center shrink-0 text-[#18E1C1]">
                  <User className="w-3.5 h-3.5" />
                </div>

                {/* Time */}
                <span className="text-xs font-semibold text-[#F1F7FF] tabular-nums font-mono shrink-0">
                  {apt.scheduled_time}
                </span>

                {/* Appointment Type / Department */}
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <DeptIcon className="w-3.5 h-3.5 text-[#23D5F4] shrink-0" />
                  <span className="text-xs text-[#A7BED3] group-hover:text-white transition-colors truncate">
                    {apt.appointment_type || apt.department}
                  </span>
                </div>
              </div>

              {/* Three dots contextual menu */}
              <div className="relative shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(isMenuOpen ? null : apt.id);
                  }}
                  className="p-1 rounded-md text-[#718BA5] hover:text-white hover:bg-[#071D30] transition-colors cursor-pointer"
                  title="Appointment Actions"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {isMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[#071D30] border border-[#27B9FF]/50 shadow-2xl py-1 z-30 animate-fadeIn text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        onSelectAppointment(apt);
                        setActiveMenuId(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#0A2640] text-[#F1F7FF] flex items-center gap-2"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#23D5F4]" />
                      <span>View Patient Details</span>
                    </button>
                    <button
                      onClick={() => {
                        alert(`Appointment marked checked-in for ${apt.patient_name}`);
                        setActiveMenuId(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#0A2640] text-[#36D6A4] flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#36D6A4]" />
                      <span>Check-In Patient</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
