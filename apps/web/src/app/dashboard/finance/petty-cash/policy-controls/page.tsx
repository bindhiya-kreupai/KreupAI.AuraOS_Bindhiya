'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Shield,
  DollarSign,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Plus,
  Download,
  BarChart3,
  TrendingUp,
  Package,
  UserCheck,
  Loader2,
  X,
} from 'lucide-react';
import { PettyCashService, PettyCashPolicyService, exportToCsv } from '../../services';
import type { PettyCashPolicy } from '../../services';
import { ToastContainer, useToast } from '../../components/Toast';

interface PolicyFormState {
  policyType: 'approval' | 'category';
  name: string;
  description: string;
  threshold: string;
  approverRole: string;
  monthlyLimit: string;
  requireReceipt: boolean;
  active: boolean;
}

const EMPTY_FORM: PolicyFormState = {
  policyType: 'approval',
  name: '',
  description: '',
  threshold: '',
  approverRole: '',
  monthlyLimit: '',
  requireReceipt: false,
  active: true,
};

export default function PolicyControlsPage() {
  const [activeTab, setActiveTab] = useState<'limits' | 'approvals' | 'categories' | 'compliance'>(
    'limits'
  );
  const [loading, setLoading] = useState(true);

  const [spendingLimits, setSpendingLimits] = useState<any[]>([]);
  const [approvalRules, setApprovalRules] = useState<PettyCashPolicy[]>([]);
  const [categoryRules, setCategoryRules] = useState<PettyCashPolicy[]>([]);

  const { toasts, showToast, dismissToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PolicyFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PettyCashPolicy | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [funds, approvals, categories] = await Promise.all([
        PettyCashService.getFunds(),
        PettyCashPolicyService.getPolicies('approval'),
        PettyCashPolicyService.getPolicies('category'),
      ]);
      setSpendingLimits(funds as any[]);
      setApprovalRules(approvals);
      setCategoryRules(categories);
    } catch (error: any) {
      console.error('Error loading policy controls:', error);
      showToast('error', 'Failed to load policy data');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, policyType: activeTab === 'categories' ? 'category' : 'approval' });
    setModalOpen(true);
  };

  const openEditModal = (policy: PettyCashPolicy) => {
    setEditingId(policy.id);
    setForm({
      policyType: policy.policyType === 'category' ? 'category' : 'approval',
      name: policy.name ?? '',
      description: policy.description ?? '',
      threshold: policy.threshold != null ? String(policy.threshold) : '',
      approverRole: policy.approverRole ?? '',
      monthlyLimit: policy.monthlyLimit != null ? String(policy.monthlyLimit) : '',
      requireReceipt: Boolean(policy.requireReceipt),
      active: Boolean(policy.active),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('warning', 'Policy name is required');
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<PettyCashPolicy> = {
        policyType: form.policyType,
        name: form.name.trim(),
        description: form.description.trim() || null,
        threshold: form.threshold.trim() ? Number(form.threshold) : null,
        approverRole: form.approverRole.trim() || null,
        monthlyLimit: form.monthlyLimit.trim() ? Number(form.monthlyLimit) : null,
        requireReceipt: form.requireReceipt,
        active: form.active,
      };
      if (editingId) {
        await PettyCashPolicyService.updatePolicy(editingId, payload);
        showToast('success', 'Policy updated');
      } else {
        await PettyCashPolicyService.createPolicy(payload);
        showToast('success', 'Policy created');
      }
      closeModal();
      await load();
    } catch (error: any) {
      console.error('Error saving policy:', error);
      showToast('error', error?.message || 'Failed to save policy');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await PettyCashPolicyService.deletePolicy(deleteTarget.id);
      showToast('success', 'Policy deleted');
      setDeleteTarget(null);
      await load();
    } catch (error: any) {
      console.error('Error deleting policy:', error);
      showToast('error', error?.message || 'Failed to delete policy');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    const rows: Array<Record<string, unknown>> = [
      ...approvalRules.map((p) => ({
        policyType: 'approval',
        name: p.name,
        description: p.description ?? '',
        threshold: p.threshold ?? '',
        approverRole: p.approverRole ?? '',
        monthlyLimit: p.monthlyLimit ?? '',
        requireReceipt: p.requireReceipt,
        active: p.active,
      })),
      ...categoryRules.map((p) => ({
        policyType: 'category',
        name: p.name,
        description: p.description ?? '',
        threshold: p.threshold ?? '',
        approverRole: p.approverRole ?? '',
        monthlyLimit: p.monthlyLimit ?? '',
        requireReceipt: p.requireReceipt,
        active: p.active,
      })),
      ...spendingLimits.map((sl) => ({
        policyType: 'spending_limit',
        name: sl.name ?? '',
        description: '',
        threshold: sl.approvalThreshold ?? '',
        approverRole: sl.target ?? '',
        monthlyLimit: sl.monthlyLimit ?? '',
        requireReceipt: '',
        active: sl.status === 'active',
      })),
    ];
    if (rows.length === 0) {
      showToast('info', 'No policies to export');
      return;
    }
    exportToCsv('petty-cash-policies', rows);
    showToast('success', 'Policies exported');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'role':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'department':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'category':
        return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getStatusColor = (active: boolean) => {
    return active
      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  };

  const activeLimits = spendingLimits.filter((sl) => sl.status === 'active').length;
  const activeApprovals = approvalRules.filter((ar) => ar.active).length;
  const allowedCategories = categoryRules.filter((cr) => cr.active).length;
  const avgApprovalThreshold =
    spendingLimits.length > 0
      ? spendingLimits.reduce((sum, sl) => sum + (Number(sl.approvalThreshold) || 0), 0) /
        spendingLimits.length
      : 0;

  const stats = [
    {
      label: 'Active Spending Limits',
      value: activeLimits,
      icon: DollarSign,
      color: 'text-blue-600',
      subtext: `${spendingLimits.length} total rules`,
    },
    {
      label: 'Approval Rules',
      value: activeApprovals,
      icon: UserCheck,
      color: 'text-emerald-600',
      subtext: `${approvalRules.length} workflows`,
    },
    {
      label: 'Allowed Categories',
      value: allowedCategories,
      icon: Package,
      color: 'text-purple-600',
      subtext: `${categoryRules.length} total categories`,
    },
    {
      label: 'Avg Approval Threshold',
      value: `$${avgApprovalThreshold.toFixed(0)}`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      subtext: 'Across all policies',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismissToast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-500" />
            Policy Controls
          </h1>
          <p className="text-slate-500 text-sm">
            Configure spending limits, approval workflows, and compliance rules
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Policies
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Policy
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 shrink-0 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        <button
          className={`px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'limits'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('limits')}
        >
          Spending Limits
        </button>
        <button
          className={`px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'approvals'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('approvals')}
        >
          Approval Workflows
        </button>
        <button
          className={`px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'categories'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('categories')}
        >
          Category Rules
        </button>
        <button
          className={`px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'compliance'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('compliance')}
        >
          Compliance
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Spending Limits Tab */}
        {activeTab === 'limits' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {spendingLimits.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                No spending limits configured yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-4">Policy Name</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Target</th>
                      <th className="p-4">Single Transaction</th>
                      <th className="p-4">Daily Limit</th>
                      <th className="p-4">Monthly Limit</th>
                      <th className="p-4">Approval Threshold</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {spendingLimits.map((limit) => (
                      <tr
                        key={limit.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-bold">{limit.name}</div>
                          <div className="text-xs text-slate-500">{limit.id}</div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${getTypeColor(limit.type)}`}
                          >
                            {limit.type}
                          </span>
                        </td>
                        <td className="p-4 font-medium">{limit.target}</td>
                        <td className="p-4 font-mono font-bold">${limit.singleTransactionLimit}</td>
                        <td className="p-4 font-mono">${limit.dailyLimit}</td>
                        <td className="p-4 font-mono">${limit.monthlyLimit}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {limit.requiresApproval ? (
                              <Lock className="w-4 h-4 text-amber-500" />
                            ) : (
                              <Unlock className="w-4 h-4 text-emerald-500" />
                            )}
                            <span className="font-mono">${limit.approvalThreshold}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(limit.status === 'active')}`}
                          >
                            {limit.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() =>
                              showToast('info', 'Spending limits are managed via funds.')
                            }
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-slate-500" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Approval Workflows Tab */}
        {activeTab === 'approvals' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {approvalRules.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                No approval rules yet. Use &quot;New Policy&quot; to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-4">Rule Name</th>
                      <th className="p-4">Amount Threshold</th>
                      <th className="p-4">Approver Role</th>
                      <th className="p-4">Monthly Limit</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {approvalRules.map((rule) => (
                      <tr
                        key={rule.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-bold">{rule.name}</div>
                          {rule.description && (
                            <div className="text-xs text-slate-500">{rule.description}</div>
                          )}
                        </td>
                        <td className="p-4 font-mono font-bold text-lg">
                          {rule.threshold != null ? `$${rule.threshold}` : '—'}
                        </td>
                        <td className="p-4">
                          {rule.approverRole ? (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-bold">
                              {rule.approverRole}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-4 font-mono">
                          {rule.monthlyLimit != null ? `$${rule.monthlyLimit}` : '—'}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(rule.active)}`}
                          >
                            {rule.active ? 'active' : 'inactive'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(rule)}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4 text-slate-500" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(rule)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Category Rules Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {categoryRules.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                No category rules yet. Use &quot;New Policy&quot; to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-4">Category</th>
                      <th className="p-4">Allowed</th>
                      <th className="p-4">Max Amount</th>
                      <th className="p-4">Receipt Required</th>
                      <th className="p-4">Notes</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {categoryRules.map((rule) => (
                      <tr
                        key={rule.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              <Package className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold">{rule.name}</div>
                              {rule.description && (
                                <div className="text-xs text-slate-500">{rule.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {rule.active ? (
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-bold">Yes</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                              <XCircle className="w-5 h-5" />
                              <span className="font-bold">No</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4 font-mono font-bold text-lg">
                          {rule.threshold != null ? `$${rule.threshold}` : '—'}
                        </td>
                        <td className="p-4">
                          {rule.requireReceipt ? (
                            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                              <FileText className="w-4 h-4" />
                              <span className="text-xs font-bold">Required</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Optional</span>
                          )}
                        </td>
                        <td className="p-4">
                          {rule.config && Object.keys(rule.config).length > 0 ? (
                            <span className="text-xs text-slate-500 font-mono">
                              {JSON.stringify(rule.config)}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(rule)}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4 text-slate-500" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(rule)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Receipt Policy */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  Receipt Policy
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">All purchases over $25 require receipt</p>
                      <p className="text-slate-500">Original or digital receipt acceptable</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Receipt must be submitted within 7 days</p>
                      <p className="text-slate-500">Late submissions require manager approval</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Receipt must show itemized details</p>
                      <p className="text-slate-500">Credit card slips not acceptable</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit Requirements */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                  Audit Requirements
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Monthly reconciliation mandatory</p>
                      <p className="text-slate-500">Must be completed by 5th of each month</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Quarterly audit by Finance team</p>
                      <p className="text-slate-500">Random sampling of 20% transactions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Annual external audit compliance</p>
                      <p className="text-slate-500">All records retained for 7 years</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Violation Policy */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Violation Policy
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">First violation: Written warning</p>
                      <p className="text-slate-500">Documentation sent to manager and HR</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Second violation: Petty cash suspension</p>
                      <p className="text-slate-500">30-day suspension of petty cash access</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Third violation: Permanent revocation</p>
                      <p className="text-slate-500">Escalation to disciplinary action</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* General Guidelines */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-500" />
                  General Guidelines
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Business purposes only</p>
                      <p className="text-slate-500">Personal expenses strictly prohibited</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Advance approval for large purchases</p>
                      <p className="text-slate-500">Over $200 requires pre-approval</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Prompt reimbursement expected</p>
                      <p className="text-slate-500">Submit within 14 days of purchase</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Policy Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold">{editingId ? 'Edit Policy' : 'New Policy'}</h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Policy Type</label>
                <select
                  value={form.policyType}
                  onChange={(e) =>
                    setForm({ ...form, policyType: e.target.value as 'approval' | 'category' })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                >
                  <option value="approval">Approval</option>
                  <option value="category">Category</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Threshold</label>
                  <input
                    type="number"
                    value={form.threshold}
                    onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Monthly Limit</label>
                  <input
                    type="number"
                    value={form.monthlyLimit}
                    onChange={(e) => setForm({ ...form, monthlyLimit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>
              {form.policyType === 'approval' && (
                <div>
                  <label className="block text-sm font-bold mb-1">Approver Role</label>
                  <input
                    type="text"
                    value={form.approverRole}
                    onChange={(e) => setForm({ ...form, approverRole: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              )}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={form.requireReceipt}
                    onChange={(e) => setForm({ ...form, requireReceipt: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Require Receipt
                </label>
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-indigo-500 hover:bg-indigo-600 text-white transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Create Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Policy
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete &quot;{deleteTarget.name}&quot;? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
