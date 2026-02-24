/**
 * @module benefitsService
 * @description ESS Benefits Enrollment — plan data, enrollment CRUD, premium calculation
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ── Types ──────────────────────────────────────────────────────────────────────

export type BenefitCategory = 'health' | 'dental' | 'vision' | 'life' | 'disability' | 'fsa_hsa';
export type CoverageLevel = 'employee_only' | 'employee_spouse' | 'employee_children' | 'family';
export type PlanTier = 'basic' | 'gold' | 'platinum';

export interface BenefitPlan {
  id: string;
  category: BenefitCategory;
  tier: PlanTier;
  name: string;
  description: string;
  carrier: string;
  features: string[];
  isRecommended: boolean;
  premiums: Record<CoverageLevel, { employee: number; employer: number }>;
  deductible: { individual: number; family: number };
  outOfPocketMax: { individual: number; family: number };
  copay: { primaryCare: number; specialist: number; urgentCare: number; emergency: number };
  coinsurance: number; // percentage
}

export interface BenefitDependent {
  id: string;
  firstName: string;
  lastName: string;
  relationship: 'spouse' | 'child' | 'domestic_partner';
  dateOfBirth: string;
  ssn?: string;
  gender: 'male' | 'female' | 'other';
  isStudent?: boolean;
  isDisabled?: boolean;
}

export interface EnrollmentSelection {
  planId: string;
  coverageLevel: CoverageLevel;
  dependentIds: string[];
}

export interface EnrollmentSubmission {
  selections: Record<BenefitCategory, EnrollmentSelection | null>;
  effectiveDate: string;
  enrollmentType: 'annual' | 'new_hire' | 'qualifying_event';
}

export interface EnrollmentWindow {
  id: string;
  name: string;
  type: 'annual' | 'special';
  startDate: string;
  endDate: string;
  effectiveDate: string;
  isActive: boolean;
  daysRemaining: number;
}

export interface CostBreakdown {
  category: BenefitCategory;
  planName: string;
  coverageLevel: CoverageLevel;
  employeeCost: number;
  employerCost: number;
  totalCost: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_PLANS: BenefitPlan[] = [
  // Health
  {
    id: 'h-basic',
    category: 'health',
    tier: 'basic',
    name: 'Essential Care',
    carrier: 'Blue Cross Blue Shield',
    description: 'Coverage for major medical events and preventive care.',
    features: [
      '100% Preventive Care',
      '$5,000 Deductible',
      '20% Co-insurance',
      'Telemedicine Included',
    ],
    isRecommended: false,
    premiums: {
      employee_only: { employee: 0, employer: 450 },
      employee_spouse: { employee: 85, employer: 650 },
      employee_children: { employee: 65, employer: 580 },
      family: { employee: 200, employer: 1000 },
    },
    deductible: { individual: 5000, family: 10000 },
    outOfPocketMax: { individual: 8000, family: 16000 },
    copay: { primaryCare: 30, specialist: 60, urgentCare: 100, emergency: 250 },
    coinsurance: 20,
  },
  {
    id: 'h-gold',
    category: 'health',
    tier: 'gold',
    name: 'Balanced Choice',
    carrier: 'Blue Cross Blue Shield',
    description: 'Lower deductibles and copays for regular visits.',
    features: [
      '100% Preventive Care',
      '$1,500 Deductible',
      '$30 Copay (PCP)',
      'Specialist Referrals',
    ],
    isRecommended: true,
    premiums: {
      employee_only: { employee: 120, employer: 550 },
      employee_spouse: { employee: 220, employer: 800 },
      employee_children: { employee: 180, employer: 720 },
      family: { employee: 350, employer: 1200 },
    },
    deductible: { individual: 1500, family: 3000 },
    outOfPocketMax: { individual: 5000, family: 10000 },
    copay: { primaryCare: 30, specialist: 50, urgentCare: 75, emergency: 200 },
    coinsurance: 15,
  },
  {
    id: 'h-plat',
    category: 'health',
    tier: 'platinum',
    name: 'Premium Health',
    carrier: 'Blue Cross Blue Shield',
    description: 'Maximum coverage with minimal out-of-pocket costs.',
    features: [
      '100% Preventive Care',
      '$500 Deductible',
      '$15 Copay (PCP)',
      'Out-of-Network Coverage',
    ],
    isRecommended: false,
    premiums: {
      employee_only: { employee: 280, employer: 650 },
      employee_spouse: { employee: 420, employer: 950 },
      employee_children: { employee: 360, employer: 870 },
      family: { employee: 580, employer: 1500 },
    },
    deductible: { individual: 500, family: 1000 },
    outOfPocketMax: { individual: 2500, family: 5000 },
    copay: { primaryCare: 15, specialist: 30, urgentCare: 50, emergency: 150 },
    coinsurance: 10,
  },
  // Dental
  {
    id: 'd-basic',
    category: 'dental',
    tier: 'basic',
    name: 'Preventive Dental',
    carrier: 'Delta Dental',
    description: 'Covers cleanings and exams.',
    features: ['2 Cleanings/Year', 'X-Rays Covered', 'No Orthodontia'],
    isRecommended: false,
    premiums: {
      employee_only: { employee: 10, employer: 30 },
      employee_spouse: { employee: 20, employer: 45 },
      employee_children: { employee: 18, employer: 42 },
      family: { employee: 35, employer: 65 },
    },
    deductible: { individual: 50, family: 150 },
    outOfPocketMax: { individual: 1500, family: 3000 },
    copay: { primaryCare: 0, specialist: 25, urgentCare: 0, emergency: 0 },
    coinsurance: 20,
  },
  {
    id: 'd-gold',
    category: 'dental',
    tier: 'gold',
    name: 'Comprehensive Dental',
    carrier: 'Delta Dental',
    description: 'Includes fillings, basic surgery, and major work.',
    features: ['2 Cleanings/Year', '80% Fillings & Root Canals', '50% Major Work ($1500 max)'],
    isRecommended: true,
    premiums: {
      employee_only: { employee: 35, employer: 40 },
      employee_spouse: { employee: 55, employer: 60 },
      employee_children: { employee: 48, employer: 55 },
      family: { employee: 75, employer: 85 },
    },
    deductible: { individual: 25, family: 75 },
    outOfPocketMax: { individual: 1000, family: 2000 },
    copay: { primaryCare: 0, specialist: 15, urgentCare: 0, emergency: 0 },
    coinsurance: 10,
  },
  // Vision
  {
    id: 'v-basic',
    category: 'vision',
    tier: 'basic',
    name: 'Standard Vision',
    carrier: 'VSP Vision',
    description: 'Annual eye exam and discounts.',
    features: ['$10 Exam Copay', '$130 Frame Allowance', 'Lens Discounts'],
    isRecommended: false,
    premiums: {
      employee_only: { employee: 5, employer: 15 },
      employee_spouse: { employee: 10, employer: 22 },
      employee_children: { employee: 8, employer: 20 },
      family: { employee: 18, employer: 30 },
    },
    deductible: { individual: 0, family: 0 },
    outOfPocketMax: { individual: 200, family: 400 },
    copay: { primaryCare: 10, specialist: 10, urgentCare: 0, emergency: 0 },
    coinsurance: 0,
  },
  {
    id: 'v-gold',
    category: 'vision',
    tier: 'gold',
    name: 'Enhanced Vision',
    carrier: 'VSP Vision',
    description: 'Higher allowances and designer frames.',
    features: ['$0 Exam Copay', '$200 Frame Allowance', 'Progressive Lenses Covered'],
    isRecommended: false,
    premiums: {
      employee_only: { employee: 15, employer: 20 },
      employee_spouse: { employee: 25, employer: 32 },
      employee_children: { employee: 22, employer: 30 },
      family: { employee: 38, employer: 45 },
    },
    deductible: { individual: 0, family: 0 },
    outOfPocketMax: { individual: 100, family: 200 },
    copay: { primaryCare: 0, specialist: 0, urgentCare: 0, emergency: 0 },
    coinsurance: 0,
  },
];

const MOCK_DEPENDENTS: BenefitDependent[] = [
  {
    id: 'dep-001',
    firstName: 'Jane',
    lastName: 'Doe',
    relationship: 'spouse',
    dateOfBirth: '1990-05-12',
    gender: 'female',
  },
  {
    id: 'dep-002',
    firstName: 'Max',
    lastName: 'Doe',
    relationship: 'child',
    dateOfBirth: '2018-09-03',
    gender: 'male',
  },
  {
    id: 'dep-003',
    firstName: 'Lily',
    lastName: 'Doe',
    relationship: 'child',
    dateOfBirth: '2021-01-15',
    gender: 'female',
  },
];

const MOCK_ENROLLMENT_WINDOW: EnrollmentWindow = {
  id: 'ew-2026',
  name: '2026 Annual Open Enrollment',
  type: 'annual',
  startDate: '2025-11-01',
  endDate: '2025-11-30',
  effectiveDate: '2026-01-01',
  isActive: true,
  daysRemaining: 14,
};

// ── Service ────────────────────────────────────────────────────────────────────

export class BenefitsEnrollmentService {
  static async getPlans(category?: BenefitCategory): Promise<BenefitPlan[]> {
    try {
      return await APIClient.get<BenefitPlan[]>('/v1/benefits', { category });
    } catch {
      return category ? MOCK_PLANS.filter((p) => p.category === category) : MOCK_PLANS;
    }
  }

  static async getPlansByCategory(): Promise<Record<BenefitCategory, BenefitPlan[]>> {
    const plans = await this.getPlans();
    const grouped: Record<string, BenefitPlan[]> = {};
    for (const plan of plans) {
      if (!grouped[plan.category]) grouped[plan.category] = [];
      grouped[plan.category].push(plan);
    }
    return grouped as Record<BenefitCategory, BenefitPlan[]>;
  }

  static async getDependents(): Promise<BenefitDependent[]> {
    try {
      return await APIClient.get<BenefitDependent[]>('/v1/benefits/dependents');
    } catch {
      return MOCK_DEPENDENTS;
    }
  }

  static async addDependent(dependent: Omit<BenefitDependent, 'id'>): Promise<BenefitDependent> {
    const newDep: BenefitDependent = { ...dependent, id: `dep-${Date.now()}` };
    MOCK_DEPENDENTS.push(newDep);
    return newDep;
  }

  static async removeDependent(id: string): Promise<void> {
    const idx = MOCK_DEPENDENTS.findIndex((d) => d.id === id);
    if (idx >= 0) MOCK_DEPENDENTS.splice(idx, 1);
  }

  static async getEnrollmentWindow(): Promise<EnrollmentWindow> {
    try {
      return await APIClient.get<EnrollmentWindow>('/v1/benefits/enrollment-window');
    } catch {
      return MOCK_ENROLLMENT_WINDOW;
    }
  }

  static async submitEnrollment(
    submission: EnrollmentSubmission
  ): Promise<{ success: boolean; enrollmentId: string }> {
    try {
      return await APIClient.post('/v1/benefits/enrollments', submission);
    } catch {
      return { success: true, enrollmentId: `ENR-${Date.now()}` };
    }
  }

  static calculateCosts(
    selections: Record<string, EnrollmentSelection | null>,
    plans: BenefitPlan[]
  ): { items: CostBreakdown[]; totalEmployee: number; totalEmployer: number } {
    const items: CostBreakdown[] = [];
    let totalEmployee = 0;
    let totalEmployer = 0;

    for (const [category, selection] of Object.entries(selections)) {
      if (!selection) continue;
      const plan = plans.find((p) => p.id === selection.planId);
      if (!plan) continue;

      const premium = plan.premiums[selection.coverageLevel];
      if (!premium) continue;

      items.push({
        category: category as BenefitCategory,
        planName: plan.name,
        coverageLevel: selection.coverageLevel,
        employeeCost: premium.employee,
        employerCost: premium.employer,
        totalCost: premium.employee + premium.employer,
      });

      totalEmployee += premium.employee;
      totalEmployer += premium.employer;
    }

    return { items, totalEmployee, totalEmployer };
  }
}

// ── Constants ──────────────────────────────────────────────────────────────────

export const CATEGORY_META: Record<
  BenefitCategory,
  { label: string; icon: string; color: string }
> = {
  health: {
    label: 'Medical Insurance',
    icon: 'Heart',
    color: 'text-quantum-rose bg-quantum-rose/10',
  },
  dental: {
    label: 'Dental Care',
    icon: 'Smile',
    color: 'text-celestial-indigo bg-celestial-indigo/10',
  },
  vision: { label: 'Vision Coverage', icon: 'Eye', color: 'text-neural-mint bg-neural-mint/10' },
  life: { label: 'Life Insurance', icon: 'Shield', color: 'text-sunset-amber bg-sunset-amber/10' },
  disability: {
    label: 'Disability',
    icon: 'Umbrella',
    color: 'text-nebula-purple bg-nebula-purple/10',
  },
  fsa_hsa: { label: 'FSA / HSA', icon: 'Wallet', color: 'text-twilight bg-twilight/10' },
};

export const COVERAGE_LABELS: Record<CoverageLevel, string> = {
  employee_only: 'Employee Only',
  employee_spouse: 'Employee + Spouse',
  employee_children: 'Employee + Children',
  family: 'Family',
};
