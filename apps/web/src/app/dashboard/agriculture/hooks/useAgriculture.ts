// Agriculture Module - Custom React Hook
// Manages state and business logic for agriculture operations

'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  SeasonalWorker,
  LaborAssignment,
  SeasonalLaborPool,
  HousingFacility,
  HousingAssignment,
  HousingInspection,
  CropCycle,
  HarvestSchedule,
  AgricultureAnalytics,
  AgricultureSettings,
  Toast,
} from '../types';
import {
  SeasonalLaborService,
  HousingManagementService,
  CropCycleService,
  AgricultureAnalyticsService,
  AgricultureSettingsService,
} from '../services';
import {
  sampleSeasonalWorkers,
  sampleLaborPools,
  sampleHousingFacilities,
  sampleHousingInspections,
  sampleCropCycles,
  sampleHarvestSchedules,
  sampleAgricultureAnalytics,
  sampleAgricultureSettings,
} from '../data';

export const useAgriculture = () => {
  // ============================================================================
  // STATE
  // ============================================================================

  // Seasonal Labor
  const [workers, setWorkers] = useState<SeasonalWorker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<SeasonalWorker | null>(
    null
  );
  const [laborPools, setLaborPools] = useState<SeasonalLaborPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<SeasonalLaborPool | null>(
    null
  );

  // Housing
  const [housingFacilities, setHousingFacilities] = useState<
    HousingFacility[]
  >([]);
  const [selectedFacility, setSelectedFacility] =
    useState<HousingFacility | null>(null);
  const [housingAssignments, setHousingAssignments] = useState<
    HousingAssignment[]
  >([]);
  const [housingInspections, setHousingInspections] = useState<
    HousingInspection[]
  >([]);

  // Crop Cycles
  const [cropCycles, setCropCycles] = useState<CropCycle[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<CropCycle | null>(null);
  const [harvestSchedules, setHarvestSchedules] = useState<HarvestSchedule[]>(
    []
  );

  // Analytics & Settings
  const [analytics, setAnalytics] = useState<AgricultureAnalytics | null>(
    null
  );
  const [settings, setSettings] = useState<AgricultureSettings | null>(null);

  // UI State
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load sample data on first run
      const existingWorkers = await SeasonalLaborService.getAllWorkers();
      if (existingWorkers.length === 0) {
        // Initialize with sample data
        for (const worker of sampleSeasonalWorkers) {
          await SeasonalLaborService.createWorker(worker);
        }
        for (const pool of sampleLaborPools) {
          await SeasonalLaborService.createLaborPool(pool);
        }
        for (const facility of sampleHousingFacilities) {
          await HousingManagementService.createFacility(facility);
        }
        for (const inspection of sampleHousingInspections) {
          await HousingManagementService.createInspection(inspection);
        }
        for (const cycle of sampleCropCycles) {
          await CropCycleService.createCropCycle(cycle);
        }
        for (const schedule of sampleHarvestSchedules) {
          await CropCycleService.createHarvestSchedule(schedule);
        }
      }

      // Load all data
      await Promise.all([
        loadWorkers(),
        loadLaborPools(),
        loadHousingFacilities(),
        loadHousingAssignments(),
        loadHousingInspections(),
        loadCropCycles(),
        loadHarvestSchedules(),
        loadAnalytics(),
        loadSettings(),
      ]);
    } catch (error: any) {
      console.error('Error loading initial data:', error);
      addToast({
        type: 'error',
        message: 'Failed to load agriculture data',
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // SEASONAL LABOR OPERATIONS
  // ============================================================================

  const loadWorkers = async () => {
    try {
      const workerList = await SeasonalLaborService.getAllWorkers();
      setWorkers(workerList);
    } catch (error: any) {
      console.error('Error loading workers:', error);
      addToast({ type: 'error', message: 'Failed to load workers' });
    }
  };

  const createWorker = async (workerData: Partial<SeasonalWorker>) => {
    setLoading(true);
    try {
      const newWorker = await SeasonalLaborService.createWorker(workerData);
      await loadWorkers();
      addToast({
        type: 'success',
        message: `Worker ${newWorker.fullName} created successfully`,
      });
      return newWorker;
    } catch (error: any) {
      console.error('Error creating worker:', error);
      addToast({ type: 'error', message: 'Failed to create worker' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateWorker = async (
    workerId: string,
    updates: Partial<SeasonalWorker>
  ) => {
    setLoading(true);
    try {
      const updated = await SeasonalLaborService.updateWorker(
        workerId,
        updates
      );
      await loadWorkers();
      addToast({
        type: 'success',
        message: 'Worker updated successfully',
      });
      return updated;
    } catch (error: any) {
      console.error('Error updating worker:', error);
      addToast({ type: 'error', message: 'Failed to update worker' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteWorker = async (workerId: string) => {
    setLoading(true);
    try {
      await SeasonalLaborService.deleteWorker(workerId);
      await loadWorkers();
      addToast({
        type: 'success',
        message: 'Worker deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting worker:', error);
      addToast({ type: 'error', message: 'Failed to delete worker' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const searchWorkers = async (query: string, filters?: any) => {
    setLoading(true);
    try {
      const results = await SeasonalLaborService.searchWorkers(query, filters);
      return results;
    } catch (error: any) {
      console.error('Error searching workers:', error);
      addToast({ type: 'error', message: 'Failed to search workers' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const assignWorker = async (workerId: string, assignment: LaborAssignment) => {
    setLoading(true);
    try {
      await SeasonalLaborService.assignWorker(workerId, assignment);
      await loadWorkers();
      addToast({
        type: 'success',
        message: 'Worker assigned successfully',
      });
    } catch (error: any) {
      console.error('Error assigning worker:', error);
      addToast({ type: 'error', message: 'Failed to assign worker' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadLaborPools = async () => {
    try {
      const pools = await SeasonalLaborService.getAllLaborPools();
      setLaborPools(pools);
    } catch (error: any) {
      console.error('Error loading labor pools:', error);
      addToast({ type: 'error', message: 'Failed to load labor pools' });
    }
  };

  const createLaborPool = async (poolData: Partial<SeasonalLaborPool>) => {
    setLoading(true);
    try {
      const newPool = await SeasonalLaborService.createLaborPool(poolData);
      await loadLaborPools();
      addToast({
        type: 'success',
        message: `Labor pool "${newPool.seasonName}" created successfully`,
      });
      return newPool;
    } catch (error: any) {
      console.error('Error creating labor pool:', error);
      addToast({ type: 'error', message: 'Failed to create labor pool' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // HOUSING MANAGEMENT OPERATIONS
  // ============================================================================

  const loadHousingFacilities = async () => {
    try {
      const facilities = await HousingManagementService.getAllFacilities();
      setHousingFacilities(facilities);
    } catch (error: any) {
      console.error('Error loading housing facilities:', error);
      addToast({ type: 'error', message: 'Failed to load housing facilities' });
    }
  };

  const createHousingFacility = async (
    facilityData: Partial<HousingFacility>
  ) => {
    setLoading(true);
    try {
      const newFacility = await HousingManagementService.createFacility(
        facilityData
      );
      await loadHousingFacilities();
      addToast({
        type: 'success',
        message: `Facility "${newFacility.facilityName}" created successfully`,
      });
      return newFacility;
    } catch (error: any) {
      console.error('Error creating housing facility:', error);
      addToast({ type: 'error', message: 'Failed to create housing facility' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateHousingFacility = async (
    facilityId: string,
    updates: Partial<HousingFacility>
  ) => {
    setLoading(true);
    try {
      const updated = await HousingManagementService.updateFacility(
        facilityId,
        updates
      );
      await loadHousingFacilities();
      addToast({
        type: 'success',
        message: 'Housing facility updated successfully',
      });
      return updated;
    } catch (error: any) {
      console.error('Error updating housing facility:', error);
      addToast({ type: 'error', message: 'Failed to update housing facility' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteHousingFacility = async (facilityId: string) => {
    setLoading(true);
    try {
      await HousingManagementService.deleteFacility(facilityId);
      await loadHousingFacilities();
      addToast({
        type: 'success',
        message: 'Housing facility deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting housing facility:', error);
      addToast({ type: 'error', message: 'Failed to delete housing facility' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadHousingAssignments = async () => {
    try {
      const assignments = await HousingManagementService.getAllAssignments();
      setHousingAssignments(assignments);
    } catch (error: any) {
      console.error('Error loading housing assignments:', error);
      addToast({
        type: 'error',
        message: 'Failed to load housing assignments',
      });
    }
  };

  const createHousingAssignment = async (
    assignmentData: Partial<HousingAssignment>
  ) => {
    setLoading(true);
    try {
      const newAssignment = await HousingManagementService.createAssignment(
        assignmentData
      );
      await loadHousingAssignments();
      await loadHousingFacilities();
      addToast({
        type: 'success',
        message: `Worker ${newAssignment.workerName} checked in successfully`,
      });
      return newAssignment;
    } catch (error: any) {
      console.error('Error creating housing assignment:', error);
      addToast({
        type: 'error',
        message: 'Failed to create housing assignment',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkOutFromHousing = async (
    assignmentId: string,
    checkOutCondition: any
  ) => {
    setLoading(true);
    try {
      await HousingManagementService.checkOut(assignmentId, checkOutCondition);
      await loadHousingAssignments();
      await loadHousingFacilities();
      addToast({
        type: 'success',
        message: 'Worker checked out successfully',
      });
    } catch (error: any) {
      console.error('Error checking out:', error);
      addToast({ type: 'error', message: 'Failed to check out' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadHousingInspections = async () => {
    try {
      const inspections = await HousingManagementService.getAllInspections();
      setHousingInspections(inspections);
    } catch (error: any) {
      console.error('Error loading housing inspections:', error);
      addToast({
        type: 'error',
        message: 'Failed to load housing inspections',
      });
    }
  };

  const createHousingInspection = async (
    inspectionData: Partial<HousingInspection>
  ) => {
    setLoading(true);
    try {
      const newInspection = await HousingManagementService.createInspection(
        inspectionData
      );
      await loadHousingInspections();
      addToast({
        type: 'success',
        message: 'Inspection created successfully',
      });
      return newInspection;
    } catch (error: any) {
      console.error('Error creating inspection:', error);
      addToast({ type: 'error', message: 'Failed to create inspection' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // CROP CYCLE OPERATIONS
  // ============================================================================

  const loadCropCycles = async () => {
    try {
      const cycles = await CropCycleService.getAllCropCycles();
      setCropCycles(cycles);
    } catch (error: any) {
      console.error('Error loading crop cycles:', error);
      addToast({ type: 'error', message: 'Failed to load crop cycles' });
    }
  };

  const createCropCycle = async (cycleData: Partial<CropCycle>) => {
    setLoading(true);
    try {
      const newCycle = await CropCycleService.createCropCycle(cycleData);
      await loadCropCycles();
      addToast({
        type: 'success',
        message: `Crop cycle for ${newCycle.cropName} created successfully`,
      });
      return newCycle;
    } catch (error: any) {
      console.error('Error creating crop cycle:', error);
      addToast({ type: 'error', message: 'Failed to create crop cycle' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCropCycle = async (
    cycleId: string,
    updates: Partial<CropCycle>
  ) => {
    setLoading(true);
    try {
      const updated = await CropCycleService.updateCropCycle(cycleId, updates);
      await loadCropCycles();
      addToast({
        type: 'success',
        message: 'Crop cycle updated successfully',
      });
      return updated;
    } catch (error: any) {
      console.error('Error updating crop cycle:', error);
      addToast({ type: 'error', message: 'Failed to update crop cycle' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCropCycle = async (cycleId: string) => {
    setLoading(true);
    try {
      await CropCycleService.deleteCropCycle(cycleId);
      await loadCropCycles();
      addToast({
        type: 'success',
        message: 'Crop cycle deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting crop cycle:', error);
      addToast({ type: 'error', message: 'Failed to delete crop cycle' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCropStage = async (cycleId: string, newStage: any) => {
    setLoading(true);
    try {
      await CropCycleService.updateCropStage(cycleId, newStage);
      await loadCropCycles();
      addToast({
        type: 'success',
        message: `Crop stage updated to ${newStage}`,
      });
    } catch (error: any) {
      console.error('Error updating crop stage:', error);
      addToast({ type: 'error', message: 'Failed to update crop stage' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadHarvestSchedules = async () => {
    try {
      const schedules = await CropCycleService.getAllHarvestSchedules();
      setHarvestSchedules(schedules);
    } catch (error: any) {
      console.error('Error loading harvest schedules:', error);
      addToast({
        type: 'error',
        message: 'Failed to load harvest schedules',
      });
    }
  };

  const createHarvestSchedule = async (
    scheduleData: Partial<HarvestSchedule>
  ) => {
    setLoading(true);
    try {
      const newSchedule = await CropCycleService.createHarvestSchedule(
        scheduleData
      );
      await loadHarvestSchedules();
      addToast({
        type: 'success',
        message: `Harvest schedule for ${newSchedule.cropName} created successfully`,
      });
      return newSchedule;
    } catch (error: any) {
      console.error('Error creating harvest schedule:', error);
      addToast({ type: 'error', message: 'Failed to create harvest schedule' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ANALYTICS OPERATIONS
  // ============================================================================

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const analyticsData = await AgricultureAnalyticsService.getAnalytics();
      setAnalytics(analyticsData);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      addToast({ type: 'error', message: 'Failed to load analytics' });
    } finally {
      setLoading(false);
    }
  };

  const exportAnalyticsReport = async (format: 'pdf' | 'excel') => {
    setLoading(true);
    try {
      const blob = await AgricultureAnalyticsService.exportReport(format);
      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agriculture-analytics.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      addToast({
        type: 'success',
        message: `Analytics report exported as ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      console.error('Error exporting analytics:', error);
      addToast({ type: 'error', message: 'Failed to export analytics report' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // SETTINGS OPERATIONS
  // ============================================================================

  const loadSettings = async () => {
    try {
      const settingsData = await AgricultureSettingsService.getSettings();
      setSettings(settingsData);
    } catch (error: any) {
      console.error('Error loading settings:', error);
      addToast({ type: 'error', message: 'Failed to load settings' });
    }
  };

  const updateSettings = async (updates: Partial<AgricultureSettings>) => {
    setLoading(true);
    try {
      const updated = await AgricultureSettingsService.updateSettings(updates);
      setSettings(updated);
      addToast({
        type: 'success',
        message: 'Settings updated successfully',
      });
      return updated;
    } catch (error: any) {
      console.error('Error updating settings:', error);
      addToast({ type: 'error', message: 'Failed to update settings' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TOAST OPERATIONS
  // ============================================================================

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State - Seasonal Labor
    workers,
    selectedWorker,
    setSelectedWorker,
    laborPools,
    selectedPool,
    setSelectedPool,

    // State - Housing
    housingFacilities,
    selectedFacility,
    setSelectedFacility,
    housingAssignments,
    housingInspections,

    // State - Crop Cycles
    cropCycles,
    selectedCycle,
    setSelectedCycle,
    harvestSchedules,

    // State - Analytics & Settings
    analytics,
    settings,

    // State - UI
    loading,
    toasts,

    // Seasonal Labor Operations
    loadWorkers,
    createWorker,
    updateWorker,
    deleteWorker,
    searchWorkers,
    assignWorker,
    loadLaborPools,
    createLaborPool,

    // Housing Operations
    loadHousingFacilities,
    createHousingFacility,
    updateHousingFacility,
    deleteHousingFacility,
    loadHousingAssignments,
    createHousingAssignment,
    checkOutFromHousing,
    loadHousingInspections,
    createHousingInspection,

    // Crop Cycle Operations
    loadCropCycles,
    createCropCycle,
    updateCropCycle,
    deleteCropCycle,
    updateCropStage,
    loadHarvestSchedules,
    createHarvestSchedule,

    // Analytics Operations
    loadAnalytics,
    exportAnalyticsReport,

    // Settings Operations
    loadSettings,
    updateSettings,

    // Toast Operations
    addToast,
    removeToast,
  };
};
