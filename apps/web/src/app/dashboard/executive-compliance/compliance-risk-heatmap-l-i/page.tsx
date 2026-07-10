'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/stores/theme-store';
import { Plus, XCircle, AlertTriangle, ListFilter, Grid3X3 } from 'lucide-react';

interface R {
  id: string;
  title: string;
  domain: string;
  country: string | null;
  likelihood: number;
  impact: number;
  score: number;
  band: string;
  ownerId: string | null;
  mitigationNotes: string | null;
  nextReviewAt: string | null;
  status: string;
}

const bandColor: Record<string, string> = {
  LOW: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  MEDIUM: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400',
  HIGH: 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400',
  CRITICAL: 'bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-300',
};

function cellColor(score: number): string {
  if (score >= 15) return 'bg-rose-200 dark:bg-rose-900/50 text-rose-900 dark:text-rose-200';
  if (score >= 8) return 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300';
  if (score >= 4) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300';
  return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300';
}

export default function ComplianceRiskHeatmapPage() {
  const { isDark } = useTheme();
  const [rows, setRows] = useState<R[]>([]);
  const [filter, setFilter] = useState('OPEN');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    domain: 'WPS',
    country: '',
    likelihood: '3',
    impact: '3',
    mitigationNotes: '',
  });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL('/api/v1/executive-compliance/risk-heatmap', window.location.origin);
      if (filter) url.searchParams.set('status', filter);
      const r = await fetch(url.toString());
      const p = await r.json();
      if (p.success) {
        setRows(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
      }
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  // Build a 5×5 L×I grid counting risks per cell.
  const grid = useMemo(() => {
    const g: number[][] = Array.from({ length: 5 }, () => Array<number>(5).fill(0));
    for (const r of rows) {
      const l = Math.min(5, Math.max(1, r.likelihood));
      const i = Math.min(5, Math.max(1, r.impact));
      g[5 - l][i - 1] += 1;
    }
    return g;
  }, [rows]);

  async function post(body: Record<string, unknown>, okMsg: string) {
    setBusy(true);
    setMessage('');
    try {
      const r = await fetch('/api/v1/executive-compliance/risk-heatmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const p = await r.json();
      setMessage(p.success ? okMsg : (p.error?.details?.error ?? p.error?.message ?? 'Failed'));
      if (p.success) await load();
    } finally {
      setBusy(false);
    }
  }

  function save() {
    if (!form.title) {
      setMessage('Title is required.');
      return;
    }

    // Optimistic UI update
    const likelihood = Number(form.likelihood);
    const impact = Number(form.impact);
    const score = likelihood * impact;

    let band = 'LOW';
    if (score >= 15) band = 'CRITICAL';
    else if (score >= 8) band = 'HIGH';
    else if (score >= 4) band = 'MEDIUM';

    const newRow: R = {
      id: `temp-${Date.now()}`,
      title: form.title,
      domain: form.domain,
      country: form.country || null,
      likelihood,
      impact,
      score,
      band,
      ownerId: null,
      mitigationNotes: form.mitigationNotes || null,
      nextReviewAt: null,
      status: 'OPEN',
    };
    if (filter === 'OPEN' || filter === '') {
      setRows((prev) => [newRow, ...prev]);
    }

    void post(
      {
        action: 'upsert',
        ...form,
        likelihood: Number(form.likelihood),
        impact: Number(form.impact),
        country: form.country || undefined,
      },
      'Saved'
    );
  }

  function close(id: string) {
    // Optimistic UI update
    setRows((rows) => rows.map((r) => (r.id === id ? { ...r, status: 'CLOSED' } : r)));

    void post({ action: 'close', id }, 'Closed');
  }

  return (
    <main
      className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50 transition-colors duration-200"
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              EPIC-31 · S10
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
              Compliance Risk Heatmap (L × I)
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ListFilter className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-white shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="" className="dark:bg-slate-900">
                All
              </option>
              <option value="OPEN" className="dark:bg-slate-900">
                OPEN
              </option>
              <option value="CLOSED" className="dark:bg-slate-900">
                CLOSED
              </option>
            </select>
          </div>
        </header>

        {/* Heatmap Matrix */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Grid3X3 className="h-3.5 w-3.5" />
            </div>
            Likelihood × Impact Matrix
          </h2>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 dark:border-slate-600 border-t-slate-900 dark:border-t-white" />
            </div>
          ) : (
            <div className="flex gap-3">
              <div className="flex items-center">
                <span className="-rotate-90 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Likelihood →
                </span>
              </div>
              <div>
                <table className="border-collapse">
                  <tbody>
                    {grid.map((r, ri) => (
                      <tr key={ri}>
                        <td className="pr-2 text-right text-xs font-bold text-slate-500 dark:text-slate-400">
                          {5 - ri}
                        </td>
                        {r.map((count, ci) => {
                          const score = (5 - ri) * (ci + 1);
                          return (
                            <td
                              key={ci}
                              className={`h-12 w-12 border border-white dark:border-slate-800 text-center text-sm font-bold rounded-sm ${cellColor(score)}`}
                              title={`L${5 - ri} × I${ci + 1} = ${score}`}
                            >
                              {count || ''}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    <tr>
                      <td />
                      {[1, 2, 3, 4, 5].map((i) => (
                        <td
                          key={i}
                          className="text-center text-xs font-bold text-slate-500 dark:text-slate-400"
                        >
                          {i}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
                <p className="mt-1 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Impact →
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Add Risk Form */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Plus className="h-3.5 w-3.5" />
            </div>
            Add New Risk
          </h2>
          <div className="grid gap-3 md:grid-cols-6">
            <label className="text-xs font-semibold md:col-span-2 text-slate-600 dark:text-slate-400">
              Title
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Domain
              <input
                value={form.domain}
                onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Country
              <input
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Likelihood 1-5
              <input
                value={form.likelihood}
                onChange={(e) => setForm((f) => ({ ...f, likelihood: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Impact 1-5
              <input
                value={form.impact}
                onChange={(e) => setForm((f) => ({ ...f, impact: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 px-5 py-2.5 text-sm text-white dark:text-slate-900 font-bold shadow-sm disabled:opacity-50 transition-all"
          >
            <Plus className="h-4 w-4" />
            Save Risk
          </button>
        </section>

        {message ? (
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {message}
          </div>
        ) : null}

        {/* Risk Table */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Risk Register</h2>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-400">
              {rows.length} risks
            </span>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="h-4 flex-1 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                  <tr>
                    <th className="px-5 py-3">Title</th>
                    <th className="px-5 py-3">Domain</th>
                    <th className="px-5 py-3">Country</th>
                    <th className="px-5 py-3">L × I</th>
                    <th className="px-5 py-3">Score</th>
                    <th className="px-5 py-3">Band</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {r.title}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                        {r.domain}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">
                        {r.country ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                        {r.likelihood}×{r.impact}
                      </td>
                      <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">
                        {r.score}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${bandColor[r.band] ?? ''}`}
                        >
                          {r.band}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${r.status === 'CLOSED' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {r.status === 'OPEN' && (
                          <button
                            type="button"
                            onClick={() => close(r.id)}
                            disabled={busy}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1.5 text-xs text-white font-bold disabled:opacity-50 transition-colors shadow-sm"
                          >
                            <XCircle className="h-3 w-3" />
                            Close
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-10 text-center text-slate-400 dark:text-slate-500"
                      >
                        No risks found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
