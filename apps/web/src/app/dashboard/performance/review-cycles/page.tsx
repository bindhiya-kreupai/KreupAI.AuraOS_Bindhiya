'use client';

import React, { useEffect, useState } from 'react';
import { ReviewCycleService } from '../core/services';
import {
  AlertCircle,
  CalendarRange,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  Save,
  Users,
  X,
} from 'lucide-react';

type CycleForm = {
  id?: string;
  cycleName: string;
  cycleType: 'annual' | 'quarterly' | 'monthly' | 'project';
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed';
  isActive: boolean;
};

const emptyCycle: CycleForm = {
  cycleName: '',
  cycleType: 'annual',
  startDate: '',
  endDate: '',
  status: 'planning',
  isActive: true,
};

export default function ReviewCyclesPage() {
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState<any[]>([]);
  const [editing, setEditing] = useState<CycleForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(t);
  }, [status]);

  const loadCycles = async () => {
    setLoading(true);
    try {
      const data = await ReviewCycleService.getCycles();
      setCycles(data || []);
    } catch (error: any) {
      console.error('Failed to load review cycles:', error);
      setStatus({ kind: 'error', text: error?.message || 'Failed to load review cycles.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCycles();
  }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.cycleName.trim() || !editing.startDate || !editing.endDate) {
      setStatus({ kind: 'error', text: 'Name, start date and end date are required.' });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      await ReviewCycleService.createCycle({
        cycleName: editing.cycleName,
        cycleType: editing.cycleType,
        startDate: editing.startDate,
        endDate: editing.endDate,
        status: editing.status,
        isActive: editing.isActive,
      } as any);
      await loadCycles();
      setEditing(null);
      setStatus({ kind: 'success', text: 'Review cycle created.' });
    } catch (e: any) {
      console.error(e);
      setStatus({ kind: 'error', text: e?.message || 'Failed to save review cycle.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarRange className="w-6 h-6 text-indigo-500" />
            Review Cycles
          </h1>
          <p className="text-slate-500 text-sm">Manage performance review periods and timelines.</p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyCycle })}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Cycle
        </button>
      </div>

      {status && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm flex items-center gap-2 ${
            status.kind === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          {status.kind === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {status.text}
        </div>
      )}

      {cycles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <CalendarRange className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-bold text-lg">No review cycles found</p>
          <p className="text-sm mt-1">Create your first review cycle to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {cycles.map((cycle) => {
            const reviewCount = cycle.reviews?.length || 0;
            const completedCount =
              cycle.reviews?.filter((r: any) => r.status === 'completed').length || 0;
            const completionPct =
              reviewCount > 0 ? Math.round((completedCount / reviewCount) * 100) : 0;
            const isCompleted = cycle.status === 'completed';
            const dueDate = cycle.endDate
              ? new Date(cycle.endDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'No end date';

            return (
              <div
                key={cycle.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 group hover:border-indigo-300 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{cycle.cycleName}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        cycle.isActive && cycle.status !== 'completed'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {cycle.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Due: {dueDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {reviewCount} Participants
                    </span>
                  </div>
                </div>

                <div className="flex-1 w-full md:w-auto">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Phase: {cycle.cycleType}
                    </span>
                    <span className="font-bold">{completionPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isCompleted ? 'bg-slate-400' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <button
                    onClick={() =>
                      setEditing({
                        id: cycle.id,
                        cycleName: cycle.cycleName || '',
                        cycleType: (cycle.cycleType as CycleForm['cycleType']) || 'annual',
                        startDate: cycle.startDate
                          ? new Date(cycle.startDate).toISOString().slice(0, 10)
                          : '',
                        endDate: cycle.endDate
                          ? new Date(cycle.endDate).toISOString().slice(0, 10)
                          : '',
                        status: (cycle.status as CycleForm['status']) || 'planning',
                        isActive: !!cycle.isActive,
                      })
                    }
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Manage
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <CycleModal
          form={editing}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={save}
          saving={saving}
        />
      )}
    </div>
  );
}

function CycleModal({
  form,
  onChange,
  onClose,
  onSave,
  saving,
}: {
  form: CycleForm;
  onChange: (f: CycleForm) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold">{form.id ? 'Edit review cycle' : 'New review cycle'}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <label className="block sm:col-span-2">
            <span className="block text-xs font-medium text-slate-500 mb-1">Cycle name</span>
            <input
              value={form.cycleName}
              onChange={(e) => onChange({ ...form, cycleName: e.target.value })}
              placeholder="e.g. Annual review 2026"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-500 mb-1">Type</span>
            <select
              value={form.cycleType}
              onChange={(e) =>
                onChange({ ...form, cycleType: e.target.value as CycleForm['cycleType'] })
              }
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <option value="annual">Annual</option>
              <option value="quarterly">Quarterly</option>
              <option value="monthly">Monthly</option>
              <option value="project">Project-based</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-500 mb-1">Status</span>
            <select
              value={form.status}
              onChange={(e) => onChange({ ...form, status: e.target.value as CycleForm['status'] })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-500 mb-1">Start date</span>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => onChange({ ...form, startDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-500 mb-1">End date</span>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => onChange({ ...form, endDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            />
          </label>
          <label className="flex items-center gap-2 sm:col-span-2 mt-1">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => onChange({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 accent-indigo-600"
            />
            <span className="text-sm">Active cycle</span>
          </label>
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
