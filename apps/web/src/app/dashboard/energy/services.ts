/**
 * Energy & Utilities Module Services
 * Handles all business logic for Smart Grid, Water Conservation, Renewable Assets, Utility Billing
 */

import {
  SmartMeter, EnergyConsumption, LoadManagement, GridEvent, WaterMeter, WaterUsage,
  LeakDetection, ConservationInitiative, RenewableAsset, EnergyProduction,
  UtilityAccount, UtilityBill, Payment, BillComparison, EnergySettings
} from './types';

const STORAGE_KEYS = {
  SMART_METERS: 'energy_smart_meters',
  ENERGY_CONSUMPTION: 'energy_consumption',
  LOAD_MANAGEMENT: 'energy_load_management',
  GRID_EVENTS: 'energy_grid_events',
  WATER_METERS: 'energy_water_meters',
  WATER_USAGE: 'energy_water_usage',
  LEAK_DETECTION: 'energy_leak_detection',
  CONSERVATION_INITIATIVES: 'energy_conservation_initiatives',
  RENEWABLE_ASSETS: 'energy_renewable_assets',
  ENERGY_PRODUCTION: 'energy_production',
  UTILITY_ACCOUNTS: 'energy_utility_accounts',
  UTILITY_BILLS: 'energy_utility_bills',
  PAYMENTS: 'energy_payments',
  SETTINGS: 'energy_settings',
} as const;

// ============================================================================
// 1. SMART GRID SERVICE
// ============================================================================

