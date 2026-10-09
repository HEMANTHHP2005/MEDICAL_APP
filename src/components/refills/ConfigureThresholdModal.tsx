import React, { useState } from 'react';
import { useMediHome } from '../../context/MediHomeContext';
import { Medicine } from '../../types/medicine';
import { Modal } from '../common/Modal';
import { Sliders } from 'lucide-react';

interface ConfigureThresholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
}

export const ConfigureThresholdModal: React.FC<ConfigureThresholdModalProps> = ({
  isOpen,
  onClose,
  medicine
}) => {
  const { updateMedicineThresholds } = useMediHome();

  const [threshold, setThreshold] = useState<number>(medicine?.reorderThreshold || 10);
  const [safetyBuffer, setSafetyBuffer] = useState<number>(medicine?.safetyBufferDays || 7);
  const [leadTime, setLeadTime] = useState<number>(3);

  React.useEffect(() => {
    if (medicine) {
      setThreshold(medicine.reorderThreshold);
      setSafetyBuffer(medicine.safetyBufferDays);
    }
  }, [medicine]);

  if (!medicine) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMedicineThresholds({
      medicineId: medicine.id,
      reorderThreshold: threshold,
      safetyBufferDays: safetyBuffer,
      leadTimeDays: leadTime
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Refill Thresholds"
      subtitle={`Set replenishment buffer rules for ${medicine.name} ${medicine.strength}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Minimum Stock Reorder Threshold ({medicine.unit})
          </label>
          <input
            type="number"
            min="1"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value) || 1)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            When available inventory drops to or below this count, a refill alert is flagged.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Safety Stock Buffer (Days of Supply)
          </label>
          <input
            type="number"
            min="1"
            value={safetyBuffer}
            onChange={(e) => setSafetyBuffer(parseInt(e.target.value) || 1)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Minimum days of medication reserves to prevent interruption during pharmacy processing.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Estimated Pharmacy Fulfillment Lead Time (Days)
          </label>
          <input
            type="number"
            min="0"
            value={leadTime}
            onChange={(e) => setLeadTime(parseInt(e.target.value) || 0)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
          />
        </div>

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
            <Sliders className="w-3.5 h-3.5" />
            <span>Update Thresholds</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
