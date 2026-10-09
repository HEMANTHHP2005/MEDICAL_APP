import { FamilyMember } from '../types/family';
import { Medicine } from '../types/medicine';
import { DoseRecord } from '../types/dose';
import { StockBatch, StockTransaction } from '../types/stock';
import { RefillPurchaseOrder } from '../types/refill';
import { AuditLogEntry } from '../types/audit';

// Current reference date for realistic synthetic records
const todayStr = new Date().toISOString().split('T')[0];

export const initialFamilyMembers: FamilyMember[] = [
  {
    id: 'fam-1',
    fullName: 'Arthur Pendelton',
    relationship: 'Grandparent',
    dateOfBirth: '1954-04-12',
    allergies: ['Penicillin (severe hives)', 'Sulfonamides'],
    primaryDoctor: {
      name: 'Dr. Clara Vance, MD',
      phone: '(555) 234-8910',
      clinic: 'St. Jude Geriatric Care Center'
    },
    emergencyContact: {
      name: 'David Pendelton',
      phone: '(555) 301-4422',
      relationship: 'Son (Primary Caregiver)'
    },
    notes: 'Requires large-print pill labels. Takes medications with oatmeal at breakfast.',
    avatarColor: '#0284c7', // Sky blue
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-03-01T10:30:00.000Z'
  },
  {
    id: 'fam-2',
    fullName: 'David Pendelton',
    relationship: 'Self',
    dateOfBirth: '1980-09-24',
    allergies: ['None known'],
    primaryDoctor: {
      name: 'Dr. Robert Chen, MD',
      phone: '(555) 782-1190',
      clinic: 'Highland Family Practice'
    },
    emergencyContact: {
      name: 'Eleanor Pendelton',
      phone: '(555) 301-4423',
      relationship: 'Spouse'
    },
    notes: 'Primary household caregiver coordinating all morning/evening dispensations.',
    avatarColor: '#0d9488', // Teal
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-02-10T14:15:00.000Z'
  },
  {
    id: 'fam-3',
    fullName: 'Eleanor Pendelton',
    relationship: 'Spouse',
    dateOfBirth: '1982-11-03',
    allergies: ['Latex', 'Dust mites (moderate asthma trigger)'],
    primaryDoctor: {
      name: 'Dr. Sarah Lin, MD',
      phone: '(555) 671-9923',
      clinic: 'Metro Pulmonary & Allergy'
    },
    emergencyContact: {
      name: 'David Pendelton',
      phone: '(555) 301-4422',
      relationship: 'Spouse'
    },
    notes: 'Keep Ventolin inhaler in accessible foyer cabinet and commuter bag.',
    avatarColor: '#7c3aed', // Purple
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-03-12T09:00:00.000Z'
  },
  {
    id: 'fam-4',
    fullName: 'Leo Pendelton',
    relationship: 'Child',
    dateOfBirth: '2017-06-18',
    allergies: ['Amoxicillin (mild diaper rash as infant - tolerated under supervision)'],
    primaryDoctor: {
      name: 'Dr. Marcus Brody, FAAP',
      phone: '(555) 912-3401',
      clinic: 'Childrens Memorial Pediatrics'
    },
    emergencyContact: {
      name: 'David Pendelton',
      phone: '(555) 301-4422',
      relationship: 'Father'
    },
    notes: 'Currently on 10-day acute oral antibiotic protocol for bilateral otitis media.',
    avatarColor: '#ea580c', // Orange
    createdAt: '2026-03-25T11:00:00.000Z',
    updatedAt: '2026-04-01T16:00:00.000Z'
  }
];

