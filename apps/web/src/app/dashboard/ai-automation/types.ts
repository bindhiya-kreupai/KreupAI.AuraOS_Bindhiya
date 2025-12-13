// AI Automation Module - Comprehensive Type Definitions

// ============================================================================
// COMMON TYPES
// ============================================================================

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'failed';
export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'very_high';

// ============================================================================
// ORG HEALTH PREDICTOR TYPES
// ============================================================================

export interface OrgHealthPrediction {
  predictionId: string;
  predictionDate: Date;

  // Overall Health
  overallHealthScore: number; // 0-100
  healthTrend: 'improving' | 'stable' | 'declining';
  confidenceLevel: ConfidenceLevel;

  // Dimension Scores
  dimensionScores: HealthDimension[];

  // Risk Areas
  riskAreas: RiskArea[];

  // Predictions
  predictions: {
    threeMonthOutlook: HealthOutlook;
    sixMonthOutlook: HealthOutlook;
    twelveMonthOutlook: HealthOutlook;
  };

  // Recommendations
  recommendations: HealthRecommendation[];

  // Data Sources
  dataSources: string[];
  modelVersion: string;

  createdDate: Date;
}

export interface HealthDimension {
  dimensionId: string;
  dimensionName: string;
  score: number; // 0-100
  trend: 'up' | 'stable' | 'down';
  indicators: HealthIndicator[];
}

export interface HealthIndicator {
  indicatorName: string;
  currentValue: number;
  benchmarkValue: number;
  variance: number;
  status: 'good' | 'warning' | 'critical';
}

export interface RiskArea {
  riskId: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-100
  impact: number; // 0-100
  affectedDepartments: string[];
  affectedEmployeeCount: number;
  mitigationSuggestions: string[];
}

export interface HealthOutlook {
  projectedScore: number;
  confidenceInterval: { lower: number; upper: number };
  keyDrivers: string[];
  scenarioAnalysis: {
    bestCase: number;
    worstCase: number;
    mostLikely: number;
  };
}

export interface HealthRecommendation {
  recommendationId: string;
  priority: Priority;
  category: string;
  recommendation: string;
  expectedImpact: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  timeline: string;
  stakeholders: string[];
}

// ============================================================================
// AI COACHING BOT TYPES
// ============================================================================

export interface CoachingSession {
  sessionId: string;
  employeeId: string;
  employeeName: string;

  // Session Details
  sessionType: 'career' | 'performance' | 'skill_development' | 'wellbeing' | 'general';
  startTime: Date;
  endTime?: Date;
  duration?: number; // minutes

  // Conversation
  messages: CoachingMessage[];

  // Analysis
  sentimentAnalysis: SentimentAnalysis;
  topics: string[];
  keyInsights: string[];

  // Recommendations
  actionItems: ActionItem[];
  resources: Resource[];

  // Follow-up
  followUpScheduled: boolean;
  followUpDate?: Date;

  // Metrics
  satisfactionRating?: number;
  helpfulnessRating?: number;

  status: 'active' | 'completed' | 'cancelled';
  createdDate: Date;
}

export interface CoachingMessage {
  messageId: string;
  sender: 'user' | 'bot';
  message: string;
  timestamp: Date;
  intent?: string;
  entities?: { [key: string]: string };
}

export interface SentimentAnalysis {
  overallSentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // -1 to 1
  emotionalTone: string[];
  concernLevel: 'low' | 'medium' | 'high';
}

export interface ActionItem {
  actionId: string;
  description: string;
  category: string;
  priority: Priority;
  dueDate?: Date;
  completed: boolean;
}

export interface Resource {
  resourceId: string;
  resourceType: 'article' | 'video' | 'course' | 'tool' | 'document';
  title: string;
  description: string;
  url?: string;
  relevanceScore: number;
}

// ============================================================================
// WORKFLOW GENERATOR TYPES
// ============================================================================

export interface GeneratedWorkflow {
  workflowId: string;
  workflowName: string;

