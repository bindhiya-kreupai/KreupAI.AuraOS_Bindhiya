/**
 * Manager Self-Service (MSS) Module - Type Definitions
 * Comprehensive types for manager operations, team management, approvals, and delegation
 */

// ============================================================================
// Common Types
// ============================================================================

export type Status = 'active' | 'inactive' | 'pending' | 'archived' | 'suspended';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'escalated';
export type Period = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface AuditInfo {
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

// ============================================================================
// Team Dashboard Types
// ============================================================================

export interface TeamMember {
  id: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  dateOfJoining: Date;
  status: Status;
  profilePicture?: string;

  // Work Information
  location: string;
  reportingTo: string;
  workMode: 'office' | 'remote' | 'hybrid';
  shift: string;

  // Performance & Engagement
  performanceRating: number; // 1-5
  lastReviewDate: Date;
  nextReviewDate: Date;
  engagementScore: number; // 0-100

  // Attendance & Leave
  attendanceRate: number; // 0-100
  leaveBalance: LeaveBalance;
  currentStatus: EmployeeCurrentStatus;

  // Skills & Development
  skills: Skill[];
  certifications: Certification[];
  developmentGoals: DevelopmentGoal[];

  // Compensation (summary view for managers)
  compensationBand: string;
  lastIncrement: Date;
  nextReviewEligibility: Date;
}

export interface LeaveBalance {
  annual: number;
  sick: number;
  casual: number;
  compensatory: number;
  unpaid: number;
  total: number;
}

export interface EmployeeCurrentStatus {
  type: 'working' | 'on_leave' | 'on_travel' | 'wfh' | 'half_day' | 'absent';
  statusDate: Date;
  remarks?: string;
}

export interface Skill {
  skillName: string;
  skillCategory: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  lastAssessed: Date;
  certificationRequired: boolean;
}

export interface Certification {
  certificationName: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  status: 'active' | 'expired' | 'pending_renewal';
}

export interface DevelopmentGoal {
  goalId: string;
  goalDescription: string;
  targetCompletionDate: Date;
  progress: number; // 0-100
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  milestones: Milestone[];
}

export interface Milestone {
  milestoneId: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  completedDate?: Date;
}

export interface TeamMetrics {
  teamId: string;
  teamName: string;
  managerId: string;
  managerName: string;
  period: Period;
  periodStart: Date;
  periodEnd: Date;

  // Team Composition
  totalHeadcount: number;
  activeEmployees: number;
  newJoiners: number;
  separations: number;

  // Attendance Metrics
  averageAttendance: number; // 0-100
  totalAbsences: number;
  totalLateComings: number;

  // Performance Metrics
  averagePerformanceRating: number; // 1-5
  highPerformers: number; // Rating >= 4
  lowPerformers: number; // Rating < 2.5

  // Engagement Metrics
  averageEngagementScore: number; // 0-100
  atRiskEmployees: number; // Engagement < 50

  // Leave Metrics
  totalLeavesTaken: number;
  averageLeaveUtilization: number; // 0-100
  pendingLeaveRequests: number;

  // Goals & Development
  goalsOnTrack: number;
  goalsOverdue: number;
  totalActiveGoals: number;

  // Other
  pendingApprovals: number;
  pendingReviews: number;
}

export interface TeamGoal {
  goalId: string;
  goalCode: string;
  goalName: string;
  description: string;
  goalType: 'performance' | 'project' | 'development' | 'operational';
  priority: Priority;
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'on_hold';

  // Timeline
  startDate: Date;
  targetDate: Date;
  completionDate?: Date;

  // Progress
  progress: number; // 0-100
  progressUpdates: ProgressUpdate[];

  // Measurement
  measurementCriteria: string;
  targetValue: number;
  currentValue: number;
  unit: string;

  // Assignment
  assignedTo: string[]; // Employee IDs
  champion?: string; // Primary owner

  // Dependencies
  dependencies: GoalDependency[];
  milestones: Milestone[];

  // Alignment
  alignedToCompanyGoal?: string;
  alignedToDepartmentGoal?: string;

  // Audit
  audit: AuditInfo;
}

export interface ProgressUpdate {
  updateId: string;
  updateDate: Date;
  updatedBy: string;
  previousValue: number;
  currentValue: number;
  progress: number;
  remarks: string;
  attachments?: string[];
}

export interface GoalDependency {
  dependentGoalId: string;
  dependentGoalName: string;
  dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish';
  status: 'pending' | 'resolved' | 'blocked';
}

// ============================================================================
// Approval Center Types
// ============================================================================

export interface ApprovalRequest {
  requestId: string;
  requestCode: string;
  requestType: ApprovalRequestType;
  requestTitle: string;
  requestDate: Date;

  // Requester Information
  requestedBy: string;
  requestedByName: string;
  requestedByDepartment: string;

  // Approval Information
  approvalStatus: ApprovalStatus;
  priority: Priority;
  dueDate?: Date;

  // Current Approver
  currentApproverId: string;
  currentApproverLevel: number;

  // Approval Flow
  approvalWorkflow: ApprovalWorkflowStep[];

  // Request Details (polymorphic based on type)
  details: LeaveApprovalDetails | ExpenseApprovalDetails | RequisitionApprovalDetails | TimesheetApprovalDetails | any;

  // Comments & History
  comments: ApprovalComment[];
  history: ApprovalHistory[];

  // Documents
  attachments: Attachment[];

  // Audit
  audit: AuditInfo;
}

export type ApprovalRequestType =
  | 'leave'
  | 'expense'
  | 'requisition'
  | 'timesheet'
  | 'overtime'
  | 'advance'
  | 'reimbursement'
  | 'travel'
  | 'purchase'
  | 'recruitment';

export interface ApprovalWorkflowStep {
  stepNumber: number;
  stepName: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: ApprovalStatus;
  approvalDate?: Date;
  remarks?: string;
  delegatedTo?: string;
  escalated: boolean;
}

export interface LeaveApprovalDetails {
  leaveId: string;
  leaveType: string;
  fromDate: Date;
  toDate: Date;
  totalDays: number;
  reason: string;
  contactDuringLeave: string;
  workHandoverTo?: string;
  emergencyContact: string;
  leaveBalance: LeaveBalance;
}

export interface ExpenseApprovalDetails {
  expenseId: string;
  expenseCategory: string;
  totalAmount: number;
  currency: string;
  expenseDate: Date;
  businessPurpose: string;
  project?: string;
  costCenter: string;
  lineItems: ExpenseLineItem[];
  receiptAvailable: boolean;
  budgetImpact: BudgetImpact;
}

export interface ExpenseLineItem {
  lineNumber: number;
  description: string;
  category: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  receiptNumber?: string;
}

export interface BudgetImpact {
  budgetId: string;
  budgetName: string;
  budgetedAmount: number;
  spentAmount: number;
  thisExpense: number;
  remainingAfterApproval: number;
  utilizationPercentage: number;
}

export interface RequisitionApprovalDetails {
  requisitionId: string;
  requisitionType: 'employee' | 'consultant' | 'intern' | 'contractor';
  positionTitle: string;
  department: string;
  location: string;
  headcount: number;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'temporary';

  // Justification
  businessJustification: string;
  replacementFor?: string;
  isReplacement: boolean;

  // Timeline
  requestedStartDate: Date;
  urgency: Priority;

  // Budget
  budgetedSalaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  additionalCosts: number;
  totalCost: number;
  budgetApproved: boolean;

  // Requirements
  requiredSkills: string[];
  experienceRequired: string;
  qualifications: string[];
}

export interface TimesheetApprovalDetails {
  timesheetId: string;
  employeeId: string;
  employeeName: string;
  periodStart: Date;
  periodEnd: Date;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  entries: TimesheetEntry[];
  violations: TimesheetViolation[];
}

export interface TimesheetEntry {
  entryDate: Date;
  projectCode: string;
  projectName: string;
  taskDescription: string;
  hours: number;
  isOvertime: boolean;
  isBillable: boolean;
}

export interface TimesheetViolation {
  violationType: 'missing_entry' | 'excessive_hours' | 'weekend_work_unapproved' | 'project_not_assigned';
  violationDate: Date;
  description: string;
  severity: 'info' | 'warning' | 'error';
}

export interface ApprovalComment {
  commentId: string;
  commentedBy: string;
  commentedByName: string;
  commentDate: Date;
  commentText: string;
  isInternal: boolean;
}

export interface ApprovalHistory {
  historyId: string;
  action: 'submitted' | 'approved' | 'rejected' | 'withdrawn' | 'escalated' | 'delegated' | 'commented';
  actionBy: string;
  actionByName: string;
  actionDate: Date;
  fromStatus?: ApprovalStatus;
  toStatus?: ApprovalStatus;
  remarks?: string;
}

export interface Attachment {
  attachmentId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedDate: Date;
  fileUrl: string;
}

export interface ApprovalSummary {
  managerId: string;
  managerName: string;

  // Counts by Status
  totalPending: number;
  totalApproved: number;
  totalRejected: number;

  // Counts by Type
  leaveRequests: number;
  expenseRequests: number;
  requisitionRequests: number;
  timesheetRequests: number;
  otherRequests: number;

  // Counts by Priority
  criticalRequests: number;
  highPriorityRequests: number;

  // SLA Tracking
  overdueRequests: number;
  dueTodayRequests: number;

  // Performance
  averageApprovalTime: number; // hours
  oldestPendingRequest?: Date;
}

// ============================================================================
// Team Reports Types
// ============================================================================

export interface TeamReport {
  reportId: string;
  reportCode: string;
  reportName: string;
  reportType: ReportType;
  description: string;

  // Report Configuration
  generatedFor: string; // Team/Manager ID
  generatedForName: string;
  period: Period;
  periodStart: Date;
  periodEnd: Date;

  // Report Data
  reportData: PerformanceReportData | AttendanceReportData | CompensationReportData | SkillsGapReportData | any;

  // Visualization
  charts: ReportChart[];

  // Status
  status: 'draft' | 'generated' | 'published' | 'archived';
  generatedDate: Date;
  generatedBy: string;

  // Access
  sharedWith: string[];
  isConfidential: boolean;

  // Export
  exportFormats: ('pdf' | 'excel' | 'csv' | 'pptx')[];
  lastExported?: Date;

  // Audit
  audit: AuditInfo;
}

export type ReportType =
  | 'performance'
  | 'attendance'
  | 'leave'
  | 'compensation'
  | 'skills_gap'
  | 'engagement'
  | 'productivity'
  | 'goal_achievement'
  | 'custom';

export interface PerformanceReportData {
  teamId: string;
  teamName: string;
  totalEmployees: number;

  // Performance Distribution
  performanceDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];

  // Individual Performance
  employeePerformance: {
    employeeId: string;
    employeeName: string;
    currentRating: number;
    previousRating: number;
    trend: 'improving' | 'stable' | 'declining';
    goalsAchieved: number;
    totalGoals: number;
    achievementRate: number;
  }[];

  // Team Metrics
  averageRating: number;
  topPerformers: string[]; // Employee IDs
  needsImprovement: string[]; // Employee IDs

  // Goals Summary
  totalTeamGoals: number;
  goalsCompleted: number;
  goalsOnTrack: number;
  goalsAtRisk: number;
  goalsOverdue: number;
}

