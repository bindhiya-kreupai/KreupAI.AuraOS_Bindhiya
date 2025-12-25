// Time Tracking Custom Hook
import { useState, useEffect, useCallback } from 'react';
import type { Timesheet, Project, Task, Client, TimeTrackingMetrics, TimeTrackingSettings, TimeEntry, TimerSession } from '../types';
import { TimesheetService, ProjectService, TaskService, ClientService, TimerService, TimeTrackingAnalyticsService, TimeTrackingSettingsService } from '../services';
import { timeTrackingData } from '../data';
import { useToast } from '../../components/Toast';

export const useTimeTracking = () => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [timers, setTimers] = useState<TimerSession[]>([]);
  const [metrics, setMetrics] = useState<TimeTrackingMetrics | null>(null);
  const [settings, setSettings] = useState<TimeTrackingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  const loadTimesheets = useCallback(async (filters?: any) => {
    try {
      setIsLoading(true);
      const data = await TimesheetService.getTimesheets(filters);
      setTimesheets(data);
    } catch {
      toast.error(`Failed to load timesheets: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createTimesheet = useCallback(async (timesheet: Timesheet) => {
    try {
      setIsSaving(true);
      const created = await TimesheetService.createTimesheet(timesheet);
      setTimesheets(prev => [...prev, created]);
      toast.success('Timesheet created successfully');
      return created;
    } catch {
      toast.error(`Failed to create timesheet: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateTimesheet = useCallback(async (id: string, updates: Partial<Timesheet>) => {
    try {
      setIsSaving(true);
      const updated = await TimesheetService.updateTimesheet(id, updates);
      setTimesheets(prev => prev.map(t => t.id === id ? updated : t));
      toast.success('Timesheet updated successfully');
      return updated;
    } catch {
      toast.error(`Failed to update timesheet: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const submitTimesheet = useCallback(async (id: string) => {
    try {
      setIsSaving(true);
      const submitted = await TimesheetService.submitTimesheet(id);
      setTimesheets(prev => prev.map(t => t.id === id ? submitted : t));
      toast.success('Timesheet submitted for approval');
      return submitted;
    } catch {
      toast.error(`Failed to submit timesheet: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const approveTimesheet = useCallback(async (id: string, approverId: string, approverName: string) => {
    try {
      setIsSaving(true);
      const approved = await TimesheetService.approveTimesheet(id, approverId, approverName);
      setTimesheets(prev => prev.map(t => t.id === id ? approved : t));
      toast.success('Timesheet approved');
      return approved;
    } catch {
      toast.error(`Failed to approve timesheet: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const addEntry = useCallback(async (timesheetId: string, entry: TimeEntry) => {
    try {
      setIsSaving(true);
      const updated = await TimesheetService.addEntry(timesheetId, entry);
      setTimesheets(prev => prev.map(t => t.id === timesheetId ? updated : t));
      toast.success('Time entry added');
      return updated;
    } catch {
      toast.error(`Failed to add entry: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const loadProjects = useCallback(async (filters?: any) => {
    try {
      setIsLoading(true);
      const data = await ProjectService.getProjects(filters);
      setProjects(data);
    } catch {
      toast.error(`Failed to load projects: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createProject = useCallback(async (project: Project) => {
    try {
      setIsSaving(true);
      const created = await ProjectService.createProject(project);
      setProjects(prev => [...prev, created]);
      toast.success('Project created successfully');
      return created;
    } catch {
      toast.error(`Failed to create project: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const startTimer = useCallback(async (timer: TimerSession) => {
    try {
      setIsSaving(true);
      const started = await TimerService.startTimer(timer);
      setTimers(prev => [...prev, started]);
      toast.success('Timer started');
      return started;
    } catch {
      toast.error(`Failed to start timer: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const stopTimer = useCallback(async (id: string) => {
    try {
      setIsSaving(true);
      const stopped = await TimerService.stopTimer(id);
      setTimers(prev => prev.map(t => t.id === id ? stopped : t));
      toast.success(`Timer stopped - ${stopped.duration?.toFixed(2)} hours logged`);
      return stopped;
    } catch {
      toast.error(`Failed to stop timer: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const loadMetrics = useCallback(async () => {
    try {
      const data = await TimeTrackingAnalyticsService.getMetrics();
      setMetrics(data);
    } catch {
      toast.error(`Failed to load metrics: ${(err as Error).message}`);
    }
  }, [toast]);

  const loadSettings = useCallback(async () => {
    try {
      const data = await TimeTrackingSettingsService.getSettings();
      setSettings(data);
    } catch {
      toast.error(`Failed to load settings: ${(err as Error).message}`);
    }
  }, [toast]);

  const initializeSampleData = useCallback(async () => {
    try {
      setIsSaving(true);
      for (const client of timeTrackingData.clients) await ClientService.createClient(client);
      for (const project of timeTrackingData.projects) await ProjectService.createProject(project);
      for (const task of timeTrackingData.tasks) await TaskService.createTask(task);
      for (const timesheet of timeTrackingData.timesheets) await TimesheetService.createTimesheet(timesheet);
      await loadTimesheets();
      await loadProjects();
      await loadMetrics();
      toast.success('Sample data initialized');
    } catch {
      toast.error(`Failed to initialize data: ${(err as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, [loadTimesheets, loadProjects, loadMetrics, toast]);

  useEffect(() => { loadTimesheets(); loadProjects(); loadMetrics(); loadSettings(); }, []);

  return {
    timesheets, projects, tasks, clients, timers, metrics, settings, isLoading, isSaving, error,
    loadTimesheets, createTimesheet, updateTimesheet, submitTimesheet, approveTimesheet, addEntry,
    loadProjects, createProject, startTimer, stopTimer, loadMetrics, loadSettings, initializeSampleData
  };
};
