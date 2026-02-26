/**
 * @module benefitsComplianceService
 * @description Benefits regulatory compliance — ACA 1095-B/C forms, ERISA Summary Plan Descriptions,
 *   nondiscrimination testing, Section 125 cafeteria plans, HSA Form 8889, and aggregate compliance reporting.
 * @project AURA HCM Platform
 * @section 18.5 — Benefits Compliance
 *
 * Legal References:
 *  ACA: 26 U.S.C. §§ 4980H, 6055, 6056 — Employer Shared Responsibility; 1095-B/C reporting
 *  ERISA: 29 U.S.C. §§ 1021-1031 — disclosure & reporting; SPD required within 90 days of enrollment
 *  IRC § 125: Cafeteria plan nondiscrimination — § 125(b) eligibility, § 125(c) contribution tests
 *  IRC § 410(b): Minimum coverage test — 70% ratio test or average benefit test
 *  IRC §§ 401(k), 401(m): ADP/ACP nondiscrimination tests
 *  IRC § 416: Top-heavy rules — key employee concentration > 60%
 *  IRC §§ 223, 8889: HSA contribution limits and Form 8889 reporting
 *  IRS Table I: Uniform premiums for §79 group-term life imputed income calculation
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type ACAEmployeeStatus = 'FULL_TIME' | 'PART_TIME' | 'SEASONAL' | 'VARIABLE';
export type ACAOfferType =
  | '1A' // Qualifying Offer Method
  | '1B' // MEC offered; coverage affordable
  | '1C' // MEC offered to employee; not offered to dependents
  | '1D' // MEC offered to employee + dependents; not offered to spouse
  | '1E' // MEC offered to employee + dependents + spouse
  | '1H' // No offer of coverage
  | '1J' // MEC offered; coverage may not be affordable (conditional)
  | '1K'; // Qualifying Offer made to employee; conditional offer to spouse

export type CoverageType = 'MEC' | 'MV' | 'BOTH' | 'NONE';
export type NondiscriminationTestType =
  | '410B_RATIO'
  | '410B_AVG_BENEFIT'
  | 'ADP'
  | 'ACP'
  | 'TOP_HEAVY'
  | '125_ELIGIBILITY'
  | '125_BENEFITS'
  | '125_KEY_EMPLOYEE';
export type TestResult = 'PASS' | 'FAIL' | 'MARGINAL' | 'NOT_APPLICABLE';
export type ComplianceStatus = 'COMPLIANT' | 'AT_RISK' | 'VIOLATION' | 'PENDING_REVIEW';

export interface Form1095B {
  formYear: number;
  employeeId: string;
  employeeName: string;
  employeeTIN: string; // SSN masked
  employeeAddress: string;
  employerName: string;
  employerEIN: string;
  responsibleIndividualName: string;
  coverageMonths: CoverageMonth[];
  coveredIndividuals: CoveredIndividual[];
  selfInsured: boolean;
  generatedDate: string;
}

export interface Form1095C {
  formYear: number;
  employeeId: string;
  employeeName: string;
  employeeTIN: string;
  employeeAddress: string;
  employerName: string;
  employerEIN: string;
  employerAddress: string;
  line14OfferCodes: MonthlyCode[]; // Offer of coverage (lines 14)
  line15EmployeeShare: MonthlyAmount[]; // Employee required contribution (line 15)
  line16SafeHarborCodes: MonthlyCode[]; // Section 4980H safe harbor (line 16)
  part3CoveredIndividuals: CoveredIndividual[] | null; // Only for self-insured
  isFullTimeEmployee: boolean;
  totalMonthsFullTime: number;
  generatedDate: string;
}

export interface MonthlyCode {
  month: string; // 'JAN'-'DEC' or 'ALL12'
  code: string;
}

export interface MonthlyAmount {
  month: string;
  amount: number;
}

export interface CoverageMonth {
  month: string;
  covered: boolean;
}

export interface CoveredIndividual {
  name: string;
  tin: string; // SSN masked
  dateOfBirth: string;
  coveredMonths: CoverageMonth[];
}

export interface ACAStatus {
  isALE: boolean; // Applicable Large Employer (50+ FTEs)
  totalFTEs: number;
  fullTimeEmployees: number;
  partTimeEquivalents: number;
  affordabilityTest: AffordabilityTest;
  mecCompliance: MECCompliance;
  coverageOfferedPercent: number; // % of full-time offered coverage
  ninetyFivePercentRule: boolean; // 95% of FT employees offered MEC
  formsReady1095B: number;
  formsReady1095C: number;
  filingDeadline: string;
  employerPenaltyRisk: string;
}

export interface AffordabilityTest {
  safeHarborMethod: 'W2' | 'RATE_OF_PAY' | 'FEDERAL_POVERTY_LINE';
  affordabilityThresholdPercent: number; // 9.02% for 2026
  employeeCostLowest: number;
  federalPovertyLine: number;
  isAffordable: boolean;
  employeesFailingAffordability: number;
}

export interface MECCompliance {
  plansWithMEC: string[];
  plansWithMV: string[];
  percentEmployeesMEC: number;
  percentEmployeesMV: number;
  isMECCompliant: boolean;
  isMVCompliant: boolean;
}

export interface ERISASummaryPlanDescription {
  planId: string;
  planName: string;
  planType: string;
  carrier: string;
  effectiveDateDescription: string;
  eligibilityRequirements: string;
  enrollmentProcedure: string;
  benefitsDescription: string;
  participantRights: string[];
  claimsProcedure: string;
  appealsProcedure: string;
  continuationCoverage: string;
  subrogation: string;
  erisa502Rights: string;
  planAdministrator: string;
  planSponsor: string;
  planNumber: string;
  agentForService: string;
  planYearEnd: string;
  amendmentProcedure: string;
  generatedDate: string;
}

export interface NondiscriminationTestResult {
  planId: string;
  planName: string;
  testType: NondiscriminationTestType;
  testYear: number;
  result: TestResult;
  details: NondiscriminationTestDetail;
  recommendations: string[];
  testedDate: string;
  testedBy: string;
}

export interface NondiscriminationTestDetail {
  description: string;
  threshold: number | string;
  actualValue: number | string;
  participantsIncluded: number;
  highlyCompensatedEmployees?: number;
  nonHighlyCompensatedEmployees?: number;
  keyEmployees?: number;
  nonKeyEmployees?: number;
  methodUsed?: string;
}

export interface Section125Status {
  planId: string;
  planName: string;
  planYear: string;
  eligibilityTestResult: TestResult;
  benefitsTestResult: TestResult;
  keyEmployeeConcentrationTest: TestResult;
  flexibleSpendingAccounts: FSAStatus[];
  isCompliant: boolean;
  lastTestedDate: string;
  nextTestDue: string;
}

export interface FSAStatus {
  type: 'HEALTHCARE' | 'DEPENDENT_CARE' | 'ADOPTION';
  annualElectionLimit: number;
  averageElection: number;
  participationRate: number;
  isWithinLimits: boolean;
}

export interface Form8889 {
  formYear: number;
  employeeId: string;
  employeeName: string;
  coverageType: 'SELF' | 'FAMILY';
  hsaContributions: {
    employeeContributions: number;
    employerContributions: number;
    totalContributions: number;
    annualLimit: number; // $4,150 self / $8,300 family (2026)
    catchUpContribution: number; // $1,000 if age 55+
    excessContributions: number;
  };
  qualifiedMedicalExpenses: number;
  distributionsForNonMedical: number;
  taxableDistributions: number;
  generatedDate: string;
}

export interface BenefitsComplianceSummary {
  complianceDate: string;
  overallStatus: ComplianceStatus;
  acaCompliance: ComplianceStatus;
  erisaCompliance: ComplianceStatus;
  section125Compliance: ComplianceStatus;
  ndtResults: ComplianceStatus;
  hsaCompliance: ComplianceStatus;
  openIssues: ComplianceIssue[];
  upcomingDeadlines: ComplianceDeadline[];
  complianceScore: number;
}

export interface ComplianceIssue {
  id: string;
  area: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  description: string;
  affectedPlans: string[];
  dueDate: string;
  remediation: string;
}

export interface ComplianceDeadline {
  label: string;
  dueDate: string;
  description: string;
  responsible: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETE' | 'OVERDUE';
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_COVERAGE_MONTHS: CoverageMonth[] = [
  { month: 'JAN', covered: true },
  { month: 'FEB', covered: true },
  { month: 'MAR', covered: true },
  { month: 'APR', covered: true },
  { month: 'MAY', covered: true },
  { month: 'JUN', covered: true },
  { month: 'JUL', covered: true },
  { month: 'AUG', covered: true },
  { month: 'SEP', covered: true },
  { month: 'OCT', covered: true },
  { month: 'NOV', covered: true },
  { month: 'DEC', covered: true },
];

// ── Service Functions ──────────────────────────────────────────────────────────

/**
 * Generate ACA Form 1095-B data for an employee (for non-ALE employers or self-insured plans).
 */
