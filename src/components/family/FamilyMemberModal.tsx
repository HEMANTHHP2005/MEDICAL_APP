import React, { useState, useEffect } from 'react';
import { useMediHome } from '../../context/MediHomeContext';
import { FamilyMember, FamilyMemberFormData, RelationshipType } from '../../types/family';
import { Modal } from '../common/Modal';
import { validateFamilyMember } from '../../utils/validation';
import { calculateAge } from '../../utils/formatters';
import { User, ShieldAlert, HeartHandshake } from 'lucide-react';

interface FamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: FamilyMember | null;
}

export const FamilyMemberModal: React.FC<FamilyMemberModalProps> = ({
  isOpen,
  onClose,
  memberToEdit
}) => {
  const { addFamilyMember, updateFamilyMember } = useMediHome();

  const [fullName, setFullName] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('Self');
  const [dateOfBirth, setDateOfBirth] = useState('1985-05-15');
  const [allergiesInput, setAllergiesInput] = useState('');
  const [docName, setDocName] = useState('');
  const [docPhone, setDocPhone] = useState('');
  const [docClinic, setDocClinic] = useState('');
  const [emName, setEmName] = useState('');
  const [emPhone, setEmPhone] = useState('');
  const [emRel, setEmRel] = useState('Spouse');
  const [notes, setNotes] = useState('');
  const [avatarColor, setAvatarColor] = useState('#0d9488');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (memberToEdit) {
      setFullName(memberToEdit.fullName);
      setRelationship(memberToEdit.relationship);
      setDateOfBirth(memberToEdit.dateOfBirth);
      setAllergiesInput(memberToEdit.allergies.join(', '));
      setDocName(memberToEdit.primaryDoctor?.name || '');
      setDocPhone(memberToEdit.primaryDoctor?.phone || '');
      setDocClinic(memberToEdit.primaryDoctor?.clinic || '');
      setEmName(memberToEdit.emergencyContact.name);
      setEmPhone(memberToEdit.emergencyContact.phone);
      setEmRel(memberToEdit.emergencyContact.relationship);
      setNotes(memberToEdit.notes || '');
      setAvatarColor(memberToEdit.avatarColor);
    } else {
      setFullName('');
      setRelationship('Self');
      setDateOfBirth('1985-05-15');
      setAllergiesInput('');
      setDocName('');
      setDocPhone('');
      setDocClinic('');
      setEmName('');
      setEmPhone('');
      setEmRel('Spouse');
      setNotes('');
      setAvatarColor('#0d9488');
    }
    setErrors({});
  }, [memberToEdit, isOpen]);

  const palette = ['#0284c7', '#0d9488', '#7c3aed', '#ea580c', '#059669', '#e11d48'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const allergiesArray = allergiesInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const formData: FamilyMemberFormData = {
      fullName: fullName.trim(),
      relationship,
      dateOfBirth,
      allergies: allergiesArray.length > 0 ? allergiesArray : ['None known'],
      primaryDoctor: docName ? {
        name: docName.trim(),
        phone: docPhone.trim(),
        clinic: docClinic.trim()
      } : undefined,
      emergencyContact: {
        name: emName.trim(),
        phone: emPhone.trim(),
        relationship: emRel.trim()
      },
      notes: notes.trim() || undefined,
      avatarColor
    };

    const validation = validateFamilyMember(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (memberToEdit) {
      updateFamilyMember(memberToEdit.id, formData);
    } else {
      addFamilyMember(formData);
    }

    onClose();
  };

  const calculatedAge = dateOfBirth ? calculateAge(dateOfBirth) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={memberToEdit ? 'Edit Family Profile' : 'Add Family Member'}
      subtitle="Register personal details, known allergies and emergency medical contacts"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name and Relationship */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Full Legal Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Arthur Pendelton"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {errors.fullName && <p className="text-xs text-rose-600 mt-0.5">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Household Relationship <span className="text-rose-500">*</span>
            </label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value as RelationshipType)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="Self">Self (Primary User)</option>
              <option value="Spouse">Spouse / Partner</option>
              <option value="Child">Child / Dependent</option>
              <option value="Parent">Parent</option>
              <option value="Grandparent">Grandparent</option>
              <option value="Other">Other Family Member</option>
            </select>
          </div>
        </div>

        {/* DOB & Color Avatar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-800">
                Date of Birth <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs font-mono text-slate-500">
                Age: {calculatedAge} yrs
              </span>
            </div>
            <input
              type="date"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
            {errors.dateOfBirth && <p className="text-xs text-rose-600 mt-0.5">{errors.dateOfBirth}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Profile Avatar Color
            </label>
            <div className="flex items-center gap-2 pt-0.5">
              {palette.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAvatarColor(color)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    avatarColor === color ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Allergies */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Known Drug & Food Allergies
          </label>
          <input
            type="text"
            value={allergiesInput}
            onChange={(e) => setAllergiesInput(e.target.value)}
            placeholder="e.g. Penicillin (severe hives), Latex, Aspirin (or leave blank if none)"
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <p className="text-[11px] text-slate-500 mt-0.5">
            Separate multiple allergies with commas. Marked with safety banners across dosage screens.
          </p>
        </div>

        {/* Emergency Contact */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
            <span>Emergency Contact Information</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Contact Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={emName}
                onChange={(e) => setEmName(e.target.value)}
                placeholder="David Pendelton"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
              {errors.emergencyContactName && <p className="text-[11px] text-rose-600 mt-0.5">{errors.emergencyContactName}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={emPhone}
                onChange={(e) => setEmPhone(e.target.value)}
                placeholder="(555) 301-4422"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
              {errors.emergencyContactPhone && <p className="text-[11px] text-rose-600 mt-0.5">{errors.emergencyContactPhone}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Relationship
              </label>
              <input
                type="text"
                value={emRel}
                onChange={(e) => setEmRel(e.target.value)}
                placeholder="Son / Caregiver"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>
        </div>

        {/* Primary Doctor (Optional) */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
          <h4 className="text-xs font-bold text-slate-700">Primary Physician / Clinic</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Doctor Name</label>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="Dr. Clara Vance, MD"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Clinic / Hospital</label>
              <input
                type="text"
                value={docClinic}
                onChange={(e) => setDocClinic(e.target.value)}
                placeholder="St. Jude Geriatric Care"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Office Telephone</label>
              <input
                type="tel"
                value={docPhone}
                onChange={(e) => setDocPhone(e.target.value)}
                placeholder="(555) 234-8910"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Care Notes / Special Instructions
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Swallowing difficulties; prefers liquid drops over large tablets; takes with applesauce"
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            <span>{memberToEdit ? 'Save Changes' : 'Create Profile'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