export class SmartGridService {
  static async getAllMeters(): Promise<SmartMeter[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SMART_METERS);
    return data ? JSON.parse(data) : [];
  }

  static async getMeterById(meterId: string): Promise<SmartMeter | null> {
    const meters = await this.getAllMeters();
    return meters.find(m => m.meterId === meterId) || null;
  }

  static async createMeter(meterData: Partial<SmartMeter>): Promise<SmartMeter> {
    const meters = await this.getAllMeters();
    const newMeter: SmartMeter = {
      meterId: `meter-${Date.now()}`,
      meterNumber: meterData.meterNumber || `MTR-${Date.now()}`,
      meterType: meterData.meterType || 'electric',
      location: meterData.location || { facilityId: '', facilityName: '' },
      installationDate: meterData.installationDate || new Date().toISOString(),
      manufacturer: meterData.manufacturer || '',
      model: meterData.model || '',
      firmwareVersion: meterData.firmwareVersion || '1.0.0',
      communicationProtocol: meterData.communicationProtocol || 'zigbee',
      readingInterval: meterData.readingInterval || 15,
      lastReading: meterData.lastReading || { readingId: '', timestamp: '', value: 0, unit: 'kwh', quality: 'good', source: 'automated' },
      status: meterData.status || 'active',
      alerts: meterData.alerts || [],
      createdAt: new Date().toISOString(),
      ...meterData,
    };
    meters.push(newMeter);
    localStorage.setItem(STORAGE_KEYS.SMART_METERS, JSON.stringify(meters));
    return newMeter;
  }

  static async updateMeter(meterId: string, updates: Partial<SmartMeter>): Promise<SmartMeter> {
    const meters = await this.getAllMeters();
    const index = meters.findIndex(m => m.meterId === meterId);
    if (index === -1) throw new Error('Meter not found');

    meters[index] = { ...meters[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.SMART_METERS, JSON.stringify(meters));
    return meters[index];
  }

  static async recordReading(meterId: string, reading: any): Promise<SmartMeter> {
    const newReading = {
      readingId: `reading-${Date.now()}`,
      timestamp: new Date().toISOString(),
      quality: 'good',
      source: 'automated',
      ...reading,
    };

    return this.updateMeter(meterId, {
      lastReading: newReading,
    });
  }

  static async addAlert(meterId: string, alert: any): Promise<SmartMeter> {
    const meter = await this.getMeterById(meterId);
    if (!meter) throw new Error('Meter not found');

    const newAlert = {
      alertId: `alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      resolved: false,
      ...alert,
    };

    return this.updateMeter(meterId, {
      alerts: [...meter.alerts, newAlert],
    });
  }

  static async getAllConsumption(): Promise<EnergyConsumption[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ENERGY_CONSUMPTION);
    return data ? JSON.parse(data) : [];
  }

  static async recordConsumption(consumptionData: Partial<EnergyConsumption>): Promise<EnergyConsumption> {
    const consumption = await this.getAllConsumption();
    const newConsumption: EnergyConsumption = {
      consumptionId: `consumption-${Date.now()}`,
      meterId: consumptionData.meterId || '',
      facilityId: consumptionData.facilityId || '',
      facilityName: consumptionData.facilityName || '',
      period: consumptionData.period || { startDate: '', endDate: '', periodType: 'monthly' },
      consumption: consumptionData.consumption || 0,
      unit: consumptionData.unit || 'kwh',
      cost: consumptionData.cost || 0,
      breakdown: consumptionData.breakdown || { onPeak: 0, offPeak: 0 },
      comparison: consumptionData.comparison || { previousPeriod: 0, percentageChange: 0, sameLastYear: 0, yearOverYearChange: 0 },
      ...consumptionData,
    };
    consumption.push(newConsumption);
    localStorage.setItem(STORAGE_KEYS.ENERGY_CONSUMPTION, JSON.stringify(consumption));
    return newConsumption;
  }

  static async getAllLoadManagement(): Promise<LoadManagement[]> {
    const data = localStorage.getItem(STORAGE_KEYS.LOAD_MANAGEMENT);
    return data ? JSON.parse(data) : [];
  }

  static async createLoadManagement(loadData: Partial<LoadManagement>): Promise<LoadManagement> {
    const loads = await this.getAllLoadManagement();
    const newLoad: LoadManagement = {
      loadId: `load-${Date.now()}`,
      facilityId: loadData.facilityId || '',
      managementType: loadData.managementType || 'peak_shaving',
      startTime: loadData.startTime || '',
      endTime: loadData.endTime || '',
      targetReduction: loadData.targetReduction || 0,
      affectedEquipment: loadData.affectedEquipment || [],
      status: loadData.status || 'scheduled',
      createdBy: loadData.createdBy || 'system',
      createdAt: new Date().toISOString(),
      ...loadData,
    };
    loads.push(newLoad);
    localStorage.setItem(STORAGE_KEYS.LOAD_MANAGEMENT, JSON.stringify(loads));
    return newLoad;
  }

  static async updateLoadManagement(loadId: string, updates: Partial<LoadManagement>): Promise<LoadManagement> {
    const loads = await this.getAllLoadManagement();
    const index = loads.findIndex(l => l.loadId === loadId);
    if (index === -1) throw new Error('Load management not found');

    loads[index] = { ...loads[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.LOAD_MANAGEMENT, JSON.stringify(loads));
    return loads[index];
  }

  static async getAllGridEvents(): Promise<GridEvent[]> {
    const data = localStorage.getItem(STORAGE_KEYS.GRID_EVENTS);
    return data ? JSON.parse(data) : [];
  }

  static async recordGridEvent(eventData: Partial<GridEvent>): Promise<GridEvent> {
    const events = await this.getAllGridEvents();
    const newEvent: GridEvent = {
      eventId: `event-${Date.now()}`,
      eventType: eventData.eventType || 'outage',
      startTime: eventData.startTime || new Date().toISOString(),
      affectedMeters: eventData.affectedMeters || [],
      affectedFacilities: eventData.affectedFacilities || [],
      severity: eventData.severity || 'minor',
      impact: eventData.impact || { facilitiesAffected: 0, employeesImpacted: 0, estimatedCost: 0 },
      status: eventData.status || 'active',
      ...eventData,
    };
    events.push(newEvent);
    localStorage.setItem(STORAGE_KEYS.GRID_EVENTS, JSON.stringify(events));
    return newEvent;
  }
}

// ============================================================================
// 2. WATER CONSERVATION SERVICE
// ============================================================================

export class WaterConservationService {
  static async getAllWaterMeters(): Promise<WaterMeter[]> {
    const data = localStorage.getItem(STORAGE_KEYS.WATER_METERS);
    return data ? JSON.parse(data) : [];
  }

  static async getWaterMeterById(meterId: string): Promise<WaterMeter | null> {
    const meters = await this.getAllWaterMeters();
    return meters.find(m => m.meterId === meterId) || null;
  }

  static async createWaterMeter(meterData: Partial<WaterMeter>): Promise<WaterMeter> {
    const meters = await this.getAllWaterMeters();
    const newMeter: WaterMeter = {
      meterId: `water-meter-${Date.now()}`,
      meterNumber: meterData.meterNumber || `WTR-${Date.now()}`,
      meterType: meterData.meterType || 'potable',
      location: meterData.location || { facilityId: '', facilityName: '' },
      flowRate: meterData.flowRate || 0,
      totalVolume: meterData.totalVolume || 0,
      pressure: meterData.pressure || 0,
      leakDetection: meterData.leakDetection || false,
      lastReading: meterData.lastReading || { readingId: '', timestamp: '', value: 0, unit: 'cubic_meters', quality: 'good', source: 'automated' },
      status: meterData.status || 'active',
      installationDate: meterData.installationDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      ...meterData,
    };
    meters.push(newMeter);
    localStorage.setItem(STORAGE_KEYS.WATER_METERS, JSON.stringify(meters));
    return newMeter;
  }

  static async updateWaterMeter(meterId: string, updates: Partial<WaterMeter>): Promise<WaterMeter> {
    const meters = await this.getAllWaterMeters();
    const index = meters.findIndex(m => m.meterId === meterId);
    if (index === -1) throw new Error('Water meter not found');

    meters[index] = { ...meters[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.WATER_METERS, JSON.stringify(meters));
    return meters[index];
  }

  static async getAllWaterUsage(): Promise<WaterUsage[]> {
    const data = localStorage.getItem(STORAGE_KEYS.WATER_USAGE);
    return data ? JSON.parse(data) : [];
  }

  static async recordWaterUsage(usageData: Partial<WaterUsage>): Promise<WaterUsage> {
    const usage = await this.getAllWaterUsage();
    const newUsage: WaterUsage = {
      usageId: `usage-${Date.now()}`,
      meterId: usageData.meterId || '',
      facilityId: usageData.facilityId || '',
      period: usageData.period || { startDate: '', endDate: '', periodType: 'monthly' },
      volume: usageData.volume || 0,
      cost: usageData.cost || 0,
      breakdown: usageData.breakdown || { domestic: 0, irrigation: 0, industrial: 0, cooling: 0, other: 0 },
      comparison: usageData.comparison || { previousMonth: 0, percentageChange: 0, yearToDate: 0, budget: 0, varianceFromBudget: 0 },
      efficiency: usageData.efficiency || { waterIntensity: 0, recyclingRate: 0, reusedWater: 0, rainwaterHarvested: 0, wasteWater: 0, efficiency: 0 },
      alerts: usageData.alerts || [],
      ...usageData,
    };
    usage.push(newUsage);
    localStorage.setItem(STORAGE_KEYS.WATER_USAGE, JSON.stringify(usage));
    return newUsage;
  }

  static async getAllLeakDetections(): Promise<LeakDetection[]> {
    const data = localStorage.getItem(STORAGE_KEYS.LEAK_DETECTION);
    return data ? JSON.parse(data) : [];
  }

  static async recordLeakDetection(leakData: Partial<LeakDetection>): Promise<LeakDetection> {
    const leaks = await this.getAllLeakDetections();
    const newLeak: LeakDetection = {
      leakId: `leak-${Date.now()}`,
      detectionMethod: leakData.detectionMethod || 'flow_analysis',
      location: leakData.location || '',
      detectedDate: new Date().toISOString(),
      severity: leakData.severity || 'minor',
      estimatedFlowRate: leakData.estimatedFlowRate || 0,
      estimatedDailyLoss: leakData.estimatedDailyLoss || 0,
      estimatedCost: leakData.estimatedCost || 0,
      repairStatus: 'pending',
      ...leakData,
    };
    leaks.push(newLeak);
    localStorage.setItem(STORAGE_KEYS.LEAK_DETECTION, JSON.stringify(leaks));
    return newLeak;
  }

  static async updateLeakStatus(leakId: string, updates: Partial<LeakDetection>): Promise<LeakDetection> {
    const leaks = await this.getAllLeakDetections();
    const index = leaks.findIndex(l => l.leakId === leakId);
    if (index === -1) throw new Error('Leak not found');

    leaks[index] = { ...leaks[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.LEAK_DETECTION, JSON.stringify(leaks));
    return leaks[index];
  }

  static async getAllInitiatives(): Promise<ConservationInitiative[]> {
    const data = localStorage.getItem(STORAGE_KEYS.CONSERVATION_INITIATIVES);
    return data ? JSON.parse(data) : [];
  }

  static async createInitiative(initiativeData: Partial<ConservationInitiative>): Promise<ConservationInitiative> {
    const initiatives = await this.getAllInitiatives();
    const newInitiative: ConservationInitiative = {
      initiativeId: `initiative-${Date.now()}`,
      initiativeName: initiativeData.initiativeName || '',
      type: initiativeData.type || 'fixture_upgrade',
      description: initiativeData.description || '',
      startDate: initiativeData.startDate || new Date().toISOString(),
      status: initiativeData.status || 'planning',
      targetReduction: initiativeData.targetReduction || 0,
      investment: initiativeData.investment || 0,
      savings: initiativeData.savings || 0,
      metrics: initiativeData.metrics || { baselineUsage: 0, currentUsage: 0, reductionAchieved: 0, percentageReduction: 0, costSavings: 0 },
      ...initiativeData,
    };
    initiatives.push(newInitiative);
    localStorage.setItem(STORAGE_KEYS.CONSERVATION_INITIATIVES, JSON.stringify(initiatives));
    return newInitiative;
  }

  static async updateInitiative(initiativeId: string, updates: Partial<ConservationInitiative>): Promise<ConservationInitiative> {
    const initiatives = await this.getAllInitiatives();
    const index = initiatives.findIndex(i => i.initiativeId === initiativeId);
    if (index === -1) throw new Error('Initiative not found');

    initiatives[index] = { ...initiatives[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.CONSERVATION_INITIATIVES, JSON.stringify(initiatives));
    return initiatives[index];
  }
}

// ============================================================================
// 3. RENEWABLE ASSETS SERVICE
// ============================================================================

export class RenewableAssetsService {
  static async getAllAssets(): Promise<RenewableAsset[]> {
    const data = localStorage.getItem(STORAGE_KEYS.RENEWABLE_ASSETS);
    return data ? JSON.parse(data) : [];
  }

  static async getAssetById(assetId: string): Promise<RenewableAsset | null> {
    const assets = await this.getAllAssets();
    return assets.find(a => a.assetId === assetId) || null;
  }

  static async createAsset(assetData: Partial<RenewableAsset>): Promise<RenewableAsset> {
    const assets = await this.getAllAssets();
    const newAsset: RenewableAsset = {
      assetId: `asset-${Date.now()}`,
      assetName: assetData.assetName || '',
      assetType: assetData.assetType || 'solar_pv',
      location: assetData.location || { facilityId: '', facilityName: '', site: '' },
      capacity: assetData.capacity || { ratedCapacity: 0, unit: 'kw' },
      installation: assetData.installation || { installationDate: '', installer: '', manufacturer: '', model: '', serialNumber: '', warrantyExpiry: '', expectedLifespan: 25 },
      performance: assetData.performance || { currentOutput: 0, dailyProduction: 0, monthlyProduction: 0, yearlyProduction: 0, lifetimeProduction: 0, capacity: 0, efficiency: 0, availability: 0, performanceRatio: 0, co2Avoided: 0, lastUpdated: '' },
      maintenance: assetData.maintenance || { nextMaintenance: '', maintenanceInterval: 180, maintenanceType: 'preventive', maintenanceHistory: [], warrantyStatus: 'active' },
      financials: assetData.financials || { capitalCost: 0, installationCost: 0, totalInvestment: 0, incentivesReceived: [], totalIncentives: 0, operatingCosts: { annual: 0, maintenance: 0, insurance: 0, monitoring: 0, other: 0 }, revenue: { energySavings: 0, energySold: 0, revenueFromSales: 0, incentivePayments: 0, totalAnnualRevenue: 0 }, roi: { paybackPeriod: 0, npv: 0, irr: 0, lcoe: 0, savingsToDate: 0 } },
      status: assetData.status || 'operational',
      certifications: assetData.certifications || [],
      createdAt: new Date().toISOString(),
      ...assetData,
    };
    assets.push(newAsset);
    localStorage.setItem(STORAGE_KEYS.RENEWABLE_ASSETS, JSON.stringify(assets));
    return newAsset;
  }

  static async updateAsset(assetId: string, updates: Partial<RenewableAsset>): Promise<RenewableAsset> {
    const assets = await this.getAllAssets();
    const index = assets.findIndex(a => a.assetId === assetId);
    if (index === -1) throw new Error('Asset not found');

    assets[index] = { ...assets[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.RENEWABLE_ASSETS, JSON.stringify(assets));
    return assets[index];
  }

  static async recordMaintenance(assetId: string, maintenance: any): Promise<RenewableAsset> {
    const asset = await this.getAssetById(assetId);
    if (!asset) throw new Error('Asset not found');

    const newMaintenance = {
      recordId: `maint-${Date.now()}`,
      maintenanceDate: new Date().toISOString(),
      ...maintenance,
    };

    return this.updateAsset(assetId, {
      maintenance: {
        ...asset.maintenance,
        maintenanceHistory: [...asset.maintenance.maintenanceHistory, newMaintenance],
        lastMaintenance: new Date().toISOString(),
      },
    });
  }

  static async getAllProduction(): Promise<EnergyProduction[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ENERGY_PRODUCTION);
    return data ? JSON.parse(data) : [];
  }

  static async recordProduction(productionData: Partial<EnergyProduction>): Promise<EnergyProduction> {
    const production = await this.getAllProduction();
    const newProduction: EnergyProduction = {
      productionId: `prod-${Date.now()}`,
      assetId: productionData.assetId || '',
      timestamp: new Date().toISOString(),
      period: productionData.period || 'daily',
      output: productionData.output || 0,
      peakOutput: productionData.peakOutput || 0,
      averageOutput: productionData.averageOutput || 0,
      capacity: productionData.capacity || 0,
      efficiency: productionData.efficiency || 0,
      ...productionData,
    };
    production.push(newProduction);
    localStorage.setItem(STORAGE_KEYS.ENERGY_PRODUCTION, JSON.stringify(production));
    return newProduction;
  }
}

// ============================================================================
// 4. UTILITY BILLING SERVICE
// ============================================================================

export class UtilityBillingService {
  static async getAllAccounts(): Promise<UtilityAccount[]> {
    const data = localStorage.getItem(STORAGE_KEYS.UTILITY_ACCOUNTS);
    return data ? JSON.parse(data) : [];
  }

  static async getAccountById(accountId: string): Promise<UtilityAccount | null> {
    const accounts = await this.getAllAccounts();
    return accounts.find(a => a.accountId === accountId) || null;
  }

  static async createAccount(accountData: Partial<UtilityAccount>): Promise<UtilityAccount> {
    const accounts = await this.getAllAccounts();
    const newAccount: UtilityAccount = {
      accountId: `account-${Date.now()}`,
      accountNumber: accountData.accountNumber || `ACC-${Date.now()}`,
      accountName: accountData.accountName || '',
      utilityProvider: accountData.utilityProvider || { providerId: '', providerName: '', utilityType: '', contactInfo: { phone: '', email: '', customerService: '' }, serviceArea: [] },
      utilityType: accountData.utilityType || 'electric',
      facilityId: accountData.facilityId || '',
      facilityName: accountData.facilityName || '',
      serviceAddress: accountData.serviceAddress || '',
      meterNumbers: accountData.meterNumbers || [],
      rateSchedule: accountData.rateSchedule || { scheduleId: '', scheduleName: '', effectiveDate: '', rateType: 'flat', rates: [], taxes: [], surcharges: [] },
      billingCycle: accountData.billingCycle || { cycleName: '', billingFrequency: 'monthly', billingDay: 1, dueDate: 15, lateFeePercentage: 1.5, lateFeeGracePeriod: 5 },
      paymentMethod: accountData.paymentMethod || { methodType: 'manual', autoPayEnabled: false },
      status: accountData.status || 'active',
      balance: 0,
      createdAt: new Date().toISOString(),
      ...accountData,
    };
    accounts.push(newAccount);
    localStorage.setItem(STORAGE_KEYS.UTILITY_ACCOUNTS, JSON.stringify(accounts));
    return newAccount;
  }

  static async updateAccount(accountId: string, updates: Partial<UtilityAccount>): Promise<UtilityAccount> {
    const accounts = await this.getAllAccounts();
    const index = accounts.findIndex(a => a.accountId === accountId);
    if (index === -1) throw new Error('Account not found');

    accounts[index] = { ...accounts[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.UTILITY_ACCOUNTS, JSON.stringify(accounts));
    return accounts[index];
  }

  static async getAllBills(): Promise<UtilityBill[]> {
    const data = localStorage.getItem(STORAGE_KEYS.UTILITY_BILLS);
    return data ? JSON.parse(data) : [];
  }

  static async getBillById(billId: string): Promise<UtilityBill | null> {
    const bills = await this.getAllBills();
    return bills.find(b => b.billId === billId) || null;
  }

  static async createBill(billData: Partial<UtilityBill>): Promise<UtilityBill> {
    const bills = await this.getAllBills();
    const newBill: UtilityBill = {
      billId: `bill-${Date.now()}`,
      billNumber: billData.billNumber || `BILL-${Date.now()}`,
      accountId: billData.accountId || '',
      accountNumber: billData.accountNumber || '',
      billingPeriod: billData.billingPeriod || { startDate: '', endDate: '', days: 30 },
      issueDate: billData.issueDate || new Date().toISOString(),
      dueDate: billData.dueDate || '',
      utilityType: billData.utilityType || '',
      consumption: billData.consumption || { currentReading: 0, previousReading: 0, consumption: 0, unit: '' },
      charges: billData.charges || { energyCharges: 0, customerCharge: 0, taxes: [], surcharges: [], adjustments: [] },
      total: billData.total || { subtotal: 0, totalTaxes: 0, totalSurcharges: 0, totalAdjustments: 0, previousBalance: 0, paymentsReceived: 0, currentCharges: 0, totalDue: 0 },
      payment: billData.payment || {},
      status: billData.status || 'pending',
      documents: billData.documents || [],
      alerts: billData.alerts || [],
      createdAt: new Date().toISOString(),
      ...billData,
    };
    bills.push(newBill);
    localStorage.setItem(STORAGE_KEYS.UTILITY_BILLS, JSON.stringify(bills));
    return newBill;
  }

  static async updateBill(billId: string, updates: Partial<UtilityBill>): Promise<UtilityBill> {
    const bills = await this.getAllBills();
    const index = bills.findIndex(b => b.billId === billId);
    if (index === -1) throw new Error('Bill not found');

    bills[index] = { ...bills[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.UTILITY_BILLS, JSON.stringify(bills));
    return bills[index];
  }

  static async getAllPayments(): Promise<Payment[]> {
    const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return data ? JSON.parse(data) : [];
  }

  static async recordPayment(paymentData: Partial<Payment>): Promise<Payment> {
    const payments = await this.getAllPayments();
    const newPayment: Payment = {
      paymentId: `payment-${Date.now()}`,
      billId: paymentData.billId || '',
      accountId: paymentData.accountId || '',
      paymentDate: new Date().toISOString(),
      amount: paymentData.amount || 0,
      paymentMethod: paymentData.paymentMethod || 'online',
      confirmationNumber: `CONF-${Date.now()}`,
      status: 'processed',
      processedDate: new Date().toISOString(),
      ...paymentData,
    };
    payments.push(newPayment);
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

    // Update bill status
    if (newPayment.billId) {
      const bill = await this.getBillById(newPayment.billId);
      if (bill) {
        await this.updateBill(newPayment.billId, {
          status: 'paid',
          payment: {
            lastPaymentDate: newPayment.paymentDate,
            lastPaymentAmount: newPayment.amount,
            paymentMethod: newPayment.paymentMethod,
            confirmationNumber: newPayment.confirmationNumber,
          },
        });
      }
    }

    return newPayment;
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class EnergySettingsService {
  static async getSettings(): Promise<EnergySettings> {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : this.getDefaultSettings();
  }

  static getDefaultSettings(): EnergySettings {
    return {
      smartGridSettings: {
        readingInterval: 15,
        alertThresholds: {
          highConsumption: 20,
          communicationTimeout: 30,
          voltageVariance: 5,
        },
        demandResponseEnabled: true,
        peakShavingEnabled: true,
      },
      waterSettings: {
        leakDetectionSensitivity: 'medium',
        alertThreshold: 100,
        conservationGoal: 20,
        recyclingTarget: 30,
      },
      renewableSettings: {
        targetCapacity: 500,
        targetProduction: 750000,
        maintenanceInterval: 180,
        performanceAlertThreshold: 10,
      },
      billingSettings: {
        autoPayEnabled: false,
        paymentReminderDays: [7, 3, 1],
        budgetAlertEnabled: true,
        billComparisonEnabled: true,
        paperlessBilling: true,
      },
    };
  }

  static async updateSettings(updates: Partial<EnergySettings>): Promise<EnergySettings> {
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
    return updatedSettings;
  }
}
