'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Grid3x3, RefreshCw } from 'lucide-react';
import { bandForScore } from '../_components/risk-bands';

interface Risk {
  id: string;
  riskCode: string;
  title: string;
  category: string;
  country: string | null;
  likelihood: number;
  impact: number;
  score: number;
  band: string;
  status: string;
  mitigation: string | null;
}

const cellClass = (score: number) =>
  score >= 20
    ? 'bg-rose-500 text-white'
    : score >= 12
      ? 'bg-orange-400 text-white'
      : score >= 6
        ? 'bg-amber-300 text-slate-900'
        : 'bg-emerald-200 text-slate-900';

const bandBadge = (band: string) =>
  band === 'CRITICAL'
    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
    : band === 'HIGH'
      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      : band === 'MEDIUM'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';

export default function PayrollRiskBandsPage() {
  const [rows, setRows] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/v1/payroll-compliance/risk-register?status=OPEN');
      const p = await r.json();
      if (p.success) {
        setRows((p.data?.items ?? p.data ?? []) as Risk[]);
      } else {
        setError(p.error?.message ?? 'Failed to load risk register');
      }
    } catch {
      setError('Failed to connect to risk register service');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Count of open risks per (likelihood, impact) cell.
  const matrix = useMemo(() => {
    const grid: Record<string, number> = {};
    for (const r of rows) {
      const key = `${r.likelihood}x${r.impact}`;
      grid[key] = (grid[key] ?? 0) + 1;
    }
    return grid;
  }, [rows]);

  const bandCounts = useMemo(() => {
    const c: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    for (const r of rows) c[r.band] = (c[r.band] ?? 0) + 1;
    return c;
  }, [rows]);

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
          <Grid3x3 className="h-7 w-7 text-indigo-500" />
          Payroll Risk Register — L×I Bands
          <span className="text-sm font-normal text-slate-500">|</span>
          <span className="text-lg font-semibold text-slate-600 dark:text-slate-400" dir="rtl">
            سجل مخاطر الرواتب
          </span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Open payroll risks positioned on a 5×5 likelihood × impact heat map
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((b) => (
          <div
            key={b}
            className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${bandBadge(b)}`}>
              {b}
            </span>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {bandCounts[b]}
            </div>
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm text-white dark:bg-slate-700"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
        <Link
          href="/dashboard/payroll-compliance/risk-register"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600"
        >
          Manage risks
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Heat map (open risks per cell)
        </h2>
        <table className="border-collapse text-center text-sm">
          <thead>
            <tr>
              <th className="p-2 text-xs text-slate-500">L ↓ / I →</th>
              {[1, 2, 3, 4, 5].map((i) => (
                <th key={i} className="p-2 text-xs text-slate-500">
                  {i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[5, 4, 3, 2, 1].map((l) => (
              <tr key={l}>
                <td className="p-2 text-xs font-medium text-slate-500">{l}</td>
                {[1, 2, 3, 4, 5].map((i) => {
                  const score = l * i;
                  const count = matrix[`${l}x${i}`] ?? 0;
                  return (
                    <td key={i} className="p-1">
                      <div
                        className={`flex h-12 w-14 flex-col items-center justify-center rounded ${cellClass(score)}`}
                        title={`Likelihood ${l} × Impact ${i} = ${score} (${bandForScore(score)})`}
                      >
                        <span className="text-xs opacity-80">{score}</span>
                        <span className="text-sm font-bold">{count > 0 ? count : ''}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700">
            <tr>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2 text-center">L</th>
              <th className="px-3 py-2 text-center">I</th>
              <th className="px-3 py-2 text-center">Score</th>
              <th className="px-3 py-2">Band</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="px-3 py-2 font-mono text-xs">{r.riskCode}</td>
                <td className="px-3 py-2">{r.title}</td>
                <td className="px-3 py-2 text-xs">{r.category}</td>
                <td className="px-3 py-2 text-center">{r.likelihood}</td>
                <td className="px-3 py-2 text-center">{r.impact}</td>
                <td className="px-3 py-2 text-center font-semibold">{r.score}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${bandBadge(r.band)}`}>
                    {r.band}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                  No open risks.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-slate-400">
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
