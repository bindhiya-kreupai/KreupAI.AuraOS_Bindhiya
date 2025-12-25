import { APIClient } from '@/lib/api-client';
import { FIFOWorker, CampFacility, HazardPayRule, HazardPayment, MiningSettings, MiningAlert } from './types';

export class FIFOLogisticsService {
  private static endpoint = '/mining/fifo-workers';

  static async getAllWorkers(): Promise<FIFOWorker[]> {
    return APIClient.get<FIFOWorker[]>(this.endpoint);
  }

  static async createWorker(workerData: Partial<FIFOWorker>): Promise<FIFOWorker> {
    return APIClient.post<FIFOWorker>(this.endpoint, workerData);
  }

  static async updateWorker(workerId: string, updates: Partial<FIFOWorker>): Promise<FIFOWorker> {
    return APIClient.put<FIFOWorker>(`${this.endpoint}/${workerId}`, updates);
  }
}

export class CampManagementService {
  private static endpoint = '/mining/camp-facilities';

  static async getAllFacilities(): Promise<CampFacility[]> {
    return APIClient.get<CampFacility[]>(this.endpoint);
  }

  static async createFacility(facilityData: Partial<CampFacility>): Promise<CampFacility> {
    return APIClient.post<CampFacility>(this.endpoint, facilityData);
  }

  static async updateFacility(facilityId: string, updates: Partial<CampFacility>): Promise<CampFacility> {
    return APIClient.put<CampFacility>(`${this.endpoint}/${facilityId}`, updates);
  }
}

export class HazardPayService {
  private static rulesEndpoint = '/mining/hazard-pay/rules';
  private static paymentsEndpoint = '/mining/hazard-pay/payments';

  static async getAllRules(): Promise<HazardPayRule[]> {
    return APIClient.get<HazardPayRule[]>(this.rulesEndpoint);
  }

  static async createRule(ruleData: Partial<HazardPayRule>): Promise<HazardPayRule> {
    return APIClient.post<HazardPayRule>(this.rulesEndpoint, ruleData);
  }

  static async getAllPayments(): Promise<HazardPayment[]> {
    return APIClient.get<HazardPayment[]>(this.paymentsEndpoint);
  }

  static async createPayment(paymentData: Partial<HazardPayment>): Promise<HazardPayment> {
    return APIClient.post<HazardPayment>(this.paymentsEndpoint, paymentData);
  }

  static async updatePayment(paymentId: string, updates: Partial<HazardPayment>): Promise<HazardPayment> {
    return APIClient.put<HazardPayment>(`${this.paymentsEndpoint}/${paymentId}`, updates);
  }
}

export class MiningSettingsService {
  private static endpoint = '/mining/settings';

  static async getSettings(): Promise<MiningSettings | null> {
    return APIClient.get<MiningSettings>(this.endpoint);
  }

  static async updateSettings(settings: Partial<MiningSettings>): Promise<MiningSettings> {
    return APIClient.put<MiningSettings>(this.endpoint, settings);
  }
}

export class AlertsService {
  private static endpoint = '/mining/alerts';

  static async getAllAlerts(): Promise<MiningAlert[]> {
    return APIClient.get<MiningAlert[]>(this.endpoint);
  }

  static async createAlert(alertData: Partial<MiningAlert>): Promise<MiningAlert> {
    return APIClient.post<MiningAlert>(this.endpoint, alertData);
  }
}
