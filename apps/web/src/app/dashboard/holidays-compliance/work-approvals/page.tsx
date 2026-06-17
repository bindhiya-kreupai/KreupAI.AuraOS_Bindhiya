'use client';

import { useEffect, useState } from 'react';

interface Req {
  id: string;
  employeeId: string;
  holidayDate: string;
  holidayLabel: string | null;
  holidayClass: string;
  country: string;
  plannedHours: string;
  reason: string | null;
  status: string;
  requestedAt: string;
  approvedAt: string | null;
  rejectionReason: string | null;
}

const statusColor: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-800',
};

export default function WorkApprovalsPage() {
  const [rows, setRows] = useState<Req[]>([]);
  const [filter, setFilter] = useState('PENDING');
  const [form, setForm] = useState({
    employeeId: '',
    holidayDate: new Date().toISOString().slice(0, 10),
    holidayLabel: '',
    holidayClass: 'NATIONAL',
    country: 'UAE',
    plannedHours: '8',
    reason: '',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/holidays-compliance/work-approvals', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function request() {
    setMessage('');
    const r = await fetch('/api/v1/holidays-compliance/work-approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'request',
        ...form,
        plannedHours: Number(form.plannedHours),
        holidayLabel: form.holidayLabel || undefined,
        reason: form.reason || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Requested' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function approve(id: string) {
    const r = await fetch('/api/v1/holidays-compliance/work-approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Approved (comp-off auto-accrued)' : p.error?.message);
    load();
  }

  async function reject(id: string) {
    const reason = window.prompt('Rejection reason?') ?? '';
    if (!reason) return;
    const r = await fetch('/api/v1/holidays-compliance/work-approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', id, reason }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Rejected' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-21 · S05 / S17</p>
            <h1 className="text-2xl font-semibold">Holiday Work Approvals</h1>
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
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-7">
          <label className="text-sm">
            Employee
            <input
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Date
            <input
              type="date"
              value={form.holidayDate}
              onChange={(e) => setForm((f) => ({ ...f, holidayDate: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Label
            <input
              value={form.holidayLabel}
              onChange={(e) => setForm((f) => ({ ...f, holidayLabel: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Class
            <select
              value={form.holidayClass}
              onChange={(e) => setForm((f) => ({ ...f, holidayClass: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {[
                'NATIONAL',
                'RELIGIOUS',
                'EID_AL_FITR',
                'EID_AL_ADHA',
                'ISLAMIC_NEW_YEAR',
                'RAMADAN_OBSERVANCE',
                'SPECIAL',
                'SECTOR',
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
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
            Hours
            <input
              value={form.plannedHours}
              onChange={(e) => setForm((f) => ({ ...f, plannedHours: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={request}
            className="self-end rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Request
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">Class</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Hours</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{r.employeeId}</td>
                  <td className="px-3 py-2 text-xs">{r.holidayDate?.slice(0, 10)}</td>
                  <td className="px-3 py-2 text-xs">{r.holidayLabel ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{r.holidayClass}</td>
                  <td className="px-3 py-2">{r.country}</td>
                  <td className="px-3 py-2">{r.plannedHours}</td>
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
                          onClick={() => approve(r.id)}
                          className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => reject(r.id)}
                          className="rounded-md bg-rose-700 px-2 py-1 text-xs text-white"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No approvals.
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
