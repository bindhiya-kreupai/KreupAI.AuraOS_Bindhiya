/**
 * @module pensionEosbService
 * @description Pension and End-of-Service Benefit (EOSB) management for GCC and global entities.
 *   EOSB calculations per UAE/KSA labour law, pension projections, contribution history.
 * @project AURA HCM Platform
 * @section 18.6 — Pension & EOSB Management
 *
 * Legal References:
 *  UAE EOSB: Federal Decree-Law No. 33 of 2021, Article 51:
 *    - <1 yr: 0 (no entitlement)
 *    - 1-5 yrs: 21 days basic salary per year
 *    - >5 yrs: 30 days basic salary per year (cap: 2 years total basic salary)
 *  KSA EOSB: Saudi Labour Law Article 84:
 *    - <2 yrs: 0
 *    - 2-5 yrs: 1/3 of 30-day salary per year
 *    - 5-10 yrs: 2/3 of 30-day salary per year
 *    - >10 yrs: Full 30-day salary per year
 *  India Gratuity: Payment of Gratuity Act 1972:
 *    - 5+ yrs: 15 days wages per year of service (cap: Rs. 20 lakhs)
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type EOSBJurisdiction = 'UAE' | 'KSA' | 'IND' | 'UK' | 'US' | 'OTHER';
export type PensionPlanType =
  | '401k'
  | 'ira'
  | 'uk_pension'
  | 'nps'
  | 'group_pension'
  | 'defined_benefit';

export interface EOSBCalculation {
  employeeId: string;
  employeeName: string;
  jurisdiction: EOSBJurisdiction;
  joiningDate: string;
  calculationDate: string;
  yearsOfService: number;
  monthsOfService: number;
  basicSalary: number;
  currency: string;
  eosbAmount: number;
  calculationBreakdown: EOSBBreakdownItem[];
  projectedAtYearEnd: number;
  cappedAt?: number;
  notes: string;
}

export interface EOSBBreakdownItem {
  period: string;
  years: number;
  rateLabel: string;
  rateDays: number;
  amount: number;
}

export interface EOSBLiabilitySummary {
  entityId?: string;
  entityName: string;
  calculationDate: string;
  totalLiability: number;
  currency: string;
  projectedYearEnd: number;
  monthlyProvision: number;
  byYearsOfServiceBand: EOSBBand[];
}

export interface EOSBBand {
  band: string;
  minYears: number;
  maxYears: number | null;
  employeeCount: number;
  totalLiability: number;
}

export interface PensionPlan {
  id: string;
  type: PensionPlanType;
  name: string;
  provider: string;
  country: string;
  employeeContributionRate: number;
  employerMatchRate: number;
  employerMatchCap: number;
  vestingSchedule: VestingScheduleEntry[];
  description: string;
  features: string[];
}

export interface VestingScheduleEntry {
  years: number;
  vestedPercent: number;
}

export interface PensionEnrollment {
  employeeId: string;
  planId: string;
  planName: string;
  contributionRate: number;
  employerContribution: number;
  effectiveDate: string;
  totalBalance: number;
  vestedBalance: number;
  yearsVested: number;
}

export interface ContributionRecord {
  id: string;
  period: string;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  currency: string;
  planName: string;
}

export interface RetirementProjection {
  employeeId: string;
  currentAge: number;
  retirementAge: number;
  yearsToRetirement: number;
  currentSalary: number;
  currentSavings: number;
  annualContribution: number;
  projectedBalance: number;
  monthlyRetirementIncome: number;
  replacementRatio: number;
  scenarios: ProjectionScenario[];
}

export interface ProjectionScenario {
  label: string;
  growthRate: number;
  projectedBalance: number;
  monthlyIncome: number;
}

// ── EOSB Calculation Functions ─────────────────────────────────────────────────

function calculateUAEEOSB(
  yearsOfService: number,
  monthsOfService: number,
  dailyBasicSalary: number
): {
  amount: number;
  breakdown: EOSBBreakdownItem[];
  cappedAt?: number;
} {
  const breakdown: EOSBBreakdownItem[] = [];
  let total = 0;

  if (yearsOfService < 1) {
    return {
      amount: 0,
      breakdown: [
        {
          period: 'Less than 1 year',
          years: yearsOfService,
          rateLabel: 'No entitlement',
          rateDays: 0,
          amount: 0,
        },
      ],
    };
  }

  // For years 1-5: 21 days per year of basic salary
  const firstPeriodYears = Math.min(yearsOfService, 5);
  if (firstPeriodYears >= 1) {
    const amount = firstPeriodYears * 21 * dailyBasicSalary;
    breakdown.push({
      period: 'First 5 years (1–5)',
      years: firstPeriodYears,
      rateLabel: '21 days per year',
      rateDays: 21,
      amount,
    });
    total += amount;
  }

  // For years beyond 5: 30 days per year
  if (yearsOfService > 5) {
    const additionalYears = yearsOfService - 5;
    const amount = additionalYears * 30 * dailyBasicSalary;
    breakdown.push({
      period: 'Beyond 5 years (5+)',
      years: additionalYears,
      rateLabel: '30 days per year',
      rateDays: 30,
      amount,
    });
    total += amount;
  }

  // Cap at 2 years' basic salary (UAE Labour Law Article 51)
  const twoYearsCap = dailyBasicSalary * 30 * 24; // 2 years × 12 months × daily equivalent
  const cappedAt = total > twoYearsCap ? twoYearsCap : undefined;

  return { amount: Math.min(total, twoYearsCap), breakdown, cappedAt };
}

function calculateKSAEOSB(
  yearsOfService: number,
  monthlySalary: number
): {
  amount: number;
  breakdown: EOSBBreakdownItem[];
} {
  const breakdown: EOSBBreakdownItem[] = [];
  const dailySalary = monthlySalary / 30;
  let total = 0;

  if (yearsOfService < 2) {
    return {
      amount: 0,
      breakdown: [
        {
          period: 'Less than 2 years',
          years: yearsOfService,
          rateLabel: 'No entitlement',
          rateDays: 0,
          amount: 0,
        },
      ],
    };
  }

  // 2-5 years: 1/3 of 30-day wage per year
  const _period1Years = Math.min(yearsOfService, 5) - Math.min(yearsOfService, 2);
  if (yearsOfService >= 2) {
    const years = Math.min(yearsOfService, 5) - 2;
    if (years > 0) {
      const amount = years * ((30 * dailySalary) / 3);
      breakdown.push({
        period: '2–5 years',
        years,
        rateLabel: '1/3 × 30 days per year',
        rateDays: 10,
        amount,
      });
      total += amount;
    }
  }

  // 5-10 years: 2/3 of 30-day wage per year
  if (yearsOfService > 5) {
    const years = Math.min(yearsOfService, 10) - 5;
    const amount = years * ((30 * dailySalary * 2) / 3);
    breakdown.push({
      period: '5–10 years',
      years,
      rateLabel: '2/3 × 30 days per year',
      rateDays: 20,
      amount,
    });
    total += amount;
  }

  // >10 years: Full 30-day wage per year
  if (yearsOfService > 10) {
    const years = yearsOfService - 10;
    const amount = years * 30 * dailySalary;
    breakdown.push({
      period: 'Beyond 10 years',
      years,
      rateLabel: 'Full 30 days per year',
      rateDays: 30,
      amount,
    });
    total += amount;
  }

  return { amount: total, breakdown };
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_PENSION_PLANS: PensionPlan[] = [
  {
    id: 'pp-001',
    type: '401k',
    name: 'KreupAI US 401(k)',
    provider: 'Fidelity Investments',
    country: 'USA',
    employeeContributionRate: 6,
    employerMatchRate: 100,
    employerMatchCap: 6,
    vestingSchedule: [
      { years: 1, vestedPercent: 0 },
      { years: 2, vestedPercent: 25 },
      { years: 3, vestedPercent: 50 },
      { years: 4, vestedPercent: 75 },
      { years: 5, vestedPercent: 100 },
    ],
    description: 'Traditional 401(k) with employer match up to 6% of compensation',
    features: [
      'Pre-tax contributions',
      'Roth option available',
      '100% match on first 6%',
      'Auto-enrollment at 3%',
      '2025 limit: $23,500',
    ],
  },
  {
    id: 'pp-002',
    type: 'uk_pension',
    name: 'KreupAI UK Workplace Pension',
    provider: 'Nest',
    country: 'GBR',
    employeeContributionRate: 5,
    employerMatchRate: 3,
    employerMatchCap: 100,
    vestingSchedule: [{ years: 0, vestedPercent: 100 }],
    description: 'Auto-enrolled workplace pension compliant with UK Pension Act 2008',
    features: [
      'Auto-enrollment mandated by law',
      'Minimum 8% total (3% employer + 5% employee)',
      'NEST default fund',
      'Tax relief at source',
    ],
  },
  {
    id: 'pp-003',
    type: 'nps',
    name: 'National Pension System (NPS) — India',
    provider: 'PFRDA / SBI Pension',
    country: 'IND',
    employeeContributionRate: 10,
    employerMatchRate: 10,
    employerMatchCap: 100,
    vestingSchedule: [{ years: 0, vestedPercent: 100 }],
    description: 'Government NPS for private sector employees — Tier-I mandatory account',
    features: [
      '10% employee + 10% employer contribution',
      'Tax deduction u/s 80CCD(1) + 80CCD(2)',
      'NPS Tier-I mandatory, Tier-II optional',
      'Annuity purchase at retirement',
    ],
  },
];

const MOCK_CONTRIBUTION_HISTORY: ContributionRecord[] = [
  {
    id: 'cr-001',
    period: '2026-01',
    employeeContribution: 1200,
    employerContribution: 1200,
    totalContribution: 2400,
    currency: 'USD',
    planName: 'KreupAI US 401(k)',
  },
  {
    id: 'cr-002',
    period: '2025-12',
    employeeContribution: 1200,
    employerContribution: 1200,
    totalContribution: 2400,
    currency: 'USD',
    planName: 'KreupAI US 401(k)',
  },
  {
    id: 'cr-003',
    period: '2025-11',
    employeeContribution: 1200,
    employerContribution: 1200,
    totalContribution: 2400,
    currency: 'USD',
    planName: 'KreupAI US 401(k)',
  },
  {
    id: 'cr-004',
    period: '2025-10',
    employeeContribution: 1150,
    employerContribution: 1150,
    totalContribution: 2300,
    currency: 'USD',
    planName: 'KreupAI US 401(k)',
  },
  {
    id: 'cr-005',
    period: '2025-09',
    employeeContribution: 1150,
    employerContribution: 1150,
    totalContribution: 2300,
    currency: 'USD',
    planName: 'KreupAI US 401(k)',
  },
  {
    id: 'cr-006',
    period: '2025-08',
    employeeContribution: 1150,
    employerContribution: 1150,
    totalContribution: 2300,
    currency: 'USD',
    planName: 'KreupAI US 401(k)',
  },
];

// ── Service Class ──────────────────────────────────────────────────────────────

export class PensionEOSBService {
  private static delay(ms = 400): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  /** Calculate EOSB for an employee based on jurisdiction */
  static async calculateEOSB(employeeId: string): Promise<EOSBCalculation> {
    await this.delay(500);

    // Mock employee data
    const joiningDate = new Date('2021-06-15');
    const calcDate = new Date('2026-02-25');
    const diffMs = calcDate.getTime() - joiningDate.getTime();
    const totalMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
    const yearsOfService = totalMonths / 12;
    const basicSalary = 22000; // AED/month
    const dailyBasicSalary = basicSalary / 30;

    const { amount, breakdown, cappedAt } = calculateUAEEOSB(
      Math.floor(yearsOfService),
      totalMonths,
      dailyBasicSalary
    );

    return {
      employeeId,
      employeeName: 'Ahmed Al-Mansouri',
      jurisdiction: 'UAE',
      joiningDate: '2021-06-15',
      calculationDate: '2026-02-25',
      yearsOfService: parseFloat(yearsOfService.toFixed(2)),
      monthsOfService: totalMonths,
      basicSalary,
      currency: 'AED',
      eosbAmount: parseFloat(amount.toFixed(2)),
      calculationBreakdown: breakdown,
      projectedAtYearEnd: parseFloat((amount * 1.15).toFixed(2)),
      cappedAt,
      notes: 'Calculated per UAE Federal Decree-Law No. 33 of 2021, Article 51',
    };
  }

  /** Get total EOSB liability for an entity */
  static async getEOSBLiability(entityId?: string): Promise<EOSBLiabilitySummary> {
    await this.delay(600);
    return {
      entityId: entityId ?? 'ent-001',
      entityName: 'KreupAI Technologies LLC (UAE)',
      calculationDate: new Date().toISOString().split('T')[0],
      totalLiability: 14560000,
      currency: 'AED',
      projectedYearEnd: 16200000,
      monthlyProvision: 136000,
      byYearsOfServiceBand: [
        {
          band: 'Less than 1 year',
          minYears: 0,
          maxYears: 1,
          employeeCount: 48,
          totalLiability: 0,
        },
        { band: '1–3 years', minYears: 1, maxYears: 3, employeeCount: 89, totalLiability: 1980000 },
        { band: '3–5 years', minYears: 3, maxYears: 5, employeeCount: 76, totalLiability: 3450000 },
        {
          band: '5–10 years',
          minYears: 5,
          maxYears: 10,
          employeeCount: 82,
          totalLiability: 5640000,
        },
        {
          band: '10+ years',
          minYears: 10,
          maxYears: null,
          employeeCount: 25,
          totalLiability: 3490000,
        },
      ],
    };
  }

  /** Monthly gratuity provision amount */
  static async getGratuityProvision(
    _entityId?: string
  ): Promise<{ monthly: number; currency: string; ytd: number }> {
    await this.delay(300);
    return { monthly: 136000, currency: 'AED', ytd: 272000 };
  }

  /** Calculate KSA EOSB */
  static calculateKSAEOSB(
    yearsOfService: number,
    basicSalaryMonthly: number
  ): { amount: number; breakdown: EOSBBreakdownItem[] } {
    return calculateKSAEOSB(yearsOfService, basicSalaryMonthly);
  }

  /** Get available pension plans */
  static async getPensionPlans(): Promise<PensionPlan[]> {
    await this.delay(300);
    return [...MOCK_PENSION_PLANS];
  }

  /** Enroll employee in pension plan */
  static async enrollPensionPlan(
    employeeId: string,
    planId: string,
    contribution: number
  ): Promise<PensionEnrollment> {
    await this.delay(600);
    const plan = MOCK_PENSION_PLANS.find((p) => p.id === planId);
    if (!plan) throw new Error('Plan not found');
    return {
      employeeId,
      planId,
      planName: plan.name,
      contributionRate: contribution,
      employerContribution:
        Math.min(contribution, plan.employerMatchCap) * (plan.employerMatchRate / 100),
      effectiveDate: new Date().toISOString().split('T')[0],
      totalBalance: 0,
      vestedBalance: 0,
      yearsVested: 0,
    };
  }

  /** Get contribution history for employee */
  static async getContributionHistory(_employeeId: string): Promise<ContributionRecord[]> {
    await this.delay(300);
    return [...MOCK_CONTRIBUTION_HISTORY];
  }

  /** Project retirement income */
  static async projectRetirement(
    employeeId: string,
    params: {
      retirementAge: number;
      currentAge: number;
      currentSalary: number;
      currentSavings: number;
    }
  ): Promise<RetirementProjection> {
    await this.delay(500);
    const { retirementAge, currentAge, currentSalary, currentSavings } = params;
    const yearsToRetirement = retirementAge - currentAge;
    const annualContribution = currentSalary * 0.12; // 6% employee + 6% employer

    function project(growthRate: number): number {
      let balance = currentSavings;
      for (let i = 0; i < yearsToRetirement; i++) {
        balance = (balance + annualContribution) * (1 + growthRate);
      }
      return Math.round(balance);
    }

    const baseBalance = project(0.07);
    const monthlyIncome = Math.round(baseBalance / (25 * 12)); // 25-year retirement

    return {
      employeeId,
      currentAge,
      retirementAge,
      yearsToRetirement,
      currentSalary,
      currentSavings,
      annualContribution,
      projectedBalance: baseBalance,
      monthlyRetirementIncome: monthlyIncome,
      replacementRatio: parseFloat(((monthlyIncome / (currentSalary / 12)) * 100).toFixed(1)),
      scenarios: [
        {
          label: 'Conservative (5%)',
          growthRate: 0.05,
          projectedBalance: project(0.05),
          monthlyIncome: Math.round(project(0.05) / (25 * 12)),
        },
        {
          label: 'Moderate (7%)',
          growthRate: 0.07,
          projectedBalance: project(0.07),
          monthlyIncome: Math.round(project(0.07) / (25 * 12)),
        },
        {
          label: 'Aggressive (9%)',
          growthRate: 0.09,
          projectedBalance: project(0.09),
          monthlyIncome: Math.round(project(0.09) / (25 * 12)),
        },
      ],
    };
  }
}
