'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  CheckCircle,
  Copy,
  GitPullRequest,
  Plus,
  Save,
  Trash2,
  User,
} from 'lucide-react';

type ApproverType = 'REPORTING_MANAGER' | 'DEPARTMENT_HEAD' | 'HR' | 'CUSTOM';
type RequestType =
  | 'LEAVE'
  | 'OVERTIME'
  | 'COMP_OFF'
  | 'WFH'
  | 'SHIFT_SWAP'
  | 'REGULARIZATION'
  | 'TIMESHEET';

type ApprovalLevel = {
  level: number;
  approverType: ApproverType;
  approvers?: string[];
  isRequired: boolean;
  canSkip: boolean;
  autoApproveAfterDays?: number;
};

type Workflow = {
  id: string;
  name: string;
  description?: string;
  requestType: RequestType;
  applicableTo: 'ALL' | 'DEPARTMENT' | 'DESIGNATION' | 'CUSTOM';
  approvalLevels: ApprovalLevel[];
  escalationRules?: {
    enabled: boolean;
    escalateAfterDays?: number;
  };
  isActive: boolean;
};

const REQUEST_TYPES: RequestType[] = [
  'LEAVE',
  'OVERTIME',
  'COMP_OFF',
  'WFH',
  'SHIFT_SWAP',
  'REGULARIZATION',
  'TIMESHEET',
];

const APPROVER_TYPES: ApproverType[] = ['REPORTING_MANAGER', 'DEPARTMENT_HEAD', 'HR', 'CUSTOM'];

const LEVEL_COLORS = [
  'border-indigo-500',
  'border-purple-500',
  'border-pink-500',
  'border-amber-500',
  'border-emerald-500',
];

async function api<T>(
  url: string,
  init?: RequestInit
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.success === false) {
      return {
        ok: false,
        error: json?.error?.message || json?.error || `Request failed (${res.status})`,
      };
    }
    return { ok: true, data: json?.data as T };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Network error' };
  }
}

