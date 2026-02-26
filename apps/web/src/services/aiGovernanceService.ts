/**
 * @module aiGovernanceService
 * @description AI Governance & MLOps service — model registry, performance tracking,
 *              bias detection, explainability, EU AI Act compliance, audit logs,
 *              usage metrics, concern reporting (Sec 31)
 * @project AURA HCM Platform
 */

// ============================================================================
// TYPES
// ============================================================================

export type ModelStatus = 'active' | 'staging' | 'retired' | 'deprecated';
export type RiskLevel = 'minimal' | 'limited' | 'high' | 'unacceptable';
export type AuditEventType =
  | 'deployed'
  | 'retrained'
  | 'version_released'
  | 'retired'
  | 'bias_alert'
  | 'config_changed'
  | 'data_drift_detected';

export interface AIModel {
  id: string;
  name: string;
  version: string;
  description: string;
  owner: string;
  ownerDepartment: string;
  status: ModelStatus;
  riskLevel: RiskLevel;
  purpose: string;
  trainingDataDescription: string;
  targetAudience: string;
  lastTrainedDate: string;
  nextRetrainingDate: string;
  deployedDate: string;
  apiEndpoint: string;
  tags: string[];
  linkedModule: string;
}

export interface ModelPerformanceMetrics {
  modelId: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  aucRoc: number;
  dataDriftScore: number; // 0–1 (1 = severe drift)
  predictionDrift: number; // 0–1
  featureDrift: Record<string, number>;
  trend: { date: string; accuracy: number; f1Score: number }[];
  evaluatedAt: string;
}

export interface ProtectedGroupMetrics {
  group: string;
  category: 'gender' | 'age' | 'ethnicity' | 'nationality';
  sampleSize: number;
  positiveRate: number; // rate of favorable outcomes
  disparateImpactRatio: number; // reference group = 1.0
  statisticalParityDifference: number;
  equalizedOdds: number;
  isAlert: boolean;
}

export interface BiasReport {
  modelId: string;
  overallFairnessScore: number; // 0–100
  groups: ProtectedGroupMetrics[];
  recommendations: string[];
  generatedAt: string;
  biasAlerts: { group: string; metric: string; value: number; threshold: number }[];
}

export interface FeatureImportance {
  feature: string;
  importance: number; // 0–1 normalized
  direction: 'positive' | 'negative'; // direction of effect
  description: string;
}

export interface CounterfactualExplanation {
  feature: string;
  currentValue: string;
  requiredValue: string;
  impactDescription: string;
}

export interface ExplainabilityResult {
  modelId: string;
  predictionId: string;
  prediction: string;
  confidence: number;
  uncertaintyRange: [number, number];
  featureImportances: FeatureImportance[];
  counterfactuals: CounterfactualExplanation[];
  decisionPath: { node: string; condition: string; result: string }[];
  naturalLanguageSummary: string;
  similarPredictions: { id: string; similarity: number; outcome: string }[];
}

export interface EUAIActRequirement {
  id: string;
  category: string;
  requirement: string;
  description: string;
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable';
  evidence?: string;
  actionRequired?: string;
}

export interface EUAIActAssessment {
  modelId: string;
  riskLevel: RiskLevel;
  riskJustification: string;
  requirements: EUAIActRequirement[];
  overallComplianceScore: number; // 0–100
  conformityAssessmentStatus: 'complete' | 'in_progress' | 'not_started';
  technicalDocumentationStatus: 'available' | 'partial' | 'missing';
  humanOversightMechanism: string;
  lastAssessmentDate: string;
  nextReviewDate: string;
  keyDeadlines: { date: string; milestone: string }[];
}

export interface ModelAuditEntry {
  id: string;
  modelId: string;
  eventType: AuditEventType;
  description: string;
  performedBy: string;
  timestamp: string;
  metadata?: Record<string, string | number>;
}

export interface AIUsageMetrics {
  modelId: string;
  totalPredictions: number;
  predictionsLast30Days: number;
  predictionsLast7Days: number;
  avgLatencyMs: number;
  errorRate: number;
  costUsd: number;
  costLast30Days: number;
  topEndpoints: { endpoint: string; callCount: number }[];
  dailyVolume: { date: string; count: number }[];
}

