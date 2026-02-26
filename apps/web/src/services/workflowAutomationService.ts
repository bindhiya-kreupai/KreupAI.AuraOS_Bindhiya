/**
 * @module workflowAutomationService
 * @description Workflow Automation Service — workflow definitions, instances, analytics,
 *              auto-delegation rules, and SLA tracking.
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type WorkflowType = 'approval' | 'notification' | 'integration' | 'escalation';
export type StepType = 'approval' | 'condition' | 'action' | 'notification' | 'wait' | 'parallel';
export type InstanceStatus = 'running' | 'completed' | 'cancelled' | 'failed' | 'suspended';
export type StepStatus = 'completed' | 'current' | 'pending' | 'failed' | 'skipped';

export interface WorkflowConditionRule {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'in';
  value: string | number | string[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  description?: string;
  slaDays?: number;
  assigneeId?: string;
  assigneeName?: string;
  assigneeRole?: string;
  conditions?: WorkflowConditionRule[];
  ifBranchStepId?: string;
  elseBranchStepId?: string;
  nextStepId?: string;
  actionType?: string;
  actionConfig?: Record<string, unknown>;
  notificationTemplate?: string;
  waitDays?: number;
  parallelStepIds?: string[];
}

export interface WorkflowDefinitionFull {
  id: string;
  name: string;
  description: string;
  type: WorkflowType;
  trigger: string;
  triggerEntityType: string;
  steps: WorkflowStep[];
  isActive: boolean;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  totalInstances: number;
  avgCompletionDays: number;
  slaCompliancePct: number;
}

export interface WorkflowInstanceStep {
  stepId: string;
  stepName: string;
  stepType: StepType;
  status: StepStatus;
  assigneeName?: string;
  startedAt?: string;
  completedAt?: string;
  comment?: string;
  slaDays?: number;
  isOverdue?: boolean;
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  workflowName: string;
  workflowType: WorkflowType;
  status: InstanceStatus;
  entityType: string;
  entityId: string;
  entityTitle: string;
  initiatedBy: string;
  initiatedByName: string;
  startedAt: string;
  completedAt?: string;
  currentStepId: string;
  currentStepName: string;
  currentAssigneeName?: string;
  steps: WorkflowInstanceStep[];
  isOverdue: boolean;
  slaDueDays?: number;
  context: Record<string, unknown>;
}

export interface WorkflowAnalytics {
  workflowId: string;
  avgCompletionDays: number;
  completionRate: number;
  slaCompliancePct: number;
  totalInstances: number;
  completedInstances: number;
  cancelledInstances: number;
  failedInstances: number;
  stepBottlenecks: {
    stepId: string;
    stepName: string;
    avgDays: number;
    overdueCount: number;
  }[];
  volumeByMonth: {
    month: string;
    count: number;
    completed: number;
  }[];
}

export interface DelegationRule {
  id: string;
  delegatorId: string;
  delegatorName: string;
  delegateId: string;
  delegateName: string;
  modules: string[];
  reason: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isOutOfOffice: boolean;
  createdAt: string;
  conflictsDetected?: string[];
}

export interface CreateDelegationInput {
  delegatorId: string;
  delegateId: string;
  modules: string[];
  reason: string;
  startDate: string;
  endDate: string;
  isOutOfOffice: boolean;
}

export interface CreateWorkflowInput {
  name: string;
  description: string;
  type: WorkflowType;
  trigger: string;
  triggerEntityType: string;
  steps: Omit<WorkflowStep, 'id'>[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_WORKFLOWS: WorkflowDefinitionFull[] = [
  {
    id: 'wf-001',
    name: 'Leave Request Approval',
    description: 'Multi-level approval workflow for leave requests with manager and HR sign-off.',
    type: 'approval',
    trigger: 'leave_request.submitted',
    triggerEntityType: 'leave_request',
    isActive: true,
    version: 3,
    createdBy: 'hr-admin',
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
    totalInstances: 284,
    avgCompletionDays: 1.8,
    slaCompliancePct: 94,
    steps: [
      {
        id: 'step-lv-1',
        name: 'Manager Approval',
        type: 'approval',
        description: 'Direct manager reviews and approves the leave request.',
        slaDays: 2,
        assigneeRole: 'direct_manager',
        nextStepId: 'step-lv-2',
      },
      {
        id: 'step-lv-2',
        name: 'Check Leave Balance',
        type: 'condition',
        description: 'Verify employee has sufficient leave balance.',
        conditions: [{ field: 'leave_balance', operator: 'gte', value: 0 }],
        ifBranchStepId: 'step-lv-3',
        elseBranchStepId: 'step-lv-4',
      },
      {
        id: 'step-lv-3',
        name: 'HR Notification',
        type: 'notification',
        description: 'Notify HR team of approved leave.',
        notificationTemplate: 'leave_approved',
        nextStepId: 'step-lv-5',
      },
      {
        id: 'step-lv-4',
        name: 'Insufficient Balance Notice',
        type: 'notification',
        description: 'Notify employee of insufficient leave balance.',
        notificationTemplate: 'leave_insufficient_balance',
      },
      {
        id: 'step-lv-5',
        name: 'Calendar Update',
        type: 'action',
        description: 'Sync leave to team calendar.',
        actionType: 'calendar_sync',
      },
    ],
  },
  {
    id: 'wf-002',
    name: 'Expense Report Approval',
    description:
      'Two-level expense approval with finance controller review for amounts over $1,000.',
    type: 'approval',
    trigger: 'expense_report.submitted',
    triggerEntityType: 'expense_report',
    isActive: true,
    version: 2,
    createdBy: 'finance-admin',
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
    totalInstances: 156,
    avgCompletionDays: 3.2,
    slaCompliancePct: 88,
    steps: [
      {
        id: 'step-ex-1',
        name: 'Manager Approval',
        type: 'approval',
        slaDays: 3,
        assigneeRole: 'direct_manager',
        nextStepId: 'step-ex-2',
      },
      {
        id: 'step-ex-2',
        name: 'Amount Threshold Check',
        type: 'condition',
        conditions: [{ field: 'total_amount', operator: 'gt', value: 1000 }],
        ifBranchStepId: 'step-ex-3',
        elseBranchStepId: 'step-ex-4',
      },
      {
        id: 'step-ex-3',
        name: 'Finance Controller Review',
        type: 'approval',
        slaDays: 5,
        assigneeRole: 'finance_controller',
        nextStepId: 'step-ex-4',
      },
      {
        id: 'step-ex-4',
        name: 'Process Reimbursement',
        type: 'action',
        actionType: 'payroll_journal_entry',
      },
    ],
  },
  {
    id: 'wf-003',
    name: 'New Employee Onboarding',
    description: 'Automated onboarding checklist trigger across IT, HR, and facilities.',
    type: 'notification',
    trigger: 'employee.hired',
    triggerEntityType: 'employee',
    isActive: true,
    version: 4,
    createdBy: 'hr-admin',
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
    totalInstances: 42,
    avgCompletionDays: 7.5,
    slaCompliancePct: 97,
    steps: [
      {
        id: 'step-ob-1',
        name: 'Notify IT for Equipment Setup',
        type: 'notification',
        notificationTemplate: 'new_hire_it_setup',
        nextStepId: 'step-ob-2',
      },
      {
        id: 'step-ob-2',
        name: 'Parallel Onboarding Tasks',
        type: 'parallel',
        parallelStepIds: ['step-ob-3', 'step-ob-4', 'step-ob-5'],
        nextStepId: 'step-ob-6',
      },
      {
        id: 'step-ob-3',
        name: 'HR Documentation',
        type: 'action',
        actionType: 'generate_onboarding_docs',
      },
      {
        id: 'step-ob-4',
        name: 'Facilities Badge Request',
        type: 'notification',
        notificationTemplate: 'new_hire_badge',
      },
      {
        id: 'step-ob-5',
        name: 'Benefits Enrollment Email',
        type: 'notification',
        notificationTemplate: 'benefits_enrollment_invite',
      },
      {
        id: 'step-ob-6',
        name: 'Day 1 Checklist',
        type: 'wait',
        waitDays: 1,
        nextStepId: 'step-ob-7',
      },
      {
        id: 'step-ob-7',
        name: 'Manager Introduction',
        type: 'action',
        actionType: 'schedule_meeting',
      },
    ],
  },
  {
    id: 'wf-004',
    name: 'Performance Review Cycle',
    description:
      'Annual performance review workflow: self-assessment, manager review, calibration.',
    type: 'approval',
    trigger: 'review_cycle.started',
    triggerEntityType: 'performance_review',
    isActive: true,
    version: 2,
    createdBy: 'hr-admin',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-11-01T00:00:00Z',
    totalInstances: 198,
    avgCompletionDays: 21.3,
    slaCompliancePct: 82,
    steps: [
      {
        id: 'step-pr-1',
        name: 'Employee Self-Assessment',
        type: 'approval',
        slaDays: 7,
        assigneeRole: 'employee_self',
        nextStepId: 'step-pr-2',
      },
      {
        id: 'step-pr-2',
        name: 'Manager Evaluation',
        type: 'approval',
        slaDays: 10,
        assigneeRole: 'direct_manager',
        nextStepId: 'step-pr-3',
      },
      {
        id: 'step-pr-3',
        name: 'Calibration Meeting',
        type: 'action',
        actionType: 'schedule_calibration',
        nextStepId: 'step-pr-4',
      },
      {
        id: 'step-pr-4',
        name: 'Publish Review',
        type: 'action',
        actionType: 'publish_review',
      },
    ],
  },
  {
    id: 'wf-005',
    name: 'Offer Letter Approval',
    description:
      'Recruitment offer letter approval chain: HR, Hiring Manager, Finance (for senior roles).',
    type: 'approval',
    trigger: 'offer_letter.requested',
    triggerEntityType: 'job_offer',
    isActive: true,
    version: 1,
    createdBy: 'recruiter-admin',
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z',
    totalInstances: 18,
    avgCompletionDays: 2.1,
    slaCompliancePct: 100,
    steps: [
      {
        id: 'step-of-1',
        name: 'HR Review',
        type: 'approval',
        slaDays: 1,
        assigneeRole: 'hr_manager',
        nextStepId: 'step-of-2',
      },
      {
        id: 'step-of-2',
        name: 'Hiring Manager Sign-off',
        type: 'approval',
        slaDays: 1,
        assigneeRole: 'hiring_manager',
        nextStepId: 'step-of-3',
      },
      {
        id: 'step-of-3',
        name: 'Send Offer',
        type: 'action',
        actionType: 'send_offer_email',
      },
    ],
  },
  {
    id: 'wf-006',
    name: 'IT Access Request',
    description:
      'IT system access provisioning workflow with security team approval for privileged access.',
    type: 'approval',
    trigger: 'access_request.submitted',
    triggerEntityType: 'access_request',
    isActive: false,
    version: 1,
    createdBy: 'it-admin',
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z',
    totalInstances: 67,
    avgCompletionDays: 1.5,
    slaCompliancePct: 92,
    steps: [
      {
        id: 'step-it-1',
        name: 'Manager Approval',
        type: 'approval',
        slaDays: 1,
        assigneeRole: 'direct_manager',
        nextStepId: 'step-it-2',
      },
      {
        id: 'step-it-2',
        name: 'Privilege Level Check',
        type: 'condition',
        conditions: [{ field: 'access_level', operator: 'in', value: ['admin', 'privileged'] }],
        ifBranchStepId: 'step-it-3',
        elseBranchStepId: 'step-it-4',
      },
      {
        id: 'step-it-3',
        name: 'Security Team Review',
        type: 'approval',
        slaDays: 2,
        assigneeRole: 'security_team',
        nextStepId: 'step-it-4',
      },
      {
        id: 'step-it-4',
        name: 'Provision Access',
        type: 'action',
        actionType: 'provision_system_access',
      },
    ],
  },
  {
    id: 'wf-007',
    name: 'Policy Escalation',
    description: 'Automatic escalation for policy violations or unresolved HR tickets.',
    type: 'escalation',
    trigger: 'helpdesk_ticket.overdue',
    triggerEntityType: 'helpdesk_ticket',
    isActive: true,
    version: 1,
    createdBy: 'hr-admin',
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2025-07-01T00:00:00Z',
    totalInstances: 12,
    avgCompletionDays: 4.8,
    slaCompliancePct: 75,
    steps: [
      {
        id: 'step-esc-1',
        name: 'Notify HR Manager',
        type: 'notification',
        notificationTemplate: 'ticket_escalation_l1',
        nextStepId: 'step-esc-2',
      },
      {
        id: 'step-esc-2',
        name: 'Wait 2 Days',
        type: 'wait',
        waitDays: 2,
        nextStepId: 'step-esc-3',
      },
      {
        id: 'step-esc-3',
        name: 'Escalate to HR Director',
        type: 'notification',
        notificationTemplate: 'ticket_escalation_l2',
      },
    ],
  },
  {
    id: 'wf-008',
    name: 'Payroll Integration Sync',
    description: 'Monthly payroll data sync from HR to payroll processing system.',
    type: 'integration',
    trigger: 'payroll_cycle.started',
    triggerEntityType: 'payroll_run',
    isActive: true,
    version: 2,
    createdBy: 'payroll-admin',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
    totalInstances: 15,
    avgCompletionDays: 0.5,
    slaCompliancePct: 100,
    steps: [
      {
        id: 'step-pay-1',
        name: 'Extract HR Changes',
        type: 'action',
        actionType: 'export_hr_changes',
        nextStepId: 'step-pay-2',
      },
      {
        id: 'step-pay-2',
        name: 'Validate Data',
        type: 'condition',
        conditions: [{ field: 'validation_errors', operator: 'eq', value: 0 }],
        ifBranchStepId: 'step-pay-3',
        elseBranchStepId: 'step-pay-4',
      },
      {
        id: 'step-pay-3',
        name: 'Push to Payroll',
        type: 'action',
        actionType: 'payroll_api_push',
      },
      {
        id: 'step-pay-4',
        name: 'Alert Payroll Admin',
        type: 'notification',
        notificationTemplate: 'payroll_sync_error',
      },
    ],
  },
];

const MOCK_INSTANCES: WorkflowInstance[] = [
  {
    id: 'inst-001',
    workflowId: 'wf-001',
    workflowName: 'Leave Request Approval',
    workflowType: 'approval',
    status: 'running',
    entityType: 'leave_request',
    entityId: 'lr-2026-142',
    entityTitle: 'Annual Leave — Feb 28 to Mar 7 (Sarah Johnson)',
    initiatedBy: 'emp-001',
    initiatedByName: 'Sarah Johnson',
    startedAt: '2026-02-24T09:00:00Z',
    currentStepId: 'step-lv-1',
    currentStepName: 'Manager Approval',
    currentAssigneeName: 'Mike Chen',
    isOverdue: false,
    slaDueDays: 1,
    context: { leaveType: 'annual', days: 7 },
    steps: [
      {
        stepId: 'step-lv-1',
        stepName: 'Manager Approval',
        stepType: 'approval',
        status: 'current',
        assigneeName: 'Mike Chen',
        startedAt: '2026-02-24T09:00:00Z',
        slaDays: 2,
      },
      {
        stepId: 'step-lv-2',
        stepName: 'Check Leave Balance',
        stepType: 'condition',
        status: 'pending',
      },
      {
        stepId: 'step-lv-3',
        stepName: 'HR Notification',
        stepType: 'notification',
        status: 'pending',
      },
      { stepId: 'step-lv-5', stepName: 'Calendar Update', stepType: 'action', status: 'pending' },
    ],
  },
  {
    id: 'inst-002',
    workflowId: 'wf-002',
    workflowName: 'Expense Report Approval',
    workflowType: 'approval',
    status: 'running',
    entityType: 'expense_report',
    entityId: 'er-2026-89',
    entityTitle: 'Q1 Sales Conference Expenses — John Smith ($2,450)',
    initiatedBy: 'emp-002',
    initiatedByName: 'John Smith',
    startedAt: '2026-02-20T14:30:00Z',
    currentStepId: 'step-ex-3',
    currentStepName: 'Finance Controller Review',
    currentAssigneeName: 'David Kim',
    isOverdue: true,
    slaDueDays: -2,
    context: { amount: 2450, currency: 'USD' },
    steps: [
      {
        stepId: 'step-ex-1',
        stepName: 'Manager Approval',
        stepType: 'approval',
        status: 'completed',
        assigneeName: 'VP Sales (Mike Chen)',
        startedAt: '2026-02-20T14:30:00Z',
        completedAt: '2026-02-21T10:00:00Z',
        comment: 'Approved. Conference travel is justified.',
        slaDays: 3,
      },
      {
        stepId: 'step-ex-2',
        stepName: 'Amount Threshold Check',
        stepType: 'condition',
        status: 'completed',
        completedAt: '2026-02-21T10:01:00Z',
      },
      {
        stepId: 'step-ex-3',
        stepName: 'Finance Controller Review',
        stepType: 'approval',
        status: 'current',
        assigneeName: 'David Kim',
        startedAt: '2026-02-21T10:01:00Z',
        slaDays: 5,
        isOverdue: true,
      },
      {
        stepId: 'step-ex-4',
        stepName: 'Process Reimbursement',
        stepType: 'action',
        status: 'pending',
      },
    ],
  },
  {
    id: 'inst-003',
    workflowId: 'wf-003',
    workflowName: 'New Employee Onboarding',
    workflowType: 'notification',
    status: 'running',
    entityType: 'employee',
    entityId: 'emp-new-042',
    entityTitle: 'James Rodriguez — Backend Engineer',
    initiatedBy: 'hr-admin',
    initiatedByName: 'HR System',
    startedAt: '2026-02-23T00:00:00Z',
    currentStepId: 'step-ob-6',
    currentStepName: 'Day 1 Checklist',
    isOverdue: false,
    context: { startDate: '2026-02-25', department: 'Engineering' },
    steps: [
      {
        stepId: 'step-ob-1',
        stepName: 'Notify IT for Equipment Setup',
        stepType: 'notification',
        status: 'completed',
        completedAt: '2026-02-23T00:01:00Z',
      },
      {
        stepId: 'step-ob-2',
        stepName: 'Parallel Onboarding Tasks',
        stepType: 'parallel',
        status: 'completed',
        completedAt: '2026-02-24T09:00:00Z',
      },
      {
        stepId: 'step-ob-6',
        stepName: 'Day 1 Checklist',
        stepType: 'wait',
        status: 'current',
        startedAt: '2026-02-24T09:00:00Z',
      },
      {
        stepId: 'step-ob-7',
        stepName: 'Manager Introduction',
        stepType: 'action',
        status: 'pending',
      },
    ],
  },
  {
    id: 'inst-004',
    workflowId: 'wf-001',
    workflowName: 'Leave Request Approval',
    workflowType: 'approval',
    status: 'completed',
    entityType: 'leave_request',
    entityId: 'lr-2026-141',
    entityTitle: 'Sick Leave — Feb 22 (Priya Sharma)',
    initiatedBy: 'emp-005',
    initiatedByName: 'Priya Sharma',
    startedAt: '2026-02-22T07:00:00Z',
    completedAt: '2026-02-22T09:30:00Z',
    currentStepId: 'step-lv-5',
    currentStepName: 'Calendar Update',
    isOverdue: false,
    context: { leaveType: 'sick', days: 1 },
    steps: [
      {
        stepId: 'step-lv-1',
        stepName: 'Manager Approval',
        stepType: 'approval',
        status: 'completed',
        completedAt: '2026-02-22T09:00:00Z',
      },
      {
        stepId: 'step-lv-2',
        stepName: 'Check Leave Balance',
        stepType: 'condition',
        status: 'completed',
        completedAt: '2026-02-22T09:00:00Z',
      },
      {
        stepId: 'step-lv-3',
        stepName: 'HR Notification',
        stepType: 'notification',
        status: 'completed',
        completedAt: '2026-02-22T09:01:00Z',
      },
      {
        stepId: 'step-lv-5',
        stepName: 'Calendar Update',
        stepType: 'action',
        status: 'completed',
        completedAt: '2026-02-22T09:30:00Z',
      },
    ],
  },
];

const MOCK_DELEGATIONS: DelegationRule[] = [
  {
    id: 'del-001',
    delegatorId: 'emp-010',
    delegatorName: 'Robert Chen',
    delegateId: 'emp-011',
    delegateName: 'Alice Nguyen',
    modules: ['leave', 'expenses', 'approvals'],
    reason: 'Vacation — Hawaii trip',
    startDate: '2026-02-28',
    endDate: '2026-03-07',
    isActive: true,
    isOutOfOffice: true,
    createdAt: '2026-02-20T10:00:00Z',
  },
  {
    id: 'del-002',
    delegatorId: 'emp-013',
    delegatorName: 'Maria Garcia',
    delegateId: 'emp-012',
    delegateName: 'Dev Kumar',
    modules: ['performance', 'recruitment'],
    reason: 'Parental leave coverage',
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    isActive: true,
    isOutOfOffice: false,
    createdAt: '2026-02-10T14:00:00Z',
  },
  {
    id: 'del-003',
    delegatorId: 'emp-016',
    delegatorName: 'Tom Bradley',
    delegateId: 'emp-014',
    delegateName: 'Susan Park',
    modules: ['payroll', 'expenses'],
    reason: 'Conference attendance',
    startDate: '2026-01-20',
    endDate: '2026-01-25',
    isActive: false,
    isOutOfOffice: true,
    createdAt: '2026-01-15T09:00:00Z',
  },
];

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class WorkflowAutomationService {
  /**
   * Get all workflow definitions
   */
  static async getWorkflows(): Promise<WorkflowDefinitionFull[]> {
    try {
      return await APIClient.get<WorkflowDefinitionFull[]>('/v1/workflow-automation/workflows');
    } catch {
      return MOCK_WORKFLOWS;
    }
  }

  /**
   * Get a single workflow with full step details
   */
  static async getWorkflow(id: string): Promise<WorkflowDefinitionFull | null> {
    try {
      return await APIClient.get<WorkflowDefinitionFull>(`/v1/workflow-automation/workflows/${id}`);
    } catch {
      return MOCK_WORKFLOWS.find((w) => w.id === id) ?? null;
    }
  }

  /**
   * Create a new workflow definition
   */
  static async createWorkflow(data: CreateWorkflowInput): Promise<WorkflowDefinitionFull> {
    try {
      return await APIClient.post<WorkflowDefinitionFull>(
        '/v1/workflow-automation/workflows',
        data
      );
    } catch {
      const newWf: WorkflowDefinitionFull = {
        id: `wf-${Date.now()}`,
        ...data,
        steps: data.steps.map((s, i) => ({ ...s, id: `step-new-${i}` })),
        isActive: false,
        version: 1,
        createdBy: 'current-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalInstances: 0,
        avgCompletionDays: 0,
        slaCompliancePct: 100,
      };
      MOCK_WORKFLOWS.push(newWf);
      return newWf;
    }
  }

  /**
   * Update a workflow definition
   */
  static async updateWorkflow(
    id: string,
    data: Partial<WorkflowDefinitionFull>
  ): Promise<WorkflowDefinitionFull> {
    try {
      return await APIClient.patch<WorkflowDefinitionFull>(
        `/v1/workflow-automation/workflows/${id}`,
        data
      );
    } catch {
      const idx = MOCK_WORKFLOWS.findIndex((w) => w.id === id);
      if (idx < 0) throw new Error('Workflow not found');
      MOCK_WORKFLOWS[idx] = {
        ...MOCK_WORKFLOWS[idx],
        ...data,
        version: MOCK_WORKFLOWS[idx].version + 1,
        updatedAt: new Date().toISOString(),
      };
      return MOCK_WORKFLOWS[idx];
    }
  }

  /**
   * Toggle workflow active/inactive
   */
  static async toggleWorkflow(id: string, active: boolean): Promise<WorkflowDefinitionFull> {
    return WorkflowAutomationService.updateWorkflow(id, { isActive: active });
  }

  /**
   * Get instances for a workflow
   */
  static async getWorkflowInstances(
    workflowId?: string,
    status?: InstanceStatus
  ): Promise<WorkflowInstance[]> {
    try {
      return await APIClient.get<WorkflowInstance[]>('/v1/workflow-automation/instances', {
        workflowId,
        status,
      });
    } catch {
      let results = MOCK_INSTANCES;
      if (workflowId) results = results.filter((i) => i.workflowId === workflowId);
      if (status) results = results.filter((i) => i.status === status);
      return results;
    }
  }

  /**
   * Get analytics for a workflow
   */
  static async getWorkflowAnalytics(workflowId: string): Promise<WorkflowAnalytics> {
    try {
      return await APIClient.get<WorkflowAnalytics>(
        `/v1/workflow-automation/workflows/${workflowId}/analytics`
      );
    } catch {
      const wf = MOCK_WORKFLOWS.find((w) => w.id === workflowId);
      return {
        workflowId,
        avgCompletionDays: wf?.avgCompletionDays ?? 0,
        completionRate: 87,
        slaCompliancePct: wf?.slaCompliancePct ?? 100,
        totalInstances: wf?.totalInstances ?? 0,
        completedInstances: Math.floor((wf?.totalInstances ?? 0) * 0.87),
        cancelledInstances: Math.floor((wf?.totalInstances ?? 0) * 0.05),
        failedInstances: Math.floor((wf?.totalInstances ?? 0) * 0.02),
        stepBottlenecks: (wf?.steps ?? [])
          .filter((s) => s.type === 'approval')
          .map((s) => ({
            stepId: s.id,
            stepName: s.name,
            avgDays: Math.random() * 4 + 0.5,
            overdueCount: Math.floor(Math.random() * 10),
          })),
        volumeByMonth: [
          { month: 'Sep 2025', count: 18, completed: 16 },
          { month: 'Oct 2025', count: 24, completed: 21 },
          { month: 'Nov 2025', count: 31, completed: 28 },
          { month: 'Dec 2025', count: 22, completed: 19 },
          { month: 'Jan 2026', count: 35, completed: 31 },
          { month: 'Feb 2026', count: 28, completed: 24 },
        ],
      };
    }
  }

  /**
   * Get all delegation rules
   */
  static async getDelegationRules(activeOnly?: boolean): Promise<DelegationRule[]> {
    try {
      return await APIClient.get<DelegationRule[]>('/v1/workflow-automation/delegations', {
        activeOnly,
      });
    } catch {
      return activeOnly ? MOCK_DELEGATIONS.filter((d) => d.isActive) : MOCK_DELEGATIONS;
    }
  }

  /**
   * Create a new delegation rule
   */
  static async createDelegation(data: CreateDelegationInput): Promise<DelegationRule> {
    try {
      return await APIClient.post<DelegationRule>('/v1/workflow-automation/delegations', data);
    } catch {
      // Check for circular delegation
      const conflicts: string[] = [];
      const existingForDelegate = MOCK_DELEGATIONS.filter(
        (d) => d.isActive && d.delegatorId === data.delegateId
      );
      if (existingForDelegate.some((d) => d.delegateId === data.delegatorId)) {
        conflicts.push(
          'Circular delegation detected: the delegate already delegates to the delegator.'
        );
      }

      const newRule: DelegationRule = {
        id: `del-${Date.now()}`,
        ...data,
        delegatorName: 'Current User',
        delegateName: `User ${data.delegateId}`,
        isActive: true,
        createdAt: new Date().toISOString(),
        conflictsDetected: conflicts.length > 0 ? conflicts : undefined,
      };
      MOCK_DELEGATIONS.unshift(newRule);
      return newRule;
    }
  }

  /**
   * Revoke a delegation rule
   */
  static async revokeDelegation(id: string): Promise<void> {
    try {
      await APIClient.delete(`/v1/workflow-automation/delegations/${id}`);
    } catch {
      const idx = MOCK_DELEGATIONS.findIndex((d) => d.id === id);
      if (idx >= 0) MOCK_DELEGATIONS[idx].isActive = false;
    }
  }

  /**
   * Reassign a workflow instance step
   */
  static async reassignInstance(
    instanceId: string,
    newAssigneeId: string
  ): Promise<WorkflowInstance> {
    try {
      return await APIClient.patch<WorkflowInstance>(
        `/v1/workflow-automation/instances/${instanceId}/reassign`,
        { newAssigneeId }
      );
    } catch {
      const inst = MOCK_INSTANCES.find((i) => i.id === instanceId);
      if (!inst) throw new Error('Instance not found');
      inst.currentAssigneeName = `User ${newAssigneeId}`;
      return inst;
    }
  }

  /**
   * Cancel a running workflow instance
   */
  static async cancelInstance(instanceId: string, reason: string): Promise<WorkflowInstance> {
    try {
      return await APIClient.post<WorkflowInstance>(
        `/v1/workflow-automation/instances/${instanceId}/cancel`,
        { reason }
      );
    } catch {
      const idx = MOCK_INSTANCES.findIndex((i) => i.id === instanceId);
      if (idx < 0) throw new Error('Instance not found');
      MOCK_INSTANCES[idx] = {
        ...MOCK_INSTANCES[idx],
        status: 'cancelled',
        completedAt: new Date().toISOString(),
      };
      return MOCK_INSTANCES[idx];
    }
  }
}

export default WorkflowAutomationService;
