import React, { useState } from 'react';
import { useMediHome } from '../../context/MediHomeContext';
import { RefillPurchaseOrder } from '../../types/refill';
import { Medicine } from '../../types/medicine';
import { Modal } from '../common/Modal';
import { CheckCircle2 } from 'lucide-react';

interface ReceiveRefillModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: RefillPurchaseOrder | null;
  medicine: Medicine | null;
}

export const ReceiveRefillModal: React.FC<ReceiveRefillModalProps> = ({
  isOpen,
  onClose,
  order,
  medicine
}) => {
  const { receiveRefillOrder } = useMediHome();

  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [receivedQuantity, setReceivedQuantity] = useState<number>(order?.totalQuantity || 30);
  const [storageLocation, setStorageLocation] = useState('Primary Drawer A');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (order) {
      setReceivedQuantity(order.totalQuantity);
      setBatchNumber(`LOT-${Date.now().toString().slice(-6)}`);
      setError('');
    }
  }, [order]);

  if (!order || !medicine) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchNumber.trim()) {
      setError('Batch / Lot number printed on the package is required for safety tracking');
      return;
    }
    if (!expiryDate) {
      setError('Expiry date is required');
      return;
    }
    if (receivedQuantity <= 0) {
      setError('Received quantity must be greater than zero');
      return;
    }

    receiveRefillOrder(
      order.id,
      batchNumber.trim(),
      expiryDate,
      receivedQuantity,
      storageLocation.trim() || undefined
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Receive Refill & Update Inventory"
      subtitle={`Verify physical receipt for ${medicine.name} ${medicine.strength}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-teal-700">Dispensing Pharmacy:</span>
            <span className="font-semibold text-teal-950">{order.pharmacyName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-teal-700">Planned Quantity:</span>
            <span className="font-mono font-semibold text-teal-950">{order.totalQuantity} {medicine.unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-teal-700">Current Stock Before Receipt:</span>
            <span className="font-mono text-teal-900">{medicine.currentStock} {medicine.unit}</span>
          </div>
        </div>

        {/* Confirmed Received Quantity */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Confirmed Received Quantity ({medicine.unit}) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            step="any"
            required
            value={receivedQuantity}
            onChange={(e) => setReceivedQuantity(parseFloat(e.target.value) || 0)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <p className="text-[11px] text-slate-500 mt-0.5">
            Will automatically increment registered stock to <strong className="font-mono">{medicine.currentStock + receivedQuantity} {medicine.unit}</strong>.
          </p>
        </div>

        {/* Batch Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Batch / Lot Number on Label <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={batchNumber}
            onChange={(e) => {
              setBatchNumber(e.target.value);
              setError('');
            }}
            placeholder="e.g. AML-99302"
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Expiry Date on Packaging <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            required
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Storage Location */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Storage Location
          </label>
          <input
            type="text"
            value={storageLocation}
            onChange={(e) => setStorageLocation(e.target.value)}
            placeholder="e.g. Primary Drawer A, Refrigerator Shelf"
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
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirm & Add to Stock</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
