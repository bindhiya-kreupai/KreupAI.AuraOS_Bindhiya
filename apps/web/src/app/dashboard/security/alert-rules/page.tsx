'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BellRing, Plus, Trash2, Edit2, X, Save, Inbox } from 'lucide-react';
import { SecurityAlertService } from '@/app/dashboard/security/services';
import { ToastContainer } from '@/app/dashboard/security/components/Toast';
import type { Toast as ToastType } from '@/app/dashboard/security/types';

interface AlertRow {
  id: string;
  severity: string;
  category: string;
  source: string;
  description: string;
  affectedUser?: string | null;
  status: string;
}

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const emptyForm = {
  category: '',
  source: '',
  description: '',
  severity: 'MEDIUM',
  affectedUser: '',
};

export default function AlertRulesPage() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const pushToast = useCallback((type: ToastType['type'], message: string) => {
    setToasts((prev) => [...prev, { id: crypto.randomUUID(), type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await SecurityAlertService.getAll();
      setAlerts(result as unknown as AlertRow[]);
    } catch (error: any) {
      pushToast('error', 'Failed to load alert rules');
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (alert: AlertRow) => {
    setForm({
      category: alert.category ?? '',
      source: alert.source ?? '',
      description: alert.description ?? '',
      severity: alert.severity ?? 'MEDIUM',
      affectedUser: alert.affectedUser ?? '',
    });
    setEditId(alert.id);
    setShowForm(true);
  };

  const submit = async () => {
    if (!form.category.trim() || !form.description.trim()) {
      pushToast('warning', 'Category and description are required');
      return;
    }
    setSaving(true);
    const payload = {
      category: form.category.trim(),
      source: form.source.trim() || 'manual',
      description: form.description.trim(),
      severity: form.severity,
      affectedUser: form.affectedUser.trim() || undefined,
    };
    const result = editId
      ? await SecurityAlertService.update(editId, payload as any)
      : await SecurityAlertService.create(payload as any);
    setSaving(false);
    if (result) {
      pushToast('success', editId ? 'Rule updated' : 'Rule created');
      setShowForm(false);
      await fetchData();
    } else {
      pushToast('error', 'Save failed');
    }
  };

  const doDelete = async (id: string) => {
    setSaving(true);
    const ok = await SecurityAlertService.delete(id);
    setSaving(false);
    setConfirmDeleteId(null);
    if (ok) {
      pushToast('success', 'Rule deleted');
      await fetchData();
    } else {
      pushToast('error', 'Delete failed');
    }
  };

  const toggleStatus = async (alert: AlertRow) => {
    const nextStatus = alert.status === 'OPEN' ? 'RESOLVED' : 'OPEN';
    setSaving(true);
    const updated = await SecurityAlertService.update(alert.id, { status: nextStatus } as any);
    setSaving(false);
    if (updated) {
      pushToast('success', `Rule ${nextStatus === 'OPEN' ? 'enabled' : 'disabled'}`);
      await fetchData();
    } else {
      pushToast('error', 'Status update failed');
    }
  };

  const severityBadge = (severity: string) => {
    const s = (severity ?? '').toUpperCase();
    if (s === 'CRITICAL') return 'bg-rose-100 text-rose-600';
    if (s === 'HIGH') return 'bg-amber-100 text-amber-600';
    if (s === 'MEDIUM') return 'bg-indigo-100 text-indigo-600';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BellRing className="w-6 h-6 text-amber-500" />
            Security Alert Rules
          </h1>
          <p className="text-slate-500 text-sm">
            Configure automated triggers and notifications for suspicious activities.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-amber-200 dark:shadow-amber-900/20 hover:bg-amber-600 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Rule
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-800 p-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">{editId ? 'Edit Rule' : 'Add Rule'}</h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Category (e.g. Failed Login)"
              className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm"
            />
            <input
              type="text"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              placeholder="Source (e.g. auth-service)"
              className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm"
            />
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Condition / description"
              className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm md:col-span-2"
            />
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
              className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={form.affectedUser}
              onChange={(e) => setForm({ ...form, affectedUser: e.target.value })}
              placeholder="Affected user (optional)"
              className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm"
            />
          </div>
          <div className="flex justify-end mt-3">
            <button
              type="button"
              onClick={submit}
              disabled={saving}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 overflow-y-auto pb-20">
        {alerts.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Inbox className="w-10 h-10 text-slate-300 mb-3" />
            <p className="font-bold text-slate-500">No alert rules configured</p>
            <p className="text-xs text-slate-400 mt-1">Add a rule to start monitoring.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const active = alert.status === 'OPEN';
            return (
              <div
                key={alert.id}
                className={`p-6 bg-white dark:bg-slate-900 rounded-2xl border ${
                  active
                    ? 'border-slate-200 dark:border-slate-800'
                    : 'border-slate-100 dark:border-slate-800/50 opacity-70'
                } flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-all hover:shadow-md`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                      {alert.category}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${severityBadge(
                        alert.severity
                      )}`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 font-mono bg-slate-50 dark:bg-slate-800 inline-block px-2 py-1 rounded">
                    {alert.description}
                  </p>
                  {alert.source && (
                    <span className="ml-2 text-xs text-slate-400">via {alert.source}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    aria-label="Toggle status"
                    onClick={() => toggleStatus(alert)}
                    disabled={saving}
                    className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors disabled:opacity-50 ${
                      active
                        ? 'bg-emerald-500 justify-end'
                        : 'bg-slate-200 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(alert)}
                    className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {confirmDeleteId === alert.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => doDelete(alert.id)}
                        disabled={saving}
                        className="text-xs font-bold text-rose-600 px-2 py-1 rounded hover:bg-rose-50 disabled:opacity-50"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs font-bold text-slate-400 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(alert.id)}
                      className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
