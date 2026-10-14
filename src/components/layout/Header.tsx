import React, { useState, useEffect } from 'react';
import { Bell, Database, ShieldCheck, UserCheck, KeyRound, LogIn, LogOut } from 'lucide-react';
import { isSupabaseConfigured } from '../../services/supabase';
import { CurrentUser, UserRole } from '../../types/hospital';

interface HeaderProps {
  currentUser: CurrentUser;
  onSwitchRole: (role: UserRole) => void;
  unreadNotificationCount: number;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenAuditTrail: () => void;
  onOpenStaffManagement: () => void;
  onOpenStaffLogin: () => void;
  onLogout: () => void;
}

const ROLES: UserRole[] = [
  'Administrator',
  'Doctor',
  'Nurse',
  'Receptionist',
  'Pharmacist',
  'Triage Officer',
];

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchRole,
  unreadNotificationCount,
  onOpenNotifications,
  onOpenSettings,
  onOpenAuditTrail,
  onOpenStaffManagement,
  onOpenStaffLogin,
  onLogout,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('10:24 AM');
  const [currentDate, setCurrentDate] = useState<string>('Mon, Sep 15, 2026');
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const isConnected = isSupabaseConfigured();

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentDate(dateStr);
      setCurrentTime(timeStr);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 relative z-20">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-[32px] font-extrabold text-[#F1F7FF] tracking-tight leading-tight">
          Hospital Operations
        </h1>
        <p className="text-xs sm:text-sm text-[#718BA5] font-medium tracking-wide mt-0.5">
          Care Today <span className="text-[#23D5F4]/70">·</span> Healthier Tomorrow
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-end">
        
        {/* Administrator Staff Management & Credentials Button */}
        {currentUser.role === 'Administrator' && (
          <button
            onClick={onOpenStaffManagement}
            title="Administrator Staff Credentials Management (Add & Issue Credentials)"
            className="px-2.5 py-1.5 rounded-xl bg-[#087FC7]/20 border border-[#27B9FF] hover:bg-[#087FC7]/40 text-xs font-bold text-[#23D5F4] hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(39,185,255,0.25)]"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#23D5F4]" />
            <span className="hidden sm:inline">Staff Credentials</span>
            <span className="sm:hidden">Staff</span>
          </button>
        )}

        {/* Staff Sign-In / Switch Account Button */}
        <button
          onClick={onOpenStaffLogin}
          title="Sign in with staff credentials or switch workstation"
          className="px-2.5 py-1.5 rounded-xl bg-[#071D30] border border-[#145B89] hover:border-[#23D5F4] text-xs font-medium text-[#A7BED3] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5 text-[#23D5F4]" />
          <span className="hidden md:inline">Staff Sign-In</span>
        </button>

        {/* Active Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="px-2.5 py-1.5 rounded-xl bg-[#071D30] border border-[#23D5F4]/50 hover:border-[#23D5F4] text-xs font-medium text-[#F1F7FF] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Switch Active Operational Role"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#23D5F4]" />
            <span className="hidden md:inline font-bold text-[#23D5F4]">{currentUser.role}:</span>
            <span className="truncate max-w-[110px]">{currentUser.name.split(' ')[0]}</span>
          </button>

          {isRoleMenuOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-56 rounded-2xl bg-[#051625] border border-[#27B9FF]/60 shadow-2xl py-1.5 z-40 animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-1.5 text-[10px] text-[#718BA5] uppercase tracking-wider font-semibold border-b border-[#145B89]/50">
                Switch Operational Role
              </div>
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    onSwitchRole(role);
                    setIsRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    currentUser.role === role
                      ? 'bg-[#0E3554] text-[#23D5F4] font-semibold'
                      : 'text-[#A7BED3] hover:bg-[#071D30] hover:text-white'
                  }`}
                >
                  <span>{role}</span>
                  {currentUser.role === role && <span className="w-1.5 h-1.5 rounded-full bg-[#23D5F4]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Audit Log button for Administrator / Clinical Staff */}
        <button
          onClick={onOpenAuditTrail}
          title="Inspect Traceable Audit Trail & Security Events"
          className="px-2.5 py-1.5 rounded-xl bg-[#071D30] border border-[#145B89] hover:border-[#18E1C1] text-[#718BA5] hover:text-[#18E1C1] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Audit Log</span>
        </button>

        {/* Supabase status indicator */}
        <button
          onClick={onOpenSettings}
          title={isConnected ? 'Supabase Database Connected' : 'Connect Supabase Database'}
          className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            isConnected
              ? 'bg-[#071D30] border-[#18E1C1]/50 text-[#18E1C1] hover:border-[#18E1C1]'
              : 'bg-[#071D30] border-[#145B89] text-[#718BA5] hover:text-[#23D5F4] hover:border-[#23D5F4]/60'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{isConnected ? 'Supabase Live' : 'Connect DB'}</span>
        </button>

        {/* Date and Time Badge */}
        <div className="bg-[#071D30]/90 border border-[#145B89]/70 rounded-xl px-3.5 py-1.5 text-right shadow-inner">
          <div className="text-[11px] font-medium text-[#718BA5] tracking-wide leading-none">
            {currentDate}
          </div>
          <div className="text-sm font-bold text-[#F1F7FF] tabular-nums tracking-wider mt-0.5 leading-none font-mono">
            {currentTime}
          </div>
        </div>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          title="Notifications & System Alerts"
          className="relative w-10 h-10 rounded-xl bg-[#071D30] border border-[#145B89] hover:border-[#23D5F4] hover:bg-[#0A2640] flex items-center justify-center text-[#F1F7FF] transition-all cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
        >
          <Bell className="w-4 h-4 text-[#A7BED3] hover:text-[#23D5F4] transition-colors" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF873D] ring-2 ring-[#071D30] shadow-[0_0_8px_#FF873D]" />
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          title="Sign out of hospital operations session"
          className="px-2.5 py-1.5 rounded-xl bg-[#3A1414]/70 border border-[#FF634D]/60 hover:bg-[#3A1414] hover:border-[#FF634D] text-[#FF634D] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(255,99,77,0.2)]"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
