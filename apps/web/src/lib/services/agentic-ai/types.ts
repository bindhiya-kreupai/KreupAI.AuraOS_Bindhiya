/**
 * Agentic AI Types and Interfaces
 * Phase 4 Sprint 31-32: Autonomous AI Agent Framework
 */

// ============================================================================
// AGENT TYPES
// ============================================================================

export type AgentType = 'HR_AGENT' | 'RECRUITMENT_AGENT' | 'ANALYTICS_AGENT';

export type AgentStatus = 'IDLE' | 'PROCESSING' | 'WAITING_INPUT' | 'EXECUTING' | 'COMPLETED' | 'ERROR';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type ActionType =
  | 'QUERY_DATA'
  | 'UPDATE_RECORD'
  | 'CREATE_RECORD'
  | 'SEND_NOTIFICATION'
  | 'GENERATE_REPORT'
  | 'SCHEDULE_MEETING'
  | 'APPROVE_REQUEST'
  | 'ESCALATE'
  | 'DELEGATE';

// ============================================================================
// AGENT DEFINITION
// ============================================================================

export interface AgentDefinition {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  capabilities: AgentCapability[];
  permissions: AgentPermission[];
  configuration: AgentConfiguration;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  intents: string[];
  actions: ActionType[];
  requiredPermissions: string[];
  parameters?: AgentCapabilityParameter[];
}

export interface AgentCapabilityParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required: boolean;
  description: string;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    enum?: string[];
  };
}

export interface AgentPermission {
  resource: string;
  actions: ('read' | 'write' | 'delete' | 'execute')[];
  conditions?: Record<string, unknown>;
}

export interface AgentConfiguration {
  maxConcurrentTasks: number;
  taskTimeout: number; // in milliseconds
  retryAttempts: number;
  retryDelay: number;
  autonomyLevel: 'FULL' | 'SUPERVISED' | 'APPROVAL_REQUIRED';
  escalationRules: EscalationRule[];
  workingHours?: {
    enabled: boolean;
    timezone: string;
    schedule: { day: number; start: string; end: string }[];
  };
}

export interface EscalationRule {
  condition: string;
  action: 'NOTIFY' | 'ESCALATE' | 'PAUSE';
  target: string; // User ID or role
  message: string;
}

// ============================================================================
// CONVERSATION & CONTEXT
// ============================================================================

export interface ConversationContext {
  sessionId: string;
  userId: string;
  tenantId: string;
  agentType: AgentType;
  startedAt: Date;
  lastActivityAt: Date;
  messages: ConversationMessage[];
  currentIntent?: DetectedIntent;
  entities: ExtractedEntity[];
  state: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  intent?: DetectedIntent;
  entities?: ExtractedEntity[];
  actions?: AgentAction[];
  metadata?: Record<string, unknown>;
}

export interface DetectedIntent {
  name: string;
  confidence: number;
  parameters: Record<string, unknown>;
  slots: IntentSlot[];
}

export interface IntentSlot {
  name: string;
  value: unknown;
  resolved: boolean;
  required: boolean;
  promptIfMissing?: string;
}

export interface ExtractedEntity {
  type: string;
  value: string;
  normalizedValue: unknown;
  startIndex: number;
  endIndex: number;
  confidence: number;
}

// ============================================================================
// AGENT TASKS
// ============================================================================

export interface AgentTask {
  id: string;
  agentType: AgentType;
  tenantId: string;
  userId: string;
  sessionId?: string;
  type: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  actions: AgentAction[];
  dependencies?: string[];
  parentTaskId?: string;
  subtasks?: AgentTask[];
  progress: number; // 0-100
  startedAt?: Date;
  completedAt?: Date;
  dueDate?: Date;
  error?: TaskError;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'IN_PROGRESS'
  | 'WAITING_APPROVAL'
  | 'WAITING_INPUT'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface TaskError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  recoverable: boolean;
  suggestedAction?: string;
}

// ============================================================================
// AGENT ACTIONS
// ============================================================================

export interface AgentAction {
  id: string;
  taskId: string;
  type: ActionType;
  name: string;
  description: string;
  status: ActionStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  requiresApproval: boolean;
  approvalStatus?: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: Date;
  executedAt?: Date;
  error?: ActionError;
  duration?: number;
  createdAt: Date;
}

