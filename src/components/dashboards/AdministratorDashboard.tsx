import React from 'react';
import {
  ShieldCheck,
  KeyRound,
  Users,
  Database,
  Building2,
  Activity,
  Bed,
  FileText,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { CurrentUser, StaffMember, AuditEvent } from '../../types/hospital';
import { DashboardData } from '../../services/hospitalDataService';

interface AdministratorDashboardProps {
  currentUser: CurrentUser;
  data: DashboardData;
  onOpenStaffManagement: () => void;
  onOpenAuditTrail: () => void;
  onOpenSettings: () => void;
  onOpenBedManager: () => void;
  onOpenNewAppointment: () => void;
  onOpenPatientAdmit: () => void;
}

export const AdministratorDashboard: React.FC<AdministratorDashboardProps> = ({
  currentUser,
  data,
  onOpenStaffManagement,
  onOpenAuditTrail,
  onOpenSettings,
  onOpenBedManager,
  onOpenNewAppointment,
  onOpenPatientAdmit,
}) => {
  const onDutyStaff = data.staffList.filter((s: StaffMember) => s.is_on_duty);

  return (
    <div className="space-y-4">
      {/* Administrator Header Banner */}
      <div className="bg-gradient-to-r from-[#071D30] via-[#0E3554] to-[#071D30] border border-[#23D5F4]/60 rounded-3xl p-4 sm:p-5 shadow-[0_0_30px_rgba(35,213,244,0.18)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#23D5F4]/20 border border-[#23D5F4] flex items-center justify-center text-[#23D5F4] shadow-[0_0_15px_rgba(35,213,244,0.4)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Executive Administration & Staff Control
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#23D5F4]/20 text-[#23D5F4] border border-[#23D5F4]/60">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-[#718BA5] font-medium mt-0.5">
              Logged in as <strong className="text-white">{currentUser.name}</strong> · Chief Executive & Medical Officer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenStaffManagement}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#087FC7] via-[#27B9FF] to-[#23D5F4] text-white font-bold text-xs shadow-[0_0_20px_rgba(39,185,255,0.4)] hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <KeyRound className="w-4 h-4" />
            <span>Manage Staff & Credentials ({data.staffList.length})</span>
          </button>
          <button
            onClick={onOpenAuditTrail}
            className="px-3 py-2 rounded-xl bg-[#071D30] border border-[#145B89] hover:border-[#18E1C1] text-[#A7BED3] hover:text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Activity className="w-4 h-4 text-[#18E1C1]" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* 4 Admin Master KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={onOpenStaffManagement}
          className="bg-[#051625]/90 border border-[#145B89]/70 hover:border-[#23D5F4] rounded-2xl p-3.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Registered Staff</span>
            <Users className="w-4 h-4 text-[#23D5F4]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono group-hover:text-[#23D5F4]">
            {data.staffList.length}
          </div>
          <div className="text-[10px] text-[#23D5F4] mt-0.5 font-medium flex items-center justify-between">
            <span>{onDutyStaff.length} On Duty Now</span>
            <span className="underline">Add Staff →</span>
          </div>
        </div>

        <div
          onClick={onOpenBedManager}
          className="bg-[#051625]/90 border border-[#145B89]/70 hover:border-[#27B9FF] rounded-2xl p-3.5 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Bed Occupancy</span>
            <Bed className="w-4 h-4 text-[#27B9FF]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">
            {data.bedOccupancy.percentage}%
          </div>
          <div className="text-[10px] text-[#27B9FF] mt-0.5 font-medium">
            {data.bedOccupancy.occupied} / {data.bedOccupancy.total} beds in use
          </div>
        </div>

        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Patient Flow Today</span>
            <Activity className="w-4 h-4 text-[#18E1C1]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#18E1C1] font-mono">
            {data.kpis.patientsToday}
          </div>
          <div className="text-[10px] text-[#18E1C1] mt-0.5 font-medium">↑ 12% vs prior 24h</div>
        </div>

        <div
          onClick={onOpenSettings}
          className="bg-[#051625]/90 border border-[#145B89]/70 hover:border-[#18E1C1] rounded-2xl p-3.5 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Database & Security</span>
            <Database className="w-4 h-4 text-[#18E1C1]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">RLS 100%</div>
          <div className="text-[10px] text-[#18E1C1] mt-0.5 font-medium">Supabase PostgreSQL Ready</div>
        </div>
      </div>

      {/* Grid: Staff Directory Roster & Recent Security Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column (7 Cols): Active Staff Roster with Credentials */}
        <div className="lg:col-span-7 bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#23D5F4]" />
                <h3 className="text-sm font-bold text-white">Hospital Staff Directory & Access Codes</h3>
              </div>
              <button
                onClick={onOpenStaffManagement}
                className="text-xs font-bold text-[#23D5F4] hover:text-white transition-colors cursor-pointer"
              >
                + Issue New Staff Credentials
              </button>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar">
              {data.staffList.slice(0, 7).map((staff: StaffMember) => (
                <div
                  key={staff.id}
                  className="p-2.5 rounded-xl bg-[#051625] border border-[#145B89]/60 hover:border-[#27B9FF]/50 transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-2">
                      <span>{staff.full_name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-[#071D30] text-[#23D5F4] border border-[#145B89]">
                        {staff.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#718BA5] truncate">
                      {staff.email} · {staff.department}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] font-bold text-[#38DDF7] bg-[#071D30] px-2 py-0.5 rounded border border-[#145B89]">
                      {staff.access_code}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        staff.is_on_duty ? 'bg-[#18E1C1]' : 'bg-[#FF873D]'
                      }`}
                      title={staff.is_on_duty ? 'On Duty' : 'Off Duty'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#145B89]/50 flex items-center justify-between text-xs text-[#718BA5]">
            <span>Showing top active personnel</span>
            <button
              onClick={onOpenStaffManagement}
              className="font-bold text-[#23D5F4] hover:underline cursor-pointer"
            >
              View Full Credentials Roster ({data.staffList.length}) →
            </button>
          </div>
        </div>

        {/* Right Column (5 Cols): Security & Operational Audit Log */}
        <div className="lg:col-span-5 bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#18E1C1]" />
                <h3 className="text-sm font-bold text-white">Security & Audit Stream</h3>
              </div>
              <button
                onClick={onOpenAuditTrail}
                className="text-[11px] font-bold text-[#18E1C1] hover:text-white transition-colors cursor-pointer"
              >
                Open Full Audit
              </button>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar">
              {data.auditLog.slice(0, 6).map((ev: AuditEvent) => (
                <div
                  key={ev.id}
                  className="p-2 rounded-xl bg-[#051625] border border-[#145B89]/50 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#718BA5]">
                    <span className="font-mono text-[#23D5F4]">{ev.action}</span>
                    <span>{ev.timestamp.substring(11, 16)}</span>
                  </div>
                  <div className="text-[11px] text-white font-medium mt-0.5 line-clamp-2">
                    {ev.description}
                  </div>
                  <div className="text-[9px] text-[#4D6982] mt-0.5">
                    Actor: {ev.actor_name} ({ev.actor_role})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
