// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase,
  AlertTriangle,
  Plus,
  RefreshCw,
  ChevronRight,
  DollarSign,
  CheckCircle2,
  Search,
} from 'lucide-react';
import type {
  Position,
  PositionStatus,
  DepartmentBudget,
  PositionHistoryEntry,
  CreatePositionData,
} from '@/services/positionManagementService';
import { PositionManagementService, OrgNode } from '@/services/positionManagementService';

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = 'positions' | 'org-chart' | 'budget' | 'history';

interface DashboardState {
  positions: Position[];
  budget: DepartmentBudget[];
  orgTree: OrgNode | null;
  history: PositionHistoryEntry[];
  loading: boolean;
  activeTab: Tab;
  search: string;
  statusFilter: PositionStatus | 'All';
  showCreateForm: boolean;
  selectedPosition: Position | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<PositionStatus, string> = {
  Filled: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Vacant: 'bg-amber-100 text-amber-700 border border-amber-200',
  Frozen: 'bg-slate-200 text-slate-600 border border-slate-300',
  Proposed: 'bg-sky-100 text-sky-700 border border-sky-200',
  Approved: 'bg-purple-100 text-purple-700 border border-purple-200',
  Eliminated: 'bg-red-100 text-red-700 border border-red-200',
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

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
        active ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );
}

// ── Positions Tab ──────────────────────────────────────────────────────────────

