'use client';

import { useEffect, useState } from 'react';

interface Comp {
  id: string;
  siteId: string;
  employeeId: string | null;
  category: string;
  severity: string;
  subject: string;
  description: string | null;
  raisedAt: string;
  assigneeId: string | null;
  slaHours: number;
  status: string;
  resolvedAt: string | null;
  resolutionNotes: string | null;
}

const sevColor: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-rose-100 text-rose-800',
  CRITICAL: 'bg-rose-200 text-rose-900',
};

const statusColor: Record<string, string> = {
  OPEN: 'bg-rose-100 text-rose-800',
  IN_PROGRESS: 'bg-amber-100 text-amber-800',
  RESOLVED: 'bg-emerald-100 text-emerald-800',
};

export default function ComplaintsPage() {
  const [rows, setRows] = useState<Comp[]>([]);
  const [filter, setFilter] = useState('OPEN');
  const [form, setForm] = useState({
    siteId: '',
    employeeId: '',
    category: 'HYGIENE',
    severity: 'MEDIUM',
    subject: '',
    description: '',
    slaHours: '48',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/accommodation-compliance/complaints', window.location.origin);
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
    const r = await fetch('/api/v1/accommodation-compliance/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'raise',
        ...form,
        slaHours: Number(form.slaHours),
        employeeId: form.employeeId || undefined,
        description: form.description || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Raised' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function call(action: string, id: string) {
    const extra: Record<string, unknown> = {};
    if (action === 'assign') extra.assigneeId = window.prompt('Assignee ID?') ?? '';
    if (action === 'resolve') extra.notes = window.prompt('Resolution notes?') ?? '';
    const r = await fetch('/api/v1/accommodation-compliance/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id, ...extra }),
    });
    const p = await r.json();
    setMessage(p.success ? action : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-23 · S15</p>
            <h1 className="text-2xl font-semibold">Accommodation Complaint Register</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-7">
          <label className="text-sm">
            Site ID
            <input
              value={form.siteId}
              onChange={(e) => setForm((f) => ({ ...f, siteId: e.target.value }))}
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
            Category
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {[
                'HYGIENE',
                'MAINTENANCE',
                'OVERCROWDING',
                'KITCHEN',
                'TRANSPORT',
                'SECURITY',
                'NOISE',
                'BEHAVIOUR',
                'OTHER',
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Severity
            <select
              value={form.severity}
              onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-sm md:col-span-2">
            Subject
            <input
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            SLA hrs
            <input
              value={form.slaHours}
              onChange={(e) => setForm((f) => ({ ...f, slaHours: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={raise}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white md:col-span-7"
          >
            Raise Complaint
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Raised</th>
                <th className="px-3 py-2">Site</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2">SLA</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const ageHours = (Date.now() - new Date(c.raisedAt).getTime()) / (3600 * 1000);
                const breached = c.status !== 'RESOLVED' && ageHours > c.slaHours;
                return (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 text-xs">{c.raisedAt?.slice(0, 10)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{c.siteId.slice(0, 8)}</td>
                    <td className="px-3 py-2 text-xs">{c.category}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sevColor[c.severity] ?? ''}`}
                      >
                        {c.severity}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">{c.subject}</td>
                    <td
                      className={`px-3 py-2 text-xs ${breached ? 'font-semibold text-rose-700' : ''}`}
                    >
                      {c.slaHours}h{breached ? ' ⚠' : ''}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[c.status] ?? ''}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {c.status === 'OPEN' && (
                          <button
                            type="button"
                            onClick={() => call('assign', c.id)}
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                          >
                            Assign
                          </button>
                        )}
                        {(c.status === 'OPEN' || c.status === 'IN_PROGRESS') && (
                          <button
                            type="button"
                            onClick={() => call('resolve', c.id)}
                            className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No complaints.
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