export interface AIRiskAssessment {
  models: { modelId: string; name: string; riskLevel: RiskLevel; justification: string }[];
  summary: {
    minimal: number;
    limited: number;
    high: number;
    unacceptable: number;
  };
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_MODELS: AIModel[] = [
  {
    id: 'model-001',
    name: 'Attrition Risk Predictor',
    version: '2.4.1',
    description:
      'Predicts the likelihood of employee voluntary attrition in the next 90 days using behavioral signals, engagement scores, and tenure data.',
    owner: 'Dr. Laila Khalid',
    ownerDepartment: 'People Analytics',
    status: 'active',
    riskLevel: 'high',
    purpose: 'Identify at-risk employees for proactive retention interventions',
    trainingDataDescription:
      'Historical employee data (2018–2024), 45,000 employee records, demographic and behavioral features anonymized',
    targetAudience: 'HR Business Partners, Managers',
    lastTrainedDate: '2024-11-15',
    nextRetrainingDate: '2025-05-15',
    deployedDate: '2024-12-01',
    apiEndpoint: '/api/ai/attrition-prediction',
    tags: ['retention', 'prediction', 'workforce'],
    linkedModule: 'People Analytics',
  },
  {
    id: 'model-002',
    name: 'Candidate Ranking Model',
    version: '1.8.0',
    description:
      'Ranks job applicants based on skill match, experience relevance, and culture fit scores from CV and assessment data.',
    owner: 'Ahmed Al-Rashid',
    ownerDepartment: 'Talent Acquisition',
    status: 'active',
    riskLevel: 'high',
    purpose: 'Streamline candidate screening and surface top candidates for recruiters',
    trainingDataDescription:
      'Anonymized historical hiring data (2019–2024), 12,000 successful hires, CV embeddings and assessment scores',
    targetAudience: 'Recruiters, Hiring Managers',
    lastTrainedDate: '2024-10-20',
    nextRetrainingDate: '2025-04-20',
    deployedDate: '2024-11-01',
    apiEndpoint: '/api/ai/candidate-ranking',
    tags: ['recruitment', 'screening', 'ranking'],
    linkedModule: 'Recruitment',
  },
  {
    id: 'model-003',
    name: 'Engagement Sentiment Analyzer',
    version: '3.1.2',
    description:
      'Analyzes open-text survey responses to classify sentiment and extract key themes from employee feedback.',
    owner: 'Sara Al-Mansouri',
    ownerDepartment: 'Employee Experience',
    status: 'active',
    riskLevel: 'limited',
    purpose: 'Understand employee sentiment at scale from unstructured survey data',
    trainingDataDescription:
      'Anonymized survey responses (2020–2024), 180,000 text samples, multi-lingual (English, Arabic)',
    targetAudience: 'HR Leadership, Department Heads',
    lastTrainedDate: '2024-12-01',
    nextRetrainingDate: '2025-06-01',
    deployedDate: '2025-01-15',
    apiEndpoint: '/api/ai/sentiment-analysis',
    tags: ['NLP', 'sentiment', 'surveys', 'engagement'],
    linkedModule: 'Engagement & Surveys',
  },
  {
    id: 'model-004',
    name: 'Absence Pattern Predictor',
    version: '1.3.0',
    description:
      'Forecasts departmental absence rates and identifies employees at risk of excessive absenteeism.',
    owner: 'Mohammed Al-Rashidi',
    ownerDepartment: 'Workforce Operations',
    status: 'staging',
    riskLevel: 'limited',
    purpose: 'Enable proactive workforce planning and wellbeing interventions',
    trainingDataDescription:
      'Attendance records (2019–2024), 38,000 employee months, seasonal and external factors included',
    targetAudience: 'Workforce Planners, HR Operations',
    lastTrainedDate: '2025-01-10',
    nextRetrainingDate: '2025-07-10',
    deployedDate: '2025-02-01',
    apiEndpoint: '/api/ai/absence-prediction',
    tags: ['attendance', 'forecasting', 'workforce-planning'],
    linkedModule: 'Time & Attendance',
  },
  {
    id: 'model-005',
    name: 'Salary Benchmarking Engine',
    version: '2.0.3',
    description:
      'Recommends competitive salary ranges for roles based on market data, internal equity, and performance.',
    owner: 'Fatima Al-Zahra',
    ownerDepartment: 'Compensation & Benefits',
    status: 'active',
    riskLevel: 'minimal',
    purpose: 'Support fair and competitive compensation decisions',
    trainingDataDescription:
      'Market survey data (Mercer, Hay Group, Korn Ferry 2020–2024), 500+ role benchmarks, 45 countries',
    targetAudience: 'Compensation Analysts, HR Business Partners',
    lastTrainedDate: '2024-09-01',
    nextRetrainingDate: '2025-09-01',
    deployedDate: '2024-10-01',
    apiEndpoint: '/api/ai/salary-benchmarking',
    tags: ['compensation', 'benchmarking', 'market-data'],
    linkedModule: 'Compensation Management',
  },
];

function buildPerformanceTrend(
  baseAccuracy: number,
  baseF1: number,
  months = 6
): { date: string; accuracy: number; f1Score: number }[] {
  const trend = [];
  const now = new Date('2025-02-25');
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    trend.push({
      date: d.toISOString().split('T')[0].slice(0, 7),
      accuracy: Math.min(100, baseAccuracy + (Math.random() - 0.3) * 3),
      f1Score: Math.min(100, baseF1 + (Math.random() - 0.3) * 3),
    });
  }
  return trend.map((t) => ({
    ...t,
    accuracy: parseFloat(t.accuracy.toFixed(1)),
    f1Score: parseFloat(t.f1Score.toFixed(1)),
  }));
}

