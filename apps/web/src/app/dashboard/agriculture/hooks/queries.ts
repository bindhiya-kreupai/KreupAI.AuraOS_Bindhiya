import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  SeasonalLaborService,
  HousingManagementService,
  CropCycleService,
  AgricultureAnalyticsService,
  AgricultureSettingsService,
} from '../services';
import type {
  SeasonalWorker,
  LaborAssignment,
  SeasonalLaborPool,
  HousingFacility,
  HousingAssignment,
  HousingInspection,
  CropCycle,
  HarvestSchedule,
  AgricultureSettings,
} from '../types';

// ============================================================================
// SEASONAL LABOR QUERIES
// ============================================================================

export function useWorkers(params?: any) {
  return useQuery({
    queryKey: ['agriculture', 'workers', params],
    queryFn: () => SeasonalLaborService.getAllWorkers(params),
  });
}

export function useWorker(workerId: string) {
  return useQuery({
    queryKey: ['agriculture', 'workers', workerId],
    queryFn: () => SeasonalLaborService.getWorkerById(workerId),
    enabled: !!workerId,
  });
}

export function useCreateWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workerData: Partial<SeasonalWorker>) =>
      SeasonalLaborService.createWorker(workerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'workers'] });
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'analytics'] });
    },
  });
}

export function useUpdateWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workerId, updates }: { workerId: string; updates: Partial<SeasonalWorker> }) =>
      SeasonalLaborService.updateWorker(workerId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'workers'] });
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'workers', variables.workerId] });
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'analytics'] });
    },
  });
}

export function useDeleteWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workerId: string) => SeasonalLaborService.deleteWorker(workerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'workers'] });
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'analytics'] });
    },
  });
}

export function useAssignWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workerId, assignment }: { workerId: string; assignment: LaborAssignment }) =>
      SeasonalLaborService.assignWorker(workerId, assignment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'workers'] });
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'workers', variables.workerId] });
    },
  });
}

export function useLaborPools(params?: any) {
  return useQuery({
    queryKey: ['agriculture', 'laborPools', params],
    queryFn: () => SeasonalLaborService.getAllLaborPools(params),
  });
}

export function useCreateLaborPool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (poolData: Partial<SeasonalLaborPool>) =>
      SeasonalLaborService.createLaborPool(poolData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'laborPools'] });
    },
  });
}

// ============================================================================
// HOUSING MANAGEMENT QUERIES
// ============================================================================

export function useHousingFacilities(params?: any) {
  return useQuery({
    queryKey: ['agriculture', 'housingFacilities', params],
    queryFn: () => HousingManagementService.getAllFacilities(params),
  });
}

export function useCreateHousingFacility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (facilityData: Partial<HousingFacility>) =>
      HousingManagementService.createFacility(facilityData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'housingFacilities'] });
    },
  });
}

export function useUpdateHousingFacility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      facilityId,
      updates,
    }: {
      facilityId: string;
      updates: Partial<HousingFacility>;
    }) => HousingManagementService.updateFacility(facilityId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'housingFacilities'] });
    },
  });
}

export function useDeleteHousingFacility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (facilityId: string) => HousingManagementService.deleteFacility(facilityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'housingFacilities'] });
    },
  });
}

export function useHousingAssignments(params?: any) {
  return useQuery({
    queryKey: ['agriculture', 'housingAssignments', params],
    queryFn: () => HousingManagementService.getAllAssignments(params),
  });
}

export function useCreateHousingAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentData: Partial<HousingAssignment>) =>
      HousingManagementService.createAssignment(assignmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'housingAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'housingFacilities'] });
    },
  });
}

export function useCheckOutHousing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assignmentId,
      checkOutCondition,
    }: {
      assignmentId: string;
      checkOutCondition: any;
    }) => HousingManagementService.checkOut(assignmentId, checkOutCondition),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'housingAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'housingFacilities'] });
    },
  });
}

export function useHousingInspections(params?: any) {
  return useQuery({
    queryKey: ['agriculture', 'housingInspections', params],
    queryFn: () => HousingManagementService.getAllInspections(params),
  });
}

export function useCreateHousingInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inspectionData: Partial<HousingInspection>) =>
      HousingManagementService.createInspection(inspectionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'housingInspections'] });
    },
  });
}

// ============================================================================
// CROP CYCLE QUERIES
// ============================================================================

export function useCropCycles(params?: any) {
  return useQuery({
    queryKey: ['agriculture', 'cropCycles', params],
    queryFn: () => CropCycleService.getAllCropCycles(params),
  });
}

export function useCreateCropCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cycleData: Partial<CropCycle>) => CropCycleService.createCropCycle(cycleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'cropCycles'] });
    },
  });
}

export function useUpdateCropCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cycleId, updates }: { cycleId: string; updates: Partial<CropCycle> }) =>
      CropCycleService.updateCropCycle(cycleId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'cropCycles'] });
    },
  });
}

export function useDeleteCropCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cycleId: string) => CropCycleService.deleteCropCycle(cycleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'cropCycles'] });
    },
  });
}

export function useHarvestSchedules(params?: any) {
  return useQuery({
    queryKey: ['agriculture', 'harvestSchedules', params],
    queryFn: () => CropCycleService.getAllHarvestSchedules(params),
  });
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

export function useAgricultureAnalytics(params?: any) {
  return useQuery({
    queryKey: ['agriculture', 'analytics', params],
    queryFn: () => AgricultureAnalyticsService.getAnalytics(params),
  });
}

// ============================================================================
// SETTINGS QUERIES
// ============================================================================

export function useAgricultureSettings(params?: any) {
  return useQuery({
    queryKey: ['agriculture', 'settings', params],
    queryFn: () => AgricultureSettingsService.getSettings(params),
  });
}

export function useUpdateAgricultureSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: Partial<AgricultureSettings>) =>
      AgricultureSettingsService.updateSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agriculture', 'settings'] });
    },
  });
}
