'use client';

import { useEffect, useState } from 'react';

interface Item {
  id: string;
  title: string;
  domain: string;
  category: string | null;
  ownerId: string | null;
  dueAt: string;
  frequency: string;
  lastCompletedAt: string | null;
  status: string;
}

export default function ReviewCalendarPage() {
  const [rows, setRows] = useState<Item[]>([]);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [form, setForm] = useState({
    title: '',
    domain: '',
    category: '',
    dueAt: new Date().toISOString().slice(0, 10),
    frequency: 'MONTHLY',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/executive-compliance/review-calendar', window.location.origin);
    if (overdueOnly) url.searchParams.set('overdueOnly', 'true');
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) {
      setRows(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
    }
  }
  useEffect(() => {
    load();
  }, [overdueOnly]);

  async function save() {
    setMessage('');
    const r = await fetch('/api/v1/executive-compliance/review-calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        ...form,
        category: form.category || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }
  async function complete(id: string) {
    const r = await fetch('/api/v1/executive-compliance/review-calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete', id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Rolled forward' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500 dark:text-slate-400 font-semibold">EPIC-31 · S13</p>
            <h1 className="text-2xl font-semibold dark:text-white">Compliance Review Calendar</h1>
          </div>
          <label className="flex items-center gap-2 text-sm dark:text-slate-300">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-slate-400"
            />
            Overdue only
          </label>
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
            Due
            <input
              type="date"
              value={form.dueAt}
              onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 dark:text-white"
            />
          </label>
          <label className="text-sm dark:text-slate-300">
            Frequency
            <select
              value={form.frequency}
              onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 dark:text-white"
            >
              {['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'].map((s) => (
                <option key={s} className="dark:bg-slate-900">{s}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={save}
            className="self-end rounded-md bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 px-3 py-2 text-sm text-white dark:text-slate-900 font-semibold transition-colors"
          >
            Save
          </button>
        </section>
        {message ? <p className="text-sm text-slate-650 dark:text-slate-400">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Domain</th>
                <th className="px-3 py-2">Due</th>
                <th className="px-3 py-2">Frequency</th>
                <th className="px-3 py-2">Last Completed</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => {
                const overdue = new Date(i.dueAt) < new Date();
                return (
                  <tr key={i.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                    <td className="px-3 py-2 dark:text-slate-300">{i.title}</td>
                    <td className="px-3 py-2 font-mono text-xs dark:text-slate-300">{i.domain}</td>
                    <td
                      className={`px-3 py-2 text-xs ${overdue ? 'font-semibold text-rose-700 dark:text-rose-400' : 'dark:text-slate-350'}`}
                    >
                      {i.dueAt?.slice(0, 10)}
                    </td>
                    <td className="px-3 py-2 text-xs dark:text-slate-350">{i.frequency}</td>
                    <td className="px-3 py-2 text-xs dark:text-slate-350">{i.lastCompletedAt?.slice(0, 10) ?? '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${i.status === 'RESOLVED' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-450' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-450'}`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => complete(i.id)}
                        className="rounded bg-emerald-700 hover:bg-emerald-600 px-2 py-1 text-xs text-white font-semibold transition-colors"
                      >
                        Complete &amp; roll forward
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
                    No items.
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
