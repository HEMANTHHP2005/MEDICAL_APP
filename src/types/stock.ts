import { DosageUnit } from './medicine';

export type StockTransactionType = 
  | 'initial_intake'
  | 'dose_deduction'
  | 'refill_receipt'
  | 'correction_reversal'
  | 'correction_deduction'
  | 'discrepancy_adjustment'
  | 'expired_discard';

export interface StockBatch {
  id: string;
  medicineId: string;
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD
  initialQuantity: number;
  currentQuantity: number;
  storageLocation?: string; // e.g. "Medicine Cabinet Upper Shelf", "Refrigerator"
  manufacturer?: string;
  createdAt: string;
}

export interface StockTransaction {
  id: string;
  timestamp: string; // ISO
  medicineId: string;
  type: StockTransactionType;
  quantityDelta: number; // e.g. -1 for dose deduction, +30 for refill receipt
  balanceAfter: number;
  batchId?: string;
  batchNumber?: string;
  doseRecordId?: string; // Links directly to dose record for traceability
  reason: string;
  performedBy: string;
  notes?: string;
}

export interface StockItemSummary {
  medicineId: string;
  medicineName: string;
  strength: string;
  familyMemberName: string;
  unit: DosageUnit;
  currentStock: number;
  reorderThreshold: number;
  safetyBufferDays: number;
  dailyBurnRate: number;
  daysOfSupplyRemaining: number;
  estimatedRunoutDate: string | null;
  status: 'normal' | 'low' | 'critical' | 'depleted';
  batches: StockBatch[];
}