  // Generation Details
  generatedFrom: 'description' | 'template' | 'existing_process' | 'ai_suggestion';
  sourceInput: string;
  generatedDate: Date;

  // Workflow Structure
  steps: WorkflowStep[];
  totalSteps: number;
  estimatedDuration: number; // minutes

  // Logic
  conditions: WorkflowCondition[];
  branches: WorkflowBranch[];

  // Approvals
  approvalNodes: ApprovalNode[];

  // Integration
  integrations: WorkflowIntegration[];

  // AI Metadata
  confidenceScore: number;
  alternativeWorkflows: string[];

  // Status
  status: 'draft' | 'review' | 'approved' | 'active' | 'archived';
  deployedDate?: Date;

  // Performance
  executionCount?: number;
  averageCompletionTime?: number;
  successRate?: number;

  createdDate: Date;
  lastModifiedDate: Date;
}

export interface WorkflowStep {
  stepId: string;
  stepNumber: number;
  stepName: string;
  stepType: 'action' | 'approval' | 'notification' | 'integration' | 'condition';
  description: string;
  assignedRole?: string;
  estimatedDuration: number;
  required: boolean;
  automatable: boolean;
  automationConfidence?: number;
}

export interface WorkflowCondition {
  conditionId: string;
  field: string;
  operator: string;
  value: any;
  nextStepIfTrue: string;
  nextStepIfFalse: string;
}

export interface WorkflowBranch {
  branchId: string;
  branchName: string;
  condition: string;
  steps: string[]; // Step IDs
}

export interface ApprovalNode {
  nodeId: string;
  approverRole: string;
  approvalType: 'single' | 'all' | 'majority';
  timeoutDays: number;
  escalationPath: string[];
}

export interface WorkflowIntegration {
  integrationId: string;
  system: string;
  action: string;
  parameters: { [key: string]: any };
  errorHandling: string;
}

// ============================================================================
// RESUME SCREENING TYPES
// ============================================================================

export interface ResumeScreening {
  screeningId: string;
  jobId: string;
  jobTitle: string;

  // Candidate
  candidateId: string;
  candidateName: string;
  resumeUrl: string;

  // Screening Results
  overallScore: number; // 0-100
  overallRanking: number;
  recommendation: 'strong_match' | 'good_match' | 'moderate_match' | 'weak_match' | 'no_match';

  // Detailed Analysis
  skillsMatch: SkillsMatch;
  experienceMatch: ExperienceMatch;
  educationMatch: EducationMatch;
  cultureFitScore: number;

  // Extracted Information
  extractedData: ExtractedResumeData;

  // Red Flags & Positives
  redFlags: string[];
  strengths: string[];

  // Interview Recommendation
  interviewRecommended: boolean;
  interviewType?: 'phone' | 'technical' | 'behavioral' | 'final';
  suggestedInterviewers: string[];
  interviewFocusAreas: string[];

  // AI Metadata
  modelVersion: string;
  confidenceLevel: ConfidenceLevel;
  processingTime: number; // milliseconds

  screeningDate: Date;
  reviewedByHuman: boolean;
  humanReviewDate?: Date;
  humanReviewNotes?: string;
}

export interface SkillsMatch {
  requiredSkills: SkillMatch[];
  preferredSkills: SkillMatch[];
  additionalSkills: string[];
  overallMatchPercentage: number;
  topMatchingSkills: string[];
  missingCriticalSkills: string[];
}

export interface SkillMatch {
  skillName: string;
  required: boolean;
  found: boolean;
  proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
  matchScore: number;
}

export interface ExperienceMatch {
  totalYearsRequired: number;
  totalYearsFound: number;
  relevantExperienceYears: number;
  industryMatch: boolean;
  seniorityMatch: boolean;
  careerProgression: 'excellent' | 'good' | 'moderate' | 'poor';
  relevantCompanies: string[];
}

export interface EducationMatch {
  degreeRequired: string;
  degreeFound: string;
  degreeMismatch: boolean;
  institutions: string[];
  certifications: string[];
  continualLearning: boolean;
}

