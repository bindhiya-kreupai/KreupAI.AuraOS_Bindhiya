// Career Planning Module - Type Definitions

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'active' | 'inactive' | 'draft' | 'published' | 'archived';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
export type SkillProficiency = 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type MobilityType = 'vertical' | 'horizontal' | 'diagonal' | 'lateral';
export type MobilityStatus = 'interested' | 'ready' | 'not_ready' | 'in_process' | 'completed';

// ============================================================================
// CAREER LADDERS
// ============================================================================

export interface CareerLadder {
  ladderId: string;
  ladderName: string;
  department: string;
  description: string;
  jobFamily: string;
  levels: CareerLevel[];
  competencyFramework?: string;
  isActive: boolean;
  createdBy: string;
  createdDate: Date;
  updatedDate: Date;
}

export interface CareerLevel {
  levelId: string;
  levelNumber: number;
  levelName: string;
  jobTitle: string;
  gradeLevel: string;
  salaryRange: SalaryRange;
  description: string;
  responsibilities: string[];
  requiredSkills: SkillRequirement[];
  requiredExperience: ExperienceRequirement;
  requiredEducation: EducationRequirement[];
  typicalDuration: number; // months
  promotionCriteria: PromotionCriteria;
  nextLevel?: string;
  previousLevel?: string;
}

export interface SalaryRange {
  currency: string;
  minimum: number;
  midpoint: number;
  maximum: number;
}

export interface SkillRequirement {
  skillId: string;
  skillName: string;
  skillCategory: string;
  requiredProficiency: SkillProficiency;
  isCritical: boolean;
  description?: string;
}

export interface ExperienceRequirement {
  minimumYears: number;
  maximumYears?: number;
  specificExperience?: string[];
  industryExperience?: string[];
}

export interface EducationRequirement {
  level: 'high_school' | 'associate' | 'bachelor' | 'master' | 'doctorate' | 'professional';
  field?: string;
  isRequired: boolean;
  alternatives?: string[];
}

export interface PromotionCriteria {
  minimumTimeInLevel: number; // months
  performanceRatingRequired: number; // minimum rating
  skillsAssessmentRequired: boolean;
  leadershipApprovalRequired: boolean;
  additionalCriteria?: string[];
}

export interface EmployeeCareerPath {
  pathId: string;
  employeeId: string;
  employeeName: string;
  currentLevel: CareerLevel;
  targetLevel?: CareerLevel;
  ladderId: string;
  ladderName: string;
  progression: LevelProgression[];
  currentGaps: SkillGap[];
  developmentPlan?: string;
  estimatedTimeToPromotion?: number; // months
  readinessScore?: number; // 0-100
  lastAssessmentDate?: Date;
  nextReviewDate?: Date;
}

export interface LevelProgression {
  levelId: string;
  levelName: string;
  startDate: Date;
  endDate?: Date;
  achievements: string[];
  performanceRatings: number[];
  skillsDeveloped: string[];
}

export interface SkillGap {
  gapId: string;
  skillId: string;
  skillName: string;
  currentProficiency: SkillProficiency;
  requiredProficiency: SkillProficiency;
  priority: Priority;
  developmentActions: DevelopmentAction[];
  targetCompletionDate?: Date;
  status: ProgressStatus;
}

export interface DevelopmentAction {
  actionId: string;
  actionType: 'training' | 'mentoring' | 'project' | 'certification' | 'self_study' | 'coaching';
  actionName: string;
  description: string;
  provider?: string;
  duration?: number; // hours
  cost?: number;
  startDate?: Date;
  completionDate?: Date;
  status: ProgressStatus;
}

// ============================================================================
// INTERNAL MOBILITY
// ============================================================================

export interface MobilityOpportunity {
  opportunityId: string;
  opportunityType: MobilityType;
  positionId: string;
  jobTitle: string;
  department: string;
  location: string;
  hiringManager: string;
  description: string;
  responsibilities: string[];
  qualifications: Qualification[];
  preferredSkills: string[];
  salaryRange?: SalaryRange;
  benefits?: string[];
  applicationDeadline: Date;
  startDate: Date;
  numberOfOpenings: number;
  status: 'open' | 'closed' | 'filled' | 'cancelled';
  postedDate: Date;
  postedBy: string;
  isInternalOnly: boolean;
  requiresRelocation: boolean;
  relocationAssistance?: boolean;
}

