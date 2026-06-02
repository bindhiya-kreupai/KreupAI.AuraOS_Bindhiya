// Remote Work Services - API Integrated with Engagement Backend
import { APIClient } from '@/lib/api-client';
import type { RemoteEmployee, RemoteWorkSettings, RemoteWorkAlert, RemotePolicy } from './types';

const BASE_ENDPOINT = '/engagement/remote-work';

export class RemoteEmployeeService {
  static async getAll(): Promise<RemoteEmployee[]> {
    try {
      const response = await APIClient.get<unknown>(`${BASE_ENDPOINT}?type=employees`);
      return APIClient.unwrapList<RemoteEmployee>(response, 'employees');
    } catch (_error: any) {
      return [];
    }
  }

  static async update(id: string, updates: Partial<RemoteEmployee>): Promise<RemoteEmployee> {
    const response = await APIClient.put<{ employee: RemoteEmployee }>(`${BASE_ENDPOINT}`, {
      id,
      updates,
    });
    return response.employee;
  }
}

export class RemotePolicyService {
  static async getAll(): Promise<RemotePolicy[]> {
    try {
      const response = await APIClient.get<unknown>(`${BASE_ENDPOINT}?type=policies`);
      return APIClient.unwrapList<RemotePolicy>(response, 'policies');
    } catch (_error: any) {
      return [];
    }
  }

  static async create(data: Partial<RemotePolicy>): Promise<RemotePolicy> {
    const response = await APIClient.post<{ policy: RemotePolicy }>(`${BASE_ENDPOINT}`, {
      ...data,
      action: 'createPolicy',
    });
    return response.policy;
  }

  static async update(id: string, updates: Partial<RemotePolicy>): Promise<RemotePolicy> {
    const response = await APIClient.put<{ policy: RemotePolicy }>(`${BASE_ENDPOINT}`, {
      id,
      updates,
      action: 'updatePolicy',
    });
    return response.policy;
  }
}

export class RemoteWorkSettingsService {
  static async get(): Promise<RemoteWorkSettings | null> {
    try {
      const response = await APIClient.get<unknown>(`${BASE_ENDPOINT}?type=metrics`);
      return APIClient.unwrapItem<RemoteWorkSettings>(response, 'teamMetrics');
    } catch (_error: any) {
      return null;
    }
  }

  static async update(s: Partial<RemoteWorkSettings>): Promise<RemoteWorkSettings> {
    const response = await APIClient.put<{ settings: RemoteWorkSettings }>(`${BASE_ENDPOINT}`, {
      settings: s,
    });
    return response.settings;
  }
}

export class AlertsService {
  static async getAll(): Promise<RemoteWorkAlert[]> {
    try {
      const response = await APIClient.get<unknown>(`${BASE_ENDPOINT}?type=requests`);
      return APIClient.unwrapList<RemoteWorkAlert>(response, 'requests');
    } catch (_error: any) {
      return [];
    }
  }

  static async create(data: Partial<RemoteWorkAlert>): Promise<RemoteWorkAlert> {
    const response = await APIClient.post<{ request: RemoteWorkAlert }>(`${BASE_ENDPOINT}`, data);
    return response.request;
  }
}
