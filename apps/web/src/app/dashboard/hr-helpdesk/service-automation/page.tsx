'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Zap, Play, Pause, Settings, Activity, Loader2, AlertCircle, X } from 'lucide-react';
import { AutomationsApi, type AutomationDTO, type AutomationLogDTO } from '../services';

const TRIGGER_TYPES = [
  'ticket_created',
  'request_created',
  'profile_update',
  'new_hire',
  'sla_breach',
  'manual',
] as const;

type Feedback = { kind: 'success' | 'error'; text: string };

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

function statusPillClasses(status: string): string {
  if (status === 'ACTIVE') {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
  }
  if (status === 'PAUSED') {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
  }
  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
}

export default function ServiceAutomationPage() {
  const [automations, setAutomations] = useState<AutomationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [logsFor, setLogsFor] = useState<AutomationDTO | null>(null);
  const [logs, setLogs] = useState<AutomationLogDTO[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTriggerType, setFormTriggerType] = useState<string>(TRIGGER_TYPES[0]);
  const [formTriggerLabel, setFormTriggerLabel] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const loadAutomations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AutomationsApi.list();
      setAutomations(data);
    } catch {
      setError('Failed to load automations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAutomations();
  }, [loadAutomations]);

  useEffect(() => {
    if (!feedback) {
      return;
    }
    const timer = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const handleToggle = useCallback(
    async (automation: AutomationDTO) => {
      const nextStatus = automation.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      setTogglingId(automation.id);
      try {
        const updated = await AutomationsApi.update(automation.id, {
          status: nextStatus,
        });
        if (!updated) {
          setFeedback({ kind: 'error', text: 'Could not update the automation.' });
          return;
        }
        setFeedback({
          kind: 'success',
          text:
            nextStatus === 'ACTIVE'
              ? `Activated "${automation.name}".`
              : `Paused "${automation.name}".`,
        });
        await loadAutomations();
      } catch {
        setFeedback({ kind: 'error', text: 'Could not update the automation.' });
      } finally {
        setTogglingId(null);
      }
    },
    [loadAutomations]
  );

  const openLogs = useCallback(async (automation: AutomationDTO) => {
    setLogsFor(automation);
    setLogs([]);
    setLogsError(null);
    setLogsLoading(true);
    try {
      const data = await AutomationsApi.logs(automation.id);
      setLogs(data);
    } catch {
      setLogsError('Failed to load logs for this automation.');
    } finally {
      setLogsLoading(false);
    }
  }, []);

  const closeLogs = useCallback(() => {
    setLogsFor(null);
    setLogs([]);
    setLogsError(null);
  }, []);

  const openCreate = useCallback(() => {
    setFormName('');
    setFormDescription('');
    setFormTriggerType(TRIGGER_TYPES[0]);
    setFormTriggerLabel('');
    setFormError(null);
    setCreateOpen(true);
  }, []);

  const closeCreate = useCallback(() => {
    setCreateOpen(false);
    setFormError(null);
  }, []);

  const handleCreate = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmedName = formName.trim();
      if (!trimmedName) {
        setFormError('Name is required.');
        return;
      }
      setFormError(null);
      setCreating(true);
      try {
        const created = await AutomationsApi.create({
          name: trimmedName,
          description: formDescription.trim() || undefined,
          triggerType: formTriggerType,
          triggerLabel: formTriggerLabel.trim() || undefined,
        });
        if (!created) {
          setFormError('Could not create the automation.');
          return;
        }
        setCreateOpen(false);
        setFeedback({ kind: 'success', text: `Created "${trimmedName}".` });
        await loadAutomations();
      } catch {
        setFormError('Could not create the automation.');
      } finally {
        setCreating(false);
      }
    },
    [formName, formDescription, formTriggerType, formTriggerLabel, loadAutomations]
  );

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />
            Service Automation
          </h1>
          <p className="text-slate-500 text-sm">
            Configure automated workflows for service requests.
          </p>
        </div>
      </div>

      {feedback ? (
        <div
          className={`shrink-0 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
            feedback.kind === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300'
          }`}
        >
          {feedback.kind === 'error' ? <AlertCircle className="w-4 h-4" /> : null}
          {feedback.text}
        </div>
      ) : null}

      {error ? (
        <div className="shrink-0 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-y-auto">
          {automations.map((automation) => {
            const isActive = automation.status === 'ACTIVE';
            const isToggling = togglingId === automation.id;
            return (
              <div
                key={automation.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{automation.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${statusPillClasses(
                          automation.status
                        )}`}
                      >
                        {automation.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      Trigger: {automation.triggerLabel || automation.triggerType}
                    </p>
                    {automation.description ? (
                      <p className="text-sm text-slate-400 mt-1">{automation.description}</p>
                    ) : null}
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-4 mt-6">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                    <Activity className="w-4 h-4" /> {automation.executions} Runs
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                    <Settings className="w-4 h-4" /> {automation.stepCount} Steps
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => void handleToggle(automation)}
                    disabled={isToggling}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {isToggling ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isActive ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {isActive ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void openLogs(automation)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Activity className="w-4 h-4" /> View Logs
                  </button>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={openCreate}
            className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-6 text-slate-400 hover:text-amber-500 hover:border-amber-500 transition-colors min-h-[12rem]"
          >
            <Zap className="w-12 h-12 mb-2" />
            <span className="font-bold">Create New Automation</span>
          </button>
        </div>
      )}

      {logsFor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl max-h-[80vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-500" /> Logs
                </h2>
                <p className="text-sm text-slate-500">{logsFor.name}</p>
              </div>
              <button
                type="button"
                onClick={closeLogs}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close logs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {logsLoading ? (
                <div className="flex items-center justify-center py-10 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : logsError ? (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4" />
                  {logsError}
                </div>
              ) : logs.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  No log entries yet for this automation.
                </div>
              ) : (
                <ul className="space-y-2">
                  {logs.map((log) => (
                    <li
                      key={log.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${statusPillClasses(
                            log.status
                          )}`}
                        >
                          {log.status}
                        </span>
                        <span className="text-xs text-slate-400">{formatDate(log.createdAt)}</span>
                      </div>
                      {log.message ? (
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                          {log.message}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {createOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form
            onSubmit={(event) => void handleCreate(event)}
            className="w-full max-w-lg flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Create New Automation
              </h2>
              <button
                type="button"
                onClick={closeCreate}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close create form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {formError ? (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4" />
                  {formError}
                </div>
              ) : null}

              <div>
                <label htmlFor="automation-name" className="block text-sm font-medium mb-1">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="automation-name"
                  type="text"
                  value={formName}
                  onChange={(event) => setFormName(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. Laptop Provisioning"
                />
              </div>

              <div>
                <label htmlFor="automation-description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="automation-description"
                  value={formDescription}
                  onChange={(event) => setFormDescription(event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="What does this automation do?"
                />
              </div>

              <div>
                <label htmlFor="automation-trigger-type" className="block text-sm font-medium mb-1">
                  Trigger Type
                </label>
                <select
                  id="automation-trigger-type"
                  value={formTriggerType}
                  onChange={(event) => setFormTriggerType(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {TRIGGER_TYPES.map((trigger) => (
                    <option key={trigger} value={trigger}>
                      {trigger}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="automation-trigger-label"
                  className="block text-sm font-medium mb-1"
                >
                  Trigger Label
                </label>
                <input
                  id="automation-trigger-label"
                  type="text"
                  value={formTriggerLabel}
                  onChange={(event) => setFormTriggerLabel(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. New Request (IT Hardware)"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={closeCreate}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
