/**
 * @module FeatureFlagDashboard
 * @description Feature flag management dashboard — flag list, targeting rules,
 *              rollout percentage slider, whitelists, audit log, and create form.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Flag,
  Search,
  Plus,
  ChevronRight,
  X,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Shield,
  Users,
  Building2,
  Percent,
  Clock,
  History,
  Save,
} from 'lucide-react';
import {
  FeatureFlagService,
  type FeatureFlag,
  type FlagStatus,
  type CreateFlagInput,
  type UpdateFlagInput,
} from '@/services/featureFlagService';

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: FlagStatus }) {
  const config = {
    enabled: {
      label: 'Enabled',
      className: 'bg-emerald-100 text-emerald-700',
      dot: 'bg-emerald-500',
    },
    disabled: { label: 'Disabled', className: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
    partial: {
      label: 'Partial Rollout',
      className: 'bg-amber-100 text-amber-700',
      dot: 'bg-amber-500',
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.className}`}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────

function ToggleSwitch({
  enabled,
  onChange,
  disabled,
  size = 'md',
}: {
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}) {
  const sm = size === 'sm';
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        enabled ? 'bg-blue-600' : 'bg-slate-300'
      } ${sm ? 'h-5 w-9' : 'h-6 w-11'}`}
    >
      <span
        className={`inline-block rounded-full bg-white shadow transition-transform ${
          sm ? 'h-3.5 w-3.5' : 'h-4 w-4'
        } ${enabled ? (sm ? 'translate-x-4.5' : 'translate-x-6') : 'translate-x-1'}`}
        style={{ transform: enabled ? `translateX(${sm ? '20px' : '26px'})` : 'translateX(2px)' }}
      />
    </button>
  );
}

// ── Flag Row ──────────────────────────────────────────────────────────────────

function FlagRow({
  flag,
  onToggle,
  onSelect,
  selected,
}: {
  flag: FeatureFlag;
  onToggle: () => void;
  onSelect: () => void;
  selected: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
        selected ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-900">{flag.name}</span>
          <StatusBadge status={flag.status} />
          {flag.isPermanent && (
            <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
              Permanent
            </span>
          )}
          {flag.isProductionCritical && (
            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
              Critical
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-400 font-mono">{flag.key}</span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-400">{flag.module}</span>
          {flag.targeting.percentageRollout && (
            <>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-amber-600 font-medium">
                {flag.targeting.percentageRollout.percentage}% rollout
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
        <ToggleSwitch enabled={flag.isEnabled} onChange={onToggle} size="sm" />
        <ChevronRight
          className={`h-4 w-4 transition-transform ${selected ? 'text-blue-500 rotate-90' : 'text-slate-400'}`}
        />
      </div>
    </div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

function FlagDetailPanel({
  flag,
  onUpdate,
  onClose,
}: {
  flag: FeatureFlag;
  onUpdate: (flag: FeatureFlag) => void;
  onClose: () => void;
}) {
  const [rolloutPct, setRolloutPct] = useState(flag.targeting.percentageRollout?.percentage ?? 100);
  const [userWhitelist, setUserWhitelist] = useState(
    (flag.targeting.userWhitelist ?? []).join('\n')
  );
  const [tenantWhitelist, setTenantWhitelist] = useState(
    (flag.targeting.tenantWhitelist ?? []).join('\n')
  );
  const [roleWhitelist, setRoleWhitelist] = useState(
    (flag.targeting.roleWhitelist ?? []).join('\n')
  );
  const [saving, setSaving] = useState(false);

  const _hasPartialTargeting =
    flag.targeting.percentageRollout ||
    (flag.targeting.tenantWhitelist?.length ?? 0) > 0 ||
    (flag.targeting.userWhitelist?.length ?? 0) > 0 ||
    (flag.targeting.roleWhitelist?.length ?? 0) > 0;

  const [enablePercentage, setEnablePercentage] = useState(!!flag.targeting.percentageRollout);

  const handleSave = async () => {
    try {
      setSaving(true);
      const update: UpdateFlagInput = {
        targeting: {
          percentageRollout:
            enablePercentage && rolloutPct < 100
              ? { enabled: true, percentage: rolloutPct }
              : undefined,
          userWhitelist: userWhitelist
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          tenantWhitelist: tenantWhitelist
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          roleWhitelist: roleWhitelist
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
        },
      };
      const updated = await FeatureFlagService.updateFlag(flag.key, update);
      onUpdate(updated);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">{flag.name}</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{flag.key}</p>
          <p className="text-sm text-slate-600 mt-1">{flag.description}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {flag.isProductionCritical && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Production-critical flag. Changes may affect live users.
        </div>
      )}

      {/* Targeting — Percentage Rollout */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-slate-700">Percentage Rollout</span>
          </div>
          <ToggleSwitch
            enabled={enablePercentage}
            onChange={() => setEnablePercentage((v) => !v)}
            size="sm"
          />
        </div>
        {enablePercentage && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Rollout</span>
              <span className="text-sm font-bold text-amber-600">{rolloutPct}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={rolloutPct}
              onChange={(e) => setRolloutPct(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-0.5">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        )}
      </div>

      {/* Whitelists */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-slate-700">User Whitelist</span>
          </div>
          <textarea
            value={userWhitelist}
            onChange={(e) => setUserWhitelist(e.target.value)}
            placeholder="One user ID per line&#10;e.g., emp-001&#10;emp-002"
            rows={3}
            className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium text-slate-700">Tenant Whitelist</span>
          </div>
          <textarea
            value={tenantWhitelist}
            onChange={(e) => setTenantWhitelist(e.target.value)}
            placeholder="One tenant ID per line&#10;e.g., tenant-001&#10;tenant-003"
            rows={2}
            className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-slate-700">Role Whitelist</span>
          </div>
          <textarea
            value={roleWhitelist}
            onChange={(e) => setRoleWhitelist(e.target.value)}
            placeholder="One role per line&#10;e.g., super-admin&#10;hr-admin"
            rows={2}
            className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? 'Saving...' : 'Save Targeting Rules'}
      </button>

      {/* Audit Log */}
      {flag.auditLog.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <History className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Recent Changes</span>
          </div>
          <div className="space-y-2">
            {flag.auditLog.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-start gap-2 text-xs">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-slate-700">{entry.actorName}</span>{' '}
                  <span className="text-slate-500">{entry.details}</span>
                  <p className="text-slate-400">{new Date(entry.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Create Flag Form ──────────────────────────────────────────────────────────

function CreateFlagForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (flag: FeatureFlag) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CreateFlagInput>({
    key: '',
    name: '',
    description: '',
    module: '',
    isEnabled: false,
    isPermanent: false,
    isProductionCritical: false,
    tags: [],
  });
  const [_tagInput, _setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.key || !form.name) {
      setError('Key and Name are required.');
      return;
    }
    if (!/^[a-z][a-z0-9_]*$/.test(form.key)) {
      setError('Key must be lowercase with underscores (e.g., my_feature).');
      return;
    }
    try {
      setSubmitting(true);
      const flag = await FeatureFlagService.createFlag(form);
      onSuccess(flag);
    } catch {
      setError('Failed to create flag.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">New Feature Flag</h3>
        <button onClick={onCancel} className="p-1 text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((p) => ({
                  ...p,
                  name,
                  key:
                    p.key ||
                    name
                      .toLowerCase()
                      .replace(/\s+/g, '_')
                      .replace(/[^a-z0-9_]/g, ''),
                }));
              }}
              placeholder="AI Performance Insights"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Key *</label>
            <input
              type="text"
              value={form.key}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                }))
              }
              placeholder="ai_performance_insights"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Module</label>
            <input
              type="text"
              value={form.module}
              onChange={(e) => setForm((p) => ({ ...p, module: e.target.value }))}
              placeholder="performance"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-2 pt-5">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isPermanent}
                onChange={(e) => setForm((p) => ({ ...p, isPermanent: e.target.checked }))}
                className="rounded"
              />
              Permanent flag
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isProductionCritical}
                onChange={(e) => setForm((p) => ({ ...p, isProductionCritical: e.target.checked }))}
                className="rounded"
              />
              Production critical
            </label>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="What does this flag enable?"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
              <Flag className="h-4 w-4" />
            )}
            Create Flag
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

