import React, { useState } from 'react';
import { useMediHome } from '../../context/MediHomeContext';
import { FamilyMember } from '../../types/family';
import { FamilyMemberModal } from './FamilyMemberModal';
import { calculateAge, formatDatePretty } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';
import {
  Users,
  UserPlus,
  ShieldAlert,
  Phone,
  Building,
  HeartHandshake,
  Pill,
  Edit
} from 'lucide-react';

interface FamilyMembersViewProps {
  onNavigateToMedicines: () => void;
}

export const FamilyMembersView: React.FC<FamilyMembersViewProps> = ({ onNavigateToMedicines }) => {
  const { familyMembers, medicines } = useMediHome();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  const handleOpenAdd = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Family Members & Patient Profiles</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Household health profiles, allergies, attending physicians, and emergency contacts
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Family Member</span>
          </button>
        </div>
      </div>

      {/* Profiles Grid */}
      {familyMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Family Members Registered"
          description="Register household family members to assign prescriptions and track daily dosage schedules."
          action={{
            label: "Add Family Member",
            onClick: handleOpenAdd
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {familyMembers.map((member) => {
            const memberMeds = medicines.filter(m => m.familyMemberId === member.id && m.isActive);
            const age = calculateAge(member.dateOfBirth);
            const hasAllergies = member.allergies && member.allergies.length > 0 && member.allergies[0] !== 'None known';

            return (
              <div
                key={member.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0 shadow-xs"
                        style={{ backgroundColor: member.avatarColor }}
                      >
                        {member.fullName.charAt(0)}
                      </div>

                      <div>
                        <h2 className="text-base font-bold text-slate-900 tracking-tight">
                          {member.fullName}
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                            {member.relationship}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{age} years old</span>
                          <span aria-hidden="true">·</span>
                          <span>Born {formatDatePretty(member.dateOfBirth)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(member)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Profile"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Allergy Alert */}
                  {hasAllergies && (
                    <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold">Recorded Allergies:</strong>{' '}
                        {member.allergies.join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <HeartHandshake className="w-3 h-3 text-rose-600" />
                      <span>Emergency Contact</span>
                    </div>
                    <div className="font-semibold text-slate-800">
                      {member.emergencyContact.name} ({member.emergencyContact.relationship})
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 font-mono">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{member.emergencyContact.phone}</span>
                    </div>
                  </div>

                  {/* Primary Doctor if available */}
                  {member.primaryDoctor && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Building className="w-3 h-3 text-teal-600" />
                        <span>Primary Care Physician</span>
                      </div>
                      <div className="font-semibold text-slate-800">
                        {member.primaryDoctor.name}
                      </div>
                      <div className="text-slate-600">
                        {member.primaryDoctor.clinic}
                        {member.primaryDoctor.phone && (
                          <span className="font-mono text-slate-500 ml-2">({member.primaryDoctor.phone})</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes if any */}
                  {member.notes && (
                    <div className="text-xs text-slate-600 italic bg-white p-2.5 rounded border border-slate-100">
                      "{member.notes}"
                    </div>
                  )}
                </div>

                {/* Footer with Active Prescriptions count */}
                <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Pill className="w-3.5 h-3.5 text-slate-400" />
                    <span>Active Regimens: <strong className="font-mono font-bold text-slate-900">{memberMeds.length}</strong></span>
                  </div>

                  <button
                    type="button"
                    onClick={onNavigateToMedicines}
                    className="text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    View Prescriptions →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Profile Modal */}
      <FamilyMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        memberToEdit={editingMember}
      />
    </div>
  );
};