export interface AttendanceReportData {
  teamId: string;
  teamName: string;
  totalWorkingDays: number;

  // Attendance Summary
  averageAttendance: number;
  perfectAttendance: string[]; // Employee IDs

  // Individual Attendance
  employeeAttendance: {
    employeeId: string;
    employeeName: string;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    halfDays: number;
    attendanceRate: number;
    punctualityScore: number;
  }[];

  // Leave Analysis
  totalLeavesTaken: number;
  leavesByType: {
    leaveType: string;
    count: number;
    totalDays: number;
  }[];

  // Trends
  attendanceTrend: {
    period: string;
    attendanceRate: number;
  }[];
}

export interface CompensationReportData {
  teamId: string;
  teamName: string;
  totalEmployees: number;

  // Compensation Summary
  totalCompensation: number;
  averageCompensation: number;
  medianCompensation: number;

  // Distribution
  compensationBands: {
    band: string;
    count: number;
    minSalary: number;
    maxSalary: number;
    avgSalary: number;
  }[];

  // Individual Compensation (anonymized for privacy)
  employeeCompensation: {
    employeeId: string;
    employeeName: string;
    band: string;
    lastIncrementDate: Date;
    lastIncrementPercent: number;
    nextReviewDate: Date;
    isEligibleForReview: boolean;
  }[];

