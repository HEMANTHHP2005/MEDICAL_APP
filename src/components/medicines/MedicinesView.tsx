import React, { useState, useMemo } from 'react';
import { useMediHome } from '../../context/MediHomeContext';
import { StatusBadge } from '../common/StatusBadge';
import { formatTime24to12, formatFoodRelation } from '../../utils/formatters';
import { calculateDailyBurnRate, calculateDaysOfSupply } from '../../utils/calculations';
import { EmptyState } from '../common/EmptyState';
import { Pill, Plus, Search, Calendar, Package, AlertCircle, Trash2 } from 'lucide-react';

interface MedicinesViewProps {
  onOpenRegisterModal: () => void;
  onNavigateToStock: () => void;
}

export const MedicinesView: React.FC<MedicinesViewProps> = ({
  onOpenRegisterModal,
  onNavigateToStock
}) => {
  const { medicines, familyMembers, deleteMedicine } = useMediHome();
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      if (selectedMember !== 'all' && med.familyMemberId !== selectedMember) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = med.name.toLowerCase().includes(q) || med.brandName?.toLowerCase().includes(q);
        const matchesIndication = med.indication?.toLowerCase().includes(q);
        const matchesDoctor = med.prescribingDoctor?.toLowerCase().includes(q);
        if (!matchesName && !matchesIndication && !matchesDoctor) {
          return false;
        }
      }
      return true;
    });
  }, [medicines, selectedMember, searchQuery]);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Prescribed Medicines Register</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified clinical formulations, schedules, and verbatim prescription directives
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenRegisterModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Register New Medicine</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-slate-100">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by medicine name, brand, or clinical indication..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
            />
          </div>

          <div className="sm:col-span-6">
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-700"
            >
              <option value="all">All Family Members ({familyMembers.length})</option>
              {familyMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.fullName} ({m.relationship})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Medicines Grid */}
      {filteredMedicines.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No Medicines Found"
          description="No registered prescriptions match your current filter. Add a new prescription or reset filters."
          action={{
            label: "Register New Medicine",
            onClick: onOpenRegisterModal
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMedicines.map((med) => {
            const member = familyMembers.find(f => f.id === med.familyMemberId);
            const burnRate = calculateDailyBurnRate(med);
            const daysOfSupply = calculateDaysOfSupply(med.currentStock, burnRate);
            const isLowStock = med.currentStock <= med.reorderThreshold;

            return (
              <div
                key={med.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-slate-900 tracking-tight">
                          {med.name}
                        </h2>
                        <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded">
                          {med.strength}
                        </span>
                        {med.brandName && (
                          <span className="text-xs text-slate-500">
                            (Brand: {med.brandName})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span 
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: member?.avatarColor || '#64748b' }}
                        />
                        <span className="font-medium text-slate-700">{member?.fullName} ({member?.relationship})</span>
                        <span aria-hidden="true">·</span>
                        <span>{med.dosageForm}</span>
                        {med.indication && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-600 font-medium">{med.indication}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <StatusBadge status={isLowStock ? 'low' : 'normal'} />
                  </div>

                  {/* Verbatim Prescribed Instructions Box */}
                  <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-3 my-3">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Prescribed Instructions (Verbatim)</span>
                      {med.prescribingDoctor && (
                        <span className="text-slate-400 capitalize">{med.prescribingDoctor}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-800 font-medium italic leading-relaxed">
                      "{med.prescribedInstructions}"
                    </p>
                  </div>

                  {/* Regimen Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2 text-xs text-slate-600 border-t border-b border-slate-100 my-3">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Frequency:</span>
                      <span className="font-semibold capitalize text-slate-800">{med.schedule.frequency.replace('-', ' ')}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Daily Times:</span>
                      <span className="font-mono font-medium text-slate-800">
                        {med.schedule.scheduledTimes.map(formatTime24to12).join(', ')}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Food Relation:</span>
                      <span className="text-slate-800">{formatFoodRelation(med.schedule.foodRelation)}</span>
                    </div>
                  </div>

                  {/* Stock Status Bar */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/70 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-600">Current Inventory:</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {med.currentStock} {med.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px] tabular-nums">
                      <span>Threshold: {med.reorderThreshold}</span>
                      <span aria-hidden="true">·</span>
                      <span>~{daysOfSupply}d left ({burnRate} {med.unit}/day)</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3 text-xs">
                  <div className="text-slate-400 text-[11px] font-mono">
                    Rx: {med.pharmacyName || 'Local Pharmacy'}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigateToStock()}
                      className="text-teal-600 hover:text-teal-700 font-semibold"
                    >
                      View in Stock →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Remove prescription "${med.name} ${med.strength}"? This will also remove scheduled doses.`)) {
                          deleteMedicine(med.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                      title="Remove Prescription"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
