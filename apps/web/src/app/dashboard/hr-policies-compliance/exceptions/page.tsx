'use client';

import { useEffect, useState } from 'react';

interface Ex {
  id: string;
  policyId: string;
  employeeId: string | null;
  scopeLabel: string | null;
  reason: string;
  status: string;
  raisedAt: string;
  expiresAt: string | null;
}

const statusColor: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-slate-100 text-slate-700',
  CLOSED: 'bg-slate-100 text-slate-700',
};

export default function ExceptionsPage() {
  const [rows, setRows] = useState<Ex[]>([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({
    policyId: '',
    employeeId: '',
    scopeLabel: '',
    reason: '',
    expiresAt: '',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/hr-policies-compliance/exceptions', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function raise() {
    setMessage('');
    const r = await fetch('/api/v1/hr-policies-compliance/exceptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'raise',
        ...form,
        employeeId: form.employeeId || undefined,
        scopeLabel: form.scopeLabel || undefined,
        expiresAt: form.expiresAt || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Raised' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }
  async function action(id: string, name: string) {
    const r = await fetch('/api/v1/hr-policies-compliance/exceptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: name, id }),
    });
    const p = await r.json();
    setMessage(p.success ? name : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-32 · S10</p>
            <h1 className="text-2xl font-semibold">Policy Exception Register</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6">
          <label className="text-sm">
            Policy ID
            <input
              value={form.policyId}
              onChange={(e) => setForm((f) => ({ ...f, policyId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Employee
            <input
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Scope
            <input
              value={form.scopeLabel}
              onChange={(e) => setForm((f) => ({ ...f, scopeLabel: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm md:col-span-2">
            Reason
            <input
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={raise}
            className="self-end rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Raise
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Raised</th>
                <th className="px-3 py-2">Policy</th>
                <th className="px-3 py-2">Scope / Employee</th>
                <th className="px-3 py-2">Reason</th>
                <th className="px-3 py-2">Expires</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 text-xs">{r.raisedAt?.slice(0, 10)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.policyId.slice(0, 8)}</td>
                  <td className="px-3 py-2 text-xs">{r.employeeId ?? r.scopeLabel ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{r.reason}</td>
                  <td className="px-3 py-2 text-xs">{r.expiresAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[r.status] ?? ''}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {r.status === 'PENDING' && (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => action(r.id, 'approve')}
                          className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => action(r.id, 'reject')}
                          className="rounded-md bg-rose-700 px-2 py-1 text-xs text-white"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {r.status === 'APPROVED' && (
                      <button
                        type="button"
                        onClick={() => action(r.id, 'close')}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      >
                        Close
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
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
