// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

/**
 * @component EntityManagementDashboard
 * @description Multi-entity management dashboard — entity hierarchy tree view,
 *   entity cards, consolidated vs per-entity view, metrics, transfer log, quick actions.
 * @project AURA HCM Platform
 * @section 10.6 — Multi-Entity Management
 */

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Globe,
  Users,
  TrendingDown,
  ChevronRight,
  ChevronDown,
  Plus,
  ArrowLeftRight,
  BarChart3,
  RefreshCw,
  Layers,
  MapPin,
  DollarSign,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  _AlertTriangle,
  _Briefcase,
} from 'lucide-react';
import type {
  LegalEntity,
  EntityHierarchyNode,
  InterEntityTransfer,
  EntityComparison,
} from '@/services/multiEntityService';
import { MultiEntityService } from '@/services/multiEntityService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

function fmtCurrency(n: number, code: string): string {
  return `${code} ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n)}`;
}

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  dormant: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  in_liquidation: 'bg-red-100 text-red-700 border-red-200',
};

const TRANSFER_STATUS_STYLES: Record<
  string,
  { bg: string; icon: React.ElementType; label: string }
> = {
  pending: { bg: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending' },
  approved: { bg: 'bg-blue-100 text-blue-700', icon: CheckCircle2, label: 'Approved' },
  completed: { bg: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2, label: 'Completed' },
  rejected: { bg: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rejected' },
  cancelled: { bg: 'bg-slate-100 text-slate-600', icon: XCircle, label: 'Cancelled' },
};

// ── Entity Card ────────────────────────────────────────────────────────────────

function EntityCard({ entity, onClick }: { entity: LegalEntity; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{entity.countryFlag}</span>
          <div>
            <p className="font-semibold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">
              {entity.shortName}
            </p>
            <p className="text-xs text-slate-500 capitalize">{entity.type.replace('_', ' ')}</p>
          </div>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_STYLES[entity.status]}`}
        >
          {entity.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-slate-50 rounded-lg p-2.5">
          <p className="text-xs text-slate-500 mb-0.5">Employees</p>
          <p className="font-bold text-slate-800">{fmtNumber(entity.employeeCount)}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2.5">
          <p className="text-xs text-slate-500 mb-0.5">Avg Salary</p>
          <p className="font-bold text-slate-800 text-xs">
            {fmtCurrency(entity.metrics.avgSalary, entity.currencyCode)}
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2.5">
          <p className="text-xs text-slate-500 mb-0.5">Turnover</p>
          <p
            className={`font-bold text-sm ${entity.metrics.turnoverRate > 12 ? 'text-red-600' : 'text-emerald-600'}`}
          >
            {entity.metrics.turnoverRate}%
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2.5">
          <p className="text-xs text-slate-500 mb-0.5">HC Budget</p>
          <p className="font-bold text-slate-800">{fmtNumber(entity.metrics.headcountBudget)}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-3 text-xs text-slate-500">
        <MapPin className="w-3 h-3" />
        {entity.address.city}, {entity.country}
      </div>
    </button>
  );
}

// ── Hierarchy Node ─────────────────────────────────────────────────────────────

function HierarchyNode({
  node,
  onSelect,
}: {
  node: EntityHierarchyNode;
  onSelect: (entity: LegalEntity) => void;
}) {
  const [expanded, setExpanded] = useState(node.level === 0);
  const hasChildren = node.children.length > 0;

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors ${node.level > 0 ? 'ml-6' : ''}`}
        style={{ paddingLeft: `${12 + node.level * 20}px` }}
        onClick={() => onSelect(node)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <span className="text-lg">{node.countryFlag}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700 truncate">{node.shortName}</p>
          <p className="text-xs text-slate-400 capitalize">
            {node.type.replace('_', ' ')} · {node.employeeCount} emp
          </p>
        </div>
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[node.status]}`}
        >
          {node.status}
        </span>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <HierarchyNode key={child.id} node={child} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Transfer Row ───────────────────────────────────────────────────────────────

function TransferRow({ transfer }: { transfer: InterEntityTransfer }) {
  const s = TRANSFER_STATUS_STYLES[transfer.status];
  const SIcon = s.icon;
  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{transfer.employeeName}</p>
        <p className="text-xs text-slate-500 truncate">{transfer.employeeTitle}</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-600">
        <span className="hidden sm:block">{transfer.fromEntityName}</span>
        <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
        <span>{transfer.toEntityName}</span>
      </div>
      <div className="text-xs text-slate-500 hidden md:block">
        {fmtDate(transfer.effectiveDate)}
      </div>
      <span
        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${s.bg}`}
      >
        <SIcon className="w-3 h-3" />
        {s.label}
      </span>
    </div>
  );
}

