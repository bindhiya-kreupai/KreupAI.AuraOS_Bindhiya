// Assets Management Custom Hook
import { useState, useEffect, useCallback } from 'react';
import type { Asset, AssetRequest, AssetMetrics, AssetSettings } from '../types';
import { AssetService, AssetRequestService, AssetAnalyticsService, AssetSettingsService } from '../services';
import { assetData } from '../data';
import { useToast } from '../../components/Toast';

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [metrics, setMetrics] = useState<AssetMetrics | null>(null);
  const [settings, setSettings] = useState<AssetSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  const loadAssets = useCallback(async (filters?: any) => {
    try {
      setIsLoading(true);
      const data = await AssetService.getAssets(filters);
      setAssets(data);
    } catch (err) {
      toast.error(`Failed to load assets: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createAsset = useCallback(async (asset: Asset) => {
    try {
      setIsSaving(true);
      const created = await AssetService.createAsset(asset);
      setAssets(prev => [...prev, created]);
      toast.success('Asset created successfully');
      return created;
    } catch (err) {
      toast.error(`Failed to create asset: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateAsset = useCallback(async (id: string, updates: Partial<Asset>) => {
    try {
      setIsSaving(true);
      const updated = await AssetService.updateAsset(id, updates);
      setAssets(prev => prev.map(a => a.id === id ? updated : a));
      toast.success('Asset updated successfully');
      return updated;
    } catch (err) {
      toast.error(`Failed to update asset: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const deleteAsset = useCallback(async (id: string) => {
    try {
      setIsSaving(true);
      await AssetService.deleteAsset(id);
      setAssets(prev => prev.filter(a => a.id !== id));
      toast.success('Asset deleted successfully');
    } catch (err) {
      toast.error(`Failed to delete asset: ${(err as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const submitRequest = useCallback(async (request: AssetRequest) => {
    try {
      setIsSaving(true);
      const submitted = await AssetRequestService.submitRequest(request);
      setRequests(prev => [...prev, submitted]);
      toast.success('Asset request submitted');
      return submitted;
    } catch (err) {
      toast.error(`Failed to submit request: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const loadMetrics = useCallback(async () => {
    try {
      const data = await AssetAnalyticsService.getMetrics();
      setMetrics(data);
    } catch (err) {
      toast.error(`Failed to load metrics: ${(err as Error).message}`);
    }
  }, [toast]);

  const loadSettings = useCallback(async () => {
    try {
      const data = await AssetSettingsService.getSettings();
      setSettings(data);
    } catch (err) {
      toast.error(`Failed to load settings: ${(err as Error).message}`);
    }
  }, [toast]);

  const initializeSampleData = useCallback(async () => {
    try {
      setIsSaving(true);
      for (const asset of assetData.assets) {
        await AssetService.createAsset(asset);
      }
      await loadAssets();
      await loadMetrics();
      toast.success('Sample data initialized');
    } catch (err) {
      toast.error(`Failed to initialize data: ${(err as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, [loadAssets, loadMetrics, toast]);

  useEffect(() => { loadAssets(); loadMetrics(); loadSettings(); }, []);

  return { assets, requests, metrics, settings, isLoading, isSaving, error, loadAssets, createAsset, updateAsset, deleteAsset, submitRequest, loadMetrics, loadSettings, initializeSampleData };
};
