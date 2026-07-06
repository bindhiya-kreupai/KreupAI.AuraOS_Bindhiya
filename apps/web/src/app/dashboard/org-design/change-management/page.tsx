'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  GitPullRequest,
  Calendar,
  Users,
  ArrowRight,
  AlertCircle,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';
import { APIClient } from '@/lib/api-client';
import { ToastContainer } from '../components/Toast';
import type { Toast } from '../types';

interface ChangeInitiative {
  id: string;
  title: string;
  description: string;
  changeType: string;
  changeScope: string;
  status: string;
  completionPercentage: number;
  impactLevel: string;
  ownerName?: string;
  plannedEndDate?: string;
  totalAffected: number;
}

const STATUS_STYLE: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-600',
  in_progress: 'bg-indigo-100 text-indigo-600',
  planning: 'bg-amber-100 text-amber-600',
  approved: 'bg-sky-100 text-sky-600',
  on_hold: 'bg-slate-100 text-slate-500',
  cancelled: 'bg-rose-100 text-rose-600',
};

export default function ChangeManagementPage() {
  const [changes, setChanges] = useState<ChangeInitiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    changeType: 'restructure',
    impactLevel: 'medium',
    ownerName: '',
    plannedEndDate: '',
  });

  const addToast = useCallback((type: Toast['type'], message: string) => {
    setToasts((prev) => [...prev, { id: `t-${Date.now()}-${Math.random()}`, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await APIClient.get<unknown>('/org-design/changes');
      setChanges(APIClient.unwrapList<ChangeInitiative>(res));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load change initiatives');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      addToast('error', 'Title is required');
      return;
    }
    setSaving(true);
    try {
      await APIClient.post('/org-design/changes', {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        changeType: form.changeType,
        impactLevel: form.impactLevel,
        ownerName: form.ownerName.trim() || undefined,
        plannedEndDate: form.plannedEndDate || undefined,
      });
      addToast('success', 'Change initiative created');
      setShowForm(false);
      setForm({
        title: '',
        description: '',
        changeType: 'restructure',
        impactLevel: 'medium',
        ownerName: '',
        plannedEndDate: '',
      });
      await load();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to create initiative');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await APIClient.delete(`/org-design/changes/${id}`);
      addToast('success', 'Initiative deleted');
      await load();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitPullRequest className="w-6 h-6 text-indigo-500" />
            Change Management
          </h1>
          <p className="text-slate-500 text-sm">Plan, execute, and track organizational changes.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Create New Initiative'}
        </button>
      </div>

      {showForm ? (
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Title *
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm"
                placeholder="e.g. Q4 Engineering Reorg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Change Type
              </label>
              <select
                value={form.changeType}
                onChange={(e) => setForm({ ...form, changeType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm"
              >
                <option value="restructure">Restructure</option>
                <option value="merger">Merger</option>
                <option value="acquisition">Acquisition</option>
                <option value="divestiture">Divestiture</option>
                <option value="transformation">Transformation</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Impact
              </label>
              <select
                value={form.impactLevel}
                onChange={(e) => setForm({ ...form, impactLevel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Owner</label>
              <input
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={form.plannedEndDate}
                onChange={(e) => setForm({ ...form, plannedEndDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Initiative
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading initiatives...
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      ) : changes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-2">
          <GitPullRequest className="w-10 h-10" />
          <p className="text-sm">No change initiatives yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Active Initiatives</h3>
          {changes.map((change) => (
            <div
              key={change.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-lg">{change.title}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                        STATUS_STYLE[change.status] ?? 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {change.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{change.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`text-xs font-bold px-2 py-1 rounded border ${
                      change.impactLevel === 'high'
                        ? 'text-rose-600 bg-rose-50 border-rose-100'
                        : 'text-slate-500 bg-slate-50 border-slate-100'
                    }`}
                  >
                    {change.impactLevel} impact
                  </div>
                  <button
                    onClick={() => handleDelete(change.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    aria-label="Delete initiative"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Progress</span>
                  <span>{change.completionPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      change.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${change.completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" /> Owner:
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {change.ownerName || 'Unassigned'}
                  </span>
                </div>
                {change.plannedEndDate ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Due:{' '}
                    {new Date(change.plannedEndDate).toLocaleDateString()}
                  </div>
                ) : null}
                <div className="ml-auto flex items-center gap-1 text-slate-400">
                  <X className="w-3 h-3 hidden" />
                  {change.totalAffected} affected <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
