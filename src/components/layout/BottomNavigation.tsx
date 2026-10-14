import React from 'react';
import { LayoutGrid, Users, Network, Layers, BarChart3 } from 'lucide-react';
import { NavTab } from './Sidebar';

interface BottomNavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'departments', label: 'Departments', icon: Network },
    { id: 'resources', label: 'Resources', icon: Layers },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className="pt-2">
      {/* 5-Item Bottom Navigation Bar */}
      <nav
        className="w-full bg-[#051625]/90 border border-[#145B89]/80 rounded-2xl p-1.5 flex items-center justify-between gap-1 shadow-lg backdrop-blur-sm"
        aria-label="Bottom Section Navigation"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#087FC7] to-[#27B9FF] text-white border border-[#38DDF7] shadow-[0_0_15px_rgba(39,185,255,0.45)]'
                  : 'bg-transparent text-[#718BA5] hover:text-[#23D5F4] hover:bg-[#071D30]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#23D5F4]/80'}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Tagline and Technology Plaque */}
      <div className="relative flex items-center justify-between pt-3 pb-1 px-2">
        {/* Left spacer to balance plaque */}
        <div className="w-24 hidden sm:block" />

        {/* Center Tagline */}
        <div className="text-[10px] sm:text-[11px] font-bold text-[#4D6982] tracking-[0.25em] uppercase text-center flex-1">
          BETTER CARE <span className="text-[#23D5F4]/40 mx-1.5">·</span> STRONGER COMMUNITIES
        </div>

        {/* Technology Plaque on bottom right */}
        <div className="shrink-0 bg-[#071D30]/90 border border-[#23D5F4]/60 rounded-lg px-2.5 py-1.5 text-right shadow-[0_0_12px_rgba(35,213,244,0.25)]">
          <div className="text-[8px] font-bold tracking-widest text-[#23D5F4] uppercase leading-tight">
            PEOPLE
          </div>
          <div className="text-[8px] font-bold tracking-widest text-[#F1F7FF] uppercase leading-tight">
            TECHNOLOGY
          </div>
          <div className="text-[8px] font-bold tracking-widest text-[#18E1C1] uppercase leading-tight">
            HEALTHIER LIVES
          </div>
        </div>
      </div>
    </div>
  );
};
