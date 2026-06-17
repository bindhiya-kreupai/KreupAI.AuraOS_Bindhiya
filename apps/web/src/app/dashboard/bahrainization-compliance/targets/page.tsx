'use client';

import { useEffect, useState } from 'react';

interface Target {
  id: string;
  sector: string;
  sizeBracket: string;
  targetRatioPct: string;
  tenderEligibilityMinPct: string | null;
  effectiveFrom: string;
  basis: string | null;
}

export default function BahTargetsPage() {
  const [rows, setRows] = useState<Target[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/bahrainization-compliance/targets');
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function seed() {
    setMessage('');
    const r = await fetch('/api/v1/bahrainization-compliance/targets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-defaults' }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Seeded' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-18 · S04 / S15</p>
            <h1 className="text-2xl font-semibold">Sector × Size Targets</h1>
          </div>
          <button
            type="button"
            onClick={seed}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Seed Default Targets
          </button>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Sector</th>
                <th className="px-3 py-2">Size</th>
                <th className="px-3 py-2">Target %</th>
                <th className="px-3 py-2">Tender Min %</th>
                <th className="px-3 py-2">Effective From</th>
                <th className="px-3 py-2">Basis</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{r.sector}</td>
                  <td className="px-3 py-2">{r.sizeBracket}</td>
                  <td className="px-3 py-2 text-emerald-700">{r.targetRatioPct}</td>
                  <td className="px-3 py-2 text-indigo-700">{r.tenderEligibilityMinPct ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{r.effectiveFrom?.slice(0, 10)}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{r.basis ?? '—'}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    No targets configured. Click &quot;Seed Default Targets&quot; to bootstrap.
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
