'use client';

import { useEffect, useState } from 'react';

interface Risk {
  id: string;
  title: string;
  location: string | null;
  category: string;
  likelihood: number;
  severity: number;
  inherentRisk: number;
  residualRisk: number;
  status: string;
  reviewedAt: string | null;
  nextReviewAt: string | null;
}

function band(score: number) {
  if (score >= 20) return { label: 'CRITICAL', cls: 'bg-rose-200 text-rose-900' };
  if (score >= 12) return { label: 'HIGH', cls: 'bg-rose-100 text-rose-800' };
  if (score >= 6) return { label: 'MEDIUM', cls: 'bg-amber-100 text-amber-800' };
  return { label: 'LOW', cls: 'bg-slate-100 text-slate-700' };
}

export default function RisksPage() {
  const [rows, setRows] = useState<Risk[]>([]);
  const [filter, setFilter] = useState('OPEN');
  const [form, setForm] = useState({
    title: '',
    category: 'PHYSICAL',
    location: '',
    likelihood: '3',
    severity: '3',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/hse-compliance/risk-assessments', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function save() {
    setMessage('');
    const r = await fetch('/api/v1/hse-compliance/risk-assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        ...form,
        likelihood: Number(form.likelihood),
        severity: Number(form.severity),
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function call(action: string, id: string) {
    const r = await fetch('/api/v1/hse-compliance/risk-assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id }),
    });
    const p = await r.json();
    setMessage(p.success ? action : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-24 · S03 / S04</p>
            <h1 className="text-2xl font-semibold">Risk Assessments</h1>
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
            Category
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {[
                'PHYSICAL',
                'CHEMICAL',
                'BIOLOGICAL',
                'ERGONOMIC',
                'PSYCHOSOCIAL',
                'FIRE',
                'ELECTRICAL',
                'WORKING_AT_HEIGHT',
                'CONFINED_SPACE',
                'HEAT_STRESS',
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Location
            <input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
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
            Severity 1-5
            <input
              value={form.severity}
              onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={save}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white md:col-span-6"
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
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">L×S</th>
                <th className="px-3 py-2">Inherent</th>
                <th className="px-3 py-2">Residual</th>
                <th className="px-3 py-2">Band</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const b = band(r.residualRisk);
                return (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">{r.title}</td>
                    <td className="px-3 py-2 text-xs">{r.category}</td>
                    <td className="px-3 py-2 text-xs">{r.location ?? '—'}</td>
                    <td className="px-3 py-2">
                      {r.likelihood}×{r.severity}
                    </td>
                    <td className="px-3 py-2">{r.inherentRisk}</td>
                    <td className="px-3 py-2 font-semibold">{r.residualRisk}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${b.cls}`}>
                        {b.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">{r.status}</td>
                    <td className="px-3 py-2">
                      {r.status === 'OPEN' && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => call('review', r.id)}
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                          >
                            Review
                          </button>
                          <button
                            type="button"
                            onClick={() => call('close', r.id)}
                            className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                          >
                            Close
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No risk assessments.
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
