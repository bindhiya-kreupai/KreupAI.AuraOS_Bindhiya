'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Filter, FileText, Download, X, Inbox } from 'lucide-react';
import { AuditLogService, type AuditLogFilters } from '../services';
import { ToastContainer } from '../components/Toast';
import type { Toast as ToastType } from '../types';

interface AuditRow {
  id?: string;
  logId?: string;
  timestamp?: string;
  createdAt?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action?: string;
  module?: string;
  resource?: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
  metadata?: unknown;
  severity?: string;
  success?: boolean;
}

const PAGE_SIZE = 20;

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<AuditRow | null>(null);
  const [toasts, setToasts] = useState<ToastType[]>([]);

  // Filter state (controlled)
  const [dateRange, setDateRange] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userQuery, setUserQuery] = useState('');

  const pushToast = useCallback((type: ToastType['type'], message: string) => {
    setToasts((prev) => [...prev, { id: crypto.randomUUID(), type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const computeDateFrom = (range: string): string | undefined => {
    if (range === 'all') return undefined;
    const now = Date.now();
    const map: Record<string, number> = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    if (!map[range]) return undefined;
    return new Date(now - map[range]).toISOString();
  };

  const buildFilters = useCallback(
    (targetPage: number): AuditLogFilters => ({
      action: actionFilter || undefined,
      module: moduleFilter || undefined,
      q: userQuery.trim() || undefined,
      from: computeDateFrom(dateRange),
      page: targetPage,
      limit: PAGE_SIZE,
    }),
    [actionFilter, moduleFilter, userQuery, dateRange]
  );

  const fetchData = useCallback(
    async (targetPage: number, append: boolean) => {
      try {
        setLoading(true);
        const result = await AuditLogService.getAll(buildFilters(targetPage));
        setTotal(result.total);
        setPage(result.page);
        setLogs((prev) => (append ? [...prev, ...result.logs] : result.logs));
      } catch (error: any) {
        pushToast('error', 'Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    },
    [buildFilters, pushToast]
  );

  useEffect(() => {
    void fetchData(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    void fetchData(1, false);
  };

  const loadMore = () => {
    void fetchData(page + 1, true);
  };

  const hasMore = logs.length < total;

  const exportCsv = () => {
    if (logs.length === 0) {
      pushToast('warning', 'No logs to export');
      return;
    }
    try {
      const headers = [
        'Timestamp',
        'User',
        'Action',
        'Module',
        'Resource',
        'IP Address',
        'Details',
      ];
      const escape = (v: unknown) => {
        const s = v == null ? '' : String(v);
        return `"${s.replace(/"/g, '""')}"`;
      };
      const rows = logs.map((l) =>
        [
          l.timestamp ?? l.createdAt ?? '',
          l.userEmail ?? l.userName ?? l.userId ?? '',
          l.action ?? '',
          l.module ?? '',
          l.resourceType ?? l.resource ?? '',
          l.ipAddress ?? '',
          l.details ?? '',
        ]
          .map(escape)
          .join(',')
      );
      const csv = [headers.map(escape).join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      pushToast('success', `Exported ${logs.length} logs`);
    } catch (error: any) {
      pushToast('error', 'Export failed');
    }
  };

  const formatTime = (log: AuditRow) => {
    const raw = log.timestamp ?? log.createdAt;
    if (!raw) return { time: '—', date: '' };
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return { time: String(raw), date: '' };
    return {
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: d.toLocaleDateString(),
    };
  };

  const actionBadge = (action?: string) => {
    const a = (action ?? '').toUpperCase();
    if (a === 'DELETE') return 'bg-rose-100 text-rose-600';
    if (a === 'CREATE') return 'bg-emerald-100 text-emerald-600';
    if (a === 'UPDATE') return 'bg-indigo-100 text-indigo-600';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-500" />
            System Audit Logs
          </h1>
          <p className="text-slate-500 text-sm">
            Track all data changes, deletions, and access events across the platform.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-full min-h-0">
        {/* Filters */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" /> Filters
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-xs font-bold"
                >
                  <option value="all">All Time</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Module</label>
                <input
                  type="text"
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  placeholder="e.g. Payroll"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Action Type</label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-xs font-bold"
                >
                  <option value="">All Actions</option>
                  <option value="CREATE">Create</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                  <option value="LOGIN">Login</option>
                  <option value="LOGOUT">Logout</option>
                  <option value="EXPORT">Export</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">User</label>
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Search user email..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-xs font-bold"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={applyFilters}
              className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="lg:col-span-3 overflow-y-auto pb-20">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {logs.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Inbox className="w-10 h-10 text-slate-300 mb-3" />
                <p className="font-bold text-slate-500">No audit logs found</p>
                <p className="text-xs text-slate-400 mt-1">
                  Try adjusting the filters or check back later.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="py-3 pl-6">Timestamp</th>
                    <th className="py-3">User</th>
                    <th className="py-3">Action</th>
                    <th className="py-3">Resource</th>
                    <th className="py-3 text-right pr-6">Details</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {logs.map((log, i) => {
                    const { time, date } = formatTime(log);
                    return (
                      <tr
                        key={log.id ?? log.logId ?? i}
                        onClick={() => setSelected(log)}
                        className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                      >
                        <td className="py-4 pl-6">
                          <div className="font-bold text-slate-700 dark:text-slate-300">{time}</div>
                          <div className="text-[10px] text-slate-400">{date}</div>
                        </td>
                        <td className="py-4 text-slate-600 dark:text-slate-400 font-bold">
                          {log.userEmail ?? log.userName ?? log.userId ?? '—'}
                        </td>
                        <td className="py-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded ${actionBadge(log.action)}`}
                          >
                            {log.action ?? '—'}
                          </span>
                        </td>
                        <td className="py-4 text-slate-600 dark:text-slate-400 font-bold">
                          {log.resourceType ?? log.resource ?? log.module ?? '—'}
                        </td>
                        <td className="py-4 text-right pr-6">
                          <span
                            className="text-xs text-indigo-500 font-bold max-w-[200px] truncate block ml-auto"
                            title={log.details ?? ''}
                          >
                            {log.details ?? 'View'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {hasMore && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loading}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50"
                >
                  {loading ? 'Loading…' : 'Load More Logs'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[9998] bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" /> Log Detail
              </h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <DetailRow
                label="Timestamp"
                value={formatTime(selected).time + ' ' + formatTime(selected).date}
              />
              <DetailRow
                label="User"
                value={selected.userEmail ?? selected.userName ?? selected.userId}
              />
              <DetailRow label="Action" value={selected.action} />
              <DetailRow label="Module" value={selected.module} />
              <DetailRow
                label="Resource"
                value={[selected.resourceType ?? selected.resource, selected.resourceId]
                  .filter(Boolean)
                  .join(' / ')}
              />
              <DetailRow label="IP Address" value={selected.ipAddress} />
              <DetailRow label="Severity" value={selected.severity} />
              <DetailRow label="Details" value={selected.details} />
              {selected.metadata != null && (
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Metadata</div>
                  <pre className="text-xs bg-slate-50 dark:bg-slate-800 rounded-lg p-3 overflow-x-auto">
                    {JSON.stringify(selected.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-xs font-bold text-slate-400 uppercase">{label}</span>
      <span className="text-slate-700 dark:text-slate-300 text-right break-all">
        {value || '—'}
      </span>
    </div>
  );
}