export const initialMedicines: Medicine[] = [
  {
    id: 'med-1',
    familyMemberId: 'fam-1',
    name: 'Amlodipine Besylate',
    brandName: 'Norvasc',
    strength: '5 mg',
    dosageForm: 'Tablet',
    unit: 'tablets',
    prescribedInstructions: 'Take 1 tablet by mouth every morning with water. Monitor blood pressure weekly.',
    prescribingDoctor: 'Dr. Clara Vance, MD',
    pharmacyName: 'Walgreens Pharmacy #4192',
    indication: 'Hypertension',
    schedule: {
      frequency: 'once-daily',
      scheduledTimes: ['08:00'],
      doseAmount: 1,
      foodRelation: 'unrelated',
      startDate: '2026-01-20'
    },
    currentStock: 6, // Low stock! threshold is 10
    reorderThreshold: 10,
    safetyBufferDays: 7,
    isActive: true,
    notes: 'Keep bottle stored in dry medication drawer away from sunlight.',
    createdAt: '2026-01-20T10:00:00.000Z',
    updatedAt: '2026-04-08T08:15:00.000Z'
  },
  {
    id: 'med-2',
    familyMemberId: 'fam-1',
    name: 'Metformin Hydrochloride',
    brandName: 'Glucophage',
    strength: '500 mg',
    dosageForm: 'Tablet',
    unit: 'tablets',
    prescribedInstructions: 'Take 1 tablet twice daily with breakfast and dinner to minimize GI upset.',
    prescribingDoctor: 'Dr. Clara Vance, MD',
    pharmacyName: 'Walgreens Pharmacy #4192',
    indication: 'Type 2 Diabetes Mellitus',
    schedule: {
      frequency: 'twice-daily',
      scheduledTimes: ['08:00', '20:00'],
      doseAmount: 1,
      foodRelation: 'with-food',
      startDate: '2026-01-20'
    },
    currentStock: 18,
    reorderThreshold: 14,
    safetyBufferDays: 7,
    isActive: true,
    notes: 'Do not crush or chew extended-release formulation.',
    createdAt: '2026-01-20T10:00:00.000Z',
    updatedAt: '2026-04-08T08:15:00.000Z'
  },
  {
    id: 'med-3',
    familyMemberId: 'fam-2',
    name: 'Atorvastatin Calcium',
    brandName: 'Lipitor',
    strength: '20 mg',
    dosageForm: 'Tablet',
    unit: 'tablets',
    prescribedInstructions: 'Take 1 tablet once daily at bedtime. Avoid grapefruit consumption.',
    prescribingDoctor: 'Dr. Robert Chen, MD',
    pharmacyName: 'Highland Community Rx',
    indication: 'Hyperlipidemia',
    schedule: {
      frequency: 'once-daily',
      scheduledTimes: ['21:00'],
      doseAmount: 1,
      foodRelation: 'after-food',
      startDate: '2026-02-01'
    },
    currentStock: 14,
    reorderThreshold: 10,
    safetyBufferDays: 7,
    isActive: true,
    createdAt: '2026-02-01T11:00:00.000Z',
    updatedAt: '2026-04-08T21:00:00.000Z'
  },
  {
    id: 'med-4',
    familyMemberId: 'fam-3',
    name: 'Ventolin HFA (Salbutamol)',
    brandName: 'Ventolin',
    strength: '100 mcg/actuation',
    dosageForm: 'Inhaler',
    unit: 'puffs',
    prescribedInstructions: 'Inhale 2 puffs every 4 to 6 hours as needed for shortness of breath or wheezing. Rinse mouth after use.',
    prescribingDoctor: 'Dr. Sarah Lin, MD',
    pharmacyName: 'CVS Pharmacy #8821',
    indication: 'Asthma / Bronchospasm',
    schedule: {
      frequency: 'as-needed',
      scheduledTimes: ['12:00'],
      doseAmount: 2,
      foodRelation: 'unrelated',
      startDate: '2026-02-15'
    },
    currentStock: 74,
    reorderThreshold: 40,
    safetyBufferDays: 14,
    isActive: true,
    notes: 'Contains counter on canister.',
    createdAt: '2026-02-15T09:00:00.000Z',
    updatedAt: '2026-04-05T12:00:00.000Z'
  },
  {
    id: 'med-5',
    familyMemberId: 'fam-3',
    name: 'Fluticasone Propionate',
    brandName: 'Flonase',
    strength: '50 mcg/actuation',
    dosageForm: 'Drops',
    unit: 'drops',
    prescribedInstructions: 'Administer 1 spray into each nostril once daily every morning.',
    prescribingDoctor: 'Dr. Sarah Lin, MD',
    pharmacyName: 'CVS Pharmacy #8821',
    indication: 'Allergic Rhinitis',
    schedule: {
      frequency: 'once-daily',
      scheduledTimes: ['07:30'],
      doseAmount: 2,
      foodRelation: 'unrelated',
      startDate: '2026-03-01'
    },
    currentStock: 32,
    reorderThreshold: 20,
    safetyBufferDays: 7,
    isActive: true,
    createdAt: '2026-03-01T15:00:00.000Z',
    updatedAt: '2026-04-09T07:45:00.000Z'
  },
  {
    id: 'med-6',
    familyMemberId: 'fam-4',
    name: 'Amoxicillin Oral Suspension',
    brandName: 'Amoxil',
    strength: '250 mg/5ml',
    dosageForm: 'Syrup / Liquid',
    unit: 'ml',
    prescribedInstructions: 'Give 5 ml by oral syringe three times daily (morning, afternoon, bedtime) for 10 consecutive days. Shake well before measuring. Keep refrigerated.',
    prescribingDoctor: 'Dr. Marcus Brody, FAAP',
    pharmacyName: 'St. Jude Childrens Rx',
    indication: 'Acute Otitis Media',
    schedule: {
      frequency: 'three-times-daily',
      scheduledTimes: ['08:00', '14:00', '20:00'],
      doseAmount: 5,
      foodRelation: 'with-food',
      startDate: todayStr,
      endDate: '2026-10-19'
    },
    currentStock: 25, // Critical! Burns 15ml/day, only 1.6 days of supply left!
    reorderThreshold: 35,
    safetyBufferDays: 3,
    isActive: true,
    notes: 'Refrigerated on door shelf. Shake vigorously for 10 seconds before dispensing.',
    createdAt: '2026-10-01T12:00:00.000Z',
    updatedAt: '2026-10-09T08:20:00.000Z'
  }
];

