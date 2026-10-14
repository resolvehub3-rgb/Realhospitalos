import React from 'react';
import { Ambulance } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { EmergencyWaitTrend } from '../../types/hospital';

interface EmergencyStatusProps {
  status: 'Stable' | 'Elevated' | 'Critical';
  avgWaitTimeMinutes: number;
  trend: EmergencyWaitTrend[];
  onOpenEmergencyView?: () => void;
}

export const EmergencyStatus: React.FC<EmergencyStatusProps> = ({
  status = 'Stable',
  avgWaitTimeMinutes = 18,
  trend,
  onOpenEmergencyView,
}) => {
  return (
    <div
      onClick={onOpenEmergencyView}
      className="bg-[#071D30]/90 hover:bg-[#0A2640] border border-[#145B89]/70 hover:border-[#FF873D]/60 rounded-2xl p-3.5 shadow-sm transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs sm:text-sm font-semibold text-[#F1F7FF] tracking-wide">
          Emergency Status
        </h3>
        <span className="text-[10px] text-[#718BA5]">Live Triage Monitor</span>
      </div>

      <div className="flex items-center justify-between gap-4 mb-2">
        {/* Left: Ambulance Icon Badge */}
        <div className="w-11 h-11 rounded-xl bg-[#3A1E14]/70 border border-[#FF873D]/60 flex items-center justify-center shrink-0">
          <Ambulance className="w-5 h-5 text-[#FF873D]" />
        </div>

        {/* Status & Wait Time */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#36D6A4]" />
            <span className="text-xs font-semibold text-[#36D6A4] tracking-wide">
              {status}
            </span>
          </div>

          <div className="text-[11px] text-[#718BA5] font-medium mt-0.5">
            Average Wait Time
          </div>
          <div className="text-base font-bold text-[#F1F7FF] tabular-nums font-mono leading-none mt-0.5">
            {avgWaitTimeMinutes} min
          </div>
        </div>
      </div>

      {/* Sparkline / Line Chart */}
      <div className="h-16 w-full -mb-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#718BA5', fontSize: 9 }}
              interval={2}
            />
            <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as EmergencyWaitTrend;
                  return (
                    <div className="bg-[#051625] border border-[#FF873D]/60 px-2 py-1 rounded text-xs">
                      <span className="text-[#A7BED3]">{item.time}: </span>
                      <strong className="text-[#FF873D]">{item.wait_minutes} min wait</strong>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="wait_minutes"
              stroke="#FF873D"
              strokeWidth={2}
              dot={{ r: 2.5, fill: '#FF873D', stroke: '#071D30', strokeWidth: 1 }}
              activeDot={{ r: 4, fill: '#FF873D', stroke: '#FFF' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
