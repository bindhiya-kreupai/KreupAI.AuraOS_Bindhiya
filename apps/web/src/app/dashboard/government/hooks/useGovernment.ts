"use client";

import { useState, useEffect, useCallback } from 'react';
import type { CivilServiceGrade, SecurityClearance, PensionScheme, GovernmentSettings, GovernmentAlert } from '../types';
import {
  CivilServiceGradeService,
  SecurityClearanceService,
  PensionSchemeService,
  GovernmentSettingsService,
  AlertsService
} from '../services';
import { sampleCivilServiceGrades, sampleSecurityClearances, samplePensionSchemes, sampleGovernmentSettings } from '../data';

interface Toast {
  type: 'success' | 'error' | 'info';
  message: string;
}

export const useGovernment = () => {
  const [grades, setGrades] = useState<CivilServiceGrade[]>([]);
  const [clearances, setClearances] = useState<SecurityClearance[]>([]);
  const [pensions, setPensions] = useState<PensionScheme[]>([]);
  const [settings, setSettings] = useState<GovernmentSettings | null>(null);
  const [alerts, setAlerts] = useState<GovernmentAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Toast) => {
    setToasts(prev => [...prev, toast]);
    setTimeout(() => setToasts(prev => prev.slice(1)), 5000);
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [gradesData, clearancesData, pensionsData, settingsData] = await Promise.all([
        CivilServiceGradeService.getAllGrades(),
        SecurityClearanceService.getAllClearances(),
        PensionSchemeService.getAllPensions(),
        GovernmentSettingsService.getSettings()
      ]);

      if (gradesData.length === 0) {
        for (const grade of sampleCivilServiceGrades) {
          await CivilServiceGradeService.createGrade(grade);
        }
        setGrades(sampleCivilServiceGrades);
      } else {
        setGrades(gradesData);
      }

      if (clearancesData.length === 0) {
        for (const clearance of sampleSecurityClearances) {
          await SecurityClearanceService.createClearance(clearance);
        }
        setClearances(sampleSecurityClearances);
      } else {
        setClearances(clearancesData);
      }

      if (pensionsData.length === 0) {
        for (const pension of samplePensionSchemes) {
          await PensionSchemeService.createPension(pension);
        }
        setPensions(samplePensionSchemes);
      } else {
        setPensions(pensionsData);
      }

      if (!settingsData) {
        await GovernmentSettingsService.updateSettings(sampleGovernmentSettings);
        setSettings(sampleGovernmentSettings);
      } else {
        setSettings(settingsData);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load data');
      addToast({ type: 'error', message: 'Failed to load government data' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Civil Service Grade Operations
  const createGrade = async (data: Partial<CivilServiceGrade>) => {
    setLoading(true);
    try {
      const newGrade = await CivilServiceGradeService.createGrade(data);
      setGrades(await CivilServiceGradeService.getAllGrades());
      addToast({ type: 'success', message: 'Grade assignment created' });
      return newGrade;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create grade' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateGrade = async (gradeId: string, updates: Partial<CivilServiceGrade>) => {
    setLoading(true);
    try {
      const updated = await CivilServiceGradeService.updateGrade(gradeId, updates);
      setGrades(await CivilServiceGradeService.getAllGrades());
      addToast({ type: 'success', message: 'Grade updated successfully' });
      return updated;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update grade' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getGradeByEmployeeId = async (employeeId: string) => {
    try {
      return await CivilServiceGradeService.getGradeByEmployeeId(employeeId);
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to retrieve grade' });
      throw error;
    }
  };

  // Security Clearance Operations
  const createClearance = async (data: Partial<SecurityClearance>) => {
    setLoading(true);
    try {
      const newClearance = await SecurityClearanceService.createClearance(data);
      setClearances(await SecurityClearanceService.getAllClearances());
      addToast({ type: 'success', message: 'Security clearance created' });
      return newClearance;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create clearance' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateClearance = async (clearanceId: string, updates: Partial<SecurityClearance>) => {
    setLoading(true);
    try {
      const updated = await SecurityClearanceService.updateClearance(clearanceId, updates);
      setClearances(await SecurityClearanceService.getAllClearances());
      addToast({ type: 'success', message: 'Clearance updated successfully' });
      return updated;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update clearance' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getClearanceByEmployeeId = async (employeeId: string) => {
    try {
      return await SecurityClearanceService.getClearanceByEmployeeId(employeeId);
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to retrieve clearance' });
      throw error;
    }
  };

  const getExpiringSoonClearances = async (days: number = 90) => {
    try {
      return await SecurityClearanceService.getExpiringSoon(days);
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to retrieve expiring clearances' });
      throw error;
    }
  };

  // Pension Scheme Operations
  const createPension = async (data: Partial<PensionScheme>) => {
    setLoading(true);
    try {
      const newPension = await PensionSchemeService.createPension(data);
      setPensions(await PensionSchemeService.getAllPensions());
      addToast({ type: 'success', message: 'Pension scheme created' });
      return newPension;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create pension' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePension = async (pensionId: string, updates: Partial<PensionScheme>) => {
    setLoading(true);
    try {
      const updated = await PensionSchemeService.updatePension(pensionId, updates);
      setPensions(await PensionSchemeService.getAllPensions());
      addToast({ type: 'success', message: 'Pension updated successfully' });
      return updated;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update pension' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPensionByEmployeeId = async (employeeId: string) => {
    try {
      return await PensionSchemeService.getPensionByEmployeeId(employeeId);
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to retrieve pension' });
      throw error;
    }
  };

  const getRetirementEligibleEmployees = async () => {
    try {
      return await PensionSchemeService.getRetirementEligible();
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to retrieve retirement eligible employees' });
      throw error;
    }
  };

  // Alert Operations
  const acknowledgeAlert = async (alertId: string, acknowledgedBy: string) => {
    try {
      await AlertsService.acknowledgeAlert(alertId, acknowledgedBy);
      setAlerts(await AlertsService.getAllAlerts());
      addToast({ type: 'success', message: 'Alert acknowledged' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to acknowledge alert' });
      throw error;
    }
  };

  return {
    grades,
    clearances,
    pensions,
    settings,
    alerts,
    loading,
    error,
    toasts,
    createGrade,
    updateGrade,
    getGradeByEmployeeId,
    createClearance,
    updateClearance,
    getClearanceByEmployeeId,
    getExpiringSoonClearances,
    createPension,
    updatePension,
    getPensionByEmployeeId,
    getRetirementEligibleEmployees,
    acknowledgeAlert,
    loadAllData
  };
};
