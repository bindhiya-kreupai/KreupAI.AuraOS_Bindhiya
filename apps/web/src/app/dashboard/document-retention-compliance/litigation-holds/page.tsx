'use client';

import { useEffect, useState } from 'react';

interface Hold {
  id: string;
  caseNumber: string;
  subject: string;
  scopeFilter: { recordType?: string; employeeId?: string };
  status: string;
  heldDocCount: number;
  startedAt: string;
  endedAt: string | null;
}

export default function HoldsPage() {
  const [rows, setRows] = useState<Hold[]>([]);
  const [form, setForm] = useState({
    caseNumber: '',
    subject: '',
    recordType: '',
    employeeId: '',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/document-retention-compliance/litigation-holds');
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function start() {
    setMessage('');
    const scopeFilter: { recordType?: string; employeeId?: string } = {};
    if (form.recordType) scopeFilter.recordType = form.recordType;
    if (form.employeeId) scopeFilter.employeeId = form.employeeId;
    const r = await fetch('/api/v1/document-retention-compliance/litigation-holds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'start',
        caseNumber: form.caseNumber,
        subject: form.subject,
        scopeFilter,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Started' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function release(caseNumber: string) {
    const r = await fetch('/api/v1/document-retention-compliance/litigation-holds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'release', caseNumber }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Released' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-30 · S10</p>
          <h1 className="text-2xl font-semibold">Litigation Holds</h1>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-5">
          <label className="text-sm">
            Case #
            <input
              value={form.caseNumber}
              onChange={(e) => setForm((f) => ({ ...f, caseNumber: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm md:col-span-2">
            Subject
            <input
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Scope: recordType
            <input
              value={form.recordType}
              onChange={(e) => setForm((f) => ({ ...f, recordType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Scope: employeeId
            <input
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={start}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white md:col-span-5"
          >
            Start Hold (applies to matching ACTIVE documents)
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Case</th>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2">Scope</th>
                <th className="px-3 py-2">Held Docs</th>
                <th className="px-3 py-2">Started</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((h) => (
                <tr key={h.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{h.caseNumber}</td>
                  <td className="px-3 py-2">{h.subject}</td>
                  <td className="px-3 py-2 text-xs">
                    {h.scopeFilter?.recordType ?? '*'} / {h.scopeFilter?.employeeId ?? '*'}
                  </td>
                  <td className="px-3 py-2">{h.heldDocCount}</td>
                  <td className="px-3 py-2 text-xs">{h.startedAt?.slice(0, 10)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${h.status === 'ACTIVE' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'}`}
                    >
                      {h.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {h.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() => release(h.caseNumber)}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                      >
                        Release
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No holds.
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
