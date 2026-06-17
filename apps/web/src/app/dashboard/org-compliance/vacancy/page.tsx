'use client';

import { useEffect, useState } from 'react';

interface Vac {
  id: string;
  vacancyNumber: string;
  positionId: string | null;
  departmentId: string | null;
  raisedAt: string;
  approvedAt: string | null;
  filledAt: string | null;
  agingDays: number;
  status: string;
}

const statusColor: Record<string, string> = {
  OPEN: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  FILLED: 'bg-emerald-100 text-emerald-800',
};

export default function OrgVacancyPage() {
  const [rows, setRows] = useState<Vac[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    vacancyNumber: '',
    positionId: '',
    departmentId: '',
    country: '',
  });

  async function load() {
    const r = await fetch('/api/v1/org-compliance/vacancy');
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function raise() {
    const r = await fetch('/api/v1/org-compliance/vacancy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'raise', ...form }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Raised' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }
  async function approve(id: string) {
    const r = await fetch('/api/v1/org-compliance/vacancy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Approved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }
  async function fill(id: string) {
    const candidateId = prompt('Candidate ID?') ?? '';
    if (!candidateId) return;
    const r = await fetch('/api/v1/org-compliance/vacancy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'fill', id, candidateId }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Filled' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-09 · S11</p>
          <h1 className="text-2xl font-semibold">Vacancy Register</h1>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Raise Vacancy</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
            <input
              value={form.vacancyNumber}
              onChange={(e) => setForm({ ...form, vacancyNumber: e.target.value })}
              placeholder="V-001"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              value={form.positionId}
              onChange={(e) => setForm({ ...form, positionId: e.target.value })}
              placeholder="Position ID"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              placeholder="Department ID"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              placeholder="Country"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <button
              type="button"
              onClick={raise}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Raise
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Number</th>
                <th className="px-3 py-2">Position</th>
                <th className="px-3 py-2">Dept</th>
                <th className="px-3 py-2">Raised</th>
                <th className="px-3 py-2">Approved</th>
                <th className="px-3 py-2">Filled</th>
                <th className="px-3 py-2">Aging</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{r.vacancyNumber}</td>
                  <td className="px-3 py-2 text-xs">{r.positionId ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{r.departmentId ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{r.raisedAt?.slice(0, 10)}</td>
                  <td className="px-3 py-2 text-xs">{r.approvedAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{r.filledAt?.slice(0, 10) ?? '—'}</td>
                  <td
                    className={`px-3 py-2 ${r.agingDays > 90 ? 'text-rose-700 font-semibold' : ''}`}
                  >
                    {r.agingDays}d
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[r.status] ?? ''}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 flex gap-1">
                    {r.status === 'OPEN' && (
                      <button
                        type="button"
                        onClick={() => approve(r.id)}
                        className="rounded-md bg-blue-700 px-2 py-1 text-xs text-white"
                      >
                        Approve
                      </button>
                    )}
                    {r.status !== 'FILLED' && (
                      <button
                        type="button"
                        onClick={() => fill(r.id)}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                      >
                        Fill
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No vacancies.
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