export type ActionStatus = 'PENDING' | 'APPROVED' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'REJECTED';

export interface ApprovalStatus {
  required: boolean;
  approvers: string[];
  currentApprover?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments?: string;
}

export interface ActionError {
  code: string;
  message: string;
  stack?: string;
  retryable: boolean;
}

// ============================================================================
// AGENT RESPONSE
// ============================================================================

export interface AgentResponse {
  sessionId: string;
  messageId: string;
  agentType: AgentType;
  content: string;
  contentType: 'text' | 'markdown' | 'html' | 'json';
  intent?: DetectedIntent;
  actions?: AgentAction[];
  suggestions?: ResponseSuggestion[];
  attachments?: ResponseAttachment[];
  requiresInput?: InputRequest;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface ResponseSuggestion {
  id: string;
  type: 'quick_reply' | 'action' | 'link';
  label: string;
  value: string;
  icon?: string;
}

export interface ResponseAttachment {
  id: string;
  type: 'file' | 'image' | 'chart' | 'table' | 'card';
  title: string;
  content: unknown;
  mimeType?: string;
  url?: string;
}

export interface InputRequest {
  type: 'text' | 'select' | 'date' | 'file' | 'confirm';
  prompt: string;
  options?: { label: string; value: string }[];
  validation?: {
    required?: boolean;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

// ============================================================================
// HR AGENT SPECIFIC TYPES
// ============================================================================

export interface HRAgentCapabilities {
  // Leave Management
  leaveBalance: boolean;
  leaveApplication: boolean;
  leaveApproval: boolean;
  leaveHistory: boolean;

  // Attendance
  attendanceQuery: boolean;
  attendanceCorrection: boolean;
  workFromHome: boolean;

  // Payroll
  payslipQuery: boolean;
  taxDeclaration: boolean;
  reimbursement: boolean;

  // Employee Info
  profileUpdate: boolean;
  documentRequest: boolean;
  policyQuery: boolean;
}

export interface LeaveQueryIntent {
  type: 'BALANCE' | 'APPLY' | 'STATUS' | 'CANCEL' | 'HISTORY';
  leaveType?: string;
  startDate?: Date;
  endDate?: Date;
  employeeId?: string;
  reason?: string;
}

export interface AttendanceQueryIntent {
  type: 'TODAY' | 'RANGE' | 'SUMMARY' | 'CORRECTION';
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  employeeId?: string;
}

export interface PayrollQueryIntent {
  type: 'PAYSLIP' | 'TAX' | 'REIMBURSEMENT' | 'SALARY_STRUCTURE';
  month?: number;
  year?: number;
  employeeId?: string;
}

// ============================================================================
// RECRUITMENT AGENT SPECIFIC TYPES
// ============================================================================

export interface RecruitmentAgentCapabilities {
  // Candidate Screening
  resumeScreening: boolean;
  candidateRanking: boolean;
  skillMatching: boolean;

  // Interview
  interviewScheduling: boolean;
  feedbackCollection: boolean;

  // Communication
  candidateCommunication: boolean;
  statusUpdates: boolean;

  // Analytics
  pipelineAnalytics: boolean;
  sourceAnalytics: boolean;
}

export interface CandidateScreeningIntent {
  type: 'SCREEN' | 'RANK' | 'MATCH' | 'SHORTLIST';
  jobId: string;
  criteria?: ScreeningCriteria;
  limit?: number;
}

export interface ScreeningCriteria {
  requiredSkills: string[];
  preferredSkills?: string[];
  experienceMin?: number;
  experienceMax?: number;
  educationLevel?: string;
  location?: string;
  salaryRange?: { min: number; max: number };
  noticePeriod?: number;
}

export interface InterviewScheduleIntent {
  type: 'SCHEDULE' | 'RESCHEDULE' | 'CANCEL';
  candidateId: string;
  interviewType: string;
  interviewers: string[];
  preferredSlots?: { date: Date; startTime: string; endTime: string }[];
  duration: number;
}

export interface CandidateMatch {
  candidateId: string;
  candidateName: string;
  overallScore: number;
  skillMatch: number;
  experienceMatch: number;
  educationMatch: number;
  cultureFitScore?: number;
  ranking: number;
  highlights: string[];
  concerns: string[];
  recommendation: 'STRONG_HIRE' | 'HIRE' | 'MAYBE' | 'NO_HIRE';
}

// ============================================================================
// ANALYTICS AGENT SPECIFIC TYPES
// ============================================================================

export interface AnalyticsAgentCapabilities {
  // Reports
  standardReports: boolean;
  customReports: boolean;
  scheduledReports: boolean;

  // Insights
  trendAnalysis: boolean;
  anomalyDetection: boolean;
  predictiveAnalytics: boolean;

  // Recommendations
  actionRecommendations: boolean;
  benchmarking: boolean;
}

export interface AnalyticsQueryIntent {
  type: 'METRIC' | 'TREND' | 'COMPARISON' | 'FORECAST' | 'ANOMALY';
  metrics: string[];
  dimensions?: string[];
  filters?: Record<string, unknown>;
  dateRange?: { start: Date; end: Date };
  granularity?: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
}

export interface InsightRequest {
  domain: 'HR' | 'RECRUITMENT' | 'PAYROLL' | 'PERFORMANCE' | 'WORKFORCE';
  question: string;
  context?: Record<string, unknown>;
  format?: 'TEXT' | 'CHART' | 'TABLE' | 'DASHBOARD';
}

export interface GeneratedInsight {
  id: string;
  title: string;
  summary: string;
  details: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  metrics: { name: string; value: number; change?: number; trend?: string }[];
  recommendations: string[];
  visualizations?: InsightVisualization[];
  confidence: number;
  generatedAt: Date;
}

export interface InsightVisualization {
  type: 'LINE' | 'BAR' | 'PIE' | 'SCATTER' | 'HEATMAP' | 'TABLE';
  title: string;
  data: unknown;
  config?: Record<string, unknown>;
}

// ============================================================================
// AUTONOMOUS EXECUTION
// ============================================================================

export interface ExecutionPlan {
  id: string;
  taskId: string;
  steps: ExecutionStep[];
  currentStep: number;
  status: 'PLANNING' | 'READY' | 'EXECUTING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface ExecutionStep {
  id: string;
  order: number;
  name: string;
  description: string;
  action: ActionType;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'FAILED';
  requiresApproval: boolean;
  dependencies?: string[];
  condition?: string;
  timeout?: number;
  retries?: number;
  error?: ActionError;
}

export interface ExecutionContext {
  planId: string;
  taskId: string;
  agentType: AgentType;
  tenantId: string;
  userId: string;
  variables: Record<string, unknown>;
  permissions: AgentPermission[];
  auditLog: AuditEntry[];
}

export interface AuditEntry {
  timestamp: Date;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  outcome: 'SUCCESS' | 'FAILURE';
  error?: string;
}

// ============================================================================
// AGENT EVENTS
// ============================================================================

export type AgentEventType =
  | 'TASK_CREATED'
  | 'TASK_STARTED'
  | 'TASK_COMPLETED'
  | 'TASK_FAILED'
  | 'ACTION_EXECUTED'
  | 'APPROVAL_REQUESTED'
  | 'APPROVAL_RECEIVED'
  | 'ESCALATION_TRIGGERED'
  | 'INSIGHT_GENERATED'
  | 'ERROR_OCCURRED';

export interface AgentEvent {
  id: string;
  type: AgentEventType;
  agentType: AgentType;
  taskId?: string;
  actionId?: string;
  tenantId: string;
  userId?: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

// ============================================================================
// AGENT METRICS
// ============================================================================

export interface AgentMetrics {
  agentType: AgentType;
  period: { start: Date; end: Date };
  tasksProcessed: number;
  tasksSuccessful: number;
  tasksFailed: number;
  averageResponseTime: number;
  averageTaskDuration: number;
  autonomousExecutions: number;
  escalations: number;
  userSatisfaction?: number;
  topIntents: { intent: string; count: number }[];
  errorsByType: { type: string; count: number }[];
}
