import React from 'react';
import { DoseStatus } from '../../types/dose';

interface StatusBadgeProps {
  status: DoseStatus | 'normal' | 'low' | 'critical' | 'depleted' | 'planned' | 'ordered' | 'received' | 'cancelled';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'taken':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}>
          Taken
        </span>
      );
    case 'scheduled':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-sky-50 text-sky-800 border border-sky-200 ${className}`}>
          Scheduled
        </span>
      );
    case 'skipped':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-amber-50 text-amber-800 border border-amber-200 ${className}`}>
          Skipped
        </span>
      );
    case 'not-taken':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-rose-50 text-rose-800 border border-rose-200 ${className}`}>
          Not Taken
        </span>
      );
    case 'unknown':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-700 border border-slate-300 ${className}`}>
          Status Unknown
        </span>
      );

    // Stock statuses
    case 'normal':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}>
          Adequate Stock
        </span>
      );
    case 'low':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-amber-50 text-amber-800 border border-amber-200 ${className}`}>
          Low Stock
        </span>
      );
    case 'critical':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-rose-50 text-rose-800 border border-rose-200 ${className}`}>
          Critical Stock
        </span>
      );
    case 'depleted':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-neutral-900 text-white ${className}`}>
          Depleted (0 left)
        </span>
      );

    // Refill statuses
    case 'planned':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-700 border border-slate-300 ${className}`}>
          Planned
        </span>
      );
    case 'ordered':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-blue-50 text-blue-800 border border-blue-200 ${className}`}>
          Ordered (In Transit)
        </span>
      );
    case 'received':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}>
          Received & Stocked
        </span>
      );
    case 'cancelled':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-500 border border-gray-200 ${className}`}>
          Cancelled
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-700 ${className}`}>
          {status}
        </span>
      );
  }
};
