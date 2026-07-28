/**
 * Attrition Prediction — feature weights, bands, retention playbooks
 */

import type {
  AttritionFactor,
  AttritionFactorCategory,
  AttritionFeatureVector,
  AttritionHorizonDays,
  AttritionRecommendation,
  AttritionRiskLevel,
  AttritionScoreResult,
} from './attrition-types';

export const ATTRITION_MODEL_CODE = 'ATTRITION_V1';
export const ATTRITION_MODEL_VERSION = '1.0.0';
export const ATTRITION_MODEL_TYPE = 'ATTRITION';
export const ATTRITION_ALGORITHM = 'WEIGHTED_RULES';

/** Predictions older than this are considered stale for dashboard reads */
export const PREDICTION_FRESHNESS_DAYS = 7;

/** Default replacement cost = annualized salary × factor (for at-risk cohort) */
export const DEFAULT_REPLACEMENT_COST_FACTOR = 0.5;

/** Score ≥ this counts as "at risk" for KPIs / shortlist */
export const AT_RISK_THRESHOLD = 60;

export const FEATURE_WEIGHTS = {
  salaryCompetitiveness: 0.12,
  lastSalaryIncrease: 0.08,
  bonusReceived: 0.05,
  engagementScore: 0.1,
  surveyParticipation: 0.05,
  feedbackFrequency: 0.05,
  performanceRating: 0.08,
  performanceTrend: 0.07,
  tenure: 0.05,
  promotionHistory: 0.05,
  trainingHours: 0.05,
  managerTenure: 0.05,
  teamSize: 0.03,
  managerRating: 0.02,
  overtimeHours: 0.05,
  leaveUtilization: 0.03,
  workLifeBalance: 0.02,
  marketDemand: 0.03,
  industryAttrition: 0.02,
} as const;

export type FeatureKey = keyof typeof FEATURE_WEIGHTS;

const RISK_BANDS: Array<{ max: number; level: AttritionRiskLevel }> = [
  { max: 29, level: 'LOW' },
  { max: 59, level: 'MEDIUM' },
  { max: 79, level: 'HIGH' },
  { max: 100, level: 'CRITICAL' },
];

export function riskLevelFromScore(score: number): AttritionRiskLevel {
  const s = Math.min(100, Math.max(0, score));
  for (const band of RISK_BANDS) {
    if (s <= band.max) return band.level;
  }
  return 'CRITICAL';
}

