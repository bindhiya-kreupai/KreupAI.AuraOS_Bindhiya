/**
 * Workflow Engine Module - Services
 * API-ready service layer for workflow operations
 */

import {
  Workflow,
  WorkflowExecution,
  ExecutionStep,
  ApprovalChain,
  Integration,
  DynamicForm,
  WorkflowMetrics,
  WorkflowSettings,
  ApprovalDecision,
  TaskCompletion,
  ExecutionStatus,
} from './types';

// Storage keys
const STORAGE_KEYS = {
  WORKFLOWS: 'workflow_workflows',
  EXECUTIONS: 'workflow_executions',
  APPROVAL_CHAINS: 'workflow_approval_chains',
  INTEGRATIONS: 'workflow_integrations',
  FORMS: 'workflow_forms',
  SETTINGS: 'workflow_settings',
};

// ============================================================================
// Workflow Service
// ============================================================================

export class WorkflowService {
  static async getWorkflows(): Promise<Workflow[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getWorkflowById(id: string): Promise<Workflow | null> {
    const workflows = await this.getWorkflows();
    return workflows.find((w) => w.id === id) || null;
  }

  static async createWorkflow(data: Workflow): Promise<Workflow> {
    const workflows = await this.getWorkflows();
    workflows.push(data);
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
    return data;
  }

  static async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
    const workflows = await this.getWorkflows();
    const index = workflows.findIndex((w) => w.id === id);
    if (index === -1) throw new Error('Workflow not found');
    workflows[index] = { ...workflows[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
    return workflows[index];
  }

  static async deleteWorkflow(id: string): Promise<void> {
    const workflows = await this.getWorkflows();
    const filtered = workflows.filter((w) => w.id !== id);
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(filtered));
  }

  static async publishWorkflow(id: string, version: string): Promise<Workflow> {
    return this.updateWorkflow(id, {
      isDraft: false,
      publishedVersion: version,
      status: 'active',
    });
  }

  static async cloneWorkflow(id: string, newName: string): Promise<Workflow> {
    const workflow = await this.getWorkflowById(id);
    if (!workflow) throw new Error('Workflow not found');

    const clone: Workflow = {
      ...workflow,
      id: `wf-${Date.now()}`,
      workflowCode: `WF-${Date.now()}`,
      workflowName: newName,
      version: '1.0.0',
      isDraft: true,
      publishedVersion: undefined,
      parentWorkflowId: id,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
    };

    return this.createWorkflow(clone);
  }

  static async getWorkflowVersions(workflowId: string): Promise<Workflow[]> {
    const workflows = await this.getWorkflows();
    return workflows.filter((w) => w.id === workflowId || w.parentWorkflowId === workflowId);
  }
}

// ============================================================================
// Workflow Execution Service
// ============================================================================

export class WorkflowExecutionService {
  static async getExecutions(): Promise<WorkflowExecution[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.EXECUTIONS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getExecutionById(id: string): Promise<WorkflowExecution | null> {
    const executions = await this.getExecutions();
    return executions.find((e) => e.id === id) || null;
  }

  static async getExecutionsByWorkflow(workflowId: string): Promise<WorkflowExecution[]> {
    const executions = await this.getExecutions();
    return executions.filter((e) => e.workflowId === workflowId);
  }

  static async startExecution(
    workflowId: string,
    initiatorId: string,
    initiatorName: string,
    input: Record<string, any>
  ): Promise<WorkflowExecution> {
    const workflow = await WorkflowService.getWorkflowById(workflowId);
    if (!workflow) throw new Error('Workflow not found');
    if (workflow.status !== 'active') throw new Error('Workflow is not active');

    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      executionCode: `EXEC-${Date.now()}`,
      workflowId,
      workflowName: workflow.workflowName,
      workflowVersion: workflow.version,
      initiatorId,
      initiatorName,
      initiatedDate: new Date().toISOString(),
      status: 'running',
      currentNodeId: workflow.startNodeId,
      currentNodeName: workflow.nodes.find((n) => n.id === workflow.startNodeId)?.label || 'Start',
      input,
      variables: { ...input },
      steps: [],
      startDate: new Date().toISOString(),
      metadata: {},
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Workflow execution started',
          nodeId: workflow.startNodeId,
        },
      ],
    };

