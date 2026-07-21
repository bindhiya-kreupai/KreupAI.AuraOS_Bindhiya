'use client';

import { useEffect, useState } from 'react';

interface Rule {
  id: string;
  country: string;
  leaveCode: string;
  annualDays: string;
  accrualBasis: string;
  maxCarryForwardDays: string;
  encashableDays: string;
  isPaid: boolean;
  isMedicalEvidenceRequired: boolean;
  minServiceMonths: number;
  maxConsecutiveDays: string;
  noticePeriodDays: number;
  effectiveFrom: string;
}

export default function EntitlementsPage() {
  const [rows, setRows] = useState<Rule[]>([]);
  const [country, setCountry] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/leave-compliance/entitlements', window.location.origin);
    if (country) url.searchParams.set('country', country);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
  }
  useEffect(() => {
    load();
  }, [country]);

  async function seed() {
    setMessage('');
    const r = await fetch('/api/v1/leave-compliance/entitlements', {
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
            <p className="text-sm uppercase text-slate-500">EPIC-20 · S02 / S03–S07 / S09 / S10</p>
            <h1 className="text-2xl font-semibold">GCC Leave Entitlement Rules</h1>
          </div>
          <div className="flex gap-2">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">All countries</option>
              {['UAE', 'KSA', 'BAHRAIN', 'QATAR', 'OMAN', 'KUWAIT'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={seed}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Seed GCC Defaults
            </button>
          </div>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Leave</th>
                <th className="px-3 py-2">Annual</th>
                <th className="px-3 py-2">Accrual</th>
                <th className="px-3 py-2">CF max</th>
                <th className="px-3 py-2">Encash</th>
                <th className="px-3 py-2">Paid</th>
                <th className="px-3 py-2">Med Evidence</th>
                <th className="px-3 py-2">Min Svc</th>
                <th className="px-3 py-2">Notice</th>
                <th className="px-3 py-2">From</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{r.country}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.leaveCode}</td>
                  <td className="px-3 py-2">{r.annualDays}</td>
                  <td className="px-3 py-2 text-xs">{r.accrualBasis}</td>
                  <td className="px-3 py-2">{r.maxCarryForwardDays}</td>
                  <td className="px-3 py-2">{r.encashableDays}</td>
                  <td className="px-3 py-2">{r.isPaid ? '✓' : '—'}</td>
                  <td className="px-3 py-2">{r.isMedicalEvidenceRequired ? '✓' : '—'}</td>
                  <td className="px-3 py-2">{r.minServiceMonths}m</td>
                  <td className="px-3 py-2">{r.noticePeriodDays}d</td>
                  <td className="px-3 py-2 text-xs">{r.effectiveFrom?.slice(0, 10)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-3 py-6 text-center text-slate-500">
                    No entitlement rules. Click &quot;Seed GCC Defaults&quot; to bootstrap.
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
