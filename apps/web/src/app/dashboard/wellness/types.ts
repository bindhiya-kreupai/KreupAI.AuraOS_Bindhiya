/**
 * Employee Wellness Module - Type Definitions
 * Comprehensive wellness tracking including health programs, mental health,
 * HRA, challenges, rewards, and gym memberships
 */

// Common Types
export type Status = 'draft' | 'active' | 'inactive' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// Health Programs
// ============================================================================

export type ProgramType =
  | 'preventive_care'
  | 'disease_management'
  | 'fitness'
  | 'nutrition'
  | 'mental_health'
  | 'smoking_cessation'
  | 'weight_management'
  | 'maternity'
  | 'chronic_disease'
  | 'immunization'
  | 'other';

export type ProgramStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface HealthProgram {
  id: string;
  programCode: string;
  programName: string;
  programType: ProgramType;
  status: ProgramStatus;
  description: string;
  objectives: string[];
  targetAudience: TargetAudience;

  // Schedule
  startDate: string;
  endDate?: string;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;

  // Configuration
  maxParticipants?: number;
  currentParticipants: number;
  eligibilityCriteria: EligibilityCriteria[];

  // Content & Resources
  programModules?: ProgramModule[];
  resources: ProgramResource[];
  assessments?: Assessment[];

  // Engagement
  participationRate: number;
  completionRate: number;
  satisfactionScore: number;
  healthOutcomes?: HealthOutcome[];

  // Points & Rewards
  pointsConfiguration?: ProgramPoints;
  rewards?: ProgramReward[];

  // Tracking
  enrollments: ProgramEnrollment[];
  milestones: ProgramMilestone[];

  // Meta
  createdBy: string;
  createdByName: string;
  createdDate: string;
  lastModified: string;
  tags: string[];
  attachments: Attachment[];
}

export interface TargetAudience {
  all: boolean;
  departments?: string[];
  locations?: string[];
  jobLevels?: string[];
  ageRanges?: AgeRange[];
  riskLevels?: ('low' | 'medium' | 'high')[];
  customConditions?: string[];
}

export interface AgeRange {
  min: number;
  max: number;
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval: number;
  endAfter?: number; // occurrences
  endBy?: string; // date
}

export interface EligibilityCriteria {
  id: string;
  criteriaType: 'demographic' | 'health_metric' | 'risk_level' | 'benefit_plan' | 'custom';
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range';
  value: any;
  description: string;
}

export interface ProgramModule {
  id: string;
  moduleName: string;
  description: string;
  sequence: number;
  duration: number; // days
  activities: ModuleActivity[];
  required: boolean;
  pointsValue: number;
}

export interface ModuleActivity {
  id: string;
  activityName: string;
  activityType: 'reading' | 'video' | 'quiz' | 'exercise' | 'assessment' | 'task';
  description: string;
  estimatedTime: number; // minutes
  required: boolean;
  pointsValue: number;
  completionCriteria: string;
}

export interface ProgramResource {
  id: string;
  resourceType: 'article' | 'video' | 'pdf' | 'link' | 'tool' | 'contact';
  title: string;
  description: string;
  url?: string;
  fileUrl?: string;
  contactInfo?: ContactInfo;
}

export interface ContactInfo {
  name: string;
  role: string;
  email: string;
  phone?: string;
  availability?: string;
}

export interface Assessment {
  id: string;
  assessmentName: string;
  assessmentType: 'pre' | 'mid' | 'post' | 'continuous';
  questions: AssessmentQuestion[];
  scoringLogic: ScoringLogic;
  passingScore?: number;
  required: boolean;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  questionType: 'multiple_choice' | 'true_false' | 'scale' | 'text' | 'numeric';
  options?: string[];
  correctAnswer?: any;
  points: number;
}

export interface ScoringLogic {
  totalPoints: number;
  passingPercentage: number;
  weightedScoring: boolean;
  categoryWeights?: Record<string, number>;
}

export interface HealthOutcome {
  id: string;
  outcomeName: string;
  metric: string;
  baselineValue: number;
  targetValue: number;
  currentValue: number;
  improvementPercentage: number;
  measurementDate: string;
}

export interface ProgramPoints {
  enrollmentPoints: number;
  completionPoints: number;
  milestonePoints: Record<string, number>;
  activityPoints: Record<string, number>;
  bonusPoints?: BonusPointsRule[];
}

export interface BonusPointsRule {
  id: string;
  ruleName: string;
  condition: string;
  pointsAwarded: number;
  maxOccurrences?: number;
}

