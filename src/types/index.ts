export type Category = 
  | 'Cardiac & BP'
  | 'Anti-Diabetic'
  | 'Gastro & Acidity'
  | 'Pain & Fever'
  | 'Antibiotics'
  | 'Respiratory & Allergy'
  | 'Vitamins & Minerals'
  | 'Neuro & CNS';

export type ScheduleType = 'OTC' | 'Schedule H' | 'Schedule H1';

export interface BrandedAlternative {
  brandName: string;
  manufacturer: string;
  packSize: number;
  mrp: number;
}

export interface SalesMetrics {
  annualStripsSold: number; // in strips (e.g., 42000000)
  monthlyStripsSold: number;
  annualTurnoverCrores: number; // ₹ Cr
  nationalRank: number; // #1 to #65
  demandTag: 'Top Fast-Moving' | 'Chronic Essential' | 'High Volume' | 'Steady Demand' | 'Seasonal Peak';
  monthlyTrend12M: number[]; // 12 months strips in lakhs
}

export interface Medicine {
  id: string;
  pmbjpCode: string; // e.g. "612"
  genericName: string; // e.g. "Paracetamol Tablets IP 650mg"
  saltComposition: string; // e.g. "Paracetamol 650mg"
  category: Category;
  dosageForm: 'Tablet' | 'Capsule' | 'Softgel' | 'Suspension' | 'Inhaler';
  packSize: number;
  janAushadhiMrp: number; // ₹
  brandedAlternatives: BrandedAlternative[];
  scheduleType: ScheduleType;
  indication: string;
  commonSideEffects: string[];
  storageTips: string;
  salesMetrics: SalesMetrics;
}

export interface BasketItem {
  medicine: Medicine;
  quantityStrips: number;
  dosagePattern: '1-0-1' | '1-1-1' | '0-0-1' | '1-0-0' | 'As Needed';
  selectedBrandAlternative?: BrandedAlternative;
}

export interface Reminder {
  id: string;
  medicineName: string;
  pmbjpCode?: string;
  timeSlots: ('Morning' | 'Afternoon' | 'Night')[];
  specificTime: string; // "08:00"
  dosage: string; // "1 tablet"
  isActive: boolean;
  notes?: string;
}

export interface UserSession {
  email: string;
  name: string;
  avatarUrl: string;
  authProvider: 'google' | 'guest';
  loginTime: string;
  appPassword?: string;
  citizenId?: string;
}

export type Language = 'EN' | 'HI' | 'KN';

export interface InteractionAlert {
  type: 'duplicate_salt' | 'clinical_interaction';
  severity: 'high' | 'moderate' | 'caution';
  title: string;
  description: string;
  medicinesInvolved: string[];
}