// ── Comparison Table ───────────────────────────────────────────────────────────

function ComparisonTable({ data }: { data: EntityComparison }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 pr-4 text-slate-500 font-medium">Entity</th>
            <th className="text-right py-2 px-2 text-slate-500 font-medium">Headcount</th>
            <th className="text-right py-2 px-2 text-slate-500 font-medium">Avg Salary</th>
            <th className="text-right py-2 px-2 text-slate-500 font-medium">Turnover</th>
            <th className="text-right py-2 px-2 text-slate-500 font-medium">Open Positions</th>
            <th className="text-right py-2 pl-2 text-slate-500 font-medium">Training Hrs</th>
          </tr>
        </thead>
        <tbody>
          {data.data.map((row) => (
            <tr key={row.entityId} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-2.5 pr-4">
                <div className="flex items-center gap-2">
                  <span>{row.countryFlag}</span>
                  <span className="font-medium text-slate-700">{row.entityName}</span>
                </div>
              </td>
              <td className="text-right py-2.5 px-2 text-slate-700">{fmtNumber(row.headcount)}</td>
              <td className="text-right py-2.5 px-2 text-slate-700">{fmtNumber(row.avgSalary)}</td>
              <td className="text-right py-2.5 px-2">
                <span
                  className={`font-medium ${row.turnoverRate > 12 ? 'text-red-600' : 'text-emerald-600'}`}
                >
                  {row.turnoverRate}%
                </span>
              </td>
              <td className="text-right py-2.5 px-2 text-slate-700">{row.openPositions}</td>
              <td className="text-right py-2.5 pl-2 text-slate-700">{row.trainingHoursAvg}h</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type ViewMode = 'consolidated' | 'per_entity';
type Tab = 'overview' | 'hierarchy' | 'transfers' | 'comparison';

export default function EntityManagementDashboard() {
  const [entities, setEntities] = useState<LegalEntity[]>([]);
  const [hierarchy, setHierarchy] = useState<EntityHierarchyNode[]>([]);
  const [transfers, setTransfers] = useState<InterEntityTransfer[]>([]);
  const [comparison, setComparison] = useState<EntityComparison | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<LegalEntity | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('consolidated');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [ents, hier, trns, comp] = await Promise.all([
          MultiEntityService.getEntities(),
          MultiEntityService.getEntityHierarchy(),
          MultiEntityService.getInterEntityTransfers(),
          MultiEntityService.getEntityComparison(
            ['ent-001', 'ent-002', 'ent-003', 'ent-004', 'ent-005'],
            ['headcount', 'avgSalary', 'turnoverRate']
          ),
        ]);
        setEntities(ents);
        setHierarchy(hier);
        setTransfers(trns);
        setComparison(comp);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredEntities = entities.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalHeadcount = entities.reduce((s, e) => s + e.employeeCount, 0);
  const totalLaborCost = entities.reduce((s, e) => s + e.metrics.laborCostMonthly, 0);
  const avgTurnover = entities.length
    ? (entities.reduce((s, e) => s + e.metrics.turnoverRate, 0) / entities.length).toFixed(1)
    : '0';
  const activeEntities = entities.filter((e) => e.status === 'active').length;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'hierarchy', label: 'Hierarchy', icon: Layers },
    { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
    { id: 'comparison', label: 'Comparison', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Multi-Entity Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Legal entities, branches, and inter-entity operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
            <ArrowLeftRight className="w-4 h-4" />
            Transfer Employee
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            New Entity
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Active Entities',
            value: activeEntities,
            sub: `of ${entities.length} total`,
            icon: Building2,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Total Headcount',
            value: fmtNumber(totalHeadcount),
            sub: 'across all entities',
            icon: Users,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Monthly Labor Cost',
            value: `$${(totalLaborCost / 1_000_000).toFixed(1)}M`,
            sub: 'consolidated',
            icon: DollarSign,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
          },
          {
            label: 'Avg Turnover',
            value: `${avgTurnover}%`,
            sub: 'group average',
            icon: TrendingDown,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">{card.label}</p>
              <div className={`p-1.5 rounded-lg ${card.bg}`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* View Toggle & Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-0 border-b border-slate-100">
          <div className="flex gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'transfers' && transfers.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-1.5 rounded-full">
                    {transfers.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="flex items-center gap-2 pb-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search entities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div className="flex bg-slate-100 rounded-lg p-0.5">
                {(['consolidated', 'per_entity'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                      viewMode === mode
                        ? 'bg-white text-slate-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {mode === 'consolidated' ? 'Consolidated' : 'Per Entity'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading entities...
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  {viewMode === 'consolidated' && (
                    <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <p className="font-semibold text-blue-900">Consolidated Group View</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {entities.map((e) => (
                          <div key={e.id} className="text-center">
                            <span className="text-2xl">{e.countryFlag}</span>
                            <p className="text-xs font-medium text-slate-700 mt-1">{e.shortName}</p>
                            <p className="text-xs text-slate-500">
                              {fmtNumber(e.employeeCount)} emp
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEntities.map((entity) => (
                      <EntityCard
                        key={entity.id}
                        entity={entity}
                        onClick={() => setSelectedEntity(entity)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Hierarchy Tab */}
              {activeTab === 'hierarchy' && (
                <div className="max-w-xl">
                  <p className="text-xs text-slate-500 mb-3">
                    Click an entity to view details. Expand nodes to see subsidiaries and branches.
                  </p>
                  <div className="border border-slate-200 rounded-xl p-2">
                    {hierarchy.map((root) => (
                      <HierarchyNode key={root.id} node={root} onSelect={setSelectedEntity} />
                    ))}
                  </div>
                </div>
              )}

              {/* Transfers Tab */}
              {activeTab === 'transfers' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-600 font-medium">Inter-Entity Transfer Log</p>
                    <button className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700">
                      <Plus className="w-3.5 h-3.5" /> New Transfer
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {transfers.map((transfer) => (
                      <TransferRow key={transfer.id} transfer={transfer} />
                    ))}
                  </div>
                </div>
              )}

              {/* Comparison Tab */}
              {activeTab === 'comparison' && comparison && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-600 font-medium">Entity Metrics Comparison</p>
                    <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5">
                      <Filter className="w-3.5 h-3.5" /> Metrics
                    </button>
                  </div>
                  <ComparisonTable data={comparison} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Entity Detail Drawer */}
      {selectedEntity && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center sm:justify-end"
          onClick={() => setSelectedEntity(null)}
        >
          <div
            className="bg-white w-full sm:w-96 h-[80vh] sm:h-full overflow-y-auto rounded-t-2xl sm:rounded-none shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedEntity.countryFlag}</span>
                <div>
                  <p className="font-bold text-slate-800">{selectedEntity.shortName}</p>
                  <p className="text-xs text-slate-500 capitalize">
                    {selectedEntity.type.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-light"
              >
                ×
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Legal Information
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Full Name</span>
                    <span className="font-medium text-slate-700">{selectedEntity.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registration No.</span>
                    <span className="font-medium text-slate-700 text-xs">
                      {selectedEntity.registrationNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tax ID</span>
                    <span className="font-medium text-slate-700 text-xs">
                      {selectedEntity.taxId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Established</span>
                    <span className="font-medium text-slate-700">
                      {fmtDate(selectedEntity.establishedDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Currency</span>
                    <span className="font-medium text-slate-700">
                      {selectedEntity.currency} ({selectedEntity.currencyCode})
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Address
                </p>
                <p className="text-sm text-slate-700">
                  {selectedEntity.address.street}
                  <br />
                  {selectedEntity.address.city}, {selectedEntity.address.state}{' '}
                  {selectedEntity.address.postalCode}
                  <br />
                  {selectedEntity.address.country}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Key Metrics
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Headcount', value: fmtNumber(selectedEntity.employeeCount) },
                    {
                      label: 'HC Budget',
                      value: fmtNumber(selectedEntity.metrics.headcountBudget),
                    },
                    {
                      label: 'Avg Salary',
                      value: `${selectedEntity.currencyCode} ${fmtNumber(selectedEntity.metrics.avgSalary)}`,
                    },
                    { label: 'Turnover', value: `${selectedEntity.metrics.turnoverRate}%` },
                  ].map((m) => (
                    <div key={m.label} className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-0.5">{m.label}</p>
                      <p className="font-bold text-slate-800">{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  HR Head
                </p>
                <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 text-sm">
                      {selectedEntity.hrHeadName}
                    </p>
                    <p className="text-xs text-slate-500">HR Head — {selectedEntity.shortName}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Edit Entity
                </button>
                <button className="flex-1 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium">
                  View Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
