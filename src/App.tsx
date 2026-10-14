/**
 * Hospital Operations Management System
 * Exact visual fidelity to the Futuristic Command Center Reference
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { KpiCards } from './components/dashboard/KpiCards';
import { HospitalScene } from './components/dashboard/HospitalScene';
import { PatientFlowChart } from './components/dashboard/PatientFlowChart';
import { BedOccupancy } from './components/dashboard/BedOccupancy';
import { StaffAvailability } from './components/dashboard/StaffAvailability';
import { PatientSatisfaction } from './components/dashboard/PatientSatisfaction';
import { DepartmentPerformance } from './components/dashboard/DepartmentPerformance';
import { UpcomingAppointments } from './components/dashboard/UpcomingAppointments';
import { MedicalResources } from './components/dashboard/MedicalResources';
import { EmergencyStatus } from './components/dashboard/EmergencyStatus';

// Modals
import { NotificationsDrawer } from './components/modals/NotificationsDrawer';
import { NewAppointmentModal } from './components/modals/NewAppointmentModal';
import { BedManagementModal } from './components/modals/BedManagementModal';
import { EmergencyTriageModal } from './components/modals/EmergencyTriageModal';
import { PatientAdmissionModal } from './components/modals/PatientAdmissionModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ClinicalEncounterModal } from './components/modals/ClinicalEncounterModal';
import { AuditTrailModal } from './components/modals/AuditTrailModal';
import { StaffManagementModal } from './components/modals/StaffManagementModal';
import { StaffLoginModal } from './components/modals/StaffLoginModal';

// Views & Dashboards
import { PatientsView } from './components/views/PatientsView';
import { DepartmentsView } from './components/views/DepartmentsView';
import { ResourcesView } from './components/views/ResourcesView';
import { ReportsView } from './components/views/ReportsView';
import { AppointmentsView } from './components/views/AppointmentsView';
import { RoleWorkstationView } from './components/dashboards/RoleWorkstationView';

// Services
import { hospitalDataService, DashboardData } from './services/hospitalDataService';
import { Appointment, ClinicalEncounter, Patient, UserRole } from './types/hospital';

export default function App() {
  const [data, setData] = useState<DashboardData>(hospitalDataService.getData());
  const [activeTab, setActiveTab] = useState<NavTab>('overview');

  // Modals state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isBedManagementOpen, setIsBedManagementOpen] = useState(false);
  const [isEmergencyTriageOpen, setIsEmergencyTriageOpen] = useState(false);
  const [isPatientAdmissionOpen, setIsPatientAdmissionOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);
  const [isClinicalEncounterOpen, setIsClinicalEncounterOpen] = useState(false);
  const [isStaffManagementOpen, setIsStaffManagementOpen] = useState(false);
  const [isStaffLoginOpen, setIsStaffLoginOpen] = useState(false);
  const [selectedEncounter, setSelectedEncounter] = useState<ClinicalEncounter | null>(null);

  // Subscribe to service updates
  useEffect(() => {
    const unsubscribe = hospitalDataService.subscribe((updated) => {
      setData(updated);
    });
    // Attempt real database synchronization if configured
    hospitalDataService.fetchFromSupabase();
    return () => unsubscribe();
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    if (tab === 'settings') {
      setIsSettingsOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleSelectKpi = (type: 'patients' | 'appointments' | 'emergency' | 'staff') => {
    if (type === 'patients') setActiveTab('patients');
    else if (type === 'appointments') setActiveTab('appointments');
    else if (type === 'emergency') setIsEmergencyTriageOpen(true);
    else if (type === 'staff') setIsStaffManagementOpen(true);
  };

  const handleOpenEncounter = (encounterId?: string, patientName?: string, doctorName?: string) => {
    if (encounterId) {
      const existing = data.encountersList.find((e) => e.id === encounterId);
      if (existing) {
        setSelectedEncounter(existing);
        setIsClinicalEncounterOpen(true);
        return;
      }
    }

    // If searching by patient name
    if (patientName) {
      const match = data.encountersList.find((e) => e.patient_name === patientName);
      if (match) {
        setSelectedEncounter(match);
        setIsClinicalEncounterOpen(true);
        return;
      }

      // Or create fresh encounter
      const fresh = hospitalDataService.createClinicalEncounter({
        patient_id: `pat-${patientName.replace(/\s+/g, '-').toLowerCase()}`,
        patient_name: patientName,
        mrn: `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
        encounter_type: 'Outpatient',
        attending_doctor: doctorName || data.currentUser.name,
        chief_complaint: 'Routine consultation presentation.',
      });
      setSelectedEncounter(fresh);
      setIsClinicalEncounterOpen(true);
      return;
    }

    if (data.encountersList.length > 0) {
      setSelectedEncounter(data.encountersList[0]);
      setIsClinicalEncounterOpen(true);
    }
  };

  const handleOpenEncounterForPatient = (patient: Patient) => {
    const existing = data.encountersList.find((e) => e.patient_id === patient.id || e.mrn === patient.mrn);
    if (existing) {
      setSelectedEncounter(existing);
    } else {
      const fresh = hospitalDataService.createClinicalEncounter({
        patient_id: patient.id,
        patient_name: patient.full_name,
        mrn: patient.mrn,
        encounter_type: patient.status === 'Triage' ? 'Emergency' : 'Walk-In',
        attending_doctor: patient.attending_doctor,
        chief_complaint: `${patient.department} admission clinical review.`,
      });
      setSelectedEncounter(fresh);
    }
    setIsClinicalEncounterOpen(true);
  };

  const unreadNotifications = data.notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#03101E] text-[#F1F7FF] flex items-center justify-center p-2 sm:p-4 lg:p-6 select-none">
      {/* Outer Futuristic Display Console Frame */}
      <div className="relative w-full max-w-[1400px] bg-[#071B2D]/95 border-2 border-[#087FC7] rounded-[36px] sm:rounded-[40px] p-3 sm:p-5 lg:p-6 shadow-[0_0_50px_rgba(0,174,255,0.22),_inset_0_0_30px_rgba(8,127,199,0.15)] flex flex-col gap-3 lg:gap-4 backdrop-blur-xl">
        
        {/* Subtle luminous highlights in corner bevels */}
        <div className="absolute top-0 left-12 w-48 h-1 bg-gradient-to-r from-transparent via-[#27B9FF] to-transparent opacity-80 pointer-events-none" />
        <div className="absolute bottom-0 right-16 w-56 h-1 bg-gradient-to-r from-transparent via-[#23D5F4] to-transparent opacity-70 pointer-events-none" />

        {/* Top Header */}
        <Header
          currentUser={data.currentUser}
          onSwitchRole={(role: UserRole) => hospitalDataService.switchUserRole(role)}
          unreadNotificationCount={unreadNotifications}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAuditTrail={() => setIsAuditTrailOpen(true)}
          onOpenStaffManagement={() => setIsStaffManagementOpen(true)}
          onOpenStaffLogin={() => setIsStaffLoginOpen(true)}
        />

        {/* Main Console Content Body with Left Sidebar */}
        <div className="flex gap-3 sm:gap-4 lg:gap-5 flex-1 min-h-0">
          
          {/* Vertical Sidebar */}
          <Sidebar activeTab={activeTab} onSelectTab={handleSelectTab} />

          {/* Dynamic Center Stage */}
          <main className="flex-1 min-w-0">
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-2.5 sm:gap-3">
                
                {/* Active Role Workstation Quick Access Bar */}
                <div className="bg-[#051625]/90 border border-[#145B89]/80 rounded-2xl p-2.5 px-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-md backdrop-blur-md">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#18E1C1] shadow-[0_0_8px_#18E1C1] shrink-0" />
                    <div className="text-xs truncate">
                      <span className="text-[#718BA5]">Active Session: </span>
                      <strong className="text-white">{data.currentUser.name}</strong>
                      <span className="text-[#23D5F4] font-semibold ml-1.5">
                        ({data.currentUser.role} · {data.currentUser.department})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {data.currentUser.role === 'Administrator' && (
                      <button
                        onClick={() => setIsStaffManagementOpen(true)}
                        className="px-3 py-1 rounded-xl bg-[#087FC7]/20 border border-[#27B9FF]/60 hover:bg-[#087FC7]/40 text-[#23D5F4] hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(39,185,255,0.2)]"
                      >
                        <span>+ Add Staff & Credentials</span>
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab('workstation')}
                      className="px-3.5 py-1 rounded-xl bg-gradient-to-r from-[#087FC7] to-[#27B9FF] text-white text-xs font-bold shadow-[0_0_15px_rgba(39,185,255,0.35)] hover:brightness-110 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>Open {data.currentUser.role} Dashboard →</span>
                    </button>
                  </div>
                </div>

                {/* 4 KPI Cards */}
                <KpiCards
                  patientsToday={data.kpis.patientsToday}
                  patientsTrendPct={data.kpis.patientsTrendPct}
                  appointmentsToday={data.kpis.appointmentsToday}
                  appointmentsTrendPct={data.kpis.appointmentsTrendPct}
                  emergencyCases={data.kpis.emergencyCases}
                  emergencyTrendPct={data.kpis.emergencyTrendPct}
                  staffOnDuty={data.kpis.staffOnDuty}
                  staffTrendPct={data.kpis.staffTrendPct}
                  onSelectKpi={handleSelectKpi}
                />

                {/* Main Middle Row: 3D Hospital Isometric Center + Right Analytics Column */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-stretch">
                  
                  {/* Central 3D Hospital Isometric Model (8 Cols on desktop) */}
                  <div className="lg:col-span-8 flex flex-col">
                    <HospitalScene
                      onSelectEmergency={() => setIsEmergencyTriageOpen(true)}
                      onSelectMainEntrance={() => setIsPatientAdmissionOpen(true)}
                      onSelectDepartments={() => setActiveTab('departments')}
                    />
                  </div>

                  {/* Right Side Analytics Stack (4 Cols on desktop) */}
                  <div className="lg:col-span-4 flex flex-col justify-between gap-2.5">
                    <PatientFlowChart data={data.patientFlow} />
                    <BedOccupancy
                      percentage={data.bedOccupancy.percentage}
                      occupied={data.bedOccupancy.occupied}
                      total={data.bedOccupancy.total}
                      onOpenBedManager={() => setIsBedManagementOpen(true)}
                    />
                    <StaffAvailability
                      data={data.staffBreakdown}
                      onOpenStaffDirectory={() => setIsStaffManagementOpen(true)}
                    />
                    <PatientSatisfaction
                      score={data.patientSatisfaction.score}
                      maxScore={data.patientSatisfaction.maxScore}
                      ratingCount={data.patientSatisfaction.ratingCount}
                    />
                  </div>
                </div>

                {/* Lower Grid: Department Performance, Upcoming Appointments, Medical Resources, Emergency Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-4 items-stretch">
                  
                  {/* Lower Left: Department Performance (4 Cols) */}
                  <div className="lg:col-span-4 flex flex-col">
                    <DepartmentPerformance
                      departments={data.departments}
                      onSelectDepartment={() => setActiveTab('departments')}
                    />
                  </div>

                  {/* Lower Mid-Left: Upcoming Appointments (4 Cols) */}
                  <div className="lg:col-span-4 flex flex-col">
                    <UpcomingAppointments
                      appointments={data.upcomingAppointments}
                      onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
                      onSelectAppointment={(apt: Appointment) => {
                        handleOpenEncounter(apt.encounter_id, apt.patient_name, apt.doctor_name);
                      }}
                    />
                  </div>

                  {/* Lower Right Stack: Medical Resources + Emergency Status (4 Cols) */}
                  <div className="lg:col-span-4 flex flex-col justify-between gap-3">
                    <MedicalResources
                      resources={data.resources}
                      onOpenInventory={() => setActiveTab('resources')}
                    />
                    <EmergencyStatus
                      status={data.emergencyStatus.status}
                      avgWaitTimeMinutes={data.emergencyStatus.avgWaitTimeMinutes}
                      trend={data.emergencyStatus.trend}
                      onOpenEmergencyView={() => setIsEmergencyTriageOpen(true)}
                    />
                  </div>
                </div>

              </div>
            )}

            {/* Secondary Dedicated Views */}
            {activeTab === 'patients' && (
              <PatientsView
                patients={data.patientsList}
                onOpenAdmitModal={() => setIsPatientAdmissionOpen(true)}
                onOpenEncounterForPatient={handleOpenEncounterForPatient}
                onBackToOverview={() => setActiveTab('overview')}
              />
            )}

            {activeTab === 'departments' && (
              <DepartmentsView
                departments={data.departments}
                onBackToOverview={() => setActiveTab('overview')}
              />
            )}

            {activeTab === 'resources' && (
              <ResourcesView
                resources={data.resources}
                stockMovements={data.stockMovements}
                onBackToOverview={() => setActiveTab('overview')}
                onRefresh={() => setData(hospitalDataService.getData())}
              />
            )}

            {(activeTab === 'reports' || activeTab === 'analytics') && (
              <ReportsView
                patientFlow={data.patientFlow}
                emergencyTrend={data.emergencyStatus.trend}
                satisfactionScore={data.patientSatisfaction.score}
                bedOccupancyPct={data.bedOccupancy.percentage}
                onBackToOverview={() => setActiveTab('overview')}
              />
            )}

            {activeTab === 'appointments' && (
              <AppointmentsView
                appointments={data.upcomingAppointments}
                onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
                onOpenEncounterModal={handleOpenEncounter}
                onBackToOverview={() => setActiveTab('overview')}
              />
            )}

            {activeTab === 'workstation' && (
              <RoleWorkstationView
                currentUser={data.currentUser}
                data={data}
                onBackToOverview={() => setActiveTab('overview')}
                onOpenStaffManagement={() => setIsStaffManagementOpen(true)}
                onOpenStaffLogin={() => setIsStaffLoginOpen(true)}
                onOpenEncounter={handleOpenEncounter}
                onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
                onOpenBedManager={() => setIsBedManagementOpen(true)}
                onOpenAdmitModal={() => setIsPatientAdmissionOpen(true)}
                onOpenTriageModal={() => setIsEmergencyTriageOpen(true)}
                onOpenAuditTrail={() => setIsAuditTrailOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onRefreshData={() => setData(hospitalDataService.getData())}
              />
            )}
          </main>
        </div>

        {/* Bottom Navigation & Brand Plaque Bar */}
        <BottomNavigation activeTab={activeTab} onSelectTab={handleSelectTab} />

      </div>

      {/* Interactive Modals */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={data.notifications}
        onMarkRead={(id) => hospitalDataService.markNotificationRead(id)}
        onMarkAllRead={() => hospitalDataService.markAllNotificationsRead()}
      />

      <NewAppointmentModal
        isOpen={isNewAppointmentOpen}
        onClose={() => setIsNewAppointmentOpen(false)}
        onAppointmentCreated={() => setData(hospitalDataService.getData())}
      />

      <BedManagementModal
        isOpen={isBedManagementOpen}
        onClose={() => setIsBedManagementOpen(false)}
        beds={data.bedsList}
        onRefresh={() => setData(hospitalDataService.getData())}
      />

      <EmergencyTriageModal
        isOpen={isEmergencyTriageOpen}
        onClose={() => setIsEmergencyTriageOpen(false)}
        onSubmit={(caseData) => hospitalDataService.addEmergencyCase(caseData)}
      />

      <PatientAdmissionModal
        isOpen={isPatientAdmissionOpen}
        onClose={() => setIsPatientAdmissionOpen(false)}
        onPatientAdmitted={() => setData(hospitalDataService.getData())}
      />

      <ClinicalEncounterModal
        isOpen={isClinicalEncounterOpen}
        onClose={() => setIsClinicalEncounterOpen(false)}
        encounter={selectedEncounter}
        onSaved={() => setData(hospitalDataService.getData())}
      />

      <AuditTrailModal
        isOpen={isAuditTrailOpen}
        onClose={() => setIsAuditTrailOpen(false)}
        auditEvents={data.auditLog}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRefreshData={() => hospitalDataService.fetchFromSupabase()}
      />

      {/* Staff Management & Credentials Modal for Administrator */}
      <StaffManagementModal
        isOpen={isStaffManagementOpen}
        onClose={() => setIsStaffManagementOpen(false)}
        staffList={data.staffList}
        onStaffUpdated={() => setData(hospitalDataService.getData())}
        onLoginAsStaff={(staffId) => {
          const user = hospitalDataService.loginAsStaffMember(staffId);
          if (user) {
            setData(hospitalDataService.getData());
            setIsStaffManagementOpen(false);
            setActiveTab('workstation');
          }
        }}
      />

      {/* Staff Workstation Login & Account Switcher Modal */}
      <StaffLoginModal
        isOpen={isStaffLoginOpen}
        onClose={() => setIsStaffLoginOpen(false)}
        staffList={data.staffList}
        onLoginSuccess={() => {
          setData(hospitalDataService.getData());
          setIsStaffLoginOpen(false);
          setActiveTab('workstation');
        }}
      />
    </div>
  );
}
