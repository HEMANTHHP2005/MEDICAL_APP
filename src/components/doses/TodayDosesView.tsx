import React, { useState, useMemo } from 'react';
import { useMediHome } from '../../context/MediHomeContext';
import { DoseCard } from './DoseCard';
import { DoseCorrectionModal } from './DoseCorrectionModal';
import { DoseRecord, DoseStatus } from '../../types/dose';
import { EmptyState } from '../common/EmptyState';
import { Search, Calendar, Filter } from 'lucide-react';

interface TodayDosesViewProps {
  initialStatusFilter?: string;
  initialMemberFilter?: string;
}

export const TodayDosesView: React.FC<TodayDosesViewProps> = ({
  initialStatusFilter = 'all',
  initialMemberFilter = 'all'
}) => {
  const { doses, medicines, familyMembers, recordDoseStatus, correctDoseStatus, toggleReminderAcknowledgment, activeCaregiver } = useMediHome();

  const [selectedMember, setSelectedMember] = useState<string>(initialMemberFilter);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatusFilter);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [correctionTargetDose, setCorrectionTargetDose] = useState<DoseRecord | null>(null);

  const filteredDoses = useMemo(() => {
    return doses.filter(dose => {
      const med = medicines.find(m => m.id === dose.medicineId);
      const member = familyMembers.find(f => f.id === dose.familyMemberId);

      // Filter by Member
      if (selectedMember !== 'all' && dose.familyMemberId !== selectedMember) {
        return false;
      }

      // Filter by Status
      if (selectedStatus !== 'all' && dose.status !== selectedStatus) {
        return false;
      }

      // Filter by search query (medicine name, doctor, indication, member name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesMed = med?.name.toLowerCase().includes(q) || med?.brandName?.toLowerCase().includes(q);
        const matchesMember = member?.fullName.toLowerCase().includes(q);
        const matchesIndication = med?.indication?.toLowerCase().includes(q);
        if (!matchesMed && !matchesMember && !matchesIndication) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [doses, medicines, familyMembers, selectedMember, selectedStatus, searchQuery]);

  const targetMed = correctionTargetDose 
    ? medicines.find(m => m.id === correctionTargetDose.medicineId) || null 
    : null;
  const targetMember = correctionTargetDose 
    ? familyMembers.find(f => f.id === correctionTargetDose.familyMemberId) || null 
    : null;

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Today's Daily Dose List</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live scheduled administration tracking with distinct clinical states and audit controls
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>Today's Roster: {new Date().toISOString().split('T')[0]}</span>
          </div>
        </div>

        {/* Filter Controls (Segmented Tabs & Search) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-slate-100">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medication, member or indication..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
            />
          </div>

          {/* Member Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-700"
            >
              <option value="all">All Family Members ({familyMembers.length})</option>
              {familyMembers.map(m => (
                <option key={m.id} value={m.id}>{m.fullName} ({m.relationship})</option>
              ))}
            </select>
          </div>

          {/* Status Filter Tabs (Button-based segmented control) */}
          <div className="md:col-span-5 flex items-center gap-1 overflow-x-auto bg-slate-100 p-1 rounded-lg">
            {[
              { id: 'all', label: 'All' },
              { id: 'scheduled', label: 'Scheduled' },
              { id: 'taken', label: 'Taken' },
              { id: 'skipped', label: 'Skipped' },
              { id: 'not-taken', label: 'Not Taken' },
              { id: 'unknown', label: 'Unknown' },
            ].map(tab => {
              const isActive = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Doses Grid */}
      {filteredDoses.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No Doses Match Current Filter"
          description="Try resetting your family member filter or status selection to view all scheduled doses for today."
          action={{
            label: "Reset All Filters",
            onClick: () => {
              setSelectedMember('all');
              setSelectedStatus('all');
              setSearchQuery('');
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoses.map(dose => {
            const med = medicines.find(m => m.id === dose.medicineId);
            const member = familyMembers.find(f => f.id === dose.familyMemberId);
            if (!med || !member) return null;

            return (
              <DoseCard
                key={dose.id}
                dose={dose}
                medicine={med}
                familyMember={member}
                onRecordStatus={recordDoseStatus}
                onToggleReminder={toggleReminderAcknowledgment}
                onOpenCorrectionModal={(d) => setCorrectionTargetDose(d)}
              />
            );
          })}
        </div>
      )}

      {/* Historical Correction Modal */}
      <DoseCorrectionModal
        isOpen={!!correctionTargetDose}
        onClose={() => setCorrectionTargetDose(null)}
        dose={correctionTargetDose}
        medicine={targetMed}
        familyMember={targetMember}
        onSaveCorrection={correctDoseStatus}
        defaultCaregiver={activeCaregiver}
      />
    </div>
  );
};