export const initialBatches: StockBatch[] = [
  {
    id: 'batch-1',
    medicineId: 'med-1',
    batchNumber: 'AML-99214',
    expiryDate: '2027-02-28',
    initialQuantity: 30,
    currentQuantity: 6,
    storageLocation: 'Primary Drawer A',
    manufacturer: 'Pfizer Labs',
    createdAt: '2026-01-20T10:00:00.000Z'
  },
  {
    id: 'batch-2',
    medicineId: 'med-2',
    batchNumber: 'MET-44102',
    expiryDate: '2027-06-30',
    initialQuantity: 60,
    currentQuantity: 18,
    storageLocation: 'Primary Drawer A',
    manufacturer: 'Bristol Myers',
    createdAt: '2026-01-20T10:00:00.000Z'
  },
  {
    id: 'batch-3',
    medicineId: 'med-3',
    batchNumber: 'ATO-11084',
    expiryDate: '2027-11-15',
    initialQuantity: 30,
    currentQuantity: 14,
    storageLocation: 'Bedside Nightstand',
    manufacturer: 'Viatris',
    createdAt: '2026-02-01T11:00:00.000Z'
  },
  {
    id: 'batch-4',
    medicineId: 'med-4',
    batchNumber: 'VEN-55091',
    expiryDate: '2027-08-31',
    initialQuantity: 200,
    currentQuantity: 74,
    storageLocation: 'Foyer Emergency Box',
    manufacturer: 'GSK Pharmaceuticals',
    createdAt: '2026-02-15T09:00:00.000Z'
  },
  {
    id: 'batch-5',
    medicineId: 'med-5',
    batchNumber: 'FLU-77341',
    expiryDate: '2026-12-31',
    initialQuantity: 60,
    currentQuantity: 32,
    storageLocation: 'Bathroom Cabinet Top',
    manufacturer: 'GSK Pharmaceuticals',
    createdAt: '2026-03-01T15:00:00.000Z'
  },
  {
    id: 'batch-6',
    medicineId: 'med-6',
    batchNumber: 'AMX-88412',
    expiryDate: '2026-10-25', // Short expiration for reconstituted suspension
    initialQuantity: 100,
    currentQuantity: 25,
    storageLocation: 'Kitchen Refrigerator Top Shelf',
    manufacturer: 'Teva Generics',
    createdAt: '2026-10-01T12:00:00.000Z'
  }
];

