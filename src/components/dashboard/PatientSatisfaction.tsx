import React from 'react';
import { Star } from 'lucide-react';

interface PatientSatisfactionProps {
  score: number;
  maxScore: number;
  ratingCount?: number;
}

export const PatientSatisfaction: React.FC<PatientSatisfactionProps> = ({
  score = 4.6,
  maxScore = 5.0,
}) => {
  const percentage = (score / maxScore) * 100;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-3 sm:p-3.5 shadow-sm flex flex-col items-center justify-center text-center">
      <div className="w-full flex items-center justify-between mb-1.5">
        <h3 className="text-xs sm:text-sm font-semibold text-[#F1F7FF] tracking-wide">
          Patient Satisfaction
        </h3>
        <span className="text-[10px] text-[#36D6A4] font-medium">92% Positive</span>
      </div>

      <div className="flex items-center gap-4 py-1">
        {/* Ring Gauge */}
        <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
            <circle
              cx="36"
              cy="36"
              r={radius}
              stroke="#0A2D46"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="36"
              cy="36"
              r={radius}
              stroke="#18E1C1"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base sm:text-lg font-bold text-[#F1F7FF] tabular-nums leading-none">
              {score.toFixed(1)}
            </span>
            <span className="text-[8px] text-[#718BA5] font-medium mt-0.5">
              out of {maxScore.toFixed(0)}
            </span>
          </div>
        </div>

        {/* 5-Star Rating Row */}
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((starIndex) => (
              <Star
                key={starIndex}
                className={`w-4 h-4 ${
                  starIndex <= Math.floor(score)
                    ? 'fill-[#FF873D] text-[#FF873D]'
                    : starIndex - 0.5 <= score
                    ? 'fill-[#FF873D]/70 text-[#FF873D]'
                    : 'text-[#145B89]'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-[#718BA5]">
            Verified Discharge Surveys
          </span>
        </div>
      </div>
    </div>
  );
};
