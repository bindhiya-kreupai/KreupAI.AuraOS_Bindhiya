'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

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
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-rose-100 text-rose-800',
  CRITICAL: 'bg-rose-200 text-rose-900',
};

function cellColor(score: number): string {
  if (score >= 15) return 'bg-rose-200';
  if (score >= 8) return 'bg-rose-100';
  if (score >= 4) return 'bg-amber-100';
  return 'bg-emerald-100';
}

export default function ComplianceRiskHeatmapPage() {
  const [rows, setRows] = useState<R[]>([]);
  const [filter, setFilter] = useState('OPEN');
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
    const url = new URL('/api/v1/executive-compliance/risk-heatmap', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    // List API returns a paginated envelope { items, total, ... }.
    if (p.success) setRows(p.data?.items ?? []);
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
    void post({ action: 'close', id }, 'Closed');
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-31 · S10</p>
            <h1 className="text-2xl font-semibold">Compliance Risk Heatmap (L × I)</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Likelihood × Impact matrix</h2>
          <div className="mt-3 flex gap-3">
            <div className="flex items-center">
              <span className="-rotate-90 whitespace-nowrap text-xs font-semibold text-slate-500">
                Likelihood →
              </span>
            </div>
            <div>
              <table className="border-collapse">
                <tbody>
                  {grid.map((r, ri) => (
                    <tr key={ri}>
                      <td className="pr-2 text-right text-xs font-semibold text-slate-500">
                        {5 - ri}
                      </td>
                      {r.map((count, ci) => {
                        const score = (5 - ri) * (ci + 1);
                        return (
                          <td
                            key={ci}
                            className={`h-12 w-12 border border-white text-center text-sm font-semibold ${cellColor(score)}`}
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
                      <td key={i} className="text-center text-xs font-semibold text-slate-500">
                        {i}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
              <p className="mt-1 text-center text-xs font-semibold text-slate-500">Impact →</p>
            </div>
          </div>
        </section>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6">
          <label className="text-sm md:col-span-2">
            Title
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Domain
            <input
              value={form.domain}
              onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Country
            <input
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Likelihood 1-5
            <input
              value={form.likelihood}
              onChange={(e) => setForm((f) => ({ ...f, likelihood: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Impact 1-5
            <input
              value={form.impact}
              onChange={(e) => setForm((f) => ({ ...f, impact: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50 md:col-span-6"
          >
            Save Risk
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Domain</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">L × I</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Band</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{r.title}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.domain}</td>
                  <td className="px-3 py-2 text-xs">{r.country ?? '—'}</td>
                  <td className="px-3 py-2">
                    {r.likelihood}×{r.impact}
                  </td>
                  <td className="px-3 py-2 font-semibold">{r.score}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${bandColor[r.band] ?? ''}`}
                    >
                      {r.band}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">{r.status}</td>
                  <td className="px-3 py-2">
                    {r.status === 'OPEN' && (
                      <button
                        type="button"
                        onClick={() => close(r.id)}
                        disabled={busy}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white disabled:opacity-50"
                      >
                        Close
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No risks.
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
