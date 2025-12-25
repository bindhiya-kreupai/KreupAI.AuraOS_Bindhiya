/**
 * Workflow Engine Module - Services
 * API-integrated service layer using APIClient
 */

import { APIClient } from '@/lib/api-client';
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

// ============================================================================
// Workflow Service
// ============================================================================

export class WorkflowService {
  static async getWorkflows(): Promise<Workflow[]> {
    return APIClient.get<Workflow[]>('/workflow-engine/workflows');
  }

  static async getWorkflowById(id: string): Promise<Workflow | null> {
    return APIClient.get<Workflow>(`/workflow-engine/workflows/${id}`);
  }

  static async createWorkflow(data: Workflow): Promise<Workflow> {
    return APIClient.post<Workflow>('/workflow-engine/workflows', data);
  }

  static async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
    return APIClient.put<Workflow>(`/workflow-engine/workflows/${id}`, updates);
  }

  static async deleteWorkflow(id: string): Promise<void> {
    return APIClient.delete<void>(`/workflow-engine/workflows/${id}`);
  }

  static async publishWorkflow(id: string, version: string): Promise<Workflow> {
    return APIClient.post<Workflow>(`/workflow-engine/workflows/${id}/publish`, { version });
  }

  static async cloneWorkflow(id: string, newName: string): Promise<Workflow> {
    return APIClient.post<Workflow>(`/workflow-engine/workflows/${id}/clone`, { newName });
  }

  static async getWorkflowVersions(workflowId: string): Promise<Workflow[]> {
    return APIClient.get<Workflow[]>(`/workflow-engine/workflows/${workflowId}/versions`);
  }
}

// ============================================================================
// Workflow Execution Service
// ============================================================================

export class WorkflowExecutionService {
  static async getExecutions(): Promise<WorkflowExecution[]> {
    return APIClient.get<WorkflowExecution[]>('/workflow-engine/executions');
  }

  static async getExecutionById(id: string): Promise<WorkflowExecution | null> {
    return APIClient.get<WorkflowExecution>(`/workflow-engine/executions/${id}`);
  }

  static async getExecutionsByWorkflow(workflowId: string): Promise<WorkflowExecution[]> {
    return APIClient.get<WorkflowExecution[]>('/workflow-engine/executions', { workflowId });
  }

  static async startExecution(
    workflowId: string,
    initiatorId: string,
    initiatorName: string,
    input: Record<string, any>
  ): Promise<WorkflowExecution> {
    return APIClient.post<WorkflowExecution>('/workflow-engine/executions', {
      workflowId,
      initiatorId,
      initiatorName,
      input,
    });
  }

  static async updateExecution(id: string, updates: Partial<WorkflowExecution>): Promise<WorkflowExecution> {
    return APIClient.put<WorkflowExecution>(`/workflow-engine/executions/${id}`, updates);
  }

  static async addExecutionStep(executionId: string, step: ExecutionStep): Promise<void> {
    return APIClient.post<void>(`/workflow-engine/executions/${executionId}/steps`, step);
  }

  static async completeExecution(
    executionId: string,
    success: boolean,
    output?: Record<string, any>,
    error?: any
  ): Promise<void> {
    return APIClient.post<void>(`/workflow-engine/executions/${executionId}/complete`, {
      success,
      output,
      error,
    });
  }

  static async pauseExecution(executionId: string): Promise<void> {
    return APIClient.post<void>(`/workflow-engine/executions/${executionId}/pause`, {});
  }

  static async resumeExecution(executionId: string): Promise<void> {
    return APIClient.post<void>(`/workflow-engine/executions/${executionId}/resume`, {});
  }

  static async cancelExecution(executionId: string, reason: string): Promise<void> {
    return APIClient.post<void>(`/workflow-engine/executions/${executionId}/cancel`, { reason });
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
    return APIClient.post<ExecutionStep>(`/workflow-engine/approvals/${executionId}/${stepId}`, decision);
  }

  static async delegateApproval(
    executionId: string,
    stepId: string,
    fromUserId: string,
    toUserId: string,
    toUserName: string,
    reason: string
  ): Promise<void> {
    return APIClient.post<void>(`/workflow-engine/approvals/${executionId}/${stepId}/delegate`, {
      fromUserId,
      toUserId,
      toUserName,
      reason,
    });
  }
}

// ============================================================================
// Task Service
// ============================================================================

