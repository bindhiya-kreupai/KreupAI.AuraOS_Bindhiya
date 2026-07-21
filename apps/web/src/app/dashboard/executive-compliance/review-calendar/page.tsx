'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/stores/theme-store';
import { Plus, RotateCcw, AlertTriangle, Calendar } from 'lucide-react';

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
  const { isDark } = useTheme();
  const [rows, setRows] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    try {
      const url = new URL('/api/v1/executive-compliance/review-calendar', window.location.origin);
      if (overdueOnly) url.searchParams.set('overdueOnly', 'true');
      const r = await fetch(url.toString());
      const p = await r.json();
      if (p.success) {
        setRows(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
      }
    } finally {
      setLoading(false);
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
    <main
      className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50 transition-colors duration-200"
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              EPIC-31 · S13
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
              Compliance Review Calendar
            </h1>
          </div>
          <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-slate-400 h-4 w-4"
            />
            Overdue only
          </label>
        </header>

        {/* Add Review Form */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Plus className="h-3.5 w-3.5" />
            </div>
            Schedule Review Item
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
              Due
              <input
                type="date"
                value={form.dueAt}
                onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Frequency
              <select
                value={form.frequency}
                onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                {['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'].map((s) => (
                  <option key={s} className="dark:bg-slate-900">
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={save}
              className="self-end flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 px-4 py-2.5 text-sm text-white dark:text-slate-900 font-bold shadow-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              Save
            </button>
          </div>
        </section>

        {message ? (
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {message}
          </div>
        ) : null}

        {/* Table */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              Review Calendar
            </h2>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-400">
              {rows.length} items
            </span>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="h-4 flex-1 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
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
                    <th className="px-5 py-3">Due</th>
                    <th className="px-5 py-3">Frequency</th>
                    <th className="px-5 py-3">Last Completed</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((i) => {
                    const overdue = new Date(i.dueAt) < new Date();
                    return (
                      <tr
                        key={i.id}
                        className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">
                          {i.title}
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                          {i.domain}
                        </td>
                        <td
                          className={`px-5 py-3 text-xs ${overdue ? 'font-bold text-rose-700 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                          {i.dueAt?.slice(0, 10)}
                        </td>
                        <td className="px-5 py-3">
                          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                            {i.frequency}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">
                          {i.lastCompletedAt?.slice(0, 10) ?? '—'}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${i.status === 'RESOLVED' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'}`}
                          >
                            {i.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <button
                            type="button"
                            onClick={() => complete(i.id)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1.5 text-xs text-white font-bold transition-colors shadow-sm"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Complete & roll
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-10 text-center text-slate-400 dark:text-slate-500"
                      >
                        No review items found.
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
