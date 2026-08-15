'use client';

import { useEffect, useState } from 'react';

interface Snap {
  id: string;
  legalEntityId: string | null;
  snapshotDate: string;
  saudiHeadcount: number;
  totalHeadcount: number;
  saudizationPct: string;
  band: string;
  thresholdBracket: string | null;
}

const bandColor: Record<string, string> = {
  PLATINUM: 'bg-indigo-100 text-indigo-800',
  GREEN: 'bg-emerald-100 text-emerald-800',
  YELLOW: 'bg-amber-100 text-amber-800',
  RED: 'bg-rose-100 text-rose-800',
};

export default function NitaqatSnapshotsPage() {
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [form, setForm] = useState({
    legalEntityId: '',
    snapshotDate: new Date().toISOString().slice(0, 10),
  });
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/nitaqat-compliance/snapshots');
    const p = await r.json();
    if (p.success) setSnaps(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
  }
  useEffect(() => {
    load();
  }, []);

  async function take() {
    setMessage('');
    const r = await fetch('/api/v1/nitaqat-compliance/snapshots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        legalEntityId: form.legalEntityId || undefined,
        snapshotDate: form.snapshotDate,
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
          <p className="text-sm uppercase text-slate-500">EPIC-17 · S05 / S09 / S14</p>
          <h1 className="text-2xl font-semibold">Nitaqat Band Snapshots</h1>
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
            Snapshot Date
            <input
              type="date"
              value={form.snapshotDate}
              onChange={(e) => setForm((f) => ({ ...f, snapshotDate: e.target.value }))}
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
                <th className="px-3 py-2">Saudi HC</th>
                <th className="px-3 py-2">Total HC</th>
                <th className="px-3 py-2">Saudization %</th>
                <th className="px-3 py-2">Bracket</th>
                <th className="px-3 py-2">Band</th>
              </tr>
            </thead>
            <tbody>
              {snaps.map((s) => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{s.legalEntityId ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{s.snapshotDate?.slice(0, 10)}</td>
                  <td className="px-3 py-2">{s.saudiHeadcount}</td>
                  <td className="px-3 py-2">{s.totalHeadcount}</td>
                  <td className="px-3 py-2">{s.saudizationPct}</td>
                  <td className="px-3 py-2 text-xs">{s.thresholdBracket ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${bandColor[s.band] ?? ''}`}
                    >
                      {s.band}
                    </span>
                  </td>
                </tr>
              ))}
              {snaps.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
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
