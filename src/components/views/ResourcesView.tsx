import React, { useState } from 'react';
import { ArrowLeft, Pill, Activity, Droplets, Plus, Minus, AlertTriangle, ShieldCheck, MapPin, Calendar, Hash, X } from 'lucide-react';
import { MedicalResourceItem, StockMovement } from '../../types/hospital';
import { hospitalDataService } from '../../services/hospitalDataService';

interface ResourcesViewProps {
  resources: MedicalResourceItem[];
  stockMovements: StockMovement[];
  onBackToOverview: () => void;
  onRefresh?: () => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  stockMovements,
  onBackToOverview,
  onRefresh,
}) => {
  const [selectedRes, setSelectedRes] = useState<MedicalResourceItem | null>(null);
  const [movementType, setMovementType] = useState<'Receipt' | 'Dispense'>('Receipt');
  const [movementQty, setMovementQty] = useState<number>(100);
  const [reason, setReason] = useState<string>('Routine Ward Restock');
  const [actionError, setActionError] = useState<string | null>(null);

  const currentUser = hospitalDataService.getCurrentUser();
  const canManageStock = currentUser.permissions.canDispenseMedications || currentUser.role === 'Administrator';

  const handleApplyMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRes || movementQty <= 0) return;
    setActionError(null);

    const result = hospitalDataService.recordStockMovement(
      selectedRes.id,
      movementType,
      Number(movementQty),
      reason
    );

    if (!result.success) {
      setActionError(result.error || 'Inventory movement failed validation');
      return;
    }

    setSelectedRes(null);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToOverview}
            className="p-2 rounded-xl bg-[#051625] border border-[#145B89] hover:border-[#23D5F4] text-[#718BA5] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-[#F1F7FF]">Hospital Pharmacy & Traceable Inventory</h2>
            <p className="text-xs text-[#718BA5]">
              Real-time stock balances, batch lots, expiry tracking, and cold-chain blood product custody
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#A7BED3] font-mono">
          <ShieldCheck className="w-4 h-4 text-[#36D6A4]" />
          <span>Audit-Compliant Inventory Control</span>
        </div>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-2xl bg-[#3A1414] border border-[#FF634D] text-xs text-[#FF634D] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resources.map((item) => {
          const isBlood = item.category === 'Blood Supply';
          const isMed = item.category === 'Medications';

          return (
            <div
              key={item.id}
              className="bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#051625] border border-[#145B89] flex items-center justify-center">
                    {isBlood ? (
                      <Droplets className="w-5 h-5 text-[#FF873D]" />
                    ) : isMed ? (
                      <Pill className="w-5 h-5 text-[#23D5F4]" />
                    ) : (
                      <Activity className="w-5 h-5 text-[#18E1C1]" />
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.status === 'Optimal'
                        ? 'bg-[#0E4237] text-[#36D6A4] border border-[#36D6A4]/40'
                        : 'bg-[#3A1E14] text-[#FF873D] border border-[#FF873D]/40'
                    }`}
                  >
                    {item.status} Stock
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#F1F7FF] mb-1">{item.name}</h3>
                <p className="text-[11px] text-[#718BA5] mb-3">Classification: {item.category}</p>

                {/* Stock bar & figures */}
                <div className="bg-[#051625] rounded-xl p-3 border border-[#145B89]/50 mb-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-extrabold text-[#F1F7FF] tabular-nums font-mono">
                      {item.stock_percentage}%
                    </span>
                    <span className="text-[11px] text-[#A7BED3] font-mono">
                      {item.current_quantity.toLocaleString()} / {item.capacity_quantity.toLocaleString()} {item.unit}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-[#071D30] rounded-full overflow-hidden mt-2 border border-[#145B89]/40">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isBlood ? 'bg-[#FF873D]' : 'bg-[#18E1C1]'
                      }`}
                      style={{ width: `${item.stock_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Batch / Storage Metadata */}
                <div className="space-y-1.5 text-[10px] text-[#A7BED3] font-mono pb-2">
                  {item.lot_number && (
                    <div className="flex items-center gap-1.5">
                      <Hash className="w-3 h-3 text-[#23D5F4]" />
                      <span>Batch: <strong className="text-white">{item.lot_number}</strong></span>
                    </div>
                  )}
                  {item.expiry_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-[#FFB34F]" />
                      <span>Exp: {item.expiry_date}</span>
                    </div>
                  )}
                  {item.storage_location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#18E1C1]" />
                      <span className="truncate">{item.storage_location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2.5 border-t border-[#145B89]/50">
                <button
                  disabled={!canManageStock}
                  onClick={() => {
                    setSelectedRes(item);
                    setMovementType('Receipt');
                    setMovementQty(Math.round(item.capacity_quantity * 0.1));
                    setReason('Supplier Replenishment Batch');
                  }}
                  className="flex-1 py-1.5 rounded-xl bg-[#087FC7]/40 hover:bg-[#087FC7] border border-[#27B9FF]/50 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Receive Stock</span>
                </button>
                <button
                  disabled={!canManageStock}
                  onClick={() => {
                    setSelectedRes(item);
                    setMovementType('Dispense');
                    setMovementQty(Math.round(item.capacity_quantity * 0.05));
                    setReason('Clinical Department Dispense');
                  }}
                  className="flex-1 py-1.5 rounded-xl bg-[#051625] hover:bg-[#071D30] border border-[#145B89] text-[#A7BED3] hover:text-white text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Dispense</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stock Movement Dialog Modal */}
      {selectedRes && (
        <div className="p-4 rounded-2xl bg-[#071D30] border border-[#27B9FF]/70 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-[#145B89]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Record Inventory Movement: {selectedRes.name}</span>
            </h3>
            <button
              onClick={() => setSelectedRes(null)}
              className="text-[#718BA5] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleApplyMovement} className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 text-xs">
            <div>
              <label className="block text-[#A7BED3] mb-1">Action Type</label>
              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as 'Receipt' | 'Dispense')}
                className="w-full px-3 py-1.5 rounded-xl bg-[#051625] border border-[#145B89] text-white outline-none"
              >
                <option value="Receipt">Receipt (+ Inflow)</option>
                <option value="Dispense">Dispense (- Outflow)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#A7BED3] mb-1">Quantity ({selectedRes.unit})</label>
              <input
                type="number"
                min="1"
                max={selectedRes.capacity_quantity}
                value={movementQty}
                onChange={(e) => setMovementQty(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-[#051625] border border-[#145B89] text-white outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#A7BED3] mb-1">Authorization Reason / Prescription Ref</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#051625] border border-[#145B89] text-white outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#087FC7] hover:bg-[#27B9FF] text-white font-semibold whitespace-nowrap shadow-[0_0_15px_rgba(39,185,255,0.4)]"
                >
                  Commit Entry
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Recent Inventory Movement Ledger */}
      {stockMovements.length > 0 && (
        <div className="bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
            Recent Traceable Stock Movements
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#051625] text-[#718BA5] uppercase text-[9px] tracking-wider">
                <tr>
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Item</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Quantity</th>
                  <th className="py-2 px-3">Authorized By</th>
                  <th className="py-2 px-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#145B89]/40 text-[#A7BED3]">
                {stockMovements.slice(0, 5).map((mov) => (
                  <tr key={mov.id}>
                    <td className="py-2 px-3 font-mono text-[#718BA5]">{mov.timestamp}</td>
                    <td className="py-2 px-3 text-white font-medium">{mov.item_name}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          mov.movement_type === 'Receipt'
                            ? 'bg-[#0E4237] text-[#36D6A4]'
                            : 'bg-[#0E3554] text-[#23D5F4]'
                        }`}
                      >
                        {mov.movement_type}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-white font-bold">{mov.quantity}</td>
                    <td className="py-2 px-3">{mov.authorized_by}</td>
                    <td className="py-2 px-3">{mov.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
