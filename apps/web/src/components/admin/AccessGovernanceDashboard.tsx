/**
 * @module AccessGovernanceDashboard
 * @description Access Governance overview — SoD violations summary, active review campaigns,
 *              role-permission matrix, audit trail, and quick actions.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronRight,
  BarChart3,
  Loader2,
  Eye,
  AlertCircle,
  Lock,
  Unlock,
  X,
  Save,
  Check,
  Ban,
} from 'lucide-react';
import {
  AccessGovernanceService,
  type SoDViolation,
  type AccessReviewCampaign,
  type AccessReviewItem,
  type AccessMatrix,
  type SoDRule,
  type CreateReviewCampaignInput,
} from '@/services/accessGovernanceService';

// ── Severity Badge ────────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const config = {
    critical: { label: 'Critical', className: 'bg-red-100 text-red-700 border-red-200' },
    high: { label: 'High', className: 'bg-orange-100 text-orange-700 border-orange-200' },
    medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    low: { label: 'Low', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  }[severity] ?? { label: severity, className: 'bg-slate-100 text-slate-600 border-slate-200' };

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${config.className}`}>
      {config.label}
    </span>
  );
}

// ── Review Progress Bar ───────────────────────────────────────────────────────

function ReviewProgress({ campaign }: { campaign: AccessReviewCampaign }) {
  const pct =
    campaign.totalItems > 0 ? Math.round((campaign.completedItems / campaign.totalItems) * 100) : 0;

  const daysUntilDue = Math.ceil(
    (new Date(campaign.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const barColor = campaign.pendingItems > 0 && daysUntilDue < 7 ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {campaign.completedItems} / {campaign.totalItems} reviewed
        </span>
        <span className={daysUntilDue < 7 ? 'text-red-500 font-medium' : ''}>
          {daysUntilDue <= 0 ? 'Overdue' : `${daysUntilDue}d left`}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          {campaign.approvedItems} approved
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          {campaign.revokedItems} revoked
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
          {campaign.pendingItems} pending
        </span>
      </div>
    </div>
  );
}

// ── Access Matrix Table ───────────────────────────────────────────────────────

function AccessMatrixTable({ matrix }: { matrix: AccessMatrix }) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const _allPermissions = matrix.permissionGroups.flatMap((g) => g.permissions);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-3 py-2 font-medium text-slate-600 sticky left-0 bg-slate-50 border-b border-slate-200 min-w-[200px]">
              Permission
            </th>
            {matrix.roles.map((role) => (
              <th
                key={role}
                className="px-2 py-2 font-medium text-slate-600 text-center border-b border-slate-200 min-w-[80px]"
              >
                <span className="block truncate max-w-[80px]" title={role}>
                  {role}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.permissionGroups.map((group) => (
            <React.Fragment key={group.group}>
              <tr
                className="bg-slate-100 cursor-pointer hover:bg-slate-200 transition-colors"
                onClick={() => setExpandedGroup(expandedGroup === group.group ? null : group.group)}
              >
                <td
                  colSpan={matrix.roles.length + 1}
                  className="px-3 py-2 font-semibold text-slate-700"
                >
                  <span className="flex items-center gap-2">
                    {expandedGroup === group.group ? '▾' : '▸'} {group.group}
                    <span className="text-slate-400 font-normal">
                      ({group.permissions.length} permissions)
                    </span>
                  </span>
                </td>
              </tr>
              {expandedGroup === group.group &&
                group.permissions.map((perm) => (
                  <tr
                    key={perm}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-3 py-2 text-slate-600 font-mono sticky left-0 bg-white border-r border-slate-100">
                      {perm}
                    </td>
                    {matrix.roles.map((role) => (
                      <td key={role} className="px-2 py-2 text-center">
                        {matrix.assignments[role]?.[perm] ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100">
                            <CheckCircle className="h-3 w-3 text-emerald-600" />
                          </span>
                        ) : (
                          <span className="inline-block w-4 h-0.5 bg-slate-200 rounded-full" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── New Campaign Modal ────────────────────────────────────────────────────────

function NewCampaignModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (campaign: AccessReviewCampaign) => void;
}) {
  const [form, setForm] = useState<CreateReviewCampaignInput>({
    name: '',
    description: '',
    reviewType: 'role-certification',
    targetScope: '',
    dueDate: '',
    owners: [],
  });
  const [ownersText, setOwnersText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Campaign name is required.');
      return;
    }
    if (!form.dueDate) {
      setError('Due date is required.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const owners = ownersText
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
      const created = await AccessGovernanceService.createAccessReview({
        ...form,
        dueDate: new Date(form.dueDate).toISOString(),
        owners,
      });
      onCreated(created);
    } catch {
      setError('Failed to create campaign. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">New Access Review Campaign</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        {error && (
          <div className="mx-5 mt-4 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Campaign Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Q3 2026 Role Certification"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Scope and purpose of this review"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Review Type</label>
              <select
                value={form.reviewType}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    reviewType: e.target.value as AccessReviewCampaign['reviewType'],
                  }))
                }
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="role-certification">Role Certification</option>
                <option value="access-rights">Access Rights</option>
                <option value="privileged-access">Privileged Access</option>
                <option value="separation-of-duties">Separation of Duties</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                value={form.dueDate ? form.dueDate.slice(0, 10) : ''}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Target Scope</label>
            <input
              type="text"
              value={form.targetScope}
              onChange={(e) => setForm((p) => ({ ...p, targetScope: e.target.value }))}
              placeholder="e.g., All Engineering roles"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Owners (comma-separated)
            </label>
            <input
              type="text"
              value={ownersText}
              onChange={(e) => setOwnersText(e.target.value)}
              placeholder="compliance-admin, dept-head-eng"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 pt-1">
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
              {submitting ? 'Creating...' : 'Create Campaign'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Review Items Panel ────────────────────────────────────────────────────────

function ReviewItemsPanel({
  campaign,
  onClose,
  onChanged,
}: {
  campaign: AccessReviewCampaign;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [items, setItems] = useState<AccessReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AccessGovernanceService.getReviewItems(campaign.id);
      setItems(data);
    } catch {
      setError('Failed to load review items.');
    } finally {
      setLoading(false);
    }
  }, [campaign.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (itemId: string) => {
    try {
      setActingId(itemId);
      setError(null);
      const updated = await AccessGovernanceService.approveAccess(itemId);
      setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
      onChanged();
    } catch {
      setError('Failed to approve access.');
    } finally {
      setActingId(null);
    }
  };

  const handleRevoke = async (itemId: string) => {
    try {
      setActingId(itemId);
      setError(null);
      const updated = await AccessGovernanceService.revokeAccess(
        itemId,
        'Revoked during access review'
      );
      setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
      onChanged();
    } catch {
      setError('Failed to revoke access.');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white">
          <div>
            <h3 className="font-semibold text-slate-900">Review — {campaign.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{campaign.targetScope}</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        {error && (
          <div className="mx-5 mt-4 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}
        <div className="p-5 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-sm text-slate-500">
              No review items in this campaign yet.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-800">{item.userName}</span>
                    <span className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      {item.role}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        item.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.status === 'revoked'
                            ? 'bg-red-100 text-red-700'
                            : item.status === 'escalated'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
                {item.status === 'pending' ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={actingId === item.id}
                      title="Approve access"
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 disabled:opacity-60 transition-colors"
                    >
                      {actingId === item.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleRevoke(item.id)}
                      disabled={actingId === item.id}
                      title="Revoke access"
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-60 transition-colors"
                    >
                      <Ban className="h-3 w-3" />
                      Revoke
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 shrink-0">
                    {item.reviewedBy ? `by ${item.reviewedBy}` : 'reviewed'}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

interface AccessGovernanceDashboardProps {
  onViewSoDRules?: () => void;
  onViewReview?: (reviewId: string) => void;
}

export function AccessGovernanceDashboard({
  onViewSoDRules,
  onViewReview,
}: AccessGovernanceDashboardProps) {
  const [violations, setViolations] = useState<SoDViolation[]>([]);
  const [rules, setRules] = useState<SoDRule[]>([]);
  const [campaigns, setCampaigns] = useState<AccessReviewCampaign[]>([]);
  const [matrix, setMatrix] = useState<AccessMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [reviewingCampaign, setReviewingCampaign] = useState<AccessReviewCampaign | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [v, r, c, m] = await Promise.all([
        AccessGovernanceService.getSoDViolations(),
        AccessGovernanceService.getSoDRules(),
        AccessGovernanceService.getAccessReviews(),
        AccessGovernanceService.getAccessMatrix(),
      ]);
      setViolations(v);
      setRules(r);
      setCampaigns(c);
      setMatrix(m);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const criticalViolations = violations.filter((v) => v.severity === 'critical');
  const highViolations = violations.filter((v) => v.severity === 'high');
  const _unexceptedViolations = violations.filter((v) => !v.hasException);
  const activeReviews = campaigns.filter((c) => c.status === 'active');
  const totalRuleCount = rules.length;
  const activeRuleCount = rules.filter((r) => r.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Access Governance</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage Segregation of Duties, access reviews, and the role-permission matrix
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Critical Violations',
            value: criticalViolations.length,
            icon: AlertTriangle,
            color: 'text-red-600 bg-red-50',
            alert: criticalViolations.length > 0,
          },
          {
            label: 'High Violations',
            value: highViolations.length,
            icon: AlertCircle,
            color: 'text-orange-600 bg-orange-50',
            alert: false,
          },
          {
            label: 'Active Reviews',
            value: activeReviews.length,
            icon: Eye,
            color: 'text-blue-600 bg-blue-50',
            alert: false,
          },
          {
            label: 'SoD Rules',
            value: `${activeRuleCount}/${totalRuleCount}`,
            icon: Shield,
            color: 'text-emerald-600 bg-emerald-50',
            alert: false,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-white rounded-xl border p-4 ${stat.alert ? 'border-red-300' : 'border-slate-200'}`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Critical Violations Alert */}
      {criticalViolations.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">
                {criticalViolations.length} Critical SoD Violation
                {criticalViolations.length > 1 ? 's' : ''} Detected
              </p>
              <div className="mt-2 space-y-1">
                {criticalViolations.map((v) => (
                  <div
                    key={`${v.userId}-${v.ruleId}`}
                    className="flex items-center gap-2 text-sm text-red-700"
                  >
                    <span className="font-medium">{v.userName}</span>
                    <span>—</span>
                    <span>{v.ruleName}</span>
                    {v.hasException && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                        Exception
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={onViewSoDRules}
              className="text-sm font-medium text-red-700 hover:text-red-800 shrink-0"
            >
              Manage Rules
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SoD Violations Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-slate-900">SoD Violations ({violations.length})</h3>
            </div>
            <button
              onClick={onViewSoDRules}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {violations.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">No active SoD violations detected.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {violations.map((v) => (
                <div
                  key={`${v.userId}-${v.ruleId}`}
                  className={`p-3 rounded-lg border ${
                    v.severity === 'critical'
                      ? 'border-red-200 bg-red-50'
                      : v.severity === 'high'
                        ? 'border-orange-200 bg-orange-50'
                        : 'border-amber-200 bg-amber-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-slate-800">{v.userName}</span>
                        <SeverityBadge severity={v.severity} />
                        {v.hasException && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                            Excepted
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{v.ruleName}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {v.conflictingRoles.map((r) => (
                          <span
                            key={r}
                            className="text-xs bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                    {v.hasException ? (
                      <Unlock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <Lock className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Access Reviews */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-slate-900">Access Reviews ({campaigns.length})</h3>
            </div>
            <button
              onClick={() => setShowNewCampaign(true)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              New Campaign <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-800 truncate">{campaign.name}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          campaign.status === 'active'
                            ? 'bg-blue-100 text-blue-700'
                            : campaign.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{campaign.targetScope}</p>
                  </div>
                  {campaign.status === 'active' && (
                    <button
                      onClick={() =>
                        onViewReview ? onViewReview(campaign.id) : setReviewingCampaign(campaign)
                      }
                      className="shrink-0 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Review
                    </button>
                  )}
                </div>
                <ReviewProgress campaign={campaign} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role-Permission Matrix */}
      {matrix && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold text-slate-900">Role-Permission Matrix</h3>
            <span className="text-xs text-slate-400">Click a group to expand</span>
          </div>
          <AccessMatrixTable matrix={matrix} />
        </div>
      )}

      {/* Recent SoD Rules */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-900">Active SoD Rules</h3>
          </div>
          <button
            onClick={onViewSoDRules}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Manage Rules <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="space-y-2">
          {rules
            .filter((r) => r.isActive)
            .slice(0, 5)
            .map((rule) => (
              <div
                key={rule.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-800">{rule.name}</span>
                    <SeverityBadge severity={rule.severity} />
                    {rule.activeViolations > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
                        {rule.activeViolations} violation{rule.activeViolations > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="font-mono">{rule.entityA}</span>
                    <XCircle className="h-3 w-3 text-red-400" />
                    <span className="font-mono">{rule.entityB}</span>
                  </div>
                </div>
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${rule.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                />
              </div>
            ))}
        </div>
      </div>

      {showNewCampaign && (
        <NewCampaignModal
          onClose={() => setShowNewCampaign(false)}
          onCreated={(campaign) => {
            setCampaigns((prev) => [campaign, ...prev]);
            setShowNewCampaign(false);
          }}
        />
      )}

      {reviewingCampaign && (
        <ReviewItemsPanel
          campaign={reviewingCampaign}
          onClose={() => setReviewingCampaign(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}

export default AccessGovernanceDashboard;
