/**
 * @module benefitsAnalyticsService
 * @description Benefits analytics and reporting — plan utilization, cost analysis,
 *   year-over-year trends, total compensation statements, wellness ROI, and plan comparisons.
 * @project AURA HCM Platform
 * @section 18.7 — Benefits Analytics & Reporting
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type BenefitsPeriod = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'YTD';
export type CostCategory =
  | 'MEDICAL'
  | 'DENTAL'
  | 'VISION'
  | 'LIFE'
  | 'DISABILITY'
  | 'FSA'
  | 'HSA'
  | 'WELLNESS'
  | 'EAP'
  | 'RETIREMENT';

export interface UtilizationReport {
  period: string;
  periodType: BenefitsPeriod;
  totalClaims: number;
  totalBilledAmount: number;
  totalPaidAmount: number;
  avgClaimAmount: number;
  utilizationByCategory: CategoryUtilization[];
  topDiagnoses: DiagnosisUtilization[];
  topProviders: ProviderUtilization[];
  preventiveCareRate: number; // % employees who had preventive visit
  memberMonths: number;
  claimsPerMemberMonth: number;
  paidPMPM: number; // per member per month
}

export interface CategoryUtilization {
  category: CostCategory;
  claimsCount: number;
  totalBilled: number;
  totalPaid: number;
  avgClaim: number;
  percentOfTotal: number;
  utilizationRate: number; // % of enrolled members who filed a claim
  changeVsPriorPeriod: number; // percentage change
}

export interface DiagnosisUtilization {
  icdCode: string;
  description: string;
  claimsCount: number;
  totalPaid: number;
  avgCost: number;
  affectedMembers: number;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
}

export interface ProviderUtilization {
  providerNpi: string;
  providerName: string;
  specialty: string;
  claimsCount: number;
  totalPaid: number;
  avgClaimAmount: number;
  networkStatus: 'IN_NETWORK' | 'OUT_OF_NETWORK';
}

export interface CostAnalysis {
  period: string;
  periodType: BenefitsPeriod;
  totalBenefitsCost: number;
  employerCost: number;
  employeeCost: number;
  employerPercent: number;
  employeePercent: number;
  costByCategory: CategoryCost[];
  costPerEmployee: number;
  costPerFTE: number;
  benefitsCostAsPercentPayroll: number;
  projectedAnnualCost: number;
  budgetVariance: number; // actual vs budget
  budgetVariancePercent: number;
}

export interface CategoryCost {
  category: CostCategory;
  employerPremium: number;
  employeePremium: number;
  claimsPaid: number;
  adminCost: number;
  totalCost: number;
  costPerEmployee: number;
  enrolledMembers: number;
  participationRate: number;
}

export interface BenefitsTrend {
  years: YearTrend[];
  compoundAnnualGrowthRate: number; // CAGR over period
  projectedNextYear: number;
  inflation: BenefitsInflation;
}

export interface YearTrend {
  year: number;
  totalCost: number;
  employerCost: number;
  employeeCost: number;
  enrollment: number;
  costPerEmployee: number;
  claimsTotal: number;
  changePercent: number | null;
}

export interface BenefitsInflation {
  medicalInflation: number; // % annual increase
  dentalInflation: number;
  visionInflation: number;
  lifeInsuranceInflation: number;
  nationalAverage: number; // KFF employer health benefit survey benchmark
}

export interface TotalBenefitsStatement {
  employeeId: string;
  employeeName: string;
  statementYear: number;
  salary: number;
  benefitsSummary: BenefitLineItem[];
  totalCompensationValue: number;
  totalBenefitsValue: number;
  totalCashCompensation: number;
  benefitsAsPercentSalary: number;
  statementDate: string;
  comparisonToMarket: MarketComparison;
}

export interface BenefitLineItem {
  category: string;
  planName: string;
  employerAnnualValue: number;
  employeeAnnualContribution: number;
  totalAnnualValue: number;
  notes: string;
}

export interface MarketComparison {
  position: 'ABOVE_MARKET' | 'AT_MARKET' | 'BELOW_MARKET';
  percentile: number;
  marketMedianBenefitsValue: number;
  industryBenchmark: number;
  source: string;
}

export interface WellnessROI {
  programYear: number;
  totalProgramCost: number;
  participationRate: number;
  participantCount: number;
  healthRiskAssessmentsCompleted: number;
  biometricScreeningsCompleted: number;
  incentivestPaid: number;
  measuredOutcomes: WellnessOutcome[];
  claimsSavings: number; // estimated reduction in claims
  productivityGains: number; // estimated value of reduced absenteeism
  totalROI: number; // (savings + productivity - cost) / cost * 100
  roiRatio: number; // for every $1 invested, return $X
}

export interface WellnessOutcome {
  metric: string;
  baselineValue: number;
  currentValue: number;
  changePercent: number;
  trend: 'IMPROVING' | 'STABLE' | 'WORSENING';
  estimatedImpact: string;
}

export interface PlanComparisonReport {
  comparisonPeriod: string;
  plans: PlanPerformance[];
  recommendation: string;
  suggestedChanges: string[];
}

export interface PlanPerformance {
  planId: string;
  planName: string;
  planType: string;
  carrier: string;
  enrolledMembers: number;
  participationRate: number;
  totalEmployerCost: number;
  totalEmployeeCost: number;
  totalClaimsPaid: number;
  lossRatio: number; // claims / premiums — ideal 80-85%
  avgMemberSatisfaction: number;
  netPromoterScore: number;
  topComplaintsCategory: string;
  renewalRateIncrease: number;
  recommendation: 'RETAIN' | 'RENEGOTIATE' | 'REPLACE' | 'MONITOR';
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_PLAN_PERFORMANCE: PlanPerformance[] = [
  {
    planId: 'h-gold',
    planName: 'Balanced Choice (Gold)',
    planType: 'Medical',
    carrier: 'Blue Cross Blue Shield',
    enrolledMembers: 1248,
    participationRate: 78.4,
    totalEmployerCost: 1440000,
    totalEmployeeCost: 420000,
    totalClaimsPaid: 1180000,
    lossRatio: 81.9,
    avgMemberSatisfaction: 4.1,
    netPromoterScore: 42,
    topComplaintsCategory: 'Prior authorization delays',
    renewalRateIncrease: 6.2,
    recommendation: 'RETAIN',
  },
  {
    planId: 'h-hdhp',
    planName: 'High Deductible Health Plan',
    planType: 'Medical',
    carrier: 'Cigna',
    enrolledMembers: 342,
    participationRate: 21.5,
    totalEmployerCost: 268000,
    totalEmployeeCost: 72000,
    totalClaimsPaid: 185000,
    lossRatio: 68.4,
    avgMemberSatisfaction: 3.7,
    netPromoterScore: 28,
    topComplaintsCategory: 'High out-of-pocket costs',
    renewalRateIncrease: 4.8,
    recommendation: 'MONITOR',
  },
  {
    planId: 'd-gold',
    planName: 'Comprehensive Dental',
    planType: 'Dental',
    carrier: 'Delta Dental',
    enrolledMembers: 1050,
    participationRate: 66.0,
    totalEmployerCost: 107100,
    totalEmployeeCost: 94500,
    totalClaimsPaid: 145000,
    lossRatio: 72.0,
    avgMemberSatisfaction: 4.3,
    netPromoterScore: 51,
    topComplaintsCategory: 'Out-of-network dental labs',
    renewalRateIncrease: 3.5,
    recommendation: 'RETAIN',
  },
];

// ── Service Functions ──────────────────────────────────────────────────────────

/**
 * Get plan utilization report for a given period.
 */
