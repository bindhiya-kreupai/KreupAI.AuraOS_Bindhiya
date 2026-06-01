// Shift Management Custom Hook
import { useState, useEffect, useCallback } from 'react';
import type {
  Shift,
  ShiftAssignment,
  ShiftPattern,
  ShiftTemplate,
  ShiftSwapRequest,
  ShiftPreference,
  ShiftSchedule,
  ShiftMetrics,
  ShiftSettings
} from '../types';
import {
  ShiftService,
  ShiftAssignmentService,
  ShiftPatternService,
  ShiftTemplateService,
  ShiftSwapService,
  ShiftScheduleService,
  ShiftAnalyticsService,
  ShiftSettingsService
} from '../services';
import { shiftData } from '../data';
import { useToast } from '../components/Toast';

export const useShifts = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [patterns, setPatterns] = useState<ShiftPattern[]>([]);
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([]);
  const [schedules, setSchedules] = useState<ShiftSchedule[]>([]);
  const [metrics, setMetrics] = useState<ShiftMetrics | null>(null);
  const [settings, setSettings] = useState<ShiftSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  // Shift operations
  const loadShifts = useCallback(async (filters?: any) => {
    try {
      setIsLoading(true);
      const data = await ShiftService.getShifts(filters);
      setShifts(data);
    } catch (error: any) {
      toast.error(`Failed to load shifts: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createShift = useCallback(async (shift: Shift) => {
    try {
      setIsSaving(true);
      const created = await ShiftService.createShift(shift);
      setShifts(prev => [...prev, created]);
      toast.success('Shift created successfully');
      return created;
    } catch (error: any) {
      toast.error(`Failed to create shift: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateShift = useCallback(async (id: string, updates: Partial<Shift>) => {
    try {
      setIsSaving(true);
      const updated = await ShiftService.updateShift(id, updates);
      setShifts(prev => prev.map(s => s.id === id ? updated : s));
      toast.success('Shift updated successfully');
      return updated;
    } catch (error: any) {
      toast.error(`Failed to update shift: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const deleteShift = useCallback(async (id: string) => {
    try {
      setIsSaving(true);
      await ShiftService.deleteShift(id);
      setShifts(prev => prev.filter(s => s.id !== id));
      toast.success('Shift deleted successfully');
    } catch (error: any) {
      toast.error(`Failed to delete shift: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const cancelShift = useCallback(async (id: string, reason: string) => {
    try {
      setIsSaving(true);
      const cancelled = await ShiftService.cancelShift(id, reason);
      setShifts(prev => prev.map(s => s.id === id ? cancelled : s));
      toast.success('Shift cancelled');
      return cancelled;
    } catch (error: any) {
      toast.error(`Failed to cancel shift: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const duplicateShift = useCallback(async (id: string, newDate: string) => {
    try {
      setIsSaving(true);
      const duplicate = await ShiftService.duplicateShift(id, newDate);
      setShifts(prev => [...prev, duplicate]);
      toast.success('Shift duplicated successfully');
      return duplicate;
    } catch (error: any) {
      toast.error(`Failed to duplicate shift: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Assignment operations
  const assignEmployee = useCallback(async (shiftId: string, employeeId: string, employeeName: string, employeeEmail: string, assignedBy: string) => {
    try {
      setIsSaving(true);
      const assignment = await ShiftAssignmentService.assignEmployee(shiftId, employeeId, employeeName, employeeEmail, assignedBy);

      // Update shift in local state
      const shift = await ShiftService.getShiftById(shiftId);
      if (shift) {
        setShifts(prev => prev.map(s => s.id === shiftId ? shift : s));
      }

      toast.success('Employee assigned to shift');
      return assignment;
    } catch (error: any) {
      toast.error(`Failed to assign employee: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const unassignEmployee = useCallback(async (shiftId: string, employeeId: string) => {
    try {
      setIsSaving(true);
      await ShiftAssignmentService.unassignEmployee(shiftId, employeeId);

      // Update shift in local state
      const shift = await ShiftService.getShiftById(shiftId);
      if (shift) {
        setShifts(prev => prev.map(s => s.id === shiftId ? shift : s));
      }

      toast.success('Employee unassigned from shift');
    } catch (error: any) {
      toast.error(`Failed to unassign employee: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const checkIn = useCallback(async (assignmentId: string, checkInTime: string) => {
    try {
      setIsSaving(true);
      const assignment = await ShiftAssignmentService.checkIn(assignmentId, checkInTime);
      toast.success('Checked in successfully');
      return assignment;
    } catch (error: any) {
      toast.error(`Failed to check in: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const checkOut = useCallback(async (assignmentId: string, checkOutTime: string) => {
    try {
      setIsSaving(true);
      const assignment = await ShiftAssignmentService.checkOut(assignmentId, checkOutTime);
      toast.success(`Checked out successfully - ${assignment.actualDuration?.toFixed(2)} hours worked`);
      return assignment;
    } catch (error: any) {
      toast.error(`Failed to check out: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Template operations
  const loadTemplates = useCallback(async (filters?: any) => {
    try {
      const data = await ShiftTemplateService.getTemplates(filters);
      setTemplates(data);
    } catch (error: any) {
      toast.error(`Failed to load templates: ${(error as Error).message}`);
    }
  }, [toast]);

  const createTemplate = useCallback(async (template: ShiftTemplate) => {
    try {
      setIsSaving(true);
      const created = await ShiftTemplateService.createTemplate(template);
      setTemplates(prev => [...prev, created]);
      toast.success('Template created successfully');
      return created;
    } catch (error: any) {
      toast.error(`Failed to create template: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateTemplate = useCallback(async (id: string, updates: Partial<ShiftTemplate>) => {
    try {
      setIsSaving(true);
      const updated = await ShiftTemplateService.updateTemplate(id, updates);
      setTemplates(prev => prev.map(t => t.id === id ? updated : t));
      toast.success('Template updated successfully');
      return updated;
    } catch (error: any) {
      toast.error(`Failed to update template: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      setIsSaving(true);
      await ShiftTemplateService.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('Template deleted successfully');
    } catch (error: any) {
      toast.error(`Failed to delete template: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Pattern operations
  const loadPatterns = useCallback(async (filters?: any) => {
    try {
      const data = await ShiftPatternService.getPatterns(filters);
      setPatterns(data);
    } catch (error: any) {
      toast.error(`Failed to load patterns: ${(error as Error).message}`);
    }
  }, [toast]);

  const createPattern = useCallback(async (pattern: ShiftPattern) => {
    try {
      setIsSaving(true);
      const created = await ShiftPatternService.createPattern(pattern);
      setPatterns(prev => [...prev, created]);
      toast.success('Pattern created successfully');
      return created;
    } catch (error: any) {
      toast.error(`Failed to create pattern: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updatePattern = useCallback(async (id: string, updates: Partial<ShiftPattern>) => {
    try {
      setIsSaving(true);
      const updated = await ShiftPatternService.updatePattern(id, updates);
      setPatterns(prev => prev.map(p => p.id === id ? updated : p));
      toast.success('Pattern updated successfully');
      return updated;
    } catch (error: any) {
      toast.error(`Failed to update pattern: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const deletePattern = useCallback(async (id: string) => {
    try {
      setIsSaving(true);
      await ShiftPatternService.deletePattern(id);
      setPatterns(prev => prev.filter(p => p.id !== id));
      toast.success('Pattern deleted successfully');
    } catch (error: any) {
      toast.error(`Failed to delete pattern: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const generateShiftsFromPattern = useCallback(async (patternId: string, startDate: string, endDate: string) => {
    try {
      setIsSaving(true);
      const generatedShifts = await ShiftPatternService.generateShiftsFromPattern(patternId, startDate, endDate);
      setShifts(prev => [...prev, ...generatedShifts]);
      toast.success(`Generated ${generatedShifts.length} shifts from pattern`);
      return generatedShifts;
    } catch (error: any) {
      toast.error(`Failed to generate shifts: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Swap request operations
  const loadSwapRequests = useCallback(async (filters?: any) => {
    try {
      const data = await ShiftSwapService.getSwapRequests(filters);
      setSwapRequests(data);
    } catch (error: any) {
      toast.error(`Failed to load swap requests: ${(error as Error).message}`);
    }
  }, [toast]);

  const createSwapRequest = useCallback(async (swap: ShiftSwapRequest) => {
    try {
      setIsSaving(true);
      const created = await ShiftSwapService.createSwapRequest(swap);
      setSwapRequests(prev => [...prev, created]);
      toast.success('Swap request submitted');
      return created;
    } catch (error: any) {
      toast.error(`Failed to create swap request: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const approveSwap = useCallback(async (id: string, approverId: string, approverName: string) => {
    try {
      setIsSaving(true);
      const approved = await ShiftSwapService.approveSwap(id, approverId, approverName);
      setSwapRequests(prev => prev.map(s => s.id === id ? approved : s));

      // Reload shifts to reflect the swap
      await loadShifts();

      toast.success('Shift swap approved');
      return approved;
    } catch (error: any) {
      toast.error(`Failed to approve swap: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast, loadShifts]);

  const rejectSwap = useCallback(async (id: string, reason: string) => {
    try {
      setIsSaving(true);
      const rejected = await ShiftSwapService.rejectSwap(id, reason);
      setSwapRequests(prev => prev.map(s => s.id === id ? rejected : s));
      toast.success('Shift swap rejected');
      return rejected;
    } catch (error: any) {
      toast.error(`Failed to reject swap: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Schedule operations
  const loadSchedules = useCallback(async (filters?: any) => {
    try {
      const data = await ShiftScheduleService.getSchedules(filters);
      setSchedules(data);
    } catch (error: any) {
      toast.error(`Failed to load schedules: ${(error as Error).message}`);
    }
  }, [toast]);

  const createSchedule = useCallback(async (schedule: ShiftSchedule) => {
    try {
      setIsSaving(true);
      const created = await ShiftScheduleService.createSchedule(schedule);
      setSchedules(prev => [...prev, created]);
      toast.success('Schedule created successfully');
      return created;
    } catch (error: any) {
      toast.error(`Failed to create schedule: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const publishSchedule = useCallback(async (id: string, publishedBy: string) => {
    try {
      setIsSaving(true);
      const published = await ShiftScheduleService.publishSchedule(id, publishedBy);
      setSchedules(prev => prev.map(s => s.id === id ? published : s));
      toast.success('Schedule published - Employees have been notified');
      return published;
    } catch (error: any) {
      toast.error(`Failed to publish schedule: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const analyzeCoverage = useCallback(async (scheduleId: string) => {
    try {
      const coverage = await ShiftScheduleService.analyzeCoverage(scheduleId);
      return coverage;
    } catch (error: any) {
      toast.error(`Failed to analyze coverage: ${(error as Error).message}`);
      return null;
    }
  }, [toast]);

  // Analytics
  const loadMetrics = useCallback(async () => {
    try {
      const data = await ShiftAnalyticsService.getMetrics();
      setMetrics(data);
    } catch (error: any) {
      toast.error(`Failed to load metrics: ${(error as Error).message}`);
    }
  }, [toast]);

  // Settings
  const loadSettings = useCallback(async () => {
    try {
      const data = await ShiftSettingsService.getSettings();
      setSettings(data);
    } catch (error: any) {
      toast.error(`Failed to load settings: ${(error as Error).message}`);
    }
  }, [toast]);

  const updateSettings = useCallback(async (updates: Partial<ShiftSettings>) => {
    try {
      setIsSaving(true);
      const updated = await ShiftSettingsService.updateSettings(updates);
      setSettings(updated);
      toast.success('Settings updated successfully');
      return updated;
    } catch (error: any) {
      toast.error(`Failed to update settings: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Initialize sample data
  const initializeSampleData = useCallback(async () => {
    try {
      setIsSaving(true);

      // Create templates
      for (const template of shiftData.templates) {
        await ShiftTemplateService.createTemplate(template);
      }

      // Create patterns
      for (const pattern of shiftData.patterns) {
        await ShiftPatternService.createPattern(pattern);
      }

      // Create shifts
      for (const shift of shiftData.shifts) {
        await ShiftService.createShift(shift);
      }

      // Create swap requests
      for (const swap of shiftData.swapRequests) {
        await ShiftSwapService.createSwapRequest(swap);
      }

      await loadShifts();
      await loadTemplates();
      await loadPatterns();
      await loadSwapRequests();
      await loadMetrics();

      toast.success('Sample data initialized');
    } catch (error: any) {
      toast.error(`Failed to initialize data: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, [loadShifts, loadTemplates, loadPatterns, loadSwapRequests, loadMetrics, toast]);

  useEffect(() => {
    loadShifts();
    loadTemplates();
    loadPatterns();
    loadSwapRequests();
    loadSchedules();
    loadMetrics();
    loadSettings();
  }, []);

  return {
    // State
    shifts,
    templates,
    patterns,
    swapRequests,
    schedules,
    metrics,
    settings,
    isLoading,
    isSaving,
    error,

    // Shift operations
    loadShifts,
    createShift,
    updateShift,
    deleteShift,
    cancelShift,
    duplicateShift,

    // Assignment operations
    assignEmployee,
    unassignEmployee,
    checkIn,
    checkOut,

    // Template operations
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,

    // Pattern operations
    loadPatterns,
    createPattern,
    updatePattern,
    deletePattern,
    generateShiftsFromPattern,

    // Swap operations
    loadSwapRequests,
    createSwapRequest,
    approveSwap,
    rejectSwap,

    // Schedule operations
    loadSchedules,
    createSchedule,
    publishSchedule,
    analyzeCoverage,

    // Analytics & Settings
    loadMetrics,
    loadSettings,
    updateSettings,
    initializeSampleData
  };
};
