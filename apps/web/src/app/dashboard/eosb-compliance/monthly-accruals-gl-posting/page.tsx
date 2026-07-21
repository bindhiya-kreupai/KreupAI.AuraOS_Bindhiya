'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@/stores/theme-store';
import { EmployeeSearchableSelect } from '@/components/shared/EmployeeSearchableSelect';

interface Accrual {
  id: string;
  employeeId: string;
  period: string;
  countryCode: string;
  basicSalary: string;
  serviceMonths: number;
  accruedGratuity: string;
  monthDelta: string;
  currency: string;
  glPosted: boolean;
  glJournalRef: string | null;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function MonthlyAccrualsGlPostingPage() {
  const { isDark } = useTheme();
  const [rows, setRows] = useState<Accrual[]>([]);
  const [form, setForm] = useState({
    employeeId: '',
    period: periodNow(),
    countryCode: 'AE',
    joiningDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString()
      .slice(0, 10),
    basicSalary: '10000',
  });
  // Inline per-row GL journal ref — no window.prompt().
  const [rowRef, setRowRef] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch('/api/v1/eosb-compliance/accruals');
    const p = await r.json();
    // List API returns a paginated envelope { items, total, ... }.
    if (p.success) setRows(p.data?.items ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function post(body: Record<string, unknown>, okMsg: string) {
    setBusy(true);
    setMessage('');
    try {
      const r = await fetch('/api/v1/eosb-compliance/accruals', {
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

  function snapshot() {
    if (!form.employeeId) {
      setMessage('Employee is required.');
      return;
    }
    void post(
      { action: 'snapshot', ...form, basicSalary: Number(form.basicSalary) },
      'Snapshot taken'
    );
  }

  function markPosted(id: string) {
    const ref = rowRef[id];
    if (!ref) {
      setMessage('Enter a GL journal reference for the row first.');
      return;
    }
    void post({ action: 'mark-gl-posted', id, glJournalRef: ref }, 'GL posted');
  }

  const inputClass =
    'mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <main
      className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50 transition-colors duration-200"
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <p className="text-sm uppercase text-slate-500 dark:text-slate-400">
            EPIC-28 · S11 / S17
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Monthly EOSB Accruals &amp; GL Posting
          </h1>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:grid-cols-6 items-end">
          <label className="text-sm text-slate-700 dark:text-slate-300 flex flex-col gap-1">
            Employee Name
            <EmployeeSearchableSelect
              value={form.employeeId}
              onChange={(val) => setForm((f) => ({ ...f, employeeId: val }))}
              placeholder="Search employee..."
            />
          </label>
          <label className="text-sm text-slate-700 dark:text-slate-300">
            Period
            <input
              value={form.period}
              onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
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
            Basic Salary
            <input
              value={form.basicSalary}
              onChange={(e) => setForm((f) => ({ ...f, basicSalary: e.target.value }))}
              className={inputClass}
            />
          </label>
          <button
            type="button"
            onClick={snapshot}
            disabled={busy}
            className="w-full rounded-md bg-slate-900 dark:bg-slate-750 hover:bg-slate-800 dark:hover:bg-slate-650 px-3 py-2 text-sm text-white disabled:opacity-50 transition-colors h-[38px] mb-[1px]"
          >
            Take Snapshot
          </button>
        </section>
        {message ? <p className="text-sm text-amber-600 dark:text-amber-400">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Service Mo</th>
                <th className="px-3 py-2">Basic</th>
                <th className="px-3 py-2">Accrued</th>
                <th className="px-3 py-2">Δ Month</th>
                <th className="px-3 py-2">GL</th>
                <th className="px-3 py-2">Post to GL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                  <td className="px-3 py-2 text-slate-800 dark:text-slate-200">{a.period}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-700 dark:text-slate-300">
                    {a.employeeId}
                  </td>
                  <td className="px-3 py-2 text-slate-800 dark:text-slate-200">{a.countryCode}</td>
                  <td className="px-3 py-2 text-slate-800 dark:text-slate-200">
                    {a.serviceMonths}
                  </td>
                  <td className="px-3 py-2 text-slate-800 dark:text-slate-200">{a.basicSalary}</td>
                  <td className="px-3 py-2 font-semibold text-slate-900 dark:text-white">
                    {a.accruedGratuity} {a.currency}
                  </td>
                  <td
                    className={`px-3 py-2 font-medium ${Number(a.monthDelta) >= 0 ? 'text-emerald-700 dark:text-emerald-450' : 'text-rose-700 dark:text-rose-400'}`}
                  >
                    {a.monthDelta}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-800 dark:text-slate-200">
                    {a.glPosted ? (
                      <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5">
                        ✓ {a.glJournalRef}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">pending</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {!a.glPosted && (
                      <div className="flex items-center gap-1">
                        <input
                          value={rowRef[a.id] ?? ''}
                          onChange={(e) => setRowRef((m) => ({ ...m, [a.id]: e.target.value }))}
                          placeholder="Journal ref"
                          className="w-28 rounded-md border border-slate-300 dark:border-slate-700 px-2 py-1 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => markPosted(a.id)}
                          disabled={busy}
                          className="rounded-md border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 px-2 py-1 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                          Post
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-6 text-center text-slate-500 dark:text-slate-400"
                  >
                    No accruals.
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
