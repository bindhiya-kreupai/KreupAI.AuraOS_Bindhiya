'use client';

import { useEffect, useState } from 'react';

interface Config {
  id: string;
  legalEntityId: string | null;
  establishmentName: string;
  sector: string;
  sizeBracket: string;
  bahrainiHeadcount: number;
  totalHeadcount: number;
  lmraEstablishmentId: string | null;
  isInScope: boolean;
  isGovernmentTenderEligible: boolean;
}

export default function BahConfigPage() {
  const [rows, setRows] = useState<Config[]>([]);
  const [form, setForm] = useState({
    legalEntityId: '',
    establishmentName: '',
    sector: 'PRIVATE',
    sizeBracket: 'SMALL',
    bahrainiHeadcount: '0',
    totalHeadcount: '0',
    lmraEstablishmentId: '',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/bahrainization-compliance/config');
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    setMessage('');
    const r = await fetch('/api/v1/bahrainization-compliance/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        legalEntityId: form.legalEntityId || undefined,
        establishmentName: form.establishmentName,
        sector: form.sector,
        sizeBracket: form.sizeBracket,
        bahrainiHeadcount: Number(form.bahrainiHeadcount),
        totalHeadcount: Number(form.totalHeadcount),
        lmraEstablishmentId: form.lmraEstablishmentId || undefined,
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
          <p className="text-sm uppercase text-slate-500">EPIC-18 · S01 / S02</p>
          <h1 className="text-2xl font-semibold">Establishment Scope &amp; Headcount</h1>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-7">
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
            Sector
            <input
              value={form.sector}
              onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Size Bracket
            <select
              value={form.sizeBracket}
              onChange={(e) => setForm((f) => ({ ...f, sizeBracket: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['MICRO', 'SMALL', 'MEDIUM', 'LARGE', 'GIANT'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Bahraini HC
            <input
              value={form.bahrainiHeadcount}
              onChange={(e) => setForm((f) => ({ ...f, bahrainiHeadcount: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Total HC
            <input
              value={form.totalHeadcount}
              onChange={(e) => setForm((f) => ({ ...f, totalHeadcount: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm md:col-span-2">
            LMRA Establishment ID
            <input
              value={form.lmraEstablishmentId}
              onChange={(e) => setForm((f) => ({ ...f, lmraEstablishmentId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={save}
            className="self-end rounded-md bg-slate-900 px-3 py-2 text-sm text-white md:col-span-5"
          >
            Save Config
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Entity</th>
                <th className="px-3 py-2">Establishment</th>
                <th className="px-3 py-2">Sector / Size</th>
                <th className="px-3 py-2">Bahraini HC</th>
                <th className="px-3 py-2">Total HC</th>
                <th className="px-3 py-2">LMRA ID</th>
                <th className="px-3 py-2">In Scope</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{c.legalEntityId ?? '—'}</td>
                  <td className="px-3 py-2">{c.establishmentName}</td>
                  <td className="px-3 py-2">
                    {c.sector} / {c.sizeBracket}
                  </td>
                  <td className="px-3 py-2">{c.bahrainiHeadcount}</td>
                  <td className="px-3 py-2">{c.totalHeadcount}</td>
                  <td className="px-3 py-2 font-mono text-xs">{c.lmraEstablishmentId ?? '—'}</td>
                  <td className="px-3 py-2">{c.isInScope ? '✓' : '—'}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No configs.
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
