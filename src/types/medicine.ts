export type DosageForm = 
  | 'Tablet' 
  | 'Capsule' 
  | 'Syrup / Liquid' 
  | 'Inhaler' 
  | 'Drops' 
  | 'Topical Cream' 
  | 'Injection' 
  | 'Sachet / Powder';

export type DosageUnit = 
  | 'tablets' 
  | 'capsules' 
  | 'ml' 
  | 'puffs' 
  | 'drops' 
  | 'applications' 
  | 'units' 
  | 'sachets';

export type ScheduleFrequency = 
  | 'once-daily' 
  | 'twice-daily' 
  | 'three-times-daily' 
  | 'four-times-daily' 
  | 'every-other-day' 
  | 'as-needed' 
  | 'weekly' 
  | 'custom';

export type FoodRelation = 
  | 'before-food' 
  | 'with-food' 
  | 'after-food' 
  | 'empty-stomach' 
  | 'unrelated';

export interface MedicineSchedule {
  frequency: ScheduleFrequency;
  scheduledTimes: string[]; // ['08:00', '20:00']
  doseAmount: number; // e.g. 1 (unit)
  foodRelation: FoodRelation;
  daysOfWeek?: number[]; // [1, 2, 3, 4, 5] (1=Mon, 7=Sun)
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (e.g. for finite courses like antibiotics)
}

export interface Medicine {
  id: string;
  familyMemberId: string;
  name: string;
  brandName?: string;
  strength: string; // e.g., "20 mg", "500 mg/5ml"
  dosageForm: DosageForm;
  unit: DosageUnit;
  // CRITICAL: Recorded verbatim from prescription label. Never altered by automated heuristics.
  prescribedInstructions: string;
  prescribingDoctor?: string;
  pharmacyName?: string;
  indication?: string; // e.g. Hypertension, Infection
  schedule: MedicineSchedule;
  
  // Stock parameters
  currentStock: number;
  reorderThreshold: number; // minimum quantity threshold
  safetyBufferDays: number; // target safety stock in days
  
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineRegistrationFormData {
  familyMemberId: string;
  name: string;
  brandName?: string;
  strength: string;
  dosageForm: DosageForm;
  unit: DosageUnit;
  prescribedInstructions: string;
  prescribingDoctor?: string;
  pharmacyName?: string;
  indication?: string;
  schedule: MedicineSchedule;
  initialStock?: {
    quantity: number;
    batchNumber?: string;
    expiryDate?: string;
    location?: string;
  };
  reorderThreshold: number;
  safetyBufferDays: number;
  notes?: string;
}
