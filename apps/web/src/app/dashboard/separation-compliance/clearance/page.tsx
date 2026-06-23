'use client';

import { useEffect, useState } from 'react';

interface Cl {
  id: string;
  caseId: string;
  department: string;
  completedItems: number;
  totalItems: number;
  blockerNotes: string | null;
  ownerId: string | null;
  clearedAt: string | null;
  status: string;
}

const statusColor: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  CLEARED: 'bg-emerald-100 text-emerald-800',
};

export default function ClearancePage() {
  const [rows, setRows] = useState<Cl[]>([]);
  const [caseFilter, setCaseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/separation-compliance/clearance', window.location.origin);
    if (caseFilter) url.searchParams.set('caseId', caseFilter);
    if (statusFilter) url.searchParams.set('status', statusFilter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [caseFilter, statusFilter]);

  async function update(id: string, current: Cl) {
    const completed = window.prompt(
      `Completed items (0–${current.totalItems})?`,
      String(current.completedItems)
    );
    if (completed == null) return;
    const blocker = window.prompt('Blocker notes? (optional)') ?? '';
    const r = await fetch('/api/v1/separation-compliance/clearance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update',
        id,
        completedItems: Number(completed),
        blockerNotes: blocker || undefined,
      }),
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
            <p className="text-sm uppercase text-slate-500">EPIC-27 · S09</p>
            <h1 className="text-2xl font-semibold">Exit Clearance Checklist</h1>
          </div>
          <div className="flex gap-2">
            <input
              placeholder="filter by caseId"
              value={caseFilter}
              onChange={(e) => setCaseFilter(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm font-mono text-xs"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              <option value="PENDING">PENDING</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="CLEARED">CLEARED</option>
            </select>
          </div>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Case</th>
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2">Progress</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Cleared</th>
                <th className="px-3 py-2">Blocker</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{c.caseId.slice(0, 8)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{c.department}</td>
                  <td className="px-3 py-2">
                    {c.completedItems}/{c.totalItems}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{c.ownerId ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{c.clearedAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2 text-xs text-rose-700">{c.blockerNotes ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[c.status] ?? ''}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {c.status !== 'CLEARED' && (
                      <button
                        type="button"
                        onClick={() => update(c.id, c)}
                        className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white"
                      >
                        Update
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No clearance records.
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
