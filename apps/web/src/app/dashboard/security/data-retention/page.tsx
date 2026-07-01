'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Archive, RotateCcw, Trash, Save, Loader2, Inbox } from 'lucide-react';
import { APIClient } from '@/lib/api-client';
import { ToastContainer } from '@/app/dashboard/security/components/Toast';
import type { Toast as ToastType } from '@/app/dashboard/security/types';

interface PolicyRow {
  id: string;
  category: string;
  description?: string | null;
  retentionDays: number;
  action: string;
  isActive: boolean;
  lastRunAt?: string | null;
}

const ACTIONS = ['archive', 'delete', 'anonymize'];

function formatYears(days: number): string {
  if (days >= 365) {
    const years = Math.round((days / 365) * 10) / 10;
    return `${years} yr`;
  }
  return `${days} d`;
}

export default function DataRetentionPage() {
  const [policies, setPolicies] = useState<PolicyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [resettingId, setResettingId] = useState<string | null>(null);

  const pushToast = useCallback((type: ToastType['type'], message: string) => {
    setToasts((prev) => [...prev, { id: crypto.randomUUID(), type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await APIClient.get('/api/security/data-retention');
      setPolicies(APIClient.unwrapList<PolicyRow>(res));
    } catch {
      pushToast('error', 'Failed to load retention policies');
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const updateField = (id: string, field: keyof PolicyRow, value: string | number | boolean) => {
    setPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      await APIClient.put('/api/security/data-retention', {
        policies: policies.map((p) => ({
          category: p.category,
          retentionDays: p.retentionDays,
          action: p.action,
          isActive: p.isActive,
        })),
      });
      pushToast('success', 'Retention policies updated');
      await fetchData();
    } catch {
      pushToast('error', 'Failed to update policies');
    } finally {
      setSaving(false);
    }
  };

  const resetPolicy = async (id: string) => {
    setResettingId(id);
    try {
      await APIClient.put(`/api/security/data-retention/${id}`, { reset: true });
      pushToast('success', 'Policy reset to default');
      await fetchData();
    } catch {
      pushToast('error', 'Failed to reset policy');
    } finally {
      setResettingId(null);
    }
  };

  const activeCount = policies.filter((p) => p.isActive).length;
  const deleteCount = policies.filter((p) => p.action === 'delete').length;

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Archive className="w-6 h-6 text-indigo-500" />
            Data Retention Policies
          </h1>
          <p className="text-slate-500 text-sm">
            Define how long historical data is stored before auto-archiving or deletion.
          </p>
        </div>
        <button
          onClick={saveAll}
          disabled={saving || loading || policies.length === 0}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{' '}
          Update Policies
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 container mx-auto">
        <div className="lg:col-span-2 overflow-y-auto pb-20 space-y-4">
          {loading ? (
            <div className="p-10 flex items-center justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : policies.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Inbox className="w-8 h-8" />
              <p className="text-sm">No retention policies configured.</p>
            </div>
          ) : (
            policies.map((policy) => (
              <div
                key={policy.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                    {policy.category}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {policy.description || 'Retention policy'}
                  </p>
                  <label className="inline-flex items-center gap-2 mt-2 text-xs font-bold text-slate-500">
                    <input
                      type="checkbox"
                      checked={policy.isActive}
                      onChange={(e) => updateField(policy.id, 'isActive', e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    Active
                  </label>
                </div>

                <div className="flex items-center gap-3 flex-1 w-full">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-center min-w-[120px]">
                    <span className="block text-xs text-slate-400 font-bold uppercase mb-1">
                      Retain (days)
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={policy.retentionDays}
                      onChange={(e) =>
                        updateField(policy.id, 'retentionDays', Number(e.target.value))
                      }
                      className="w-full text-center font-bold text-indigo-600 dark:text-indigo-400 bg-transparent outline-none"
                    />
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      ≈ {formatYears(policy.retentionDays)}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-center min-w-[140px]">
                    <span className="block text-xs text-slate-400 font-bold uppercase mb-1">
                      Then
                    </span>
                    <select
                      value={policy.action}
                      onChange={(e) => updateField(policy.id, 'action', e.target.value)}
                      className="w-full text-center font-bold text-slate-700 dark:text-slate-300 text-xs bg-transparent outline-none"
                    >
                      {ACTIONS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => resetPolicy(policy.id)}
                  disabled={resettingId === policy.id}
                  title="Reset to default"
                  className="text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
                >
                  {resettingId === policy.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-5 h-5" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
            <h3 className="font-bold text-indigo-800 dark:text-indigo-200 mb-3">Policy Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-indigo-600 dark:text-indigo-300">Configured policies</span>
                <span className="font-bold text-indigo-800 dark:text-indigo-100">
                  {policies.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600 dark:text-indigo-300">Active</span>
                <span className="font-bold text-indigo-800 dark:text-indigo-100">
                  {activeCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600 dark:text-indigo-300">Hard-delete rules</span>
                <span className="font-bold text-indigo-800 dark:text-indigo-100">
                  {deleteCount}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-indigo-500/80 dark:text-indigo-300/70 mt-3">
              Figures are derived from your configured retention policies — not from live storage
              metering.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm mb-4 text-slate-500 uppercase tracking-wider">
              Retention Windows
            </h3>
            <div className="space-y-4">
              {policies.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                    {p.action === 'delete' ? (
                      <Trash className="w-4 h-4" />
                    ) : (
                      <Archive className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{p.category}</div>
                    <div className="text-xs text-slate-500">
                      {formatYears(p.retentionDays)} → {p.action}
                    </div>
                  </div>
                </div>
              ))}
              {policies.length === 0 && <p className="text-xs text-slate-400">No policies yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
