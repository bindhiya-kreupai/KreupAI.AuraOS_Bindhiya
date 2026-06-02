// Grievance Management Services - API Integrated
import { APIClient } from '@/lib/api-client';
import type {
  Grievance,
  GrievanceUpdate,
  Investigation,
  Resolution,
  GrievancePolicy,
  GrievanceMetrics,
  GrievanceSettings,
} from './types';

export class GrievanceService {
  private static endpoint = '/grievance';

  static async getGrievances(filters?: {
    employeeId?: string;
    status?: string;
    departmentId?: string;
  }): Promise<Grievance[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint, filters);
      return APIClient.unwrapList<Grievance>(response, 'grievances');
    } catch (error: any) {
      return [];
    }
  }

  static async submitGrievance(grievance: Grievance): Promise<Grievance> {
    const response = await APIClient.post<{ grievance: Grievance }>(this.endpoint, grievance);
    return response.grievance;
  }

  static async updateGrievance(id: string, updates: Partial<Grievance>): Promise<Grievance> {
    const response = await APIClient.put<{ grievance: Grievance }>(
      `${this.endpoint}/${id}`,
      updates
    );
    return response.grievance;
  }

  static async addUpdate(id: string, update: GrievanceUpdate): Promise<Grievance> {
    const response = await APIClient.post<{ grievance: Grievance }>(
      `${this.endpoint}/${id}/updates`,
      update
    );
    return response.grievance;
  }

  static async acknowledgeGrievance(id: string, acknowledgedBy: string): Promise<Grievance> {
    const response = await APIClient.post<{ grievance: Grievance }>(
      `${this.endpoint}/${id}/acknowledge`,
      { acknowledgedBy }
    );
    return response.grievance;
  }

  static async escalateGrievance(id: string, newLevel: string, reason: string): Promise<Grievance> {
    const response = await APIClient.post<{ grievance: Grievance }>(
      `${this.endpoint}/${id}/escalate`,
      { newLevel, reason }
    );
    return response.grievance;
  }

  static async resolveGrievance(id: string): Promise<Grievance> {
    const response = await APIClient.post<{ grievance: Grievance }>(
      `${this.endpoint}/${id}/resolve`
    );
    return response.grievance;
  }

  static async closeGrievance(id: string): Promise<Grievance> {
    const response = await APIClient.post<{ grievance: Grievance }>(`${this.endpoint}/${id}/close`);
    return response.grievance;
  }
}

export class InvestigationService {
  private static endpoint = '/grievance/investigations';

  static async createInvestigation(investigation: Investigation): Promise<Investigation> {
    const response = await APIClient.post<{ investigation: Investigation }>(
      this.endpoint,
      investigation
    );
    return response.investigation;
  }

  static async updateInvestigation(
    id: string,
    updates: Partial<Investigation>
  ): Promise<Investigation> {
    const response = await APIClient.put<{ investigation: Investigation }>(
      `${this.endpoint}/${id}`,
      updates
    );
    return response.investigation;
  }

  static async completeInvestigation(
    id: string,
    findings: string,
    recommendations: string[]
  ): Promise<Investigation> {
    const response = await APIClient.post<{ investigation: Investigation }>(
      `${this.endpoint}/${id}/complete`,
      { findings, recommendations }
    );
    return response.investigation;
  }
}

export class ResolutionService {
  private static endpoint = '/grievance/resolutions';

  static async createResolution(resolution: Resolution): Promise<Resolution> {
    const response = await APIClient.post<{ resolution: Resolution }>(this.endpoint, resolution);
    return response.resolution;
  }
}

export class GrievanceAnalyticsService {
  private static endpoint = '/grievance/analytics';

  static async getMetrics(): Promise<GrievanceMetrics> {
    try {
      const response = await APIClient.get<{ metrics?: GrievanceMetrics }>(this.endpoint);
      return (
        response.metrics || {
          totalGrievances: 0,
          openGrievances: 0,
          resolvedGrievances: 0,
          averageResolutionDays: 0,
          grievancesByType: [],
          grievancesBySeverity: [],
          grievancesByDepartment: [],
          resolutionRate: 0,
          satisfactionScore: 0,
          escalationRate: 0,
          repeatGrievances: 0,
        }
      );
    } catch (error: any) {
      throw error;
    }
  }
}

export class GrievanceSettingsService {
  private static endpoint = '/grievance/settings';

  static async getSettings(): Promise<GrievanceSettings> {
    try {
      const response = await APIClient.get<{ settings?: GrievanceSettings }>(this.endpoint);
      return (
        response.settings || {
          allowAnonymousGrievances: true,
          requireManagerNotification: true,
          autoEscalationEnabled: true,
          escalationThresholdDays: 7,
          slaTracking: true,
          satisfactionSurveyEnabled: true,
          confidentialityByDefault: false,
          notificationEmail: 'hr@company.com',
          hrEmail: 'hr@company.com',
        }
      );
    } catch (error: any) {
      throw error;
    }
  }

  static async updateSettings(updates: Partial<GrievanceSettings>): Promise<GrievanceSettings> {
    const response = await APIClient.put<{ settings: GrievanceSettings }>(this.endpoint, updates);
    return response.settings;
  }
}
