/**
 * Workflow Engine Module - Type Definitions
 * Comprehensive workflow automation including visual designer, approval chains,
 * conditional logic, integrations, and execution tracking
 */

// Common Types
export type Status = 'draft' | 'active' | 'inactive' | 'archived';
export type ExecutionStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

// ============================================================================
// Workflow Definition
// ============================================================================

export type WorkflowCategory =
  | 'hr_onboarding'
  | 'hr_offboarding'
  | 'leave_request'
  | 'expense_approval'
  | 'purchase_requisition'
  | 'document_approval'
  | 'employee_transfer'
  | 'performance_review'
  | 'recruitment'
  | 'training_approval'
  | 'incident_management'
  | 'change_request'
  | 'custom';

export type TriggerType = 'manual' | 'scheduled' | 'event' | 'webhook' | 'api';

export interface Workflow {
  id: string;
  workflowCode: string;
  workflowName: string;
  category: WorkflowCategory;
  status: Status;
  description: string;
  version: string;

  // Design
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  startNodeId: string;
  endNodeIds: string[];

  // Triggers
  triggers: WorkflowTrigger[];

  // Configuration
  allowParallel: boolean;
  maxConcurrentExecutions: number;
  executionTimeout: number; // minutes
  retryPolicy: RetryPolicy;

  // Variables & Context
  inputSchema: InputField[];
  outputSchema: OutputField[];
  variables: WorkflowVariable[];

  // Permissions
  allowedRoles: string[];
  allowedUsers: string[];
  isPublic: boolean;

  // Notifications
  notificationSettings: NotificationSettings;

  // Tracking
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number; // seconds
  lastExecutionDate?: string;

  // Versioning
  publishedVersion?: string;
  isDraft: boolean;
  parentWorkflowId?: string;

  // Meta
  createdBy: string;
  createdByName: string;
  createdDate: string;
  lastModified: string;
  tags: string[];
}

// ============================================================================
// Workflow Nodes
// ============================================================================

export type NodeType =
  | 'start'
  | 'end'
  | 'approval'
  | 'task'
  | 'condition'
  | 'parallel'
  | 'loop'
  | 'delay'
  | 'notification'
  | 'integration'
  | 'script'
  | 'form'
  | 'subprocess';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  description?: string;

  // Position (for visual designer)
  x: number;
  y: number;

  // Configuration based on type
  config: NodeConfig;

  // Conditional execution
  executeIf?: ConditionExpression;

  // Error handling
  onError?: ErrorHandler;
}

export type NodeConfig =
  | StartNodeConfig
  | EndNodeConfig
  | ApprovalNodeConfig
  | TaskNodeConfig
  | ConditionNodeConfig
  | ParallelNodeConfig
  | LoopNodeConfig
  | DelayNodeConfig
  | NotificationNodeConfig
  | IntegrationNodeConfig
  | ScriptNodeConfig
  | FormNodeConfig
  | SubprocessNodeConfig;

export interface StartNodeConfig {
  type: 'start';
  formId?: string;
  validateInput: boolean;
}

export interface EndNodeConfig {
  type: 'end';
  outputMapping: Record<string, string>;
  triggerWebhook?: string;
}

export interface ApprovalNodeConfig {
  type: 'approval';
  approvers: ApproverConfig[];
  approvalType: 'any' | 'all' | 'majority' | 'custom';
  customApprovalLogic?: string;
  escalation?: EscalationConfig;
  allowComments: boolean;
  allowAttachments: boolean;
  dueDate?: DueDateConfig;
}

export interface ApproverConfig {
  type: 'user' | 'role' | 'manager' | 'dynamic';
  userId?: string;
  userName?: string;
  roleId?: string;
  roleName?: string;
  managerLevel?: number; // 1 = direct manager, 2 = manager's manager, etc.
  dynamicExpression?: string; // For computed approvers
  isRequired: boolean;
  order?: number;
}

export interface EscalationConfig {
  enabled: boolean;
  escalateAfter: number; // hours
  escalateTo: ApproverConfig[];
  notifyOriginalApprover: boolean;
}

export interface DueDateConfig {
  type: 'relative' | 'absolute' | 'dynamic';
  relativeHours?: number;
  absoluteDate?: string;
  dynamicExpression?: string;
}

export interface TaskNodeConfig {
  type: 'task';
  assignees: AssigneeConfig[];
  assignmentType: 'any' | 'all' | 'round_robin';
  taskTitle: string;
  taskDescription: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: DueDateConfig;
  formId?: string;
  allowReassignment: boolean;
}

