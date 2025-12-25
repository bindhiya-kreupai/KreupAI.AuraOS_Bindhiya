"use client";
import { useState, useEffect, useCallback } from 'react';
import type { ContentRights, BandwidthMetrics, AudienceMetrics, NetworkOperations, MediaSettings, MediaAlert } from '../types';
import { ContentRightsService, BandwidthAnalyticsService, AudienceMetricsService, NetworkOperationsService, MediaSettingsService, AlertsService } from '../services';
import { sampleContentRights, sampleBandwidthMetrics, sampleAudienceMetrics, sampleNetworkOperations, sampleMediaSettings } from '../data';

interface Toast { type: 'success' | 'error' | 'info'; message: string; }

export const useMedia = () => {
  const [contentRights, setContentRights] = useState<ContentRights[]>([]);
  const [bandwidthMetrics, setBandwidthMetrics] = useState<BandwidthMetrics[]>([]);
  const [audienceMetrics, setAudienceMetrics] = useState<AudienceMetrics[]>([]);
  const [networkOperations, setNetworkOperations] = useState<NetworkOperations[]>([]);
  const [settings, setSettings] = useState<MediaSettings | null>(null);
  const [alerts, setAlerts] = useState<MediaAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Toast) => { setToasts(prev => [...prev, toast]); setTimeout(() => setToasts(prev => prev.slice(1)), 5000); }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [rightsData, bwData, audData, netopData, settingsData] = await Promise.all([ContentRightsService.getAllRights(), BandwidthAnalyticsService.getAllMetrics(), AudienceMetricsService.getAllMetrics(), NetworkOperationsService.getAllOperations(), MediaSettingsService.getSettings()]);
      if (rightsData.length === 0) { for (const r of sampleContentRights) await ContentRightsService.createRights(r); setContentRights(sampleContentRights); } else setContentRights(rightsData);
      if (bwData.length === 0) { for (const b of sampleBandwidthMetrics) await BandwidthAnalyticsService.createMetrics(b); setBandwidthMetrics(sampleBandwidthMetrics); } else setBandwidthMetrics(bwData);
      if (audData.length === 0) { for (const a of sampleAudienceMetrics) await AudienceMetricsService.createMetrics(a); setAudienceMetrics(sampleAudienceMetrics); } else setAudienceMetrics(audData);
      if (netopData.length === 0) { for (const n of sampleNetworkOperations) await NetworkOperationsService.createOperation(n); setNetworkOperations(sampleNetworkOperations); } else setNetworkOperations(netopData);
      if (!settingsData) { await MediaSettingsService.updateSettings(sampleMediaSettings); setSettings(sampleMediaSettings); } else setSettings(settingsData);
    } catch { setError(err instanceof Error ? err.message : 'Failed to load data'); addToast({ type: 'error', message: 'Failed to load media data' }); }
    finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const createContentRights = async (data: Partial<ContentRights>) => { setLoading(true); try { const rights = await ContentRightsService.createRights(data); setContentRights(await ContentRightsService.getAllRights()); addToast({ type: 'success', message: 'Content rights created' }); return rights; } catch { addToast({ type: 'error', message: 'Failed to create rights' }); throw err; } finally { setLoading(false); } };
  const updateContentRights = async (rightsId: string, updates: Partial<ContentRights>) => { setLoading(true); try { const rights = await ContentRightsService.updateRights(rightsId, updates); setContentRights(await ContentRightsService.getAllRights()); addToast({ type: 'success', message: 'Content rights updated' }); return rights; } catch { addToast({ type: 'error', message: 'Failed to update rights' }); throw err; } finally { setLoading(false); } };
  const createNetworkOperation = async (data: Partial<NetworkOperations>) => { setLoading(true); try { const operation = await NetworkOperationsService.createOperation(data); setNetworkOperations(await NetworkOperationsService.getAllOperations()); addToast({ type: 'success', message: 'Network operation created' }); return operation; } catch { addToast({ type: 'error', message: 'Failed to create operation' }); throw err; } finally { setLoading(false); } };
  const updateNetworkOperation = async (operationId: string, updates: Partial<NetworkOperations>) => { setLoading(true); try { const operation = await NetworkOperationsService.updateOperation(operationId, updates); setNetworkOperations(await NetworkOperationsService.getAllOperations()); addToast({ type: 'success', message: 'Network operation updated' }); return operation; } catch { addToast({ type: 'error', message: 'Failed to update operation' }); throw err; } finally { setLoading(false); } };

  return { contentRights, bandwidthMetrics, audienceMetrics, networkOperations, settings, alerts, loading, error, toasts, createContentRights, updateContentRights, createNetworkOperation, updateNetworkOperation, loadAllData };
};
