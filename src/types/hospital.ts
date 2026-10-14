export type UserRole =
  | 'Administrator'
  | 'Doctor'
  | 'Nurse'
  | 'Receptionist'
  | 'Pharmacist'
  | 'Triage Officer';

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  email: string;
  permissions: {
    canRegisterPatient: boolean;
    canManageAppointments: boolean;
    canDocumentClinical: boolean;
    canTriageEmergency: boolean;
    canAssignBeds: boolean;
    canDispenseMedications: boolean;
    canViewAuditTrail: boolean;
    canConfigureDatabase: boolean;
  };
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number (Unique identifier)
  full_name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  department: string;
  status: 'Admitted' | 'Triage' | 'Observation' | 'Discharged';
  triage_level: 'Immediate' | 'Emergent' | 'Urgent' | 'Semi-Urgent' | 'Non-Urgent';
  bed_assigned?: string;
  attending_doctor: string;
  admission_time: string;
  vital_signs: {
    heart_rate: number;
    blood_pressure: string;
    sp_o2: number;
    temperature_c: number;
  };
  known_allergies?: string[];
  blood_type?: string;
}

export type AppointmentStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'Checked-In'
  | 'In Consultation'
  | 'Completed'
  | 'Cancelled'
  | 'No Show';

export interface Appointment {
  id: string;
  patient_id?: string;
  patient_name: string;
  patient_mrn?: string;
  department: string;
  doctor_name: string;
  scheduled_time: string; // e.g. "09:00", "10:30"
  date: string; // "2026-09-15"
  appointment_type: string;
  status: AppointmentStatus;
  room: string;
  notes?: string;
  checked_in_at?: string;
  encounter_id?: string;
}

export interface ClinicalEncounter {
  id: string;
  encounter_number: string;
  patient_id: string;
  patient_name: string;
  mrn: string;
  encounter_type: 'Outpatient' | 'Emergency' | 'Inpatient Admission' | 'Walk-In';
  status:
    | 'Registered'
    | 'Awaiting Assessment'
    | 'In Progress'
    | 'Awaiting Results'
    | 'Completed'
    | 'Referred'
    | 'Closed';
  attending_doctor: string;
  chief_complaint: string;
  clinical_notes?: string;
  assessment_findings?: string;
  prescriptions_summary?: string;
  care_plan?: string;
  author_name: string;
  author_role: string;
  finalized: boolean;
  created_at: string;
  updated_at: string;
}

export interface DepartmentMetric {
  id: string;
  name: string;
  icon_name: 'ambulance' | 'heart' | 'scan' | 'baby' | 'bone' | 'stethoscope';
  performance_pct: number;
  is_emergency?: boolean;
  active_patients: number;
  total_staff: number;
  beds_occupied: number;
  beds_total: number;
}

export type BedStatus = 'available' | 'reserved' | 'occupied' | 'cleaning' | 'maintenance';

export interface BedRecord {
  id: string;
  bed_code: string;
  room_number: string;
  department: string;
  status: BedStatus;
  patient_name?: string;
  patient_mrn?: string;
  assigned_at?: string;
  last_sanitized_at?: string;
  sanitized_by?: string;
  notes?: string;
}

export interface StaffMember {
  id: string;
  full_name: string;
  role: UserRole;
  department: string;
  email: string;
  access_code: string; // Login Password / Access PIN
  is_on_duty: boolean;
  shift: 'Morning' | 'Evening' | 'Night' | 'On-Call';
  phone?: string;
  specialty?: string;
  created_at: string;
  last_login_at?: string;
}

export interface StaffBreakdown {
  total: number;
  doctors: number;
  nurses: number;
  technicians: number;
  support: number;
}

export interface EmergencyCase {
  id: string;
  case_number: string;
  patient_name: string;
  age: number;
  chief_complaint: string;
  triage_acuity: 1 | 2 | 3 | 4 | 5; // 1 = resuscitation, 5 = non-urgent
  arrival_time: string;
  wait_time_minutes: number;
  status: 'Waiting' | 'Triage' | 'Treating' | 'Admitted' | 'Discharged';
  assigned_bay?: string;
  attending_clinician?: string;
  triage_notes?: string;
}

export interface StockMovement {
  id: string;
  resource_id: string;
  item_name: string;
  movement_type: 'Receipt' | 'Dispense' | 'Adjustment' | 'Disposal';
  quantity: number;
  lot_number?: string;
  expiry_date?: string;
  authorized_by: string;
  reason?: string;
  timestamp: string;
}

export interface MedicalResourceItem {
  id: string;
  category: 'Medications' | 'Equipment' | 'Blood Supply';
  name: string;
  stock_percentage: number;
  current_quantity: number;
  capacity_quantity: number;
  unit: string;
  status: 'Optimal' | 'Low' | 'Critical';
  lot_number?: string;
  expiry_date?: string;
  minimum_threshold?: number;
  storage_location?: string;
}

export interface AuditEvent {
  id: string;
  actor_name: string;
  actor_role: UserRole;
  action: string;
  entity_type: 'Patient' | 'Appointment' | 'Encounter' | 'Bed' | 'Emergency' | 'Inventory' | 'Security';
  entity_id: string;
  description: string;
  timestamp: string;
  outcome: 'Success' | 'Denied' | 'Conflict' | 'Failed';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'emergency' | 'bed' | 'resource' | 'system';
  created_at: string;
  read: boolean;
  urgent: boolean;
  entity_type?: string;
  entity_id?: string;
}

export interface HourlyFlow {
  hour: string; // e.g. "6AM", "9AM", "12PM", "3PM", "6PM", "9PM", "12AM"
  patients: number;
  is_peak?: boolean;
}

export interface EmergencyWaitTrend {
  time: string; // "6AM", "9AM", "12PM", "3PM", "6PM", "9PM", "12AM"
  wait_minutes: number;
}