export class TaskService {
  static async completeTask(executionId: string, stepId: string, completion: TaskCompletion): Promise<ExecutionStep> {
    return APIClient.post<ExecutionStep>(`/workflow-engine/tasks/${executionId}/${stepId}/complete`, completion);
  }

  static async reassignTask(
    executionId: string,
    stepId: string,
    toUserId: string,
    toUserName: string,
    reason: string
  ): Promise<void> {
    return APIClient.post<void>(`/workflow-engine/tasks/${executionId}/${stepId}/reassign`, {
      toUserId,
      toUserName,
      reason,
    });
  }
}

// ============================================================================
// Approval Chain Service
// ============================================================================

export class ApprovalChainService {
  static async getChains(): Promise<ApprovalChain[]> {
    return APIClient.get<ApprovalChain[]>('/workflow-engine/approval-chains');
  }

  static async getChainById(id: string): Promise<ApprovalChain | null> {
    return APIClient.get<ApprovalChain>(`/workflow-engine/approval-chains/${id}`);
  }

  static async createChain(data: ApprovalChain): Promise<ApprovalChain> {
    return APIClient.post<ApprovalChain>('/workflow-engine/approval-chains', data);
  }

  static async updateChain(id: string, updates: Partial<ApprovalChain>): Promise<ApprovalChain> {
    return APIClient.put<ApprovalChain>(`/workflow-engine/approval-chains/${id}`, updates);
  }

  static async deleteChain(id: string): Promise<void> {
    return APIClient.delete<void>(`/workflow-engine/approval-chains/${id}`);
  }
}

// ============================================================================
// Integration Service
// ============================================================================

export class IntegrationService {
  static async getIntegrations(): Promise<Integration[]> {
    return APIClient.get<Integration[]>('/workflow-engine/integrations');
  }

  static async getIntegrationById(id: string): Promise<Integration | null> {
    return APIClient.get<Integration>(`/workflow-engine/integrations/${id}`);
  }

  static async createIntegration(data: Integration): Promise<Integration> {
    return APIClient.post<Integration>('/workflow-engine/integrations', data);
  }

  static async updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration> {
    return APIClient.put<Integration>(`/workflow-engine/integrations/${id}`, updates);
  }

  static async deleteIntegration(id: string): Promise<void> {
    return APIClient.delete<void>(`/workflow-engine/integrations/${id}`);
  }

  static async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    return APIClient.post<{ success: boolean; message: string }>(
      `/workflow-engine/integrations/${id}/test`,
      {}
    );
  }
}

// ============================================================================
// Form Builder Service
// ============================================================================

export class FormBuilderService {
  static async getForms(): Promise<DynamicForm[]> {
    return APIClient.get<DynamicForm[]>('/workflow-engine/forms');
  }

  static async getFormById(id: string): Promise<DynamicForm | null> {
    return APIClient.get<DynamicForm>(`/workflow-engine/forms/${id}`);
  }

  static async createForm(data: DynamicForm): Promise<DynamicForm> {
    return APIClient.post<DynamicForm>('/workflow-engine/forms', data);
  }

  static async updateForm(id: string, updates: Partial<DynamicForm>): Promise<DynamicForm> {
    return APIClient.put<DynamicForm>(`/workflow-engine/forms/${id}`, updates);
  }

  static async deleteForm(id: string): Promise<void> {
    return APIClient.delete<void>(`/workflow-engine/forms/${id}`);
  }

  static async cloneForm(id: string, newName: string): Promise<DynamicForm> {
    return APIClient.post<DynamicForm>(`/workflow-engine/forms/${id}/clone`, { newName });
  }
}

// ============================================================================
// Analytics Service
// ============================================================================

export class WorkflowAnalyticsService {
  static async getMetrics(): Promise<WorkflowMetrics> {
    return APIClient.get<WorkflowMetrics>('/workflow-engine/analytics');
  }
}

// ============================================================================
// Settings Service
// ============================================================================

export class WorkflowSettingsService {
  static async getSettings(): Promise<WorkflowSettings> {
    return APIClient.get<WorkflowSettings>('/workflow-engine/settings');
  }

  static async updateSettings(updates: Partial<WorkflowSettings>): Promise<WorkflowSettings> {
    return APIClient.put<WorkflowSettings>('/workflow-engine/settings', updates);
  }
}
