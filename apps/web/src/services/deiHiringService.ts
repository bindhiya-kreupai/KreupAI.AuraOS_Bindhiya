/**
 * @module deiHiringService
 * @description DEI in Hiring Service — diversity pipeline metrics, blind hiring config,
 *              pay gap analysis, inclusion surveys, DEI goals tracking (Sec 20.5)
 * @project AURA HCM Platform
 */

// ============================================================================
// TYPES
// ============================================================================

export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
export type EthnicityGroup =
  | 'white'
  | 'asian'
  | 'black'
  | 'hispanic'
  | 'middle_eastern'
  | 'mixed'
  | 'other'
  | 'prefer_not_to_say';
export type AgeGroup = 'under_25' | '25_34' | '35_44' | '45_54' | '55_plus';

export interface DemographicBreakdown {
  category: string;
  percentage: number;
  count: number;
  change?: number; // vs last period
}

export interface PipelineStageData {
  stage: string;
  stageLabel: string;
  total: number;
  genderBreakdown: DemographicBreakdown[];
  ethnicityBreakdown: DemographicBreakdown[];
  ageBreakdown: DemographicBreakdown[];
  nationalityBreakdown: DemographicBreakdown[];
}

export interface DEIMetrics {
  period: string;
  totalApplicants: number;
  femaleApplicantRate: number;
  urm_rate: number; // underrepresented minorities
  ageUnder35Rate: number;
  internationalRate: number;
  pipeline: PipelineStageData[];
  genderTrend: Array<{ month: string; female: number; male: number }>;
  inclusionScore: number;
  inclusionScoreTrend: number; // vs last quarter
}

