import React from 'react';
import { ArrowLeft, Users, Bed, Stethoscope, Activity, ShieldAlert, Heart, Scan, Baby, Bone } from 'lucide-react';
import { DepartmentMetric } from '../../types/hospital';

interface DepartmentsViewProps {
  departments: DepartmentMetric[];
  onBackToOverview: () => void;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  departments,
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
            <h2 className="text-lg font-bold text-[#F1F7FF]">Hospital Department Operations</h2>
            <p className="text-xs text-[#718BA5]">
              Real-time capacity, staff deployment, and efficiency index across specialized wings
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const isEmergency = dept.is_emergency || dept.name === 'Emergency';
          const occupancyPct = Math.round((dept.beds_occupied / dept.beds_total) * 100);

          return (
            <div
              key={dept.id}
              className={`p-4 rounded-2xl border transition-all ${
                isEmergency
                  ? 'bg-[#1C120C]/90 border-[#FF873D]/60'
                  : 'bg-[#071D30]/90 border-[#145B89]/70 hover:border-[#27B9FF]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isEmergency
                        ? 'bg-[#3A1E14] text-[#FF873D]'
                        : 'bg-[#0E3554] text-[#23D5F4]'
                    }`}
                  >
                    {isEmergency ? <ShieldAlert className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F1F7FF]">{dept.name}</h3>
                    <span className="text-[10px] text-[#718BA5]">Wing Operative</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-lg font-bold font-mono ${
                      isEmergency ? 'text-[#FF873D]' : 'text-[#23D5F4]'
                    }`}
                  >
                    {dept.performance_pct}%
                  </span>
                  <div className="text-[9px] text-[#718BA5] uppercase">Performance</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-[#051625] rounded-full overflow-hidden border border-[#145B89]/50 mb-3">
                <div
                  className={`h-full rounded-full ${isEmergency ? 'bg-[#FF873D]' : 'bg-[#23D5F4]'}`}
                  style={{ width: `${dept.performance_pct}%` }}
                />
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-[#145B89]/50">
                <div className="bg-[#051625]/60 p-2 rounded-xl">
                  <div className="text-[#718BA5] text-[10px] flex items-center justify-center gap-1">
                    <Users className="w-3 h-3 text-[#23D5F4]" /> Census
                  </div>
                  <div className="font-bold text-white mt-0.5">{dept.active_patients}</div>
                </div>

                <div className="bg-[#051625]/60 p-2 rounded-xl">
                  <div className="text-[#718BA5] text-[10px] flex items-center justify-center gap-1">
                    <Stethoscope className="w-3 h-3 text-[#18E1C1]" /> Staff
                  </div>
                  <div className="font-bold text-white mt-0.5">{dept.total_staff}</div>
                </div>

                <div className="bg-[#051625]/60 p-2 rounded-xl">
                  <div className="text-[#718BA5] text-[10px] flex items-center justify-center gap-1">
                    <Bed className="w-3 h-3 text-[#FFB34F]" /> Beds
                  </div>
                  <div className="font-bold text-white mt-0.5 font-mono">
                    {dept.beds_occupied}/{dept.beds_total}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
