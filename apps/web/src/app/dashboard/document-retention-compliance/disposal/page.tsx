'use client';

import { useEffect, useState } from 'react';

interface Req {
  id: string;
  documentIds: string[];
  reason: string;
  status: string;
  blockedReason: string | null;
  requestedAt: string;
  approvedAt: string | null;
  executedAt: string | null;
}

const statusColor: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-indigo-100 text-indigo-800',
  EXECUTED: 'bg-emerald-100 text-emerald-800',
  BLOCKED: 'bg-rose-100 text-rose-800',
};

export default function DisposalPage() {
  const [rows, setRows] = useState<Req[]>([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ documentIds: '', reason: '' });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/document-retention-compliance/disposal', window.location.origin);
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
    const ids = form.documentIds
      .split(/[,\n\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const r = await fetch('/api/v1/document-retention-compliance/disposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'request', documentIds: ids, reason: form.reason }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Requested' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }
  async function approve(id: string) {
    const r = await fetch('/api/v1/document-retention-compliance/disposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Approved' : p.error?.message);
    load();
  }
  async function execute(id: string) {
    const r = await fetch('/api/v1/document-retention-compliance/disposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'execute', id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Executed' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-30 · S11</p>
            <h1 className="text-2xl font-semibold">Disposal Workflow</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="EXECUTED">EXECUTED</option>
            <option value="BLOCKED">BLOCKED</option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3">
          <label className="text-sm md:col-span-2">
            Document IDs (comma/space/newline-separated)
            <textarea
              value={form.documentIds}
              onChange={(e) => setForm((f) => ({ ...f, documentIds: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
              rows={3}
            />
          </label>
          <label className="text-sm">
            Reason
            <textarea
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              rows={3}
            />
          </label>
          <button
            type="button"
            onClick={request}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white md:col-span-3"
          >
            Request Disposal (auto-blocks if any doc is held or pre-retention)
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Requested</th>
                <th className="px-3 py-2">Docs</th>
                <th className="px-3 py-2">Reason</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Blocked Reason</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 text-xs">{r.requestedAt?.slice(0, 10)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.documentIds.length}</td>
                  <td className="px-3 py-2 text-xs">{r.reason}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[r.status] ?? ''}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-rose-700">{r.blockedReason ?? '—'}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      {r.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => approve(r.id)}
                          className="rounded-md bg-indigo-700 px-2 py-1 text-xs text-white"
                        >
                          Approve
                        </button>
                      )}
                      {r.status === 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => execute(r.id)}
                          className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                        >
                          Execute
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
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
