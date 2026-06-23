'use client';

import { useEffect, useState } from 'react';

interface Consent {
  id: string;
  employeeId: string;
  consentType: string;
  grantedAt: string | null;
  revokedAt: string | null;
  evidenceUrl: string | null;
}

export default function ConsentsPage() {
  const [rows, setRows] = useState<Consent[]>([]);
  const [form, setForm] = useState({
    employeeId: '',
    consentType: 'BIOMETRIC',
    evidenceUrl: '',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/attendance-compliance/consents');
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function call(action: string) {
    setMessage('');
    const r = await fetch('/api/v1/attendance-compliance/consents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...form, evidenceUrl: form.evidenceUrl || undefined }),
    });
    const p = await r.json();
    setMessage(p.success ? action : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-19 · S17</p>
          <h1 className="text-2xl font-semibold">
            Biometric / Geolocation / Photo Consent Register
          </h1>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-5">
          <label className="text-sm">
            Employee
            <input
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Type
            <select
              value={form.consentType}
              onChange={(e) => setForm((f) => ({ ...f, consentType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['BIOMETRIC', 'GEOLOCATION', 'PHOTO_VERIFICATION'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="text-sm md:col-span-2">
            Evidence URL
            <input
              value={form.evidenceUrl}
              onChange={(e) => setForm((f) => ({ ...f, evidenceUrl: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => call('grant')}
              className="rounded-md bg-emerald-700 px-3 py-2 text-sm text-white"
            >
              Grant
            </button>
            <button
              type="button"
              onClick={() => call('revoke')}
              className="rounded-md bg-rose-700 px-3 py-2 text-sm text-white"
            >
              Revoke
            </button>
          </div>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Granted</th>
                <th className="px-3 py-2">Revoked</th>
                <th className="px-3 py-2">Evidence</th>
                <th className="px-3 py-2">State</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const active = c.grantedAt && !c.revokedAt;
                return (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">{c.employeeId}</td>
                    <td className="px-3 py-2">{c.consentType}</td>
                    <td className="px-3 py-2 text-xs">{c.grantedAt?.slice(0, 10) ?? '—'}</td>
                    <td className="px-3 py-2 text-xs">{c.revokedAt?.slice(0, 10) ?? '—'}</td>
                    <td className="px-3 py-2 text-xs">
                      {c.evidenceUrl ? (
                        <a
                          href={c.evidenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-700 hover:underline"
                        >
                          open
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}
                      >
                        {active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    No consents.
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
