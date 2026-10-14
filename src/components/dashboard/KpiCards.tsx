import React from 'react';
import { UsersRound, CalendarDays, Ambulance, Stethoscope } from 'lucide-react';

interface KpiCardsProps {
  patientsToday: number;
  patientsTrendPct: number;
  appointmentsToday: number;
  appointmentsTrendPct: number;
  emergencyCases: number;
  emergencyTrendPct: number;
  staffOnDuty: number;
  staffTrendPct: number;
  onSelectKpi?: (type: 'patients' | 'appointments' | 'emergency' | 'staff') => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  patientsToday,
  patientsTrendPct,
  appointmentsToday,
  appointmentsTrendPct,
  emergencyCases,
  emergencyTrendPct,
  staffOnDuty,
  staffTrendPct,
  onSelectKpi,
}) => {
  const cards = [
    {
      id: 'patients' as const,
      label: 'Patients Today',
      value: patientsToday,
      trend: `↑ ${patientsTrendPct}%`,
      trendColor: 'text-[#36D6A4]',
      icon: UsersRound,
      iconColor: 'text-[#23D5F4]',
      iconBg: 'bg-[#0E3554]/60 border border-[#145B89]/80',
    },
    {
      id: 'appointments' as const,
      label: 'Appointments',
      value: appointmentsToday,
      trend: `↑ ${appointmentsTrendPct}%`,
      trendColor: 'text-[#36D6A4]',
      icon: CalendarDays,
      iconColor: 'text-[#23D5F4]',
      iconBg: 'bg-[#0E3554]/60 border border-[#145B89]/80',
    },
    {
      id: 'emergency' as const,
      label: 'Emergency',
      value: emergencyCases,
      trend: `↑ ${emergencyTrendPct}%`,
      trendColor: 'text-[#FF873D]',
      icon: Ambulance,
      iconColor: 'text-[#FF873D]',
      iconBg: 'bg-[#3A1E14]/60 border border-[#FF873D]/50',
    },
    {
      id: 'staff' as const,
      label: 'Staff On Duty',
      value: staffOnDuty,
      trend: `↑ ${staffTrendPct}%`,
      trendColor: 'text-[#36D6A4]',
      icon: Stethoscope,
      iconColor: 'text-[#23D5F4]',
      iconBg: 'bg-[#0E3554]/60 border border-[#145B89]/80',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            onClick={() => onSelectKpi && onSelectKpi(card.id)}
            className="group relative bg-[#071D30]/90 hover:bg-[#0A2640] border border-[#145B89]/70 hover:border-[#27B9FF]/80 rounded-2xl p-3 sm:p-3.5 flex items-center gap-3 transition-all duration-200 text-left shadow-sm cursor-pointer"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
              <Icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-medium text-[#718BA5] tracking-wide truncate">
                {card.label}
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl sm:text-2xl font-bold text-[#F1F7FF] tabular-nums tracking-tight">
                  {card.value.toLocaleString()}
                </span>
                <span className={`text-[11px] sm:text-xs font-semibold tabular-nums ${card.trendColor}`}>
                  {card.trend}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
