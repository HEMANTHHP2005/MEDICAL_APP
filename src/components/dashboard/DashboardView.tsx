import React from 'react';
import { DoseStatusBar } from './DoseStatusBar';
import { UpcomingSchedules } from './UpcomingSchedules';
import { LowStockAlerts } from './LowStockAlerts';
import { FamilySummaries } from './FamilySummaries';
import { NavigationTab } from '../shell/Header';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onFilterDosesByStatus?: (status: string) => void;
  onFilterDosesByMember?: (memberId: string) => void;
  onOpenRefillModal: (medicineId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onFilterDosesByStatus,
  onFilterDosesByMember,
  onOpenRefillModal
}) => {
  return (
    <div className="space-y-6">
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
      />
    </div>
  );
};