const MOCK_PERFORMANCE: Record<string, ModelPerformanceMetrics> = {
  'model-001': {
    modelId: 'model-001',
    accuracy: 84.2,
    precision: 81.5,
    recall: 79.8,
    f1Score: 80.6,
    aucRoc: 0.88,
    dataDriftScore: 0.12,
    predictionDrift: 0.08,
    featureDrift: { engagement_score: 0.05, tenure_days: 0.02, manager_rating: 0.18 },
    trend: buildPerformanceTrend(84, 80),
    evaluatedAt: '2025-02-20T10:00:00Z',
  },
  'model-002': {
    modelId: 'model-002',
    accuracy: 78.6,
    precision: 75.2,
    recall: 72.1,
    f1Score: 73.6,
    aucRoc: 0.82,
    dataDriftScore: 0.22,
    predictionDrift: 0.15,
    featureDrift: { skill_match: 0.08, experience_years: 0.25, assessment_score: 0.12 },
    trend: buildPerformanceTrend(78, 73),
    evaluatedAt: '2025-02-18T10:00:00Z',
  },
  'model-003': {
    modelId: 'model-003',
    accuracy: 91.3,
    precision: 89.7,
    recall: 88.4,
    f1Score: 89.0,
    aucRoc: 0.95,
    dataDriftScore: 0.05,
    predictionDrift: 0.03,
    featureDrift: { text_length: 0.02, sentiment_keywords: 0.06 },
    trend: buildPerformanceTrend(91, 89),
    evaluatedAt: '2025-02-22T10:00:00Z',
  },
  'model-004': {
    modelId: 'model-004',
    accuracy: 73.4,
    precision: 70.1,
    recall: 68.9,
    f1Score: 69.5,
    aucRoc: 0.78,
    dataDriftScore: 0.18,
    predictionDrift: 0.11,
    featureDrift: { season: 0.05, dept_size: 0.15 },
    trend: buildPerformanceTrend(73, 69),
    evaluatedAt: '2025-02-15T10:00:00Z',
  },
  'model-005': {
    modelId: 'model-005',
    accuracy: 88.9,
    precision: 86.2,
    recall: 85.0,
    f1Score: 85.6,
    aucRoc: 0.92,
    dataDriftScore: 0.07,
    predictionDrift: 0.04,
    featureDrift: { market_data_recency: 0.08, role_complexity: 0.03 },
    trend: buildPerformanceTrend(89, 85),
    evaluatedAt: '2025-02-20T10:00:00Z',
  },
};

