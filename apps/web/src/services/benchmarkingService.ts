/**
 * @module benchmarkingService
 * @description Benchmarking Service — industry benchmark comparisons, peer group analysis,
 *              compensation benchmarks, company vs industry metrics (Sec 23.4)
 * @project AURA HCM Platform
 */

// ============================================================================
// TYPES
// ============================================================================

export type Industry =
  | 'technology'
  | 'healthcare'
  | 'finance'
  | 'manufacturing'
  | 'retail'
  | 'consulting';
export type CompanySize = 'startup' | 'smb' | 'mid_market' | 'enterprise' | 'large_enterprise';
export type BenchmarkMetric =
  | 'turnover_rate'
  | 'time_to_hire'
  | 'cost_per_hire'
  | 'training_hours'
  | 'engagement_score'
  | 'absence_rate'
  | 'revenue_per_employee'
  | 'offer_acceptance_rate'
  | 'first_year_attrition'
  | 'promotion_rate';

export interface BenchmarkValue {
  metric: BenchmarkMetric;
  label: string;
  unit: string;
  companyValue: number;
  industryMedian: number;
  industryTopQuartile: number;
  industryBottomQuartile: number;
  rank: 'top_quartile' | 'above_median' | 'below_median' | 'bottom_quartile';
  trend: number; // vs last year
  isPositiveWhenHigher: boolean;
}

export interface IndustryBenchmark {
  industry: Industry;
  industryLabel: string;
  companySize: CompanySize;
  reportPeriod: string;
  metrics: BenchmarkValue[];
  sampleSize: number;
  source: string;
}

export interface PeerComparison {
  peerGroupDescription: string;
  peerCount: number;
  metrics: BenchmarkValue[];
  keyInsights: string[];
}

export interface CompensationBenchmark {
  role: string;
  level: string;
  location: string;
  currency: string;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile90: number;
  companyValue: number;
  companyPercentile: number;
  marketTrend: number; // YoY growth
  source: string;
  sampleSize: number;
}

