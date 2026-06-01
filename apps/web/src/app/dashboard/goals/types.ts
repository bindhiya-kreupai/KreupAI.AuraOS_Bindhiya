// Goal Management Module Types

export type GoalType = 'individual' | 'team' | 'department' | 'company' | 'project';
export type GoalCategory = 'performance' | 'development' | 'behavioral' | 'strategic' | 'operational' | 'financial' | 'customer' | 'innovation';
export type GoalStatus = 'draft' | 'active' | 'on_track' | 'at_risk' | 'behind' | 'completed' | 'cancelled' | 'archived';
export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';
export type GoalVisibility = 'private' | 'team' | 'department' | 'company' | 'public';
export type MeasurementType = 'percentage' | 'number' | 'currency' | 'boolean' | 'custom';
export type ProgressStatus = 'not_started' | 'in_progress' | 'on_track' | 'at_risk' | 'blocked' | 'completed';
export type AlignmentStatus = 'aligned' | 'partially_aligned' | 'not_aligned' | 'cascaded';
export type CheckInFrequency = 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly';

export interface Goal {
  id: string;
  goalCode: string;
  title: string;
  description: string;
  goalType: GoalType;
  category: GoalCategory;
  status: GoalStatus;
  priority: GoalPriority;
  visibility: GoalVisibility;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  departmentId: string;
  departmentName: string;
  parentGoalId?: string;
  parentGoalTitle?: string;
  childGoals: string[];
  alignedGoals: string[];
  cycleId: string;
  cycleName: string;
  startDate: string;
  endDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  keyResults: KeyResult[];
  progress: number;
  progressStatus: ProgressStatus;
  milestones: GoalMilestone[];
  checkIns: GoalCheckIn[];
  lastCheckInDate?: string;
  nextCheckInDate?: string;
  checkInFrequency: CheckInFrequency;
  metrics: GoalMetrics;
  tags: string[];
  collaborators: GoalCollaborator[];
  watchers: string[];
  attachments: GoalAttachment[];
  comments: GoalComment[];
  isSMART: boolean;
  smartCriteria?: SMARTCriteria;
  weight?: number;
  outcomeImpact?: OutcomeImpact;
  risks: GoalRisk[];
  dependencies: GoalDependency[];
  isPrivate: boolean;
  isArchived: boolean;
  createdBy: string;
  createdDate: string;
  lastModified: string;
  lastModifiedBy: string;
}

export interface KeyResult {
  id: string;
  goalId: string;
  title: string;
  description: string;
  measurementType: MeasurementType;
  startValue: number;
  targetValue: number;
  currentValue: number;
  unit?: string;
  progress: number;
  status: ProgressStatus;
  dueDate: string;
  completedDate?: string;
  ownerId?: string;
  ownerName?: string;
  updates: KeyResultUpdate[];
  lastUpdateDate?: string;
  isCompleted: boolean;
  weight?: number;
  createdDate: string;
  lastModified: string;
}

export interface KeyResultUpdate {
  id: string;
  keyResultId: string;
  updateDate: string;
  previousValue: number;
  currentValue: number;
  progress: number;
  comment?: string;
  updatedBy: string;
  updatedByName: string;
  attachments?: string[];
}

export interface GoalMilestone {
  id: string;
  goalId: string;
  title: string;
  description: string;
  dueDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  assignedTo?: string;
  assignedToName?: string;
  deliverables: string[];
  isCompleted: boolean;
  createdDate: string;
}

export interface GoalCheckIn {
  id: string;
  goalId: string;
  checkInDate: string;
  status: ProgressStatus;
  progress: number;
  confidenceLevel: number;
  summary: string;
  achievements: string[];
  challenges: string[];
  nextSteps: string[];
  supportNeeded?: string;
  keyResultUpdates: { keyResultId: string; value: number; comment?: string }[];
  isOnTrack: boolean;
  blockers?: string[];
  risks?: string[];
  submittedBy: string;
  submittedByName: string;
  feedback?: CheckInFeedback;
  createdDate: string;
}

export interface CheckInFeedback {
  id: string;
  checkInId: string;
  feedbackBy: string;
  feedbackByName: string;
  feedbackDate: string;
  feedback: string;
  suggestions?: string[];
  encouragement?: string;
}

