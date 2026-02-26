/**
 * @module SoDRuleManager
 * @description Segregation of Duties rule manager — rule list, create/edit form,
 *              violation checker with simulation, exception request handling.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  X,
  Save,
  Eye,
} from 'lucide-react';
import {
  AccessGovernanceService,
  type SoDRule,
  type SoDSeverity,
  type SoDConflictType,
  type SoDCheckResult,
  type CreateSoDRuleInput,
} from '@/services/accessGovernanceService';

// ── Severity Badge ────────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: SoDSeverity }) {
  const config = {
    critical: { className: 'bg-red-100 text-red-700 border-red-200' },
    high: { className: 'bg-orange-100 text-orange-700 border-orange-200' },
    medium: { className: 'bg-amber-100 text-amber-700 border-amber-200' },
    low: { className: 'bg-slate-100 text-slate-600 border-slate-200' },
  }[severity];

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${config.className}`}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
}

// ── Rule Card ─────────────────────────────────────────────────────────────────

function RuleCard({
  rule,
  onToggle,
  onEdit,
}: {
  rule: SoDRule;
  onToggle: (id: string, isActive: boolean) => void;
  onEdit: (rule: SoDRule) => void;
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        !rule.isActive
          ? 'border-slate-200 bg-white opacity-60'
          : rule.activeViolations > 0
            ? 'border-red-200 bg-red-50/20'
            : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-slate-900">{rule.name}</span>
            <SeverityBadge severity={rule.severity} />
            {rule.activeViolations > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
                {rule.activeViolations} active violation{rule.activeViolations > 1 ? 's' : ''}
              </span>
            )}
            {!rule.isActive && (
              <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                Inactive
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 mb-2">{rule.description}</p>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
              {rule.entityA}
            </span>
            <XCircle className="h-3 w-3 text-red-400 shrink-0" />
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
              {rule.entityB}
            </span>
            <span className="text-slate-400">({rule.conflictType})</span>
          </div>

          {rule.rationale && (
            <p className="text-xs text-slate-500 mt-1.5 italic">
              <span className="font-medium">Rationale:</span> {rule.rationale}
            </p>
          )}

          {rule.exceptionProcess && (
            <p className="text-xs text-amber-700 mt-1">
              <span className="font-medium">Exception:</span> {rule.exceptionProcess}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={() => onToggle(rule.id, !rule.isActive)}
            title={rule.isActive ? 'Deactivate rule' : 'Activate rule'}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
              rule.isActive ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                rule.isActive ? 'translate-x-4' : 'translate-x-1'
              }`}
              style={{ transform: rule.isActive ? 'translateX(20px)' : 'translateX(2px)' }}
            />
          </button>
          <button
            onClick={() => onEdit(rule)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create Rule Form ──────────────────────────────────────────────────────────

function RuleForm({
  existingRule,
  onSuccess,
  onCancel,
}: {
  existingRule?: SoDRule;
  onSuccess: (rule: SoDRule) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CreateSoDRuleInput>({
    name: existingRule?.name ?? '',
    description: existingRule?.description ?? '',
    conflictType: existingRule?.conflictType ?? 'role-role',
    severity: existingRule?.severity ?? 'high',
    entityA: existingRule?.entityA ?? '',
    entityB: existingRule?.entityB ?? '',
    rationale: existingRule?.rationale ?? '',
    exceptionProcess: existingRule?.exceptionProcess ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.entityA || !form.entityB) {
      setError('Name, Entity A, and Entity B are required.');
      return;
    }
    if (form.entityA === form.entityB) {
      setError('Entity A and Entity B must be different.');
      return;
    }
    try {
      setSubmitting(true);
      const result = await AccessGovernanceService.createSoDRule(form);
      onSuccess(result);
    } catch {
      setError('Failed to save rule.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">
          {existingRule ? 'Edit SoD Rule' : 'New SoD Rule'}
        </h3>
        <button onClick={onCancel} className="p-1 text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Rule Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Payroll Create & Payroll Approve"
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Brief description of the conflict"
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Conflict Type</label>
            <select
              value={form.conflictType}
              onChange={(e) =>
                setForm((p) => ({ ...p, conflictType: e.target.value as SoDConflictType }))
              }
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="role-role">Role vs Role</option>
              <option value="permission-permission">Permission vs Permission</option>
              <option value="role-permission">Role vs Permission</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Severity</label>
            <select
              value={form.severity}
              onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value as SoDSeverity }))}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Entity A *</label>
            <input
              type="text"
              value={form.entityA}
              onChange={(e) => setForm((p) => ({ ...p, entityA: e.target.value }))}
              placeholder="e.g., HR Admin / payroll.create"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Entity B *</label>
            <input
              type="text"
              value={form.entityB}
              onChange={(e) => setForm((p) => ({ ...p, entityB: e.target.value }))}
              placeholder="e.g., Payroll Admin / payroll.approve"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Rationale</label>
          <textarea
            value={form.rationale}
            onChange={(e) => setForm((p) => ({ ...p, rationale: e.target.value }))}
            placeholder="Why is this conflict a control requirement?"
            rows={2}
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Exception Process</label>
          <textarea
            value={form.exceptionProcess}
            onChange={(e) => setForm((p) => ({ ...p, exceptionProcess: e.target.value }))}
            placeholder="How can exceptions be granted? (optional)"
            rows={2}
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {submitting ? 'Saving...' : 'Save Rule'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Violation Checker ─────────────────────────────────────────────────────────

function ViolationChecker() {
  const [userId, setUserId] = useState('');
  const [requestedRole, setRequestedRole] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<SoDCheckResult | null>(null);
  const [showException, setShowException] = useState(false);
  const [exceptionReason, setExceptionReason] = useState('');

  const handleCheck = async () => {
    if (!userId || !requestedRole) return;
    try {
      setChecking(true);
      setResult(null);
      const res = await AccessGovernanceService.checkSoDViolations(userId, requestedRole);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  const availableRoles = [
    'Super Admin',
    'HR Admin',
    'Payroll Admin',
    'Recruiter',
    'Manager',
    'Employee',
    'Auditor',
    'IT Admin',
    'Compliance Auditor',
    'Hiring Approver',
  ];
  const sampleUsers = [
    { id: 'emp-001', label: 'Sarah Johnson (Employee)' },
    { id: 'emp-010', label: 'Robert Chen (IT Admin)' },
    { id: 'emp-020', label: 'Kevin Walsh (Super Admin)' },
    { id: 'emp-021', label: 'Patricia Moon (HR+Payroll Admin)' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="h-5 w-5 text-indigo-500" />
        <h3 className="font-semibold text-slate-900">SoD Violation Checker</h3>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Simulate adding a role to a user to detect SoD conflicts before assignment.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">User</label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select user...</option>
            {sampleUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Role to Assign</label>
          <select
            value={requestedRole}
            onChange={(e) => setRequestedRole(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select role...</option>
            {availableRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleCheck}
        disabled={!userId || !requestedRole || checking}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mb-4"
      >
        {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
        {checking ? 'Checking...' : 'Check for Violations'}
      </button>

      {result && (
        <div className="space-y-3">
          {/* Current Roles */}
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1">Current Roles</p>
            <div className="flex flex-wrap gap-1">
              {result.currentRoles.map((r) => (
                <span
                  key={r}
                  className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Result */}
          {result.violations.length === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">No SoD Violations</p>
                <p className="text-xs text-emerald-600">
                  Assigning <strong>{result.requestedRole}</strong> to this user is safe.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div
                className={`p-3 rounded-lg border ${result.canProceed ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {result.canProceed ? (
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <p
                    className={`text-sm font-semibold ${result.canProceed ? 'text-amber-800' : 'text-red-800'}`}
                  >
                    {result.violations.length} SoD Violation
                    {result.violations.length > 1 ? 's' : ''} Detected
                  </p>
                </div>
                <p className={`text-xs ${result.canProceed ? 'text-amber-700' : 'text-red-700'}`}>
                  {result.requiresException
                    ? 'Assignment blocked — business exception required.'
                    : 'Low severity — can proceed with caution.'}
                </p>
              </div>

              {result.violations.map((v) => (
                <div key={v.ruleId} className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-800">{v.ruleName}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        v.severity === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : v.severity === 'high'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {v.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{v.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Conflict with:{' '}
                    <span className="font-mono text-slate-600">{v.conflictingRole}</span>
                  </p>
                </div>
              ))}

              {result.requiresException && (
                <div>
                  <button
                    onClick={() => setShowException((v) => !v)}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Request Business Exception
                    <ChevronRight
                      className={`h-3.5 w-3.5 transition-transform ${showException ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {showException && (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={exceptionReason}
                        onChange={(e) => setExceptionReason(e.target.value)}
                        placeholder="Provide business justification and compensating controls..."
                        rows={3}
                        className="w-full text-sm px-3 py-2 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                      />
                      <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors">
                        <Save className="h-3.5 w-3.5" />
                        Submit Exception Request
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SoDRuleManager() {
  const [rules, setRules] = useState<SoDRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<SoDSeverity | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<SoDRule | undefined>(undefined);
  const [_togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AccessGovernanceService.getSoDRules();
      setRules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = rules.filter((r) => {
    const matchSearch =
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.entityA.toLowerCase().includes(search.toLowerCase()) ||
      r.entityB.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === 'all' || r.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      setTogglingId(id);
      const updated = await AccessGovernanceService.toggleSoDRule(id, isActive);
      setRules((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  const totalViolations = rules.reduce((sum, r) => sum + r.activeViolations, 0);
  const activeRules = rules.filter((r) => r.isActive).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">SoD Rule Manager</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Define and manage Separation of Duties rules to prevent conflicts of interest
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
            onClick={() => {
              setEditingRule(undefined);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Rule
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Rules', value: rules.length, color: 'text-slate-600 bg-slate-50' },
          { label: 'Active', value: activeRules, color: 'text-emerald-600 bg-emerald-50' },
          {
            label: 'Violations',
            value: totalViolations,
            color: totalViolations > 0 ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-50',
          },
          {
            label: 'Critical Rules',
            value: rules.filter((r) => r.severity === 'critical').length,
            color: 'text-red-600 bg-red-50',
          },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color} border border-current/10`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      {(showForm || editingRule) && (
        <RuleForm
          existingRule={editingRule}
          onSuccess={(rule) => {
            if (editingRule) {
              setRules((prev) => prev.map((r) => (r.id === rule.id ? rule : r)));
            } else {
              setRules((prev) => [rule, ...prev]);
            }
            setShowForm(false);
            setEditingRule(undefined);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingRule(undefined);
          }}
        />
      )}

      {/* Violation Checker */}
      <ViolationChecker />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rules by name or entity..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as SoDSeverity | 'all')}
          className="text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Rule List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-500">
          No SoD rules match the current filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onToggle={handleToggle}
              onEdit={(r) => {
                setEditingRule(r);
                setShowForm(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SoDRuleManager;
