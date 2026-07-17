// Agriculture Module - Service Layer
// Handles all business logic and data operations for agriculture features

import { APIClient } from '@/lib/api-client';
import type {
  SeasonalWorker,
  LaborAssignment,
  SeasonalLaborPool,
  HousingFacility,
  HousingAssignment,
  HousingInspection,
  CropCycle,
  HarvestSchedule,
  AgricultureAnalytics,
  AgricultureSettings,
} from './types';

// ============================================================================
// SEASONAL LABOR SERVICE
// ============================================================================

export class SeasonalLaborService {
  private static endpoint = '/industry-agriculture/seasonal-labor';

  // Get all seasonal workers
  static async getAllWorkers(params?: any): Promise<SeasonalWorker[]> {
    const response = await APIClient.get<unknown>(`${this.endpoint}/workers`, params);
    return APIClient.unwrapList<SeasonalWorker>(response, 'workers');
  }

  // Get worker by ID
  static async getWorkerById(workerId: string): Promise<SeasonalWorker | null> {
    const response = await APIClient.get<unknown>(`${this.endpoint}/workers/${workerId}`);
    return APIClient.unwrapItem<SeasonalWorker>(response, 'worker');
  }

  // Create seasonal worker
  static async createWorker(workerData: Partial<SeasonalWorker>): Promise<SeasonalWorker> {
    const response = await APIClient.post<{ worker: SeasonalWorker }>(
      `${this.endpoint}/workers`,
      workerData
    );
    return response.worker;
  }

  // Update worker
  static async updateWorker(
    workerId: string,
    updates: Partial<SeasonalWorker>
  ): Promise<SeasonalWorker> {
    const response = await APIClient.put<{ worker: SeasonalWorker }>(
      `${this.endpoint}/workers/${workerId}`,
      updates
    );
    return response.worker;
  }

  // Delete worker
  static async deleteWorker(workerId: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/workers/${workerId}`);
  }

  // Search workers
  static async searchWorkers(
    query: string,
    filters?: {
      status?: string;
      seasonType?: string;
      skills?: string[];
    }
  ): Promise<SeasonalWorker[]> {
    const response = await APIClient.get<unknown>(`${this.endpoint}/workers/search`, {
      query,
      ...filters,
    });
    return APIClient.unwrapList<SeasonalWorker>(response, 'workers');
  }

  // Assign worker to labor task
  static async assignWorker(
    workerId: string,
    assignment: LaborAssignment
  ): Promise<SeasonalWorker> {
    const response = await APIClient.post<{ worker: SeasonalWorker }>(
      `${this.endpoint}/workers/${workerId}/assign`,
      assignment
    );
    return response.worker;
  }

  // Get labor pools
  static async getAllLaborPools(params?: any): Promise<SeasonalLaborPool[]> {
    const response = await APIClient.get<unknown>(`${this.endpoint}/pools`, params);
    return APIClient.unwrapList<SeasonalLaborPool>(response, 'pools');
  }

  // Create labor pool
  static async createLaborPool(poolData: Partial<SeasonalLaborPool>): Promise<SeasonalLaborPool> {
    const response = await APIClient.post<{ pool: SeasonalLaborPool }>(
      `${this.endpoint}/pools`,
      poolData
    );
    return response.pool;
  }
}

// ============================================================================
// HOUSING MANAGEMENT SERVICE
// ============================================================================

export class HousingManagementService {
  private static endpoint = '/industry-agriculture/housing';

  // Get all housing facilities
  static async getAllFacilities(params?: any): Promise<HousingFacility[]> {
    const response = await APIClient.get<unknown>(`${this.endpoint}/facilities`, params);
    return APIClient.unwrapList<HousingFacility>(response, 'facilities');
  }

  // Get facility by ID
  static async getFacilityById(facilityId: string): Promise<HousingFacility | null> {
    const response = await APIClient.get<unknown>(`${this.endpoint}/facilities/${facilityId}`);
    return APIClient.unwrapItem<HousingFacility>(response, 'facility');
  }

  // Create housing facility
  static async createFacility(facilityData: Partial<HousingFacility>): Promise<HousingFacility> {
    const response = await APIClient.post<{ facility: HousingFacility }>(
      `${this.endpoint}/facilities`,
      facilityData
    );
    return response.facility;
  }

  // Update facility
  static async updateFacility(
    facilityId: string,
    updates: Partial<HousingFacility>
  ): Promise<HousingFacility> {
    const response = await APIClient.put<{ facility: HousingFacility }>(
      `${this.endpoint}/facilities/${facilityId}`,
      updates
    );
    return response.facility;
  }

  // Delete facility
  static async deleteFacility(facilityId: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/facilities/${facilityId}`);
  }

  // Get housing assignments
  static async getAllAssignments(params?: any): Promise<HousingAssignment[]> {
    const response = await APIClient.get<unknown>(`${this.endpoint}/assignments`, params);
    return APIClient.unwrapList<HousingAssignment>(response, 'assignments');
  }

  // Create housing assignment
  static async createAssignment(
    assignmentData: Partial<HousingAssignment>
  ): Promise<HousingAssignment> {
    const response = await APIClient.post<{ assignment: HousingAssignment }>(
      `${this.endpoint}/assignments`,
      assignmentData
    );
    return response.assignment;
  }

  // Check out from housing
  static async checkOut(assignmentId: string, checkOutCondition: any): Promise<HousingAssignment> {
    const response = await APIClient.post<{ assignment: HousingAssignment }>(
      `${this.endpoint}/assignments/${assignmentId}/checkout`,
      { checkOutCondition }
    );
    return response.assignment;
  }

  // Get housing inspections
  static async getAllInspections(params?: any): Promise<HousingInspection[]> {
    const response = await APIClient.get<unknown>(`${this.endpoint}/inspections`, params);
    return APIClient.unwrapList<HousingInspection>(response, 'inspections');
  }

  // Create housing inspection
  static async createInspection(
    inspectionData: Partial<HousingInspection>
  ): Promise<HousingInspection> {
    const response = await APIClient.post<{ inspection: HousingInspection }>(
      `${this.endpoint}/inspections`,
      inspectionData
    );
    return response.inspection;
  }
}

