'use client';

import { useEffect, useState } from 'react';

interface Vendor {
  id: string;
  name: string;
  vendorType: string;
  country: string | null;
  contactEmail: string | null;
  contractRef: string | null;
  contractStart: string | null;
  contractEnd: string | null;
  dpaSigned: boolean;
  dpaSignedAt: string | null;
  status: string;
}

export default function VendorsPage() {
  const [rows, setRows] = useState<Vendor[]>([]);
  const [form, setForm] = useState({
    name: '',
    vendorType: 'MEDICAL_INSURER',
    country: 'UAE',
    contactEmail: '',
    contractRef: '',
    contractStart: '',
    contractEnd: '',
    dpaSigned: false,
  });
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/benefits-compliance/vendors');
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    setMessage('');
    const r = await fetch('/api/v1/benefits-compliance/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        ...form,
        contractStart: form.contractStart || undefined,
        contractEnd: form.contractEnd || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function signDpa(id: string) {
    const r = await fetch('/api/v1/benefits-compliance/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sign-dpa', id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'DPA signed' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-22 · S14</p>
          <h1 className="text-2xl font-semibold">Vendor Management &amp; Data Privacy</h1>
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
              value={form.vendorType}
              onChange={(e) => setForm((f) => ({ ...f, vendorType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {[
                'MEDICAL_INSURER',
                'LIFE_INSURER',
                'TRAVEL_AGENCY',
                'HOUSING_PROVIDER',
                'EDUCATION_PROVIDER',
                'PPE_SUPPLIER',
                'WELLNESS_PROVIDER',
                'OTHER',
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Country
            <input
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Contact Email
            <input
              value={form.contactEmail}
              onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Contract Ref
            <input
              value={form.contractRef}
              onChange={(e) => setForm((f) => ({ ...f, contractRef: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.dpaSigned}
              onChange={(e) => setForm((f) => ({ ...f, dpaSigned: e.target.checked }))}
            />
            DPA signed
          </label>
          <button
            type="button"
            onClick={save}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white md:col-span-7"
          >
            Save Vendor
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
                <th className="px-3 py-2">Contract</th>
                <th className="px-3 py-2">Contract End</th>
                <th className="px-3 py-2">DPA</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{v.name}</td>
                  <td className="px-3 py-2 text-xs">{v.vendorType}</td>
                  <td className="px-3 py-2">{v.country ?? '—'}</td>
                  <td className="px-3 py-2 font-mono text-xs">{v.contractRef ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{v.contractEnd?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2">
                    {v.dpaSigned ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                        ✓ {v.dpaSignedAt?.slice(0, 10)}
                      </span>
                    ) : (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-800">
                        UNSIGNED
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {!v.dpaSigned && (
                      <button
                        type="button"
                        onClick={() => signDpa(v.id)}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                      >
                        Sign DPA
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No vendors.
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
