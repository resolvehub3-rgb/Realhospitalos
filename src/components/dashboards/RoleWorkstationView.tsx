import React, { useState } from 'react';
import {
  LayoutGrid,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  User,
  Pill,
  Ambulance,
  KeyRound,
  LogIn,
  ChevronLeft,
  Clock,
  Sparkles,
} from 'lucide-react';
import { CurrentUser, UserRole } from '../../types/hospital';
import { DashboardData } from '../../services/hospitalDataService';
import { DoctorDashboard } from './DoctorDashboard';
import { NurseDashboard } from './NurseDashboard';
import { ReceptionistDashboard } from './ReceptionistDashboard';
import { PharmacistDashboard } from './PharmacistDashboard';
import { TriageDashboard } from './TriageDashboard';
import { AdministratorDashboard } from './AdministratorDashboard';

interface RoleWorkstationViewProps {
  currentUser: CurrentUser;
  data: DashboardData;
  onBackToOverview: () => void;
  onOpenStaffManagement: () => void;
  onOpenStaffLogin: () => void;
  onOpenEncounter: (encounterId?: string, patientName?: string, doctorName?: string) => void;
  onOpenNewAppointment: () => void;
  onOpenBedManager: () => void;
  onOpenAdmitModal: () => void;
  onOpenTriageModal: () => void;
  onOpenAuditTrail: () => void;
  onOpenSettings: () => void;
  onRefreshData: () => void;
}

