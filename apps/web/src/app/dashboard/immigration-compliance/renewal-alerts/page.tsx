'use client';

import { useEffect, useState } from 'react';

interface Alert {
  id: string;
  subjectType: string;
  subjectId: string;
  country: string;
  documentCode: string;
  expiresAt: string;
  window: string;
  status: string;
  acknowledgedAt: string | null;
  renewedAt: string | null;
}

const windowColor: Record<string, string> = {
  EXPIRED: 'bg-rose-100 text-rose-800',
  WINDOW_7: 'bg-rose-100 text-rose-800',
  WINDOW_30: 'bg-amber-100 text-amber-800',
  WINDOW_60: 'bg-blue-100 text-blue-800',
};

const statusColor: Record<string, string> = {
  OPEN: 'bg-rose-100 text-rose-800',
  ACKNOWLEDGED: 'bg-amber-100 text-amber-800',
  RENEWED: 'bg-emerald-100 text-emerald-800',
};

export default function RenewalAlertsPage() {
  const [rows, setRows] = useState<Alert[]>([]);
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const [windowFilter, setWindowFilter] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    subjectType: 'EMPLOYEE',
    subjectId: '',
    country: 'UAE',
    documentCode: '',
    permitId: '',
    expiresAt: '',
  });

  async function load() {
    const qs = new URLSearchParams();
    if (statusFilter) qs.set('status', statusFilter);
    if (windowFilter) qs.set('window', windowFilter);
    const r = await fetch(`/api/v1/immigration-compliance/renewal-alerts?${qs.toString()}`);
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [statusFilter, windowFilter]);

  async function raise() {
    if (!form.expiresAt) {
      setMessage('expiresAt required');
      return;
    }
    const r = await fetch('/api/v1/immigration-compliance/renewal-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'raise', ...form }),
    });
    const p = await r.json();
    setMessage(
      p.success
        ? (p.message ?? 'Raised')
        : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    load();
  }
  async function act(id: string, action: 'acknowledge' | 'mark-renewed') {
    const r = await fetch('/api/v1/immigration-compliance/renewal-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id }),
    });
    const p = await r.json();
    setMessage(
      p.success ? (p.message ?? 'OK') : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-07 · S08</p>
            <h1 className="text-2xl font-semibold">Renewal Alerts (60/30/7-day ladder)</h1>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">All statuses</option>
              {['OPEN', 'ACKNOWLEDGED', 'RENEWED'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={windowFilter}
              onChange={(e) => setWindowFilter(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">All windows</option>
              {['EXPIRED', 'WINDOW_7', 'WINDOW_30', 'WINDOW_60'].map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Raise Alert</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-6">
            <input
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              placeholder="Subject ID"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <select
              value={form.subjectType}
              onChange={(e) => setForm({ ...form, subjectType: e.target.value })}
              className="rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['EMPLOYEE', 'DEPENDENT', 'CONTRACTOR'].map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              placeholder="Country"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              value={form.documentCode}
              onChange={(e) => setForm({ ...form, documentCode: e.target.value })}
              placeholder="Doc code"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
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
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Document</th>
                <th className="px-3 py-2">Expires</th>
                <th className="px-3 py-2">Window</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 text-xs">
                    {r.subjectType} · <span className="font-mono">{r.subjectId}</span>
                  </td>
                  <td className="px-3 py-2">{r.country}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.documentCode}</td>
                  <td className="px-3 py-2 text-xs">{r.expiresAt?.slice(0, 10)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${windowColor[r.window] ?? ''}`}
                    >
                      {r.window}
                    </span>
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
                        onClick={() => act(r.id, 'acknowledge')}
                        className="rounded-md bg-amber-700 px-2 py-1 text-xs text-white"
                      >
                        ACK
                      </button>
                    )}
                    {r.status !== 'RENEWED' && (
                      <button
                        type="button"
                        onClick={() => act(r.id, 'mark-renewed')}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                      >
                        Renewed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No alerts.
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
