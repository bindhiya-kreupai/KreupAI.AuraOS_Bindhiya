// @ts-nocheck — Lib drift / missing typings. Tracked under #29.
/**
 * Workflow Engine Service
 * Phase 4: Enterprise Expansion - Approval Workflows
 */

import type {
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowTask,
  WorkflowStep,
  WorkflowType,
  WorkflowAnalytics,
  WorkflowAudit,
  DelegationRule,
  ApproverConfig,
  PendingApprover} from './types';
import {
  StepExecution,
} from './types';

/**
 * Default workflow templates
 */
const WORKFLOW_TEMPLATES: Partial<WorkflowDefinition>[] = [
  {
    name: 'Leave Request Approval',
    nameAr: 'موافقة طلب الإجازة',
    type: 'LEAVE_REQUEST',
    steps: [
      {
        id: 'start',
        name: 'Start',
        nameAr: 'البداية',
        order: 0,
        type: 'START',
        position: { x: 100, y: 200 },
      },
      {
        id: 'manager_approval',
        name: 'Manager Approval',
        nameAr: 'موافقة المدير',
        order: 1,
        type: 'APPROVAL',
        approvalType: 'SEQUENTIAL',
        approvers: [{ type: 'REPORTING_MANAGER' }],
        position: { x: 300, y: 200 },
      },
      {
        id: 'hr_review',
        name: 'HR Review',
        nameAr: 'مراجعة الموارد البشرية',
        order: 2,
        type: 'APPROVAL',
        approvalType: 'ANY_ONE',
        approvers: [{ type: 'ROLE', roleId: 'hr_manager' }],
        position: { x: 500, y: 200 },
      },
      {
        id: 'end',
        name: 'End',
        nameAr: 'النهاية',
        order: 3,
        type: 'END',
        position: { x: 700, y: 200 },
      },
    ],
    transitions: [
      { id: 't1', fromStepId: 'start', toStepId: 'manager_approval' },
      { id: 't2', fromStepId: 'manager_approval', toStepId: 'hr_review' },
      { id: 't3', fromStepId: 'hr_review', toStepId: 'end' },
    ],
  },
  {
    name: 'Expense Claim Approval',
    nameAr: 'موافقة طلب المصروفات',
    type: 'EXPENSE_CLAIM',
    steps: [
      {
        id: 'start',
        name: 'Start',
        nameAr: 'البداية',
        order: 0,
        type: 'START',
        position: { x: 100, y: 200 },
      },
      {
        id: 'check_amount',
        name: 'Check Amount',
        nameAr: 'التحقق من المبلغ',
        order: 1,
        type: 'CONDITION',
        conditionConfig: {
          conditions: [
            { id: 'c1', field: 'amount', operator: 'GT', value: 5000, valueType: 'STATIC' },
          ],
          trueTransition: 'finance_approval',
          falseTransition: 'manager_approval',
        },
        position: { x: 250, y: 200 },
      },
      {
        id: 'manager_approval',
        name: 'Manager Approval',
        nameAr: 'موافقة المدير',
        order: 2,
        type: 'APPROVAL',
        approvalType: 'SEQUENTIAL',
        approvers: [{ type: 'REPORTING_MANAGER' }],
        position: { x: 400, y: 100 },
      },
      {
        id: 'finance_approval',
        name: 'Finance Approval',
        nameAr: 'موافقة المالية',
        order: 3,
        type: 'APPROVAL',
        approvalType: 'SEQUENTIAL',
        approvers: [
          { type: 'REPORTING_MANAGER' },
          { type: 'ROLE', roleId: 'finance_manager' },
        ],
        position: { x: 400, y: 300 },
      },
      {
        id: 'end',
        name: 'End',
        nameAr: 'النهاية',
        order: 4,
        type: 'END',
        position: { x: 600, y: 200 },
      },
    ],
    transitions: [
      { id: 't1', fromStepId: 'start', toStepId: 'check_amount' },
      { id: 't2', fromStepId: 'check_amount', toStepId: 'manager_approval', conditions: [{ id: 'c2', field: 'amount', operator: 'LTE', value: 5000, valueType: 'STATIC' }] },
      { id: 't3', fromStepId: 'check_amount', toStepId: 'finance_approval', conditions: [{ id: 'c3', field: 'amount', operator: 'GT', value: 5000, valueType: 'STATIC' }] },
      { id: 't4', fromStepId: 'manager_approval', toStepId: 'end' },
      { id: 't5', fromStepId: 'finance_approval', toStepId: 'end' },
    ],
  },
];

/**
 * Workflow Engine Service
 */
