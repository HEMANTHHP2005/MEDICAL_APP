import { Medicine } from '../types/medicine';

/**
 * Calculates the expected daily consumption rate based on scheduled dosage.
 */
export function calculateDailyBurnRate(medicine: Medicine): number {
  const { schedule } = medicine;
  const dose = schedule.doseAmount || 1;

  switch (schedule.frequency) {
    case 'once-daily':
      return dose;
    case 'twice-daily':
      return dose * 2;
    case 'three-times-daily':
      return dose * 3;
    case 'four-times-daily':
      return dose * 4;
    case 'every-other-day':
      return dose * 0.5;
    case 'weekly':
      return dose / 7;
    case 'as-needed':
      // PRN/as-needed medications estimate an average 1 dose daily if PRN, or based on times
      return schedule.scheduledTimes.length > 0 ? schedule.scheduledTimes.length * dose : 1;
    case 'custom':
      return (schedule.scheduledTimes.length || 1) * dose;
    default:
      return dose;
  }
}

/**
 * Calculates remaining days of medication supply.
 */
export function calculateDaysOfSupply(currentStock: number, dailyBurnRate: number): number {
  if (currentStock <= 0) return 0;
  if (dailyBurnRate <= 0) return 999;
  return Math.floor(currentStock / dailyBurnRate);
}

/**
 * Estimates the date on which stock will be fully exhausted.
 */
export function calculateRunoutDate(
  currentStock: number, 
  dailyBurnRate: number, 
  startDate: Date = new Date()
): string | null {
  if (currentStock <= 0) {
    return startDate.toISOString().split('T')[0];
  }
  if (dailyBurnRate <= 0) {
    return null;
  }
  const days = calculateDaysOfSupply(currentStock, dailyBurnRate);
  if (days >= 999) return null;

  const targetDate = new Date(startDate.getTime());
  targetDate.setDate(targetDate.getDate() + days);
  return targetDate.toISOString().split('T')[0];
}

/**
 * Computes safety stock urgency.
 */
export function getStockHealthStatus(
  currentStock: number, 
  reorderThreshold: number, 
  daysOfSupply: number, 
  safetyBufferDays: number
): 'depleted' | 'critical' | 'low' | 'normal' {
  if (currentStock <= 0) {
    return 'depleted';
  }
  if (daysOfSupply <= 2 || currentStock <= Math.max(1, Math.floor(reorderThreshold * 0.4))) {
    return 'critical';
  }
  if (currentStock <= reorderThreshold || daysOfSupply <= safetyBufferDays) {
    return 'low';
  }
  return 'normal';
}
