'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ClipboardList, RefreshCw } from 'lucide-react';

interface Finding {
  id: string;
  findingNumber: string;
  period: string;
  country: string | null;
  category: string;
  controlCode: string | null;
  title: string;
  severity: string;
  status: string;
  createdAt: string;
  dueAt: string | null;
  remediation: string | null;
}

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['OPEN', 'REMEDIATED'];

const severityClass = (s: string) =>
  s === 'CRITICAL'
    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
    : s === 'HIGH'
      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      : s === 'MEDIUM'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

export default function AuditFindingsRegisterPage() {
  const [rows, setRows] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('');
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (period) params.set('period', period);
      if (status) params.set('status', status);
      if (severity) params.set('severity', severity);
      const r = await fetch(`/api/v1/payroll-compliance/audit-finding?${params.toString()}`);
      const p = await r.json();
      if (p.success) {
        setRows((p.data?.items ?? p.data ?? []) as Finding[]);
      } else {
        setError(p.error?.message ?? 'Failed to load findings register');
      }
    } catch {
      setError('Failed to connect to audit findings service');
    } finally {
      setLoading(false);
    }
  }, [period, status, severity]);

  useEffect(() => {
    load();
  }, [load]);

  const openCount = rows.filter((r) => r.status === 'OPEN').length;
  const criticalOpen = rows.filter((r) => r.status === 'OPEN' && r.severity === 'CRITICAL').length;

  return (
    <div className="space-y-6 pb-6">
      <div>
        <Link
          href="/dashboard/payroll-compliance"
          className="mb-2 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Compliance
        </Link>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
          <ClipboardList className="h-7 w-7 text-indigo-500" />
          Audit Findings Register
          <span className="text-sm font-normal text-slate-500">|</span>
          <span className="text-lg font-semibold text-slate-600 dark:text-slate-400" dir="rtl">
            سجل نتائج التدقيق
          </span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Consolidated register of payroll audit findings across periods
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{rows.length}</div>
          <div className="text-sm text-slate-500">Total in view</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-2xl font-bold text-amber-600">{openCount}</div>
          <div className="text-sm text-slate-500">Open</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-2xl font-bold text-rose-600">{criticalOpen}</div>
          <div className="text-sm text-slate-500">Critical open</div>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <label className="mb-1 block text-xs text-slate-500">Period (YYYY-MM)</label>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="2026-07"
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Severity</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="">All</option>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm text-white dark:bg-slate-700"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
        <Link
          href="/dashboard/payroll-compliance/audit-finding"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600"
        >
          Raise / Remediate
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700">
            <tr>
              <th className="px-3 py-2">Finding #</th>
              <th className="px-3 py-2">Period</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Country</th>
              <th className="px-3 py-2">Severity</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Due</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="px-3 py-2 font-mono text-xs">{r.findingNumber}</td>
                <td className="px-3 py-2">{r.period}</td>
                <td className="px-3 py-2">{r.title}</td>
                <td className="px-3 py-2 text-xs">{r.category}</td>
                <td className="px-3 py-2">{r.country ?? '—'}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${severityClass(r.severity)}`}>
                    {r.severity}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs">{r.status}</td>
                <td className="px-3 py-2 text-xs">{r.dueAt?.slice(0, 10) ?? '—'}</td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                  No findings match the current filters.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
