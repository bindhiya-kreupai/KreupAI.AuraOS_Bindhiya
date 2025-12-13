/**
 * DEI (Diversity, Equity & Inclusion) Module Type Definitions
 * Covers: Diversity Metrics, Inclusion Survey, Pay Equity Analysis, Bias Training,
 * ERG Management, Mentorship Program, Accessibility, DEI Goals
 */

// ============================================================================
// 1. DIVERSITY METRICS
// ============================================================================

export interface DiversityMetric {
  metricId: string;
  metricType: DiversityMetricType;
  metricName: string;
  description?: string;
  category: DiversityCategory;
  dimensions: DiversityDimension[];
  reportingPeriod: ReportingPeriod;
  calculationMethod: 'count' | 'percentage' | 'ratio' | 'index';
  targetValue?: number;
  currentValue: number;
  previousValue?: number;
  trend: 'improving' | 'declining' | 'stable';
  lastCalculated: string;
  nextCalculation: string;
  status: 'active' | 'inactive';
  visibility: 'public' | 'internal' | 'restricted';
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export type DiversityMetricType =
  | 'representation'
  | 'hiring'
  | 'promotion'
  | 'retention'
  | 'pay_equity'
  | 'leadership_diversity';

export type DiversityCategory =
  | 'gender'
  | 'ethnicity'
  | 'age'
  | 'disability'
  | 'veteran_status'
  | 'lgbtq'
  | 'religion';

export interface DiversityDimension {
  dimension: DiversityCategory;
  breakdown: DemographicBreakdown[];
  total: number;
}

export interface DemographicBreakdown {
  category: string;
  count: number;
  percentage: number;
  target?: number;
  variance?: number;
}

export interface ReportingPeriod {
  startDate: string;
  endDate: string;
  frequency: 'monthly' | 'quarterly' | 'annual';
}

export interface DiversityDashboard {
  dashboardId: string;
  dashboardName: string;
  description?: string;
  widgets: DiversityWidget[];
  filters: DashboardFilter[];
  refreshFrequency: 'realtime' | 'daily' | 'weekly' | 'monthly';
  lastRefreshed: string;
  isDefault: boolean;
  createdAt: string;
  createdBy: string;
}

export interface DiversityWidget {
  widgetId: string;
  widgetType: 'chart' | 'table' | 'scorecard' | 'heatmap' | 'funnel';
  title: string;
  metricIds: string[];
  chartType?: 'bar' | 'pie' | 'line' | 'donut' | 'stacked_bar';
  position: { x: number; y: number; width: number; height: number };
  config: Record<string, any>;
}

export interface DashboardFilter {
  field: string;
  operator: 'equals' | 'in' | 'between' | 'greater_than' | 'less_than';
  value: any;
}

export interface DiversityReport {
  reportId: string;
  reportName: string;
  reportType: 'standard' | 'custom' | 'regulatory' | 'board';
  period: ReportingPeriod;
  metrics: DiversityMetric[];
  insights: DiversityInsight[];
  recommendations: string[];
  status: 'draft' | 'published' | 'archived';
  generatedDate: string;
  generatedBy: string;
  approvedBy?: string;
  approvalDate?: string;
}

export interface DiversityInsight {
  insightId: string;
  category: string;
  finding: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  dataPoints: any[];
}

// ============================================================================
// 2. INCLUSION SURVEY
// ============================================================================

export interface InclusionSurvey {
  surveyId: string;
  surveyName: string;
  description: string;
  surveyType: 'inclusion' | 'pulse' | 'engagement' | 'belonging' | 'exit';
  questions: SurveyQuestion[];
  targetAudience: SurveyAudience;
  schedule: SurveySchedule;
  anonymity: 'anonymous' | 'confidential' | 'identified';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  responseRate: number;
  targetResponses: number;
  actualResponses: number;
  launchedDate?: string;
  closedDate?: string;
  createdAt: string;
  createdBy: string;
}

export interface SurveyQuestion {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  category: SurveyCategory;
  isRequired: boolean;
  options?: SurveyOption[];
  scale?: SurveyScale;
  order: number;
  conditional?: QuestionConditional;
}

export type QuestionType =
  | 'multiple_choice'
  | 'rating_scale'
  | 'text'
  | 'ranking'
  | 'matrix'
  | 'yes_no';

export type SurveyCategory =
  | 'belonging'
  | 'fairness'
  | 'voice'
  | 'psychological_safety'
  | 'career_growth'
  | 'leadership_commitment';

export interface SurveyOption {
  optionId: string;
  text: string;
  value: number | string;
  order: number;
}

export interface SurveyScale {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  step: number;
}

export interface QuestionConditional {
  dependsOn: string; // questionId
  showIf: any; // value to match
}

export interface SurveyAudience {
  audienceType: 'all' | 'department' | 'location' | 'level' | 'custom';
  filters?: {
    departments?: string[];
    locations?: string[];
    levels?: string[];
    employeeIds?: string[];
  };
  estimatedSize: number;
}

export interface SurveySchedule {
  launchDate: string;
  closeDate: string;
  reminders: SurveyReminder[];
  recurrence?: 'one_time' | 'monthly' | 'quarterly' | 'annual';
}

export interface SurveyReminder {
  reminderDate: string;
  reminderType: 'initial' | 'first_reminder' | 'final_reminder';
  sent: boolean;
}

export interface SurveyResponse {
  responseId: string;
  surveyId: string;
  respondentId?: string; // null if anonymous
  respondentDemographics?: RespondentDemographics;
  answers: SurveyAnswer[];
  completionStatus: 'complete' | 'partial' | 'abandoned';
  startedAt: string;
  completedAt?: string;
  timeSpent: number; // in seconds
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

export interface RespondentDemographics {
  department?: string;
  location?: string;
  level?: string;
  tenure?: string;
  gender?: string;
  ethnicity?: string;
  ageRange?: string;
}

export interface SurveyAnswer {
  questionId: string;
  answer: any;
  skipped: boolean;
}

export interface SurveyAnalytics {
  surveyId: string;
  overallScore: number;
  categoryScores: CategoryScore[];
  demographicBreakdown: DemographicAnalysis[];
  sentimentAnalysis: SentimentAnalysis;
  keyThemes: Theme[];
  actionableInsights: string[];
  benchmarks?: BenchmarkComparison;
}

export interface CategoryScore {
  category: SurveyCategory;
  score: number;
  responseCount: number;
  trend?: 'up' | 'down' | 'stable';
  previousScore?: number;
}

export interface DemographicAnalysis {
  dimension: DiversityCategory;
  groups: GroupScore[];
  significantDifferences: string[];
}

export interface GroupScore {
  group: string;
  score: number;
  responseCount: number;
  variance: number;
}

export interface SentimentAnalysis {
  positive: number;
  neutral: number;
  negative: number;
  textResponses: number;
  commonWords: WordFrequency[];
}

export interface WordFrequency {
  word: string;
  count: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface Theme {
  themeId: string;
  themeName: string;
  frequency: number;
  sentiment: 'positive' | 'negative' | 'mixed';
  relatedQuestions: string[];
  examples: string[];
}

export interface BenchmarkComparison {
  industryAverage?: number;
  companySize?: number;
  topQuartile?: number;
  position: 'above' | 'at' | 'below';
}

// ============================================================================
// 3. PAY EQUITY ANALYSIS
// ============================================================================

export interface PayEquityAnalysis {
  analysisId: string;
  analysisName: string;
  description?: string;
  analysisType: 'gender' | 'ethnicity' | 'comprehensive' | 'regression';
  scope: AnalysisScope;
  period: ReportingPeriod;
  methodology: AnalysisMethodology;
  results: EquityResults;
  gaps: PayGap[];
  recommendations: EquityRecommendation[];
  status: 'in_progress' | 'completed' | 'reviewed' | 'published';
  confidentialityLevel: 'high' | 'medium' | 'low';
  runDate: string;
  runBy: string;
  reviewedBy?: string;
  reviewDate?: string;
  createdAt: string;
}

export interface AnalysisScope {
  scopeType: 'all_employees' | 'department' | 'location' | 'job_family' | 'custom';
  filters?: {
    departments?: string[];
    locations?: string[];
    jobFamilies?: string[];
    levels?: string[];
  };
  employeeCount: number;
  excludeExecutives?: boolean;
  excludeCommission?: boolean;
}

export interface AnalysisMethodology {
  method: 'comparison' | 'regression' | 'blended';
  variables: CompensationVariable[];
  controlFactors: string[];
  statisticalThreshold: number; // e.g., 0.05 for 5%
}

export interface CompensationVariable {
  variable: string;
  weight: number;
  included: boolean;
}

export interface EquityResults {
  overallGap: number; // percentage
  adjustedGap: number; // after controlling for legitimate factors
  medianGap: number;
  meanGap: number;
  statisticalSignificance: number; // p-value
  confidenceLevel: number;
  affectedEmployees: number;
  totalEmployees: number;
}

export interface PayGap {
  gapId: string;
  dimension: DiversityCategory;
  comparisonGroup: string;
  baselineGroup: string;
  rawGap: number;
  adjustedGap: number;
  medianDifference: number;
  affectedCount: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  jobLevel?: string;
  department?: string;
  location?: string;
}

export interface EquityRecommendation {
  recommendationId: string;
  priority: 'high' | 'medium' | 'low';
  category: 'immediate_adjustment' | 'policy_change' | 'process_improvement' | 'monitoring';
  description: string;
  affectedEmployees: string[];
  estimatedCost?: number;
  timeline: string;
  owner?: string;
  status: 'proposed' | 'approved' | 'in_progress' | 'completed' | 'rejected';
}

export interface PayAdjustment {
  adjustmentId: string;
  analysisId: string;
  employeeId: string;
  employeeName: string;
  currentSalary: number;
  recommendedSalary: number;
  adjustmentAmount: number;
  adjustmentPercentage: number;
  reason: string;
  effectiveDate: string;
  status: 'proposed' | 'approved' | 'rejected' | 'implemented';
  approvedBy?: string;
  approvalDate?: string;
  implementedDate?: string;
}

// ============================================================================
// 4. BIAS TRAINING
// ============================================================================

export interface BiasTraining {
  trainingId: string;
  trainingName: string;
  description: string;
  trainingType: BiasTrainingType;
  format: 'online' | 'instructor_led' | 'workshop' | 'microlearning' | 'blended';
  duration: number; // in minutes
  modules: TrainingModule[];
  targetAudience: TrainingAudience;
  isRequired: boolean;
  completionCriteria: CompletionCriteria;
  certification?: CertificationConfig;
  status: 'draft' | 'active' | 'archived';
  enrollmentCount: number;
  completionRate: number;
  averageScore?: number;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

export type BiasTrainingType =
  | 'unconscious_bias'
  | 'inclusive_hiring'
  | 'inclusive_leadership'
  | 'microaggressions'
  | 'ally_training'
  | 'cultural_competence';

export interface TrainingModule {
  moduleId: string;
  moduleName: string;
  description: string;
  content: ModuleContent[];
  duration: number;
  order: number;
  isRequired: boolean;
  passingScore?: number;
}

export interface ModuleContent {
  contentId: string;
  contentType: 'video' | 'article' | 'quiz' | 'scenario' | 'discussion' | 'reflection';
  title: string;
  description?: string;
  url?: string;
  duration?: number;
  order: number;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  questionId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

export interface TrainingAudience {
  audienceType: 'all' | 'managers' | 'recruiters' | 'executives' | 'custom';
  filters?: {
    departments?: string[];
    levels?: string[];
    roles?: string[];
  };
  estimatedSize: number;
}

export interface CompletionCriteria {
  requireAllModules: boolean;
  minimumScore?: number;
  timeRequirement?: number;
  practiceScenarios?: number;
}

export interface CertificationConfig {
  certificateName: string;
  validityPeriod?: number; // in months
  renewalRequired: boolean;
  badgeEnabled: boolean;
}

export interface TrainingEnrollment {
  enrollmentId: string;
  trainingId: string;
  employeeId: string;
  employeeName: string;
  enrollmentDate: string;
  dueDate?: string;
  startedDate?: string;
  completedDate?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  progress: number; // percentage
  score?: number;
  attempts: number;
  timeSpent: number; // in minutes
  certificateIssued?: boolean;
  certificateIssuedDate?: string;
}

export interface TrainingAnalytics {
  trainingId: string;
  totalEnrollments: number;
  completions: number;
  completionRate: number;
  averageScore: number;
  averageTimeSpent: number;
  modulePerformance: ModulePerformance[];
  demographicBreakdown: TrainingDemographics[];
  impactMetrics: ImpactMetric[];
}

export interface ModulePerformance {
  moduleId: string;
  moduleName: string;
  completionRate: number;
  averageScore: number;
  commonMistakes: string[];
}

export interface TrainingDemographics {
  dimension: string;
  groups: {
    group: string;
    enrollments: number;
    completions: number;
    averageScore: number;
  }[];
}

export interface ImpactMetric {
  metric: string;
  baseline: number;
  current: number;
  improvement: number;
  measurementDate: string;
}

// ============================================================================
// 5. ERG MANAGEMENT (Employee Resource Groups)
// ============================================================================

export interface EmployeeResourceGroup {
  ergId: string;
  ergName: string;
  acronym?: string;
  description: string;
  mission: string;
  focusArea: ERGFocusArea;
  status: 'active' | 'forming' | 'inactive' | 'archived';
  founded: string;
  leadership: ERGLeadership;
  membership: ERGMembership;
  budget?: ERGBudget;
  meetings: ERGMeeting[];
  initiatives: ERGInitiative[];
  achievements: ERGAchievement[];
  sponsorship?: ERGSponsorship;
  visibility: 'open' | 'closed' | 'secret';
  tags: string[];
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

export type ERGFocusArea =
  | 'gender'
  | 'ethnicity'
  | 'lgbtq'
  | 'disability'
  | 'veterans'
  | 'parents'
  | 'young_professionals'
  | 'cross_cultural';

export interface ERGLeadership {
  chair: ERGMember;
  viceChair?: ERGMember;
  secretary?: ERGMember;
  treasurer?: ERGMember;
  advisors: ERGMember[];
  termStart: string;
  termEnd: string;
}

export interface ERGMember {
  employeeId: string;
  employeeName: string;
  role: 'chair' | 'vice_chair' | 'secretary' | 'treasurer' | 'advisor' | 'member';
  joinedDate: string;
  isActive: boolean;
}

export interface ERGMembership {
  totalMembers: number;
  activeMembers: number;
  allies: number;
  pendingRequests: number;
  membershipType: 'open' | 'invitation_only' | 'approval_required';
  membershipFee?: number;
}

export interface ERGBudget {
  fiscalYear: number;
  allocatedAmount: number;
  spentAmount: number;
  availableAmount: number;
  expenses: BudgetExpense[];
  fundingSource: 'company' | 'donations' | 'fundraising' | 'mixed';
}

export interface BudgetExpense {
  expenseId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'paid';
}

export interface ERGMeeting {
  meetingId: string;
  meetingType: 'general' | 'leadership' | 'planning' | 'social' | 'speaker_series';
  title: string;
  description?: string;
  date: string;
  duration: number;
  location: string;
  format: 'in_person' | 'virtual' | 'hybrid';
  attendees: string[];
  agenda?: string[];
  notes?: string;
  recordings?: string[];
  nextSteps?: string[];
}

export interface ERGInitiative {
  initiativeId: string;
  initiativeName: string;
  description: string;
  type: 'event' | 'program' | 'advocacy' | 'community_service' | 'education';
  startDate: string;
  endDate?: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  goals: string[];
  metrics: InitiativeMetric[];
  budget?: number;
  partners?: string[];
  impact?: string;
}

export interface InitiativeMetric {
  metric: string;
  target: number;
  actual: number;
  unit: string;
}

export interface ERGAchievement {
  achievementId: string;
  title: string;
  description: string;
  date: string;
  category: 'award' | 'milestone' | 'impact' | 'recognition';
  visibility: 'internal' | 'external';
}

export interface ERGSponsorship {
  executiveSponsor: {
    employeeId: string;
    name: string;
    title: string;
    since: string;
  };
  supportLevel: 'high' | 'medium' | 'low';
  meetingFrequency: string;
  lastMeeting?: string;
}

// ============================================================================
// 6. MENTORSHIP PROGRAM
// ============================================================================

export interface MentorshipProgram {
  programId: string;
  programName: string;
  description: string;
  programType: 'general' | 'leadership' | 'technical' | 'diversity' | 'career_transition';
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  duration: number; // in months
  matchingCriteria: MatchingCriteria;
  requirements: ProgramRequirements;
  structure: ProgramStructure;
  resources: ProgramResource[];
  metrics: ProgramMetrics;
  enrollment: {
    mentors: number;
    mentees: number;
    activePairs: number;
    completions: number;
  };
  createdAt: string;
  createdBy: string;
}

export interface MatchingCriteria {
  method: 'automatic' | 'manual' | 'self_select' | 'hybrid';
  factors: MatchingFactor[];
  maxMatches: number; // max mentees per mentor
  allowCrossDepartment: boolean;
  allowCrossLocation: boolean;
}

export interface MatchingFactor {
  factor: string;
  weight: number;
  required: boolean;
}

export interface ProgramRequirements {
  mentorCriteria: {
    minTenure?: number;
    minLevel?: string;
    skills?: string[];
    availability?: string;
  };
  menteeCriteria: {
    maxTenure?: number;
    careerStage?: string[];
    goals?: string[];
  };
  commitmentLevel: string;
  meetingFrequency: string;
}

export interface ProgramStructure {
  phases: ProgramPhase[];
  checkpoints: Checkpoint[];
  supportProvided: string[];
}

export interface ProgramPhase {
  phaseId: string;
  phaseName: string;
  description: string;
  duration: number; // in weeks
  activities: string[];
  deliverables: string[];
  order: number;
}

export interface Checkpoint {
  checkpointId: string;
  name: string;
  date: string;
  type: 'survey' | 'review' | 'assessment' | 'feedback';
  required: boolean;
}

export interface ProgramResource {
  resourceId: string;
  resourceType: 'guide' | 'template' | 'video' | 'article' | 'tool';
  title: string;
  description?: string;
  url: string;
  category: string;
}

export interface ProgramMetrics {
  completionRate: number;
  satisfactionScore: number;
  goalAchievementRate: number;
  retentionImprovement: number;
  promotionRate: number;
}

export interface MentorProfile {
  profileId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  jobTitle: string;
  location: string;
  tenure: number;
  expertise: string[];
  interests: string[];
  languages: string[];
  mentoringAreas: string[];
  availability: 'high' | 'medium' | 'low';
  maxMentees: number;
  currentMentees: number;
  pastMentees: number;
  rating?: number;
  bio?: string;
  status: 'available' | 'at_capacity' | 'on_hold' | 'inactive';
  joinedDate: string;
}

export interface MenteeProfile {
  profileId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  jobTitle: string;
  location: string;
  careerStage: 'early' | 'mid' | 'senior' | 'transition';
  goals: CareerGoal[];
  interests: string[];
  preferredMentorTraits: string[];
  availability: string;
  status: 'seeking' | 'matched' | 'completed' | 'inactive';
  joinedDate: string;
}

export interface CareerGoal {
  goalId: string;
  goal: string;
  category: 'skill_development' | 'leadership' | 'career_advancement' | 'work_life_balance' | 'networking';
  priority: 'high' | 'medium' | 'low';
  targetDate?: string;
}

export interface MentorshipPair {
  pairId: string;
  programId: string;
  mentorId: string;
  mentorName: string;
  menteeId: string;
  menteeName: string;
  matchDate: string;
  matchScore?: number;
  status: 'active' | 'paused' | 'completed' | 'terminated';
  endDate?: string;
  endReason?: string;
  meetings: MentorshipMeeting[];
  goals: PairGoal[];
  feedback: PairFeedback[];
  overallRating?: number;
}

export interface MentorshipMeeting {
  meetingId: string;
  date: string;
  duration: number;
  format: 'in_person' | 'video' | 'phone';
  topics: string[];
  notes?: string;
  actionItems?: ActionItem[];
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface ActionItem {
  itemId: string;
  description: string;
  owner: 'mentor' | 'mentee';
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface PairGoal {
  goalId: string;
  goal: string;
  targetDate: string;
  status: 'not_started' | 'in_progress' | 'achieved' | 'deferred';
  progress: number;
  milestones: Milestone[];
}

export interface Milestone {
  milestoneId: string;
  description: string;
  targetDate: string;
  completedDate?: string;
  status: 'pending' | 'completed';
}

export interface PairFeedback {
  feedbackId: string;
  feedbackDate: string;
  fromRole: 'mentor' | 'mentee' | 'program_admin';
  rating: number;
  strengths: string[];
  improvements: string[];
  comments?: string;
  anonymous: boolean;
}

// ============================================================================
// 7. ACCESSIBILITY
// ============================================================================

export interface AccessibilityRequest {
  requestId: string;
  requestNumber: string;
  employeeId: string;
  employeeName: string;
  requestType: AccessibilityRequestType;
  category: AccessibilityCategory;
  description: string;
  accommodation: AccommodationDetails;
  status: 'submitted' | 'under_review' | 'approved' | 'denied' | 'implemented' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  confidential: boolean;
  requestDate: string;
  requiredBy?: string;
  reviewedBy?: string;
  reviewDate?: string;
  approvedBy?: string;
  approvalDate?: string;
  implementedDate?: string;
  cost?: number;
  fundingSource?: string;
  createdAt: string;
  updatedAt?: string;
}

export type AccessibilityRequestType =
  | 'workplace_modification'
  | 'assistive_technology'
  | 'schedule_adjustment'
  | 'job_restructuring'
  | 'communication_support'
  | 'other';

export type AccessibilityCategory =
  | 'mobility'
  | 'vision'
  | 'hearing'
  | 'cognitive'
  | 'mental_health'
  | 'chronic_illness'
  | 'temporary';

export interface AccommodationDetails {
  specificNeeds: string[];
  currentBarriers: string[];
  proposedSolutions: string[];
  alternativeSolutions?: string[];
  medicalDocumentation?: boolean;
  temporaryDuration?: number; // in days
  renewalRequired?: boolean;
}

export interface AccessibilityAssessment {
  assessmentId: string;
  assessmentType: 'facility' | 'digital' | 'process' | 'comprehensive';
  location?: string;
  platform?: string;
  assessmentDate: string;
  assessor: string;
  standards: AccessibilityStandard[];
  findings: AssessmentFinding[];
  complianceScore: number;
  recommendations: AssessmentRecommendation[];
  nextAssessment: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'follow_up_required';
}

export interface AccessibilityStandard {
  standard: string; // e.g., 'WCAG 2.1', 'ADA', 'Section 508'
  level: 'A' | 'AA' | 'AAA' | 'compliant' | 'non_compliant';
  version: string;
  applicable: boolean;
}

export interface AssessmentFinding {
  findingId: string;
  category: AccessibilityCategory;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  affectedUsers: number;
  standardViolation?: string;
  evidence?: string[];
}

export interface AssessmentRecommendation {
  recommendationId: string;
  findingId: string;
  solution: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost?: number;
  estimatedTime?: string;
  assignedTo?: string;
  status: 'pending' | 'planned' | 'in_progress' | 'completed';
}

export interface AccessibilityResource {
  resourceId: string;
  resourceType: 'equipment' | 'software' | 'service' | 'facility_feature';
  name: string;
  description: string;
  category: AccessibilityCategory;
  location?: string;
  availability: 'available' | 'in_use' | 'maintenance' | 'retired';
  assignedTo?: string;
  cost: number;
  purchaseDate: string;
  warrantyExpiry?: string;
  maintenanceSchedule?: string;
  usage: ResourceUsage[];
}

export interface ResourceUsage {
  usageId: string;
  employeeId: string;
  startDate: string;
  endDate?: string;
  feedback?: string;
  effectiveness?: number;
}

// ============================================================================
// 8. DEI GOALS
// ============================================================================

export interface DEIGoal {
  goalId: string;
  goalName: string;
  description: string;
  category: DEIGoalCategory;
  goalType: 'representation' | 'hiring' | 'promotion' | 'retention' | 'culture' | 'equity';
  level: 'company' | 'division' | 'department' | 'team';
  owner: string;
  ownerEmployeeId: string;
  targetMetric: TargetMetric;
  timeline: GoalTimeline;
  status: 'draft' | 'active' | 'at_risk' | 'achieved' | 'missed' | 'cancelled';
  progress: number; // percentage
  milestones: GoalMilestone[];
  initiatives: string[]; // initiative IDs
  budget?: number;
  stakeholders: Stakeholder[];
  updates: GoalUpdate[];
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

export type DEIGoalCategory =
  | 'workforce_diversity'
  | 'leadership_diversity'
  | 'pay_equity'
  | 'inclusion_culture'
  | 'accessibility'
  | 'supplier_diversity';

export interface TargetMetric {
  metric: string;
  baseline: number;
  target: number;
  current: number;
  unit: string;
  measurementMethod: string;
  dataSource: string;
}

export interface GoalTimeline {
  startDate: string;
  targetDate: string;
  reviewFrequency: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  lastReviewed?: string;
  nextReview: string;
}

export interface GoalMilestone {
  milestoneId: string;
  milestoneName: string;
  description: string;
  targetDate: string;
  targetValue: number;
  actualValue?: number;
  status: 'not_started' | 'in_progress' | 'achieved' | 'missed';
  completedDate?: string;
  dependencies?: string[];
}

export interface Stakeholder {
  employeeId: string;
  name: string;
  role: 'owner' | 'sponsor' | 'contributor' | 'reviewer';
  responsibility: string;
}

export interface GoalUpdate {
  updateId: string;
  updateDate: string;
  updatedBy: string;
  progressChange: number;
  achievements: string[];
  challenges: string[];
  nextSteps: string[];
  risksIdentified?: string[];
  supportNeeded?: string[];
}

export interface DEIInitiative {
  initiativeId: string;
  initiativeName: string;
  description: string;
  type: 'program' | 'policy' | 'event' | 'campaign' | 'training' | 'partnership';
  linkedGoals: string[]; // goal IDs
  startDate: string;
  endDate?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  budget?: number;
  owner: string;
  team: string[];
  impact: InitiativeImpact;
  metrics: InitiativeMetric[];
  timeline: InitiativeTimeline[];
  resources: string[];
  createdAt: string;
  createdBy: string;
}

export interface InitiativeImpact {
  reach: number; // number of people impacted
  engagement: number;
  satisfaction?: number;
  outcomes: string[];
  testimonials?: string[];
}

export interface InitiativeTimeline {
  phase: string;
  startDate: string;
  endDate: string;
  deliverables: string[];
  status: 'not_started' | 'in_progress' | 'completed';
}

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface DEISettings {
  metricsSettings: {
    trackingEnabled: boolean;
    reportingFrequency: 'monthly' | 'quarterly' | 'annual';
    publicDashboard: boolean;
    benchmarkingEnabled: boolean;
  };
  surveySettings: {
    defaultAnonymity: 'anonymous' | 'confidential' | 'identified';
    minimumResponses: number;
    autoReminders: boolean;
    reminderFrequency: number; // days
  };
  payEquitySettings: {
    analysisFrequency: 'quarterly' | 'biannual' | 'annual';
    autoAdjustmentThreshold?: number;
    requireApproval: boolean;
    confidentialityLevel: 'high' | 'medium';
  };
  trainingSettings: {
    requiredForAll: boolean;
    requiredForManagers: boolean;
    recertificationPeriod?: number; // months
    trackingEnabled: boolean;
  };
  ergSettings: {
    allowNewERGs: boolean;
    minimumMembers: number;
    budgetPerERG?: number;
    executiveSponsorRequired: boolean;
  };
  mentorshipSettings: {
    matchingMethod: 'automatic' | 'manual' | 'hybrid';
    maxMenteesPerMentor: number;
    programDuration: number; // months
    checkpointFrequency: string;
  };
  accessibilitySettings: {
    requestApprovalRequired: boolean;
    defaultPriority: 'low' | 'medium' | 'high';
    budgetAllocated: number;
    assessmentFrequency: 'annual' | 'biannual';
  };
  goalSettings: {
    publicGoals: boolean;
    progressReporting: 'monthly' | 'quarterly';
    stakeholderUpdates: boolean;
  };
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
