import React from 'react';
import { Pill, Plus, UserPlus, UserCheck } from 'lucide-react';
import { useMediHome } from '../../context/MediHomeContext';

export type NavigationTab = 
  | 'dashboard' 
  | 'today-doses' 
  | 'medicines' 
  | 'stock' 
  | 'refills' 
  | 'history' 
  | 'family';

interface HeaderProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenMedicineModal: () => void;
  onOpenFamilyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenMedicineModal,
  onOpenFamilyModal
}) => {
  const { familyMembers, activeCaregiver, setActiveCaregiver, isDemoMode, startFreshHousehold, loadDemoData } = useMediHome();

  const navLinks: { id: NavigationTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'today-doses', label: "Today's Doses" },
    { id: 'medicines', label: 'Medicines' },
    { id: 'stock', label: 'Stock Register' },
    { id: 'refills', label: 'Refill Planning' },
    { id: 'history', label: 'History' },
    { id: 'family', label: 'Family' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      {/* Primary Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (Clean single-line links) — Zone 3 (Caregiver + Primary Action) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          
          {/* Zone 1: Single element brand wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Pill className="w-4 h-4 stroke-[2.2]" />
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('dashboard')}
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap hover:opacity-90 transition-opacity"
            >
              MediHome
            </button>
          </div>

          {/* Zone 2: Navigation Links (single-line, subtle text styling) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Caregiver Switcher & Primary Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Active Caregiver Context */}
            {familyMembers.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5">
                <UserCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <label htmlFor="caregiver-select" className="sr-only">Active Caregiver</label>
                <select
                  id="caregiver-select"
                  value={activeCaregiver}
                  onChange={(e) => setActiveCaregiver(e.target.value)}
                  className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer max-w-[130px] truncate"
                >
                  {familyMembers.map((m) => (
                    <option key={m.id} value={`${m.fullName} (${m.relationship})`}>
                      {m.fullName} ({m.relationship})
                    </option>
                  ))}
                  <option value="Visiting Nurse / Health Aide">Visiting Nurse / Aide</option>
                </select>
              </div>
            )}

            {/* Add Family Member Button */}
            <button
              type="button"
              onClick={onOpenFamilyModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5 text-slate-600" />
              <span>+ Member</span>
            </button>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={onOpenMedicineModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Medicine</span>
            </button>
          </div>
        </div>

        {/* Mobile / Compact Subnav Strip */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {navLinks.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