export interface ExtractedResumeData {
  contactInfo: {
    email?: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    portfolio?: string;
  };
  summary: string;
  workHistory: WorkHistoryEntry[];
  education: EducationEntry[];
  skills: string[];
  certifications: string[];
  languages: string[];
  achievements: string[];
}

export interface WorkHistoryEntry {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  duration: string;
  responsibilities: string[];
  achievements: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  graduationYear: string;
  gpa?: string;
  honors?: string[];
}

// ============================================================================
// ATTRITION PREDICTION TYPES
// ============================================================================

export interface AttritionPrediction {
  predictionId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;

  // Prediction
  attritionRisk: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  attritionProbability: number; // 0-100
  predictedTimeframe: '1_month' | '3_months' | '6_months' | '12_months';
  confidenceLevel: ConfidenceLevel;

  // Risk Factors
  riskFactors: RiskFactor[];
  topRiskFactors: string[];

  // Employee Metrics
  employeeMetrics: {
    tenure: number;
    performanceRating: number;
    engagementScore: number;
    satisfactionScore: number;
    lastPromotionMonths: number;
    compensationPercentile: number;
    workloadScore: number;
    managerRelationshipScore: number;
  };

  // Retention Recommendations
  retentionStrategies: RetentionStrategy[];

  // Historical Patterns
  similarCases: number;
  actualAttritionRate: number;

  // Monitoring
  lastUpdated: Date;
  nextReviewDate: Date;
  alertsEnabled: boolean;

  predictionDate: Date;
  modelVersion: string;
}

export interface RiskFactor {
  factorName: string;
  category: 'compensation' | 'engagement' | 'career' | 'workload' | 'relationship' | 'external';
  impact: number; // 0-100
  trend: 'increasing' | 'stable' | 'decreasing';
  description: string;
  dataPoints: string[];
}

export interface RetentionStrategy {
  strategyId: string;
  strategyName: string;
  category: string;
  description: string;
  priority: Priority;
  estimatedImpact: number; // reduction in attrition probability
  estimatedCost: number;
  timeline: string;
  owner: string;
  status: 'proposed' | 'approved' | 'in_progress' | 'completed';
}

// ============================================================================
// LEAVE FORECASTING TYPES
// ============================================================================

export interface LeaveForecast {
  forecastId: string;
  forecastPeriod: {
    startDate: Date;
    endDate: Date;
  };

  // Department/Team Level
  department?: string;
  team?: string;
  totalEmployees: number;

  // Forecast
  predictedLeaveRequests: PredictedLeave[];
  totalPredictedDays: number;

  // By Leave Type
  forecastByType: { leaveType: string; predictedDays: number; confidence: number }[];

  // Peak Periods
  peakPeriods: PeakLeavePeriod[];

  // Staffing Impact
  staffingImpact: StaffingImpact[];

  // Recommendations
  recommendations: ForecastRecommendation[];

  // Accuracy Metrics
  modelAccuracy?: number;
  historicalComparison?: {
    previousPeriod: number;
    variance: number;
  };

  generatedDate: Date;
  modelVersion: string;
}

export interface PredictedLeave {
  employeeId: string;
  employeeName: string;
  leaveType: string;
  predictedStartDate: Date;
  predictedEndDate: Date;
  predictedDays: number;
  probability: number; // 0-100
  confidence: ConfidenceLevel;
  reasoning: string[];
}

export interface PeakLeavePeriod {
  periodName: string;
  startDate: Date;
  endDate: Date;
  predictedAbsentees: number;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  affectedFunctions: string[];
}

export interface StaffingImpact {
  date: Date;
  availableStaff: number;
  requiredStaff: number;
  shortage: number;
  surplusCapacity: number;
  criticalRoles: string[];
}

export interface ForecastRecommendation {
  recommendation: string;
  category: 'staffing' | 'scheduling' | 'policy' | 'communication';
  priority: Priority;
  actionBy: Date;
}

