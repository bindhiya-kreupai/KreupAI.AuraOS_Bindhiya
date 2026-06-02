'use client';

import { useState, useEffect } from 'react';
import {
  SmartMeter, EnergyConsumption, LoadManagement, GridEvent, WaterMeter, WaterUsage,
  LeakDetection, ConservationInitiative, RenewableAsset, EnergyProduction,
  UtilityAccount, UtilityBill, Payment, EnergySettings, Toast
} from '../types';
import {
  SmartGridService, WaterConservationService, RenewableAssetsService,
  UtilityBillingService, EnergySettingsService
} from '../services';
import {
  sampleSmartMeters, sampleEnergyConsumption, sampleLoadManagement,
  sampleWaterMeters, sampleWaterUsage, sampleLeakDetections,
  sampleConservationInitiatives, sampleRenewableAssets, sampleEnergyProduction,
  sampleUtilityAccounts, sampleUtilityBills, sampleEnergySettings
} from '../data';

export const useEnergy = () => {
  // State
  const [smartMeters, setSmartMeters] = useState<SmartMeter[]>([]);
  const [energyConsumption, setEnergyConsumption] = useState<EnergyConsumption[]>([]);
  const [loadManagement, setLoadManagement] = useState<LoadManagement[]>([]);
  const [gridEvents, setGridEvents] = useState<GridEvent[]>([]);
  const [waterMeters, setWaterMeters] = useState<WaterMeter[]>([]);
  const [waterUsage, setWaterUsage] = useState<WaterUsage[]>([]);
  const [leakDetections, setLeakDetections] = useState<LeakDetection[]>([]);
  const [conservationInitiatives, setConservationInitiatives] = useState<ConservationInitiative[]>([]);
  const [renewableAssets, setRenewableAssets] = useState<RenewableAsset[]>([]);
  const [energyProduction, setEnergyProduction] = useState<EnergyProduction[]>([]);
  const [utilityAccounts, setUtilityAccounts] = useState<UtilityAccount[]>([]);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [settings, setSettings] = useState<EnergySettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const existing = await SmartGridService.getAllMeters();
      if (existing.length === 0) {
        localStorage.setItem('energy_smart_meters', JSON.stringify(sampleSmartMeters));
        localStorage.setItem('energy_consumption', JSON.stringify(sampleEnergyConsumption));
        localStorage.setItem('energy_load_management', JSON.stringify(sampleLoadManagement));
        localStorage.setItem('energy_water_meters', JSON.stringify(sampleWaterMeters));
        localStorage.setItem('energy_water_usage', JSON.stringify(sampleWaterUsage));
        localStorage.setItem('energy_leak_detection', JSON.stringify(sampleLeakDetections));
        localStorage.setItem('energy_conservation_initiatives', JSON.stringify(sampleConservationInitiatives));
        localStorage.setItem('energy_renewable_assets', JSON.stringify(sampleRenewableAssets));
        localStorage.setItem('energy_production', JSON.stringify(sampleEnergyProduction));
        localStorage.setItem('energy_utility_accounts', JSON.stringify(sampleUtilityAccounts));
        localStorage.setItem('energy_utility_bills', JSON.stringify(sampleUtilityBills));
        localStorage.setItem('energy_settings', JSON.stringify(sampleEnergySettings));
      }

      await Promise.all([
        loadSmartMeters(), loadWaterMeters(), loadRenewableAssets(),
        loadUtilityAccounts(), loadUtilityBills(), loadSettings()
      ]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      addToast({ type: 'error', message: 'Failed to load energy data' });
    } finally {
      setLoading(false);
    }
  };

  // Smart Grid Methods
  const loadSmartMeters = async () => {
    const data = await SmartGridService.getAllMeters();
    setSmartMeters(data);
  };

  const createSmartMeter = async (meterData: Partial<SmartMeter>) => {
    setLoading(true);
    try {
      const meter = await SmartGridService.createMeter(meterData);
      await loadSmartMeters();
      addToast({ type: 'success', message: 'Smart meter created' });
      return meter;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to create meter' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSmartMeter = async (meterId: string, updates: Partial<SmartMeter>) => {
    setLoading(true);
    try {
      const meter = await SmartGridService.updateMeter(meterId, updates);
      await loadSmartMeters();
      addToast({ type: 'success', message: 'Meter updated' });
      return meter;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to update meter' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const recordReading = async (meterId: string, reading: any) => {
    setLoading(true);
    try {
      await SmartGridService.recordReading(meterId, reading);
      await loadSmartMeters();
      addToast({ type: 'success', message: 'Reading recorded' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to record reading' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addMeterAlert = async (meterId: string, alert: any) => {
    setLoading(true);
    try {
      await SmartGridService.addAlert(meterId, alert);
      await loadSmartMeters();
      addToast({ type: 'success', message: 'Alert added' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to add alert' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadEnergyConsumption = async () => {
    const data = await SmartGridService.getAllConsumption();
    setEnergyConsumption(data);
  };

  const recordConsumption = async (consumptionData: Partial<EnergyConsumption>) => {
    setLoading(true);
    try {
      await SmartGridService.recordConsumption(consumptionData);
      await loadEnergyConsumption();
      addToast({ type: 'success', message: 'Consumption recorded' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to record consumption' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadLoadManagement = async () => {
    const data = await SmartGridService.getAllLoadManagement();
    setLoadManagement(data);
  };

  const createLoadManagement = async (loadData: Partial<LoadManagement>) => {
    setLoading(true);
    try {
      const load = await SmartGridService.createLoadManagement(loadData);
      await loadLoadManagement();
      addToast({ type: 'success', message: 'Load management created' });
      return load;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to create load management' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateLoadManagement = async (loadId: string, updates: Partial<LoadManagement>) => {
    setLoading(true);
    try {
      await SmartGridService.updateLoadManagement(loadId, updates);
      await loadLoadManagement();
      addToast({ type: 'success', message: 'Load management updated' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to update load management' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadGridEvents = async () => {
    const data = await SmartGridService.getAllGridEvents();
    setGridEvents(data);
  };

  const recordGridEvent = async (eventData: Partial<GridEvent>) => {
    setLoading(true);
    try {
      await SmartGridService.recordGridEvent(eventData);
      await loadGridEvents();
      addToast({ type: 'success', message: 'Grid event recorded' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to record event' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Water Conservation Methods
  const loadWaterMeters = async () => {
    const data = await WaterConservationService.getAllWaterMeters();
    setWaterMeters(data);
  };

  const createWaterMeter = async (meterData: Partial<WaterMeter>) => {
    setLoading(true);
    try {
      const meter = await WaterConservationService.createWaterMeter(meterData);
      await loadWaterMeters();
      addToast({ type: 'success', message: 'Water meter created' });
      return meter;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to create water meter' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateWaterMeter = async (meterId: string, updates: Partial<WaterMeter>) => {
    setLoading(true);
    try {
      const meter = await WaterConservationService.updateWaterMeter(meterId, updates);
      await loadWaterMeters();
      addToast({ type: 'success', message: 'Water meter updated' });
      return meter;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to update water meter' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadWaterUsage = async () => {
    const data = await WaterConservationService.getAllWaterUsage();
    setWaterUsage(data);
  };

  const recordWaterUsage = async (usageData: Partial<WaterUsage>) => {
    setLoading(true);
    try {
      await WaterConservationService.recordWaterUsage(usageData);
      await loadWaterUsage();
      addToast({ type: 'success', message: 'Water usage recorded' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to record water usage' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadLeakDetections = async () => {
    const data = await WaterConservationService.getAllLeakDetections();
    setLeakDetections(data);
  };

  const recordLeakDetection = async (leakData: Partial<LeakDetection>) => {
    setLoading(true);
    try {
      await WaterConservationService.recordLeakDetection(leakData);
      await loadLeakDetections();
      addToast({ type: 'success', message: 'Leak detected and recorded' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to record leak' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateLeakStatus = async (leakId: string, updates: Partial<LeakDetection>) => {
    setLoading(true);
    try {
      await WaterConservationService.updateLeakStatus(leakId, updates);
      await loadLeakDetections();
      addToast({ type: 'success', message: 'Leak status updated' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to update leak' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadConservationInitiatives = async () => {
    const data = await WaterConservationService.getAllInitiatives();
    setConservationInitiatives(data);
  };

  const createConservationInitiative = async (initiativeData: Partial<ConservationInitiative>) => {
    setLoading(true);
    try {
      const initiative = await WaterConservationService.createInitiative(initiativeData);
      await loadConservationInitiatives();
      addToast({ type: 'success', message: 'Initiative created' });
      return initiative;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to create initiative' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateConservationInitiative = async (initiativeId: string, updates: Partial<ConservationInitiative>) => {
    setLoading(true);
    try {
      await WaterConservationService.updateInitiative(initiativeId, updates);
      await loadConservationInitiatives();
      addToast({ type: 'success', message: 'Initiative updated' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to update initiative' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Renewable Assets Methods
  const loadRenewableAssets = async () => {
    const data = await RenewableAssetsService.getAllAssets();
    setRenewableAssets(data);
  };

  const createRenewableAsset = async (assetData: Partial<RenewableAsset>) => {
    setLoading(true);
    try {
      const asset = await RenewableAssetsService.createAsset(assetData);
      await loadRenewableAssets();
      addToast({ type: 'success', message: 'Renewable asset created' });
      return asset;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to create asset' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateRenewableAsset = async (assetId: string, updates: Partial<RenewableAsset>) => {
    setLoading(true);
    try {
      const asset = await RenewableAssetsService.updateAsset(assetId, updates);
      await loadRenewableAssets();
      addToast({ type: 'success', message: 'Asset updated' });
      return asset;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to update asset' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const recordMaintenance = async (assetId: string, maintenance: any) => {
    setLoading(true);
    try {
      await RenewableAssetsService.recordMaintenance(assetId, maintenance);
      await loadRenewableAssets();
      addToast({ type: 'success', message: 'Maintenance recorded' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to record maintenance' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadEnergyProduction = async () => {
    const data = await RenewableAssetsService.getAllProduction();
    setEnergyProduction(data);
  };

  const recordProduction = async (productionData: Partial<EnergyProduction>) => {
    setLoading(true);
    try {
      await RenewableAssetsService.recordProduction(productionData);
      await loadEnergyProduction();
      addToast({ type: 'success', message: 'Production recorded' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to record production' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Utility Billing Methods
  const loadUtilityAccounts = async () => {
    const data = await UtilityBillingService.getAllAccounts();
    setUtilityAccounts(data);
  };

  const createUtilityAccount = async (accountData: Partial<UtilityAccount>) => {
    setLoading(true);
    try {
      const account = await UtilityBillingService.createAccount(accountData);
      await loadUtilityAccounts();
      addToast({ type: 'success', message: 'Utility account created' });
      return account;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to create account' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUtilityAccount = async (accountId: string, updates: Partial<UtilityAccount>) => {
    setLoading(true);
    try {
      const account = await UtilityBillingService.updateAccount(accountId, updates);
      await loadUtilityAccounts();
      addToast({ type: 'success', message: 'Account updated' });
      return account;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to update account' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadUtilityBills = async () => {
    const data = await UtilityBillingService.getAllBills();
    setUtilityBills(data);
  };

  const createUtilityBill = async (billData: Partial<UtilityBill>) => {
    setLoading(true);
    try {
      const bill = await UtilityBillingService.createBill(billData);
      await loadUtilityBills();
      addToast({ type: 'success', message: 'Bill created' });
      return bill;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to create bill' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUtilityBill = async (billId: string, updates: Partial<UtilityBill>) => {
    setLoading(true);
    try {
      const bill = await UtilityBillingService.updateBill(billId, updates);
      await loadUtilityBills();
      addToast({ type: 'success', message: 'Bill updated' });
      return bill;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to update bill' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    const data = await UtilityBillingService.getAllPayments();
    setPayments(data);
  };

  const recordPayment = async (paymentData: Partial<Payment>) => {
    setLoading(true);
    try {
      await UtilityBillingService.recordPayment(paymentData);
      await Promise.all([loadPayments(), loadUtilityBills()]);
      addToast({ type: 'success', message: 'Payment recorded' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to record payment' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Settings Methods
  const loadSettings = async () => {
    const data = await EnergySettingsService.getSettings();
    setSettings(data);
  };

  const updateSettings = async (updates: Partial<EnergySettings>) => {
    setLoading(true);
    try {
      const updated = await EnergySettingsService.updateSettings(updates);
      setSettings(updated);
      addToast({ type: 'success', message: 'Settings updated' });
      return updated;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to update settings' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Toast Methods
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return {
    // State
    smartMeters, energyConsumption, loadManagement, gridEvents, waterMeters,
    waterUsage, leakDetections, conservationInitiatives, renewableAssets,
    energyProduction, utilityAccounts, utilityBills, payments, settings, loading, toasts,

    // Smart Grid Methods
    loadSmartMeters, createSmartMeter, updateSmartMeter, recordReading, addMeterAlert,
    loadEnergyConsumption, recordConsumption, loadLoadManagement, createLoadManagement,
    updateLoadManagement, loadGridEvents, recordGridEvent,

    // Water Conservation Methods
    loadWaterMeters, createWaterMeter, updateWaterMeter, loadWaterUsage, recordWaterUsage,
    loadLeakDetections, recordLeakDetection, updateLeakStatus, loadConservationInitiatives,
    createConservationInitiative, updateConservationInitiative,

    // Renewable Assets Methods
    loadRenewableAssets, createRenewableAsset, updateRenewableAsset, recordMaintenance,
    loadEnergyProduction, recordProduction,

    // Utility Billing Methods
    loadUtilityAccounts, createUtilityAccount, updateUtilityAccount, loadUtilityBills,
    createUtilityBill, updateUtilityBill, loadPayments, recordPayment,

    // Settings Methods
    loadSettings, updateSettings,

    // Toast Methods
    addToast, removeToast,
  };
};
