/**
 * Energy & Utilities Module Services
 * Handles all business logic for Smart Grid, Water Conservation, Renewable Assets, Utility Billing
 */

import { APIClient } from '@/lib/api-client';
import {
  SmartMeter, EnergyConsumption, LoadManagement, GridEvent, WaterMeter, WaterUsage,
  LeakDetection, ConservationInitiative, RenewableAsset, EnergyProduction,
  UtilityAccount, UtilityBill, Payment, BillComparison, EnergySettings
} from './types';

// ============================================================================
// 1. SMART GRID SERVICE
// ============================================================================

export class SmartGridService {
  static async getAllMeters(): Promise<SmartMeter[]> {
    return APIClient.get<SmartMeter[]>('/energy/smart-grid/meters');
  }

  static async getMeterById(meterId: string): Promise<SmartMeter | null> {
    return APIClient.get<SmartMeter | null>(`/energy/smart-grid/meters/${meterId}`);
  }

  static async createMeter(meterData: Partial<SmartMeter>): Promise<SmartMeter> {
    return APIClient.post<SmartMeter>('/energy/smart-grid/meters', meterData);
  }

  static async updateMeter(meterId: string, updates: Partial<SmartMeter>): Promise<SmartMeter> {
    return APIClient.put<SmartMeter>(`/energy/smart-grid/meters/${meterId}`, updates);
  }

  static async recordReading(meterId: string, reading: any): Promise<SmartMeter> {
    return APIClient.post<SmartMeter>(`/energy/smart-grid/meters/${meterId}/readings`, reading);
  }

  static async addAlert(meterId: string, alert: any): Promise<SmartMeter> {
    return APIClient.post<SmartMeter>(`/energy/smart-grid/meters/${meterId}/alerts`, alert);
  }

  static async getAllConsumption(): Promise<EnergyConsumption[]> {
    return APIClient.get<EnergyConsumption[]>('/energy/smart-grid/consumption');
  }

  static async recordConsumption(consumptionData: Partial<EnergyConsumption>): Promise<EnergyConsumption> {
    return APIClient.post<EnergyConsumption>('/energy/smart-grid/consumption', consumptionData);
  }

  static async getAllLoadManagement(): Promise<LoadManagement[]> {
    return APIClient.get<LoadManagement[]>('/energy/smart-grid/load-management');
  }

  static async createLoadManagement(loadData: Partial<LoadManagement>): Promise<LoadManagement> {
    return APIClient.post<LoadManagement>('/energy/smart-grid/load-management', loadData);
  }

  static async updateLoadManagement(loadId: string, updates: Partial<LoadManagement>): Promise<LoadManagement> {
    return APIClient.put<LoadManagement>(`/energy/smart-grid/load-management/${loadId}`, updates);
  }

  static async getAllGridEvents(): Promise<GridEvent[]> {
    return APIClient.get<GridEvent[]>('/energy/smart-grid/events');
  }

  static async recordGridEvent(eventData: Partial<GridEvent>): Promise<GridEvent> {
    return APIClient.post<GridEvent>('/energy/smart-grid/events', eventData);
  }
}

// ============================================================================
// 2. WATER CONSERVATION SERVICE
// ============================================================================

export class WaterConservationService {
  static async getAllWaterMeters(): Promise<WaterMeter[]> {
    return APIClient.get<WaterMeter[]>('/energy/water/meters');
  }

  static async getWaterMeterById(meterId: string): Promise<WaterMeter | null> {
    return APIClient.get<WaterMeter | null>(`/energy/water/meters/${meterId}`);
  }

  static async createWaterMeter(meterData: Partial<WaterMeter>): Promise<WaterMeter> {
    return APIClient.post<WaterMeter>('/energy/water/meters', meterData);
  }

  static async updateWaterMeter(meterId: string, updates: Partial<WaterMeter>): Promise<WaterMeter> {
    return APIClient.put<WaterMeter>(`/energy/water/meters/${meterId}`, updates);
  }

  static async getAllWaterUsage(): Promise<WaterUsage[]> {
    return APIClient.get<WaterUsage[]>('/energy/water/usage');
  }

  static async recordWaterUsage(usageData: Partial<WaterUsage>): Promise<WaterUsage> {
    return APIClient.post<WaterUsage>('/energy/water/usage', usageData);
  }

  static async getAllLeakDetections(): Promise<LeakDetection[]> {
    return APIClient.get<LeakDetection[]>('/energy/water/leaks');
  }

  static async recordLeakDetection(leakData: Partial<LeakDetection>): Promise<LeakDetection> {
    return APIClient.post<LeakDetection>('/energy/water/leaks', leakData);
  }