export async function getUtilizationReport(
  period: string,
  periodType: BenefitsPeriod = 'MONTHLY'
): Promise<UtilizationReport> {
  await new Promise((r) => setTimeout(r, 400));

  return {
    period,
    periodType,
    totalClaims: 847,
    totalBilledAmount: 1285400,
    totalPaidAmount: 982300,
    avgClaimAmount: 1160,
    utilizationByCategory: [
      {
        category: 'MEDICAL',
        claimsCount: 512,
        totalBilled: 985000,
        totalPaid: 756000,
        avgClaim: 1476,
        percentOfTotal: 76.9,
        utilizationRate: 44.2,
        changeVsPriorPeriod: 2.8,
      },
      {
        category: 'DENTAL',
        claimsCount: 215,
        totalBilled: 198000,
        totalPaid: 142000,
        avgClaim: 660,
        percentOfTotal: 14.5,
        utilizationRate: 62.1,
        changeVsPriorPeriod: -1.2,
      },
      {
        category: 'VISION',
        claimsCount: 98,
        totalBilled: 54200,
        totalPaid: 42800,
        avgClaim: 437,
        percentOfTotal: 4.4,
        utilizationRate: 28.4,
        changeVsPriorPeriod: 0.5,
      },
      {
        category: 'WELLNESS',
        claimsCount: 22,
        totalBilled: 48200,
        totalPaid: 41500,
        avgClaim: 1886,
        percentOfTotal: 4.2,
        utilizationRate: 12.8,
        changeVsPriorPeriod: 8.4,
      },
    ],
    topDiagnoses: [
      {
        icdCode: 'J06.9',
        description: 'Acute Upper Respiratory Infection',
        claimsCount: 42,
        totalPaid: 28400,
        avgCost: 676,
        affectedMembers: 38,
        trend: 'STABLE',
      },
      {
        icdCode: 'M54.5',
        description: 'Low Back Pain',
        claimsCount: 38,
        totalPaid: 84200,
        avgCost: 2216,
        affectedMembers: 32,
        trend: 'INCREASING',
      },
      {
        icdCode: 'E11.9',
        description: 'Type 2 Diabetes',
        claimsCount: 34,
        totalPaid: 102800,
        avgCost: 3024,
        affectedMembers: 28,
        trend: 'STABLE',
      },
      {
        icdCode: 'I10',
        description: 'Essential Hypertension',
        claimsCount: 31,
        totalPaid: 52300,
        avgCost: 1687,
        affectedMembers: 29,
        trend: 'STABLE',
      },
      {
        icdCode: 'F32.9',
        description: 'Major Depressive Disorder',
        claimsCount: 28,
        totalPaid: 62100,
        avgCost: 2218,
        affectedMembers: 22,
        trend: 'INCREASING',
      },
    ],
    topProviders: [
      {
        providerNpi: '1234567890',
        providerName: 'Dubai Healthcare City Clinic',
        specialty: 'Primary Care',
        claimsCount: 94,
        totalPaid: 48200,
        avgClaimAmount: 513,
        networkStatus: 'IN_NETWORK',
      },
      {
        providerNpi: '2345678901',
        providerName: 'Emirates Heart Centre',
        specialty: 'Cardiology',
        claimsCount: 22,
        totalPaid: 98400,
        avgClaimAmount: 4473,
        networkStatus: 'IN_NETWORK',
      },
      {
        providerNpi: '9876543210',
        providerName: 'Rashid Hospital',
        specialty: 'Hospital',
        claimsCount: 18,
        totalPaid: 182000,
        avgClaimAmount: 10111,
        networkStatus: 'IN_NETWORK',
      },
    ],
    preventiveCareRate: 68.4,
    memberMonths: 4740,
    claimsPerMemberMonth: 0.18,
    paidPMPM: 207.24,
  };
}

