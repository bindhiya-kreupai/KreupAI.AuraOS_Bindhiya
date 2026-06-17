'use client';

import { useEffect, useState } from 'react';

interface Fine {
  id: string;
  legalEntityId: string | null;
  year: number;
  checkpoint: string;
  missedHires: number;
  amount: string;
  currency: string;
  status: string;
  incurredAt: string | null;
  resolvedAt: string | null;
}

export default function EmFinesPage() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [form, setForm] = useState({
    legalEntityId: '',
    year: String(new Date().getFullYear()),
    checkpoint: 'MID_YEAR',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/emiratisation-compliance/fines');
    const p = await r.json();
    if (p.success) setFines(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function call(action: string, extra: Record<string, unknown> = {}) {
    setMessage('');
    const r = await fetch('/api/v1/emiratisation-compliance/fines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    });
    const p = await r.json();
    setMessage(
      p.success
        ? `${action} OK`
        : (p.error?.details?.error ?? p.error?.message ?? `${action} failed`)
    );
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-16 · S05</p>
          <h1 className="text-2xl font-semibold">Fines: Projected → Incurred → Resolved</h1>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
          <label className="text-sm">
            Legal Entity ID
            <input
              value={form.legalEntityId}
              onChange={(e) => setForm((f) => ({ ...f, legalEntityId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Year
            <input
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Checkpoint
            <select
              value={form.checkpoint}
              onChange={(e) => setForm((f) => ({ ...f, checkpoint: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['MID_YEAR', 'YEAR_END'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() =>
              call('raise-projected', {
                legalEntityId: form.legalEntityId || undefined,
                year: Number(form.year),
                checkpoint: form.checkpoint,
              })
            }
            className="self-end rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Raise Projected
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Entity</th>
                <th className="px-3 py-2">Year</th>
                <th className="px-3 py-2">Checkpoint</th>
                <th className="px-3 py-2">Missed</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fines.map((f) => (
                <tr key={f.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{f.legalEntityId ?? '—'}</td>
                  <td className="px-3 py-2">{f.year}</td>
                  <td className="px-3 py-2">{f.checkpoint}</td>
                  <td className="px-3 py-2">{f.missedHires}</td>
                  <td className="px-3 py-2">
                    {f.amount} {f.currency}
                  </td>
                  <td className="px-3 py-2">{f.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      {f.status === 'PROJECTED' && (
                        <button
                          type="button"
                          onClick={() => call('mark-incurred', { fineId: f.id })}
                          className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs"
                        >
                          Mark Incurred
                        </button>
                      )}
                      {f.status === 'INCURRED' && (
                        <button
                          type="button"
                          onClick={() => call('resolve', { fineId: f.id })}
                          className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {fines.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No fines.
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
