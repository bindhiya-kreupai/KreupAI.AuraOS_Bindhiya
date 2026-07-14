'use client';

import { useEffect, useState } from 'react';

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
  LOW: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350',
  MEDIUM: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-450',
  HIGH: 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-450',
  CRITICAL: 'bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-300',
};

export default function RiskHeatmapPage() {
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

  async function load() {
    const url = new URL('/api/v1/executive-compliance/risk-heatmap', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) {
      setRows(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
    }
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function save() {
    setMessage('');
    const r = await fetch('/api/v1/executive-compliance/risk-heatmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        ...form,
        likelihood: Number(form.likelihood),
        impact: Number(form.impact),
        country: form.country || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function close(id: string) {
    const r = await fetch('/api/v1/executive-compliance/risk-heatmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'close', id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Closed' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500 dark:text-slate-400 font-semibold">EPIC-31 · S10</p>
            <h1 className="text-2xl font-semibold dark:text-white">Compliance Risk Heatmap</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="" className="dark:bg-slate-900">All</option>
            <option value="OPEN" className="dark:bg-slate-900">OPEN</option>
            <option value="CLOSED" className="dark:bg-slate-900">CLOSED</option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:grid-cols-6">
          <label className="text-sm md:col-span-2 dark:text-slate-300">
            Title
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 dark:text-white"
            />
          </label>
          <label className="text-sm dark:text-slate-300">
            Domain
            <input
              value={form.domain}
              onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 font-mono text-xs dark:text-white"
            />
          </label>
          <label className="text-sm dark:text-slate-300">
            Country
            <input
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 dark:text-white"
            />
          </label>
          <label className="text-sm dark:text-slate-300">
            Likelihood 1-5
            <input
              value={form.likelihood}
              onChange={(e) => setForm((f) => ({ ...f, likelihood: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 dark:text-white"
            />
          </label>
          <label className="text-sm dark:text-slate-300">
            Impact 1-5
            <input
              value={form.impact}
              onChange={(e) => setForm((f) => ({ ...f, impact: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 dark:text-white"
            />
          </label>
          <button
            type="button"
            onClick={save}
            className="rounded-md bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 px-3 py-2 text-sm text-white dark:text-slate-900 font-semibold md:col-span-6 transition-colors"
          >
            Save Risk
          </button>
        </section>
        {message ? <p className="text-sm text-slate-650 dark:text-slate-400">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
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
                <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                  <td className="px-3 py-2 dark:text-slate-300">{r.title}</td>
                  <td className="px-3 py-2 font-mono text-xs dark:text-slate-300">{r.domain}</td>
                  <td className="px-3 py-2 text-xs dark:text-slate-350">{r.country ?? '—'}</td>
                  <td className="px-3 py-2 dark:text-slate-300">
                    {r.likelihood}×{r.impact}
                  </td>
                  <td className="px-3 py-2 font-semibold dark:text-white">{r.score}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${bandColor[r.band] ?? ''}`}
                    >
                      {r.band}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${r.status === 'CLOSED' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-450' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-450'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {r.status === 'OPEN' && (
                      <button
                        type="button"
                        onClick={() => close(r.id)}
                        className="rounded bg-emerald-700 hover:bg-emerald-600 px-2 py-1 text-xs text-white font-semibold transition-colors"
                      >
                        Close
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
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
