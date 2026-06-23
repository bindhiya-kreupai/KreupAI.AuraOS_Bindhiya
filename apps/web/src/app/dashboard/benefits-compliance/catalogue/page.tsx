'use client';

import { useEffect, useState } from 'react';

interface Cat {
  id: string;
  benefitCode: string;
  benefitType: string;
  label: string;
  countryCode: string | null;
  isMandatory: boolean;
  valuationBasis: string;
  annualValue: string;
  currency: string;
  frequencyMonths: number;
  vendorRequired: boolean;
  dependantsAllowed: boolean;
  effectiveFrom: string;
}

export default function CataloguePage() {
  const [rows, setRows] = useState<Cat[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/benefits-compliance/catalogue');
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function seed() {
    setMessage('');
    const r = await fetch('/api/v1/benefits-compliance/catalogue', {
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
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-22 · S01 / S02 / S04–S13</p>
            <h1 className="text-2xl font-semibold">Benefit Catalogue</h1>
          </div>
          <button
            type="button"
            onClick={seed}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Seed Default Catalogue
          </button>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Mandatory</th>
                <th className="px-3 py-2">Basis</th>
                <th className="px-3 py-2">Annual</th>
                <th className="px-3 py-2">Freq mo</th>
                <th className="px-3 py-2">Vendor</th>
                <th className="px-3 py-2">Dep</th>
                <th className="px-3 py-2">From</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{r.benefitCode}</td>
                  <td className="px-3 py-2 text-xs">{r.benefitType}</td>
                  <td className="px-3 py-2">{r.label}</td>
                  <td className="px-3 py-2">{r.countryCode ?? '*'}</td>
                  <td className="px-3 py-2">
                    {r.isMandatory ? (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-800">
                        MUST
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs">{r.valuationBasis}</td>
                  <td className="px-3 py-2">
                    {r.annualValue} {r.currency}
                  </td>
                  <td className="px-3 py-2">{r.frequencyMonths}</td>
                  <td className="px-3 py-2">{r.vendorRequired ? '✓' : '—'}</td>
                  <td className="px-3 py-2">{r.dependantsAllowed ? '✓' : '—'}</td>
                  <td className="px-3 py-2 text-xs">{r.effectiveFrom?.slice(0, 10)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-3 py-6 text-center text-slate-500">
                    No catalogue. Click &quot;Seed Default Catalogue&quot; to bootstrap.
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
