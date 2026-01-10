"use client";
import { useState, useEffect, useCallback } from 'react';
import type { CrewMember, PortOperation, OffshoreCompliance, MaritimeSettings, MaritimeAlert } from '../types';
import { VesselCrewingService, PortOperationsService, OffshoreComplianceService, MaritimeSettingsService, AlertsService } from '../services';
import { sampleCrewMembers, samplePortOperations, sampleOffshoreCompliance, sampleMaritimeSettings } from '../data';

interface Toast { type: 'success' | 'error' | 'info'; message: string; }

export const useMaritime = () => {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [portOperations, setPortOperations] = useState<PortOperation[]>([]);
  const [offshoreCompliance, setOffshoreCompliance] = useState<OffshoreCompliance[]>([]);
  const [settings, setSettings] = useState<MaritimeSettings | null>(null);
  const [alerts, setAlerts] = useState<MaritimeAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Toast) => { setToasts(prev => [...prev, toast]); setTimeout(() => setToasts(prev => prev.slice(1)), 5000); }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [crewData, operationsData, complianceData, settingsData] = await Promise.all([VesselCrewingService.getAllCrew(), PortOperationsService.getAllOperations(), OffshoreComplianceService.getAllCompliance(), MaritimeSettingsService.getSettings()]);
      if (crewData.length === 0) { for (const c of sampleCrewMembers) await VesselCrewingService.createCrew(c); setCrewMembers(sampleCrewMembers); } else setCrewMembers(crewData);
      if (operationsData.length === 0) { for (const o of samplePortOperations) await PortOperationsService.createOperation(o); setPortOperations(samplePortOperations); } else setPortOperations(operationsData);
      if (complianceData.length === 0) { for (const c of sampleOffshoreCompliance) await OffshoreComplianceService.createCompliance(c); setOffshoreCompliance(sampleOffshoreCompliance); } else setOffshoreCompliance(complianceData);
      if (!settingsData) { await MaritimeSettingsService.updateSettings(sampleMaritimeSettings); setSettings(sampleMaritimeSettings); } else setSettings(settingsData);
    } catch (error) { setError(err instanceof Error ? err.message : 'Failed to load data'); addToast({ type: 'error', message: 'Failed to load maritime data' }); }
    finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const createCrewMember = async (data: Partial<CrewMember>) => { setLoading(true); try { const crew = await VesselCrewingService.createCrew(data); setCrewMembers(await VesselCrewingService.getAllCrew()); addToast({ type: 'success', message: 'Crew member created' }); return crew; } catch (error) { addToast({ type: 'error', message: 'Failed to create crew member' }); throw error; } finally { setLoading(false); } };
  const updateCrewMember = async (crewId: string, updates: Partial<CrewMember>) => { setLoading(true); try { const crew = await VesselCrewingService.updateCrew(crewId, updates); setCrewMembers(await VesselCrewingService.getAllCrew()); addToast({ type: 'success', message: 'Crew member updated' }); return crew; } catch (error) { addToast({ type: 'error', message: 'Failed to update crew member' }); throw error; } finally { setLoading(false); } };
  const createPortOperation = async (data: Partial<PortOperation>) => { setLoading(true); try { const operation = await PortOperationsService.createOperation(data); setPortOperations(await PortOperationsService.getAllOperations()); addToast({ type: 'success', message: 'Port operation created' }); return operation; } catch (error) { addToast({ type: 'error', message: 'Failed to create operation' }); throw error; } finally { setLoading(false); } };
  const updatePortOperation = async (operationId: string, updates: Partial<PortOperation>) => { setLoading(true); try { const operation = await PortOperationsService.updateOperation(operationId, updates); setPortOperations(await PortOperationsService.getAllOperations()); addToast({ type: 'success', message: 'Port operation updated' }); return operation; } catch (error) { addToast({ type: 'error', message: 'Failed to update operation' }); throw error; } finally { setLoading(false); } };
  const createComplianceRecord = async (data: Partial<OffshoreCompliance>) => { setLoading(true); try { const compliance = await OffshoreComplianceService.createCompliance(data); setOffshoreCompliance(await OffshoreComplianceService.getAllCompliance()); addToast({ type: 'success', message: 'Compliance record created' }); return compliance; } catch (error) { addToast({ type: 'error', message: 'Failed to create compliance record' }); throw error; } finally { setLoading(false); } };
  const updateComplianceRecord = async (complianceId: string, updates: Partial<OffshoreCompliance>) => { setLoading(true); try { const compliance = await OffshoreComplianceService.updateCompliance(complianceId, updates); setOffshoreCompliance(await OffshoreComplianceService.getAllCompliance()); addToast({ type: 'success', message: 'Compliance record updated' }); return compliance; } catch (error) { addToast({ type: 'error', message: 'Failed to update compliance record' }); throw error; } finally { setLoading(false); } };

  return { crewMembers, portOperations, offshoreCompliance, settings, alerts, loading, error, toasts, createCrewMember, updateCrewMember, createPortOperation, updatePortOperation, createComplianceRecord, updateComplianceRecord, loadAllData };
};
