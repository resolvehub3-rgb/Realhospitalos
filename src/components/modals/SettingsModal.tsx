import React, { useState } from 'react';
import { X, Database, Key, Check, Copy, RefreshCw, Server, ShieldCheck } from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  SUPABASE_SCHEMA_SQL,
} from '../../services/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'connection' | 'schema'>('connection');

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url, anonKey);
    setIsTesting(true);
    const result = await testSupabaseConnection();
    setTestResult(result);
    setIsTesting(false);
    if (result.success) {
      onRefreshData();
    }
  };

  const handleTestNow = async () => {
    saveSupabaseConfig(url, anonKey);
    setIsTesting(true);
    const result = await testSupabaseConnection();
    setTestResult(result);
    setIsTesting(false);
  };

  const handleClear = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#071D30] border border-[#27B9FF]/70 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#145B89]">
          <div>
            <h2 className="text-lg font-bold text-[#F1F7FF] flex items-center gap-2">
              <Database className="w-5 h-5 text-[#23D5F4]" />
              <span>Hospital Operations & Supabase Settings</span>
            </h2>
            <p className="text-xs text-[#718BA5] mt-0.5">
              PostgreSQL Persistence, Row Level Security, and Realtime Subscriptions
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#718BA5] hover:text-white hover:bg-[#051625]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-2 pt-4 pb-2">
          <button
            onClick={() => setActiveTab('connection')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'connection'
                ? 'bg-[#087FC7] text-white border border-[#27B9FF]'
                : 'bg-[#051625] text-[#718BA5] hover:text-white'
            }`}
          >
            Supabase Connection
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'schema'
                ? 'bg-[#087FC7] text-white border border-[#27B9FF]'
                : 'bg-[#051625] text-[#718BA5] hover:text-white'
            }`}
          >
            Database Schema & SQL Migrations
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-2">
          {activeTab === 'connection' ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#051625] border border-[#145B89]/60 text-xs text-[#A7BED3] leading-relaxed">
                Connect your real Supabase project by providing your project URL and public Anon Key.
                Every patient record, appointment, ward bed, emergency case, and resource will query and synchronize in real-time.
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7BED3] mb-1 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-[#23D5F4]" />
                  <span>VITE_SUPABASE_URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://your-project.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs font-mono text-[#F1F7FF] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7BED3] mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#23D5F4]" />
                  <span>VITE_SUPABASE_ANON_KEY</span>
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs font-mono text-[#F1F7FF] outline-none"
                />
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
                    testResult.success
                      ? 'bg-[#0E4237]/60 border-[#36D6A4] text-[#36D6A4]'
                      : 'bg-[#3A1414]/60 border-[#FF634D] text-[#FF634D]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 rounded-xl text-xs text-[#718BA5] hover:text-[#FF634D] transition-colors"
                >
                  Clear Config
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestNow}
                    disabled={isTesting}
                    className="px-4 py-2 rounded-xl border border-[#145B89] text-xs font-medium text-[#A7BED3] hover:text-white hover:bg-[#051625] flex items-center gap-1.5 cursor-pointer"
                  >
                    {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Test Connection</span>
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#087FC7] hover:bg-[#27B9FF] text-white text-xs font-semibold shadow-[0_0_15px_rgba(39,185,255,0.4)] transition-all cursor-pointer"
                  >
                    Save & Sync Database
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A7BED3]">
                  Execute this SQL in your Supabase SQL Editor to initialize all 8 hospital tables:
                </span>
                <button
                  onClick={copySqlToClipboard}
                  className="px-3 py-1.5 rounded-xl bg-[#051625] border border-[#23D5F4]/60 text-xs text-[#23D5F4] hover:bg-[#087FC7]/20 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-[#36D6A4]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-[#051625] border border-[#145B89] text-[11px] font-mono text-[#A7BED3] overflow-x-auto max-h-[340px] leading-relaxed">
                {SUPABASE_SCHEMA_SQL}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
