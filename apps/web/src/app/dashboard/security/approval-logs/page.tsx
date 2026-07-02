'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { FileCheck, Check, X } from 'lucide-react';
import { APIClient } from '@/lib/api-client';

interface ApprovalLog {
  id: string;
  action: string;
  module: string;
  userEmail?: string | null;
  userId?: string | null;
  details?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  timestamp: string;
}

interface ApprovalSummary {
  totalApprovals: number;
  totalRejections: number;
  totalDecisions: number;
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function isApproved(action: string): boolean {
  return action.startsWith('APPROVE_');
}

function requestType(action: string): string {
  return action
    .replace(/^APPROVE_/, '')
    .replace(/^REJECT_/, '')
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

export default function ApprovalLogsPage() {
  const [logs, setLogs] = useState<ApprovalLog[]>([]);
  const [summary, setSummary] = useState<ApprovalSummary>({
    totalApprovals: 0,
    totalRejections: 0,
    totalDecisions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await APIClient.get('/api/security/approval-logs');
      setLogs(APIClient.unwrapList<ApprovalLog>(res));
      const s = res?.meta?.summary;
      if (s) {
        setSummary({
          totalApprovals: s.totalApprovals ?? 0,
          totalRejections: s.totalRejections ?? 0,
          totalDecisions: s.totalDecisions ?? 0,
        });
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load approval logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-indigo-500" />
            Approval Logs
          </h1>
          <p className="text-slate-500 text-sm">
            Centralized audit trail of all approval decisions across modules.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-emerald-600 font-bold">{summary.totalApprovals} Approved</span>
          <span className="text-rose-600 font-bold">{summary.totalRejections} Rejected</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 min-h-0 flex flex-col">
        <div className="overflow-y-auto flex-1 p-0">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10 shadow-sm shadow-slate-200/50 dark:shadow-slate-900/50">
              <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                <th className="py-3 pl-6 bg-slate-50/50 dark:bg-slate-800/50">Request Type</th>
                <th className="py-3 bg-slate-50/50 dark:bg-slate-800/50">Module</th>
                <th className="py-3 bg-slate-50/50 dark:bg-slate-800/50">Action</th>
                <th className="py-3 bg-slate-50/50 dark:bg-slate-800/50">Approver</th>
                <th className="py-3 bg-slate-50/50 dark:bg-slate-800/50">Timestamp</th>
                <th className="py-3 pr-6 bg-slate-50/50 dark:bg-slate-800/50 text-right">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-sm">
                    Loading approval logs...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-rose-500 text-sm">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-sm">
                    No approval decisions recorded yet.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                logs.map((log) => {
                  const approved = isApproved(log.action);
                  const approver = log.userEmail || log.userId || 'Unknown';
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-4 pl-6">
                        <div className="font-bold text-slate-700 dark:text-slate-200">
                          {requestType(log.action)}
                        </div>
                        {log.entityId && (
                          <div className="text-xs text-slate-400 font-mono">{log.entityId}</div>
                        )}
                      </td>
                      <td className="py-4 font-medium text-slate-600 dark:text-slate-400">
                        {log.module || '-'}
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            approved
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          }`}
                        >
                          {approved ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {approved ? 'Approved' : 'Rejected'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                            {approver.charAt(0).toUpperCase()}
                          </div>
                          {approver}
                        </div>
                      </td>
                      <td className="py-4 text-xs text-slate-500 font-mono">
                        {formatWhen(log.timestamp)}
                      </td>
                      <td className="py-4 pr-6 text-right max-w-[200px]">
                        <span
                          className="text-xs text-slate-500 italic truncate block"
                          title={log.details || ''}
                        >
                          {log.details ? `"${log.details}"` : '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
