import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  LogIn,
  UserPlus,
  Database,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Server,
  Lock,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Building,
} from 'lucide-react';
import { hospitalDataService } from '../../services/hospitalDataService';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  isSupabaseConfigured,
  SUPABASE_SCHEMA_SQL,
} from '../../services/supabase';
import { CurrentUser } from '../../types/hospital';

interface AuthGatewayProps {
  onLoginSuccess: (user: CurrentUser) => void;
  onOpenSettings: () => void;
}

export const AuthGateway: React.FC<AuthGatewayProps> = ({
  onLoginSuccess,
  onOpenSettings,
}) => {
  const [mode, setMode] = useState<'login' | 'setup' | 'config'>('setup');
  const [isConfigured, setIsConfigured] = useState<boolean>(isSupabaseConfigured());

  // Setup Form State
  const [setupFullName, setSetupFullName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupDepartment, setSetupDepartment] = useState('Hospital Administration');
  const [setupSpecialty, setSetupSpecialty] = useState('Chief Medical Officer & Hospital Administrator');
  const [setupPhone, setSetupPhone] = useState('');
  const [showSetupPassword, setShowSetupPassword] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Direct Supabase Config in Gateway
  const config = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(config.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(config.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Feedback State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
  }, []);

  const handleAdminSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isSupabaseConfigured()) {
      setErrorMessage(
        'Supabase backend is not connected yet. Please click "Connect Backend" above to enter your Supabase URL & Anon Key.'
      );
      setMode('config');
      return;
    }

    if (!setupFullName.trim()) {
      setErrorMessage('Please enter the Administrator Full Name.');
      return;
    }
    if (!setupEmail.trim()) {
      setErrorMessage('Please enter a valid Administrator work email.');
      return;
    }
    if (setupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const result = await hospitalDataService.setupAdminAccount({
      full_name: setupFullName.trim(),
      email: setupEmail.trim(),
      password: setupPassword.trim(),
      department: setupDepartment.trim(),
      specialty: setupSpecialty.trim(),
      phone: setupPhone.trim() || undefined,
    });
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to initialize administrator account.');
      return;
    }

    setSuccessMessage('Administrator account created and authenticated successfully! Launching Command Center...');
    setTimeout(() => {
      if (result.user) onLoginSuccess(result.user);
    }, 700);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isSupabaseConfigured()) {
      setErrorMessage('Supabase backend is not connected yet. Configure your Supabase project in the Backend Connection tab.');
      setMode('config');
      return;
    }

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Please enter both your work email and security access code.');
      return;
    }

    setIsSubmitting(true);
    const result = await hospitalDataService.login(loginEmail.trim(), loginPassword.trim());
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Authentication rejected. Verify your credentials.');
      return;
    }

    setSuccessMessage(`Welcome back, ${result.user?.name}! Opening ${result.user?.role} Command Center...`);
    setTimeout(() => {
      if (result.user) onLoginSuccess(result.user);
    }, 600);
  };

  const handleSaveBackendConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
    setIsTesting(true);
    const res = await testSupabaseConnection();
    setTestResult(res);
    setIsTesting(false);
    setIsConfigured(isSupabaseConfigured());
    if (res.success) {
      hospitalDataService.initAuthAndRealtime();
      setSuccessMessage('Supabase backend connected successfully! You can now set up your administrator account.');
      setTimeout(() => {
        setMode('setup');
      }, 1000);
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#03101E] text-[#F1F7FF] flex items-center justify-center p-3 sm:p-5 lg:p-8 select-none">
      {/* Outer Futuristic Display Console Frame */}
      <div className="relative w-full max-w-2xl bg-[#071B2D]/95 border-2 border-[#087FC7] rounded-[36px] sm:rounded-[40px] p-5 sm:p-8 shadow-[0_0_60px_rgba(0,174,255,0.25),_inset_0_0_30px_rgba(8,127,199,0.18)] flex flex-col gap-5 backdrop-blur-xl">
        
        {/* Subtle luminous highlights */}
        <div className="absolute top-0 left-16 w-48 h-1 bg-gradient-to-r from-transparent via-[#27B9FF] to-transparent opacity-80 pointer-events-none" />
        <div className="absolute bottom-0 right-16 w-48 h-1 bg-gradient-to-r from-transparent via-[#23D5F4] to-transparent opacity-70 pointer-events-none" />

        {/* Portal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#145B89]/70">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#18E1C1] shadow-[0_0_8px_#18E1C1]" />
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#23D5F4] uppercase">
                Secure Authentication Gateway
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F1F7FF] tracking-tight">
              Hospital Operations
            </h1>
            <p className="text-xs sm:text-sm text-[#718BA5] font-medium mt-0.5">
              Care Today <span className="text-[#23D5F4]/70">·</span> Healthier Tomorrow
            </p>
          </div>

          {/* Backend Status Chip */}
          <button
            type="button"
            onClick={() => setMode('config')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto ${
              isConfigured
                ? 'bg-[#0E3554]/60 border-[#18E1C1]/60 text-[#18E1C1] shadow-[0_0_12px_rgba(24,225,193,0.2)]'
                : 'bg-[#3A1E14]/60 border-[#FF873D]/60 text-[#FF873D] shadow-[0_0_12px_rgba(255,135,61,0.2)]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isConfigured ? 'Supabase Connected' : 'Connect Backend'}</span>
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-[#051625] p-1.5 rounded-2xl border border-[#145B89]/70">
          <button
            type="button"
            onClick={() => {
              setMode('setup');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'setup'
                ? 'bg-[#087FC7] text-white border border-[#27B9FF] shadow-[0_0_15px_rgba(39,185,255,0.4)]'
                : 'text-[#718BA5] hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="truncate">Admin Setup</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-[#087FC7] text-white border border-[#27B9FF] shadow-[0_0_15px_rgba(39,185,255,0.4)]'
                : 'text-[#718BA5] hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="truncate">Staff Sign-In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('config');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'config'
                ? 'bg-[#087FC7] text-white border border-[#27B9FF] shadow-[0_0_15px_rgba(39,185,255,0.4)]'
                : 'text-[#718BA5] hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="truncate">Database Config</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-[#3A1414]/90 border border-[#FF634D] text-[#FF873D] text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-[#0E4237]/90 border border-[#18E1C1] text-[#18E1C1] text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: ADMIN ACCOUNT SETUP */}
        {mode === 'setup' && (
          <form onSubmit={handleAdminSetup} className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-[#051625]/90 border border-[#145B89]/70 text-xs text-[#A7BED3] leading-relaxed flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#23D5F4] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold mb-0.5">
                  Initial Hospital Administrator Setup
                </strong>
                Provision your root hospital administrative profile in the connected Supabase backend.
                Once created, your administrator account will have full authority to issue staff credentials, admit patients, manage wards, and audit security events.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#A7BED3] mb-1">
                  Administrator Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur Sterling"
                  value={setupFullName}
                  onChange={(e) => setSetupFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-white placeholder-[#4D6982] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7BED3] mb-1">
                  Administrator Work Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@hospitalops.org"
                  value={setupEmail}
                  onChange={(e) => setSetupEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-white placeholder-[#4D6982] outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#A7BED3] mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={setupDepartment}
                  onChange={(e) => setSetupDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7BED3] mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+1 555-0100"
                  value={setupPhone}
                  onChange={(e) => setSetupPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-white placeholder-[#4D6982] outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7BED3] mb-1">
                Security Password / Access Code (Min 6 Characters) *
              </label>
              <div className="relative">
                <input
                  type={showSetupPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Create a strong administrator password..."
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-white placeholder-[#4D6982] outline-none font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowSetupPassword(!showSetupPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#718BA5] hover:text-white transition-colors"
                >
                  {showSetupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#087FC7] via-[#27B9FF] to-[#18E1C1] text-white font-bold text-xs shadow-[0_0_25px_rgba(39,185,255,0.45)] hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Registering into Supabase...' : 'Initialize Administrator Account & Open Command Center'}</span>
            </button>
          </form>
        )}

        {/* TAB 2: STAFF & ADMIN SIGN-IN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-[#051625]/90 border border-[#145B89]/70 text-xs text-[#A7BED3] leading-relaxed flex items-start gap-3">
              <Lock className="w-5 h-5 text-[#23D5F4] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold mb-0.5">
                  Staff & Administrator Workstation Login
                </strong>
                Enter your registered hospital email or staff identifier and your assigned password/access PIN to unlock your dashboard.
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7BED3] mb-1">
                Hospital Work Email / Staff ID
              </label>
              <input
                type="text"
                required
                placeholder="e.g. admin@hospitalops.org or staff email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-white placeholder-[#4D6982] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7BED3] mb-1">
                Password / Security Access Code
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your security access credentials..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-white placeholder-[#4D6982] outline-none font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#718BA5] hover:text-white transition-colors"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#087FC7] via-[#27B9FF] to-[#23D5F4] text-white font-bold text-xs shadow-[0_0_20px_rgba(39,185,255,0.4)] hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Authenticating with Supabase...' : 'Authenticate & Access Command Center'}</span>
            </button>
          </form>
        )}

        {/* TAB 3: BACKEND DATABASE CONNECTION */}
        {mode === 'config' && (
          <form onSubmit={handleSaveBackendConfig} className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-[#051625]/90 border border-[#145B89]/70 text-xs text-[#A7BED3] leading-relaxed flex items-start gap-3">
              <Server className="w-5 h-5 text-[#23D5F4] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold mb-0.5">
                  Direct Supabase PostgreSQL Configuration
                </strong>
                Provide your real Supabase Project URL and public Anon Key. All dynamic telemetry, ward admissions, clinical encounters, staff credentials, and real-time events will sync directly.
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7BED3] mb-1">
                VITE_SUPABASE_URL
              </label>
              <input
                type="url"
                required
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs font-mono text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7BED3] mb-1">
                VITE_SUPABASE_ANON_KEY
              </label>
              <input
                type="password"
                required
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs font-mono text-white outline-none"
              />
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
                  testResult.success
                    ? 'bg-[#0E4237]/70 border-[#36D6A4] text-[#36D6A4]'
                    : 'bg-[#3A1414]/70 border-[#FF634D] text-[#FF634D]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={copySql}
                className="px-3.5 py-2 rounded-xl bg-[#051625] border border-[#23D5F4]/60 text-xs text-[#23D5F4] hover:bg-[#087FC7]/20 flex items-center gap-1.5 font-semibold transition-colors cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-[#36D6A4]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'SQL Script Copied!' : 'Copy SQL Schema for Supabase'}</span>
              </button>

              <button
                type="submit"
                disabled={isTesting}
                className="px-5 py-2 rounded-xl bg-[#087FC7] hover:bg-[#27B9FF] text-white text-xs font-bold shadow-[0_0_15px_rgba(39,185,255,0.4)] transition-all cursor-pointer flex items-center gap-2"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Connect & Test Database</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-[#145B89]/50 flex items-center justify-between text-[11px] text-[#718BA5]">
          <span>Row Level Security (RLS) & Realtime Synchronization</span>
          <span className="font-mono">v2.4 Production Engine</span>
        </div>

      </div>
    </div>
  );
};
