'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Users,
  Plus,
  Trash2,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Info,
  BarChart3,
  CalendarDays,
  AlertTriangle,
  Save,
} from 'lucide-react';
import type { HeadcountBudget } from '@/services/positionService';
import { PositionService } from '@/services/positionService';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlannedPosition {
  id: string;
  title: string;
  departmentId: string;
  department: string;
  grade: string;
  startDate: string;
  annualCost: number;
  type: 'New Hire' | 'Backfill' | 'Contractor';
  notes: string;
}

interface _BudgetScenario {
  id: string;
  name: string;
  positions: PlannedPosition[];
  totalCost: number;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtCurrency(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

const DEPT_OPTIONS = [
  { id: 'dept-001', name: 'Technology' },
  { id: 'dept-002', name: 'Human Resources' },
  { id: 'dept-003', name: 'Finance' },
  { id: 'dept-004', name: 'Marketing' },
  { id: 'dept-005', name: 'Operations' },
  { id: 'dept-006', name: 'Legal' },
  { id: 'dept-007', name: 'Product' },
  { id: 'dept-008', name: 'Sales' },
];

// ---------------------------------------------------------------------------
// Planned Position Row
// ---------------------------------------------------------------------------

function PlannedPositionRow({ pos, onRemove }: { pos: PlannedPosition; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{pos.title}</p>
        <p className="text-xs text-slate-500">
          {pos.department} &bull; {pos.grade} &bull; {pos.type}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">Start: {pos.startDate}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-purple-700">{fmtCurrency(pos.annualCost)}</p>
        <p className="text-xs text-purple-400">/ year</p>
      </div>
      <button
        onClick={onRemove}
        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Department Budget Row
// ---------------------------------------------------------------------------

function DeptBudgetRow({
  budget,
  plannedPositions,
  expanded,
  onToggle,
}: {
  budget: HeadcountBudget;
  plannedPositions: PlannedPosition[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const plannedCost = plannedPositions.reduce((s, p) => s + p.annualCost, 0);
  const totalProjected = budget.budgetedCost + plannedCost;
  const variance = budget.budgetedCost - budget.actualCost;
  const isOver = budget.budgetedCost + plannedCost > budget.budgetedCost * 1.1;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full grid grid-cols-6 gap-3 items-center px-4 py-4 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <div className="col-span-2 flex items-center gap-2">
          {expanded ? (
            <ChevronUp size={16} className="text-slate-400 flex-shrink-0" />
          ) : (
            <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
          )}
          <div>
            <p className="text-sm font-semibold text-slate-800">{budget.department}</p>
            <p className="text-xs text-slate-400">FY2026</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-800">{budget.approvedHeadcount}</p>
          <p className="text-xs text-slate-400">Approved HC</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-emerald-600">{budget.currentHeadcount}</p>
          <p className="text-xs text-slate-400">Current</p>
        </div>
        <div className="text-center">
          <p
            className={`text-sm font-bold ${variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
          >
            {variance >= 0 ? '+' : ''}
            {fmtCurrency(variance)}
          </p>
          <p className="text-xs text-slate-400">Budget Var.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-800">{fmtCurrency(budget.budgetedCost)}</p>
          <p className="text-xs text-slate-400">Budget</p>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-100 bg-slate-50 space-y-3">
          {/* Breakdown */}
          <div className="grid grid-cols-4 gap-3 pt-3">
            {[
              { label: 'Filled', value: budget.currentHeadcount, color: 'text-emerald-600' },
              {
                label: 'Vacant',
                value: budget.vacantPositions,
                color: budget.vacantPositions > 0 ? 'text-amber-600' : 'text-slate-400',
              },
              {
                label: 'Frozen',
                value: budget.frozenPositions,
                color: budget.frozenPositions > 0 ? 'text-slate-600' : 'text-slate-300',
              },
              {
                label: 'Planned',
                value: plannedPositions.length,
                color: plannedPositions.length > 0 ? 'text-purple-600' : 'text-slate-300',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="text-center bg-white rounded-xl border border-slate-200 p-2"
              >
                <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Budget bars */}
          <div className="bg-white rounded-xl border border-slate-200 p-3">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Actual Cost ({fmtCurrency(budget.actualCost)})</span>
              <span>{budget.utilizationPct}% used</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: `${Math.min(budget.utilizationPct, 100)}%` }}
              />
            </div>
            {plannedPositions.length > 0 && (
              <>
                <div className="flex justify-between text-xs text-purple-500 mb-1">
                  <span>With Planned (+{fmtCurrency(plannedCost)})</span>
                  <span>{Math.round((totalProjected / budget.budgetedCost) * 100)}% projected</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isOver ? 'bg-rose-400' : 'bg-purple-400'}`}
                    style={{
                      width: `${Math.min((totalProjected / budget.budgetedCost) * 100, 100)}%`,
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Planned positions */}
          {plannedPositions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Planned Additions
              </p>
              {plannedPositions.map((p) => (
                <div
                  key={p.id}
                  className="bg-purple-50 border border-purple-200 rounded-xl px-3 py-2"
                >
                  <p className="text-sm font-medium text-slate-800">{p.title}</p>
                  <p className="text-xs text-slate-500">
                    {p.grade} &bull; {p.type} &bull; Start: {p.startDate}
                  </p>
                  <p className="text-xs text-purple-600 font-semibold">
                    {fmtCurrency(p.annualCost)} / yr
                  </p>
                </div>
              ))}
            </div>
          )}

          {isOver && (
            <div className="flex items-start gap-2 p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
              <p>
                Planned additions exceed department budget by{' '}
                {fmtCurrency(totalProjected - budget.budgetedCost)}. Additional budget approval
                required.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Position Form
// ---------------------------------------------------------------------------

function AddPositionForm({
  onAdd,
  onClose,
}: {
  onAdd: (pos: PlannedPosition) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: '',
    departmentId: 'dept-001',
    grade: 'IC3',
    startDate: '2026-04-01',
    annualCost: 0,
    type: 'New Hire' as PlannedPosition['type'],
    notes: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dept = DEPT_OPTIONS.find((d) => d.id === form.departmentId);
    onAdd({
      id: `planned-${Date.now()}`,
      title: form.title,
      departmentId: form.departmentId,
      department: dept?.name ?? '',
      grade: form.grade,
      startDate: form.startDate,
      annualCost: form.annualCost,
      type: form.type,
      notes: form.notes,
    });
    onClose();
  }

  const inputClass =
    'w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">Add Planned Position</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Position Title *
            </label>
            <input
              required
              className={inputClass}
              placeholder="Position title"
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
                {DEPT_OPTIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                className={inputClass}
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Annual Cost (USD)
              </label>
              <input
                type="number"
                className={inputClass}
                placeholder="0"
                value={form.annualCost || ''}
                onChange={(e) => setForm({ ...form, annualCost: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select
              className={inputClass}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as any })}
            >
              {['New Hire', 'Backfill', 'Contractor'].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
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
              className="flex-1 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Add Position
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

export default function HeadcountBudgetPlanner() {
  const [budgets, setBudgets] = useState<HeadcountBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [fiscalYear, setFiscalYear] = useState(2026);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set(['dept-001']));
  const [plannedPositions, setPlannedPositions] = useState<PlannedPosition[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, [fiscalYear]);

  async function loadData() {
    setLoading(true);
    const bud = await PositionService.getHeadcountBudget(undefined, fiscalYear);
    setBudgets(bud);
    setLoading(false);
  }

  function toggleDept(deptId: string) {
    const next = new Set(expandedDepts);
    if (next.has(deptId)) next.delete(deptId);
    else next.add(deptId);
    setExpandedDepts(next);
  }

  function addPlanned(pos: PlannedPosition) {
    setPlannedPositions((prev) => [...prev, pos]);
  }

  function removePlanned(id: string) {
    setPlannedPositions((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const totalBudget = budgets.reduce((s, b) => s + b.budgetedCost, 0);
  const totalActual = budgets.reduce((s, b) => s + b.actualCost, 0);
  const plannedCost = plannedPositions.reduce((s, p) => s + p.annualCost, 0);
  const projectedTotal = totalActual + plannedCost;
  const totalHeadcount = budgets.reduce((s, b) => s + b.currentHeadcount, 0);
  const totalApproved = budgets.reduce((s, b) => s + b.approvedHeadcount, 0);

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
          <h2 className="text-xl font-bold text-slate-800">Headcount Budget Planner</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Plan and track headcount budgets by department
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(Number(e.target.value))}
            className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
          >
            {[2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                FY{y}
              </option>
            ))}
          </select>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {saved ? 'Saved!' : 'Save Plan'}
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Budget',
            value: fmtCurrency(totalBudget),
            sub: `FY${fiscalYear}`,
            icon: <DollarSign size={18} className="text-slate-600" />,
            color: 'bg-slate-100',
          },
          {
            label: 'Actual Cost',
            value: fmtCurrency(totalActual),
            sub: `${Math.round((totalActual / totalBudget) * 100)}% utilized`,
            icon: <TrendingUp size={18} className="text-emerald-600" />,
            color: 'bg-emerald-100',
          },
          {
            label: 'Planned Additions',
            value: fmtCurrency(plannedCost),
            sub: `${plannedPositions.length} positions`,
            icon: <Plus size={18} className="text-purple-600" />,
            color: 'bg-purple-100',
          },
          {
            label: 'Total HC',
            value: `${totalHeadcount}/${totalApproved}`,
            sub: `${totalApproved - totalHeadcount} open slots`,
            icon: <Users size={18} className="text-sky-600" />,
            color: 'bg-sky-100',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3"
          >
            <div className={`p-2 rounded-xl ${item.color} flex-shrink-0`}>{item.icon}</div>
            <div>
              <p className="text-lg font-bold text-slate-800">{item.value}</p>
              <p className="text-xs text-slate-400">{item.label}</p>
              <p className="text-xs text-slate-500">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Planned Positions Quick View */}
      {plannedPositions.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-purple-800 text-sm flex items-center gap-2">
              <CalendarDays size={15} />
              FY{fiscalYear} Planned Additions — {plannedPositions.length} positions &bull;{' '}
              {fmtCurrency(plannedCost)} additional cost
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-lg font-medium ${
                  projectedTotal <= totalBudget
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {projectedTotal <= totalBudget
                  ? `Under budget by ${fmtCurrency(totalBudget - projectedTotal)}`
                  : `Over budget by ${fmtCurrency(projectedTotal - totalBudget)}`}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {plannedPositions.map((p) => (
              <PlannedPositionRow key={p.id} pos={p} onRemove={() => removePlanned(p.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-700 text-sm">Department Breakdown</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <Plus size={14} />
          Add Planned Position
        </button>
      </div>

      {/* Department Rows */}
      <div className="space-y-3">
        {budgets.map((b) => (
          <DeptBudgetRow
            key={b.departmentId}
            budget={b}
            plannedPositions={plannedPositions.filter((p) => p.departmentId === b.departmentId)}
            expanded={expandedDepts.has(b.departmentId)}
            onToggle={() => toggleDept(b.departmentId)}
          />
        ))}
      </div>

      {/* Budget Impact Calculator */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-sky-500" />
          Budget Impact Summary
        </h3>
        <div className="space-y-3">
          {[
            {
              label: 'Current Annual Cost (Filled Positions)',
              value: totalActual,
              color: 'bg-emerald-400',
            },
            { label: 'Planned Additional Cost', value: plannedCost, color: 'bg-purple-400' },
            {
              label: 'Projected Total Cost',
              value: projectedTotal,
              color: projectedTotal > totalBudget ? 'bg-rose-400' : 'bg-sky-400',
            },
            { label: 'Approved Budget', value: totalBudget, color: 'bg-slate-300' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-40 text-xs text-slate-600 flex-shrink-0">{item.label}</div>
              <div className="flex-1 relative">
                <div className="h-5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all`}
                    style={{ width: `${Math.min((item.value / totalBudget) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="w-20 text-right text-xs font-semibold text-slate-700">
                {fmtCurrency(item.value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footnote */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
        <Info size={14} className="mt-0.5 flex-shrink-0" />
        <p>
          Budget plans require Finance Committee approval for any additions exceeding 10% of
          departmental budget. Planned positions remain in Proposed status until formally approved.
        </p>
      </div>

      {showAddForm && <AddPositionForm onAdd={addPlanned} onClose={() => setShowAddForm(false)} />}
    </div>
  );
}