export async function generate1095B(employeeId: string, year: number): Promise<Form1095B> {
  await new Promise((r) => setTimeout(r, 300));

  return {
    formYear: year,
    employeeId,
    employeeName: 'Priya Sharma',
    employeeTIN: '***-**-4521',
    employeeAddress: '42 Sunset Ave, Dubai Internet City, Dubai, UAE',
    employerName: 'KreupAI Technologies LLC',
    employerEIN: '87-1234567',
    responsibleIndividualName: 'Priya Sharma',
    coverageMonths: MOCK_COVERAGE_MONTHS,
    coveredIndividuals: [
      {
        name: 'Priya Sharma',
        tin: '***-**-4521',
        dateOfBirth: '1988-04-14',
        coveredMonths: MOCK_COVERAGE_MONTHS,
      },
      {
        name: 'Arjun Sharma',
        tin: '***-**-7890',
        dateOfBirth: '2012-09-22',
        coveredMonths: MOCK_COVERAGE_MONTHS,
      },
      {
        name: 'Riya Sharma',
        tin: '***-**-3311',
        dateOfBirth: '2015-03-07',
        coveredMonths: MOCK_COVERAGE_MONTHS,
      },
    ],
    selfInsured: false,
    generatedDate: new Date().toISOString().slice(0, 10),
  };
}