export const initialDoses: DoseRecord[] = [
  // Arthur - Morning Amlodipine (Taken)
  {
    id: 'dose-1',
    medicineId: 'med-1',
    familyMemberId: 'fam-1',
    scheduledDate: todayStr,
    scheduledTime: '08:00',
    doseQuantity: 1,
    status: 'taken',
    administeredAt: `${todayStr}T08:12:00.000Z`,
    administeredBy: 'Arthur Pendelton (Verified by David)',
    stockDeducted: true,
    stockTransactionId: 'st-101',
    reminderAcknowledgment: {
      isAcknowledged: true,
      acknowledgedAt: `${todayStr}T07:55:00.000Z`,
      acknowledgedBy: 'David Pendelton'
    },
    corrections: [],
    createdAt: `${todayStr}T00:01:00.000Z`,
    updatedAt: `${todayStr}T08:12:00.000Z`
  },
  // Arthur - Morning Metformin (Taken)
  {
    id: 'dose-2',
    medicineId: 'med-2',
    familyMemberId: 'fam-1',
    scheduledDate: todayStr,
    scheduledTime: '08:00',
    doseQuantity: 1,
    status: 'taken',
    administeredAt: `${todayStr}T08:14:00.000Z`,
    administeredBy: 'Arthur Pendelton',
    stockDeducted: true,
    stockTransactionId: 'st-102',
    reminderAcknowledgment: {
      isAcknowledged: true,
      acknowledgedAt: `${todayStr}T07:55:00.000Z`,
      acknowledgedBy: 'David Pendelton'
    },
    corrections: [],
    createdAt: `${todayStr}T00:01:00.000Z`,
    updatedAt: `${todayStr}T08:14:00.000Z`
  },
  // Arthur - Evening Metformin (Scheduled)
  {
    id: 'dose-3',
    medicineId: 'med-2',
    familyMemberId: 'fam-1',
    scheduledDate: todayStr,
    scheduledTime: '20:00',
    doseQuantity: 1,
    status: 'scheduled',
    stockDeducted: false,
    reminderAcknowledgment: {
      isAcknowledged: false
    },
    corrections: [],
    createdAt: `${todayStr}T00:01:00.000Z`,
    updatedAt: `${todayStr}T00:01:00.000Z`
  },
  // Eleanor - Morning Fluticasone (Taken)
  {
    id: 'dose-4',
    medicineId: 'med-5',
    familyMemberId: 'fam-3',
    scheduledDate: todayStr,
    scheduledTime: '07:30',
    doseQuantity: 2,
    status: 'taken',
    administeredAt: `${todayStr}T07:45:00.000Z`,
    administeredBy: 'Eleanor Pendelton',
    stockDeducted: true,
    stockTransactionId: 'st-103',
    reminderAcknowledgment: {
      isAcknowledged: true,
      acknowledgedAt: `${todayStr}T07:30:00.000Z`,
      acknowledgedBy: 'Eleanor Pendelton'
    },
    corrections: [],
    createdAt: `${todayStr}T00:01:00.000Z`,
    updatedAt: `${todayStr}T07:45:00.000Z`
  },
  // Eleanor - Midday Ventolin (Skipped with recorded clinical note)
  {
    id: 'dose-5',
    medicineId: 'med-4',
    familyMemberId: 'fam-3',
    scheduledDate: todayStr,
    scheduledTime: '12:00',
    doseQuantity: 2,
    status: 'skipped',
    administeredBy: 'Eleanor Pendelton',
    reasonNotes: 'Peak flow meter reading normal (420 L/min). No bronchospasm or exertion dyspnea reported.',
    stockDeducted: false,
    reminderAcknowledgment: {
      isAcknowledged: true,
      acknowledgedAt: `${todayStr}T12:05:00.000Z`,
      acknowledgedBy: 'Eleanor Pendelton'
    },
    corrections: [],
    createdAt: `${todayStr}T00:01:00.000Z`,
    updatedAt: `${todayStr}T12:10:00.000Z`
  },
  // Leo - Morning Amoxicillin (Taken)
  {
    id: 'dose-6',
    medicineId: 'med-6',
    familyMemberId: 'fam-4',
    scheduledDate: todayStr,
    scheduledTime: '08:00',
    doseQuantity: 5,
    status: 'taken',
    administeredAt: `${todayStr}T08:20:00.000Z`,
    administeredBy: 'David Pendelton',
    stockDeducted: true,
    stockTransactionId: 'st-104',
    reminderAcknowledgment: {
      isAcknowledged: true,
      acknowledgedAt: `${todayStr}T07:50:00.000Z`,
      acknowledgedBy: 'David Pendelton'
    },
    corrections: [],
    createdAt: `${todayStr}T00:01:00.000Z`,
    updatedAt: `${todayStr}T08:20:00.000Z`
  },
  // Leo - Afternoon Amoxicillin (Unknown status - waiting for school nurse log)
  {
    id: 'dose-7',
    medicineId: 'med-6',
    familyMemberId: 'fam-4',
    scheduledDate: todayStr,
    scheduledTime: '14:00',
    doseQuantity: 5,
    status: 'unknown',
    reasonNotes: 'Awaiting digital sign-off from school health clinic nurse.',
    stockDeducted: false,
    reminderAcknowledgment: {
      isAcknowledged: true,
      acknowledgedAt: `${todayStr}T13:45:00.000Z`,
      acknowledgedBy: 'David Pendelton',
      notes: 'Texted school office to verify dose dispensation at lunch'
    },
    corrections: [],
    createdAt: `${todayStr}T00:01:00.000Z`,
    updatedAt: `${todayStr}T14:15:00.000Z`
  },
  // Leo - Night Amoxicillin (Scheduled)
  {
    id: 'dose-8',
    medicineId: 'med-6',
    familyMemberId: 'fam-4',
    scheduledDate: todayStr,
    scheduledTime: '20:00',
    doseQuantity: 5,
    status: 'scheduled',
    stockDeducted: false,
    reminderAcknowledgment: {
      isAcknowledged: false
    },
    corrections: [],
    createdAt: `${todayStr}T00:01:00.000Z`,
    updatedAt: `${todayStr}T00:01:00.000Z`
  },
  // David - Night Atorvastatin (Scheduled)
  {
    id: 'dose-9',
    medicineId: 'med-3',
    familyMemberId: 'fam-2',
    scheduledDate: todayStr,
    scheduledTime: '21:00',
    doseQuantity: 1,
    status: 'scheduled',
    stockDeducted: false,
    reminderAcknowledgment: {
      isAcknowledged: false
    },
    corrections: [],
    createdAt: `${todayStr}T00:01:00.000Z`,
    updatedAt: `${todayStr}T00:01:00.000Z`
  }
];