  static async updateLeakStatus(leakId: string, updates: Partial<LeakDetection>): Promise<LeakDetection> {
    return APIClient.put<LeakDetection>(`/energy/water/leaks/${leakId}`, updates);
  }

  static async getAllInitiatives(): Promise<ConservationInitiative[]> {
    return APIClient.get<ConservationInitiative[]>('/energy/water/initiatives');
  }

  static async createInitiative(initiativeData: Partial<ConservationInitiative>): Promise<ConservationInitiative> {
    return APIClient.post<ConservationInitiative>('/energy/water/initiatives', initiativeData);
  }

  static async updateInitiative(initiativeId: string, updates: Partial<ConservationInitiative>): Promise<ConservationInitiative> {
    return APIClient.put<ConservationInitiative>(`/energy/water/initiatives/${initiativeId}`, updates);
  }
}

// ============================================================================
// 3. RENEWABLE ASSETS SERVICE
// ============================================================================

export class RenewableAssetsService {
  static async getAllAssets(): Promise<RenewableAsset[]> {
    return APIClient.get<RenewableAsset[]>('/energy/renewable-assets');
  }

  static async getAssetById(assetId: string): Promise<RenewableAsset | null> {
    return APIClient.get<RenewableAsset | null>(`/energy/renewable-assets/${assetId}`);
  }

  static async createAsset(assetData: Partial<RenewableAsset>): Promise<RenewableAsset> {
    return APIClient.post<RenewableAsset>('/energy/renewable-assets', assetData);
  }

  static async updateAsset(assetId: string, updates: Partial<RenewableAsset>): Promise<RenewableAsset> {
    return APIClient.put<RenewableAsset>(`/energy/renewable-assets/${assetId}`, updates);
  }

  static async recordMaintenance(assetId: string, maintenance: any): Promise<RenewableAsset> {
    return APIClient.post<RenewableAsset>(`/energy/renewable-assets/${assetId}/maintenance`, maintenance);
  }

  static async getAllProduction(): Promise<EnergyProduction[]> {
    return APIClient.get<EnergyProduction[]>('/energy/renewable-assets/production');
  }

  static async recordProduction(productionData: Partial<EnergyProduction>): Promise<EnergyProduction> {
    return APIClient.post<EnergyProduction>('/energy/renewable-assets/production', productionData);
  }
}

// ============================================================================
// 4. UTILITY BILLING SERVICE
// ============================================================================

export class UtilityBillingService {
  static async getAllAccounts(): Promise<UtilityAccount[]> {
    return APIClient.get<UtilityAccount[]>('/energy/utility-billing/accounts');
  }

  static async getAccountById(accountId: string): Promise<UtilityAccount | null> {
    return APIClient.get<UtilityAccount | null>(`/energy/utility-billing/accounts/${accountId}`);
  }

  static async createAccount(accountData: Partial<UtilityAccount>): Promise<UtilityAccount> {
    return APIClient.post<UtilityAccount>('/energy/utility-billing/accounts', accountData);
  }

  static async updateAccount(accountId: string, updates: Partial<UtilityAccount>): Promise<UtilityAccount> {
    return APIClient.put<UtilityAccount>(`/energy/utility-billing/accounts/${accountId}`, updates);
  }

  static async getAllBills(): Promise<UtilityBill[]> {
    return APIClient.get<UtilityBill[]>('/energy/utility-billing/bills');
  }

  static async getBillById(billId: string): Promise<UtilityBill | null> {
    return APIClient.get<UtilityBill | null>(`/energy/utility-billing/bills/${billId}`);
  }

  static async createBill(billData: Partial<UtilityBill>): Promise<UtilityBill> {
    return APIClient.post<UtilityBill>('/energy/utility-billing/bills', billData);
  }

  static async updateBill(billId: string, updates: Partial<UtilityBill>): Promise<UtilityBill> {
    return APIClient.put<UtilityBill>(`/energy/utility-billing/bills/${billId}`, updates);
  }

  static async getAllPayments(): Promise<Payment[]> {
    return APIClient.get<Payment[]>('/energy/utility-billing/payments');
  }

  static async recordPayment(paymentData: Partial<Payment>): Promise<Payment> {
    return APIClient.post<Payment>('/energy/utility-billing/payments', paymentData);
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class EnergySettingsService {
  static async getSettings(): Promise<EnergySettings> {
    return APIClient.get<EnergySettings>('/energy/settings');
  }

  static async updateSettings(updates: Partial<EnergySettings>): Promise<EnergySettings> {
    return APIClient.put<EnergySettings>('/energy/settings', updates);
  }
}
