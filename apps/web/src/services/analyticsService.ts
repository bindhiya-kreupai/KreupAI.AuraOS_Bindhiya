import axios from 'axios';

const BASE_PATH = '/api/v1/analytics';

// ============================================================================
// TYPES
// ============================================================================

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
  period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export interface HeadcountMetrics {
  totalHeadcount: number;
  activeEmployees: number;
  newHires: number;
  terminations: number;
  netChange: number;
  headcountByDepartment: DepartmentHeadcount[];
  headcountByLocation: LocationHeadcount[];
  headcountTrend: TrendDataPoint[];
  fillRate: number;
  openPositions: number;
}

export interface DepartmentHeadcount {
  departmentId: string;
  departmentName: string;
  headcount: number;
  budget: number;
  utilizationRate: number;
}

export interface LocationHeadcount {
  locationId: string;
  locationName: string;
  country: string;
  headcount: number;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TurnoverMetrics {
  overallTurnoverRate: number;
  voluntaryTurnoverRate: number;
  involuntaryTurnoverRate: number;
  averageTenure: number;
  turnoverByDepartment: DepartmentTurnover[];
  turnoverByReason: TurnoverReason[];
  turnoverTrend: TrendDataPoint[];
  retentionRate: number;
  firstYearTurnoverRate: number;
  costOfTurnover: number;
}

export interface DepartmentTurnover {
  departmentId: string;
  departmentName: string;
  turnoverRate: number;
  voluntaryRate: number;
  involuntaryRate: number;
  headcount: number;
  terminations: number;
}

export interface TurnoverReason {
  reason: string;
  count: number;
  percentage: number;
}

export interface DiversityMetrics {
  genderDistribution: GenderBreakdown;
  ageDistribution: AgeBreakdown[];
  ethnicityDistribution: EthnicityBreakdown[];
  diversityIndex: number;
  inclusionScore: number;
  payEquityRatio: number;
  leadershipDiversity: LeadershipDiversity;
  hiringDiversity: HiringDiversity;
  trendData: DiversityTrend[];
}

export interface GenderBreakdown {
  male: number;
  female: number;
  nonBinary: number;
  preferNotToSay: number;
  total: number;
}

export interface AgeBreakdown {
  ageRange: string;
  count: number;
  percentage: number;
}

export interface EthnicityBreakdown {
  ethnicity: string;
  count: number;
  percentage: number;
}

export interface LeadershipDiversity {
  totalLeaders: number;
  genderBreakdown: GenderBreakdown;
  ethnicityBreakdown: EthnicityBreakdown[];
}

export interface HiringDiversity {
  totalHires: number;
  genderBreakdown: GenderBreakdown;
  diverseHireRate: number;
}

export interface DiversityTrend {
  period: string;
  diversityIndex: number;
  inclusionScore: number;
}

export interface CompAnalytics {
  averageSalary: number;
  medianSalary: number;
  totalCompensationBudget: number;
  budgetUtilization: number;
  salaryByDepartment: DepartmentSalary[];
  salaryByLevel: LevelSalary[];
  compensationTrend: TrendDataPoint[];
  compaRatio: number;
  marketPositioning: MarketPosition;
  payEquityAnalysis: PayEquityResult[];
}

export interface DepartmentSalary {
  departmentId: string;
  departmentName: string;
  averageSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;
  headcount: number;
}

export interface LevelSalary {
  level: string;
  averageSalary: number;
  medianSalary: number;
  headcount: number;
}

export interface MarketPosition {
  overall: number;
  byDepartment: { departmentName: string; position: number }[];
  lastUpdated: string;
}

export interface PayEquityResult {
  category: string;
  gap: number;
  adjustedGap: number;
  affectedEmployees: number;
}

export interface PeopleAnalytics {
  engagementScore: number;
  performanceDistribution: PerformanceDistribution;
  absenteeismRate: number;
  averageTimeToFill: number;
  trainingHoursPerEmployee: number;
  employeeSatisfaction: number;
  internalMobilityRate: number;
  successorReadiness: number;
  keyMetricsTrend: KeyMetricTrend[];
}

export interface PerformanceDistribution {
  exceptional: number;
  exceedsExpectations: number;
  meetsExpectations: number;
  needsImprovement: number;
  unsatisfactory: number;
}

export interface KeyMetricTrend {
  period: string;
  engagement: number;
  satisfaction: number;
  performance: number;
}

export interface PredictiveInsight {
  id: string;
  type: 'attrition_risk' | 'performance_prediction' | 'succession_gap' | 'skill_shortage' | 'budget_forecast';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  affectedCount: number;
  recommendedActions: string[];
  predictedDate?: string;
  modelVersion: string;
  createdAt: string;
}

export interface RealTimeMetrics {
  currentOnline: number;
  clockedIn: number;
  onLeave: number;
  pendingApprovals: number;
  openTickets: number;
  activeRecruitments: number;
  todayAttendanceRate: number;
  systemHealth: SystemHealth;
  lastUpdated: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  errorRate: number;
}

export interface ReportConfig {
  name: string;
  type: 'tabular' | 'chart' | 'dashboard' | 'export';
  metrics: string[];
  dimensions: string[];
  filters: ReportFilter[];
  dateRange?: DateRangeParams;
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  format?: 'json' | 'csv' | 'pdf' | 'xlsx';
}

export interface ReportFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: string | number | string[];
}