    const executions = await this.getExecutions();
    executions.push(execution);
    localStorage.setItem(STORAGE_KEYS.EXECUTIONS, JSON.stringify(executions));

    // Update workflow stats
    await WorkflowService.updateWorkflow(workflowId, {
      totalExecutions: workflow.totalExecutions + 1,
      lastExecutionDate: new Date().toISOString(),
    });

    return execution;
  }

  static async updateExecution(id: string, updates: Partial<WorkflowExecution>): Promise<WorkflowExecution> {
    const executions = await this.getExecutions();
    const index = executions.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Execution not found');
    executions[index] = { ...executions[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.EXECUTIONS, JSON.stringify(executions));
    return executions[index];
  }

  static async addExecutionStep(executionId: string, step: ExecutionStep): Promise<void> {
    const execution = await this.getExecutionById(executionId);
    if (!execution) throw new Error('Execution not found');

    const steps = execution.steps || [];
    steps.push(step);

    await this.updateExecution(executionId, {
      steps,
      currentNodeId: step.nodeId,
      currentNodeName: step.nodeName,
    });
  }

  static async completeExecution(
    executionId: string,
    success: boolean,
    output?: Record<string, any>,
    error?: any
  ): Promise<void> {
    const execution = await this.getExecutionById(executionId);
    if (!execution) throw new Error('Execution not found');

    const endDate = new Date().toISOString();
    const duration = Math.floor((new Date(endDate).getTime() - new Date(execution.startDate).getTime()) / 1000);

    await this.updateExecution(executionId, {
      status: success ? 'completed' : 'failed',
      endDate,
      duration,
      output,
      result: {
        success,
        message: success ? 'Workflow completed successfully' : 'Workflow failed',
        data: output,
      },
      error: error
        ? {
            code: error.code || 'UNKNOWN_ERROR',
            message: error.message || 'Unknown error occurred',
            details: error.details,
            stackTrace: error.stack,
            nodeId: execution.currentNodeId || '',
            nodeName: execution.currentNodeName || '',
            timestamp: new Date().toISOString(),
            recoverable: false,
          }
        : undefined,
    });

    // Update workflow stats
    const workflow = await WorkflowService.getWorkflowById(execution.workflowId);
    if (workflow) {
      await WorkflowService.updateWorkflow(execution.workflowId, {
        successfulExecutions: success ? workflow.successfulExecutions + 1 : workflow.successfulExecutions,
        failedExecutions: !success ? workflow.failedExecutions + 1 : workflow.failedExecutions,
      });
    }
  }

  static async pauseExecution(executionId: string): Promise<void> {
    await this.updateExecution(executionId, {
      status: 'paused',
    });
  }

  static async resumeExecution(executionId: string): Promise<void> {
    await this.updateExecution(executionId, {
      status: 'running',
    });
  }

  static async cancelExecution(executionId: string, reason: string): Promise<void> {
    const execution = await this.getExecutionById(executionId);
    if (!execution) throw new Error('Execution not found');

    const endDate = new Date().toISOString();
    const duration = Math.floor((new Date(endDate).getTime() - new Date(execution.startDate).getTime()) / 1000);

    await this.updateExecution(executionId, {
      status: 'cancelled',
      endDate,
      duration,
      result: {
        success: false,
        message: `Workflow cancelled: ${reason}`,
      },
    });
  }
}

// ============================================================================
// Approval Service
// ============================================================================