/**
 * Get employer vs employee cost breakdown for a given period.
 */
export async function getCostAnalysis(
  period: string,
  periodType: BenefitsPeriod = 'ANNUAL'
): Promise<CostAnalysis> {
  await new Promise((r) => setTimeout(r, 350));

  const totalCost = 2281600;
  const employerCost = 1742800;
  const employeeCost = 538800;

  return {
    period,
    periodType,
    totalBenefitsCost: totalCost,
    employerCost,
    employeeCost,
    employerPercent: parseFloat(((employerCost / totalCost) * 100).toFixed(1)),
    employeePercent: parseFloat(((employeeCost / totalCost) * 100).toFixed(1)),
    costByCategory: [
      {
        category: 'MEDICAL',
        employerPremium: 1152000,
        employeePremium: 316800,
        claimsPaid: 898000,
        adminCost: 46800,
        totalCost: 1468800,
        costPerEmployee: 5778,
        enrolledMembers: 254,
        participationRate: 78.4,
      },
      {
        category: 'DENTAL',
        employerPremium: 128400,
        employeePremium: 113400,
        claimsPaid: 174000,
        adminCost: 8200,
        totalCost: 241800,
        costPerEmployee: 2112,
        enrolledMembers: 214,
        participationRate: 66.0,
      },
      {
        category: 'VISION',
        employerPremium: 43200,
        employeePremium: 25920,
        claimsPaid: 51360,
        adminCost: 2400,
        totalCost: 69120,
        costPerEmployee: 552,
        enrolledMembers: 198,
        participationRate: 61.1,
      },
      {
        category: 'LIFE',
        employerPremium: 64800,
        employeePremium: 18000,
        claimsPaid: 0,
        adminCost: 2400,
        totalCost: 82800,
        costPerEmployee: 312,
        enrolledMembers: 324,
        participationRate: 100.0,
      },
      {
        category: 'DISABILITY',
        employerPremium: 40320,
        employeePremium: 17280,
        claimsPaid: 0,
        adminCost: 1800,
        totalCost: 57600,
        costPerEmployee: 228,
        enrolledMembers: 312,
        participationRate: 96.3,
      },
      {
        category: 'WELLNESS',
        employerPremium: 148000,
        employeePremium: 0,
        claimsPaid: 112000,
        adminCost: 36000,
        totalCost: 184000,
        costPerEmployee: 568,
        enrolledMembers: 245,
        participationRate: 75.6,
      },
      {
        category: 'RETIREMENT',
        employerPremium: 166080,
        employeePremium: 47400,
        claimsPaid: 0,
        adminCost: 9600,
        totalCost: 175680,
        costPerEmployee: 682,
        enrolledMembers: 304,
        participationRate: 93.8,
      },
    ],
    costPerEmployee: 7042,
    costPerFTE: 7280,
    benefitsCostAsPercentPayroll: 28.4,
    projectedAnnualCost: 2281600,
    budgetVariance: 82400,
    budgetVariancePercent: 3.7,
  };
}

