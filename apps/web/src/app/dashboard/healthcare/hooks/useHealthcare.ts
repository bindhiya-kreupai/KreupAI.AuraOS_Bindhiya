'use client';
import { useState, useEffect, useCallback } from 'react';
import type {
  HealthcareProvider,
  NurseSchedule,
  LocumProvider,
  LocumAssignment,
  HealthcareSettings,
  HealthcareAlert,
} from '@/app/dashboard/healthcare/types';
import {
  CredentialingService,
  NurseRosteringService,
  LocumManagementService,
  HealthcareSettingsService,
  AlertsService,
} from '@/app/dashboard/healthcare/services';
import {
  sampleProviders,
  sampleSchedules,
  sampleLocumProviders,
  sampleHealthcareSettings,
} from '@/app/dashboard/healthcare/data';
interface Toast {
  type: 'success' | 'error' | 'info';
  message: string;
}
export const useHealthcare = () => {
  const [providers, setProviders] = useState<HealthcareProvider[]>([]);
  const [schedules, setSchedules] = useState<NurseSchedule[]>([]);
  const [locumProviders, setLocumProviders] = useState<LocumProvider[]>([]);
  const [locumAssignments, setLocumAssignments] = useState<LocumAssignment[]>([]);
  const [settings, setSettings] = useState<HealthcareSettings | null>(null);
  const [alerts, setAlerts] = useState<HealthcareAlert[]>([]);
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
      const [providersData, schedulesData, locumData, settingsData, alertsData] = await Promise.all(
        [
          CredentialingService.getAllProviders(),
          NurseRosteringService.getAllSchedules(),
          LocumManagementService.getAllLocumProviders(),
          HealthcareSettingsService.getSettings(),
          AlertsService.getAll(),
        ]
      );

      setProviders(providersData.length > 0 ? providersData : sampleProviders);
      setSchedules(schedulesData.length > 0 ? schedulesData : sampleSchedules);
      setLocumProviders(locumData.length > 0 ? locumData : sampleLocumProviders);
      setSettings(settingsData || sampleHealthcareSettings);
      setAlerts(alertsData);
    } catch (_error) {
      setError(_error instanceof Error ? _error.message : 'Failed to load data');
      addToast({ type: 'error', message: 'Failed to load healthcare data' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);
  const createProvider = async (data: Partial<HealthcareProvider>) => {
    setLoading(true);
    try {
      const provider = await CredentialingService.createProvider(data);
      setProviders(await CredentialingService.getAllProviders());
      addToast({ type: 'success', message: 'Provider created' });
      return provider;
    } catch (_error) {
      addToast({ type: 'error', message: 'Failed to create provider' });
      throw _error;
    } finally {
      setLoading(false);
    }
  };
  const updateProvider = async (id: string, updates: Partial<HealthcareProvider>) => {
    setLoading(true);
    try {
      const provider = await CredentialingService.updateProvider(id, updates);
      setProviders(await CredentialingService.getAllProviders());
      addToast({ type: 'success', message: 'Provider updated' });
      return provider;
    } catch (_error) {
      addToast({ type: 'error', message: 'Failed to update provider' });
      throw _error;
    } finally {
      setLoading(false);
    }
  };
  const createSchedule = async (data: Partial<NurseSchedule>) => {
    setLoading(true);
    try {
      const schedule = await NurseRosteringService.createSchedule(data);
      setSchedules(await NurseRosteringService.getAllSchedules());
      addToast({ type: 'success', message: 'Schedule created' });
      return schedule;
    } catch (_error) {
      addToast({ type: 'error', message: 'Failed to create schedule' });
      throw _error;
    } finally {
      setLoading(false);
    }
  };
  const updateSchedule = async (id: string, updates: Partial<NurseSchedule>) => {
    setLoading(true);
    try {
      const schedule = await NurseRosteringService.updateSchedule(id, updates);
      setSchedules(await NurseRosteringService.getAllSchedules());
      addToast({ type: 'success', message: 'Schedule updated' });
      return schedule;
    } catch (_error) {
      addToast({ type: 'error', message: 'Failed to update schedule' });
      throw _error;
    } finally {
      setLoading(false);
    }
  };
  const createLocumProvider = async (data: Partial<LocumProvider>) => {
    setLoading(true);
    try {
      const provider = await LocumManagementService.createLocumProvider(data);
      setLocumProviders(await LocumManagementService.getAllLocumProviders());
      addToast({ type: 'success', message: 'Locum provider created' });
      return provider;
    } catch (_error) {
      addToast({ type: 'error', message: 'Failed to create locum provider' });
      throw _error;
    } finally {
      setLoading(false);
    }
  };
  const createAssignment = async (data: Partial<LocumAssignment>) => {
    setLoading(true);
    try {
      const assignment = await LocumManagementService.createAssignment(data);
      setLocumAssignments(await LocumManagementService.getAllAssignments());
      addToast({ type: 'success', message: 'Assignment created' });
      return assignment;
    } catch (_error) {
      addToast({ type: 'error', message: 'Failed to create assignment' });
      throw _error;
    } finally {
      setLoading(false);
    }
  };
  const updateSettings = async (updates: Partial<HealthcareSettings>) => {
    setLoading(true);
    try {
      const settingsData = await HealthcareSettingsService.updateSettings(updates);
      setSettings(settingsData);
      addToast({ type: 'success', message: 'Settings updated' });
      return settingsData;
    } catch (_error) {
      addToast({ type: 'error', message: 'Failed to update settings' });
      throw _error;
    } finally {
      setLoading(false);
    }
  };
  return {
    providers,
    schedules,
    locumProviders,
    locumAssignments,
    settings,
    alerts,
    loading,
    error,
    toasts,
    createProvider,
    updateProvider,
    createSchedule,
    updateSchedule,
    createLocumProvider,
    createAssignment,
    updateSettings,
    loadAllData,
  };
};
