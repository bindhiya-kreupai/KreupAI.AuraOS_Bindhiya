// Policy Management Services - API Integrated
import { APIClient } from '@/lib/api-client';
import type { Policy, PolicySettings, PolicyAlert } from './types';

export class PolicyService {
  private static endpoint = '/policy-mgmt/policies';

  static async getAll(): Promise<Policy[]> {
    try {
      const response = await APIClient.get<{ policies?: Policy[] }>(this.endpoint);
      return response.policies || [];
    } catch (error: any) {
            return [];
    }
  }

  static async create(data: Partial<Policy>): Promise<Policy> {
    const response = await APIClient.post<{ policy: Policy }>(this.endpoint, data);
    return response.policy;
  }

  static async update(id: string, updates: Partial<Policy>): Promise<Policy> {
    const response = await APIClient.put<{ policy: Policy }>(`${this.endpoint}/${id}`, updates);
    return response.policy;
  }

  static async delete(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }
}

export class PolicySettingsService {
  private static endpoint = '/policy-mgmt/settings';

  static async get(): Promise<PolicySettings | null> {
    try {
      const response = await APIClient.get<{ settings?: PolicySettings }>(this.endpoint);
      return response.settings || null;
    } catch (error: any) {
            return null;
    }
  }

  static async update(s: Partial<PolicySettings>): Promise<PolicySettings> {
    const response = await APIClient.put<{ settings: PolicySettings }>(this.endpoint, s);
    return response.settings;
  }
}

export class AcknowledgementService {
  private static endpoint = '/policy-mgmt/acknowledgements';

  static async getAll(): Promise<any[]> {
    try {
      const response = await APIClient.get<{ acknowledgements?: any[] }>(this.endpoint);
      return response.acknowledgements || [];
    } catch (error: any) {
      return [];
    }
  }

  static async create(data: any): Promise<any> {
    const response = await APIClient.post<{ acknowledgement: any }>(this.endpoint, data);
    return response.acknowledgement;
  }
}

export class PolicyAnalyticsService {
  private static endpoint = '/policy-mgmt/analytics';

  static async get(): Promise<any> {
    try {
      const response = await APIClient.get<any>(this.endpoint);
      return response;
    } catch (error: any) {
      return null;
    }
  }
}

export class AlertsService {
  private static endpoint = '/policy-mgmt/alerts';

  static async getAll(): Promise<PolicyAlert[]> {
    try {
      const response = await APIClient.get<{ alerts?: PolicyAlert[] }>(this.endpoint);
      return response.alerts || [];
    } catch (error: any) {
            return [];
    }
  }

  static async create(data: Partial<PolicyAlert>): Promise<PolicyAlert> {
    const response = await APIClient.post<{ alert: PolicyAlert }>(this.endpoint, data);
    return response.alert;
  }

  static async update(id: string, updates: Partial<PolicyAlert>): Promise<PolicyAlert> {
    const response = await APIClient.put<{ alert: PolicyAlert }>(`${this.endpoint}/${id}`, updates);
    return response.alert;
  }

  static async delete(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }
}
