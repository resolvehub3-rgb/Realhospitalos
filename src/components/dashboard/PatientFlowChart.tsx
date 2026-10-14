import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { HourlyFlow } from '../../types/hospital';

interface PatientFlowChartProps {
  data: HourlyFlow[];
}

export const PatientFlowChart: React.FC<PatientFlowChartProps> = ({ data }) => {
  return (
    <div className="bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-3 sm:p-3.5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs sm:text-sm font-semibold text-[#F1F7FF] tracking-wide">
          Patient Flow
        </h3>
        <span className="text-[10px] font-medium text-[#718BA5]">
          Hourly Activity
        </span>
      </div>

      <div className="h-[96px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, left: -28, bottom: -6 }}>
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#718BA5', fontSize: 10, fontWeight: 500 }}
              interval={2}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#718BA5', fontSize: 9 }}
              width={30}
            />
            <Tooltip
              cursor={{ fill: 'rgba(35, 213, 244, 0.08)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as HourlyFlow;
                  return (
                    <div className="bg-[#051625] border border-[#27B9FF]/60 px-2.5 py-1.5 rounded-lg shadow-xl text-xs">
                      <span className="text-[#A7BED3]">{item.hour}: </span>
                      <strong className={item.is_peak ? 'text-[#FF873D]' : 'text-[#23D5F4]'}>
                        {item.patients} patients
                      </strong>
                      {item.is_peak && (
                        <span className="block text-[10px] text-[#FF873D] font-semibold mt-0.5">
                          Peak Inflow
                        </span>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="patients" radius={[3, 3, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.is_peak ? '#FF873D' : '#23D5F4'}
                  opacity={entry.is_peak ? 1 : 0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
