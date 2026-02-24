import { APIClient } from '@/lib/api-client';
import type {
  Workflow,
  WorkflowExecution,
  ExecutionStep,
  ApprovalChain,
  Integration,
  DynamicForm,
  WorkflowMetrics,
  WorkflowSettings,
  ApprovalDecision,
  TaskCompletion} from './types';
import {
  ExecutionStatus,
} from './types';

// ============================================================================
// Workflow Service
// ============================================================================

export class WorkflowService {
  static async getWorkflows(): Promise<Workflow[]> {
    const res = await APIClient.get<{ success: boolean; data: Workflow[] }>('/v1/admin/workflows');
    return res.data;
  }

  static async getWorkflowById(id: string): Promise<Workflow | null> {
    const res = await APIClient.get<{ success: boolean; data: Workflow }>(`/v1/admin/workflows/${id}`);
    return res.data;
  }

  static async createWorkflow(data: Partial<Workflow>): Promise<Workflow> {
    const res = await APIClient.post<{ success: boolean; data: Workflow }>('/v1/admin/workflows', data);
    return res.data;
  }

  static async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
    const res = await APIClient.put<{ success: boolean; data: Workflow }>(`/v1/admin/workflows/${id}`, updates);
    return res.data;
  }

  static async deleteWorkflow(id: string): Promise<void> {
    await APIClient.delete<void>(`/v1/admin/workflows/${id}`);
  }

  static async publishWorkflow(id: string, version: string): Promise<Workflow> {
    const res = await APIClient.put<{ success: boolean; data: Workflow }>(`/v1/admin/workflows/${id}`, {
      isActive: true,
      version,
    });
    return res.data;
  }

  static async cloneWorkflow(id: string, newName: string): Promise<Workflow> {
    const original = await this.getWorkflowById(id);
    if (!original) throw new Error('Workflow not found');
    const res = await APIClient.post<{ success: boolean; data: Workflow }>('/v1/admin/workflows', {
      ...original,
      id: undefined,
      name: newName,
      isActive: false,
    });
    return res.data;
  }

  static async getWorkflowVersions(workflowId: string): Promise<Workflow[]> {
    const res = await APIClient.get<{ success: boolean; data: Workflow }>(`/v1/admin/workflows/${workflowId}`);
    return res.data ? [res.data] : [];
  }
}

// ============================================================================
// Workflow Execution Service
// ============================================================================

export class WorkflowExecutionService {
  static async getExecutions(): Promise<WorkflowExecution[]> {
    const res = await APIClient.get<{ success: boolean; data: WorkflowExecution[] }>('/workflows', { type: 'instances' });
    return res.data;
  }

  static async getExecutionById(id: string): Promise<WorkflowExecution | null> {
    const res = await APIClient.get<{ success: boolean; data: WorkflowExecution[] }>('/workflows', { type: 'instances' });
    return res.data.find((e: any) => e.id === id) || null;
  }

  static async getExecutionsByWorkflow(workflowId: string): Promise<WorkflowExecution[]> {
    const res = await APIClient.get<{ success: boolean; data: WorkflowExecution[] }>('/workflows', {
      type: 'instances',
      definitionId: workflowId,
    });
    return res.data;
  }

  static async startExecution(
    workflowId: string,
    initiatorId: string,
    initiatorName: string,
    input: Record<string, any>
  ): Promise<WorkflowExecution> {
    const res = await APIClient.post<{ success: boolean; data: WorkflowExecution }>(`/v1/admin/workflows/${workflowId}/execute`, {
      input,
      triggeredBy: initiatorId,
    });
    return res.data;
  }

  static async updateExecution(id: string, updates: Partial<WorkflowExecution>): Promise<WorkflowExecution> {
    const res = await APIClient.post<{ success: boolean; data: WorkflowExecution }>('/workflows', {
      action: 'process',
      instanceId: id,
      status: updates.status,
      currentNode: updates.currentNodeId,
      context: updates.variables,
    });
    return res.data;
  }

  static async addExecutionStep(executionId: string, step: ExecutionStep): Promise<void> {
    await APIClient.post<{ success: boolean; data: any }>('/workflows', {
      action: 'process',
      instanceId: executionId,
      status: 'RUNNING',
      currentNode: step.nodeId,
    });
  }

