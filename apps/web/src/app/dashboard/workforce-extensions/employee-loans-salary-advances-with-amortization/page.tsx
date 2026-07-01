'use client';

import { useEffect, useState } from 'react';

interface EmployeeLoan {
  id: string;
  employeeId: string;
  loanCode: string;
  loanType: string | null;
  principal: number | string;
  installments: number;
  installmentAmount: number | string;
  balance: number | string;
  status: string;
}

const STATUSES = ['ACTIVE', 'PAID_OFF', 'DEFAULTED', 'WAIVED'];

export default function EmployeeLoansPage() {
  const [rows, setRows] = useState<EmployeeLoan[]>([]);
  const [filter, setFilter] = useState({ status: '', employeeId: '' });
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    employeeId: '',
    loanCode: '',
    loanType: '',
    currency: '',
    principal: '',
    interestRatePct: '',
    installments: '',
    startDate: '',
    notes: '',
  });
  const [payAmount, setPayAmount] = useState<Record<string, string>>({});

  async function load() {
    const url = new URL('/api/v1/workforce-extensions/loans', window.location.origin);
    if (filter.status) url.searchParams.set('status', filter.status);
    if (filter.employeeId) url.searchParams.set('employeeId', filter.employeeId);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows((p.data?.items ?? []) as EmployeeLoan[]);
  }

  useEffect(() => {
    load();
  }, [filter.status, filter.employeeId]);

  async function create() {
    const r = await fetch('/api/v1/workforce-extensions/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        employeeId: form.employeeId,
        loanCode: form.loanCode,
        loanType: form.loanType || undefined,
        currency: form.currency || undefined,
        principal: Number(form.principal),
        interestRatePct: form.interestRatePct ? Number(form.interestRatePct) : undefined,
        installments: Number(form.installments),
        startDate: form.startDate,
        notes: form.notes || undefined,
      }),
    });
    const p = await r.json();
    if (p.success) {
      setMessage(p.message ?? 'Created');
      load();
    } else {
      setMessage(p.error?.message ?? 'Error');
    }
  }

  async function pay(id: string) {
    const amount = Number(payAmount[id] ?? '');
    const r = await fetch('/api/v1/workforce-extensions/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'pay', id, amount }),
    });
    const p = await r.json();
    if (p.success) {
      setMessage(p.message ?? 'Payment recorded');
      load();
    } else {
      setMessage(p.error?.message ?? 'Error');
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">Workforce Extensions · AURA-542</p>
          <h1 className="text-2xl font-semibold">Employee Loans & Salary Advances</h1>
          <p className="mt-1 text-sm text-slate-500">
            installmentAmount is the amortized equal-installment monthly figure.
          </p>
          {message ? <p className="mt-2 text-sm text-slate-700">{message}</p> : null}
        </header>

        <section className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <label className="text-sm">
            Status
            <select
              value={filter.status}
              onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            employeeId
            <input
              value={filter.employeeId}
              onChange={(e) => setFilter((f) => ({ ...f, employeeId: e.target.value }))}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </label>
        </section>

        <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">New Loan</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <input
              placeholder="employeeId"
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="loanCode"
              value={form.loanCode}
              onChange={(e) => setForm((f) => ({ ...f, loanCode: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="loanType"
              value={form.loanType}
              onChange={(e) => setForm((f) => ({ ...f, loanType: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="currency"
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="principal"
              type="number"
              value={form.principal}
              onChange={(e) => setForm((f) => ({ ...f, principal: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="interestRatePct"
              type="number"
              value={form.interestRatePct}
              onChange={(e) => setForm((f) => ({ ...f, interestRatePct: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="installments"
              type="number"
              value={form.installments}
              onChange={(e) => setForm((f) => ({ ...f, installments: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <label className="text-sm">
              startDate
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="ml-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
            <input
              placeholder="notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm md:col-span-2"
            />
          </div>
          <div>
            <button
              type="button"
              onClick={create}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Create Loan
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2">employeeId</th>
                  <th>loanCode</th>
                  <th>loanType</th>
                  <th>principal</th>
                  <th>installments</th>
                  <th>installmentAmount</th>
                  <th>balance</th>
                  <th>status</th>
                  <th>Pay</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-2 font-mono text-xs">{row.employeeId}</td>
                    <td className="font-mono text-xs">{row.loanCode}</td>
                    <td>{row.loanType ?? '—'}</td>
                    <td>{String(row.principal)}</td>
                    <td>{row.installments}</td>
                    <td className="font-semibold">{String(row.installmentAmount)}</td>
                    <td>{String(row.balance)}</td>
                    <td>{row.status}</td>
                    <td className="flex items-center gap-2 py-2">
                      <input
                        placeholder="amount"
                        type="number"
                        value={payAmount[row.id] ?? ''}
                        onChange={(e) => setPayAmount((s) => ({ ...s, [row.id]: e.target.value }))}
                        className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => pay(row.id)}
                        className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white"
                      >
                        Pay
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-3 text-slate-500">
                      No loans yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
