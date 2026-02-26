'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Receipt,
  ChevronRight,
  ChevronDown,
  SortAsc,
  SortDesc,
  Download,
  RefreshCw,
} from 'lucide-react';
import type { ExpenseReport, ExpenseStatus } from '@/services/expenseService';
import { ExpenseService, EXPENSE_STATUS_META } from '@/services/expenseService';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ExpenseReportListProps {
  onViewReport?: (reportId: string) => void;
  filterStatus?: ExpenseStatus;
  showFilters?: boolean;
}

type SortField = 'reportName' | 'totalAmount' | 'lastModified' | 'status';
type SortDir = 'asc' | 'desc';

// ── Component ──────────────────────────────────────────────────────────────────

export function ExpenseReportList({
  onViewReport,
  filterStatus,
  showFilters = true,
}: ExpenseReportListProps) {
  const [reports, setReports] = useState<ExpenseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | ''>(filterStatus ?? '');
  const [sortField, setSortField] = useState<SortField>('lastModified');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await ExpenseService.getExpenseReports({
        status: statusFilter || undefined,
        startDate: dateFrom || undefined,
        endDate: dateTo || undefined,
      });
      setReports(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, dateFrom, dateTo]);

  const filtered = useMemo(() => {
    let result = [...reports];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.reportName.toLowerCase().includes(q) ||
          r.reportCode.toLowerCase().includes(q) ||
          r.employeeName.toLowerCase().includes(q) ||
          r.departmentName.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      if (sortField === 'reportName') {
        av = a.reportName;
        bv = b.reportName;
      } else if (sortField === 'totalAmount') {
        av = a.totalAmount;
        bv = b.totalAmount;
      } else if (sortField === 'lastModified') {
        av = a.lastModified;
        bv = b.lastModified;
      } else if (sortField === 'status') {
        av = a.status;
        bv = b.status;
      }

      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [reports, search, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />;
  };

  const STATUS_OPTIONS: { value: ExpenseStatus | ''; label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'paid', label: 'Paid' },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports, employees, departments..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ExpenseStatus | '')}
            className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Filter panel toggle */}
          <button
            onClick={() => setShowFilterPanel((s) => !s)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
              showFilterPanel
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-600'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showFilterPanel ? 'rotate-180' : ''}`}
            />
          </button>

          <button
            onClick={loadReports}
            className="p-2.5 text-slate-400 hover:text-slate-600 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                  setStatusFilter('');
                  setSearch('');
                }}
                className="w-full px-3 py-2 text-sm text-slate-500 hover:text-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {loading
            ? 'Loading...'
            : `${filtered.length} report${filtered.length !== 1 ? 's' : ''} found`}
        </p>
        <button className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500 uppercase tracking-wide">
          <div className="col-span-4">
            <button
              onClick={() => handleSort('reportName')}
              className="flex items-center gap-1 hover:text-slate-700 transition-colors"
            >
              Report <SortIcon field="reportName" />
            </button>
          </div>
          <div className="col-span-2">Employee</div>
          <div className="col-span-2">
            <button
              onClick={() => handleSort('status')}
              className="flex items-center gap-1 hover:text-slate-700 transition-colors"
            >
              Status <SortIcon field="status" />
            </button>
          </div>
          <div className="col-span-2">
            <button
              onClick={() => handleSort('totalAmount')}
              className="flex items-center gap-1 hover:text-slate-700 transition-colors"
            >
              Amount <SortIcon field="totalAmount" />
            </button>
          </div>
          <div className="col-span-1">
            <button
              onClick={() => handleSort('lastModified')}
              className="flex items-center gap-1 hover:text-slate-700 transition-colors"
            >
              Modified <SortIcon field="lastModified" />
            </button>
          </div>
          <div className="col-span-1" />
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center">
            <Receipt className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">No expense reports found</p>
            <p className="text-slate-300 dark:text-slate-600 text-xs mt-1">
              {search || statusFilter
                ? 'Try adjusting your filters'
                : 'Create a new report to get started'}
            </p>
          </div>
        )}

        {/* Rows */}
        {!loading && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((report) => {
              const meta = EXPENSE_STATUS_META[report.status];
              return (
                <button
                  key={report.id}
                  onClick={() => onViewReport?.(report.id)}
                  className="w-full flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                >
                  {/* Report info */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                      <Receipt className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 transition-colors">
                        {report.reportName}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{report.reportCode}</p>
                    </div>
                  </div>

                  {/* Employee */}
                  <div className="col-span-2 flex md:flex-col md:justify-center">
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium md:truncate">
                      {report.employeeName}
                    </span>
                    <span className="hidden md:block text-xs text-slate-400 mt-0.5 truncate">
                      {report.departmentName}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${meta.bgColor} ${meta.color}`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="col-span-2 flex md:flex-col md:justify-center">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      ${report.totalAmount.toLocaleString()}
                    </span>
                    <span className="hidden md:block text-xs text-slate-400 mt-0.5">
                      {report.currency}
                    </span>
                  </div>

                  {/* Modified */}
                  <div className="col-span-1 hidden md:flex items-center">
                    <span className="text-xs text-slate-400">
                      {new Date(report.lastModified).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Arrow */}
                  <div className="col-span-1 hidden md:flex items-center justify-end">
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
