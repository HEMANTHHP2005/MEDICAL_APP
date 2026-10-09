import { describe, it, expect } from 'vitest';
import { calculateDailyBurnRate, calculateDaysOfSupply, calculateRunoutDate, getStockHealthStatus } from '../utils/calculations';
import { Medicine } from '../types/medicine';

describe('MediHome Stock & Consumption Calculations', () => {
  const dummyMedicine: Medicine = {
    id: 'med-test',
    familyMemberId: 'fam-1',
    name: 'Metformin',
    strength: '500 mg',
    dosageForm: 'Tablet',
    unit: 'tablets',
    prescribedInstructions: 'Take 1 tablet twice daily',
    schedule: {
      frequency: 'twice-daily',
      scheduledTimes: ['08:00', '20:00'],
      doseAmount: 1,
      foodRelation: 'with-food',
      startDate: '2026-01-01'
    },
    currentStock: 20,
    reorderThreshold: 14,
    safetyBufferDays: 7,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  };

  it('calculates daily burn rate accurately based on frequency', () => {
    // Twice daily with 1 tablet dose = 2 tablets/day
    expect(calculateDailyBurnRate(dummyMedicine)).toBe(2);

    // Three times daily with 5ml dose = 15ml/day
    const liquidMed: Medicine = {
      ...dummyMedicine,
      schedule: {
        ...dummyMedicine.schedule,
        frequency: 'three-times-daily',
        doseAmount: 5
      }
    };
    expect(calculateDailyBurnRate(liquidMed)).toBe(15);

    // Once daily with 1 tablet dose = 1 tablet/day
    const onceMed: Medicine = {
      ...dummyMedicine,
      schedule: {
        ...dummyMedicine.schedule,
        frequency: 'once-daily',
        doseAmount: 1
      }
    };
    expect(calculateDailyBurnRate(onceMed)).toBe(1);
  });

  it('calculates days of supply remaining correctly', () => {
    // 20 tablets at 2 per day = 10 days
    expect(calculateDaysOfSupply(20, 2)).toBe(10);
    // 5 tablets at 2 per day = 2 days
    expect(calculateDaysOfSupply(5, 2)).toBe(2);
    // 0 stock = 0 days
    expect(calculateDaysOfSupply(0, 2)).toBe(0);
  });

  it('calculates runout date correctly from a fixed reference date', () => {
    const refDate = new Date('2026-10-10T12:00:00.000Z');
    // 20 tablets / 2 daily = 10 days -> 2026-10-20
    const runout = calculateRunoutDate(20, 2, refDate);
    expect(runout).toBe('2026-10-20');
  });

  it('correctly determines stock health alerts', () => {
    // 0 stock => depleted
    expect(getStockHealthStatus(0, 10, 0, 7)).toBe('depleted');
    // 3 tablets with threshold 10 and 1.5 days supply => critical
    expect(getStockHealthStatus(3, 10, 1.5, 7)).toBe('critical');
    // 8 tablets with threshold 10 and 4 days supply => low
    expect(getStockHealthStatus(8, 10, 4, 7)).toBe('low');
    // 50 tablets with threshold 10 and 25 days supply => normal
    expect(getStockHealthStatus(50, 10, 25, 7)).toBe('normal');
  });
});
