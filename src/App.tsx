import React, { useState } from 'react';
import { MediHomeProvider } from './context/MediHomeContext';
import { Header, NavigationTab } from './components/shell/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { TodayDosesView } from './components/doses/TodayDosesView';
import { MedicinesView } from './components/medicines/MedicinesView';
import { StockRegisterView } from './components/stock/StockRegisterView';
import { RefillPlanningView } from './components/refills/RefillPlanningView';
import { FamilyMembersView } from './components/family/FamilyMembersView';
import { HistoryAuditView } from './components/history/HistoryAuditView';
import { MedicineRegistrationModal } from './components/medicines/MedicineRegistrationModal';
import { Database, ShieldCheck, CheckCircle } from 'lucide-react';

function MediHomeApp() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [doseStatusFilter, setDoseStatusFilter] = useState<string>('all');
  const [doseMemberFilter, setDoseMemberFilter] = useState<string>('all');
  const [refillTargetMedicineId, setRefillTargetMedicineId] = useState<string | undefined>(undefined);

  const handleNavigateToTodayDoses = (status = 'all', memberId = 'all') => {
    setDoseStatusFilter(status);
    setDoseMemberFilter(memberId);
    setCurrentTab('today-doses');
  };

  const handlePlanRefill = (medId?: string) => {
    setRefillTargetMedicineId(medId);
    setCurrentTab('refills');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Top Application Shell Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          // Reset specific filters when manually navigating
          if (tab === 'today-doses') {
            setDoseStatusFilter('all');
            setDoseMemberFilter('all');
          }
          setCurrentTab(tab);
        }}
        onOpenMedicineModal={() => setIsMedicineModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            onNavigate={(tab) => setCurrentTab(tab)}
            onFilterDosesByStatus={(status) => handleNavigateToTodayDoses(status, 'all')}
            onFilterDosesByMember={(memberId) => handleNavigateToTodayDoses('all', memberId)}
            onOpenRefillModal={handlePlanRefill}
          />
        )}

        {currentTab === 'today-doses' && (
          <TodayDosesView
            initialStatusFilter={doseStatusFilter}
            initialMemberFilter={doseMemberFilter}
          />
        )}

        {currentTab === 'medicines' && (
          <MedicinesView
            onOpenRegisterModal={() => setIsMedicineModalOpen(true)}
            onNavigateToStock={() => setCurrentTab('stock')}
          />
        )}

        {currentTab === 'stock' && (
          <StockRegisterView
            onPlanRefill={handlePlanRefill}
          />
        )}

        {currentTab === 'refills' && (
          <RefillPlanningView
            initialMedicineId={refillTargetMedicineId}
          />
        )}

        {currentTab === 'family' && (
          <FamilyMembersView
            onNavigateToMedicines={() => setCurrentTab('medicines')}
          />
        )}

        {currentTab === 'history' && (
          <HistoryAuditView />
        )}
      </main>

      {/* Quiet Clinical Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-800">MediHome</span>
              <span aria-hidden="true">·</span>
              <span>Milestone 1 Clinical Register & Stock Ledger</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-teal-700">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Synthetic Safety Guard Active</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Verbatim Instructions Enforced</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-slate-600">
                <Database className="w-3.5 h-3.5 text-slate-400" />
                <span>Planned Backend: Supabase PostgreSQL (RLS)</span>
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Medicine Registration Modal */}
      <MedicineRegistrationModal
        isOpen={isMedicineModalOpen}
        onClose={() => setIsMedicineModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <MediHomeProvider>
      <MediHomeApp />
    </MediHomeProvider>
  );
}
