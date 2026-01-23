'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLearningPaths,
  getPathDetails,
  enrollInPath,
  trackProgress,
  getProgress,
  getRecommendations,
  getAssessments,
  submitAssessment,
  generateCertificate,
  getMentorshipMatches,
  requestMentor,
} from '@/services/learningService';
import type {
  LearningPathParams,
  LearningPath,
  Enrollment,
  ProgressUpdate,
  LearningProgress,
  LearningRecommendation,
  Assessment,
  AssessmentAnswer,
  AssessmentResult,
  Certificate,
  MentorMatch,
  MentorshipRequest,
  PaginatedResponse,
} from '@/services/learningService';

// ============================================================================
// QUERY KEYS
// ============================================================================

const learningKeys = {
  all: ['learning'] as const,
  paths: () => [...learningKeys.all, 'paths'] as const,
  pathList: (params?: LearningPathParams) => [...learningKeys.paths(), params] as const,
  pathDetail: (pathId: string) => [...learningKeys.paths(), pathId] as const,
  progress: (pathId?: string) => [...learningKeys.all, 'progress', pathId] as const,
  recommendations: () => [...learningKeys.all, 'recommendations'] as const,
  assessments: (pathId?: string) => [...learningKeys.all, 'assessments', pathId] as const,
  mentors: () => [...learningKeys.all, 'mentors'] as const,
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch paginated learning paths with optional category filter
 */
export function useLearningPaths(params?: LearningPathParams) {
  return useQuery<PaginatedResponse<LearningPath>, Error>({
    queryKey: learningKeys.pathList(params),
    queryFn: () => getLearningPaths(params),
  });
}

/**
 * Hook to fetch details of a specific learning path
 */
export function usePathDetails(pathId: string) {
  return useQuery<LearningPath, Error>({
    queryKey: learningKeys.pathDetail(pathId),
    queryFn: () => getPathDetails(pathId),
    enabled: !!pathId,
  });
}

/**
 * Hook to enroll the current user in a learning path
 */
export function useEnrollInPath() {
  const queryClient = useQueryClient();

  return useMutation<Enrollment, Error, string>({
    mutationFn: enrollInPath,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.paths() });
      queryClient.invalidateQueries({ queryKey: learningKeys.progress() });
    },
  });
}

/**
 * Hook to track progress on a module within a learning path
 */
export function useTrackProgress() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ProgressUpdate>({
    mutationFn: trackProgress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.progress() });
      queryClient.invalidateQueries({ queryKey: learningKeys.paths() });
    },
  });
}

/**
 * Hook to fetch learning progress for the current user
 */
export function useLearningProgress(pathId?: string) {
  return useQuery<LearningProgress[], Error>({
    queryKey: learningKeys.progress(pathId),
    queryFn: () => getProgress(pathId),
  });
}

/**
 * Hook to fetch personalized learning recommendations
 */
export function useLearningRecommendations() {
  return useQuery<LearningRecommendation[], Error>({
    queryKey: learningKeys.recommendations(),
    queryFn: getRecommendations,
  });
}

/**
 * Hook to fetch assessments, optionally filtered by path
 */
export function useAssessments(pathId?: string) {
  return useQuery<Assessment[], Error>({
    queryKey: learningKeys.assessments(pathId),
    queryFn: () => getAssessments(pathId),
  });
}

/**
 * Hook to submit answers for an assessment
 */
export function useSubmitAssessment() {
  const queryClient = useQueryClient();

  return useMutation<AssessmentResult, Error, { assessmentId: string; answers: AssessmentAnswer[] }>({
    mutationFn: ({ assessmentId, answers }) => submitAssessment(assessmentId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.assessments() });
      queryClient.invalidateQueries({ queryKey: learningKeys.progress() });
    },
  });
}

/**
 * Hook to fetch mentorship matches for the current user
 */
export function useMentorMatches() {
  return useQuery<MentorMatch[], Error>({
    queryKey: learningKeys.mentors(),
    queryFn: getMentorshipMatches,
  });
}

/**
 * Hook to request a mentor with a personalized message
 */
export function useRequestMentor() {
  const queryClient = useQueryClient();

  return useMutation<MentorshipRequest, Error, { mentorId: string; message: string }>({
    mutationFn: ({ mentorId, message }) => requestMentor(mentorId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.mentors() });
    },
  });
}
