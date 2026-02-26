'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  AlertTriangle,
  User,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import type { ExpenseReport } from '@/services/expenseService';
import { ExpenseService } from '@/services/expenseService';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ExpenseApprovalQueueProps {
  approverId?: string;
  onViewReport?: (reportId: string) => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ExpenseApprovalQueue({
  approverId = 'current-user',
  onViewReport,
}: ExpenseApprovalQueueProps) {
  const [reports, setReports] = useState<ExpenseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null);
  const [sortBy, setSortBy] = useState<'amount' | 'date'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await ExpenseService.getExpenseReports({
        status: 'pending_approval',
      });
      // Also include submitted
      const submitted = await ExpenseService.getExpenseReports({ status: 'submitted' });
      const all = [...data, ...submitted];
      // Deduplicate
      const seen = new Set<string>();
      setReports(all.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true))));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const filtered = useMemo(() => {
    let result = [...reports];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.reportName.toLowerCase().includes(q) ||
          r.employeeName.toLowerCase().includes(q) ||
          r.reportCode.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const av = sortBy === 'amount' ? a.totalAmount : new Date(a.lastModified).getTime();
      const bv = sortBy === 'amount' ? b.totalAmount : new Date(b.lastModified).getTime();
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return result;
  }, [reports, search, sortBy, sortDir]);

  const handleToggleSelect = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((r) => r.id)));
    }
  };

  const handleApprove = async (reportId: string) => {
    setActionLoading(reportId);
    try {
      await ExpenseService.approveReport(reportId, approverId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setSelected((s) => {
        const n = new Set(s);
        n.delete(reportId);
        return n;
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    setActionLoading(rejectTarget);
    try {
      await ExpenseService.rejectReport(rejectTarget, rejectReason);
      setReports((prev) => prev.filter((r) => r.id !== rejectTarget));
      setSelected((s) => {
        const n = new Set(s);
        n.delete(rejectTarget);
        return n;
      });
      setRejectTarget(null);
      setRejectReason('');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkApprove = async () => {
    setShowBulkConfirm(false);
    const ids = [...selected];
    for (const id of ids) {
      setActionLoading(id);
      try {
        await ExpenseService.approveReport(id, approverId);
        setReports((prev) => prev.filter((r) => r.id !== id));
      } finally {
        setActionLoading(null);
      }
    }
    setSelected(new Set());
  };

  const totalPendingAmount = filtered.reduce((s, r) => s + r.totalAmount, 0);
  const selectedReports = filtered.filter((r) => selected.has(r.id));
  const selectedAmount = selectedReports.reduce((s, r) => s + r.totalAmount, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Approval Queue</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {filtered.length} report{filtered.length !== 1 ? 's' : ''} pending &middot; Total: $
            {totalPendingAmount.toLocaleString()}
          </p>
        </div>
        <button
          onClick={loadReports}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, employee, or code..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={`${sortBy}-${sortDir}`}
          onChange={(e) => {
            const [f, d] = e.target.value.split('-');
            setSortBy(f as 'amount' | 'date');
            setSortDir(d as 'asc' | 'desc');
          }}
          className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="date-asc">Oldest first</option>
          <option value="date-desc">Newest first</option>
          <option value="amount-desc">Highest amount</option>
          <option value="amount-asc">Lowest amount</option>
        </select>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
          <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
            {selected.size} selected &middot; ${selectedAmount.toLocaleString()}
          </span>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => {
                setBulkAction('approve');
                setShowBulkConfirm(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Bulk Approve
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="px-3 py-1.5 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header row */}
        <div className="hidden md:flex items-center gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <input
            type="checkbox"
            checked={filtered.length > 0 && selected.size === filtered.length}
            onChange={handleToggleAll}
            className="w-4 h-4 rounded text-indigo-600"
          />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide flex-1">
            Report
          </span>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide w-36">
            Employee
          </span>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide w-24 text-right">
            Amount
          </span>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide w-32">
            Submitted
          </span>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide w-32">
            Actions
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-5 animate-pulse">
                <div className="w-4 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-200 dark:text-emerald-900 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">No pending approvals</p>
            <p className="text-slate-300 dark:text-slate-600 text-xs mt-1">
              {search ? 'Try a different search' : 'You are all caught up!'}
            </p>
          </div>
        )}

        {/* Rows */}
        {!loading &&
          filtered.map((report) => {
            const isProcessing = actionLoading === report.id;
            const isSelected = selected.has(report.id);
            const submittedDaysAgo = report.submittedDate
              ? Math.floor((Date.now() - new Date(report.submittedDate).getTime()) / 86400000)
              : null;
            const isUrgent = submittedDaysAgo !== null && submittedDaysAgo >= 2;

            return (
              <div
                key={report.id}
                className={`flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-5 border-b last:border-0 border-slate-100 dark:border-slate-800 transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-900/10'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleSelect(report.id)}
                  className="w-4 h-4 rounded text-indigo-600 hidden md:block"
                />

                {/* Icon + info */}
                <div
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  onClick={() => onViewReport?.(report.id)}
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate hover:text-indigo-600 transition-colors">
                        {report.reportName}
                      </p>
                      {isUrgent && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-xs font-medium flex-shrink-0">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {report.reportCode} &middot; {report.items.length} item
                      {report.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Employee */}
                <div className="hidden md:flex items-center gap-2 w-36">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                      {report.employeeName}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{report.departmentName}</p>
                  </div>
                </div>

                {/* Amount */}
                <div className="hidden md:flex flex-col items-end w-24">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    ${report.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">{report.currency}</p>
                </div>

                {/* Submitted */}
                <div className="hidden md:block w-32">
                  <p className="text-xs text-slate-500">
                    {report.submittedDate
                      ? new Date(report.submittedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
                  </p>
                  {submittedDaysAgo !== null && (
                    <p className={`text-xs mt-0.5 ${isUrgent ? 'text-red-500' : 'text-slate-400'}`}>
                      {submittedDaysAgo}d ago
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full md:w-32">
                  <button
                    onClick={() => handleApprove(report.id)}
                    disabled={!!actionLoading}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => {
                      setRejectTarget(report.id);
                      setRejectReason('');
                    }}
                    disabled={!!actionLoading}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Reject"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onViewReport?.(report.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="View details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Reject dialog */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Reject Expense Report
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Please provide a reason. The employee will be notified.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Reason for rejection..."
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || !!actionLoading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Report'}
              </button>
              <button
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason('');
                }}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk confirm dialog */}
      {showBulkConfirm && bulkAction === 'approve' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Bulk Approve {selected.size} Report{selected.size !== 1 ? 's' : ''}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              You are approving reports totaling{' '}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                ${selectedAmount.toLocaleString()}
              </span>
              . This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleBulkApprove}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Confirm Approve
              </button>
              <button
                onClick={() => setShowBulkConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
