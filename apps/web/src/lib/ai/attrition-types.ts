/**
 * Attrition Prediction — DTOs (risk scores 0–100)
 */

export type AttritionRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AttritionHorizonDays = 90 | 180 | 365;

export type AttritionFactorCategory =
  'COMPENSATION' | 'ENGAGEMENT' | 'PERFORMANCE' | 'GROWTH' | 'MANAGEMENT' | 'WORKLOAD' | 'EXTERNAL';

export type AttritionFactor = {
  name: string;
  impact: number; // 0–100 relative contribution
  category: AttritionFactorCategory;
  description?: string;
};

export type AttritionRecommendation = {
  action: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedImpact: number; // projected risk-score reduction
  category?: string;
};

export type AttritionEmployeePrediction = {
  employeeId: string;
  employeeName: string;
  department: string;
  departmentId?: string;
  location?: string;
  role?: string;
  managerId?: string | null;
  riskScore: number;
  riskLevel: AttritionRiskLevel;
  horizonDays: AttritionHorizonDays;
  primaryFactor: string;
  factors: AttritionFactor[];
  recommendations: AttritionRecommendation[];
  estimatedSalary?: number;
  dataCompleteness: number; // 0–1
  modelVersion: string;
  predictedAt: string;
  confidence?: number;
};

export type AttritionDistributionSlice = {
  name: string;
  value: number;
  color?: string;
  level?: AttritionRiskLevel | 'AT_RISK';
};

export type AttritionDriver = {
  factor: string;
  count: number;
  impact: 'High' | 'Medium' | 'Low';
  avgImpact?: number;
};

export type AttritionSummary = {
  totalEmployees: number;
  atRiskCount: number;
  atRiskPercentage: number;
  replacementCostEstimate: number;
  modelAccuracy: number | null;
  modelVersion: string;
  lastRunAt: string | null;
  byRiskLevel: Record<AttritionRiskLevel, number>;
  horizonDays: AttritionHorizonDays;
};

export type AttritionDashboardData = {
  summary: AttritionSummary;
  distribution: AttritionDistributionSlice[];
  drivers: AttritionDriver[];
  stale?: boolean;
  needsRecompute?: boolean;
};

export type AttritionSimulationResult = {
  salaryBoostPercent: number;
  projectedRiskReductionPct: number;
  estimatedSavedHeadcount: number;
  projectedAtRiskCount: number;
  projectedDistribution: AttritionDistributionSlice[];
  message: string;
};

export type AttritionFeatureVector = {
  employeeId: string;
  employeeName: string;
  department: string;
  departmentId: string;
  location?: string;
  role?: string;
  managerId?: string | null;
  joiningDate: Date;
  tenureYears: number;
  estimatedSalary: number;
  monthsSinceLastIncrease: number | null;
  recentRecognitions: number;
  recentLeaveRequests: number;
  leaveDaysYtd: number;
  performanceRating: number | null;
  overtimeHours90d: number;
  directReports: number;
  availableFeatureCount: number;
  totalFeatureSlots: number;
};

export type AttritionScoreResult = {
  riskScore: number;
  riskLevel: AttritionRiskLevel;
  confidence: number;
  factors: AttritionFactor[];
  recommendations: AttritionRecommendation[];
  primaryFactor: string;
  featureScores: Record<string, number>;
  dataCompleteness: number;
};

export type AttritionRecomputeResult = {
  runId: string;
  scoredCount: number;
  atRiskCount: number;
  durationMs: number;
  modelVersion: string;
  failures: Array<{ employeeId: string; error: string }>;
};

export type AttritionAtRiskFilters = {
  departmentId?: string;
  locationId?: string;
  managerId?: string;
  riskLevel?: AttritionRiskLevel;
  minScore?: number;
  horizonDays?: AttritionHorizonDays;
  limit?: number;
  offset?: number;
};
