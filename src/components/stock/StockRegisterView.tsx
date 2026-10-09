import React, { useState, useMemo } from 'react';
import { useMediHome } from '../../context/MediHomeContext';
import { StatusBadge } from '../common/StatusBadge';
import { AdjustStockModal } from './AdjustStockModal';
import { StockTransactionHistoryModal } from './StockTransactionHistoryModal';
import { Medicine } from '../../types/medicine';
import { EmptyState } from '../common/EmptyState';
import { Package, Search, Sliders, History, AlertTriangle, Layers } from 'lucide-react';

interface StockRegisterViewProps {
  onPlanRefill: (medicineId?: string) => void;
}

export const StockRegisterView: React.FC<StockRegisterViewProps> = ({ onPlanRefill }) => {
  const { stockSummaries, medicines, familyMembers } = useMediHome();

  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedMedicineId, setExpandedMedicineId] = useState<string | null>(null);

  // Modal states
  const [adjustingMedicine, setAdjustingMedicine] = useState<Medicine | null>(null);
  const [historyMedicine, setHistoryMedicine] = useState<Medicine | null>(null);

  const filteredSummaries = useMemo(() => {
    return stockSummaries.filter(item => {
      const med = medicines.find(m => m.id === item.medicineId);
      if (!med) return false;

      if (selectedMember !== 'all' && med.familyMemberId !== selectedMember) {
        return false;
      }
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.medicineName.toLowerCase().includes(q);
        const matchesMember = item.familyMemberName.toLowerCase().includes(q);
        if (!matchesName && !matchesMember) {
          return false;
        }
      }
      return true;
    });
  }, [stockSummaries, medicines, selectedMember, selectedStatus, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Household Stock Register</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live physical inventory, lot tracking, expiration buffers, and audit ledger
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">
              Total Formulations Tracked: {stockSummaries.length}
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-slate-100">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by drug name or family member..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-700"
            >
              <option value="all">All Family Members</option>
              {familyMembers.map(m => (
                <option key={m.id} value={m.id}>{m.fullName} ({m.relationship})</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-700"
            >
              <option value="all">All Stock Statuses</option>
              <option value="normal">Adequate Supply</option>
              <option value="low">Low Stock (At/Below Threshold)</option>
              <option value="critical">Critical Supply (&lt;2 Days)</option>
              <option value="depleted">Depleted (0 Units)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stock Cards / Tables */}
      {filteredSummaries.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Stock Items Found"
          description="No medications matched the selected filter criteria."
          action={{
            label: "Reset Filters",
            onClick: () => {
              setSelectedMember('all');
              setSelectedStatus('all');
              setSearchQuery('');
            }
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredSummaries.map((item) => {
            const med = medicines.find(m => m.id === item.medicineId);
            if (!med) return null;

            const isExpanded = expandedMedicineId === item.medicineId;
            const isLow = item.status === 'low' || item.status === 'critical' || item.status === 'depleted';

            return (
              <div
                key={item.medicineId}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${
                  isLow ? 'border-amber-200 shadow-xs' : 'border-slate-200 shadow-xs'
                }`}
              >
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Drug Identity */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-slate-900 tracking-tight">
                        {item.medicineName}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {item.strength}
                      </span>
                      <span className="text-xs text-slate-500">
                        for <strong className="text-slate-700">{item.familyMemberName}</strong>
                      </span>
                      <StatusBadge status={item.status} />
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 font-mono tabular-nums flex-wrap pt-1">
                      <span>Daily Burn: <strong className="text-slate-800">{item.dailyBurnRate} {item.unit}/day</strong></span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span>Min Threshold: <strong className="text-slate-800">{item.reorderThreshold} {item.unit}</strong></span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span>Safety Buffer: <strong className="text-slate-800">{item.safetyBufferDays} days</strong></span>
                    </div>
                  </div>

                  {/* Center Column: Inventory Balance & Estimated Runout */}
                  <div className="flex items-center gap-6 self-start lg:self-center">
                    <div>
                      <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                        Current Balance
                      </div>
                      <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                        {item.currentStock}{' '}
                        <span className="text-xs font-normal text-slate-500 font-sans">{item.unit}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                        Estimated Runout
                      </div>
                      <div className="font-mono text-sm font-semibold text-slate-800 tabular-nums">
                        {item.daysOfSupplyRemaining} days left
                      </div>
                      {item.estimatedRunoutDate && (
                        <div className="text-[11px] text-slate-400 font-mono">
                          ~{item.estimatedRunoutDate}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 self-start lg:self-center shrink-0 flex-wrap">
                    {/* Batches toggle */}
                    <button
                      type="button"
                      onClick={() => setExpandedMedicineId(isExpanded ? null : item.medicineId)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span>Batches ({item.batches.length})</span>
                    </button>

                    {/* Discrepancy Adjustment */}
                    <button
                      type="button"
                      onClick={() => setAdjustingMedicine(med)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-500" />
                      <span>Adjust Count</span>
                    </button>

                    {/* Ledger History */}
                    <button
                      type="button"
                      onClick={() => setHistoryMedicine(med)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <History className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ledger</span>
                    </button>

                    {/* Quick Order Refill */}
                    {isLow && (
                      <button
                        type="button"
                        onClick={() => onPlanRefill(item.medicineId)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                      >
                        Order Refill
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Batches Drawer */}
                {isExpanded && (
                  <div className="bg-slate-50/80 border-t border-slate-100 p-4">
                    <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-teal-600" />
                      <span>Physical Batches & Expiry Dates</span>
                    </div>

                    {item.batches.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No individual batches recorded for this item.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {item.batches.map((batch) => (
                          <div
                            key={batch.id}
                            className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-1"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-mono font-bold text-slate-800">{batch.batchNumber}</span>
                              <span className="font-mono font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded text-[11px]">
                                {batch.currentQuantity} {item.unit}
                              </span>
                            </div>
                            <div className="text-slate-500 text-[11px]">
                              Expires: <strong className="font-mono text-slate-700">{batch.expiryDate}</strong>
                            </div>
                            {batch.storageLocation && (
                              <div className="text-slate-500 text-[11px] truncate">
                                Location: {batch.storageLocation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Adjust Inventory Modal */}
      <AdjustStockModal
        isOpen={!!adjustingMedicine}
        onClose={() => setAdjustingMedicine(null)}
        medicine={adjustingMedicine}
      />

      {/* Stock Transaction Ledger Modal */}
      <StockTransactionHistoryModal
        isOpen={!!historyMedicine}
        onClose={() => setHistoryMedicine(null)}
        medicine={historyMedicine}
      />
    </div>
  );
};
