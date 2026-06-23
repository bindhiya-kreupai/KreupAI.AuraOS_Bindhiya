'use client';

import { useEffect, useState } from 'react';

interface T {
  id: string;
  employeeId: string;
  trainingCode: string;
  trainingType: string;
  completedAt: string;
  validUntil: string | null;
  trainerName: string | null;
  score: number | null;
}

export default function TrainingPage() {
  const [rows, setRows] = useState<T[]>([]);
  const [filter, setFilter] = useState<'all' | 'expiringSoon' | 'expired'>('all');
  const [form, setForm] = useState({
    employeeId: '',
    trainingCode: 'HSE_INDUCTION',
    trainingType: 'INDUCTION',
    completedAt: new Date().toISOString().slice(0, 10),
    validityMonths: '12',
    trainerName: '',
    score: '',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/hse-compliance/training', window.location.origin);
    if (filter === 'expiringSoon') url.searchParams.set('expiringSoonDays', '30');
    if (filter === 'expired') url.searchParams.set('expiredOnly', 'true');
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function record() {
    setMessage('');
    const r = await fetch('/api/v1/hse-compliance/training', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'record',
        ...form,
        validityMonths: Number(form.validityMonths),
        score: form.score ? Number(form.score) : undefined,
        trainerName: form.trainerName || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Recorded' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-24 · S06 / S07</p>
            <h1 className="text-2xl font-semibold">Training Register</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="all">All</option>
            <option value="expiringSoon">Expiring ≤30d</option>
            <option value="expired">Expired</option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-7">
          <label className="text-sm">
            Employee
            <input
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Training Code
            <input
              value={form.trainingCode}
              onChange={(e) => setForm((f) => ({ ...f, trainingCode: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Type
            <select
              value={form.trainingType}
              onChange={(e) => setForm((f) => ({ ...f, trainingType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {[
                'INDUCTION',
                'TECHNICAL',
                'PPE',
                'FIRST_AID',
                'FIRE_WARDEN',
                'TOOLBOX_TALK',
                'REFRESHER',
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Completed
            <input
              type="date"
              value={form.completedAt}
              onChange={(e) => setForm((f) => ({ ...f, completedAt: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Validity mo
            <input
              value={form.validityMonths}
              onChange={(e) => setForm((f) => ({ ...f, validityMonths: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Score
            <input
              value={form.score}
              onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={record}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Record
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Completed</th>
                <th className="px-3 py-2">Valid Until</th>
                <th className="px-3 py-2">Trainer</th>
                <th className="px-3 py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const expired = t.validUntil && new Date(t.validUntil) < new Date();
                return (
                  <tr key={t.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">{t.employeeId}</td>
                    <td className="px-3 py-2 font-mono text-xs">{t.trainingCode}</td>
                    <td className="px-3 py-2 text-xs">{t.trainingType}</td>
                    <td className="px-3 py-2 text-xs">{t.completedAt?.slice(0, 10)}</td>
                    <td
                      className={`px-3 py-2 text-xs ${expired ? 'font-semibold text-rose-700' : ''}`}
                    >
                      {t.validUntil?.slice(0, 10) ?? '—'}
                      {expired ? ' ⚠' : ''}
                    </td>
                    <td className="px-3 py-2 text-xs">{t.trainerName ?? '—'}</td>
                    <td className="px-3 py-2">{t.score ?? '—'}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No training records.
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
