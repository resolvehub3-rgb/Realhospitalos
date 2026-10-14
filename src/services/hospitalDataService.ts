import {
  Patient,
  Appointment,
  AppointmentStatus,
  ClinicalEncounter,
  DepartmentMetric,
  BedRecord,
  BedStatus,
  StaffBreakdown,
  StaffMember,
  EmergencyCase,
  MedicalResourceItem,
  StockMovement,
  AuditEvent,
  NotificationItem,
  HourlyFlow,
  EmergencyWaitTrend,
  UserRole,
  CurrentUser,
} from '../types/hospital';
import { getSupabase, isSupabaseConfigured } from './supabase';

export interface DashboardData {
  currentUser: CurrentUser | null;
  kpis: {
    patientsToday: number;
    patientsTrendPct: number;
    appointmentsToday: number;
    appointmentsTrendPct: number;
    emergencyCases: number;
    emergencyTrendPct: number;
    staffOnDuty: number;
    staffTrendPct: number;
  };
  bedOccupancy: {
    percentage: number;
    occupied: number;
    total: number;
  };
  staffBreakdown: StaffBreakdown;
  staffList: StaffMember[];
  patientSatisfaction: {
    score: number;
    maxScore: number;
    starCount: number;
    ratingCount: number;
  };
  patientFlow: HourlyFlow[];
  emergencyStatus: {
    status: 'Stable' | 'Elevated' | 'Critical';
    avgWaitTimeMinutes: number;
    trend: EmergencyWaitTrend[];
  };
  departments: DepartmentMetric[];
  upcomingAppointments: Appointment[];
  resources: MedicalResourceItem[];
  stockMovements: StockMovement[];
  notifications: NotificationItem[];
  patientsList: Patient[];
  emergencyCasesList: EmergencyCase[];
  bedsList: BedRecord[];
  encountersList: ClinicalEncounter[];
  auditLog: AuditEvent[];
}

export function getPermissionsForRole(role: UserRole): CurrentUser['permissions'] {
  return {
    canRegisterPatient: role === 'Administrator' || role === 'Receptionist' || role === 'Nurse' || role === 'Triage Officer',
    canManageAppointments: role === 'Administrator' || role === 'Doctor' || role === 'Receptionist' || role === 'Nurse',
    canDocumentClinical: role === 'Administrator' || role === 'Doctor' || role === 'Nurse' || role === 'Triage Officer',
    canTriageEmergency: role === 'Administrator' || role === 'Triage Officer' || role === 'Doctor' || role === 'Nurse',
    canAssignBeds: role === 'Administrator' || role === 'Nurse' || role === 'Doctor' || role === 'Triage Officer',
    canDispenseMedications: role === 'Administrator' || role === 'Pharmacist' || role === 'Nurse',
    canViewAuditTrail: role === 'Administrator' || role === 'Doctor' || role === 'Triage Officer' || role === 'Pharmacist',
    canConfigureDatabase: role === 'Administrator',
  };
}

let state: DashboardData = {
  currentUser: null,
  kpis: {
    patientsToday: 0,
    patientsTrendPct: 0,
    appointmentsToday: 0,
    appointmentsTrendPct: 0,
    emergencyCases: 0,
    emergencyTrendPct: 0,
    staffOnDuty: 0,
    staffTrendPct: 0,
  },
  bedOccupancy: {
    percentage: 0,
    occupied: 0,
    total: 0,
  },
  staffBreakdown: {
    total: 0,
    doctors: 0,
    nurses: 0,
    technicians: 0,
    support: 0,
  },
  staffList: [],
  patientSatisfaction: {
    score: 0,
    maxScore: 5.0,
    starCount: 0,
    ratingCount: 0,
  },
  patientFlow: [],
  emergencyStatus: {
    status: 'Stable',
    avgWaitTimeMinutes: 0,
    trend: [],
  },
  departments: [],
  upcomingAppointments: [],
  resources: [],
  stockMovements: [],
  notifications: [],
  patientsList: [],
  emergencyCasesList: [],
  bedsList: [],
  encountersList: [],
  auditLog: [],
};

type Listener = (data: DashboardData) => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener({ ...state }));
}

function recalculateMetrics() {
  // 1. KPI Counts
  state.kpis.patientsToday = state.patientsList.length;
  state.kpis.appointmentsToday = state.upcomingAppointments.length;
  state.kpis.emergencyCases = state.emergencyCasesList.filter((c) => c.status !== 'Discharged').length;

  // 2. Staff on Duty & Breakdown
  const onDuty = state.staffList.filter((s) => s.is_on_duty);
  const doctors = onDuty.filter((s) => s.role === 'Doctor').length;
  const nurses = onDuty.filter((s) => s.role === 'Nurse' || s.role === 'Triage Officer').length;
  const technicians = onDuty.filter((s) => s.role === 'Pharmacist').length;
  const support = onDuty.filter((s) => s.role === 'Receptionist' || s.role === 'Administrator').length;

  state.staffBreakdown = {
    total: onDuty.length,
    doctors,
    nurses,
    technicians,
    support,
  };
  state.kpis.staffOnDuty = onDuty.length;

  // 3. Bed Occupancy
  const totalBeds = state.bedsList.length;
  const occupiedBeds = state.bedsList.filter((b) => b.status === 'occupied').length;
  state.bedOccupancy = {
    total: totalBeds,
    occupied: occupiedBeds,
    percentage: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
  };

  // 4. Emergency Status & Wait Time
  const activeEmergency = state.emergencyCasesList.filter((c) => c.status !== 'Discharged');
  const avgWait =
    activeEmergency.length > 0
      ? Math.round(
          activeEmergency.reduce((acc, cur) => acc + (cur.wait_time_minutes || 0), 0) /
            activeEmergency.length
        )
      : 0;

  const hasLevel1 = activeEmergency.some((c) => c.triage_acuity === 1);
  const hasLevel2OrLongWait = activeEmergency.some(
    (c) => c.triage_acuity === 2 || (c.wait_time_minutes && c.wait_time_minutes > 45)
  );

  state.emergencyStatus = {
    status: hasLevel1 ? 'Critical' : hasLevel2OrLongWait ? 'Elevated' : 'Stable',
    avgWaitTimeMinutes: avgWait,
    trend: activeEmergency.map((c) => ({
      time: c.arrival_time || 'Now',
      wait_minutes: c.wait_time_minutes || 0,
    })),
  };

  // 5. Patient Flow (Group patients by arrival hour if available)
  if (state.patientsList.length > 0) {
    const hourMap = new Map<string, number>();
    state.patientsList.forEach((p) => {
      const hourKey = p.admission_time ? p.admission_time.split(':')[0] + 'h' : 'Intake';
      hourMap.set(hourKey, (hourMap.get(hourKey) || 0) + 1);
    });
    const maxVal = Math.max(...Array.from(hourMap.values()), 1);
    state.patientFlow = Array.from(hourMap.entries()).map(([hour, count]) => ({
      hour,
      patients: count,
      is_peak: count === maxVal && count > 1,
    }));
  } else {
    state.patientFlow = [];
  }
}

