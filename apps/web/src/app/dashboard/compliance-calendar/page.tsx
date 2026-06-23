'use client';

import { useEffect, useState } from 'react';

interface ByCategory {
  categoryCode: string;
  total: number;
  completed: number;
  overdue: number;
}
interface Dashboard {
  period: string;
  total: number;
  completed: number;
  deferred: number;
  overdue: number;
  criticalOverdue: number;
  onTimePct: number;
  byCategory: ByCategory[];
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function ComplianceCalendarHomePage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch(`/api/v1/compliance-calendar/dashboard?period=${period}`);
    const p = await r.json();
    if (p.success) setData(p.data);
  }
  useEffect(() => {
    load();
  }, [period]);

  async function seedAndGenerate() {
    setMessage('');
    await fetch('/api/v1/compliance-calendar/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-categories' }),
    });
    await fetch('/api/v1/compliance-calendar/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-rules' }),
    });
    const r = await fetch('/api/v1/compliance-calendar/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate', monthsAhead: 3 }),
    });
    const p = await r.json();
    setMessage(p.success ? `Generated ${p.data.created} tasks` : p.error?.message);
    load();
  }
  async function escalate() {
    const r = await fetch('/api/v1/compliance-calendar/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'escalate-overdue' }),
    });
    const p = await r.json();
    setMessage(p.success ? `Escalated ${p.data.escalated.length}` : p.error?.message);
    load();
  }

  const tools = [
    { href: '/dashboard/compliance-calendar/tasks', label: 'Task Register (S02)' },
    { href: '/dashboard/compliance-calendar/rules', label: 'Recurrence Rules (S01–S06)' },
    { href: '/dashboard/compliance-calendar/audit', label: 'Annual Audit Plan (S07–S08)' },
    {
      href: '/dashboard/compliance-calendar/certificate',
      label: 'Monthly Calendar Certificate (S10)',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">
              EPIC-35 · Compliance Calendar & Scheduling
            </p>
            <h1 className="text-2xl font-semibold">Calendar Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={seedAndGenerate}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Seed + Generate
            </button>
            <button
              type="button"
              onClick={escalate}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              Escalate Overdue
            </button>
          </div>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Tile label="Total" value={data.total} />
            <Tile label="Completed" value={data.completed} colour="emerald" />
            <Tile label="Deferred" value={data.deferred} colour="amber" />
            <Tile label="Overdue" value={data.overdue} colour="rose" />
            <Tile label="On-time %" value={data.onTimePct} />
          </section>
        ) : null}
        {data?.criticalOverdue ? (
          <p className="rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
            ⚠️ {data.criticalOverdue} critical task(s) overdue. Monthly certificate will be blocked.
          </p>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">By Category</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Completed</th>
                <th className="px-3 py-2">Overdue</th>
              </tr>
            </thead>
            <tbody>
              {(data?.byCategory ?? []).map((c) => (
                <tr key={c.categoryCode} className="border-b border-slate-100">
                  <td className="px-3 py-2">{c.categoryCode}</td>
                  <td className="px-3 py-2">{c.total}</td>
                  <td className="px-3 py-2 text-emerald-700">{c.completed}</td>
                  <td className="px-3 py-2 text-rose-700">{c.overdue}</td>
                </tr>
              ))}
              {(!data || data.byCategory.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                    No tasks for {period}. Seed and generate.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {tools.map((t) => (
              <li key={t.href}>
                <a
                  href={t.href}
                  className="block rounded-md border border-slate-200 px-3 py-2 text-sm hover:border-slate-900 hover:bg-slate-50"
                >
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function Tile({ label, value, colour }: { label: string; value: number; colour?: string }) {
  const cls =
    colour === 'emerald'
      ? 'text-emerald-700'
      : colour === 'rose'
        ? 'text-rose-700'
        : colour === 'amber'
          ? 'text-amber-700'
          : 'text-slate-900';
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`text-3xl font-semibold ${cls}`}>{value}</p>
    </div>
  );
}
