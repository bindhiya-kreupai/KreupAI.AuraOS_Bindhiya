/**
 * @module workflowEngineService
 * @description Workflow Engine Service — extended workflow management with execution,
 *   delegation, SLA monitoring, bottleneck analysis, and metrics.
 *   Extends patterns from workflowService.ts without modifying it.
 * @project AURA HCM Platform
 * @section 24.3 — Workflow Engine & Automation
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type WorkflowDefinitionStatus = 'draft' | 'active' | 'inactive' | 'deprecated';
export type StepType = 'approval' | 'notification' | 'condition' | 'action' | 'parallel' | 'timer';
export type InstanceStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'on_hold';
export type StepDecision = 'approve' | 'reject' | 'delegate' | 'return' | 'skip';
export type SLAStatus = 'on_track' | 'at_risk' | 'breached';

export interface WorkflowStep {
  stepId: string;
  name: string;
  type: StepType;
  assigneeRole: string;
  assigneeId: string | null;
  slaDurationHours: number;
  isParallel: boolean;
  conditions: Array<{ field: string; operator: string; value: unknown }>;
  actions: string[];
}

export interface WorkflowDefinitionFilter {
  status?: WorkflowDefinitionStatus;
  trigger?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  trigger: string;
  triggerEntity: string;
  status: WorkflowDefinitionStatus;
  steps: WorkflowStep[];
  activeInstances: number;
  completedInstances: number;
  avgCompletionHours: number;
  slaCompliancePercent: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface WorkflowInstance {
  id: string;
  definitionId: string;
  definitionName: string;
  trigger: string;
  status: InstanceStatus;
  currentStepId: string;
  currentStepName: string;
  currentAssignee: string;
  currentAssigneeId: string;
  slaDeadline: string;
  slaStatus: SLAStatus;
  slaHoursRemaining: number;
  initiatedBy: string;
  initiatedAt: string;
  completedAt: string | null;
  context: Record<string, unknown>;
  stepHistory: StepHistory[];
}

export interface StepHistory {
  stepId: string;
  stepName: string;
  assignee: string;
  decision: StepDecision | null;
  startedAt: string;
  completedAt: string | null;
  comments: string;
  durationHours: number | null;
}

export interface Delegation {
  id: string;
  delegatorId: string;
  delegatorName: string;
  delegateeId: string;
  delegateeName: string;
  scope: string; // 'All' | workflow trigger type
  startDate: string;
  endDate: string;
  reason: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateDelegationData {
  delegateeId: string;
  scope: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface WorkflowMetrics {
  totalDefinitions: number;
  activeDefinitions: number;
  totalActiveInstances: number;
  totalCompletedToday: number;
  avgCompletionHours: number;
  slaCompliancePercent: number;
  breachedSLAsToday: number;
  bottleneckSteps: Array<{
    stepName: string;
    definitionName: string;
    avgDurationHours: number;
    instances: number;
  }>;
  instancesByStatus: Record<InstanceStatus, number>;
  completionTrend: Array<{ date: string; completed: number; initiated: number }>;
  topWorkflows: Array<{ name: string; instances: number; avgHours: number; slaPercent: number }>;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_DEFINITIONS: WorkflowDefinition[] = [
  {
    id: 'WFD-001',
    name: 'Leave Request Approval',
    description: 'Multi-level leave request approval workflow',
    trigger: 'leave_request',
    triggerEntity: 'LeaveRequest',
    status: 'active',
    steps: [
      {
        stepId: 'S1',
        name: 'Line Manager Approval',
        type: 'approval',
        assigneeRole: 'Line Manager',
        assigneeId: null,
        slaDurationHours: 24,
        isParallel: false,
        conditions: [],
        actions: ['notify_employee'],
      },
      {
        stepId: 'S2',
        name: 'HR Verification',
        type: 'approval',
        assigneeRole: 'HR BP',
        assigneeId: null,
        slaDurationHours: 8,
        isParallel: false,
        conditions: [{ field: 'days', operator: '>', value: 5 }],
        actions: ['update_leave_balance'],
      },
    ],
    activeInstances: 23,
    completedInstances: 1240,
    avgCompletionHours: 6.4,
    slaCompliancePercent: 96.2,
    createdBy: 'System Admin',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
    version: 3,
  },
  {
    id: 'WFD-002',
    name: 'Expense Reimbursement',
    description: 'Expense claim approval and reimbursement',
    trigger: 'expense_claim',
    triggerEntity: 'ExpenseClaim',
    status: 'active',
    steps: [
      {
        stepId: 'S1',
        name: 'Manager Approval',
        type: 'approval',
        assigneeRole: 'Line Manager',
        assigneeId: null,
        slaDurationHours: 48,
        isParallel: false,
        conditions: [],
        actions: [],
      },
      {
        stepId: 'S2',
        name: 'Finance Review',
        type: 'approval',
        assigneeRole: 'Finance Manager',
        assigneeId: null,
        slaDurationHours: 72,
        isParallel: false,
        conditions: [{ field: 'amount', operator: '>', value: 5000 }],
        actions: [],
      },
      {
        stepId: 'S3',
        name: 'CFO Approval',
        type: 'approval',
        assigneeRole: 'CFO',
        assigneeId: null,
        slaDurationHours: 48,
        isParallel: false,
        conditions: [{ field: 'amount', operator: '>', value: 25000 }],
        actions: [],
      },
    ],
    activeInstances: 15,
    completedInstances: 892,
    avgCompletionHours: 28.5,
    slaCompliancePercent: 88.7,
    createdBy: 'Finance Admin',
    createdAt: '2023-02-01T00:00:00Z',
    updatedAt: '2025-08-01T00:00:00Z',
    version: 2,
  },
  {
    id: 'WFD-003',
    name: 'New Position Requisition',
    description: 'Position creation and budget approval',
    trigger: 'position_request',
    triggerEntity: 'PositionRequisition',
    status: 'active',
    steps: [
      {
        stepId: 'S1',
        name: 'Department Head Approval',
        type: 'approval',
        assigneeRole: 'Department Head',
        assigneeId: null,
        slaDurationHours: 48,
        isParallel: false,
        conditions: [],
        actions: [],
      },
      {
        stepId: 'S2',
        name: 'HR Review',
        type: 'approval',
        assigneeRole: 'HRBP',
        assigneeId: null,
        slaDurationHours: 24,
        isParallel: false,
        conditions: [],
        actions: [],
      },
      {
        stepId: 'S3',
        name: 'Finance Budget Check',
        type: 'approval',
        assigneeRole: 'Finance Controller',
        assigneeId: null,
        slaDurationHours: 48,
        isParallel: false,
        conditions: [],
        actions: [],
      },
      {
        stepId: 'S4',
        name: 'CHRO Final Approval',
        type: 'approval',
        assigneeRole: 'CHRO',
        assigneeId: null,
        slaDurationHours: 24,
        isParallel: false,
        conditions: [],
        actions: ['create_position'],
      },
    ],
    activeInstances: 4,
    completedInstances: 67,
    avgCompletionHours: 72.1,
    slaCompliancePercent: 79.1,
    createdBy: 'HR Admin',
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2025-10-01T00:00:00Z',
    version: 1,
  },
];

const MOCK_INSTANCES: WorkflowInstance[] = [
  {
    id: 'WFI-001',
    definitionId: 'WFD-001',
    definitionName: 'Leave Request Approval',
    trigger: 'leave_request',
    status: 'in_progress',
    currentStepId: 'S1',
    currentStepName: 'Line Manager Approval',
    currentAssignee: 'Tariq Hassan',
    currentAssigneeId: 'EMP-050',
    slaDeadline: '2026-02-27T09:00:00Z',
    slaStatus: 'on_track',
    slaHoursRemaining: 18,
    initiatedBy: 'Mohammed Al-Farsi',
    initiatedAt: '2026-02-26T09:00:00Z',
    completedAt: null,
    context: { employeeId: 'EMP-101', leaveType: 'Annual', days: 5, startDate: '2026-03-10' },
    stepHistory: [
      {
        stepId: 'S1',
        stepName: 'Line Manager Approval',
        assignee: 'Tariq Hassan',
        decision: null,
        startedAt: '2026-02-26T09:00:00Z',
        completedAt: null,
        comments: '',
        durationHours: null,
      },
    ],
  },
  {
    id: 'WFI-002',
    definitionId: 'WFD-002',
    definitionName: 'Expense Reimbursement',
    trigger: 'expense_claim',
    status: 'in_progress',
    currentStepId: 'S2',
    currentStepName: 'Finance Review',
    currentAssignee: 'Khalid Ibrahim',
    currentAssigneeId: 'EMP-010',
    slaDeadline: '2026-02-25T18:00:00Z',
    slaStatus: 'breached',
    slaHoursRemaining: -12,
    initiatedBy: 'Priya Nair',
    initiatedAt: '2026-02-20T10:00:00Z',
    completedAt: null,
    context: { employeeId: 'EMP-205', amount: 8500, currency: 'AED', expenseType: 'Travel' },
    stepHistory: [
      {
        stepId: 'S1',
        stepName: 'Manager Approval',
        assignee: 'John Smith',
        decision: 'approve',
        startedAt: '2026-02-20T10:00:00Z',
        completedAt: '2026-02-21T14:00:00Z',
        comments: 'Approved — valid business trip',
        durationHours: 28,
      },
      {
        stepId: 'S2',
        stepName: 'Finance Review',
        assignee: 'Khalid Ibrahim',
        decision: null,
        startedAt: '2026-02-21T14:00:00Z',
        completedAt: null,
        comments: '',
        durationHours: null,
      },
    ],
  },
];

const MOCK_DELEGATIONS: Delegation[] = [
  {
    id: 'DEL-001',
    delegatorId: 'EMP-050',
    delegatorName: 'Tariq Hassan',
    delegateeId: 'EMP-051',
    delegateeName: 'Sara Ahmed',
    scope: 'leave_request',
    startDate: '2026-02-25',
    endDate: '2026-03-07',
    reason: 'Business travel to London',
    isActive: true,
    createdAt: '2026-02-24T08:00:00Z',
  },
];

// ── Service Functions ─────────────────────────────────────────────────────────

export async function getWorkflowDefinitions(
  filters: WorkflowDefinitionFilter = {}
): Promise<{ definitions: WorkflowDefinition[]; total: number }> {
  await new Promise((r) => setTimeout(r, 300));
  let results = [...MOCK_DEFINITIONS];
  if (filters.status) results = results.filter((d) => d.status === filters.status);
  if (filters.trigger) results = results.filter((d) => d.trigger === filters.trigger);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter((d) => d.name.toLowerCase().includes(q));
  }
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const total = results.length;
  return { definitions: results.slice((page - 1) * pageSize, page * pageSize), total };
}

export async function executeWorkflow(
  definitionId: string,
  context: Record<string, unknown>
): Promise<WorkflowInstance> {
  await new Promise((r) => setTimeout(r, 500));
  const def = MOCK_DEFINITIONS.find((d) => d.id === definitionId) ?? MOCK_DEFINITIONS[0];
  const firstStep = def.steps[0];
  const deadline = new Date(Date.now() + firstStep.slaDurationHours * 3600000).toISOString();
  return {
    id: `WFI-${Date.now()}`,
    definitionId,
    definitionName: def.name,
    trigger: def.trigger,
    status: 'in_progress',
    currentStepId: firstStep.stepId,
    currentStepName: firstStep.name,
    currentAssignee: firstStep.assigneeRole,
    currentAssigneeId: firstStep.assigneeId ?? '',
    slaDeadline: deadline,
    slaStatus: 'on_track',
    slaHoursRemaining: firstStep.slaDurationHours,
    initiatedBy: 'Current User',
    initiatedAt: new Date().toISOString(),
    completedAt: null,
    context,
    stepHistory: [
      {
        stepId: firstStep.stepId,
        stepName: firstStep.name,
        assignee: firstStep.assigneeRole,
        decision: null,
        startedAt: new Date().toISOString(),
        completedAt: null,
        comments: '',
        durationHours: null,
      },
    ],
  };
}

export async function advanceStep(
  instanceId: string,
  decision: StepDecision,
  _comments?: string
): Promise<WorkflowInstance> {
  await new Promise((r) => setTimeout(r, 400));
  const inst = MOCK_INSTANCES.find((i) => i.id === instanceId) ?? MOCK_INSTANCES[0];
  return {
    ...inst,
    status: decision === 'reject' ? 'failed' : 'completed',
    completedAt: new Date().toISOString(),
  };
}

export async function getDelegations(userId: string): Promise<Delegation[]> {
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_DELEGATIONS.filter((d) => d.delegatorId === userId || d.delegateeId === userId);
}

export async function createDelegation(data: CreateDelegationData): Promise<Delegation> {
  await new Promise((r) => setTimeout(r, 350));
  return {
    id: `DEL-${Date.now()}`,
    delegatorId: 'CURRENT_USER',
    delegatorName: 'Current User',
    delegateeId: data.delegateeId,
    delegateeName: 'Delegatee Name',
    scope: data.scope,
    startDate: data.startDate,
    endDate: data.endDate,
    reason: data.reason,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
}

export async function getSLAStatus(
  instanceId: string
): Promise<{
  instanceId: string;
  slaStatus: SLAStatus;
  hoursRemaining: number;
  deadline: string;
  breachedAt: string | null;
}> {
  await new Promise((r) => setTimeout(r, 200));
  const inst = MOCK_INSTANCES.find((i) => i.id === instanceId) ?? MOCK_INSTANCES[0];
  return {
    instanceId,
    slaStatus: inst.slaStatus,
    hoursRemaining: inst.slaHoursRemaining,
    deadline: inst.slaDeadline,
    breachedAt: inst.slaStatus === 'breached' ? '2026-02-25T18:00:00Z' : null,
  };
}

export async function getActiveInstances(
  filters: { status?: InstanceStatus; definitionId?: string } = {}
): Promise<WorkflowInstance[]> {
  await new Promise((r) => setTimeout(r, 250));
  let results = [...MOCK_INSTANCES];
  if (filters.status) results = results.filter((i) => i.status === filters.status);
  if (filters.definitionId)
    results = results.filter((i) => i.definitionId === filters.definitionId);
  return results;
}

export async function getWorkflowMetrics(): Promise<WorkflowMetrics> {
  await new Promise((r) => setTimeout(r, 350));
  return {
    totalDefinitions: 12,
    activeDefinitions: 9,
    totalActiveInstances: 42,
    totalCompletedToday: 18,
    avgCompletionHours: 14.2,
    slaCompliancePercent: 91.5,
    breachedSLAsToday: 3,
    bottleneckSteps: [
      {
        stepName: 'Finance Review',
        definitionName: 'Expense Reimbursement',
        avgDurationHours: 52.3,
        instances: 8,
      },
      {
        stepName: 'CHRO Final Approval',
        definitionName: 'New Position Requisition',
        avgDurationHours: 38.1,
        instances: 4,
      },
      {
        stepName: 'Legal Review',
        definitionName: 'Contract Approval',
        avgDurationHours: 31.7,
        instances: 6,
      },
    ],
    instancesByStatus: {
      pending: 5,
      in_progress: 37,
      completed: 1240,
      cancelled: 23,
      failed: 7,
      on_hold: 4,
    },
    completionTrend: [
      { date: '2026-02-20', completed: 22, initiated: 19 },
      { date: '2026-02-21', completed: 18, initiated: 24 },
      { date: '2026-02-22', completed: 15, initiated: 12 },
      { date: '2026-02-23', completed: 20, initiated: 18 },
      { date: '2026-02-24', completed: 25, initiated: 22 },
      { date: '2026-02-25', completed: 21, initiated: 20 },
      { date: '2026-02-26', completed: 18, initiated: 15 },
    ],
    topWorkflows: [
      { name: 'Leave Request Approval', instances: 1263, avgHours: 6.4, slaPercent: 96.2 },
      { name: 'Expense Reimbursement', instances: 907, avgHours: 28.5, slaPercent: 88.7 },
      { name: 'Performance Review', instances: 495, avgHours: 72.0, slaPercent: 94.1 },
      { name: 'Recruitment Approval', instances: 234, avgHours: 48.3, slaPercent: 85.9 },
    ],
  };
}
