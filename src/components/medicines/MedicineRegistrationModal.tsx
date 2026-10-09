import React, { useState } from 'react';
import { useMediHome } from '../../context/MediHomeContext';
import { Modal } from '../common/Modal';
import {
  DosageForm,
  DosageUnit,
  ScheduleFrequency,
  FoodRelation,
  MedicineRegistrationFormData
} from '../../types/medicine';
import { validateMedicineRegistration } from '../../utils/validation';
import { Pill, ShieldAlert, Plus, Trash2 } from 'lucide-react';

interface MedicineRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMemberId?: string;
}

export const MedicineRegistrationModal: React.FC<MedicineRegistrationModalProps> = ({
  isOpen,
  onClose,
  defaultMemberId
}) => {
  const { familyMembers, registerMedicine } = useMediHome();

  const todayStr = new Date().toISOString().split('T')[0];

  const [familyMemberId, setFamilyMemberId] = useState(defaultMemberId || (familyMembers[0]?.id || ''));
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [strength, setStrength] = useState('');
  const [dosageForm, setDosageForm] = useState<DosageForm>('Tablet');
  const [unit, setUnit] = useState<DosageUnit>('tablets');
  const [prescribedInstructions, setPrescribedInstructions] = useState('');
  const [prescribingDoctor, setPrescribingDoctor] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [indication, setIndication] = useState('');

  // Schedule
  const [frequency, setFrequency] = useState<ScheduleFrequency>('once-daily');
  const [scheduledTimes, setScheduledTimes] = useState<string[]>(['08:00']);
  const [doseAmount, setDoseAmount] = useState<number>(1);
  const [foodRelation, setFoodRelation] = useState<FoodRelation>('with-food');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState('');

  // Optional Initial Stock
  const [hasInitialStock, setHasInitialStock] = useState(true);
  const [initialQuantity, setInitialQuantity] = useState<number>(30);
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [storageLocation, setStorageLocation] = useState('Main Medicine Cabinet');

  // Safety Stock Thresholds
  const [reorderThreshold, setReorderThreshold] = useState<number>(10);
  const [safetyBufferDays, setSafetyBufferDays] = useState<number>(7);
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync unit when dosage form changes
  const handleFormChange = (newForm: DosageForm) => {
    setDosageForm(newForm);
    switch (newForm) {
      case 'Tablet': setUnit('tablets'); break;
      case 'Capsule': setUnit('capsules'); break;
      case 'Syrup / Liquid': setUnit('ml'); break;
      case 'Inhaler': setUnit('puffs'); break;
      case 'Drops': setUnit('drops'); break;
      case 'Topical Cream': setUnit('applications'); break;
      case 'Injection': setUnit('units'); break;
      case 'Sachet / Powder': setUnit('sachets'); break;
    }
  };

  // Sync default times based on frequency
  const handleFrequencyChange = (newFreq: ScheduleFrequency) => {
    setFrequency(newFreq);
    switch (newFreq) {
      case 'once-daily':
        setScheduledTimes(['08:00']);
        break;
      case 'twice-daily':
        setScheduledTimes(['08:00', '20:00']);
        break;
      case 'three-times-daily':
        setScheduledTimes(['08:00', '14:00', '20:00']);
        break;
      case 'four-times-daily':
        setScheduledTimes(['08:00', '12:00', '16:00', '20:00']);
        break;
      case 'as-needed':
        setScheduledTimes(['12:00']);
        break;
      case 'every-other-day':
      case 'weekly':
        setScheduledTimes(['08:00']);
        break;
      default:
        setScheduledTimes(['08:00']);
        break;
    }
  };

  const handleAddTime = () => {
    setScheduledTimes([...scheduledTimes, '12:00']);
  };

  const handleRemoveTime = (index: number) => {
    setScheduledTimes(scheduledTimes.filter((_, idx) => idx !== index));
  };

  const handleTimeChange = (index: number, val: string) => {
    const updated = [...scheduledTimes];
    updated[index] = val;
    setScheduledTimes(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData: MedicineRegistrationFormData = {
      familyMemberId,
      name,
      brandName: brandName || undefined,
      strength,
      dosageForm,
      unit,
      prescribedInstructions,
      prescribingDoctor: prescribingDoctor || undefined,
      pharmacyName: pharmacyName || undefined,
      indication: indication || undefined,
      schedule: {
        frequency,
        scheduledTimes,
        doseAmount,
        foodRelation,
        startDate,
        endDate: endDate || undefined
      },
      initialStock: hasInitialStock ? {
        quantity: initialQuantity,
        batchNumber: batchNumber || undefined,
        expiryDate: expiryDate || undefined,
        location: storageLocation || undefined
      } : undefined,
      reorderThreshold,
      safetyBufferDays,
      notes: notes || undefined
    };

    const validation = validateMedicineRegistration(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    registerMedicine(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Family Medication"
      subtitle="Record prescription details, dosage regimen and initial stock"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Warning banner regarding verbatim instructions */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-teal-50/70 border border-teal-200/80 text-xs text-teal-950">
          <ShieldAlert className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <div>
            <strong>Prescription Integrity Rule:</strong> Prescribed instructions must be recorded
            verbatim as printed on the official prescription label or physician directive.
            Never paraphrase or generate synthetic dosages.
          </div>
        </div>

        {/* Section 1: Member & Basic Drug Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Medication Identity</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Family Member <span className="text-rose-500">*</span>
              </label>
              <select
                value={familyMemberId}
                onChange={(e) => setFamilyMemberId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                {familyMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.relationship})
                  </option>
                ))}
              </select>
              {errors.familyMemberId && <p className="text-xs text-rose-600 mt-0.5">{errors.familyMemberId}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Medicine Name (Generic or Official) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amoxicillin, Atorvastatin, Ventolin"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.name && <p className="text-xs text-rose-600 mt-0.5">{errors.name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Brand / Trade Name (Optional)
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Lipitor, Norvasc, Amoxil"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Strength <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                placeholder="e.g. 20 mg, 500 mg, 250mg/5ml"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.strength && <p className="text-xs text-rose-600 mt-0.5">{errors.strength}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Dosage Form <span className="text-rose-500">*</span>
              </label>
              <select
                value={dosageForm}
                onChange={(e) => handleFormChange(e.target.value as DosageForm)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup / Liquid">Syrup / Oral Liquid</option>
                <option value="Inhaler">Inhaler</option>
                <option value="Drops">Eye / Ear / Nasal Drops</option>
                <option value="Topical Cream">Topical Cream / Ointment</option>
                <option value="Injection">Injection</option>
                <option value="Sachet / Powder">Sachet / Powder</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Prescribed Instructions (Verbatim) */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-800">
            Prescribed Instructions (Verbatim from Prescription Label) <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={2}
            value={prescribedInstructions}
            onChange={(e) => setPrescribedInstructions(e.target.value)}
            placeholder="e.g. Take 1 tablet once daily in the evening with food. Do not chew or crush."
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {errors.prescribedInstructions && (
            <p className="text-xs text-rose-600">{errors.prescribedInstructions}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Prescribing Physician
              </label>
              <input
                type="text"
                value={prescribingDoctor}
                onChange={(e) => setPrescribingDoctor(e.target.value)}
                placeholder="Dr. Clara Vance, MD"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Dispensing Pharmacy
              </label>
              <input
                type="text"
                value={pharmacyName}
                onChange={(e) => setPharmacyName(e.target.value)}
                placeholder="Walgreens #4192"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Clinical Indication
              </label>
              <input
                type="text"
                value={indication}
                onChange={(e) => setIndication(e.target.value)}
                placeholder="e.g. Hypertension"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Schedule Configuration */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Dosage Schedule</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Frequency <span className="text-rose-500">*</span>
              </label>
              <select
                value={frequency}
                onChange={(e) => handleFrequencyChange(e.target.value as ScheduleFrequency)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="once-daily">Once Daily</option>
                <option value="twice-daily">Twice Daily (Morning & Evening)</option>
                <option value="three-times-daily">Three Times Daily</option>
                <option value="four-times-daily">Four Times Daily</option>
                <option value="every-other-day">Every Other Day</option>
                <option value="weekly">Weekly</option>
                <option value="as-needed">As Needed (PRN)</option>
                <option value="custom">Custom Schedule</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Dose Amount ({unit}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                required
                value={doseAmount}
                onChange={(e) => setDoseAmount(parseFloat(e.target.value) || 1)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              />
              {errors.doseAmount && <p className="text-xs text-rose-600 mt-0.5">{errors.doseAmount}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Relation to Food <span className="text-rose-500">*</span>
              </label>
              <select
                value={foodRelation}
                onChange={(e) => setFoodRelation(e.target.value as FoodRelation)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="with-food">With Food / Meal</option>
                <option value="before-food">Before Food (30m prior)</option>
                <option value="after-food">After Food (Post-meal)</option>
                <option value="empty-stomach">Empty Stomach (1h before / 2h after)</option>
                <option value="unrelated">Unrelated to Meals</option>
              </select>
            </div>
          </div>

          {/* Scheduled Times Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Scheduled Daily Administration Times:
              </label>
              <button
                type="button"
                onClick={handleAddTime}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700"
              >
                <Plus className="w-3 h-3" />
                <span>Add Time</span>
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {scheduledTimes.map((time, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(idx, e.target.value)}
                    className="text-xs font-mono bg-transparent focus:outline-none text-slate-800"
                  />
                  {scheduledTimes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(idx)}
                      className="p-0.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove time"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.scheduledTimes && <p className="text-xs text-rose-600 mt-1">{errors.scheduledTimes}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                End Date (Optional for courses)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Initial Stock & Refill Thresholds */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">3. Stock Register & Refill Thresholds</h3>
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasInitialStock}
                onChange={(e) => setHasInitialStock(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span>Record Initial Stock Now</span>
            </label>
          </div>

          {hasInitialStock && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 mb-1">
                    Initial Quantity ({unit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={initialQuantity}
                    onChange={(e) => setInitialQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 mb-1">
                    Batch / Lot Number
                  </label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="e.g. LOT-49210"
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 mb-1">
                    Batch Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-800 mb-1">
                  Storage Location
                </label>
                <input
                  type="text"
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  placeholder="e.g. Main Kitchen Cabinet, Refrigerator Top Shelf"
                  className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Reorder Threshold Quantity ({unit})
              </label>
              <input
                type="number"
                min="0"
                value={reorderThreshold}
                onChange={(e) => setReorderThreshold(parseInt(e.target.value) || 0)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-0.5">Triggers low-stock warning when current balance hits this level</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Safety Buffer (Days of Supply)
              </label>
              <input
                type="number"
                min="1"
                value={safetyBufferDays}
                onChange={(e) => setSafetyBufferDays(parseInt(e.target.value) || 7)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-0.5">Target buffer time for pharmacy fulfillment</p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Complete Registration</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
