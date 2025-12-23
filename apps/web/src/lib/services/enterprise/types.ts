/**
 * Enterprise Features Types
 * Phase 4: Enterprise Expansion - Multi-Entity & Workflows
 */

// ============================================================================
// MULTI-ENTITY MANAGEMENT
// ============================================================================

export type EntityType = 'HOLDING' | 'COMPANY' | 'SUBSIDIARY' | 'BRANCH' | 'DEPARTMENT' | 'COST_CENTER';

export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ARCHIVED';

export interface LegalEntity {
  id: string;
  tenantId: string;
  parentId?: string;
  type: EntityType;
  status: EntityStatus;

  // Basic Info
  name: string;
  nameAr: string;
  code: string;
  legalName: string;
  legalNameAr?: string;

  // Registration
  registrationNumber?: string;
  taxNumber?: string;
  commercialLicense?: string;
  establishmentDate?: Date;

  // Location
  country: string;
  region?: string;
  city?: string;
  address?: string;
  addressAr?: string;

  // Contact
  email?: string;
  phone?: string;
  fax?: string;
  website?: string;

  // Financial
  currency: string;
  fiscalYearStart: number; // Month (1-12)
  timezone: string;

  // HR Settings
  defaultWorkWeek: string[]; // ['SUN', 'MON', 'TUE', 'WED', 'THU']
  defaultWorkHours: number;
  payrollCycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  leavePolicy?: string;

  // Statutory
  gosiNumber?: string; // Saudi
  molNumber?: string; // UAE MOL
  epfNumber?: string; // India EPF
  esiNumber?: string; // India ESI

  // Hierarchy
  level: number;
  path: string; // e.g., '/holding1/company1/branch1'
  childCount: number;
  employeeCount: number;

  // Consolidation
  consolidationEntity?: boolean;
  reportingCurrency?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface EntityHierarchy {
  entity: LegalEntity;
  children: EntityHierarchy[];
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    totalPayroll: number;
    headcountChange: number;
  };
}

export interface EntityTransfer {
  id: string;
  employeeId: string;
  employeeName: string;

  // Source
  sourceEntityId: string;
  sourceEntityName: string;
  sourceDepartment?: string;
  sourcePosition?: string;

  // Target
  targetEntityId: string;
  targetEntityName: string;
  targetDepartment?: string;
  targetPosition?: string;

  // Details
  transferType: 'PERMANENT' | 'TEMPORARY' | 'SECONDMENT' | 'DEPUTATION';
  effectiveDate: Date;
  endDate?: Date;
  reason: string;

  // Compensation
  salaryChange?: 'NO_CHANGE' | 'INCREASE' | 'DECREASE';
  newSalary?: number;

  // Approvals
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  approvals: TransferApproval[];

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface TransferApproval {
  level: number;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments?: string;
  actionDate?: Date;
}

// ============================================================================
// WORKFLOW ENGINE
// ============================================================================

export type WorkflowType =
  | 'LEAVE_REQUEST'
  | 'EXPENSE_CLAIM'
  | 'TIMESHEET'
  | 'OVERTIME'
  | 'SALARY_REVISION'
  | 'PROMOTION'
  | 'TRANSFER'
  | 'RESIGNATION'
  | 'TERMINATION'
  | 'ONBOARDING'
  | 'OFFBOARDING'
  | 'LOAN_REQUEST'
  | 'ASSET_REQUEST'
  | 'TRAVEL_REQUEST'
  | 'CUSTOM';

export type WorkflowStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';

export type ApprovalType = 'SEQUENTIAL' | 'PARALLEL' | 'ANY_ONE' | 'ALL';

export type ConditionOperator = 'EQ' | 'NE' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'IN' | 'NOT_IN' | 'CONTAINS' | 'BETWEEN';

export interface WorkflowDefinition {
  id: string;
  tenantId: string;
  entityIds?: string[]; // Specific entities or all

