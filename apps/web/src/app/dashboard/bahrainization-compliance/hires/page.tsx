'use client';

import { useEffect, useState } from 'react';

interface Hire {
  id: string;
  legalEntityId: string | null;
  employeeId: string;
  hireDate: string;
  jobLevel: string | null;
  isBahraini: boolean;
  cprNumber: string | null;
  sioRegistered: boolean;
  wageEvidenceLinked: boolean;
  tamkeenSupported: boolean;
  artificialRiskScore: number;
  artificialRiskFlags: string[];
}

export default function BahHiresPage() {
  const [hires, setHires] = useState<Hire[]>([]);
  const [riskOnly, setRiskOnly] = useState(false);
  const [form, setForm] = useState({
    employeeId: '',
    hireDate: new Date().toISOString().slice(0, 10),
    jobLevel: '',
    cprNumber: '',
    isBahraini: true,
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/bahrainization-compliance/hires', window.location.origin);
    if (riskOnly) url.searchParams.set('artificialRiskOnly', 'true');
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setHires(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [riskOnly]);

  async function record() {
    setMessage('');
    const r = await fetch('/api/v1/bahrainization-compliance/hires', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'record', ...form }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Recorded' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function detect(employeeId: string) {
    const r = await fetch('/api/v1/bahrainization-compliance/hires', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'detect-artificial-risk', employeeId }),
    });
    const p = await r.json();
    setMessage(p.success ? `Score ${p.data.artificialRiskScore}` : p.error?.message);
    load();
  }

  async function link(
    employeeId: string,
    kind: 'sioRegistered' | 'wageEvidenceLinked' | 'tamkeenSupported',
    value: boolean
  ) {
    const r = await fetch('/api/v1/bahrainization-compliance/hires', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'link-evidence', employeeId, [kind]: value }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Updated' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-18 · S05–S11</p>
            <h1 className="text-2xl font-semibold">Bahraini Hires &amp; Artificial-Risk</h1>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={riskOnly}
              onChange={(e) => setRiskOnly(e.target.checked)}
            />
            Artificial-risk only
          </label>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6">
          <label className="text-sm">
            Employee ID
            <input
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Hire Date
            <input
              type="date"
              value={form.hireDate}
              onChange={(e) => setForm((f) => ({ ...f, hireDate: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Job Level
            <input
              value={form.jobLevel}
              onChange={(e) => setForm((f) => ({ ...f, jobLevel: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            CPR Number
            <input
              value={form.cprNumber}
              onChange={(e) => setForm((f) => ({ ...f, cprNumber: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isBahraini}
              onChange={(e) => setForm((f) => ({ ...f, isBahraini: e.target.checked }))}
            />
            Bahraini
          </label>
          <button
            type="button"
            onClick={record}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Record Hire
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Bahraini</th>
                <th className="px-3 py-2">SIO</th>
                <th className="px-3 py-2">Wage Ev.</th>
                <th className="px-3 py-2">Tamkeen</th>
                <th className="px-3 py-2">Risk</th>
                <th className="px-3 py-2">Flags</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hires.map((h) => (
                <tr key={h.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{h.employeeId}</td>
                  <td className="px-3 py-2 text-xs">{h.hireDate?.slice(0, 10)}</td>
                  <td className="px-3 py-2">{h.isBahraini ? '✓' : '—'}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => link(h.employeeId, 'sioRegistered', !h.sioRegistered)}
                      className={`rounded-md border px-2 py-0.5 text-xs ${h.sioRegistered ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300'}`}
                    >
                      {h.sioRegistered ? '✓' : 'link'}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() =>
                        link(h.employeeId, 'wageEvidenceLinked', !h.wageEvidenceLinked)
                      }
                      className={`rounded-md border px-2 py-0.5 text-xs ${h.wageEvidenceLinked ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300'}`}
                    >
                      {h.wageEvidenceLinked ? '✓' : 'link'}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => link(h.employeeId, 'tamkeenSupported', !h.tamkeenSupported)}
                      className={`rounded-md border px-2 py-0.5 text-xs ${h.tamkeenSupported ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300'}`}
                    >
                      {h.tamkeenSupported ? '✓' : '—'}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        h.artificialRiskScore >= 50
                          ? 'bg-rose-100 text-rose-800'
                          : h.artificialRiskScore > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {h.artificialRiskScore}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">{h.artificialRiskFlags?.join(', ') || '—'}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => detect(h.employeeId)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                    >
                      Re-score
                    </button>
                  </td>
                </tr>
              ))}
              {hires.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No hires.
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
