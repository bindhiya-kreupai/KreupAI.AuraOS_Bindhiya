import { APIClient } from '@/lib/api-client';

export interface Incident {
  id: string;
  type: string;
  description: string;
  location: string;
  date: string;
  severity: string;
  status: string;
  reportedBy: string;
  tenantId?: string;
}

export interface HealthCheckup {
  id: string;
  type: string;
  date: string;
  doctor: string;
  clinic: string;
  status: string;
  tenantId?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  type: string;
  tenantId?: string;
}

export interface SafetyTraining {
  id: string;
  title: string;
  duration: number;
  progress: number;
  deadline: string;
  type: string;
  tenantId?: string;
}

export interface HealthSafetySettings {
  settingsId: string;
  organizationId: string;
  incidentReporting: {
    requirePhotos: boolean;
    autoNotifySupervisor: boolean;
    escalationThresholdHours: number;
  };
  safetyTraining: {
    mandatoryRefreshMonths: number;
    autoEnroll: boolean;
  };
  notifications: {
    incidentReported: boolean;
    trainingDue: boolean;
    checkupReminder: boolean;
  };
  updatedAt: string;
  tenantId?: string;
}

export class IncidentService {
  static async getAll(): Promise<Incident[]> {
    try {
      const response = await APIClient.get<unknown>('/health-safety/incidents');
      return APIClient.unwrapList<Incident>(response, 'data');
    } catch {
      return [];
    }
  }

  static async create(data: Partial<Incident>): Promise<Incident> {
    const response = await APIClient.post<{ data: Incident }>('/health-safety/incidents', data);
    return response.data;
  }
}

export class HealthCheckupService {
  static async getAll(): Promise<HealthCheckup[]> {
    try {
      const response = await APIClient.get<unknown>('/health-safety/checkups');
      return APIClient.unwrapList<HealthCheckup>(response, 'data');
    } catch {
      return [];
    }
  }

  static async create(data: Partial<HealthCheckup>): Promise<HealthCheckup> {
    const response = await APIClient.post<{ data: HealthCheckup }>('/health-safety/checkups', data);
    return response.data;
  }
}

export class EmergencyService {
  static async getContacts(): Promise<EmergencyContact[]> {
    try {
      const response = await APIClient.get<unknown>('/health-safety/emergency');
      return APIClient.unwrapList<EmergencyContact>(response, 'data');
    } catch {
      return [];
    }
  }
}

export class SafetyTrainingService {
  static async getAll(): Promise<SafetyTraining[]> {
    try {
      const response = await APIClient.get<unknown>('/health-safety/training');
      return APIClient.unwrapList<SafetyTraining>(response, 'data');
    } catch {
      return [];
    }
  }
}

export class HealthSafetyAnalyticsService {
  static async getMetrics(): Promise<any> {
    try {
      const response = await APIClient.get<unknown>('/health-safety/settings');
      return APIClient.unwrapItem<any>(response) || {};
    } catch {
      return {};
    }
  }
}

export class HealthSafetySettingsService {
  static async getSettings(): Promise<HealthSafetySettings | null> {
    try {
      const response = await APIClient.get<{ data?: HealthSafetySettings }>(
        '/health-safety/settings'
      );
      return APIClient.unwrapItem<any>(response, 'data');
    } catch {
      return null;
    }
  }

  static async updateSettings(
    settings: Partial<HealthSafetySettings>
  ): Promise<HealthSafetySettings> {
    const response = await APIClient.put<{ data: HealthSafetySettings }>(
      '/health-safety/settings',
      settings
    );
    return response.data;
  }
}