  // Basic Info
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  type: WorkflowType;
  status: WorkflowStatus;

  // Versioning
  version: number;
  publishedVersion?: number;
  isDraft: boolean;

  // Steps
  steps: WorkflowStep[];
  transitions: WorkflowTransition[];

  // SLA
  slaHours?: number;
  escalationEnabled: boolean;
  escalationRules?: EscalationRule[];

  // Notifications
  notifications: WorkflowNotification[];

  // Conditions
  triggerConditions?: WorkflowCondition[];

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  nameAr: string;
  order: number;
  type: 'START' | 'APPROVAL' | 'REVIEW' | 'TASK' | 'NOTIFICATION' | 'CONDITION' | 'END';

  // Approval Settings
  approvalType?: ApprovalType;
  approvers?: ApproverConfig[];
  minApprovals?: number; // For PARALLEL/ANY_ONE

  // Task Settings
  taskConfig?: {
    assignee: ApproverConfig;
    dueInHours?: number;
    instructions?: string;
    instructionsAr?: string;
    requiredFields?: string[];
  };

  // Condition Settings
  conditionConfig?: {
    conditions: WorkflowCondition[];
    trueTransition: string; // Step ID
    falseTransition: string; // Step ID
  };

  // Actions
  onEnterActions?: WorkflowAction[];
  onExitActions?: WorkflowAction[];

  // Display
  position: { x: number; y: number };
  color?: string;
}

export interface ApproverConfig {
  type: 'SPECIFIC_USER' | 'ROLE' | 'DEPARTMENT_HEAD' | 'REPORTING_MANAGER' | 'SKIP_LEVEL_MANAGER' | 'HR' | 'DYNAMIC';
  userId?: string;
  roleId?: string;
  dynamicField?: string; // Field path for dynamic approver
  fallbackType?: ApproverConfig['type'];
  fallbackUserId?: string;
}

export interface WorkflowTransition {
  id: string;
  fromStepId: string;
  toStepId: string;
  label?: string;
  labelAr?: string;
  conditions?: WorkflowCondition[];
  isDefault?: boolean;
}

export interface WorkflowCondition {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: any;
  valueType: 'STATIC' | 'FIELD' | 'FORMULA';
  conjunction?: 'AND' | 'OR';
}

export interface WorkflowAction {
  id: string;
  type: 'SEND_EMAIL' | 'SEND_SMS' | 'SEND_NOTIFICATION' | 'UPDATE_FIELD' | 'CALL_API' | 'CREATE_TASK' | 'TRIGGER_WORKFLOW';
  config: Record<string, any>;
}

export interface EscalationRule {
  id: string;
  afterHours: number;
  action: 'REMIND' | 'ESCALATE' | 'AUTO_APPROVE' | 'AUTO_REJECT';
  escalateTo?: ApproverConfig;
  notifyOriginal?: boolean;
  maxReminders?: number;
}

export interface WorkflowNotification {
  event: 'SUBMITTED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'COMPLETED' | 'CANCELLED';
  recipients: ('REQUESTER' | 'APPROVER' | 'HR' | 'MANAGER' | 'CUSTOM')[];
  customRecipients?: string[];
  channels: ('EMAIL' | 'SMS' | 'PUSH' | 'IN_APP')[];
  template?: string;
}

// ============================================================================
// WORKFLOW INSTANCES
// ============================================================================

export interface WorkflowInstance {
  id: string;
  tenantId: string;
  workflowId: string;
  workflowName: string;
  workflowType: WorkflowType;
  version: number;

  // Request
  requesterId: string;
  requesterName: string;
  requesterDepartment?: string;
  entityId: string;
  entityName: string;

  // Reference
  referenceType: string; // e.g., 'LeaveRequest', 'ExpenseClaim'
  referenceId: string;
  referenceNumber?: string;

  // Data
  requestData: Record<string, any>;