export interface BlindHiringConfig {
  enabled: boolean;
  maskName: boolean;
  maskPhoto: boolean;
  maskUniversity: boolean;
  maskGraduationYear: boolean;
  maskAddress: boolean;
  maskGender: boolean;
  maskAge: boolean;
  maskEthnicity: boolean;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

export interface PayGapData {
  level: string;
  maleAvgSalary: number;
  femaleAvgSalary: number;
  gapPercentage: number; // how much less female earns
  sampleSizeMale: number;
  sampleSizeFemale: number;
  adjustedGap?: number; // controlled gap (same role, experience)
}

export interface PayGapAnalysis {
  overallGap: number;
  adjustedGap: number;
  currency: string;
  byLevel: PayGapData[];
  byDepartment: Array<{ department: string; gapPercentage: number }>;
  trend: Array<{ year: string; gap: number; adjustedGap: number }>;
  benchmarkGap: number; // industry average
}

export interface DEIGoal {
  id: string;
  category: 'gender' | 'ethnicity' | 'age' | 'nationality' | 'disability';
  department: string;
  metric: string;
  target: number;
  current: number;
  targetDate: string;
  status: 'on_track' | 'at_risk' | 'off_track' | 'achieved';
  owner: string;
}

export interface InclusionSurveyResults {
  responseRate: number;
  totalRespondents: number;
  overallScore: number;
  dimensions: Array<{
    dimension: string;
    score: number;
    benchmark: number;
    trend: number;
  }>;
  keyInsights: string[];
  actionItems: string[];
  byDemographic: Array<{
    group: string;
    score: number;
    gapFromAverage: number;
  }>;
}

export interface EEOSummary {
  reportingPeriod: string;
  totalEmployees: number;
  categories: Array<{
    jobCategory: string;
    male: Record<EthnicityGroup, number>;
    female: Record<EthnicityGroup, number>;
  }>;
}

export interface DEIGoalData {
  category: DEIGoal['category'];
  department: string;
  metric: string;
  target: number;
  targetDate: string;
  owner: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_DEI_METRICS: DEIMetrics = {
  period: 'Q1 2026',
  totalApplicants: 3612,
  femaleApplicantRate: 38.4,
  urm_rate: 31.2,
  ageUnder35Rate: 54.8,
  internationalRate: 28.6,
  inclusionScore: 72,
  inclusionScoreTrend: 3.2,
  genderTrend: [
    { month: 'Mar', female: 35, male: 65 },
    { month: 'Apr', female: 36, male: 64 },
    { month: 'May', female: 34, male: 66 },
    { month: 'Jun', female: 37, male: 63 },
    { month: 'Jul', female: 38, male: 62 },
    { month: 'Aug', female: 37, male: 63 },
    { month: 'Sep', female: 39, male: 61 },
    { month: 'Oct', female: 38, male: 62 },
    { month: 'Nov', female: 40, male: 60 },
    { month: 'Dec', female: 39, male: 61 },
    { month: 'Jan', female: 38, male: 62 },
    { month: 'Feb', female: 38, male: 62 },
  ],
  pipeline: [
    {
      stage: 'applied',
      stageLabel: 'Applied',
      total: 3612,
      genderBreakdown: [
        { category: 'Female', percentage: 38.4, count: 1387 },
        { category: 'Male', percentage: 57.8, count: 2088 },
        { category: 'Non-Binary', percentage: 2.4, count: 87 },
        { category: 'N/A', percentage: 1.4, count: 50 },
      ],
      ethnicityBreakdown: [
        { category: 'White', percentage: 42, count: 1517 },
        { category: 'Asian', percentage: 28, count: 1011 },
        { category: 'Hispanic', percentage: 12, count: 433 },
        { category: 'Black', percentage: 10, count: 361 },
        { category: 'Other', percentage: 8, count: 289 },
      ],
      ageBreakdown: [
        { category: 'Under 25', percentage: 18, count: 650 },
        { category: '25-34', percentage: 37, count: 1336 },
        { category: '35-44', percentage: 28, count: 1011 },
        { category: '45-54', percentage: 12, count: 433 },
        { category: '55+', percentage: 5, count: 181 },
      ],
      nationalityBreakdown: [
        { category: 'Domestic', percentage: 71, count: 2565 },
        { category: 'International', percentage: 29, count: 1047 },
      ],
    },
    {
      stage: 'screening',
      stageLabel: 'Screening',
      total: 1820,
      genderBreakdown: [
        { category: 'Female', percentage: 36, count: 655 },
        { category: 'Male', percentage: 60, count: 1092 },
        { category: 'Non-Binary', percentage: 2, count: 36 },
        { category: 'N/A', percentage: 2, count: 36 },
      ],
      ethnicityBreakdown: [
        { category: 'White', percentage: 43, count: 785 },
        { category: 'Asian', percentage: 30, count: 546 },
        { category: 'Hispanic', percentage: 11, count: 200 },
        { category: 'Black', percentage: 9, count: 164 },
        { category: 'Other', percentage: 7, count: 127 },
      ],
      ageBreakdown: [
        { category: 'Under 25', percentage: 14, count: 255 },
        { category: '25-34', percentage: 40, count: 728 },
        { category: '35-44', percentage: 30, count: 546 },
        { category: '45-54', percentage: 12, count: 218 },
        { category: '55+', percentage: 4, count: 73 },
      ],
      nationalityBreakdown: [
        { category: 'Domestic', percentage: 73, count: 1329 },
        { category: 'International', percentage: 27, count: 491 },
      ],
    },
    {
      stage: 'interview',
      stageLabel: 'Interviewed',
      total: 743,
      genderBreakdown: [
        { category: 'Female', percentage: 34, count: 253 },
        { category: 'Male', percentage: 62, count: 461 },
        { category: 'Non-Binary', percentage: 2, count: 15 },
        { category: 'N/A', percentage: 2, count: 15 },
      ],
      ethnicityBreakdown: [
        { category: 'White', percentage: 45, count: 334 },
        { category: 'Asian', percentage: 29, count: 215 },
        { category: 'Hispanic', percentage: 11, count: 82 },
        { category: 'Black', percentage: 8, count: 59 },
        { category: 'Other', percentage: 7, count: 52 },
      ],
      ageBreakdown: [
        { category: 'Under 25', percentage: 10, count: 74 },
        { category: '25-34', percentage: 42, count: 312 },
        { category: '35-44', percentage: 32, count: 238 },
        { category: '45-54', percentage: 12, count: 89 },
        { category: '55+', percentage: 4, count: 30 },
      ],
      nationalityBreakdown: [
        { category: 'Domestic', percentage: 75, count: 557 },
        { category: 'International', percentage: 25, count: 186 },
      ],
    },
    {
      stage: 'offered',
      stageLabel: 'Offered',
      total: 287,
      genderBreakdown: [
        { category: 'Female', percentage: 35, count: 100 },
        { category: 'Male', percentage: 61, count: 175 },
        { category: 'Non-Binary', percentage: 2, count: 6 },
        { category: 'N/A', percentage: 2, count: 6 },
      ],
      ethnicityBreakdown: [
        { category: 'White', percentage: 44, count: 126 },
        { category: 'Asian', percentage: 28, count: 80 },
        { category: 'Hispanic', percentage: 12, count: 34 },
        { category: 'Black', percentage: 9, count: 26 },
        { category: 'Other', percentage: 7, count: 20 },
      ],
      ageBreakdown: [
        { category: 'Under 25', percentage: 9, count: 26 },
        { category: '25-34', percentage: 43, count: 123 },
        { category: '35-44', percentage: 33, count: 95 },
        { category: '45-54', percentage: 12, count: 34 },
        { category: '55+', percentage: 3, count: 9 },
      ],
      nationalityBreakdown: [
        { category: 'Domestic', percentage: 76, count: 218 },
        { category: 'International', percentage: 24, count: 69 },
      ],
    },
    {
      stage: 'hired',
      stageLabel: 'Hired',
      total: 238,
      genderBreakdown: [
        { category: 'Female', percentage: 36, count: 86 },
        { category: 'Male', percentage: 60, count: 143 },
        { category: 'Non-Binary', percentage: 2, count: 5 },
        { category: 'N/A', percentage: 2, count: 4 },
      ],
      ethnicityBreakdown: [
        { category: 'White', percentage: 43, count: 102 },
        { category: 'Asian', percentage: 29, count: 69 },
        { category: 'Hispanic', percentage: 12, count: 29 },
        { category: 'Black', percentage: 9, count: 21 },
        { category: 'Other', percentage: 7, count: 17 },
      ],
      ageBreakdown: [
        { category: 'Under 25', percentage: 10, count: 24 },
        { category: '25-34', percentage: 42, count: 100 },
        { category: '35-44', percentage: 32, count: 76 },
        { category: '45-54', percentage: 12, count: 29 },
        { category: '55+', percentage: 4, count: 9 },
      ],
      nationalityBreakdown: [
        { category: 'Domestic', percentage: 74, count: 176 },
        { category: 'International', percentage: 26, count: 62 },
      ],
    },
  ],
};

const MOCK_BLIND_CONFIG: BlindHiringConfig = {
  enabled: true,
  maskName: true,
  maskPhoto: true,
  maskUniversity: false,
  maskGraduationYear: false,
  maskAddress: true,
  maskGender: true,
  maskAge: false,
  maskEthnicity: true,
  lastUpdatedBy: 'Emily Park',
  lastUpdatedAt: '2026-01-15T10:30:00Z',
};

const MOCK_PAY_GAP: PayGapAnalysis = {
  overallGap: 12.4,
  adjustedGap: 3.2,
  currency: 'USD',
  byLevel: [
    {
      level: 'Individual Contributor',
      maleAvgSalary: 85000,
      femaleAvgSalary: 81200,
      gapPercentage: 4.5,
      sampleSizeMale: 142,
      sampleSizeFemale: 98,
      adjustedGap: 1.2,
    },
    {
      level: 'Senior IC',
      maleAvgSalary: 115000,
      femaleAvgSalary: 106800,
      gapPercentage: 7.1,
      sampleSizeMale: 87,
      sampleSizeFemale: 54,
      adjustedGap: 2.8,
    },
    {
      level: 'Manager',
      maleAvgSalary: 148000,
      femaleAvgSalary: 134600,
      gapPercentage: 9.1,
      sampleSizeMale: 42,
      sampleSizeFemale: 21,
      adjustedGap: 3.4,
    },
    {
      level: 'Senior Manager',
      maleAvgSalary: 185000,
      femaleAvgSalary: 162000,
      gapPercentage: 12.4,
      sampleSizeMale: 24,
      sampleSizeFemale: 8,
      adjustedGap: 4.1,
    },
    {
      level: 'Director',
      maleAvgSalary: 240000,
      femaleAvgSalary: 205000,
      gapPercentage: 14.6,
      sampleSizeMale: 18,
      sampleSizeFemale: 5,
      adjustedGap: 5.2,
    },
    {
      level: 'VP & Above',
      maleAvgSalary: 380000,
      femaleAvgSalary: 312000,
      gapPercentage: 17.9,
      sampleSizeMale: 10,
      sampleSizeFemale: 3,
      adjustedGap: 6.8,
    },
  ],
  byDepartment: [
    { department: 'Engineering', gapPercentage: 8.2 },
    { department: 'Sales', gapPercentage: 15.4 },
    { department: 'Marketing', gapPercentage: 5.1 },
    { department: 'Finance', gapPercentage: 11.8 },
    { department: 'HR', gapPercentage: 2.3 },
    { department: 'Operations', gapPercentage: 9.7 },
  ],
  trend: [
    { year: '2022', gap: 18.2, adjustedGap: 6.1 },
    { year: '2023', gap: 15.8, adjustedGap: 4.9 },
    { year: '2024', gap: 14.1, adjustedGap: 4.0 },
    { year: '2025', gap: 12.4, adjustedGap: 3.2 },
  ],
  benchmarkGap: 16.0,
};

const MOCK_DEI_GOALS: DEIGoal[] = [
  {
    id: 'goal-001',
    category: 'gender',
    department: 'Engineering',
    metric: 'Female engineer ratio',
    target: 35,
    current: 28,
    targetDate: '2026-12-31',
    status: 'on_track',
    owner: 'Sarah Kim',
  },
  {
    id: 'goal-002',
    category: 'gender',
    department: 'Leadership',
    metric: 'Female in leadership (VP+)',
    target: 40,
    current: 25,
    targetDate: '2027-06-30',
    status: 'at_risk',
    owner: 'Emily Park',
  },
  {
    id: 'goal-003',
    category: 'ethnicity',
    department: 'All',
    metric: 'URM representation',
    target: 35,
    current: 31.2,
    targetDate: '2026-12-31',
    status: 'on_track',
    owner: 'Emily Park',
  },
  {
    id: 'goal-004',
    category: 'ethnicity',
    department: 'Engineering',
    metric: 'Black/Hispanic engineer ratio',
    target: 15,
    current: 9.8,
    targetDate: '2027-12-31',
    status: 'off_track',
    owner: 'Carlos Mendez',
  },
  {
    id: 'goal-005',
    category: 'age',
    department: 'All',
    metric: 'Employees over 45 representation',
    target: 20,
    current: 17.2,
    targetDate: '2026-12-31',
    status: 'on_track',
    owner: 'Emily Park',
  },
  {
    id: 'goal-006',
    category: 'nationality',
    department: 'All',
    metric: 'International employee ratio',
    target: 30,
    current: 28.6,
    targetDate: '2026-06-30',
    status: 'on_track',
    owner: 'Sarah Kim',
  },
  {
    id: 'goal-007',
    category: 'disability',
    department: 'All',
    metric: 'Disability disclosure rate',
    target: 5,
    current: 3.2,
    targetDate: '2026-12-31',
    status: 'at_risk',
    owner: 'Emily Park',
  },
];

const MOCK_INCLUSION_SURVEY: InclusionSurveyResults = {
  responseRate: 68.4,
  totalRespondents: 683,
  overallScore: 72,
  dimensions: [
    { dimension: 'Sense of Belonging', score: 74, benchmark: 70, trend: 3 },
    { dimension: 'Psychological Safety', score: 71, benchmark: 72, trend: -1 },
    { dimension: 'Manager Support', score: 76, benchmark: 68, trend: 5 },
    { dimension: 'Career Opportunities', score: 65, benchmark: 66, trend: 2 },
    { dimension: 'Inclusive Culture', score: 73, benchmark: 71, trend: 4 },
    { dimension: 'Respect & Dignity', score: 78, benchmark: 74, trend: 2 },
  ],
  keyInsights: [
    'Manager support scores improved significantly (+5 pts) following leadership training.',
    'Career opportunity perception remains below benchmark, particularly for women and URM employees.',
    'Psychological safety declined slightly; recommend follow-up focus groups.',
    'Overall inclusion score above industry benchmark by 2 points.',
  ],
  actionItems: [
    'Launch mentorship program for underrepresented talent (Q2 2026)',
    'Review promotion criteria for potential bias (Q1 2026)',
    'Expand psychological safety workshops to all teams (Q2 2026)',
    'Implement structured career conversations for all employees (Q1 2026)',
  ],
  byDemographic: [
    { group: 'Female employees', score: 68, gapFromAverage: -4 },
    { group: 'Male employees', score: 75, gapFromAverage: 3 },
    { group: 'URM employees', score: 67, gapFromAverage: -5 },
    { group: 'International employees', score: 70, gapFromAverage: -2 },
    { group: 'Employees under 30', score: 74, gapFromAverage: 2 },
  ],
};

// ============================================================================
// SERVICE
// ============================================================================

export class DEIHiringService {
  /** Get overall DEI metrics for hiring pipeline */
  static async getDEIMetrics(_dateRange?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DEIMetrics> {
    await new Promise((r) => setTimeout(r, 400));
    return { ...MOCK_DEI_METRICS };
  }

  /** Get pipeline diversity breakdown by job */
  static async getPipelineDiversity(_jobId?: string): Promise<PipelineStageData[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...MOCK_DEI_METRICS.pipeline];
  }

