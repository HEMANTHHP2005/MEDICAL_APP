import React from 'react';
import { DoseStatusBar } from './DoseStatusBar';
import { UpcomingSchedules } from './UpcomingSchedules';
import { LowStockAlerts } from './LowStockAlerts';
import { FamilySummaries } from './FamilySummaries';
import { NavigationTab } from '../shell/Header';
import { useMediHome } from '../../context/MediHomeContext';
import { UserPlus, Plus, Sparkles, RefreshCw, Trash2 } from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onFilterDosesByStatus?: (status: string) => void;
  onFilterDosesByMember?: (memberId: string) => void;
  onOpenRefillModal: (medicineId?: string) => void;
  onOpenFamilyModal: () => void;
  onOpenMedicineModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onFilterDosesByStatus,
  onFilterDosesByMember,
  onOpenRefillModal,
  onOpenFamilyModal,
  onOpenMedicineModal
}) => {
  const { isDemoMode, startFreshHousehold, loadDemoData, familyMembers } = useMediHome();

  return (
    <div className="space-y-6">
      {/* Household Status & Quick Actions Banner */}
      {isDemoMode ? (
        <div className="bg-gradient-to-r from-teal-50 to-sky-50 border border-teal-200/80 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-slate-900">
                  Previewing Sample Household (Pendelton Family)
                </h2>
                <span className="text-[11px] font-semibold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-full">
                  Demo Mode
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                You can explore this sample data, add your own members, or clear it completely to start managing your actual family prescriptions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={onOpenFamilyModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-900 bg-teal-100 hover:bg-teal-200 border border-teal-300 rounded-lg transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>

            <button
              type="button"
              onClick={onOpenMedicineModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Medicine</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm("Clear sample demo data and start your fresh household?")) {
                  startFreshHousehold();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
              title="Clear sample data to enter your family"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Sample & Start Fresh</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              <strong>Personal Household Active:</strong> {familyMembers.length} member(s) registered. Data is saved in your browser.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenFamilyModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Family Member</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Restore the realistic sample demo data? Any unsaved changes may be overwritten.")) {
                  loadDemoData();
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              title="Restore demo household"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Load Demo Data</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Today's Dose Status Bar */}
      <DoseStatusBar 
        onFilterByStatus={(status) => {
          onFilterDosesByStatus?.(status);
          onNavigate('today-doses');
        }} 
      />

      {/* 2-Column Split: Upcoming Schedule Lineup vs Low-Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <UpcomingSchedules onViewAllDoses={() => onNavigate('today-doses')} />
        </div>
        <div className="lg:col-span-5">
          <LowStockAlerts
            onPlanRefill={(medId) => onOpenRefillModal(medId)}
            onViewStock={() => onNavigate('stock')}
          />
        </div>
      </div>

      {/* Family Member Summaries */}
      <FamilySummaries
        onSelectMember={(memberId) => {
          onFilterDosesByMember?.(memberId);
          onNavigate('today-doses');
        }}
        onManageFamily={() => onNavigate('family')}
        onOpenAddMember={onOpenFamilyModal}
      />
    </div>
  );
};