interface RoleConfig {
  role: UserRole;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

const ROLES: RoleConfig[] = [
  { role: 'Administrator', label: 'Admin Command', icon: ShieldCheck, color: '#23D5F4' },
  { role: 'Doctor', label: 'Physician Workstation', icon: Stethoscope, color: '#18E1C1' },
  { role: 'Nurse', label: 'Nurse Station', icon: HeartPulse, color: '#27B9FF' },
  { role: 'Receptionist', label: 'Admissions Desk', icon: User, color: '#36D6A4' },
  { role: 'Pharmacist', label: 'Pharmacy Vault', icon: Pill, color: '#A78BFA' },
  { role: 'Triage Officer', label: 'Emergency Triage', icon: Ambulance, color: '#FF873D' },
];

export const RoleWorkstationView: React.FC<RoleWorkstationViewProps> = ({
  currentUser,
  data,
  onBackToOverview,
  onOpenStaffManagement,
  onOpenStaffLogin,
  onOpenEncounter,
  onOpenNewAppointment,
  onOpenBedManager,
  onOpenAdmitModal,
  onOpenTriageModal,
  onOpenAuditTrail,
  onOpenSettings,
  onRefreshData,
}) => {
  const [selectedRoleView, setSelectedRoleView] = useState<UserRole>(currentUser.role);

  // Sync with current user when role changes
  React.useEffect(() => {
    setSelectedRoleView(currentUser.role);
  }, [currentUser.role]);

  const currentRoleConfig = ROLES.find((r) => r.role === selectedRoleView) || ROLES[0];
  const CurrentIcon = currentRoleConfig.icon;

  return (
    <div className="flex flex-col gap-3 sm:gap-4 animate-fadeIn">
      {/* Top Workstation Bar */}
      <div className="bg-[#051625]/90 border border-[#145B89]/80 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg backdrop-blur-md">
        
        {/* Left: Back Button & Active Role Chip */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToOverview}
            className="px-3 py-1.5 rounded-xl bg-[#071D30] border border-[#145B89] hover:border-[#27B9FF] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 text-[#23D5F4] group-hover:-translate-x-0.5 transition-transform" />
            <span>Hospital 3D Overview</span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-[#145B89]/70">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center border"
              style={{
                backgroundColor: `${currentRoleConfig.color}20`,
                borderColor: `${currentRoleConfig.color}60`,
                color: currentRoleConfig.color,
              }}
            >
              <CurrentIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{currentRoleConfig.label}</span>
                <span className="text-[10px] text-[#718BA5]">({currentUser.name.split(' ')[0]})</span>
              </div>
              <div className="text-[10px] text-[#718BA5]">{currentUser.department}</div>
            </div>
          </div>
        </div>

        {/* Right: Switch Staff Account / Login & Administrator Staff Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          {currentUser.role === 'Administrator' && (
            <button
              onClick={onOpenStaffManagement}
              className="px-3 py-1.5 rounded-xl bg-[#087FC7]/20 hover:bg-[#087FC7]/40 border border-[#27B9FF]/60 hover:border-[#27B9FF] text-[#23D5F4] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(39,185,255,0.2)]"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Staff Credentials ({data.staffList.length})</span>
            </button>
          )}

          <button
            onClick={onOpenStaffLogin}
            className="px-3 py-1.5 rounded-xl bg-[#071D30] border border-[#145B89] hover:border-[#23D5F4] text-xs font-semibold text-[#A7BED3] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-[#23D5F4]" />
            <span>Switch Staff Sign-In</span>
          </button>
        </div>
      </div>

      {/* Role Workstation Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-[#051625]/60 border border-[#145B89]/50 p-1.5 rounded-2xl">
        {ROLES.map((item) => {
          const Icon = item.icon;
          const isActive = selectedRoleView === item.role;

          return (
            <button
              key={item.role}
              onClick={() => setSelectedRoleView(item.role)}
              className={`flex-1 min-w-[120px] py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#087FC7] to-[#27B9FF] text-white border border-[#38DDF7] shadow-[0_0_15px_rgba(39,185,255,0.4)]'
                  : 'bg-transparent text-[#718BA5] hover:text-white hover:bg-[#071D30]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: isActive ? '#fff' : item.color }} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Workstation Body */}
      {selectedRoleView === 'Doctor' && (
        <DoctorDashboard
          currentUser={currentUser}
          patients={data.patientsList}
          appointments={data.upcomingAppointments}
          encounters={data.encountersList}
          onOpenEncounter={onOpenEncounter}
          onOpenNewAppointment={onOpenNewAppointment}
        />
      )}

      {selectedRoleView === 'Nurse' && (
        <NurseDashboard
          currentUser={currentUser}
          beds={data.bedsList}
          patients={data.patientsList}
          onOpenBedManager={onOpenBedManager}
          onRefresh={onRefreshData}
        />
      )}

      {selectedRoleView === 'Receptionist' && (
        <ReceptionistDashboard
          currentUser={currentUser}
          appointments={data.upcomingAppointments}
          patients={data.patientsList}
          onOpenNewAppointment={onOpenNewAppointment}
          onOpenAdmitModal={onOpenAdmitModal}
          onRefresh={onRefreshData}
        />
      )}

      {selectedRoleView === 'Pharmacist' && (
        <PharmacistDashboard
          currentUser={currentUser}
          resources={data.resources}
          stockMovements={data.stockMovements}
          onRefresh={onRefreshData}
        />
      )}

      {selectedRoleView === 'Triage Officer' && (
        <TriageDashboard
          currentUser={currentUser}
          emergencyCases={data.emergencyCasesList}
          avgWaitMinutes={data.emergencyStatus.avgWaitTimeMinutes}
          trend={data.emergencyStatus.trend}
          onOpenTriageModal={onOpenTriageModal}
          onRefresh={onRefreshData}
        />
      )}

      {selectedRoleView === 'Administrator' && (
        <AdministratorDashboard
          currentUser={currentUser}
          data={data}
          onOpenStaffManagement={onOpenStaffManagement}
          onOpenAuditTrail={onOpenAuditTrail}
          onOpenSettings={onOpenSettings}
          onOpenBedManager={onOpenBedManager}
          onOpenNewAppointment={onOpenNewAppointment}
          onOpenPatientAdmit={onOpenAdmitModal}
        />
      )}

    </div>
  );
};