  /** Get current blind hiring configuration */
  static async getBlindHiringConfig(): Promise<BlindHiringConfig> {
    await new Promise((r) => setTimeout(r, 200));
    return { ...MOCK_BLIND_CONFIG };
  }

  /** Update blind hiring configuration */
  static async updateBlindHiringConfig(
    data: Partial<BlindHiringConfig>
  ): Promise<BlindHiringConfig> {
    await new Promise((r) => setTimeout(r, 300));
    return {
      ...MOCK_BLIND_CONFIG,
      ...data,
      lastUpdatedBy: 'Current User',
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  /** Get gender pay gap analysis */
  static async getGenderPayGapAnalysis(): Promise<PayGapAnalysis> {
    await new Promise((r) => setTimeout(r, 400));
    return { ...MOCK_PAY_GAP };
  }

  /** Get DEI goals */
  static async getDEIGoals(): Promise<DEIGoal[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...MOCK_DEI_GOALS];
  }

  /** Set a DEI goal */
  static async setDEIGoal(data: DEIGoalData): Promise<DEIGoal> {
    await new Promise((r) => setTimeout(r, 400));
    return {
      id: `goal-${Date.now()}`,
      ...data,
      current: 0,
      status: 'on_track',
    };
  }

  /** Get inclusion survey results */
  static async getInclusionSurveyResults(): Promise<InclusionSurveyResults> {
    await new Promise((r) => setTimeout(r, 350));
    return { ...MOCK_INCLUSION_SURVEY };
  }
}
