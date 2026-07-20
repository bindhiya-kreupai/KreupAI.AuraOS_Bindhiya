'use client';

import { Fragment, useEffect, useState } from 'react';

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
  const [busy, setBusy] = useState(false);
  // Inline panels keyed by action id: 'assign' | 'complete' | null
  const [panel, setPanel] = useState<{ id: string; mode: 'assign' | 'complete' } | null>(null);
  const [assigneeInput, setAssigneeInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  async function load() {
    const url = new URL('/api/v1/visa-exit-compliance/pro-actions', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    if (caseFilter) url.searchParams.set('caseId', caseFilter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data?.items ?? []);
  }
  useEffect(() => {
    load();
  }, [filter, caseFilter]);

  function openPanel(id: string, mode: 'assign' | 'complete') {
    setPanel({ id, mode });
    setAssigneeInput('');
    setNotesInput('');
    setMessage('');
  }

  async function submitComplete(id: string) {
    setBusy(true);
    setMessage('');
    try {
      const r = await fetch('/api/v1/visa-exit-compliance/pro-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete', id, notes: notesInput.trim() || undefined }),
      });
      const p = await r.json();
      setMessage(
        p.success ? 'Completed' : (p.error?.details?.error ?? p.error?.message ?? 'Failed')
      );
      if (p.success) {
        setPanel(null);
        await load();
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitAssign(id: string) {
    const assigneeId = assigneeInput.trim();
    if (!assigneeId) {
      setMessage('Assignee ID is required');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const r = await fetch('/api/v1/visa-exit-compliance/pro-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assign', id, assigneeId }),
      });
      const p = await r.json();
      setMessage(
        p.success ? 'Assigned' : (p.error?.details?.error ?? p.error?.message ?? 'Failed')
      );
      if (p.success) {
        setPanel(null);
        await load();
      }
    } finally {
      setBusy(false);
    }
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
                const openHere = panel?.id === a.id;
                return (
                  <Fragment key={a.id}>
                    <tr className="border-b border-slate-100">
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
                              onClick={() => openPanel(a.id, 'assign')}
                              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                            >
                              Assign
                            </button>
                            <button
                              type="button"
                              onClick={() => openPanel(a.id, 'complete')}
                              className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                            >
                              Complete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {openHere && (
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <td colSpan={7} className="px-3 py-3">
                          {panel?.mode === 'assign' ? (
                            <div className="flex flex-wrap items-end gap-2">
                              <label className="text-xs">
                                Assignee ID
                                <input
                                  value={assigneeInput}
                                  onChange={(e) => setAssigneeInput(e.target.value)}
                                  placeholder="employee / PRO id"
                                  className="mt-1 block w-64 rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
                                />
                              </label>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => submitAssign(a.id)}
                                className="rounded-md bg-slate-900 px-3 py-2 text-xs text-white disabled:opacity-50"
                              >
                                Save assignee
                              </button>
                              <button
                                type="button"
                                onClick={() => setPanel(null)}
                                className="rounded-md border border-slate-300 px-3 py-2 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-end gap-2">
                              <label className="text-xs">
                                Completion notes (optional)
                                <textarea
                                  value={notesInput}
                                  onChange={(e) => setNotesInput(e.target.value)}
                                  rows={2}
                                  className="mt-1 block w-96 rounded-md border border-slate-300 px-2 py-1.5 text-xs"
                                />
                              </label>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => submitComplete(a.id)}
                                className="rounded-md bg-emerald-700 px-3 py-2 text-xs text-white disabled:opacity-50"
                              >
                                Confirm complete
                              </button>
                              <button
                                type="button"
                                onClick={() => setPanel(null)}
                                className="rounded-md border border-slate-300 px-3 py-2 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
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