export interface Qualification {
  qualificationId: string;
  qualificationType: 'education' | 'experience' | 'skill' | 'certification' | 'clearance';
  requirement: string;
  isRequired: boolean;
  yearsRequired?: number;
  alternatives?: string[];
}

export interface MobilityApplication {
  applicationId: string;
  opportunityId: string;
  opportunityTitle: string;
  employeeId: string;
  employeeName: string;
  currentPosition: string;
  currentDepartment: string;
  applicationDate: Date;
  coverLetter?: string;
  motivation: string;
  relevantExperience: string[];
  relevantSkills: string[];
  managerEndorsement?: ManagerEndorsement;
  interviewScheduled?: Date;
  assessmentResults?: AssessmentResult[];
  applicationStatus: 'submitted' | 'under_review' | 'interview' | 'offer_extended' | 'accepted' | 'rejected' | 'withdrawn';
  decisionDate?: Date;
  decisionReason?: string;
  feedback?: string;
  offerDetails?: OfferDetails;
}

export interface ManagerEndorsement {
  endorsedBy: string;
  endorsedByName: string;
  endorsementDate: Date;
  isEndorsed: boolean;
  comments: string;
  supportRelease: boolean;
  releaseDate?: Date;
}

export interface AssessmentResult {
  assessmentId: string;
  assessmentType: 'technical' | 'behavioral' | 'cognitive' | 'leadership' | 'cultural_fit';
  assessmentName: string;
  assessmentDate: Date;
  score: number;
  maxScore: number;
  percentageScore: number;
  passed: boolean;
  assessor: string;
  feedback?: string;
}

export interface OfferDetails {
  offerId: string;
  offerDate: Date;
  salary: number;
  bonus?: number;
  equity?: string;
  startDate: Date;
  benefits: string[];
  relocationPackage?: string;
  offerExpiryDate: Date;
  acceptanceDeadline: Date;
  acceptedDate?: Date;
  declinedDate?: Date;
  declineReason?: string;
}

export interface MobilityPreference {
  preferenceId: string;
  employeeId: string;
  employeeName: string;
  preferredDepartments: string[];
  preferredLocations: string[];
  preferredMobilityTypes: MobilityType[];
  willingToRelocate: boolean;
  relocationPreferences?: string[];
  preferredRoles: string[];
  availabilityDate: Date;
  mobilityReadiness: MobilityStatus;
  careerInterests: string[];
  developmentNeeds: string[];
  constraints?: string[];
  lastUpdatedDate: Date;
}

export interface SuccessionPlan {
  planId: string;
  criticalPosition: string;
  department: string;
  incumbentId?: string;
  incumbentName?: string;
  retirementRisk: 'low' | 'medium' | 'high';
  expectedVacancyDate?: Date;
  successors: Successor[];
  developmentPipeline: DevelopmentPipeline[];
  riskMitigation: string[];
  lastReviewDate: Date;
  nextReviewDate: Date;
  status: Status;
}

export interface Successor {
  successorId: string;
  employeeId: string;
  employeeName: string;
  currentPosition: string;
  readinessLevel: '1_year' | '2_years' | '3_years' | 'ready_now';
  readinessScore: number; // 0-100
  strengths: string[];
  developmentNeeds: string[];
  developmentPlan: DevelopmentAction[];
  riskFactors?: string[];
  isEmergencyBackup: boolean;
  lastAssessmentDate: Date;
}

export interface DevelopmentPipeline {
  pipelineId: string;
  levelName: string;
  targetCount: number;
  currentCount: number;
  candidates: PipelineCandidate[];
}

export interface PipelineCandidate {
  employeeId: string;
  employeeName: string;
  currentLevel: string;
  potentialRating: 'high' | 'medium' | 'low';
  performanceRating: number;
  readinessTimeframe: string;
}

