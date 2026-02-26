'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Save,
  X,
  Info,
} from 'lucide-react';
import type { ExpensePolicy } from '@/services/expenseService';
import { ExpenseService } from '@/services/expenseService';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ExpensePolicyManagerProps {
  adminView?: boolean;
}

// ── Policy Card ────────────────────────────────────────────────────────────────

function PolicyCard({
  policy,
  onEdit,
  onToggle,
}: {
  policy: ExpensePolicy;
  onEdit: (policy: ExpensePolicy) => void;
  onToggle: (policyId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Card header */}
      <div className="flex items-start gap-4 p-5">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            policy.isActive
              ? 'bg-emerald-50 dark:bg-emerald-900/20'
              : 'bg-slate-100 dark:bg-slate-800'
          }`}
        >
          <Shield
            className={`w-5 h-5 ${policy.isActive ? 'text-emerald-500' : 'text-slate-400'}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {policy.policyName}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {policy.policyCode} &middot; v{policy.version} &middot; Effective{' '}
                {policy.effectiveDate}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  policy.isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {policy.isActive ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                {policy.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{policy.description}</p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Shield className="w-3.5 h-3.5" />
              {policy.rules.length} rule{policy.rules.length !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle className="w-3.5 h-3.5" />
              {policy.approvalWorkflow.approvalLevels.length} approval level
              {policy.approvalWorkflow.approvalLevels.length !== 1 ? 's' : ''}
            </div>
            {policy.approvalWorkflow.autoApproveThreshold !== undefined && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                <CheckCircle className="w-3.5 h-3.5" />
                Auto-approve under ${policy.approvalWorkflow.autoApproveThreshold}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              Submit within {policy.submissionDeadline}d
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(policy)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggle(policy.id)}
            className={`p-2 rounded-lg transition-colors ${
              policy.isActive
                ? 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
            }`}
          >
            {policy.isActive ? (
              <XCircle className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expand / collapse */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800/50 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-t border-slate-100 dark:border-slate-800"
      >
        <span>Policy Rules & Settings</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="p-5 space-y-5 border-t border-slate-100 dark:border-slate-800">
          {/* Rules */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Policy Rules
            </h4>
            <div className="space-y-2">
              {policy.rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      rule.isEnforced
                        ? 'bg-red-50 dark:bg-red-900/20'
                        : 'bg-amber-50 dark:bg-amber-900/20'
                    }`}
                  >
                    {rule.isEnforced ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                      <Info className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {rule.ruleName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{rule.message}</p>
                    <div className="flex gap-2 mt-1.5">
                      <span className="inline-flex px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">
                        {rule.action.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          rule.isEnforced
                            ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                        }`}
                      >
                        {rule.isEnforced ? 'Enforced' : 'Advisory'}
                      </span>
                      {rule.threshold !== undefined && (
                        <span className="inline-flex px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">
                          Threshold: ${rule.threshold}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {policy.rules.length === 0 && (
                <p className="text-sm text-slate-400 italic">No rules defined</p>
              )}
            </div>
          </div>

          {/* Approval workflow */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Approval Workflow
            </h4>
            <div className="flex flex-col gap-2">
              {policy.approvalWorkflow.approvalLevels.map((level) => (
                <div
                  key={level.level}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-indigo-600">{level.level}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">
                      {level.approverType.replace(/_/g, ' ')}
                    </p>
                    {level.amountThreshold && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        Required for amounts &gt; ${level.amountThreshold}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      level.required ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {level.required ? 'Required' : 'Optional'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Receipt requirements */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Receipt Requirements
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                {
                  label: 'Required above',
                  value: policy.receiptRequirements.threshold
                    ? `$${policy.receiptRequirements.threshold}`
                    : 'Always',
                },
                {
                  label: 'Max file size',
                  value: `${(policy.receiptRequirements.maxFileSize / 1048576).toFixed(0)}MB`,
                },
                {
                  label: 'Allowed formats',
                  value: policy.receiptRequirements.allowedFormats.join(', ').toUpperCase(),
                },
                { label: 'OCR enabled', value: policy.receiptRequirements.allowOCR ? 'Yes' : 'No' },
                {
                  label: 'Retention',
                  value: `${policy.receiptRequirements.retentionPeriod} years`,
                },
              ].map((item) => (
                <div key={item.label} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Edit/Create Policy Form ────────────────────────────────────────────────────

function PolicyForm({
  policy,
  onSave,
  onCancel,
}: {
  policy: Partial<ExpensePolicy>;
  onSave: (data: Partial<ExpensePolicy>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<ExpensePolicy>>(policy);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {policy.id ? 'Edit Policy' : 'Create New Policy'}
        </h3>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Policy Name *
          </label>
          <input
            type="text"
            value={form.policyName ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, policyName: e.target.value }))}
            placeholder="e.g., Standard Travel Policy"
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Policy Code *
          </label>
          <input
            type="text"
            value={form.policyCode ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, policyCode: e.target.value }))}
            placeholder="e.g., EXP-POLICY-003"
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Description
          </label>
          <textarea
            value={form.description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            placeholder="Describe the scope and purpose of this policy..."
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Effective Date
          </label>
          <input
            type="date"
            value={form.effectiveDate ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, effectiveDate: e.target.value }))}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Submission Deadline (days)
          </label>
          <input
            type="number"
            value={form.submissionDeadline ?? 30}
            onChange={(e) =>
              setForm((f) => ({ ...f, submissionDeadline: parseInt(e.target.value) }))
            }
            min={1}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive ?? true}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Active Policy</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.allowLateSubmission ?? true}
              onChange={(e) => setForm((f) => ({ ...f, allowLateSubmission: e.target.checked }))}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Allow late submission
            </span>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => onSave(form)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Policy
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function ExpensePolicyManager({ adminView = true }: ExpensePolicyManagerProps) {
  const [policies, setPolicies] = useState<ExpensePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPolicy, setEditingPolicy] = useState<Partial<ExpensePolicy> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    ExpenseService.getExpensePolicies()
      .then(setPolicies)
      .finally(() => setLoading(false));
  }, []);

  const filtered = policies.filter((p) => {
    if (filterActive === 'active') return p.isActive;
    if (filterActive === 'inactive') return !p.isActive;
    return true;
  });

  const handleToggle = async (policyId: string) => {
    const policy = policies.find((p) => p.id === policyId);
    if (!policy) return;
    const updated = await ExpenseService.updateExpensePolicy(policyId, {
      isActive: !policy.isActive,
    });
    setPolicies((prev) => prev.map((p) => (p.id === policyId ? updated : p)));
  };

  const handleSave = async (data: Partial<ExpensePolicy>) => {
    if (data.id) {
      const updated = await ExpenseService.updateExpensePolicy(data.id, data);
      setPolicies((prev) => prev.map((p) => (p.id === data.id ? updated : p)));
    } else {
      const created = await ExpenseService.createExpensePolicy(
        data as Omit<ExpensePolicy, 'id' | 'createdDate' | 'lastModified'>
      );
      setPolicies((prev) => [...prev, created]);
    }
    setShowForm(false);
    setEditingPolicy(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Expense Policies</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage expense policies, rules, and approval workflows
          </p>
        </div>
        {adminView && (
          <button
            onClick={() => {
              setEditingPolicy({});
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Policy
          </button>
        )}
      </div>

      {/* Create/Edit form */}
      {showForm && editingPolicy !== null && (
        <PolicyForm
          policy={editingPolicy}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingPolicy(null);
          }}
        />
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'active', 'inactive'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterActive(f)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors capitalize ${
              filterActive === f
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {f} (
            {f === 'all'
              ? policies.length
              : f === 'active'
                ? policies.filter((p) => p.isActive).length
                : policies.filter((p) => !p.isActive).length}
            )
          </button>
        ))}
      </div>

      {/* Policy list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Shield className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No policies found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              onEdit={(p) => {
                setEditingPolicy(p);
                setShowForm(true);
              }}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
