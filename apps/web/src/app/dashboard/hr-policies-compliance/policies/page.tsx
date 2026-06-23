'use client';

import { useEffect, useState } from 'react';

interface Policy {
  id: string;
  title: string;
  category: string;
  version: string;
  status: string;
  applicableTo: string;
  acknowledgementsRequired: boolean;
  effectiveDate: string | null;
  publishedAt: string | null;
  ownerName: string | null;
}

const statusColor: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-800',
  PUBLISHED: 'bg-emerald-100 text-emerald-800',
  ARCHIVED: 'bg-slate-100 text-slate-700',
};

export default function PoliciesPage() {
  const [rows, setRows] = useState<Policy[]>([]);
  const [filter, setFilter] = useState('');
  const [interval, setInterval] = useState('12');
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/hr-policies-compliance/policies', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function publish(id: string) {
    const r = await fetch('/api/v1/hr-policies-compliance/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'publish', policyId: id, intervalMonths: Number(interval) }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Published' : p.error?.message);
    load();
  }

  async function archive(id: string) {
    const r = await fetch('/api/v1/hr-policies-compliance/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'archive', policyId: id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Archived' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-32 · S01 / S02 / S07</p>
            <h1 className="text-2xl font-semibold">Policy Lifecycle</h1>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600">Review every (months)</label>
            <input
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-16 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Version</th>
                <th className="px-3 py-2">Applicable</th>
                <th className="px-3 py-2">Ack req</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Published</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{p.title}</td>
                  <td className="px-3 py-2 text-xs">{p.category}</td>
                  <td className="px-3 py-2">{p.version}</td>
                  <td className="px-3 py-2 text-xs">{p.applicableTo}</td>
                  <td className="px-3 py-2">{p.acknowledgementsRequired ? '✓' : '—'}</td>
                  <td className="px-3 py-2 text-xs">{p.ownerName ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{p.publishedAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[p.status] ?? ''}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      {p.status !== 'PUBLISHED' && p.status !== 'ARCHIVED' && (
                        <button
                          type="button"
                          onClick={() => publish(p.id)}
                          className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                        >
                          Publish
                        </button>
                      )}
                      {p.status === 'PUBLISHED' && (
                        <button
                          type="button"
                          onClick={() => archive(p.id)}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No policies.
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
