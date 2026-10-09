export type RelationshipType = 
  | 'Self' 
  | 'Spouse' 
  | 'Child' 
  | 'Parent' 
  | 'Grandparent' 
  | 'Other';

export interface FamilyMember {
  id: string;
  fullName: string;
  relationship: RelationshipType;
  dateOfBirth: string; // YYYY-MM-DD
  allergies: string[];
  primaryDoctor?: {
    name: string;
    phone: string;
    clinic: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
  avatarColor: string; // Hex or theme color for quick family member visual identification
  createdAt: string;
  updatedAt: string;
}

export type FamilyMemberFormData = Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>;
