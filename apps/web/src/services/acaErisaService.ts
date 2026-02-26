/**
 * @module acaErisaService
 * @description ACA (Affordable Care Act) and ERISA compliance management — ALE determination,
 *   eligibility tracking, Form 1095-C/1094-C generation, SPD, Form 5500, nondiscrimination tests.
 * @project AURA HCM Platform
 * @section 18.5 — ACA/ERISA Compliance
 *
 * Legal References:
 *  ACA: 26 U.S.C. § 4980H — Employer Shared Responsibility Provisions
 *  ACA: 26 C.F.R. § 54.4980H — IRS Final Regulations (Feb 2014)
 *  ERISA: 29 U.S.C. § 1001 et seq. — Employee Retirement Income Security Act of 1974
 *  ERISA: 29 C.F.R. § 2520 — DOL Regulations (SPD, Form 5500)
 *  ACA Reporting: IRC §§ 6055 and 6056 — Forms 1094-C and 1095-C
 *  ADP/ACP Tests: IRC § 401(k)(3) and § 401(m)(2)
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type ALEStatus = 'ale' | 'non_ale' | 'aggregated_ale_member';
export type Form1095CStatus = 'generated' | 'pending' | 'error' | 'corrected' | 'sent';
export type SafeHarborCode = 'w2' | 'rate_of_pay' | 'federal_poverty_line' | 'none';
export type TestResult = 'pass' | 'fail' | 'not_applicable';

export interface ACAStatus {
  currentYear: number;
  aleStatus: ALEStatus;
  totalEmployees: number;
  fullTimeEmployees: number;
  fte: number; // Full-Time Equivalents
  aleThreshold: number; // 50 FTE threshold
  isSubjectToESRP: boolean;
  minimumValueOffered: boolean;
  affordabilityMet: boolean;
  safeHarbor: SafeHarborCode;
  measurementPeriodStart: string;
  measurementPeriodEnd: string;
}

export interface ACAEligibleEmployee {
  employeeId: string;
  name: string;
  department: string;
  avgHoursPerWeek: number;
  isEligible: boolean;
  eligibilityReason: string;
  offerStatus: 'offered' | 'enrolled' | 'waived' | 'not_offered';
  form1095CStatus: Form1095CStatus;
  coverageMonths: number[]; // 1-12
  employeeSelfOnlyCost: number; // monthly employee contribution for self-only MEC
  affordabilityPercentage: number; // as % of household income (W-2 safe harbor)
}

export interface Form1095C {
  employeeId: string;
  employeeName: string;
  ssn: string;
  year: number;
  employerName: string;
  ein: string;
  // Line 14-16 codes per month
  monthlyData: Array<{
    month: number;
    line14Code: string; // Offer of Coverage
    line15Amount: number; // Employee share of lowest-cost monthly premium
    line16Code: string; // Safe Harbor
  }>;
  generatedAt: string;
  status: Form1095CStatus;
}

export interface Form1094C {
  year: number;
  employerName: string;
  ein: string;
  totalForms1095C: number;
  authoritative: boolean;
  monthlyOffersIndicator: boolean[];
  minimumEssentialCoverageMonths: boolean[];
  certificationOfEligibility: string[];
  generatedAt: string;
  filingDeadline: string;
}

export interface ERISAPlanDocument {
  planId: string;
  planName: string;
  planType: string;
  effectiveDate: string;
  lastAmendedDate: string;
  documentUrl: string;
  version: number;
}

export interface SummaryPlanDescription {
  planId: string;
  planName: string;
  effectiveDate: string;
  distributionDate: string;
  documentsUrl: string;
  languages: string[];
}

export interface ERISAFilingStatus {
  planYear: number;
  planName: string;
  form5500DueDate: string;
  form5500ExtendedDueDate?: string;
  status: 'filed' | 'pending' | 'overdue' | 'extension_filed';
  filedDate?: string;
  auditorName?: string;
  totalAssets: number;
  totalParticipants: number;
}

export interface NondiscriminationTestResult {
  planYear: number;
  testName: string;
  testType: 'adp' | 'acp' | 'top_heavy' | '410b_coverage';
  result: TestResult;
  hceAvgDeferralRate?: number;
  nhceAvgDeferralRate?: number;
  hceCount?: number;
  nhceCount?: number;
  topHeavyPercentage?: number;
  correctionRequired: boolean;
  correctionDeadline?: string;
  correctionMethod?: string;
  notes?: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_ACA_STATUS: ACAStatus = {
  currentYear: 2026,
  aleStatus: 'ale',
  totalEmployees: 828,
  fullTimeEmployees: 712,
  fte: 762,
  aleThreshold: 50,
  isSubjectToESRP: true,
  minimumValueOffered: true,
  affordabilityMet: true,
  safeHarbor: 'w2',
  measurementPeriodStart: '2025-11-01',
  measurementPeriodEnd: '2025-10-31',
};

const MOCK_ELIGIBLE_EMPLOYEES: ACAEligibleEmployee[] = [
  {
    employeeId: 'emp-0445',
    name: 'Sara Mitchell',
    department: 'Technology',
    avgHoursPerWeek: 42,
    isEligible: true,
    eligibilityReason: '30+ hrs/week average',
    offerStatus: 'enrolled',
    form1095CStatus: 'generated',
    coverageMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    employeeSelfOnlyCost: 245,
    affordabilityPercentage: 2.1,
  },
  {
    employeeId: 'emp-0521',
    name: 'Tom Chen',
    department: 'Finance',
    avgHoursPerWeek: 38,
    isEligible: true,
    eligibilityReason: '30+ hrs/week average',
    offerStatus: 'waived',
    form1095CStatus: 'generated',
    coverageMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    employeeSelfOnlyCost: 245,
    affordabilityPercentage: 2.1,
  },
  {
    employeeId: 'emp-0612',
    name: 'Maria Santos',
    department: 'HR',
    avgHoursPerWeek: 35,
    isEligible: true,
    eligibilityReason: '130+ hrs/month',
    offerStatus: 'enrolled',
    form1095CStatus: 'pending',
    coverageMonths: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    employeeSelfOnlyCost: 245,
    affordabilityPercentage: 2.4,
  },
  {
    employeeId: 'emp-0710',
    name: 'Derek Johnson',
    department: 'Operations',
    avgHoursPerWeek: 28,
    isEligible: false,
    eligibilityReason: 'Below 30 hrs/week threshold',
    offerStatus: 'not_offered',
    form1095CStatus: 'pending',
    coverageMonths: [],
    employeeSelfOnlyCost: 0,
    affordabilityPercentage: 0,
  },
  {
    employeeId: 'emp-0815',
    name: 'Lisa Wong',
    department: 'Marketing',
    avgHoursPerWeek: 40,
    isEligible: true,
    eligibilityReason: '30+ hrs/week average',
    offerStatus: 'enrolled',
    form1095CStatus: 'error',
    coverageMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    employeeSelfOnlyCost: 245,
    affordabilityPercentage: 1.9,
  },
];

const MOCK_NONDISCRIMINATION_TESTS: NondiscriminationTestResult[] = [
  {
    planYear: 2025,
    testName: 'ADP Test (401k Actual Deferral Percentage)',
    testType: 'adp',
    result: 'pass',
    hceAvgDeferralRate: 6.2,
    nhceAvgDeferralRate: 4.1,
    hceCount: 48,
    nhceCount: 614,
    correctionRequired: false,
    notes: 'HCE deferral rate (6.2%) does not exceed 2x NHCE rate (8.2%). Test passes.',
  },
  {
    planYear: 2025,
    testName: 'ACP Test (401k Employer Match)',
    testType: 'acp',
    result: 'pass',
    hceAvgDeferralRate: 3.1,
    nhceAvgDeferralRate: 2.0,
    hceCount: 48,
    nhceCount: 614,
    correctionRequired: false,
    notes: 'ACP test passes. Employer match distributions are nondiscriminatory.',
  },
  {
    planYear: 2025,
    testName: 'Top-Heavy Test (IRC § 416)',
    testType: 'top_heavy',
    result: 'fail',
    topHeavyPercentage: 62.4,
    correctionRequired: true,
    correctionDeadline: '2026-12-31',
    correctionMethod: 'Provide 3% minimum employer contribution for all non-key employees',
    notes:
      'Plan is top-heavy: key employee assets exceed 60% of plan assets. Minimum contribution required.',
  },
  {
    planYear: 2025,
    testName: '410(b) Coverage Test',
    testType: '410b_coverage',
    result: 'pass',
    hceCount: 48,
    nhceCount: 614,
    correctionRequired: false,
    notes: 'Coverage ratio test passes. NHCE benefit percentage meets ratio test threshold.',
  },
];

const MOCK_ERISA_FILINGS: ERISAFilingStatus[] = [
  {
    planYear: 2024,
    planName: 'KreupAI 401(k) Plan',
    form5500DueDate: '2025-07-31',
    form5500ExtendedDueDate: '2025-10-15',
    status: 'filed',
    filedDate: '2025-07-28',
    auditorName: 'Deloitte & Touche LLP',
    totalAssets: 24500000,
    totalParticipants: 512,
  },
  {
    planYear: 2025,
    planName: 'KreupAI 401(k) Plan',
    form5500DueDate: '2026-07-31',
    form5500ExtendedDueDate: '2026-10-15',
    status: 'pending',
    auditorName: 'Deloitte & Touche LLP',
    totalAssets: 27200000,
    totalParticipants: 548,
  },
  {
    planYear: 2024,
    planName: 'KreupAI Group Health Plan',
    form5500DueDate: '2025-07-31',
    status: 'filed',
    filedDate: '2025-07-28',
    totalAssets: 0,
    totalParticipants: 612,
  },
];

// ── Service Class ──────────────────────────────────────────────────────────────

export class ACAERISAService {
  private static delay(ms = 400): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  /** ALE (Applicable Large Employer) determination */
  static async getACAStatus(): Promise<ACAStatus> {
    await this.delay();
    return { ...MOCK_ACA_STATUS };
  }

  /** Get all ACA-eligible employees */
  static async getACAEligibleEmployees(): Promise<ACAEligibleEmployee[]> {
    await this.delay(400);
    return [...MOCK_ELIGIBLE_EMPLOYEES];
  }

  /** Generate Form 1095-C for a specific employee */
  static async generateForm1095C(employeeId: string, year: number): Promise<Form1095C> {
    await this.delay(800);
    const emp = MOCK_ELIGIBLE_EMPLOYEES.find((e) => e.employeeId === employeeId);

    return {
      employeeId,
      employeeName: emp?.name ?? 'Employee Name',
      ssn: '***-**-1234',
      year,
      employerName: 'KreupAI Inc.',
      ein: '82-1234567',
      monthlyData: Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        line14Code: emp?.coverageMonths.includes(i + 1) ? '1A' : '1H',
        line15Amount: emp?.employeeSelfOnlyCost ?? 0,
        line16Code: emp?.offerStatus === 'waived' ? '2C' : '',
      })),
      generatedAt: new Date().toISOString(),
      status: 'generated',
    };
  }

  /** Generate Form 1094-C transmittal */
  static async generateForm1094C(year: number): Promise<Form1094C> {
    await this.delay(600);
    return {
      year,
      employerName: 'KreupAI Inc.',
      ein: '82-1234567',
      totalForms1095C: MOCK_ELIGIBLE_EMPLOYEES.length,
      authoritative: true,
      monthlyOffersIndicator: Array(12).fill(true),
      minimumEssentialCoverageMonths: Array(12).fill(true),
      certificationOfEligibility: ['A', 'B', 'C'],
      generatedAt: new Date().toISOString(),
      filingDeadline: `${year + 1}-02-28`,
    };
  }

  /** Get ERISA Plan Document */
  static async getERISAPlanDocument(planId: string): Promise<ERISAPlanDocument> {
    await this.delay(300);
    return {
      planId,
      planName: 'KreupAI 401(k) Plan',
      planType: '401(k) Defined Contribution',
      effectiveDate: '2020-01-01',
      lastAmendedDate: '2025-01-01',
      documentUrl: '/documents/erisa-plan-document.pdf',
      version: 5,
    };
  }

  /** Get Summary Plan Description */
  static async getSPD(planId: string): Promise<SummaryPlanDescription> {
    await this.delay(300);
    return {
      planId,
      planName: 'KreupAI 401(k) Plan — Summary Plan Description',
      effectiveDate: '2025-01-01',
      distributionDate: '2025-02-01',
      documentsUrl: '/documents/spd-2025.pdf',
      languages: ['English', 'Spanish'],
    };
  }

  /** Get ERISA Form 5500 filing status */
  static async getERISAFilingStatus(): Promise<ERISAFilingStatus[]> {
    await this.delay(300);
    return [...MOCK_ERISA_FILINGS];
  }

  /** Get nondiscrimination test results (ADP, ACP, Top-Heavy) */
  static async getNondiscriminationTestResults(): Promise<NondiscriminationTestResult[]> {
    await this.delay(400);
    return [...MOCK_NONDISCRIMINATION_TESTS];
  }
}