async function logAudit(
  action: string,
  entityType: AuditEvent['entity_type'],
  entityId: string,
  description: string,
  outcome: AuditEvent['outcome'] = 'Success'
) {
  const actorName = state.currentUser?.name || 'Administrator';
  const actorRole = state.currentUser?.role || 'Administrator';

  const event: AuditEvent = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    actor_name: actorName,
    actor_role: actorRole,
    action,
    entity_type: entityType,
    entity_id: entityId,
    description,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    outcome,
  };

  state.auditLog = [event, ...state.auditLog.slice(0, 199)];

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('hospital_audit_log').insert({
        actor_name: event.actor_name,
        actor_role: event.actor_role,
        action: event.action,
        entity_type: event.entity_type,
        entity_id: event.entity_id,
        description: event.description,
        outcome: event.outcome,
      });
    } catch (e) {
      console.warn('Failed to persist audit log event to Supabase', e);
    }
  }
}

let isRealtimeInitialized = false;

export const hospitalDataService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener({ ...state });
    return () => {
      listeners.delete(listener);
    };
  },

  getData(): DashboardData {
    return { ...state };
  },

  getCurrentUser(): CurrentUser | null {
    return state.currentUser;
  },

  // --- INITIALIZE REALTIME AND RESTORE SESSION ---
  async initAuthAndRealtime(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      return;
    }

    // 1. Check existing Supabase Auth session
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Query hospital_staff table to find user details
        const { data: staffData } = await supabase
          .from('hospital_staff')
          .select('*')
          .eq('email', session.user.email?.toLowerCase().trim())
          .single();

        if (staffData) {
          state.currentUser = {
            id: String(staffData.id),
            name: String(staffData.full_name),
            role: staffData.role as UserRole,
            department: String(staffData.department),
            email: String(staffData.email),
            permissions: getPermissionsForRole(staffData.role as UserRole),
          };
        } else {
          // If in auth but not staff table, read user metadata
          const meta = session.user.user_metadata || {};
          state.currentUser = {
            id: session.user.id,
            name: meta.full_name || session.user.email?.split('@')[0] || 'Administrator',
            role: (meta.role as UserRole) || 'Administrator',
            department: meta.department || 'Hospital Administration',
            email: session.user.email || '',
            permissions: getPermissionsForRole((meta.role as UserRole) || 'Administrator'),
          };
        }
        notify();
      }

      // Listen to auth changes (sign in, sign out)
      supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (event === 'SIGNED_IN' && currentSession?.user) {
          const { data: staffData } = await supabase
            .from('hospital_staff')
            .select('*')
            .eq('email', currentSession.user.email?.toLowerCase().trim())
            .single();

          if (staffData) {
            state.currentUser = {
              id: String(staffData.id),
              name: String(staffData.full_name),
              role: staffData.role as UserRole,
              department: String(staffData.department),
              email: String(staffData.email),
              permissions: getPermissionsForRole(staffData.role as UserRole),
            };
          }
          await this.fetchFromSupabase();
        } else if (event === 'SIGNED_OUT') {
          state.currentUser = null;
          notify();
        }
      });
    } catch (err) {
      console.warn('Supabase auth session check notice:', err);
    }

    // 2. Fetch full data from Supabase
    await this.fetchFromSupabase();

    // 3. Initialize Supabase Realtime channel once
    if (!isRealtimeInitialized) {
      try {
        supabase
          .channel('hospital-ops-realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'hospital_patients' },
            () => {
              this.fetchPatients();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'hospital_appointments' },
            () => {
              this.fetchAppointments();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'hospital_beds' },
            () => {
              this.fetchBeds();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'hospital_staff' },
            () => {
              this.fetchStaff();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'hospital_emergency_cases' },
            () => {
              this.fetchEmergencyCases();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'hospital_resources' },
            () => {
              this.fetchResources();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'hospital_encounters' },
            () => {
              this.fetchEncounters();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'hospital_notifications' },
            () => {
              this.fetchNotifications();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'hospital_audit_log' },
            () => {
              this.fetchAuditLog();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'hospital_departments' },
            () => {
              this.fetchDepartments();
            }
          )
          .subscribe();

        isRealtimeInitialized = true;
      } catch (err) {
        console.warn('Realtime subscription notice:', err);
      }
    }
  },

  // --- REAL AUTHENTICATION: ADMIN SETUP, LOGIN & LOGOUT ---

  async setupAdminAccount(adminInput: {
    full_name: string;
    email: string;
    password: string;
    department?: string;
    phone?: string;
    specialty?: string;
  }): Promise<{ success: boolean; error?: string; user?: CurrentUser }> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase backend is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.',
      };
    }

    const cleanEmail = adminInput.email.trim().toLowerCase();
    const cleanPassword = adminInput.password.trim();

    if (cleanPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    try {
      // 1. Register with real Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            full_name: adminInput.full_name.trim(),
            role: 'Administrator',
            department: adminInput.department || 'Hospital Administration',
          },
        },
      });

      if (authError && !authError.message.toLowerCase().includes('already registered')) {
        return { success: false, error: authError.message };
      }

      // 2. Insert/Upsert into hospital_staff table
      const { data: staffData, error: staffError } = await supabase
        .from('hospital_staff')
        .upsert(
          {
            full_name: adminInput.full_name.trim(),
            role: 'Administrator',
            department: adminInput.department || 'Hospital Administration',
            email: cleanEmail,
            access_code: cleanPassword,
            is_on_duty: true,
            shift: 'Morning',
            phone: adminInput.phone || undefined,
            specialty: adminInput.specialty || 'Chief Medical Officer & Hospital Administrator',
            last_login_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        )
        .select()
        .single();

      if (staffError) {
        if (staffError.code === '42P01') {
          return {
            success: false,
            error:
              'Database tables do not exist yet. Please execute the SQL Schema migration script in your Supabase SQL editor.',
          };
        }
        return { success: false, error: staffError.message };
      }

      // 3. Set current authenticated user
      state.currentUser = {
        id: staffData ? String(staffData.id) : authData.user?.id || 'admin',
        name: adminInput.full_name.trim(),
        role: 'Administrator',
        department: adminInput.department || 'Hospital Administration',
        email: cleanEmail,
        permissions: getPermissionsForRole('Administrator'),
      };

      await logAudit(
        'ADMIN_ACCOUNT_SETUP',
        'Security',
        state.currentUser.id,
        `Administrator account created for ${adminInput.full_name} (${cleanEmail})`
      );

      await this.fetchFromSupabase();
      notify();

      return { success: true, user: state.currentUser };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Account setup failed: ${msg}` };
    }
  },

  async login(
    emailOrId: string,
    passwordOrCode: string
  ): Promise<{ success: boolean; error?: string; user?: CurrentUser }> {
    const cleanKey = emailOrId.trim().toLowerCase();
    const cleanSecret = passwordOrCode.trim();

    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase backend is not configured. Please enter your project credentials.',
      };
    }

    try {
      // 1. Attempt Supabase Auth login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanKey,
        password: cleanSecret,
      });

      if (!authError && authData.user) {
        // Find staff profile
        const { data: staffData } = await supabase
          .from('hospital_staff')
          .select('*')
          .eq('email', cleanKey)
          .single();

        if (staffData) {
          state.currentUser = {
            id: String(staffData.id),
            name: String(staffData.full_name),
            role: staffData.role as UserRole,
            department: String(staffData.department),
            email: String(staffData.email),
            permissions: getPermissionsForRole(staffData.role as UserRole),
          };
        } else {
          const meta = authData.user.user_metadata || {};
          state.currentUser = {
            id: authData.user.id,
            name: meta.full_name || cleanKey.split('@')[0],
            role: (meta.role as UserRole) || 'Administrator',
            department: meta.department || 'Hospital Administration',
            email: cleanKey,
            permissions: getPermissionsForRole((meta.role as UserRole) || 'Administrator'),
          };
        }

        await supabase
          .from('hospital_staff')
          .update({ last_login_at: new Date().toISOString() })
          .eq('email', cleanKey);

        await logAudit(
          'STAFF_LOGIN',
          'Security',
          state.currentUser.id,
          `${state.currentUser.name} (${state.currentUser.role}) authenticated successfully`
        );

        await this.fetchFromSupabase();
        notify();
        return { success: true, user: state.currentUser };
      }

      // 2. Also check hospital_staff table directly (for staff added by Admin with an access_code)
      const { data: staffMatch, error: queryError } = await supabase
        .from('hospital_staff')
        .select('*')
        .or(`email.eq.${cleanKey},id.eq.${cleanKey}`)
        .eq('access_code', cleanSecret)
        .single();

      if (staffMatch && !queryError) {
        state.currentUser = {
          id: String(staffMatch.id),
          name: String(staffMatch.full_name),
          role: staffMatch.role as UserRole,
          department: String(staffMatch.department),
          email: String(staffMatch.email),
          permissions: getPermissionsForRole(staffMatch.role as UserRole),
        };

        await supabase
          .from('hospital_staff')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', staffMatch.id);

        await logAudit(
          'STAFF_LOGIN',
          'Security',
          state.currentUser.id,
          `${state.currentUser.name} (${state.currentUser.role}) logged into workstation via staff credentials`
        );

        await this.fetchFromSupabase();
        notify();
        return { success: true, user: state.currentUser };
      }

      return {
        success: false,
        error: authError?.message || 'Invalid email or access credentials.',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Authentication failed: ${msg}` };
    }
  },

  async logout(): Promise<void> {
    const supabase = getSupabase();
    if (state.currentUser) {
      await logAudit(
        'STAFF_LOGOUT',
        'Security',
        state.currentUser.id,
        `${state.currentUser.name} logged out of session`
      );
    }

    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Signout notice:', err);
      }
    }

    state.currentUser = null;
    notify();
  },

  // --- QUERY ALL REAL SUPABASE TABLES ---

  async fetchFromSupabase(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      return;
    }

    try {
      await Promise.all([
        this.fetchStaff(),
        this.fetchPatients(),
        this.fetchAppointments(),
        this.fetchBeds(),
        this.fetchEmergencyCases(),
        this.fetchDepartments(),
        this.fetchResources(),
        this.fetchEncounters(),
        this.fetchStockMovements(),
        this.fetchNotifications(),
        this.fetchAuditLog(),
      ]);

      recalculateMetrics();
      notify();
    } catch (err) {
      console.warn('Supabase synchronized query note:', err);
    }
  },

  async fetchStaff(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.from('hospital_staff').select('*').order('created_at', { ascending: false });
    if (data) {
      state.staffList = data.map((s: Record<string, unknown>) => ({
        id: String(s.id),
        full_name: String(s.full_name || ''),
        role: (s.role as UserRole) || 'Doctor',
        department: String(s.department || 'General Medicine'),
        email: String(s.email || ''),
        access_code: String(s.access_code || ''),
        is_on_duty: Boolean(s.is_on_duty ?? true),
        shift: (s.shift as StaffMember['shift']) || 'Morning',
        specialty: s.specialty ? String(s.specialty) : undefined,
        phone: s.phone ? String(s.phone) : undefined,
        created_at: String(s.created_at || new Date().toISOString()),
        last_login_at: s.last_login_at ? String(s.last_login_at) : undefined,
      }));
    }
  },

  async fetchPatients(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.from('hospital_patients').select('*').order('created_at', { ascending: false });
    if (data) {
      state.patientsList = data.map((p: Record<string, unknown>) => ({
        id: String(p.id),
        mrn: String(p.mrn || ''),
        full_name: String(p.full_name || ''),
        age: Number(p.age || 0),
        gender: (p.gender as Patient['gender']) || 'Female',
        phone: p.phone ? String(p.phone) : undefined,
        date_of_birth: p.date_of_birth ? String(p.date_of_birth) : undefined,
        department: String(p.department_name || p.department || 'General Medicine'),
        status: (p.status as Patient['status']) || 'Admitted',
        triage_level: (p.triage_level as Patient['triage_level']) || 'Urgent',
        bed_assigned: p.bed_assigned ? String(p.bed_assigned) : undefined,
        attending_doctor: String(p.attending_doctor || 'Attending Physician'),
        admission_time: p.admission_time ? String(p.admission_time) : new Date().toLocaleTimeString(),
        vital_signs: {
          heart_rate: Number(p.heart_rate || 76),
          blood_pressure: String(p.blood_pressure || '120/80'),
          sp_o2: Number(p.sp_o2 || 98),
          temperature_c: Number(p.temperature_c || 36.8),
        },
        blood_type: p.blood_type ? String(p.blood_type) : undefined,
      }));
    }
  },

  async fetchAppointments(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase
      .from('hospital_appointments')
      .select('*')
      .order('appointment_date', { ascending: true })
      .order('scheduled_time', { ascending: true });
    if (data) {
      state.upcomingAppointments = data.map((row: Record<string, unknown>) => ({
        id: String(row.id),
        patient_name: String(row.patient_name || ''),
        patient_mrn: row.patient_mrn ? String(row.patient_mrn) : undefined,
        department: String(row.department || ''),
        doctor_name: String(row.doctor_name || ''),
        scheduled_time: String(row.scheduled_time || ''),
        date: String(row.appointment_date || ''),
        appointment_type: String(row.appointment_type || ''),
        status: (row.status as AppointmentStatus) || 'Scheduled',
        room: String(row.room || 'Clinic 1'),
        checked_in_at: row.checked_in_at ? String(row.checked_in_at) : undefined,
        notes: row.notes ? String(row.notes) : undefined,
      }));
    }
  },

  async fetchBeds(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.from('hospital_beds').select('*').order('bed_code', { ascending: true });
    if (data) {
      state.bedsList = data.map((b: Record<string, unknown>) => ({
        id: String(b.id),
        bed_code: String(b.bed_code),
        room_number: String(b.room_number || ''),
        department: String(b.department || 'Ward'),
        status: (b.status as BedStatus) || 'available',
        patient_name: b.patient_name ? String(b.patient_name) : undefined,
        patient_mrn: b.patient_mrn ? String(b.patient_mrn) : undefined,
        assigned_at: b.assigned_at ? String(b.assigned_at) : undefined,
        last_sanitized_at: b.last_sanitized_at ? String(b.last_sanitized_at) : undefined,
        sanitized_by: b.sanitized_by ? String(b.sanitized_by) : undefined,
        notes: b.notes ? String(b.notes) : undefined,
      }));
    }
  },

  async fetchEmergencyCases(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase
      .from('hospital_emergency_cases')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      state.emergencyCasesList = data.map((c: Record<string, unknown>) => ({
        id: String(c.id),
        case_number: String(c.case_number),
        patient_name: String(c.patient_name),
        age: Number(c.age || 0),
        chief_complaint: String(c.chief_complaint),
        triage_acuity: Number(c.triage_acuity || 2) as 1 | 2 | 3 | 4 | 5,
        arrival_time: String(c.arrival_time || 'Just now'),
        wait_time_minutes: Number(c.wait_time_minutes || 0),
        status: (c.status as EmergencyCase['status']) || 'Waiting',
        assigned_bay: c.assigned_bay ? String(c.assigned_bay) : undefined,
        attending_clinician: c.attending_clinician ? String(c.attending_clinician) : undefined,
      }));
    }
  },

  async fetchDepartments(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.from('hospital_departments').select('*').order('name', { ascending: true });
    if (data) {
      state.departments = data.map((d: Record<string, unknown>) => ({
        id: String(d.id),
        name: String(d.name),
        icon_name: (d.icon_name as DepartmentMetric['icon_name']) || 'stethoscope',
        performance_pct: Number(d.performance_pct || 80),
        is_emergency: Boolean(d.is_emergency),
        active_patients: Number(d.active_patients || 0),
        total_staff: Number(d.total_staff || 0),
        beds_occupied: Number(d.beds_occupied || 0),
        beds_total: Number(d.beds_total || 50),
      }));
    }
  },

  async fetchResources(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.from('hospital_resources').select('*').order('category', { ascending: true });
    if (data) {
      state.resources = data.map((r: Record<string, unknown>) => ({
        id: String(r.id),
        category: r.category as MedicalResourceItem['category'],
        name: String(r.name),
        stock_percentage: Number(r.stock_percentage || 0),
        current_quantity: Number(r.current_quantity || 0),
        capacity_quantity: Number(r.capacity_quantity || 0),
        unit: String(r.unit || 'units'),
        status: (r.status as MedicalResourceItem['status']) || 'Optimal',
        lot_number: r.lot_number ? String(r.lot_number) : undefined,
        expiry_date: r.expiry_date ? String(r.expiry_date) : undefined,
        minimum_threshold: r.minimum_threshold ? Number(r.minimum_threshold) : undefined,
        storage_location: r.storage_location ? String(r.storage_location) : undefined,
      }));
    }
  },

  async fetchEncounters(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.from('hospital_encounters').select('*').order('created_at', { ascending: false });
    if (data) {
      state.encountersList = data.map((e: Record<string, unknown>) => ({
        id: String(e.id),
        encounter_number: String(e.encounter_number),
        patient_id: String(e.patient_id),
        patient_name: String(e.patient_name),
        mrn: String(e.mrn),
        encounter_type: (e.encounter_type as ClinicalEncounter['encounter_type']) || 'Outpatient',
        status: (e.status as ClinicalEncounter['status']) || 'In Progress',
        attending_doctor: String(e.attending_doctor),
        chief_complaint: String(e.chief_complaint),
        clinical_notes: e.clinical_notes ? String(e.clinical_notes) : undefined,
        assessment_findings: e.assessment_findings ? String(e.assessment_findings) : undefined,
        care_plan: e.care_plan ? String(e.care_plan) : undefined,
        prescriptions_summary: e.prescriptions_summary ? String(e.prescriptions_summary) : undefined,
        author_name: String(e.author_name),
        author_role: String(e.author_role),
        finalized: Boolean(e.finalized),
        created_at: String(e.created_at),
        updated_at: String(e.updated_at),
      }));
    }
  },

  async fetchStockMovements(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase
      .from('hospital_stock_movements')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);
    if (data) {
      state.stockMovements = data.map((m: Record<string, unknown>) => ({
        id: String(m.id),
        resource_id: String(m.resource_id || ''),
        item_name: String(m.item_name || ''),
        movement_type: m.movement_type as StockMovement['movement_type'],
        quantity: Number(m.quantity || 0),
        lot_number: m.lot_number ? String(m.lot_number) : undefined,
        expiry_date: m.expiry_date ? String(m.expiry_date) : undefined,
        authorized_by: String(m.authorized_by || ''),
        reason: m.reason ? String(m.reason) : undefined,
        timestamp: String(m.timestamp || ''),
      }));
    }
  },

  async fetchNotifications(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase
      .from('hospital_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) {
      state.notifications = data.map((n: Record<string, unknown>) => ({
        id: String(n.id),
        title: String(n.title),
        message: String(n.message),
        category: (n.category as NotificationItem['category']) || 'system',
        created_at: 'Just now',
        read: Boolean(n.read),
        urgent: Boolean(n.urgent),
      }));
    }
  },

  async fetchAuditLog(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase
      .from('hospital_audit_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);
    if (data) {
      state.auditLog = data.map((a: Record<string, unknown>) => ({
        id: String(a.id),
        actor_name: String(a.actor_name),
        actor_role: a.actor_role as UserRole,
        action: String(a.action),
        entity_type: a.entity_type as AuditEvent['entity_type'],
        entity_id: String(a.entity_id),
        description: String(a.description),
        timestamp: String(a.timestamp),
        outcome: a.outcome as AuditEvent['outcome'],
      }));
    }
  },

  // --- ROLE SWITCHING ---
  switchUserRole(role: UserRole): CurrentUser | null {
    if (!state.currentUser) return null;
    state.currentUser = {
      ...state.currentUser,
      role,
      permissions: getPermissionsForRole(role),
    };
    logAudit('ROLE_SWITCH', 'Security', state.currentUser.id, `User switched operational role view to ${role}`);
    notify();
    return state.currentUser;
  },

  // --- PATIENT MANAGEMENT ---
  findPatientDuplicates(fullName: string, phone?: string): Patient[] {
    const cleanName = fullName.trim().toLowerCase();
    const cleanPhone = phone?.trim();

    return state.patientsList.filter((p) => {
      const nameMatch = p.full_name.toLowerCase() === cleanName;
      const phoneMatch = cleanPhone && p.phone && p.phone === cleanPhone;
      return nameMatch || phoneMatch;
    });
  },

  async addPatient(
    patient: Omit<Patient, 'id' | 'mrn'>,
    createEncounter: boolean = true
  ): Promise<{ success: boolean; patient?: Patient; duplicateWarning?: string; error?: string }> {
    const matches = this.findPatientDuplicates(patient.full_name, patient.phone);
    if (matches.length > 0 && !confirm(`A patient record already exists for "${matches[0].full_name}" (${matches[0].mrn}). Proceed with registration?`)) {
      logAudit('PATIENT_REGISTRATION', 'Patient', 'DUPLICATE', `Registration aborted: duplicate identified for ${patient.full_name}`, 'Conflict');
      return { success: false, duplicateWarning: `Duplicate patient identified: ${matches[0].full_name} (${matches[0].mrn})` };
    }

    const mrnCode = `MRN-${Math.floor(10000 + Math.random() * 90000)}`;
    const supabase = getSupabase();

    let newId = `pat-${Date.now()}`;
    if (supabase && isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('hospital_patients')
        .insert({
          mrn: mrnCode,
          full_name: patient.full_name,
          age: patient.age,
          gender: patient.gender,
          phone: patient.phone,
          department_name: patient.department,
          status: patient.status,
          triage_level: patient.triage_level,
          attending_doctor: patient.attending_doctor,
          bed_assigned: patient.bed_assigned,
          heart_rate: patient.vital_signs.heart_rate,
          blood_pressure: patient.vital_signs.blood_pressure,
          sp_o2: patient.vital_signs.sp_o2,
          temperature_c: patient.vital_signs.temperature_c,
          blood_type: patient.blood_type,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      if (data?.id) newId = String(data.id);
    }

    const newPatient: Patient = {
      ...patient,
      id: newId,
      mrn: mrnCode,
    };

    state.patientsList = [newPatient, ...state.patientsList];
    recalculateMetrics();

    await logAudit(
      'PATIENT_REGISTERED',
      'Patient',
      newPatient.mrn,
      `Registered patient ${newPatient.full_name} (${newPatient.mrn}) assigned to ${newPatient.department}`
    );

    if (createEncounter) {
      await this.createClinicalEncounter({
        patient_id: newPatient.id,
        patient_name: newPatient.full_name,
        mrn: newPatient.mrn,
        encounter_type: newPatient.status === 'Triage' ? 'Emergency' : 'Walk-In',
        attending_doctor: newPatient.attending_doctor,
        chief_complaint: `Initial hospital admission for ${newPatient.department} evaluation.`,
      });
    }

    notify();
    return { success: true, patient: newPatient };
  },

  // --- APPOINTMENTS ---
  checkAppointmentConflict(doctorName: string, date: string, time: string, excludeId?: string): Appointment | null {
    const conflict = state.upcomingAppointments.find((a) => {
      if (excludeId && a.id === excludeId) return false;
      if (a.status === 'Cancelled' || a.status === 'No Show') return false;
      return a.doctor_name === doctorName && a.date === date && a.scheduled_time === time;
    });
    return conflict || null;
  },

  async addAppointment(
    appointment: Omit<Appointment, 'id'>
  ): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    const conflict = this.checkAppointmentConflict(appointment.doctor_name, appointment.date, appointment.scheduled_time);
    if (conflict) {
      logAudit('APPOINTMENT_SCHEDULE', 'Appointment', 'CONFLICT', `Booking conflict: ${appointment.doctor_name} is already booked at ${appointment.scheduled_time}`, 'Conflict');
      return {
        success: false,
        error: `Schedule conflict: ${appointment.doctor_name} already has an appointment with ${conflict.patient_name} at ${appointment.scheduled_time}.`,
      };
    }

    const supabase = getSupabase();
    let newId = `apt-${Date.now()}`;

    if (supabase && isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('hospital_appointments')
        .insert({
          patient_name: appointment.patient_name,
          patient_mrn: appointment.patient_mrn,
          department: appointment.department,
          doctor_name: appointment.doctor_name,
          scheduled_time: appointment.scheduled_time,
          appointment_date: appointment.date,
          appointment_type: appointment.appointment_type,
          status: appointment.status,
          room: appointment.room,
          notes: appointment.notes,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      if (data?.id) newId = String(data.id);
    }

    const newApt: Appointment = {
      ...appointment,
      id: newId,
    };

    state.upcomingAppointments = [newApt, ...state.upcomingAppointments];
    recalculateMetrics();

    await logAudit('APPOINTMENT_SCHEDULED', 'Appointment', newApt.id, `Booked ${newApt.appointment_type} for ${newApt.patient_name} with ${newApt.doctor_name} at ${newApt.scheduled_time}`);
    notify();
    return { success: true, appointment: newApt };
  },

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
    const apt = state.upcomingAppointments.find((a) => a.id === id);
    if (!apt) return;

    const oldStatus = apt.status;
    apt.status = status;

    if (status === 'Checked-In') {
      apt.checked_in_at = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (!apt.encounter_id) {
        const enc = await this.createClinicalEncounter({
          patient_id: apt.patient_id || `pat-${apt.patient_name.replace(/\s+/g, '-').toLowerCase()}`,
          patient_name: apt.patient_name,
          mrn: apt.patient_mrn || 'MRN-PENDING',
          encounter_type: 'Outpatient',
          attending_doctor: apt.doctor_name,
          chief_complaint: `${apt.appointment_type} scheduled consultation.`,
        });
        apt.encounter_id = enc.id;
      }
    }

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      await supabase
        .from('hospital_appointments')
        .update({ status, checked_in_at: apt.checked_in_at })
        .eq('id', id);
    }

    await logAudit('APPOINTMENT_STATUS_UPDATE', 'Appointment', id, `Updated appointment for ${apt.patient_name} from "${oldStatus}" to "${status}"`);
    notify();
  },

  // --- BEDS MANAGEMENT ---
  async addBed(bedInput: {
    bed_code: string;
    room_number: string;
    department: string;
    status?: BedStatus;
  }): Promise<{ success: boolean; bed?: BedRecord; error?: string }> {
    const supabase = getSupabase();
    const cleanCode = bedInput.bed_code.trim().toUpperCase();

    if (state.bedsList.some((b) => b.bed_code.toUpperCase() === cleanCode)) {
      return { success: false, error: `Bed code "${cleanCode}" already exists.` };
    }

    let newId = `bed-${Date.now()}`;
    if (supabase && isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('hospital_beds')
        .insert({
          bed_code: cleanCode,
          room_number: bedInput.room_number.trim(),
          department: bedInput.department.trim(),
          status: bedInput.status || 'available',
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      if (data?.id) newId = String(data.id);
    }

    const newBed: BedRecord = {
      id: newId,
      bed_code: cleanCode,
      room_number: bedInput.room_number.trim(),
      department: bedInput.department.trim(),
      status: bedInput.status || 'available',
    };

    state.bedsList = [...state.bedsList, newBed];
    recalculateMetrics();

    await logAudit('BED_CREATED', 'Bed', newBed.bed_code, `Added new hospital bed ${newBed.bed_code} to ${newBed.department}`);
    notify();
    return { success: true, bed: newBed };
  },

  async assignBed(
    bedId: string,
    patientName: string,
    patientMrn?: string
  ): Promise<{ success: boolean; error?: string }> {
    const bed = state.bedsList.find((b) => b.id === bedId);
    if (!bed) return { success: false, error: 'Bed not found' };

    if (bed.status === 'occupied') {
      return { success: false, error: `Bed ${bed.bed_code} is currently occupied by ${bed.patient_name}.` };
    }
    if (bed.status === 'cleaning') {
      return { success: false, error: `Bed ${bed.bed_code} requires terminal sanitization before intake.` };
    }
    if (bed.status === 'maintenance') {
      return { success: false, error: `Bed ${bed.bed_code} is out of service for maintenance.` };
    }

    bed.status = 'occupied';
    bed.patient_name = patientName;
    bed.patient_mrn = patientMrn || `MRN-${Math.floor(10000 + Math.random() * 90000)}`;
    bed.assigned_at = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      await supabase
        .from('hospital_beds')
        .update({
          status: 'occupied',
          patient_name: bed.patient_name,
          patient_mrn: bed.patient_mrn,
          assigned_at: bed.assigned_at,
        })
        .eq('id', bedId);
    }

    recalculateMetrics();
    await logAudit('BED_OCCUPIED', 'Bed', bed.bed_code, `Assigned ${bed.bed_code} in ${bed.department} to ${patientName}`);
    notify();
    return { success: true };
  },

  async transferBed(fromBedId: string, toBedId: string): Promise<{ success: boolean; error?: string }> {
    const fromBed = state.bedsList.find((b) => b.id === fromBedId);
    const toBed = state.bedsList.find((b) => b.id === toBedId);

    if (!fromBed || !toBed) return { success: false, error: 'Bed records not located' };
    if (fromBed.status !== 'occupied') return { success: false, error: 'Origin bed has no admitted patient' };
    if (toBed.status !== 'available') return { success: false, error: `Target bed ${toBed.bed_code} is not available` };

    const patientName = fromBed.patient_name;
    const patientMrn = fromBed.patient_mrn;

    fromBed.status = 'cleaning';
    fromBed.patient_name = undefined;
    fromBed.patient_mrn = undefined;
    fromBed.notes = `Transferred to ${toBed.bed_code}. Terminal disinfection required.`;

    toBed.status = 'occupied';
    toBed.patient_name = patientName;
    toBed.patient_mrn = patientMrn;
    toBed.assigned_at = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      await supabase
        .from('hospital_beds')
        .update({ status: 'cleaning', patient_name: null, patient_mrn: null, notes: fromBed.notes })
        .eq('id', fromBedId);

      await supabase
        .from('hospital_beds')
        .update({ status: 'occupied', patient_name: patientName, patient_mrn: patientMrn, assigned_at: toBed.assigned_at })
        .eq('id', toBedId);
    }

    recalculateMetrics();
    await logAudit('BED_TRANSFER', 'Bed', `${fromBed.bed_code} -> ${toBed.bed_code}`, `Transferred patient ${patientName} from ${fromBed.bed_code} to ${toBed.bed_code}`);
    notify();
    return { success: true };
  },

  async dischargeBed(bedId: string): Promise<{ success: boolean; error?: string }> {
    const bed = state.bedsList.find((b) => b.id === bedId);
    if (!bed) return { success: false, error: 'Bed record not found' };

    const dischargedPatient = bed.patient_name || 'Patient';
    bed.status = 'cleaning';
    bed.patient_name = undefined;
    bed.patient_mrn = undefined;
    bed.notes = 'Discharged. Terminal sanitization required before next admission.';

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      await supabase
        .from('hospital_beds')
        .update({ status: 'cleaning', patient_name: null, patient_mrn: null, notes: bed.notes })
        .eq('id', bedId);
    }

    recalculateMetrics();
    await logAudit('BED_DISCHARGE', 'Bed', bed.bed_code, `Discharged ${dischargedPatient} from ${bed.bed_code}. Placed in terminal cleaning queue.`);
    notify();
    return { success: true };
  },

  async sanitizeBed(bedId: string): Promise<{ success: boolean; error?: string }> {
    const bed = state.bedsList.find((b) => b.id === bedId);
    if (!bed) return { success: false, error: 'Bed record not found' };

    bed.status = 'available';
    bed.last_sanitized_at = new Date().toISOString().replace('T', ' ').substring(0, 16);
    bed.sanitized_by = state.currentUser?.name || 'Sanitation Team';
    bed.notes = undefined;

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      await supabase
        .from('hospital_beds')
        .update({
          status: 'available',
          last_sanitized_at: bed.last_sanitized_at,
          sanitized_by: bed.sanitized_by,
          notes: null,
        })
        .eq('id', bedId);
    }

    recalculateMetrics();
    await logAudit('BED_SANITIZED', 'Bed', bed.bed_code, `Bed ${bed.bed_code} terminal disinfection verified by ${bed.sanitized_by}. Now available for intake.`);
    notify();
    return { success: true };
  },

  // --- EMERGENCY DEPARTMENT WORKFLOW ---
  async addEmergencyCase(
    emergencyCase: Omit<EmergencyCase, 'id' | 'case_number'>
  ): Promise<EmergencyCase> {
    const caseNum = `ER-2026-${Math.floor(100 + Math.random() * 900)}`;
    const clinician = emergencyCase.attending_clinician || state.currentUser?.name || 'Triage Officer';
    const supabase = getSupabase();

    let newId = `em-${Date.now()}`;
    if (supabase && isSupabaseConfigured()) {
      const { data } = await supabase
        .from('hospital_emergency_cases')
        .insert({
          case_number: caseNum,
          patient_name: emergencyCase.patient_name,
          age: emergencyCase.age,
          chief_complaint: emergencyCase.chief_complaint,
          triage_acuity: emergencyCase.triage_acuity,
          wait_time_minutes: emergencyCase.wait_time_minutes,
          status: emergencyCase.status,
          assigned_bay: emergencyCase.assigned_bay,
          attending_clinician: clinician,
        })
        .select()
        .single();

      if (data?.id) newId = String(data.id);
    }

    const newCase: EmergencyCase = {
      ...emergencyCase,
      id: newId,
      case_number: caseNum,
      attending_clinician: clinician,
    };

    state.emergencyCasesList = [newCase, ...state.emergencyCasesList];

    if (newCase.triage_acuity <= 2) {
      state.notifications.unshift({
        id: `notif-esc-${Date.now()}`,
        title: `CRITICAL TRIAGE: ${newCase.assigned_bay || 'Trauma Bay'}`,
        message: `High-acuity Level ${newCase.triage_acuity} emergency intake: ${newCase.patient_name} - ${newCase.chief_complaint}.`,
        category: 'emergency',
        created_at: 'Just now',
        read: false,
        urgent: true,
      });
    }

    recalculateMetrics();
    await logAudit('EMERGENCY_TRIAGE', 'Emergency', newCase.case_number, `Triage Level ${newCase.triage_acuity} intake for ${newCase.patient_name} in ${newCase.assigned_bay}`);
    notify();
    return newCase;
  },

  async updateEmergencyCaseStatus(id: string, status: EmergencyCase['status']): Promise<void> {
    const c = state.emergencyCasesList.find((item) => item.id === id);
    if (!c) return;

    const oldStatus = c.status;
    c.status = status;

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('hospital_emergency_cases').update({ status }).eq('id', id);
    }

    recalculateMetrics();
    await logAudit('EMERGENCY_STATUS', 'Emergency', c.case_number, `Updated emergency case for ${c.patient_name} from ${oldStatus} to ${status}`);
    notify();
  },

  // --- CLINICAL ENCOUNTERS ---
  async createClinicalEncounter(encounter: {
    patient_id: string;
    patient_name: string;
    mrn: string;
    encounter_type: ClinicalEncounter['encounter_type'];
    attending_doctor: string;
    chief_complaint: string;
  }): Promise<ClinicalEncounter> {
    const encNum = `ENC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const authorName = state.currentUser?.name || encounter.attending_doctor;
    const authorRole = state.currentUser?.role || 'Doctor';
    const supabase = getSupabase();

    let newId = `enc-${Date.now()}`;
    if (supabase && isSupabaseConfigured()) {
      const { data } = await supabase
        .from('hospital_encounters')
        .insert({
          encounter_number: encNum,
          patient_name: encounter.patient_name,
          mrn: encounter.mrn,
          encounter_type: encounter.encounter_type,
          status: 'In Progress',
          attending_doctor: encounter.attending_doctor,
          chief_complaint: encounter.chief_complaint,
          author_name: authorName,
          author_role: authorRole,
          finalized: false,
        })
        .select()
        .single();

      if (data?.id) newId = String(data.id);
    }

    const newEnc: ClinicalEncounter = {
      id: newId,
      encounter_number: encNum,
      patient_id: encounter.patient_id,
      patient_name: encounter.patient_name,
      mrn: encounter.mrn,
      encounter_type: encounter.encounter_type,
      status: 'In Progress',
      attending_doctor: encounter.attending_doctor,
      chief_complaint: encounter.chief_complaint,
      author_name: authorName,
      author_role: authorRole,
      finalized: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    state.encountersList = [newEnc, ...state.encountersList];
    await logAudit('ENCOUNTER_CREATED', 'Encounter', newEnc.encounter_number, `Initiated ${newEnc.encounter_type} encounter for ${newEnc.patient_name}`);
    notify();
    return newEnc;
  },

  async updateEncounter(
    id: string,
    data: {
      clinical_notes?: string;
      assessment_findings?: string;
      care_plan?: string;
      prescriptions_summary?: string;
      finalized?: boolean;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const enc = state.encountersList.find((e) => e.id === id);
    if (!enc) return { success: false, error: 'Encounter not found' };

    if (enc.finalized && !data.finalized) {
      return { success: false, error: 'Finalized clinical records cannot be overwritten without an addendum.' };
    }

    if (data.clinical_notes !== undefined) enc.clinical_notes = data.clinical_notes;
    if (data.assessment_findings !== undefined) enc.assessment_findings = data.assessment_findings;
    if (data.care_plan !== undefined) enc.care_plan = data.care_plan;
    if (data.prescriptions_summary !== undefined) enc.prescriptions_summary = data.prescriptions_summary;
    if (data.finalized !== undefined) enc.finalized = data.finalized;

    enc.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 16);
    if (enc.finalized) enc.status = 'Completed';

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      await supabase
        .from('hospital_encounters')
        .update({
          clinical_notes: enc.clinical_notes,
          assessment_findings: enc.assessment_findings,
          care_plan: enc.care_plan,
          prescriptions_summary: enc.prescriptions_summary,
          finalized: enc.finalized,
          status: enc.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    }

    await logAudit('ENCOUNTER_DOCUMENTED', 'Encounter', enc.encounter_number, `Clinical documentation updated for ${enc.patient_name} by ${state.currentUser?.name} (Finalized: ${enc.finalized})`);
    notify();
    return { success: true };
  },

  // --- INVENTORY & RESOURCES ---
  async addResource(resource: {
    category: MedicalResourceItem['category'];
    name: string;
    current_quantity: number;
    capacity_quantity: number;
    unit: string;
    lot_number?: string;
    expiry_date?: string;
    minimum_threshold?: number;
    storage_location?: string;
  }): Promise<{ success: boolean; error?: string; resource?: MedicalResourceItem }> {
    const pct = Math.round((resource.current_quantity / resource.capacity_quantity) * 100);
    const status = pct < 30 ? 'Critical' : pct < 70 ? 'Low' : 'Optimal';

    const supabase = getSupabase();
    let newId = `res-${Date.now()}`;

    if (supabase && isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('hospital_resources')
        .insert({
          category: resource.category,
          name: resource.name.trim(),
          stock_percentage: pct,
          current_quantity: resource.current_quantity,
          capacity_quantity: resource.capacity_quantity,
          unit: resource.unit.trim(),
          status,
          lot_number: resource.lot_number,
          expiry_date: resource.expiry_date,
          minimum_threshold: resource.minimum_threshold,
          storage_location: resource.storage_location,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      if (data?.id) newId = String(data.id);
    }

    const newRes: MedicalResourceItem = {
      ...resource,
      id: newId,
      stock_percentage: pct,
      status,
    };

    state.resources = [...state.resources, newRes];
    await logAudit('RESOURCE_CREATED', 'Inventory', newRes.name, `Added resource ${newRes.name} to pharmacy catalogue (${newRes.current_quantity} ${newRes.unit})`);
    notify();
    return { success: true, resource: newRes };
  },

  async recordStockMovement(
    resourceId: string,
    movementType: StockMovement['movement_type'],
    quantity: number,
    reason: string = 'Operational movement'
  ): Promise<{ success: boolean; error?: string }> {
    const res = state.resources.find((r) => r.id === resourceId);
    if (!res) return { success: false, error: 'Resource item not found' };

    const qtyChange = movementType === 'Receipt' ? quantity : -quantity;
    const nextQty = res.current_quantity + qtyChange;

    if (nextQty < 0) {
      logAudit('INVENTORY_ALERT', 'Inventory', res.name, `Denied negative inventory adjustment of ${quantity} ${res.unit}`, 'Conflict');
      return { success: false, error: `Insufficient stock for ${res.name}. Current stock: ${res.current_quantity} ${res.unit}.` };
    }

    res.current_quantity = Math.min(res.capacity_quantity, nextQty);
    res.stock_percentage = Math.round((res.current_quantity / res.capacity_quantity) * 100);
    res.status = res.stock_percentage < 30 ? 'Critical' : res.stock_percentage < 70 ? 'Low' : 'Optimal';

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      resource_id: res.id,
      item_name: res.name,
      movement_type: movementType,
      quantity,
      lot_number: res.lot_number,
      expiry_date: res.expiry_date,
      authorized_by: state.currentUser?.name || 'Authorized Staff',
      reason,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    state.stockMovements = [movement, ...state.stockMovements.slice(0, 99)];

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      await supabase
        .from('hospital_resources')
        .update({
          current_quantity: res.current_quantity,
          stock_percentage: res.stock_percentage,
          status: res.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', res.id);

      await supabase.from('hospital_stock_movements').insert({
        item_name: res.name,
        movement_type: movementType,
        quantity,
        lot_number: res.lot_number,
        authorized_by: movement.authorized_by,
        reason,
      });
    }

    await logAudit('STOCK_MOVEMENT', 'Inventory', res.name, `${movementType} of ${quantity} ${res.unit} for ${res.name} (${reason})`);
    notify();
    return { success: true };
  },

  updateResourceStock(resourceId: string, addQuantity: number): void {
    const movementType = addQuantity >= 0 ? 'Receipt' : 'Dispense';
    this.recordStockMovement(resourceId, movementType, Math.abs(addQuantity), 'Quick adjustment');
  },

  // --- DEPARTMENTS ---
  async addDepartment(dept: {
    name: string;
    icon_name?: DepartmentMetric['icon_name'];
    performance_pct?: number;
    is_emergency?: boolean;
    beds_total?: number;
  }): Promise<{ success: boolean; error?: string; department?: DepartmentMetric }> {
    const supabase = getSupabase();
    let newId = `dep-${Date.now()}`;

    if (supabase && isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('hospital_departments')
        .insert({
          name: dept.name.trim(),
          icon_name: dept.icon_name || 'stethoscope',
          performance_pct: dept.performance_pct || 85,
          is_emergency: Boolean(dept.is_emergency),
          beds_total: dept.beds_total || 40,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      if (data?.id) newId = String(data.id);
    }

    const newDept: DepartmentMetric = {
      id: newId,
      name: dept.name.trim(),
      icon_name: dept.icon_name || 'stethoscope',
      performance_pct: dept.performance_pct || 85,
      is_emergency: Boolean(dept.is_emergency),
      active_patients: 0,
      total_staff: 0,
      beds_occupied: 0,
      beds_total: dept.beds_total || 40,
    };

    state.departments = [...state.departments, newDept];
    await logAudit('DEPARTMENT_CREATED', 'Security', newDept.name, `Created department wing ${newDept.name}`);
    notify();
    return { success: true, department: newDept };
  },

  // --- STAFF CREDENTIALS & IDENTITY MANAGEMENT ---
  getStaffList(): StaffMember[] {
    return [...state.staffList];
  },

  async addStaffMember(
    staffInput: Omit<StaffMember, 'id' | 'created_at'>
  ): Promise<{ success: boolean; staff?: StaffMember; error?: string }> {
    const cleanEmail = staffInput.email.trim().toLowerCase();
    const existing = state.staffList.find((s) => s.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: `A staff member with email "${staffInput.email}" is already registered.` };
    }

    const supabase = getSupabase();
    let newId = `st-${Date.now()}`;

    if (supabase && isSupabaseConfigured()) {
      // Also register staff in Supabase Auth if possible
      try {
        await supabase.auth.signUp({
          email: cleanEmail,
          password: staffInput.access_code.trim(),
          options: {
            data: {
              full_name: staffInput.full_name,
              role: staffInput.role,
              department: staffInput.department,
            },
          },
        });
      } catch (authE) {
        console.warn('Optional staff Auth signUp notice:', authE);
      }

      const { data, error } = await supabase
        .from('hospital_staff')
        .insert({
          full_name: staffInput.full_name.trim(),
          role: staffInput.role,
          department: staffInput.department.trim(),
          email: cleanEmail,
          access_code: staffInput.access_code.trim(),
          is_on_duty: staffInput.is_on_duty,
          shift: staffInput.shift,
          specialty: staffInput.specialty,
          phone: staffInput.phone,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      if (data?.id) newId = String(data.id);
    }

    const newStaff: StaffMember = {
      ...staffInput,
      id: newId,
      email: cleanEmail,
      access_code: staffInput.access_code.trim(),
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    state.staffList = [newStaff, ...state.staffList];
    recalculateMetrics();

    await logAudit(
      'STAFF_CREDENTIALS_ISSUED',
      'Security',
      newStaff.id,
      `Issued credentials for ${newStaff.full_name} (${newStaff.role} · ${newStaff.department})`
    );

    notify();
    return { success: true, staff: newStaff };
  },

  async updateStaffMember(
    id: string,
    updates: Partial<StaffMember>
  ): Promise<{ success: boolean; error?: string }> {
    const idx = state.staffList.findIndex((s) => s.id === id);
    if (idx === -1) return { success: false, error: 'Staff record not found.' };

    state.staffList[idx] = { ...state.staffList[idx], ...updates };

    if (state.currentUser?.id === id || state.currentUser?.email === state.staffList[idx].email) {
      const updated = state.staffList[idx];
      state.currentUser = {
        id: updated.id,
        name: updated.full_name,
        role: updated.role,
        department: updated.department,
        email: updated.email,
        permissions: getPermissionsForRole(updated.role),
      };
    }

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('hospital_staff').update(updates).eq('id', id);
    }

    recalculateMetrics();
    await logAudit(
      'STAFF_UPDATED',
      'Security',
      id,
      `Staff profile modified for ${state.staffList[idx].full_name} (${state.staffList[idx].role})`
    );

    notify();
    return { success: true };
  },

  async deleteStaffMember(id: string): Promise<{ success: boolean }> {
    const staff = state.staffList.find((s) => s.id === id);
    if (!staff) return { success: false };

    state.staffList = state.staffList.filter((s) => s.id !== id);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('hospital_staff').delete().eq('id', id);
    }

    recalculateMetrics();
    await logAudit(
      'STAFF_REVOKED',
      'Security',
      id,
      `Administrator revoked access credentials for ${staff.full_name} (${staff.role} · ${staff.department})`
    );

    notify();
    return { success: true };
  },

  loginAsStaffMember(staffId: string): CurrentUser | null {
    const staff = state.staffList.find((s) => s.id === staffId);
    if (!staff) return null;

    state.currentUser = {
      id: staff.id,
      name: staff.full_name,
      role: staff.role,
      department: staff.department,
      email: staff.email,
      permissions: getPermissionsForRole(staff.role),
    };

    logAudit(
      'STAFF_LOGIN',
      'Security',
      staff.id,
      `Session switched to ${staff.full_name} (${staff.role} · ${staff.department})`
    );

    notify();
    return state.currentUser;
  },

  // --- NOTIFICATION CONTROLS ---
  markNotificationRead(id: string): void {
    const n = state.notifications.find((notif) => notif.id === id);
    if (n) {
      n.read = true;
      const supabase = getSupabase();
      if (supabase && isSupabaseConfigured()) {
        supabase.from('hospital_notifications').update({ read: true }).eq('id', id).then();
      }
      notify();
    }
  },

  markAllNotificationsRead(): void {
    state.notifications.forEach((n) => (n.read = true));
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      supabase.from('hospital_notifications').update({ read: true }).neq('id', '00000000-0000-0000-0000-000000000000').then();
    }
    notify();
  },
};
