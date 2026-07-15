'use client';

import { useEffect, useState } from 'react';

interface Grace {
  id: string;
  caseId: string;
  grantedAt: string;
  expiresAt: string;
  daysGranted: number;
  graceType: string;
  status: string;
  extensionCount: number;
  closedAt: string | null;
}

const statusColor: Record<string, string> = {
  ACTIVE: 'bg-amber-100 text-amber-800',
  CLOSED: 'bg-emerald-100 text-emerald-800',
};

export default function GracePage() {
  const [rows, setRows] = useState<Grace[]>([]);
  const [expiringOnly, setExpiringOnly] = useState(false);
  const [form, setForm] = useState({
    caseId: '',
    grantedAt: new Date().toISOString().slice(0, 10),
    daysGranted: '',
    graceType: 'POST_CANCELLATION',
    countryCode: 'UAE',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/visa-exit-compliance/grace', window.location.origin);
    if (expiringOnly) url.searchParams.set('expiringWithinDays', '7');
    const r = await fetch(url.toString());
    const p = await r.json();

    if (p.success) {
      setRows(p.data?.items ?? []);
    }
  }
  useEffect(() => {
    load();
  }, [expiringOnly]);

  async function start() {
    setMessage('');
    const r = await fetch('/api/v1/visa-exit-compliance/grace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'start',
        caseId: form.caseId,
        grantedAt: form.grantedAt,
        graceType: form.graceType,
        countryCode: form.countryCode,
        daysGranted: form.daysGranted ? Number(form.daysGranted) : undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Started' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function extend(caseId: string) {
    const d = window.prompt('Extra days?') ?? '';
    if (!d) return;
    const r = await fetch('/api/v1/visa-exit-compliance/grace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'extend', caseId, extraDays: Number(d) }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Extended' : p.error?.message);
    load();
  }
  async function close(caseId: string) {
    const r = await fetch('/api/v1/visa-exit-compliance/grace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'close', caseId }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Closed' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-29 · S05 / S06</p>
            <h1 className="text-2xl font-semibold">Grace Period Register</h1>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={expiringOnly}
              onChange={(e) => setExpiringOnly(e.target.checked)}
            />
            Expiring ≤ 7 days
          </label>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6">
          <label className="text-sm md:col-span-2">
            Case ID
            <input
              value={form.caseId}
              onChange={(e) => setForm((f) => ({ ...f, caseId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Granted At
            <input
              type="date"
              value={form.grantedAt}
              onChange={(e) => setForm((f) => ({ ...f, grantedAt: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Type
            <select
              value={form.graceType}
              onChange={(e) => setForm((f) => ({ ...f, graceType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['POST_CANCELLATION', 'EXIT_RE_ENTRY', 'TRANSFER_WINDOW', 'DEPENDENT'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Country (default days)
            <select
              value={form.countryCode}
              onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['UAE', 'KSA', 'BAHRAIN', 'QATAR', 'OMAN', 'KUWAIT'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Days (override)
            <input
              value={form.daysGranted}
              onChange={(e) => setForm((f) => ({ ...f, daysGranted: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={start}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white md:col-span-6"
          >
            Start Grace Period
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Case</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Granted</th>
                <th className="px-3 py-2">Expires</th>
                <th className="px-3 py-2">Days</th>
                <th className="px-3 py-2">Ext</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => {
                const days = Math.ceil(
                  (new Date(g.expiresAt).getTime() - Date.now()) / (24 * 3600 * 1000)
                );
                const soon = days <= 7 && days >= 0;
                return (
                  <tr key={g.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">{g.caseId.slice(0, 8)}</td>
                    <td className="px-3 py-2 text-xs">{g.graceType}</td>
                    <td className="px-3 py-2 text-xs">{g.grantedAt?.slice(0, 10)}</td>
                    <td
                      className={`px-3 py-2 text-xs ${soon ? 'font-semibold text-rose-700' : ''}`}
                    >
                      {g.expiresAt?.slice(0, 10)}
                      {g.status === 'ACTIVE' ? ` (${days}d)` : ''}
                    </td>
                    <td className="px-3 py-2">{g.daysGranted}</td>
                    <td className="px-3 py-2">{g.extensionCount}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[g.status] ?? ''}`}
                      >
                        {g.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {g.status === 'ACTIVE' && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => extend(g.caseId)}
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                          >
                            Extend
                          </button>
                          <button
                            type="button"
                            onClick={() => close(g.caseId)}
                            className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                          >
                            Close
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No grace records.
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
