'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPendingApprovals,
  getApprovalHistory,
  approveItem,
  rejectItem,
  bulkApprove,
  bulkReject,
} from '@/services/workflowService';
import type {
  ApprovalItem,
  ApprovalType,
  ApprovalStatus,
  BulkResult,
} from '@/services/workflowService';

// ============================================================================
// QUERY KEYS
// ============================================================================

const approvalKeys = {
  all: ['approvals'] as const,
  pending: (filters?: ApprovalFilters) => [...approvalKeys.all, 'pending', filters] as const,
  history: (filters?: ApprovalFilters) => [...approvalKeys.all, 'history', filters] as const,
  count: () => [...approvalKeys.all, 'count'] as const,
};

// ============================================================================
// TYPES
// ============================================================================

export interface ApprovalFilters {
  type?: ApprovalType;
  status?: ApprovalStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedApprovals {
  items: ApprovalItem[];
  total: number;
  page: number;
  totalPages: number;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch pending approvals for the current user
 */
export function usePendingApprovals(filters?: ApprovalFilters) {
  return useQuery<PaginatedApprovals, Error>({
    queryKey: approvalKeys.pending(filters),
    queryFn: () => getPendingApprovals(filters),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Hook to fetch approval history
 */
export function useApprovalHistory(filters?: ApprovalFilters) {
  return useQuery<PaginatedApprovals, Error>({
    queryKey: approvalKeys.history(filters),
    queryFn: () => getApprovalHistory(filters),
  });
}

/**
 * Hook to fetch the pending approval count (for badges/notifications)
 */
export function usePendingApprovalCount() {
  return useQuery<number, Error>({
    queryKey: approvalKeys.count(),
    queryFn: async () => {
      const result = await getPendingApprovals({ limit: 0 });
      return result.total;
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });
}

/**
 * Hook to approve a single item
 */
export function useApproveMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApprovalItem, Error, { id: string; comments?: string }>({
    mutationFn: ({ id, comments }) => approveItem(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.all });
    },
  });
}

/**
 * Hook to reject a single item
 */
export function useRejectMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApprovalItem, Error, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) => rejectItem(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.all });
    },
  });
}

/**
 * Hook for bulk approval operations
 */
export function useBulkApproveMutation() {
  const queryClient = useQueryClient();

  return useMutation<BulkResult, Error, { ids: string[]; comments?: string }>({
    mutationFn: ({ ids, comments }) => bulkApprove(ids, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.all });
    },
  });
}

/**
 * Hook for bulk rejection operations
 */
export function useBulkRejectMutation() {
  const queryClient = useQueryClient();

  return useMutation<BulkResult, Error, { ids: string[]; reason: string }>({
    mutationFn: ({ ids, reason }) => bulkReject(ids, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.all });
    },
  });
}

// Re-export types for convenience
export type { ApprovalItem, ApprovalType, ApprovalStatus, BulkResult };