export interface TrendComparison {
  metric: BenchmarkMetric;
  label: string;
  quarters: Array<{
    quarter: string;
    companyValue: number;
    industryMedian: number;
  }>;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_BENCHMARK_METRICS: BenchmarkValue[] = [
  {
    metric: 'turnover_rate',
    label: 'Turnover Rate',
    unit: '%',
    companyValue: 12.4,
    industryMedian: 16.0,
    industryTopQuartile: 10.2,
    industryBottomQuartile: 22.8,
    rank: 'above_median',
    trend: -1.2,
    isPositiveWhenHigher: false,
  },
  {
    metric: 'time_to_hire',
    label: 'Time to Hire',
    unit: 'days',
    companyValue: 28,
    industryMedian: 32,
    industryTopQuartile: 21,
    industryBottomQuartile: 48,
    rank: 'above_median',
    trend: -4,
    isPositiveWhenHigher: false,
  },
  {
    metric: 'cost_per_hire',
    label: 'Cost per Hire',
    unit: 'USD',
    companyValue: 4200,
    industryMedian: 4800,
    industryTopQuartile: 2900,
    industryBottomQuartile: 7200,
    rank: 'above_median',
    trend: -180,
    isPositiveWhenHigher: false,
  },
  {
    metric: 'training_hours',
    label: 'Training Hours / Employee',
    unit: 'hours',
    companyValue: 44.7,
    industryMedian: 38.0,
    industryTopQuartile: 62.0,
    industryBottomQuartile: 18.0,
    rank: 'above_median',
    trend: 6.2,
    isPositiveWhenHigher: true,
  },
  {
    metric: 'engagement_score',
    label: 'Employee Engagement',
    unit: '%',
    companyValue: 72,
    industryMedian: 68,
    industryTopQuartile: 82,
    industryBottomQuartile: 52,
    rank: 'above_median',
    trend: 3,
    isPositiveWhenHigher: true,
  },
  {
    metric: 'absence_rate',
    label: 'Absence Rate',
    unit: '%',
    companyValue: 3.8,
    industryMedian: 4.2,
    industryTopQuartile: 2.8,
    industryBottomQuartile: 6.4,
    rank: 'above_median',
    trend: -0.3,
    isPositiveWhenHigher: false,
  },
  {
    metric: 'revenue_per_employee',
    label: 'Revenue per Employee',
    unit: 'USD',
    companyValue: 285000,
    industryMedian: 260000,
    industryTopQuartile: 380000,
    industryBottomQuartile: 140000,
    rank: 'above_median',
    trend: 18000,
    isPositiveWhenHigher: true,
  },
  {
    metric: 'offer_acceptance_rate',
    label: 'Offer Acceptance Rate',
    unit: '%',
    companyValue: 84,
    industryMedian: 78,
    industryTopQuartile: 92,
    industryBottomQuartile: 62,
    rank: 'above_median',
    trend: 4,
    isPositiveWhenHigher: true,
  },
  {
    metric: 'first_year_attrition',
    label: 'First Year Attrition',
    unit: '%',
    companyValue: 18.2,
    industryMedian: 22.0,
    industryTopQuartile: 12.0,
    industryBottomQuartile: 34.0,
    rank: 'above_median',
    trend: -2.4,
    isPositiveWhenHigher: false,
  },
  {
    metric: 'promotion_rate',
    label: 'Internal Promotion Rate',
    unit: '%',
    companyValue: 24.8,
    industryMedian: 28.0,
    industryTopQuartile: 38.0,
    industryBottomQuartile: 12.0,
    rank: 'below_median',
    trend: 1.2,
    isPositiveWhenHigher: true,
  },
];

const MOCK_COMPENSATION_BENCHMARKS: CompensationBenchmark[] = [
  {
    role: 'Software Engineer',
    level: 'Senior',
    location: 'Dubai, UAE',
    currency: 'USD',
    percentile25: 115000,
    percentile50: 145000,
    percentile75: 178000,
    percentile90: 215000,
    companyValue: 155000,
    companyPercentile: 62,
    marketTrend: 8.2,
    source: 'Mercer 2026 Salary Survey',
    sampleSize: 1840,
  },
  {
    role: 'Product Manager',
    level: 'Senior',
    location: 'Dubai, UAE',
    currency: 'USD',
    percentile25: 120000,
    percentile50: 155000,
    percentile75: 192000,
    percentile90: 240000,
    companyValue: 162000,
    companyPercentile: 58,
    marketTrend: 9.4,
    source: 'Radford Global Tech Survey 2026',
    sampleSize: 920,
  },
  {
    role: 'Data Scientist',
    level: 'Mid-Senior',
    location: 'Dubai, UAE',
    currency: 'USD',
    percentile25: 98000,
    percentile50: 128000,
    percentile75: 162000,
    percentile90: 198000,
    companyValue: 138000,
    companyPercentile: 64,
    marketTrend: 11.8,
    source: 'Mercer 2026 Salary Survey',
    sampleSize: 640,
  },
  {
    role: 'HR Business Partner',
    level: 'Senior',
    location: 'Dubai, UAE',
    currency: 'USD',
    percentile25: 85000,
    percentile50: 110000,
    percentile75: 138000,
    percentile90: 168000,
    companyValue: 118000,
    companyPercentile: 60,
    marketTrend: 5.6,
    source: 'Mercer 2026 Salary Survey',
    sampleSize: 1120,
  },
  {
    role: 'Engineering Manager',
    level: 'Manager',
    location: 'Dubai, UAE',
    currency: 'USD',
    percentile25: 155000,
    percentile50: 195000,
    percentile75: 248000,
    percentile90: 310000,
    companyValue: 210000,
    companyPercentile: 55,
    marketTrend: 10.2,
    source: 'Radford Global Tech Survey 2026',
    sampleSize: 480,
  },
  {
    role: 'Sales Manager',
    level: 'Manager',
    location: 'Dubai, UAE',
    currency: 'USD',
    percentile25: 120000,
    percentile50: 158000,
    percentile75: 210000,
    percentile90: 268000,
    companyValue: 175000,
    companyPercentile: 62,
    marketTrend: 7.8,
    source: 'Mercer 2026 Salary Survey',
    sampleSize: 720,
  },
  {
    role: 'Software Engineer',
    level: 'Senior',
    location: 'Riyadh, Saudi Arabia',
    currency: 'SAR',
    percentile25: 360000,
    percentile50: 450000,
    percentile75: 560000,
    percentile90: 680000,
    companyValue: 490000,
    companyPercentile: 65,
    marketTrend: 12.4,
    source: 'Korn Ferry 2026 Saudi Arabia Tech Report',
    sampleSize: 840,
  },
  {
    role: 'Software Engineer',
    level: 'Senior',
    location: 'Bangalore, India',
    currency: 'INR',
    percentile25: 2400000,
    percentile50: 3200000,
    percentile75: 4200000,
    percentile90: 5800000,
    companyValue: 3600000,
    companyPercentile: 63,
    marketTrend: 15.2,
    source: 'Aon Hewitt India Salary Survey 2026',
    sampleSize: 2840,
  },
];

const MOCK_TREND_COMPARISONS: TrendComparison[] = [
  {
    metric: 'turnover_rate',
    label: 'Turnover Rate (%)',
    quarters: [
      { quarter: 'Q1 2025', companyValue: 13.6, industryMedian: 16.8 },
      { quarter: 'Q2 2025', companyValue: 13.2, industryMedian: 16.4 },
      { quarter: 'Q3 2025', companyValue: 12.8, industryMedian: 16.2 },
      { quarter: 'Q4 2025', companyValue: 12.4, industryMedian: 16.0 },
    ],
  },
  {
    metric: 'engagement_score',
    label: 'Engagement Score (%)',
    quarters: [
      { quarter: 'Q1 2025', companyValue: 69, industryMedian: 66 },
      { quarter: 'Q2 2025', companyValue: 70, industryMedian: 67 },
      { quarter: 'Q3 2025', companyValue: 71, industryMedian: 67 },
      { quarter: 'Q4 2025', companyValue: 72, industryMedian: 68 },
    ],
  },
];

const MOCK_INDUSTRY_BENCHMARK: IndustryBenchmark = {
  industry: 'technology',
  industryLabel: 'Technology',
  companySize: 'mid_market',
  reportPeriod: 'Q4 2025 — Q1 2026',
  metrics: MOCK_BENCHMARK_METRICS,
  sampleSize: 280,
  source: 'Mercer 2026 HR Benchmark Survey + Radford Global Tech',
};

// ============================================================================
// SERVICE
// ============================================================================

export class BenchmarkingService {
  /** Get industry benchmarks for specific metrics */
  static async getIndustryBenchmarks(
    _metric?: BenchmarkMetric,
    _industry?: Industry
  ): Promise<IndustryBenchmark> {
    await new Promise((r) => setTimeout(r, 400));
    return { ...MOCK_INDUSTRY_BENCHMARK };
  }