export interface ProgramReward {
  id: string;
  rewardName: string;
  rewardType: 'points' | 'badge' | 'certificate' | 'voucher' | 'benefit' | 'recognition';
  criteria: string;
  value: number | string;
  description: string;
}

export interface ProgramEnrollment {
  id: string;
  programId: string;
  employeeId: string;
  employeeName: string;
  enrollmentDate: string;
  status: 'enrolled' | 'active' | 'completed' | 'dropped' | 'paused';
  progress: number; // percentage
  pointsEarned: number;
  lastActivityDate?: string;
  completionDate?: string;
  certificateIssued?: boolean;
  feedback?: ParticipantFeedback;
}

export interface ParticipantFeedback {
  rating: number;
  comments: string;
  wouldRecommend: boolean;
  feedbackDate: string;
}

export interface ProgramMilestone {
  id: string;
  milestoneName: string;
  description: string;
  targetDate: string;
  completionDate?: string;
  status: 'pending' | 'completed' | 'missed';
  metrics: MilestoneMetric[];
}

export interface MilestoneMetric {
  metricName: string;
  targetValue: number;
  actualValue?: number;
  unit: string;
}

// ============================================================================
// Mental Health Support
// ============================================================================

export type MentalHealthServiceType =
  | 'eap'
  | 'counseling'
  | 'therapy'
  | 'psychiatric'
  | 'coaching'
  | 'crisis_support'
  | 'support_group'
  | 'meditation'
  | 'stress_management'
  | 'other';

export type SessionMode = 'in_person' | 'virtual' | 'phone' | 'chat' | 'text';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';

export interface MentalHealthService {
  id: string;
  serviceCode: string;
  serviceName: string;
  serviceType: MentalHealthServiceType;
  status: Status;
  description: string;

  // Provider Information
  provider: ServiceProvider;

  // Configuration
  isConfidential: boolean;
  requiresApproval: boolean;
  maxSessionsPerYear?: number;
  sessionDuration: number; // minutes
  availableModes: SessionMode[];

  // Eligibility
  eligibleEmployees: TargetAudience;
  dependentCoverage: boolean;

  // Booking
  allowSelfBooking: boolean;
  bookingAdvanceNotice: number; // hours
  cancellationNotice: number; // hours

  // Tracking
  totalSessions: number;
  utilizationRate: number;
  satisfactionScore: number;

  // Resources
  resources: ProgramResource[];

  createdDate: string;
  lastModified: string;
}

export interface ServiceProvider {
  id: string;
  providerName: string;
  providerType: 'individual' | 'organization' | 'platform';
  specializations: string[];
  languages: string[];
  credentials: string[];
  contactInfo: ContactInfo;
  availability: ProviderAvailability[];
  rating: number;
  reviewCount: number;
}

export interface ProviderAvailability {
  dayOfWeek: number; // 0-6
  startTime: string;
  endTime: string;
  mode: SessionMode;
}

export interface MentalHealthSession {
  id: string;
  sessionCode: string;
  serviceId: string;
  serviceName: string;

  // Participant (anonymized for confidentiality)
  employeeId: string;
  isAnonymous: boolean;

  // Provider
  providerId: string;
  providerName: string;

  // Session Details
  sessionDate: string;
  sessionTime: string;
  duration: number;
  mode: SessionMode;
  status: SessionStatus;

  // Notes (confidential)
  sessionNotes?: string; // Only visible to provider
  followUpRequired: boolean;
  followUpDate?: string;

  // Tracking
  attendanceConfirmed: boolean;
  feedback?: SessionFeedback;

  createdDate: string;
  lastModified: string;
}

export interface SessionFeedback {
  rating: number;
  helpfulness: number;
  wouldRecommend: boolean;
  comments?: string;
  feedbackDate: string;
}

// ============================================================================
// Health Risk Assessment (HRA)
// ============================================================================

