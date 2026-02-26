/**
 * @module payEquityService
 * @description Pay Equity analytics service for AuraOS Compensation.
 *              Provides gender/ethnicity pay gap analysis, compa-ratio distribution,
 *              pay band analysis, equal pay audits, and regulatory reporting.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type Gender = 'MALE' | 'FEMALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY';
export type Ethnicity =
  | 'ASIAN'
  | 'WHITE'
  | 'BLACK'
  | 'HISPANIC'
  | 'MIDDLE_EASTERN'
  | 'MIXED'
  | 'OTHER';
export type PayBand = 'BAND_1' | 'BAND_2' | 'BAND_3' | 'BAND_4' | 'BAND_5' | 'BAND_6';

export interface PayEquityAnalysisParams {
  dimension: 'GENDER' | 'ETHNICITY';
  levelFilter?: string;
  deptFilter?: string;
  period?: string; // YYYY
}

export interface PayGapResult {
  group: string;
  avgSalary: number;
  medianSalary: number;
  headcount: number;
  gapVsReference: number; // percentage gap vs reference group (positive = favoured)
  adjustedGap: number; // gap after controlling for level/experience
}

export interface PayEquityAnalysis {
  dimension: 'GENDER' | 'ETHNICITY';
  referenceGroup: string;
  unadjustedGap: number; // mean pay gap %
  adjustedGap: number; // controlled gap %
  results: PayGapResult[];
  analysisDate: string;
  totalHeadcount: number;
  currency: string;
}

export interface CompaRatioDistribution {
  group: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: number[];
}

export interface PayBandAnalysis {
  bandId: PayBand;
  bandName: string;
  minSalary: number;
  midpointSalary: number;
  maxSalary: number;
  employeeCount: number;
  belowRange: number; // employees below band min
  withinRange: number;
  aboveRange: number; // employees above band max
  avgCompaRatio: number;
  genderDistribution: Record<Gender, number>;
}

export interface EqualPayViolation {
  employeeId: string;
  employeeName: string;
  role: string;
  level: string;
  salary: number;
  comparatorSalary: number;
  gap: number;
  gapPercent: number;
  reason: string;
  remediationCost: number;
}

export interface EqualPayAuditResult {
  totalEmployees: number;
  violationsFound: number;
  totalRemediationCost: number;
  violations: EqualPayViolation[];
  complianceScore: number; // 0-100
}

export interface PayGapTrendPoint {
  period: string;
  unadjustedGap: number;
  adjustedGap: number;
  headcount: number;
}

export interface RemediationRecommendation {
  employeeId: string;
  employeeName: string;
  currentSalary: number;
  recommendedSalary: number;
  increase: number;
  increasePercent: number;
  rationale: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface PayEquityReportParams {
  reportType: 'UK_GENDER_PAY_GAP' | 'US_EEO1' | 'INTERNAL';
  period: string;
  entityId?: string;
}

export interface UKGenderPayGapReport {
  reportingYear: string;
  entityName: string;
  meanGenderPayGap: number;
  medianGenderPayGap: number;
  meanBonusGap: number;
  medianBonusGap: number;
  proportionMaleBonus: number;
  proportionFemaleBonus: number;
  upperQuartileMale: number;
  upperQuartileFemale: number;
  upperMidQuartileMale: number;
  upperMidQuartileFemale: number;
  lowerMidQuartileMale: number;
  lowerMidQuartileFemale: number;
  lowerQuartileMale: number;
  lowerQuartileFemale: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_GENDER_ANALYSIS: PayEquityAnalysis = {
  dimension: 'GENDER',
  referenceGroup: 'MALE',
  unadjustedGap: 14.2,
  adjustedGap: 4.8,
  analysisDate: '2025-02-01',
  totalHeadcount: 1247,
  currency: 'AED',
  results: [
    {
      group: 'MALE',
      avgSalary: 98_500,
      medianSalary: 85_000,
      headcount: 720,
      gapVsReference: 0,
      adjustedGap: 0,
    },
    {
      group: 'FEMALE',
      avgSalary: 84_520,
      medianSalary: 78_000,
      headcount: 498,
      gapVsReference: -14.2,
      adjustedGap: -4.8,
    },
    {
      group: 'NON_BINARY',
      avgSalary: 92_000,
      medianSalary: 88_000,
      headcount: 29,
      gapVsReference: -6.6,
      adjustedGap: -1.2,
    },
  ],
};

const MOCK_ETHNICITY_ANALYSIS: PayEquityAnalysis = {
  dimension: 'ETHNICITY',
  referenceGroup: 'WHITE',
  unadjustedGap: 8.7,
  adjustedGap: 3.2,
  analysisDate: '2025-02-01',
  totalHeadcount: 1247,
  currency: 'AED',
  results: [
    {
      group: 'WHITE',
      avgSalary: 99_200,
      medianSalary: 88_000,
      headcount: 180,
      gapVsReference: 0,
      adjustedGap: 0,
    },
    {
      group: 'ASIAN',
      avgSalary: 91_500,
      medianSalary: 82_000,
      headcount: 620,
      gapVsReference: -7.8,
      adjustedGap: -2.9,
    },
    {
      group: 'MIDDLE_EASTERN',
      avgSalary: 95_000,
      medianSalary: 86_000,
      headcount: 290,
      gapVsReference: -4.2,
      adjustedGap: -1.5,
    },
    {
      group: 'BLACK',
      avgSalary: 88_000,
      medianSalary: 79_000,
      headcount: 85,
      gapVsReference: -11.3,
      adjustedGap: -4.2,
    },
    {
      group: 'HISPANIC',
      avgSalary: 91_000,
      medianSalary: 83_000,
      headcount: 52,
      gapVsReference: -8.3,
      adjustedGap: -3.1,
    },
    {
      group: 'MIXED',
      avgSalary: 93_000,
      medianSalary: 84_000,
      headcount: 20,
      gapVsReference: -6.3,
      adjustedGap: -2.0,
    },
  ],
};

const MOCK_COMPA_RATIOS: CompaRatioDistribution[] = [
  { group: 'MALE', min: 0.72, q1: 0.92, median: 1.02, q3: 1.14, max: 1.35, outliers: [0.6, 1.5] },
  {
    group: 'FEMALE',
    min: 0.68,
    q1: 0.87,
    median: 0.96,
    q3: 1.08,
    max: 1.28,
    outliers: [0.55, 1.4],
  },
];

const MOCK_PAY_BANDS: PayBandAnalysis[] = [
  {
    bandId: 'BAND_1',
    bandName: 'Junior',
    minSalary: 40_000,
    midpointSalary: 55_000,
    maxSalary: 70_000,
    employeeCount: 280,
    belowRange: 12,
    withinRange: 255,
    aboveRange: 13,
    avgCompaRatio: 0.97,
    genderDistribution: { MALE: 140, FEMALE: 128, NON_BINARY: 12, PREFER_NOT_TO_SAY: 0 },
  },
  {
    bandId: 'BAND_2',
    bandName: 'Mid-Level',
    minSalary: 70_000,
    midpointSalary: 92_000,
    maxSalary: 114_000,
    employeeCount: 420,
    belowRange: 18,
    withinRange: 390,
    aboveRange: 12,
    avgCompaRatio: 1.01,
    genderDistribution: { MALE: 250, FEMALE: 158, NON_BINARY: 12, PREFER_NOT_TO_SAY: 0 },
  },
  {
    bandId: 'BAND_3',
    bandName: 'Senior',
    minSalary: 114_000,
    midpointSalary: 145_000,
    maxSalary: 176_000,
    employeeCount: 310,
    belowRange: 8,
    withinRange: 288,
    aboveRange: 14,
    avgCompaRatio: 1.03,
    genderDistribution: { MALE: 210, FEMALE: 95, NON_BINARY: 5, PREFER_NOT_TO_SAY: 0 },
  },
  {
    bandId: 'BAND_4',
    bandName: 'Lead / Principal',
    minSalary: 176_000,
    midpointSalary: 215_000,
    maxSalary: 254_000,
    employeeCount: 150,
    belowRange: 4,
    withinRange: 140,
    aboveRange: 6,
    avgCompaRatio: 1.0,
    genderDistribution: { MALE: 112, FEMALE: 36, NON_BINARY: 2, PREFER_NOT_TO_SAY: 0 },
  },
  {
    bandId: 'BAND_5',
    bandName: 'Manager',
    minSalary: 200_000,
    midpointSalary: 250_000,
    maxSalary: 300_000,
    employeeCount: 70,
    belowRange: 2,
    withinRange: 65,
    aboveRange: 3,
    avgCompaRatio: 1.02,
    genderDistribution: { MALE: 48, FEMALE: 20, NON_BINARY: 2, PREFER_NOT_TO_SAY: 0 },
  },
  {
    bandId: 'BAND_6',
    bandName: 'Director / VP',
    minSalary: 300_000,
    midpointSalary: 400_000,
    maxSalary: 500_000,
    employeeCount: 17,
    belowRange: 0,
    withinRange: 16,
    aboveRange: 1,
    avgCompaRatio: 1.05,
    genderDistribution: { MALE: 14, FEMALE: 3, NON_BINARY: 0, PREFER_NOT_TO_SAY: 0 },
  },
];

const MOCK_TREND: PayGapTrendPoint[] = [
  { period: '2020', unadjustedGap: 21.5, adjustedGap: 8.2, headcount: 880 },
  { period: '2021', unadjustedGap: 19.8, adjustedGap: 7.1, headcount: 950 },
  { period: '2022', unadjustedGap: 17.3, adjustedGap: 6.0, headcount: 1050 },
  { period: '2023', unadjustedGap: 15.9, adjustedGap: 5.5, headcount: 1150 },
  { period: '2024', unadjustedGap: 14.2, adjustedGap: 4.8, headcount: 1247 },
];

// ── Service Functions ──────────────────────────────────────────────────────

export async function getPayEquityAnalysis(
  params: PayEquityAnalysisParams
): Promise<PayEquityAnalysis> {
  await _delay();
  return params.dimension === 'GENDER' ? MOCK_GENDER_ANALYSIS : MOCK_ETHNICITY_ANALYSIS;
}

export async function getCompaRatioDistribution(
  filters: { gender?: Gender; level?: string } = {}
): Promise<CompaRatioDistribution[]> {
  await _delay();
  if (filters.gender) {
    return MOCK_COMPA_RATIOS.filter((r) => r.group === filters.gender);
  }
  return MOCK_COMPA_RATIOS;
}

export async function getPayBandAnalysis(gradeId?: string): Promise<PayBandAnalysis[]> {
  await _delay();
  if (gradeId) {
    return MOCK_PAY_BANDS.filter((b) => b.bandId === gradeId);
  }
  return MOCK_PAY_BANDS;
}

export async function getEqualPayAudit(
  _params: { level?: string; dept?: string } = {}
): Promise<EqualPayAuditResult> {
  await _delay();
  const violations: EqualPayViolation[] = [
    {
      employeeId: 'emp_042',
      employeeName: 'Priya Sharma',
      role: 'Senior Engineer',
      level: 'BAND_3',
      salary: 105_000,
      comparatorSalary: 125_000,
      gap: 20_000,
      gapPercent: 16,
      reason: 'Identical role, same tenure, comparable performance rating',
      remediationCost: 20_000,
    },
    {
      employeeId: 'emp_099',
      employeeName: 'Fatima Hassan',
      role: 'Product Manager',
      level: 'BAND_3',
      salary: 110_000,
      comparatorSalary: 128_000,
      gap: 18_000,
      gapPercent: 14.1,
      reason: 'Same grade, 3 years less tenure but comparable output',
      remediationCost: 14_000,
    },
    {
      employeeId: 'emp_137',
      employeeName: 'Chen Li',
      role: 'Data Analyst',
      level: 'BAND_2',
      salary: 78_000,
      comparatorSalary: 88_000,
      gap: 10_000,
      gapPercent: 11.4,
      reason: 'Identical job code, same department and location',
      remediationCost: 10_000,
    },
  ];

  const totalCost = violations.reduce((s, v) => s + v.remediationCost, 0);
  return {
    totalEmployees: 1247,
    violationsFound: violations.length,
    totalRemediationCost: totalCost,
    violations,
    complianceScore: 87.2,
  };
}

export async function getPayGapTrend(_periods?: string[]): Promise<PayGapTrendPoint[]> {
  await _delay();
  return MOCK_TREND;
}

export async function getRemediationRecommendations(): Promise<RemediationRecommendation[]> {
  await _delay();
  return [
    {
      employeeId: 'emp_042',
      employeeName: 'Priya Sharma',
      currentSalary: 105_000,
      recommendedSalary: 122_000,
      increase: 17_000,
      increasePercent: 16.2,
      rationale: 'Bring salary to 98% of male peer median for BAND_3 Senior Engineers',
      priority: 'HIGH',
    },
    {
      employeeId: 'emp_099',
      employeeName: 'Fatima Hassan',
      currentSalary: 110_000,
      recommendedSalary: 120_000,
      increase: 10_000,
      increasePercent: 9.1,
      rationale: 'Adjust to market midpoint for Product Manager BAND_3',
      priority: 'HIGH',
    },
    {
      employeeId: 'emp_137',
      employeeName: 'Chen Li',
      currentSalary: 78_000,
      recommendedSalary: 86_000,
      increase: 8_000,
      increasePercent: 10.3,
      rationale: 'Align with mean compa-ratio for BAND_2 Data Analysts',
      priority: 'MEDIUM',
    },
  ];
}

export async function generatePayEquityReport(
  params: PayEquityReportParams
): Promise<UKGenderPayGapReport | Record<string, unknown>> {
  await _delay();

  if (params.reportType === 'UK_GENDER_PAY_GAP') {
    const report: UKGenderPayGapReport = {
      reportingYear: params.period,
      entityName: 'Kreup UK Ltd.',
      meanGenderPayGap: 14.2,
      medianGenderPayGap: 8.2,
      meanBonusGap: 22.5,
      medianBonusGap: 15.3,
      proportionMaleBonus: 78.5,
      proportionFemaleBonus: 71.2,
      upperQuartileMale: 67.4,
      upperQuartileFemale: 32.6,
      upperMidQuartileMale: 60.2,
      upperMidQuartileFemale: 39.8,
      lowerMidQuartileMale: 55.1,
      lowerMidQuartileFemale: 44.9,
      lowerQuartileMale: 48.3,
      lowerQuartileFemale: 51.7,
    };
    return report;
  }

  // US EEO-1 Component 2 (simplified)
  return {
    reportType: 'US_EEO1',
    period: params.period,
    payCategories: [
      { band: '$19,239 and under', male: 8, female: 12 },
      { band: '$19,240–$24,439', male: 22, female: 28 },
      { band: '$24,440–$30,679', male: 45, female: 58 },
      { band: '$30,680–$38,999', male: 88, female: 95 },
      { band: '$39,000–$49,919', male: 120, female: 110 },
      { band: '$49,920–$62,919', male: 180, female: 145 },
      { band: '$62,920–$80,079', male: 140, female: 105 },
      { band: '$80,080–$101,919', male: 80, female: 55 },
      { band: '$101,920–$128,959', male: 28, female: 18 },
      { band: '$128,960 and over', male: 9, female: 5 },
    ],
  };
}

// ── Private helpers ────────────────────────────────────────────────────────

function _delay(ms = 180): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