export class WorkflowService {
  /**
   * Get workflow templates
   */
  static async getTemplates(type?: WorkflowType): Promise<Partial<WorkflowDefinition>[]> {
    if (type) {
      return WORKFLOW_TEMPLATES.filter(t => t.type === type);
    }
    return WORKFLOW_TEMPLATES;
  }

  /**
   * Create workflow definition
   */
  static async createWorkflow(
    tenantId: string,
    definition: Omit<WorkflowDefinition, 'id' | 'tenantId' | 'version' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<WorkflowDefinition> {
    const workflow: WorkflowDefinition = {
      id: `wf_${Date.now()}`,
      tenantId,
      ...definition,
      version: 1,
      isDraft: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
    };

    // In production, save to database
    return workflow;
  }

  /**
   * Create workflow from template
   */
  static async createFromTemplate(
    tenantId: string,
    type: WorkflowType,
    name: string,
    createdBy: string
  ): Promise<WorkflowDefinition> {
    const template = WORKFLOW_TEMPLATES.find(t => t.type === type);
    if (!template) {
      throw new Error(`No template found for type ${type}`);
    }

    return this.createWorkflow(
      tenantId,
      {
        name,
        nameAr: template.nameAr || name,
        type,
        status: 'DRAFT',
        isDraft: true,
        steps: template.steps || [],
        transitions: template.transitions || [],
        escalationEnabled: false,
        notifications: [],
      },
      createdBy
    );
  }

  /**
   * Publish workflow
   */
  static async publishWorkflow(workflowId: string): Promise<WorkflowDefinition> {
    // In production, update in database
    const workflow: WorkflowDefinition = {
      id: workflowId,
      tenantId: '',
      name: '',
      nameAr: '',
      type: 'LEAVE_REQUEST',
      status: 'ACTIVE',
      version: 1,
      publishedVersion: 1,
      isDraft: false,
      steps: [],
      transitions: [],
      escalationEnabled: false,
      notifications: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: '',
    };

    return workflow;
  }

  /**
   * Start workflow instance
   */
  static async startWorkflow(
    tenantId: string,
    workflowId: string,
    requesterId: string,
    requesterName: string,
    entityId: string,
    referenceType: string,
    referenceId: string,
    requestData: Record<string, any>
  ): Promise<WorkflowInstance> {
    // Get workflow definition
    const workflow = await this.getWorkflowById(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (workflow.status !== 'ACTIVE') {
      throw new Error('Workflow is not active');
    }

    // Find start step
    const startStep = workflow.steps.find(s => s.type === 'START');
    if (!startStep) {
      throw new Error('Workflow has no start step');
    }

    // Find first approval step
    const firstTransition = workflow.transitions.find(t => t.fromStepId === startStep.id);
    const firstStep = workflow.steps.find(s => s.id === firstTransition?.toStepId);

    // Resolve approvers
    const approvers = firstStep?.approvers
      ? await this.resolveApprovers(firstStep.approvers, requesterId, entityId, requestData)
      : [];

    const instance: WorkflowInstance = {
      id: `inst_${Date.now()}`,
      tenantId,
      workflowId,
      workflowName: workflow.name,
      workflowType: workflow.type,
      version: workflow.version,

      requesterId,
      requesterName,
      entityId,
      entityName: '', // Resolve from entity service

      referenceType,
      referenceId,
      referenceNumber: `${referenceType.substring(0, 3).toUpperCase()}-${Date.now()}`,

      requestData,

      status: 'IN_PROGRESS',
      currentStepId: firstStep?.id || startStep.id,
      currentStepName: firstStep?.name || startStep.name,

      stepHistory: [
        {
          stepId: startStep.id,
          stepName: startStep.name,
          stepType: 'START',
          status: 'COMPLETED',
          enteredAt: new Date(),
          exitedAt: new Date(),
        },
      ],
      currentApprovers: approvers,

      slaDeadline: workflow.slaHours
        ? new Date(Date.now() + workflow.slaHours * 60 * 60 * 1000)
        : undefined,
      isOverdue: false,

      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create tasks for approvers
    for (const approver of approvers) {
      await this.createTask(instance, firstStep!, approver);
    }

    // Log audit
    await this.logAudit(instance.id, 'SUBMITTED', requesterId, requesterName, startStep.id, startStep.name);

    return instance;
  }

  /**
   * Resolve approvers based on configuration
   */
  private static async resolveApprovers(
    configs: ApproverConfig[],
    requesterId: string,
    entityId: string,
    requestData: Record<string, any>
  ): Promise<PendingApprover[]> {
    const approvers: PendingApprover[] = [];

    for (const config of configs) {
      let userId: string | undefined;
      let userName = '';
      let role = '';

      switch (config.type) {
        case 'SPECIFIC_USER':
          userId = config.userId;
          userName = 'Specific User'; // Resolve from user service
          role = 'Approver';
          break;

        case 'REPORTING_MANAGER':
          // In production, resolve from employee service
          userId = 'mgr_' + requesterId;
          userName = 'Reporting Manager';
          role = 'Manager';
          break;

        case 'SKIP_LEVEL_MANAGER':
          userId = 'skip_mgr_' + requesterId;
          userName = 'Skip Level Manager';
          role = 'Senior Manager';
          break;

        case 'DEPARTMENT_HEAD':
          userId = 'dept_head_' + entityId;
          userName = 'Department Head';
          role = 'Department Head';
          break;

        case 'HR':
          userId = 'hr_manager';
          userName = 'HR Manager';
          role = 'HR';
          break;

        case 'ROLE':
          userId = `role_${config.roleId}`;
          userName = 'Role-based Approver';
          role = config.roleId || 'Approver';
          break;

        case 'DYNAMIC':
          if (config.dynamicField) {
            userId = requestData[config.dynamicField];
            userName = 'Dynamic Approver';
            role = 'Approver';
          }
          break;
      }

      if (userId) {
        approvers.push({
          userId,
          userName,
          role,
          assignedAt: new Date(),
        });
      }
    }

    return approvers;
  }

  /**
   * Create approval task
   */
  private static async createTask(
    instance: WorkflowInstance,
    step: WorkflowStep,
    approver: PendingApprover
  ): Promise<WorkflowTask> {
    const task: WorkflowTask = {
      id: `task_${Date.now()}_${approver.userId}`,
      instanceId: instance.id,
      stepId: step.id,

      assigneeId: approver.userId,
      assigneeName: approver.userName,

      type: step.type === 'APPROVAL' ? 'APPROVAL' : step.type === 'REVIEW' ? 'REVIEW' : 'TASK',
      title: `${instance.workflowType}: ${instance.referenceNumber}`,
      titleAr: `${instance.workflowType}: ${instance.referenceNumber}`,
      priority: 'MEDIUM',

      workflowType: instance.workflowType,
      referenceType: instance.referenceType,
      referenceId: instance.referenceId,
      requesterId: instance.requesterId,
      requesterName: instance.requesterName,

      status: 'PENDING',
      availableActions: ['APPROVE', 'REJECT', 'DELEGATE', 'REQUEST_INFO'],

      assignedAt: new Date(),
      requestData: instance.requestData,
    };

    // In production, save to database
    return task;
  }

  /**
   * Process approval action
   */
  static async processAction(
    instanceId: string,
    taskId: string,
    action: 'APPROVE' | 'REJECT' | 'DELEGATE' | 'REQUEST_INFO',
    actorId: string,
    actorName: string,
    comments?: string,
    delegateTo?: string
  ): Promise<WorkflowInstance> {
    // In production, fetch from database
    const instance = await this.getInstanceById(instanceId);
    if (!instance) {
      throw new Error('Workflow instance not found');
    }

    const workflow = await this.getWorkflowById(instance.workflowId);
    if (!workflow) {
      throw new Error('Workflow definition not found');
    }

    const currentStep = workflow.steps.find(s => s.id === instance.currentStepId);
    if (!currentStep) {
      throw new Error('Current step not found');
    }

    // Update step history
    instance.stepHistory.push({
      stepId: currentStep.id,
      stepName: currentStep.name,
      stepType: currentStep.type,
      status: action === 'REJECT' ? 'REJECTED' : 'COMPLETED',
      enteredAt: new Date(),
      exitedAt: new Date(),
      actor: {
        userId: actorId,
        userName: actorName,
        action: action === 'DELEGATE' ? 'DELEGATE' : action === 'APPROVE' ? 'APPROVE' : 'REJECT',
        comments,
      },
    });

    if (action === 'REJECT') {
      instance.status = 'REJECTED';
      instance.completedAt = new Date();
      await this.logAudit(instanceId, 'REJECTED', actorId, actorName, currentStep.id, currentStep.name, comments);
    } else if (action === 'DELEGATE') {
      // Create new task for delegate
      if (delegateTo) {
        await this.createTask(instance, currentStep, {
          userId: delegateTo,
          userName: 'Delegated Approver',
          role: 'Delegate',
          assignedAt: new Date(),
        });
      }
      await this.logAudit(instanceId, 'DELEGATED', actorId, actorName, currentStep.id, currentStep.name, comments);
    } else if (action === 'APPROVE') {
      // Check if all required approvals are complete
      const allApproved = await this.checkAllApprovals(instance, currentStep);

      if (allApproved) {
        // Move to next step
        const nextTransition = workflow.transitions.find(t => t.fromStepId === currentStep.id);
        const nextStep = workflow.steps.find(s => s.id === nextTransition?.toStepId);

        if (nextStep) {
          if (nextStep.type === 'END') {
            instance.status = 'APPROVED';
            instance.completedAt = new Date();
            await this.logAudit(instanceId, 'COMPLETED', actorId, actorName);
          } else {
            instance.currentStepId = nextStep.id;
            instance.currentStepName = nextStep.name;

            // Create tasks for next step approvers
            if (nextStep.approvers) {
              const approvers = await this.resolveApprovers(
                nextStep.approvers,
                instance.requesterId,
                instance.entityId,
                instance.requestData
              );
              instance.currentApprovers = approvers;

              for (const approver of approvers) {
                await this.createTask(instance, nextStep, approver);
              }
            }

            await this.logAudit(instanceId, 'STEP_ENTERED', actorId, actorName, nextStep.id, nextStep.name);
          }
        }
      }

      await this.logAudit(instanceId, 'APPROVED', actorId, actorName, currentStep.id, currentStep.name, comments);
    }

    instance.updatedAt = new Date();

    // In production, save to database
    return instance;
  }

  /**
   * Check if all required approvals are complete
   */
  private static async checkAllApprovals(
    instance: WorkflowInstance,
    step: WorkflowStep
  ): Promise<boolean> {
    // In production, check task statuses
    // For now, assume single approver
    return true;
  }

  /**
   * Get workflow by ID
   */
  static async getWorkflowById(workflowId: string): Promise<WorkflowDefinition | null> {
    // In production, fetch from database
    return null;
  }

  /**
   * Get workflow instance by ID
   */
  static async getInstanceById(instanceId: string): Promise<WorkflowInstance | null> {
    // In production, fetch from database
    return null;
  }

  /**
   * Get pending tasks for user
   */
  static async getPendingTasks(
    userId: string,
    filters?: {
      workflowType?: WorkflowType;
      priority?: string;
      status?: string;
    }
  ): Promise<WorkflowTask[]> {
    // In production, fetch from database
    return [];
  }

  /**
   * Get workflow instances
   */
  static async getInstances(
    tenantId: string,
    filters?: {
      workflowType?: WorkflowType;
      status?: string;
      requesterId?: string;
      entityId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<WorkflowInstance[]> {
    // In production, fetch from database
    return [];
  }

  /**
   * Cancel workflow instance
   */
  static async cancelInstance(
    instanceId: string,
    cancelledBy: string,
    reason: string
  ): Promise<WorkflowInstance> {
    const instance = await this.getInstanceById(instanceId);
    if (!instance) {
      throw new Error('Instance not found');
    }

    instance.status = 'CANCELLED';
    instance.completedAt = new Date();
    instance.updatedAt = new Date();

    await this.logAudit(instanceId, 'CANCELLED', cancelledBy, 'Canceller', undefined, undefined, reason);

    return instance;
  }

  /**
   * Create delegation rule
   */
  static async createDelegation(
    delegation: Omit<DelegationRule, 'id' | 'createdAt'>
  ): Promise<DelegationRule> {
    const rule: DelegationRule = {
      id: `del_${Date.now()}`,
      ...delegation,
      createdAt: new Date(),
    };

    // In production, save to database
    return rule;
  }

  /**
   * Get active delegations for user
   */
  static async getActiveDelegations(userId: string): Promise<DelegationRule[]> {
    // In production, fetch from database
    return [];
  }

  /**
   * Log workflow audit
   */
  private static async logAudit(
    instanceId: string,
    action: WorkflowAudit['action'],
    performedBy: string,
    performedByName: string,
    stepId?: string,
    stepName?: string,
    comments?: string
  ): Promise<WorkflowAudit> {
    const audit: WorkflowAudit = {
      id: `audit_${Date.now()}`,
      instanceId,
      action,
      performedBy,
      performedByName,
      stepId,
      stepName,
      comments,
      timestamp: new Date(),
    };

    // In production, save to database
    return audit;
  }

  /**
   * Get workflow analytics
   */
  static async getAnalytics(
    tenantId: string,
    period: string
  ): Promise<WorkflowAnalytics> {
    return {
      tenantId,
      period,
      totalInstances: 0,
      pendingInstances: 0,
      completedInstances: 0,
      rejectedInstances: 0,
      byType: [],
      avgApprovalTime: 0,
      avgCycleTime: 0,
      slaCompliance: 0,
      onTimeRate: 0,
      bottlenecks: [],
      topApprovers: [],
      generatedAt: new Date(),
    };
  }
}