export function horizonMultiplier(horizonDays: AttritionHorizonDays): number {
  if (horizonDays <= 90) return 0.92;
  if (horizonDays <= 180) return 1.0;
  return 1.08;
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Map raw workforce signals → feature health scores (high = healthy / low risk).
 * Unavailable sources are omitted from scoring (see observedFeatures).
 */
export function buildFeatureScores(
  v: AttritionFeatureVector,
  salaryBoostPercent = 0
): Record<FeatureKey, number> {
  const tenureHealthy =
    v.tenureYears < 0.5
      ? 28
      : v.tenureYears < 1
        ? 38
        : v.tenureYears < 2
          ? 55
          : v.tenureYears < 5
            ? 72
            : v.tenureYears < 10
              ? 68
              : 58;

  let salaryCompetitiveness = v.estimatedSalary > 0 ? 58 : 42;
  if (salaryBoostPercent > 0) {
    salaryCompetitiveness = clamp(salaryCompetitiveness + salaryBoostPercent * 1.4);
  }

  const months = v.monthsSinceLastIncrease;
  const lastSalaryIncrease =
    months == null
      ? v.tenureYears >= 2
        ? 32
        : 50
      : months <= 12
        ? 82
        : months <= 24
          ? 48
          : months <= 36
            ? 28
            : 14;

  const engagementScore =
    v.recentRecognitions >= 3
      ? 88
      : v.recentRecognitions === 2
        ? 72
        : v.recentRecognitions === 1
          ? 52
          : 12;

  const leavePressure = v.recentLeaveRequests;
  const leaveUtilization =
    leavePressure === 0 ? 72 : leavePressure <= 2 ? 52 : leavePressure <= 4 ? 32 : 14;

  const performanceRating =
    v.performanceRating == null
      ? 50
      : clamp(v.performanceRating <= 5 ? v.performanceRating * 20 : v.performanceRating);

  const overtimeHours =
    v.overtimeHours90d <= 10
      ? 78
      : v.overtimeHours90d <= 30
        ? 48
        : v.overtimeHours90d <= 60
          ? 28
          : 12;

  const workLifeBalance = clamp(100 - v.overtimeHours90d * 0.9 - leavePressure * 6, 12, 92);
  const teamSize = v.directReports > 12 ? 32 : v.directReports > 8 ? 48 : 72;

  const promotionHistory =
    months != null && months > 36 ? 22 : months == null && v.tenureYears >= 3 ? 30 : 58;

  const scores: Record<FeatureKey, number> = {
    salaryCompetitiveness,
    lastSalaryIncrease,
    bonusReceived: 50,
    engagementScore,
    surveyParticipation: 50,
    feedbackFrequency: clamp(18 + v.recentRecognitions * 18),
    performanceRating,
    performanceTrend: performanceRating,
    tenure: tenureHealthy,
    promotionHistory,
    trainingHours: 50,
    managerTenure: 50,
    teamSize,
    managerRating: 50,
    overtimeHours,
    leaveUtilization,
    workLifeBalance,
    marketDemand: 50,
    industryAttrition: 50,
  };

  return scores;
}

/** Features with real (or strongly inferred) tenant signals — used to renormalize weights */
export function observedFeatures(v: AttritionFeatureVector): FeatureKey[] {
  const keys: FeatureKey[] = [
    'tenure',
    'engagementScore',
    'feedbackFrequency',
    'leaveUtilization',
    'overtimeHours',
    'workLifeBalance',
    'teamSize',
  ];
  if (v.estimatedSalary > 0 || v.tenureYears >= 1) keys.push('salaryCompetitiveness');
  if (v.monthsSinceLastIncrease != null || v.tenureYears >= 2) {
    keys.push('lastSalaryIncrease');
    keys.push('promotionHistory');
  }
  if (v.performanceRating != null) {
    keys.push('performanceRating');
    keys.push('performanceTrend');
  }
  return keys;
}

/** Mild additive risk from clear flight-risk flags (aligns with legacy heuristic route) */
export function heuristicRiskBoost(v: AttritionFeatureVector): number {
  let boost = 0;
  if (v.recentRecognitions === 0) boost += 14;
  if (v.tenureYears < 1) boost += 12;
  else if (v.tenureYears < 2) boost += 6;
  if (v.recentLeaveRequests >= 3) boost += Math.min(16, v.recentLeaveRequests * 3);
  if (v.overtimeHours90d > 40) boost += 10;
  if (v.monthsSinceLastIncrease != null && v.monthsSinceLastIncrease > 24) boost += 8;
  if (
    v.performanceRating != null &&
    ((v.performanceRating <= 5 && v.performanceRating < 3) || v.performanceRating < 60)
  ) {
    boost += 8;
  }
  if (v.estimatedSalary <= 0 && v.tenureYears >= 2) boost += 4;
  return boost;
}

export function scoreFromFeatures(
  features: Record<FeatureKey, number>,
  horizonDays: AttritionHorizonDays = 180,
  opts?: { availableKeys?: FeatureKey[]; heuristicBoost?: number }
): number {
  const keys = opts?.availableKeys?.length
    ? opts.availableKeys
    : (Object.keys(FEATURE_WEIGHTS) as FeatureKey[]);

  let weightSum = 0;
  for (const key of keys) weightSum += FEATURE_WEIGHTS[key] || 0;
  if (weightSum <= 0) weightSum = 1;

  let risk = 0;
  for (const key of keys) {
    const weight = (FEATURE_WEIGHTS[key] || 0) / weightSum;
    const health = features[key] ?? 50;
    risk += (100 - health) * weight;
  }

  // Soft floor so sparse-but-negative signal cohorts aren't stuck in "all low"
  risk = risk * 0.85 + 12 + (opts?.heuristicBoost || 0) * 0.75;
  risk *= horizonMultiplier(horizonDays);
  return Math.round(clamp(risk));
}

const FACTOR_LABELS: Array<{
  key: FeatureKey;
  name: string;
  category: AttritionFactorCategory;
  description: (v: AttritionFeatureVector, health: number) => string;
}> = [
  {
    key: 'salaryCompetitiveness',
    name: 'Salary Gap',
    category: 'COMPENSATION',
    description: () => 'Compensation competitiveness below peer expectation',
  },
  {
    key: 'lastSalaryIncrease',
    name: 'No Recent Raise',
    category: 'COMPENSATION',
    description: (v) =>
      v.monthsSinceLastIncrease != null
        ? `Last salary change ~${v.monthsSinceLastIncrease} months ago`
        : 'No recent compensation adjustment on record',
  },
  {
    key: 'engagementScore',
    name: 'Low Engagement',
    category: 'ENGAGEMENT',
    description: (v) =>
      v.recentRecognitions === 0
        ? 'No recognitions in the last 90 days'
        : `Only ${v.recentRecognitions} recognition(s) in 90 days`,
  },
  {
    key: 'leaveUtilization',
    name: 'Leave Volume Spike',
    category: 'WORKLOAD',
    description: (v) => `${v.recentLeaveRequests} leave request(s) in last 90 days`,
  },
  {
    key: 'overtimeHours',
    name: 'Overtime Burnout',
    category: 'WORKLOAD',
    description: (v) => `${Math.round(v.overtimeHours90d)} OT hours in last 90 days`,
  },
  {
    key: 'tenure',
    name: 'Tenure Risk Window',
    category: 'GROWTH',
    description: (v) => `${v.tenureYears.toFixed(1)} years tenure — elevated flight-risk window`,
  },
  {
    key: 'promotionHistory',
    name: 'Tenure Stagnation',
    category: 'GROWTH',
    description: () => 'Limited recent career progression signal',
  },
  {
    key: 'performanceRating',
    name: 'Performance Pressure',
    category: 'PERFORMANCE',
    description: (v) =>
      v.performanceRating != null
        ? `Latest rating ${v.performanceRating}`
        : 'Performance signal incomplete',
  },
  {
    key: 'workLifeBalance',
    name: 'Work-Life Imbalance',
    category: 'WORKLOAD',
    description: () => 'Workload and leave patterns suggest imbalance',
  },
  {
    key: 'teamSize',
    name: 'Span of Control Stress',
    category: 'MANAGEMENT',
    description: (v) => `${v.directReports} direct report(s)`,
  },
];

export function identifyFactors(
  features: Record<FeatureKey, number>,
  vector: AttritionFeatureVector
): AttritionFactor[] {
  const factors: AttritionFactor[] = [];
  for (const def of FACTOR_LABELS) {
    const health = features[def.key] ?? 50;
    if (health >= 55) continue;
    const weight = FEATURE_WEIGHTS[def.key];
    const impact = Math.round(clamp((100 - health) * weight * 4));
    factors.push({
      name: def.name,
      impact,
      category: def.category,
      description: def.description(vector, health),
    });
  }
  return factors.sort((a, b) => b.impact - a.impact).slice(0, 6);
}

const PLAYBOOK: Array<{
  match: (f: AttritionFactor) => boolean;
  action: string;
  priority: AttritionRecommendation['priority'];
  estimatedImpact: number;
  category: string;
}> = [
  {
    match: (f) => f.category === 'COMPENSATION',
    action: 'Compensation review / market correction',
    priority: 'HIGH',
    estimatedImpact: 18,
    category: 'compensation',
  },
  {
    match: (f) => f.name.includes('Engagement') || f.category === 'ENGAGEMENT',
    action: 'Manager 1:1 + recognition plan',
    priority: 'HIGH',
    estimatedImpact: 12,
    category: 'engagement',
  },
  {
    match: (f) => f.name.includes('Stagnation') || f.name.includes('Tenure'),
    action: 'Career pathing / internal mobility discussion',
    priority: 'MEDIUM',
    estimatedImpact: 14,
    category: 'growth',
  },
  {
    match: (f) =>
      f.category === 'WORKLOAD' || f.name.includes('Burnout') || f.name.includes('Overtime'),
    action: 'Workload balancing / OT cap',
    priority: 'HIGH',
    estimatedImpact: 15,
    category: 'workload',
  },
  {
    match: (f) => f.category === 'PERFORMANCE',
    action: 'Performance coaching check-in',
    priority: 'MEDIUM',
    estimatedImpact: 10,
    category: 'performance',
  },
  {
    match: (f) => f.category === 'MANAGEMENT',
    action: 'Manager effectiveness / span review',
    priority: 'MEDIUM',
    estimatedImpact: 8,
    category: 'management',
  },
];

export function generateRecommendations(
  factors: AttritionFactor[],
  riskLevel: AttritionRiskLevel
): AttritionRecommendation[] {
  const recs: AttritionRecommendation[] = [];
  const used = new Set<string>();

  for (const factor of factors) {
    for (const rule of PLAYBOOK) {
      if (!rule.match(factor) || used.has(rule.action)) continue;
      used.add(rule.action);
      let priority = rule.priority;
      if (riskLevel === 'CRITICAL' && priority === 'MEDIUM') priority = 'HIGH';
      if (riskLevel === 'CRITICAL' && priority === 'HIGH') priority = 'URGENT';
      recs.push({
        action: rule.action,
        priority,
        estimatedImpact: rule.estimatedImpact,
        category: rule.category,
      });
    }
  }

  if (recs.length === 0) {
    recs.push({
      action: 'Stay interview / relationship check-in',
      priority: riskLevel === 'LOW' ? 'LOW' : 'MEDIUM',
      estimatedImpact: 6,
      category: 'engagement',
    });
  }

  return recs.slice(0, 4);
}

export function scoreEmployee(
  vector: AttritionFeatureVector,
  opts?: { horizonDays?: AttritionHorizonDays; salaryBoostPercent?: number }
): AttritionScoreResult {
  const horizonDays = opts?.horizonDays ?? 180;
  const features = buildFeatureScores(vector, opts?.salaryBoostPercent ?? 0);
  const availableKeys = observedFeatures(vector);
  const riskScore = scoreFromFeatures(features, horizonDays, {
    availableKeys,
    heuristicBoost: heuristicRiskBoost(vector),
  });
  const riskLevel = riskLevelFromScore(riskScore);
  const factors = identifyFactors(features, vector);
  const recommendations = generateRecommendations(factors, riskLevel);
  const primaryFactor = factors[0]?.name || 'General flight-risk indicators';
  const distanceFromMiddle = Math.abs(riskScore - 50);
  const confidence = Math.min(95, 48 + distanceFromMiddle * 0.9);
  const dataCompleteness = vector.totalFeatureSlots
    ? vector.availableFeatureCount / vector.totalFeatureSlots
    : 0.5;

  return {
    riskScore,
    riskLevel,
    confidence,
    factors,
    recommendations,
    primaryFactor,
    featureScores: features,
    dataCompleteness: Math.round(dataCompleteness * 100) / 100,
  };
}

export function distributionColors(): Record<string, string> {
  return {
    'Critical Risk': '#b91c1c',
    'High Risk': '#ef4444',
    'Medium Risk': '#f59e0b',
    'Low Risk': '#10b981',
  };
}

export function levelToDistributionName(level: AttritionRiskLevel): string {
  switch (level) {
    case 'CRITICAL':
      return 'Critical Risk';
    case 'HIGH':
      return 'High Risk';
    case 'MEDIUM':
      return 'Medium Risk';
    default:
      return 'Low Risk';
  }
}

export function impactLabel(avgImpact: number): 'High' | 'Medium' | 'Low' {
  if (avgImpact >= 60) return 'High';
  if (avgImpact >= 35) return 'Medium';
  return 'Low';
}
