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

interface V1PlanRecord {
  id: string;
  name: string;
  category: string;
  type?: string;
  provider?: string;
  description?: string;
  isRecommended?: boolean;
  coverage?: unknown;
  premiums?: {
    employeeOnly?: number;
    employeeSpouse?: number;
    employeeChildren?: number;
    family?: number;
  };
  employerContribution?: number;
  deductible?: { individual: number; family: number } | null;
  outOfPocketMax?: { individual: number; family: number } | null;
  copay?: number | null;
  coinsurance?: number | null;
}

// Map the v1 dash-case category back to the wizard's BenefitCategory tokens.
const CATEGORY_MAP: Record<string, BenefitCategory> = {
  'health-insurance': 'health',
  health: 'health',
  dental: 'dental',
  vision: 'vision',
  'life-insurance': 'life',
  life: 'life',
  disability: 'disability',
  'fsa-hsa': 'fsa_hsa',
  fsa_hsa: 'fsa_hsa',
};

function adaptPlan(record: V1PlanRecord): BenefitPlan {
  const employer = record.employerContribution ?? 0;
  const p = record.premiums ?? {};
  const premiums: BenefitPlan['premiums'] = {
    employee_only: { employee: p.employeeOnly ?? 0, employer },
    employee_spouse: { employee: p.employeeSpouse ?? p.employeeOnly ?? 0, employer },
    employee_children: { employee: p.employeeChildren ?? p.employeeOnly ?? 0, employer },
    family: { employee: p.family ?? p.employeeOnly ?? 0, employer },
  };
  return {
    id: record.id,
    category: CATEGORY_MAP[record.category] ?? 'health',
    tier: (record.type as PlanTier) ?? 'basic',
    name: record.name,
    description: record.description ?? '',
    carrier: record.provider ?? '',
    features: Array.isArray(record.coverage) ? (record.coverage as string[]) : [],
    isRecommended: Boolean(record.isRecommended),
    premiums,
    deductible: record.deductible ?? { individual: 0, family: 0 },
    outOfPocketMax: record.outOfPocketMax ?? { individual: 0, family: 0 },
    copay: {
      primaryCare: record.copay ?? 0,
      specialist: record.copay ?? 0,
      urgentCare: record.copay ?? 0,
      emergency: record.copay ?? 0,
    },
    coinsurance: record.coinsurance ?? 0,
  };
}

export class BenefitsEnrollmentService {
  static async getPlans(category?: BenefitCategory): Promise<BenefitPlan[]> {
    const response = await APIClient.get<{ success: boolean; data: V1PlanRecord[] }>(
      '/v1/benefits/plans',
      { category, status: 'ACTIVE' }
    );
    const records = response?.data ?? [];
    return Array.isArray(records) ? records.map(adaptPlan) : [];
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

  static async getDependents(employeeId?: string): Promise<BenefitDependent[]> {
    // Canonical dependents API lives at /benefits/dependents (no /v1 variant exists).
    const response = await APIClient.get<{ success: boolean; data: any[] }>(
      '/benefits/dependents',
      employeeId ? { employeeId } : undefined
    );
    const records = response?.data ?? [];
    return (Array.isArray(records) ? records : []).map((d) => ({
      id: d.id,
      firstName: d.firstName,
      lastName: d.lastName,
      relationship: String(d.relationship || '').toLowerCase() as BenefitDependent['relationship'],
      dateOfBirth: d.dateOfBirth,
      ssn: d.ssn ?? undefined,
      gender: (String(d.gender || 'other').toLowerCase() as BenefitDependent['gender']) || 'other',
      isStudent: d.isStudent ?? false,
      isDisabled: d.isDisabled ?? false,
    }));
  }

  static async addDependent(
    dependent: Omit<BenefitDependent, 'id'> & { employeeId: string }
  ): Promise<BenefitDependent> {
    const response = await APIClient.post<{ success: boolean; data: any }>('/benefits/dependents', {
      employeeId: dependent.employeeId,
      firstName: dependent.firstName,
      lastName: dependent.lastName,
      dateOfBirth: new Date(dependent.dateOfBirth).toISOString(),
      relationship: String(dependent.relationship).toUpperCase(),
      gender: dependent.gender,
      ssn: dependent.ssn,
      isStudent: dependent.isStudent,
      isDisabled: dependent.isDisabled,
    });
    const d = response?.data ?? {};
    return {
      id: d.id,
      firstName: d.firstName,
      lastName: d.lastName,
      relationship: String(d.relationship || '').toLowerCase() as BenefitDependent['relationship'],
      dateOfBirth: d.dateOfBirth,
      gender: (String(d.gender || 'other').toLowerCase() as BenefitDependent['gender']) || 'other',
      isStudent: d.isStudent ?? false,
      isDisabled: d.isDisabled ?? false,
    };
  }

  static async removeDependent(id: string): Promise<void> {
    await APIClient.delete<{ success: boolean }>(
      `/benefits/dependents?id=${encodeURIComponent(id)}`
    );
  }

  static async getEnrollmentWindow(): Promise<EnrollmentWindow | null> {
    const response = await APIClient.get<{ success: boolean; data: any[] }>(
      '/v1/benefits/open-enrollment'
    );
    const windows = response?.data ?? [];
    if (!Array.isArray(windows) || windows.length === 0) return null;
    const now = Date.now();
    const active =
      windows.find((w) => {
        const start = new Date(w.startDate).getTime();
        const end = new Date(w.endDate).getTime();
        return start <= now && end >= now;
      }) ?? windows[0];
    const endMs = new Date(active.endDate).getTime();
    const daysRemaining = Math.max(0, Math.ceil((endMs - now) / (1000 * 60 * 60 * 24)));
    return {
      id: active.id,
      name: active.windowName ?? active.name ?? 'Open Enrollment',
      type: (active.windowType || 'annual').toLowerCase().includes('annual') ? 'annual' : 'special',
      startDate: active.startDate,
      endDate: active.endDate,
      effectiveDate: active.effectiveDate ?? active.startDate,
      isActive: Boolean(active.isActive),
      daysRemaining,
    };
  }

  static async submitEnrollment(
    submission: EnrollmentSubmission & { employeeId: string }
  ): Promise<{ success: boolean; enrollmentId: string }> {
    // The v1 enrollments endpoint accepts one enrollment per plan. POST each
    // selected plan and return the first created enrollment id as the reference.
    const entries = Object.values(submission.selections).filter((s): s is EnrollmentSelection =>
      Boolean(s)
    );
    // Map the wizard enrollment-type token onto the v1 contract's enrollmentType.
    const ENROLLMENT_TYPE: Record<EnrollmentSubmission['enrollmentType'], string> = {
      annual: 'OPEN_ENROLLMENT',
      new_hire: 'NEW_HIRE',
      qualifying_event: 'QUALIFYING_EVENT',
    };
    let firstId = '';
    for (const selection of entries) {
      const response = await APIClient.post<{ success: boolean; data?: { id?: string } }>(
        '/v1/benefits/enrollments',
        {
          employeeId: submission.employeeId,
          planId: selection.planId,
          coverageTier: selection.coverageLevel.toUpperCase(),
          enrollmentType: ENROLLMENT_TYPE[submission.enrollmentType],
          effectiveDate: submission.effectiveDate,
          dependents: selection.dependentIds,
        }
      );
      if (!response?.success) {
        return { success: false, enrollmentId: '' };
      }
      if (!firstId && response.data?.id) {
        firstId = response.data.id;
      }
    }
    return { success: true, enrollmentId: firstId };
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
