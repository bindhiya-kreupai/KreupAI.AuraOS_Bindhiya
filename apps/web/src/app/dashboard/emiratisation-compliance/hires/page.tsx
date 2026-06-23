'use client';

import { useEffect, useState } from 'react';

interface Hire {
  id: string;
  legalEntityId: string | null;
  employeeId: string;
  hireDate: string;
  jobLevel: string | null;
  isSkilled: boolean;
  nafisReference: string | null;
  gpssaRegistered: boolean;
  wpsCovered: boolean;
  fakeRiskScore: number;
  fakeRiskFlags: string[];
}

export default function EmHiresPage() {
  const [hires, setHires] = useState<Hire[]>([]);
  const [fakeRiskOnly, setFakeRiskOnly] = useState(false);
  const [form, setForm] = useState({
    employeeId: '',
    hireDate: new Date().toISOString().slice(0, 10),
    jobLevel: '',
    isSkilled: true,
    nafisReference: '',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/emiratisation-compliance/hires', window.location.origin);
    if (fakeRiskOnly) url.searchParams.set('fakeRiskOnly', 'true');
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setHires(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [fakeRiskOnly]);

  async function record() {
    setMessage('');
    const r = await fetch('/api/v1/emiratisation-compliance/hires', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'record', ...form }),
    });
    const p = await r.json();
    setMessage(
      p.success ? 'Hire recorded' : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    load();
  }

  async function detectFake(employeeId: string) {
    const r = await fetch('/api/v1/emiratisation-compliance/hires', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'detect-fake-risk', employeeId }),
    });
    const p = await r.json();
    setMessage(p.success ? `Score ${p.data.fakeRiskScore}` : p.error?.message);
    load();
  }

  async function linkEvidence(
    employeeId: string,
    kind: 'gpssaRegistered' | 'wpsCovered',
    value: boolean
  ) {
    const r = await fetch('/api/v1/emiratisation-compliance/hires', {
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
            <p className="text-sm uppercase text-slate-500">EPIC-16 · S06 / S07 / S10 / S11</p>
            <h1 className="text-2xl font-semibold">UAE National Hires & Fake-Risk</h1>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={fakeRiskOnly}
              onChange={(e) => setFakeRiskOnly(e.target.checked)}
            />
            Fake-risk only
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
            NAFIS Ref
            <input
              value={form.nafisReference}
              onChange={(e) => setForm((f) => ({ ...f, nafisReference: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isSkilled}
              onChange={(e) => setForm((f) => ({ ...f, isSkilled: e.target.checked }))}
            />
            Skilled
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
                <th className="px-3 py-2">Skilled</th>
                <th className="px-3 py-2">GPSSA</th>
                <th className="px-3 py-2">WPS</th>
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
                  <td className="px-3 py-2">{h.isSkilled ? '✓' : '—'}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() =>
                        linkEvidence(h.employeeId, 'gpssaRegistered', !h.gpssaRegistered)
                      }
                      className={`rounded-md border px-2 py-0.5 text-xs ${h.gpssaRegistered ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300'}`}
                    >
                      {h.gpssaRegistered ? '✓ linked' : 'link'}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => linkEvidence(h.employeeId, 'wpsCovered', !h.wpsCovered)}
                      className={`rounded-md border px-2 py-0.5 text-xs ${h.wpsCovered ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300'}`}
                    >
                      {h.wpsCovered ? '✓ linked' : 'link'}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        h.fakeRiskScore >= 50
                          ? 'bg-rose-100 text-rose-800'
                          : h.fakeRiskScore > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {h.fakeRiskScore}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">{h.fakeRiskFlags?.join(', ') || '—'}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => detectFake(h.employeeId)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                    >
                      Re-score
                    </button>
                  </td>
                </tr>
              ))}
              {hires.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
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
