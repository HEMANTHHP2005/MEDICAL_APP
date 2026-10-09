import React from 'react';
import { useMediHome } from '../../context/MediHomeContext';
import { formatTime24to12, formatFoodRelation } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { Clock, Check, Bell } from 'lucide-react';

interface UpcomingSchedulesProps {
  onViewAllDoses: () => void;
}

export const UpcomingSchedules: React.FC<UpcomingSchedulesProps> = ({ onViewAllDoses }) => {
  const { doses, medicines, familyMembers, recordDoseStatus, toggleReminderAcknowledgment } = useMediHome();

  // Sort doses chronologically
  const sortedDoses = [...doses].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  // Display the next 4 pending or recent doses
  const displayDoses = sortedDoses.slice(0, 5);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">Today's Schedule Sequence</h2>
          <p className="text-xs text-slate-500 mt-0.5">Chronological dosage lineup for the household</p>
        </div>
        <button
          type="button"
          onClick={onViewAllDoses}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
        >
          View All Today ({doses.length})
        </button>
      </div>

      <div className="space-y-3">
        {displayDoses.map((dose) => {
          const med = medicines.find(m => m.id === dose.medicineId);
          const member = familyMembers.find(f => f.id === dose.familyMemberId);
          if (!med) return null;

          const isTaken = dose.status === 'taken';

          return (
            <div
              key={dose.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border transition-colors ${
                isTaken 
                  ? 'bg-slate-50/60 border-slate-200/60 opacity-80' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Time Badge */}
                <div className="flex flex-col items-center justify-center w-14 py-1.5 rounded-md bg-slate-100 text-slate-700 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-slate-500 mb-0.5" />
                  <span className="font-mono text-xs font-semibold tabular-nums text-slate-900">
                    {formatTime24to12(dose.scheduledTime)}
                  </span>
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900">
                      {med.name} {med.strength}
                    </span>
                    <span 
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: `${member?.avatarColor}15` || '#f1f5f9', 
                        color: member?.avatarColor || '#334155' 
                      }}
                    >
                      {member?.fullName}
                    </span>
                    <StatusBadge status={dose.status} />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                    <span>Dose: <strong className="font-mono text-slate-700">{dose.doseQuantity} {med.unit}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>{formatFoodRelation(med.schedule.foodRelation)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="italic truncate max-w-xs">{med.prescribedInstructions}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {/* Separate Reminder Acknowledgment toggle */}
                <button
                  type="button"
                  onClick={() => toggleReminderAcknowledgment(dose.id)}
                  title={dose.reminderAcknowledgment.isAcknowledged ? 'Reminder acknowledged' : 'Acknowledge reminder alert'}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                    dose.reminderAcknowledgment.isAcknowledged
                      ? 'bg-teal-50 border-teal-200 text-teal-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{dose.reminderAcknowledgment.isAcknowledged ? 'Ack’d' : 'Ack Reminder'}</span>
                </button>

                {/* Mark Taken (Only if not already taken) */}
                {!isTaken ? (
                  <button
                    type="button"
                    onClick={() => recordDoseStatus(dose.id, 'taken')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Take Dose</span>
                  </button>
                ) : (
                  <span className="text-xs text-emerald-700 font-medium px-2 py-1">
                    Administered
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