export interface GoalMetrics {
  totalKeyResults: number;
  completedKeyResults: number;
  keyResultCompletionRate: number;
  averageProgress: number;
  daysRemaining: number;
  daysElapsed: number;
  percentTimeElapsed: number;
  isAhead: boolean;
  isBehind: boolean;
  velocityScore?: number;
  healthScore: number;
}

export interface SMARTCriteria {
  specific: boolean;
  measurable: boolean;
  achievable: boolean;
  relevant: boolean;
  timeBound: boolean;
  score: number;
  feedback: string[];
}

export interface OutcomeImpact {
  impactArea: string[];
  estimatedImpact: 'low' | 'medium' | 'high' | 'transformational';
  beneficiaries: string[];
  successMetrics: string[];
}

export interface GoalRisk {
  id: string;
  goalId: string;
  riskTitle: string;
  riskDescription: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  severity: number;
  mitigationPlan?: string;
  status: 'identified' | 'monitoring' | 'mitigated' | 'realized';
  identifiedBy: string;
  identifiedDate: string;
  lastReviewed?: string;
}

export interface GoalDependency {
  id: string;
  goalId: string;
  dependsOnGoalId: string;
  dependsOnGoalTitle: string;
  dependencyType: 'blocks' | 'required_for' | 'related_to' | 'contributes_to';
  description?: string;
  isResolved: boolean;
}

export interface GoalCollaborator {
  id: string;
  goalId: string;
  employeeId: string;
  employeeName: string;
  role: 'owner' | 'contributor' | 'reviewer' | 'stakeholder';
  permissions: string[];
  addedBy: string;
  addedDate: string;
}

export interface GoalAttachment {
  id: string;
  goalId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  description?: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedDate: string;
}

export interface GoalComment {
  id: string;
  goalId: string;
  keyResultId?: string;
  userId: string;
  userName: string;
  comment: string;
  isPrivate: boolean;
  mentions: string[];
  reactions: CommentReaction[];
  createdDate: string;
  lastModified?: string;
}

export interface CommentReaction {
  userId: string;
  userName: string;
  emoji: string;
  createdDate: string;
}