  // Budget Impact
  budgetAllocated: number;
  budgetUtilized: number;
  budgetRemaining: number;
  upcomingReviews: number;
  projectedIncrements: number;
}

export interface SkillsGapReportData {
  teamId: string;
  teamName: string;

  // Skills Inventory
  skillsInventory: {
    skillName: string;
    skillCategory: string;
    requiredCount: number;
    availableCount: number;
    gap: number;
    criticalSkill: boolean;
  }[];

  // Employee Skills
  employeeSkills: {
    employeeId: string;
    employeeName: string;
    totalSkills: number;
    advancedSkills: number;
    skillsToAcquire: string[];
    skillsDeveloping: string[];
  }[];

  // Training Recommendations
  trainingRecommendations: {
    skillName: string;
    priority: Priority;
    affectedEmployees: string[];
    suggestedCourses: string[];
    estimatedCost: number;
    estimatedDuration: number; // hours
  }[];

  // Certifications
  certificationsExpiring: {
    employeeId: string;
    employeeName: string;
    certificationName: string;
    expiryDate: Date;
    renewalRequired: boolean;
  }[];
}

export interface ReportChart {
  chartId: string;
  chartType: 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'scatter' | 'heatmap';
  chartTitle: string;
  chartData: any; // Flexible structure for chart library
  position: number;
}

