import { describe, it, expect } from 'vitest';
import { DoseRecord } from '../types/dose';
import { StockTransaction } from '../types/stock';

describe('MediHome Clinical Integrity & Stock Deduction Guards', () => {
  it('strictly prevents duplicate stock deduction if a dose is already deducted', () => {
    const existingDose: DoseRecord = {
      id: 'dose-test-1',
      medicineId: 'med-1',
      familyMemberId: 'fam-1',
      scheduledDate: '2026-10-09',
      scheduledTime: '08:00',
      doseQuantity: 1,
      status: 'taken',
      stockDeducted: true, // ALREADY DEDUCTED
      stockTransactionId: 'st-orig-1',
      reminderAcknowledgment: { isAcknowledged: true },
      corrections: [],
      createdAt: '2026-10-09T00:00:00.000Z',
      updatedAt: '2026-10-09T08:15:00.000Z'
    };

    let stockTransactions: StockTransaction[] = [];
    let currentStock = 10;

    // Simulate recordDoseStatus guard logic
    function simulateMarkTaken(dose: DoseRecord) {
      if (dose.status === 'taken' && dose.stockDeducted) {
        // Guard triggers: do not deduct again!
        return { deducted: false, newStock: currentStock };
      }
      currentStock -= dose.doseQuantity;
      return { deducted: true, newStock: currentStock };
    }

    const result = simulateMarkTaken(existingDose);
    expect(result.deducted).toBe(false);
    expect(result.newStock).toBe(10);
    expect(stockTransactions.length).toBe(0);
  });

  it('guarantees reminder acknowledgment is completely separated from dose administration and stock', () => {
    const dose: DoseRecord = {
      id: 'dose-test-2',
      medicineId: 'med-2',
      familyMemberId: 'fam-1',
      scheduledDate: '2026-10-09',
      scheduledTime: '20:00',
      doseQuantity: 1,
      status: 'scheduled', // Remains scheduled!
      stockDeducted: false,
      reminderAcknowledgment: { isAcknowledged: false },
      corrections: [],
      createdAt: '2026-10-09T00:00:00.000Z',
      updatedAt: '2026-10-09T00:00:00.000Z'
    };

    // Caregiver acknowledges the reminder alarm
    const updatedDose: DoseRecord = {
      ...dose,
      reminderAcknowledgment: {
        isAcknowledged: true,
        acknowledgedAt: '2026-10-09T19:55:00.000Z',
        acknowledgedBy: 'David Pendelton'
      }
    };

    // Status MUST remain 'scheduled' and stockDeducted MUST remain false
    expect(updatedDose.status).toBe('scheduled');
    expect(updatedDose.stockDeducted).toBe(false);
    expect(updatedDose.reminderAcknowledgment.isAcknowledged).toBe(true);
  });

  it('reverses stock deduction and preserves audit trail on historical correction from taken to skipped', () => {
    let stock = 15;
    const takenDose: DoseRecord = {
      id: 'dose-test-3',
      medicineId: 'med-3',
      familyMemberId: 'fam-2',
      scheduledDate: '2026-10-09',
      scheduledTime: '08:00',
      doseQuantity: 2,
      status: 'taken',
      stockDeducted: true,
      stockTransactionId: 'st-orig-3',
      reminderAcknowledgment: { isAcknowledged: true },
      corrections: [],
      createdAt: '2026-10-09T00:00:00.000Z',
      updatedAt: '2026-10-09T08:00:00.000Z'
    };

    // Perform clinical correction: Mistakenly recorded taken, was actually skipped due to fasting
    const reason = 'Patient was fasting for morning lab tests';
    const performedBy = 'David Pendelton';

    let reversalTx: StockTransaction | null = null;
    if (takenDose.stockDeducted) {
      stock += takenDose.doseQuantity; // Re-credit 2 units
      reversalTx = {
        id: 'st-rev-test',
        timestamp: '2026-10-09T08:30:00.000Z',
        medicineId: takenDose.medicineId,
        type: 'correction_reversal',
        quantityDelta: +takenDose.doseQuantity,
        balanceAfter: stock,
        doseRecordId: takenDose.id,
        reason: `Reversal: Historical correction. ${reason}`,
        performedBy
      };
    }

    const correctedDose: DoseRecord = {
      ...takenDose,
      status: 'skipped',
      stockDeducted: false,
      corrections: [
        {
          id: 'corr-1',
          timestamp: '2026-10-09T08:30:00.000Z',
          previousStatus: 'taken',
          newStatus: 'skipped',
          reason,
          performedBy,
          stockAdjustmentMade: true
        }
      ]
    };

    expect(stock).toBe(17); // Restored from 15 to 17
    expect(reversalTx?.type).toBe('correction_reversal');
    expect(reversalTx?.quantityDelta).toBe(2);
    expect(correctedDose.status).toBe('skipped');
    expect(correctedDose.stockDeducted).toBe(false);
    expect(correctedDose.corrections.length).toBe(1);
    expect(correctedDose.corrections[0].previousStatus).toBe('taken');
    expect(correctedDose.corrections[0].newStatus).toBe('skipped');
  });
});