  static async completeExecution(
    executionId: string,
    success: boolean,
    output?: Record<string, any>,
    error?: any
  ): Promise<void> {
    await APIClient.post<{ success: boolean; data: any }>('/workflows', {
      action: 'process',
      instanceId: executionId,
      status: success ? 'COMPLETED' : 'FAILED',
      context: output,
      error: error ? String(error) : undefined,
    });
  }

  static async pauseExecution(executionId: string): Promise<void> {
    await APIClient.post<{ success: boolean; data: any }>('/workflows', {
      action: 'process',
      instanceId: executionId,
      status: 'RUNNING',
    });
  }

  static async resumeExecution(executionId: string): Promise<void> {
    await APIClient.post<{ success: boolean; data: any }>('/workflows', {
      action: 'process',
      instanceId: executionId,
      status: 'RUNNING',
    });
  }

  static async cancelExecution(executionId: string, reason: string): Promise<void> {
    await APIClient.post<{ success: boolean; data: any }>('/workflows', {
      action: 'process',
      instanceId: executionId,
      status: 'CANCELLED',
      error: reason,
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
    const res = await APIClient.post<{ success: boolean; data: ExecutionStep }>('/workflows', {
      action: 'process',
      instanceId: executionId,
      status: decision.approved ? 'COMPLETED' : 'FAILED',
    });
    return res.data;
  }

  static async delegateApproval(
    executionId: string,
    stepId: string,
    fromUserId: string,
    toUserId: string,
    toUserName: string,
    reason: string
  ): Promise<void> {
    await APIClient.post<{ success: boolean; data: any }>('/workflows', {
      action: 'process',
      instanceId: executionId,
      status: 'RUNNING',
    });
  }
}

// ============================================================================
// Task Service
// ============================================================================

export class TaskService {
  static async completeTask(executionId: string, stepId: string, completion: TaskCompletion): Promise<ExecutionStep> {
    const res = await APIClient.post<{ success: boolean; data: ExecutionStep }>('/workflows', {
      action: 'process',
      instanceId: executionId,
      status: completion.completed ? 'COMPLETED' : 'RUNNING',
    });
    return res.data;
  }

  static async reassignTask(
    executionId: string,
    stepId: string,
    toUserId: string,
    toUserName: string,
    reason: string
  ): Promise<void> {
    await APIClient.post<{ success: boolean; data: any }>('/workflows', {
      action: 'process',
      instanceId: executionId,
      status: 'RUNNING',
    });
  }
}

// ============================================================================
// Approval Chain Service
// ============================================================================

export class ApprovalChainService {
  static async getChains(): Promise<ApprovalChain[]> {
    const res = await APIClient.get<{ success: boolean; data: any[] }>('/v1/admin/workflows', { trigger: 'EVENT' });
    return res.data as ApprovalChain[];
  }

  static async getChainById(id: string): Promise<ApprovalChain | null> {
    const res = await APIClient.get<{ success: boolean; data: any }>(`/v1/admin/workflows/${id}`);
    return res.data as ApprovalChain;
  }

  static async createChain(data: ApprovalChain): Promise<ApprovalChain> {
    const res = await APIClient.post<{ success: boolean; data: any }>('/v1/admin/workflows', {
      name: data.chainName,
      description: data.description,
      trigger: 'EVENT',
      nodes: data.levels,
      edges: [],
    });
    return res.data as ApprovalChain;
  }

  static async updateChain(id: string, updates: Partial<ApprovalChain>): Promise<ApprovalChain> {
    const res = await APIClient.put<{ success: boolean; data: any }>(`/v1/admin/workflows/${id}`, {
      name: updates.chainName,
      description: updates.description,
      nodes: updates.levels,
    });
    return res.data as ApprovalChain;
  }

  static async deleteChain(id: string): Promise<void> {
    await APIClient.delete<void>(`/v1/admin/workflows/${id}`);
  }
}

// ============================================================================
// Integration Service
// ============================================================================

export class IntegrationService {
  static async getIntegrations(): Promise<Integration[]> {
    const res = await APIClient.get<{ success: boolean; data: any[] }>('/v1/admin/workflows', { trigger: 'MANUAL' });
    return res.data as Integration[];
  }

  static async getIntegrationById(id: string): Promise<Integration | null> {
    const res = await APIClient.get<{ success: boolean; data: any }>(`/v1/admin/workflows/${id}`);
    return res.data as Integration;
  }

  static async createIntegration(data: Integration): Promise<Integration> {
    const res = await APIClient.post<{ success: boolean; data: any }>('/v1/admin/workflows', {
      name: data.integrationName,
      description: data.description,
      trigger: 'MANUAL',
      nodes: data.availableActions || [],
      edges: [],
    });
    return res.data as Integration;
  }

  static async updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration> {
    const res = await APIClient.put<{ success: boolean; data: any }>(`/v1/admin/workflows/${id}`, {
      name: updates.integrationName,
      description: updates.description,
    });
    return res.data as Integration;
  }

  static async deleteIntegration(id: string): Promise<void> {
    await APIClient.delete<void>(`/v1/admin/workflows/${id}`);
  }

  static async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    const workflow = await this.getIntegrationById(id);
    return { success: !!workflow, message: workflow ? 'Connection successful' : 'Not found' };
  }
}

// ============================================================================
// Form Builder Service
// ============================================================================

export class FormBuilderService {
  static async getForms(): Promise<DynamicForm[]> {
    const res = await APIClient.get<{ success: boolean; data: any[] }>('/v1/admin/workflows', { trigger: 'MANUAL' });
    return res.data as DynamicForm[];
  }