export interface AssigneeConfig {
  type: 'user' | 'role' | 'group' | 'dynamic';
  userId?: string;
  userName?: string;
  roleId?: string;
  roleName?: string;
  groupId?: string;
  groupName?: string;
  dynamicExpression?: string;
}

export interface ConditionNodeConfig {
  type: 'condition';
  conditions: ConditionExpression[];
  defaultPath: string; // edge id
}

export interface ParallelNodeConfig {
  type: 'parallel';
  branches: ParallelBranch[];
  waitForAll: boolean;
  mergeStrategy: 'first' | 'all' | 'majority';
}

export interface ParallelBranch {
  id: string;
  name: string;
  startNodeId: string;
  condition?: ConditionExpression;
}

export interface LoopNodeConfig {
  type: 'loop';
  loopType: 'while' | 'for_each' | 'until';
  condition?: ConditionExpression;
  collection?: string; // Variable name for for_each
  maxIterations: number;
  exitCondition?: ConditionExpression;
}

export interface DelayNodeConfig {
  type: 'delay';
  delayType: 'duration' | 'until_date' | 'until_condition';
  duration?: number; // minutes
  untilDate?: string;
  untilCondition?: ConditionExpression;
}

export interface NotificationNodeConfig {
  type: 'notification';
  recipients: RecipientConfig[];
  channel: 'email' | 'sms' | 'push' | 'in_app' | 'webhook';
  template: NotificationTemplate;
}

export interface RecipientConfig {
  type: 'user' | 'role' | 'group' | 'dynamic' | 'initiator' | 'assignee';
  userId?: string;
  roleId?: string;
  groupId?: string;
  dynamicExpression?: string;
}

export interface NotificationTemplate {
  subject?: string;
  body: string;
  templateVariables: Record<string, string>;
  format: 'text' | 'html' | 'markdown';
}

export interface IntegrationNodeConfig {
  type: 'integration';
  integrationId: string;
  integrationName: string;
  action: string;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  authentication?: AuthenticationConfig;
  retryOnFailure: boolean;
}

export interface AuthenticationConfig {
  type: 'none' | 'api_key' | 'oauth' | 'basic' | 'bearer';
  credentials: Record<string, string>;
}

export interface ScriptNodeConfig {
  type: 'script';
  language: 'javascript' | 'python' | 'custom';
  script: string;
  inputVariables: string[];
  outputVariables: string[];
  timeout: number; // seconds
}

export interface FormNodeConfig {
  type: 'form';
  formId: string;
  formName: string;
  assignTo: AssigneeConfig[];
  formFields: FormField[];
  submitValidation?: string; // Expression
}

export interface FormField {
  id: string;
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'select' | 'multi_select' | 'file' | 'boolean';
  label: string;
  required: boolean;
  defaultValue?: any;
  validation?: ValidationRule;
  options?: string[]; // For select fields
}

export interface ValidationRule {
  type: 'regex' | 'range' | 'length' | 'custom';
  value: any;
  errorMessage: string;
}

export interface SubprocessNodeConfig {
  type: 'subprocess';
  subprocessWorkflowId: string;
  subprocessWorkflowName: string;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  waitForCompletion: boolean;
}

// ============================================================================
// Workflow Edges
// ============================================================================

export interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  condition?: ConditionExpression;
  order?: number;
}

// ============================================================================
// Conditions & Expressions
// ============================================================================

export interface ConditionExpression {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: any;
  valueType: 'static' | 'variable' | 'expression';
  logicalOperator?: 'AND' | 'OR';
  children?: ConditionExpression[];
}

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'in'
  | 'not_in'
  | 'is_empty'
  | 'is_not_empty'
  | 'regex';

// ============================================================================
// Triggers
// ============================================================================

export interface WorkflowTrigger {
  id: string;
  triggerType: TriggerType;
  enabled: boolean;
  config: TriggerConfig;
}

export type TriggerConfig =
  | ManualTriggerConfig
  | ScheduledTriggerConfig
  | EventTriggerConfig
  | WebhookTriggerConfig
  | APITriggerConfig;

export interface ManualTriggerConfig {
  type: 'manual';
  allowedInitiators: 'all' | 'specific';
  allowedRoles?: string[];
  allowedUsers?: string[];
}

export interface ScheduledTriggerConfig {
  type: 'scheduled';
  schedule: CronSchedule;
  timezone: string;
  startDate?: string;
  endDate?: string;
}

export interface CronSchedule {
  expression: string;
  description: string;
}

export interface EventTriggerConfig {
  type: 'event';
  eventSource: string;
  eventType: string;
  filters: EventFilter[];
}

