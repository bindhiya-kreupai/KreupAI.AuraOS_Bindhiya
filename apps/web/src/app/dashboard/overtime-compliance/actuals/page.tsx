'use client';

import { useEffect, useState } from 'react';

interface Actual {
  id: string;
  employeeId: string;
  country: string;
  otDate: string;
  otType: string;
  actualHours: string;
  multiplier: string | null;
  computedAmount: string | null;
  currency: string;
  fraudScore: number;
  fraudFlags: string[];
  compOffHoursGranted: string;
  payrollPosted: boolean;
}

export default function OtActualsPage() {
  const [rows, setRows] = useState<Actual[]>([]);
  const [fraudOnly, setFraudOnly] = useState(false);
  const [form, setForm] = useState({
    employeeId: '',
    country: 'UAE',
    otDate: new Date().toISOString().slice(0, 10),
    otType: 'WEEKDAY',
    actualHours: '2',
    hourlyRate: '50',
    compOffHoursGranted: '0',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/overtime-compliance/actuals', window.location.origin);
    if (fraudOnly) url.searchParams.set('fraudOnly', 'true');
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [fraudOnly]);

  async function post() {
    setMessage('');
    const r = await fetch('/api/v1/overtime-compliance/actuals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'post',
        ...form,
        actualHours: Number(form.actualHours),
        hourlyRate: Number(form.hourlyRate),
        compOffHoursGranted: Number(form.compOffHoursGranted),
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Posted' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function toPayroll(id: string) {
    const r = await fetch('/api/v1/overtime-compliance/actuals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'post-to-payroll', id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Sent to payroll' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-12 · S05 / S13 / S14 / S16</p>
            <h1 className="text-2xl font-semibold">Actuals, Fraud Flags &amp; Payroll Hand-off</h1>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={fraudOnly}
              onChange={(e) => setFraudOnly(e.target.checked)}
            />
            Fraud only
          </label>
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
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['UAE', 'KSA', 'BAHRAIN', 'QATAR', 'OMAN', 'KUWAIT'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Date
            <input
              type="date"
              value={form.otDate}
              onChange={(e) => setForm((f) => ({ ...f, otDate: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Type
            <select
              value={form.otType}
              onChange={(e) => setForm((f) => ({ ...f, otType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['WEEKDAY', 'NIGHT', 'REST_DAY', 'HOLIDAY', 'RAMADAN'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Hours
            <input
              value={form.actualHours}
              onChange={(e) => setForm((f) => ({ ...f, actualHours: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Hourly Rate
            <input
              value={form.hourlyRate}
              onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Comp-Off Hrs
            <input
              value={form.compOffHoursGranted}
              onChange={(e) => setForm((f) => ({ ...f, compOffHoursGranted: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={post}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Post
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Hours</th>
                <th className="px-3 py-2">×</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Comp-Off</th>
                <th className="px-3 py-2">Risk</th>
                <th className="px-3 py-2">Flags</th>
                <th className="px-3 py-2">Payroll</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{r.employeeId}</td>
                  <td className="px-3 py-2">{r.country}</td>
                  <td className="px-3 py-2 text-xs">{r.otDate?.slice(0, 10)}</td>
                  <td className="px-3 py-2">{r.otType}</td>
                  <td className="px-3 py-2">{r.actualHours}</td>
                  <td className="px-3 py-2">×{r.multiplier ?? '—'}</td>
                  <td className="px-3 py-2">
                    {r.computedAmount} {r.currency}
                  </td>
                  <td className="px-3 py-2">{r.compOffHoursGranted}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        r.fraudScore >= 40
                          ? 'bg-rose-100 text-rose-800'
                          : r.fraudScore > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {r.fraudScore}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">{r.fraudFlags?.join(', ') || '—'}</td>
                  <td className="px-3 py-2">
                    {r.payrollPosted ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                        ✓ posted
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toPayroll(r.id)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      >
                        Send
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-3 py-6 text-center text-slate-500">
                    No actuals.
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