const MOCK_BIAS: Record<string, BiasReport> = {
  'model-001': {
    modelId: 'model-001',
    overallFairnessScore: 74,
    groups: [
      {
        group: 'Female',
        category: 'gender',
        sampleSize: 4200,
        positiveRate: 0.18,
        disparateImpactRatio: 0.92,
        statisticalParityDifference: -0.03,
        equalizedOdds: 0.91,
        isAlert: false,
      },
      {
        group: 'Male',
        category: 'gender',
        sampleSize: 5800,
        positiveRate: 0.22,
        disparateImpactRatio: 1.0,
        statisticalParityDifference: 0.0,
        equalizedOdds: 1.0,
        isAlert: false,
      },
      {
        group: '25–34',
        category: 'age',
        sampleSize: 3100,
        positiveRate: 0.26,
        disparateImpactRatio: 1.18,
        statisticalParityDifference: 0.06,
        equalizedOdds: 1.15,
        isAlert: true,
      },
      {
        group: '45–54',
        category: 'age',
        sampleSize: 1800,
        positiveRate: 0.12,
        disparateImpactRatio: 0.72,
        statisticalParityDifference: -0.1,
        equalizedOdds: 0.74,
        isAlert: true,
      },
      {
        group: 'Saudi',
        category: 'nationality',
        sampleSize: 4500,
        positiveRate: 0.19,
        disparateImpactRatio: 0.95,
        statisticalParityDifference: -0.01,
        equalizedOdds: 0.96,
        isAlert: false,
      },
      {
        group: 'Non-Saudi',
        category: 'nationality',
        sampleSize: 5500,
        positiveRate: 0.23,
        disparateImpactRatio: 1.05,
        statisticalParityDifference: 0.03,
        equalizedOdds: 1.04,
        isAlert: false,
      },
    ],
    recommendations: [
      'Investigate age-related disparate impact for 25–34 and 45–54 groups',
      'Consider reweighting training data to reduce age bias',
      'Add age as a protected attribute in model monitoring',
      'Review feature engineering for tenure-related features that may proxy age',
    ],
    generatedAt: '2025-02-20T10:00:00Z',
    biasAlerts: [
      { group: '25–34 age group', metric: 'Disparate Impact Ratio', value: 1.18, threshold: 1.1 },
      { group: '45–54 age group', metric: 'Disparate Impact Ratio', value: 0.72, threshold: 0.8 },
    ],
  },
  'model-002': {
    modelId: 'model-002',
    overallFairnessScore: 62,
    groups: [
      {
        group: 'Female',
        category: 'gender',
        sampleSize: 3200,
        positiveRate: 0.34,
        disparateImpactRatio: 0.81,
        statisticalParityDifference: -0.08,
        equalizedOdds: 0.79,
        isAlert: true,
      },
      {
        group: 'Male',
        category: 'gender',
        sampleSize: 4800,
        positiveRate: 0.42,
        disparateImpactRatio: 1.0,
        statisticalParityDifference: 0.0,
        equalizedOdds: 1.0,
        isAlert: false,
      },
      {
        group: 'Arab',
        category: 'ethnicity',
        sampleSize: 5100,
        positiveRate: 0.4,
        disparateImpactRatio: 0.95,
        statisticalParityDifference: -0.02,
        equalizedOdds: 0.96,
        isAlert: false,
      },
      {
        group: 'South Asian',
        category: 'ethnicity',
        sampleSize: 1800,
        positiveRate: 0.44,
        disparateImpactRatio: 1.05,
        statisticalParityDifference: 0.02,
        equalizedOdds: 1.04,
        isAlert: false,
      },
      {
        group: 'Western',
        category: 'ethnicity',
        sampleSize: 900,
        positiveRate: 0.51,
        disparateImpactRatio: 1.21,
        statisticalParityDifference: 0.09,
        equalizedOdds: 1.18,
        isAlert: true,
      },
    ],
    recommendations: [
      'Address gender bias — female candidates are 19% less likely to be ranked highly',
      'Investigate CV language patterns that may disadvantage certain groups',
      'Audit training labels for historical bias from past hiring decisions',
      'Implement fairness constraints during model retraining',
    ],
    generatedAt: '2025-02-18T10:00:00Z',
    biasAlerts: [
      { group: 'Female candidates', metric: 'Disparate Impact Ratio', value: 0.81, threshold: 0.8 },
      { group: 'Western ethnicity', metric: 'Disparate Impact Ratio', value: 1.21, threshold: 1.1 },
    ],
  },
  'model-003': {
    modelId: 'model-003',
    overallFairnessScore: 91,
    groups: [],
    recommendations: ['Continue monitoring for language-based biases'],
    generatedAt: '2025-02-22T10:00:00Z',
    biasAlerts: [],
  },
  'model-004': {
    modelId: 'model-004',
    overallFairnessScore: 82,
    groups: [],
    recommendations: [],
    generatedAt: '2025-02-15T10:00:00Z',
    biasAlerts: [],
  },
  'model-005': {
    modelId: 'model-005',
    overallFairnessScore: 88,
    groups: [],
    recommendations: [],
    generatedAt: '2025-02-20T10:00:00Z',
    biasAlerts: [],
  },
};

