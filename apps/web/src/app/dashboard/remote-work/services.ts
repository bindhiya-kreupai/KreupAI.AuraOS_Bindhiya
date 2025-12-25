// Remote Work Services - API Integrated
import { APIClient } from '@/lib/api-client';
import type { RemoteEmployee, RemoteWorkSettings, RemoteWorkAlert } from './types';

export class RemoteEmployeeService {
  private static endpoint = '/remote-work/employees';

  static async getAll(): Promise<RemoteEmployee[]> {
    try {
      const response = await APIClient.get<{ employees?: RemoteEmployee[] }>(this.endpoint);
      return response.employees || [];
    } catch {
            return [];
    }
  }

  static async create(data: Partial<RemoteEmployee>): Promise<RemoteEmployee> {
    try {
      const response = await APIClient.post<{ employee: RemoteEmployee }>(this.endpoint, data);
      return response.employee;
    } catch {
            throw error;
    }
  }

  static async update(id: string, updates: Partial<RemoteEmployee>): Promise<RemoteEmployee> {
    try {
      const response = await APIClient.put<{ employee: RemoteEmployee }>(`${this.endpoint}/${id}`, updates);
      return response.employee;
    } catch {
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
    } catch {
            return null;
    }
  }

  static async update(s: Partial<RemoteWorkSettings>): Promise<RemoteWorkSettings> {
    try {
      const response = await APIClient.put<{ settings: RemoteWorkSettings }>(this.endpoint, s);
      return response.settings;
    } catch {
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
    } catch {
            return [];
    }
  }

  static async create(data: Partial<RemoteWorkAlert>): Promise<RemoteWorkAlert> {
    try {
      const response = await APIClient.post<{ alert: RemoteWorkAlert }>(this.endpoint, data);
      return response.alert;
    } catch {
            throw error;
    }
  }
}
