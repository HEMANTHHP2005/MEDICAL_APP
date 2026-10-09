import React, { useState } from 'react';
import { DoseRecord, DoseStatus } from '../../types/dose';
import { Medicine } from '../../types/medicine';
import { FamilyMember } from '../../types/family';
import { Modal } from '../common/Modal';
import { validateDoseCorrection } from '../../utils/validation';
import { formatTime24to12 } from '../../utils/formatters';
import { AlertCircle, History, RotateCcw } from 'lucide-react';

interface DoseCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dose: DoseRecord | null;
  medicine: Medicine | null;
  familyMember: FamilyMember | null;
  onSaveCorrection: (
    doseId: string,
    newStatus: DoseStatus,
    reason: string,
    performedBy: string,
    notes?: string
  ) => void;
  defaultCaregiver: string;
}

export const DoseCorrectionModal: React.FC<DoseCorrectionModalProps> = ({
  isOpen,
  onClose,
  dose,
  medicine,
  familyMember,
  onSaveCorrection,
  defaultCaregiver
}) => {
  const [newStatus, setNewStatus] = useState<DoseStatus>(dose?.status || 'taken');
  const [reason, setReason] = useState('');
  const [performedBy, setPerformedBy] = useState(defaultCaregiver);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset when dose changes
  React.useEffect(() => {
    if (dose) {
      setNewStatus(dose.status);
      setReason('');
      setNotes('');
      setErrors({});
      setPerformedBy(defaultCaregiver);
    }
  }, [dose, defaultCaregiver]);

  if (!dose || !medicine) return null;

  // Determine stock implications
  const willReverseStock = dose.stockDeducted && newStatus !== 'taken';
  const willDeductStock = !dose.stockDeducted && newStatus === 'taken';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateDoseCorrection(reason, performedBy);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (newStatus === dose.status) {
      setErrors({ newStatus: 'Please choose a different status for this correction' });
      return;
    }

    onSaveCorrection(dose.id, newStatus, reason.trim(), performedBy.trim(), notes.trim());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Correct Historical Dose Record"
      subtitle="Preserve clinical audit integrity and adjust inventory deductions"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Context Summary */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Medication:</span>
            <span className="font-semibold text-slate-900">{medicine.name} {medicine.strength}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Family Member:</span>
            <span className="font-medium text-slate-800">{familyMember?.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Scheduled:</span>
            <span className="font-mono text-slate-700">{dose.scheduledDate} at {formatTime24to12(dose.scheduledTime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Current Recorded Status:</span>
            <span className="font-semibold uppercase text-slate-900">{dose.status}</span>
          </div>
        </div>

        {/* New Status Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Corrected Status <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(['scheduled', 'taken', 'skipped', 'not-taken', 'unknown'] as DoseStatus[]).map((statusKey) => (
              <button
                key={statusKey}
                type="button"
                onClick={() => {
                  setNewStatus(statusKey);
                  if (errors.newStatus) setErrors({ ...errors, newStatus: '' });
                }}
                className={`py-2 px-2.5 text-xs font-medium rounded-lg border text-center capitalize transition-colors ${
                  newStatus === statusKey
                    ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold ring-1 ring-teal-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {statusKey}
              </button>
            ))}
          </div>
          {errors.newStatus && (
            <p className="text-xs text-rose-600 mt-1">{errors.newStatus}</p>
          )}
        </div>

        {/* Inventory Impact Notice */}
        {willReverseStock && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-900">
            <RotateCcw className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Stock Reversal Trigger:</strong> This dose had previously deducted{' '}
              <span className="font-mono">{dose.doseQuantity} {medicine.unit}</span>. Changing status from Taken to {newStatus} will automatically credit{' '}
              <span className="font-mono">{dose.doseQuantity} {medicine.unit}</span> back into the inventory register.
            </div>
          </div>
        )}

        {willDeductStock && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2 text-xs text-blue-900">
            <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <strong>Stock Deduction Trigger:</strong> Marking this dose as Taken retroactively will deduct{' '}
              <span className="font-mono">{dose.doseQuantity} {medicine.unit}</span> from the inventory register.
            </div>
          </div>
        )}

        {/* Reason (Strictly Required) */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Clinical Reason for Correction <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (errors.reason) setErrors({ ...errors, reason: '' });
            }}
            placeholder="e.g. Fasting for blood test; patient refused dose due to dizziness"
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {errors.reason && (
            <p className="text-xs text-rose-600 mt-1">{errors.reason}</p>
          )}
          <p className="text-[11px] text-slate-500 mt-0.5">
            This reason will be permanently archived in the historical audit log.
          </p>
        </div>

        {/* Caregiver Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Corrected By (Caregiver / Authorizer) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={performedBy}
            onChange={(e) => {
              setPerformedBy(e.target.value);
              if (errors.performedBy) setErrors({ ...errors, performedBy: '' });
            }}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {errors.performedBy && (
            <p className="text-xs text-rose-600 mt-1">{errors.performedBy}</p>
          )}
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Additional Clinical Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Physician consultation notes or follow-up observations"
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>Save Historical Correction</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