/**
 * Generate ACA Form 1095-C data for an employee (for Applicable Large Employers with 50+ FTEs).
 * Lines 14, 15, 16 per IRS instructions.
 */
export async function generate1095C(employeeId: string, year: number): Promise<Form1095C> {
  await new Promise((r) => setTimeout(r, 300));

  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];

  return {
    formYear: year,
    employeeId,
    employeeName: 'Priya Sharma',
    employeeTIN: '***-**-4521',
    employeeAddress: '42 Sunset Ave, Dubai Internet City, Dubai, UAE',
    employerName: 'KreupAI Technologies LLC',
    employerEIN: '87-1234567',
    employerAddress: '1 Innovation Drive, Dubai Internet City, Dubai, UAE',
    line14OfferCodes: [
      { month: 'ALL12', code: '1E' }, // MEC offered to employee + dependents + spouse all 12 months
    ],
    line15EmployeeShare: months.map((m) => ({ month: m, amount: 350.0 })), // Employee monthly premium
    line16SafeHarborCodes: [
      { month: 'ALL12', code: '2C' }, // Employee enrolled in employer-sponsored coverage
    ],
    part3CoveredIndividuals: null, // Not self-insured
    isFullTimeEmployee: true,
    totalMonthsFullTime: 12,
    generatedDate: new Date().toISOString().slice(0, 10),
  };
}

/**
 * Get ACA compliance dashboard status including ALE determination, affordability, and MEC/MV testing.
 */
