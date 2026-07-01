'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  GitBranch,
  Plus,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { APIClient } from '@/lib/api-client';
import { ToastContainer } from '../components/Toast';
import type { Toast } from '../types';

interface Scenario {
  id: string;
  name: string;
  description: string;
  scenarioType: string;
  status: string;
  currentHeadcount: number;
  projectedHeadcount: number;
  headcountDelta: number;
  currentCost: number;
  projectedCost: number;
  costDelta: number;
  costDeltaPercentage: number;
  updatedAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-600',
  implemented: 'bg-sky-100 text-sky-600',
  draft: 'bg-amber-100 text-amber-600',
  under_review: 'bg-indigo-100 text-indigo-600',
  rejected: 'bg-rose-100 text-rose-600',
};

export default function ScenarioPlanningPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selected, setSelected] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    scenarioType: 'growth',
    currentHeadcount: '',
    projectedHeadcount: '',
    currentCost: '',
    projectedCost: '',
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
      const res = await APIClient.get<unknown>('/org-design/scenarios');
      const list = APIClient.unwrapList<Scenario>(res);
      setScenarios(list);
      setSelected((prev) =>
        prev ? (list.find((s) => s.id === prev.id) ?? list[0] ?? null) : (list[0] ?? null)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scenarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast('error', 'Scenario name is required');
      return;
    }
    setSaving(true);
    try {
      await APIClient.post('/org-design/scenarios', {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        scenarioType: form.scenarioType,
        currentHeadcount: Number(form.currentHeadcount) || 0,
        projectedHeadcount: Number(form.projectedHeadcount) || 0,
        currentCost: Number(form.currentCost) || 0,
        projectedCost: Number(form.projectedCost) || 0,
      });
      addToast('success', 'Scenario created');
      setShowForm(false);
      setForm({
        name: '',
        description: '',
        scenarioType: 'growth',
        currentHeadcount: '',
        projectedHeadcount: '',
        currentCost: '',
        projectedCost: '',
      });
      await load();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to create scenario');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await APIClient.delete(`/org-design/scenarios/${id}`);
      addToast('success', 'Scenario deleted');
      await load();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to delete scenario');
    }
  };

  return (
    <div className="space-y-4 pb-6 text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-indigo-500" />
            Scenario Planning
          </h1>
          <p className="text-slate-500 text-sm">
            Model organizational changes and analyze headcount and cost impact.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'New Model'}
        </button>
      </div>

      {showForm ? (
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm"
              placeholder="e.g. Q1 Growth Plan"
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
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
            <select
              value={form.scenarioType}
              onChange={(e) => setForm({ ...form, scenarioType: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm"
            >
              <option value="growth">Growth</option>
              <option value="restructure">Restructure</option>
              <option value="cost_reduction">Cost Reduction</option>
              <option value="merger">Merger</option>
              <option value="what_if">What-if</option>
            </select>
          </div>
          <div />
          <NumberField
            label="Current Headcount"
            value={form.currentHeadcount}
            onChange={(v) => setForm({ ...form, currentHeadcount: v })}
          />
          <NumberField
            label="Projected Headcount"
            value={form.projectedHeadcount}
            onChange={(v) => setForm({ ...form, projectedHeadcount: v })}
          />
          <NumberField
            label="Current Cost"
            value={form.currentCost}
            onChange={(v) => setForm({ ...form, currentCost: v })}
          />
          <NumberField
            label="Projected Cost"
            value={form.projectedCost}
            onChange={(v) => setForm({ ...form, projectedCost: v })}
          />
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Model
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading scenarios...
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[300px]">
              <h3 className="font-bold mb-4">Saved Models</h3>
              {scenarios.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">No scenarios yet.</p>
              ) : (
                <div className="space-y-3">
                  {scenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      onClick={() => setSelected(scenario)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selected?.id === scenario.id
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-400 ring-1 ring-indigo-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-sm">{scenario.name}</div>
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            STATUS_STYLE[scenario.status] ?? 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {scenario.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                        {scenario.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3 h-3" />
                          <span
                            className={
                              scenario.headcountDelta > 0
                                ? 'text-emerald-500'
                                : scenario.headcountDelta < 0
                                  ? 'text-rose-500'
                                  : ''
                            }
                          >
                            {scenario.headcountDelta > 0 ? '+' : ''}
                            {scenario.headcountDelta}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="w-3 h-3" />
                          <span
                            className={
                              scenario.costDelta > 0
                                ? 'text-rose-500'
                                : scenario.costDelta < 0
                                  ? 'text-emerald-500'
                                  : ''
                            }
                          >
                            {scenario.costDeltaPercentage}%
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selected ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{selected.name}</h3>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <DeltaCard
                    label="Projected Headcount"
                    value={selected.projectedHeadcount}
                    delta={selected.headcountDelta}
                    invert={false}
                  />
                  <DeltaCard
                    label="Projected Cost"
                    value={selected.projectedCost}
                    delta={selected.costDelta}
                    invert
                    currency
                  />
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-sm mb-4">Impact Summary</h4>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <Row label="Current Headcount" value={selected.currentHeadcount} />
                    <Row label="Projected Headcount" value={selected.projectedHeadcount} />
                    <Row label="Current Cost" value={`$${selected.currentCost.toLocaleString()}`} />
                    <Row
                      label="Projected Cost"
                      value={`$${selected.projectedCost.toLocaleString()}`}
                    />
                  </dl>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
                Select or create a scenario to view impact analysis.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm"
        min={0}
      />
    </div>
  );
}

function DeltaCard({
  label,
  value,
  delta,
  invert,
  currency,
}: {
  label: string;
  value: number;
  delta: number;
  invert: boolean;
  currency?: boolean;
}) {
  const positiveIsGood = invert ? delta < 0 : delta > 0;
  const color =
    delta === 0 ? 'text-slate-400' : positiveIsGood ? 'text-emerald-500' : 'text-rose-500';
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="text-xs font-bold text-slate-500 uppercase mb-1">{label}</div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold">
          {currency ? `$${value.toLocaleString()}` : value}
        </span>
        <span className={`flex items-center text-sm font-bold mb-1 ${color}`}>
          {delta >= 0 ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 mr-1" />
          )}
          {currency ? `$${Math.abs(delta).toLocaleString()}` : Math.abs(delta)}
        </span>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex justify-between bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-bold">{value}</dd>
    </div>
  );
}
