// @ts-nocheck — Frontend service drift / type narrowing. Tracked under #29.
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
  TaskCompletion,
} from './types';
import { ExecutionStatus } from './types';

// ============================================================================
// Workflow Service — Definitions CRUD
// ============================================================================

export class WorkflowService {
  private static unwrap<T>(res: any): T {
    const a = res?.data ?? res;
    return (a?.data ?? a) as T;
  }

  static async getWorkflows(): Promise<Workflow[]> {
    const res = await APIClient.get<any>('/workflow-engine/definitions');
    const data = this.unwrap<Workflow[] | { workflows: Workflow[] }>(res);
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && 'workflows' in data)
      return (data as any).workflows || [];
    return [];
  }

  static async getWorkflowById(id: string): Promise<Workflow | null> {
    const res = await APIClient.get<any>(`/workflow-engine/definitions/${id}`);
    return this.unwrap<Workflow | null>(res);
  }

  static async createWorkflow(data: Partial<Workflow>): Promise<Workflow> {
    const res = await APIClient.post<any>('/workflow-engine/definitions', {
      processType: data.processType || 'GENERIC',
      name: data.name,
      description: data.description,
      trigger: data.trigger || data.processType || 'MANUAL',
      triggerEvent: data.triggerEvent,
      nodes: data.nodes || [],
      edges: data.edges || [],
    });
    return this.unwrap<Workflow>(res);
  }

  static async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
    const res = await APIClient.put<any>(`/workflow-engine/definitions/${id}`, updates);
    return this.unwrap<Workflow>(res);
  }

  static async deleteWorkflow(id: string): Promise<void> {
    await APIClient.delete<any>(`/workflow-engine/definitions/${id}`);
  }

  static async publishWorkflow(id: string): Promise<Workflow> {
    const res = await APIClient.post<any>(`/workflow-engine/definitions/${id}/activate`);
    return this.unwrap<Workflow>(res);
  }

  static async cloneWorkflow(id: string, newName: string): Promise<Workflow> {
    const original = await this.getWorkflowById(id);
    if (!original) throw new Error('Workflow not found');
    return this.createWorkflow({ ...original, name: newName });
  }

  static async getWorkflowVersions(workflowId: string): Promise<Workflow[]> {
    const res = await APIClient.get<any>(`/workflow-engine/definitions/${workflowId}`);
    const data = this.unwrap<any>(res);
    return data ? [data as Workflow] : [];
  }

  static async getStats() {
    const res = await APIClient.get<any>('/workflow-engine/definitions', { stats: 'true' });
    return this.unwrap<any>(res);
  }
}

// ============================================================================
// Workflow Execution Service — Instances
// ============================================================================

export class WorkflowExecutionService {
  private static unwrap<T>(res: any): T {
    const a = res?.data ?? res;
    return (a?.data ?? a) as T;
  }

  static async getExecutions(): Promise<WorkflowExecution[]> {
    const res = await APIClient.get<any>('/workflow-engine/instances', { limit: 100 });
    const data = this.unwrap<WorkflowExecution[] | { instances: WorkflowExecution[] }>(res);
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && 'instances' in data)
      return (data as any).instances || [];
    return [];
  }

  static async getExecutionById(id: string): Promise<WorkflowExecution | null> {
    const res = await APIClient.get<any>(`/workflow-engine/instances/${id}`);
    return this.unwrap<WorkflowExecution | null>(res);
  }

  static async getExecutionsByWorkflow(workflowId: string): Promise<WorkflowExecution[]> {
    const res = await APIClient.get<any>('/workflow-engine/instances', {
      definitionId: workflowId,
    });
    const data = this.unwrap<WorkflowExecution[] | { instances: WorkflowExecution[] }>(res);
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && 'instances' in data)
      return (data as any).instances || [];
    return [];
  }

  static async startExecution(
    workflowId: string,
    initiatorId: string,
    initiatorName: string,
    input: Record<string, any>
  ): Promise<WorkflowExecution> {
    const res = await APIClient.post<any>('/workflow-engine/instances', {
      definitionId: workflowId,
      processType: input.processType || 'GENERIC',
      snapshotData: input,
      variables: input,
    });
    return this.unwrap<WorkflowExecution>(res);
  }

  static async cancelExecution(executionId: string, reason: string): Promise<void> {
    await APIClient.post(`/workflow-engine/instances/${executionId}/cancel`, {
      comment: reason,
    });
  }

  static async updateExecution(
    id: string,
    updates: Partial<WorkflowExecution>
  ): Promise<WorkflowExecution> {
    const res = await APIClient.put<any>(`/workflow-engine/instances/${id}`, updates);
    return this.unwrap<WorkflowExecution>(res);
  }

  static async addExecutionStep(_executionId: string, _step: ExecutionStep): Promise<void> {
    throw new Error(
      'addExecutionStep is not supported. Steps are managed server-side when the workflow advances.'
    );
  }

  static async completeExecution(
    executionId: string,
    success: boolean,
    output?: Record<string, any>
  ): Promise<void> {
    if (success) {
      await APIClient.post(`/workflow-engine/instances/${executionId}/complete`, { output });
    } else {
      await APIClient.post(`/workflow-engine/instances/${executionId}/cancel`, {
        comment: 'Execution completed with errors',
      });
    }
  }

  static async pauseExecution(executionId: string): Promise<void> {
    await APIClient.post(`/workflow-engine/instances/${executionId}/pause`, {});
  }

  static async resumeExecution(executionId: string): Promise<void> {
    await APIClient.post(`/workflow-engine/instances/${executionId}/resume`, {});
  }
}