// ============================================================================
// ANOMALY DETECTION TYPES
// ============================================================================

export interface DetectedAnomaly {
  anomalyId: string;

  // Detection
  detectedDate: Date;
  category: 'attendance' | 'performance' | 'expense' | 'timesheet' | 'behavior' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';

  // Details
  anomalyType: string;
  description: string;

  // Affected Entity
  entityType: 'employee' | 'department' | 'system' | 'process';
  entityId: string;
  entityName: string;

  // Metrics
  expectedValue: number;
  actualValue: number;
  deviation: number;
  deviationPercentage: number;
  anomalyScore: number; // 0-100

  // Pattern Analysis
  pattern: string;
  frequency: 'one_time' | 'recurring' | 'trending';
  relatedAnomalies: string[];

  // Impact
  potentialImpact: string;
  affectedProcesses: string[];
  estimatedCost?: number;

  // Investigation
  investigationNotes?: string;
  assignedTo?: string;
  rootCause?: string;
  correctiveActions?: string[];

  // Resolution
  resolvedDate?: Date;
  resolution?: string;

  modelVersion: string;
  confidenceLevel: ConfidenceLevel;
}

// ============================================================================
// CHATBOT TYPES
// ============================================================================

export interface ChatbotConversation {
  conversationId: string;
  employeeId: string;
  employeeName: string;

  // Conversation
  messages: ChatMessage[];
  startTime: Date;
  endTime?: Date;
  duration?: number;

  // Intent Analysis
  primaryIntent: string;
  allIntents: string[];

  // Resolution
  resolved: boolean;
  resolutionType?: 'answered' | 'escalated' | 'self_service' | 'abandoned';
  escalatedTo?: string;

  // Satisfaction
  satisfactionRating?: number;
  feedbackText?: string;

  // Analytics
  messageCount: number;
  averageResponseTime: number;

  status: 'active' | 'completed';
  createdDate: Date;
}

export interface ChatMessage {
  messageId: string;
  sender: 'user' | 'bot';
  message: string;
  timestamp: Date;

  // AI Analysis
  intent?: string;
  entities?: { [key: string]: string };
  sentiment?: 'positive' | 'neutral' | 'negative';
  confidence?: number;

  // Actions
  suggestedActions?: string[];
  quickReplies?: string[];

  // Resources
  attachedResources?: Resource[];
}

// ============================================================================
// INTERVIEW SCHEDULING TYPES
// ============================================================================

export interface InterviewSchedule {
  scheduleId: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;

  // Scheduling
  interviewType: 'phone' | 'video' | 'in_person' | 'technical' | 'panel';
  interviewRound: number;

  // Proposed Times
  proposedSlots: TimeSlot[];
  selectedSlot?: TimeSlot;

  // Participants
  interviewers: Interviewer[];

  // Logistics
  location?: string;
  meetingLink?: string;
  meetingRoom?: string;
  duration: number; // minutes

  // AI Optimization
  optimizationScore: number;
  conflictsResolved: number;
  preferenceScore: number;

  // Status
  status: 'proposing' | 'confirmed' | 'rescheduling' | 'completed' | 'cancelled';
  confirmationSent: boolean;
  remindersSent: number;

  scheduledDate: Date;
  createdDate: Date;
}

export interface TimeSlot {
  slotId: string;
  startTime: Date;
  endTime: Date;
  availabilityScore: number; // How many interviewers are available
  preferenceScore: number; // How well it matches preferences
  conflictCount: number;
  timezone: string;
}

export interface Interviewer {
  interviewerId: string;
  interviewerName: string;
  role: string;
  availability: TimeSlot[];
  preferences: {
    preferredDays: string[];
    preferredTimes: string[];
    blackoutDates: Date[];
  };
  isRequired: boolean;
}

// ============================================================================
// ADDITIONAL FEATURE TYPES (Performance Analysis, L&D, Job Matching, etc.)
// ============================================================================

