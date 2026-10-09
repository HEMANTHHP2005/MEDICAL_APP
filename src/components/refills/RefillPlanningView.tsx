import React, { useState } from 'react';
import { useMediHome } from '../../context/MediHomeContext';
import { StatusBadge } from '../common/StatusBadge';
import { ConfigureThresholdModal } from './ConfigureThresholdModal';
import { NewRefillOrderModal } from './NewRefillOrderModal';
import { ReceiveRefillModal } from './ReceiveRefillModal';
import { Medicine } from '../../types/medicine';
import { RefillPurchaseOrder } from '../../types/refill';
import { formatDatePretty } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';
import {
  PackagePlus,
  Sliders,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Truck,
  ShoppingCart
} from 'lucide-react';

interface RefillPlanningViewProps {
  initialMedicineId?: string;
}

export const RefillPlanningView: React.FC<RefillPlanningViewProps> = ({ initialMedicineId }) => {
  const { refillOrders, stockSummaries, medicines, familyMembers, updateRefillOrderStatus } = useMediHome();

  // Modals
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(!!initialMedicineId);
  const [newOrderMedicineId, setNewOrderMedicineId] = useState<string | undefined>(initialMedicineId);
  const [thresholdTargetMed, setThresholdTargetMed] = useState<Medicine | null>(null);
  const [receivingOrder, setReceivingOrder] = useState<RefillPurchaseOrder | null>(null);

  const receivingMed = receivingOrder 
    ? medicines.find(m => m.id === receivingOrder.medicineId) || null 
    : null;

  // Filter urgent replenishment needs
  const urgentItems = stockSummaries.filter(s => s.status === 'critical' || s.status === 'low' || s.status === 'depleted');

  return (
    <div className="space-y-6">
      {/* Header and Quick Stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Refill Planning & Purchase Orders</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Stock burn-rate forecasting, lead-time buffering, and pharmacy order tracking
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setNewOrderMedicineId(undefined);
              setIsNewOrderModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <PackagePlus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Refill Order</span>
          </button>
        </div>

        {/* Forecast Summary Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">Replenishments Needed Soon:</span>
            <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
              {urgentItems.length}{' '}
              <span className="text-xs font-normal text-slate-500 font-sans">prescriptions</span>
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">Active Refills in Transit:</span>
            <span className="font-mono text-xl font-bold text-blue-700 tabular-nums">
              {refillOrders.filter(o => o.status === 'ordered').length}{' '}
              <span className="text-xs font-normal text-slate-500 font-sans">orders placed</span>
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">Fulfilled Refills This Month:</span>
            <span className="font-mono text-xl font-bold text-emerald-700 tabular-nums">
              {refillOrders.filter(o => o.status === 'received').length}{' '}
              <span className="text-xs font-normal text-slate-500 font-sans">received</span>
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Replenishment Urgency Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Prescription Burn Rates & Thresholds</h2>
            <p className="text-xs text-slate-500">Configurable safety buffer days and runout calculations</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
          {stockSummaries.map((item) => {
            const med = medicines.find(m => m.id === item.medicineId);
            if (!med) return null;

            return (
              <div
                key={item.medicineId}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">
                      {item.medicineName} {item.strength}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({item.familyMemberName})
                    </span>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 font-mono tabular-nums flex-wrap">
                    <span>Current Stock: <strong className="text-slate-900">{item.currentStock} {item.unit}</strong></span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>Burn Rate: <strong className="text-slate-900">{item.dailyBurnRate} {item.unit}/day</strong></span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>Safety Buffer: <strong className="text-slate-900">{item.safetyBufferDays} days</strong> (Min: {item.reorderThreshold})</span>
                    {item.estimatedRunoutDate && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-amber-800 font-semibold">Exhausts: ~{item.estimatedRunoutDate}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setThresholdTargetMed(med)}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-500" />
                    <span>Configure Buffer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewOrderMedicineId(item.medicineId);
                      setIsNewOrderModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                  >
                    <PackagePlus className="w-3.5 h-3.5" />
                    <span>Plan Refill</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Refill Purchase Orders Ledger */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Refill Purchase Orders</h2>
            <p className="text-xs text-slate-500">Pharmacy records, order stages and physical delivery receipts</p>
          </div>
        </div>

        {refillOrders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No Refill Orders Recorded"
            description="Start planning a pharmacy refill order when medications approach their safety stock buffer."
            action={{
              label: "Create Refill Order",
              onClick: () => setIsNewOrderModalOpen(true)
            }}
          />
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Order Status</th>
                    <th className="py-2.5 px-3">Prescription & Patient</th>
                    <th className="py-2.5 px-3">Pharmacy & Rx#</th>
                    <th className="py-2.5 px-3 text-right">Quantity & Unit</th>
                    <th className="py-2.5 px-3 text-right">Est. Cost</th>
                    <th className="py-2.5 px-3">Order Date / Expected</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {refillOrders.map((order) => {
                    const med = medicines.find(m => m.id === order.medicineId);
                    const member = familyMembers.find(f => f.id === order.familyMemberId);

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 whitespace-nowrap">
                          <StatusBadge status={order.status} />
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">
                            {med ? `${med.name} ${med.strength}` : 'Medication'}
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            {member?.fullName}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="text-slate-800 font-medium">{order.pharmacyName}</div>
                          <div className="text-slate-400 font-mono text-[11px]">
                            {order.prescriptionRxNumber || 'No Rx# recorded'}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {order.totalQuantity} {order.unit}
                          <div className="text-[11px] text-slate-400 font-normal">
                            ({order.packCount} x {order.packSize})
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-slate-700 tabular-nums">
                          {order.totalCost ? `$${order.totalCost.toFixed(2)}` : '—'}
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-600 tabular-nums whitespace-nowrap">
                          <div>Ordered: {formatDatePretty(order.plannedOrderDate)}</div>
                          {order.expectedDate && (
                            <div className="text-slate-400 text-[11px]">
                              Expected: {formatDatePretty(order.expectedDate)}
                            </div>
                          )}
                          {order.receivedDate && (
                            <div className="text-emerald-700 text-[11px] font-semibold">
                              Received: {formatDatePretty(order.receivedDate)}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {order.status === 'planned' && (
                              <button
                                type="button"
                                onClick={() => updateRefillOrderStatus(order.id, 'ordered')}
                                className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                              >
                                Mark Ordered
                              </button>
                            )}

                            {order.status === 'ordered' && (
                              <button
                                type="button"
                                onClick={() => setReceivingOrder(order)}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs transition-colors flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Receive Stock</span>
                              </button>
                            )}

                            {order.status === 'received' && (
                              <span className="text-xs text-emerald-700 font-medium font-mono">
                                In Stock (Lot {order.receivedBatchNumber || 'N/A'})
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Threshold Modal */}
      <ConfigureThresholdModal
        isOpen={!!thresholdTargetMed}
        onClose={() => setThresholdTargetMed(null)}
        medicine={thresholdTargetMed}
      />

      {/* New Order Modal */}
      <NewRefillOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => {
          setIsNewOrderModalOpen(false);
          setNewOrderMedicineId(undefined);
        }}
        defaultMedicineId={newOrderMedicineId}
      />

      {/* Receive Order Modal */}
      <ReceiveRefillModal
        isOpen={!!receivingOrder}
        onClose={() => setReceivingOrder(null)}
        order={receivingOrder}
        medicine={receivingMed}
      />
    </div>
  );
};
