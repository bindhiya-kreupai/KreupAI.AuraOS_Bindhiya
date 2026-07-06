'use client';

import { useCallback, useEffect, useState } from 'react';

interface Calc {
  id: string;
  employeeId: string;
  countryCode: string;
  joiningDate: string;
  lastWorkingDate: string;
  terminationType: string;
  basicSalary: string;
  totalServiceYears: string;
  totalServiceMonths: number;
  dailyRate: string;
  gratuityAmount: string;
  socialInsuranceOffset: string;
  netPayable: string;
  currency: string;
  law: string | null;
  status: string;
  paymentReference: string | null;
}

const statusColor: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-indigo-100 text-indigo-800',
  SETTLED: 'bg-emerald-100 text-emerald-800',
};

const yearsAgo = (n: number) =>
  new Date(new Date().setFullYear(new Date().getFullYear() - n)).toISOString().slice(0, 10);

export default function FinalizedCalculationsPage() {
  const [rows, setRows] = useState<Calc[]>([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({
    employeeId: '',
    countryCode: 'AE',
    joiningDate: yearsAgo(2),
    lastWorkingDate: new Date().toISOString().slice(0, 10),
    basicSalary: '10000',
    terminationType: 'RESIGNATION',
    unpaidLeaveDays: '0',
    socialInsuranceOffset: '0',
  });
  // Inline per-row payment reference — no window.prompt().
  const [rowRef, setRowRef] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const url = new URL('/api/v1/eosb-compliance/calculations', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
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
      const r = await fetch('/api/v1/eosb-compliance/calculations', {
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

  function finalize() {
    if (!form.employeeId) {
      setMessage('Employee is required.');
      return;
    }
    void post(
      {
        action: 'finalize',
        ...form,
        basicSalary: Number(form.basicSalary),
        unpaidLeaveDays: Number(form.unpaidLeaveDays),
        socialInsuranceOffset: Number(form.socialInsuranceOffset),
      },
      'Finalized'
    );
  }

  function approve(id: string) {
    void post({ action: 'approve', id }, 'Approved');
  }

  function settle(id: string) {
    const ref = rowRef[id];
    if (!ref) {
      setMessage('Enter a payment reference for the row first.');
      return;
    }
    void post({ action: 'settle', id, paymentReference: ref }, 'Settled');
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">
              EPIC-28 · S03 / S06 / S07 / S08 / S12
            </p>
            <h1 className="text-2xl font-semibold">
              Finalized EOSB Calculations (DRAFT → APPROVED → SETTLED)
            </h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="DRAFT">DRAFT</option>
            <option value="APPROVED">APPROVED</option>
            <option value="SETTLED">SETTLED</option>
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
            Country
            <select
              value={form.countryCode}
              onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['AE', 'SA', 'BH', 'QA', 'OM', 'KW', 'IN'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Joining
            <input
              type="date"
              value={form.joiningDate}
              onChange={(e) => setForm((f) => ({ ...f, joiningDate: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Last Day
            <input
              type="date"
              value={form.lastWorkingDate}
              onChange={(e) => setForm((f) => ({ ...f, lastWorkingDate: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Basic
            <input
              value={form.basicSalary}
              onChange={(e) => setForm((f) => ({ ...f, basicSalary: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Type
            <select
              value={form.terminationType}
              onChange={(e) => setForm((f) => ({ ...f, terminationType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {[
                'RESIGNATION',
                'TERMINATION',
                'TERMINATION_WITHOUT_CAUSE',
                'END_OF_CONTRACT',
                'RETIREMENT',
                'DEATH',
                'DISABILITY',
                'MUTUAL_AGREEMENT',
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            SI Offset
            <input
              value={form.socialInsuranceOffset}
              onChange={(e) => setForm((f) => ({ ...f, socialInsuranceOffset: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={finalize}
            disabled={busy}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Finalize
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Last Day</th>
                <th className="px-3 py-2">Years</th>
                <th className="px-3 py-2">Gratuity</th>
                <th className="px-3 py-2">Offset</th>
                <th className="px-3 py-2">Net Payable</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{r.employeeId}</td>
                  <td className="px-3 py-2">{r.countryCode}</td>
                  <td className="px-3 py-2 text-xs">{r.terminationType}</td>
                  <td className="px-3 py-2 text-xs">{r.lastWorkingDate?.slice(0, 10)}</td>
                  <td className="px-3 py-2">{r.totalServiceYears}</td>
                  <td className="px-3 py-2">
                    {r.gratuityAmount} {r.currency}
                  </td>
                  <td className="px-3 py-2">{r.socialInsuranceOffset}</td>
                  <td className="px-3 py-2 font-semibold text-emerald-700">
                    {r.netPayable} {r.currency}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[r.status] ?? ''}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      {r.status === 'DRAFT' && (
                        <button
                          type="button"
                          onClick={() => approve(r.id)}
                          disabled={busy}
                          className="rounded-md bg-indigo-700 px-2 py-1 text-xs text-white disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {r.status === 'APPROVED' && (
                        <>
                          <input
                            value={rowRef[r.id] ?? ''}
                            onChange={(e) => setRowRef((m) => ({ ...m, [r.id]: e.target.value }))}
                            placeholder="Payment ref"
                            className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => settle(r.id)}
                            disabled={busy}
                            className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white disabled:opacity-50"
                          >
                            Settle
                          </button>
                        </>
                      )}
                      {r.paymentReference && (
                        <span className="font-mono text-xs text-slate-500">
                          {r.paymentReference}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-slate-500">
                    No calculations.
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
