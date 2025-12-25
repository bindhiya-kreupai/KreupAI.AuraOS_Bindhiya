import { APIClient } from '@/lib/api-client';
import type { Store, CommissionPlan, SalesCommission, SeasonalHire, RetailSettings, RetailAlert } from './types';

export class StoreOperationsService {
  private static endpoint = '/industry-retail/stores';

  static async getAllStores(): Promise<Store[]> {
    try {
      const response = await APIClient.get<{ stores?: Store[] }>(this.endpoint);
      return response.stores || [];
    } catch {
            return [];
    }
  }

  static async createStore(data: Partial<Store>): Promise<Store> {
    const response = await APIClient.post<{ store: Store }>(this.endpoint, data);
    return response.store;
  }

  static async updateStore(storeId: string, updates: Partial<Store>): Promise<Store> {
    const response = await APIClient.put<{ store: Store }>(`${this.endpoint}/${storeId}`, updates);
    return response.store;
  }
}

export class CommissionService {
  private static endpoint = '/industry-retail/commissions';

  static async getAllPlans(): Promise<CommissionPlan[]> {
    try {
      const response = await APIClient.get<{ plans?: CommissionPlan[] }>(`${this.endpoint}/plans`);
      return response.plans || [];
    } catch {
            return [];
    }
  }

  static async createPlan(data: Partial<CommissionPlan>): Promise<CommissionPlan> {
    const response = await APIClient.post<{ plan: CommissionPlan }>(`${this.endpoint}/plans`, data);
    return response.plan;
  }

  static async getAllCommissions(): Promise<SalesCommission[]> {
    try {
      const response = await APIClient.get<{ commissions?: SalesCommission[] }>(this.endpoint);
      return response.commissions || [];
    } catch {
            return [];
    }
  }

  static async createCommission(data: Partial<SalesCommission>): Promise<SalesCommission> {
    const response = await APIClient.post<{ commission: SalesCommission }>(this.endpoint, data);
    return response.commission;
  }

  static async updateCommission(commissionId: string, updates: Partial<SalesCommission>): Promise<SalesCommission> {
    const response = await APIClient.put<{ commission: SalesCommission }>(`${this.endpoint}/${commissionId}`, updates);
    return response.commission;
  }
}

export class SeasonalHiringService {
  private static endpoint = '/industry-retail/seasonal-hiring';

  static async getAllHires(): Promise<SeasonalHire[]> {
    try {
      const response = await APIClient.get<{ hires?: SeasonalHire[] }>(this.endpoint);
      return response.hires || [];
    } catch {
            return [];
    }
  }

  static async createHire(data: Partial<SeasonalHire>): Promise<SeasonalHire> {
    const response = await APIClient.post<{ hire: SeasonalHire }>(this.endpoint, data);
    return response.hire;
  }

  static async updateHire(hireId: string, updates: Partial<SeasonalHire>): Promise<SeasonalHire> {
    const response = await APIClient.put<{ hire: SeasonalHire }>(`${this.endpoint}/${hireId}`, updates);
    return response.hire;
  }
}

export class RetailSettingsService {
  private static endpoint = '/industry-retail/settings';

  static async getSettings(): Promise<RetailSettings | null> {
    try {
      const response = await APIClient.get<{ settings?: RetailSettings }>(this.endpoint);
      return response.settings || null;
    } catch {
            return null;
    }
  }

  static async updateSettings(settings: Partial<RetailSettings>): Promise<RetailSettings> {
    const response = await APIClient.put<{ settings: RetailSettings }>(this.endpoint, settings);
    return response.settings;
  }
}

export class AlertsService {
  private static endpoint = '/industry-retail/alerts';

  static async getAllAlerts(): Promise<RetailAlert[]> {
    try {
      const response = await APIClient.get<{ alerts?: RetailAlert[] }>(this.endpoint);
      return response.alerts || [];
    } catch {
            return [];
    }
  }

  static async createAlert(data: Partial<RetailAlert>): Promise<RetailAlert> {
    const response = await APIClient.post<{ alert: RetailAlert }>(this.endpoint, data);
    return response.alert;
  }
}
