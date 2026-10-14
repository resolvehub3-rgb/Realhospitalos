import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { StaffBreakdown } from '../../types/hospital';

interface StaffAvailabilityProps {
  data: StaffBreakdown;
  onOpenStaffDirectory?: () => void;
}

export const StaffAvailability: React.FC<StaffAvailabilityProps> = ({
  data,
  onOpenStaffDirectory,
}) => {
  const chartData = [
    { name: 'Doctors', value: data.doctors, color: '#18E1C1' },
    { name: 'Nurses', value: data.nurses, color: '#27B9FF' },
    { name: 'Technicians', value: data.technicians, color: '#FF873D' },
    { name: 'Support', value: data.support, color: '#A7BED3' },
  ];

  return (
    <div
      onClick={onOpenStaffDirectory}
      className="bg-[#071D30]/90 hover:bg-[#0A2640] border border-[#145B89]/70 hover:border-[#27B9FF]/60 rounded-2xl p-3 sm:p-3.5 shadow-sm transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs sm:text-sm font-semibold text-[#F1F7FF] tracking-wide">
          Staff Availability
        </h3>
        <span className="text-[10px] text-[#36D6A4] font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#36D6A4]" />
          Shift Active
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Donut Chart with center total */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={28}
                outerRadius={40}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-[#051625] border border-[#145B89] px-2 py-1 rounded text-xs">
                        <span style={{ color: item.color }} className="font-semibold">{item.name}: </span>
                        <span className="text-white font-mono">{item.value}</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Donut Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-sm font-bold text-[#F1F7FF] tabular-nums leading-none">
              {data.total}
            </span>
            <span className="text-[8px] text-[#718BA5] font-medium leading-tight mt-0.5">
              Total Staff
            </span>
          </div>
        </div>

        {/* Legend list */}
        <div className="flex-1 grid grid-cols-1 gap-1 text-[11px]">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[#A7BED3] truncate">{item.name}</span>
              </div>
              <span className="font-semibold text-[#F1F7FF] tabular-nums font-mono text-xs">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
