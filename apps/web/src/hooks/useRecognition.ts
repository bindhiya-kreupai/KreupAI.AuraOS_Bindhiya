'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  giveRecognition,
  getRecognitionFeed,
  getLeaderboard,
  getMyRecognitions,
  getBadges,
} from '@/services/recognitionService';
import type {
  RecognitionSubmission,
  Recognition,
  LeaderboardEntry,
  LeaderboardPeriod,
  Badge,
  PaginatedResponse,
} from '@/services/recognitionService';

// ============================================================================
// QUERY KEYS
// ============================================================================

const recognitionKeys = {
  all: ['recognition'] as const,
  feed: (params?: { page?: number; limit?: number }) =>
    [...recognitionKeys.all, 'feed', params] as const,
  leaderboard: (period?: LeaderboardPeriod) =>
    [...recognitionKeys.all, 'leaderboard', period] as const,
  mine: () => [...recognitionKeys.all, 'mine'] as const,
  badges: () => [...recognitionKeys.all, 'badges'] as const,
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch the recognition feed with pagination
 */
export function useRecognitionFeed(params?: { page?: number; limit?: number }) {
  return useQuery<PaginatedResponse<Recognition>, Error>({
    queryKey: recognitionKeys.feed(params),
    queryFn: () => getRecognitionFeed(params),
  });
}

/**
 * Hook to give recognition to an employee with cache invalidation
 */
export function useGiveRecognition() {
  const queryClient = useQueryClient();

  return useMutation<Recognition, Error, RecognitionSubmission>({
    mutationFn: giveRecognition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recognitionKeys.all });
    },
  });
}

/**
 * Hook to fetch the leaderboard for a given time period
 */
export function useLeaderboard(period?: LeaderboardPeriod) {
  return useQuery<LeaderboardEntry[], Error>({
    queryKey: recognitionKeys.leaderboard(period),
    queryFn: () => getLeaderboard(period),
  });
}

/**
 * Hook to fetch recognitions received by the current user
 */
export function useMyRecognitions() {
  return useQuery<Recognition[], Error>({
    queryKey: recognitionKeys.mine(),
    queryFn: getMyRecognitions,
  });
}

/**
 * Hook to fetch all available badges
 */
export function useBadges() {
  return useQuery<Badge[], Error>({
    queryKey: recognitionKeys.badges(),
    queryFn: getBadges,
  });
}