// ============================================================================
// Delegation Types
// ============================================================================

export interface DelegationRule {
  delegationId: string;
  delegationCode: string;
  delegationName: string;
  status: 'active' | 'inactive' | 'expired' | 'revoked';

  // Delegation Period
  startDate: Date;
  endDate: Date;
  isTemporary: boolean;

  // Parties
  delegatorId: string;
  delegatorName: string;
  delegateId: string;
  delegateName: string;

  // Scope
  delegationType: DelegationType;
  delegationScope: DelegationScope[];

  // Authority Limits
  limits: AuthorityLimit[];

  // Conditions
  conditions: DelegationCondition[];
  autoActivate: boolean;
  requiresApproval: boolean;

  // Notifications
  notifyDelegator: boolean;
  notifyDelegate: boolean;
  escalationRules: EscalationRule[];

  // Usage Tracking
  activations: DelegationActivation[];
  actionsPerformed: DelegationAction[];

  // Audit
  audit: AuditInfo;
  approvedBy?: string;
  approvalDate?: Date;
  revocationReason?: string;
}

export type DelegationType =
  | 'full_authority'
  | 'approvals_only'
  | 'specific_functions'
  | 'expense_approval'
  | 'leave_approval'
  | 'timesheet_approval'
  | 'requisition_approval'
  | 'custom';

export interface DelegationScope {
  scopeId: string;
  scopeType: 'function' | 'department' | 'project' | 'approval_type' | 'employee_group';
  scopeValue: string;
  scopeDescription: string;
  included: boolean; // true = include, false = exclude
}

export interface AuthorityLimit {
  limitType: 'amount' | 'count' | 'level' | 'time';
  limitValue: number;
  limitUnit: string;
  limitDescription: string;
}

export interface DelegationCondition {
  conditionId: string;
  conditionType: 'date_range' | 'amount_threshold' | 'approval_type' | 'custom';
  conditionOperator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  conditionValue: any;
  conditionDescription: string;
}

export interface EscalationRule {
  ruleId: string;
  triggerCondition: string;
  escalateTo: string;
  escalateToName: string;
  escalationDelay: number; // hours
  notificationTemplate: string;
}

export interface DelegationActivation {
  activationId: string;
  activationDate: Date;
  deactivationDate?: Date;
  reason: string;
  triggeredBy: 'manual' | 'auto' | 'scheduled';
  isActive: boolean;
}