// ============================================================================
// Approval Service — Task Actions
// ============================================================================

export class ApprovalService {
  private static unwrap<T>(res: any): T {
    const a = res?.data ?? res;
    return (a?.data ?? a) as T;
  }

  static async submitApproval(taskId: string, decision: ApprovalDecision): Promise<ExecutionStep> {
    const res = await APIClient.post<any>(`/workflow-engine/tasks/${taskId}/action`, {
      action: decision.approved ? 'APPROVE' : 'REJECT',
      comment: decision.comment,
    });
    return this.unwrap<ExecutionStep>(res);
  }

  static async delegateApproval(taskId: string, toUserId: string, reason: string): Promise<void> {
    await APIClient.post(`/workflow-engine/tasks/${taskId}/delegate`, {
      toUserId,
      reason,
    });
  }
}

// ============================================================================
// Task Service — Inbox & Task Management
// ============================================================================

export class TaskService {
  private static unwrap<T>(res: any): T {
    const a = res?.data ?? res;
    return (a?.data ?? a) as T;
  }

  static async getInbox(filters?: { processType?: string; status?: string; slaState?: string }) {
    const res = await APIClient.get<any>('/workflow-engine/tasks/inbox', filters);
    const data = this.unwrap<any[]>(res);
    return Array.isArray(data) ? data : [];
  }

  static async completeTask(taskId: string, completion: TaskCompletion): Promise<ExecutionStep> {
    const res = await APIClient.post<any>(`/workflow-engine/tasks/${taskId}/action`, {
      action: completion.completed ? 'APPROVE' : 'REJECT',
      comment: completion.notes,
    });
    return this.unwrap<ExecutionStep>(res);
  }

  static async reassignTask(
    taskId: string,
    toUserId: string,
    toUserName: string,
    reason: string
  ): Promise<void> {
    await APIClient.post(`/workflow-engine/tasks/${taskId}/reassign`, {
      toUserId,
      reason,
    });
  }
}

// ============================================================================
// Approval Chain Service — Reuses Definitions
// ============================================================================

export class ApprovalChainService {
  private static unwrap<T>(res: any): T {
    const a = res?.data ?? res;
    return (a?.data ?? a) as T;
  }

  static async getChains(): Promise<ApprovalChain[]> {
    const res = await APIClient.get<any>('/workflow-engine/definitions', {
      processType: 'APPROVAL_CHAIN',
    });
    const data = this.unwrap<ApprovalChain[] | { definitions: ApprovalChain[] }>(res);
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && 'definitions' in data)
      return (data as any).definitions || [];
    return [];
  }

  static async getChainById(id: string): Promise<ApprovalChain | null> {
    const res = await APIClient.get<any>(`/workflow-engine/definitions/${id}`);
    return this.unwrap<ApprovalChain | null>(res);
  }

  static async createChain(
    data: Partial<ApprovalChain> & {
      name?: string;
      chainName?: string;
      nodes?: any[];
      edges?: any[];
      isActive?: boolean;
    }
  ): Promise<ApprovalChain> {
    const res = await APIClient.post<any>('/workflow-engine/definitions', {
      processType: 'APPROVAL_CHAIN',
      name: data.name || data.chainName,
      description: data.description,
      trigger: 'EVENT',
      nodes: data.nodes || [],
      edges: data.edges || [],
    });
    return this.unwrap<ApprovalChain>(res);
  }

  static async updateChain(id: string, updates: Partial<ApprovalChain>): Promise<ApprovalChain> {
    const res = await APIClient.put<any>(`/workflow-engine/definitions/${id}`, {
      name: updates.name || updates.chainName,
      description: updates.description,
      nodes: updates.nodes || updates.levels,
      edges: updates.edges || [],
      isActive: updates.isActive,
    });
    return this.unwrap<ApprovalChain>(res);
  }

  static async deleteChain(id: string): Promise<void> {
    await APIClient.delete<any>(`/workflow-engine/definitions/${id}`);
  }
}

