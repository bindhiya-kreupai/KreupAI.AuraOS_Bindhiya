"use client";
import { useState, useEffect, useCallback } from 'react';
import type { Store, CommissionPlan, SalesCommission, SeasonalHire, RetailSettings, RetailAlert } from '../types';
import { StoreOperationsService, CommissionService, SeasonalHiringService, RetailSettingsService, AlertsService } from '../services';
import { sampleStores, sampleCommissionPlans, sampleSalesCommissions, sampleSeasonalHires, sampleRetailSettings } from '../data';
interface Toast { type: 'success' | 'error' | 'info'; message: string; }
export const useRetail = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [commissionPlans, setCommissionPlans] = useState<CommissionPlan[]>([]);
  const [salesCommissions, setSalesCommissions] = useState<SalesCommission[]>([]);
  const [seasonalHires, setSeasonalHires] = useState<SeasonalHire[]>([]);
  const [settings, setSettings] = useState<RetailSettings | null>(null);
  const [alerts, setAlerts] = useState<RetailAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((toast: Toast) => { setToasts(prev => [...prev, toast]); setTimeout(() => setToasts(prev => prev.slice(1)), 5000); }, []);
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [storesData, plansData, commissionsData, hiresData, settingsData, alertsData] = await Promise.all([
        StoreOperationsService.getAllStores(),
        CommissionService.getAllPlans(),
        CommissionService.getAllCommissions(),
        SeasonalHiringService.getAllHires(),
        RetailSettingsService.getSettings(),
        AlertsService.getAllAlerts()
      ]);

      setStores(storesData.length > 0 ? storesData : sampleStores);
      setCommissionPlans(plansData.length > 0 ? plansData : sampleCommissionPlans);
      setSalesCommissions(commissionsData.length > 0 ? commissionsData : sampleSalesCommissions);
      setSeasonalHires(hiresData.length > 0 ? hiresData : sampleSeasonalHires);
      setSettings(settingsData || sampleRetailSettings);
      setAlerts(alertsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load data');
      addToast({ type: 'error', message: 'Failed to load retail data' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);
  useEffect(() => { loadAllData(); }, [loadAllData]);
  const createStore = async (data: Partial<Store>) => {
    setLoading(true);
    try { const store = await StoreOperationsService.createStore(data); setStores(await StoreOperationsService.getAllStores()); addToast({ type: 'success', message: 'Store created' }); return store; } catch (error) { addToast({ type: 'error', message: 'Failed to create store' }); throw error; }
    finally { setLoading(false); }
  };
  const updateStore = async (storeId: string, updates: Partial<Store>) => {
    setLoading(true);
    try { const store = await StoreOperationsService.updateStore(storeId, updates); setStores(await StoreOperationsService.getAllStores()); addToast({ type: 'success', message: 'Store updated' }); return store; } catch (error) { addToast({ type: 'error', message: 'Failed to update store' }); throw error; }
    finally { setLoading(false); }
  };
  const createCommission = async (data: Partial<SalesCommission>) => {
    setLoading(true);
    try { const commission = await CommissionService.createCommission(data); setSalesCommissions(await CommissionService.getAllCommissions()); addToast({ type: 'success', message: 'Commission created' }); return commission; } catch (error) { addToast({ type: 'error', message: 'Failed to create commission' }); throw error; }
    finally { setLoading(false); }
  };
  const createSeasonalHire = async (data: Partial<SeasonalHire>) => {
    setLoading(true);
    try { const hire = await SeasonalHiringService.createHire(data); setSeasonalHires(await SeasonalHiringService.getAllHires()); addToast({ type: 'success', message: 'Seasonal hire created' }); return hire; } catch (error) { addToast({ type: 'error', message: 'Failed to create hire' }); throw error; }
    finally { setLoading(false); }
  };
  return { stores, commissionPlans, salesCommissions, seasonalHires, settings, alerts, loading, error, toasts, createStore, updateStore, createCommission, createSeasonalHire, loadAllData };
};
