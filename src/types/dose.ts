export type DoseStatus = 
  | 'scheduled' 
  | 'taken' 
  | 'skipped' 
  | 'not-taken' 
  | 'unknown';

export interface DoseCorrectionRecord {
  id: string;
  timestamp: string;
  previousStatus: DoseStatus;
  newStatus: DoseStatus;
  reason: string;
  performedBy: string;
  stockAdjustmentMade: boolean;
  notes?: string;
}

export interface ReminderAcknowledgment {
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  snoozedUntil?: string;
  notes?: string;
}

export interface DoseRecord {
  id: string;
  medicineId: string;
  familyMemberId: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM (24-hour)
  doseQuantity: number;
  
  // Clinical Administration Status
  status: DoseStatus;
  administeredAt?: string; // ISO timestamp when taken
  administeredBy?: string; // Caregiver or self
  reasonNotes?: string; // Mandatory if skipped or not-taken
  
  // Stock Tracking Guard: Prevents duplicate deductions
  stockDeducted: boolean;
  stockTransactionId?: string;
  
  // CRITICAL SEPARATION: Reminder acknowledgment is distinct from clinical dose consumption
  reminderAcknowledgment: ReminderAcknowledgment;
  
  // Full audit trail of historical corrections for this dose
  corrections: DoseCorrectionRecord[];
  
  createdAt: string;
  updatedAt: string;
}