export interface EventFilter {
  field: string;
  operator: ConditionOperator;
  value: any;
}

export interface WebhookTriggerConfig {
  type: 'webhook';
  webhookUrl: string;
  secret?: string;
  authentication?: AuthenticationConfig;
}

export interface APITriggerConfig {
  type: 'api';
  apiEndpoint: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
  authentication?: AuthenticationConfig;
}

// ============================================================================
// Input/Output Schema
// ============================================================================

export interface InputField {
  id: string;
  fieldName: string;
  fieldType: string;
  label: string;
  required: boolean;
  defaultValue?: any;
  validation?: ValidationRule;
}

export interface OutputField {
  id: string;
  fieldName: string;
  fieldType: string;
  source: string; // Variable or expression
}

// ============================================================================
// Variables
// ============================================================================

export interface WorkflowVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  scope: 'global' | 'local';
  defaultValue?: any;
  description?: string;
}

// ============================================================================
// Error Handling
// ============================================================================

export interface ErrorHandler {
  strategy: 'ignore' | 'retry' | 'fallback' | 'escalate' | 'terminate';
  retryConfig?: {
    maxRetries: number;
    retryDelay: number; // seconds
    backoffStrategy: 'fixed' | 'exponential' | 'linear';
  };
  fallbackNodeId?: string;
  escalateTo?: string[];
  customHandler?: string; // Script
}

export interface RetryPolicy {
  maxRetries: number;
  retryDelay: number; // seconds
  retryableErrors: string[];
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
}

// ============================================================================
// Notifications
// ============================================================================

export interface NotificationSettings {
  notifyOnStart: boolean;
  notifyOnCompletion: boolean;
  notifyOnFailure: boolean;
  notifyOnApproval: boolean;
  notifyOnEscalation: boolean;
  recipients: RecipientConfig[];
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
}

// ============================================================================
// Workflow Execution
// ============================================================================

export interface WorkflowExecution {
  id: string;
  executionCode: string;
  workflowId: string;
  workflowName: string;
  workflowVersion: string;

  // Initiator
  initiatorId: string;
  initiatorName: string;
  initiatedDate: string;

  // Status
  status: ExecutionStatus;
  currentNodeId?: string;
  currentNodeName?: string;

  // Input/Output
  input: Record<string, any>;
  output?: Record<string, any>;

  // Context
  variables: Record<string, any>;

  // Steps
  steps: ExecutionStep[];

  // Timing
  startDate: string;
  endDate?: string;
  duration?: number; // seconds

  // Results
  result?: ExecutionResult;
  error?: ExecutionError;

  // Metadata
  metadata: Record<string, any>;
  logs: ExecutionLog[];
}

export interface ExecutionStep {
  id: string;
  nodeId: string;
  nodeName: string;
  nodeType: NodeType;
  sequence: number;

  status: ExecutionStatus;
  startDate: string;
  endDate?: string;
  duration?: number;

  input?: Record<string, any>;
  output?: Record<string, any>;

  assignee?: string;
  assigneeName?: string;
  completedBy?: string;
  completedByName?: string;

  decision?: ApprovalDecision | TaskCompletion;
  error?: ExecutionError;

  retryCount: number;
  logs: StepLog[];
}

export interface ApprovalDecision {
  approved: boolean;
  comments?: string;
  attachments?: string[];
  decisionDate: string;
  decidedBy: string;
  decidedByName: string;
}

export interface TaskCompletion {
  completed: boolean;
  formData?: Record<string, any>;
  comments?: string;
  attachments?: string[];
  completionDate: string;
  completedBy: string;
  completedByName: string;
}

export interface ExecutionResult {
  success: boolean;
  message: string;
  data?: Record<string, any>;
}

export interface ExecutionError {
  code: string;
  message: string;
  details?: string;
  stackTrace?: string;
  nodeId: string;
  nodeName: string;
  timestamp: string;
  recoverable: boolean;
}

export interface ExecutionLog {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  nodeId?: string;
  data?: Record<string, any>;
}

export interface StepLog {
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error';
}

// ============================================================================
// Approval Chain
// ============================================================================

export interface ApprovalChain {
  id: string;
  chainCode: string;
  chainName: string;
  description: string;
  status: Status;

  // Chain Structure
  levels: ApprovalLevel[];
  isSequential: boolean;

  // Configuration
  allowParallelApprovals: boolean;
  requireAllLevels: boolean;
  autoApproveThreshold?: number;

