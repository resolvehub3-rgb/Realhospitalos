import React from 'react';
import { Pill, Activity, Droplets } from 'lucide-react';
import { MedicalResourceItem } from '../../types/hospital';

interface MedicalResourcesProps {
  resources: MedicalResourceItem[];
  onOpenInventory?: () => void;
}

export const MedicalResources: React.FC<MedicalResourcesProps> = ({
  resources,
  onOpenInventory,
}) => {
  const getResourceIcon = (category: string) => {
    switch (category) {
      case 'Medications':
        return <Pill className="w-5 h-5 text-[#23D5F4]" />;
      case 'Equipment':
        return <Activity className="w-5 h-5 text-[#23D5F4]" />;
      case 'Blood Supply':
        return <Droplets className="w-5 h-5 text-[#FF873D]" />;
      default:
        return <Activity className="w-5 h-5 text-[#23D5F4]" />;
    }
  };

  return (
    <div
      onClick={onOpenInventory}
      className="bg-[#071D30]/90 hover:bg-[#0A2640] border border-[#145B89]/70 hover:border-[#27B9FF]/60 rounded-2xl p-3.5 shadow-sm transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs sm:text-sm font-semibold text-[#F1F7FF] tracking-wide">
          Medical Resources
        </h3>
        <span className="text-[10px] text-[#36D6A4] font-medium">Optimal Reserves</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 text-center">
        {resources.map((item) => {
          return (
            <div
              key={item.id}
              className="bg-[#051625]/60 border border-[#145B89]/40 rounded-xl p-2.5 flex flex-col items-center justify-between"
            >
              {/* Icon Container */}
              <div className="w-9 h-9 rounded-lg bg-[#0E3554]/50 border border-[#145B89]/60 flex items-center justify-center mb-1.5">
                {getResourceIcon(item.category)}
              </div>

              {/* Percentage */}
              <div className="text-sm sm:text-base font-bold text-[#F1F7FF] tabular-nums font-mono leading-tight">
                {item.stock_percentage}%
              </div>

              {/* Label */}
              <div className="text-[10px] sm:text-[11px] text-[#718BA5] font-medium truncate w-full mt-0.5">
                {item.category}
              </div>

              {/* Mini progress bar */}
              <div className="w-full h-1.5 bg-[#071D30] rounded-full overflow-hidden mt-1.5 border border-[#145B89]/40">
                <div
                  className="h-full rounded-full bg-[#18E1C1]"
                  style={{ width: `${item.stock_percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
