'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Eye,
  Sliders,
  Check,
  X,
  ShieldAlert,
  Loader2,
  Trash2,
  Lock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface Variance {
  id: string;
  employeeId: string | null;
  period: string;
  type: string;
  expected: string | null;
  actual: string | null;
  difference: string | null;
  severity: string;
  status: string;
}

const sevColor: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700 border-slate-200/50 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700/50',
  MEDIUM:
    'bg-yellow-50 text-yellow-800 border-yellow-200/50 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900/30',
  HIGH: 'bg-orange-50 text-orange-850 border-orange-200/50 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/30',
  CRITICAL:
    'bg-rose-50 text-rose-800 border-rose-200/50 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30',
};

export default function ReconciliationPage() {
  const [variances, setVariances] = useState<Variance[]>([]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [tolerance, setTolerance] = useState(0.01);
  const [inputTolerance, setInputTolerance] = useState('0.01');
  const [isSavingTolerance, setIsSavingTolerance] = useState(false);

  async function load() {
    setIsLoading(true);
    try {
      const r = await fetch('/api/v1/gosi-compliance/reconciliation');
      const p = await r.json();
      if (p.success) {
        setVariances(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
        if (p.data?.tolerance != null) {
          setTolerance(p.data.tolerance);
          setInputTolerance(p.data.tolerance.toString());
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function resolve(id: string) {
    const r = await fetch('/api/v1/gosi-compliance/reconciliation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resolve', varianceId: id, notes: 'Manually resolved' }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Variance resolved successfully' : p.error?.message);
    load();
  }

  async function updateTolerance() {
    setIsSavingTolerance(true);
    setMessage('');
    try {
      const r = await fetch('/api/v1/gosi-compliance/reconciliation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-tolerance', tolerance: parseFloat(inputTolerance) }),
      });
      const p = await r.json();
      if (p.success) {
        setMessage('Tolerance updated successfully');
        load();
      } else {
        setMessage(p.error?.message ?? 'Failed to update tolerance');
      }
    } catch (err: any) {
      setMessage(err?.message ?? 'Failed to update tolerance');
    } finally {
      setIsSavingTolerance(false);
    }
  }

  const filteredVariances = variances.filter((v) => {
    return (
      searchQuery.trim() === '' ||
      v.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.period.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-8 text-slate-900 dark:text-slate-50 transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header Block */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              EPIC-13 · GOSI COMPLIANCE
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
              GOSI ↔ Payroll Reconciliation
            </h1>
          </div>
        </header>

        {/* Settings Panel */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-indigo-500" /> Reconciliation Settings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set the maximum allowed difference (SAR) between GOSI and payroll deductions before
              raising a variance.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Tolerance (SAR):
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={inputTolerance}
                onChange={(e) => setInputTolerance(e.target.value)}
                disabled={isSavingTolerance || isLoading}
                className="w-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={updateTolerance}
              disabled={
                isSavingTolerance ||
                isLoading ||
                parseFloat(inputTolerance) === tolerance ||
                isNaN(parseFloat(inputTolerance))
              }
              className="rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              {isSavingTolerance && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save
            </button>
          </div>
        </section>

        {message ? (
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/50 text-sm text-indigo-750 dark:text-indigo-300 flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            {message}
          </div>
        ) : null}

        {/* Search and Filters Row */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Employee ID, Period or Variance Type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>
        </section>

        {/* Results Metadata */}
        <div className="flex items-center justify-between mt-3 mb-1">
          <h2 className="text-xs font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-widest">
            Results ({filteredVariances.length} items)
          </h2>
          <button className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 transition-all shadow-sm">
            Columns
          </button>
        </div>

        {/* Table Panel */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Employee ID</th>
                <th className="px-4 py-3.5">Period</th>
                <th className="px-4 py-3.5">Variance Type</th>
                <th className="px-4 py-3.5">Expected</th>
                <th className="px-4 py-3.5">Actual</th>
                <th className="px-4 py-3.5 font-bold">Difference</th>
                <th className="px-4 py-3.5">Severity</th>
                <th className="px-4 py-3.5">State</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={`skel-${i}`} className="animate-pulse">
                      <td colSpan={9} className="px-4 py-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                : filteredVariances.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {v.employeeId ?? '—'}
                      </td>
                      <td className="px-4 py-4 text-slate-650 dark:text-slate-400">{v.period}</td>
                      <td className="px-4 py-4 text-slate-650 dark:text-slate-400 font-semibold">
                        {v.type}
                      </td>
                      <td className="px-4 py-4 text-slate-650 dark:text-slate-400">
                        {v.expected ?? '—'}
                      </td>
                      <td className="px-4 py-4 text-slate-650 dark:text-slate-400">
                        {v.actual ?? '—'}
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">
                        {v.difference ?? '—'}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${sevColor[v.severity] ?? ''}`}
                        >
                          {v.severity}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                            v.status === 'RESOLVED'
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-450 border-emerald-200/20'
                              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-450 border-amber-200/20'
                          }`}
                        >
                          {v.status === 'RESOLVED' ? 'Resolved ✓' : 'Open'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {v.status === 'OPEN' ? (
                          <button
                            type="button"
                            onClick={() => resolve(v.id)}
                            className="rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            Resolve
                          </button>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-550 text-xs italic">
                            Resolved
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              {!isLoading && filteredVariances.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-slate-400 dark:text-slate-500 font-medium"
                  >
                    No reconciliation variances found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
