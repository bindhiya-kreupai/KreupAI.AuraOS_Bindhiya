'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { FileText, Eye, Download, Printer, Search, Filter } from 'lucide-react';
import { APIClient } from '@/lib/api-client';

interface DocAccessLog {
  id: string;
  documentName: string;
  action: string;
  userName?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

const ACTION_FILTERS: { label: string; value: string | null }[] = [
  { label: 'All Actions', value: null },
  { label: 'Viewed', value: 'viewed' },
  { label: 'Downloaded', value: 'downloaded' },
  { label: 'Printed', value: 'printed' },
];

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function actionLabel(action: string): string {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

export default function DocumentAccessLogsPage() {
  const [logs, setLogs] = useState<DocAccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (activeAction) params.action = activeAction;
      if (search.trim()) params.q = search.trim();
      const res = await APIClient.get('/api/security/document-access-logs', params);
      setLogs(APIClient.unwrapList<DocAccessLog>(res));
    } catch (e: any) {
      setError(e?.message || 'Failed to load document access logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [activeAction, search]);

  // Debounced fetch on search / filter change.
  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" />
            Document Access Logs
          </h1>
          <p className="text-slate-500 text-sm">
            Track who is viewing, downloading, and printing confidential company documents.
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search filename or user..."
            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 min-h-0 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto">
          {ACTION_FILTERS.map((f) => {
            const active = activeAction === f.value;
            return (
              <button
                key={f.label}
                onClick={() => setActiveAction(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-2 ${
                  active
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {f.value === null && <Filter className="w-3 h-3" />}
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="overflow-y-auto flex-1 p-0">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10 shadow-sm">
              <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                <th className="py-3 pl-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-tl-lg">
                  Document Name
                </th>
                <th className="py-3 bg-slate-50/50 dark:bg-slate-800/50">Accessed By</th>
                <th className="py-3 bg-slate-50/50 dark:bg-slate-800/50">Action</th>
                <th className="py-3 bg-slate-50/50 dark:bg-slate-800/50">Timestamp</th>
                <th className="py-3 pr-6 text-right bg-slate-50/50 dark:bg-slate-800/50 rounded-tr-lg">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 text-sm">
                    Loading document access logs...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-rose-500 text-sm">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 text-sm">
                    No document access logs found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {log.documentName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="font-bold text-slate-700 dark:text-slate-300">
                        {log.userName || 'Unknown'}
                      </div>
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          log.action === 'downloaded'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                            : log.action === 'printed'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}
                      >
                        {log.action === 'downloaded' && <Download className="w-3 h-3" />}
                        {log.action === 'printed' && <Printer className="w-3 h-3" />}
                        {log.action === 'viewed' && <Eye className="w-3 h-3" />}
                        {actionLabel(log.action)}
                      </span>
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">
                      {formatWhen(log.createdAt)}
                    </td>
                    <td className="py-4 pr-6 text-right text-slate-400 text-xs font-mono">
                      {log.ipAddress || '-'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