// ============================================================================
// CAREER GOALS
// ============================================================================

export interface CareerGoal {
  goalId: string;
  employeeId: string;
  employeeName: string;
  goalType: 'promotion' | 'skill_development' | 'project_completion' | 'certification' | 'leadership' | 'other';
  goalTitle: string;
  description: string;
  targetPosition?: string;
  targetDepartment?: string;
  targetDate: Date;
  priority: Priority;
  alignedToCompanyGoals: boolean;
  companyGoalAlignment?: string;
  milestones: GoalMilestone[];
  requiredActions: DevelopmentAction[];
  progressPercentage: number;
  status: ProgressStatus;
  managerSupport: boolean;
  managerId?: string;
  managerName?: string;
  managerFeedback?: string;
  resources: GoalResource[];
  successCriteria: string[];
  createdDate: Date;
  lastUpdatedDate: Date;
  completedDate?: Date;
}

export interface GoalMilestone {
  milestoneId: string;
  milestoneName: string;
  description: string;
  targetDate: Date;
  completionDate?: Date;
  status: ProgressStatus;
  successMetrics: string[];
  evidence?: string[];
  notes?: string;
}

export interface GoalResource {
  resourceId: string;
  resourceType: 'budget' | 'time' | 'training' | 'mentorship' | 'tools' | 'support';
  resourceName: string;
  description: string;
  allocated: boolean;
  allocationDate?: Date;
  cost?: number;
  availability?: string;
}

export interface DevelopmentDiscussion {
  discussionId: string;
  employeeId: string;
  employeeName: string;
  managerId: string;
  managerName: string;
  discussionDate: Date;
  discussionType: 'quarterly_review' | 'annual_review' | 'check_in' | 'goal_setting' | 'performance_review';
  topics: string[];
  careerGoalsDiscussed: string[];
  strengthsIdentified: string[];
  areasForDevelopment: string[];
  actionItems: ActionItem[];
  managerCommitments: string[];
  employeeCommitments: string[];
  nextDiscussionDate?: Date;
  summary: string;
  participantFeedback?: ParticipantFeedback[];
}

export interface ActionItem {
  itemId: string;
  action: string;
  owner: 'employee' | 'manager' | 'hr' | 'both';
  dueDate: Date;
  status: ProgressStatus;
  completionDate?: Date;
  notes?: string;
}

export interface ParticipantFeedback {
  participant: 'employee' | 'manager';
  rating: number; // 1-5
  comments: string;
  followUpNeeded: boolean;
}

// ============================================================================
// ASPIRATIONS
// ============================================================================

export interface CareerAspiration {
  aspirationId: string;
  employeeId: string;
  employeeName: string;
  aspirationType: 'role' | 'skill' | 'industry' | 'location' | 'work_style' | 'impact';
  aspirationTitle: string;
  description: string;
  dreamRole?: string;
  dreamCompany?: string;
  desiredSkills: string[];
  desiredExperience: string[];
  timeframe: '1_year' | '2_years' | '3_years' | '5_years' | '10_years';
  isSharedWithManager: boolean;
  managerFeedback?: string;
  alignmentScore?: number; // 0-100 (alignment with company opportunities)
  feasibilityScore?: number; // 0-100
  pathwayRecommendations: PathwayRecommendation[];
  relatedOpportunities: string[];
  inspirations: string[];
  barriers: Barrier[];
  supportNeeded: string[];
  createdDate: Date;
  lastUpdatedDate: Date;
  status: 'exploring' | 'planning' | 'pursuing' | 'achieved' | 'pivoted';
}

export interface PathwayRecommendation {
  recommendationId: string;
  pathway: string;
  description: string;
  estimatedDuration: number; // months
  steps: PathwayStep[];
  requiredInvestment?: string;
  successProbability?: number; // 0-100
  similarSuccessStories?: SuccessStory[];
}

export interface PathwayStep {
  stepNumber: number;
  stepName: string;
  description: string;
  duration: number; // months
  resources: string[];
  milestones: string[];
}

