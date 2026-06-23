'use client';

import { useEffect, useState } from 'react';

interface Value {
  id: string;
  kpiCode: string;
  countryCode: string | null;
  period: string;
  value: string;
  ragStatus: string | null;
  statutoryBreach: boolean;
}

const ragColor: Record<string, string> = {
  GREEN: 'bg-emerald-100 text-emerald-800',
  AMBER: 'bg-amber-100 text-amber-800',
  RED: 'bg-rose-100 text-rose-800',
};

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function ScorecardValuesPage() {
  const [values, setValues] = useState<Value[]>([]);
  const [period, setPeriod] = useState(periodNow());
  const [kpiCode, setKpiCode] = useState('PAYROLL_ON_TIME');
  const [value, setValue] = useState('99.5');
  const [countryCode, setCountryCode] = useState('AE');
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch(`/api/v1/kpi-scorecard/values?period=${period}`);
    const p = await r.json();
    if (p.success) setValues(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [period]);

  async function recordValue() {
    setMessage('');
    const r = await fetch('/api/v1/kpi-scorecard/values', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kpiCode,
        period,
        value: Number(value),
        countryCode,
        rowCount: 10,
      }),
    });
    const p = await r.json();
    setMessage(
      p.success ? `Recorded ${kpiCode}` : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-38 · S07</p>
          <h1 className="text-2xl font-semibold">KPI Values</h1>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-5">
          <label className="text-sm">
            Period
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            KPI Code
            <input
              value={kpiCode}
              onChange={(e) => setKpiCode(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Value
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Country
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['AE', 'SA', 'BH', 'QA', 'OM', 'KW'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={recordValue}
            className="self-end rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Record value
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">KPI</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Value</th>
                <th className="px-3 py-2">RAG</th>
                <th className="px-3 py-2">Breach</th>
                <th className="px-3 py-2">Period</th>
              </tr>
            </thead>
            <tbody>
              {values.map((v) => (
                <tr key={v.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{v.kpiCode}</td>
                  <td className="px-3 py-2">{v.countryCode ?? '—'}</td>
                  <td className="px-3 py-2">{v.value}</td>
                  <td className="px-3 py-2">
                    {v.ragStatus ? (
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${ragColor[v.ragStatus] ?? ''}`}
                      >
                        {v.ragStatus}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {v.statutoryBreach ? <span className="text-rose-700">Yes</span> : '—'}
                  </td>
                  <td className="px-3 py-2">{v.period}</td>
                </tr>
              ))}
              {values.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    No values for {period}.
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
