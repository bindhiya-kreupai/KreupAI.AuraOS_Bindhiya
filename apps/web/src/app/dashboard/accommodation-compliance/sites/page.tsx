'use client';

import { useEffect, useState } from 'react';

interface Site {
  id: string;
  name: string;
  siteType: string;
  country: string;
  address: string | null;
  totalCapacity: number;
  currentOccupancy: number;
  femaleOnly: boolean;
  familyAllowed: boolean;
  lastInspectionAt: string | null;
  nextInspectionAt: string | null;
  status: string;
}

export default function SitesPage() {
  const [rows, setRows] = useState<Site[]>([]);
  const [country, setCountry] = useState('');
  const [form, setForm] = useState({
    name: '',
    siteType: 'DORMITORY',
    country: 'UAE',
    address: '',
    totalCapacity: '50',
    femaleOnly: false,
    familyAllowed: false,
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/accommodation-compliance/sites', window.location.origin);
    if (country) url.searchParams.set('country', country);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data?.items ?? []);
  }
  useEffect(() => {
    load();
  }, [country]);

  async function save() {
    setMessage('');
    const r = await fetch('/api/v1/accommodation-compliance/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        ...form,
        totalCapacity: Number(form.totalCapacity),
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-23 · S02 / S14</p>
            <h1 className="text-2xl font-semibold">Accommodation Site Master</h1>
          </div>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All countries</option>
            {['UAE', 'KSA', 'BAHRAIN', 'QATAR', 'OMAN', 'KUWAIT'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-7">
          <label className="text-sm md:col-span-2">
            Name
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Type
            <select
              value={form.siteType}
              onChange={(e) => setForm((f) => ({ ...f, siteType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['DORMITORY', 'HOTEL', 'APARTMENT', 'LABOUR_CAMP', 'VILLA', 'STAFF_HOUSING'].map(
                (t) => (
                  <option key={t}>{t}</option>
                )
              )}
            </select>
          </label>
          <label className="text-sm">
            Country
            <select
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['UAE', 'KSA', 'BAHRAIN', 'QATAR', 'OMAN', 'KUWAIT'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Capacity
            <input
              value={form.totalCapacity}
              onChange={(e) => setForm((f) => ({ ...f, totalCapacity: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.femaleOnly}
              onChange={(e) => setForm((f) => ({ ...f, femaleOnly: e.target.checked }))}
            />
            Female only
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.familyAllowed}
              onChange={(e) => setForm((f) => ({ ...f, familyAllowed: e.target.checked }))}
            />
            Family
          </label>
          <button
            type="button"
            onClick={save}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white md:col-span-7"
          >
            Save Site
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Capacity</th>
                <th className="px-3 py-2">Occupancy</th>
                <th className="px-3 py-2">Female</th>
                <th className="px-3 py-2">Family</th>
                <th className="px-3 py-2">Last Insp</th>
                <th className="px-3 py-2">Next Insp</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const over = s.currentOccupancy > s.totalCapacity;
                return (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">{s.name}</td>
                    <td className="px-3 py-2 text-xs">{s.siteType}</td>
                    <td className="px-3 py-2">{s.country}</td>
                    <td className="px-3 py-2">{s.totalCapacity}</td>
                    <td className={`px-3 py-2 ${over ? 'font-semibold text-rose-700' : ''}`}>
                      {s.currentOccupancy}
                      {over ? ' ⚠' : ''}
                    </td>
                    <td className="px-3 py-2">{s.femaleOnly ? '✓' : '—'}</td>
                    <td className="px-3 py-2">{s.familyAllowed ? '✓' : '—'}</td>
                    <td className="px-3 py-2 text-xs">{s.lastInspectionAt?.slice(0, 10) ?? '—'}</td>
                    <td className="px-3 py-2 text-xs">{s.nextInspectionAt?.slice(0, 10) ?? '—'}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No sites.
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
