'use client';

import { useEffect, useState } from 'react';

interface Target {
  id: string;
  legalEntityId: string | null;
  year: number;
  halfYearTargetPct: string;
  yearEndTargetPct: string;
  finePerMissedHire: string;
  currency: string;
}

export default function EmTargetsPage() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [form, setForm] = useState({
    legalEntityId: '',
    year: String(new Date().getFullYear()),
    halfYearTargetPct: '2',
    yearEndTargetPct: '4',
    finePerMissedHire: '7000',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/emiratisation-compliance/targets');
    const p = await r.json();
    if (p.success) setTargets(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    setMessage('');
    const r = await fetch('/api/v1/emiratisation-compliance/targets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        legalEntityId: form.legalEntityId || undefined,
        year: Number(form.year),
        halfYearTargetPct: Number(form.halfYearTargetPct),
        yearEndTargetPct: Number(form.yearEndTargetPct),
        finePerMissedHire: Number(form.finePerMissedHire),
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-16 · S03 / S05</p>
          <h1 className="text-2xl font-semibold">Annual Targets & Fines</h1>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6">
          {(
            [
              'legalEntityId',
              'year',
              'halfYearTargetPct',
              'yearEndTargetPct',
              'finePerMissedHire',
            ] as const
          ).map((k) => (
            <label key={k} className="text-sm">
              {k}
              <input
                value={form[k]}
                onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
          ))}
          <button
            type="button"
            onClick={save}
            className="self-end rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Save
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Entity</th>
                <th className="px-3 py-2">Year</th>
                <th className="px-3 py-2">Mid-Year %</th>
                <th className="px-3 py-2">Year-End %</th>
                <th className="px-3 py-2">Fine / Hire</th>
                <th className="px-3 py-2">Currency</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{t.legalEntityId ?? '—'}</td>
                  <td className="px-3 py-2">{t.year}</td>
                  <td className="px-3 py-2">{t.halfYearTargetPct}</td>
                  <td className="px-3 py-2">{t.yearEndTargetPct}</td>
                  <td className="px-3 py-2">{t.finePerMissedHire}</td>
                  <td className="px-3 py-2">{t.currency}</td>
                </tr>
              ))}
              {targets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    No targets configured.
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
