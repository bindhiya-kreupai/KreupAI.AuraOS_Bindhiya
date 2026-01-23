'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  submitFeedback,
  getReceivedFeedback,
  getGivenFeedback,
  getAllFeedback,
  submitRecognition,
} from '@/services/feedbackService';
import type {
  FeedbackSubmission,
  Feedback,
  FilterParams,
  PaginatedResponse,
} from '@/services/feedbackService';

// ============================================================================
// QUERY KEYS
// ============================================================================

const feedbackKeys = {
  all: ['feedback'] as const,
  lists: () => [...feedbackKeys.all, 'list'] as const,
  list: (params?: FilterParams) => [...feedbackKeys.lists(), params] as const,
  received: (params?: FilterParams) => [...feedbackKeys.all, 'received', params] as const,
  given: (params?: FilterParams) => [...feedbackKeys.all, 'given', params] as const,
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch paginated feedback list with filtering (admin/manager)
 */
export function useFeedbackList(params?: FilterParams) {
  return useQuery<PaginatedResponse<Feedback>, Error>({
    queryKey: feedbackKeys.list(params),
    queryFn: () => getAllFeedback(params),
  });
}

/**
 * Hook to fetch feedback received by the current user
 */
export function useReceivedFeedback(params?: FilterParams) {
  return useQuery<Feedback[], Error>({
    queryKey: feedbackKeys.received(params),
    queryFn: () => getReceivedFeedback(params),
  });
}

/**
 * Hook to fetch feedback given by the current user
 */
export function useGivenFeedback(params?: FilterParams) {
  return useQuery<Feedback[], Error>({
    queryKey: feedbackKeys.given(params),
    queryFn: () => getGivenFeedback(params),
  });
}

/**
 * Hook to submit new feedback with optimistic cache invalidation
 */
export function useSubmitFeedback() {
  const queryClient = useQueryClient();

  return useMutation<Feedback, Error, FeedbackSubmission>({
    mutationFn: submitFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
    },
  });
}

/**
 * Hook to submit a recognition for a colleague
 */
export function useRecognitions() {
  const queryClient = useQueryClient();

  return useMutation<Feedback, Error, { recipientId: string; message: string; values?: string[]; badgeId?: string }>({
    mutationFn: submitRecognition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
    },
  });
}