const MOCK_EXPLAINABILITY: Record<string, ExplainabilityResult> = {
  'model-001': {
    modelId: 'model-001',
    predictionId: 'pred-12345',
    prediction: 'HIGH RISK (score: 78)',
    confidence: 78,
    uncertaintyRange: [65, 88],
    featureImportances: [
      {
        feature: 'Engagement Score (Last Quarter)',
        importance: 0.28,
        direction: 'negative',
        description: 'Engagement dropped 22% vs. prior quarter',
      },
      {
        feature: 'Manager Rating',
        importance: 0.21,
        direction: 'negative',
        description: 'Below team average by 1.4 points',
      },
      {
        feature: 'Salary Vs Market',
        importance: 0.18,
        direction: 'negative',
        description: '12% below market median for role',
      },
      {
        feature: 'Recent Peer Departures',
        importance: 0.14,
        direction: 'negative',
        description: '3 close colleagues left in past 60 days',
      },
      {
        feature: 'Tenure at Company',
        importance: 0.09,
        direction: 'positive',
        description: '5.2 years — above average',
      },
      {
        feature: 'Learning & Development Activity',
        importance: 0.06,
        direction: 'positive',
        description: 'Completed 2 courses this quarter',
      },
      {
        feature: 'Commute Distance',
        importance: 0.04,
        direction: 'negative',
        description: '45km daily commute',
      },
    ],
    counterfactuals: [
      {
        feature: 'Salary Vs Market',
        currentValue: '12% below',
        requiredValue: 'At market',
        impactDescription: 'Risk would drop from 78 to ~55',
      },
      {
        feature: 'Engagement Score',
        currentValue: '52/100',
        requiredValue: '70/100',
        impactDescription: 'Risk would drop from 78 to ~48',
      },
      {
        feature: 'Manager Rating',
        currentValue: '2.8/5',
        requiredValue: '3.5/5',
        impactDescription: 'Risk would drop from 78 to ~62',
      },
    ],
    decisionPath: [
      { node: 'Engagement Check', condition: 'Engagement < 60', result: 'Elevated risk' },
      { node: 'Compensation Check', condition: 'Salary < Market P50', result: 'Further elevated' },
      { node: 'Social Signals', condition: 'Peer departures > 2', result: 'Risk confirmed' },
    ],
    naturalLanguageSummary:
      'This employee shows HIGH attrition risk (78%) primarily driven by a recent drop in engagement scores, below-market salary, and peer departures. If salary is adjusted to market level and engagement improves, the risk could be reduced significantly. Recommended action: schedule retention conversation with manager and review compensation.',
    similarPredictions: [
      { id: 'pred-11200', similarity: 0.89, outcome: 'Employee left (resigned)' },
      { id: 'pred-10850', similarity: 0.82, outcome: 'Employee stayed (salary adjusted)' },
      { id: 'pred-10100', similarity: 0.76, outcome: 'Employee stayed (role change offered)' },
    ],
  },
};