/**
 * Get year-over-year benefits cost and enrollment trends.
 */
export async function getBenefitsTrend(years: number = 5): Promise<BenefitsTrend> {
  await new Promise((r) => setTimeout(r, 400));

  const currentYear = new Date().getFullYear();
  const trendData: YearTrend[] = [
    {
      year: currentYear - 4,
      totalCost: 1520000,
      employerCost: 1162000,
      employeeCost: 358000,
      enrollment: 218,
      costPerEmployee: 6972,
      claimsTotal: 924000,
      changePercent: null,
    },
    {
      year: currentYear - 3,
      totalCost: 1688000,
      employerCost: 1290000,
      employeeCost: 398000,
      enrollment: 238,
      costPerEmployee: 7093,
      claimsTotal: 1021000,
      changePercent: 11.1,
    },
    {
      year: currentYear - 2,
      totalCost: 1884000,
      employerCost: 1440000,
      employeeCost: 444000,
      enrollment: 268,
      costPerEmployee: 7030,
      claimsTotal: 1148000,
      changePercent: 11.6,
    },
    {
      year: currentYear - 1,
      totalCost: 2104000,
      employerCost: 1610000,
      employeeCost: 494000,
      enrollment: 294,
      costPerEmployee: 7156,
      claimsTotal: 1282000,
      changePercent: 11.7,
    },
    {
      year: currentYear,
      totalCost: 2282000,
      employerCost: 1744000,
      employeeCost: 538000,
      enrollment: 324,
      costPerEmployee: 7043,
      claimsTotal: 1390000,
      changePercent: 8.5,
    },
  ].slice(-years);

  // Calculate CAGR
  const first = trendData[0].totalCost;
  const last = trendData[trendData.length - 1].totalCost;
  const periodYears = trendData.length - 1;
  const cagr = parseFloat((((last / first) ** (1 / periodYears) - 1) * 100).toFixed(1));

  return {
    years: trendData,
    compoundAnnualGrowthRate: cagr,
    projectedNextYear: Math.round(last * 1.065), // 6.5% projected increase
    inflation: {
      medicalInflation: 6.8,
      dentalInflation: 3.2,
      visionInflation: 2.8,
      lifeInsuranceInflation: 1.5,
      nationalAverage: 6.1, // KFF Employer Health Benefits Survey 2025
    },
  };
}

/**
 * Get a comprehensive total compensation statement for an employee.
 */
