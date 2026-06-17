'use client';

import { useEffect, useState } from 'react';

interface Asn {
  id: string;
  siteId: string;
  employeeId: string;
  roomNumber: string | null;
  bedNumber: string | null;
  checkInAt: string;
  checkOutAt: string | null;
  status: string;
  monthlyAllowance: string | null;
  currency: string;
}

const statusColor: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  CHECKED_OUT: 'bg-slate-100 text-slate-700',
};

export default function AssignmentsPage() {
  const [rows, setRows] = useState<Asn[]>([]);
  const [filter, setFilter] = useState('ACTIVE');
  const [form, setForm] = useState({
    siteId: '',
    employeeId: '',
    roomNumber: '',
    bedNumber: '',
    checkInAt: new Date().toISOString().slice(0, 10),
    monthlyAllowance: '',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/accommodation-compliance/assignments', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function assign() {
    setMessage('');
    const r = await fetch('/api/v1/accommodation-compliance/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'assign',
        ...form,
        monthlyAllowance: form.monthlyAllowance ? Number(form.monthlyAllowance) : undefined,
        roomNumber: form.roomNumber || undefined,
        bedNumber: form.bedNumber || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Assigned' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function checkOut(id: string) {
    const r = await fetch('/api/v1/accommodation-compliance/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check-out', id, checkOutAt: new Date().toISOString() }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Checked out' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-23 · S03 / S04 / S10</p>
            <h1 className="text-2xl font-semibold">Assignment Register</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="CHECKED_OUT">CHECKED_OUT</option>
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
            Room
            <input
              value={form.roomNumber}
              onChange={(e) => setForm((f) => ({ ...f, roomNumber: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Bed
            <input
              value={form.bedNumber}
              onChange={(e) => setForm((f) => ({ ...f, bedNumber: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Check-In
            <input
              type="date"
              value={form.checkInAt}
              onChange={(e) => setForm((f) => ({ ...f, checkInAt: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Allowance
            <input
              value={form.monthlyAllowance}
              onChange={(e) => setForm((f) => ({ ...f, monthlyAllowance: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={assign}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Assign
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Site</th>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Room/Bed</th>
                <th className="px-3 py-2">Check-In</th>
                <th className="px-3 py-2">Check-Out</th>
                <th className="px-3 py-2">Allowance</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{a.siteId.slice(0, 8)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{a.employeeId}</td>
                  <td className="px-3 py-2 text-xs">
                    {a.roomNumber ?? '—'} / {a.bedNumber ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-xs">{a.checkInAt?.slice(0, 10)}</td>
                  <td className="px-3 py-2 text-xs">{a.checkOutAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2">
                    {a.monthlyAllowance ?? '—'} {a.currency}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[a.status] ?? ''}`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {a.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() => checkOut(a.id)}
                        className="rounded-md bg-rose-700 px-2 py-1 text-xs text-white"
                      >
                        Check Out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No assignments.
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
