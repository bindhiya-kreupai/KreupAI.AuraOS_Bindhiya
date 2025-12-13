"use client";
import { useState, useEffect, useCallback } from 'react';
import { TipPool, Event, HousekeepingTask, HospitalitySettings, HospitalityAlert } from '../types';
import { TipManagementService, EventStaffingService, HousekeepingService, HospitalitySettingsService, AlertsService } from '../services';
import { sampleTipPools, sampleEvents, sampleTasks, sampleHospitalitySettings } from '../data';
interface Toast { type: 'success' | 'error' | 'info'; message: string; }
export const useHospitality = () => {
  const [tipPools, setTipPools] = useState<TipPool[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [settings, setSettings] = useState<HospitalitySettings | null>(null);
  const [alerts, setAlerts] = useState<HospitalityAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((toast: Toast) => { setToasts(prev => [...prev, toast]); setTimeout(() => setToasts(prev => prev.slice(1)), 5000); }, []);
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [poolsData, eventsData, tasksData, settingsData] = await Promise.all([TipManagementService.getAllTipPools(), EventStaffingService.getAllEvents(), HousekeepingService.getAllTasks(), HospitalitySettingsService.getSettings()]);
      if (poolsData.length === 0) { for (const p of sampleTipPools) await TipManagementService.createTipPool(p); setTipPools(sampleTipPools); } else setTipPools(poolsData);
      if (eventsData.length === 0) { for (const e of sampleEvents) await EventStaffingService.createEvent(e); setEvents(sampleEvents); } else setEvents(eventsData);
      if (tasksData.length === 0) { for (const t of sampleTasks) await HousekeepingService.createTask(t); setTasks(sampleTasks); } else setTasks(tasksData);
      if (!settingsData) { await HospitalitySettingsService.updateSettings(sampleHospitalitySettings); setSettings(sampleHospitalitySettings); } else setSettings(settingsData);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load data'); addToast({ type: 'error', message: 'Failed to load hospitality data' }); }
    finally { setLoading(false); }
  }, [addToast]);
  useEffect(() => { loadAllData(); }, [loadAllData]);
  const createTipPool = async (data: Partial<TipPool>) => {
    setLoading(true);
    try { const pool = await TipManagementService.createTipPool(data); setTipPools(await TipManagementService.getAllTipPools()); addToast({ type: 'success', message: 'Tip pool created' }); return pool; }
    catch (err) { addToast({ type: 'error', message: 'Failed to create tip pool' }); throw err; }
    finally { setLoading(false); }
  };
  const createEvent = async (data: Partial<Event>) => {
    setLoading(true);
    try { const event = await EventStaffingService.createEvent(data); setEvents(await EventStaffingService.getAllEvents()); addToast({ type: 'success', message: 'Event created' }); return event; }
    catch (err) { addToast({ type: 'error', message: 'Failed to create event' }); throw err; }
    finally { setLoading(false); }
  };
  const createTask = async (data: Partial<HousekeepingTask>) => {
    setLoading(true);
    try { const task = await HousekeepingService.createTask(data); setTasks(await HousekeepingService.getAllTasks()); addToast({ type: 'success', message: 'Task created' }); return task; }
    catch (err) { addToast({ type: 'error', message: 'Failed to create task' }); throw err; }
    finally { setLoading(false); }
  };
  const updateTask = async (taskId: string, updates: Partial<HousekeepingTask>) => {
    setLoading(true);
    try { const task = await HousekeepingService.updateTask(taskId, updates); setTasks(await HousekeepingService.getAllTasks()); addToast({ type: 'success', message: 'Task updated' }); return task; }
    catch (err) { addToast({ type: 'error', message: 'Failed to update task' }); throw err; }
    finally { setLoading(false); }
  };
  return { tipPools, events, tasks, settings, alerts, loading, error, toasts, createTipPool, createEvent, createTask, updateTask, loadAllData };
};
