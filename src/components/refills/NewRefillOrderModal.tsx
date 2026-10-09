import React, { useState } from 'react';
import { useMediHome } from '../../context/MediHomeContext';
import { Medicine } from '../../types/medicine';
import { RefillPurchaseOrder } from '../../types/refill';
import { Modal } from '../common/Modal';
import { PackagePlus } from 'lucide-react';

interface NewRefillOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMedicineId?: string;
}

export const NewRefillOrderModal: React.FC<NewRefillOrderModalProps> = ({
  isOpen,
  onClose,
  defaultMedicineId
}) => {
  const { medicines, familyMembers, createRefillOrder } = useMediHome();

  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedMedicineId, setSelectedMedicineId] = useState(defaultMedicineId || (medicines[0]?.id || ''));
  const [status, setStatus] = useState<RefillPurchaseOrder['status']>('planned');
  const [rxNumber, setRxNumber] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacyPhone, setPharmacyPhone] = useState('');
  const [packSize, setPackSize] = useState<number>(30);
  const [packCount, setPackCount] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(15);
  const [plannedOrderDate, setPlannedOrderDate] = useState(todayStr);
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');

  // Update pharmacy and defaults when selected medicine changes
  const selectedMed = medicines.find(m => m.id === selectedMedicineId);

  React.useEffect(() => {
    if (selectedMed) {
      if (selectedMed.pharmacyName) {
        setPharmacyName(selectedMed.pharmacyName);
      }
      if (selectedMed.dosageForm === 'Tablet' || selectedMed.dosageForm === 'Capsule') {
        setPackSize(30);
      } else if (selectedMed.dosageForm === 'Syrup / Liquid') {
        setPackSize(100);
      } else if (selectedMed.dosageForm === 'Inhaler') {
        setPackSize(200);
      }
    }
  }, [selectedMed]);

  React.useEffect(() => {
    if (defaultMedicineId) {
      setSelectedMedicineId(defaultMedicineId);
    }
  }, [defaultMedicineId]);

  if (!selectedMed) return null;

  const totalQuantity = packSize * packCount;
  const totalCost = unitPrice * packCount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacyName.trim()) return;

    createRefillOrder({
      medicineId: selectedMed.id,
      familyMemberId: selectedMed.familyMemberId,
      status,
      prescriptionRxNumber: rxNumber.trim() || undefined,
      pharmacyName: pharmacyName.trim(),
      pharmacyPhone: pharmacyPhone.trim() || undefined,
      packSize,
      packCount,
      totalQuantity,
      unit: selectedMed.unit,
      unitPrice,
      totalCost,
      plannedOrderDate,
      expectedDate: expectedDate || undefined,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Plan / Order Medication Refill"
      subtitle="Schedule prescription replenishment with pharmacy"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Medicine Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Target Prescription <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedMedicineId}
            onChange={(e) => setSelectedMedicineId(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            {medicines.map((m) => {
              const member = familyMembers.find(f => f.id === m.familyMemberId);
              return (
                <option key={m.id} value={m.id}>
                  {m.name} {m.strength} (for {member?.fullName} - Current stock: {m.currentStock} {m.unit})
                </option>
              );
            })}
          </select>
        </div>

        {/* Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Refill Stage
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RefillPurchaseOrder['status'])}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="planned">Planned (Draft)</option>
              <option value="ordered">Ordered (Submitted to Pharmacy)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Prescription Rx Number (Optional)
            </label>
            <input
              type="text"
              value={rxNumber}
              onChange={(e) => setRxNumber(e.target.value)}
              placeholder="e.g. RX-992140-01"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
          </div>
        </div>

        {/* Pharmacy Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Pharmacy / Dispenser Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={pharmacyName}
              onChange={(e) => setPharmacyName(e.target.value)}
              placeholder="e.g. Walgreens #4192, CVS Pharmacy"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Pharmacy Contact Phone
            </label>
            <input
              type="tel"
              value={pharmacyPhone}
              onChange={(e) => setPharmacyPhone(e.target.value)}
              placeholder="(555) 000-0000"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Quantities & Pricing */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div>
            <label className="block text-[11px] font-semibold text-slate-800 mb-1">
              Pack Size ({selectedMed.unit})
            </label>
            <input
              type="number"
              min="1"
              value={packSize}
              onChange={(e) => setPackSize(parseFloat(e.target.value) || 1)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-800 mb-1">
              Pack Count
            </label>
            <input
              type="number"
              min="1"
              value={packCount}
              onChange={(e) => setPackCount(parseInt(e.target.value) || 1)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-800 mb-1">
              Estimated Unit Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={unitPrice}
              onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono bg-white"
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-xs px-3 py-2 bg-slate-100 rounded-lg font-mono">
          <span className="text-slate-600 font-sans">Total Replenishment:</span>
          <span className="font-bold text-slate-900">
            {totalQuantity} {selectedMed.unit} (Est. ${totalCost.toFixed(2)})
          </span>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Order Date
            </label>
            <input
              type="date"
              required
              value={plannedOrderDate}
              onChange={(e) => setPlannedOrderDate(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Expected Delivery / Pickup Date
            </label>
            <input
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Notes / Pharmacy Instructions
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Inquire about manufacturer coupon or 90-day supply option"
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
            <PackagePlus className="w-3.5 h-3.5" />
            <span>Record Refill Order</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
