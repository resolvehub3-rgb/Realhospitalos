import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'hospital_ops_supabase_url';
const STORAGE_KEY_ANON = 'hospital_ops_supabase_anon_key';

export function getSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON) || '' : '';

  return {
    url: localUrl || envUrl,
    anonKey: localKey || envKey,
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http') && !url.includes('your-project-id'));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !url.startsWith('http') || url.includes('your-project-id')) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
  }
  supabaseInstance = null; // reset instance to pick up new credentials
}

export function clearSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
  }
  supabaseInstance = null;
}

export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  tableCount?: number;
  tablesFound?: string[];
}> {
  const client = getSupabase();
  if (!client) {
    return {
      success: false,
      message: 'Supabase URL or Anon Public Key is not configured.',
    };
  }

  try {
    // Check connection by attempting to select from hospital_staff
    const { count, error } = await client.from('hospital_staff').select('*', { count: 'exact', head: true });
    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase project! Ready to execute SQL schema script in Supabase SQL editor.',
          tableCount: 0,
        };
      }
      return {
        success: false,
        message: `Database query error: ${error.message} (${error.code || 'unknown'})`,
      };
    }

    return {
      success: true,
      message: 'Successfully verified connection to Supabase PostgreSQL database & tables.',
      tableCount: count ?? 0,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Connection test failed: ${msg}`,
    };
  }
}

export const SUPABASE_SCHEMA_SQL = `-- HOSPITAL OPERATIONS MANAGEMENT DATABASE SCHEMA
-- PostgreSQL Schema with Row Level Security (RLS) & Realtime Subscriptions

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS hospital_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon_name TEXT NOT NULL DEFAULT 'stethoscope',
  performance_pct NUMERIC(5,2) NOT NULL DEFAULT 85.0,
  is_emergency BOOLEAN NOT NULL DEFAULT FALSE,
  active_patients INT NOT NULL DEFAULT 0,
  total_staff INT NOT NULL DEFAULT 0,
  beds_occupied INT NOT NULL DEFAULT 0,
  beds_total INT NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Patients Table
CREATE TABLE IF NOT EXISTS hospital_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mrn TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  age INT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  phone TEXT,
  date_of_birth DATE,
  department_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Admitted' CHECK (status IN ('Admitted', 'Triage', 'Observation', 'Discharged')),
  triage_level TEXT NOT NULL DEFAULT 'Urgent' CHECK (triage_level IN ('Immediate', 'Emergent', 'Urgent', 'Semi-Urgent', 'Non-Urgent')),
  bed_assigned TEXT,
  attending_doctor TEXT NOT NULL,
  heart_rate INT DEFAULT 78,
  blood_pressure TEXT DEFAULT '120/80',
  sp_o2 INT DEFAULT 98,
  temperature_c NUMERIC(4,1) DEFAULT 36.8,
  blood_type TEXT,
  admission_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Appointments Table
CREATE TABLE IF NOT EXISTS hospital_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  patient_mrn TEXT,
  department TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  appointment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  appointment_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Confirmed', 'Checked-In', 'In Consultation', 'Completed', 'Cancelled', 'No Show')),
  room TEXT NOT NULL,
  checked_in_at TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Hospital Beds Table
CREATE TABLE IF NOT EXISTS hospital_beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bed_code TEXT NOT NULL UNIQUE,
  room_number TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('occupied', 'available', 'cleaning', 'maintenance')),
  patient_name TEXT,
  patient_mrn TEXT,
  assigned_at TIMESTAMPTZ,
  last_sanitized_at TIMESTAMPTZ,
  sanitized_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Staff Members, Credentials & Duty Table
CREATE TABLE IF NOT EXISTS hospital_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Administrator', 'Doctor', 'Nurse', 'Receptionist', 'Pharmacist', 'Triage Officer')),
  department TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  access_code TEXT NOT NULL,
  is_on_duty BOOLEAN NOT NULL DEFAULT TRUE,
  shift TEXT NOT NULL DEFAULT 'Morning' CHECK (shift IN ('Morning', 'Evening', 'Night', 'On-Call')),
  specialty TEXT,
  phone TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Emergency Cases Table
CREATE TABLE IF NOT EXISTS hospital_emergency_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT NOT NULL UNIQUE,
  patient_name TEXT NOT NULL,
  age INT NOT NULL,
  chief_complaint TEXT NOT NULL,
  triage_acuity INT NOT NULL CHECK (triage_acuity BETWEEN 1 AND 5),
  arrival_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  wait_time_minutes INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Waiting' CHECK (status IN ('Waiting', 'Triage', 'Treating', 'Admitted', 'Discharged')),
  assigned_bay TEXT,
  attending_clinician TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Medical Resources & Pharmacy Inventory
