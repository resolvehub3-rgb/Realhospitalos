import React, { useState } from 'react';
import {
  X,
  UserPlus,
  ShieldCheck,
  Search,
  KeyRound,
  Copy,
  Check,
  Eye,
  EyeOff,
  UserCheck,
  AlertCircle,
  Trash2,
  Sparkles,
  Stethoscope,
  HeartPulse,
  User,
  Pill,
  Ambulance,
  Phone,
  Mail,
  Building2,
  Clock,
  LogIn,
} from 'lucide-react';
import { StaffMember, UserRole } from '../../types/hospital';
import { hospitalDataService } from '../../services/hospitalDataService';

interface StaffManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  onStaffUpdated: () => void;
  onLoginAsStaff?: (staffId: string) => void;
}

const ROLES: {
  role: UserRole;
  desc: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}[] = [
  { role: 'Administrator', desc: 'Full executive control, staff credentials, audits, DB config', icon: ShieldCheck, color: '#23D5F4' },
  { role: 'Doctor', desc: 'Clinical encounters, patient consultations, orders, vitals', icon: Stethoscope, color: '#18E1C1' },
  { role: 'Nurse', desc: 'Ward bed care, vitals monitoring, medication rounds, turnover', icon: HeartPulse, color: '#27B9FF' },
  { role: 'Receptionist', desc: 'Patient admissions, appointment check-ins, MRN issuance', icon: User, color: '#36D6A4' },
  { role: 'Pharmacist', desc: 'Prescription dispensing, medication stock, cold-chain cryo', icon: Pill, color: '#A78BFA' },
  { role: 'Triage Officer', desc: 'Emergency department, ESI acuity 1-5, ambulance bays', icon: Ambulance, color: '#FF873D' },
];

const DEPARTMENTS = [
  'Hospital Administration',
  'Cardiology',
  'Emergency',
  'Intensive Care Unit',
  'General Medicine',
  'Pediatrics',
  'Orthopedics',
  'Radiology',
  'Central Pharmacy',
  'Patient Admissions',
];

