'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  PlusCircle,
  ChevronRight,
  Lock,
  RefreshCw,
  Search,
  CalendarClock,
  CheckCircle2,
  Info,
} from 'lucide-react';
import type { Position, HeadcountBudget, PositionStatus } from '@/services/positionService';
import { PositionService } from '@/services/positionService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtCurrency(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

const STATUS_STYLE: Record<PositionStatus, { bg: string; text: string; border: string }> = {
  Filled: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  Vacant: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  Frozen: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
  Proposed: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  Approved: { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-300' },
  Eliminated: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
};

const STATUS_ICONS: Record<PositionStatus, React.ReactNode> = {
  Filled: <CheckCircle2 size={12} />,
  Vacant: <AlertTriangle size={12} />,
  Frozen: <Lock size={12} />,
  Proposed: <PlusCircle size={12} />,
  Approved: <CheckCircle2 size={12} />,
  Eliminated: <AlertTriangle size={12} />,
};

// ---------------------------------------------------------------------------
// Position Row
// ---------------------------------------------------------------------------

function PositionRow({ position }: { position: Position }) {
  const style = STATUS_STYLE[position.status];

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all">
      {/* Status indicator */}
      <div className="flex-shrink-0">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${style.bg} ${style.text} ${style.border}`}
        >
          {STATUS_ICONS[position.status]}
          {position.status}
        </span>
      </div>

      {/* Position info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-slate-800 text-sm truncate">{position.title}</p>
          <span className="text-xs text-slate-400">{position.code}</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {position.department} &bull; {position.grade} &bull; {position.location}
        </p>
        {position.incumbentName && (
          <p className="text-xs text-slate-600 mt-0.5">Incumbent: {position.incumbentName}</p>
        )}
        {position.status === 'Vacant' && position.daysVacant && (
          <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
            <CalendarClock size={10} />
            {position.daysVacant} days vacant
            {position.requiredBy && ` — Required by ${position.requiredBy}`}
          </p>
        )}
        {position.status === 'Frozen' && position.frozenReason && (
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <Lock size={10} />
            {position.frozenReason}
          </p>
        )}
      </div>

      {/* Budget */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-slate-700">{fmtCurrency(position.annualBudget)}</p>
        <p className="text-xs text-slate-400">Budget</p>
        {position.actualCost > 0 && (
          <p className="text-xs text-slate-500">{fmtCurrency(position.actualCost)} actual</p>
        )}
      </div>

      <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Department Budget Row
// ---------------------------------------------------------------------------

function BudgetRow({ budget }: { budget: HeadcountBudget }) {
  const utilPct = budget.utilizationPct;
  const barColor =
    utilPct > 100 ? 'bg-rose-500' : utilPct >= 90 ? 'bg-amber-400' : 'bg-emerald-400';

  return (
    <div className="grid grid-cols-7 gap-3 items-center py-3 border-b border-slate-100 last:border-0">
      <div className="col-span-2">
        <p className="text-sm font-medium text-slate-800">{budget.department}</p>
        <p className="text-xs text-slate-400">{budget.approvedHeadcount} approved HC</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-slate-800">{budget.currentHeadcount}</p>
        <p className="text-xs text-slate-400">Filled</p>
      </div>
      <div className="text-center">
        <p
          className={`text-lg font-bold ${budget.vacantPositions > 0 ? 'text-amber-600' : 'text-slate-400'}`}
        >
          {budget.vacantPositions}
        </p>
        <p className="text-xs text-slate-400">Vacant</p>
      </div>
      <div className="text-center">
        <p
          className={`text-lg font-bold ${budget.frozenPositions > 0 ? 'text-slate-600' : 'text-slate-300'}`}
        >
          {budget.frozenPositions}
        </p>
        <p className="text-xs text-slate-400">Frozen</p>
      </div>
      <div className="col-span-2">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{fmtCurrency(budget.actualCost)}</span>
          <span>{utilPct}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(utilPct, 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">{fmtCurrency(budget.budgetedCost)} budget</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create Position Modal
// ---------------------------------------------------------------------------

function CreatePositionModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    title: '',
    departmentId: 'dept-001',
    grade: 'IC3',
    type: 'Permanent' as const,
    location: 'Dubai HQ',
    annualBudget: 0,
    jobFamily: '',
    requiredBy: '',
    reportingToId: 'pos-t01',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await PositionService.createPosition({ ...form, headcountBudgetYear: 2026 });
    setSaving(false);
    onCreated();
    onClose();
  }

  const inputClass =
    'w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">Request New Position</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Position will be created as Proposed pending budget approval
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Position Title *
            </label>
            <input
              required
              className={inputClass}
              placeholder="e.g. Senior Software Engineer"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select
                className={inputClass}
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              >
                {[
                  ['dept-001', 'Technology'],
                  ['dept-002', 'Human Resources'],
                  ['dept-003', 'Finance'],
                  ['dept-004', 'Marketing'],
                  ['dept-005', 'Operations'],
                  ['dept-006', 'Legal'],
                  ['dept-007', 'Product'],
                  ['dept-008', 'Sales'],
                ].map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Grade</label>
              <select
                className={inputClass}
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
              >
                {[
                  'IC1',
                  'IC2',
                  'IC3',
                  'IC4',
                  'IC5',
                  'IC6',
                  'M1',
                  'M2',
                  'M3',
                  'D1',
                  'D2',
                  'D3',
                  'E1',
                  'E2',
                ].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                className={inputClass}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
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
                className={inputClass}
                placeholder="Dubai HQ"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Annual Budget (USD)
              </label>
              <input
                type="number"
                className={inputClass}
                placeholder="0"
                value={form.annualBudget || ''}
                onChange={(e) => setForm({ ...form, annualBudget: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Required By</label>
              <input
                type="date"
                className={inputClass}
                value={form.requiredBy}
                onChange={(e) => setForm({ ...form, requiredBy: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job Family</label>
            <input
              className={inputClass}
              placeholder="e.g. Software Engineering"
              value={form.jobFamily}
              onChange={(e) => setForm({ ...form, jobFamily: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Business Justification
            </label>
            <textarea
              className={`${inputClass} h-20 resize-none`}
              placeholder="Explain the business need for this position..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function PositionControlDashboard() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [budgets, setBudgets] = useState<HeadcountBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PositionStatus | 'All'>('All');
  const [activeTab, setActiveTab] = useState<'positions' | 'budget' | 'vacant'>('positions');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [pos, bud] = await Promise.all([
      PositionService.getPositions(),
      PositionService.getHeadcountBudget(),
    ]);
    setPositions(pos);
    setBudgets(bud);
    setLoading(false);
  }

  const filtered = positions.filter((p) => {
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.incumbentName?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const vacantPositions = positions.filter((p) => p.status === 'Vacant');
  const totalBudget = budgets.reduce((s, b) => s + b.budgetedCost, 0);
  const totalActual = budgets.reduce((s, b) => s + b.actualCost, 0);
  const totalFilled = budgets.reduce((s, b) => s + b.currentHeadcount, 0);
  const totalVacant = budgets.reduce((s, b) => s + b.vacantPositions, 0);
  const totalFrozen = budgets.reduce((s, b) => s + b.frozenPositions, 0);
  const totalProposed = budgets.reduce((s, b) => s + b.proposedPositions, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Position Control</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {positions.length} positions &bull; {totalFilled} filled &bull; {totalVacant} vacant
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={16} className="text-slate-500" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            <PlusCircle size={16} />
            New Position
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Filled',
            value: totalFilled,
            icon: <CheckCircle2 size={18} className="text-emerald-600" />,
            color: 'bg-emerald-100',
          },
          {
            label: 'Vacant',
            value: totalVacant,
            icon: <AlertTriangle size={18} className="text-amber-600" />,
            color: 'bg-amber-100',
          },
          {
            label: 'Frozen',
            value: totalFrozen,
            icon: <Lock size={18} className="text-slate-600" />,
            color: 'bg-slate-100',
          },
          {
            label: 'Proposed',
            value: totalProposed,
            icon: <PlusCircle size={18} className="text-purple-600" />,
            color: 'bg-purple-100',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3"
          >
            <div className={`p-2 rounded-xl ${item.color} flex-shrink-0`}>{item.icon}</div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{item.value}</p>
              <p className="text-xs text-slate-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Budget Summary Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-700">FY2026 Total Budget vs Actual</p>
            <div className="flex items-center gap-4 mt-2">
              <div>
                <p className="text-xs text-slate-500">Budgeted</p>
                <p className="text-xl font-bold text-slate-800">{fmtCurrency(totalBudget)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Actual</p>
                <p className="text-xl font-bold text-emerald-600">{fmtCurrency(totalActual)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Variance</p>
                <p className="text-xl font-bold text-sky-600">
                  {fmtCurrency(totalBudget - totalActual)} under
                </p>
              </div>
            </div>
          </div>
          <div className="sm:w-1/3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Budget Utilization</span>
              <span>{Math.round((totalActual / totalBudget) * 100)}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all"
                style={{ width: `${Math.min((totalActual / totalBudget) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1">
        {(
          [
            ['positions', 'All Positions'],
            ['budget', 'Budget by Dept'],
            ['vacant', 'Vacant Positions'],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-slate-800 text-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
            {tab === 'vacant' && totalVacant > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-600 text-xs rounded-full">
                {totalVacant}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
          {/* Search + Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
                placeholder="Search positions, codes, incumbents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
            >
              <option value="All">All Status</option>
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
          </div>

          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No positions match your filters.
              </div>
            ) : (
              filtered.map((p) => <PositionRow key={p.id} position={p} />)
            )}
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Column Headers */}
          <div className="grid grid-cols-7 gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <div className="col-span-2">Department</div>
            <div className="text-center">Filled</div>
            <div className="text-center">Vacant</div>
            <div className="text-center">Frozen</div>
            <div className="col-span-2">Budget Utilization</div>
          </div>
          <div className="divide-y divide-slate-100 px-4">
            {budgets.map((b) => (
              <BudgetRow key={b.departmentId} budget={b} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'vacant' && (
        <div className="space-y-3">
          {vacantPositions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-2" />
              <p className="text-slate-600 font-medium">No vacant positions</p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <p>
                  {vacantPositions.length} positions are currently vacant. Total unrealized budget
                  cost:{' '}
                  <strong>
                    {fmtCurrency(vacantPositions.reduce((s, p) => s + p.annualBudget, 0))}
                  </strong>{' '}
                  per year.
                </p>
              </div>
              {vacantPositions.map((p) => (
                <PositionRow key={p.id} position={p} />
              ))}
            </>
          )}
        </div>
      )}

      {showCreateModal && (
        <CreatePositionModal onClose={() => setShowCreateModal(false)} onCreated={loadData} />
      )}
    </div>
  );
}
