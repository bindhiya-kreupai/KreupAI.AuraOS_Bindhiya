/**
 * @module EmployeePlacement
 * @description Draggable employee placement card & detail panel for calibration
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Calendar,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Search,
  GripVertical,
  Zap,
} from 'lucide-react';
import type { CalibrationEmployee, BoxId } from './CalibrationMatrix';
import { NINE_BOX_CONFIG } from './CalibrationMatrix';

// ── Types ────────────────────────────────────────────────────────────────────────

interface EmployeePlacementProps {
  employees: CalibrationEmployee[];
  selectedEmployee: CalibrationEmployee | null;
  onSelectEmployee: (emp: CalibrationEmployee) => void;
  onMoveEmployee: (employeeId: string, targetBox: BoxId) => void;
  onDragStart: (employeeId: string) => void;
  onDragEnd: () => void;
  draggedEmployeeId: string | null;
}

type SortField = 'name' | 'performance' | 'potential' | 'score' | 'department';

// ── Helpers ──────────────────────────────────────────────────────────────────────

const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return 'text-neural-mint';
  if (rating >= 3.5) return 'text-celestial-indigo';
  if (rating >= 2.5) return 'text-sunset-amber';
  return 'text-coral-alert';
};

const getRatingBg = (rating: number): string => {
  if (rating >= 4.5) return 'bg-neural-mint/10';
  if (rating >= 3.5) return 'bg-celestial-indigo/10';
  if (rating >= 2.5) return 'bg-sunset-amber/10';
  return 'bg-coral-alert/10';
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ── Main Component ───────────────────────────────────────────────────────────────

export const EmployeePlacement: React.FC<EmployeePlacementProps> = ({
  employees,
  selectedEmployee,
  onSelectEmployee,
  onMoveEmployee,
  onDragStart,
  onDragEnd,
  draggedEmployeeId,
}) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterDept, setFilterDept] = useState<string>('all');

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department))).sort(),
    [employees]
  );

  const filtered = useMemo(() => {
    let result = [...employees];

    if (filterDept !== 'all') {
      result = result.filter((e) => e.department === filterDept);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q) ||
          e.employeeCode.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'performance':
          cmp = a.performanceRating - b.performanceRating;
          break;
        case 'potential':
          cmp = a.potentialRating - b.potentialRating;
          break;
        case 'score':
          cmp = a.overallScore - b.overallScore;
          break;
        case 'department':
          cmp = a.department.localeCompare(b.department);
          break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [employees, search, sortField, sortAsc, filterDept]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleDragStartInternal = (e: React.DragEvent, emp: CalibrationEmployee) => {
    e.dataTransfer.setData('text/plain', emp.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(emp.id);
  };

  return (
    <div className="space-y-3">
      {/* Search & Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 relative min-w-[180px]">
          <Search className="w-3 h-3 text-silver-mist absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
          />
        </div>

        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          {(['score', 'performance', 'potential', 'name'] as SortField[]).map((f) => (
            <button
              key={f}
              onClick={() => handleSort(f)}
              className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                sortField === f
                  ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo font-semibold'
                  : 'border-cloud dark:border-nebula-purple/30 text-silver-mist'
              }`}
            >
              {f === 'score'
                ? 'Score'
                : f === 'performance'
                  ? 'Perf'
                  : f === 'potential'
                    ? 'Potential'
                    : 'Name'}
              {sortField === f && (sortAsc ? ' ↑' : ' ↓')}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Count */}
      <p className="text-[10px] text-silver-mist">
        {filtered.length} of {employees.length} employees
        {search || filterDept !== 'all' ? ' (filtered)' : ''}
      </p>

      {/* Employee List */}
      <div className="space-y-1">
        {filtered.map((emp) => {
          const isSelected = selectedEmployee?.id === emp.id;
          const isDragging = draggedEmployeeId === emp.id;
          const box = NINE_BOX_CONFIG.find((b) => b.id === emp.boxId);

          return (
            <div
              key={emp.id}
              draggable
              onDragStart={(e) => handleDragStartInternal(e, emp)}
              onDragEnd={onDragEnd}
              onClick={() => onSelectEmployee(emp)}
              className={`flex items-center gap-2 p-2 rounded-xl border cursor-grab active:cursor-grabbing transition-all ${
                isSelected
                  ? 'border-celestial-indigo bg-celestial-indigo/5 shadow-sm'
                  : 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue hover:border-celestial-indigo/30'
              } ${isDragging ? 'opacity-40 scale-[0.98]' : ''}`}
            >
              {/* Drag Handle */}
              <GripVertical className="w-3 h-3 text-silver-mist/40 shrink-0" />

              {/* Avatar */}
              <div className="w-7 h-7 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-[9px] font-bold text-celestial-indigo shrink-0">
                {emp.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-ink-black dark:text-pearl truncate">
                    {emp.name}
                  </span>
                  {emp.isCalibrated && (
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-neural-mint shrink-0"
                      title="Calibrated"
                    />
                  )}
                </div>
                <div className="flex items-center gap-1 text-[9px] text-silver-mist">
                  <span className="truncate">{emp.designation}</span>
                  <span>·</span>
                  <span className="truncate">{emp.department}</span>
                </div>
              </div>

              {/* Ratings */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-center">
                  <p className={`text-[10px] font-bold ${getRatingColor(emp.performanceRating)}`}>
                    {emp.performanceRating.toFixed(1)}
                  </p>
                  <p className="text-[7px] text-silver-mist">Perf</p>
                </div>
                <div className="text-center">
                  <p className={`text-[10px] font-bold ${getRatingColor(emp.potentialRating)}`}>
                    {emp.potentialRating.toFixed(1)}
                  </p>
                  <p className="text-[7px] text-silver-mist">Pot</p>
                </div>
                <div
                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${getRatingBg(emp.overallScore)} ${getRatingColor(emp.overallScore)}`}
                >
                  {emp.overallScore.toFixed(1)}
                </div>
              </div>

              {/* Box Badge */}
              {box && (
                <span
                  className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${box.bgColor} ${box.color}`}
                >
                  {box.title}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Employee Detail Panel */}
      {selectedEmployee && (
        <EmployeeDetailPanel employee={selectedEmployee} onMoveEmployee={onMoveEmployee} />
      )}
    </div>
  );
};

// ── Detail Panel ─────────────────────────────────────────────────────────────────

const EmployeeDetailPanel: React.FC<{
  employee: CalibrationEmployee;
  onMoveEmployee: (employeeId: string, targetBox: BoxId) => void;
}> = ({ employee, onMoveEmployee }) => {
  const [showMove, setShowMove] = useState(false);
  const currentBox = NINE_BOX_CONFIG.find((b) => b.id === employee.boxId);

  return (
    <div className="rounded-xl border border-celestial-indigo/20 bg-white dark:bg-stellar-blue p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-sm font-bold text-celestial-indigo">
          {employee.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-ink-black dark:text-pearl">{employee.name}</p>
          <p className="text-[10px] text-silver-mist">
            {employee.employeeCode} · {employee.designation}
          </p>
          <p className="text-[10px] text-silver-mist">
            {employee.department} · {employee.tenure} yr tenure
          </p>
        </div>
        {currentBox && (
          <div
            className={`px-2 py-1 rounded-lg text-[10px] font-bold ${currentBox.bgColor} ${currentBox.color}`}
          >
            {currentBox.title}
          </div>
        )}
      </div>

      {/* Rating Bars */}
      <div className="grid grid-cols-3 gap-2">
        <RatingBar label="Performance" value={employee.performanceRating} max={5} />
        <RatingBar label="Potential" value={employee.potentialRating} max={5} />
        <RatingBar label="Overall" value={employee.overallScore} max={5} />
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="px-2 py-1.5 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10">
          <p className="text-silver-mist flex items-center gap-0.5">
            <Calendar className="w-2.5 h-2.5" /> Last Review
          </p>
          <p className="font-semibold text-ink-black dark:text-pearl">
            {formatDate(employee.lastReviewDate)}
          </p>
        </div>
        <div className="px-2 py-1.5 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10">
          <p className="text-silver-mist flex items-center gap-0.5">
            <Briefcase className="w-2.5 h-2.5" /> Tenure
          </p>
          <p className="font-semibold text-ink-black dark:text-pearl">
            {employee.tenure} year{employee.tenure !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Move to Box */}
      <div>
        <button
          onClick={() => setShowMove(!showMove)}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-celestial-indigo hover:text-celestial-indigo/80 transition-colors"
        >
          <ArrowRight className="w-3 h-3" />
          Move to different box
          {showMove ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showMove && (
          <div className="mt-2 grid grid-cols-3 gap-1">
            {NINE_BOX_CONFIG.map((box) => {
              const isCurrent = box.id === employee.boxId;
              return (
                <button
                  key={box.id}
                  disabled={isCurrent}
                  onClick={() => {
                    onMoveEmployee(employee.id, box.id);
                    setShowMove(false);
                  }}
                  className={`text-[9px] px-2 py-1.5 rounded-lg border transition-colors text-left ${
                    isCurrent
                      ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo font-bold'
                      : `${box.borderColor} hover:bg-celestial-indigo/5 text-silver-mist hover:text-ink-black dark:hover:text-pearl`
                  }`}
                >
                  {box.title}
                  {isCurrent && ' ✓'}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Label */}
      {currentBox && (
        <div
          className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1.5 rounded-lg ${currentBox.bgColor} ${currentBox.color}`}
        >
          <Zap className="w-3 h-3" />
          Recommended: {currentBox.actionLabel}
        </div>
      )}
    </div>
  );
};

// ── Rating Bar ───────────────────────────────────────────────────────────────────

const RatingBar: React.FC<{ label: string; value: number; max: number }> = ({
  label,
  value,
  max,
}) => {
  const pct = (value / max) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[9px] text-silver-mist">{label}</span>
        <span className={`text-[10px] font-bold ${getRatingColor(value)}`}>{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-pearl dark:bg-deep-cosmos/30 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            value >= 4.5
              ? 'bg-neural-mint'
              : value >= 3.5
                ? 'bg-celestial-indigo'
                : value >= 2.5
                  ? 'bg-sunset-amber'
                  : 'bg-coral-alert'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default EmployeePlacement;
