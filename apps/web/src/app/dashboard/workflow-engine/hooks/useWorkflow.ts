/**
 * Workflow Engine Module - Custom Hook
 * Centralized state management and business logic
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  Workflow,
  WorkflowExecution,
  ApprovalChain,
  Integration,
  DynamicForm,
  WorkflowMetrics,
  WorkflowSettings,
  ApprovalDecision,
  TaskCompletion,
} from '../types';
import {
  WorkflowService,
  WorkflowExecutionService,
  ApprovalService,
  TaskService,
  ApprovalChainService,
  IntegrationService,
  FormBuilderService,
  WorkflowAnalyticsService,
  WorkflowSettingsService,
} from '../services';

export interface UseWorkflowReturn {
  // Workflows
  workflows: Workflow[];
  createWorkflow: (data: Workflow) => Promise<Workflow>;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => Promise<Workflow>;
  deleteWorkflow: (id: string) => Promise<void>;
  publishWorkflow: (id: string, version: string) => Promise<Workflow>;
  cloneWorkflow: (id: string, newName: string) => Promise<Workflow>;
  getWorkflowVersions: (workflowId: string) => Promise<Workflow[]>;

  // Executions
  executions: WorkflowExecution[];
  startExecution: (
    workflowId: string,
    initiatorId: string,
    initiatorName: string,
    input: Record<string, any>
  ) => Promise<WorkflowExecution>;
  pauseExecution: (executionId: string) => Promise<void>;
  resumeExecution: (executionId: string) => Promise<void>;
  cancelExecution: (executionId: string, reason: string) => Promise<void>;
  getExecutionsByWorkflow: (workflowId: string) => Promise<WorkflowExecution[]>;

  // Approvals
  submitApproval: (executionId: string, stepId: string, decision: ApprovalDecision) => Promise<void>;
  delegateApproval: (
    executionId: string,
    stepId: string,
    fromUserId: string,
    toUserId: string,
    toUserName: string,
    reason: string
  ) => Promise<void>;

  // Tasks
  completeTask: (executionId: string, stepId: string, completion: TaskCompletion) => Promise<void>;
  reassignTask: (
    executionId: string,
    stepId: string,
    toUserId: string,
    toUserName: string,
    reason: string
  ) => Promise<void>;

  // Approval Chains
  approvalChains: ApprovalChain[];
  createApprovalChain: (data: ApprovalChain) => Promise<ApprovalChain>;
  updateApprovalChain: (id: string, updates: Partial<ApprovalChain>) => Promise<ApprovalChain>;
  deleteApprovalChain: (id: string) => Promise<void>;

  // Integrations
  integrations: Integration[];
  createIntegration: (data: Integration) => Promise<Integration>;
  updateIntegration: (id: string, updates: Partial<Integration>) => Promise<Integration>;
  deleteIntegration: (id: string) => Promise<void>;
  testConnection: (id: string) => Promise<{ success: boolean; message: string }>;

  // Forms
  forms: DynamicForm[];
  createForm: (data: DynamicForm) => Promise<DynamicForm>;
  updateForm: (id: string, updates: Partial<DynamicForm>) => Promise<DynamicForm>;
  deleteForm: (id: string) => Promise<void>;
  cloneForm: (id: string, newName: string) => Promise<DynamicForm>;

  // Analytics & Settings
  metrics: WorkflowMetrics | null;
  settings: WorkflowSettings | null;
  updateSettings: (updates: Partial<WorkflowSettings>) => Promise<WorkflowSettings>;

  // Global State
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function useWorkflow(): UseWorkflowReturn {
  // State
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [approvalChains, setApprovalChains] = useState<ApprovalChain[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [forms, setForms] = useState<DynamicForm[]>([]);
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
  const [settings, setSettings] = useState<WorkflowSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Data
  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        workflowsData,
        executionsData,
        chainsData,
        integrationsData,
        formsData,
        metricsData,
        settingsData,
      ] = await Promise.all([
        WorkflowService.getWorkflows(),
        WorkflowExecutionService.getExecutions(),
        ApprovalChainService.getChains(),
        IntegrationService.getIntegrations(),
        FormBuilderService.getForms(),
        WorkflowAnalyticsService.getMetrics(),
        WorkflowSettingsService.getSettings(),
      ]);

      setWorkflows(workflowsData);
      setExecutions(executionsData);
      setApprovalChains(chainsData);
      setIntegrations(integrationsData);
      setForms(formsData);
      setMetrics(metricsData);
      setSettings(settingsData);
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to load workflow data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // ============================================================================
  // Workflow Methods
  // ============================================================================

  const createWorkflow = async (data: Workflow): Promise<Workflow> => {
    const workflow = await WorkflowService.createWorkflow(data);
    setWorkflows([...workflows, workflow]);
    return workflow;
  };

  const updateWorkflow = async (id: string, updates: Partial<Workflow>): Promise<Workflow> => {
    const updated = await WorkflowService.updateWorkflow(id, updates);
    setWorkflows(workflows.map((w) => (w.id === id ? updated : w)));
    return updated;
  };

  const deleteWorkflow = async (id: string): Promise<void> => {
    await WorkflowService.deleteWorkflow(id);
    setWorkflows(workflows.filter((w) => w.id !== id));
  };

  const publishWorkflow = async (id: string, version: string): Promise<Workflow> => {
    const published = await WorkflowService.publishWorkflow(id, version);
    setWorkflows(workflows.map((w) => (w.id === id ? published : w)));
    return published;
  };

  const cloneWorkflow = async (id: string, newName: string): Promise<Workflow> => {
    const clone = await WorkflowService.cloneWorkflow(id, newName);
    setWorkflows([...workflows, clone]);
    return clone;
  };

  const getWorkflowVersions = async (workflowId: string): Promise<Workflow[]> => {
    return WorkflowService.getWorkflowVersions(workflowId);
  };

  // ============================================================================
  // Execution Methods
  // ============================================================================

  const startExecution = async (
    workflowId: string,
    initiatorId: string,
    initiatorName: string,
    input: Record<string, any>
  ): Promise<WorkflowExecution> => {
    const execution = await WorkflowExecutionService.startExecution(workflowId, initiatorId, initiatorName, input);
    setExecutions([...executions, execution]);

    // Update workflow stats
    const workflow = workflows.find((w) => w.id === workflowId);
    if (workflow) {
      setWorkflows(
        workflows.map((w) =>
          w.id === workflowId
            ? {
                ...w,
                totalExecutions: w.totalExecutions + 1,
                lastExecutionDate: new Date().toISOString(),
              }
            : w
        )
      );
    }

    return execution;
  };

  const pauseExecution = async (executionId: string): Promise<void> => {
    await WorkflowExecutionService.pauseExecution(executionId);
    setExecutions(executions.map((e) => (e.id === executionId ? { ...e, status: 'paused' } : e)));
  };

  const resumeExecution = async (executionId: string): Promise<void> => {
    await WorkflowExecutionService.resumeExecution(executionId);
    setExecutions(executions.map((e) => (e.id === executionId ? { ...e, status: 'running' } : e)));
  };

  const cancelExecution = async (executionId: string, reason: string): Promise<void> => {
    await WorkflowExecutionService.cancelExecution(executionId, reason);
    const updatedExecutions = await WorkflowExecutionService.getExecutions();
    setExecutions(updatedExecutions);
  };

  const getExecutionsByWorkflow = async (workflowId: string): Promise<WorkflowExecution[]> => {
    return WorkflowExecutionService.getExecutionsByWorkflow(workflowId);
  };

  // ============================================================================
  // Approval Methods
  // ============================================================================

  const submitApproval = async (
    executionId: string,
    stepId: string,
    decision: ApprovalDecision
  ): Promise<void> => {
    await ApprovalService.submitApproval(executionId, stepId, decision);
    const updatedExecutions = await WorkflowExecutionService.getExecutions();
    setExecutions(updatedExecutions);
  };

  const delegateApproval = async (
    executionId: string,
    stepId: string,
    fromUserId: string,
    toUserId: string,
    toUserName: string,
    reason: string
  ): Promise<void> => {
    await ApprovalService.delegateApproval(executionId, stepId, fromUserId, toUserId, toUserName, reason);
    const updatedExecutions = await WorkflowExecutionService.getExecutions();
    setExecutions(updatedExecutions);
  };

  // ============================================================================
  // Task Methods
  // ============================================================================

  const completeTask = async (
    executionId: string,
    stepId: string,
    completion: TaskCompletion
  ): Promise<void> => {
    await TaskService.completeTask(executionId, stepId, completion);
    const updatedExecutions = await WorkflowExecutionService.getExecutions();
    setExecutions(updatedExecutions);
  };

  const reassignTask = async (
    executionId: string,
    stepId: string,
    toUserId: string,
    toUserName: string,
    reason: string
  ): Promise<void> => {
    await TaskService.reassignTask(executionId, stepId, toUserId, toUserName, reason);
    const updatedExecutions = await WorkflowExecutionService.getExecutions();
    setExecutions(updatedExecutions);
  };

  // ============================================================================
  // Approval Chain Methods
  // ============================================================================

  const createApprovalChain = async (data: ApprovalChain): Promise<ApprovalChain> => {
    const chain = await ApprovalChainService.createChain(data);
    setApprovalChains([...approvalChains, chain]);
    return chain;
  };

  const updateApprovalChain = async (id: string, updates: Partial<ApprovalChain>): Promise<ApprovalChain> => {
    const updated = await ApprovalChainService.updateChain(id, updates);
    setApprovalChains(approvalChains.map((c) => (c.id === id ? updated : c)));
    return updated;
  };

  const deleteApprovalChain = async (id: string): Promise<void> => {
    await ApprovalChainService.deleteChain(id);
    setApprovalChains(approvalChains.filter((c) => c.id !== id));
  };

  // ============================================================================
  // Integration Methods
  // ============================================================================

  const createIntegration = async (data: Integration): Promise<Integration> => {
    const integration = await IntegrationService.createIntegration(data);
    setIntegrations([...integrations, integration]);
    return integration;
  };

  const updateIntegration = async (id: string, updates: Partial<Integration>): Promise<Integration> => {
    const updated = await IntegrationService.updateIntegration(id, updates);
    setIntegrations(integrations.map((i) => (i.id === id ? updated : i)));
    return updated;
  };

  const deleteIntegration = async (id: string): Promise<void> => {
    await IntegrationService.deleteIntegration(id);
    setIntegrations(integrations.filter((i) => i.id !== id));
  };

  const testConnection = async (id: string): Promise<{ success: boolean; message: string }> => {
    const result = await IntegrationService.testConnection(id);
    const updatedIntegrations = await IntegrationService.getIntegrations();
    setIntegrations(updatedIntegrations);
    return result;
  };

  // ============================================================================
  // Form Methods
  // ============================================================================

  const createForm = async (data: DynamicForm): Promise<DynamicForm> => {
    const form = await FormBuilderService.createForm(data);
    setForms([...forms, form]);
    return form;
  };

  const updateForm = async (id: string, updates: Partial<DynamicForm>): Promise<DynamicForm> => {
    const updated = await FormBuilderService.updateForm(id, updates);
    setForms(forms.map((f) => (f.id === id ? updated : f)));
    return updated;
  };

  const deleteForm = async (id: string): Promise<void> => {
    await FormBuilderService.deleteForm(id);
    setForms(forms.filter((f) => f.id !== id));
  };

  const cloneForm = async (id: string, newName: string): Promise<DynamicForm> => {
    const clone = await FormBuilderService.cloneForm(id, newName);
    setForms([...forms, clone]);
    return clone;
  };

  // ============================================================================
  // Settings Methods
  // ============================================================================

  const updateSettings = async (updates: Partial<WorkflowSettings>): Promise<WorkflowSettings> => {
    const updated = await WorkflowSettingsService.updateSettings(updates);
    setSettings(updated);
    return updated;
  };

  return {
    // Workflows
    workflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    publishWorkflow,
    cloneWorkflow,
    getWorkflowVersions,

    // Executions
    executions,
    startExecution,
    pauseExecution,
    resumeExecution,
    cancelExecution,
    getExecutionsByWorkflow,

    // Approvals
    submitApproval,
    delegateApproval,

    // Tasks
    completeTask,
    reassignTask,

    // Approval Chains
    approvalChains,
    createApprovalChain,
    updateApprovalChain,
    deleteApprovalChain,

    // Integrations
    integrations,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testConnection,

    // Forms
    forms,
    createForm,
    updateForm,
    deleteForm,
    cloneForm,

    // Global
    metrics,
    settings,
    updateSettings,
    loading,
    error,
    refreshData: initializeData,
  };
}
