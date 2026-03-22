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

// ── Service ────────────────────────────────────────────────────────────────────

export class BenefitsEnrollmentService {
  static async getPlans(category?: BenefitCategory): Promise<BenefitPlan[]> {
    return APIClient.get<BenefitPlan[]>('/v1/benefits', { category });
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
    return APIClient.get<BenefitDependent[]>('/v1/benefits/dependents');
  }

  static async addDependent(dependent: Omit<BenefitDependent, 'id'>): Promise<BenefitDependent> {
    return APIClient.post<BenefitDependent>('/v1/benefits/dependents', dependent);
  }

  static async removeDependent(id: string): Promise<void> {
    await APIClient.delete<void>(`/v1/benefits/dependents/${id}`);
  }

  static async getEnrollmentWindow(): Promise<EnrollmentWindow> {
    return APIClient.get<EnrollmentWindow>('/v1/benefits/enrollment-window');
  }

  static async submitEnrollment(
    submission: EnrollmentSubmission
  ): Promise<{ success: boolean; enrollmentId: string }> {
    return APIClient.post('/v1/benefits/enrollments', submission);
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