export const initialTransactions: StockTransaction[] = [
  {
    id: 'st-001',
    timestamp: '2026-03-20T10:00:00.000Z',
    medicineId: 'med-1',
    type: 'initial_intake',
    quantityDelta: 30,
    balanceAfter: 30,
    batchId: 'batch-1',
    batchNumber: 'AML-99214',
    reason: 'Initial prescription intake from Walgreens Pharmacy #4192',
    performedBy: 'David Pendelton'
  },
  {
    id: 'st-101',
    timestamp: `${todayStr}T08:12:00.000Z`,
    medicineId: 'med-1',
    type: 'dose_deduction',
    quantityDelta: -1,
    balanceAfter: 6,
    batchId: 'batch-1',
    batchNumber: 'AML-99214',
    doseRecordId: 'dose-1',
    reason: 'Scheduled morning dose administration verified',
    performedBy: 'Arthur Pendelton (Verified by David)'
  },
  {
    id: 'st-102',
    timestamp: `${todayStr}T08:14:00.000Z`,
    medicineId: 'med-2',
    type: 'dose_deduction',
    quantityDelta: -1,
    balanceAfter: 18,
    batchId: 'batch-2',
    batchNumber: 'MET-44102',
    doseRecordId: 'dose-2',
    reason: 'Scheduled morning breakfast dose administered',
    performedBy: 'Arthur Pendelton'
  },
  {
    id: 'st-103',
    timestamp: `${todayStr}T07:45:00.000Z`,
    medicineId: 'med-5',
    type: 'dose_deduction',
    quantityDelta: -2,
    balanceAfter: 32,
    batchId: 'batch-5',
    batchNumber: 'FLU-77341',
    doseRecordId: 'dose-4',
    reason: 'Morning bilateral nasal spray administration',
    performedBy: 'Eleanor Pendelton'
  },
  {
    id: 'st-104',
    timestamp: `${todayStr}T08:20:00.000Z`,
    medicineId: 'med-6',
    type: 'dose_deduction',
    quantityDelta: -5,
    balanceAfter: 25,
    batchId: 'batch-6',
    batchNumber: 'AMX-88412',
    doseRecordId: 'dose-6',
    reason: 'Morning pediatric dose administered via 5ml oral dispenser',
    performedBy: 'David Pendelton'
  }
];

