// Remote Work Services - API Integrated
import { APIClient } from '@/lib/api-client';
import { RemoteEmployee, RemoteWorkSettings, RemoteWorkAlert } from './types';

export class RemoteEmployeeService {
  private static endpoint = '/remote-work/employees';

  static async getAll(): Promise<RemoteEmployee[]> {
    try {
      const response = await APIClient.get<{ employees?: RemoteEmployee[] }>(this.endpoint);
      return response.employees || [];
    } catch (error) {
      console.error('Error fetching remote employees:', error);
      return [];
    }
  }

  static async create(data: Partial<RemoteEmployee>): Promise<RemoteEmployee> {
    try {
      const response = await APIClient.post<{ employee: RemoteEmployee }>(this.endpoint, data);
      return response.employee;
    } catch (error) {
      console.error('Error creating remote employee:', error);
      throw error;
    }
  }

  static async update(id: string, updates: Partial<RemoteEmployee>): Promise<RemoteEmployee> {
    try {
      const response = await APIClient.put<{ employee: RemoteEmployee }>(`${this.endpoint}/${id}`, updates);
      return response.employee;
    } catch (error) {
      console.error('Error updating remote employee:', error);
      throw error;
    }
  }
}

export class RemoteWorkSettingsService {
  private static endpoint = '/remote-work/settings';

  static async get(): Promise<RemoteWorkSettings | null> {
    try {
      const response = await APIClient.get<{ settings?: RemoteWorkSettings }>(this.endpoint);
      return response.settings || null;
    } catch (error) {
      console.error('Error fetching remote work settings:', error);
      return null;
    }
  }

  static async update(s: Partial<RemoteWorkSettings>): Promise<RemoteWorkSettings> {
    try {
      const response = await APIClient.put<{ settings: RemoteWorkSettings }>(this.endpoint, s);
      return response.settings;
    } catch (error) {
      console.error('Error updating remote work settings:', error);
      throw error;
    }
  }
}

export class AlertsService {
  private static endpoint = '/remote-work/alerts';

  static async getAll(): Promise<RemoteWorkAlert[]> {
    try {
      const response = await APIClient.get<{ alerts?: RemoteWorkAlert[] }>(this.endpoint);
      return response.alerts || [];
    } catch (error) {
      console.error('Error fetching remote work alerts:', error);
      return [];
    }
  }

  static async create(data: Partial<RemoteWorkAlert>): Promise<RemoteWorkAlert> {
    try {
      const response = await APIClient.post<{ alert: RemoteWorkAlert }>(this.endpoint, data);
      return response.alert;
    } catch (error) {
      console.error('Error creating remote work alert:', error);
      throw error;
    }
  }
}