  static async getFormById(id: string): Promise<DynamicForm | null> {
    const res = await APIClient.get<{ success: boolean; data: any }>(`/v1/admin/workflows/${id}`);
    return res.data as DynamicForm;
  }

  static async createForm(data: DynamicForm): Promise<DynamicForm> {
    const res = await APIClient.post<{ success: boolean; data: any }>('/v1/admin/workflows', {
      name: data.formName,
      description: data.description,
      trigger: 'MANUAL',
      nodes: data.fields || [],
      edges: [],
    });
    return res.data as DynamicForm;
  }

  static async updateForm(id: string, updates: Partial<DynamicForm>): Promise<DynamicForm> {
    const res = await APIClient.put<{ success: boolean; data: any }>(`/v1/admin/workflows/${id}`, {
      name: updates.formName,
      description: updates.description,
      nodes: updates.fields,
    });
    return res.data as DynamicForm;
  }

  static async deleteForm(id: string): Promise<void> {
    await APIClient.delete<void>(`/v1/admin/workflows/${id}`);
  }

  static async cloneForm(id: string, newName: string): Promise<DynamicForm> {
    const original = await this.getFormById(id);
    if (!original) throw new Error('Form not found');
    return this.createForm({ ...original, formName: newName } as DynamicForm);
  }
}

// ============================================================================
// Analytics Service
// ============================================================================

export class WorkflowAnalyticsService {
  static async getMetrics(): Promise<WorkflowMetrics> {
    const res = await APIClient.get<{ success: boolean; data: any }>('/workflows', { type: 'analytics' });
    const d = res.data;
    return {
      totalExecutions: d.totalInstances || 0,
      successfulExecutions: d.completedInstances || 0,
      failedExecutions: d.failedInstances || 0,
      cancelledExecutions: d.cancelledInstances || 0,
      successRate: d.successRate || 0,
      averageExecutionTime: 0,
      medianExecutionTime: 0,
      minExecutionTime: 0,
      maxExecutionTime: 0,
      runningExecutions: d.runningInstances || 0,
      pendingExecutions: 0,
      pausedExecutions: 0,
      totalApprovals: 0,
      approvalRate: 0,
      averageApprovalTime: 0,
      escalationRate: 0,
      totalTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      taskCompletionRate: 0,
      averageTaskCompletionTime: 0,
      topWorkflowsByUsage: [],
      topWorkflowsByDuration: [],
      topWorkflowsByFailure: [],
      executionTrends: [],
      performanceTrends: [],
      lastUpdated: new Date().toISOString(),
    } as WorkflowMetrics;
  }
}

// ============================================================================
// Settings Service
// ============================================================================

export class WorkflowSettingsService {
  static async getSettings(): Promise<WorkflowSettings> {
    return {
      defaultExecutionTimeout: 60,
      maxConcurrentExecutions: 10,
      enableAutoRetry: true,
      defaultRetryAttempts: 3,
      defaultRetryDelay: 30,
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
      requireApprovalForPublish: false,
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
  }

  static async updateSettings(updates: Partial<WorkflowSettings>): Promise<WorkflowSettings> {
    const current = await this.getSettings();
    return { ...current, ...updates, lastModified: new Date().toISOString() };
  }
}
