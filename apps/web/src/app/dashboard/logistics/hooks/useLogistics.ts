"use client";
import { useState, useEffect, useCallback } from 'react';
import type { Driver, FleetVehicle, VehicleInspection, SafetyIncident, WarehouseWorker, LogisticsSettings, LogisticsAlert } from '../types';
import { DriverManagementService, FleetManagementService, SafetyManagementService, WarehouseStaffingService, LogisticsSettingsService, AlertsService } from '../services';
import { sampleDrivers, sampleFleetVehicles, sampleSafetyIncidents, sampleWarehouseWorkers, sampleLogisticsSettings } from '../data';

interface Toast { type: 'success' | 'error' | 'info'; message: string; }

export const useLogistics = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [inspections, setInspections] = useState<VehicleInspection[]>([]);
  const [safetyIncidents, setSafetyIncidents] = useState<SafetyIncident[]>([]);
  const [warehouseWorkers, setWarehouseWorkers] = useState<WarehouseWorker[]>([]);
  const [settings, setSettings] = useState<LogisticsSettings | null>(null);
  const [alerts, setAlerts] = useState<LogisticsAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Toast) => { setToasts(prev => [...prev, toast]); setTimeout(() => setToasts(prev => prev.slice(1)), 5000); }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [driversData, vehiclesData, inspectionsData, incidentsData, workersData, settingsData] = await Promise.all([DriverManagementService.getAllDrivers(), FleetManagementService.getAllVehicles(), FleetManagementService.getAllInspections(), SafetyManagementService.getAllIncidents(), WarehouseStaffingService.getAllWorkers(), LogisticsSettingsService.getSettings()]);
      if (driversData.length === 0) { for (const d of sampleDrivers) await DriverManagementService.createDriver(d); setDrivers(sampleDrivers); } else setDrivers(driversData);
      if (vehiclesData.length === 0) { for (const v of sampleFleetVehicles) await FleetManagementService.createVehicle(v); setVehicles(sampleFleetVehicles); } else setVehicles(vehiclesData);
      setInspections(inspectionsData);
      if (incidentsData.length === 0) { for (const i of sampleSafetyIncidents) await SafetyManagementService.createIncident(i); setSafetyIncidents(sampleSafetyIncidents); } else setSafetyIncidents(incidentsData);
      if (workersData.length === 0) { for (const w of sampleWarehouseWorkers) await WarehouseStaffingService.createWorker(w); setWarehouseWorkers(sampleWarehouseWorkers); } else setWarehouseWorkers(workersData);
      if (!settingsData) { await LogisticsSettingsService.updateSettings(sampleLogisticsSettings); setSettings(sampleLogisticsSettings); } else setSettings(settingsData);
    } catch (error: any) { setError(error instanceof Error ? error.message : 'Failed to load data'); addToast({ type: 'error', message: 'Failed to load logistics data' }); }
    finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const createDriver = async (data: Partial<Driver>) => { setLoading(true); try { const driver = await DriverManagementService.createDriver(data); setDrivers(await DriverManagementService.getAllDrivers()); addToast({ type: 'success', message: 'Driver created' }); return driver; } catch (error: any) { addToast({ type: 'error', message: 'Failed to create driver' }); throw error; } finally { setLoading(false); } };
  const updateDriver = async (driverId: string, updates: Partial<Driver>) => { setLoading(true); try { const driver = await DriverManagementService.updateDriver(driverId, updates); setDrivers(await DriverManagementService.getAllDrivers()); addToast({ type: 'success', message: 'Driver updated' }); return driver; } catch (error: any) { addToast({ type: 'error', message: 'Failed to update driver' }); throw error; } finally { setLoading(false); } };
  const createVehicle = async (data: Partial<FleetVehicle>) => { setLoading(true); try { const vehicle = await FleetManagementService.createVehicle(data); setVehicles(await FleetManagementService.getAllVehicles()); addToast({ type: 'success', message: 'Vehicle created' }); return vehicle; } catch (error: any) { addToast({ type: 'error', message: 'Failed to create vehicle' }); throw error; } finally { setLoading(false); } };
  const updateVehicle = async (vehicleId: string, updates: Partial<FleetVehicle>) => { setLoading(true); try { const vehicle = await FleetManagementService.updateVehicle(vehicleId, updates); setVehicles(await FleetManagementService.getAllVehicles()); addToast({ type: 'success', message: 'Vehicle updated' }); return vehicle; } catch (error: any) { addToast({ type: 'error', message: 'Failed to update vehicle' }); throw error; } finally { setLoading(false); } };
  const createInspection = async (data: Partial<VehicleInspection>) => { setLoading(true); try { const inspection = await FleetManagementService.createInspection(data); setInspections(await FleetManagementService.getAllInspections()); addToast({ type: 'success', message: 'Inspection created' }); return inspection; } catch (error: any) { addToast({ type: 'error', message: 'Failed to create inspection' }); throw error; } finally { setLoading(false); } };
  const createSafetyIncident = async (data: Partial<SafetyIncident>) => { setLoading(true); try { const incident = await SafetyManagementService.createIncident(data); setSafetyIncidents(await SafetyManagementService.getAllIncidents()); addToast({ type: 'success', message: 'Incident reported' }); return incident; } catch (error: any) { addToast({ type: 'error', message: 'Failed to report incident' }); throw error; } finally { setLoading(false); } };
  const updateSafetyIncident = async (incidentId: string, updates: Partial<SafetyIncident>) => { setLoading(true); try { const incident = await SafetyManagementService.updateIncident(incidentId, updates); setSafetyIncidents(await SafetyManagementService.getAllIncidents()); addToast({ type: 'success', message: 'Incident updated' }); return incident; } catch (error: any) { addToast({ type: 'error', message: 'Failed to update incident' }); throw error; } finally { setLoading(false); } };
  const createWarehouseWorker = async (data: Partial<WarehouseWorker>) => { setLoading(true); try { const worker = await WarehouseStaffingService.createWorker(data); setWarehouseWorkers(await WarehouseStaffingService.getAllWorkers()); addToast({ type: 'success', message: 'Worker created' }); return worker; } catch (error: any) { addToast({ type: 'error', message: 'Failed to create worker' }); throw error; } finally { setLoading(false); } };
  const updateWarehouseWorker = async (workerId: string, updates: Partial<WarehouseWorker>) => { setLoading(true); try { const worker = await WarehouseStaffingService.updateWorker(workerId, updates); setWarehouseWorkers(await WarehouseStaffingService.getAllWorkers()); addToast({ type: 'success', message: 'Worker updated' }); return worker; } catch (error: any) { addToast({ type: 'error', message: 'Failed to update worker' }); throw error; } finally { setLoading(false); } };

  return { drivers, vehicles, inspections, safetyIncidents, warehouseWorkers, settings, alerts, loading, error, toasts, createDriver, updateDriver, createVehicle, updateVehicle, createInspection, createSafetyIncident, updateSafetyIncident, createWarehouseWorker, updateWarehouseWorker, loadAllData };
};