export interface PerformanceAnalysis {
  analysisId: string;
  employeeId: string;
  employeeName: string;
  analysisDate: Date;

  // Scores
  overallScore: number;
  trendAnalysis: 'improving' | 'stable' | 'declining';

  // Predictions
  predictedNextReview: number;
  careerTrajectory: 'high_performer' | 'solid_performer' | 'needs_improvement' | 'at_risk';

  // Insights
  strengths: string[];
  developmentAreas: string[];
  recommendations: string[];

  confidenceLevel: ConfidenceLevel;
}

export interface LDRecommendation {
  recommendationId: string;
  employeeId: string;
  employeeName: string;

  // Recommendations
  recommendedCourses: Course[];
  skillGaps: string[];
  careerPath: string[];

  priority: Priority;
  generatedDate: Date;
}

export interface Course {
  courseId: string;
  courseTitle: string;
  provider: string;
  duration: string;
  relevanceScore: number;
  skillsCovered: string[];
  url?: string;
}

export interface JobMatch {
  matchId: string;
  employeeId: string;
  employeeName: string;
  jobId: string;
  jobTitle: string;

  // Matching
  matchScore: number; // 0-100
  matchReason: string[];
  skillsMatch: number;
  experienceMatch: number;
  cultureFitScore: number;

  // Recommendation
  recommended: boolean;
  priority: Priority;

  generatedDate: Date;
}

export interface EmailParsing {
  parsingId: string;
  emailId: string;
  subject: string;
  sender: string;

  // Parsing Results
  category: string;
  intent: string;
  priority: Priority;
  actionRequired: boolean;
  extractedData: { [key: string]: any };

  // Routing
  suggestedDepartment: string;
  suggestedAssignee: string;

  confidenceLevel: ConfidenceLevel;
  parsedDate: Date;
}

export interface AutoAccrual {
  accrualId: string;
  employeeId: string;
  employeeName: string;

  // Accrual
  accrualType: 'leave' | 'pto' | 'sick' | 'vacation';
  accrualAmount: number;
  accrualDate: Date;

  // Calculation
  calculationMethod: string;
  baseAmount: number;
  adjustments: { reason: string; amount: number }[];

  // Status
  status: 'calculated' | 'approved' | 'applied';
  appliedDate?: Date;

  modelVersion: string;
}

export interface NLPInsight {
  insightId: string;

  // Source
  sourceType: 'survey' | 'review' | 'feedback' | 'comment' | 'email';
  sourceId: string;
  text: string;

  // Analysis
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  topics: string[];
  keywords: string[];
  entities: { [key: string]: string };

  // Insights
  category: string;
  theme: string;
  actionableInsight: string;
  priority: Priority;

  // Metadata
  language: string;
  processingDate: Date;
  modelVersion: string;
}

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export interface AIAutomationSettings {
  settingsId: string;

  // Model Configuration
  modelSettings: {
    enableAutoRetraining: boolean;
    retrainingFrequency: 'weekly' | 'monthly' | 'quarterly';
    minimumConfidenceThreshold: number;
    enableExplainability: boolean;
  };

  // Feature Toggles
  features: {
    orgHealthPredictor: boolean;
    aiCoachingBot: boolean;
    workflowGenerator: boolean;
    resumeScreening: boolean;
    attritionPrediction: boolean;
    leaveForecasting: boolean;
    anomalyDetection: boolean;
    chatbot: boolean;
    interviewScheduling: boolean;
    performanceAnalysis: boolean;
    ldRecommendation: boolean;
    jobMatching: boolean;
    emailParsing: boolean;
    autoAccruals: boolean;
    nlpInsights: boolean;
  };

  // Notification Settings
  notifications: {
    enableAlerts: boolean;
    alertThresholds: { [key: string]: number };
    notificationChannels: string[];
  };

  lastUpdatedDate: Date;
  lastUpdatedBy: string;
  lastUpdatedByName: string;
}

// ============================================================================
// TOAST NOTIFICATION TYPE
// ============================================================================

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
