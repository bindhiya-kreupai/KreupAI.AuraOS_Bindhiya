"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Equipment,
  MaintenanceSchedule,
  WorkOrder,
  ProductionLine,
  ProductionRun,
  OEEMetrics,
  SafetyIncident,
  SafetyInspection,
  PPEInventory,
  SafetyTraining,
  ManufacturingSettings,
  ManufacturingAlert
} from '../types';
import {
  PlantMaintenanceService,
  ProductionEfficiencyService,
  SafetyComplianceService,
  ManufacturingSettingsService,
  AlertsService
} from '../services';
import {
  sampleEquipment,
  sampleMaintenanceSchedules,
  sampleWorkOrders,
  sampleProductionLines,
  sampleProductionRuns,
  sampleOEEMetrics,
  sampleSafetyIncidents,
  sampleSafetyInspections,
  samplePPEInventory,
  sampleSafetyTraining,
  sampleManufacturingSettings
} from '../data';

interface Toast {
  type: 'success' | 'error' | 'info';
  message: string;
}

export const useManufacturing = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [productionRuns, setProductionRuns] = useState<ProductionRun[]>([]);
  const [oeeMetrics, setOeeMetrics] = useState<OEEMetrics[]>([]);
  const [safetyIncidents, setSafetyIncidents] = useState<SafetyIncident[]>([]);
  const [safetyInspections, setSafetyInspections] = useState<SafetyInspection[]>([]);
  const [ppeInventory, setPpeInventory] = useState<PPEInventory[]>([]);
  const [safetyTraining, setSafetyTraining] = useState<SafetyTraining[]>([]);
  const [settings, setSettings] = useState<ManufacturingSettings | null>(null);
  const [alerts, setAlerts] = useState<ManufacturingAlert[]>([]);
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
      const [
        equipmentData,
        schedulesData,
        workOrdersData,
        linesData,
        runsData,
        metricsData,
        incidentsData,
        inspectionsData,
        ppeData,
        trainingData,
        settingsData
      ] = await Promise.all([
        PlantMaintenanceService.getAllEquipment(),
        PlantMaintenanceService.getAllSchedules(),
        PlantMaintenanceService.getAllWorkOrders(),
        ProductionEfficiencyService.getAllLines(),
        ProductionEfficiencyService.getAllRuns(),
        ProductionEfficiencyService.getAllOEEMetrics(),
        SafetyComplianceService.getAllIncidents(),
        SafetyComplianceService.getAllInspections(),
        SafetyComplianceService.getAllPPEInventory(),
        SafetyComplianceService.getAllTraining(),
        ManufacturingSettingsService.getSettings()
      ]);

      if (equipmentData.length === 0) {
        for (const eq of sampleEquipment) {
          await PlantMaintenanceService.createEquipment(eq);
        }
        setEquipment(sampleEquipment);
      } else {
        setEquipment(equipmentData);
      }

      if (schedulesData.length === 0) {
        for (const sched of sampleMaintenanceSchedules) {
          await PlantMaintenanceService.createSchedule(sched);
        }
        setMaintenanceSchedules(sampleMaintenanceSchedules);
      } else {
        setMaintenanceSchedules(schedulesData);
      }

      if (workOrdersData.length === 0) {
        for (const wo of sampleWorkOrders) {
          await PlantMaintenanceService.createWorkOrder(wo);
        }
        setWorkOrders(sampleWorkOrders);
      } else {
        setWorkOrders(workOrdersData);
      }

      if (linesData.length === 0) {
        for (const line of sampleProductionLines) {
          await ProductionEfficiencyService.createLine(line);
        }
        setProductionLines(sampleProductionLines);
      } else {
        setProductionLines(linesData);
      }

      if (runsData.length === 0) {
        for (const run of sampleProductionRuns) {
          await ProductionEfficiencyService.createRun(run);
        }
        setProductionRuns(sampleProductionRuns);
      } else {
        setProductionRuns(runsData);
      }

      if (metricsData.length === 0) {
        for (const metric of sampleOEEMetrics) {
          await ProductionEfficiencyService.createOEEMetrics(metric);
        }
        setOeeMetrics(sampleOEEMetrics);
      } else {
        setOeeMetrics(metricsData);
      }

      if (incidentsData.length === 0) {
        for (const incident of sampleSafetyIncidents) {
          await SafetyComplianceService.createIncident(incident);
        }
        setSafetyIncidents(sampleSafetyIncidents);
      } else {
        setSafetyIncidents(incidentsData);
      }

      if (inspectionsData.length === 0) {
        for (const inspection of sampleSafetyInspections) {
          await SafetyComplianceService.createInspection(inspection);
        }
        setSafetyInspections(sampleSafetyInspections);
      } else {
        setSafetyInspections(inspectionsData);
      }

      if (ppeData.length === 0) {
        for (const ppe of samplePPEInventory) {
          await SafetyComplianceService.createPPEItem(ppe);
        }
        setPpeInventory(samplePPEInventory);
      } else {
        setPpeInventory(ppeData);
      }

      if (trainingData.length === 0) {
        for (const train of sampleSafetyTraining) {
          await SafetyComplianceService.createTraining(train);
        }
        setSafetyTraining(sampleSafetyTraining);
      } else {
        setSafetyTraining(trainingData);
      }

      if (!settingsData) {
        await ManufacturingSettingsService.updateSettings(sampleManufacturingSettings);
        setSettings(sampleManufacturingSettings);
      } else {
        setSettings(settingsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      addToast({ type: 'error', message: 'Failed to load manufacturing data' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Plant Maintenance Operations
  const createEquipment = async (data: Partial<Equipment>) => {
    setLoading(true);
    try {
      const newEquipment = await PlantMaintenanceService.createEquipment(data);
      setEquipment(await PlantMaintenanceService.getAllEquipment());
      addToast({ type: 'success', message: 'Equipment created successfully' });
      return newEquipment;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to create equipment' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEquipment = async (equipmentId: string, updates: Partial<Equipment>) => {
    setLoading(true);
    try {
      const updated = await PlantMaintenanceService.updateEquipment(equipmentId, updates);
      setEquipment(await PlantMaintenanceService.getAllEquipment());
      addToast({ type: 'success', message: 'Equipment updated successfully' });
      return updated;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update equipment' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createMaintenanceSchedule = async (data: Partial<MaintenanceSchedule>) => {
    setLoading(true);
    try {
      const newSchedule = await PlantMaintenanceService.createSchedule(data);
      setMaintenanceSchedules(await PlantMaintenanceService.getAllSchedules());
      addToast({ type: 'success', message: 'Maintenance schedule created' });
      return newSchedule;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to create schedule' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createWorkOrder = async (data: Partial<WorkOrder>) => {
    setLoading(true);
    try {
      const newWorkOrder = await PlantMaintenanceService.createWorkOrder(data);
      setWorkOrders(await PlantMaintenanceService.getAllWorkOrders());
      addToast({ type: 'success', message: 'Work order created' });
      return newWorkOrder;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to create work order' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateWorkOrder = async (workOrderId: string, updates: Partial<WorkOrder>) => {
    setLoading(true);
    try {
      const updated = await PlantMaintenanceService.updateWorkOrder(workOrderId, updates);
      setWorkOrders(await PlantMaintenanceService.getAllWorkOrders());
      addToast({ type: 'success', message: 'Work order updated' });
      return updated;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update work order' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Production Efficiency Operations
  const createProductionLine = async (data: Partial<ProductionLine>) => {
    setLoading(true);
    try {
      const newLine = await ProductionEfficiencyService.createLine(data);
      setProductionLines(await ProductionEfficiencyService.getAllLines());
      addToast({ type: 'success', message: 'Production line created' });
      return newLine;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to create production line' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProductionLine = async (lineId: string, updates: Partial<ProductionLine>) => {
    setLoading(true);
    try {
      const updated = await ProductionEfficiencyService.updateLine(lineId, updates);
      setProductionLines(await ProductionEfficiencyService.getAllLines());
      addToast({ type: 'success', message: 'Production line updated' });
      return updated;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update production line' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createProductionRun = async (data: Partial<ProductionRun>) => {
    setLoading(true);
    try {
      const newRun = await ProductionEfficiencyService.createRun(data);
      setProductionRuns(await ProductionEfficiencyService.getAllRuns());
      addToast({ type: 'success', message: 'Production run created' });
      return newRun;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to create production run' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProductionRun = async (runId: string, updates: Partial<ProductionRun>) => {
    setLoading(true);
    try {
      const updated = await ProductionEfficiencyService.updateRun(runId, updates);
      setProductionRuns(await ProductionEfficiencyService.getAllRuns());
      addToast({ type: 'success', message: 'Production run updated' });
      return updated;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update production run' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createOEEMetrics = async (data: Partial<OEEMetrics>) => {
    setLoading(true);
    try {
      const newMetrics = await ProductionEfficiencyService.createOEEMetrics(data);
      setOeeMetrics(await ProductionEfficiencyService.getAllOEEMetrics());
      addToast({ type: 'success', message: 'OEE metrics recorded' });
      return newMetrics;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to record OEE metrics' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Safety Compliance Operations
  const createSafetyIncident = async (data: Partial<SafetyIncident>) => {
    setLoading(true);
    try {
      const newIncident = await SafetyComplianceService.createIncident(data);
      setSafetyIncidents(await SafetyComplianceService.getAllIncidents());
      addToast({ type: 'success', message: 'Safety incident reported' });
      return newIncident;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to report incident' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSafetyIncident = async (incidentId: string, updates: Partial<SafetyIncident>) => {
    setLoading(true);
    try {
      const updated = await SafetyComplianceService.updateIncident(incidentId, updates);
      setSafetyIncidents(await SafetyComplianceService.getAllIncidents());
      addToast({ type: 'success', message: 'Safety incident updated' });
      return updated;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update incident' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createSafetyInspection = async (data: Partial<SafetyInspection>) => {
    setLoading(true);
    try {
      const newInspection = await SafetyComplianceService.createInspection(data);
      setSafetyInspections(await SafetyComplianceService.getAllInspections());
      addToast({ type: 'success', message: 'Safety inspection scheduled' });
      return newInspection;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to create inspection' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSafetyInspection = async (inspectionId: string, updates: Partial<SafetyInspection>) => {
    setLoading(true);
    try {
      const updated = await SafetyComplianceService.updateInspection(inspectionId, updates);
      setSafetyInspections(await SafetyComplianceService.getAllInspections());
      addToast({ type: 'success', message: 'Safety inspection updated' });
      return updated;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update inspection' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createPPEItem = async (data: Partial<PPEInventory>) => {
    setLoading(true);
    try {
      const newItem = await SafetyComplianceService.createPPEItem(data);
      setPpeInventory(await SafetyComplianceService.getAllPPEInventory());
      addToast({ type: 'success', message: 'PPE item added to inventory' });
      return newItem;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to add PPE item' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePPEItem = async (inventoryId: string, updates: Partial<PPEInventory>) => {
    setLoading(true);
    try {
      const updated = await SafetyComplianceService.updatePPEItem(inventoryId, updates);
      setPpeInventory(await SafetyComplianceService.getAllPPEInventory());
      addToast({ type: 'success', message: 'PPE item updated' });
      return updated;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update PPE item' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createSafetyTraining = async (data: Partial<SafetyTraining>) => {
    setLoading(true);
    try {
      const newTraining = await SafetyComplianceService.createTraining(data);
      setSafetyTraining(await SafetyComplianceService.getAllTraining());
      addToast({ type: 'success', message: 'Safety training scheduled' });
      return newTraining;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to schedule training' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSafetyTraining = async (trainingId: string, updates: Partial<SafetyTraining>) => {
    setLoading(true);
    try {
      const updated = await SafetyComplianceService.updateTraining(trainingId, updates);
      setSafetyTraining(await SafetyComplianceService.getAllTraining());
      addToast({ type: 'success', message: 'Safety training updated' });
      return updated;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update training' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    equipment,
    maintenanceSchedules,
    workOrders,
    productionLines,
    productionRuns,
    oeeMetrics,
    safetyIncidents,
    safetyInspections,
    ppeInventory,
    safetyTraining,
    settings,
    alerts,
    loading,
    error,
    toasts,
    createEquipment,
    updateEquipment,
    createMaintenanceSchedule,
    createWorkOrder,
    updateWorkOrder,
    createProductionLine,
    updateProductionLine,
    createProductionRun,
    updateProductionRun,
    createOEEMetrics,
    createSafetyIncident,
    updateSafetyIncident,
    createSafetyInspection,
    updateSafetyInspection,
    createPPEItem,
    updatePPEItem,
    createSafetyTraining,
    updateSafetyTraining,
    loadAllData
  };
};
