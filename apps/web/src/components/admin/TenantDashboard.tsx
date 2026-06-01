/**
 * @module TenantDashboard
 * @description Multi-tenant admin dashboard with tenant list, plan/status filters,
 *              usage metrics, and quick actions.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Users,
  Search,
  Plus,
  Pause,
  Play,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import {
  TenantService,
  type Tenant,
  type TenantPlan,
  type TenantStatus,
  PLAN_CONFIGS,
} from '@/services/tenantService';

// ── Status Config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  TenantStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  suspended: { label: 'Suspended', className: 'bg-red-100 text-red-700', icon: Pause },
  trial: { label: 'Trial', className: 'bg-blue-100 text-blue-700', icon: Clock },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-600', icon: XCircle },
  provisioning: {
    label: 'Provisioning',
    className: 'bg-purple-100 text-purple-700',
    icon: Loader2,
  },
};

const PLAN_CONFIG = {
  starter: { label: 'Starter', className: 'bg-slate-100 text-slate-700' },
  professional: { label: 'Professional', className: 'bg-indigo-100 text-indigo-700' },
  enterprise: { label: 'Enterprise', className: 'bg-purple-100 text-purple-700' },
};

// ── Usage Bar ─────────────────────────────────────────────────────────────────

function UsageBar({ used, limit, label }: { used: number; limit: number | null; label: string }) {
  const pct = limit ? Math.min((used / limit) * 100, 100) : 0;
  const alertColor = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-400' : 'bg-blue-500';

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span>{limit ? `${used.toFixed(1)} / ${limit}` : `${used.toFixed(1)} (unlimited)`}</span>
      </div>
      {limit && (
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${alertColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ── Create Tenant Modal ───────────────────────────────────────────────────────

function CreateTenantModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (tenant: Tenant) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    domain: '',
    adminEmail: '',
    adminName: '',
    plan: 'starter' as TenantPlan,
    timezone: 'America/New_York',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.domain.trim() || !form.adminEmail.trim()) {
      setError('Name, domain, and admin email are required.');
      return;
    }
    try {
      setSubmitting(true);
      const tenant = await TenantService.createTenant(form);
      onCreate(tenant);
    } catch {
      setError('Failed to create tenant. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Provision New Tenant</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Acme Corporation"
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Domain <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.domain}
                onChange={(e) => setForm((p) => ({ ...p, domain: e.target.value }))}
                placeholder="acme.auraos.app"
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Plan</label>
              <select
                value={form.plan}
                onChange={(e) => setForm((p) => ({ ...p, plan: e.target.value as TenantPlan }))}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="starter">Starter — $8/user/mo (50 users)</option>
                <option value="professional">Professional — $15/user/mo (500 users)</option>
                <option value="enterprise">Enterprise — $25/user/mo (Unlimited)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Admin Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.adminName}
                onChange={(e) => setForm((p) => ({ ...p, adminName: e.target.value }))}
                placeholder="John Smith"
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Admin Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.adminEmail}
                onChange={(e) => setForm((p) => ({ ...p, adminEmail: e.target.value }))}
                placeholder="admin@acme.com"
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Plan Summary */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-medium text-slate-700">Plan: {PLAN_CONFIGS[form.plan].label}</p>
            <p>Users: {PLAN_CONFIGS[form.plan].maxUsers ?? 'Unlimited'}</p>
            <p>
              Storage:{' '}
              {PLAN_CONFIGS[form.plan].storageLimitGB
                ? `${PLAN_CONFIGS[form.plan].storageLimitGB}GB`
                : 'Unlimited'}
            </p>
            <p>API Rate: {PLAN_CONFIGS[form.plan].apiRateLimit} req/min</p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {submitting ? 'Provisioning...' : 'Create Tenant'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Tenant Row ────────────────────────────────────────────────────────────────

function TenantRow({
  tenant,
  onSuspend,
  onReactivate,
  onConfigure,
}: {
  tenant: Tenant;
  onSuspend: (id: string) => void;
  onReactivate: (id: string) => void;
  onConfigure: (id: string) => void;
}) {
  const statusCfg = STATUS_CONFIG[tenant.status];
  const planCfg = PLAN_CONFIG[tenant.plan];
  const planConfig = PLAN_CONFIGS[tenant.plan];
  const _StoragePct = planConfig.storageLimitGB
    ? (tenant.storageUsedGB / planConfig.storageLimitGB) * 100
    : 0;

  const trialDaysLeft = tenant.trialEndsAt
    ? Math.ceil((new Date(tenant.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-900">{tenant.name}</p>
          <p className="text-xs text-slate-500">{tenant.domain}</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusCfg.className}`}
        >
          <statusCfg.icon className="h-3 w-3" />
          {statusCfg.label}
          {trialDaysLeft !== null && trialDaysLeft >= 0 && (
            <span className="ml-1">({trialDaysLeft}d left)</span>
          )}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${planCfg.className}`}>
          {planCfg.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-sm text-slate-600">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          <span>
            {tenant.activeUsers.toLocaleString()} / {tenant.totalUsers.toLocaleString()}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="w-24">
          <UsageBar used={tenant.storageUsedGB} limit={planConfig.storageLimitGB} label="" />
          <p className="text-xs text-slate-500 mt-0.5">{tenant.storageUsedGB.toFixed(1)} GB</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-xs text-slate-500">
          {new Date(tenant.lastActivityAt).toLocaleDateString()}
        </p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onConfigure(tenant.id)}
            title="Configure"
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
          {tenant.status === 'active' || tenant.status === 'trial' ? (
            <button
              onClick={() => onSuspend(tenant.id)}
              title="Suspend"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Pause className="h-4 w-4" />
            </button>
          ) : tenant.status === 'suspended' ? (
            <button
              onClick={() => onReactivate(tenant.id)}
              title="Reactivate"
              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              <Play className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

interface TenantDashboardProps {
  onConfigureTenant?: (tenantId: string) => void;
}

export function TenantDashboard({ onConfigureTenant }: TenantDashboardProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<TenantPlan | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TenantStatus | 'all'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [_suspendingId, setSuspendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await TenantService.getTenants();
      setTenants(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = tenants.filter((t) => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.domain.toLowerCase().includes(search.toLowerCase()) ||
      t.adminEmail.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'all' || t.plan === planFilter;
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  const stats = {
    total: tenants.length,
    active: tenants.filter((t) => t.status === 'active').length,
    trial: tenants.filter((t) => t.status === 'trial').length,
    suspended: tenants.filter((t) => t.status === 'suspended').length,
    totalUsers: tenants.reduce((sum, t) => sum + t.totalUsers, 0),
  };

  const handleSuspend = async (id: string) => {
    const reason = prompt('Enter suspension reason:');
    if (!reason) return;
    try {
      setSuspendingId(id);
      const updated = await TenantService.suspendTenant(id, reason);
      setTenants((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err: any) {
      console.error(err);
    } finally {
      setSuspendingId(null);
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      const updated = await TenantService.reactivateTenant(id);
      setTenants((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err: any) {
      console.error(err);
    }
  };

  // Storage alert — tenants over 80%
  const storageAlerts = tenants.filter((t) => {
    const limit = PLAN_CONFIGS[t.plan].storageLimitGB;
    return limit && t.storageUsedGB / limit > 0.8;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tenant Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage all organization tenants, plans, and configurations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Tenant
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Tenants',
            value: stats.total,
            icon: Building2,
            color: 'text-blue-600 bg-blue-50',
          },
          {
            label: 'Active',
            value: stats.active,
            icon: CheckCircle,
            color: 'text-emerald-600 bg-emerald-50',
          },
          { label: 'Trial', value: stats.trial, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          {
            label: 'Suspended',
            value: stats.suspended,
            icon: Pause,
            color: 'text-red-600 bg-red-50',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
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

      {/* Storage Alerts */}
      {storageAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Storage Alerts</p>
              <p className="text-sm text-amber-700">
                {storageAlerts.map((t) => t.name).join(', ')}{' '}
                {storageAlerts.length === 1 ? 'is' : 'are'} above 80% storage capacity.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tenants by name, domain, or admin..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as TenantPlan | 'all')}
            className="text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Plans</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TenantStatus | 'all')}
            className="text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="suspended">Suspended</option>
            <option value="provisioning">Provisioning</option>
          </select>
        </div>
      </div>

      {/* Tenant Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Tenant', 'Status', 'Plan', 'Users', 'Storage', 'Last Active', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-sm text-slate-500">
                      No tenants match the current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((tenant) => (
                    <TenantRow
                      key={tenant.id}
                      tenant={tenant}
                      onSuspend={handleSuspend}
                      onReactivate={handleReactivate}
                      onConfigure={(id) => onConfigureTenant?.(id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Plan Distribution */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-slate-900">Plan Distribution</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {(['starter', 'professional', 'enterprise'] as TenantPlan[]).map((plan) => {
            const count = tenants.filter((t) => t.plan === plan).length;
            const pct = tenants.length ? Math.round((count / tenants.length) * 100) : 0;
            return (
              <div key={plan} className="text-center">
                <p className="text-3xl font-bold text-slate-900">{count}</p>
                <p className="text-sm font-medium text-slate-600">{PLAN_CONFIGS[plan].label}</p>
                <p className="text-xs text-slate-400">{pct}% of tenants</p>
                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${plan === 'starter' ? 'bg-slate-500' : plan === 'professional' ? 'bg-indigo-500' : 'bg-purple-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <CreateTenantModal
          onClose={() => setShowCreate(false)}
          onCreate={(tenant) => {
            setTenants((prev) => [tenant, ...prev]);
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}

export default TenantDashboard;