// ============================================================================
// CROP CYCLE SERVICE
// ============================================================================

export class CropCycleService {
  private static endpoint = '/industry-agriculture/crop-cycles';

  // Get all crop cycles
  static async getAllCropCycles(params?: any): Promise<CropCycle[]> {
    const response = await APIClient.get<unknown>(this.endpoint, params);
    return APIClient.unwrapList<CropCycle>(response, 'cycles');
  }

  // Get crop cycle by ID
  static async getCropCycleById(cycleId: string): Promise<CropCycle | null> {
    const response = await APIClient.get<unknown>(`${this.endpoint}/${cycleId}`);
    return APIClient.unwrapItem<CropCycle>(response, 'cycle');
  }

  // Create crop cycle
  static async createCropCycle(cycleData: Partial<CropCycle>): Promise<CropCycle> {
    const response = await APIClient.post<{ cycle: CropCycle }>(this.endpoint, cycleData);
    return response.cycle;
  }

  // Update crop cycle
  static async updateCropCycle(cycleId: string, updates: Partial<CropCycle>): Promise<CropCycle> {
    const response = await APIClient.put<{ cycle: CropCycle }>(
      `${this.endpoint}/${cycleId}`,
      updates
    );
    return response.cycle;
  }

  // Delete crop cycle
  static async deleteCropCycle(cycleId: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${cycleId}`);
  }

  // Update crop stage
  static async updateCropStage(cycleId: string, newStage: any): Promise<CropCycle> {
    const response = await APIClient.post<{ cycle: CropCycle }>(
      `${this.endpoint}/${cycleId}/stage`,
      { stage: newStage }
    );
    return response.cycle;
  }

  // Get harvest schedules
  static async getAllHarvestSchedules(params?: any): Promise<HarvestSchedule[]> {
    const response = await APIClient.get<unknown>(`${this.endpoint}/harvest-schedules`, params);
    return APIClient.unwrapList<HarvestSchedule>(response, 'schedules');
  }

  // Create harvest schedule
  static async createHarvestSchedule(
    scheduleData: Partial<HarvestSchedule>
  ): Promise<HarvestSchedule> {
    const response = await APIClient.post<{ schedule: HarvestSchedule }>(
      `${this.endpoint}/harvest-schedules`,
      scheduleData
    );
    return response.schedule;
  }
}

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

export class AgricultureAnalyticsService {
  private static endpoint = '/industry-agriculture/analytics';

  // Get analytics
  static async getAnalytics(params?: any): Promise<AgricultureAnalytics> {
    const response = await APIClient.get<{ analytics: AgricultureAnalytics }>(
      this.endpoint,
      params
    );
    return response.analytics;
  }

  // Export analytics report
  static async exportReport(format: 'pdf' | 'excel'): Promise<Blob> {
    const response = await APIClient.get<Blob>(`${this.endpoint}/export`, { format });
    return response;
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class AgricultureSettingsService {
  private static endpoint = '/industry-agriculture/settings';

  // Get settings
  static async getSettings(params?: any): Promise<AgricultureSettings> {
    const response = await APIClient.get<{ settings: AgricultureSettings }>(this.endpoint, params);
    return response.settings;
  }

  // Update settings
  static async updateSettings(updates: Partial<AgricultureSettings>): Promise<AgricultureSettings> {
    const response = await APIClient.put<{ settings: AgricultureSettings }>(this.endpoint, updates);
    return response.settings;
  }
}
