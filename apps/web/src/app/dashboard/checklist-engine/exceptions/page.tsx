'use client';

import { useEffect, useState } from 'react';

interface Exception {
  id: string;
  domain: string;
  registerCode: string;
  title: string;
  description: string;
  severity: string;
  ownerRole: string;
  status: string;
  dueDate: string | null;
}

const sevColor: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-rose-100 text-rose-800',
};

export default function ExceptionsPage() {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState('OPEN');
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/checklist-engine/exceptions', window.location.origin);
    if (domain) url.searchParams.set('domain', domain);
    if (status) url.searchParams.set('status', status);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setExceptions(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [domain, status]);

  async function close(id: string) {
    const r = await fetch('/api/v1/checklist-engine/exceptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'close', exceptionId: id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Closed' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-37 · S06–S08</p>
          <h1 className="text-2xl font-semibold">Compliance Exception Register</h1>
        </header>
        <section className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <label className="text-sm">
            Domain
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value.toUpperCase())}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5"
            >
              <option value="">All</option>
              {['OPEN', 'CLOSED', 'ACCEPTED'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          {message ? <span className="text-sm">{message}</span> : null}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Domain</th>
                <th className="px-3 py-2">Register</th>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Due</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {exceptions.map((e) => (
                <tr key={e.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{e.title}</td>
                  <td className="px-3 py-2">{e.domain}</td>
                  <td className="px-3 py-2 text-xs">{e.registerCode}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sevColor[e.severity] ?? ''}`}
                    >
                      {e.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">{e.ownerRole}</td>
                  <td className="px-3 py-2 text-xs">{e.dueDate?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2">{e.status}</td>
                  <td className="px-3 py-2">
                    {e.status === 'OPEN' ? (
                      <button
                        type="button"
                        onClick={() => close(e.id)}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                      >
                        Close
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
              {exceptions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No exceptions.
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
