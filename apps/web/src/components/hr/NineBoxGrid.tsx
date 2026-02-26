'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Filter,
  ChevronRight,
  X,
  Star,
  TrendingUp,
  AlertTriangle,
  Info,
  RefreshCw,
} from 'lucide-react';
import type { NineBoxData, NineBoxCell, NineBoxEmployee } from '@/services/successionService';
import { SuccessionService } from '@/services/successionService';

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

const _PERFORMANCE_LABELS = ['Low', 'Medium', 'High'] as const;
const _POTENTIAL_LABELS = ['Low', 'Medium', 'High'] as const;

const DEPARTMENTS = [
  { id: undefined, name: 'All Departments' },
  { id: 'dept-001', name: 'Technology' },
  { id: 'dept-002', name: 'Human Resources' },
  { id: 'dept-003', name: 'Finance' },
  { id: 'dept-004', name: 'Marketing' },
  { id: 'dept-005', name: 'Operations' },
];

const CELL_KEY_LABELS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  'H-H': {
    bg: 'bg-emerald-50',
    border: 'border-emerald-400',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
  },
  'H-M': {
    bg: 'bg-green-50',
    border: 'border-green-400',
    text: 'text-green-800',
    dot: 'bg-green-500',
  },
  'H-L': { bg: 'bg-lime-50', border: 'border-lime-400', text: 'text-lime-800', dot: 'bg-lime-500' },
  'M-H': { bg: 'bg-sky-50', border: 'border-sky-400', text: 'text-sky-800', dot: 'bg-sky-500' },
  'M-M': {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-800',
    dot: 'bg-yellow-500',
  },
  'M-L': {
    bg: 'bg-orange-50',
    border: 'border-orange-400',
    text: 'text-orange-800',
    dot: 'bg-orange-500',
  },
  'L-H': {
    bg: 'bg-purple-50',
    border: 'border-purple-400',
    text: 'text-purple-800',
    dot: 'bg-purple-500',
  },
  'L-M': { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', dot: 'bg-red-400' },
  'L-L': { bg: 'bg-rose-50', border: 'border-rose-500', text: 'text-rose-800', dot: 'bg-rose-600' },
};

// ---------------------------------------------------------------------------
// Employee Chip
// ---------------------------------------------------------------------------

