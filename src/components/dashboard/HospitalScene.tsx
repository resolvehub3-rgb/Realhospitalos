import React, { useState } from 'react';
import { ArrowUpRight, ShieldAlert, DoorOpen, Building2 } from 'lucide-react';

interface HospitalSceneProps {
  onSelectEmergency: () => void;
  onSelectMainEntrance: () => void;
  onSelectDepartments: () => void;
}

export const HospitalScene: React.FC<HospitalSceneProps> = ({
  onSelectEmergency,
  onSelectMainEntrance,
  onSelectDepartments,
}) => {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  return (
    <div className="relative w-full h-full min-h-[380px] lg:min-h-[465px] rounded-3xl overflow-hidden bg-[#051625] border border-[#145B89]/80 shadow-[inset_0_0_40px_rgba(3,16,30,0.8)] flex items-end justify-center group">
      {/* Background ambient lighting and grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(8,127,199,0.22)_0%,_transparent_75%)] pointer-events-none" />

      {/* Rendered 3D Isometric Hospital Visual */}
      <img
        src="/src/assets/images/isometric_hospital_center_1791966351219.jpg"
        alt="Central 3D Isometric Hospital Architecture with Rooftop Helipad and Emergency Wing"
        className="w-full h-full object-contain object-bottom p-1 sm:p-2 pb-2 sm:pb-3 select-none transform transition-transform duration-500 group-hover:scale-[1.01]"
        referrerPolicy="no-referrer"
      />

      {/* Floating Interactive Label 1: Main Entrance */}
      <button
        onClick={onSelectMainEntrance}
        onMouseEnter={() => setHoveredZone('Main Entrance')}
        onMouseLeave={() => setHoveredZone(null)}
        className="absolute bottom-4 left-5 sm:bottom-6 sm:left-6 px-3.5 py-1.5 rounded-xl bg-[#071D30]/90 backdrop-blur-md border border-[#23D5F4]/80 text-[#23D5F4] text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-[0_0_15px_rgba(35,213,244,0.35)] hover:bg-[#0A2640] hover:border-[#38DDF7] hover:scale-105 transition-all cursor-pointer z-10"
      >
        <DoorOpen className="w-3.5 h-3.5 text-[#23D5F4]" />
        <span>Main Entrance</span>
        <ArrowUpRight className="w-3 h-3 text-[#23D5F4]/70" />
      </button>

      {/* Floating Interactive Label 2: Emergency */}
      <button
        onClick={onSelectEmergency}
        onMouseEnter={() => setHoveredZone('Emergency')}
        onMouseLeave={() => setHoveredZone(null)}
        className="absolute bottom-12 right-6 sm:bottom-16 sm:right-10 px-3.5 py-1.5 rounded-xl bg-[#2A1108]/90 backdrop-blur-md border border-[#FF873D]/90 text-[#FF873D] text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-[0_0_18px_rgba(255,135,61,0.45)] hover:bg-[#3D1A0D] hover:scale-105 transition-all cursor-pointer z-10"
      >
        <ShieldAlert className="w-3.5 h-3.5 text-[#FF873D]" />
        <span>Emergency</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF873D] animate-ping" />
      </button>

      {/* Floating Interactive Label 3: Hospital Facility Center */}
      <button
        onClick={onSelectDepartments}
        onMouseEnter={() => setHoveredZone('Hospital Center')}
        onMouseLeave={() => setHoveredZone(null)}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-8 px-3 py-1 rounded-lg bg-[#071D30]/85 backdrop-blur-md border border-[#145B89] text-[#F1F7FF] text-[11px] font-semibold tracking-wider uppercase flex items-center gap-1.5 shadow-md hover:border-[#23D5F4] hover:text-[#23D5F4] transition-all cursor-pointer z-10"
      >
        <Building2 className="w-3 h-3 text-[#23D5F4]" />
        <span>HOSPITAL</span>
      </button>

      {/* Active hover info overlay */}
      {hoveredZone && (
        <div className="absolute top-4 left-6 px-3 py-1.5 rounded-lg bg-[#071D30]/95 border border-[#27B9FF]/60 text-[11px] text-[#A7BED3] flex items-center gap-2 pointer-events-none animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-[#36D6A4]" />
          <span>Active Station: <strong className="text-white">{hoveredZone}</strong></span>
        </div>
      )}
    </div>
  );
};
