'use client';

import { useEffect, useState } from 'react';

interface Action {
  id: string;
  caseId: string;
  actionCode: string;
  label: string;
  authority: string | null;
  assigneeId: string | null;
  dueDate: string | null;
  status: string;
  completedAt: string | null;
  notes: string | null;
}

const statusColor: Record<string, string> = {
  OPEN: 'bg-amber-100 text-amber-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
};

export default function ProActionsPage() {
  const [rows, setRows] = useState<Action[]>([]);
  const [filter, setFilter] = useState('OPEN');
  const [caseFilter, setCaseFilter] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/visa-exit-compliance/pro-actions', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    if (caseFilter) url.searchParams.set('caseId', caseFilter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filter, caseFilter]);

  async function complete(id: string) {
    const notes = window.prompt('Completion notes? (optional)') ?? '';
    const r = await fetch('/api/v1/visa-exit-compliance/pro-actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete', id, notes }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Completed' : p.error?.message);
    load();
  }
  async function assign(id: string) {
    const a = window.prompt('Assignee ID?') ?? '';
    if (!a) return;
    const r = await fetch('/api/v1/visa-exit-compliance/pro-actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'assign', id, assigneeId: a }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Assigned' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-29 · S13 / S14</p>
            <h1 className="text-2xl font-semibold">PRO Action Register</h1>
          </div>
          <div className="flex gap-2">
            <input
              placeholder="filter by caseId"
              value={caseFilter}
              onChange={(e) => setCaseFilter(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              <option value="OPEN">OPEN</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Case</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Authority</th>
                <th className="px-3 py-2">Assignee</th>
                <th className="px-3 py-2">Due</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const overdue =
                  a.dueDate && new Date(a.dueDate) < new Date() && a.status !== 'COMPLETED';
                return (
                  <tr key={a.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">{a.caseId.slice(0, 8)}</td>
                    <td className="px-3 py-2">
                      <div className="text-xs">{a.label}</div>
                      <div className="font-mono text-xs text-slate-500">{a.actionCode}</div>
                    </td>
                    <td className="px-3 py-2 text-xs">{a.authority ?? '—'}</td>
                    <td className="px-3 py-2 font-mono text-xs">{a.assigneeId ?? '—'}</td>
                    <td
                      className={`px-3 py-2 text-xs ${overdue ? 'font-semibold text-rose-700' : ''}`}
                    >
                      {a.dueDate?.slice(0, 10) ?? '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[a.status] ?? ''}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {a.status === 'OPEN' && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => assign(a.id)}
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                          >
                            Assign
                          </button>
                          <button
                            type="button"
                            onClick={() => complete(a.id)}
                            className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                          >
                            Complete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No PRO actions.
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
