import React, { useState } from 'react';
import {
  X,
  LogIn,
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  AlertCircle,
  Stethoscope,
  HeartPulse,
  User,
  Pill,
  Ambulance,
  Lock,
} from 'lucide-react';
import { StaffMember, UserRole } from '../../types/hospital';
import { hospitalDataService } from '../../services/hospitalDataService';

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  onLoginSuccess: (userRole: UserRole) => void;
}

const ROLE_ICONS: Record<UserRole, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  Administrator: { icon: ShieldCheck, color: '#23D5F4' },
  Doctor: { icon: Stethoscope, color: '#18E1C1' },
  Nurse: { icon: HeartPulse, color: '#27B9FF' },
  Receptionist: { icon: User, color: '#36D6A4' },
  Pharmacist: { icon: Pill, color: '#A78BFA' },
  'Triage Officer': { icon: Ambulance, color: '#FF873D' },
};

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({
  isOpen,
  onClose,
  staffList,
  onLoginSuccess,
}) => {
  const [emailOrId, setEmailOrId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!emailOrId.trim()) {
      setErrorMsg('Please enter your Staff Work Email or ID.');
      return;
    }
    if (!accessCode.trim()) {
      setErrorMsg('Please enter your Access Code or Security PIN.');
      return;
    }

    const result = hospitalDataService.authenticateStaff(emailOrId, accessCode);
    if (!result.success) {
      setErrorMsg(result.message);
      return;
    }

    setSuccessMsg(result.message);
    setTimeout(() => {
      onLoginSuccess(result.user!.role);
      onClose();
    }, 900);
  };

  const handleQuickLogin = (staff: StaffMember) => {
    setEmailOrId(staff.email);
    setAccessCode(staff.access_code);
    setErrorMsg(null);

    const result = hospitalDataService.authenticateStaff(staff.email, staff.access_code);
    if (result.success) {
      setSuccessMsg(result.message);
      setTimeout(() => {
        onLoginSuccess(staff.role);
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl flex flex-col bg-[#071D30] border-2 border-[#23D5F4] rounded-3xl shadow-[0_0_50px_rgba(35,213,244,0.35)] overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-[#145B89] flex items-center justify-between bg-gradient-to-r from-[#051625] via-[#071D30] to-[#0A2640]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#23D5F4]/20 border border-[#23D5F4] flex items-center justify-center text-[#23D5F4] shadow-[0_0_15px_rgba(35,213,244,0.4)]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Staff Workstation Sign-In
              </h2>
              <p className="text-xs text-[#718BA5] font-medium">
                Enter your issued staff credentials to unlock your operational dashboard.
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

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[82vh] overflow-y-auto custom-scrollbar">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FF873D]/15 border border-[#FF873D] text-[#FF873D] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-[#18E1C1]/15 border border-[#18E1C1] text-[#18E1C1] text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#A7BED3] mb-1">
                Staff Work Email / ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718BA5]" />
                <input
                  type="text"
                  placeholder="e.g. d.mercer@hospitalops.org"
                  value={emailOrId}
                  onChange={(e) => setEmailOrId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-white placeholder-[#4D6982] outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7BED3] mb-1">
                Access Code / Security PIN
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718BA5]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your security access code..."
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-white placeholder-[#4D6982] outline-none font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#718BA5] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#087FC7] via-[#27B9FF] to-[#23D5F4] text-white font-bold text-xs shadow-[0_0_20px_rgba(39,185,255,0.4)] hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Authenticate & Access Dashboard</span>
            </button>
          </form>

          {/* Quick Staff Roster / Test Access */}
          <div className="pt-3 border-t border-[#145B89]/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#A7BED3] uppercase tracking-wider">
                Or Select Registered Staff (1-Click Evaluation):
              </span>
              <span className="text-[10px] text-[#718BA5]">
                {staffList.length} Accounts Registered
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto custom-scrollbar p-0.5">
              {staffList.map((staff) => {
                const conf = ROLE_ICONS[staff.role] || ROLE_ICONS.Doctor;
                const Icon = conf.icon;

                return (
                  <button
                    type="button"
                    key={staff.id}
                    onClick={() => handleQuickLogin(staff)}
                    className="p-2 rounded-xl bg-[#051625] hover:bg-[#0E3554] border border-[#145B89]/60 hover:border-[#23D5F4] text-left transition-all cursor-pointer flex items-center gap-2.5 group"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${conf.color}15`,
                        borderColor: `${conf.color}50`,
                        color: conf.color,
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-[#23D5F4] truncate">
                        {staff.full_name}
                      </div>
                      <div className="text-[10px] text-[#718BA5] truncate flex items-center justify-between">
                        <span>{staff.role}</span>
                        <span className="font-mono text-[#27B9FF] text-[9px] bg-[#071D30] px-1 py-0.2 rounded border border-[#145B89]">
                          {staff.access_code}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-5 py-3 border-t border-[#145B89]/70 bg-[#051625] flex items-center justify-between text-xs text-[#718BA5]">
          <span className="text-[11px]">Secure Cryptographic Session Handshake</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#071D30] border border-[#145B89] text-white hover:border-[#27B9FF] text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
