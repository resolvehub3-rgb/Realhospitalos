import React from 'react';
import { LayoutGrid, BarChart2, UsersRound, ClipboardList, Settings, Stethoscope } from 'lucide-react';

export type NavTab = 'overview' | 'workstation' | 'analytics' | 'patients' | 'appointments' | 'settings' | 'departments' | 'resources' | 'reports';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Hospital 3D Command Center', icon: LayoutGrid },
    { id: 'workstation', label: 'Staff Role Workstation Dashboard', icon: Stethoscope },
    { id: 'analytics', label: 'Operational Analytics', icon: BarChart2 },
    { id: 'patients', label: 'Patient Directory', icon: UsersRound },
    { id: 'appointments', label: 'Appointments & Records', icon: ClipboardList },
    { id: 'settings', label: 'Settings & Supabase DB', icon: Settings },
  ];

  return (
    <aside
      className="flex flex-col items-center gap-3 py-2 shrink-0 z-10"
      aria-label="Main Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id || (item.id === 'analytics' && activeTab === 'reports');

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            title={item.label}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-[#087FC7] text-white border border-[#27B9FF] shadow-[0_0_15px_rgba(39,185,255,0.5)]'
                : 'bg-[#071D30] text-[#718BA5] hover:text-[#23D5F4] hover:bg-[#0A2640] border border-[#145B89]/60'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="sr-only">{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
};