const MOCK_EU_ACT: Record<string, EUAIActAssessment> = {
  'model-001': {
    modelId: 'model-001',
    riskLevel: 'high',
    riskJustification:
      "This system is used in employment-related decisions affecting workers' conditions. Under EU AI Act Annex III, employment-related AI systems are classified as High-Risk.",
    overallComplianceScore: 72,
    conformityAssessmentStatus: 'in_progress',
    technicalDocumentationStatus: 'partial',
    humanOversightMechanism:
      'Predictions are advisory only. HR Business Partners must review all attrition flags before initiating retention actions. No automated decisions are made.',
    lastAssessmentDate: '2025-01-15',
    nextReviewDate: '2025-07-15',
    requirements: [
      {
        id: 'req-001',
        category: 'Transparency',
        requirement: 'Provide clear information about AI use to affected employees',
        description: 'Employees should be informed when AI is used in decisions affecting them',
        status: 'compliant',
        evidence: 'Privacy notice updated Q4 2024 to include AI disclosure',
      },
      {
        id: 'req-002',
        category: 'Human Oversight',
        requirement: 'Ensure adequate human oversight measures',
        description: 'Humans must be able to override, correct, or stop AI system',
        status: 'compliant',
        evidence: 'HR BP approval required for all AI-flagged interventions',
      },
      {
        id: 'req-003',
        category: 'Data Governance',
        requirement: 'Data quality and governance requirements',
        description: 'Training data must be relevant, representative, and free from errors',
        status: 'partial',
        evidence: 'Data quality framework in place; bias audit findings show age-related gaps',
        actionRequired: 'Complete bias remediation for age group disparities',
      },
      {
        id: 'req-004',
        category: 'Accuracy & Robustness',
        requirement: 'Meet accuracy and robustness requirements for high-risk systems',
        description: 'System must perform consistently under various conditions',
        status: 'partial',
        evidence: 'Accuracy at 84.2%. Data drift monitoring active.',
        actionRequired: 'Address data drift score of 0.12 — implement retraining pipeline',
      },
      {
        id: 'req-005',
        category: 'Technical Documentation',
        requirement: 'Maintain comprehensive technical documentation',
        description: 'Documentation must cover design, training, validation, and deployment',
        status: 'partial',
        evidence: 'Model card and data sheet created',
        actionRequired: 'Complete conformity assessment documentation',
      },
      {
        id: 'req-006',
        category: 'Cybersecurity',
        requirement: 'Resilience to adversarial attacks and data poisoning',
        description: 'System must be protected against adversarial manipulation',
        status: 'compliant',
        evidence: 'Model inputs validated; access controls implemented',
      },
      {
        id: 'req-007',
        category: 'Logging & Monitoring',
        requirement: 'Automatic logging and post-market monitoring',
        description: 'Maintain logs of predictions and system performance over time',
        status: 'compliant',
        evidence: 'All predictions logged with timestamps; monthly performance review',
      },
      {
        id: 'req-008',
        category: 'Fundamental Rights Impact',
        requirement: 'Conduct Fundamental Rights Impact Assessment (FRIA)',
        description: 'Assess impact on fundamental rights of workers',
        status: 'non_compliant',
        actionRequired:
          'FRIA not yet completed. Schedule with DPO and legal counsel by March 2025.',
      },
    ],
    keyDeadlines: [
      { date: '2025-08-02', milestone: 'EU AI Act prohibited practices prohibition in force' },
      { date: '2026-08-02', milestone: 'High-risk AI system requirements fully applicable' },
      { date: '2025-03-31', milestone: 'Internal FRIA completion deadline' },
      { date: '2025-07-15', milestone: 'Conformity assessment submission' },
    ],
  },
};

const MOCK_AUDIT_LOGS: Record<string, ModelAuditEntry[]> = {
  'model-001': [
    {
      id: 'aud-001',
      modelId: 'model-001',
      eventType: 'deployed',
      description: 'Model v2.4.1 deployed to production',
      performedBy: 'Dr. Laila Khalid',
      timestamp: '2024-12-01T10:00:00Z',
      metadata: { previousVersion: '2.3.0' },
    },
    {
      id: 'aud-002',
      modelId: 'model-001',
      eventType: 'retrained',
      description: 'Model retrained with Q3 2024 data, accuracy improved from 82.1 to 84.2',
      performedBy: 'ML Platform (Auto)',
      timestamp: '2024-11-15T06:00:00Z',
      metadata: { datasetSize: 45000, trainingDuration: '4h 22m' },
    },
    {
      id: 'aud-003',
      modelId: 'model-001',
      eventType: 'bias_alert',
      description:
        'Age group disparity alert: 45-54 age group disparate impact ratio below 0.8 threshold',
      performedBy: 'Bias Monitor (Auto)',
      timestamp: '2025-01-20T14:30:00Z',
    },
    {
      id: 'aud-004',
      modelId: 'model-001',
      eventType: 'config_changed',
      description: 'Alert threshold for high risk changed from 75 to 70',
      performedBy: 'Ahmed Al-Rashid',
      timestamp: '2025-01-10T11:00:00Z',
    },
    {
      id: 'aud-005',
      modelId: 'model-001',
      eventType: 'data_drift_detected',
      description: 'Feature drift detected in manager_rating feature (drift score: 0.18)',
      performedBy: 'Data Drift Monitor (Auto)',
      timestamp: '2025-02-10T08:00:00Z',
    },
  ],
};

