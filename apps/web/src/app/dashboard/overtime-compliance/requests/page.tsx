'use client';

import { useEffect, useState } from 'react';

interface Req {
  id: string;
  employeeId: string;
  country: string;
  requestDate: string;
  plannedHours: string;
  otType: string;
  reason: string | null;
  costCenterId: string | null;
  status: string;
  rejectionReason: string | null;
}

const statusColor: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-800',
};

export default function OtRequestsPage() {
  const [rows, setRows] = useState<Req[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [form, setForm] = useState({
    employeeId: '',
    country: 'UAE',
    requestDate: new Date().toISOString().slice(0, 10),
    plannedHours: '2',
    otType: 'WEEKDAY',
    reason: '',
    costCenterId: '',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/overtime-compliance/requests', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function create() {
    setMessage('');
    const r = await fetch('/api/v1/overtime-compliance/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        ...form,
        plannedHours: Number(form.plannedHours),
        costCenterId: form.costCenterId || undefined,
        reason: form.reason || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Created' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function approve(id: string) {
    const r = await fetch('/api/v1/overtime-compliance/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', requestId: id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Approved' : p.error?.message);
    load();
  }
  async function reject(id: string) {
    const reason = window.prompt('Rejection reason?') ?? '';
    const r = await fetch('/api/v1/overtime-compliance/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', requestId: id, reason }),
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
            <p className="text-sm uppercase text-slate-500">EPIC-12 · S04 / S17</p>
            <h1 className="text-2xl font-semibold">OT Requests &amp; Approvals</h1>
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
            Date
            <input
              type="date"
              value={form.requestDate}
              onChange={(e) => setForm((f) => ({ ...f, requestDate: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Hours
            <input
              value={form.plannedHours}
              onChange={(e) => setForm((f) => ({ ...f, plannedHours: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Type
            <select
              value={form.otType}
              onChange={(e) => setForm((f) => ({ ...f, otType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['WEEKDAY', 'NIGHT', 'REST_DAY', 'HOLIDAY', 'RAMADAN'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Cost Center
            <input
              value={form.costCenterId}
              onChange={(e) => setForm((f) => ({ ...f, costCenterId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={create}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Create
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Hours</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Cost Center</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{r.employeeId}</td>
                  <td className="px-3 py-2">{r.country}</td>
                  <td className="px-3 py-2 text-xs">{r.requestDate?.slice(0, 10)}</td>
                  <td className="px-3 py-2">{r.plannedHours}</td>
                  <td className="px-3 py-2">{r.otType}</td>
                  <td className="px-3 py-2 text-xs">{r.costCenterId ?? '—'}</td>
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
                    No requests.
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