// ── Main Dashboard ────────────────────────────────────────────────────────────

export function FeatureFlagDashboard() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FlagStatus | 'all'>('all');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [_togglingKey, setTogglingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await FeatureFlagService.getFlags();
      setFlags(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = flags.filter((f) => {
    const matchSearch =
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.key.toLowerCase().includes(search.toLowerCase()) ||
      f.module.toLowerCase().includes(search.toLowerCase()) ||
      f.tags.some((t) => t.includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const selectedFlag = flags.find((f) => f.key === selectedKey);

  const handleToggle = async (key: string, isProductionCritical: boolean) => {
    if (isProductionCritical) {
      if (!confirm('This is a production-critical flag. Are you sure you want to toggle it?'))
        return;
    }
    try {
      setTogglingKey(key);
      const updated = await FeatureFlagService.toggleFlag(key);
      setFlags((prev) => prev.map((f) => (f.key === key ? updated : f)));
    } catch (err: any) {
      console.error(err);
    } finally {
      setTogglingKey(null);
    }
  };

  const stats = {
    enabled: flags.filter((f) => f.status === 'enabled').length,
    partial: flags.filter((f) => f.status === 'partial').length,
    disabled: flags.filter((f) => f.status === 'disabled').length,
    critical: flags.filter((f) => f.isProductionCritical).length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Feature Flags</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage feature rollouts, targeting, and A/B testing
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
              setShowCreate(true);
              setSelectedKey(null);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Flag
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Enabled', value: stats.enabled, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Partial', value: stats.partial, color: 'text-amber-600 bg-amber-50' },
          { label: 'Disabled', value: stats.disabled, color: 'text-slate-600 bg-slate-50' },
          { label: 'Critical', value: stats.critical, color: 'text-red-600 bg-red-50' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color} border border-current/10`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, key, module, or tag..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FlagStatus | 'all')}
          className="text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="enabled">Enabled</option>
          <option value="partial">Partial Rollout</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {/* Main Content — Split view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-500">No flags found.</div>
          ) : (
            filtered.map((flag) => (
              <FlagRow
                key={flag.key}
                flag={flag}
                selected={selectedKey === flag.key}
                onSelect={() => {
                  setSelectedKey(flag.key === selectedKey ? null : flag.key);
                  setShowCreate(false);
                }}
                onToggle={() => handleToggle(flag.key, flag.isProductionCritical)}
              />
            ))
          )}
        </div>

        <div className="lg:col-span-1">
          {showCreate && (
            <CreateFlagForm
              onSuccess={(flag) => {
                setFlags((prev) => [flag, ...prev]);
                setShowCreate(false);
                setSelectedKey(flag.key);
              }}
              onCancel={() => setShowCreate(false)}
            />
          )}
          {selectedFlag && !showCreate && (
            <FlagDetailPanel
              flag={selectedFlag}
              onUpdate={(updated) =>
                setFlags((prev) => prev.map((f) => (f.key === updated.key ? updated : f)))
              }
              onClose={() => setSelectedKey(null)}
            />
          )}
          {!selectedFlag && !showCreate && (
            <div className="text-center py-16 text-sm text-slate-400 bg-white rounded-xl border border-slate-200">
              Select a flag to view targeting rules and audit log.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FeatureFlagDashboard;