export async function getTotalBenefitsStatement(
  employeeId: string
): Promise<TotalBenefitsStatement> {
  await new Promise((r) => setTimeout(r, 350));

  const salary = 165000;
  const benefitItems: BenefitLineItem[] = [
    {
      category: 'Medical Insurance',
      planName: 'Balanced Choice (Gold)',
      employerAnnualValue: 14400,
      employeeAnnualContribution: 4200,
      totalAnnualValue: 18600,
      notes: 'Family coverage — BCBS Gold Plan',
    },
    {
      category: 'Dental Insurance',
      planName: 'Comprehensive Dental',
      employerAnnualValue: 1020,
      employeeAnnualContribution: 900,
      totalAnnualValue: 1920,
      notes: 'Family coverage — Delta Dental',
    },
    {
      category: 'Vision Insurance',
      planName: 'Standard Vision',
      employerAnnualValue: 360,
      employeeAnnualContribution: 216,
      totalAnnualValue: 576,
      notes: 'Family coverage — VSP',
    },
    {
      category: 'Life Insurance',
      planName: 'Basic Life (1x Salary)',
      employerAnnualValue: 540,
      employeeAnnualContribution: 0,
      totalAnnualValue: 540,
      notes: 'Employer-paid — $165,000 coverage',
    },
    {
      category: 'Supplemental Life Insurance',
      planName: 'Supplemental (2x Salary)',
      employerAnnualValue: 0,
      employeeAnnualContribution: 1267,
      totalAnnualValue: 1267,
      notes: 'Employee-paid — $330,000 additional coverage',
    },
    {
      category: 'Short-Term Disability',
      planName: 'STD (60% salary, 13 weeks)',
      employerAnnualValue: 336,
      employeeAnnualContribution: 144,
      totalAnnualValue: 480,
      notes: 'Employer-subsidized',
    },
    {
      category: 'Long-Term Disability',
      planName: 'LTD (60% salary to age 65)',
      employerAnnualValue: 825,
      employeeAnnualContribution: 0,
      totalAnnualValue: 825,
      notes: 'Employer-paid',
    },
    {
      category: '401(k) Match',
      planName: '401(k) — 4% employer match',
      employerAnnualValue: 6600,
      employeeAnnualContribution: 6600,
      totalAnnualValue: 13200,
      notes: '4% employer match on 4% employee contribution',
    },
    {
      category: 'HSA Employer Contribution',
      planName: 'HSA — Employer Seed',
      employerAnnualValue: 1200,
      employeeAnnualContribution: 2400,
      totalAnnualValue: 3600,
      notes: 'HDHP — $1,200 employer seed + employee FSA',
    },
    {
      category: 'Employee Assistance Program',
      planName: 'EAP — Unlimited Counseling',
      employerAnnualValue: 180,
      employeeAnnualContribution: 0,
      totalAnnualValue: 180,
      notes: 'Mental health, legal, financial counseling',
    },
    {
      category: 'Wellness Allowance',
      planName: 'Annual Wellness Stipend',
      employerAnnualValue: 1200,
      employeeAnnualContribution: 0,
      totalAnnualValue: 1200,
      notes: '$100/month for gym, fitness apps, etc.',
    },
    {
      category: 'Paid Time Off',
      planName: 'PTO (25 days)',
      employerAnnualValue: 15865,
      employeeAnnualContribution: 0,
      totalAnnualValue: 15865,
      notes: '25 days PTO value at daily rate ($634/day)',
    },
    {
      category: 'Parental Leave',
      planName: '16 Weeks Paid Parental Leave',
      employerAnnualValue: 2540,
      employeeAnnualContribution: 0,
      totalAnnualValue: 2540,
      notes: 'Pro-rated annual value of parental leave benefit',
    },
    {
      category: 'Professional Development',
      planName: 'L&D Budget ($5,000/year)',
      employerAnnualValue: 5000,
      employeeAnnualContribution: 0,
      totalAnnualValue: 5000,
      notes: 'Annual learning & development budget',
    },
    {
      category: 'Remote Work Stipend',
      planName: 'Home Office ($2,400/year)',
      employerAnnualValue: 2400,
      employeeAnnualContribution: 0,
      totalAnnualValue: 2400,
      notes: '$200/month equipment, internet, ergonomics',
    },
  ];

  const totalBenefitsValue = benefitItems.reduce((s, i) => s + i.employerAnnualValue, 0);
  const _totalEmployeeContributions = benefitItems.reduce(
    (s, i) => s + i.employeeAnnualContribution,
    0
  );

  return {
    employeeId,
    employeeName: 'Priya Sharma',
    statementYear: new Date().getFullYear(),
    salary,
    benefitsSummary: benefitItems,
    totalCompensationValue: salary + totalBenefitsValue,
    totalBenefitsValue,
    totalCashCompensation: salary,
    benefitsAsPercentSalary: parseFloat(((totalBenefitsValue / salary) * 100).toFixed(1)),
    statementDate: new Date().toISOString().slice(0, 10),
    comparisonToMarket: {
      position: 'ABOVE_MARKET',
      percentile: 72,
      marketMedianBenefitsValue: 42000,
      industryBenchmark: 46800,
      source: 'Mercer 2025 Total Remuneration Survey — Technology Sector, MENA Region',
    },
  };
}

