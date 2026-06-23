'use client';

import { useEffect, useState } from 'react';

interface Doc {
  id: string;
  employeeId: string | null;
  recordType: string;
  title: string;
  fileUrl: string | null;
  classification: string;
  issuedAt: string | null;
  expiresAt: string | null;
  retentionUntil: string | null;
  litigationHoldId: string | null;
  status: string;
}

const classColor: Record<string, string> = {
  PUBLIC: 'bg-slate-100 text-slate-700',
  INTERNAL: 'bg-blue-100 text-blue-800',
  CONFIDENTIAL: 'bg-amber-100 text-amber-800',
  RESTRICTED: 'bg-rose-100 text-rose-800',
};

export default function DocumentsPage() {
  const [rows, setRows] = useState<Doc[]>([]);
  const [filter, setFilter] = useState<'all' | 'expiringSoon' | 'onLitigationHold'>('all');
  const [form, setForm] = useState({
    employeeId: '',
    recordType: 'CONTRACT',
    title: '',
    fileUrl: '',
    issuedAt: new Date().toISOString().slice(0, 10),
    expiresAt: '',
    countryCode: '',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/document-retention-compliance/documents', window.location.origin);
    if (filter === 'expiringSoon') url.searchParams.set('expiringSoon', 'true');
    if (filter === 'onLitigationHold') url.searchParams.set('onLitigationHold', 'true');
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function save() {
    setMessage('');
    const r = await fetch('/api/v1/document-retention-compliance/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        ...form,
        employeeId: form.employeeId || undefined,
        fileUrl: form.fileUrl || undefined,
        countryCode: form.countryCode || undefined,
        expiresAt: form.expiresAt || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-30 · S02 / S03 / S05 / S09</p>
            <h1 className="text-2xl font-semibold">HR Document Register</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="all">All</option>
            <option value="expiringSoon">Expiring ≤60d</option>
            <option value="onLitigationHold">On Litigation Hold</option>
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
            Record Type
            <input
              value={form.recordType}
              onChange={(e) => setForm((f) => ({ ...f, recordType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm md:col-span-2">
            Title
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Issued
            <input
              type="date"
              value={form.issuedAt}
              onChange={(e) => setForm((f) => ({ ...f, issuedAt: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Expires
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={save}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Upsert
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Classification</th>
                <th className="px-3 py-2">Issued</th>
                <th className="px-3 py-2">Expires</th>
                <th className="px-3 py-2">Retain Until</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Hold</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{d.employeeId ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{d.recordType}</td>
                  <td className="px-3 py-2">{d.title}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${classColor[d.classification] ?? ''}`}
                    >
                      {d.classification}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">{d.issuedAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{d.expiresAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{d.retentionUntil?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{d.status}</td>
                  <td className="px-3 py-2">
                    {d.litigationHoldId ? (
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-800">
                        HOLD
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No documents.
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
