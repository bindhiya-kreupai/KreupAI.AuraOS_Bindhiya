'use client';
import { useState, useEffect, useCallback } from 'react';
import type {
  RemoteEmployee,
  RemoteWorkSettings,
  RemoteWorkAlert,
  RemotePolicy,
} from '@/app/dashboard/remote-work/types';
import {
  RemoteEmployeeService,
  RemoteWorkSettingsService,
  AlertsService,
  RemotePolicyService,
} from '@/app/dashboard/remote-work/services';
import { sampleRemoteEmployees, sampleRemoteWorkSettings } from '@/app/dashboard/remote-work/data';

interface Toast {
  type: 'success' | 'error' | 'info';
  message: string;
}

export const useRemoteWork = () => {
  const [employees, setEmployees] = useState<RemoteEmployee[]>([]);
  const [policies, setPolicies] = useState<RemotePolicy[]>([]);
  const [settings, setSettings] = useState<RemoteWorkSettings | null>(null);
  const [alerts, setAlerts] = useState<RemoteWorkAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => setToasts((prev) => prev.slice(1)), 5000);
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [empData, polData, settingsData, alertsData] = await Promise.all([
        RemoteEmployeeService.getAll(),
        RemotePolicyService.getAll(),
        RemoteWorkSettingsService.get(),
        AlertsService.getAll(),
      ]);

      setEmployees(empData.length > 0 ? empData : sampleRemoteEmployees);
      setPolicies(polData);
      setSettings(settingsData || sampleRemoteWorkSettings);
      setAlerts(alertsData);
    } catch (_error) {
      setError(_error instanceof Error ? _error.message : 'Failed to load data');
      addToast({ type: 'error', message: 'Failed to load remote work data' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const createPolicy = async (data: Partial<RemotePolicy>) => {
    setLoading(true);
    try {
      const pol = await RemotePolicyService.create(data);
      await loadAllData();
      addToast({ type: 'success', message: 'Policy created' });
      return pol;
    } catch (_error) {
      addToast({ type: 'error', message: 'Failed to create policy' });
      throw _error;
    } finally {
      setLoading(false);
    }
  };

  const updatePolicy = async (id: string, updates: Partial<RemotePolicy>) => {
    setLoading(true);
    try {
      const pol = await RemotePolicyService.update(id, updates);
      await loadAllData();
      addToast({ type: 'success', message: 'Policy updated' });
      return pol;
    } catch (_error) {
      addToast({ type: 'error', message: 'Failed to update policy' });
      throw _error;
    } finally {
      setLoading(false);
    }
  };

  return {
    employees,
    policies,
    settings,
    alerts,
    loading,
    error,
    toasts,
    createPolicy,
    updatePolicy,
    loadAllData,
  };
};
