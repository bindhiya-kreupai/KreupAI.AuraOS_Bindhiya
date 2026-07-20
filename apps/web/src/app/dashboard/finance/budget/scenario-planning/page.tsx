'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { GitBranch, Play, Save, Trash2, Loader2, Plus, X } from 'lucide-react';
import { BudgetScenarioService } from '../../services';
import { ToastContainer, useToast } from '../../components/Toast';
import type { BudgetScenario, ScenarioType } from '../../types';

interface ScenarioForm {
  scenarioName: string;
  scenarioType: ScenarioType;
  description: string;
  totalAdjustedBudget: string;
}

const EMPTY_FORM: ScenarioForm = {
  scenarioName: '',
  scenarioType: 'baseline',
  description: '',
  totalAdjustedBudget: '',
};

const SCENARIO_TYPES: ScenarioType[] = ['baseline', 'optimistic', 'pessimistic', 'custom'];

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const formatted = `$${abs.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

function deriveImpact(scenario: BudgetScenario): { label: string; isCost: boolean } {
  const variance = scenario.totalVarianceFromBase;
  if (variance == null || Number.isNaN(variance) || variance === 0) {
    return { label: 'No change from base', isCost: false };
  }
  const pct = scenario.variancePercentage;
  const pctLabel =
    pct != null && !Number.isNaN(pct) ? ` (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)` : '';
  return {
    label:
      variance > 0
        ? `${formatCurrency(variance)} Cost${pctLabel}`
        : `${formatCurrency(variance)} Savings${pctLabel}`,
    isCost: variance > 0,
  };
}

export default function ScenarioPlanningPage() {
  const { toasts, showToast, dismissToast } = useToast();

  const [scenarios, setScenarios] = useState<BudgetScenario[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<ScenarioForm>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<BudgetScenario | null>(null);
  const [deleting, setDeleting] = useState(false);

  // id of the scenario currently running or saving (for inline spinners)
  const [runningId, setRunningId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await BudgetScenarioService.getScenarios();
      setScenarios(result);
    } catch (error) {
      console.error('Error loading scenarios:', error);
      showToast('error', 'Failed to load scenarios.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    if (creating) return;
    setShowCreateModal(false);
    setForm(EMPTY_FORM);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.scenarioName.trim()) {
      showToast('warning', 'Scenario name is required.');
      return;
    }
    try {
      setCreating(true);
      const payload: Partial<BudgetScenario> = {
        scenarioName: form.scenarioName.trim(),
        scenarioType: form.scenarioType,
        description: form.description.trim(),
      };
      if (form.totalAdjustedBudget.trim() !== '') {
        const parsed = Number(form.totalAdjustedBudget);
        if (!Number.isNaN(parsed)) {
          payload.totalAdjustedBudget = parsed;
        }
      }
      await BudgetScenarioService.createScenario(payload as BudgetScenario);
      showToast('success', 'Scenario created successfully.');
      setShowCreateModal(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (error) {
      console.error('Error creating scenario:', error);
      showToast('error', 'Failed to create scenario.');
    } finally {
      setCreating(false);
    }
  };

  const handleRun = async (scenario: BudgetScenario) => {
    try {
      setRunningId(scenario.id);
      await BudgetScenarioService.runScenario(scenario.id);
      showToast('success', `Simulation completed for "${scenario.scenarioName}".`);
      await load();
    } catch (error) {
      console.error('Error running scenario:', error);
      showToast('error', 'Failed to run simulation.');
    } finally {
      setRunningId(null);
    }
  };

  const handleSave = async (scenario: BudgetScenario) => {
    try {
      setSavingId(scenario.id);
      await BudgetScenarioService.updateScenario(scenario.id, { status: 'active' });
      showToast('success', `Scenario "${scenario.scenarioName}" saved.`);
      await load();
    } catch (error) {
      console.error('Error saving scenario:', error);
      showToast('error', 'Failed to save scenario.');
    } finally {
      setSavingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await BudgetScenarioService.deleteScenario(deleteTarget.id);
      showToast('success', `Scenario "${deleteTarget.scenarioName}" deleted.`);
      setDeleteTarget(null);
      await load();
    } catch (error) {
      console.error('Error deleting scenario:', error);
      showToast('error', 'Failed to delete scenario.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismissToast} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-indigo-500" />
            Scenario Planning
          </h1>
          <p className="text-slate-500 text-sm">
            Create &apos;What-if&apos; scenarios to test budget resilience.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Play className="w-4 h-4" /> Run New Simulation
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          <span className="ml-2 text-slate-500">Loading scenarios...</span>
        </div>
      ) : scenarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <GitBranch className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="font-bold text-lg">No scenarios yet</h3>
          <p className="text-slate-500 text-sm mb-4">
            Create your first &apos;What-if&apos; scenario to test budget resilience.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Scenario
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {scenarios.map((s) => {
            const impact = deriveImpact(s);
            const isRunning = runningId === s.id;
            const isSaving = savingId === s.id;
            return (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg">{s.scenarioName}</h3>
                  <span className="bg-slate-100 dark:bg-slate-800 text-xs font-bold px-2 py-1 rounded text-slate-500 capitalize">
                    {s.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-6">
                  {s.description || 'No description provided.'}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <span
                    className={`font-bold text-sm ${impact.isCost ? 'text-rose-500' : 'text-emerald-500'}`}
                  >
                    Impact: {impact.label}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleRun(s)}
                      disabled={isRunning}
                      title="Run simulation"
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 disabled:opacity-50"
                    >
                      {isRunning ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave(s)}
                      disabled={isSaving}
                      title="Save scenario"
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(s)}
                      title="Delete scenario"
                      className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-500" /> New Scenario
              </h2>
              <button
                type="button"
                onClick={closeCreateModal}
                disabled={creating}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Scenario Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.scenarioName}
                  onChange={(e) => setForm((f) => ({ ...f, scenarioName: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. High Growth (Aggressive)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Scenario Type</label>
                <select
                  value={form.scenarioType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, scenarioType: e.target.value as ScenarioType }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
                >
                  {SCENARIO_TYPES.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Assumptions and rationale for this scenario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Total Adjusted Budget (optional)
                </label>
                <input
                  type="number"
                  value={form.totalAdjustedBudget}
                  onChange={(e) => setForm((f) => ({ ...f, totalAdjustedBudget: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 2400000"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={creating}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Create Scenario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500">
                <Trash2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">Delete Scenario</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete &quot;{deleteTarget.scenarioName}&quot;? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 flex items-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
