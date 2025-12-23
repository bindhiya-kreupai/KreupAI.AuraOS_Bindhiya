/**
 * AI/ML Service Types
 * Phase 3: Intelligence Layer - Predictive Analytics
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type PredictionConfidence = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type ModelStatus = 'TRAINING' | 'READY' | 'DEPRECATED' | 'ERROR';

export interface Prediction<T> {
  value: T;
  confidence: number; // 0-100
  confidenceLevel: PredictionConfidence;
  factors: ContributingFactor[];
  timestamp: Date;
  modelVersion: string;
}

export interface ContributingFactor {
  name: string;
  nameAr: string;
  impact: number; // -100 to 100, positive = increases prediction
  description: string;
  descriptionAr: string;
  category: string;
}

export interface Recommendation {
  id: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  actionable: boolean;
  estimatedImpact: number; // Percentage improvement
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
}

// ============================================================================
// ATTRITION PREDICTION
// ============================================================================

export interface AttritionRisk {
  employeeId: string;
  employeeName: string;
  department: string;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  prediction: Prediction<boolean>;
  factors: AttritionFactor[];
  recommendations: Recommendation[];
  historicalRisk: RiskTrend[];
  lastUpdated: Date;
}

export interface AttritionFactor extends ContributingFactor {
  category: 'COMPENSATION' | 'ENGAGEMENT' | 'PERFORMANCE' | 'TENURE' | 'MANAGEMENT' | 'WORKLOAD' | 'GROWTH' | 'TEAM';
  currentValue: number | string;
  benchmarkValue?: number | string;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

export interface RiskTrend {
  date: string;
  score: number;
  level: RiskLevel;
}

export interface AttritionAnalytics {
  tenantId: string;
  asOfDate: Date;

  // Overall Metrics
  totalEmployees: number;
  atRiskCount: number;
  atRiskPercentage: number;
  predictedAttrition: number;
  actualAttrition: number;
  modelAccuracy: number;

  // By Risk Level
  byRiskLevel: {
    level: RiskLevel;
    count: number;
    percentage: number;
    avgTenure: number;
  }[];

  // By Department
  byDepartment: {
    department: string;
    totalEmployees: number;
    atRiskCount: number;
    avgRiskScore: number;
    topFactors: string[];
  }[];

  // Top Risk Factors
  topRiskFactors: {
    factor: string;
    frequency: number;
    avgImpact: number;
  }[];

  // Recommendations Summary
  topRecommendations: Recommendation[];

  // Trends
  monthlyTrend: {
    month: string;
    atRiskCount: number;
    actualAttrition: number;
    predictedAttrition: number;
  }[];
}

// ============================================================================
// PERFORMANCE PREDICTION
// ============================================================================

export interface PerformancePrediction {
  employeeId: string;
  employeeName: string;
  department: string;
  currentRating: number;
  predictedRating: number;
  confidence: number;
  factors: PerformanceFactor[];
  trajectory: 'IMPROVING' | 'STABLE' | 'DECLINING';
  recommendations: Recommendation[];
  quarterlyProjection: PerformanceProjection[];
}

export interface PerformanceFactor extends ContributingFactor {
  category: 'SKILLS' | 'GOALS' | 'TRAINING' | 'FEEDBACK' | 'COLLABORATION' | 'ATTENDANCE' | 'ENGAGEMENT';
  score: number;
  weight: number;
}

export interface PerformanceProjection {
  quarter: string;
  predictedRating: number;
  confidence: number;
  keyMilestones: string[];
}

// ============================================================================
// WORKFORCE PLANNING
// ============================================================================

export interface WorkforceForecast {
  tenantId: string;
  forecastPeriod: string; // YYYY-MM
  generatedAt: Date;

  // Headcount Projections
  currentHeadcount: number;
  projectedHeadcount: number;
  projectedHires: number;
  projectedExits: number;
  projectedTransfers: number;

  // By Department
  byDepartment: DepartmentForecast[];

  // By Role
  byRole: RoleForecast[];

  // Skills Gap
  skillsGap: SkillsGapAnalysis[];

  // Hiring Plan
  hiringPlan: HiringRecommendation[];

  // Budget Impact
  costProjection: CostProjection;
}

export interface DepartmentForecast {
  departmentId: string;
  departmentName: string;
  currentHeadcount: number;
  optimalHeadcount: number;
  projectedHeadcount: number;
  gap: number;
  attritionRisk: number;
  hiringPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface RoleForecast {
  roleId: string;
  roleName: string;
  currentCount: number;
  requiredCount: number;
  gap: number;
  avgTimeToFill: number; // days
  marketAvailability: 'SCARCE' | 'MODERATE' | 'ABUNDANT';
  salaryTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
}

export interface SkillsGapAnalysis {
  skill: string;
  category: string;
  currentCoverage: number; // percentage of employees with skill
  requiredCoverage: number;
  gap: number;
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendations: ('HIRE' | 'TRAIN' | 'OUTSOURCE')[];
  trainingCost: number;
  hiringCost: number;
}

export interface HiringRecommendation {
  roleId: string;
  roleName: string;
  department: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  quantity: number;
  timeline: string;
  estimatedCost: number;
  justification: string;
  skills: string[];
}

export interface CostProjection {
  currentMonthlyCost: number;
  projectedMonthlyCost: number;
  hiringCost: number;
  trainingCost: number;
  attritionCost: number;
  netChange: number;
  currency: string;
}

// ============================================================================
// RECRUITMENT AI
// ============================================================================

export interface ResumeAnalysis {
  id: string;
  candidateId: string;
  fileName: string;
  parsedAt: Date;

  // Extracted Information
  contact: CandidateContact;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: ExtractedSkill[];
  certifications: Certification[];
  languages: Language[];

  // Analysis
  totalExperienceYears: number;
  relevantExperienceYears: number;
  careerProgression: 'STRONG' | 'MODERATE' | 'INCONSISTENT';
  jobHoppingRisk: RiskLevel;
  overallScore: number;

  // Raw Data
  rawText: string;
  sections: { name: string; content: string }[];
}

export interface CandidateContact {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  portfolio?: string;
}

export interface WorkExperience {
  company: string;
  title: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  duration: number; // months
  description: string;
  highlights: string[];
  skills: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  honors?: string[];
}

export interface ExtractedSkill {
  name: string;
  category: 'TECHNICAL' | 'SOFT' | 'DOMAIN' | 'TOOL' | 'LANGUAGE';
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  yearsOfExperience: number;
  lastUsed?: string;
  confidence: number;
}

export interface Certification {
  name: string;
  issuer: string;
  date?: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface Language {
  name: string;
  proficiency: 'BASIC' | 'CONVERSATIONAL' | 'PROFESSIONAL' | 'NATIVE';
}

export interface CandidateMatch {
  candidateId: string;
  resumeId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  matchScore: number; // 0-100
  ranking: number;
  matchDetails: MatchCategory[];
  pros: string[];
  cons: string[];
  recommendation: 'STRONG_YES' | 'YES' | 'MAYBE' | 'NO';
  interviewQuestions: string[];
}

export interface MatchCategory {
  category: string;
  weight: number;
  score: number;
  matches: string[];
  gaps: string[];
}

// ============================================================================
// SENTIMENT ANALYSIS
// ============================================================================

export interface SentimentAnalysis {
  sourceType: 'SURVEY' | 'REVIEW' | 'FEEDBACK' | 'EXIT_INTERVIEW';
  sourceId: string;
  analyzedAt: Date;
  overallSentiment: 'VERY_NEGATIVE' | 'NEGATIVE' | 'NEUTRAL' | 'POSITIVE' | 'VERY_POSITIVE';
  score: number; // -100 to 100
  topics: TopicSentiment[];
  keywords: KeywordExtraction[];
  recommendations: Recommendation[];
}

export interface TopicSentiment {
  topic: string;
  sentiment: number;
  frequency: number;
  examples: string[];
}

export interface KeywordExtraction {
  keyword: string;
  frequency: number;
  sentiment: number;
  context: string[];
}

// ============================================================================
// ENGAGEMENT ANALYTICS
// ============================================================================

export interface EngagementScore {
  employeeId: string;
  employeeName: string;
  department: string;
  overallScore: number; // 0-100
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  dimensions: EngagementDimension[];
  riskIndicators: string[];
  recommendations: Recommendation[];
  lastSurveyDate?: Date;
  responseRate: number;
}

export interface EngagementDimension {
  name: string;
  nameAr: string;
  score: number;
  benchmark: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  subDimensions: {
    name: string;
    score: number;
  }[];
}

export interface EngagementAnalytics {
  tenantId: string;
  period: string;
  overallScore: number;
  responseRate: number;
  participantCount: number;

  // By Dimension
  byDimension: {
    dimension: string;
    score: number;
    change: number;
    topDriver: string;
    bottomDriver: string;
  }[];

  // By Department
  byDepartment: {
    department: string;
    score: number;
    change: number;
    responseRate: number;
  }[];

  // Trends
  quarterlyTrend: {
    quarter: string;
    score: number;
    responseRate: number;
  }[];

  // Action Items
  topPriorities: Recommendation[];
  quickWins: Recommendation[];
}

// ============================================================================
// MODEL MANAGEMENT
// ============================================================================

export interface MLModel {
  id: string;
  name: string;
  type: 'ATTRITION' | 'PERFORMANCE' | 'ENGAGEMENT' | 'RESUME_PARSER' | 'SENTIMENT';
  version: string;
  status: ModelStatus;
  accuracy: number;
  lastTrainedAt: Date;
  lastUsedAt: Date;
  dataPoints: number;
  features: string[];
  hyperparameters: Record<string, unknown>;
  metrics: ModelMetrics;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  confusionMatrix: number[][];
  featureImportance: { feature: string; importance: number }[];
}

export interface TrainingJob {
  id: string;
  modelId: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt?: Date;
  completedAt?: Date;
  progress: number;
  dataPoints: number;
  epochs: number;
  currentEpoch: number;
  metrics?: ModelMetrics;
  error?: string;
}

// ============================================================================
// RESUME PARSER TYPES
// ============================================================================

export interface ResumeData {
  id: string;
  fileName?: string;
  contact: {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    location?: string;
  };
  summary?: string;
  skills: {
    technical: Array<{
      name: string;
      level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
      yearsOfExperience?: number;
    }>;
    soft: Array<{ name: string; level: string }>;
    domain: Array<{ name: string; level: string }>;
    languages: Array<{ name: string; level: string }>;
    tools: Array<{ name: string; level: string }>;
  };
  experience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    location?: string;
    description?: string;
    achievements: string[];
    durationMonths: number;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    graduationYear?: number;
    gpa?: number;
  }>;
  certifications: Array<{
    name: string;
    issuer?: string;
    year?: number;
  }>;
  languages: Array<{
    language: string;
    proficiency: 'BASIC' | 'INTERMEDIATE' | 'PROFESSIONAL' | 'FLUENT' | 'NATIVE';
  }>;
  totalExperienceMonths: number;
  parsedAt: Date;
  confidence: number;
}

export interface CandidateScore {
  candidateId: string;
  overallScore: number;
  breakdown: Record<string, {
    weight: number;
    score: number;
    details: string;
  }>;
  recommendation: 'STRONG_FIT' | 'GOOD_FIT' | 'PARTIAL_FIT' | 'NOT_RECOMMENDED';
  skillGaps: string[];
  strengths: string[];
}

export interface SkillMatch {
  skill: string;
  required: boolean;
  candidateLevel?: string;
  requiredLevel: string;
  match: boolean;
  gap?: string;
}

export interface JobMatch {
  jobId: string;
  jobTitle: string;
  department: string;
  matchScore: number;
  recommendation: 'STRONG_FIT' | 'GOOD_FIT' | 'PARTIAL_FIT' | 'NOT_RECOMMENDED';
  keyMatches: string[];
  gaps: string[];
}

// ============================================================================
// PERFORMANCE PREDICTION TYPES (Extended)
// ============================================================================

export interface EmployeePerformanceData {
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  tenureMonths?: number;
  performanceHistory: Array<{
    period: string;
    rating: number;
    date: Date;
  }>;
  goals: Array<{
    id: string;
    title: string;
    status: 'NOT_STARTED' | 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED';
    progress: number;
    dueDate: string;
  }>;
  skillAssessments: Array<{
    skillName: string;
    score: number;
    targetScore?: number;
    date: Date;
  }>;
  attendanceData?: {
    attendanceRate: number;
    punctualityRate: number;
    unexcusedAbsences: number;
  };
  collaborationScore?: number;
  qualityMetrics?: {
    overallScore: number;
    errorRate?: number;
    completionRate?: number;
  };
  initiativeScore?: number;
  feedbackScores?: {
    manager?: number;
    peers?: number;
    directReports?: number;
    self?: number;
  };
}

export interface GoalPrediction {
  goalId: string;
  currentProgress: number;
  targetProgress: number;
  completionLikelihood: number;
  predictedCompletionDate?: Date;
  isOnTrack: boolean;
  risks: string[];
  recommendations: string[];
}

export interface DevelopmentRecommendation {
  type: 'TRAINING' | 'GOAL_ADJUSTMENT' | 'BEHAVIORAL' | 'ASSIGNMENT' | 'MENTORING';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  suggestedActions: string[];
  estimatedDuration: string;
}

// ============================================================================
// WORKFORCE PLANNING TYPES (Extended)
// ============================================================================

export interface WorkforcePlanningData {
  tenantId: string;
  currentHeadcount: number;
  industry?: string;
  departments: Array<{
    id: string;
    name: string;
    type?: string;
    currentCount: number;
    historicalAttrition?: number;
    historicalGrowth?: number;
  }>;
  employees: Array<{
    id: string;
    name: string;
    departmentId: string;
    position: string;
    tenureMonths?: number;
    age?: number;
    gender?: string;
    nationality?: string;
    isLeader?: boolean;
    attritionRisk?: 'LOW' | 'MEDIUM' | 'HIGH';
    performanceRating?: number;
    leadershipScore?: number;
    skills: Array<{
      name: string;
      level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
      proficiency: number;
    }>;
  }>;
  criticalRoles?: Array<{
    id: string;
    title: string;
    department: string;
    criticality?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    incumbentId?: string;
    requiredSkills?: string[];
    minimumExperience?: number;
  }>;
  strategicGoals?: Array<{
    id: string;
    description: string;
    priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    requiredSkills?: string[];
    headcountNeeded?: number;
  }>;
  avgCostPerHire?: number;
  avgAnnualSalary?: number;
}

export interface HeadcountForecast {
  currentTotal: number;
  forecastedTotal: number;
  netChange: number;
  growthRate: number;
  forecastPeriodMonths: number;
  departmentBreakdown: Array<{
    departmentId: string;
    departmentName: string;
    currentCount: number;
    forecastedCount: number;
    netChange: number;
    hiringNeeded: number;
    expectedAttrition: number;
    monthlyProjection: number[];
    confidence: number;
  }>;
  hiringTimeline: Array<{
    month: string;
    totalHires: number;
    byDepartment: Record<string, number>;
  }>;
  totalHiringNeeded: number;
  totalExpectedAttrition: number;
  budgetImpact: {
    recruitingCosts: number;
    newSalaryCosts: number;
    totalImpact: number;
  };
  assumptions: string[];
  generatedAt: Date;
}

export interface SuccessionPlan {
  totalCriticalRoles: number;
  rolesWithSuccessors: number;
  rolesWithoutSuccessors: number;
  averageBenchStrength: number;
  highRiskRoles: number;
  roleAnalysis: Array<{
    roleId: string;
    roleTitle: string;
    department: string;
    criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    incumbent?: {
      id: string;
      name: string;
      tenure: number;
      retirementRisk: 'HIGH' | 'MEDIUM' | 'LOW';
      flightRisk: 'HIGH' | 'MEDIUM' | 'LOW';
    };
    successors: Array<{
      employeeId: string;
      employeeName: string;
      currentRole: string;
      readinessScore: number;
      readinessLevel: 'READY_NOW' | 'READY_1_YEAR' | 'READY_2_YEARS' | 'DEVELOPING';
      developmentNeeds: string[];
      timeToReady: string;
    }>;
    benchStrength: number;
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    recommendations: string[];
  }>;
  overallReadiness: number;
  recommendations: string[];
  analyzedAt: Date;
}

export interface DiversityMetrics {
  totalEmployees: number;
  genderDistribution: Record<string, number>;
  ageDistribution: Record<string, number>;
  nationalityDistribution: Record<string, number>;
  leadershipDiversity: Record<string, number>;
  departmentBreakdown: Array<{
    departmentId: string;
    departmentName: string;
    totalCount: number;
    genderDistribution: Record<string, number>;
    diversityScore: number;
  }>;
  overallDiversityScore: number;
  gaps: string[];
  recommendations: string[];
  analyzedAt: Date;
}

// ============================================================================
// SENTIMENT ANALYSIS TYPES (Extended)
// ============================================================================

export interface SentimentResult {
  text: string;
  sentiment: 'POSITIVE' | 'SLIGHTLY_POSITIVE' | 'NEUTRAL' | 'SLIGHTLY_NEGATIVE' | 'NEGATIVE';
  score: number;
  normalizedScore: number;
  confidence: number;
  sentimentWords: {
    positive: Array<{ word: string; score: number }>;
    negative: Array<{ word: string; score: number }>;
    neutral: Array<{ word: string; score: number }>;
  };
  topics: string[];
  keyPhrases: string[];
  context: 'SURVEY' | 'FEEDBACK' | 'REVIEW' | 'GENERAL';
  analyzedAt: Date;
}

export interface SurveyAnalysis {
  surveyId: string;
  surveyType: string;
  responseCount: number;
  textResponseCount: number;
  numericResponseCount: number;
  overallScore: number;
  overallSentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  categoryScores: Record<string, number>;
  themes: Array<{
    topic: string;
    count: number;
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  }>;
  highlights: string[];
  concerns: string[];
  recommendations: string[];
  analyzedAt: Date;
}

export interface EngagementInsight {
  currentScore: number;
  previousScore: number;
  change: number;
  changePercentage: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  categoryTrends: Record<string, 'IMPROVING' | 'STABLE' | 'DECLINING'>;
  surveyCount: number;
  averageResponseRate: number;
  predictedNextScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  insights: string[];
  recommendations: string[];
  analyzedAt: Date;
}

export interface TopicExtraction {
  totalTexts: number;
  uniqueTopics: number;
  topics: Array<{
    topic: string;
    count: number;
    percentage: number;
    averageSentiment: number;
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  }>;
  topPositive: Array<{
    topic: string;
    count: number;
    percentage: number;
    averageSentiment: number;
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  }>;
  topNegative: Array<{
    topic: string;
    count: number;
    percentage: number;
    averageSentiment: number;
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  }>;
  analyzedAt: Date;
}
