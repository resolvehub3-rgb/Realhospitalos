import React from 'react';
import { ArrowLeft, TrendingUp, Users, Clock, Award, Activity } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { HourlyFlow, EmergencyWaitTrend } from '../../types/hospital';

interface ReportsViewProps {
  patientFlow: HourlyFlow[];
  emergencyTrend: EmergencyWaitTrend[];
  satisfactionScore: number;
  bedOccupancyPct: number;
  onBackToOverview: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  patientFlow,
  emergencyTrend,
  satisfactionScore,
  bedOccupancyPct,
  onBackToOverview,
}) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToOverview}
            className="p-2 rounded-xl bg-[#051625] border border-[#145B89] hover:border-[#23D5F4] text-[#718BA5] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-[#F1F7FF]">Operational Reports & Analytics</h2>
            <p className="text-xs text-[#718BA5]">
              Executive clinical telemetry, discharge velocities, and emergency wait distributions
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Patient Hourly Inflow */}
        <div className="bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#F1F7FF] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#23D5F4]" />
              <span>Full-Day Patient Admissions & Inflow</span>
            </h3>
            <span className="text-xs font-mono text-[#36D6A4] font-semibold">Peak at 6:00 PM</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={patientFlow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0E3554" />
                <XAxis dataKey="hour" tick={{ fill: '#718BA5', fontSize: 11 }} />
                <YAxis tick={{ fill: '#718BA5', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#051625', borderColor: '#27B9FF', borderRadius: 8 }}
                />
                <Bar dataKey="patients" fill="#23D5F4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emergency Wait Time Trend */}
        <div className="bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#F1F7FF] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF873D]" />
              <span>Emergency Waiting Times (Minutes)</span>
            </h3>
            <span className="text-xs font-mono text-[#FF873D] font-semibold">Average: 18 min</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={emergencyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0E3554" />
                <XAxis dataKey="time" tick={{ fill: '#718BA5', fontSize: 11 }} />
                <YAxis tick={{ fill: '#718BA5', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#051625', borderColor: '#FF873D', borderRadius: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="wait_minutes"
                  stroke="#FF873D"
                  strokeWidth={2.5}
                  dot={{ fill: '#FF873D', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary KPI Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0E3554] border border-[#145B89] flex items-center justify-center text-[#23D5F4]">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#718BA5]">Capacity Utilization</div>
            <div className="text-xl font-bold text-white font-mono">{bedOccupancyPct}%</div>
            <div className="text-[10px] text-[#36D6A4] mt-0.5">Within target efficiency zone</div>
          </div>
        </div>

        <div className="bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0E3554] border border-[#145B89] flex items-center justify-center text-[#18E1C1]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#718BA5]">Patient Satisfaction</div>
            <div className="text-xl font-bold text-white font-mono">{satisfactionScore} / 5.0</div>
            <div className="text-[10px] text-[#36D6A4] mt-0.5">Top 5% regional benchmark</div>
          </div>
        </div>

        <div className="bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0E3554] border border-[#145B89] flex items-center justify-center text-[#FFB34F]">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#718BA5]">Triage Response Latency</div>
            <div className="text-xl font-bold text-white font-mono">3.8 min</div>
            <div className="text-[10px] text-[#36D6A4] mt-0.5">Resuscitation code compliant</div>
          </div>
        </div>
      </div>
    </div>
  );
};
