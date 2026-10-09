import React, { useState } from 'react';
import { DoseRecord, DoseStatus } from '../../types/dose';
import { Medicine } from '../../types/medicine';
import { FamilyMember } from '../../types/family';
import { StatusBadge } from '../common/StatusBadge';
import { formatTime24to12, formatFoodRelation, formatDateTimePretty } from '../../utils/formatters';
import { Check, Clock, AlertTriangle, HelpCircle, X, Bell, RotateCcw } from 'lucide-react';

interface DoseCardProps {
  dose: DoseRecord;
  medicine: Medicine;
  familyMember: FamilyMember;
  onRecordStatus: (doseId: string, status: DoseStatus, options?: { reasonNotes?: string }) => void;
  onToggleReminder: (doseId: string) => void;
  onOpenCorrectionModal: (dose: DoseRecord) => void;
}

export const DoseCard: React.FC<DoseCardProps> = ({
  dose,
  medicine,
  familyMember,
  onRecordStatus,
  onToggleReminder,
  onOpenCorrectionModal
}) => {
  const [showSkipPrompt, setShowSkipPrompt] = useState(false);
  const [skipReason, setSkipReason] = useState('');

  const isTaken = dose.status === 'taken';
  const hasCorrections = dose.corrections && dose.corrections.length > 0;

  const handleSkipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRecordStatus(dose.id, 'skipped', { reasonNotes: skipReason.trim() || 'Dose skipped by patient/caregiver' });
    setShowSkipPrompt(false);
    setSkipReason('');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        {/* Top Header: Time, Member & Clinical Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col items-center justify-center w-14 py-1.5 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-800">
              <Clock className="w-3.5 h-3.5 text-slate-500 mb-0.5" />
              <span className="font-mono text-xs font-bold tabular-nums">
                {formatTime24to12(dose.scheduledTime)}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-slate-900 tracking-tight">
                  {medicine.name}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                  {medicine.strength}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <span 
                  className="w-2 h-2 rounded-full inline-block" 
                  style={{ backgroundColor: familyMember.avatarColor }}
                />
                <span className="font-medium text-slate-700">{familyMember.fullName}</span>
                <span aria-hidden="true">·</span>
                <span>{medicine.dosageForm}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={dose.status} />
            {dose.stockDeducted && (
              <span className="text-[11px] font-mono text-emerald-700">
                ✓ Inventory deducted
              </span>
            )}
          </div>
        </div>

        {/* Verbatim Prescribed Instructions Banner */}
        <div className="bg-slate-50/80 border border-slate-200/70 rounded-lg p-2.5 my-3 text-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Prescribed Instructions (Verbatim)
          </div>
          <p className="text-slate-800 italic leading-relaxed">
            "{medicine.prescribedInstructions}"
          </p>
          <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-1.5">
            <span>Dose: <strong className="font-mono text-slate-800">{dose.doseQuantity} {medicine.unit}</strong></span>
            <span aria-hidden="true">·</span>
            <span>{formatFoodRelation(medicine.schedule.foodRelation)}</span>
            {medicine.indication && (
              <>
                <span aria-hidden="true">·</span>
                <span>For: {medicine.indication}</span>
              </>
            )}
          </div>
        </div>

        {/* Clinical notes or reason if skipped / unknown */}
        {dose.reasonNotes && (
          <div className="p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-lg text-xs text-amber-900 mb-3">
            <strong className="font-medium">Clinical Reason / Log:</strong> {dose.reasonNotes}
          </div>
        )}

        {/* Historical Correction Audit Indicator */}
        {hasCorrections && (
          <div className="p-2 bg-slate-100/70 border border-slate-200 rounded text-[11px] text-slate-600 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Corrected {dose.corrections.length} time(s). Last: "{dose.corrections[0].reason}"</span>
            </span>
            <span className="font-mono text-slate-400">
              {formatDateTimePretty(dose.corrections[0].timestamp)}
            </span>
          </div>
        )}

        {/* Distinct Reminder Acknowledgment Separator */}
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 my-2">
          <div className="flex items-center gap-2 text-xs">
            <Bell className={`w-3.5 h-3.5 ${dose.reminderAcknowledgment.isAcknowledged ? 'text-teal-600' : 'text-slate-400'}`} />
            <div>
              <span className="font-medium text-slate-800">Reminder Acknowledgment:</span>
              <span className="ml-1 text-slate-500">
                {dose.reminderAcknowledgment.isAcknowledged 
                  ? `Acknowledged by ${dose.reminderAcknowledgment.acknowledgedBy || 'Caregiver'}` 
                  : 'Pending Caregiver Check'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onToggleReminder(dose.id)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              dose.reminderAcknowledgment.isAcknowledged
                ? 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {dose.reminderAcknowledgment.isAcknowledged ? 'Dismiss / Reset' : 'Acknowledge'}
          </button>
        </div>
      </div>

      {/* Administration Controls */}
      <div className="pt-3 border-t border-slate-100 mt-2 space-y-2">
        {showSkipPrompt ? (
          <form onSubmit={handleSkipSubmit} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-800">
              Clinical Reason for Skipping:
            </label>
            <input
              type="text"
              required
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              placeholder="e.g. Patient nauseous; blood test fasting; no wheezing"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSkipPrompt(false)}
                className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded"
              >
                Confirm Skip
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Quick Status Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {!isTaken && (
                <button
                  type="button"
                  onClick={() => onRecordStatus(dose.id, 'taken')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Mark Taken</span>
                </button>
              )}

              {dose.status !== 'skipped' && (
                <button
                  type="button"
                  onClick={() => setShowSkipPrompt(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Skip</span>
                </button>
              )}

              {dose.status !== 'not-taken' && (
                <button
                  type="button"
                  onClick={() => onRecordStatus(dose.id, 'not-taken', { reasonNotes: 'Dose not taken by patient' })}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Not Taken</span>
                </button>
              )}

              {dose.status !== 'unknown' && (
                <button
                  type="button"
                  onClick={() => onRecordStatus(dose.id, 'unknown', { reasonNotes: 'Status not yet verified with caregiver or school' })}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Unknown</span>
                </button>
              )}
            </div>

            {/* Historical Correction Link */}
            <button
              type="button"
              onClick={() => onOpenCorrectionModal(dose)}
              className="text-xs text-slate-500 hover:text-slate-900 underline underline-offset-2 transition-colors ml-auto"
            >
              Correct Record
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
