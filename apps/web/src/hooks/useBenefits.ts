import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAvailablePlans,
  getPlanDetails,
  getCurrentEnrollment,
  enrollInPlan,
  updateEnrollment,
  cancelEnrollment,
  getEnrollmentStatus,
  comparePlanCosts,
  getHSAFSABalance,
  updateHSAContribution,
  BenefitPlan,
  Enrollment,
  EnrollmentRequest,
  EnrollmentPeriodStatus,
  PlanComparison,
  HSAFSABalance,
} from '../services/benefitsService';

// Query key factory
const benefitKeys = {
  all: ['benefits'] as const,
  plans: () => [...benefitKeys.all, 'plans'] as const,
  planDetail: (planId: string) => [...benefitKeys.plans(), planId] as const,
  enrollments: () => [...benefitKeys.all, 'enrollments'] as const,
  enrollmentStatus: () => [...benefitKeys.all, 'enrollment-status'] as const,
  comparison: (planIds: string[]) =>
    [...benefitKeys.all, 'comparison', ...planIds] as const,
  hsaFsa: () => [...benefitKeys.all, 'hsa-fsa'] as const,
};

export function useAvailablePlans() {
  return useQuery<BenefitPlan[]>({
    queryKey: benefitKeys.plans(),
    queryFn: getAvailablePlans,
  });
}

export function usePlanDetails(planId: string) {
  return useQuery<BenefitPlan>({
    queryKey: benefitKeys.planDetail(planId),
    queryFn: () => getPlanDetails(planId),
    enabled: !!planId,
  });
}

export function useCurrentEnrollment() {
  return useQuery<Enrollment[]>({
    queryKey: benefitKeys.enrollments(),
    queryFn: getCurrentEnrollment,
  });
}

export function useEnrollMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EnrollmentRequest) => enrollInPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: benefitKeys.enrollments() });
      queryClient.invalidateQueries({
        queryKey: benefitKeys.enrollmentStatus(),
      });
    },
  });
}

export function useUpdateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<EnrollmentRequest>;
    }) => updateEnrollment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: benefitKeys.enrollments() });
    },
  });
}

export function useCancelEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelEnrollment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: benefitKeys.enrollments() });
      queryClient.invalidateQueries({
        queryKey: benefitKeys.enrollmentStatus(),
      });
    },
  });
}

export function useEnrollmentStatus() {
  return useQuery<EnrollmentPeriodStatus>({
    queryKey: benefitKeys.enrollmentStatus(),
    queryFn: getEnrollmentStatus,
  });
}

export function usePlanComparison(planIds: string[]) {
  return useQuery<PlanComparison[]>({
    queryKey: benefitKeys.comparison(planIds),
    queryFn: () => comparePlanCosts(planIds),
    enabled: planIds.length >= 2,
  });
}

export function useHSAFSABalance() {
  const queryClient = useQueryClient();

  const query = useQuery<HSAFSABalance>({
    queryKey: benefitKeys.hsaFsa(),
    queryFn: getHSAFSABalance,
  });

  const updateContribution = useMutation({
    mutationFn: (amount: number) => updateHSAContribution(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: benefitKeys.hsaFsa() });
    },
  });

  return {
    ...query,
    updateContribution,
  };
}