export const initialRefillOrders: RefillPurchaseOrder[] = [
  {
    id: 'ro-101',
    medicineId: 'med-1',
    familyMemberId: 'fam-1',
    status: 'planned',
    prescriptionRxNumber: 'RX-992410-02',
    pharmacyName: 'Walgreens Pharmacy #4192',
    pharmacyPhone: '(555) 234-8910',
    packSize: 30,
    packCount: 1,
    totalQuantity: 30,
    unit: 'tablets',
    unitPrice: 12.50,
    totalCost: 12.50,
    plannedOrderDate: todayStr,
    expectedDate: '2026-10-12',
    notes: 'Triggered by low stock threshold (6 remaining, threshold 10).',
    createdAt: `${todayStr}T08:30:00.000Z`,
    updatedAt: `${todayStr}T08:30:00.000Z`
  },
  {
    id: 'ro-102',
    medicineId: 'med-6',
    familyMemberId: 'fam-4',
    status: 'ordered',
    prescriptionRxNumber: 'RX-881203-01',
    pharmacyName: 'St. Jude Childrens Rx',
    pharmacyPhone: '(555) 912-3401',
    packSize: 100,
    packCount: 1,
    totalQuantity: 100,
    unit: 'ml',
    unitPrice: 18.00,
    totalCost: 18.00,
    plannedOrderDate: '2026-10-08',
    actualOrderedDate: '2026-10-08',
    expectedDate: todayStr,
    notes: 'Urgent pediatric antibiotic refill for second half of protocol.',
    createdAt: '2026-10-08T15:00:00.000Z',
    updatedAt: '2026-10-08T15:30:00.000Z'
  }
];

export const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'aud-1',
    timestamp: '2026-04-05T08:10:00.000Z',
    category: 'dose_correction',
    actor: 'David Pendelton',
    entityType: 'dose',
    entityId: 'dose-hist-12',
    title: 'Historical Dose Correction',
    details: 'Corrected status from "taken" to "skipped". Patient was fasting for morning lipid profile blood draw.',
    previousValue: 'taken',
    newValue: 'skipped',
    metadata: {
      stockReversalUnits: 1,
      medicineName: 'Atorvastatin Calcium 20 mg',
      patient: 'David Pendelton'
    }
  },
  {
    id: 'aud-2',
    timestamp: '2026-04-05T08:11:00.000Z',
    category: 'stock_correction',
    actor: 'David Pendelton',
    entityType: 'stock',
    entityId: 'med-3',
    title: 'Automatic Stock Deduction Reversal',
    details: 'Re-credited 1 tablet of Atorvastatin 20mg following correction of mistaken dose record.',
    previousValue: '13',
    newValue: '14'
  },
  {
    id: 'aud-3',
    timestamp: `${todayStr}T07:55:00.000Z`,
    category: 'reminder_acknowledgment',
    actor: 'David Pendelton',
    entityType: 'dose',
    entityId: 'dose-1',
    title: 'Reminder Acknowledged',
    details: 'Caregiver acknowledged morning hypertension medication reminder (Dose status left as scheduled until actual patient ingestion).',
    previousValue: 'unacknowledged',
    newValue: 'acknowledged'
  },
  {
    id: 'aud-4',
    timestamp: `${todayStr}T08:12:00.000Z`,
    category: 'dose_status_transition',
    actor: 'David Pendelton',
    entityType: 'dose',
    entityId: 'dose-1',
    title: 'Dose Recorded Taken',
    details: 'Amlodipine 5mg confirmed taken by Arthur Pendelton. 1 tablet deducted from batch AML-99214.',
    previousValue: 'scheduled',
    newValue: 'taken'
  }
];