const MOCK_USAGE: Record<string, AIUsageMetrics> = {
  'model-001': {
    modelId: 'model-001',
    totalPredictions: 142_800,
    predictionsLast30Days: 4_200,
    predictionsLast7Days: 980,
    avgLatencyMs: 145,
    errorRate: 0.002,
    costUsd: 1_840,
    costLast30Days: 280,
    topEndpoints: [
      { endpoint: '/api/ai/attrition-prediction/batch', callCount: 3200 },
      { endpoint: '/api/ai/attrition-prediction/single', callCount: 1000 },
    ],
    dailyVolume: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(new Date('2025-02-25').setDate(new Date('2025-02-25').getDate() - (6 - i)))
        .toISOString()
        .split('T')[0],
      count: 120 + Math.floor(Math.random() * 60),
    })),
  },
};

// ============================================================================
// SERVICE
// ============================================================================

export class AIGovernanceService {
  // ── Get AI Models ──────────────────────────────────────────────────────────

  static async getAIModels(): Promise<AIModel[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...MOCK_MODELS];
  }

  // ── Get Model Details ──────────────────────────────────────────────────────

  static async getModelDetails(modelId: string): Promise<AIModel | null> {
    await new Promise((r) => setTimeout(r, 150));
    return MOCK_MODELS.find((m) => m.id === modelId) ?? null;
  }

  // ── Get Model Performance ──────────────────────────────────────────────────

  static async getModelPerformance(modelId: string): Promise<ModelPerformanceMetrics | null> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_PERFORMANCE[modelId] ?? null;
  }

  // ── Get Bias Report ────────────────────────────────────────────────────────

  static async getBiasReport(modelId: string): Promise<BiasReport | null> {
    await new Promise((r) => setTimeout(r, 250));
    return MOCK_BIAS[modelId] ?? null;
  }

  // ── Get Explainability ─────────────────────────────────────────────────────

  static async getExplainability(
    modelId: string,
    _predictionId: string
  ): Promise<ExplainabilityResult | null> {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_EXPLAINABILITY[modelId] ?? null;
  }

  // ── Get AI Risk Assessment ─────────────────────────────────────────────────

  static async getAIRiskAssessment(): Promise<AIRiskAssessment> {
    await new Promise((r) => setTimeout(r, 200));
    const models = MOCK_MODELS.map((m) => ({
      modelId: m.id,
      name: m.name,
      riskLevel: m.riskLevel,
      justification:
        m.riskLevel === 'high'
          ? 'Employment-related AI — EU AI Act Annex III'
          : m.riskLevel === 'limited'
            ? 'Uses AI to process or influence employees; transparency obligations apply'
            : 'Low-impact analytics tool; no direct employment decisions',
    }));
    const summary = models.reduce(
      (acc, m) => {
        acc[m.riskLevel] = (acc[m.riskLevel] ?? 0) + 1;
        return acc;
      },
      { minimal: 0, limited: 0, high: 0, unacceptable: 0 } as AIRiskAssessment['summary']
    );
    return { models, summary };
  }

  // ── Get Model Audit Log ────────────────────────────────────────────────────

  static async getModelAuditLog(modelId: string): Promise<ModelAuditEntry[]> {
    await new Promise((r) => setTimeout(r, 150));
    return MOCK_AUDIT_LOGS[modelId] ?? [];
  }

  // ── Report AI Concern ──────────────────────────────────────────────────────

  static async reportAIConcern(_data: {
    modelId: string;
    concernType: 'bias' | 'accuracy' | 'privacy' | 'transparency' | 'other';
    description: string;
    reportedBy: string;
  }): Promise<{ id: string; ticketNumber: string }> {
    await new Promise((r) => setTimeout(r, 300));
    return {
      id: `concern-${Date.now()}`,
      ticketNumber: `AI-${Math.floor(1000 + Math.random() * 9000)}`,
    };
  }

  // ── Get AI Usage Metrics ───────────────────────────────────────────────────

  static async getAIUsageMetrics(): Promise<AIUsageMetrics[]> {
    await new Promise((r) => setTimeout(r, 200));
    return Object.values(MOCK_USAGE);
  }

  // ── Get EU AI Act Compliance ───────────────────────────────────────────────

  static async getEUAIActCompliance(modelId: string): Promise<EUAIActAssessment | null> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_EU_ACT[modelId] ?? null;
  }
}
