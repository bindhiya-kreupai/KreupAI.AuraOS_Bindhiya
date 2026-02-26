'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Globe, Users, ArrowRightLeft, Plus, RefreshCw, DollarSign } from 'lucide-react';
import type {
  LegalEntity,
  InterCompanyTransfer,
  ConsolidatedMetrics,
  EntityType,
  EntityStatus,
  TransferType,
  TransferStatus,
  CreateEntityData,
} from '@/services/legalEntityService';
import { LegalEntityService } from '@/services/legalEntityService';

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = 'entities' | 'transfers' | 'consolidated';

interface DashboardState {
  entities: LegalEntity[];
  transfers: InterCompanyTransfer[];
  metrics: ConsolidatedMetrics | null;
  loading: boolean;
  activeTab: Tab;
  selectedEntity: LegalEntity | null;
  showCreateForm: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<EntityStatus, string> = {
  Active: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Inactive: 'bg-slate-100 text-slate-500 border border-slate-200',
  'In Formation': 'bg-amber-100 text-amber-700 border border-amber-200',
  Dissolved: 'bg-red-100 text-red-600 border border-red-200',
};

const TRANSFER_STATUS_STYLES: Record<TransferStatus, string> = {
  Draft: 'bg-slate-100 text-slate-500',
  'Pending Approval': 'bg-amber-100 text-amber-700',
  Approved: 'bg-sky-100 text-sky-700',
  'In Progress': 'bg-purple-100 text-purple-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-700',
};

const ENTITY_TYPE_COLORS: Record<EntityType, string> = {
  'Holding Company': 'bg-slate-800 text-white',
  Subsidiary: 'bg-sky-100 text-sky-700',
  Branch: 'bg-emerald-100 text-emerald-700',
  'Joint Venture': 'bg-purple-100 text-purple-700',
  'Representative Office': 'bg-amber-100 text-amber-700',
};

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

// ── Sub Components ─────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Entities Tab ───────────────────────────────────────────────────────────────

function EntitiesTab({
  entities,
  onSelect,
}: {
  entities: LegalEntity[];
  onSelect: (e: LegalEntity) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<EntityStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<EntityType | 'All'>('All');

  const filtered = entities.filter((e) => {
    const status = statusFilter === 'All' || e.status === statusFilter;
    const type = typeFilter === 'All' || e.type === typeFilter;
    return status && type;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as EntityStatus | 'All')}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="All">All Statuses</option>
          {(['Active', 'Inactive', 'In Formation', 'Dissolved'] as EntityStatus[]).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as EntityType | 'All')}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="All">All Types</option>
          {(
            [
              'Holding Company',
              'Subsidiary',
              'Branch',
              'Joint Venture',
              'Representative Office',
            ] as EntityType[]
          ).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((entity) => (
          <button
            key={entity.id}
            onClick={() => onSelect(entity)}
            className="text-left bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-400 hover:shadow-sm transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{entity.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{entity.code}</p>
              </div>
              <span
                className={`ml-2 inline-block px-2 py-0.5 rounded-lg text-xs font-medium flex-shrink-0 ${STATUS_STYLES[entity.status]}`}
              >
                {entity.status}
              </span>
            </div>

            {/* Type badge */}
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-3 ${ENTITY_TYPE_COLORS[entity.type]}`}
            >
              {entity.type}
            </span>

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Globe size={13} className="text-slate-400 flex-shrink-0" />
                <span className="text-slate-600">
                  {entity.country}, {entity.city}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={13} className="text-slate-400 flex-shrink-0" />
                <span className="text-slate-600">{entity.headcount} employees</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={13} className="text-slate-400 flex-shrink-0" />
                <span className="text-slate-600">{fmt(entity.totalCostUSD)} / year</span>
              </div>
            </div>

            {/* Registration */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-400">Reg: {entity.registrationNumber}</p>
              {entity.parentEntityName && (
                <p className="text-xs text-slate-400">Parent: {entity.parentEntityName}</p>
              )}
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-400">No entities found.</div>
        )}
      </div>
    </div>
  );
}

// ── Transfers Tab ──────────────────────────────────────────────────────────────

function TransfersTab({ transfers }: { transfers: InterCompanyTransfer[] }) {
  const [typeFilter, setTypeFilter] = useState<TransferType | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<TransferStatus | 'All'>('All');

  const filtered = transfers.filter((t) => {
    const type = typeFilter === 'All' || t.transferType === typeFilter;
    const status = statusFilter === 'All' || t.status === statusFilter;
    return type && status;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TransferType | 'All')}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="All">All Types</option>
          {(['Permanent', 'Secondment', 'Project Assignment'] as TransferType[]).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TransferStatus | 'All')}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="All">All Statuses</option>
          {(
            [
              'Draft',
              'Pending Approval',
              'Approved',
              'In Progress',
              'Completed',
              'Rejected',
            ] as TransferStatus[]
          ).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700">
          <Plus size={14} />
          Initiate Transfer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left p-4 font-semibold text-slate-600">Transfer #</th>
              <th className="text-left p-4 font-semibold text-slate-600">Employee</th>
              <th className="text-left p-4 font-semibold text-slate-600">From Entity</th>
              <th className="text-left p-4 font-semibold text-slate-600">To Entity</th>
              <th className="text-left p-4 font-semibold text-slate-600">Type</th>
              <th className="text-left p-4 font-semibold text-slate-600">Effective Date</th>
              <th className="text-left p-4 font-semibold text-slate-600">Status</th>
              <th className="text-right p-4 font-semibold text-slate-600">Cost Alloc.</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((transfer) => (
              <tr
                key={transfer.id}
                className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
              >
                <td className="p-4">
                  <span className="font-mono text-xs text-sky-600">{transfer.transferNumber}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {transfer.employeeName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{transfer.employeeName}</p>
                      <p className="text-xs text-slate-400">{transfer.employeeCode}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-slate-700 text-sm">{transfer.fromEntityName}</p>
                </td>
                <td className="p-4">
                  <p className="text-slate-700 text-sm">{transfer.toEntityName}</p>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      transfer.transferType === 'Permanent'
                        ? 'bg-slate-100 text-slate-700'
                        : transfer.transferType === 'Secondment'
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {transfer.transferType}
                  </span>
                </td>
                <td className="p-4 text-slate-600">
                  {new Date(transfer.effectiveDate).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${TRANSFER_STATUS_STYLES[transfer.status]}`}
                  >
                    {transfer.status}
                  </span>
                </td>
                <td className="p-4 text-right text-slate-600">{transfer.costAllocationPercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400">No transfers found.</div>
        )}
      </div>
    </div>
  );
}

// ── Consolidated View Tab ──────────────────────────────────────────────────────

function ConsolidatedTab({
  metrics,
  entities,
}: {
  metrics: ConsolidatedMetrics | null;
  entities: LegalEntity[];
}) {
  if (!metrics)
    return (
      <div className="text-center py-12 text-slate-400">No consolidated metrics available.</div>
    );

  // Build a simple hierarchy from entities
  const roots = entities.filter((e) => !e.parentEntityId);

  function EntityTree({ entity, depth = 0 }: { entity: LegalEntity; depth?: number }) {
    const children = entities.filter((e) => e.parentEntityId === entity.id);
    return (
      <div className={depth > 0 ? 'ml-8 border-l-2 border-slate-100 pl-4' : ''}>
        <div
          className={`flex items-center gap-3 p-3 rounded-xl border mb-2 ${
            depth === 0 ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
          }`}
        >
          <Building2 size={14} className={depth === 0 ? 'text-slate-300' : 'text-slate-400'} />
          <div className="flex-1">
            <p className={`font-medium text-sm ${depth === 0 ? 'text-white' : 'text-slate-800'}`}>
              {entity.name}
            </p>
            <p className={`text-xs ${depth === 0 ? 'text-slate-300' : 'text-slate-400'}`}>
              {entity.country} &bull; {entity.headcount} employees
            </p>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium ${ENTITY_TYPE_COLORS[entity.type]}`}
          >
            {entity.type}
          </span>
        </div>
        {children.map((child) => (
          <EntityTree key={child.id} entity={child} depth={depth + 1} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Building2 size={18} className="text-slate-600" />}
          label="Active Entities"
          value={metrics.activeEntities}
          sub={`of ${metrics.totalEntities} total`}
          color="bg-slate-100"
        />
        <StatCard
          icon={<Users size={18} className="text-sky-600" />}
          label="Total Headcount"
          value={metrics.totalHeadcount}
          color="bg-sky-100"
        />
        <StatCard
          icon={<DollarSign size={18} className="text-emerald-600" />}
          label="Total Payroll Cost"
          value={fmt(metrics.totalPayrollCostUSD)}
          sub="USD annually"
          color="bg-emerald-100"
        />
        <StatCard
          icon={<ArrowRightLeft size={18} className="text-purple-600" />}
          label="Active Transfers"
          value={metrics.activeTransfers}
          sub={`${metrics.pendingTransfers} pending`}
          color="bg-purple-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Headcount by Entity */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Headcount by Entity</h3>
          <div className="space-y-3">
            {metrics.headcountByEntity.map(({ entityName, count, country }) => (
              <div key={entityName} className="flex items-center gap-3">
                <div className="w-32 flex-shrink-0">
                  <p className="text-sm text-slate-700 truncate">{entityName}</p>
                  <p className="text-xs text-slate-400">{country}</p>
                </div>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-slate-700 h-2 rounded-full"
                    style={{ width: `${Math.min((count / metrics.totalHeadcount) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm text-slate-600 w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cost by Entity */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Cost by Entity (USD)</h3>
          <div className="space-y-3">
            {metrics.costByEntity.map(({ entityName, costUSD, percent }) => (
              <div key={entityName} className="flex items-center gap-3">
                <p className="text-sm text-slate-700 w-32 flex-shrink-0 truncate">{entityName}</p>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-sm text-slate-600 w-20 text-right">{fmt(costUSD)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Entity Hierarchy Tree */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Entity Hierarchy</h3>
        <div className="space-y-2">
          {roots.map((root) => (
            <EntityTree key={root.id} entity={root} />
          ))}
          {roots.length === 0 &&
            entities.slice(0, 3).map((e) => <EntityTree key={e.id} entity={e} />)}
        </div>
      </div>
    </div>
  );
}

// ── Create Entity Form ─────────────────────────────────────────────────────────

function CreateEntityForm({
  onClose,
  entities,
  onSave,
}: {
  onClose: () => void;
  entities: LegalEntity[];
  onSave: (data: CreateEntityData) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<CreateEntityData>>({
    type: 'Subsidiary',
    currency: 'USD',
  });
  const [saving, setSaving] = useState(false);
  const update = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.country) return;
    setSaving(true);
    await onSave(form as CreateEntityData);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-800">Add Legal Entity</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Entity Name *</label>
              <input
                type="text"
                value={form.name || ''}
                onChange={(e) => update('name', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Legal Name</label>
              <input
                type="text"
                value={form.legalName || ''}
                onChange={(e) => update('legalName', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => update('type', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
              >
                {(
                  [
                    'Holding Company',
                    'Subsidiary',
                    'Branch',
                    'Joint Venture',
                    'Representative Office',
                  ] as EntityType[]
                ).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Country *</label>
              <input
                type="text"
                value={form.country || ''}
                onChange={(e) => update('country', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={form.city || ''}
                onChange={(e) => update('city', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <input
                type="text"
                value={form.currency || 'USD'}
                onChange={(e) => update('currency', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
                placeholder="USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Registration No.
              </label>
              <input
                type="text"
                value={form.registrationNumber || ''}
                onChange={(e) => update('registrationNumber', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Parent Entity</label>
              <select
                value={form.parentEntityId || ''}
                onChange={(e) => update('parentEntityId', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
              >
                <option value="">None</option>
                {entities.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Create Entity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function LegalEntityManagement() {
  const [state, setState] = useState<DashboardState>({
    entities: [],
    transfers: [],
    metrics: null,
    loading: true,
    activeTab: 'entities',
    selectedEntity: null,
    showCreateForm: false,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const [entities, transfers, metrics] = await Promise.all([
        LegalEntityService.getEntities(),
        LegalEntityService.getTransfers ? LegalEntityService.getTransfers() : Promise.resolve([]),
        LegalEntityService.getConsolidatedMetrics
          ? LegalEntityService.getConsolidatedMetrics()
          : Promise.resolve(null),
      ]);
      setState((s) => ({
        ...s,
        entities: entities.entities || entities,
        transfers: transfers.transfers || transfers,
        metrics,
        loading: false,
      }));
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { entities, transfers, metrics, loading, activeTab, showCreateForm } = state;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'entities', label: 'Entities' },
    { id: 'transfers', label: 'Inter-Company Transfers' },
    { id: 'consolidated', label: 'Consolidated View' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-slate-400" />
        <span className="ml-3 text-slate-500">Loading entities...</span>
      </div>
    );
  }

  const activeEntities = entities.filter((e) => e.status === 'Active').length;
  const totalHeadcount = entities.reduce((a, b) => a + b.headcount, 0);
  const totalCost = entities.reduce((a, b) => a + b.totalCostUSD, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Legal Entity Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Multi-entity configuration and inter-company transfers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={() => setState((s) => ({ ...s, showCreateForm: true }))}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700"
          >
            <Plus size={14} />
            Add Entity
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Building2 size={18} className="text-slate-600" />}
          label="Total Entities"
          value={entities.length}
          sub={`${activeEntities} active`}
          color="bg-slate-100"
        />
        <StatCard
          icon={<Globe size={18} className="text-sky-600" />}
          label="Countries"
          value={new Set(entities.map((e) => e.country)).size}
          color="bg-sky-100"
        />
        <StatCard
          icon={<Users size={18} className="text-emerald-600" />}
          label="Total Headcount"
          value={totalHeadcount}
          color="bg-emerald-100"
        />
        <StatCard
          icon={<DollarSign size={18} className="text-purple-600" />}
          label="Total Annual Cost"
          value={fmt(totalCost)}
          sub="USD across entities"
          color="bg-purple-100"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setState((s) => ({ ...s, activeTab: tab.id }))}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'entities' && (
          <EntitiesTab
            entities={entities}
            onSelect={(e) => setState((s) => ({ ...s, selectedEntity: e }))}
          />
        )}
        {activeTab === 'transfers' && <TransfersTab transfers={transfers} />}
        {activeTab === 'consolidated' && <ConsolidatedTab metrics={metrics} entities={entities} />}
      </div>

      {showCreateForm && (
        <CreateEntityForm
          entities={entities}
          onClose={() => setState((s) => ({ ...s, showCreateForm: false }))}
          onSave={async (data) => {
            await LegalEntityService.createEntity(data);
            await load();
          }}
        />
      )}
    </div>
  );
}