export class ApprovalService {
  static async submitApproval(
    executionId: string,
    stepId: string,
    decision: ApprovalDecision
  ): Promise<ExecutionStep> {
    const execution = await WorkflowExecutionService.getExecutionById(executionId);
    if (!execution) throw new Error('Execution not found');

    const step = execution.steps.find((s) => s.id === stepId);
    if (!step) throw new Error('Step not found');
    if (step.nodeType !== 'approval') throw new Error('Step is not an approval step');

    const updatedStep: ExecutionStep = {
      ...step,
      decision,
      status: 'completed',
      endDate: new Date().toISOString(),
      duration: step.startDate
        ? Math.floor((new Date().getTime() - new Date(step.startDate).getTime()) / 1000)
        : 0,
      completedBy: decision.decidedBy,
      completedByName: decision.decidedByName,
    };

    const updatedSteps = execution.steps.map((s) => (s.id === stepId ? updatedStep : s));

    await WorkflowExecutionService.updateExecution(executionId, {
      steps: updatedSteps,
    });

    return updatedStep;
  }

  static async delegateApproval(
    executionId: string,
    stepId: string,
    fromUserId: string,
    toUserId: string,
    toUserName: string,
    reason: string
  ): Promise<void> {
    const execution = await WorkflowExecutionService.getExecutionById(executionId);
    if (!execution) throw new Error('Execution not found');

    const step = execution.steps.find((s) => s.id === stepId);
    if (!step) throw new Error('Step not found');
    if (step.assignee !== fromUserId) throw new Error('Only assigned approver can delegate');

    const updatedStep: ExecutionStep = {
      ...step,
      assignee: toUserId,
      assigneeName: toUserName,
      logs: [
        ...(step.logs || []),
        {
          timestamp: new Date().toISOString(),
          message: `Approval delegated to ${toUserName}: ${reason}`,
          level: 'info',
        },
      ],
    };

    const updatedSteps = execution.steps.map((s) => (s.id === stepId ? updatedStep : s));

    await WorkflowExecutionService.updateExecution(executionId, {
      steps: updatedSteps,
    });
  }
}

// ============================================================================
// Task Service
// ============================================================================

export class TaskService {
  static async completeTask(executionId: string, stepId: string, completion: TaskCompletion): Promise<ExecutionStep> {
    const execution = await WorkflowExecutionService.getExecutionById(executionId);
    if (!execution) throw new Error('Execution not found');

    const step = execution.steps.find((s) => s.id === stepId);
    if (!step) throw new Error('Step not found');
    if (step.nodeType !== 'task' && step.nodeType !== 'form') throw new Error('Step is not a task step');

    const updatedStep: ExecutionStep = {
      ...step,
      decision: completion,
      status: 'completed',
      endDate: new Date().toISOString(),
      duration: step.startDate
        ? Math.floor((new Date().getTime() - new Date(step.startDate).getTime()) / 1000)
        : 0,
      completedBy: completion.completedBy,
      completedByName: completion.completedByName,
      output: completion.formData,
    };

    const updatedSteps = execution.steps.map((s) => (s.id === stepId ? updatedStep : s));

    await WorkflowExecutionService.updateExecution(executionId, {
      steps: updatedSteps,
    });

    return updatedStep;
  }

  static async reassignTask(
    executionId: string,
    stepId: string,
    toUserId: string,
    toUserName: string,
    reason: string
  ): Promise<void> {
    const execution = await WorkflowExecutionService.getExecutionById(executionId);
    if (!execution) throw new Error('Execution not found');

    const step = execution.steps.find((s) => s.id === stepId);
    if (!step) throw new Error('Step not found');

    const updatedStep: ExecutionStep = {
      ...step,
      assignee: toUserId,
      assigneeName: toUserName,
      logs: [
        ...(step.logs || []),
        {
          timestamp: new Date().toISOString(),
          message: `Task reassigned to ${toUserName}: ${reason}`,
          level: 'info',
        },
      ],
    };

    const updatedSteps = execution.steps.map((s) => (s.id === stepId ? updatedStep : s));

    await WorkflowExecutionService.updateExecution(executionId, {
      steps: updatedSteps,
    });
  }
}

// ============================================================================
// Approval Chain Service
// ============================================================================

