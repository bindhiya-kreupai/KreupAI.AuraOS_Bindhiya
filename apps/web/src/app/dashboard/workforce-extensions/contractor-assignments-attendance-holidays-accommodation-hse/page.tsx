'use client';

import { useEffect, useState } from 'react';

interface ContractorAssignment {
  id: string;
  subjectId: string;
  subjectName: string;
  domain: string;
  vendorName: string | null;
  startDate: string;
  endDate: string | null;
  status: string;
}

const DOMAINS = ['ATTENDANCE', 'HOLIDAYS', 'ACCOMMODATION', 'HSE'];
const STATUSES = ['ACTIVE', 'EXPIRED', 'TERMINATED'];

export default function ContractorAssignmentsPage() {
  const [rows, setRows] = useState<ContractorAssignment[]>([]);
  const [filter, setFilter] = useState({ domain: '', status: '', siteId: '' });
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    subjectId: '',
    subjectName: '',
    domain: 'ATTENDANCE',
    startDate: '',
    endDate: '',
    vendorId: '',
    vendorName: '',
    contractRef: '',
    siteId: '',
    notes: '',
  });

  async function load() {
    const url = new URL('/api/v1/workforce-extensions/contractors', window.location.origin);
    if (filter.domain) url.searchParams.set('domain', filter.domain);
    if (filter.status) url.searchParams.set('status', filter.status);
    if (filter.siteId) url.searchParams.set('siteId', filter.siteId);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows((p.data?.items ?? []) as ContractorAssignment[]);
  }

  useEffect(() => {
    load();
  }, [filter.domain, filter.status, filter.siteId]);

  async function save() {
    const r = await fetch('/api/v1/workforce-extensions/contractors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        subjectId: form.subjectId,
        subjectName: form.subjectName,
        domain: form.domain,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        vendorId: form.vendorId || undefined,
        vendorName: form.vendorName || undefined,
        contractRef: form.contractRef || undefined,
        siteId: form.siteId || undefined,
        notes: form.notes || undefined,
      }),
    });
    const p = await r.json();
    if (p.success) {
      setMessage(p.message ?? 'Saved');
      load();
    } else {
      setMessage(p.error?.message ?? 'Error');
    }
  }

  async function terminate(id: string) {
    const r = await fetch('/api/v1/workforce-extensions/contractors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'terminate', id }),
    });
    const p = await r.json();
    if (p.success) {
      setMessage(p.message ?? 'Terminated');
      load();
    } else {
      setMessage(p.error?.message ?? 'Error');
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">Workforce Extensions · AURA-541</p>
          <h1 className="text-2xl font-semibold">Contractor Assignments</h1>
          {message ? <p className="mt-2 text-sm text-slate-700">{message}</p> : null}
        </header>

        <section className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <label className="text-sm">
            Domain
            <select
              value={filter.domain}
              onChange={(e) => setFilter((f) => ({ ...f, domain: e.target.value }))}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              {DOMAINS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Status
            <select
              value={filter.status}
              onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            siteId
            <input
              value={filter.siteId}
              onChange={(e) => setFilter((f) => ({ ...f, siteId: e.target.value }))}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </label>
        </section>

        <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">New / Update Assignment</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <input
              placeholder="subjectId"
              value={form.subjectId}
              onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="subjectName"
              value={form.subjectName}
              onChange={(e) => setForm((f) => ({ ...f, subjectName: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <select
              value={form.domain}
              onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              {DOMAINS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <label className="text-sm">
              startDate
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="ml-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-sm">
              endDate
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="ml-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
            <input
              placeholder="vendorId"
              value={form.vendorId}
              onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="vendorName"
              value={form.vendorName}
              onChange={(e) => setForm((f) => ({ ...f, vendorName: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="contractRef"
              value={form.contractRef}
              onChange={(e) => setForm((f) => ({ ...f, contractRef: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="siteId"
              value={form.siteId}
              onChange={(e) => setForm((f) => ({ ...f, siteId: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm md:col-span-2"
            />
          </div>
          <div>
            <button
              type="button"
              onClick={save}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Save Assignment
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2">subjectId</th>
                  <th>subjectName</th>
                  <th>domain</th>
                  <th>vendorName</th>
                  <th>startDate</th>
                  <th>endDate</th>
                  <th>status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-2 font-mono text-xs">{row.subjectId}</td>
                    <td>{row.subjectName}</td>
                    <td>{row.domain}</td>
                    <td>{row.vendorName ?? '—'}</td>
                    <td>
                      {row.startDate ? new Date(row.startDate).toISOString().slice(0, 10) : '—'}
                    </td>
                    <td>{row.endDate ? new Date(row.endDate).toISOString().slice(0, 10) : '—'}</td>
                    <td>{row.status}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => terminate(row.id)}
                        className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white"
                      >
                        Terminate
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-3 text-slate-500">
                      No assignments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
