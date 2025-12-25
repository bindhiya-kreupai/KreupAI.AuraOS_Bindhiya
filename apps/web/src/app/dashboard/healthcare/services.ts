import { APIClient } from '@/lib/api-client';
import type { HealthcareProvider, NurseSchedule, LocumProvider, LocumAssignment, HealthcareSettings, HealthcareAlert } from './types';

export class CredentialingService {
  private static endpoint = '/industry-healthcare/credentialing';

  static async getAllProviders(): Promise<HealthcareProvider[]> {
    try {
      const response = await APIClient.get<{ providers?: HealthcareProvider[] }>(this.endpoint);
      return response.providers || [];
    } catch {
            return [];
    }
  }

  static async getProviderById(id: string): Promise<HealthcareProvider | null> {
    try {
      const response = await APIClient.get<{ provider?: HealthcareProvider }>(`${this.endpoint}/${id}`);
      return response.provider || null;
    } catch {
            return null;
    }
  }

  static async createProvider(data: Partial<HealthcareProvider>): Promise<HealthcareProvider> {
    const response = await APIClient.post<{ provider: HealthcareProvider }>(this.endpoint, data);
    return response.provider;
  }

  static async updateProvider(id: string, updates: Partial<HealthcareProvider>): Promise<HealthcareProvider> {
    const response = await APIClient.put<{ provider: HealthcareProvider }>(`${this.endpoint}/${id}`, updates);
    return response.provider;
  }
}

export class NurseRosteringService {
  private static endpoint = '/industry-healthcare/nurse-rostering';

  static async getAllSchedules(): Promise<NurseSchedule[]> {
    try {
      const response = await APIClient.get<{ schedules?: NurseSchedule[] }>(this.endpoint);
      return response.schedules || [];
    } catch {
            return [];
    }
  }

  static async getScheduleById(id: string): Promise<NurseSchedule | null> {
    try {
      const response = await APIClient.get<{ schedule?: NurseSchedule }>(`${this.endpoint}/${id}`);
      return response.schedule || null;
    } catch {
            return null;
    }
  }

  static async createSchedule(data: Partial<NurseSchedule>): Promise<NurseSchedule> {
    const response = await APIClient.post<{ schedule: NurseSchedule }>(this.endpoint, data);
    return response.schedule;
  }

  static async updateSchedule(id: string, updates: Partial<NurseSchedule>): Promise<NurseSchedule> {
    const response = await APIClient.put<{ schedule: NurseSchedule }>(`${this.endpoint}/${id}`, updates);
    return response.schedule;
  }
}

export class LocumManagementService {
  private static endpoint = '/industry-healthcare/locum';

  static async getAllLocumProviders(): Promise<LocumProvider[]> {
    try {
      const response = await APIClient.get<{ providers?: LocumProvider[] }>(`${this.endpoint}/providers`);
      return response.providers || [];
    } catch {
            return [];
    }
  }

  static async getLocumProviderById(id: string): Promise<LocumProvider | null> {
    try {
      const response = await APIClient.get<{ provider?: LocumProvider }>(`${this.endpoint}/providers/${id}`);
      return response.provider || null;
    } catch {
            return null;
    }
  }

  static async createLocumProvider(data: Partial<LocumProvider>): Promise<LocumProvider> {
    const response = await APIClient.post<{ provider: LocumProvider }>(`${this.endpoint}/providers`, data);
    return response.provider;
  }

  static async updateLocumProvider(id: string, updates: Partial<LocumProvider>): Promise<LocumProvider> {
    const response = await APIClient.put<{ provider: LocumProvider }>(`${this.endpoint}/providers/${id}`, updates);
    return response.provider;
  }

  static async getAllAssignments(): Promise<LocumAssignment[]> {
    try {
      const response = await APIClient.get<{ assignments?: LocumAssignment[] }>(`${this.endpoint}/assignments`);
      return response.assignments || [];
    } catch {
            return [];
    }
  }

  static async createAssignment(data: Partial<LocumAssignment>): Promise<LocumAssignment> {
    const response = await APIClient.post<{ assignment: LocumAssignment }>(`${this.endpoint}/assignments`, data);
    return response.assignment;
  }
}

export class HealthcareSettingsService {
  private static endpoint = '/industry-healthcare/settings';

  static async getSettings(): Promise<HealthcareSettings | null> {
    try {
      const response = await APIClient.get<{ settings?: HealthcareSettings }>(this.endpoint);
      return response.settings || null;
    } catch {
            return null;
    }
  }

  static async updateSettings(settings: Partial<HealthcareSettings>): Promise<HealthcareSettings> {
    const response = await APIClient.put<{ settings: HealthcareSettings }>(this.endpoint, settings);
    return response.settings;
  }
}

export class AlertsService {
  private static endpoint = '/industry-healthcare/alerts';

  static async getAllAlerts(): Promise<HealthcareAlert[]> {
    try {
      const response = await APIClient.get<{ alerts?: HealthcareAlert[] }>(this.endpoint);
      return response.alerts || [];
    } catch {
            return [];
    }
  }

  static async createAlert(data: Partial<HealthcareAlert>): Promise<HealthcareAlert> {
    const response = await APIClient.post<{ alert: HealthcareAlert }>(this.endpoint, data);
    return response.alert;
  }
}
