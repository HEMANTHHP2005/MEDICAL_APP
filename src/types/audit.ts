export type AuditCategory = 
  | 'dose_status_transition'
  | 'dose_correction'
  | 'reminder_acknowledgment'
  | 'stock_deduction'
  | 'stock_correction'
  | 'stock_intake'
  | 'medicine_updated'
  | 'threshold_adjusted';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO
  category: AuditCategory;
  actor: string; // e.g. "Family Caregiver" or "System Auto-Scheduler"
  entityType: 'dose' | 'stock' | 'medicine' | 'refill' | 'family';
  entityId: string;
  title: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  metadata?: Record<string, unknown>;
}