export class ApprovalChainService {
  static async getChains(): Promise<ApprovalChain[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.APPROVAL_CHAINS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getChainById(id: string): Promise<ApprovalChain | null> {
    const chains = await this.getChains();
    return chains.find((c) => c.id === id) || null;
  }

  static async createChain(data: ApprovalChain): Promise<ApprovalChain> {
    const chains = await this.getChains();
    chains.push(data);
    localStorage.setItem(STORAGE_KEYS.APPROVAL_CHAINS, JSON.stringify(chains));
    return data;
  }

  static async updateChain(id: string, updates: Partial<ApprovalChain>): Promise<ApprovalChain> {
    const chains = await this.getChains();
    const index = chains.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Approval chain not found');
    chains[index] = { ...chains[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.APPROVAL_CHAINS, JSON.stringify(chains));
    return chains[index];
  }

  static async deleteChain(id: string): Promise<void> {
    const chains = await this.getChains();
    const filtered = chains.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.APPROVAL_CHAINS, JSON.stringify(filtered));
  }
}

// ============================================================================
// Integration Service
// ============================================================================

export class IntegrationService {
  static async getIntegrations(): Promise<Integration[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.INTEGRATIONS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getIntegrationById(id: string): Promise<Integration | null> {
    const integrations = await this.getIntegrations();
    return integrations.find((i) => i.id === id) || null;
  }

  static async createIntegration(data: Integration): Promise<Integration> {
    const integrations = await this.getIntegrations();
    integrations.push(data);
    localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify(integrations));
    return data;
  }

  static async updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration> {
    const integrations = await this.getIntegrations();
    const index = integrations.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Integration not found');
    integrations[index] = { ...integrations[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify(integrations));
    return integrations[index];
  }

  static async deleteIntegration(id: string): Promise<void> {
    const integrations = await this.getIntegrations();
    const filtered = integrations.filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify(filtered));
  }

  static async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    // TODO: Implement actual connection testing
    // This is a placeholder implementation
    await this.updateIntegration(id, {
      lastTestedDate: new Date().toISOString(),
      lastTestedStatus: 'success',
    });

    return {
      success: true,
      message: 'Connection test successful',
    };
  }
}

// ============================================================================
// Form Builder Service
// ============================================================================

export class FormBuilderService {
  static async getForms(): Promise<DynamicForm[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.FORMS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getFormById(id: string): Promise<DynamicForm | null> {
    const forms = await this.getForms();
    return forms.find((f) => f.id === id) || null;
  }

  static async createForm(data: DynamicForm): Promise<DynamicForm> {
    const forms = await this.getForms();
    forms.push(data);
    localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(forms));
    return data;
  }

  static async updateForm(id: string, updates: Partial<DynamicForm>): Promise<DynamicForm> {
    const forms = await this.getForms();
    const index = forms.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('Form not found');
    forms[index] = { ...forms[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(forms));
    return forms[index];
  }

  static async deleteForm(id: string): Promise<void> {
    const forms = await this.getForms();
    const filtered = forms.filter((f) => f.id !== id);
    localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(filtered));
  }

