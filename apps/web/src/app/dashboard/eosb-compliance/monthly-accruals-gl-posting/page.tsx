'use client';

import { useCallback, useEffect, useState } from 'react';

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

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-28 · S11 / S17</p>
          <h1 className="text-2xl font-semibold">Monthly EOSB Accruals &amp; GL Posting</h1>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6">
          <label className="text-sm">
            Employee
            <input
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Period
            <input
              value={form.period}
              onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
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
            Basic Salary
            <input
              value={form.basicSalary}
              onChange={(e) => setForm((f) => ({ ...f, basicSalary: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={snapshot}
            disabled={busy}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Take Snapshot
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
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
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{a.period}</td>
                  <td className="px-3 py-2 font-mono text-xs">{a.employeeId}</td>
                  <td className="px-3 py-2">{a.countryCode}</td>
                  <td className="px-3 py-2">{a.serviceMonths}</td>
                  <td className="px-3 py-2">{a.basicSalary}</td>
                  <td className="px-3 py-2 font-semibold">
                    {a.accruedGratuity} {a.currency}
                  </td>
                  <td
                    className={`px-3 py-2 ${Number(a.monthDelta) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
                  >
                    {a.monthDelta}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {a.glPosted ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">
                        ✓ {a.glJournalRef}
                      </span>
                    ) : (
                      'pending'
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {!a.glPosted && (
                      <div className="flex items-center gap-1">
                        <input
                          value={rowRef[a.id] ?? ''}
                          onChange={(e) => setRowRef((m) => ({ ...m, [a.id]: e.target.value }))}
                          placeholder="Journal ref"
                          className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => markPosted(a.id)}
                          disabled={busy}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs disabled:opacity-50"
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
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
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
