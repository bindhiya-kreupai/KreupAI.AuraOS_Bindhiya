'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Target, Calendar, ArrowRight, Plus, Loader2 } from 'lucide-react';
import { listGoals, createGoal, type DeiGoal } from '../dei-api';
import { useDeiToast, DeiModal, deiInputClass } from '../dei-ui';

const CATEGORIES = [
  { value: 'representation', label: 'Representation' },
  { value: 'hiring', label: 'Hiring' },
  { value: 'retention', label: 'Retention' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'pay_equity', label: 'Pay Equity' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'training', label: 'Training' },
];

const STATUS_COLORS: Record<string, string> = {
  on_track: 'bg-emerald-500',
  at_risk: 'bg-amber-500',
  behind: 'bg-rose-500',
  completed: 'bg-indigo-500',
  not_started: 'bg-slate-400',
};

function progressPct(goal: DeiGoal) {
  const target = Number(goal.targetValue) || 0;
  const current = Number(goal.currentValue) || 0;
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

export default function DeiGoalsPage() {
  const [goals, setGoals] = useState<DeiGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    category: 'representation',
    targetValue: '',
    currentValue: '',
    unit: '%',
    targetDate: '',
  });
  const { notify, ToastViewport } = useDeiToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setGoals(await listGoals());
    } catch {
      notify('error', 'Failed to load goals.');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = useCallback(async () => {
    if (!form.title.trim()) {
      notify('error', 'Goal title is required.');
      return;
    }
    if (!form.targetValue || !Number.isFinite(Number(form.targetValue))) {
      notify('error', 'A numeric target value is required.');
      return;
    }
    try {
      setSubmitting(true);
      await createGoal({
        title: form.title.trim(),
        category: form.category,
        targetValue: Number(form.targetValue),
        currentValue: form.currentValue ? Number(form.currentValue) : 0,
        unit: form.unit,
        targetDate: form.targetDate || undefined,
      });
      notify('success', 'Goal created.');
      setModalOpen(false);
      setForm({
        title: '',
        category: 'representation',
        targetValue: '',
        currentValue: '',
        unit: '%',
        targetDate: '',
      });
      await load();
    } catch {
      notify('error', 'Could not create goal.');
    } finally {
      setSubmitting(false);
    }
  }, [form, notify, load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {ToastViewport}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-500" />
            DEI Goals &amp; OKRs
          </h1>
          <p className="text-slate-500 text-sm">
            Track progress towards organizational diversity objectives.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {goals.map((goal) => {
          const pct = progressPct(goal);
          const statusColor = STATUS_COLORS[goal.status] || 'bg-slate-400';
          const statusLabel = goal.status.replace(/_/g, ' ');
          return (
            <div
              key={goal.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{goal.title}</h3>
                  <div className="text-sm text-slate-500 mt-1">
                    Target: {Number(goal.targetValue)}
                    {goal.unit} • {goal.category.replace(/_/g, ' ')}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold text-white capitalize ${statusColor}`}
                >
                  {statusLabel}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-500">Progress</span>
                  <span>
                    {Number(goal.currentValue)}
                    {goal.unit} / {Number(goal.targetValue)}
                    {goal.unit}
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${statusColor} transition-all duration-1000`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Due:{' '}
                    {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'not set'}
                  </span>
                </div>
                <button
                  onClick={() => setExpanded(expanded === goal.id ? null : goal.id)}
                  className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:underline"
                >
                  {expanded === goal.id ? 'Hide' : 'View'} Key Results{' '}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {expanded === goal.id && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300 space-y-1">
                  {Array.isArray(goal.keyResults) && goal.keyResults.length > 0 ? (
                    (goal.keyResults as string[]).map((kr, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {String(kr)}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">
                      Currently at {pct}% of target. No key results recorded yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={() => setModalOpen(true)}
          className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group min-h-[200px]"
        >
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="font-bold text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300">
            Create Annual Goal
          </h3>
          <p className="text-xs mt-1">Set new diversity targets</p>
        </button>
      </div>

      <DeiModal
        open={modalOpen}
        title="Add New DEI Goal"
        submitLabel="Create"
        submitting={submitting}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      >
        <div>
          <label className="block text-sm font-bold mb-1 text-slate-600 dark:text-slate-300">
            Title
          </label>
          <input
            className={deiInputClass}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Women in leadership to 40%"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-slate-600 dark:text-slate-300">
            Category
          </label>
          <select
            className={deiInputClass}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1">
            <label className="block text-sm font-bold mb-1 text-slate-600 dark:text-slate-300">
              Current
            </label>
            <input
              type="number"
              className={deiInputClass}
              value={form.currentValue}
              onChange={(e) => setForm({ ...form, currentValue: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-bold mb-1 text-slate-600 dark:text-slate-300">
              Target
            </label>
            <input
              type="number"
              className={deiInputClass}
              value={form.targetValue}
              onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
              placeholder="40"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-bold mb-1 text-slate-600 dark:text-slate-300">
              Unit
            </label>
            <input
              className={deiInputClass}
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="%"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-slate-600 dark:text-slate-300">
            Target Date
          </label>
          <input
            type="date"
            className={deiInputClass}
            value={form.targetDate}
            onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
          />
        </div>
      </DeiModal>
    </div>
  );
}