export const StaffManagementModal: React.FC<StaffManagementModalProps> = ({
  isOpen,
  onClose,
  staffList,
  onStaffUpdated,
  onLoginAsStaff,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'add'>('roster');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Add Staff Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Doctor');
  const [department, setDepartment] = useState('Cardiology');
  const [specialty, setSpecialty] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [shift, setShift] = useState<'Morning' | 'Evening' | 'Night' | 'On-Call'>('Morning');
  const [phone, setPhone] = useState('');
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const generateRandomAccessCode = (selectedRole: UserRole) => {
    const prefixes: Record<UserRole, string> = {
      Administrator: 'ADMIN',
      Doctor: 'DOC',
      Nurse: 'NURSE',
      Receptionist: 'REC',
      Pharmacist: 'PHARM',
      'Triage Officer': 'TRIAGE',
    };
    const prefix = prefixes[selectedRole] || 'MED';
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${num}`;
  };

  const handleGenerateCode = () => {
    const code = generateRandomAccessCode(role);
    setAccessCode(code);
  };

  const handleCopyCredentials = (staff: StaffMember) => {
    const text = `Hospital Operations Credentials:\nName: ${staff.full_name}\nRole: ${staff.role}\nDepartment: ${staff.department}\nLogin Email/ID: ${staff.email}\nAccess Code: ${staff.access_code}\nPortal: Hospital Operations Command Center`;
    navigator.clipboard.writeText(text);
    setCopiedId(staff.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const togglePasswordReveal = (id: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleDuty = async (staff: StaffMember) => {
    await hospitalDataService.updateStaffMember(staff.id, {
      is_on_duty: !staff.is_on_duty,
    });
    onStaffUpdated();
  };

  const handleDeleteStaff = async (staff: StaffMember) => {
    if (confirm(`Revoke credentials and deactivate ${staff.full_name} (${staff.role})?`)) {
      await hospitalDataService.deleteStaffMember(staff.id);
      onStaffUpdated();
    }
  };

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!fullName.trim()) {
      setFormError('Please enter full staff name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid work email address.');
      return;
    }
    if (!accessCode.trim() || accessCode.trim().length < 4) {
      setFormError('Access Code / Password must be at least 4 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await hospitalDataService.addStaffMember({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        role,
        department,
        specialty: specialty.trim() || undefined,
        access_code: accessCode.trim(),
        shift,
        phone: phone.trim() || undefined,
        is_on_duty: isOnDuty,
      });

      if (!res.success) {
        setFormError(res.error || 'Failed to register staff.');
        setIsSubmitting(false);
        return;
      }

      setFormSuccess(`Staff member ${fullName} registered with credentials! Access Code: ${accessCode}`);
      onStaffUpdated();

      // Reset form
      setFullName('');
      setEmail('');
      setSpecialty('');
      setAccessCode('');
      setPhone('');

      setTimeout(() => {
        setActiveTab('roster');
        setFormSuccess(null);
      }, 1800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFormError(`Registration error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.specialty && s.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const onDutyCount = staffList.filter((s) => s.is_on_duty).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#071D30] border-2 border-[#27B9FF] rounded-3xl shadow-[0_0_50px_rgba(39,185,255,0.3)] overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-[#145B89] flex items-center justify-between bg-gradient-to-r from-[#051625] via-[#071D30] to-[#0A2640]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#087FC7]/20 border border-[#27B9FF] flex items-center justify-center text-[#23D5F4] shadow-[0_0_15px_rgba(35,213,244,0.3)]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Staff Identity & Access Credentials
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#23D5F4]/15 border border-[#23D5F4]/60 text-[#23D5F4]">
                  Administrator Privilege
                </span>
              </div>
              <p className="text-xs text-[#718BA5] font-medium">
                Provision staff members, issue secure access credentials, and manage role-based dashboard access.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#051625] border border-[#145B89] hover:border-[#27B9FF] text-[#718BA5] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-5 pt-3 pb-2 border-b border-[#145B89]/60 bg-[#051625]/60 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'roster'
                  ? 'bg-[#087FC7] text-white border border-[#38DDF7] shadow-[0_0_15px_rgba(39,185,255,0.4)]'
                  : 'bg-[#071D30] text-[#718BA5] hover:text-white border border-[#145B89]'
              }`}
            >
              <UserCheck className="w-4 h-4 text-[#23D5F4]" />
              <span>Staff Roster & Credentials ({staffList.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('add');
                if (!accessCode) setAccessCode(generateRandomAccessCode(role));
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-[#18E1C1] text-[#03101E] font-bold border border-[#38DDF7] shadow-[0_0_15px_rgba(24,225,193,0.5)]'
                  : 'bg-[#071D30] text-[#718BA5] hover:text-[#18E1C1] border border-[#145B89]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add New Staff & Credentials</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#718BA5]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#18E1C1] shadow-[0_0_6px_#18E1C1]" />
              <strong className="text-white">{onDutyCount}</strong> Active on Duty
            </span>
            <span className="text-[#145B89]">|</span>
            <span>
              <strong className="text-white">{staffList.length - onDutyCount}</strong> Off Duty
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          
          {/* TAB 1: STAFF ROSTER & CREDENTIALS */}
          {activeTab === 'roster' && (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718BA5]" />
                  <input
                    type="text"
                    placeholder="Search staff by name, email, specialty, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-white placeholder-[#4D6982] outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {['all', 'Administrator', 'Doctor', 'Nurse', 'Receptionist', 'Pharmacist', 'Triage Officer'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        roleFilter === r
                          ? 'bg-[#0E3554] text-[#23D5F4] border border-[#23D5F4]/60 font-semibold'
                          : 'bg-[#051625] text-[#718BA5] hover:text-white border border-[#145B89]/50'
                      }`}
                    >
                      {r === 'all' ? 'All Roles' : r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Staff Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredStaff.map((staff) => {
                  const roleConfig = ROLES.find((r) => r.role === staff.role) || ROLES[1];
                  const Icon = roleConfig.icon;
                  const isRevealed = Boolean(revealedPasswords[staff.id]);

                  return (
                    <div
                      key={staff.id}
                      className="bg-[#051625]/90 border border-[#145B89]/80 hover:border-[#27B9FF]/60 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-md transition-all group"
                    >
                      {/* Top Row: Name, Role, Duty status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5"
                            style={{
                              backgroundColor: `${roleConfig.color}15`,
                              borderColor: `${roleConfig.color}60`,
                              color: roleConfig.color,
                            }}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                              <span>{staff.full_name}</span>
                            </h4>
                            <div className="text-[11px] text-[#718BA5] truncate">
                              {staff.specialty || staff.department}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                                style={{
                                  backgroundColor: `${roleConfig.color}20`,
                                  color: roleConfig.color,
                                }}
                              >
                                {staff.role}
                              </span>
                              <span className="text-[10px] text-[#A7BED3] flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#23D5F4]" />
                                {staff.shift} Shift
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Duty Toggle Pill */}
                        <button
                          onClick={() => handleToggleDuty(staff)}
                          title={`Click to switch duty status (Currently ${staff.is_on_duty ? 'On Duty' : 'Off Duty'})`}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 cursor-pointer transition-colors ${
                            staff.is_on_duty
                              ? 'bg-[#18E1C1]/15 text-[#18E1C1] border-[#18E1C1]/50'
                              : 'bg-[#FF873D]/15 text-[#FF873D] border-[#FF873D]/50'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              staff.is_on_duty ? 'bg-[#18E1C1]' : 'bg-[#FF873D]'
                            }`}
                          />
                          {staff.is_on_duty ? 'On Duty' : 'Off Duty'}
                        </button>
                      </div>

                      {/* Credentials Display Box */}
                      <div className="bg-[#03101E] border border-[#145B89]/70 rounded-xl p-2.5 flex flex-col gap-1.5 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#718BA5] flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[#23D5F4]" /> Login ID / Email:
                          </span>
                          <span className="font-mono text-white font-medium truncate max-w-[190px]">
                            {staff.email}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#718BA5] flex items-center gap-1">
                            <KeyRound className="w-3 h-3 text-[#FF873D]" /> Access Code / PIN:
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold tracking-wider text-[#38DDF7] bg-[#071D30] px-2 py-0.5 rounded border border-[#145B89]">
                              {isRevealed ? staff.access_code : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordReveal(staff.id)}
                              className="text-[#718BA5] hover:text-white transition-colors"
                              title={isRevealed ? 'Hide access code' : 'Reveal access code'}
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {staff.last_login_at && (
                          <div className="text-[10px] text-[#4D6982] flex items-center justify-between pt-0.5 border-t border-[#145B89]/40">
                            <span>Last Dashboard Access:</span>
                            <span className="text-[#718BA5]">{staff.last_login_at}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons Row */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1.5">
                          {/* Copy Credentials Button */}
                          <button
                            onClick={() => handleCopyCredentials(staff)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#071D30] hover:bg-[#0A2640] border border-[#145B89] hover:border-[#23D5F4] text-[#A7BED3] hover:text-white text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="Copy Login Credentials to Clipboard"
                          >
                            {copiedId === staff.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#18E1C1]" />
                                <span className="text-[#18E1C1] font-semibold text-[11px]">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-[#23D5F4]" />
                                <span className="text-[11px]">Copy Credentials</span>
                              </>
                            )}
                          </button>

                          {/* Quick Test Login */}
                          {onLoginAsStaff && (
                            <button
                              onClick={() => onLoginAsStaff(staff.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#087FC7]/20 hover:bg-[#087FC7]/40 border border-[#27B9FF]/50 hover:border-[#27B9FF] text-[#23D5F4] hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Instantly switch session to this staff member's dashboard"
                            >
                              <LogIn className="w-3.5 h-3.5" />
                              <span>Login as {staff.role.split(' ')[0]}</span>
                            </button>
                          )}
                        </div>

                        {/* Delete Button (can't delete Arthur Sterling root admin) */}
                        {staff.id !== 'st-admin-1' && (
                          <button
                            onClick={() => handleDeleteStaff(staff)}
                            title="Revoke staff member credentials"
                            className="p-1.5 rounded-lg text-[#718BA5] hover:text-[#FF873D] hover:bg-[#FF873D]/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredStaff.length === 0 && (
                  <div className="col-span-full py-12 text-center text-[#718BA5]">
                    <UserCheck className="w-10 h-10 mx-auto text-[#145B89] mb-2" />
                    <p className="text-sm font-semibold text-white">No staff members found matching criteria.</p>
                    <p className="text-xs text-[#718BA5] mt-1">Try adjusting your search query or role filter.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ADD NEW STAFF & ISSUE CREDENTIALS FORM */}
          {activeTab === 'add' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="bg-[#051625]/80 border border-[#145B89] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[#23D5F4]" />
                  <h3 className="text-sm font-bold text-white">Provision New Staff Account</h3>
                </div>
                <p className="text-xs text-[#718BA5]">
                  Issue verified hospital identity credentials. The new staff member will immediately be able to log in and access their role-specific dashboard.
                </p>
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-[#FF873D]/15 border border-[#FF873D] text-[#FF873D] text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3.5 rounded-xl bg-[#18E1C1]/15 border border-[#18E1C1] text-[#18E1C1] text-xs flex items-center gap-2.5">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAddStaffSubmit} className="space-y-4">
                {/* Role Selector Grid */}
                <div>
                  <label className="block text-xs font-bold text-[#A7BED3] uppercase tracking-wider mb-2">
                    1. Select Operational Role & Dashboard Access *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {ROLES.map((item) => {
                      const Icon = item.icon;
                      const isSelected = role === item.role;

                      return (
                        <button
                          type="button"
                          key={item.role}
                          onClick={() => {
                            setRole(item.role);
                            setAccessCode(generateRandomAccessCode(item.role));
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                            isSelected
                              ? 'bg-[#087FC7]/25 border-[#23D5F4] shadow-[0_0_15px_rgba(35,213,244,0.3)]'
                              : 'bg-[#051625] border-[#145B89]/70 hover:border-[#145B89] text-[#718BA5]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Icon className="w-4 h-4" style={{ color: item.color }} />
                            {isSelected && <span className="w-2 h-2 rounded-full bg-[#23D5F4]" />}
                          </div>
                          <div>
                            <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#A7BED3]'}`}>
                              {item.role}
                            </div>
                            <div className="text-[10px] text-[#718BA5] line-clamp-2 leading-tight mt-0.5">
                              {item.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#A7BED3] mb-1">
                      Full Staff Name (with Title) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Robert Chen, RN Marcus Cole"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (!email && e.target.value) {
                          const simple = e.target.value
                            .toLowerCase()
                            .replace(/dr\.\s*|rn\s*|nurse\s*/gi, '')
                            .trim()
                            .replace(/\s+/g, '.');
                          setEmail(`${simple}@hospitalops.org`);
                        }
                      }}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-white placeholder-[#4D6982] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A7BED3] mb-1">
                      Login Email / Work ID *
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. r.chen@hospitalops.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-white placeholder-[#4D6982] outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Department & Specialty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#A7BED3] mb-1">
                      Department Assignment *
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-white outline-none"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A7BED3] mb-1">
                      Specialty / Position Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Trauma Specialist, Head Nurse, Triage Lead"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-white placeholder-[#4D6982] outline-none"
                    />
                  </div>
                </div>

                {/* Access Code / Password with Generator */}
                <div className="bg-[#03101E] border border-[#145B89] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#FF873D]" />
                      Staff Access Code / Security PIN *
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="text-xs font-bold text-[#23D5F4] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Auto-Generate Code
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. DOC-4412 or custom password"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      required
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#051625] border border-[#27B9FF]/50 focus:border-[#23D5F4] text-xs font-mono font-bold tracking-wider text-[#38DDF7] placeholder-[#4D6982] outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-[#718BA5] mt-1.5">
                    This credential will be used by {fullName || 'the staff member'} to authenticate and unlock their {role} Dashboard.
                  </p>
                </div>

                {/* Shift, Phone & Duty Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#A7BED3] mb-1">
                      Assigned Shift
                    </label>
                    <select
                      value={shift}
                      onChange={(e) => setShift(e.target.value as StaffMember['shift'])}
                      className="w-full px-3 py-2 rounded-xl bg-[#051625] border border-[#145B89] text-xs text-white outline-none"
                    >
                      <option value="Morning">Morning (07:00 - 15:30)</option>
                      <option value="Evening">Evening (15:00 - 23:30)</option>
                      <option value="Night">Night (23:00 - 07:30)</option>
                      <option value="On-Call">On-Call Contingency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A7BED3] mb-1">
                      Direct Contact Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 555-0199"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#051625] border border-[#145B89] text-xs text-white placeholder-[#4D6982] outline-none font-mono"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isOnDuty}
                        onChange={(e) => setIsOnDuty(e.target.checked)}
                        className="w-4 h-4 rounded border-[#145B89] text-[#23D5F4] focus:ring-0 accent-[#23D5F4]"
                      />
                      <span className="text-xs text-white font-medium">Activate On Duty immediately</span>
                    </label>
                  </div>
                </div>

                {/* Submit Action Buttons */}
                <div className="pt-3 border-t border-[#145B89] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('roster')}
                    className="px-4 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] text-xs font-semibold text-[#718BA5] hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#087FC7] via-[#27B9FF] to-[#23D5F4] text-white font-bold text-xs shadow-[0_0_20px_rgba(39,185,255,0.4)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isSubmitting ? 'Registering...' : 'Issue Credentials & Add Staff'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-5 py-3 border-t border-[#145B89]/70 bg-[#051625] flex items-center justify-between text-xs text-[#718BA5]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#18E1C1]" />
            <span>All staff credential issuances and dashboard authentications are logged in the cryptographic audit trail.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#071D30] border border-[#145B89] text-white hover:border-[#27B9FF] text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
