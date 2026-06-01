/**
 * @module DelegationManager
 * @description Workflow delegation manager — create delegations, view active/history,
 *              out-of-office toggle, and circular delegation detection.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Shield,
  ArrowRight,
  History,
  UserCheck,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  WorkflowAutomationService,
  type DelegationRule,
  type CreateDelegationInput,
} from '@/services/workflowAutomationService';

// ── Module Options ─────────────────────────────────────────────────────────────

const MODULE_OPTIONS = [
  { value: 'leave', label: 'Leave Management' },
  { value: 'expenses', label: 'Expense Management' },
  { value: 'approvals', label: 'General Approvals' },
  { value: 'performance', label: 'Performance Reviews' },
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'timesheets', label: 'Timesheets' },
  { value: 'documents', label: 'Document Approvals' },
];

// ── Delegation Card ───────────────────────────────────────────────────────────

function DelegationCard({
  rule,
  onRevoke,
}: {
  rule: DelegationRule;
  onRevoke: (id: string) => void;
}) {
  const isExpired = new Date(rule.endDate) < new Date();
  const daysLeft = Math.ceil(
    (new Date(rule.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        rule.conflictsDetected?.length
          ? 'border-red-300 bg-red-50'
          : rule.isActive && !isExpired
            ? 'border-emerald-200 bg-emerald-50/40'
            : 'border-slate-200 bg-white opacity-70'
      }`}
    >
      {/* Conflict Warning */}
      {rule.conflictsDetected && rule.conflictsDetected.length > 0 && (
        <div className="flex items-start gap-2 mb-3 p-2 bg-red-100 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-red-700">Conflict Detected</p>
            {rule.conflictsDetected.map((c, i) => (
              <p key={i} className="text-xs text-red-600">
                {c}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="text-center shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xs font-bold text-blue-700">
                {rule.delegatorName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 w-16 truncate">
              {rule.delegatorName.split(' ')[0]}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
          <div className="text-center shrink-0">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-xs font-bold text-purple-700">
                {rule.delegateName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 w-16 truncate">
              {rule.delegateName.split(' ')[0]}
            </p>
          </div>
        </div>

        {rule.isActive && !isExpired && (
          <button
            onClick={() => onRevoke(rule.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
            title="Revoke delegation"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <span className="font-medium">{rule.delegatorName}</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-medium text-purple-700">{rule.delegateName}</span>
          {rule.isOutOfOffice && (
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
              Out of Office
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600">
          <span className="font-medium">Reason:</span> {rule.reason}
        </p>

        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {new Date(rule.startDate).toLocaleDateString()} —{' '}
            {new Date(rule.endDate).toLocaleDateString()}
          </span>
          {rule.isActive && !isExpired && daysLeft > 0 && (
            <span
              className={`ml-1 font-medium ${daysLeft <= 3 ? 'text-amber-600' : 'text-slate-600'}`}
            >
              ({daysLeft}d remaining)
            </span>
          )}
          {isExpired && <span className="ml-1 text-slate-400">(Expired)</span>}
        </div>

        <div className="flex flex-wrap gap-1 mt-1">
          {rule.modules.map((m) => {
            const opt = MODULE_OPTIONS.find((o) => o.value === m);
            return (
              <span
                key={m}
                className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
              >
                {opt?.label ?? m}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Create Form ───────────────────────────────────────────────────────────────

function CreateDelegationForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (rule: DelegationRule) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CreateDelegationInput>({
    delegatorId: 'current-user',
    delegateId: '',
    modules: [],
    reason: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isOutOfOffice: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleModule = (value: string) => {
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.includes(value)
        ? prev.modules.filter((m) => m !== value)
        : [...prev.modules, value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.delegateId.trim()) {
      setError('Delegate ID is required.');
      return;
    }
    if (form.modules.length === 0) {
      setError('Select at least one module to delegate.');
      return;
    }
    if (!form.reason.trim()) {
      setError('Reason is required.');
      return;
    }
    if (!form.endDate) {
      setError('End date is required.');
      return;
    }
    if (form.delegatorId === form.delegateId) {
      setError('Cannot delegate to yourself.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const result = await WorkflowAutomationService.createDelegation(form);
      onSuccess(result);
    } catch {
      setError('Failed to create delegation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-blue-50 rounded-xl border border-blue-200 p-5 space-y-4"
    >
      <h4 className="font-semibold text-slate-900">New Delegation</h4>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Delegate To (User ID) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.delegateId}
            onChange={(e) => setForm((p) => ({ ...p, delegateId: e.target.value }))}
            placeholder="emp-011"
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <p className="text-xs text-slate-400 mt-0.5">Enter colleague&apos;s employee ID</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Reason</label>
          <input
            type="text"
            value={form.reason}
            onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
            placeholder="e.g., Vacation, Parental Leave"
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">End Date</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Out of Office Toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setForm((p) => ({ ...p, isOutOfOffice: !p.isOutOfOffice }))}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            form.isOutOfOffice ? 'bg-amber-500' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform ${
              form.isOutOfOffice ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-sm text-slate-700">Out of Office auto-delegation</span>
      </div>

      {/* Module Selection */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-2">
          Modules to Delegate <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {MODULE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm ${
                form.modules.includes(opt.value)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
              }`}
            >
              <input
                type="checkbox"
                checked={form.modules.includes(opt.value)}
                onChange={() => toggleModule(opt.value)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                  form.modules.includes(opt.value)
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-slate-300'
                }`}
              >
                {form.modules.includes(opt.value) && (
                  <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-white">
                    <path
                      d="M10 3L5 8.5L2 5.5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                )}
              </div>
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserCheck className="h-4 w-4" />
          )}
          {submitting ? 'Creating...' : 'Create Delegation'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function DelegationManager() {
  const [rules, setRules] = useState<DelegationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<'active' | 'history'>('active');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await WorkflowAutomationService.getDelegationRules();
      setRules(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this delegation?')) return;
    await WorkflowAutomationService.revokeDelegation(id);
    await load();
  };

  const activeRules = rules.filter((r) => r.isActive && new Date(r.endDate) >= new Date());
  const historicalRules = rules.filter((r) => !r.isActive || new Date(r.endDate) < new Date());

  const displayRules = tab === 'active' ? activeRules : historicalRules;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Delegation Manager</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage approval and task delegations for team members
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Delegation
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-semibold">About Delegations</p>
          <p>
            Delegations temporarily transfer your approval authority to a colleague. The delegate
            can act on your behalf for the selected modules during the specified period.
          </p>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <CreateDelegationForm
          onSuccess={(rule) => {
            setRules((prev) => [rule, ...prev]);
            setShowCreate(false);
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Active',
            value: activeRules.length,
            icon: CheckCircle,
            color: 'text-emerald-600 bg-emerald-50',
          },
          {
            label: 'Conflicts',
            value: rules.filter((r) => (r.conflictsDetected?.length ?? 0) > 0).length,
            icon: AlertTriangle,
            color: 'text-red-600 bg-red-50',
          },
          { label: 'Total', value: rules.length, icon: Users, color: 'text-blue-600 bg-blue-50' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3"
          >
            <div className={`p-2.5 rounded-lg ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {(['active', 'history'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              tab === t
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'active' ? (
              <span className="flex items-center gap-1.5">
                <UserCheck className="h-4 w-4" />
                Active ({activeRules.length})
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <History className="h-4 w-4" />
                History ({historicalRules.length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Delegation List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : displayRules.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">
            {tab === 'active' ? 'No active delegations' : 'No delegation history'}
          </p>
          {tab === 'active' && (
            <p className="text-xs text-slate-400 mt-1">
              Create a delegation to allow a colleague to act on your behalf.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayRules.map((rule) => (
            <DelegationCard key={rule.id} rule={rule} onRevoke={handleRevoke} />
          ))}
        </div>
      )}
    </div>
  );
}

export default DelegationManager;
