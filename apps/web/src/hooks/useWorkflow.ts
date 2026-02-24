'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPendingApprovals,
  getApprovals,
  approveItem,
  rejectItem,
  bulkApprove,
  bulkReject,
  getApprovalHistory,
  getWorkflowDefinitions,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
} from '@/services/workflowService';
import type {
  ApprovalItem,
  BulkResult,
  FilterParams,
  WorkflowDefinition,
  PaginatedResponse,
} from '@/services/workflowService';

// ============================================================================
// QUERY KEYS
// ============================================================================

const approvalKeys = {
  all: ['approvals'] as const,
  list: (params?: FilterParams) => [...approvalKeys.all, 'list', params] as const,
  pending: (params?: { type?: string; page?: number }) => [...approvalKeys.all, 'pending', params] as const,
  history: (params?: FilterParams) => [...approvalKeys.all, 'history', params] as const,
};

const workflowKeys = {
  all: ['workflows'] as const,
  definitions: () => [...workflowKeys.all, 'definitions'] as const,
};

// ============================================================================
// APPROVAL HOOKS
// ============================================================================

/**
 * Hook to fetch all approval items with optional filtering by type and status
 */
export function useApprovals(params?: FilterParams) {
  return useQuery<PaginatedResponse<ApprovalItem>, Error>({
    queryKey: approvalKeys.list(params),
    queryFn: () => getApprovals(params),
  });
}

/**
 * Hook to fetch pending approval items with optional filters
 */
export function usePendingApprovals(params?: { type?: string; page?: number }) {
  return useQuery<PaginatedResponse<ApprovalItem>, Error>({
    queryKey: approvalKeys.pending(params),
    queryFn: () => getPendingApprovals(params),
  });
}

/**
 * Hook to approve a single item
 */
export function useApproveItem() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; comment?: string }>({
    mutationFn: ({ id, comment }) => approveItem(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.all });
    },
  });
}

/**
 * Hook to reject a single item
 */
export function useRejectItem() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) => rejectItem(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.all });
    },
  });
}

/**
 * Hook to bulk approve multiple items
 */
export function useBulkApprove() {
  const queryClient = useQueryClient();

  return useMutation<BulkResult, Error, { ids: string[]; comment?: string }>({
    mutationFn: ({ ids, comment }) => bulkApprove(ids, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.all });
    },
  });
}

/**
 * Hook to bulk reject multiple items
 */
export function useBulkReject() {
  const queryClient = useQueryClient();

  return useMutation<BulkResult, Error, { ids: string[]; reason: string }>({
    mutationFn: ({ ids, reason }) => bulkReject(ids, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.all });
    },
  });
}

/**
 * Hook to fetch approval history with pagination and filtering
 */
export function useApprovalHistory(params?: FilterParams) {
  return useQuery<PaginatedResponse<ApprovalItem>, Error>({
    queryKey: approvalKeys.history(params),
    queryFn: () => getApprovalHistory(params),
  });
}

// ============================================================================
// WORKFLOW HOOKS
// ============================================================================

/**
 * Hook to fetch all workflow definitions
 */
export function useWorkflowDefinitions() {
  return useQuery<WorkflowDefinition[], Error>({
    queryKey: workflowKeys.definitions(),
    queryFn: getWorkflowDefinitions,
  });
}

/**
 * Hook to create a new workflow definition
 */
export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation<WorkflowDefinition, Error, WorkflowDefinition>({
    mutationFn: createWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.definitions() });
    },
  });
}

/**
 * Hook to update an existing workflow definition
 */
export function useUpdateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation<WorkflowDefinition, Error, { id: string; data: Partial<WorkflowDefinition> }>({
    mutationFn: ({ id, data }) => updateWorkflow(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.definitions() });
    },
  });
}

/**
 * Hook to delete a workflow definition
 */
export function useDeleteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.definitions() });
    },
  });
}