export interface GoalCycle {
  id: string;
  cycleCode: string;
  cycleName: string;
  cycleType: 'annual' | 'semi_annual' | 'quarterly' | 'monthly' | 'custom';
  fiscalYear: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  description?: string;
  isActive: boolean;
  goalCount: number;
  completionRate: number;
  applicableTo: {
    departments?: string[];
    locations?: string[];
    levels?: string[];
    employees?: string[];
  };
  milestones: CycleMilestone[];
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface CycleMilestone {
  id: string;
  title: string;
  date: string;
  description: string;
  isCompleted: boolean;
}

export interface GoalTemplate {
  id: string;
  templateCode: string;
  templateName: string;
  description: string;
  goalType: GoalType;
  category: GoalCategory;
  suggestedTitle: string;
  suggestedDescription: string;
  keyResultTemplates: KeyResultTemplate[];
  suggestedDuration: number;
  suggestedCheckInFrequency: CheckInFrequency;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  rating?: number;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface KeyResultTemplate {
  title: string;
  description: string;
  measurementType: MeasurementType;
  suggestedTarget: string;
  unit?: string;
}

export interface GoalAlignment {
  id: string;
  sourceGoalId: string;
  sourceGoalTitle: string;
  targetGoalId: string;
  targetGoalTitle: string;
  alignmentType: 'cascaded' | 'supporting' | 'related' | 'dependent';
  alignmentStrength: 'strong' | 'moderate' | 'weak';
  description?: string;
  createdBy: string;
  createdDate: string;
}

export interface GoalReview {
  id: string;
  reviewCode: string;
  goalId: string;
  goalTitle: string;
  reviewerId: string;
  reviewerName: string;
  reviewDate: string;
  overallRating: number;
  progressRating: number;
  qualityRating: number;
  impactRating: number;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  feedback: string;
  status: 'draft' | 'submitted' | 'acknowledged';
  acknowledgedBy?: string;
  acknowledgedDate?: string;
  createdDate: string;
}

export interface GoalNotification {
  id: string;
  notificationType: 'check_in_reminder' | 'goal_due_soon' | 'goal_overdue' | 'feedback_received' | 'alignment_changed' | 'milestone_completed' | 'comment_added';
  recipientId: string;
  recipientName: string;
  title: string;
  message: string;
  relatedGoalId?: string;
  relatedCheckInId?: string;
  isRead: boolean;
  readDate?: string;
  actionUrl?: string;
  createdDate: string;
}

export interface GoalAnalytics {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  onTrackGoals: number;
  atRiskGoals: number;
  behindGoals: number;
  averageProgress: number;
  completionRate: number;
  averageHealthScore: number;
  goalsByType: { type: GoalType; count: number; completionRate: number }[];
  goalsByCategory: { category: GoalCategory; count: number; completionRate: number }[];
  goalsByStatus: { status: GoalStatus; count: number }[];
  goalsByDepartment: { departmentId: string; departmentName: string; goals: number; completionRate: number }[];
  topPerformers: { employeeId: string; employeeName: string; goals: number; completionRate: number; averageProgress: number }[];
  alignmentScore: number;
  checkInCompliance: number;
  averageCheckInFrequency: number;
  cycleProgress: { cycleId: string; cycleName: string; progress: number; goals: number }[];
  keyResultMetrics: {
    totalKeyResults: number;
    completedKeyResults: number;
    completionRate: number;
    averageProgress: number;
  };
  trends: {
    period: string;
    goalsCreated: number;
    goalsCompleted: number;
    averageProgress: number;
  }[];
}

export interface GoalSettings {
  enableGoalManagement: boolean;
  enableOKRs: boolean;
  enableGoalAlignment: boolean;
  enableGoalTemplates: boolean;
  requireGoalApproval: boolean;
  approvalRequired: boolean;
  approvalLevels: number;
  defaultCycleDuration: number;
  defaultCheckInFrequency: CheckInFrequency;
  mandatoryCheckIns: boolean;
  checkInReminderDays: number;
  enablePrivateGoals: boolean;
  enableGoalCollaboration: boolean;
  enableGoalComments: boolean;
  enableGoalReviews: boolean;
  enableSMARTValidation: boolean;
  minKeyResults: number;
  maxKeyResults: number;
  defaultGoalVisibility: GoalVisibility;
  allowCascading: boolean;
  maxGoalDepth: number;
  enableNotifications: boolean;
  notifyOnCheckInDue: boolean;
  notifyOnGoalDue: boolean;
  notifyOnFeedback: boolean;
  goalDueSoonDays: number;
  enableGoalWeighting: boolean;
  enableRiskTracking: boolean;
  enableDependencyTracking: boolean;
  fiscalYearStart: string;
  defaultCurrency: string;
}

export interface GoalAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'created' | 'updated' | 'deleted' | 'checked_in' | 'completed' | 'aligned' | 'commented' | 'reviewed';
  entityType: 'goal' | 'key_result' | 'check_in' | 'alignment' | 'review';
  entityId: string;
  details: string;
  changes?: { field: string; oldValue: any; newValue: any }[];
  ipAddress?: string;
}

export interface GoalDashboard {
  employeeId: string;
  employeeName: string;
  activeGoals: number;
  completedGoals: number;
  averageProgress: number;
  onTrackGoals: number;
  atRiskGoals: number;
  overdueCheckIns: number;
  upcomingDeadlines: {
    goalId: string;
    goalTitle: string;
    dueDate: string;
    daysRemaining: number;
  }[];
  recentCheckIns: GoalCheckIn[];
  alignmentMap: {
    companyGoals: number;
    departmentGoals: number;
    teamGoals: number;
    personalGoals: number;
  };
  performanceSummary: {
    currentCycle: string;
    goalsCompleted: number;
    averageRating: number;
    topAchievements: string[];
  };
}

export interface GoalReport {
  id: string;
  reportType: 'individual' | 'team' | 'department' | 'company' | 'cycle' | 'custom';
  reportName: string;
  periodStart: string;
  periodEnd: string;
  filters: { [key: string]: any };
  data: any[];
  summary: { [key: string]: any };
  generatedBy: string;
  generatedDate: string;
  fileUrl?: string;
}
/**
 * Toast notification shape — used by the dashboard's Toast/useToast
 * components. Kept consistent across dashboards: id, type, message,
 * optional duration in ms.
 */
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
