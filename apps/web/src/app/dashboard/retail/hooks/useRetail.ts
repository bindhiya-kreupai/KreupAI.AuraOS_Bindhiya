"use client";
import { useState, useEffect, useCallback } from 'react';
import { Store, CommissionPlan, SalesCommission, SeasonalHire, RetailSettings, RetailAlert } from '../types';
import { StoreOperationsService, CommissionService, SeasonalHiringService, RetailSettingsService } from '../services';
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
      const [storesData, plansData, commissionsData, hiresData, settingsData] = await Promise.all([StoreOperationsService.getAllStores(), CommissionService.getAllPlans(), CommissionService.getAllCommissions(), SeasonalHiringService.getAllHires(), RetailSettingsService.getSettings()]);
      if (storesData.length === 0) { for (const s of sampleStores) await StoreOperationsService.createStore(s); setStores(sampleStores); } else setStores(storesData);
      if (plansData.length === 0) { for (const p of sampleCommissionPlans) await CommissionService.createPlan(p); setCommissionPlans(sampleCommissionPlans); } else setCommissionPlans(plansData);
      if (commissionsData.length === 0) { for (const c of sampleSalesCommissions) await CommissionService.createCommission(c); setSalesCommissions(sampleSalesCommissions); } else setSalesCommissions(commissionsData);
      if (hiresData.length === 0) { for (const h of sampleSeasonalHires) await SeasonalHiringService.createHire(h); setSeasonalHires(sampleSeasonalHires); } else setSeasonalHires(hiresData);
      if (!settingsData) { await RetailSettingsService.updateSettings(sampleRetailSettings); setSettings(sampleRetailSettings); } else setSettings(settingsData);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load data'); addToast({ type: 'error', message: 'Failed to load retail data' }); }
    finally { setLoading(false); }
  }, [addToast]);
  useEffect(() => { loadAllData(); }, [loadAllData]);
  const createStore = async (data: Partial<Store>) => {
    setLoading(true);
    try { const store = await StoreOperationsService.createStore(data); setStores(await StoreOperationsService.getAllStores()); addToast({ type: 'success', message: 'Store created' }); return store; }
    catch (err) { addToast({ type: 'error', message: 'Failed to create store' }); throw err; }
    finally { setLoading(false); }
  };
  const updateStore = async (storeId: string, updates: Partial<Store>) => {
    setLoading(true);
    try { const store = await StoreOperationsService.updateStore(storeId, updates); setStores(await StoreOperationsService.getAllStores()); addToast({ type: 'success', message: 'Store updated' }); return store; }
    catch (err) { addToast({ type: 'error', message: 'Failed to update store' }); throw err; }
    finally { setLoading(false); }
  };
  const createCommission = async (data: Partial<SalesCommission>) => {
    setLoading(true);
    try { const commission = await CommissionService.createCommission(data); setSalesCommissions(await CommissionService.getAllCommissions()); addToast({ type: 'success', message: 'Commission created' }); return commission; }
    catch (err) { addToast({ type: 'error', message: 'Failed to create commission' }); throw err; }
    finally { setLoading(false); }
  };
  const createSeasonalHire = async (data: Partial<SeasonalHire>) => {
    setLoading(true);
    try { const hire = await SeasonalHiringService.createHire(data); setSeasonalHires(await SeasonalHiringService.getAllHires()); addToast({ type: 'success', message: 'Seasonal hire created' }); return hire; }
    catch (err) { addToast({ type: 'error', message: 'Failed to create hire' }); throw err; }
    finally { setLoading(false); }
  };
  return { stores, commissionPlans, salesCommissions, seasonalHires, settings, alerts, loading, error, toasts, createStore, updateStore, createCommission, createSeasonalHire, loadAllData };
};
