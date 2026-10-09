import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { FamilyMember, FamilyMemberFormData } from '../types/family';
import { Medicine, MedicineRegistrationFormData } from '../types/medicine';
import { DoseRecord, DoseStatus, DoseCorrectionRecord } from '../types/dose';
import { StockBatch, StockTransaction, StockItemSummary } from '../types/stock';
import { RefillPurchaseOrder, RefillThresholdConfig } from '../types/refill';
import { AuditLogEntry } from '../types/audit';
import {
  initialFamilyMembers,
  initialMedicines,
  initialDoses,
  initialBatches,
  initialTransactions,
  initialRefillOrders,
  initialAuditLogs
} from '../data/mockData';
import { calculateDailyBurnRate, calculateDaysOfSupply, calculateRunoutDate, getStockHealthStatus } from '../utils/calculations';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

interface MediHomeContextType {
  // State
  familyMembers: FamilyMember[];
  medicines: Medicine[];
  doses: DoseRecord[];
  stockBatches: StockBatch[];
  stockTransactions: StockTransaction[];
  refillOrders: RefillPurchaseOrder[];
  auditLogs: AuditLogEntry[];

  // Computed / Summaries
  stockSummaries: StockItemSummary[];
  activeCaregiver: string;
  setActiveCaregiver: (name: string) => void;

  // Household data management
  isDemoMode: boolean;
  startFreshHousehold: () => void;
  loadDemoData: () => void;
  deleteFamilyMember: (id: string) => void;
  deleteMedicine: (id: string) => void;

  // Dose Operations (with clinical integrity & separate reminder acknowledgment)
  recordDoseStatus: (
    doseId: string, 
    newStatus: DoseStatus, 
    options?: { administeredBy?: string; reasonNotes?: string }
  ) => void;
  correctDoseStatus: (
    doseId: string,
    newStatus: DoseStatus,
    reason: string,
    performedBy: string,
    notes?: string
  ) => void;
  toggleReminderAcknowledgment: (doseId: string, acknowledgedBy?: string) => void;

  // Medicine Operations
  registerMedicine: (data: MedicineRegistrationFormData) => void;
  updateMedicineThresholds: (config: RefillThresholdConfig) => void;

  // Stock Operations
  adjustStockQuantity: (
    medicineId: string,
    adjustmentDelta: number,
    reason: string,
    batchId?: string,
    notes?: string
  ) => void;