  // Usage
  usedInWorkflows: string[];

  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface ApprovalLevel {
  id: string;
  levelNumber: number;
  levelName: string;
  approvers: ApproverConfig[];
  approvalType: 'any' | 'all' | 'majority';
  conditions?: ConditionExpression[];
  escalation?: EscalationConfig;
  dueDate?: DueDateConfig;
}

// ============================================================================
// Integration Points
// ============================================================================

export interface Integration {
  id: string;
  integrationName: string;
  integrationType: 'rest_api' | 'soap' | 'graphql' | 'database' | 'file' | 'email' | 'custom';
  status: Status;
  description: string;

  // Connection
  connectionConfig: ConnectionConfig;
  authentication?: AuthenticationConfig;

  // Actions
  availableActions: IntegrationAction[];

  // Testing
  testConnection: boolean;
  lastTestedDate?: string;
  lastTestedStatus?: 'success' | 'failed';

  // Usage
  usedInWorkflows: string[];

  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface ConnectionConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  timeout?: number;
  retryConfig?: RetryPolicy;
}

export interface IntegrationAction {
  id: string;
  actionName: string;
  actionType: 'read' | 'write' | 'delete' | 'execute';
  description: string;
  endpoint?: string;
  method?: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  sampleRequest?: Record<string, any>;
  sampleResponse?: Record<string, any>;
}

// ============================================================================
// Form Builder
// ============================================================================

export interface DynamicForm {
  id: string;
  formCode: string;
  formName: string;
  description: string;
  status: Status;
  version: string;

  // Fields
  fields: FormField[];

  // Layout
  layout: FormLayout;

  // Validation
  validationRules: FormValidationRule[];

  // Submission
  submitAction: 'save' | 'workflow' | 'api' | 'custom';
  submitWorkflowId?: string;
  submitApiEndpoint?: string;

  // Permissions
  allowedRoles: string[];
  allowedUsers: string[];

  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface FormLayout {
  type: 'single_column' | 'two_column' | 'grid' | 'custom';
  sections: FormSection[];
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: string[]; // field ids
  collapsible: boolean;
  defaultCollapsed: boolean;
}

export interface FormValidationRule {
  id: string;
  ruleName: string;
  condition: ConditionExpression;
  errorMessage: string;
  validateOn: 'submit' | 'change' | 'blur';
}

// ============================================================================
// Analytics & Metrics
// ============================================================================

export interface WorkflowMetrics {
  // Execution Metrics
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  cancelledExecutions: number;
  successRate: number;

  // Performance Metrics
  averageExecutionTime: number; // seconds
  medianExecutionTime: number;
  minExecutionTime: number;
  maxExecutionTime: number;

  // Current State
  runningExecutions: number;
  pendingExecutions: number;
  pausedExecutions: number;

  // Approval Metrics
  totalApprovals: number;
  approvalRate: number;
  averageApprovalTime: number; // hours
  escalationRate: number;

  // Task Metrics
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  taskCompletionRate: number;
  averageTaskCompletionTime: number;

  // Top Workflows
  topWorkflowsByUsage: WorkflowUsage[];
  topWorkflowsByDuration: WorkflowUsage[];
  topWorkflowsByFailure: WorkflowUsage[];

  // Trends
  executionTrends: TrendData[];
  performanceTrends: TrendData[];

  lastUpdated: string;
}

export interface WorkflowUsage {
  workflowId: string;
  workflowName: string;
  count: number;
  averageDuration: number;
  successRate: number;
}

export interface TrendData {
  period: string;
  value: number;
  change?: number;
}

// ============================================================================
// Settings
// ============================================================================

export interface WorkflowSettings {
  // Execution Settings
  defaultExecutionTimeout: number; // minutes
  maxConcurrentExecutions: number;
  enableAutoRetry: boolean;
  defaultRetryAttempts: number;
  defaultRetryDelay: number; // seconds

  // Approval Settings
  defaultApprovalTimeout: number; // hours
  enableAutoEscalation: boolean;
  defaultEscalationTime: number; // hours
  allowDelegation: boolean;

  // Notification Settings
  enableNotifications: boolean;
  notifyOnApprovalRequest: boolean;
  notifyOnApprovalDecision: boolean;
  notifyOnTaskAssignment: boolean;
  notifyOnWorkflowCompletion: boolean;
  notifyOnWorkflowFailure: boolean;

  // Security Settings
  requireApprovalForPublish: boolean;
  enableAuditLog: boolean;
  dataRetentionDays: number;
  allowExternalIntegrations: boolean;

  // Designer Settings
  enableVersionControl: boolean;
  enableDraftMode: boolean;
  enableTesting: boolean;
  maxWorkflowNodes: number;

  createdDate: string;
  lastModified: string;
}