  // Status
  status: 'IN_PROGRESS' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  currentStepId: string;
  currentStepName: string;

  // Tracking
  stepHistory: StepExecution[];
  currentApprovers: PendingApprover[];

  // SLA
  slaDeadline?: Date;
  isOverdue: boolean;

  // Timestamps
  submittedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StepExecution {
  stepId: string;
  stepName: string;
  stepType: WorkflowStep['type'];
  status: 'COMPLETED' | 'SKIPPED' | 'REJECTED';
  enteredAt: Date;
  exitedAt?: Date;
  duration?: number; // milliseconds
  actor?: {
    userId: string;
    userName: string;
    action: 'APPROVE' | 'REJECT' | 'DELEGATE' | 'AUTO';
    comments?: string;
  };
}

export interface PendingApprover {
  userId: string;
  userName: string;
  email?: string;
  role: string;
  assignedAt: Date;
  dueAt?: Date;
  reminderSent?: boolean;
  escalated?: boolean;
}

export interface WorkflowTask {
  id: string;
  instanceId: string;
  stepId: string;

  // Assignment
  assigneeId: string;
  assigneeName: string;
  delegatedFrom?: string;

  // Task Details
  type: 'APPROVAL' | 'REVIEW' | 'TASK';
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  // Reference
  workflowType: WorkflowType;
  referenceType: string;
  referenceId: string;
  requesterId: string;
  requesterName: string;

  // Status
  status: 'PENDING' | 'COMPLETED' | 'DELEGATED' | 'EXPIRED';

  // Actions
  availableActions: ('APPROVE' | 'REJECT' | 'DELEGATE' | 'REQUEST_INFO' | 'COMPLETE')[];

  // Dates
  dueAt?: Date;
  assignedAt: Date;
  completedAt?: Date;

  // Data
  requestData: Record<string, any>;
}

// ============================================================================
// DELEGATION
// ============================================================================

export interface DelegationRule {
  id: string;
  tenantId: string;
  delegatorId: string;
  delegatorName: string;

  // Delegate
  delegateId: string;
  delegateName: string;

  // Scope
  workflowTypes?: WorkflowType[]; // Empty = all
  entityIds?: string[]; // Empty = all

  // Duration
  startDate: Date;
  endDate: Date;
  isActive: boolean;

  // Settings
  notifyDelegator: boolean;
  allowSubDelegation: boolean;

  // Reason
  reason?: string;

  createdAt: Date;
  createdBy: string;
}

// ============================================================================
// AUDIT & ANALYTICS
// ============================================================================

export interface WorkflowAudit {
  id: string;
  instanceId: string;
  action: 'CREATED' | 'SUBMITTED' | 'STEP_ENTERED' | 'STEP_COMPLETED' | 'APPROVED' | 'REJECTED' | 'DELEGATED' | 'ESCALATED' | 'CANCELLED' | 'COMPLETED';
  performedBy: string;
  performedByName: string;
  stepId?: string;
  stepName?: string;
  previousStatus?: string;
  newStatus?: string;
  comments?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface WorkflowAnalytics {
  tenantId: string;
  period: string;

  // Volume
  totalInstances: number;
  pendingInstances: number;
  completedInstances: number;
  rejectedInstances: number;

  // By Type
  byType: {
    type: WorkflowType;
    count: number;
    approved: number;
    rejected: number;
    avgDuration: number;
  }[];

  // Performance
  avgApprovalTime: number; // hours
  avgCycleTime: number; // hours
  slaCompliance: number; // percentage
  onTimeRate: number; // percentage

  // Bottlenecks
  bottlenecks: {
    stepId: string;
    stepName: string;
    workflowType: WorkflowType;
    avgDuration: number;
    pendingCount: number;
  }[];

  // Top Approvers
  topApprovers: {
    userId: string;
    userName: string;
    approvalCount: number;
    avgResponseTime: number;
  }[];

  generatedAt: Date;
}
