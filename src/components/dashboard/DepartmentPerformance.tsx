import React from 'react';
import { Ambulance, Heart, Scan, Baby, Bone, LucideIcon } from 'lucide-react';
import { DepartmentMetric } from '../../types/hospital';

interface DepartmentPerformanceProps {
  departments: DepartmentMetric[];
  onSelectDepartment?: (dept: DepartmentMetric) => void;
}

const iconMap: Record<string, LucideIcon> = {
  ambulance: Ambulance,
  heart: Heart,
  scan: Scan,
  baby: Baby,
  bone: Bone,
};

export const DepartmentPerformance: React.FC<DepartmentPerformanceProps> = ({
  departments,
  onSelectDepartment,
}) => {
  return (
    <div className="bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-3.5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs sm:text-sm font-semibold text-[#F1F7FF] tracking-wide">
          Department Performance
        </h3>
        <span className="text-[10px] text-[#718BA5]">Live Capacity Index</span>
      </div>

      <div className="space-y-2.5">
        {departments.map((dept) => {
          const Icon = iconMap[dept.icon_name] || Heart;
          const isEmergency = dept.is_emergency || dept.name.toLowerCase().includes('emergency');
          const barColor = isEmergency ? 'bg-[#FF873D]' : 'bg-[#23D5F4]';
          const iconColor = isEmergency ? 'text-[#FF873D]' : 'text-[#23D5F4]';

          return (
            <div
              key={dept.id}
              onClick={() => onSelectDepartment && onSelectDepartment(dept)}
              className="group cursor-pointer flex items-center gap-3 py-0.5"
            >
              {/* Department Icon */}
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <Icon className={`w-4 h-4 ${iconColor} transition-transform group-hover:scale-110`} />
              </div>

              {/* Department Name */}
              <span className="w-24 text-xs font-medium text-[#A7BED3] group-hover:text-white transition-colors truncate">
                {dept.name}
              </span>

              {/* Horizontal Progress Bar */}
              <div className="flex-1 h-2 bg-[#051625] rounded-full overflow-hidden border border-[#145B89]/50">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                  style={{ width: `${dept.performance_pct}%` }}
                />
              </div>

              {/* Percentage label */}
              <span className="w-9 text-right text-xs font-semibold text-[#F1F7FF] tabular-nums font-mono">
                {dept.performance_pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
