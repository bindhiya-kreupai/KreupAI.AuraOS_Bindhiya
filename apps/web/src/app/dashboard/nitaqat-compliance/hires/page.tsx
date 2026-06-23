'use client';

import { useEffect, useState } from 'react';

interface Hire {
  id: string;
  legalEntityId: string | null;
  employeeId: string;
  hireDate: string;
  jobLevel: string | null;
  gosiRegistered: boolean;
  mudadCovered: boolean;
  isSaudi: boolean;
}

export default function NitaqatHiresPage() {
  const [hires, setHires] = useState<Hire[]>([]);
  const [form, setForm] = useState({
    legalEntityId: '',
    employeeId: '',
    hireDate: new Date().toISOString().slice(0, 10),
    jobLevel: '',
    isSaudi: true,
  });
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/nitaqat-compliance/hires');
    const p = await r.json();
    if (p.success) setHires(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function record() {
    setMessage('');
    const r = await fetch('/api/v1/nitaqat-compliance/hires', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'record',
        legalEntityId: form.legalEntityId || undefined,
        employeeId: form.employeeId,
        hireDate: form.hireDate,
        jobLevel: form.jobLevel || undefined,
        isSaudi: form.isSaudi,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Recorded' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function linkEvidence(
    employeeId: string,
    kind: 'gosiRegistered' | 'mudadCovered',
    value: boolean
  ) {
    const r = await fetch('/api/v1/nitaqat-compliance/hires', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'link-evidence', employeeId, [kind]: value }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Updated' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-17 · S07 / S08</p>
          <h1 className="text-2xl font-semibold">Saudi Hires &amp; Evidence (GOSI / Mudad)</h1>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6">
          <label className="text-sm">
            Legal Entity
            <input
              value={form.legalEntityId}
              onChange={(e) => setForm((f) => ({ ...f, legalEntityId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
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
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isSaudi}
              onChange={(e) => setForm((f) => ({ ...f, isSaudi: e.target.checked }))}
            />
            Saudi National
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
                <th className="px-3 py-2">Hire Date</th>
                <th className="px-3 py-2">Saudi</th>
                <th className="px-3 py-2">GOSI</th>
                <th className="px-3 py-2">Mudad / WPS</th>
              </tr>
            </thead>
            <tbody>
              {hires.map((h) => (
                <tr key={h.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{h.employeeId}</td>
                  <td className="px-3 py-2 text-xs">{h.hireDate?.slice(0, 10)}</td>
                  <td className="px-3 py-2">{h.isSaudi ? '✓' : '—'}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() =>
                        linkEvidence(h.employeeId, 'gosiRegistered', !h.gosiRegistered)
                      }
                      className={`rounded-md border px-2 py-0.5 text-xs ${h.gosiRegistered ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300'}`}
                    >
                      {h.gosiRegistered ? '✓ linked' : 'link'}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => linkEvidence(h.employeeId, 'mudadCovered', !h.mudadCovered)}
                      className={`rounded-md border px-2 py-0.5 text-xs ${h.mudadCovered ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300'}`}
                    >
                      {h.mudadCovered ? '✓ linked' : 'link'}
                    </button>
                  </td>
                </tr>
              ))}
              {hires.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
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