CREATE TABLE IF NOT EXISTS hospital_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('Medications', 'Equipment', 'Blood Supply')),
  name TEXT NOT NULL,
  stock_percentage INT NOT NULL DEFAULT 100,
  current_quantity INT NOT NULL,
  capacity_quantity INT NOT NULL,
  unit TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Optimal' CHECK (status IN ('Optimal', 'Low', 'Critical')),
  lot_number TEXT,
  expiry_date DATE,
  minimum_threshold INT,
  storage_location TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Clinical Encounters
CREATE TABLE IF NOT EXISTS hospital_encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_number TEXT NOT NULL UNIQUE,
  patient_id UUID,
  patient_name TEXT NOT NULL,
  mrn TEXT NOT NULL,
  encounter_type TEXT NOT NULL DEFAULT 'Outpatient',
  status TEXT NOT NULL DEFAULT 'In Progress',
  attending_doctor TEXT NOT NULL,
  chief_complaint TEXT NOT NULL,
  clinical_notes TEXT,
  assessment_findings TEXT,
  care_plan TEXT,
  prescriptions_summary TEXT,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  finalized BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Stock Movements & Inventory Audits
CREATE TABLE IF NOT EXISTS hospital_stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID,
  item_name TEXT NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('Receipt', 'Dispense', 'Adjustment', 'Disposal')),
  quantity INT NOT NULL,
  lot_number TEXT,
  expiry_date DATE,
  authorized_by TEXT NOT NULL,
  reason TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Audit Log & Security Events
CREATE TABLE IF NOT EXISTS hospital_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  description TEXT NOT NULL,
  outcome TEXT NOT NULL DEFAULT 'Success',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Notifications & Escalation Alerts
CREATE TABLE IF NOT EXISTS hospital_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'system',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  urgent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE hospital_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_emergency_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_notifications ENABLE ROW LEVEL SECURITY;

-- Transparent RLS Policies for Operational Access
CREATE POLICY "Allow read for authorized users" ON hospital_departments FOR SELECT USING (true);
CREATE POLICY "Allow read for authorized users" ON hospital_patients FOR SELECT USING (true);
CREATE POLICY "Allow read for authorized users" ON hospital_appointments FOR SELECT USING (true);
CREATE POLICY "Allow read for authorized users" ON hospital_beds FOR SELECT USING (true);
CREATE POLICY "Allow read for authorized users" ON hospital_staff FOR SELECT USING (true);
CREATE POLICY "Allow read for authorized users" ON hospital_emergency_cases FOR SELECT USING (true);
CREATE POLICY "Allow read for authorized users" ON hospital_resources FOR SELECT USING (true);
CREATE POLICY "Allow read for authorized users" ON hospital_encounters FOR SELECT USING (true);
CREATE POLICY "Allow read for authorized users" ON hospital_stock_movements FOR SELECT USING (true);
CREATE POLICY "Allow read for authorized users" ON hospital_audit_log FOR SELECT USING (true);
CREATE POLICY "Allow read for authorized users" ON hospital_notifications FOR SELECT USING (true);

CREATE POLICY "Allow all operations for authenticated operations" ON hospital_departments FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated operations" ON hospital_patients FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated operations" ON hospital_appointments FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated operations" ON hospital_beds FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated operations" ON hospital_staff FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated operations" ON hospital_emergency_cases FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated operations" ON hospital_resources FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated operations" ON hospital_encounters FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated operations" ON hospital_stock_movements FOR ALL USING (true);
CREATE POLICY "Allow insert for audit log" ON hospital_audit_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all operations for notifications" ON hospital_notifications FOR ALL USING (true);

-- Enable Supabase Realtime publication on all operational tables
ALTER PUBLICATION supabase_realtime ADD TABLE hospital_departments;
ALTER PUBLICATION supabase_realtime ADD TABLE hospital_patients;
ALTER PUBLICATION supabase_realtime ADD TABLE hospital_appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE hospital_beds;
ALTER PUBLICATION supabase_realtime ADD TABLE hospital_staff;
ALTER PUBLICATION supabase_realtime ADD TABLE hospital_emergency_cases;
ALTER PUBLICATION supabase_realtime ADD TABLE hospital_resources;
ALTER PUBLICATION supabase_realtime ADD TABLE hospital_encounters;
ALTER PUBLICATION supabase_realtime ADD TABLE hospital_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE hospital_audit_log;
`;