export interface DelegationAction {
  actionId: string;
  actionDate: Date;
  actionType: string;
  actionDescription: string;
  performedBy: string; // Should be delegateId
  originalRequest: string; // Reference to approval request
  actionTaken: 'approved' | 'rejected' | 'forwarded' | 'commented';
  withinAuthority: boolean;
}

export interface DelegationSettings {
  settingsId: string;
  managerId: string;

  // Auto-Delegation Rules
  enableAutoDelegation: boolean;
  autoDelegateOnLeave: boolean;
  autoDelegateOnTravel: boolean;
  defaultDelegateId?: string;

  // Notification Preferences
  notifyOnDelegation: boolean;
  notifyOnDelegateAction: boolean;
  dailyDigest: boolean;

  // Approval Preferences
  requireApprovalForDelegation: boolean;
  maxDelegationDuration: number; // days
  allowChainDelegation: boolean;

  // Audit
  audit: AuditInfo;
}

export interface DelegationSummary {
  managerId: string;
  managerName: string;

  // Active Delegations
  activeDelegations: number;
  delegationsCreated: number;
  delegationsReceived: number;

  // Actions
  actionsPerformedByDelegates: number;
  actionsPerformedAsDelegete: number;

  // Expiring Soon
  expiringSoon: DelegationRule[]; // Within 7 days

  // Performance
  averageResponseTimeWhenDelegated: number; // hours
  complianceRate: number; // Actions within authority %
}

// ============================================================================
// Manager Analytics
// ============================================================================

export interface ManagerAnalytics {
  managerId: string;
  managerName: string;
  department: string;
  period: Period;
  periodStart: Date;
  periodEnd: Date;

  // Team Overview
  teamMetrics: TeamMetrics;

  // Approval Performance
  approvalMetrics: {
    totalApprovalsProcessed: number;
    averageApprovalTime: number; // hours
    approvedCount: number;
    rejectedCount: number;
    approvalRate: number; // %
    slaCompliance: number; // %
  };

  // Team Performance
  performanceMetrics: {
    averageRating: number;
    ratingDistribution: { rating: number; count: number }[];
    goalsAchievementRate: number;
    topPerformersCount: number;
    improvementNeededCount: number;
  };

  // Engagement & Retention
  engagementMetrics: {
    averageEngagementScore: number;
    atRiskEmployees: number;
    newJoinersRetained: number;
    separationRate: number;
  };

  // Development & Growth
  developmentMetrics: {
    trainingHoursCompleted: number;
    certificationsAchieved: number;
    skillGapsClosed: number;
    promotionsFromTeam: number;
  };

  // Delegation Usage
  delegationMetrics: {
    activeDelegations: number;
    delegationUsageRate: number;
    averageDelegationDuration: number; // days
  };
}

// ============================================================================
// Manager Self-Service Settings
// ============================================================================

export interface ManagerSettings {
  settingsId: string;
  managerId: string;

  // Dashboard Preferences
  dashboardLayout: DashboardWidget[];
  defaultView: 'overview' | 'team' | 'approvals' | 'reports';
  refreshInterval: number; // minutes

  // Notification Preferences
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    notifyOnNewApproval: boolean;
    notifyOnApprovalOverdue: boolean;
    notifyOnTeamMilestone: boolean;
    notifyOnPerformanceAlert: boolean;
    dailyDigest: boolean;
    weeklyDigest: boolean;
  };

  // Approval Preferences
  approvalSettings: {
    autoApproveUnder?: number; // Amount threshold
    requireCommentsOnRejection: boolean;
    allowBulkApproval: boolean;
    escalationTimeout: number; // hours
  };

  // Report Preferences
  reportSettings: {
    favoriteReports: string[];
    autoGenerateReports: boolean;
    reportFrequency: Period;
    reportDeliveryEmail: string;
  };

  // Delegation Settings
  delegationSettings: DelegationSettings;

  // Audit
  audit: AuditInfo;
}

export interface DashboardWidget {
  widgetId: string;
  widgetType: 'team_metrics' | 'pending_approvals' | 'performance_chart' | 'attendance_summary' | 'goals_progress' | 'announcements';
  widgetTitle: string;
  position: { row: number; col: number; width: number; height: number };
  visible: boolean;
  configuration: any; // Widget-specific config
}
