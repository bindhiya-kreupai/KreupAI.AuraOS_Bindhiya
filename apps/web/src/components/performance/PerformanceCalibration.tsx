/**
 * @module PerformanceCalibration
 * @description Main performance calibration tool with 9-box grid, employee placement,
 *              bell curve distribution, and calibration workflow
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Grid3x3,
  BarChart3,
  Users,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
} from 'lucide-react';
import { CalibrationMatrix, NINE_BOX_CONFIG } from './CalibrationMatrix';
import type {
  CalibrationEmployee,
  BoxId,
  PerformanceLevel,
  PotentialLevel,
} from './CalibrationMatrix';
import { EmployeePlacement } from './EmployeePlacement';

// ── Types ────────────────────────────────────────────────────────────────────────

type ActiveTab = 'matrix' | 'distribution' | 'roster';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
}

interface DistributionBucket {
  label: string;
  shortLabel: string;
  ratingRange: string;
  idealPercent: number;
  actualCount: number;
  actualPercent: number;
  deviation: number;
  color: string;
  bgColor: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────────

const levelFromRating = (rating: number): 'low' | 'moderate' | 'high' => {
  if (rating >= 4) return 'high';
  if (rating >= 2.5) return 'moderate';
  return 'low';
};

const _computeBoxId = (perfRating: number, potRating: number): BoxId => {
  const perf = levelFromRating(perfRating) as PerformanceLevel;
  const pot = levelFromRating(potRating) as PotentialLevel;
  return `${pot}-${perf}` as BoxId;
};

// ── Mock Data ────────────────────────────────────────────────────────────────────

const INITIAL_EMPLOYEES: CalibrationEmployee[] = [
  {
    id: 'CAL-001',
    name: 'Alice Chen',
    employeeCode: 'EMP-1001',
    designation: 'Senior Developer',
    department: 'Engineering',
    avatar: 'AC',
    performanceRating: 4.5,
    potentialRating: 4.8,
    performanceLevel: 'high',
    potentialLevel: 'high',
    boxId: 'high-high',
    tenure: 5,
    lastReviewDate: '2025-12-15',
    overallScore: 4.6,
    isCalibrated: true,
  },
  {
    id: 'CAL-002',
    name: 'Bob Patel',
    employeeCode: 'EMP-1002',
    designation: 'Product Lead',
    department: 'Product',
    avatar: 'BP',
    performanceRating: 3.8,
    potentialRating: 4.5,
    performanceLevel: 'moderate',
    potentialLevel: 'high',
    boxId: 'high-moderate',
    tenure: 3,
    lastReviewDate: '2025-12-10',
    overallScore: 4.1,
    isCalibrated: false,
  },
  {
    id: 'CAL-003',
    name: 'Carol James',
    employeeCode: 'EMP-1003',
    designation: 'UX Designer',
    department: 'Design',
    avatar: 'CJ',
    performanceRating: 4.2,
    potentialRating: 3.5,
    performanceLevel: 'high',
    potentialLevel: 'moderate',
    boxId: 'moderate-high',
    tenure: 4,
    lastReviewDate: '2025-12-12',
    overallScore: 3.9,
    isCalibrated: true,
  },
  {
    id: 'CAL-004',
    name: 'David Kim',
    employeeCode: 'EMP-1004',
    designation: 'QA Engineer',
    department: 'Engineering',
    avatar: 'DK',
    performanceRating: 3.2,
    potentialRating: 3.0,
    performanceLevel: 'moderate',
    potentialLevel: 'moderate',
    boxId: 'moderate-moderate',
    tenure: 2,
    lastReviewDate: '2025-12-08',
    overallScore: 3.1,
    isCalibrated: false,
  },
  {
    id: 'CAL-005',
    name: 'Eva Martinez',
    employeeCode: 'EMP-1005',
    designation: 'Marketing Manager',
    department: 'Marketing',
    avatar: 'EM',
    performanceRating: 2.0,
    potentialRating: 4.0,
    performanceLevel: 'low',
    potentialLevel: 'high',
    boxId: 'high-low',
    tenure: 1,
    lastReviewDate: '2025-12-05',
    overallScore: 2.8,
    isCalibrated: false,
  },
  {
    id: 'CAL-006',
    name: 'Frank Wu',
    employeeCode: 'EMP-1006',
    designation: 'DevOps Lead',
    department: 'Engineering',
    avatar: 'FW',
    performanceRating: 4.7,
    potentialRating: 2.5,
    performanceLevel: 'high',
    potentialLevel: 'moderate',
    boxId: 'moderate-high',
    tenure: 7,
    lastReviewDate: '2025-12-14',
    overallScore: 3.8,
    isCalibrated: true,
  },
  {
    id: 'CAL-007',
    name: 'Grace Lee',
    employeeCode: 'EMP-1007',
    designation: 'Business Analyst',
    department: 'Product',
    avatar: 'GL',
    performanceRating: 3.5,
    potentialRating: 3.2,
    performanceLevel: 'moderate',
    potentialLevel: 'moderate',
    boxId: 'moderate-moderate',
    tenure: 3,
    lastReviewDate: '2025-12-11',
    overallScore: 3.4,
    isCalibrated: false,
  },
  {
    id: 'CAL-008',
    name: 'Henry Adams',
    employeeCode: 'EMP-1008',
    designation: 'Support Specialist',
    department: 'Support',
    avatar: 'HA',
    performanceRating: 2.2,
    potentialRating: 2.0,
    performanceLevel: 'low',
    potentialLevel: 'low',
    boxId: 'low-low',
    tenure: 1,
    lastReviewDate: '2025-12-03',
    overallScore: 2.1,
    isCalibrated: false,
  },
  {
    id: 'CAL-009',
    name: 'Iris Tanaka',
    employeeCode: 'EMP-1009',
    designation: 'Data Scientist',
    department: 'Engineering',
    avatar: 'IT',
    performanceRating: 4.8,
    potentialRating: 4.5,
    performanceLevel: 'high',
    potentialLevel: 'high',
    boxId: 'high-high',
    tenure: 2,
    lastReviewDate: '2025-12-13',
    overallScore: 4.7,
    isCalibrated: true,
  },
  {
    id: 'CAL-010',
    name: 'Jake Wilson',
    employeeCode: 'EMP-1010',
    designation: 'Sales Executive',
    department: 'Sales',
    avatar: 'JW',
    performanceRating: 3.0,
    potentialRating: 2.0,
    performanceLevel: 'moderate',
    potentialLevel: 'low',
    boxId: 'low-moderate',
    tenure: 4,
    lastReviewDate: '2025-12-06',
    overallScore: 2.6,
    isCalibrated: false,
  },
  {
    id: 'CAL-011',
    name: 'Karen Singh',
    employeeCode: 'EMP-1011',
    designation: 'HR Business Partner',
    department: 'HR',
    avatar: 'KS',
    performanceRating: 4.0,
    potentialRating: 3.8,
    performanceLevel: 'high',
    potentialLevel: 'moderate',
    boxId: 'moderate-high',
    tenure: 6,
    lastReviewDate: '2025-12-09',
    overallScore: 3.9,
    isCalibrated: true,
  },
  {
    id: 'CAL-012',
    name: 'Leo Nguyen',
    employeeCode: 'EMP-1012',
    designation: 'Frontend Developer',
    department: 'Engineering',
    avatar: 'LN',
    performanceRating: 3.6,
    potentialRating: 4.2,
    performanceLevel: 'moderate',
    potentialLevel: 'high',
    boxId: 'high-moderate',
    tenure: 2,
    lastReviewDate: '2025-12-07',
    overallScore: 3.8,
    isCalibrated: false,
  },
];

// ── StatCard ─────────────────────────────────────────────────────────────────────

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue">
    <div className={`p-1.5 rounded-lg ${color}`}>
      <Icon className="w-3.5 h-3.5" />
    </div>
    <div>
      <p className="text-lg font-bold text-ink-black dark:text-pearl leading-none">{value}</p>
      <p className="text-[9px] text-silver-mist">{label}</p>
    </div>
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────────

export const PerformanceCalibration: React.FC = () => {
  const [employees, setEmployees] = useState<CalibrationEmployee[]>(INITIAL_EMPLOYEES);
  const [activeTab, setActiveTab] = useState<ActiveTab>('matrix');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [draggedEmployeeId, setDraggedEmployeeId] = useState<string | null>(null);
  const [changeLog, setChangeLog] = useState<{ empId: string; from: BoxId; to: BoxId }[]>([]);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === selectedEmployeeId) || null,
    [employees, selectedEmployeeId]
  );

  const calibratedCount = useMemo(
    () => employees.filter((e) => e.isCalibrated).length,
    [employees]
  );

  const avgScore = useMemo(
    () =>
      employees.length
        ? (employees.reduce((s, e) => s + e.overallScore, 0) / employees.length).toFixed(1)
        : '0.0',
    [employees]
  );

  // ── Actions ────────────────────────────────────────────────────────────────

  const moveEmployee = useCallback((employeeId: string, targetBox: BoxId) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== employeeId) return emp;
        if (emp.boxId === targetBox) return emp;

        const [potLevel, perfLevel] = targetBox.split('-') as [PotentialLevel, PerformanceLevel];

        setChangeLog((log) => [...log, { empId: emp.id, from: emp.boxId, to: targetBox }]);

        return {
          ...emp,
          boxId: targetBox,
          performanceLevel: perfLevel,
          potentialLevel: potLevel,
          isCalibrated: true,
        };
      })
    );
  }, []);

  const handleSelectEmployee = useCallback((emp: CalibrationEmployee) => {
    setSelectedEmployeeId((prev) => (prev === emp.id ? null : emp.id));
  }, []);

  const handleReset = useCallback(() => {
    setEmployees(INITIAL_EMPLOYEES);
    setChangeLog([]);
    setSelectedEmployeeId(null);
  }, []);

  // ── Bell Curve Distribution ────────────────────────────────────────────────

  const distribution: DistributionBucket[] = useMemo(() => {
    const total = employees.length;
    const buckets: Omit<DistributionBucket, 'actualCount' | 'actualPercent' | 'deviation'>[] = [
      {
        label: 'Outstanding',
        shortLabel: '5',
        ratingRange: '4.5–5.0',
        idealPercent: 10,
        color: 'text-neural-mint',
        bgColor: 'bg-neural-mint',
      },
      {
        label: 'Exceeds Expectations',
        shortLabel: '4',
        ratingRange: '3.5–4.4',
        idealPercent: 20,
        color: 'text-celestial-indigo',
        bgColor: 'bg-celestial-indigo',
      },
      {
        label: 'Meets Expectations',
        shortLabel: '3',
        ratingRange: '2.5–3.4',
        idealPercent: 40,
        color: 'text-sunset-amber',
        bgColor: 'bg-sunset-amber',
      },
      {
        label: 'Developing',
        shortLabel: '2',
        ratingRange: '1.5–2.4',
        idealPercent: 20,
        color: 'text-quantum-rose',
        bgColor: 'bg-quantum-rose',
      },
      {
        label: 'Needs Improvement',
        shortLabel: '1',
        ratingRange: '1.0–1.4',
        idealPercent: 10,
        color: 'text-coral-alert',
        bgColor: 'bg-coral-alert',
      },
    ];

    return buckets.map((b) => {
      let count = 0;
      const [minStr, maxStr] = b.ratingRange.split('–');
      const min = parseFloat(minStr);
      const max = parseFloat(maxStr);
      employees.forEach((e) => {
        if (e.overallScore >= min && e.overallScore <= max) count++;
      });
      const actualPercent = total ? Math.round((count / total) * 100) : 0;
      return {
        ...b,
        actualCount: count,
        actualPercent,
        deviation: actualPercent - b.idealPercent,
      };
    });
  }, [employees]);

  const hasDistributionIssue = distribution.some((d) => Math.abs(d.deviation) > 10);

  // ── Box Distribution Summary ───────────────────────────────────────────────

  const boxSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    NINE_BOX_CONFIG.forEach((b) => {
      counts[b.id] = 0;
    });
    employees.forEach((e) => {
      counts[e.boxId] = (counts[e.boxId] || 0) + 1;
    });
    return counts;
  }, [employees]);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard
          icon={Users}
          label="Total Employees"
          value={employees.length}
          color="bg-celestial-indigo/10 text-celestial-indigo"
        />
        <StatCard
          icon={CheckCircle2}
          label="Calibrated"
          value={calibratedCount}
          color="bg-neural-mint/10 text-neural-mint"
        />
        <StatCard
          icon={BarChart3}
          label="Avg Score"
          value={avgScore}
          color="bg-sunset-amber/10 text-sunset-amber"
        />
        <StatCard
          icon={ArrowRightLeft}
          label="Movements"
          value={changeLog.length}
          color="bg-nebula-purple/10 text-nebula-purple"
        />
        <StatCard
          icon={AlertTriangle}
          label="Uncalibrated"
          value={employees.length - calibratedCount}
          color="bg-coral-alert/10 text-coral-alert"
        />
      </div>

      {/* Distribution Alert */}
      {hasDistributionIssue && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl border border-sunset-amber/30 bg-sunset-amber/5">
          <AlertTriangle className="w-4 h-4 text-sunset-amber shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-sunset-amber">Distribution Alert</p>
            <p className="text-[10px] text-sunset-amber/80">
              Rating distribution deviates significantly from the ideal bell curve. Consider
              re-calibrating to align with organizational guidelines.
            </p>
          </div>
        </div>
      )}

      {/* Tabs + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-pearl dark:bg-deep-cosmos rounded-xl p-0.5 border border-cloud dark:border-nebula-purple/30 w-fit">
          {[
            { key: 'matrix' as ActiveTab, icon: Grid3x3, label: '9-Box Matrix' },
            { key: 'distribution' as ActiveTab, icon: BarChart3, label: 'Bell Curve' },
            { key: 'roster' as ActiveTab, icon: Users, label: 'Employee Roster' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm'
                  : 'text-silver-mist hover:text-twilight dark:hover:text-pearl'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-silver-mist hover:text-ink-black dark:hover:text-pearl border border-cloud dark:border-nebula-purple/30 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity">
            <Save className="w-3 h-3" /> Save Calibration
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
          {/* 9-Box Grid */}
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4">
            <CalibrationMatrix
              employees={employees}
              onDropEmployee={moveEmployee}
              onSelectEmployee={handleSelectEmployee}
              selectedEmployeeId={selectedEmployeeId}
              draggedEmployeeId={draggedEmployeeId}
              onDragStart={setDraggedEmployeeId}
              onDragEnd={() => setDraggedEmployeeId(null)}
            />
          </div>

          {/* Sidebar: Employee Detail + Box Summary */}
          <div className="space-y-3">
            {selectedEmployee ? (
              <div className="rounded-xl border border-celestial-indigo/20 bg-white dark:bg-stellar-blue p-3 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-sm font-bold text-celestial-indigo">
                    {selectedEmployee.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink-black dark:text-pearl">
                      {selectedEmployee.name}
                    </p>
                    <p className="text-[10px] text-silver-mist">
                      {selectedEmployee.designation} · {selectedEmployee.department}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <MiniRating label="Perf" value={selectedEmployee.performanceRating} />
                  <MiniRating label="Potential" value={selectedEmployee.potentialRating} />
                  <MiniRating label="Overall" value={selectedEmployee.overallScore} />
                </div>
                <p className="text-[9px] text-silver-mist">
                  Drag this employee to any box on the 9-box grid, or use the roster tab for
                  detailed placement.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 text-center">
                <Users className="w-6 h-6 text-silver-mist/30 mx-auto mb-2" />
                <p className="text-[11px] text-silver-mist">
                  Click an employee on the grid to see details
                </p>
              </div>
            )}

            {/* Box Distribution */}
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-3 space-y-2">
              <p className="text-[11px] font-bold text-ink-black dark:text-pearl">
                Box Distribution
              </p>
              {NINE_BOX_CONFIG.map((box) => {
                const count = boxSummary[box.id] || 0;
                const pct = employees.length ? Math.round((count / employees.length) * 100) : 0;
                return (
                  <div key={box.id} className="flex items-center gap-2">
                    <span className={`text-[9px] font-semibold w-24 truncate ${box.color}`}>
                      {box.title}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-pearl dark:bg-deep-cosmos/30 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${box.bgColor.replace('/5', '')} opacity-60`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-ink-black dark:text-pearl w-6 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Change Log */}
            {changeLog.length > 0 && (
              <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-3 space-y-1.5">
                <p className="text-[11px] font-bold text-ink-black dark:text-pearl">
                  Recent Changes ({changeLog.length})
                </p>
                {changeLog
                  .slice(-5)
                  .reverse()
                  .map((c, i) => {
                    const emp = employees.find((e) => e.id === c.empId);
                    const fromBox = NINE_BOX_CONFIG.find((b) => b.id === c.from);
                    const toBox = NINE_BOX_CONFIG.find((b) => b.id === c.to);
                    return (
                      <div key={i} className="text-[9px] text-silver-mist flex items-center gap-1">
                        <span className="font-semibold text-ink-black dark:text-pearl">
                          {emp?.name}
                        </span>
                        <span className={fromBox?.color}>{fromBox?.title}</span>
                        <ArrowRightLeft className="w-2.5 h-2.5" />
                        <span className={toBox?.color}>{toBox?.title}</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'distribution' && (
        <BellCurveDistribution distribution={distribution} employees={employees} />
      )}

      {activeTab === 'roster' && (
        <EmployeePlacement
          employees={employees}
          selectedEmployee={selectedEmployee}
          onSelectEmployee={handleSelectEmployee}
          onMoveEmployee={moveEmployee}
          onDragStart={setDraggedEmployeeId}
          onDragEnd={() => setDraggedEmployeeId(null)}
          draggedEmployeeId={draggedEmployeeId}
        />
      )}
    </div>
  );
};

// ── Mini Rating ──────────────────────────────────────────────────────────────────

const MiniRating: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const color =
    value >= 4.5
      ? 'text-neural-mint'
      : value >= 3.5
        ? 'text-celestial-indigo'
        : value >= 2.5
          ? 'text-sunset-amber'
          : 'text-coral-alert';
  return (
    <div className="text-center px-2 py-1.5 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10">
      <p className={`text-sm font-bold ${color}`}>{value.toFixed(1)}</p>
      <p className="text-[8px] text-silver-mist">{label}</p>
    </div>
  );
};

// ── Bell Curve Distribution View ─────────────────────────────────────────────────

const BellCurveDistribution: React.FC<{
  distribution: DistributionBucket[];
  employees: CalibrationEmployee[];
}> = ({ distribution, employees }) => {
  const maxPercent = Math.max(
    ...distribution.map((d) => Math.max(d.idealPercent, d.actualPercent)),
    50
  );

  return (
    <div className="space-y-4">
      {/* Visual Bell Curve Bars */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-celestial-indigo" />
            Rating Distribution vs. Ideal Bell Curve
          </p>
          <div className="flex items-center gap-4 text-[10px]">
            <div className="flex items-center gap-1">
              <div className="w-3 h-1.5 rounded-full bg-silver-mist/30" />
              <span className="text-silver-mist">Ideal</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1.5 rounded-full bg-celestial-indigo" />
              <span className="text-silver-mist">Actual</span>
            </div>
          </div>
        </div>

        {/* Horizontal Bar Chart */}
        <div className="space-y-3">
          {distribution.map((bucket) => (
            <div key={bucket.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-semibold ${bucket.color}`}>
                    {bucket.shortLabel}
                  </span>
                  <span className="text-[10px] text-ink-black dark:text-pearl font-medium">
                    {bucket.label}
                  </span>
                  <span className="text-[9px] text-silver-mist">({bucket.ratingRange})</span>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="text-silver-mist">Target: {bucket.idealPercent}%</span>
                  <span
                    className={`font-bold ${
                      Math.abs(bucket.deviation) <= 5
                        ? 'text-neural-mint'
                        : Math.abs(bucket.deviation) <= 10
                          ? 'text-sunset-amber'
                          : 'text-coral-alert'
                    }`}
                  >
                    Actual: {bucket.actualPercent}%
                  </span>
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                      bucket.deviation === 0
                        ? 'bg-neural-mint/10 text-neural-mint'
                        : bucket.deviation > 0
                          ? 'bg-coral-alert/10 text-coral-alert'
                          : 'bg-sunset-amber/10 text-sunset-amber'
                    }`}
                  >
                    {bucket.deviation > 0 ? '+' : ''}
                    {bucket.deviation}%
                  </span>
                </div>
              </div>

              {/* Dual Bars */}
              <div className="space-y-0.5">
                <div className="h-2 rounded-full bg-pearl dark:bg-deep-cosmos/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-silver-mist/20 transition-all"
                    style={{ width: `${(bucket.idealPercent / maxPercent) * 100}%` }}
                  />
                </div>
                <div className="h-2.5 rounded-full bg-pearl dark:bg-deep-cosmos/30 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${bucket.bgColor}`}
                    style={{ width: `${(bucket.actualPercent / maxPercent) * 100}%` }}
                  />
                </div>
              </div>

              {/* Employee Count */}
              <p className="text-[9px] text-silver-mist">
                {bucket.actualCount} employee{bucket.actualCount !== 1 ? 's' : ''}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {distribution.map((bucket) => (
          <div
            key={bucket.label}
            className={`rounded-xl border p-3 text-center ${
              Math.abs(bucket.deviation) <= 5
                ? 'border-neural-mint/20 bg-neural-mint/5'
                : Math.abs(bucket.deviation) <= 10
                  ? 'border-sunset-amber/20 bg-sunset-amber/5'
                  : 'border-coral-alert/20 bg-coral-alert/5'
            }`}
          >
            <p className={`text-xl font-bold ${bucket.color}`}>{bucket.actualCount}</p>
            <p className="text-[10px] font-semibold text-ink-black dark:text-pearl">
              {bucket.label}
            </p>
            <p className="text-[9px] text-silver-mist mt-0.5">
              {bucket.actualPercent}% (ideal {bucket.idealPercent}%)
            </p>
          </div>
        ))}
      </div>

      {/* Employees by Distribution Bucket */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-3">
        <p className="text-sm font-bold text-ink-black dark:text-pearl">Employees by Rating Band</p>
        {distribution.map((bucket) => {
          const [minStr, maxStr] = bucket.ratingRange.split('–');
          const min = parseFloat(minStr);
          const max = parseFloat(maxStr);
          const bucketEmps = employees.filter(
            (e) => e.overallScore >= min && e.overallScore <= max
          );

          if (bucketEmps.length === 0) return null;

          return (
            <div key={bucket.label}>
              <p className={`text-[10px] font-bold ${bucket.color} mb-1`}>
                {bucket.label} ({bucket.ratingRange})
              </p>
              <div className="flex flex-wrap gap-1">
                {bucketEmps.map((emp) => (
                  <span
                    key={emp.id}
                    className="text-[9px] px-2 py-1 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-pearl/20 dark:bg-deep-cosmos/10 text-ink-black dark:text-pearl"
                  >
                    {emp.name} ({emp.overallScore.toFixed(1)})
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PerformanceCalibration;
