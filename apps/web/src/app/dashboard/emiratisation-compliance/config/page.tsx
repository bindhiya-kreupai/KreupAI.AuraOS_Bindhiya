'use client';

import { useEffect, useState } from 'react';

interface Config {
  id: string;
  legalEntityId: string | null;
  establishmentName: string;
  isInScope: boolean;
  skilledWorkforceCount: number;
  sector: string | null;
}

export default function EmConfigPage() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [form, setForm] = useState({
    legalEntityId: '',
    establishmentName: '',
    skilledWorkforceCount: '100',
    sector: 'PRIVATE',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/emiratisation-compliance/config');
    const p = await r.json();
    if (p.success) setConfigs(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    setMessage('');
    const r = await fetch('/api/v1/emiratisation-compliance/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        legalEntityId: form.legalEntityId || undefined,
        establishmentName: form.establishmentName,
        skilledWorkforceCount: Number(form.skilledWorkforceCount),
        sector: form.sector,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-16 · S01–S02</p>
          <h1 className="text-2xl font-semibold">Establishment Scope</h1>
          <p className="mt-1 text-xs text-slate-600">
            Entities with skilled workforce ≥ 50 are in scope. Save each legal entity below.
          </p>
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
          <label className="text-sm md:col-span-2">
            Establishment Name
            <input
              value={form.establishmentName}
              onChange={(e) => setForm((f) => ({ ...f, establishmentName: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Skilled Workforce
            <input
              value={form.skilledWorkforceCount}
              onChange={(e) => setForm((f) => ({ ...f, skilledWorkforceCount: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
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
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Skilled</th>
                <th className="px-3 py-2">Sector</th>
                <th className="px-3 py-2">In Scope</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{c.legalEntityId ?? '—'}</td>
                  <td className="px-3 py-2">{c.establishmentName}</td>
                  <td className="px-3 py-2">{c.skilledWorkforceCount}</td>
                  <td className="px-3 py-2">{c.sector ?? '—'}</td>
                  <td className="px-3 py-2">
                    {c.isInScope ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                        IN SCOPE
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        OUT
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {configs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                    No establishments yet.
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
