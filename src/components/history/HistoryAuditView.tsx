import React, { useState, useMemo } from 'react';
import { useMediHome } from '../../context/MediHomeContext';
import { AuditCategory } from '../../types/audit';
import { formatDateTimePretty } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';
import {
  History,
  RotateCcw,
  CheckCircle2,
  Bell,
  Package,
  Sliders,
  Search,
  Filter
} from 'lucide-react';

export const HistoryAuditView: React.FC = () => {
  const { auditLogs } = useMediHome();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (selectedCategory !== 'all' && log.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = log.title.toLowerCase().includes(q);
        const matchesDetails = log.details.toLowerCase().includes(q);
        const matchesActor = log.actor.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDetails && !matchesActor) {
          return false;
        }
      }
      return true;
    });
  }, [auditLogs, selectedCategory, searchQuery]);

  const getCategoryIcon = (category: AuditCategory) => {
    switch (category) {
      case 'dose_correction':
      case 'stock_correction':
        return <RotateCcw className="w-3.5 h-3.5 text-amber-600" />;
      case 'dose_status_transition':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'reminder_acknowledgment':
        return <Bell className="w-3.5 h-3.5 text-teal-600" />;
      case 'stock_deduction':
      case 'stock_intake':
        return <Package className="w-3.5 h-3.5 text-blue-600" />;
      case 'threshold_adjusted':
      case 'medicine_updated':
        return <Sliders className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <History className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Clinical & Inventory Audit History</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanent immutable log of dose state changes, historical corrections, reminder events, and inventory adjustments
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Total Log Entries: {auditLogs.length}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-slate-100">
          <div className="sm:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by log title, caregiver, or details..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
            />
          </div>

          <div className="sm:col-span-5">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-700"
            >
              <option value="all">All Audit Categories</option>
              <option value="dose_correction">Historical Dose Corrections</option>
              <option value="dose_status_transition">Dose State Transitions</option>
              <option value="reminder_acknowledgment">Reminder Acknowledgments</option>
              <option value="stock_deduction">Stock Deductions</option>
              <option value="stock_correction">Stock Reversals / Corrections</option>
              <option value="stock_intake">Stock Intake / Refill Deliveries</option>
              <option value="medicine_updated">Medication Registrations</option>
              <option value="threshold_adjusted">Threshold & Refill Plan Adjustments</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Entries List */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No Audit Entries Found"
          description="No event logs match the current search or category filter."
          action={{
            label: "Reset Filters",
            onClick: () => {
              setSelectedCategory('all');
              setSearchQuery('');
            }
          }}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100">
          {filteredLogs.map((log) => {
            return (
              <div
                key={log.id}
                className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getCategoryIcon(log.category)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{log.title}</span>
                      <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px] capitalize">
                        {log.category.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-slate-700 text-xs leading-relaxed max-w-2xl">
                      {log.details}
                    </p>

                    {(log.previousValue !== undefined || log.newValue !== undefined) && (
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 pt-0.5">
                        {log.previousValue !== undefined && (
                          <span>Before: <span className="line-through text-slate-400">{log.previousValue}</span></span>
                        )}
                        {log.previousValue !== undefined && log.newValue !== undefined && <span>→</span>}
                        {log.newValue !== undefined && (
                          <span>After: <strong className="text-slate-800">{log.newValue}</strong></span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:text-right shrink-0 space-y-0.5 pl-11 sm:pl-0">
                  <div className="font-mono text-slate-500 tabular-nums text-[11px]">
                    {formatDateTimePretty(log.timestamp)}
                  </div>
                  <div className="text-slate-700 font-medium text-[11px]">
                    Actor: <strong className="text-slate-900">{log.actor}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