  /** Get company performance vs industry benchmark */
  static async getCompanyVsBenchmark(metrics: BenchmarkMetric[]): Promise<BenchmarkValue[]> {
    await new Promise((r) => setTimeout(r, 350));
    return MOCK_BENCHMARK_METRICS.filter((m) => metrics.includes(m.metric));
  }

  /** Get all available benchmark categories */
  static async getBenchmarkCategories(): Promise<
    Array<{ id: BenchmarkMetric; label: string; category: string }>
  > {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_BENCHMARK_METRICS.map((m) => ({
      id: m.metric,
      label: m.label,
      category: 'Workforce',
    }));
  }

  /** Get peer group comparison */
  static async getPeerComparison(
    companySize: CompanySize,
    industry: Industry,
    _region: string
  ): Promise<PeerComparison> {
    await new Promise((r) => setTimeout(r, 400));
    return {
      peerGroupDescription: `${industry} companies, ${companySize} (200-500 employees), MENA/Global`,
      peerCount: 48,
      metrics: MOCK_BENCHMARK_METRICS,
      keyInsights: [
        'Turnover rate is 23% better than peer median — strong retention signal.',
        'Training hours per employee is above median — indicates strong L&D investment.',
        'Internal promotion rate is below median — opportunity to improve succession pipeline.',
        'First-year attrition is better than median — strong onboarding effectiveness.',
      ],
    };
  }

  /** Get compensation benchmarks for a role/location */
  static async getCompensationBenchmarks(
    role?: string,
    location?: string
  ): Promise<CompensationBenchmark[]> {
    await new Promise((r) => setTimeout(r, 350));
    let result = [...MOCK_COMPENSATION_BENCHMARKS];
    if (role) result = result.filter((b) => b.role.toLowerCase().includes(role.toLowerCase()));
    if (location)
      result = result.filter((b) => b.location.toLowerCase().includes(location.toLowerCase()));
    return result;
  }

  /** Get trend comparison data */
  static async getTrendComparisons(): Promise<TrendComparison[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...MOCK_TREND_COMPARISONS];
  }
}
