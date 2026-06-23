'use client';

import { useEffect, useState } from 'react';

interface Tc {
  id: string;
  caseNumber: string;
  employeeId: string;
  transferType: string;
  fromCountry: string | null;
  toCountry: string | null;
  fromLocation: string | null;
  toLocation: string | null;
  requestedAt: string;
  approvedAt: string | null;
  completedAt: string | null;
  status: string;
}

const TRANSFER_TYPES = [
  'INTRA_GCC',
  'INTRA_ENTITY',
  'INTRA_LOCATION',
  'TITLE_CHANGE',
  'EXIT_CANCELLATION',
];

const statusColor: Record<string, string> = {
  REQUESTED: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
};

export default function TransferCasePage() {
  const [rows, setRows] = useState<Tc[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    caseNumber: '',
    employeeId: '',
    transferType: 'INTRA_GCC',
    fromCountry: '',
    toCountry: '',
    fromLocation: '',
    toLocation: '',
    notes: '',
  });

  async function load() {
    const r = await fetch('/api/v1/immigration-compliance/transfer-case');
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function raise() {
    const r = await fetch('/api/v1/immigration-compliance/transfer-case', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'raise', ...form }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Raised' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }
  async function act(id: string, action: 'approve' | 'complete') {
    const r = await fetch('/api/v1/immigration-compliance/transfer-case', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'OK' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-07 · S06</p>
          <h1 className="text-2xl font-semibold">Transfer & Mobility Cases</h1>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Raise Case</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-6">
            <input
              value={form.caseNumber}
              onChange={(e) => setForm({ ...form, caseNumber: e.target.value })}
              placeholder="Case No."
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              placeholder="Employee ID"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <select
              value={form.transferType}
              onChange={(e) => setForm({ ...form, transferType: e.target.value })}
              className="rounded-md border border-slate-300 px-2 py-1.5"
            >
              {TRANSFER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              value={form.fromCountry}
              onChange={(e) => setForm({ ...form, fromCountry: e.target.value })}
              placeholder="From country"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              value={form.toCountry}
              onChange={(e) => setForm({ ...form, toCountry: e.target.value })}
              placeholder="To country"
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

        <section className="rounded-lg border border-slate-200 bg-white p-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">No.</th>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">From</th>
                <th className="px-3 py-2">To</th>
                <th className="px-3 py-2">Requested</th>
                <th className="px-3 py-2">Approved</th>
                <th className="px-3 py-2">Completed</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{r.caseNumber}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.employeeId}</td>
                  <td className="px-3 py-2 text-xs">{r.transferType}</td>
                  <td className="px-3 py-2 text-xs">
                    {r.fromCountry ?? '—'}
                    {r.fromLocation ? ` / ${r.fromLocation}` : ''}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {r.toCountry ?? '—'}
                    {r.toLocation ? ` / ${r.toLocation}` : ''}
                  </td>
                  <td className="px-3 py-2 text-xs">{r.requestedAt?.slice(0, 10)}</td>
                  <td className="px-3 py-2 text-xs">{r.approvedAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{r.completedAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[r.status] ?? ''}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 flex gap-1">
                    {r.status === 'REQUESTED' && (
                      <button
                        type="button"
                        onClick={() => act(r.id, 'approve')}
                        className="rounded-md bg-blue-700 px-2 py-1 text-xs text-white"
                      >
                        Approve
                      </button>
                    )}
                    {r.status === 'APPROVED' && (
                      <button
                        type="button"
                        onClick={() => act(r.id, 'complete')}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                      >
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-slate-500">
                    No cases.
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
