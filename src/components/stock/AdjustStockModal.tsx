import React, { useState } from 'react';
import { useMediHome } from '../../context/MediHomeContext';
import { Medicine } from '../../types/medicine';
import { Modal } from '../common/Modal';
import { Package, RotateCcw } from 'lucide-react';

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
}

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
  isOpen,
  onClose,
  medicine
}) => {
  const { adjustStockQuantity, stockBatches, activeCaregiver } = useMediHome();

  const [delta, setDelta] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!medicine) return null;

  const batches = stockBatches.filter(b => b.medicineId === medicine.id);
  const projectedBalance = Math.max(0, medicine.currentStock + delta);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (delta === 0) {
      setError('Adjustment amount cannot be zero');
      return;
    }
    if (!reason.trim() || reason.trim().length < 3) {
      setError('Please provide a specific clinical reason for the manual inventory adjustment');
      return;
    }

    adjustStockQuantity(
      medicine.id,
      delta,
      reason.trim(),
      selectedBatchId || undefined,
      notes.trim() || undefined
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Physical Inventory"
      subtitle={`Manual count correction for ${medicine.name} ${medicine.strength}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current State */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Current Registered Stock:</span>
            <span className="font-bold text-slate-900">{medicine.currentStock} {medicine.unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Projected Balance:</span>
            <span className={`font-bold ${projectedBalance < medicine.reorderThreshold ? 'text-amber-600' : 'text-slate-900'}`}>
              {projectedBalance} {medicine.unit}
            </span>
          </div>
        </div>

        {/* Delta Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Quantity Adjustment Delta ({medicine.unit}) <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="any"
              value={delta}
              onChange={(e) => {
                setDelta(parseFloat(e.target.value) || 0);
                setError('');
              }}
              placeholder="e.g. +5 for found pack, -1 for dropped pill"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Enter a positive number to add stock, or a negative number (e.g. -2) to deduct damaged/lost units.
          </p>
        </div>

        {/* Optional Batch Selection */}
        {batches.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Apply to Specific Batch (Optional)
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">No specific batch (general adjustment)</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  Batch #{b.batchNumber} (Current: {b.currentQuantity} {medicine.unit}, Exp: {b.expiryDate})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reason (Mandatory for audit trail) */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Clinical Reason for Adjustment <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError('');
            }}
            placeholder="e.g. Dropped tablet on floor; Physical recount after medicine drawer reorganization"
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Internal Caregiver Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes for inventory reconciliation"
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {error && (
          <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
            {error}
          </p>
        )}

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
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Commit Inventory Adjustment</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
