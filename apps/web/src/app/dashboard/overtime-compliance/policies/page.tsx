'use client';

import { useEffect, useState } from 'react';

interface Policy {
  id: string;
  country: string;
  grade: string | null;
  isEligible: boolean;
  standardDailyHours: string;
  standardWeeklyHours: string;
  maxDailyOtHours: string;
  maxMonthlyOtHours: string;
  requiresPreApproval: boolean;
  allowsCompOff: boolean;
  ramadanDailyHours: string;
  effectiveFrom: string;
}

export default function OtPoliciesPage() {
  const [rows, setRows] = useState<Policy[]>([]);
  const [form, setForm] = useState({
    country: 'UAE',
    grade: '',
    isEligible: true,
    standardDailyHours: '8',
    standardWeeklyHours: '48',
    maxDailyOtHours: '2',
    maxMonthlyOtHours: '40',
    ramadanDailyHours: '6',
    requiresPreApproval: true,
    allowsCompOff: true,
    effectiveFrom: new Date().toISOString().slice(0, 10),
  });
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/overtime-compliance/policies');
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    setMessage('');
    const r = await fetch('/api/v1/overtime-compliance/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        country: form.country,
        grade: form.grade || undefined,
        isEligible: form.isEligible,
        standardDailyHours: Number(form.standardDailyHours),
        standardWeeklyHours: Number(form.standardWeeklyHours),
        maxDailyOtHours: Number(form.maxDailyOtHours),
        maxMonthlyOtHours: Number(form.maxMonthlyOtHours),
        ramadanDailyHours: Number(form.ramadanDailyHours),
        requiresPreApproval: form.requiresPreApproval,
        allowsCompOff: form.allowsCompOff,
        effectiveFrom: form.effectiveFrom,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-12 · S01 / S02 / S06 / S07</p>
          <h1 className="text-2xl font-semibold">OT Policies (per country × grade)</h1>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6">
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
            Grade (optional)
            <input
              value={form.grade}
              onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Std Daily Hours
            <input
              value={form.standardDailyHours}
              onChange={(e) => setForm((f) => ({ ...f, standardDailyHours: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Std Weekly Hours
            <input
              value={form.standardWeeklyHours}
              onChange={(e) => setForm((f) => ({ ...f, standardWeeklyHours: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Max Daily OT
            <input
              value={form.maxDailyOtHours}
              onChange={(e) => setForm((f) => ({ ...f, maxDailyOtHours: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Max Monthly OT
            <input
              value={form.maxMonthlyOtHours}
              onChange={(e) => setForm((f) => ({ ...f, maxMonthlyOtHours: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Ramadan Daily
            <input
              value={form.ramadanDailyHours}
              onChange={(e) => setForm((f) => ({ ...f, ramadanDailyHours: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Effective From
            <input
              type="date"
              value={form.effectiveFrom}
              onChange={(e) => setForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isEligible}
              onChange={(e) => setForm((f) => ({ ...f, isEligible: e.target.checked }))}
            />
            Eligible
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.requiresPreApproval}
              onChange={(e) => setForm((f) => ({ ...f, requiresPreApproval: e.target.checked }))}
            />
            Pre-Approval
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.allowsCompOff}
              onChange={(e) => setForm((f) => ({ ...f, allowsCompOff: e.target.checked }))}
            />
            Comp-Off
          </label>
          <button
            type="button"
            onClick={save}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Save Policy
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Grade</th>
                <th className="px-3 py-2">Eligible</th>
                <th className="px-3 py-2">Std Daily</th>
                <th className="px-3 py-2">Std Weekly</th>
                <th className="px-3 py-2">Max OT Daily</th>
                <th className="px-3 py-2">Max OT Monthly</th>
                <th className="px-3 py-2">Ramadan</th>
                <th className="px-3 py-2">Pre-Approval</th>
                <th className="px-3 py-2">Comp-Off</th>
                <th className="px-3 py-2">From</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{r.country}</td>
                  <td className="px-3 py-2">{r.grade ?? '*'}</td>
                  <td className="px-3 py-2">{r.isEligible ? '✓' : '—'}</td>
                  <td className="px-3 py-2">{r.standardDailyHours}</td>
                  <td className="px-3 py-2">{r.standardWeeklyHours}</td>
                  <td className="px-3 py-2">{r.maxDailyOtHours}</td>
                  <td className="px-3 py-2">{r.maxMonthlyOtHours}</td>
                  <td className="px-3 py-2">{r.ramadanDailyHours}</td>
                  <td className="px-3 py-2">{r.requiresPreApproval ? '✓' : '—'}</td>
                  <td className="px-3 py-2">{r.allowsCompOff ? '✓' : '—'}</td>
                  <td className="px-3 py-2 text-xs">{r.effectiveFrom?.slice(0, 10)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-3 py-6 text-center text-slate-500">
                    No policies.
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