export async function getACAStatus(): Promise<ACAStatus> {
  await new Promise((r) => setTimeout(r, 400));

  return {
    isALE: true,
    totalFTEs: 487,
    fullTimeEmployees: 412,
    partTimeEquivalents: 75,
    affordabilityTest: {
      safeHarborMethod: 'W2',
      affordabilityThresholdPercent: 9.02,
      employeeCostLowest: 350.0,
      federalPovertyLine: 15060,
      isAffordable: true, // $350 < 9.02% of FPL ($114.18/mo threshold) — check: $350 < 9.02% of salary
      employeesFailingAffordability: 3,
    },
    mecCompliance: {
      plansWithMEC: ['Balanced Choice (Gold)', 'High Deductible Health Plan', 'Standard PPO'],
      plansWithMV: ['Balanced Choice (Gold)', 'Standard PPO'],
      percentEmployeesMEC: 97.8,
      percentEmployeesMV: 94.2,
      isMECCompliant: true,
      isMVCompliant: true,
    },
    coverageOfferedPercent: 98.1,
    ninetyFivePercentRule: true,
    formsReady1095B: 0,
    formsReady1095C: 412,
    filingDeadline: `${new Date().getFullYear()}-03-31`,
    employerPenaltyRisk: 'LOW — 95% safe harbor met; 3 employees may require follow-up',
  };
}

/**
 * Get ERISA Summary Plan Description data for a given plan.
 */
export async function getERISASPD(planId: string): Promise<ERISASummaryPlanDescription> {
  await new Promise((r) => setTimeout(r, 300));

  const planDetails: Record<string, Partial<ERISASummaryPlanDescription>> = {
    'h-gold': {
      planName: 'Balanced Choice (Gold) Medical Plan',
      planType: 'Medical/Health',
      carrier: 'Blue Cross Blue Shield',
      planNumber: '501',
      benefitsDescription:
        'Comprehensive medical coverage including preventive care (100%), specialist visits ($40 copay), emergency care ($200 copay), hospitalization (80% after deductible), and prescription drug coverage (Tier 1: $10, Tier 2: $35, Tier 3: $70).',
    },
    'd-gold': {
      planName: 'Comprehensive Dental Plan',
      planType: 'Dental',
      carrier: 'Delta Dental',
      planNumber: '502',
      benefitsDescription:
        'Dental coverage including preventive (100%), basic restorative (80%), major restorative (50%), and orthodontic (50% up to $2,000 lifetime).',
    },
  };

  const specific = planDetails[planId] ?? {};

  return {
    planId,
    planName: specific.planName ?? 'Benefit Plan',
    planType: specific.planType ?? 'Health',
    carrier: specific.carrier ?? 'Insurance Carrier',
    effectiveDateDescription: 'January 1 through December 31 of each plan year',
    eligibilityRequirements:
      'You are eligible to participate in this Plan if you are an active employee regularly scheduled to work 30 or more hours per week. Coverage begins on the first day of the month following your date of hire.',
    enrollmentProcedure:
      'New hires must enroll within 30 days of their hire date via the HR self-service portal. Annual open enrollment is held each November for coverage effective January 1.',
    benefitsDescription:
      specific.benefitsDescription ??
      'Please refer to the Summary of Benefits and Coverage (SBC) for details.',
    participantRights: [
      'Right to examine this SPD and plan documents without charge',
      'Right to obtain a copy of plan documents for a reasonable copying charge',
      'Right to receive a written explanation if a claim is denied',
      'Right to appeal a denied claim',
      'Right to file suit under ERISA Section 502(a) if your claim is denied after appeal',
      'Right to COBRA continuation coverage upon loss of coverage',
      'Right to Medicare Secondary Payer (MSP) compliance information',
    ],
    claimsProcedure:
      'To submit a claim: (1) Obtain services from a participating provider. (2) The provider submits claims electronically to the carrier. (3) For out-of-network, submit a completed claim form with itemized receipt. Claims must be submitted within 365 days of service.',
    appealsProcedure:
      'Level 1 Appeal: Submit written appeal within 180 days of denial. Decision within 30 days (urgent) or 60 days (non-urgent). Level 2 Appeal: External Independent Review available after exhausting internal appeals per the ACA External Review rules.',
    continuationCoverage:
      'You may be eligible for COBRA continuation coverage if you lose coverage due to a qualifying event. You have 60 days from the later of the qualifying event or the COBRA election notice to elect coverage.',
    subrogation:
      'The Plan has the right to recover benefits paid on your behalf from any third-party settlement, judgment, or recovery related to an injury or illness covered by the Plan.',
    erisa502Rights:
      'If you believe you have been denied benefits to which you are entitled under the Plan, you may file suit in state or federal court under ERISA Section 502(a). The Plan fiduciaries have a duty to act prudently and in the interest of participants.',
    planAdministrator:
      'KreupAI Technologies Benefits Administration, 1 Innovation Drive, Dubai Internet City, Dubai, UAE | 1-800-555-0100 | benefits@kreupai.com',
    planSponsor: 'KreupAI Technologies LLC, EIN: 87-1234567',
    planNumber: specific.planNumber ?? '501',
    agentForService:
      'General Counsel, KreupAI Technologies LLC, 1 Innovation Drive, Dubai Internet City, Dubai, UAE',
    planYearEnd: 'December 31',
    amendmentProcedure:
      'KreupAI Technologies reserves the right to amend, modify, or terminate this Plan at any time. Participants will be notified of material modifications within 60 days (or 210 days if part of the annual open enrollment).',
    generatedDate: new Date().toISOString().slice(0, 10),
  };
}

