import { MedicineRegistrationFormData } from '../types/medicine';
import { FamilyMemberFormData } from '../types/family';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateMedicineRegistration(data: MedicineRegistrationFormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Medicine name is required (minimum 2 characters)';
  }

  if (!data.familyMemberId) {
    errors.familyMemberId = 'Please assign this medicine to a family member';
  }

  if (!data.strength || data.strength.trim().length === 0) {
    errors.strength = 'Strength is required (e.g., 20 mg, 500 mg, 100 mcg)';
  }

  if (!data.dosageForm) {
    errors.dosageForm = 'Dosage form is required';
  }

  if (!data.unit) {
    errors.unit = 'Dosage unit is required';
  }

  if (!data.prescribedInstructions || data.prescribedInstructions.trim().length < 5) {
    errors.prescribedInstructions = 'Prescribed instructions must be recorded verbatim from prescription label';
  }

  if (!data.schedule) {
    errors.schedule = 'Schedule details are required';
  } else {
    if (data.schedule.doseAmount <= 0) {
      errors.doseAmount = 'Dose amount must be greater than zero';
    }
    if (data.schedule.frequency !== 'as-needed' && (!data.schedule.scheduledTimes || data.schedule.scheduledTimes.length === 0)) {
      errors.scheduledTimes = 'At least one scheduled administration time is required';
    }
    if (!data.schedule.startDate) {
      errors.startDate = 'Schedule start date is required';
    }
  }

  if (data.reorderThreshold < 0) {
    errors.reorderThreshold = 'Reorder threshold cannot be negative';
  }

  if (data.safetyBufferDays < 1) {
    errors.safetyBufferDays = 'Safety buffer must be at least 1 day';
  }

  if (data.initialStock) {
    if (data.initialStock.quantity < 0) {
      errors.initialStockQuantity = 'Initial stock quantity cannot be negative';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateFamilyMember(data: FamilyMemberFormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = 'Full name is required (minimum 2 characters)';
  }

  if (!data.relationship) {
    errors.relationship = 'Relationship is required';
  }

  if (!data.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  } else {
    const dob = new Date(data.dateOfBirth);
    if (isNaN(dob.getTime()) || dob > new Date()) {
      errors.dateOfBirth = 'Date of birth must be a valid date in the past';
    }
  }

  if (!data.emergencyContact?.name || data.emergencyContact.name.trim().length < 2) {
    errors.emergencyContactName = 'Emergency contact name is required';
  }

  if (!data.emergencyContact?.phone || data.emergencyContact.phone.trim().length < 5) {
    errors.emergencyContactPhone = 'Emergency contact telephone number is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateDoseCorrection(reason: string, performedBy: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!reason || reason.trim().length < 3) {
    errors.reason = 'A clinical reason is strictly required when altering historical dose records';
  }

  if (!performedBy || performedBy.trim().length < 2) {
    errors.performedBy = 'Caregiver or actor name is required for clinical audit integrity';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