// ============================================================================
// Integration Service — Reuses Definitions
// ============================================================================

export class IntegrationService {
  private static unwrap<T>(res: any): T {
    const a = res?.data ?? res;
    return (a?.data ?? a) as T;
  }

  private static mapDefinition(d: any): Integration {
    let parsed: any = {};
    try {
      parsed = d.triggerEvent ? JSON.parse(d.triggerEvent) : {};
    } catch {}
    const connConfig = parsed.connectionConfig || parsed;
    return {
      id: d.id,
      integrationName: d.name || '',
      integrationType: ((d.trigger || 'REST_API') as string)
        .toLowerCase()
        .replace(/_/g, '_') as any,
      status: (d.status || 'DRAFT').toLowerCase() as any,
      description: d.description || '',
      connectionConfig:
        connConfig.baseUrl !== undefined || connConfig.timeout !== undefined ? connConfig : {},
      authentication: parsed.authentication,
      availableActions: Array.isArray(d.nodes) ? d.nodes : [],
      testConnection: false,
      lastTestedDate: undefined,
      lastTestedStatus: undefined,
      usedInWorkflows: [],
      createdBy: d.createdBy || '',
      createdDate: d.createdAt || '',
      lastModified: d.updatedAt || '',
    } as Integration;
  }

  static async getIntegrations(search?: string): Promise<Integration[]> {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    const res = await APIClient.get<any>('/workflow-engine/integrations', params);
    const raw = this.unwrap<any[]>(res) || [];
    return raw.map((d: any) => this.mapDefinition(d));
  }

  static async getIntegrationById(id: string): Promise<Integration | null> {
    const res = await APIClient.get<any>(`/workflow-engine/integrations/${id}`);
    const raw = this.unwrap<any>(res);
    return raw ? this.mapDefinition(raw) : null;
  }

  static async createIntegration(data: Partial<Integration>): Promise<Integration> {
    const res = await APIClient.post<any>('/workflow-engine/integrations', {
      name: data.integrationName,
      description: data.description,
      integrationType: data.integrationType || 'rest_api',
      connectionConfig: data.connectionConfig || {},
      authentication: data.authentication,
      availableActions: data.availableActions || [],
      status: data.status || 'DRAFT',
      isActive: false,
    });
    const raw = this.unwrap<any>(res);
    return this.mapDefinition(raw);
  }

  static async updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration> {
    const res = await APIClient.put<any>(`/workflow-engine/integrations/${id}`, {
      name: updates.integrationName,
      description: updates.description,
      connectionConfig: updates.connectionConfig,
      authentication: updates.authentication,
      availableActions: updates.availableActions,
      integrationType: updates.integrationType,
      status: updates.status,
      isActive: (updates as any).isActive,
    });
    const raw = this.unwrap<any>(res);
    return this.mapDefinition(raw);
  }

  static async deleteIntegration(id: string): Promise<void> {
    await APIClient.delete<any>(`/workflow-engine/integrations/${id}`);
  }

  static async testConnection(
    id: string
  ): Promise<{ status: string; message: string; latencyMs: number; statusCode: number }> {
    const res = await APIClient.post<any>(`/workflow-engine/integrations/${id}/test`, {});
    return this.unwrap(res);
  }

  static async toggleStatus(id: string): Promise<Integration> {
    const res = await APIClient.post<any>(`/workflow-engine/integrations/${id}/toggle`, {});
    return this.unwrap<Integration>(res);
  }

  static async syncIntegration(
    id: string,
    payload?: Record<string, any>
  ): Promise<{ status: string; message: string; recordsProcessed: number }> {
    const res = await APIClient.post<any>(
      `/workflow-engine/integrations/${id}/sync`,
      payload || {}
    );
    return this.unwrap(res);
  }
}

// ============================================================================
// Form Builder Service — Reuses Definitions
// ============================================================================

export class FormBuilderService {
  private static unwrap<T>(res: any): T {
    const a = res?.data ?? res;
    return (a?.data ?? a) as T;
  }