/**
 * Run a nondiscrimination test for a given plan and test type.
 */
export async function runNondiscriminationTest(
  planId: string,
  testType: NondiscriminationTestType
): Promise<NondiscriminationTestResult> {
  await new Promise((r) => setTimeout(r, 500));

  const testResults: Record<
    NondiscriminationTestType,
    NondiscriminationTestDetail & { result: TestResult }
  > = {
    '410B_RATIO': {
      description: 'IRC § 410(b) Ratio Percentage Test — benefits must cover 70% of non-HCEs',
      threshold: '70%',
      actualValue: '74.2%',
      participantsIncluded: 412,
      highlyCompensatedEmployees: 82,
      nonHighlyCompensatedEmployees: 330,
      result: 'PASS',
      methodUsed: 'Ratio Percentage Test',
    },
    '410B_AVG_BENEFIT': {
      description:
        'IRC § 410(b) Average Benefit Test — average benefit percentage must be at least 70%',
      threshold: '70%',
      actualValue: '78.5%',
      participantsIncluded: 412,
      highlyCompensatedEmployees: 82,
      nonHighlyCompensatedEmployees: 330,
      result: 'PASS',
      methodUsed: 'Average Benefit Percentage Test',
    },
    ADP: {
      description: 'IRC § 401(k)(3) Actual Deferral Percentage Test',
      threshold: '≤ 2% spread (or HCE ≤ 1.25x NHCE)',
      actualValue: 'HCE ADP: 6.8%, NHCE ADP: 5.4%',
      participantsIncluded: 387,
      highlyCompensatedEmployees: 78,
      nonHighlyCompensatedEmployees: 309,
      result: 'PASS',
      methodUsed: 'Current Year Testing Method',
    },
    ACP: {
      description: 'IRC § 401(m) Actual Contribution Percentage Test (employer match + after-tax)',
      threshold: '≤ 2% spread (or HCE ≤ 1.25x NHCE)',
      actualValue: 'HCE ACP: 3.2%, NHCE ACP: 2.8%',
      participantsIncluded: 387,
      highlyCompensatedEmployees: 78,
      nonHighlyCompensatedEmployees: 309,
      result: 'PASS',
      methodUsed: 'Current Year Testing Method',
    },
    TOP_HEAVY: {
      description:
        'IRC § 416 Top-Heavy Test — key employee accrued benefits must not exceed 60% of total',
      threshold: '≤ 60% key employee concentration',
      actualValue: '38.2% key employee share',
      participantsIncluded: 387,
      keyEmployees: 12,
      nonKeyEmployees: 375,
      result: 'PASS',
      methodUsed: 'Top-Heavy Determination Date',
    },
    '125_ELIGIBILITY': {
      description:
        'IRC § 125 Eligibility Test — cafeteria plan must not discriminate in favor of HCIs',
      threshold: '≥ 70% eligibility for non-HCIs',
      actualValue: '88.4% non-HCI eligibility',
      participantsIncluded: 412,
      highlyCompensatedEmployees: 82,
      nonHighlyCompensatedEmployees: 330,
      result: 'PASS',
      methodUsed: 'Eligibility Percentage Test',
    },
    '125_BENEFITS': {
      description: 'IRC § 125 Benefits Test — HCI benefits must not be disproportionate',
      threshold: 'HCI benefit % ≤ NHCI benefit %',
      actualValue: 'HCI: 4.2% of comp, NHCI: 3.8% of comp',
      participantsIncluded: 412,
      highlyCompensatedEmployees: 82,
      nonHighlyCompensatedEmployees: 330,
      result: 'MARGINAL',
      methodUsed: 'Benefits Concentration Test',
    },
    '125_KEY_EMPLOYEE': {
      description:
        'IRC § 125(b)(2) Key Employee Concentration Test — key employee nontaxable benefits ≤ 25%',
      threshold: '≤ 25% key employee concentration',
      actualValue: '18.7% key employee share',
      participantsIncluded: 412,
      keyEmployees: 15,
      nonKeyEmployees: 397,
      result: 'PASS',
      methodUsed: 'Key Employee Concentration Test',
    },
  };

  const testDetail = testResults[testType];

  return {
    planId,
    planName: 'KreupAI Benefit Plans',
    testType,
    testYear: new Date().getFullYear(),
    result: testDetail.result,
    details: {
      description: testDetail.description,
      threshold: testDetail.threshold,
      actualValue: testDetail.actualValue,
      participantsIncluded: testDetail.participantsIncluded,
      highlyCompensatedEmployees: testDetail.highlyCompensatedEmployees,
      nonHighlyCompensatedEmployees: testDetail.nonHighlyCompensatedEmployees,
      keyEmployees: testDetail.keyEmployees,
      nonKeyEmployees: testDetail.nonKeyEmployees,
      methodUsed: testDetail.methodUsed,
    },
    recommendations:
      testDetail.result === 'FAIL'
        ? [
            'Consider restructuring contribution tiers to reduce HCE/NHCE disparity',
            'Review plan design with ERISA counsel before year-end',
            'Consider corrective distributions before plan year close',
          ]
        : testDetail.result === 'MARGINAL'
          ? [
              'Monitor closely through year-end — currently within 10% of threshold',
              'Consider voluntary corrections to improve test results',
            ]
          : [
              'No action required — plan is in compliance',
              'Re-test annually or upon significant workforce changes',
            ],
    testedDate: new Date().toISOString().slice(0, 10),
    testedBy: 'Benefits Compliance System',
  };
}