/**
 * Calculate wellness program return on investment.
 */
export async function getWellnessROI(): Promise<WellnessROI> {
  await new Promise((r) => setTimeout(r, 350));

  const programCost = 148000;
  const claimsSavings = 214000;
  const productivityGains = 98000;
  const totalReturn = claimsSavings + productivityGains;

  return {
    programYear: new Date().getFullYear(),
    totalProgramCost: programCost,
    participationRate: 75.6,
    participantCount: 245,
    healthRiskAssessmentsCompleted: 218,
    biometricScreeningsCompleted: 196,
    incentivestPaid: 42800,
    measuredOutcomes: [
      {
        metric: 'Average BMI (enrolled participants)',
        baselineValue: 27.4,
        currentValue: 26.8,
        changePercent: -2.2,
        trend: 'IMPROVING',
        estimatedImpact: 'Reduced diabetes and cardiovascular risk',
      },
      {
        metric: 'Employees with controlled hypertension',
        baselineValue: 62,
        currentValue: 74,
        changePercent: 19.4,
        trend: 'IMPROVING',
        estimatedImpact: 'Estimated $18,000 reduction in cardiovascular claims',
      },
      {
        metric: 'Average stress score (1-10 scale, lower is better)',
        baselineValue: 6.2,
        currentValue: 5.4,
        changePercent: -12.9,
        trend: 'IMPROVING',
        estimatedImpact: 'Reduced mental health claims; improved productivity',
      },
      {
        metric: 'Annual preventive care visits per employee',
        baselineValue: 0.62,
        currentValue: 0.84,
        changePercent: 35.5,
        trend: 'IMPROVING',
        estimatedImpact: 'Early detection reduces downstream costs',
      },
      {
        metric: 'Average sick days taken per employee',
        baselineValue: 5.8,
        currentValue: 4.9,
        changePercent: -15.5,
        trend: 'IMPROVING',
        estimatedImpact: '0.9 days × 245 employees × $634 daily rate = $139,572 productivity gain',
      },
    ],
    claimsSavings,
    productivityGains,
    totalROI: parseFloat((((totalReturn - programCost) / programCost) * 100).toFixed(1)),
    roiRatio: parseFloat((totalReturn / programCost).toFixed(2)),
  };
}

/**
 * Compare plan performance across all enrolled plans to support renewal decisions.
 */
export async function getPlanComparisonReport(): Promise<PlanComparisonReport> {
  await new Promise((r) => setTimeout(r, 400));

  return {
    comparisonPeriod: `${new Date().getFullYear()} Annual Plan Performance`,
    plans: MOCK_PLAN_PERFORMANCE,
    recommendation:
      'Medical plans (Gold) are performing well within target loss ratio range (80-85%). The HDHP has a low loss ratio indicating low utilization — consider HSA employer seed increase to improve value perception. Dental plan renewal increase (3.5%) is below medical trend.',
    suggestedChanges: [
      'Increase HSA employer seed contribution from $1,200 to $1,500 to improve HDHP attractiveness',
      'Negotiate with BCBS to reduce prior authorization requirements for commonly approved procedures',
      'Add a dental care coordination benefit to reduce out-of-network dental lab claims',
      'Conduct employee satisfaction survey focused on HDHP participants to understand barriers',
      'Evaluate adding a 4th plan tier (PPO to Narrow Network) for cost savings',
    ],
  };
}

// ── Named export ───────────────────────────────────────────────────────────────

export const benefitsAnalyticsService = {
  getUtilizationReport,
  getCostAnalysis,
  getBenefitsTrend,
  getTotalBenefitsStatement,
  getWellnessROI,
  getPlanComparisonReport,
};