  static async cloneForm(id: string, newName: string): Promise<DynamicForm> {
    const form = await this.getFormById(id);
    if (!form) throw new Error('Form not found');

    const clone: DynamicForm = {
      ...form,
      id: `form-${Date.now()}`,
      formCode: `FORM-${Date.now()}`,
      formName: newName,
      version: '1.0.0',
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    return this.createForm(clone);
  }
}

// ============================================================================
// Analytics Service
// ============================================================================

export class WorkflowAnalyticsService {
  static async getMetrics(): Promise<WorkflowMetrics> {
    const workflows = await WorkflowService.getWorkflows();
    const executions = await WorkflowExecutionService.getExecutions();

    const completedExecutions = executions.filter((e) => e.status === 'completed');
    const failedExecutions = executions.filter((e) => e.status === 'failed');
    const cancelledExecutions = executions.filter((e) => e.status === 'cancelled');
    const runningExecutions = executions.filter((e) => e.status === 'running');
    const pendingExecutions = executions.filter((e) => e.status === 'pending');
    const pausedExecutions = executions.filter((e) => e.status === 'paused');

    // Calculate average execution time
    const executionTimes = completedExecutions
      .filter((e) => e.duration)
      .map((e) => e.duration as number);
    const avgExecutionTime = executionTimes.length > 0
      ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
      : 0;

    const medianExecutionTime = executionTimes.length > 0
      ? executionTimes.sort((a, b) => a - b)[Math.floor(executionTimes.length / 2)]
      : 0;

    // Calculate approval metrics
    const allSteps = executions.flatMap((e) => e.steps);
    const approvalSteps = allSteps.filter((s) => s.nodeType === 'approval');
    const completedApprovals = approvalSteps.filter((s) => s.status === 'completed');
    const approvedSteps = completedApprovals.filter((s) => s.decision && (s.decision as any).approved);

    return {
      totalExecutions: executions.length,
      successfulExecutions: completedExecutions.length,
      failedExecutions: failedExecutions.length,
      cancelledExecutions: cancelledExecutions.length,
      successRate: executions.length > 0 ? (completedExecutions.length / executions.length) * 100 : 0,

      averageExecutionTime: avgExecutionTime,
      medianExecutionTime,
      minExecutionTime: executionTimes.length > 0 ? Math.min(...executionTimes) : 0,
      maxExecutionTime: executionTimes.length > 0 ? Math.max(...executionTimes) : 0,

      runningExecutions: runningExecutions.length,
      pendingExecutions: pendingExecutions.length,
      pausedExecutions: pausedExecutions.length,

      totalApprovals: approvalSteps.length,
      approvalRate: completedApprovals.length > 0 ? (approvedSteps.length / completedApprovals.length) * 100 : 0,
      averageApprovalTime: 4.5, // Placeholder
      escalationRate: 2.3, // Placeholder

      totalTasks: allSteps.filter((s) => s.nodeType === 'task' || s.nodeType === 'form').length,
      completedTasks: allSteps.filter((s) => (s.nodeType === 'task' || s.nodeType === 'form') && s.status === 'completed').length,
      overdueTasks: 0, // Placeholder
      taskCompletionRate: 85.5, // Placeholder
      averageTaskCompletionTime: 3.2, // Placeholder

      topWorkflowsByUsage: [],
      topWorkflowsByDuration: [],
      topWorkflowsByFailure: [],

      executionTrends: [],
      performanceTrends: [],

      lastUpdated: new Date().toISOString(),
    };
  }
}

// ============================================================================
// Settings Service
// ============================================================================

export class WorkflowSettingsService {
  static async getSettings(): Promise<WorkflowSettings> {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) return JSON.parse(stored);

    const defaultSettings: WorkflowSettings = {
      defaultExecutionTimeout: 1440, // 24 hours
      maxConcurrentExecutions: 100,
      enableAutoRetry: true,
      defaultRetryAttempts: 3,
      defaultRetryDelay: 60,

      defaultApprovalTimeout: 48,
      enableAutoEscalation: true,
      defaultEscalationTime: 24,
      allowDelegation: true,

      enableNotifications: true,
      notifyOnApprovalRequest: true,
      notifyOnApprovalDecision: true,
      notifyOnTaskAssignment: true,
      notifyOnWorkflowCompletion: true,
      notifyOnWorkflowFailure: true,

      requireApprovalForPublish: true,
      enableAuditLog: true,
      dataRetentionDays: 365,
      allowExternalIntegrations: true,

      enableVersionControl: true,
      enableDraftMode: true,
      enableTesting: true,
      maxWorkflowNodes: 100,

      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  static async updateSettings(updates: Partial<WorkflowSettings>): Promise<WorkflowSettings> {
    const settings = await this.getSettings();
    const updated = { ...settings, ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}