  static async getForms(): Promise<DynamicForm[]> {
    const res = await APIClient.get<any>('/workflow-engine/definitions', { processType: 'FORM' });
    const data = this.unwrap<DynamicForm[] | { definitions: DynamicForm[] }>(res);
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && 'definitions' in data)
      return (data as any).definitions || [];
    return [];
  }

  static async getFormById(id: string): Promise<DynamicForm | null> {
    const res = await APIClient.get<any>(`/workflow-engine/definitions/${id}`);
    return this.unwrap<DynamicForm | null>(res);
  }

  static async createForm(data: DynamicForm): Promise<DynamicForm> {
    const res = await APIClient.post<any>('/workflow-engine/definitions', {
      processType: 'FORM',
      name: data.formName,
      description: data.description,
      trigger: 'MANUAL',
      nodes: data.fields || [],
      edges: (data as any).edges || [],
      triggerEvent: (data as any).triggerEvent,
      status: (data as any).status || 'DRAFT',
    });
    return this.unwrap<DynamicForm>(res);
  }

  static async updateForm(id: string, updates: Partial<DynamicForm>): Promise<DynamicForm> {
    const res = await APIClient.put<any>(`/workflow-engine/definitions/${id}`, {
      name: updates.formName,
      description: updates.description,
      nodes: updates.fields,
      edges: (updates as any).edges,
      triggerEvent: (updates as any).triggerEvent,
      status: (updates as any).status,
    });
    return this.unwrap<DynamicForm>(res);
  }

  static async deleteForm(id: string): Promise<void> {
    await APIClient.delete<void>(`/workflow-engine/definitions/${id}`);
  }

  static async cloneForm(id: string, newName: string): Promise<DynamicForm> {
    const original = await this.getFormById(id);
    if (!original) throw new Error('Form not found');
    return this.createForm({
      ...original,
      formName: newName,
      fields: (original as any).nodes || (original as any).fields || [],
    } as DynamicForm);
  }
}

// ============================================================================
// Analytics Service
// ============================================================================

export class WorkflowAnalyticsService {
  static async getMetrics(timeRange?: string): Promise<WorkflowMetrics> {
    try {
      const params: Record<string, string> = {};
      if (timeRange) params.timeRange = timeRange;
      const res = await APIClient.get<any>('/workflow-engine/analytics', params);
      const a = res?.data ?? res;
      const d = a?.data ?? a;
      if (!d || typeof d !== 'object') throw new Error('No data');
      return {
        totalExecutions: d.totalExecutions || 0,
        successfulExecutions: d.successfulExecutions || 0,
        failedExecutions: d.failedExecutions || 0,
        cancelledExecutions: d.cancelledExecutions || 0,
        successRate: d.successRate || 0,
        averageExecutionTime: d.averageExecutionTime || 0,
        medianExecutionTime: d.medianExecutionTime || 0,
        minExecutionTime: d.minExecutionTime || 0,
        maxExecutionTime: d.maxExecutionTime || 0,
        runningExecutions: d.runningExecutions || 0,
        pendingExecutions: d.pendingExecutions || 0,
        pausedExecutions: d.pausedExecutions || 0,
        totalApprovals: d.totalApprovals || 0,
        approvalRate: d.approvalRate || 0,
        averageApprovalTime: d.averageApprovalTime || 0,
        escalationRate: d.escalationRate || 0,
        totalTasks: d.totalTasks || 0,
        completedTasks: d.completedTasks || 0,
        overdueTasks: d.overdueTasks || 0,
        taskCompletionRate: d.taskCompletionRate || 0,
        averageTaskCompletionTime: d.averageTaskCompletionTime || 0,
        topWorkflowsByUsage: d.topWorkflowsByUsage || [],
        topWorkflowsByDuration: d.topWorkflowsByDuration || [],
        topWorkflowsByFailure: d.topWorkflowsByFailure || [],
        executionTrends: d.executionTrends || [],
        performanceTrends: d.performanceTrends || [],
        lastUpdated: d.lastUpdated || new Date().toISOString(),
      } as WorkflowMetrics;
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to load analytics data');
    }
  }
}

// ============================================================================
// Settings Service
// ============================================================================

export class WorkflowSettingsService {
  private static unwrap<T>(res: any): T {
    const a = res?.data ?? res;
    return (a?.data ?? a) as T;
  }

  static async getSettings(): Promise<WorkflowSettings> {
    try {
      const res = await APIClient.get<any>('/workflow-engine/settings');
      return this.unwrap<WorkflowSettings>(res);
    } catch {
      throw new Error('Failed to load workflow settings');
    }
  }

  static async updateSettings(updates: Partial<WorkflowSettings>): Promise<WorkflowSettings> {
    try {
      const res = await APIClient.put<any>('/workflow-engine/settings', updates);
      return this.unwrap<WorkflowSettings>(res);
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to update settings');
    }
  }
}