function PositionsTab({
  positions,
  onSelect,
}: {
  positions: Position[];
  onSelect: (p: Position) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left p-4 font-semibold text-slate-600">Position</th>
            <th className="text-left p-4 font-semibold text-slate-600">Department</th>
            <th className="text-left p-4 font-semibold text-slate-600">Grade</th>
            <th className="text-left p-4 font-semibold text-slate-600">Status</th>
            <th className="text-left p-4 font-semibold text-slate-600">Incumbent</th>
            <th className="text-right p-4 font-semibold text-slate-600">FTE</th>
            <th className="text-right p-4 font-semibold text-slate-600">Budget</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => (
            <tr
              key={pos.id}
              className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => onSelect(pos)}
            >
              <td className="p-4">
                <p className="font-medium text-slate-800">{pos.title}</p>
                <p className="text-xs text-slate-400">{pos.code}</p>
              </td>
              <td className="p-4 text-slate-600">{pos.department}</td>
              <td className="p-4">
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-medium">
                  {pos.grade}
                </span>
              </td>
              <td className="p-4">
                <span
                  className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${STATUS_STYLES[pos.status]}`}
                >
                  {pos.status}
                </span>
              </td>
              <td className="p-4">
                {pos.incumbent ? (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {pos.incumbent.avatarInitials}
                    </div>
                    <span className="text-slate-600">{pos.incumbent.name}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">—</span>
                )}
              </td>
              <td className="p-4 text-right text-slate-600">1.0</td>
              <td className="p-4 text-right text-slate-600">{fmt(pos.annualBudget)}</td>
              <td className="p-4">
                <ChevronRight size={16} className="text-slate-300" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {positions.length === 0 && (
        <div className="text-center py-12 text-slate-400">No positions found.</div>
      )}
    </div>
  );
}

// ── Org Chart Tab ──────────────────────────────────────────────────────────────

function OrgNode({ node, depth = 0 }: { node: OrgNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-slate-100 pl-4' : ''}`}>
      <div
        className={`flex items-center gap-3 p-3 rounded-xl border mb-2 transition-colors ${
          depth === 0
            ? 'bg-slate-800 border-slate-700 text-white'
            : depth === 1
              ? 'bg-white border-slate-200 hover:border-slate-300'
              : 'bg-slate-50 border-slate-100 hover:border-slate-200'
        }`}
      >
        {hasChildren && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className={`text-xs w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
              depth === 0 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {expanded ? '−' : '+'}
          </button>
        )}
        {!hasChildren && <div className="w-5 flex-shrink-0" />}

        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${depth === 0 ? 'text-white' : 'text-slate-800'}`}>
            {node.title}
          </p>
          {node.incumbentName ? (
            <p className={`text-xs ${depth === 0 ? 'text-slate-300' : 'text-slate-400'}`}>
              {node.incumbentName}
            </p>
          ) : (
            <p className="text-xs text-amber-500">Vacant</p>
          )}
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${
            node.status === 'Filled'
              ? depth === 0
                ? 'bg-white/20 text-white'
                : 'bg-emerald-100 text-emerald-700'
              : node.status === 'Vacant'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-slate-500'
          }`}
        >
          {node.status}
        </span>
        <span className={`text-xs ${depth === 0 ? 'text-slate-300' : 'text-slate-400'}`}>
          {node.grade}
        </span>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <OrgNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrgChartTab({ orgTree }: { orgTree: OrgNode | null }) {
  if (!orgTree) {
    return <div className="text-center py-12 text-slate-400">No org chart data available.</div>;
  }
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-800 mb-4">Organisation Hierarchy</h3>
      <OrgNode node={orgTree} />
    </div>
  );
}

// ── Budget Tab ─────────────────────────────────────────────────────────────────

function BudgetTab({ budgets }: { budgets: DepartmentBudget[] }) {
  const total = budgets.reduce((a, b) => a + b.approvedBudget, 0);
  const actualTotal = budgets.reduce((a, b) => a + b.actualCost, 0);
  const varianceTotal = total - actualTotal;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Total Approved Budget</p>
          <p className="text-2xl font-bold text-slate-800">{fmt(total)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Actual Cost</p>
          <p className="text-2xl font-bold text-slate-800">{fmt(actualTotal)}</p>
        </div>
        <div
          className={`rounded-xl border p-4 ${varianceTotal >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}
        >
          <p className={`text-xs ${varianceTotal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            Variance (Savings)
          </p>
          <p
            className={`text-2xl font-bold ${varianceTotal >= 0 ? 'text-emerald-700' : 'text-red-700'}`}
          >
            {varianceTotal >= 0 ? '+' : ''}
            {fmt(varianceTotal)}
          </p>
        </div>
      </div>

      {/* Department breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left p-4 font-semibold text-slate-600">Department</th>
              <th className="text-right p-4 font-semibold text-slate-600">HC Budget</th>
              <th className="text-right p-4 font-semibold text-slate-600">Filled</th>
              <th className="text-right p-4 font-semibold text-slate-600">Vacant</th>
              <th className="text-right p-4 font-semibold text-slate-600">Budget</th>
              <th className="text-right p-4 font-semibold text-slate-600">Actual</th>
              <th className="text-right p-4 font-semibold text-slate-600">Variance</th>
              <th className="text-right p-4 font-semibold text-slate-600">Utilization</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((dept) => (
              <tr key={dept.departmentId} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-800">{dept.department}</td>
                <td className="p-4 text-right text-slate-600">{dept.approvedHeadcount}</td>
                <td className="p-4 text-right">
                  <span className="text-emerald-700">{dept.filledPositions}</span>
                </td>
                <td className="p-4 text-right">
                  <span className={dept.vacantPositions > 0 ? 'text-amber-700' : 'text-slate-400'}>
                    {dept.vacantPositions}
                  </span>
                </td>
                <td className="p-4 text-right text-slate-600">{fmt(dept.approvedBudget)}</td>
                <td className="p-4 text-right text-slate-600">{fmt(dept.actualCost)}</td>
                <td className="p-4 text-right">
                  <span className={dept.variance >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                    {dept.variance >= 0 ? '+' : ''}
                    {fmt(dept.variance)}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${dept.utilizationPercent > 95 ? 'bg-red-500' : dept.utilizationPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(dept.utilizationPercent, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600">
                      {dept.utilizationPercent.toFixed(0)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── History Tab ────────────────────────────────────────────────────────────────

function HistoryTab({ history }: { history: PositionHistoryEntry[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-800 mb-4">Position Change History</h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />
        <div className="space-y-4">
          {history.map((entry) => (
            <div key={entry.id} className="flex gap-4 pl-10 relative">
              <div className="absolute left-2.5 w-3 h-3 rounded-full bg-slate-300 border-2 border-white mt-1" />
              <div className="flex-1 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{entry.field} changed</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {entry.oldValue ? (
                        <span>
                          <span className="line-through text-red-500">{entry.oldValue}</span> →{' '}
                          <span className="text-emerald-600">{entry.newValue}</span>
                        </span>
                      ) : (
                        <span className="text-emerald-600">{entry.newValue}</span>
                      )}
                    </p>
                    {entry.reason && (
                      <p className="text-xs text-slate-400 mt-1">Reason: {entry.reason}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-400">
                      {new Date(entry.changedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-500">{entry.changedBy}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">No history records found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Create Position Form ───────────────────────────────────────────────────────

function CreatePositionForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: CreatePositionData) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<CreatePositionData>>({
    type: 'Permanent',
    annualBudget: 0,
    headcountBudgetYear: new Date().getFullYear(),
  });
  const [saving, setSaving] = useState(false);

  const update = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.departmentId || !form.grade) return;
    setSaving(true);
    await onSave(form as CreatePositionData);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-800">Create Position</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Position Title *
              </label>
              <input
                type="text"
                value={form.title || ''}
                onChange={(e) => update('title', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department *</label>
              <input
                type="text"
                value={form.departmentId || ''}
                onChange={(e) => update('departmentId', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
                placeholder="Department ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Grade *</label>
              <input
                type="text"
                value={form.grade || ''}
                onChange={(e) => update('grade', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
                placeholder="e.g. G5"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => update('type', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
              >
                {['Permanent', 'Contract', 'Temporary', 'Intern'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={form.location || ''}
                onChange={(e) => update('location', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
                placeholder="e.g. Dubai, UAE"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reports To (Position ID)
              </label>
              <input
                type="text"
                value={form.reportingToId || ''}
                onChange={(e) => update('reportingToId', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
                placeholder="POS-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Annual Budget (USD)
              </label>
              <input
                type="number"
                value={form.annualBudget || 0}
                onChange={(e) => update('annualBudget', Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
                min={0}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
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
              {saving ? 'Saving...' : 'Create Position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function PositionManagementDashboard() {
  const [state, setState] = useState<DashboardState>({
    positions: [],
    budget: [],
    orgTree: null,
    history: [],
    loading: true,
    activeTab: 'positions',
    search: '',
    statusFilter: 'All',
    showCreateForm: false,
    selectedPosition: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const [posResult, budgets, orgTree, history] = await Promise.all([
        PositionManagementService.getPositions(),
        PositionManagementService.getDepartmentBudgets(),
        PositionManagementService.getOrgTree
          ? PositionManagementService.getOrgTree()
          : Promise.resolve(null),
        PositionManagementService.getPositionHistory
          ? PositionManagementService.getPositionHistory()
          : Promise.resolve([]),
      ]);
      setState((s) => ({
        ...s,
        positions: posResult.positions || posResult,
        budget: budgets,
        orgTree,
        history,
        loading: false,
      }));
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const {
    positions,
    budget,
    orgTree,
    history,
    loading,
    activeTab,
    search,
    statusFilter,
    showCreateForm,
  } = state;

  const filteredPositions = positions.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const TABS: { id: Tab; label: string }[] = [
    { id: 'positions', label: 'Positions' },
    { id: 'org-chart', label: 'Org Chart' },
    { id: 'budget', label: 'Budget' },
    { id: 'history', label: 'History' },
  ];

  const totalBudget = positions.reduce((a, b) => a + (b.annualBudget || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-slate-400" />
        <span className="ml-3 text-slate-500">Loading positions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Position Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Org structure, headcount, and budget control
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
            Create Position
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Briefcase size={18} className="text-slate-600" />}
          label="Total Positions"
          value={positions.length}
          sub="across all departments"
          color="bg-slate-100"
        />
        <StatCard
          icon={<CheckCircle2 size={18} className="text-emerald-600" />}
          label="Filled"
          value={positions.filter((p) => p.status === 'Filled').length}
          color="bg-emerald-100"
        />
        <StatCard
          icon={<AlertTriangle size={18} className="text-amber-600" />}
          label="Vacant"
          value={positions.filter((p) => p.status === 'Vacant').length}
          sub="open to hire"
          color="bg-amber-100"
        />
        <StatCard
          icon={<DollarSign size={18} className="text-sky-600" />}
          label="Annual Budget"
          value={fmt(totalBudget)}
          color="bg-sky-100"
        />
      </div>

      {/* Filters + Tabs */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => setState((s) => ({ ...s, activeTab: tab.id }))}
            />
          ))}
        </div>
        {activeTab === 'positions' && (
          <>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
              <Search size={14} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setState((s) => ({ ...s, search: e.target.value }))}
                placeholder="Search positions..."
                className="text-sm outline-none bg-transparent w-40"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) =>
                setState((s) => ({ ...s, statusFilter: e.target.value as PositionStatus | 'All' }))
              }
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="All">All Statuses</option>
              {(
                [
                  'Filled',
                  'Vacant',
                  'Frozen',
                  'Proposed',
                  'Approved',
                  'Eliminated',
                ] as PositionStatus[]
              ).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'positions' && (
          <PositionsTab
            positions={filteredPositions}
            onSelect={(p) => setState((s) => ({ ...s, selectedPosition: p }))}
          />
        )}
        {activeTab === 'org-chart' && <OrgChartTab orgTree={orgTree} />}
        {activeTab === 'budget' && <BudgetTab budgets={budget} />}
        {activeTab === 'history' && <HistoryTab history={history} />}
      </div>

      {/* Create Position Form */}
      {showCreateForm && (
        <CreatePositionForm
          onClose={() => setState((s) => ({ ...s, showCreateForm: false }))}
          onSave={async (data) => {
            await PositionManagementService.createPosition(data);
            await load();
          }}
        />
      )}
    </div>
  );
}
