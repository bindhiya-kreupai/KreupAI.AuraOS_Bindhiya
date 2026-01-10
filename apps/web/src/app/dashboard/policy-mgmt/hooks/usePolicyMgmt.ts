"use client";
import { useState, useEffect, useCallback } from 'react';
import type { Policy, PolicySettings, PolicyAlert } from '../types';
import { PolicyService, PolicySettingsService, AlertsService } from '../services';
import { samplePolicies, samplePolicySettings } from '../data';
interface Toast { type: 'success' | 'error' | 'info'; message: string; }
export const usePolicyMgmt = () => { const [policies, setPolicies] = useState<Policy[]>([]); const [settings, setSettings] = useState<PolicySettings | null>(null); const [alerts, setAlerts] = useState<PolicyAlert[]>([]); const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null); const [toasts, setToasts] = useState<Toast[]>([]);
const addToast = useCallback((toast: Toast) => { setToasts(prev => [...prev, toast]); setTimeout(() => setToasts(prev => prev.slice(1)), 5000); }, []);
const loadAllData = useCallback(async () => { setLoading(true); try { const [polData, settingsData] = await Promise.all([PolicyService.getAll(), PolicySettingsService.get()]); if (polData.length === 0) { for (const p of samplePolicies) await PolicyService.create(p); setPolicies(samplePolicies); } else setPolicies(polData); if (!settingsData) { await PolicySettingsService.update(samplePolicySettings); setSettings(samplePolicySettings); } else setSettings(settingsData); } catch (error) { setError(err instanceof Error ? err.message : 'Failed to load data'); addToast({ type: 'error', message: 'Failed to load policy data' }); } finally { setLoading(false); } }, [addToast]);
useEffect(() => { loadAllData(); }, [loadAllData]);
const createPolicy = async (data: Partial<Policy>) => { setLoading(true); try { const pol = await PolicyService.create(data); setPolicies(await PolicyService.getAll()); addToast({ type: 'success', message: 'Policy created' }); return pol; } catch (error) { addToast({ type: 'error', message: 'Failed to create policy' }); throw error; } finally { setLoading(false); } };
const updatePolicy = async (id: string, updates: Partial<Policy>) => { setLoading(true); try { const pol = await PolicyService.update(id, updates); setPolicies(await PolicyService.getAll()); addToast({ type: 'success', message: 'Policy updated' }); return pol; } catch (error) { addToast({ type: 'error', message: 'Failed to update policy' }); throw error; } finally { setLoading(false); } };
return { policies, settings, alerts, loading, error, toasts, createPolicy, updatePolicy, loadAllData }; };
