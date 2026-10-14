import React, { useState } from 'react';
import { X, Bed, Check, Sparkles, AlertCircle, ArrowRightLeft, UserPlus, Plus } from 'lucide-react';
import { BedRecord } from '../../types/hospital';
import { hospitalDataService } from '../../services/hospitalDataService';

interface BedManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  beds: BedRecord[];
  onRefresh?: () => void;
}

export const BedManagementModal: React.FC<BedManagementModalProps> = ({
  isOpen,
  onClose,
  beds,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<'all' | 'available' | 'occupied' | 'cleaning'>('all');
  const [selectedBed, setSelectedBed] = useState<BedRecord | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [targetBedId, setTargetBedId] = useState('');
  const [isAdmitting, setIsAdmitting] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Add Bed State
  const [isAddingBed, setIsAddingBed] = useState(false);
  const [newBedCode, setNewBedCode] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newBedDepartment, setNewBedDepartment] = useState('Intensive Care');
  const [isSubmittingBed, setIsSubmittingBed] = useState(false);

  if (!isOpen) return null;

  const filteredBeds = beds.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const availableBeds = beds.filter((b) => b.status === 'available');

  const handleDischarge = async (bedId: string) => {
    setErrorMsg(null);
    const result = await hospitalDataService.dischargeBed(bedId);
    if (!result.success) {
      setErrorMsg(result.error || 'Discharge failed');
      return;
    }
    setSelectedBed(null);
    if (onRefresh) onRefresh();
  };

  const handleSanitize = async (bedId: string) => {
    setErrorMsg(null);
    const result = await hospitalDataService.sanitizeBed(bedId);
    if (!result.success) {
      setErrorMsg(result.error || 'Sanitization update failed');
      return;
    }
    setSelectedBed(null);
    if (onRefresh) onRefresh();
  };

  const handleTransfer = async () => {
    if (!selectedBed || !targetBedId) return;
    setErrorMsg(null);
    const result = await hospitalDataService.transferBed(selectedBed.id, targetBedId);
    if (!result.success) {
      setErrorMsg(result.error || 'Transfer failed');
      return;
    }
    setIsTransferring(false);
    setSelectedBed(null);
    if (onRefresh) onRefresh();
  };

  const handleAdmit = async () => {
    if (!selectedBed || !newPatientName.trim()) return;
    setErrorMsg(null);
    const result = await hospitalDataService.assignBed(selectedBed.id, newPatientName.trim());
    if (!result.success) {
      setErrorMsg(result.error || 'Admission failed');
      return;
    }
    setIsAdmitting(false);
    setNewPatientName('');
    setSelectedBed(null);
    if (onRefresh) onRefresh();
  };

  const handleCreateBed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBedCode.trim() || !newRoomNumber.trim()) return;
    setErrorMsg(null);
    setIsSubmittingBed(true);

    const result = await hospitalDataService.addBed({
      bed_code: newBedCode.trim(),
      room_number: newRoomNumber.trim(),
      department: newBedDepartment.trim(),
      status: 'available',
    });

    setIsSubmittingBed(false);
    if (!result.success) {
      setErrorMsg(result.error || 'Failed to add bed.');
      return;
    }

    setNewBedCode('');
    setNewRoomNumber('');
    setIsAddingBed(false);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl bg-[#071D30] border border-[#27B9FF]/70 rounded-3xl p-6 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#145B89]">
          <div>
            <h2 className="text-lg font-bold text-[#F1F7FF] flex items-center gap-2">
              <Bed className="w-5 h-5 text-[#18E1C1]" />
              <span>Hospital Bed Allocation, Transfers & Sanitization Cycle</span>
            </h2>
            <p className="text-xs text-[#718BA5] mt-0.5">
              Live ward telemetry: {beds.filter((b) => b.status === 'occupied').length} occupied · {beds.filter((b) => b.status === 'available').length} sanitized & ready · {beds.filter((b) => b.status === 'cleaning').length} in terminal disinfection
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#718BA5] hover:text-white hover:bg-[#051625]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-[#3A1414] border border-[#FF634D] text-xs text-[#FF634D] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Filter & Action Bar */}
        <div className="flex items-center justify-between gap-2 pt-3 pb-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {(['all', 'available', 'occupied', 'cleaning'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                  filter === tab
                    ? 'bg-[#087FC7] text-white border border-[#27B9FF]'
                    : 'bg-[#051625] text-[#718BA5] border border-[#145B89]/60 hover:text-white'
                }`}
              >
                {tab} ({beds.filter((b) => tab === 'all' || b.status === tab).length})
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddingBed(!isAddingBed)}
            className="px-3.5 py-1.5 rounded-xl bg-[#087FC7]/20 border border-[#27B9FF] text-[#23D5F4] hover:text-white hover:bg-[#087FC7]/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(39,185,255,0.25)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingBed ? 'Cancel New Bed' : '+ Add Hospital Bed'}</span>
          </button>
        </div>

        {/* Add Bed Form Drawer */}
        {isAddingBed && (
          <form onSubmit={handleCreateBed} className="p-4 mb-3 rounded-2xl bg-[#051625] border border-[#27B9FF]/60 flex flex-col sm:flex-row items-end gap-3 animate-fadeIn">
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-semibold text-[#A7BED3] mb-1">
                Bed Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ICU-101"
                value={newBedCode}
                onChange={(e) => setNewBedCode(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#071D30] border border-[#145B89] text-xs text-white uppercase font-mono outline-none"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-semibold text-[#A7BED3] mb-1">
                Room Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 101"
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#071D30] border border-[#145B89] text-xs text-white font-mono outline-none"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-semibold text-[#A7BED3] mb-1">
                Department
              </label>
              <select
                value={newBedDepartment}
                onChange={(e) => setNewBedDepartment(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#071D30] border border-[#145B89] text-xs text-white outline-none"
              >
                <option value="Intensive Care">Intensive Care</option>
                <option value="Cardiology">Cardiology</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isSubmittingBed}
              className="px-4 py-2 rounded-xl bg-[#087FC7] hover:bg-[#27B9FF] text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              {isSubmittingBed ? 'Saving...' : 'Save to Supabase'}
            </button>
          </form>
        )}

        {/* Bed Grid or Empty State */}
        {filteredBeds.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#051625]/60 rounded-2xl border border-[#145B89]/50">
            <Bed className="w-12 h-12 text-[#718BA5] mb-2 opacity-50" />
            <h4 className="text-sm font-bold text-[#F1F7FF]">No hospital beds in this view</h4>
            <p className="text-xs text-[#718BA5] mt-1 mb-4">
              {beds.length === 0
                ? 'Your Supabase bed inventory is empty. Click "+ Add Hospital Bed" above to register ward beds.'
                : 'No beds match the current filter.'}
            </p>
            {beds.length === 0 && (
              <button
                onClick={() => setIsAddingBed(true)}
                className="px-4 py-2 rounded-xl bg-[#087FC7] text-white text-xs font-semibold"
              >
                + Add First Hospital Bed
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
            {filteredBeds.map((bed) => {
              const isOccupied = bed.status === 'occupied';
              const isCleaning = bed.status === 'cleaning';
              const isSelected = selectedBed?.id === bed.id;

              return (
                <div
                  key={bed.id}
                  onClick={() => {
                    setSelectedBed(bed);
                    setIsTransferring(false);
                    setIsAdmitting(false);
                    setErrorMsg(null);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'ring-2 ring-[#27B9FF] shadow-[0_0_15px_rgba(39,185,255,0.4)]'
                      : ''
                  } ${
                    isOccupied
                      ? 'bg-[#051625]/90 border-[#145B89] hover:border-[#27B9FF]'
                      : isCleaning
                      ? 'bg-[#1C1A0F]/90 border-[#FFB34F]/50 hover:border-[#FFB34F]'
                      : 'bg-[#07241F]/90 border-[#18E1C1]/60 hover:border-[#36D6A4] shadow-[0_0_10px_rgba(24,225,193,0.15)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-mono text-[#F1F7FF]">
                      {bed.bed_code}
                    </span>
                    <span
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                        isOccupied
                          ? 'bg-[#0E3554] text-[#23D5F4]'
                          : isCleaning
                          ? 'bg-[#3D2C0A] text-[#FFB34F]'
                          : 'bg-[#0E4237] text-[#36D6A4]'
                      }`}
                    >
                      {bed.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#A7BED3] truncate">
                    Room {bed.room_number} · {bed.department}
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#145B89]/40 text-xs">
                    {isOccupied ? (
                      <span className="font-medium text-white truncate block">
                        {bed.patient_name || 'Patient Admitted'}
                      </span>
                    ) : isCleaning ? (
                      <span className="text-[#FFB34F] flex items-center gap-1 text-[10px]">
                        <Sparkles className="w-3 h-3" /> Terminal Clean Required
                      </span>
                    ) : (
                      <span className="text-[#36D6A4] flex items-center gap-1 text-[10px] font-semibold">
                        <Check className="w-3 h-3" /> Sanitized & Ready
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Bed Workflow Drawer */}
        {selectedBed && (
          <div className="mt-3 p-4 rounded-2xl bg-[#051625] border border-[#27B9FF]/50 flex flex-col gap-3 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#145B89]/40 pb-2.5">
              <div>
                <span className="text-sm font-bold text-white">Bed: {selectedBed.bed_code}</span>
                <span className="text-xs text-[#23D5F4] ml-2 font-mono">
                  ({selectedBed.department} · Room {selectedBed.room_number})
                </span>
                {selectedBed.patient_name && (
                  <span className="text-xs text-[#A7BED3] ml-2">
                    Current Patient: <strong className="text-white">{selectedBed.patient_name}</strong> ({selectedBed.patient_mrn})
                  </span>
                )}
              </div>
              <span className="text-xs text-[#718BA5] font-mono">
                Status: <strong className="uppercase text-white">{selectedBed.status}</strong>
              </span>
            </div>

            {selectedBed.status === 'occupied' && (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xs text-[#718BA5]">
                  Patient admitted since: <strong className="text-white font-mono">{selectedBed.assigned_at || 'Today'}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsTransferring(true)}
                    className="px-3.5 py-1.5 rounded-xl border border-[#23D5F4]/60 text-[#23D5F4] hover:bg-[#087FC7]/20 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Transfer Bed</span>
                  </button>
                  <button
                    onClick={() => handleDischarge(selectedBed.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#3A1E14] border border-[#FF873D] text-[#FF873D] hover:bg-[#FF873D]/20 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span>Discharge & Clean</span>
                  </button>
                </div>
              </div>
            )}

            {isTransferring && (
              <div className="flex items-center gap-2.5 bg-[#071D30] p-3 rounded-xl border border-[#145B89]">
                <span className="text-xs text-[#A7BED3]">Select target available bed:</span>
                <select
                  value={targetBedId}
                  onChange={(e) => setTargetBedId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#051625] border border-[#145B89] text-xs text-white outline-none flex-1"
                >
                  <option value="">-- Choose Target Bed --</option>
                  {availableBeds
                    .filter((b) => b.id !== selectedBed.id)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bed_code} ({b.department} - Room {b.room_number})
                      </option>
                    ))}
                </select>
                <button
                  onClick={handleTransfer}
                  disabled={!targetBedId}
                  className="px-4 py-1.5 rounded-xl bg-[#087FC7] hover:bg-[#27B9FF] disabled:opacity-50 text-white text-xs font-semibold"
                >
                  Execute Transfer
                </button>
                <button
                  onClick={() => setIsTransferring(false)}
                  className="px-3 py-1.5 rounded-xl border border-[#145B89] text-xs text-[#718BA5]"
                >
                  Cancel
                </button>
              </div>
            )}

            {selectedBed.status === 'cleaning' && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-[#FFB34F] flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Terminal disinfection & linen turnover pending.</span>
                </span>
                <button
                  onClick={() => handleSanitize(selectedBed.id)}
                  className="px-4 py-2 rounded-xl bg-[#0E4237] border border-[#36D6A4] text-[#36D6A4] hover:bg-[#36D6A4]/20 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Mark Terminal Cleaning Complete (Ready for Intake)</span>
                </button>
              </div>
            )}

            {selectedBed.status === 'available' && !isAdmitting && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-[#36D6A4] flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Sanitized & ready for immediate patient allocation.</span>
                </span>
                <button
                  onClick={() => setIsAdmitting(true)}
                  className="px-4 py-2 rounded-xl bg-[#087FC7] hover:bg-[#27B9FF] text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(39,185,255,0.4)]"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Admit Patient to Bed</span>
                </button>
              </div>
            )}

            {isAdmitting && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 bg-[#071D30] p-3 rounded-xl border border-[#145B89]">
                <input
                  type="text"
                  placeholder="Enter patient full legal name..."
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#051625] border border-[#145B89] text-xs text-white outline-none flex-1"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAdmit}
                    disabled={!newPatientName.trim()}
                    className="px-4 py-1.5 rounded-xl bg-[#087FC7] hover:bg-[#27B9FF] disabled:opacity-50 text-white text-xs font-semibold"
                  >
                    Confirm Admission
                  </button>
                  <button
                    onClick={() => setIsAdmitting(false)}
                    className="px-3 py-1.5 rounded-xl border border-[#145B89] text-xs text-[#718BA5]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
