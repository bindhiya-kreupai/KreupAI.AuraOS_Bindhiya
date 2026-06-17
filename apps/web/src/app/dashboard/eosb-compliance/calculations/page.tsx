'use client';

import { useEffect, useState } from 'react';

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

export default function EosbCalcsPage() {
  const [rows, setRows] = useState<Calc[]>([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({
    employeeId: '',
    countryCode: 'AE',
    joiningDate: new Date(new Date().setFullYear(new Date().getFullYear() - 2))
      .toISOString()
      .slice(0, 10),
    lastWorkingDate: new Date().toISOString().slice(0, 10),
    basicSalary: '10000',
    terminationType: 'RESIGNATION',
    unpaidLeaveDays: '0',
    socialInsuranceOffset: '0',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/eosb-compliance/calculations', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function finalize() {
    setMessage('');
    const r = await fetch('/api/v1/eosb-compliance/calculations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'finalize',
        ...form,
        basicSalary: Number(form.basicSalary),
        unpaidLeaveDays: Number(form.unpaidLeaveDays),
        socialInsuranceOffset: Number(form.socialInsuranceOffset),
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Finalized' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function approve(id: string) {
    const r = await fetch('/api/v1/eosb-compliance/calculations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Approved' : p.error?.message);
    load();
  }
  async function settle(id: string) {
    const ref = window.prompt('Payment reference?') ?? '';
    if (!ref) return;
    const r = await fetch('/api/v1/eosb-compliance/calculations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'settle', id, paymentReference: ref }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Settled' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">
              EPIC-28 · S03 / S06 / S07 / S08 / S12
            </p>
            <h1 className="text-2xl font-semibold">Finalized EOSB Calculations</h1>
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
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
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
                    <div className="flex gap-1">
                      {r.status === 'DRAFT' && (
                        <button
                          type="button"
                          onClick={() => approve(r.id)}
                          className="rounded-md bg-indigo-700 px-2 py-1 text-xs text-white"
                        >
                          Approve
                        </button>
                      )}
                      {r.status === 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => settle(r.id)}
                          className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                        >
                          Settle
                        </button>
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