export default function ApprovalWorkflowPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const r = await api<{ workflows: Workflow[] }>('/api/attendance/approval-workflow');
    if (r.ok && r.data?.workflows) {
      setWorkflows(r.data.workflows);
      if (!selectedId && r.data.workflows.length > 0) setSelectedId(r.data.workflows[0].id);
    } else if (r.error) {
      setStatus({ kind: 'error', text: r.error });
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = workflows.find((w) => w.id === selectedId) || null;

  const updateSelected = (patch: Partial<Workflow>) => {
    if (!selected) return;
    setWorkflows((all) => all.map((w) => (w.id === selected.id ? { ...w, ...patch } : w)));
  };

  const updateLevel = (levelNum: number, patch: Partial<ApprovalLevel>) => {
    if (!selected) return;
    const updated = selected.approvalLevels.map((l) =>
      l.level === levelNum ? { ...l, ...patch } : l
    );
    updateSelected({ approvalLevels: updated });
  };

  const addLevel = () => {
    if (!selected) return;
    const nextLevel = (selected.approvalLevels.length || 0) + 1;
    updateSelected({
      approvalLevels: [
        ...selected.approvalLevels,
        {
          level: nextLevel,
          approverType: 'REPORTING_MANAGER',
          isRequired: true,
          canSkip: false,
        },
      ],
    });
  };

  const removeLevel = (levelNum: number) => {
    if (!selected) return;
    const updated = selected.approvalLevels
      .filter((l) => l.level !== levelNum)
      .map((l, idx) => ({ ...l, level: idx + 1 }));
    updateSelected({ approvalLevels: updated });
  };

  const addEventType = async () => {
    const name = prompt('Workflow name:');
    if (!name?.trim()) return;
    const requestType = prompt(
      `Request type (one of: ${REQUEST_TYPES.join(', ')})`,
      'LEAVE'
    )?.toUpperCase() as RequestType;
    if (!requestType || !REQUEST_TYPES.includes(requestType)) {
      alert('Invalid request type.');
      return;
    }
    setSaving(true);
    const r = await api<Workflow>('/api/attendance/approval-workflow', {
      method: 'POST',
      body: JSON.stringify({
        name,
        requestType,
        applicableTo: 'ALL',
        approvalLevels: [
          { level: 1, approverType: 'REPORTING_MANAGER', isRequired: true, canSkip: false },
        ],
        isActive: true,
      }),
    });
    setSaving(false);
    if (!r.ok) {
      setStatus({ kind: 'error', text: r.error || 'Could not add workflow' });
      return;
    }
    setStatus({ kind: 'success', text: `Added "${name}"` });
    await load();
    if (r.data?.id) setSelectedId(r.data.id);
  };

  const duplicate = async () => {
    if (!selected) return;
    setSaving(true);
    const r = await api<Workflow>('/api/attendance/approval-workflow', {
      method: 'POST',
      body: JSON.stringify({
        name: `${selected.name} (copy)`,
        description: selected.description,
        requestType: selected.requestType,
        applicableTo: selected.applicableTo,
        approvalLevels: selected.approvalLevels,
        escalationRules: selected.escalationRules,
        isActive: selected.isActive,
      }),
    });
    setSaving(false);
    if (!r.ok) {
      setStatus({ kind: 'error', text: r.error || 'Could not duplicate' });
      return;
    }
    setStatus({ kind: 'success', text: 'Duplicated workflow' });
    await load();
    if (r.data?.id) setSelectedId(r.data.id);
  };

  const removeWorkflow = async () => {
    if (!selected) return;
    if (!confirm(`Delete "${selected.name}"?`)) return;
    setSaving(true);
    const r = await api(`/api/attendance/approval-workflow?id=${selected.id}`, {
      method: 'DELETE',
    });
    setSaving(false);
    if (!r.ok) {
      setStatus({ kind: 'error', text: r.error || 'Could not delete' });
      return;
    }
    setSelectedId(null);
    setStatus({ kind: 'success', text: 'Deleted workflow' });
    await load();
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    setStatus(null);
    const r = await api<Workflow>('/api/attendance/approval-workflow', {
      method: 'PUT',
      body: JSON.stringify({
        id: selected.id,
        name: selected.name,
        description: selected.description,
        requestType: selected.requestType,
        applicableTo: selected.applicableTo,
        approvalLevels: selected.approvalLevels,
        escalationRules: selected.escalationRules,
        isActive: selected.isActive,
      }),
    });
    setSaving(false);
    if (!r.ok) {
      setStatus({ kind: 'error', text: r.error || 'Could not save' });
      return;
    }
    setStatus({ kind: 'success', text: 'Workflow saved' });
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <GitPullRequest className="w-6 h-6 text-indigo-500" />
            Approval Workflows
          </h1>
          <p className="text-silver-mist text-sm mt-1">
            Configure approval hierarchies for each request type.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={duplicate}
            disabled={!selected || saving}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            <Copy className="w-4 h-4" /> Duplicate
          </button>
          <button
            onClick={removeWorkflow}
            disabled={!selected || saving}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-rose-200 text-rose-600 text-sm font-medium rounded-lg hover:bg-rose-50 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button
            onClick={save}
            disabled={!selected || saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Workflow'}
          </button>
        </div>
      </div>

      {status && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm ${
            status.kind === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          {status.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-2">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-7 h-7 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : (
            workflows.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedId(w.id)}
                className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${
                  w.id === selectedId
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-700 dark:text-indigo-200'
                    : 'bg-white dark:bg-stellar-blue border-cloud dark:border-nebula-purple/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-semibold flex items-center justify-between">
                  {w.name}
                  {w.id === selectedId && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
                </div>
                <div className="text-xs font-mono opacity-70 mt-0.5">{w.requestType}</div>
              </button>
            ))
          )}
          <button
            onClick={addEventType}
            disabled={saving}
            className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-nebula-purple/40 rounded-xl text-slate-500 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add workflow
          </button>
        </aside>

        {/* Designer */}
        <section className="lg:col-span-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-inner p-6 min-h-[500px]">
          {!selected ? (
            <div className="h-full flex items-center justify-center text-silver-mist text-sm">
              {workflows.length === 0
                ? 'Add a workflow to get started.'
                : 'Select a workflow from the left.'}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Workflow header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="block sm:col-span-2">
                  <span className="block text-xs font-medium text-silver-mist mb-1">
                    Workflow name
                  </span>
                  <input
                    value={selected.name}
                    onChange={(e) => updateSelected({ name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-indigo-200 outline-none"
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-medium text-silver-mist mb-1">
                    Request type
                  </span>
                  <select
                    value={selected.requestType}
                    onChange={(e) => updateSelected({ requestType: e.target.value as RequestType })}
                    className="w-full px-3 py-2 bg-white dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-indigo-200 outline-none"
                  >
                    {REQUEST_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Flow visualization */}
              <div className="flex flex-col items-center pt-4">
                <div className="px-5 py-2 bg-white dark:bg-stellar-blue border border-slate-300 dark:border-slate-700 rounded-full shadow-sm text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                  Request Submitted
                </div>
                <ArrowDown className="w-5 h-5 text-slate-400 mb-2" />

                {selected.approvalLevels.map((lvl, idx) => (
                  <React.Fragment key={lvl.level}>
                    <div
                      className={`w-full max-w-md p-4 bg-white dark:bg-stellar-blue border-l-4 ${
                        LEVEL_COLORS[idx % LEVEL_COLORS.length]
                      } rounded-lg shadow-md`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-indigo-500 uppercase">
                          Level {lvl.level} approver
                        </span>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          {selected.approvalLevels.length > 1 && (
                            <button
                              onClick={() => removeLevel(lvl.level)}
                              className="text-slate-400 hover:text-rose-500"
                              title="Remove level"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <label>
                          <span className="block text-[10px] uppercase font-semibold text-silver-mist mb-0.5">
                            Approver type
                          </span>
                          <select
                            value={lvl.approverType}
                            onChange={(e) =>
                              updateLevel(lvl.level, {
                                approverType: e.target.value as ApproverType,
                              })
                            }
                            className="w-full px-2 py-1.5 bg-pearl dark:bg-slate-900/40 rounded text-sm border border-cloud dark:border-nebula-purple/50"
                          >
                            {APPROVER_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t.replace(/_/g, ' ')}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span className="block text-[10px] uppercase font-semibold text-silver-mist mb-0.5">
                            Auto-approve after (days)
                          </span>
                          <input
                            type="number"
                            value={lvl.autoApproveAfterDays ?? ''}
                            onChange={(e) =>
                              updateLevel(lvl.level, {
                                autoApproveAfterDays: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              })
                            }
                            placeholder="never"
                            className="w-full px-2 py-1.5 bg-pearl dark:bg-slate-900/40 rounded text-sm border border-cloud dark:border-nebula-purple/50"
                          />
                        </label>
                      </div>
                      <div className="flex gap-3 mt-2 text-xs">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={lvl.isRequired}
                            onChange={(e) =>
                              updateLevel(lvl.level, { isRequired: e.target.checked })
                            }
                            className="accent-indigo-600"
                          />
                          <span>Required</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={lvl.canSkip}
                            onChange={(e) => updateLevel(lvl.level, { canSkip: e.target.checked })}
                            className="accent-indigo-600"
                          />
                          <span>Skippable</span>
                        </label>
                      </div>
                    </div>
                    <ArrowDown className="w-5 h-5 text-slate-400 my-2" />
                  </React.Fragment>
                ))}

                <button
                  onClick={addLevel}
                  className="px-4 py-2 mb-2 border-2 border-dashed border-slate-300 dark:border-nebula-purple/40 text-slate-500 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Plus className="w-3 h-3" /> Add approval level
                </button>

                <div className="px-5 py-2 mt-2 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-full text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Final approval
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