export interface SuccessStory {
  storyId: string;
  employeeName: string;
  fromPosition: string;
  toPosition: string;
  duration: number; // months
  keyActions: string[];
  lessonsLearned: string[];
  isPublic: boolean;
}

export interface Barrier {
  barrierId: string;
  barrierType: 'skill_gap' | 'experience_gap' | 'education' | 'location' | 'timing' | 'organizational' | 'personal';
  description: string;
  severity: 'low' | 'medium' | 'high';
  mitigationPlan?: string;
  supportRequired?: string[];
  status: 'identified' | 'addressing' | 'resolved' | 'unresolved';
}

export interface MentorshipRequest {
  requestId: string;
  menteeId: string;
  menteeName: string;
  menteePosition: string;
  desiredMentorProfile: MentorProfile;
  areasForGuidance: string[];
  careerAspirations: string[];
  preferredMeetingFrequency: 'weekly' | 'bi_weekly' | 'monthly';
  commitmentDuration: number; // months
  matchedMentorId?: string;
  matchedMentorName?: string;
  matchDate?: Date;
  status: 'pending' | 'matched' | 'active' | 'completed' | 'cancelled';
  requestDate: Date;
  completionDate?: Date;
  satisfactionRating?: number; // 1-5
  feedback?: string;
}

export interface MentorProfile {
  preferredDepartments?: string[];
  preferredSeniority: string[];
  preferredExpertise: string[];
  preferredBackground?: string[];
}

export interface SkillAssessment {
  assessmentId: string;
  employeeId: string;
  employeeName: string;
  assessmentDate: Date;
  assessmentType: 'self_assessment' | 'manager_assessment' | 'peer_assessment' | '360_assessment' | 'formal_test';
  skills: AssessedSkill[];
  overallScore: number;
  strengthAreas: string[];
  developmentAreas: string[];
  recommendations: string[];
  assessor?: string;
  nextAssessmentDate?: Date;
  linkedToGoals: string[];
}

export interface AssessedSkill {
  skillId: string;
  skillName: string;
  skillCategory: string;
  currentProficiency: SkillProficiency;
  targetProficiency?: SkillProficiency;
  proficiencyScore: number; // 0-100
  evidence?: string[];
  validatedBy?: string;
  validationDate?: Date;
  improvementPlan?: string[];
}

export interface LearningPathway {
  pathwayId: string;
  pathwayName: string;
  description: string;
  targetRole?: string;
  targetSkills: string[];
  duration: number; // months
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  modules: LearningModule[];
  prerequisites?: string[];
  estimatedCost?: number;
  estimatedTimeCommitment: number; // hours per week
  enrolledEmployees: number;
  completionRate: number; // percentage
  averageRating?: number;
  isRecommended: boolean;
  createdBy: string;
  createdDate: Date;
  lastUpdatedDate: Date;
  status: Status;
}

export interface LearningModule {
  moduleId: string;
  moduleName: string;
  description: string;
  moduleType: 'course' | 'workshop' | 'project' | 'reading' | 'mentorship' | 'certification';
  provider?: string;
  duration: number; // hours
  orderNumber: number;
  isRequired: boolean;
  completionCriteria: string[];
  resources: string[];
  assessments?: string[];
}

// ============================================================================
// SHARED / COMMON TYPES
// ============================================================================

export interface CareerSettings {
  settingsId: string;
  enableCareerLadders: boolean;
  enableInternalMobility: boolean;
  enableMentorship: boolean;
  requireManagerApprovalForMobility: boolean;
  minimumTenureForMobility: number; // months
  noticePeriodrequired: number; // weeks
  allowCrossDepartmentMobility: boolean;
  allowCrossLocationMobility: boolean;
  enableSuccessionPlanning: boolean;
  enableSkillAssessments: boolean;
  assessmentFrequency: number; // months
  enableCareerGoals: boolean;
  maxActiveGoalsPerEmployee: number;
  goalReviewFrequency: number; // months
  lastUpdatedDate: Date;
  lastUpdatedBy: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
