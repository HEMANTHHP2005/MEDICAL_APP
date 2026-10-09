import React from 'react';
import { useMediHome } from '../../context/MediHomeContext';
import { Medicine } from '../../types/medicine';
import { Modal } from '../common/Modal';
import { formatDateTimePretty } from '../../utils/formatters';
import { History, ArrowUpRight, ArrowDownRight, RotateCcw } from 'lucide-react';

interface StockTransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
}

export const StockTransactionHistoryModal: React.FC<StockTransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  medicine
}) => {
  const { stockTransactions, medicines, familyMembers } = useMediHome();

  if (!medicine) return null;

  const transactions = stockTransactions.filter(t => t.medicineId === medicine.id);
  const member = familyMembers.find(f => f.id === medicine.familyMemberId);

  const formatTxType = (type: string) => {
    switch (type) {
      case 'initial_intake': return 'Initial Stock Intake';
      case 'dose_deduction': return 'Dose Administration Deduction';
      case 'refill_receipt': return 'Refill Delivery Receipt';
      case 'correction_reversal': return 'Historical Correction Reversal';
      case 'correction_deduction': return 'Retroactive Dose Deduction';
      case 'discrepancy_adjustment': return 'Physical Count Adjustment';
      case 'expired_discard': return 'Expired Stock Discard';
      default: return type;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stock Transaction Audit History"
      subtitle={`Complete inventory ledger for ${medicine.name} ${medicine.strength} (${member?.fullName})`}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Header Summary */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Current Balance:</span>
            <span className="font-mono font-bold text-sm text-slate-900">{medicine.currentStock} {medicine.unit}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Reorder Threshold:</span>
            <span className="font-mono font-semibold text-slate-700">{medicine.reorderThreshold} {medicine.unit}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Total Transactions:</span>
            <span className="font-mono font-semibold text-slate-700">{transactions.length} entries</span>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Delta</th>
                  <th className="py-2.5 px-3 text-right">Running Balance</th>
                  <th className="py-2.5 px-3">Batch</th>
                  <th className="py-2.5 px-3">Performer & Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                      No transactions recorded yet for this medication.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isPositive = tx.quantityDelta > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-600 tabular-nums">
                          {formatDateTimePretty(tx.timestamp)}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-medium text-slate-800">
                            {formatTxType(tx.type)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-right font-mono font-bold tabular-nums">
                          <span className={isPositive ? 'text-emerald-700' : 'text-slate-800'}>
                            {isPositive ? `+${tx.quantityDelta}` : tx.quantityDelta} {medicine.unit}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-right font-mono font-semibold text-slate-900 tabular-nums">
                          {tx.balanceAfter} {medicine.unit}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-600">
                          {tx.batchNumber || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 min-w-[200px]">
                          <div>
                            <span className="font-semibold text-slate-900">{tx.performedBy}</span>: {tx.reason}
                          </div>
                          {tx.notes && (
                            <div className="text-[11px] text-slate-400 italic mt-0.5">{tx.notes}</div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </Modal>
  );
};
