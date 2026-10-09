import { DosageUnit } from './medicine';

export type RefillOrderStatus = 
  | 'planned' 
  | 'ordered' 
  | 'received' 
  | 'cancelled';

export interface RefillPurchaseOrder {
  id: string;
  medicineId: string;
  familyMemberId: string;
  status: RefillOrderStatus;
  prescriptionRxNumber?: string;
  pharmacyName: string;
  pharmacyPhone?: string;
  packSize: number;
  packCount: number;
  totalQuantity: number; // packSize * packCount
  unit: DosageUnit;
  unitPrice?: number;
  totalCost?: number;
  plannedOrderDate: string; // YYYY-MM-DD
  actualOrderedDate?: string; // YYYY-MM-DD
  expectedDate?: string; // YYYY-MM-DD
  receivedDate?: string; // YYYY-MM-DD
  receivedBatchNumber?: string;
  receivedExpiryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RefillThresholdConfig {
  medicineId: string;
  reorderThreshold: number; // minimum quantity
  safetyBufferDays: number; // days before depletion to trigger order
  leadTimeDays: number; // days required for pharmacy pickup/delivery
  preferredPharmacy?: string;
}
