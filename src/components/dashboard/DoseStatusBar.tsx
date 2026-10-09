import React from 'react';
import { useMediHome } from '../../context/MediHomeContext';
import { CheckCircle2, Clock, AlertCircle, HelpCircle, XCircle } from 'lucide-react';

interface DoseStatusBarProps {
  onFilterByStatus?: (status: string) => void;
}

export const DoseStatusBar: React.FC<DoseStatusBarProps> = ({ onFilterByStatus }) => {
  const { doses } = useMediHome();

  const total = doses.length;
  const takenCount = doses.filter(d => d.status === 'taken').length;
  const scheduledCount = doses.filter(d => d.status === 'scheduled').length;
  const skippedCount = doses.filter(d => d.status === 'skipped').length;
  const notTakenCount = doses.filter(d => d.status === 'not-taken').length;
  const unknownCount = doses.filter(d => d.status === 'unknown').length;

  const completionRate = total > 0 ? Math.round((takenCount / total) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">Today's Dose Statuses</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Clinical administration tracking across all registered family members
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Adherence Progress:</span>
          <span className="font-mono font-bold text-slate-900 tabular-nums text-sm">
            {takenCount} / {total} doses ({completionRate}%)
          </span>
        </div>
      </div>

      {/* Visual progress bar */}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex mb-5">
        <div 
          style={{ width: `${(takenCount / Math.max(1, total)) * 100}%` }} 
          className="bg-emerald-500 transition-all duration-300"
          title={`Taken: ${takenCount}`}
        />
        <div 
          style={{ width: `${(scheduledCount / Math.max(1, total)) * 100}%` }} 
          className="bg-sky-400 transition-all duration-300"
          title={`Scheduled: ${scheduledCount}`}
        />
        <div 
          style={{ width: `${(skippedCount / Math.max(1, total)) * 100}%` }} 
          className="bg-amber-400 transition-all duration-300"
          title={`Skipped: ${skippedCount}`}
        />
        <div 
          style={{ width: `${(notTakenCount / Math.max(1, total)) * 100}%` }} 
          className="bg-rose-500 transition-all duration-300"
          title={`Not Taken: ${notTakenCount}`}
        />
        <div 
          style={{ width: `${(unknownCount / Math.max(1, total)) * 100}%` }} 
          className="bg-slate-400 transition-all duration-300"
          title={`Unknown: ${unknownCount}`}
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => onFilterByStatus?.('taken')}
          className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/50 hover:border-emerald-200 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Taken</div>
            <div className="font-mono text-lg font-bold text-slate-900 tabular-nums">{takenCount}</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onFilterByStatus?.('scheduled')}
          className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-sky-50/50 hover:border-sky-200 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Scheduled</div>
            <div className="font-mono text-lg font-bold text-slate-900 tabular-nums">{scheduledCount}</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onFilterByStatus?.('skipped')}
          className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-amber-50/50 hover:border-amber-200 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Skipped</div>
            <div className="font-mono text-lg font-bold text-slate-900 tabular-nums">{skippedCount}</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onFilterByStatus?.('not-taken')}
          className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-rose-50/50 hover:border-rose-200 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Not Taken</div>
            <div className="font-mono text-lg font-bold text-slate-900 tabular-nums">{notTakenCount}</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onFilterByStatus?.('unknown')}
          className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 transition-colors text-left col-span-2 sm:col-span-1"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Unknown</div>
            <div className="font-mono text-lg font-bold text-slate-900 tabular-nums">{unknownCount}</div>
          </div>
        </button>
      </div>
    </div>
  );
};
