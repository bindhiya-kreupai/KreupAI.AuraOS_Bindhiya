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
  static async getAllWorkers(): Promise<SeasonalWorker[]> {
    try {
      const response = await APIClient.get<{ workers?: SeasonalWorker[] }>(
        `${this.endpoint}/workers`
      );
      return response.workers || [];
    } catch (error: any) {
            return [];
    }
  }

  // Get worker by ID
  static async getWorkerById(workerId: string): Promise<SeasonalWorker | null> {
    try {
      const response = await APIClient.get<{ worker?: SeasonalWorker }>(
        `${this.endpoint}/workers/${workerId}`
      );
      return response.worker || null;
    } catch (error: any) {
            return null;
    }
  }

  // Create seasonal worker
  static async createWorker(
    workerData: Partial<SeasonalWorker>
  ): Promise<SeasonalWorker> {
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
    try {
      const response = await APIClient.get<{ workers?: SeasonalWorker[] }>(
        `${this.endpoint}/workers/search`,
        { query, ...filters }
      );
      return response.workers || [];
    } catch (error: any) {
            return [];
    }
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
  static async getAllLaborPools(): Promise<SeasonalLaborPool[]> {
    try {
      const response = await APIClient.get<{ pools?: SeasonalLaborPool[] }>(
        `${this.endpoint}/pools`
      );
      return response.pools || [];
    } catch (error: any) {
            return [];
    }
  }

  // Create labor pool
  static async createLaborPool(
    poolData: Partial<SeasonalLaborPool>
  ): Promise<SeasonalLaborPool> {
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
  static async getAllFacilities(): Promise<HousingFacility[]> {
    try {
      const response = await APIClient.get<{ facilities?: HousingFacility[] }>(
        `${this.endpoint}/facilities`
      );
      return response.facilities || [];
    } catch (error: any) {
            return [];
    }
  }

  // Get facility by ID
  static async getFacilityById(
    facilityId: string
  ): Promise<HousingFacility | null> {
    try {
      const response = await APIClient.get<{ facility?: HousingFacility }>(
        `${this.endpoint}/facilities/${facilityId}`
      );
      return response.facility || null;
    } catch (error: any) {
            return null;
    }
  }

  // Create housing facility
  static async createFacility(
    facilityData: Partial<HousingFacility>
  ): Promise<HousingFacility> {
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
  static async getAllAssignments(): Promise<HousingAssignment[]> {
    try {
      const response = await APIClient.get<{ assignments?: HousingAssignment[] }>(
        `${this.endpoint}/assignments`
      );
      return response.assignments || [];
    } catch (error: any) {
            return [];
    }
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
  static async checkOut(
    assignmentId: string,
    checkOutCondition: any
  ): Promise<HousingAssignment> {
    const response = await APIClient.post<{ assignment: HousingAssignment }>(
      `${this.endpoint}/assignments/${assignmentId}/checkout`,
      { checkOutCondition }
    );
    return response.assignment;
  }

  // Get housing inspections
  static async getAllInspections(): Promise<HousingInspection[]> {
    try {
      const response = await APIClient.get<{ inspections?: HousingInspection[] }>(
        `${this.endpoint}/inspections`
      );
      return response.inspections || [];
    } catch (error: any) {
            return [];
    }
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
  static async getAllCropCycles(): Promise<CropCycle[]> {
    try {
      const response = await APIClient.get<{ cycles?: CropCycle[] }>(this.endpoint);
      return response.cycles || [];
    } catch (error: any) {
            return [];
    }
  }

  // Get crop cycle by ID
  static async getCropCycleById(cycleId: string): Promise<CropCycle | null> {
    try {
      const response = await APIClient.get<{ cycle?: CropCycle }>(
        `${this.endpoint}/${cycleId}`
      );
      return response.cycle || null;
    } catch (error: any) {
            return null;
    }
  }

  // Create crop cycle
  static async createCropCycle(
    cycleData: Partial<CropCycle>
  ): Promise<CropCycle> {
    const response = await APIClient.post<{ cycle: CropCycle }>(
      this.endpoint,
      cycleData
    );
    return response.cycle;
  }

  // Update crop cycle
  static async updateCropCycle(
    cycleId: string,
    updates: Partial<CropCycle>
  ): Promise<CropCycle> {
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
  static async updateCropStage(
    cycleId: string,
    newStage: any
  ): Promise<CropCycle> {
    const response = await APIClient.post<{ cycle: CropCycle }>(
      `${this.endpoint}/${cycleId}/stage`,
      { stage: newStage }
    );
    return response.cycle;
  }

  // Get harvest schedules
  static async getAllHarvestSchedules(): Promise<HarvestSchedule[]> {
    try {
      const response = await APIClient.get<{ schedules?: HarvestSchedule[] }>(
        `${this.endpoint}/harvest-schedules`
      );
      return response.schedules || [];
    } catch (error: any) {
            return [];
    }
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
  static async getAnalytics(): Promise<AgricultureAnalytics> {
    try {
      const response = await APIClient.get<{ analytics: AgricultureAnalytics }>(
        this.endpoint
      );
      return response.analytics;
    } catch (error: any) {
            throw error;
    }
  }

  // Export analytics report
  static async exportReport(format: 'pdf' | 'excel'): Promise<Blob> {
    try {
      const response = await APIClient.get<Blob>(
        `${this.endpoint}/export`,
        { format }
      );
      return response;
    } catch (error: any) {
            throw error;
    }
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class AgricultureSettingsService {
  private static endpoint = '/industry-agriculture/settings';

  // Get settings
  static async getSettings(): Promise<AgricultureSettings> {
    try {
      const response = await APIClient.get<{ settings: AgricultureSettings }>(
        this.endpoint
      );
      return response.settings;
    } catch (error: any) {
            throw error;
    }
  }

  // Update settings
  static async updateSettings(
    updates: Partial<AgricultureSettings>
  ): Promise<AgricultureSettings> {
    const response = await APIClient.put<{ settings: AgricultureSettings }>(
      this.endpoint,
      updates
    );
    return response.settings;
  }
}
