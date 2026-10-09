import React from 'react';
import { useMediHome } from '../../context/MediHomeContext';
import { AlertTriangle, PackagePlus, ArrowRight } from 'lucide-react';

interface LowStockAlertsProps {
  onPlanRefill: (medicineId?: string) => void;
  onViewStock: () => void;
}

export const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ onPlanRefill, onViewStock }) => {
  const { stockSummaries } = useMediHome();

  // Filter low, critical, or depleted items
  const alertItems = stockSummaries.filter(item => item.status === 'low' || item.status === 'critical' || item.status === 'depleted');

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">Low-Stock & Refill Alerts</h2>
            <p className="text-xs text-slate-500">Medications approaching or below safety threshold</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onViewStock}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
        >
          <span>Stock Register</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {alertItems.length === 0 ? (
        <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-800">
          All household medications currently have adequate supply above safety buffer levels.
        </div>
      ) : (
        <div className="space-y-2.5">
          {alertItems.map((item) => {
            const isCritical = item.status === 'critical' || item.status === 'depleted';
            return (
              <div
                key={item.medicineId}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border ${
                  isCritical 
                    ? 'bg-rose-50/50 border-rose-200 text-rose-950' 
                    : 'bg-amber-50/50 border-amber-200 text-amber-950'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-900">
                      {item.medicineName} {item.strength}
                    </span>
                    <span className="text-xs text-slate-500">
                      for {item.familyMemberName}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      isCritical ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
                    }`}>
                      {isCritical ? 'Critical Supply' : 'Reorder Needed'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 font-mono tabular-nums">
                    <span>
                      Stock: <strong className="text-slate-900">{item.currentStock} {item.unit}</strong> (Min: {item.reorderThreshold})
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>
                      ~{item.daysOfSupplyRemaining} days left (Burns {item.dailyBurnRate} {item.unit}/day)
                    </span>
                    {item.estimatedRunoutDate && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span>Exhausts ~{item.estimatedRunoutDate}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onPlanRefill(item.medicineId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors shrink-0 self-start sm:self-auto"
                >
                  <PackagePlus className="w-3.5 h-3.5" />
                  <span>Order Refill</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
