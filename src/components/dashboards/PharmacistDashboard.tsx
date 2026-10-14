import React, { useState } from 'react';
import {
  Pill,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Droplets,
  Activity,
  Plus,
  Minus,
  Search,
  PackageCheck,
  ShieldCheck,
} from 'lucide-react';
import { CurrentUser, MedicalResourceItem, StockMovement } from '../../types/hospital';
import { hospitalDataService } from '../../services/hospitalDataService';

interface PharmacistDashboardProps {
  currentUser: CurrentUser;
  resources: MedicalResourceItem[];
  stockMovements: StockMovement[];
  onRefresh: () => void;
}

interface PendingPrescription {
  id: string;
  patient_name: string;
  mrn: string;
  prescribing_doctor: string;
  medication: string;
  dosage: string;
  quantity: number;
  status: 'Pending' | 'Dispensed';
  timestamp: string;
}

export const PharmacistDashboard: React.FC<PharmacistDashboardProps> = ({
  currentUser,
  resources,
  stockMovements,
  onRefresh,
}) => {
  const [prescriptions, setPrescriptions] = useState<PendingPrescription[]>([]);
  const [dispenseSuccess, setDispenseSuccess] = useState<string | null>(null);

  const medications = resources.filter((r) => r.category === 'Medications');
  const bloodSupply = resources.filter((r) => r.category === 'Blood Supply');
  const criticalItems = resources.filter((r) => r.status === 'Critical' || r.stock_percentage < 30);

  const handleDispenseRx = (rx: PendingPrescription) => {
    // Find matching medication in inventory
    const match = medications[0];
    if (match) {
      hospitalDataService.recordStockMovement(
        match.id,
        'Dispense',
        rx.quantity,
        `Prescription dispense for ${rx.patient_name} (${rx.mrn}) ordered by ${rx.prescribing_doctor}`
      );
    }

    setPrescriptions((prev) =>
      prev.map((item) => (item.id === rx.id ? { ...item, status: 'Dispensed' } : item))
    );

    setDispenseSuccess(`Dispensed ${rx.medication} for ${rx.patient_name} (${rx.mrn}). Inventory deducted.`);
    setTimeout(() => setDispenseSuccess(null), 3000);
    onRefresh();
  };

  const handleReceiveStock = (resource: MedicalResourceItem) => {
    hospitalDataService.recordStockMovement(
      resource.id,
      'Receipt',
      50,
      'Pharmacy replenishment intake batch'
    );
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Pharmacist Header Banner */}
      <div className="bg-gradient-to-r from-[#071D30] via-[#1B1948] to-[#071D30] border border-[#A78BFA]/60 rounded-3xl p-4 sm:p-5 shadow-[0_0_30px_rgba(167,139,250,0.18)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#A78BFA]/20 border border-[#A78BFA] flex items-center justify-center text-[#A78BFA] shadow-[0_0_15px_rgba(167,139,250,0.4)]">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Central Pharmacy & Dispense Cockpit
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/60">
                PharmD Session
              </span>
            </div>
            <p className="text-xs text-[#718BA5] font-medium mt-0.5">
              Clinical Pharmacist: <strong className="text-white">{currentUser.name}</strong> · Controlled Substances & Formulary
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#18E1C1] flex items-center gap-1.5 font-semibold bg-[#18E1C1]/10 px-3 py-1.5 rounded-xl border border-[#18E1C1]/40">
            <ShieldCheck className="w-4 h-4" />
            Barcoded e-Verification Active
          </span>
        </div>
      </div>

      {dispenseSuccess && (
        <div className="p-3.5 rounded-xl bg-[#18E1C1]/15 border border-[#18E1C1] text-[#18E1C1] text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{dispenseSuccess}</span>
        </div>
      )}

      {/* 4 Pharmacy Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Pending Rx Orders</span>
            <Clock className="w-4 h-4 text-[#A78BFA]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#A78BFA] font-mono">
            {prescriptions.filter((p) => p.status === 'Pending').length}
          </div>
          <div className="text-[10px] text-[#A78BFA] mt-0.5 font-medium">Awaiting pharmacist verification</div>
        </div>

        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Medication Stock</span>
            <Pill className="w-4 h-4 text-[#23D5F4]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">
            {medications.reduce((acc, m) => acc + m.current_quantity, 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-[#23D5F4] mt-0.5 font-medium">Total formulary units in vault</div>
        </div>

        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Critical Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-[#FF873D]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#FF873D] font-mono">{criticalItems.length}</div>
          <div className="text-[10px] text-[#FF873D] mt-0.5 font-medium">Items near minimum threshold</div>
        </div>

        <div className="bg-[#051625]/90 border border-[#145B89]/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-[#718BA5] text-xs mb-1">
            <span>Blood & Cryo Reserves</span>
            <Droplets className="w-4 h-4 text-[#FF873D]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#18E1C1] font-mono">
            {bloodSupply[0]?.stock_percentage || 91}%
          </div>
          <div className="text-[10px] text-[#18E1C1] mt-0.5 font-medium">Optimal cold-chain level</div>
        </div>
      </div>

      {/* Grid: Pending Prescriptions Queue & Medication Inventory Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column (7 Cols): Prescription Dispensing Queue */}
        <div className="lg:col-span-7 bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-[#A78BFA]" />
                <h3 className="text-sm font-bold text-white">Clinical Prescription Queue</h3>
              </div>
              <span className="text-[10px] text-[#718BA5]">Verified Orders</span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar">
              {prescriptions.map((rx) => {
                const isDispensed = rx.status === 'Dispensed';

                return (
                  <div
                    key={rx.id}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isDispensed
                        ? 'bg-[#051625]/60 border-[#145B89]/40 opacity-70'
                        : 'bg-[#051625] border-[#A78BFA]/50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs font-bold text-white truncate">
                        <span>{rx.patient_name}</span>
                        <span className="font-mono text-[10px] text-[#23D5F4] bg-[#071D30] px-1.5 py-0.5 rounded border border-[#145B89]">
                          {rx.mrn}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#A78BFA] mt-0.5">
                        {rx.medication} · {rx.dosage} (Qty: {rx.quantity})
                      </div>
                      <div className="text-[10px] text-[#718BA5] flex items-center gap-2 mt-0.5">
                        <span>Ordered by {rx.prescribing_doctor}</span>
                        <span>·</span>
                        <span className="text-[#A7BED3]">{rx.timestamp}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isDispensed ? (
                        <span className="px-3 py-1.5 rounded-lg bg-[#18E1C1]/20 text-[#18E1C1] border border-[#18E1C1]/50 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Dispensed</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDispenseRx(rx)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#38DDF7] text-[#03101E] text-xs font-bold shadow-[0_0_15px_rgba(167,139,250,0.4)] hover:brightness-110 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Pill className="w-3.5 h-3.5" />
                          <span>Dispense Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Formulary & Quick Stock Intake */}
        <div className="lg:col-span-5 bg-[#071D30]/90 border border-[#145B89]/70 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#23D5F4]" />
                <h3 className="text-sm font-bold text-white">Formulary Stock Intake</h3>
              </div>
              <span className="text-[10px] text-[#718BA5]">Live Vault</span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar">
              {resources.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#051625] border border-[#145B89]/60 hover:border-[#27B9FF]/60 transition-all flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white truncate max-w-[200px]">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-[#718BA5]">
                        {item.category} · Lot {item.lot_number || 'N/A'}
                      </div>
                    </div>

                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.stock_percentage > 70
                          ? 'bg-[#18E1C1]/20 text-[#18E1C1]'
                          : item.stock_percentage > 30
                          ? 'bg-[#27B9FF]/20 text-[#27B9FF]'
                          : 'bg-[#FF873D]/20 text-[#FF873D]'
                      }`}
                    >
                      {item.stock_percentage}%
                    </span>
                  </div>

                  {/* Stock progress bar */}
                  <div className="w-full h-1.5 bg-[#071D30] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${item.stock_percentage}%`,
                        backgroundColor:
                          item.stock_percentage > 70
                            ? '#18E1C1'
                            : item.stock_percentage > 30
                            ? '#27B9FF'
                            : '#FF873D',
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="font-mono text-white">
                      {item.current_quantity} / {item.capacity_quantity} {item.unit}
                    </span>

                    <button
                      onClick={() => handleReceiveStock(item)}
                      className="px-2 py-1 rounded bg-[#087FC7]/20 hover:bg-[#087FC7]/40 border border-[#27B9FF]/40 text-[#23D5F4] text-[10px] font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+50 Restock</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
