/**
 * @module lifeInsuranceService
 * @description Life insurance enrollment — plans, coverage, beneficiaries, premium calculation.
 * @project AURA HCM Platform
 * @section 18.4 — Life Insurance Management
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type PlanType = 'basic_life' | 'supplemental_life' | 'add' | 'dependent_life';
export type CoverageMultiple = 1 | 2 | 3 | 4 | 5;
export type BeneficiaryRelationship =
  | 'spouse'
  | 'child'
  | 'parent'
  | 'sibling'
  | 'domestic_partner'
  | 'other';

export interface LifeInsurancePlan {
  id: string;
  type: PlanType;
  name: string;
  carrier: string;
  description: string;
  isEmployerPaid: boolean;
  employerPaidAmount: number;
  coverageMultiples: CoverageMultiple[];
  maxCoverageAmount: number;
  evidenceOfInsurabilityThreshold: number;
  features: string[];
  ageBands: AgeBandRate[];
}

export interface AgeBandRate {
  minAge: number;
  maxAge: number;
  ratePerThousand: number; // monthly premium per $1,000 of coverage
}

export interface Beneficiary {
  id: string;
  name: string;
  relationship: BeneficiaryRelationship;
  allocationPercent: number;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  isPrimary: boolean;
}

export interface LifeInsuranceEnrollment {
  employeeId: string;
  planId: string;
  planName: string;
  coverageMultiple: CoverageMultiple;
  coverageAmount: number;
  annualSalary: number;
  monthlyPremium: number;
  employeePremium: number;
  employerPremium: number;
  beneficiaries: Beneficiary[];
  enrollmentDate: string;
  effectiveDate: string;
  requiresEOI: boolean;
  eoiStatus?: 'pending' | 'approved' | 'denied';
}

export interface PremiumCalculation {
  age: number;
  coverageAmount: number;
  isSmoker: boolean;
  planId: string;
  monthlyPremium: number;
  annualPremium: number;
  ratePerThousand: number;
}

export interface EligibilityRules {
  minHoursPerWeek: number;
  waitingPeriodDays: number;
  eoiThreshold: number;
  openEnrollmentPeriod: string;
  qualifyingEvents: string[];
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

export const MOCK_LIFE_PLANS: LifeInsurancePlan[] = [
  {
    id: 'li-001',
    type: 'basic_life',
    name: 'Basic Life Insurance',
    carrier: 'MetLife',
    description: 'Company-paid basic life insurance — 1x annual salary, automatically enrolled',
    isEmployerPaid: true,
    employerPaidAmount: 50000,
    coverageMultiples: [1],
    maxCoverageAmount: 500000,
    evidenceOfInsurabilityThreshold: 0,
    features: [
      'Employer-paid 1x annual salary coverage',
      'Automatic enrollment — no forms required',
      'AD&D benefit included',
      'Waiver of premium for disability',
      'Accelerated death benefit up to 50%',
    ],
    ageBands: [
      { minAge: 18, maxAge: 29, ratePerThousand: 0.06 },
      { minAge: 30, maxAge: 34, ratePerThousand: 0.08 },
      { minAge: 35, maxAge: 39, ratePerThousand: 0.12 },
      { minAge: 40, maxAge: 44, ratePerThousand: 0.17 },
      { minAge: 45, maxAge: 49, ratePerThousand: 0.26 },
      { minAge: 50, maxAge: 54, ratePerThousand: 0.4 },
      { minAge: 55, maxAge: 59, ratePerThousand: 0.62 },
      { minAge: 60, maxAge: 64, ratePerThousand: 0.92 },
      { minAge: 65, maxAge: 99, ratePerThousand: 1.52 },
    ],
  },
  {
    id: 'li-002',
    type: 'supplemental_life',
    name: 'Supplemental Life Insurance',
    carrier: 'Prudential',
    description: 'Employee-paid optional coverage up to 5x annual salary — EOI required above 3x',
    isEmployerPaid: false,
    employerPaidAmount: 0,
    coverageMultiples: [1, 2, 3, 4, 5],
    maxCoverageAmount: 2000000,
    evidenceOfInsurabilityThreshold: 500000,
    features: [
      'Coverage multiples: 1x to 5x annual salary',
      'EOI required for amounts over $500,000',
      'Portable — keep coverage after leaving employer',
      'Guaranteed issue up to 3x annual salary at hire',
      'Optional dependent life add-on available',
    ],
    ageBands: [
      { minAge: 18, maxAge: 29, ratePerThousand: 0.07 },
      { minAge: 30, maxAge: 34, ratePerThousand: 0.09 },
      { minAge: 35, maxAge: 39, ratePerThousand: 0.14 },
      { minAge: 40, maxAge: 44, ratePerThousand: 0.2 },
      { minAge: 45, maxAge: 49, ratePerThousand: 0.32 },
      { minAge: 50, maxAge: 54, ratePerThousand: 0.48 },
      { minAge: 55, maxAge: 59, ratePerThousand: 0.78 },
      { minAge: 60, maxAge: 64, ratePerThousand: 1.18 },
      { minAge: 65, maxAge: 99, ratePerThousand: 1.9 },
    ],
  },
  {
    id: 'li-003',
    type: 'add',
    name: 'Accidental Death & Dismemberment (AD&D)',
    carrier: 'Unum',
    description: 'AD&D provides additional benefit for death or dismemberment due to accidents',
    isEmployerPaid: false,
    employerPaidAmount: 0,
    coverageMultiples: [1, 2, 3],
    maxCoverageAmount: 1000000,
    evidenceOfInsurabilityThreshold: 0,
    features: [
      'Death benefit for accidental death',
      'Partial benefits for loss of limb/sight',
      'Seat belt and airbag benefit',
      'Common carrier benefit (2x payout)',
      'Educational benefit for surviving children',
    ],
    ageBands: [{ minAge: 18, maxAge: 99, ratePerThousand: 0.02 }],
  },
];

const MOCK_ENROLLMENTS: LifeInsuranceEnrollment[] = [
  {
    employeeId: 'emp-0201',
    planId: 'li-001',
    planName: 'Basic Life Insurance',
    coverageMultiple: 1,
    coverageAmount: 264000,
    annualSalary: 264000,
    monthlyPremium: 31.68,
    employeePremium: 0,
    employerPremium: 31.68,
    enrollmentDate: '2023-03-01',
    effectiveDate: '2023-03-01',
    requiresEOI: false,
    beneficiaries: [
      {
        id: 'ben-001',
        name: 'Aisha Al-Mansouri',
        relationship: 'spouse',
        allocationPercent: 60,
        isPrimary: true,
        email: 'aisha@email.com',
      },
      {
        id: 'ben-002',
        name: 'Omar Al-Mansouri',
        relationship: 'child',
        allocationPercent: 20,
        isPrimary: true,
        dateOfBirth: '2010-05-15',
      },
      {
        id: 'ben-003',
        name: 'Layla Al-Mansouri',
        relationship: 'child',
        allocationPercent: 20,
        isPrimary: true,
        dateOfBirth: '2013-09-22',
      },
    ],
  },
  {
    employeeId: 'emp-0201',
    planId: 'li-002',
    planName: 'Supplemental Life Insurance',
    coverageMultiple: 2,
    coverageAmount: 528000,
    annualSalary: 264000,
    monthlyPremium: 105.6,
    employeePremium: 105.6,
    employerPremium: 0,
    enrollmentDate: '2023-03-01',
    effectiveDate: '2023-03-01',
    requiresEOI: false,
    beneficiaries: [
      {
        id: 'ben-004',
        name: 'Aisha Al-Mansouri',
        relationship: 'spouse',
        allocationPercent: 100,
        isPrimary: true,
        email: 'aisha@email.com',
      },
    ],
  },
];

// ── Service Class ──────────────────────────────────────────────────────────────

export class LifeInsuranceService {
  private static delay(ms = 400): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  static async getLifeInsurancePlans(): Promise<LifeInsurancePlan[]> {
    await this.delay();
    return [...MOCK_LIFE_PLANS];
  }

  static async getEnrollment(employeeId: string): Promise<LifeInsuranceEnrollment[]> {
    await this.delay(300);
    return MOCK_ENROLLMENTS.filter((e) => e.employeeId === employeeId);
  }

  static async updateCoverage(
    employeeId: string,
    planId: string,
    coverageAmount: number
  ): Promise<LifeInsuranceEnrollment> {
    await this.delay(600);
    const idx = MOCK_ENROLLMENTS.findIndex(
      (e) => e.employeeId === employeeId && e.planId === planId
    );
    if (idx === -1) throw new Error('Enrollment not found');
    MOCK_ENROLLMENTS[idx] = { ...MOCK_ENROLLMENTS[idx], coverageAmount };
    return MOCK_ENROLLMENTS[idx];
  }

  static async updateBeneficiaries(
    employeeId: string,
    beneficiaries: Beneficiary[]
  ): Promise<LifeInsuranceEnrollment[]> {
    await this.delay(500);
    const total = beneficiaries.reduce((s, b) => s + b.allocationPercent, 0);
    if (Math.abs(total - 100) > 0.01) throw new Error('Beneficiary allocations must sum to 100%');
    MOCK_ENROLLMENTS.filter((e) => e.employeeId === employeeId).forEach((e) => {
      e.beneficiaries = beneficiaries;
    });
    return MOCK_ENROLLMENTS.filter((e) => e.employeeId === employeeId);
  }

  static calculatePremium(
    age: number,
    coverageAmount: number,
    isSmoker: boolean,
    planId = 'li-002'
  ): PremiumCalculation {
    const plan = MOCK_LIFE_PLANS.find((p) => p.id === planId);
    if (!plan) throw new Error('Plan not found');

    const band =
      plan.ageBands.find((b) => age >= b.minAge && age <= b.maxAge) ??
      plan.ageBands[plan.ageBands.length - 1];
    const smokerMultiplier = isSmoker ? 1.5 : 1;
    const monthlyPremium = (coverageAmount / 1000) * band.ratePerThousand * smokerMultiplier;

    return {
      age,
      coverageAmount,
      isSmoker,
      planId,
      monthlyPremium: parseFloat(monthlyPremium.toFixed(2)),
      annualPremium: parseFloat((monthlyPremium * 12).toFixed(2)),
      ratePerThousand: band.ratePerThousand,
    };
  }

  static getEligibilityRules(): EligibilityRules {
    return {
      minHoursPerWeek: 30,
      waitingPeriodDays: 30,
      eoiThreshold: 500000,
      openEnrollmentPeriod: 'November 1 – November 30 annually',
      qualifyingEvents: [
        'Marriage or domestic partnership',
        'Birth or adoption of child',
        'Divorce or legal separation',
        'Death of dependent',
        'Spouse/partner job loss',
        'New hire within 30 days',
      ],
    };
  }
}