export type HRAStatus = 'draft' | 'active' | 'completed' | 'expired';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface HealthRiskAssessment {
  id: string;
  hraCode: string;
  hraName: string;
  version: string;
  status: HRAStatus;
  description: string;

  // Configuration
  isAnonymous: boolean;
  isMandatory: boolean;
  validityPeriod: number; // days

  // Assessment Sections
  sections: HRASection[];

  // Scoring
  riskCategories: RiskCategory[];
  scoringAlgorithm: ScoringAlgorithm;

  // Recommendations
  recommendationEngine: RecommendationEngine;

  // Incentives
  completionIncentive?: HRAIncentive;

  // Tracking
  totalResponses: number;
  completionRate: number;
  averageRiskScore: number;
  riskDistribution: Record<RiskLevel, number>;

  // Validity
  effectiveDate: string;
  expiryDate?: string;

  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface HRASection {
  id: string;
  sectionName: string;
  description: string;
  sequence: number;
  questions: HRAQuestion[];
  weight: number; // for scoring
}

export interface HRAQuestion {
  id: string;
  question: string;
  questionType: 'multiple_choice' | 'yes_no' | 'numeric' | 'scale' | 'multi_select' | 'text';
  options?: HRAOption[];
  validation?: ValidationRule;
  required: boolean;
  riskWeight: number;
  relatedConditions: string[];
}

export interface HRAOption {
  id: string;
  label: string;
  value: any;
  riskScore: number;
  followUpQuestions?: HRAQuestion[];
}

export interface ValidationRule {
  type: 'range' | 'min' | 'max' | 'regex' | 'custom';
  value: any;
  errorMessage: string;
}

export interface RiskCategory {
  id: string;
  categoryName: string;
  description: string;
  metrics: RiskMetric[];
  interventions: Intervention[];
}

export interface RiskMetric {
  metricName: string;
  measurementUnit: string;
  normalRange: { min: number; max: number };
  riskThresholds: RiskThreshold[];
}

export interface RiskThreshold {
  level: RiskLevel;
  min?: number;
  max?: number;
  description: string;
}

export interface Intervention {
  id: string;
  interventionName: string;
  interventionType: 'program' | 'consultation' | 'referral' | 'lifestyle_change' | 'monitoring';
  description: string;
  recommendedFor: RiskLevel[];
  resources: ProgramResource[];
}

export interface ScoringAlgorithm {
  type: 'weighted_sum' | 'categorical' | 'predictive_model' | 'custom';
  parameters: Record<string, any>;
  riskLevelMapping: RiskLevelMapping[];
}

export interface RiskLevelMapping {
  minScore: number;
  maxScore: number;
  riskLevel: RiskLevel;
  label: string;
  color: string;
}

export interface RecommendationEngine {
  rules: RecommendationRule[];
  prioritizationLogic: 'severity' | 'impact' | 'ease' | 'custom';
}

export interface RecommendationRule {
  id: string;
  condition: string;
  recommendations: string[];
  programs: string[];
  resources: ProgramResource[];
  priority: Priority;
}

export interface HRAIncentive {
  pointsForCompletion: number;
  additionalRewards: ProgramReward[];
  earlyCompletionBonus?: number;
  deadlineForBonus?: string;
}

export interface HRAResponse {
  id: string;
  hraId: string;
  employeeId: string;
  employeeName?: string;
  isAnonymous: boolean;

  // Responses
  responses: Record<string, any>;
  biometricData?: BiometricData;

  // Assessment Results
  completionDate: string;
  overallRiskScore: number;
  riskLevel: RiskLevel;
  categoryScores: Record<string, CategoryScore>;

  // Recommendations
  recommendations: PersonalizedRecommendation[];
  actionPlan: ActionPlan;

  // Follow-up
  consultationScheduled: boolean;
  consultationDate?: string;
  programEnrollments: string[];

  // Tracking
  previousAssessmentId?: string;
  improvementSinceLastAssessment?: number;

  createdDate: string;
  expiryDate: string;
}

export interface BiometricData {
  height: number; // cm
  weight: number; // kg
  bmi: number;
  bloodPressure: { systolic: number; diastolic: number };
  cholesterol?: { total: number; hdl: number; ldl: number };
  bloodSugar?: number;
  waistCircumference?: number;
  bodyFatPercentage?: number;
  measurementDate: string;
}

export interface CategoryScore {
  score: number;
  riskLevel: RiskLevel;
  factors: RiskFactor[];
}

export interface RiskFactor {
  factor: string;
  severity: RiskLevel;
  description: string;
  modifiable: boolean;
}

export interface PersonalizedRecommendation {
  id: string;
  category: string;
  recommendation: string;
  rationale: string;
  priority: Priority;
  estimatedImpact: 'low' | 'medium' | 'high';
  resources: ProgramResource[];
  suggestedPrograms: string[];
}

export interface ActionPlan {
  goals: HealthGoal[];
  milestones: ActionMilestone[];
  checkInFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  nextReviewDate: string;
}

export interface HealthGoal {
  id: string;
  goalName: string;
  category: string;
  targetMetric: string;
  currentValue: number;
  targetValue: number;
  targetDate: string;
  status: 'not_started' | 'in_progress' | 'achieved' | 'abandoned';
}

export interface ActionMilestone {
  id: string;
  milestoneName: string;
  targetDate: string;
  status: 'pending' | 'completed' | 'missed';
  completionDate?: string;
}

// ============================================================================
// Wellness Challenges
// ============================================================================

export type ChallengeType =
  | 'steps'
  | 'activity_minutes'
  | 'nutrition'
  | 'hydration'
  | 'sleep'
  | 'meditation'
  | 'weight_loss'
  | 'smoking_cessation'
  | 'custom';

export type ChallengeFormat = 'individual' | 'team' | 'company_wide';
export type ChallengeStatus = 'draft' | 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface WellnessChallenge {
  id: string;
  challengeCode: string;
  challengeName: string;
  challengeType: ChallengeType;
  format: ChallengeFormat;
  status: ChallengeStatus;
  description: string;

  // Schedule
  startDate: string;
  endDate: string;
  registrationDeadline: string;

  // Configuration
  goalMetric: string;
  goalValue: number;
  goalUnit: string;
  allowLateRegistration: boolean;
  maxParticipants?: number;
  teamSize?: number; // for team challenges

  // Gamification
  leaderboard: Leaderboard;
  badges: ChallengeBadge[];
  milestones: ChallengeMilestone[];

  // Rewards
  prizes: ChallengePrize[];
  pointsConfiguration: ChallengePoints;

  // Participation
  participants: ChallengeParticipant[];
  teams?: ChallengeTeam[];

  // Tracking
  totalParticipants: number;
  activeParticipants: number;
  completionRate: number;
  averageProgress: number;

  // Engagement
  updates: ChallengeUpdate[];
  discussions: ChallengeDiscussion[];

  // Resources
  rules: string;
  faq: FAQ[];
  resources: ProgramResource[];

  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface Leaderboard {
  enabled: boolean;
  updateFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  showRankings: boolean;
  anonymousMode: boolean;
  topPerformers: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  rank: number;
  participantId: string;
  participantName: string;
  teamId?: string;
  teamName?: string;
  progress: number;
  totalValue: number;
  lastUpdated: string;
}

export interface ChallengeBadge {
  id: string;
  badgeName: string;
  description: string;
  iconUrl: string;
  criteria: string;
  pointsValue: number;
  earnedBy: BadgeEarner[];
}

export interface BadgeEarner {
  employeeId: string;
  employeeName: string;
  earnedDate: string;
}

export interface ChallengeMilestone {
  id: string;
  milestoneName: string;
  description: string;
  targetValue: number;
  pointsReward: number;
  badgeAwarded?: string;
}

export interface ChallengePrize {
  id: string;
  prizeName: string;
  description: string;
  prizeValue: number;
  prizeType: 'cash' | 'voucher' | 'gift' | 'points' | 'recognition' | 'other';
  eligibility: 'top_1' | 'top_3' | 'top_10' | 'all_completers' | 'random_draw';
  winnersCount: number;
  winners?: PrizeWinner[];
}

export interface PrizeWinner {
  employeeId: string;
  employeeName: string;
  rank?: number;
  awardDate: string;
}

export interface ChallengePoints {
  dailyActivityPoints: number;
  milestonePoints: number;
  completionPoints: number;
  leaderboardBonusPoints: number;
  teamBonusPoints?: number;
}

export interface ChallengeParticipant {
  id: string;
  challengeId: string;
  employeeId: string;
  employeeName: string;
  teamId?: string;
  registrationDate: string;
  status: 'registered' | 'active' | 'completed' | 'withdrawn';

  // Progress
  currentProgress: number;
  dailyProgress: DailyProgress[];
  lastActivityDate?: string;

  // Achievements
  pointsEarned: number;
  badgesEarned: string[];
  milestonesReached: string[];

  // Engagement
  postsCount: number;
  likesReceived: number;

  completionDate?: string;
  prizesWon: string[];
}

export interface DailyProgress {
  date: string;
  value: number;
  notes?: string;
  verified: boolean;
}

export interface ChallengeTeam {
  id: string;
  teamName: string;
  teamLead: string;
  teamLeadName: string;
  members: TeamMember[];

  // Performance
  totalProgress: number;
  averageProgress: number;
  teamRank?: number;

  // Engagement
  teamMotto?: string;
  teamColor?: string;

  createdDate: string;
}

export interface TeamMember {
  employeeId: string;
  employeeName: string;
  role: 'lead' | 'member';
  joinedDate: string;
  contribution: number;
  isActive: boolean;
}

export interface ChallengeUpdate {
  id: string;
  updateDate: string;
  title: string;
  message: string;
  type: 'announcement' | 'milestone' | 'reminder' | 'winner';
  postedBy: string;
  postedByName: string;
}

export interface ChallengeDiscussion {
  id: string;
  participantId: string;
  participantName: string;
  message: string;
  postedDate: string;
  likes: number;
  replies: DiscussionReply[];
}

export interface DiscussionReply {
  id: string;
  replyBy: string;
  replyByName: string;
  message: string;
  postedDate: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

// ============================================================================
// Wellness Points & Rewards
// ============================================================================

export type TransactionType = 'earned' | 'redeemed' | 'expired' | 'adjusted' | 'bonus';

export interface WellnessPoints {
  employeeId: string;
  employeeName: string;

  // Points Balance
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  currentBalance: number;
  pointsExpiringSoon: number;

  // Transactions
  transactions: PointsTransaction[];

  // Tier Status
  currentTier: WellnessTier;
  nextTier?: WellnessTier;
  pointsToNextTier?: number;

  // Activity Summary
  activitiesCompleted: number;
  challengesCompleted: number;
  programsCompleted: number;

  lastUpdated: string;
}

export interface PointsTransaction {
  id: string;
  transactionDate: string;
  type: TransactionType;
  points: number;
  source: string;
  sourceId: string;
  description: string;
  balance: number;
  expiryDate?: string;
}

export interface WellnessTier {
  tierId: string;
  tierName: string;
  tierLevel: number;
  minPoints: number;
  maxPoints?: number;
  benefits: TierBenefit[];
  badgeUrl: string;
  color: string;
}

export interface TierBenefit {
  benefitName: string;
  description: string;
  value?: string;
}

export interface RewardsRedemption {
  id: string;
  employeeId: string;
  employeeName: string;
  rewardId: string;
  rewardName: string;
  pointsRedeemed: number;
  redemptionDate: string;
  status: 'pending' | 'approved' | 'fulfilled' | 'rejected' | 'cancelled';

  // Delivery
  deliveryMethod: 'email' | 'physical' | 'digital' | 'account_credit';
  deliveryAddress?: string;
  trackingNumber?: string;
  deliveryDate?: string;

  // Notes
  notes?: string;
  rejectionReason?: string;

  processedBy?: string;
  processedDate?: string;
}

export interface RewardsCatalog {
  id: string;
  rewardName: string;
  description: string;
  category: RewardCategory;
  pointsCost: number;

  // Availability
  available: boolean;
  stockQuantity?: number;
  maxRedemptionsPerEmployee?: number;

  // Details
  imageUrl?: string;
  termsAndConditions: string;
  validityPeriod?: number; // days

  // Tracking
  totalRedemptions: number;
  averageRating: number;

  createdDate: string;
  lastModified: string;
}

export type RewardCategory =
  | 'gift_card'
  | 'merchandise'
  | 'experiences'
  | 'charity_donation'
  | 'extra_leave'
  | 'parking'
  | 'wellness_services'
  | 'learning'
  | 'other';

// ============================================================================
// Gym & Fitness Memberships
// ============================================================================

export type MembershipStatus = 'active' | 'pending' | 'suspended' | 'cancelled' | 'expired';
export type MembershipType = 'individual' | 'family' | 'corporate';

export interface GymMembership {
  id: string;
  employeeId: string;
  employeeName: string;
  membershipType: MembershipType;

  // Membership Details
  gymProviderId: string;
  gymProviderName: string;
  membershipPlan: string;
  membershipNumber: string;

  // Status
  status: MembershipStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;

  // Cost & Subsidy
  monthlyFee: number;
  employeeContribution: number;
  employerSubsidy: number;
  subsidyPercentage: number;

  // Family Members (if applicable)
  familyMembers?: FamilyMember[];

  // Usage
  visitsThisMonth: number;
  totalVisits: number;
  lastVisitDate?: string;
  averageVisitsPerMonth: number;

  // Billing
  billingCycle: 'monthly' | 'quarterly' | 'annually';
  nextBillingDate: string;

  // Documents
  membershipCard?: string;
  proofOfEnrollment?: string;

  createdDate: string;
  lastModified: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  dateOfBirth: string;
  membershipNumber?: string;
}

export interface GymProvider {
  id: string;
  providerName: string;
  providerType: 'gym' | 'fitness_center' | 'yoga_studio' | 'sports_club' | 'online_platform';

  // Details
  description: string;
  logo?: string;
  website?: string;

  // Locations
  locations: GymLocation[];

  // Plans
  membershipPlans: MembershipPlan[];

  // Corporate Agreement
  corporateRate: boolean;
  discountPercentage: number;
  subsidyArrangement: string;

  // Tracking
  totalEmployeeMembers: number;
  averageUtilization: number;

  // Contract
  contractStartDate: string;
  contractEndDate: string;
  contactPerson: ContactInfo;

  status: Status;
  createdDate: string;
  lastModified: string;
}

export interface GymLocation {
  id: string;
  locationName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  facilities: string[];
  operatingHours: OperatingHours[];
}

export interface OperatingHours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  is24Hours: boolean;
}

export interface MembershipPlan {
  id: string;
  planName: string;
  description: string;
  type: MembershipType;

  // Pricing
  monthlyFee: number;
  setupFee?: number;

  // Features
  features: string[];
  restrictions?: string[];

  // Availability
  available: boolean;
  maxMembers?: number;
}

// ============================================================================
// Wellness Analytics & Metrics
// ============================================================================

export interface WellnessMetrics {
  // Program Participation
  totalPrograms: number;
  activePrograms: number;
  totalProgramEnrollments: number;
  averageProgramCompletionRate: number;

  // Mental Health
  totalMentalHealthSessions: number;
  mentalHealthUtilizationRate: number;
  averageMentalHealthSatisfaction: number;

  // HRA
  hraCompletionRate: number;
  averageRiskScore: number;
  highRiskEmployees: number;
  highRiskPercentage: number;
  improvementRate: number; // year over year

  // Challenges
  activeChallenges: number;
  challengeParticipationRate: number;
  averageChallengeCompletionRate: number;

  // Points & Rewards
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  pointsRedemptionRate: number;
  averagePointsPerEmployee: number;

  // Gym Memberships
  activeGymMemberships: number;
  gymUtilizationRate: number;
  averageGymVisitsPerMonth: number;

  // Engagement
  overallWellnessEngagement: number; // percentage
  employeeSatisfactionScore: number;
  recommendationScore: number; // eNPS style

  // ROI
  totalInvestment: number;
  estimatedHealthcareSavings: number;
  roi: number;

  // Trends
  participationTrends: TrendData[];
  healthOutcomeTrends: TrendData[];
  engagementTrends: TrendData[];

  lastUpdated: string;
}

export interface TrendData {
  period: string;
  value: number;
  change?: number;
  changePercentage?: number;
}

// ============================================================================
// Wellness Settings
// ============================================================================

export interface WellnessSettings {
  // Program Settings
  enableHealthPrograms: boolean;
  requireProgramApproval: boolean;
  maxProgramsPerEmployee: number;

  // Mental Health Settings
  enableMentalHealth: boolean;
  mentalHealthConfidentiality: 'full' | 'partial' | 'none';
  maxSessionsPerYear: number;
  eapProvider?: string;
  crisisHotline?: string;

  // HRA Settings
  enableHRA: boolean;
  hraFrequency: 'annual' | 'biannual' | 'quarterly' | 'continuous';
  hraMandatory: boolean;
  hraAnonymous: boolean;
  hraIncentivePoints: number;

  // Challenge Settings
  enableChallenges: boolean;
  allowEmployeeCreatedChallenges: boolean;
  requireChallengeApproval: boolean;
  maxChallengesPerQuarter: number;

  // Points Settings
  enablePointsSystem: boolean;
  pointsExpiryMonths: number;
  enableTierSystem: boolean;
  tiers: WellnessTier[];

  // Gym Settings
  enableGymSubsidy: boolean;
  maxGymSubsidyPerMonth: number;
  subsidyPercentage: number;
  requireUsageMinimum: boolean;
  minimumVisitsPerMonth?: number;

  // Notifications
  enableNotifications: boolean;
  notifyProgramLaunch: boolean;
  notifyChallengeMilestones: boolean;
  notifyPointsExpiry: boolean;
  notifyNewRewards: boolean;

  // Privacy
  dataRetentionMonths: number;
  allowDataExport: boolean;
  requireConsent: boolean;

  createdDate: string;
  lastModified: string;
}

// ============================================================================
// Common/Shared Types
// ============================================================================

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedDate: string;
}
