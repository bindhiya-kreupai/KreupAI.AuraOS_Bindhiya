'use client';

import { useCallback, useEffect, useState } from 'react';

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

const today = () => new Date().toISOString().slice(0, 10);

export default function CoverageRegisterPage() {
  const [rows, setRows] = useState<Cov[]>([]);
  const [filter, setFilter] = useState<'all' | 'expiringSoon'>('all');
  const [form, setForm] = useState({
    employeeId: '',
    benefitCode: 'MEDICAL_INSURANCE_UAE',
    vendorId: '',
    policyNumber: '',
    startedAt: today(),
    expiresAt: '',
    actualAnnualValue: '',
    dependantsCount: '0',
  });
  // Inline per-row date inputs — no window.prompt().
  const [rowDate, setRowDate] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const url = new URL('/api/v1/benefits-compliance/enrollments', window.location.origin);
    if (filter === 'expiringSoon') url.searchParams.set('expiringSoon', 'true');
    const r = await fetch(url.toString());
    const p = await r.json();
    // List API returns a paginated envelope { items, total, ... }.
    if (p.success) setRows(p.data?.items ?? []);
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function post(body: Record<string, unknown>, okMsg: string) {
    setBusy(true);
    setMessage('');
    try {
      const r = await fetch('/api/v1/benefits-compliance/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const p = await r.json();
      setMessage(p.success ? okMsg : (p.error?.details?.error ?? p.error?.message ?? 'Failed'));
      if (p.success) await load();
    } finally {
      setBusy(false);
    }
  }

  function enroll() {
    void post(
      {
        action: 'enroll',
        ...form,
        vendorId: form.vendorId || undefined,
        policyNumber: form.policyNumber || undefined,
        expiresAt: form.expiresAt || undefined,
        actualAnnualValue: form.actualAnnualValue ? Number(form.actualAnnualValue) : undefined,
        dependantsCount: Number(form.dependantsCount),
      },
      'Enrolled'
    );
  }

  function renew(id: string) {
    const d = rowDate[id];
    if (!d) {
      setMessage('Pick a new expiry date for the row first.');
      return;
    }
    void post({ action: 'renew', id, expiresAt: d }, 'Renewed');
  }

  function terminate(id: string) {
    const d = rowDate[id];
    if (!d) {
      setMessage('Pick an end date for the row first.');
      return;
    }
    void post({ action: 'terminate', id, endsAt: d }, 'Terminated');
  }

  function accrue(id: string) {
    void post({ action: 'accrue', id }, 'Accrued');
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
            disabled={busy || !form.employeeId}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
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
                <th className="px-3 py-2">Renew / End date</th>
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
                      <input
                        type="date"
                        value={rowDate[c.id] ?? ''}
                        onChange={(e) => setRowDate((m) => ({ ...m, [c.id]: e.target.value }))}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {c.status === 'ACTIVE' && (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => renew(c.id)}
                          disabled={busy}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs disabled:opacity-50"
                        >
                          Renew
                        </button>
                        <button
                          type="button"
                          onClick={() => accrue(c.id)}
                          disabled={busy}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs disabled:opacity-50"
                        >
                          Accrue
                        </button>
                        <button
                          type="button"
                          onClick={() => terminate(c.id)}
                          disabled={busy}
                          className="rounded-md bg-rose-700 px-2 py-1 text-xs text-white disabled:opacity-50"
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
                  <td colSpan={11} className="px-3 py-6 text-center text-slate-500">
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
