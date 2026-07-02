'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, CheckCircle, XCircle, Filter, Calendar, ArrowRight, X } from 'lucide-react';
import { AttendanceAnalyticsService } from '../services';

interface Exception {
  id: number | string;
  emp: string;
  employeeId?: string;
  date: string;
  type: string;
  actual: string;
  expected: string;
  status: string;
}

interface ExceptionStats {
  total: number;
  lateIn: number;
  earlyOut: number;
  absent: number;
}

// Server-side filter values map to the GET /api/attendance/exceptions query.
interface ExceptionFilters {
  type: string; // '' | LATE_ARRIVAL | EARLY_DEPARTURE | MISSING_PUNCH | SHORT_DURATION | ABSENT
  status: string; // '' | PENDING | APPROVED | REJECTED
  date: string; // yyyy-mm-dd
}

const EMPTY_FILTERS: ExceptionFilters = { type: '', status: '', date: '' };

export default function AttendanceExceptionsPage() {
  const [exceptionList, setExceptionList] = useState<Exception[]>([]);
  const [stats, setStats] = useState<ExceptionStats>({
    total: 0,
    lateIn: 0,
    earlyOut: 0,
    absent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ExceptionFilters>(EMPTY_FILTERS);
  const [statusMsg, setStatusMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    fetchExceptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    if (!statusMsg) return;
    const t = setTimeout(() => setStatusMsg(null), 4000);
    return () => clearTimeout(t);
  }, [statusMsg]);

  const activeFilterCount = useMemo(
    () => (filters.type ? 1 : 0) + (filters.status ? 1 : 0) + (filters.date ? 1 : 0),
    [filters]
  );

  const fetchExceptions = async () => {
    try {
      setLoading(true);
      const exceptions = await AttendanceAnalyticsService.getExceptions({
        type: filters.type || undefined,
        status: filters.status || undefined,
        date: filters.date || undefined,
      });
      const exceptionsArr = (exceptions || []) as any[];
      setExceptionList(exceptionsArr as any);
      // Drop selections that no longer exist in the refreshed list
      setSelectedIds((prev) => {
        const validIds = new Set(exceptionsArr.map((e) => String(e.id)));
        const next = new Set<string>();
        prev.forEach((id) => validIds.has(id) && next.add(id));
        return next;
      });
      // Calculate stats from exceptions
      const lateIn = exceptionsArr.filter((e: any) => e.type?.includes('Late')).length;
      const earlyOut = exceptionsArr.filter((e: any) => e.type?.includes('Early')).length;
      const absent = exceptionsArr.filter((e: any) => e.type?.includes('Absent')).length;
      setStats({
        total: exceptionsArr.length,
        lateIn,
        earlyOut,
        absent,
      });
    } catch (error: any) {
      console.error('Error:', error);
      setStatusMsg({ kind: 'error', text: 'Failed to load exceptions.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string | number, action: 'regularize' | 'deduct') => {
    setLoading(true);
    setStatusMsg(null);
    try {
      await AttendanceAnalyticsService.resolveException(id, action);
      await fetchExceptions();
      setStatusMsg({
        kind: 'success',
        text: action === 'regularize' ? 'Exception regularized.' : 'Marked for deduction.',
      });
    } catch (error: any) {
      console.error('Error:', error);
      setStatusMsg({ kind: 'error', text: error?.message || 'Failed to resolve exception.' });
    } finally {
      setLoading(false);
    }
  };

  // Only pending rows can be bulk-approved; already-resolved rows are excluded.
  const pendingRows = useMemo(
    () => exceptionList.filter((r) => (r.status || '').toLowerCase() === 'pending'),
    [exceptionList]
  );
  const allPendingSelected =
    pendingRows.length > 0 && pendingRows.every((r) => selectedIds.has(String(r.id)));

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds(() => {
      if (allPendingSelected) return new Set();
      return new Set(pendingRows.map((r) => String(r.id)));
    });
  };

  const handleApproveSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      setStatusMsg({ kind: 'error', text: 'Select at least one exception to approve.' });
      return;
    }
    setLoading(true);
    setStatusMsg(null);
    try {
      const results = await Promise.allSettled(
        ids.map((id) => AttendanceAnalyticsService.resolveException(id, 'regularize'))
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      await fetchExceptions();
      setSelectedIds(new Set());
      if (failed > 0) {
        setStatusMsg({
          kind: 'error',
          text: `${ids.length - failed} approved, ${failed} failed.`,
        });
      } else {
        setStatusMsg({ kind: 'success', text: `${ids.length} exception(s) approved.` });
      }
    } catch (error: any) {
      console.error('Error:', error);
      setStatusMsg({ kind: 'error', text: error?.message || 'Bulk approval failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-amber-500" />
            Attendance Exceptions
          </h1>
          <p className="text-silver-mist text-sm mt-1">Review and resolve attendance anomalies.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`relative flex items-center gap-2 px-4 py-2 font-bold rounded-lg border transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-900/20'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" /> Filter
            {activeFilterCount > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={handleApproveSelected}
            disabled={loading || selectedIds.size === 0}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" /> Approve Selected
            {selectedIds.size > 0 && ` (${selectedIds.size})`}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm flex items-center gap-2 ${
            statusMsg.kind === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          {statusMsg.kind === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {statusMsg.text}
        </div>
      )}

      {showFilters && (
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <label className="block">
            <span className="block text-xs font-bold text-silver-mist mb-1 uppercase">Type</span>
            <select
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm focus:outline-none"
            >
              <option value="">All types</option>
              <option value="LATE_ARRIVAL">Late Arrival</option>
              <option value="EARLY_DEPARTURE">Early Departure</option>
              <option value="MISSING_PUNCH">Missing Punch</option>
              <option value="SHORT_DURATION">Short Duration</option>
              <option value="ABSENT">Absent</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-silver-mist mb-1 uppercase">Status</span>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm focus:outline-none"
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Regularized</option>
              <option value="REJECTED">Deducted</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-silver-mist mb-1 uppercase">Date</span>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            disabled={activeFilterCount === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold border border-cloud dark:border-nebula-purple/50 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" /> Clear filters
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <p className="text-xs font-bold text-silver-mist uppercase">Total Exceptions</p>
          <h3 className="text-2xl font-bold text-ink-black dark:text-pearl">{stats.total}</h3>
        </div>
        <div className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <p className="text-xs font-bold text-silver-mist uppercase">Late In</p>
          <h3 className="text-2xl font-bold text-amber-500">{stats.lateIn}</h3>
        </div>
        <div className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <p className="text-xs font-bold text-silver-mist uppercase">Early Out</p>
          <h3 className="text-2xl font-bold text-indigo-500">{stats.earlyOut}</h3>
        </div>
        <div className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <p className="text-xs font-bold text-silver-mist uppercase">Absent</p>
          <h3 className="text-2xl font-bold text-rose-500">{stats.absent}</h3>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-silver-mist font-bold">
            <tr>
              <th className="px-4 py-4 w-10 text-center">
                <input
                  type="checkbox"
                  aria-label="Select all pending exceptions"
                  checked={allPendingSelected}
                  onChange={toggleAll}
                  disabled={pendingRows.length === 0}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:opacity-40"
                />
              </th>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-center">Timings</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                </td>
              </tr>
            ) : exceptionList.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  {activeFilterCount > 0
                    ? 'No exceptions match the filters'
                    : 'No exceptions found'}
                </td>
              </tr>
            ) : (
              exceptionList.map((row) => {
                const rowId = String(row.id);
                const isPending = (row.status || '').toLowerCase() === 'pending';
                return (
                  <tr
                    key={rowId}
                    className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${selectedIds.has(rowId) ? 'bg-emerald-50/60 dark:bg-emerald-900/10' : ''}`}
                  >
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        aria-label={`Select exception for ${row.emp}`}
                        checked={selectedIds.has(rowId)}
                        onChange={() => toggleRow(rowId)}
                        disabled={!isPending}
                        title={isPending ? undefined : 'Only pending exceptions can be selected'}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:opacity-30"
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-ink-black dark:text-pearl">
                      {row.emp}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5" /> {row.date}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold border ${
                          row.type.includes('Late')
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : row.type.includes('Early')
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <span className="text-slate-400">{row.expected}</span>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {row.actual}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-bold text-slate-500">{row.status}</span>
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-2">
                      <button
                        onClick={() => handleResolve(row.id, 'regularize')}
                        disabled={loading}
                        className="p-1.5 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200 transition-colors disabled:opacity-50"
                        title="Regularize"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResolve(row.id, 'deduct')}
                        disabled={loading}
                        className="p-1.5 bg-rose-100 text-rose-600 rounded hover:bg-rose-200 transition-colors disabled:opacity-50"
                        title="Deduct Leave"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
