'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getHeadcountMetrics,
  getTurnoverAnalysis,
  getDiversityMetrics,
  getCompensationAnalytics,
  getPredictiveInsights,
  getRealTimeMetrics,
  runCustomReport,
  getSavedReports,
  scheduleReport,
} from '@/services/analyticsService';
import type {
  DateRangeParams,
  HeadcountMetrics,
  TurnoverMetrics,
  DiversityMetrics,
  CompAnalytics,
  PredictiveInsight,
  RealTimeMetrics,
  ReportConfig,
  ReportResult,
  SavedReport,
  ScheduleConfig,
} from '@/services/analyticsService';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const analyticsKeys = {
  all: ['analytics'] as const,
  headcount: (params?: DateRangeParams) => [...analyticsKeys.all, 'headcount', params] as const,
  turnover: (params?: DateRangeParams) => [...analyticsKeys.all, 'turnover', params] as const,
  diversity: () => [...analyticsKeys.all, 'diversity'] as const,
  compensation: () => [...analyticsKeys.all, 'compensation'] as const,
  predictive: () => [...analyticsKeys.all, 'predictive-insights'] as const,
  realTime: () => [...analyticsKeys.all, 'real-time'] as const,
  reports: () => [...analyticsKeys.all, 'reports'] as const,
  savedReports: () => [...analyticsKeys.reports(), 'saved'] as const,
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch headcount metrics with optional date range filtering
 */
export function useHeadcountMetrics(params?: DateRangeParams) {
  return useQuery<HeadcountMetrics, Error>({
    queryKey: analyticsKeys.headcount(params),
    queryFn: () => getHeadcountMetrics(params),
  });
}

/**
 * Hook to fetch turnover analysis metrics with optional date range filtering
 */
export function useTurnoverAnalysis(params?: DateRangeParams) {
  return useQuery<TurnoverMetrics, Error>({
    queryKey: analyticsKeys.turnover(params),
    queryFn: () => getTurnoverAnalysis(params),
  });
}

/**
 * Hook to fetch diversity and inclusion metrics
 */
export function useDiversityMetrics() {
  return useQuery<DiversityMetrics, Error>({
    queryKey: analyticsKeys.diversity(),
    queryFn: getDiversityMetrics,
  });
}

/**
 * Hook to fetch compensation analytics data
 */
export function useCompensationAnalytics() {
  return useQuery<CompAnalytics, Error>({
    queryKey: analyticsKeys.compensation(),
    queryFn: getCompensationAnalytics,
  });
}

/**
 * Hook to fetch AI-powered predictive insights
 */
export function usePredictiveInsights() {
  return useQuery<PredictiveInsight[], Error>({
    queryKey: analyticsKeys.predictive(),
    queryFn: getPredictiveInsights,
  });
}

/**
 * Hook to fetch real-time operational metrics with auto-refresh every 30 seconds
 */
export function useRealTimeMetrics() {
  return useQuery<RealTimeMetrics, Error>({
    queryKey: analyticsKeys.realTime(),
    queryFn: getRealTimeMetrics,
    refetchInterval: 30000,
  });
}

/**
 * Hook to run a custom report via mutation
 */
export function useCustomReport() {
  const queryClient = useQueryClient();

  return useMutation<ReportResult, Error, ReportConfig>({
    mutationFn: (config: ReportConfig) => runCustomReport(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.savedReports() });
    },
  });
}

/**
 * Hook to fetch all saved report configurations
 */
export function useSavedReports() {
  return useQuery<SavedReport[], Error>({
    queryKey: analyticsKeys.savedReports(),
    queryFn: getSavedReports,
  });
}

/**
 * Hook to schedule a report for periodic execution via mutation
 */
export function useScheduleReport() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ScheduleConfig>({
    mutationFn: (config: ScheduleConfig) => scheduleReport(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.savedReports() });
    },
  });
}
