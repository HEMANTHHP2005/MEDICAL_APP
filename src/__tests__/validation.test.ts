import { describe, it, expect } from 'vitest';
import { validateMedicineRegistration, validateFamilyMember, validateDoseCorrection } from '../utils/validation';
import { MedicineRegistrationFormData } from '../types/medicine';
import { FamilyMemberFormData } from '../types/family';

describe('MediHome Input Validation & Safety Constraints', () => {
  it('enforces mandatory verbatim prescribed instructions and valid dosages', () => {
    const invalidForm: MedicineRegistrationFormData = {
      familyMemberId: '',
      name: '',
      strength: '',
      dosageForm: 'Tablet',
      unit: 'tablets',
      prescribedInstructions: '', // Empty instructions
      schedule: {
        frequency: 'once-daily',
        scheduledTimes: [],
        doseAmount: 0, // Invalid zero dose
        foodRelation: 'with-food',
        startDate: ''
      },
      reorderThreshold: -5, // Invalid negative threshold
      safetyBufferDays: 0
    };

    const result = validateMedicineRegistration(invalidForm);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.familyMemberId).toBeDefined();
    expect(result.errors.strength).toBeDefined();
    expect(result.errors.prescribedInstructions).toContain('verbatim');
    expect(result.errors.doseAmount).toBeDefined();
    expect(result.errors.scheduledTimes).toBeDefined();
    expect(result.errors.reorderThreshold).toBeDefined();
  });

  it('passes validation when correct medicine registration data is provided', () => {
    const validForm: MedicineRegistrationFormData = {
      familyMemberId: 'fam-1',
      name: 'Lisinopril',
      strength: '10 mg',
      dosageForm: 'Tablet',
      unit: 'tablets',
      prescribedInstructions: 'Take 1 tablet every morning with water as prescribed by physician.',
      schedule: {
        frequency: 'once-daily',
        scheduledTimes: ['08:00'],
        doseAmount: 1,
        foodRelation: 'unrelated',
        startDate: '2026-10-09'
      },
      reorderThreshold: 10,
      safetyBufferDays: 7
    };

    const result = validateMedicineRegistration(validForm);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('requires reason and actor name for dose corrections to preserve audit accountability', () => {
    const blankCorrection = validateDoseCorrection('', '');
    expect(blankCorrection.isValid).toBe(false);
    expect(blankCorrection.errors.reason).toBeDefined();
    expect(blankCorrection.errors.performedBy).toBeDefined();

    const validCorrection = validateDoseCorrection('Fasting for blood glucose check', 'David Pendelton');
    expect(validCorrection.isValid).toBe(true);
  });

  it('validates family member profile completeness', () => {
    const validMember: FamilyMemberFormData = {
      fullName: 'Arthur Pendelton',
      relationship: 'Parent',
      dateOfBirth: '1954-04-12',
      allergies: ['Penicillin'],
      emergencyContact: {
        name: 'David Pendelton',
        phone: '555-0192',
        relationship: 'Son'
      },
      avatarColor: '#0284c7'
    };

    const res = validateFamilyMember(validMember);
    expect(res.isValid).toBe(true);

    const invalidMember: FamilyMemberFormData = {
      fullName: '',
      relationship: 'Other',
      dateOfBirth: '2099-01-01', // Future date
      allergies: [],
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      },
      avatarColor: '#0284c7'
    };

    const badRes = validateFamilyMember(invalidMember);
    expect(badRes.isValid).toBe(false);
    expect(badRes.errors.fullName).toBeDefined();
    expect(badRes.errors.dateOfBirth).toBeDefined();
    expect(badRes.errors.emergencyContactName).toBeDefined();
  });
});
