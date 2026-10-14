import React, { useState } from 'react';
import {
  Ambulance,
  AlertTriangle,
  Clock,
  Activity,
  Plus,
  ShieldAlert,
  CheckCircle2,
  Users,
  Building2,
} from 'lucide-react';
import { CurrentUser, EmergencyCase, EmergencyWaitTrend } from '../../types/hospital';
import { hospitalDataService } from '../../services/hospitalDataService';

interface TriageDashboardProps {
  currentUser: CurrentUser;
  emergencyCases: EmergencyCase[];
  avgWaitMinutes: number;
  trend: EmergencyWaitTrend[];
  onOpenTriageModal: () => void;
  onRefresh: () => void;
}

const ACUITY_CONFIG = [
  { level: 1, name: 'ESI 1 - Resuscitation', color: '#FF3B30', desc: 'Immediate life-saving intervention' },
  { level: 2, name: 'ESI 2 - Emergent', color: '#FF9500', desc: 'High risk, confused, severe pain' },
  { level: 3, name: 'ESI 3 - Urgent', color: '#FFCC00', desc: 'Multiple resources needed, stable vitals' },
  { level: 4, name: 'ESI 4 - Less Urgent', color: '#34C759', desc: 'One resource needed' },
  { level: 5, name: 'ESI 5 - Non-Urgent', color: '#007AFF', desc: 'No resources needed' },
];

export const TriageDashboard: React.FC<TriageDashboardProps> = ({
  currentUser,
  emergencyCases,
  avgWaitMinutes,
  trend,
  onOpenTriageModal,
  onRefresh,
}) => {
  const [filterAcuity, setFilterAcuity] = useState<number | 'all'>('all');

  const handleUpdateStatus = (id: string, status: EmergencyCase['status']) => {
    hospitalDataService.updateEmergencyCaseStatus(id, status);
    onRefresh();
  };

  const filteredCases = filterAcuity === 'all'
    ? emergencyCases
    : emergencyCases.filter((c) => c.triage_acuity === filterAcuity);

  const acuity1and2Count = emergencyCases.filter((c) => c.triage_acuity <= 2).length;
  const waitingCount = emergencyCases.filter((c) => c.status === 'Waiting').length;
  const treatingCount = emergencyCases.filter((c) => c.status === 'Treating').length;

  return (
    <div className="space-y-4">
      {/* Triage Header Banner */}
      <div className="bg-gradient-to-r from-[#071D30] via-[#351A0B] to-[#071D30] border border-[#FF873D]/60 rounded-3xl p-4 sm:p-5 shadow-[0_0_30px_rgba(255,135,61,0.18)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FF873D]/20 border border-[#FF873D] flex items-center justify-center text-[#FF873D] shadow-[0_0_15px_rgba(255,135,61,0.4)]">
            <Ambulance className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Emergency & Acuity Triage Station
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FF873D]/20 text-[#FF873D] border border-[#FF873D]/60">
                Acuity Level Active
              </span>
            </div>
            <p className="text-xs text-[#718BA5] font-medium mt-0.5">
              Triage Officer: <strong className="text-white">{currentUser.name}</strong> · Emergency Department Intake & Trauma Bays
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenTriageModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF873D] to-[#FF553D] text-white font-bold text-xs shadow-[0_0_20px_rgba(255,135,61,0.4)] hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Triage Incoming Patient / Ambulance</span>
          </button>
        </div>
      </div>

      {/* 4 Emergency Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Critical Acuity (ESI 1-2)</span>
            <ShieldAlert className="w-4 h-4 text-[#FF3B30]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#FF3B30] font-mono">{acuity1and2Count}</div>
          <div className="text-[10px] text-[#FF3B30] mt-0.5 font-medium">Immediate resuscitation / emergent</div>
        </div>

        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Awaiting Assessment</span>
            <Clock className="w-4 h-4 text-[#FF873D]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">{waitingCount}</div>
          <div className="text-[10px] text-[#FF873D] mt-0.5 font-medium">Patients in triage queue</div>
        </div>

        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Under Active Treatment</span>
            <Activity className="w-4 h-4 text-[#18E1C1]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#18E1C1] font-mono">{treatingCount}</div>
          <div className="text-[10px] text-[#18E1C1] mt-0.5 font-medium">Occupying ER resuscitation bays</div>
        </div>

        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Average ER Wait Time</span>
            <Clock className="w-4 h-4 text-[#27B9FF]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">{avgWaitMinutes} min</div>
          <div className="text-[10px] text-[#18E1C1] mt-0.5 font-medium">Stable triage throughput</div>
        </div>
      </div>

      {/* Main Content: Emergency Intake Queue */}
      <div className="bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4">
        {/* Acuity Filter Pills */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#FF873D]" />
            <h3 className="text-sm font-bold text-white">Emergency Intake & Bay Allocation</h3>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterAcuity('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterAcuity === 'all'
                  ? 'bg-[#FF873D] text-white'
                  : 'bg-[#051625] text-[#718BA5] hover:text-white border border-[#145B89]/50'
              }`}
            >
              All Cases ({emergencyCases.length})
            </button>
            {ACUITY_CONFIG.map((a) => (
              <button
                key={a.level}
                onClick={() => setFilterAcuity(a.level)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                  filterAcuity === a.level
                    ? 'bg-[#0E3554] text-white border-[#FF873D]'
                    : 'bg-[#051625] text-[#718BA5] hover:text-white border-[#145B89]/40'
                }`}
              >
                <span style={{ color: a.color }}>ESI {a.level}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Emergency Case Cards */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar">
          {filteredCases.map((c) => {
            const acuity = ACUITY_CONFIG.find((a) => a.level === c.triage_acuity) || ACUITY_CONFIG[2];

            return (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-[#051625] border border-[#145B89]/60 hover:border-[#FF873D]/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border mt-0.5"
                    style={{
                      backgroundColor: `${acuity.color}20`,
                      borderColor: acuity.color,
                      color: acuity.color,
                    }}
                  >
                    ESI {c.triage_acuity}
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-2 truncate">
                      <span>{c.patient_name}</span>
                      <span className="text-[10px] text-[#718BA5]">({c.age} yrs)</span>
                      <span className="font-mono text-[10px] text-[#FF873D] bg-[#071D30] px-1.5 py-0.2 rounded border border-[#145B89]">
                        {c.case_number}
                      </span>
                    </div>
                    <div className="text-xs text-[#FF873D] font-semibold mt-0.5 truncate">
                      {c.chief_complaint}
                    </div>
                    <div className="text-[10px] text-[#718BA5] flex items-center gap-2 mt-0.5">
                      <span>Arrived: {c.arrival_time}</span>
                      <span>·</span>
                      <span>Wait: <strong className="text-white">{c.wait_time_minutes} min</strong></span>
                      <span>·</span>
                      <span className="text-[#38DDF7]">Bay: {c.assigned_bay || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={c.status}
                    onChange={(e) => handleUpdateStatus(c.id, e.target.value as EmergencyCase['status'])}
                    className="px-2.5 py-1.5 rounded-lg bg-[#071D30] border border-[#145B89] text-xs font-bold text-[#F1F7FF] outline-none cursor-pointer"
                  >
                    <option value="Waiting">Waiting</option>
                    <option value="Triage">In Triage</option>
                    <option value="Treating">Treating</option>
                    <option value="Admitted">Admitted</option>
                    <option value="Discharged">Discharged</option>
                  </select>
                </div>
              </div>
            );
          })}

          {filteredCases.length === 0 && (
            <div className="py-8 text-center text-xs text-[#718BA5]">
              No emergency cases found matching filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