function _EmployeeChip({ emp, onClick }: { emp: NineBoxEmployee; onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={`${emp.name} — ${emp.title}`}
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-slate-300 text-slate-700 text-xs font-semibold hover:border-slate-500 hover:scale-110 transition-all shadow-sm"
    >
      {emp.initials}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Cell Detail Panel
// ---------------------------------------------------------------------------

function CellDetailPanel({ cell, onClose }: { cell: NineBoxCell; onClose: () => void }) {
  const style = CELL_KEY_LABELS[cell.cellKey] ?? CELL_KEY_LABELS['M-M'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className={`px-5 py-4 rounded-t-2xl ${style.bg} border-b ${style.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${style.dot}`} />
                <h3 className={`font-bold text-lg ${style.text}`}>{cell.label}</h3>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{cell.description}</p>
              <p className="text-xs text-slate-400 mt-1">
                Performance: <strong>{cell.performanceLevel}</strong> &bull; Potential:{' '}
                <strong>{cell.potentialLevel}</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
            >
              <X size={18} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cell.employees.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No employees in this cell</p>
            </div>
          ) : (
            cell.employees.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 flex-shrink-0">
                  {emp.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{emp.name}</p>
                  <p className="text-xs text-slate-500 truncate">{emp.title}</p>
                </div>
                <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">
                  {emp.department}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grid Cell
// ---------------------------------------------------------------------------

function GridCell({ cell, onClick }: { cell: NineBoxCell; onClick: () => void }) {
  const style = CELL_KEY_LABELS[cell.cellKey] ?? CELL_KEY_LABELS['M-M'];
  const displayEmployees = cell.employees.slice(0, 5);
  const overflow = cell.employees.length - 5;

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col p-3 rounded-xl border-2 ${style.bg} ${style.border} hover:shadow-md transition-all text-left group min-h-[120px]`}
    >
      {/* Label + Count */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className={`text-xs font-bold ${style.text} leading-tight block`}>
            {cell.label}
          </span>
          <span className="text-xs text-slate-400">
            {cell.performanceLevel} Perf / {cell.potentialLevel} Pot
          </span>
        </div>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text} border ${style.border}`}
        >
          {cell.count}
        </span>
      </div>

      {/* Avatars */}
      {cell.employees.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto">
          {displayEmployees.map((emp) => (
            <div
              key={emp.id}
              title={`${emp.name} — ${emp.title}`}
              className="w-7 h-7 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center text-xs font-semibold text-slate-700 shadow-sm"
            >
              {emp.initials}
            </div>
          ))}
          {overflow > 0 && (
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-500">
              +{overflow}
            </div>
          )}
        </div>
      )}

      {/* Hover arrow */}
      <ChevronRight
        size={14}
        className="absolute top-2 right-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function NineBoxGrid() {
  const [gridData, setGridData] = useState<NineBoxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string | undefined>(undefined);
  const [selectedCell, setSelectedCell] = useState<NineBoxCell | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedDept]);

  async function loadData() {
    setLoading(true);
    const data = await SuccessionService.getNineBoxGrid(selectedDept);
    setGridData(data);
    setLoading(false);
  }

  // Organize cells into [Performance rows: High, Medium, Low] x [Potential cols: High, Medium, Low]
  function getCellAt(perf: string, pot: string): NineBoxCell | undefined {
    return gridData?.cells.find((c) => c.performanceLevel === perf && c.potentialLevel === pot);
  }

  const performanceRows = ['High', 'Medium', 'Low'] as const;
  const potentialCols = ['High', 'Medium', 'Low'] as const;

  // Summary stats
  const starCount = getCellAt('High', 'High')?.count ?? 0;
  const riskCount = getCellAt('Low', 'Low')?.count ?? 0;
  const highPotCount =
    (getCellAt('Low', 'High')?.count ?? 0) + (getCellAt('Medium', 'High')?.count ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">9-Box Talent Grid</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Performance &times; Potential matrix — {gridData?.totalEmployees ?? 0} employees
            assessed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedDept ?? ''}
              onChange={(e) => setSelectedDept(e.target.value || undefined)}
              className="text-sm text-slate-700 bg-transparent outline-none"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.id ?? ''} value={d.id ?? ''}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={loadData}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={16} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <Star size={20} className="text-emerald-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-emerald-700">{starCount}</p>
          <p className="text-xs text-emerald-600">Stars (High/High)</p>
        </div>
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-center">
          <TrendingUp size={20} className="text-sky-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-sky-700">{highPotCount}</p>
          <p className="text-xs text-sky-600">High Potential</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center">
          <AlertTriangle size={20} className="text-rose-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-rose-700">{riskCount}</p>
          <p className="text-xs text-rose-600">At Risk</p>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-slate-200">
          <RefreshCw size={24} className="text-slate-400 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 overflow-x-auto">
          {/* Potential axis header */}
          <div className="flex items-center mb-2 pl-24">
            <div className="flex-1 text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                POTENTIAL (vertical growth)
              </span>
            </div>
          </div>
          <div className="flex items-center mb-1 pl-24">
            {potentialCols.map((pot) => (
              <div key={pot} className="flex-1 text-center text-xs font-medium text-slate-400">
                {pot}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          <div className="flex gap-1">
            {/* Performance axis label */}
            <div className="flex items-center justify-center w-6 flex-shrink-0">
              <span
                className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                PERFORMANCE (current delivery)
              </span>
            </div>

            <div className="flex flex-col gap-1 w-16 flex-shrink-0 justify-around py-1">
              {performanceRows.map((perf) => (
                <div key={perf} className="flex items-center justify-end pr-2 h-[120px]">
                  <span className="text-xs font-medium text-slate-400">{perf}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 grid grid-rows-3 gap-1">
              {performanceRows.map((perf) => (
                <div key={perf} className="grid grid-cols-3 gap-1">
                  {potentialCols.map((pot) => {
                    const cell = getCellAt(perf, pot);
                    if (!cell)
                      return <div key={pot} className="min-h-[120px] bg-slate-50 rounded-xl" />;
                    return <GridCell key={pot} cell={cell} onClick={() => setSelectedCell(cell)} />;
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-3">
            {(gridData?.cells ?? []).map((cell) => {
              const style = CELL_KEY_LABELS[cell.cellKey] ?? CELL_KEY_LABELS['M-M'];
              return (
                <div key={cell.cellKey} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                  <span className="text-xs text-slate-500">{cell.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
        <Info size={14} className="mt-0.5 flex-shrink-0" />
        <p>
          The 9-box is an annual talent review tool. Ratings are confidential and visible only to HR
          and senior leadership. Employees in top-right cells (Star/High Performer) are priority
          succession candidates. Click any cell to view employees.
        </p>
      </div>

      {/* Cell Detail Modal */}
      {selectedCell && (
        <CellDetailPanel cell={selectedCell} onClose={() => setSelectedCell(null)} />
      )}
    </div>
  );
}
