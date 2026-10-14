import React from 'react';
import { Bed } from 'lucide-react';

interface BedOccupancyProps {
  percentage: number;
  occupied: number;
  total: number;
  onOpenBedManager?: () => void;
}

export const BedOccupancy: React.FC<BedOccupancyProps> = ({
  percentage,
  occupied,
  total,
  onOpenBedManager,
}) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <button
      onClick={onOpenBedManager}
      className="w-full bg-[#071D30]/90 hover:bg-[#0A2640] border border-[#145B89]/70 hover:border-[#18E1C1]/80 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 text-left transition-all duration-200 shadow-sm cursor-pointer"
    >
      {/* Circular Progress Ring */}
      <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="#0A2D46"
            strokeWidth="7"
            fill="transparent"
          />
          {/* Active progress arc */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="#18E1C1"
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base sm:text-lg font-bold text-[#F1F7FF] tabular-nums tracking-tight">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Bed Details */}
      <div className="flex-1 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-[#0E3554]/50 border border-[#145B89]/60 flex items-center justify-center mb-1 text-[#23D5F4]">
          <Bed className="w-4 h-4" />
        </div>
        <div className="text-xs sm:text-sm font-semibold text-[#F1F7FF] tracking-wide truncate">
          Bed Occupancy
        </div>
        <div className="text-[11px] sm:text-xs text-[#718BA5] font-mono mt-0.5">
          <span className="text-[#A7BED3] font-bold">{occupied}</span> / {total} beds
        </div>
      </div>
    </button>
  );
};