  // Refill Operations
  createRefillOrder: (order: Omit<RefillPurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  receiveRefillOrder: (
    orderId: string,
    batchNumber: string,
    expiryDate: string,
    receivedQuantity: number,
    storageLocation?: string
  ) => void;
  updateRefillOrderStatus: (orderId: string, status: RefillPurchaseOrder['status']) => void;

  // Family Operations
  addFamilyMember: (data: FamilyMemberFormData) => void;
  updateFamilyMember: (id: string, data: Partial<FamilyMemberFormData>) => void;
}

const MediHomeContext = createContext<MediHomeContextType | null>(null);

export function MediHomeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => loadFromStorage('medihome_v1_is_demo', true));
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => loadFromStorage('medihome_v1_members', initialFamilyMembers));
  const [medicines, setMedicines] = useState<Medicine[]>(() => loadFromStorage('medihome_v1_medicines', initialMedicines));
  const [doses, setDoses] = useState<DoseRecord[]>(() => loadFromStorage('medihome_v1_doses', initialDoses));
  const [stockBatches, setStockBatches] = useState<StockBatch[]>(() => loadFromStorage('medihome_v1_batches', initialBatches));
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>(() => loadFromStorage('medihome_v1_tx', initialTransactions));
  const [refillOrders, setRefillOrders] = useState<RefillPurchaseOrder[]>(() => loadFromStorage('medihome_v1_refills', initialRefillOrders));
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => loadFromStorage('medihome_v1_logs', initialAuditLogs));
  const [activeCaregiver, setActiveCaregiver] = useState<string>(() => {
    const members = loadFromStorage('medihome_v1_members', initialFamilyMembers);
    return members.length > 0 ? `${members[0].fullName} (${members[0].relationship})` : 'Household Caregiver';
  });

  // Save changes to localStorage for normal continuous usage
  useEffect(() => {
    saveToStorage('medihome_v1_members', familyMembers);
  }, [familyMembers]);

  useEffect(() => {
    saveToStorage('medihome_v1_medicines', medicines);
  }, [medicines]);

  useEffect(() => {
    saveToStorage('medihome_v1_doses', doses);
  }, [doses]);

  useEffect(() => {
    saveToStorage('medihome_v1_batches', stockBatches);
  }, [stockBatches]);

  useEffect(() => {
    saveToStorage('medihome_v1_tx', stockTransactions);
  }, [stockTransactions]);

  useEffect(() => {
    saveToStorage('medihome_v1_refills', refillOrders);
  }, [refillOrders]);

  useEffect(() => {
    saveToStorage('medihome_v1_logs', auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    saveToStorage('medihome_v1_is_demo', isDemoMode);
  }, [isDemoMode]);

  // Dynamic stock item summaries with calculated burn rate and runout dates
  const stockSummaries = useMemo<StockItemSummary[]>(() => {
    return medicines.map((med) => {
      const member = familyMembers.find(f => f.id === med.familyMemberId);
      const batches = stockBatches.filter(b => b.medicineId === med.id && b.currentQuantity > 0);
      const burnRate = calculateDailyBurnRate(med);
      const daysOfSupply = calculateDaysOfSupply(med.currentStock, burnRate);
      const runoutDate = calculateRunoutDate(med.currentStock, burnRate);
      const status = getStockHealthStatus(med.currentStock, med.reorderThreshold, daysOfSupply, med.safetyBufferDays);

      return {
        medicineId: med.id,
        medicineName: med.name,
        strength: med.strength,
        familyMemberName: member ? member.fullName : 'Unassigned',
        unit: med.unit,
        currentStock: med.currentStock,
        reorderThreshold: med.reorderThreshold,
        safetyBufferDays: med.safetyBufferDays,
        dailyBurnRate: burnRate,
        daysOfSupplyRemaining: daysOfSupply,
        estimatedRunoutDate: runoutDate,
        status,
        batches
      };
    });
  }, [medicines, familyMembers, stockBatches]);

  /**
   * Records a dose state transition.
   * STRICT GUARD: Prevents duplicate stock deductions. Stock is ONLY deducted
   * if transition is to 'taken' and stock has not already been deducted.
   */
  const recordDoseStatus = (
    doseId: string, 
    newStatus: DoseStatus, 
    options?: { administeredBy?: string; reasonNotes?: string }
  ) => {
    const dose = doses.find(d => d.id === doseId);
    if (!dose) return;

    const previousStatus = dose.status;
    if (previousStatus === newStatus) return;

    const med = medicines.find(m => m.id === dose.medicineId);
    const nowIso = new Date().toISOString();
    let stockTransactionId: string | undefined = dose.stockTransactionId;
    let didDeductStock = dose.stockDeducted;

    // Handle stock deduction logic if newly marking as 'taken'
    if (newStatus === 'taken' && !dose.stockDeducted && med) {
      const deductionAmount = dose.doseQuantity;
      const newStock = Math.max(0, med.currentStock - deductionAmount);
      const txId = `st-${Date.now()}`;

      // Deduct from primary available batch
      const availableBatch = stockBatches.find(b => b.medicineId === med.id && b.currentQuantity >= deductionAmount)
        || stockBatches.find(b => b.medicineId === med.id && b.currentQuantity > 0);

      if (availableBatch) {
        setStockBatches(prev => prev.map(b => 
          b.id === availableBatch.id ? { ...b, currentQuantity: Math.max(0, b.currentQuantity - deductionAmount) } : b
        ));
      }

      const newTx: StockTransaction = {
        id: txId,
        timestamp: nowIso,
        medicineId: med.id,
        type: 'dose_deduction',
        quantityDelta: -deductionAmount,
        balanceAfter: newStock,
        batchId: availableBatch?.id,
        batchNumber: availableBatch?.batchNumber,
        doseRecordId: dose.id,
        reason: `Dose administered to ${familyMembers.find(f => f.id === dose.familyMemberId)?.fullName || 'patient'}`,
        performedBy: options?.administeredBy || activeCaregiver
      };

      setMedicines(prev => prev.map(m => m.id === med.id ? { ...m, currentStock: newStock, updatedAt: nowIso } : m));
      setStockTransactions(prev => [newTx, ...prev]);

      stockTransactionId = txId;
      didDeductStock = true;

      // Add to audit trail
      setAuditLogs(prev => [{
        id: `aud-${Date.now()}`,
        timestamp: nowIso,
        category: 'stock_deduction',
        actor: options?.administeredBy || activeCaregiver,
        entityType: 'stock',
        entityId: med.id,
        title: 'Stock Deducted on Dose Administration',
        details: `${deductionAmount} ${med.unit} deducted for scheduled dose at ${dose.scheduledTime}.`,
        previousValue: `${med.currentStock}`,
        newValue: `${newStock}`
      }, ...prev]);
    }

    // Update dose record
    setDoses(prev => prev.map(d => {
      if (d.id !== doseId) return d;
      return {
        ...d,
        status: newStatus,
        administeredAt: newStatus === 'taken' ? nowIso : d.administeredAt,
        administeredBy: options?.administeredBy || d.administeredBy || activeCaregiver,
        reasonNotes: options?.reasonNotes || d.reasonNotes,
        stockDeducted: didDeductStock,
        stockTransactionId,
        updatedAt: nowIso
      };
    }));

    // Record audit event for state transition
    setAuditLogs(prev => [{
      id: `aud-${Date.now()}-status`,
      timestamp: nowIso,
      category: 'dose_status_transition',
      actor: options?.administeredBy || activeCaregiver,
      entityType: 'dose',
      entityId: dose.id,
      title: `Dose Status Updated: ${newStatus.toUpperCase()}`,
      details: `Scheduled ${dose.scheduledTime} dose for ${med?.name || 'medication'} changed from ${previousStatus} to ${newStatus}.`,
      previousValue: previousStatus,
      newValue: newStatus
    }, ...prev]);
  };

  /**
   * Corrects a historical dose record while preserving clinical audit integrity
   * and reversing or adjusting stock deductions when necessary.
   */
  const correctDoseStatus = (
    doseId: string,
    newStatus: DoseStatus,
    reason: string,
    performedBy: string,
    notes?: string
  ) => {
    const dose = doses.find(d => d.id === doseId);
    if (!dose) return;

    const previousStatus = dose.status;
    const med = medicines.find(m => m.id === dose.medicineId);
    const nowIso = new Date().toISOString();
    let stockAdjustmentMade = false;
    let didDeductStock = dose.stockDeducted;

    // Case 1: Was previously recorded as 'taken' with stock deducted, but now corrected to 'skipped' / 'not-taken' / 'unknown'
    if (dose.stockDeducted && newStatus !== 'taken' && med) {
      const reversalAmount = dose.doseQuantity;
      const newStock = med.currentStock + reversalAmount;
      const txId = `st-rev-${Date.now()}`;

      // Credit back to batch
      if (dose.stockTransactionId) {
        const originalTx = stockTransactions.find(t => t.id === dose.stockTransactionId);
        if (originalTx?.batchId) {
          setStockBatches(prev => prev.map(b => 
            b.id === originalTx.batchId ? { ...b, currentQuantity: b.currentQuantity + reversalAmount } : b
          ));
        }
      }

      const reversalTx: StockTransaction = {
        id: txId,
        timestamp: nowIso,
        medicineId: med.id,
        type: 'correction_reversal',
        quantityDelta: +reversalAmount,
        balanceAfter: newStock,
        doseRecordId: dose.id,
        reason: `Reversal: Historical correction of dose from taken to ${newStatus}. Reason: ${reason}`,
        performedBy,
        notes
      };

      setMedicines(prev => prev.map(m => m.id === med.id ? { ...m, currentStock: newStock, updatedAt: nowIso } : m));
      setStockTransactions(prev => [reversalTx, ...prev]);

      didDeductStock = false;
      stockAdjustmentMade = true;

      setAuditLogs(prev => [{
        id: `aud-rev-${Date.now()}`,
        timestamp: nowIso,
        category: 'stock_correction',
        actor: performedBy,
        entityType: 'stock',
        entityId: med.id,
        title: 'Inventory Reversal from Dose Correction',
        details: `Restored ${reversalAmount} ${med.unit} after correcting dose mark to ${newStatus}. Reason: ${reason}`,
        previousValue: `${med.currentStock}`,
        newValue: `${newStock}`
      }, ...prev]);
    }
    // Case 2: Was NOT taken (no stock deducted), now corrected to 'taken'
    else if (!dose.stockDeducted && newStatus === 'taken' && med) {
      const deductionAmount = dose.doseQuantity;
      const newStock = Math.max(0, med.currentStock - deductionAmount);
      const txId = `st-ded-${Date.now()}`;

      const newTx: StockTransaction = {
        id: txId,
        timestamp: nowIso,
        medicineId: med.id,
        type: 'correction_deduction',
        quantityDelta: -deductionAmount,
        balanceAfter: newStock,
        doseRecordId: dose.id,
        reason: `Historical correction: Marked as taken retroactively. Reason: ${reason}`,
        performedBy,
        notes
      };

      setMedicines(prev => prev.map(m => m.id === med.id ? { ...m, currentStock: newStock, updatedAt: nowIso } : m));
      setStockTransactions(prev => [newTx, ...prev]);

      didDeductStock = true;
      stockAdjustmentMade = true;
    }

    const correctionEntry: DoseCorrectionRecord = {
      id: `corr-${Date.now()}`,
      timestamp: nowIso,
      previousStatus,
      newStatus,
      reason,
      performedBy,
      stockAdjustmentMade,
      notes
    };

    setDoses(prev => prev.map(d => {
      if (d.id !== doseId) return d;
      return {
        ...d,
        status: newStatus,
        stockDeducted: didDeductStock,
        corrections: [correctionEntry, ...d.corrections],
        updatedAt: nowIso
      };
    }));

    setAuditLogs(prev => [{
      id: `aud-corr-${Date.now()}`,
      timestamp: nowIso,
      category: 'dose_correction',
      actor: performedBy,
      entityType: 'dose',
      entityId: dose.id,
      title: 'Dose History Corrected',
      details: `Corrected ${med?.name} dose from ${previousStatus} to ${newStatus}. Reason: ${reason}.`,
      previousValue: previousStatus,
      newValue: newStatus
    }, ...prev]);
  };

  /**
   * SEPARATE REMINDER ACKNOWLEDGMENT
   * Distinct from clinical administration. Toggling this DOES NOT mark the dose
   * as taken, and NEVER deducts stock!
   */
  const toggleReminderAcknowledgment = (doseId: string, acknowledgedBy?: string) => {
    const dose = doses.find(d => d.id === doseId);
    if (!dose) return;

    const currentAck = dose.reminderAcknowledgment.isAcknowledged;
    const newAck = !currentAck;
    const actor = acknowledgedBy || activeCaregiver;
    const nowIso = new Date().toISOString();

    setDoses(prev => prev.map(d => {
      if (d.id !== doseId) return d;
      return {
        ...d,
        reminderAcknowledgment: {
          ...d.reminderAcknowledgment,
          isAcknowledged: newAck,
          acknowledgedAt: newAck ? nowIso : undefined,
          acknowledgedBy: newAck ? actor : undefined
        },
        updatedAt: nowIso
      };
    }));

    setAuditLogs(prev => [{
      id: `aud-rem-${Date.now()}`,
      timestamp: nowIso,
      category: 'reminder_acknowledgment',
      actor,
      entityType: 'dose',
      entityId: dose.id,
      title: newAck ? 'Reminder Acknowledged' : 'Reminder Reset to Unacknowledged',
      details: `Reminder acknowledgment toggled to ${newAck ? 'Acknowledged' : 'Unacknowledged'} (Clinical dose status unchanged: ${dose.status}).`,
      previousValue: currentAck ? 'acknowledged' : 'unacknowledged',
      newValue: newAck ? 'acknowledged' : 'unacknowledged'
    }, ...prev]);
  };

  /**
   * Register medicine with prescribed instructions recorded verbatim.
   */
  const registerMedicine = (data: MedicineRegistrationFormData) => {
    const nowIso = new Date().toISOString();
    const newMedId = `med-${Date.now()}`;
    const initialQty = data.initialStock?.quantity || 0;

    const newMedicine: Medicine = {
      id: newMedId,
      familyMemberId: data.familyMemberId,
      name: data.name.trim(),
      brandName: data.brandName?.trim(),
      strength: data.strength.trim(),
      dosageForm: data.dosageForm,
      unit: data.unit,
      prescribedInstructions: data.prescribedInstructions.trim(),
      prescribingDoctor: data.prescribingDoctor?.trim(),
      pharmacyName: data.pharmacyName?.trim(),
      indication: data.indication?.trim(),
      schedule: data.schedule,
      currentStock: initialQty,
      reorderThreshold: data.reorderThreshold,
      safetyBufferDays: data.safetyBufferDays,
      isActive: true,
      notes: data.notes?.trim(),
      createdAt: nowIso,
      updatedAt: nowIso
    };

    setMedicines(prev => [newMedicine, ...prev]);

    // Handle initial stock batch and transaction if provided
    if (initialQty > 0) {
      const batchId = `batch-${Date.now()}`;
      const batchNumber = data.initialStock?.batchNumber?.trim() || `INT-${Date.now().toString().slice(-5)}`;
      const expiryDate = data.initialStock?.expiryDate || '2027-12-31';

      const newBatch: StockBatch = {
        id: batchId,
        medicineId: newMedId,
        batchNumber,
        expiryDate,
        initialQuantity: initialQty,
        currentQuantity: initialQty,
        storageLocation: data.initialStock?.location || 'Main Medication Storage',
        createdAt: nowIso
      };

      const initialTx: StockTransaction = {
        id: `st-${Date.now()}`,
        timestamp: nowIso,
        medicineId: newMedId,
        type: 'initial_intake',
        quantityDelta: initialQty,
        balanceAfter: initialQty,
        batchId,
        batchNumber,
        reason: 'Initial stock intake upon medicine registration',
        performedBy: activeCaregiver
      };

      setStockBatches(prev => [newBatch, ...prev]);
      setStockTransactions(prev => [initialTx, ...prev]);
    }

    // Generate today's dose slots if startDate is today or prior
    const todayStr = nowIso.split('T')[0];
    if (data.schedule.startDate <= todayStr && (!data.schedule.endDate || data.schedule.endDate >= todayStr)) {
      const newDoseSlots: DoseRecord[] = data.schedule.scheduledTimes.map((time, idx) => ({
        id: `dose-${Date.now()}-${idx}`,
        medicineId: newMedId,
        familyMemberId: data.familyMemberId,
        scheduledDate: todayStr,
        scheduledTime: time,
        doseQuantity: data.schedule.doseAmount,
        status: 'scheduled',
        stockDeducted: false,
        reminderAcknowledgment: { isAcknowledged: false },
        corrections: [],
        createdAt: nowIso,
        updatedAt: nowIso
      }));

      setDoses(prev => [...newDoseSlots, ...prev]);
    }

    setAuditLogs(prev => [{
      id: `aud-med-${Date.now()}`,
      timestamp: nowIso,
      category: 'medicine_updated',
      actor: activeCaregiver,
      entityType: 'medicine',
      entityId: newMedId,
      title: 'New Medicine Registered',
      details: `Registered ${newMedicine.name} (${newMedicine.strength}) with verbatim instructions: "${newMedicine.prescribedInstructions}". Initial stock: ${initialQty} ${newMedicine.unit}.`,
      newValue: newMedicine.name
    }, ...prev]);
  };

  /**
   * Configurable stock thresholds per medicine.
   */
  const updateMedicineThresholds = (config: RefillThresholdConfig) => {
    const nowIso = new Date().toISOString();
    const med = medicines.find(m => m.id === config.medicineId);
    if (!med) return;

    setMedicines(prev => prev.map(m => {
      if (m.id !== config.medicineId) return m;
      return {
        ...m,
        reorderThreshold: config.reorderThreshold,
        safetyBufferDays: config.safetyBufferDays,
        updatedAt: nowIso
      };
    }));

    setAuditLogs(prev => [{
      id: `aud-th-${Date.now()}`,
      timestamp: nowIso,
      category: 'threshold_adjusted',
      actor: activeCaregiver,
      entityType: 'medicine',
      entityId: med.id,
      title: 'Stock Reorder Thresholds Updated',
      details: `${med.name}: Minimum stock threshold set to ${config.reorderThreshold} ${med.unit}, safety buffer set to ${config.safetyBufferDays} days.`,
      previousValue: `Threshold: ${med.reorderThreshold}, Buffer: ${med.safetyBufferDays}d`,
      newValue: `Threshold: ${config.reorderThreshold}, Buffer: ${config.safetyBufferDays}d`
    }, ...prev]);
  };

  /**
   * Manual inventory discrepancy adjustment with recorded reason.
   */
  const adjustStockQuantity = (
    medicineId: string,
    adjustmentDelta: number,
    reason: string,
    batchId?: string,
    notes?: string
  ) => {
    const med = medicines.find(m => m.id === medicineId);
    if (!med) return;

    const nowIso = new Date().toISOString();
    const newStock = Math.max(0, med.currentStock + adjustmentDelta);
    const targetBatch = batchId ? stockBatches.find(b => b.id === batchId) : undefined;

    if (targetBatch) {
      setStockBatches(prev => prev.map(b => 
        b.id === targetBatch.id ? { ...b, currentQuantity: Math.max(0, b.currentQuantity + adjustmentDelta) } : b
      ));
    }

    const tx: StockTransaction = {
      id: `st-adj-${Date.now()}`,
      timestamp: nowIso,
      medicineId,
      type: adjustmentDelta < 0 ? 'discrepancy_adjustment' : 'discrepancy_adjustment',
      quantityDelta: adjustmentDelta,
      balanceAfter: newStock,
      batchId: targetBatch?.id,
      batchNumber: targetBatch?.batchNumber,
      reason,
      performedBy: activeCaregiver,
      notes
    };

    setMedicines(prev => prev.map(m => m.id === medicineId ? { ...m, currentStock: newStock, updatedAt: nowIso } : m));
    setStockTransactions(prev => [tx, ...prev]);

    setAuditLogs(prev => [{
      id: `aud-adj-${Date.now()}`,
      timestamp: nowIso,
      category: 'stock_correction',
      actor: activeCaregiver,
      entityType: 'stock',
      entityId: medicineId,
      title: 'Manual Stock Discrepancy Adjustment',
      details: `Adjusted by ${adjustmentDelta > 0 ? `+${adjustmentDelta}` : adjustmentDelta} ${med.unit}. Reason: ${reason}.`,
      previousValue: `${med.currentStock}`,
      newValue: `${newStock}`
    }, ...prev]);
  };

  /**
   * Refill purchase records management.
   */
  const createRefillOrder = (orderData: Omit<RefillPurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const nowIso = new Date().toISOString();
    const newOrder: RefillPurchaseOrder = {
      ...orderData,
      id: `ro-${Date.now()}`,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    setRefillOrders(prev => [newOrder, ...prev]);

    setAuditLogs(prev => [{
      id: `aud-ro-${Date.now()}`,
      timestamp: nowIso,
      category: 'threshold_adjusted',
      actor: activeCaregiver,
      entityType: 'refill',
      entityId: newOrder.id,
      title: 'Refill Order Created',
      details: `Refill order for ${orderData.totalQuantity} ${orderData.unit} planned from ${orderData.pharmacyName}. Status: ${orderData.status}.`,
      newValue: orderData.status
    }, ...prev]);
  };

  const updateRefillOrderStatus = (orderId: string, status: RefillPurchaseOrder['status']) => {
    const nowIso = new Date().toISOString();
    setRefillOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, updatedAt: nowIso } : o));
  };

  const receiveRefillOrder = (
    orderId: string,
    batchNumber: string,
    expiryDate: string,
    receivedQuantity: number,
    storageLocation: string = 'Primary Drawer A'
  ) => {
    const order = refillOrders.find(o => o.id === orderId);
    if (!order) return;

    const med = medicines.find(m => m.id === order.medicineId);
    if (!med) return;

    const nowIso = new Date().toISOString();
    const newStock = med.currentStock + receivedQuantity;
    const batchId = `batch-${Date.now()}`;

    // Add new batch
    const newBatch: StockBatch = {
      id: batchId,
      medicineId: med.id,
      batchNumber,
      expiryDate,
      initialQuantity: receivedQuantity,
      currentQuantity: receivedQuantity,
      storageLocation,
      createdAt: nowIso
    };

    // Add receipt transaction
    const receiptTx: StockTransaction = {
      id: `st-rcv-${Date.now()}`,
      timestamp: nowIso,
      medicineId: med.id,
      type: 'refill_receipt',
      quantityDelta: receivedQuantity,
      balanceAfter: newStock,
      batchId,
      batchNumber,
      reason: `Refill received from ${order.pharmacyName} (Order #${order.id})`,
      performedBy: activeCaregiver
    };

    setStockBatches(prev => [newBatch, ...prev]);
    setMedicines(prev => prev.map(m => m.id === med.id ? { ...m, currentStock: newStock, updatedAt: nowIso } : m));
    setStockTransactions(prev => [receiptTx, ...prev]);

    // Mark order received
    setRefillOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      status: 'received',
      receivedDate: nowIso.split('T')[0],
      receivedBatchNumber: batchNumber,
      receivedExpiryDate: expiryDate,
      updatedAt: nowIso
    } : o));

    setAuditLogs(prev => [{
      id: `aud-rcv-${Date.now()}`,
      timestamp: nowIso,
      category: 'stock_intake',
      actor: activeCaregiver,
      entityType: 'stock',
      entityId: med.id,
      title: 'Refill Delivered & Stock Credited',
      details: `Received ${receivedQuantity} ${med.unit} of ${med.name}. Added to batch ${batchNumber} (Expires ${expiryDate}). New inventory: ${newStock}.`,
      previousValue: `${med.currentStock}`,
      newValue: `${newStock}`
    }, ...prev]);
  };

  /**
   * Family member registration and profiles.
   */
  const addFamilyMember = (data: FamilyMemberFormData) => {
    const nowIso = new Date().toISOString();
    const newMember: FamilyMember = {
      ...data,
      id: `fam-${Date.now()}`,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    setFamilyMembers(prev => [...prev, newMember]);
    if (familyMembers.length === 0) {
      setActiveCaregiver(`${newMember.fullName} (${newMember.relationship})`);
    }

    setAuditLogs(prev => [{
      id: `aud-fam-${Date.now()}`,
      timestamp: nowIso,
      category: 'medicine_updated',
      actor: activeCaregiver,
      entityType: 'family',
      entityId: newMember.id,
      title: 'Family Member Profile Created',
      details: `Added ${newMember.fullName} (${newMember.relationship}). Known allergies: ${newMember.allergies.join(', ') || 'None recorded'}.`,
      newValue: newMember.fullName
    }, ...prev]);
  };

  const updateFamilyMember = (id: string, data: Partial<FamilyMemberFormData>) => {
    const nowIso = new Date().toISOString();
    setFamilyMembers(prev => prev.map(m => m.id === id ? { ...m, ...data, updatedAt: nowIso } : m));
  };

  const deleteFamilyMember = (id: string) => {
    const member = familyMembers.find(f => f.id === id);
    if (!member) return;

    setFamilyMembers(prev => prev.filter(f => f.id !== id));
    setMedicines(prev => prev.filter(m => m.familyMemberId !== id));
    setDoses(prev => prev.filter(d => d.familyMemberId !== id));
    setRefillOrders(prev => prev.filter(r => r.familyMemberId !== id));

    const nowIso = new Date().toISOString();
    setAuditLogs(prev => [{
      id: `aud-del-fam-${Date.now()}`,
      timestamp: nowIso,
      category: 'medicine_updated',
      actor: activeCaregiver,
      entityType: 'family',
      entityId: id,
      title: 'Family Member Profile Removed',
      details: `Removed profile for ${member.fullName} (${member.relationship}) and archived their regimens.`,
      previousValue: member.fullName
    }, ...prev]);
  };

  const deleteMedicine = (id: string) => {
    const med = medicines.find(m => m.id === id);
    if (!med) return;

    setMedicines(prev => prev.filter(m => m.id !== id));
    setDoses(prev => prev.filter(d => d.medicineId !== id));
    setStockBatches(prev => prev.filter(b => b.medicineId !== id));
    setRefillOrders(prev => prev.filter(r => r.medicineId !== id));

    const nowIso = new Date().toISOString();
    setAuditLogs(prev => [{
      id: `aud-del-med-${Date.now()}`,
      timestamp: nowIso,
      category: 'medicine_updated',
      actor: activeCaregiver,
      entityType: 'medicine',
      entityId: id,
      title: 'Prescription Removed',
      details: `Removed prescription ${med.name} (${med.strength}) from active register.`,
      previousValue: med.name
    }, ...prev]);
  };

  const startFreshHousehold = () => {
    setIsDemoMode(false);
    setFamilyMembers([]);
    setMedicines([]);
    setDoses([]);
    setStockBatches([]);
    setStockTransactions([]);
    setRefillOrders([]);
    setActiveCaregiver('Household Caregiver');

    const nowIso = new Date().toISOString();
    setAuditLogs([{
      id: `aud-init-${Date.now()}`,
      timestamp: nowIso,
      category: 'medicine_updated',
      actor: 'Household Caregiver',
      entityType: 'family',
      entityId: 'household-root',
      title: 'New Household Started',
      details: 'Sample demo data cleared. Your household is ready for adding your family members and prescriptions.'
    }]);
  };

  const loadDemoData = () => {
    setIsDemoMode(true);
    setFamilyMembers(initialFamilyMembers);
    setMedicines(initialMedicines);
    setDoses(initialDoses);
    setStockBatches(initialBatches);
    setStockTransactions(initialTransactions);
    setRefillOrders(initialRefillOrders);
    setAuditLogs(initialAuditLogs);
    setActiveCaregiver('David Pendelton (Primary Caregiver)');
  };

  const value = {
    familyMembers,
    medicines,
    doses,
    stockBatches,
    stockTransactions,
    refillOrders,
    auditLogs,
    stockSummaries,
    activeCaregiver,
    setActiveCaregiver,
    isDemoMode,
    startFreshHousehold,
    loadDemoData,
    deleteFamilyMember,
    deleteMedicine,
    recordDoseStatus,
    correctDoseStatus,
    toggleReminderAcknowledgment,
    registerMedicine,
    updateMedicineThresholds,
    adjustStockQuantity,
    createRefillOrder,
    receiveRefillOrder,
    updateRefillOrderStatus,
    addFamilyMember,
    updateFamilyMember
  };

  return (
    <MediHomeContext.Provider value={value}>
      {children}
    </MediHomeContext.Provider>
  );
}

export function useMediHome() {
  const ctx = useContext(MediHomeContext);
  if (!ctx) {
    throw new Error('useMediHome must be used within a MediHomeProvider');
  }
  return ctx;
}
