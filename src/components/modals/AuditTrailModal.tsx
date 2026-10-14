import React, { useState } from 'react';
import { X, ShieldCheck, Filter, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import { AuditEvent } from '../../types/hospital';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditEvents: AuditEvent[];
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  isOpen,
  onClose,
  auditEvents,
}) => {
  if (!isOpen) return null;

  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [filterOutcome, setFilterOutcome] = useState<string>('all');

  const filtered = auditEvents.filter((ev) => {
    const matchEntity = filterEntity === 'all' || ev.entity_type === filterEntity;
    const matchOutcome = filterOutcome === 'all' || ev.outcome === filterOutcome;
    return matchEntity && matchOutcome;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl bg-[#071D30] border border-[#27B9FF]/70 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#145B89]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0E3554] border border-[#18E1C1]/60 flex items-center justify-center text-[#18E1C1]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Hospital Operations Audit Trail & Security Log</h2>
              <p className="text-xs text-[#718BA5]">
                Immutable traceable ledger for clinical admissions, bed allocations, triage, and inventory actions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#718BA5] hover:text-white hover:bg-[#051625]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 py-3 border-b border-[#145B89]/50 text-xs">
          <div className="flex items-center gap-1.5 text-[#718BA5]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by Domain:</span>
          </div>
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-[#051625] border border-[#145B89] text-[#F1F7FF] outline-none"
          >
            <option value="all">All Domains</option>
            <option value="Patient">Patient Identity</option>
            <option value="Appointment">Appointments</option>
            <option value="Encounter">Clinical Encounters</option>
            <option value="Bed">Bed Allocations</option>
            <option value="Emergency">Emergency Triage</option>
            <option value="Inventory">Medical Inventory</option>
            <option value="Security">Security & RBAC</option>
          </select>

          <select
            value={filterOutcome}
            onChange={(e) => setFilterOutcome(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-[#051625] border border-[#145B89] text-[#F1F7FF] outline-none"
          >
            <option value="all">All Outcomes</option>
            <option value="Success">Success</option>
            <option value="Conflict">Conflict Blocked</option>
            <option value="Denied">Access Denied</option>
          </select>

          <span className="ml-auto text-[#718BA5] text-[11px] font-mono">
            Showing {filtered.length} of {auditEvents.length} events
          </span>
        </div>

        {/* Audit Log Table */}
        <div className="flex-1 overflow-y-auto mt-2 rounded-2xl border border-[#145B89]/60 bg-[#051625]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#071D30] text-[#718BA5] uppercase text-[10px] tracking-wider font-semibold border-b border-[#145B89]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor & Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-4">Event Description</th>
                <th className="py-2.5 px-3 text-right">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#145B89]/30 text-[11px]">
              {filtered.map((ev) => (
                <tr key={ev.id} className="hover:bg-[#071D30]/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[#718BA5] whitespace-nowrap">
                    {ev.timestamp}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="font-semibold text-[#F1F7FF]">{ev.actor_name}</div>
                    <div className="text-[10px] text-[#23D5F4]">{ev.actor_role}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#36D6A4] font-semibold">
                    {ev.action}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-[#071D30] border border-[#145B89] text-[10px] text-[#A7BED3]">
                      {ev.entity_type} · {ev.entity_id}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-[#A7BED3] leading-relaxed">
                    {ev.description}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${
                        ev.outcome === 'Success'
                          ? 'bg-[#0E4237] text-[#36D6A4]'
                          : ev.outcome === 'Conflict'
                          ? 'bg-[#3A1E14] text-[#FF873D]'
                          : 'bg-[#3A1414] text-[#FF634D]'
                      }`}
                    >
                      {ev.outcome === 'Success' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      <span>{ev.outcome}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