/**
 * Get Section 125 cafeteria plan compliance status.
 */
export async function getSection125Status(): Promise<Section125Status> {
  await new Promise((r) => setTimeout(r, 300));

  return {
    planId: 'cafe-001',
    planName: 'KreupAI Cafeteria Plan',
    planYear: `${new Date().getFullYear()}-01-01 to ${new Date().getFullYear()}-12-31`,
    eligibilityTestResult: 'PASS',
    benefitsTestResult: 'MARGINAL',
    keyEmployeeConcentrationTest: 'PASS',
    flexibleSpendingAccounts: [
      {
        type: 'HEALTHCARE',
        annualElectionLimit: 3200, // 2026 limit
        averageElection: 1845,
        participationRate: 68.4,
        isWithinLimits: true,
      },
      {
        type: 'DEPENDENT_CARE',
        annualElectionLimit: 5000, // per household; $2,500 if MFS
        averageElection: 3200,
        participationRate: 41.2,
        isWithinLimits: true,
      },
    ],
    isCompliant: true,
    lastTestedDate: new Date().toISOString().slice(0, 10),
    nextTestDue: `${new Date().getFullYear() + 1}-01-15`,
  };
}

/**
 * Generate IRS Form 8889 data for HSA contribution reporting.
 */
export async function generateForm8889(employeeId: string, year: number): Promise<Form8889> {
  await new Promise((r) => setTimeout(r, 300));

  // 2026 HSA contribution limits (IRS Rev. Proc.)
  const _selfOnlyLimit = 4300;
  const familyLimit = 8550;
  const _catchUpAmount = 1000; // Age 55+

  const employeeContributions = 2400;
  const employerContributions = 1200;
  const totalContributions = employeeContributions + employerContributions;
  const annualLimit = familyLimit; // Family HDHP coverage

  return {
    formYear: year,
    employeeId,
    employeeName: 'Priya Sharma',
    coverageType: 'FAMILY',
    hsaContributions: {
      employeeContributions,
      employerContributions,
      totalContributions,
      annualLimit,
      catchUpContribution: 0,
      excessContributions: Math.max(0, totalContributions - annualLimit),
    },
    qualifiedMedicalExpenses: 2100,
    distributionsForNonMedical: 0,
    taxableDistributions: 0,
    generatedDate: new Date().toISOString().slice(0, 10),
  };
}

