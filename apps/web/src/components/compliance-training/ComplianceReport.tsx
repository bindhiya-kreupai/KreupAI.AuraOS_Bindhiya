'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Users,
  Download,
  RefreshCw,
  Loader2,
  Shield,
} from 'lucide-react';
import type { DepartmentCompliance } from '@/services/complianceTrainingService';
import { ComplianceTrainingService } from '@/services/complianceTrainingService';

// ── Gauge bar ─────────────────────────────────────────────────────────────────

function ComplianceGauge({ rate }: { rate: number }) {
  const color = rate >= 90 ? 'bg-emerald-500' : rate >= 70 ? 'bg-amber-400' : 'bg-red-500';

  const textColor =
    rate >= 90 ? 'text-emerald-600' : rate >= 70 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${rate}%` }}
        />
      </div>
      <span className={`text-sm font-bold w-12 text-right ${textColor}`}>{rate.toFixed(1)}%</span>
    </div>
  );
}

// ── Department row ────────────────────────────────────────────────────────────

function DepartmentRow({
  dept,
  onDrillDown,
}: {
  dept: DepartmentCompliance;
  onDrillDown: (deptId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const _statusColor =
    dept.complianceRate >= 90
      ? 'text-emerald-600'
      : dept.complianceRate >= 70
        ? 'text-amber-600'
        : 'text-red-600';

  return (
    <>
      <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {dept.departmentName}
              </p>
              <p className="text-xs text-slate-500">{dept.totalEmployees} employees</p>
            </div>
          </div>
        </td>
        <td className="px-5 py-4">
          <div className="min-w-[180px]">
            <ComplianceGauge rate={dept.complianceRate} />
          </div>
        </td>
        <td className="px-5 py-4 text-center">
          <span className="text-sm font-medium text-emerald-600">{dept.compliantEmployees}</span>
          <span className="text-slate-400 text-xs"> / {dept.totalEmployees}</span>
        </td>
        <td className="px-5 py-4 text-center">
          <span
            className={`text-sm font-bold ${dept.overdueCount > 0 ? 'text-red-600' : 'text-slate-400'}`}
          >
            {dept.overdueCount}
          </span>
        </td>
        <td className="px-5 py-4 text-center">
          <span
            className={`text-sm font-medium ${dept.expiringCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}
          >
            {dept.expiringCount}
          </span>
        </td>
        <td className="px-5 py-4">
          <button
            onClick={() => onDrillDown(dept.departmentId)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <Users className="w-3.5 h-3.5" /> Individuals
          </button>
        </td>
      </tr>

      {/* Expanded sub-rows: per-training breakdown */}
      {expanded &&
        dept.trainings.map((t, _idx) => (
          <tr key={t.moduleId} className="bg-slate-50/50 dark:bg-slate-800/20">
            <td className="pl-14 pr-5 py-2.5 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-400">{t.moduleTitle}</p>
            </td>
            <td className="px-5 py-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="min-w-[180px]">
                <ComplianceGauge rate={t.complianceRate} />
              </div>
            </td>
            <td className="px-5 py-2.5 text-center border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-emerald-600">{t.compliantCount}</span>
            </td>
            <td className="px-5 py-2.5 text-center border-b border-slate-100 dark:border-slate-800">
              <span className={`text-xs ${t.overdueCount > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                {t.overdueCount}
              </span>
            </td>
            <td colSpan={2} className="border-b border-slate-100 dark:border-slate-800" />
          </tr>
        ))}
    </>
  );
}

// ── Score card ────────────────────────────────────────────────────────────────

function OverallScoreCard({ departments }: { departments: DepartmentCompliance[] }) {
  if (departments.length === 0) return null;

  const totalEmployees = departments.reduce((s, d) => s + d.totalEmployees, 0);
  const compliantEmployees = departments.reduce((s, d) => s + d.compliantEmployees, 0);
  const overdueTotal = departments.reduce((s, d) => s + d.overdueCount, 0);
  const overallRate = totalEmployees > 0 ? (compliantEmployees / totalEmployees) * 100 : 0;

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (overallRate / 100) * circumference;
  const color = overallRate >= 90 ? '#10b981' : overallRate >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-indigo-300" />
            <span className="text-sm font-medium text-indigo-300">
              Organization Compliance Overview
            </span>
          </div>
          <div className="grid grid-cols-3 gap-6 mt-4">
            {[
              { label: 'Total Employees', value: totalEmployees, icon: Users },
              { label: 'Compliant', value: compliantEmployees, icon: CheckCircle2 },
              { label: 'Overdue Trainings', value: overdueTotal, icon: AlertTriangle },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="w-4 h-4 text-indigo-300 mx-auto mb-1" />
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-indigo-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Donut gauge */}
        <div className="relative w-28 h-28 shrink-0">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="10"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              stroke={color}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{overallRate.toFixed(0)}%</span>
            <span className="text-xs text-indigo-400">Overall</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface ComplianceReportProps {
  onViewEmployee?: (employeeId: string) => void;
}

export function ComplianceReport({ onViewEmployee }: ComplianceReportProps) {
  const [departments, setDepartments] = useState<DepartmentCompliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<'name' | 'rate' | 'overdue'>('rate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const load = () => {
    setLoading(true);
    ComplianceTrainingService.getComplianceStatus()
      .then(setDepartments)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sorted = [...departments].sort((a, b) => {
    let aVal: number | string, bVal: number | string;
    if (sortField === 'name') {
      aVal = a.departmentName;
      bVal = b.departmentName;
    } else if (sortField === 'rate') {
      aVal = a.complianceRate;
      bVal = b.complianceRate;
    } else {
      aVal = a.overdueCount;
      bVal = b.overdueCount;
    }
    const cmp =
      typeof aVal === 'string'
        ? aVal.localeCompare(bVal as string)
        : (aVal as number) - (bVal as number);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 inline ml-1" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 inline ml-1" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Compliance Report
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Department and team-level compliance rates
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Overview card */}
      {!loading && <OverallScoreCard departments={departments} />}

      {/* Compliance status tiles */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: '≥ 90% Compliant',
              count: departments.filter((d) => d.complianceRate >= 90).length,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            },
            {
              label: '70–89% Compliant',
              count: departments.filter((d) => d.complianceRate >= 70 && d.complianceRate < 90)
                .length,
              color: 'text-amber-600',
              bg: 'bg-amber-50 dark:bg-amber-900/20',
            },
            {
              label: 'Below 70%',
              count: departments.filter((d) => d.complianceRate < 70).length,
              color: 'text-red-600',
              bg: 'bg-red-50 dark:bg-red-900/20',
            },
            {
              label: 'Departments',
              count: departments.length,
              color: 'text-indigo-600',
              bg: 'bg-indigo-50 dark:bg-indigo-900/20',
            },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
              <p className={`text-2xl font-bold ${color}`}>{count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  {[
                    { key: 'name', label: 'Department' },
                    { key: 'rate', label: 'Compliance Rate' },
                    { key: 'compliant', label: 'Compliant' },
                    { key: 'overdue', label: 'Overdue' },
                    { key: 'expiring', label: 'Expiring Soon' },
                    { key: 'actions', label: '' },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() =>
                        ['name', 'rate', 'overdue'].includes(col.key)
                          ? handleSort(col.key as any)
                          : undefined
                      }
                      className={`px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide ${['name', 'rate', 'overdue'].includes(col.key) ? 'cursor-pointer hover:text-slate-700 dark:hover:text-slate-300' : ''}`}
                    >
                      {col.label}
                      {['name', 'rate', 'overdue'].includes(col.key) && (
                        <SortIcon field={col.key as any} />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((dept) => (
                  <DepartmentRow
                    key={dept.departmentId}
                    dept={dept}
                    onDrillDown={(id) => onViewEmployee?.(id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500">
        <span className="font-medium text-slate-700 dark:text-slate-300">Compliance Level:</span>
        {[
          { color: 'bg-emerald-500', label: '≥ 90% Compliant' },
          { color: 'bg-amber-400', label: '70–89% Needs Attention' },
          { color: 'bg-red-500', label: '< 70% Critical' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
