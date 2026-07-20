'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@/stores/theme-store';

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
  DRAFT: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400',
  APPROVED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400',
  SETTLED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400',
};

const yearsAgo = (n: number) =>
  new Date(new Date().setFullYear(new Date().getFullYear() - n)).toISOString().slice(0, 10);

export default function FinalizedCalculationsPage() {
  const { isDark } = useTheme();
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

  const inputClass =
    'mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <main
      className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50 transition-colors duration-200"
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500 dark:text-slate-400">
              EPIC-28 · S03 / S06 / S07 / S08 / S12
            </p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Finalized EOSB Calculations (DRAFT → APPROVED → SETTLED)
            </h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="" className="bg-white dark:bg-slate-850">
              All
            </option>
            <option value="DRAFT" className="bg-white dark:bg-slate-850">
              DRAFT
            </option>
            <option value="APPROVED" className="bg-white dark:bg-slate-850">
              APPROVED
            </option>
            <option value="SETTLED" className="bg-white dark:bg-slate-850">
              SETTLED
            </option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:grid-cols-8 items-end">
          <label className="text-sm text-slate-700 dark:text-slate-300">
            Employee
            <input
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="text-sm text-slate-700 dark:text-slate-300">
            Country
            <select
              value={form.countryCode}
              onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value }))}
              className={inputClass}
            >
              {['AE', 'SA', 'BH', 'QA', 'OM', 'KW', 'IN'].map((c) => (
                <option key={c} className="bg-white dark:bg-slate-800">
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-700 dark:text-slate-300">
            Joining
            <input
              type="date"
              value={form.joiningDate}
              onChange={(e) => setForm((f) => ({ ...f, joiningDate: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="text-sm text-slate-700 dark:text-slate-300">
            Last Day
            <input
              type="date"
              value={form.lastWorkingDate}
              onChange={(e) => setForm((f) => ({ ...f, lastWorkingDate: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="text-sm text-slate-700 dark:text-slate-300">
            Basic
            <input
              value={form.basicSalary}
              onChange={(e) => setForm((f) => ({ ...f, basicSalary: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="text-sm text-slate-700 dark:text-slate-300">
            Type
            <select
              value={form.terminationType}
              onChange={(e) => setForm((f) => ({ ...f, terminationType: e.target.value }))}
              className={inputClass}
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
                <option key={t} className="bg-white dark:bg-slate-800">
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-700 dark:text-slate-300">
            SI Offset
            <input
              value={form.socialInsuranceOffset}
              onChange={(e) => setForm((f) => ({ ...f, socialInsuranceOffset: e.target.value }))}
              className={inputClass}
            />
          </label>
          <button
            type="button"
            onClick={finalize}
            disabled={busy}
            className="w-full rounded-md bg-slate-900 dark:bg-slate-750 hover:bg-slate-800 dark:hover:bg-slate-650 px-3 py-2 text-sm text-white disabled:opacity-50 transition-colors h-[38px] mb-[1px]"
          >
            Finalize
          </button>
        </section>
        {message ? <p className="text-sm text-amber-600 dark:text-amber-400">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                  <td className="px-3 py-2 font-mono text-xs text-slate-700 dark:text-slate-300">
                    {r.employeeId}
                  </td>
                  <td className="px-3 py-2 text-slate-800 dark:text-slate-200">{r.countryCode}</td>
                  <td className="px-3 py-2 text-xs text-slate-700 dark:text-slate-300">
                    {r.terminationType}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-700 dark:text-slate-300">
                    {r.lastWorkingDate?.slice(0, 10)}
                  </td>
                  <td className="px-3 py-2 text-slate-800 dark:text-slate-200">
                    {r.totalServiceYears}
                  </td>
                  <td className="px-3 py-2 text-slate-800 dark:text-slate-200">
                    {r.gratuityAmount} {r.currency}
                  </td>
                  <td className="px-3 py-2 text-slate-800 dark:text-slate-200">
                    {r.socialInsuranceOffset}
                  </td>
                  <td className="px-3 py-2 font-semibold text-emerald-700 dark:text-emerald-450">
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
                          className="rounded-md bg-indigo-700 dark:bg-indigo-650 hover:bg-indigo-800 dark:hover:bg-indigo-550 px-2 py-1 text-xs text-white disabled:opacity-50 transition-colors"
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
                            className="w-28 rounded-md border border-slate-300 dark:border-slate-700 px-2 py-1 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                          />
                          <button
                            type="button"
                            onClick={() => settle(r.id)}
                            disabled={busy}
                            className="rounded-md bg-emerald-700 dark:bg-emerald-650 hover:bg-emerald-800 dark:hover:bg-emerald-550 px-2 py-1 text-xs text-white disabled:opacity-50 transition-colors"
                          >
                            Settle
                          </button>
                        </>
                      )}
                      {r.paymentReference && (
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {r.paymentReference}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-3 py-6 text-center text-slate-500 dark:text-slate-400"
                  >
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