export interface ReportResult {
  id: string;
  name: string;
  generatedAt: string;
  rowCount: number;
  columns: ReportColumn[];
  data: Record<string, unknown>[];
  summary?: Record<string, number>;
  downloadUrl?: string;
}

export interface ReportColumn {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface SavedReport {
  id: string;
  name: string;
  description?: string;
  config: ReportConfig;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  schedule?: ScheduleConfig;
  shared: boolean;
  sharedWith?: string[];
}

export interface ScheduleConfig {
  reportId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
  recipients: string[];
  format: 'pdf' | 'csv' | 'xlsx';
  enabled: boolean;
}

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * Fetch headcount metrics with optional date range filtering
 */
export async function getHeadcountMetrics(params?: DateRangeParams): Promise<HeadcountMetrics> {
  const response = await axios.get<HeadcountMetrics>(`${BASE_PATH}/headcount`, { params });
  return response.data;
}

/**
 * Fetch turnover analysis metrics with optional date range filtering
 */
export async function getTurnoverAnalysis(params?: DateRangeParams): Promise<TurnoverMetrics> {
  const response = await axios.get<TurnoverMetrics>(`${BASE_PATH}/turnover`, { params });
  return response.data;
}

/**
 * Fetch diversity and inclusion metrics
 */
export async function getDiversityMetrics(): Promise<DiversityMetrics> {
  const response = await axios.get<DiversityMetrics>(`${BASE_PATH}/diversity`);
  return response.data;
}

/**
 * Fetch compensation analytics data
 */
export async function getCompensationAnalytics(): Promise<CompAnalytics> {
  const response = await axios.get<CompAnalytics>(`${BASE_PATH}/compensation`);
  return response.data;
}

/**
 * Fetch comprehensive people analytics
 */
export async function getPeopleAnalytics(): Promise<PeopleAnalytics> {
  const response = await axios.get<PeopleAnalytics>(`${BASE_PATH}/people`);
  return response.data;
}

/**
 * Fetch AI-powered predictive insights
 */
export async function getPredictiveInsights(): Promise<PredictiveInsight[]> {
  const response = await axios.get<PredictiveInsight[]>(`${BASE_PATH}/predictive-insights`);
  return response.data;
}

/**
 * Fetch real-time operational metrics
 */
export async function getRealTimeMetrics(): Promise<RealTimeMetrics> {
  const response = await axios.get<RealTimeMetrics>(`${BASE_PATH}/real-time`);
  return response.data;
}

/**
 * Run a custom report with the given configuration
 */
export async function runCustomReport(config: ReportConfig): Promise<ReportResult> {
  const response = await axios.post<ReportResult>(`${BASE_PATH}/reports/run`, config);
  return response.data;
}

/**
 * Fetch all saved report configurations
 */
export async function getSavedReports(): Promise<SavedReport[]> {
  const response = await axios.get<SavedReport[]>(`${BASE_PATH}/reports/saved`);
  return response.data;
}

/**
 * Schedule a report for periodic execution
 */
export async function scheduleReport(config: ScheduleConfig): Promise<void> {
  await axios.post(`${BASE_PATH}/reports/schedule`, config);
}
