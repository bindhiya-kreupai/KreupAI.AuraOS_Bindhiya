'use client';

import { useEffect, useState } from 'react';

interface Cov {
  id: string;
  employeeId: string;
  benefitCatalogueId: string;
  vendorId: string | null;
  policyNumber: string | null;
  startedAt: string;
  expiresAt: string | null;
  actualAnnualValue: string | null;
  currency: string;
  dependantsCount: number;
  status: string;
  accruedBalance: string;
}

const statusColor: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  TERMINATED: 'bg-slate-100 text-slate-700',
};

export default function EnrollmentsPage() {
  const [rows, setRows] = useState<Cov[]>([]);
  const [filter, setFilter] = useState<'all' | 'expiringSoon'>('all');
  const [form, setForm] = useState({
    employeeId: '',
    benefitCode: 'MEDICAL_INSURANCE_UAE',
    vendorId: '',
    policyNumber: '',
    startedAt: new Date().toISOString().slice(0, 10),
    expiresAt: '',
    actualAnnualValue: '',
    dependantsCount: '0',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/benefits-compliance/enrollments', window.location.origin);
    if (filter === 'expiringSoon') url.searchParams.set('expiringSoon', 'true');
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function enroll() {
    setMessage('');
    const r = await fetch('/api/v1/benefits-compliance/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'enroll',
        ...form,
        vendorId: form.vendorId || undefined,
        policyNumber: form.policyNumber || undefined,
        expiresAt: form.expiresAt || undefined,
        actualAnnualValue: form.actualAnnualValue ? Number(form.actualAnnualValue) : undefined,
        dependantsCount: Number(form.dependantsCount),
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Enrolled' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function renew(id: string) {
    const d = window.prompt('New expiry (YYYY-MM-DD)?') ?? '';
    if (!d) return;
    const r = await fetch('/api/v1/benefits-compliance/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'renew', id, expiresAt: d }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Renewed' : p.error?.message);
    load();
  }
  async function accrue(id: string) {
    const r = await fetch('/api/v1/benefits-compliance/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'accrue', id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Accrued' : p.error?.message);
    load();
  }
  async function terminate(id: string) {
    const d = window.prompt('End date (YYYY-MM-DD)?') ?? '';
    if (!d) return;
    const r = await fetch('/api/v1/benefits-compliance/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'terminate', id, endsAt: d }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Terminated' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-22 · S03 – S13 / S15</p>
            <h1 className="text-2xl font-semibold">Coverage Register, Renewal &amp; Accrual</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="all">All</option>
            <option value="expiringSoon">Expiring ≤60d</option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-8">
          <label className="text-sm">
            Employee
            <input
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Benefit Code
            <input
              value={form.benefitCode}
              onChange={(e) => setForm((f) => ({ ...f, benefitCode: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Vendor ID
            <input
              value={form.vendorId}
              onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Policy #
            <input
              value={form.policyNumber}
              onChange={(e) => setForm((f) => ({ ...f, policyNumber: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Started
            <input
              type="date"
              value={form.startedAt}
              onChange={(e) => setForm((f) => ({ ...f, startedAt: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Expires
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Annual Value
            <input
              value={form.actualAnnualValue}
              onChange={(e) => setForm((f) => ({ ...f, actualAnnualValue: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={enroll}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Enroll
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Catalogue</th>
                <th className="px-3 py-2">Policy #</th>
                <th className="px-3 py-2">Started</th>
                <th className="px-3 py-2">Expires</th>
                <th className="px-3 py-2">Annual</th>
                <th className="px-3 py-2">Dep</th>
                <th className="px-3 py-2">Accrued</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{c.employeeId}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {c.benefitCatalogueId.slice(0, 8)}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{c.policyNumber ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{c.startedAt?.slice(0, 10)}</td>
                  <td className="px-3 py-2 text-xs">{c.expiresAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2">
                    {c.actualAnnualValue ?? '—'} {c.currency}
                  </td>
                  <td className="px-3 py-2">{c.dependantsCount}</td>
                  <td className="px-3 py-2 text-emerald-700">{c.accruedBalance}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[c.status] ?? ''}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {c.status === 'ACTIVE' && (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => renew(c.id)}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                        >
                          Renew
                        </button>
                        <button
                          type="button"
                          onClick={() => accrue(c.id)}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                        >
                          Accrue
                        </button>
                        <button
                          type="button"
                          onClick={() => terminate(c.id)}
                          className="rounded-md bg-rose-700 px-2 py-1 text-xs text-white"
                        >
                          End
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-slate-500">
                    No coverages.
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
