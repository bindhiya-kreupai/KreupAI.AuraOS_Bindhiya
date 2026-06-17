'use client';

import { useEffect, useState } from 'react';

interface Snap {
  id: string;
  legalEntityId: string | null;
  checkpointDate: string;
  checkpoint: string;
  skilledHeadcount: number;
  uaeNationalCount: number;
  actualPct: string;
  targetPct: string;
  gapPct: string;
  missedHires: number;
  projectedFine: string;
  ragStatus: string;
}

const ragColor: Record<string, string> = {
  GREEN: 'bg-emerald-100 text-emerald-800',
  AMBER: 'bg-amber-100 text-amber-800',
  RED: 'bg-rose-100 text-rose-800',
};

export default function EmSnapshotsPage() {
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [form, setForm] = useState({
    legalEntityId: '',
    checkpointDate: new Date().toISOString().slice(0, 10),
    checkpoint: 'MID_YEAR',
    year: String(new Date().getFullYear()),
  });
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/emiratisation-compliance/snapshots');
    const p = await r.json();
    if (p.success) setSnaps(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function take() {
    setMessage('');
    const r = await fetch('/api/v1/emiratisation-compliance/snapshots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        legalEntityId: form.legalEntityId || undefined,
        checkpointDate: form.checkpointDate,
        checkpoint: form.checkpoint,
        year: Number(form.year),
      }),
    });
    const p = await r.json();
    setMessage(
      p.success ? 'Snapshot taken' : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-16 · S04 / S05 / S14</p>
          <h1 className="text-2xl font-semibold">Checkpoint Snapshots</h1>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-5">
          <label className="text-sm">
            Legal Entity ID
            <input
              value={form.legalEntityId}
              onChange={(e) => setForm((f) => ({ ...f, legalEntityId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Checkpoint Date
            <input
              type="date"
              value={form.checkpointDate}
              onChange={(e) => setForm((f) => ({ ...f, checkpointDate: e.target.value }))}
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
          <label className="text-sm">
            Year
            <input
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={take}
            className="self-end rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Take Snapshot
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Entity</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Checkpoint</th>
                <th className="px-3 py-2">Skilled HC</th>
                <th className="px-3 py-2">UAE Nat.</th>
                <th className="px-3 py-2">Actual %</th>
                <th className="px-3 py-2">Target %</th>
                <th className="px-3 py-2">Missed</th>
                <th className="px-3 py-2">Fine</th>
                <th className="px-3 py-2">RAG</th>
              </tr>
            </thead>
            <tbody>
              {snaps.map((s) => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{s.legalEntityId ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{s.checkpointDate?.slice(0, 10)}</td>
                  <td className="px-3 py-2">{s.checkpoint}</td>
                  <td className="px-3 py-2">{s.skilledHeadcount}</td>
                  <td className="px-3 py-2">{s.uaeNationalCount}</td>
                  <td className="px-3 py-2">{s.actualPct}</td>
                  <td className="px-3 py-2">{s.targetPct}</td>
                  <td className="px-3 py-2 text-rose-700">{s.missedHires}</td>
                  <td className="px-3 py-2 text-rose-700">{s.projectedFine}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ragColor[s.ragStatus] ?? ''}`}
                    >
                      {s.ragStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {snaps.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-slate-500">
                    No snapshots.
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
