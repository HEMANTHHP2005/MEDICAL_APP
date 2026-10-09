import React from 'react';
import { useMediHome } from '../../context/MediHomeContext';
import { calculateAge } from '../../utils/formatters';
import { ShieldAlert, ArrowRight, User } from 'lucide-react';

interface FamilySummariesProps {
  onSelectMember: (memberId: string) => void;
  onManageFamily: () => void;
}

export const FamilySummaries: React.FC<FamilySummariesProps> = ({ onSelectMember, onManageFamily }) => {
  const { familyMembers, medicines, doses } = useMediHome();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">Family Profiles & Regimens</h2>
          <p className="text-xs text-slate-500">Individual member medication tracking and clinical notes</p>
        </div>
        <button
          type="button"
          onClick={onManageFamily}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
        >
          <span>Manage Family</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {familyMembers.map((member) => {
          const memberMeds = medicines.filter(m => m.familyMemberId === member.id && m.isActive);
          const memberDosesToday = doses.filter(d => d.familyMemberId === member.id);
          const takenToday = memberDosesToday.filter(d => d.status === 'taken').length;
          const age = calculateAge(member.dateOfBirth);

          const hasAllergies = member.allergies && member.allergies.length > 0 && member.allergies[0] !== 'None known';

          return (
            <div
              key={member.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-xs"
                    style={{ backgroundColor: member.avatarColor }}
                  >
                    {member.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{member.fullName}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <span>{member.relationship}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{age} yrs</span>
                    </div>
                  </div>
                </div>

                {/* Regimen stats */}
                <div className="space-y-1.5 text-xs text-slate-600 py-2 border-t border-b border-slate-100 my-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Active Prescriptions:</span>
                    <span className="font-semibold text-slate-900 font-mono tabular-nums">{memberMeds.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Today's Adherence:</span>
                    <span className="font-semibold text-slate-900 font-mono tabular-nums">
                      {takenToday} / {memberDosesToday.length} taken
                    </span>
                  </div>
                </div>

                {/* Allergies banner if any */}
                {hasAllergies && (
                  <div className="flex items-start gap-1.5 p-2 rounded bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 mb-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      <strong className="font-medium">Allergy:</strong> {member.allergies.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={() => onSelectMember(member.id)}
                className="mt-2 w-full py-1.5 px-3 text-xs font-medium rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter Member Doses</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
