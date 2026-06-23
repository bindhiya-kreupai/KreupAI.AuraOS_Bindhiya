'use client';

import { useEffect, useState } from 'react';

interface Task {
  id: string;
  ruleCode: string | null;
  categoryCode: string;
  countryCode: string | null;
  subject: string;
  ownerRole: string;
  dueDate: string;
  status: string;
  escalatedToRole: string | null;
}

const statusColor: Record<string, string> = {
  OPEN: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  DEFERRED: 'bg-amber-100 text-amber-800',
  OVERDUE: 'bg-rose-100 text-rose-800',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState('OPEN');
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/compliance-calendar/tasks', window.location.origin);
    if (status) url.searchParams.set('status', status);
    if (category) url.searchParams.set('categoryCode', category);
    if (country) url.searchParams.set('countryCode', country);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setTasks(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [status, category, country]);

  async function complete(id: string) {
    const r = await fetch('/api/v1/compliance-calendar/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete', taskId: id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Completed' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-35 · S02</p>
          <h1 className="text-2xl font-semibold">Compliance Task Register</h1>
        </header>

        <section className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <label className="text-sm">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5"
            >
              <option value="">All</option>
              {['OPEN', 'IN_PROGRESS', 'COMPLETED', 'DEFERRED', 'OVERDUE'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Category
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value.toUpperCase())}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Country
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value.toUpperCase())}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          {message ? <span className="text-sm">{message}</span> : null}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Due</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Esc.</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{t.subject}</td>
                  <td className="px-3 py-2">{t.categoryCode}</td>
                  <td className="px-3 py-2">{t.countryCode ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{t.ownerRole}</td>
                  <td className="px-3 py-2 text-xs">{t.dueDate?.slice(0, 10)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[t.status] ?? ''}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">{t.escalatedToRole ?? '—'}</td>
                  <td className="px-3 py-2">
                    {t.status !== 'COMPLETED' ? (
                      <button
                        type="button"
                        onClick={() => complete(t.id)}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                      >
                        Complete
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No tasks.
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