/**
 * Get aggregate benefits compliance status across all plans and regulatory requirements.
 */
export async function getBenefitsCompliance(): Promise<BenefitsComplianceSummary> {
  await new Promise((r) => setTimeout(r, 400));

  const today = new Date().toISOString().slice(0, 10);
  const year = new Date().getFullYear();

  return {
    complianceDate: today,
    overallStatus: 'COMPLIANT',
    acaCompliance: 'COMPLIANT',
    erisaCompliance: 'COMPLIANT',
    section125Compliance: 'AT_RISK',
    ndtResults: 'COMPLIANT',
    hsaCompliance: 'COMPLIANT',
    openIssues: [
      {
        id: 'issue-001',
        area: 'Section 125 Benefits Test',
        severity: 'WARNING',
        description:
          'Benefits Test result is MARGINAL — HCI benefit percentage is within 10% of threshold',
        affectedPlans: ['KreupAI Cafeteria Plan'],
        dueDate: `${year}-12-31`,
        remediation:
          'Review NFCI participation levels and consider expanding benefit elections for lower-paid employees',
      },
      {
        id: 'issue-002',
        area: 'ACA Affordability',
        severity: 'INFO',
        description:
          '3 employees may have coverage that exceeds 9.02% of household income under Rate of Pay safe harbor',
        affectedPlans: ['Balanced Choice (Gold)'],
        dueDate: `${year}-03-31`,
        remediation:
          'Document W-2 safe harbor calculations for all employees; review lowest-cost option availability',
      },
    ],
    upcomingDeadlines: [
      {
        label: 'ACA 1095-C Employee Distribution',
        dueDate: `${year}-03-02`,
        description: 'Distribute 1095-C forms to all full-time employees',
        responsible: 'Benefits Team',
        status: 'PENDING',
      },
      {
        label: 'ACA IRS Electronic Filing (1094-C/1095-C)',
        dueDate: `${year}-03-31`,
        description: 'File 1094-C transmittal and 1095-C copies electronically with IRS',
        responsible: 'Benefits/Finance Team',
        status: 'PENDING',
      },
      {
        label: 'ERISA Form 5500 Filing',
        dueDate: `${year}-07-31`,
        description: 'Annual Form 5500 filing for plans with 100+ participants',
        responsible: 'Finance/Legal Team',
        status: 'PENDING',
      },
      {
        label: 'Nondiscrimination Testing',
        dueDate: `${year}-12-15`,
        description:
          'Annual nondiscrimination testing for 401(k), cafeteria plan, and health plans',
        responsible: 'Benefits Team',
        status: 'PENDING',
      },
    ],
    complianceScore: 88,
  };
}

// ── Named export ───────────────────────────────────────────────────────────────

export const benefitsComplianceService = {
  generate1095B,
  generate1095C,
  getACAStatus,
  getERISASPD,
  runNondiscriminationTest,
  getSection125Status,
  generateForm8889,
  getBenefitsCompliance,
};
