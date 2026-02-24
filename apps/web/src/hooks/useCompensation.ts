'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTotalCompensation,
  getSalaryBenchmark,
  getEquityDetails,
  runCompensationReview,
  getBudgetAllocation,
  calculateBonus,
} from '@/services/compensationService';
import type {
  TotalCompensation,
  SalaryBenchmark,
  EquityDetails,
  CompReviewRequest,
  CompReviewResult,
  BudgetAllocation,
  BonusCalcRequest,
  BonusResult,
} from '@/services/compensationService';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const compensationKeys = {
  all: ['compensation'] as const,
  totalComp: (employeeId: string) => [...compensationKeys.all, 'total', employeeId] as const,
  benchmark: (jobId: string, location?: string) => [...compensationKeys.all, 'benchmark', jobId, location] as const,
  equity: (employeeId: string) => [...compensationKeys.all, 'equity', employeeId] as const,
  budget: (departmentId?: string) => [...compensationKeys.all, 'budget', departmentId] as const,
  reviews: () => [...compensationKeys.all, 'reviews'] as const,
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch total compensation details for a specific employee
 */
export function useTotalCompensation(employeeId: string) {
  return useQuery<TotalCompensation, Error>({
    queryKey: compensationKeys.totalComp(employeeId),
    queryFn: () => getTotalCompensation(employeeId),
    enabled: !!employeeId,
  });
}

/**
 * Hook to fetch salary benchmark data for a job role and optional location
 */
export function useSalaryBenchmark(jobId: string, location?: string) {
  return useQuery<SalaryBenchmark, Error>({
    queryKey: compensationKeys.benchmark(jobId, location),
    queryFn: () => getSalaryBenchmark(jobId, location),
    enabled: !!jobId,
  });
}

/**
 * Hook to fetch equity grant details for a specific employee
 */
export function useEquityDetails(employeeId: string) {
  return useQuery<EquityDetails, Error>({
    queryKey: compensationKeys.equity(employeeId),
    queryFn: () => getEquityDetails(employeeId),
    enabled: !!employeeId,
  });
}

/**
 * Hook to run a compensation review cycle via mutation
 */
export function useCompReview() {
  const queryClient = useQueryClient();

  return useMutation<CompReviewResult, Error, CompReviewRequest>({
    mutationFn: (data: CompReviewRequest) => runCompensationReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: compensationKeys.reviews() });
      queryClient.invalidateQueries({ queryKey: compensationKeys.all });
    },
  });
}

/**
 * Hook to fetch budget allocation data, optionally filtered by department
 */
export function useBudgetAllocation(departmentId?: string) {
  return useQuery<BudgetAllocation, Error>({
    queryKey: compensationKeys.budget(departmentId),
    queryFn: () => getBudgetAllocation(departmentId),
  });
}

/**
 * Hook to calculate bonus for an employee via mutation
 */
export function useBonusCalculation() {
  return useMutation<BonusResult, Error, BonusCalcRequest>({
    mutationFn: (data: BonusCalcRequest) => calculateBonus(data),
  });
}
