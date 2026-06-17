'use client';

import { useEffect, useState } from 'react';

interface Inc {
  id: string;
  incidentNumber: string;
  incidentDate: string;
  incidentType: string;
  severity: string;
  location: string | null;
  employeeId: string | null;
  description: string | null;
  rootCause: string | null;
  lostTimeDays: number;
  gosiNotified: boolean;
  authorityNotified: boolean;
  status: string;
}

const sevColor: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-rose-100 text-rose-800',
  CRITICAL: 'bg-rose-200 text-rose-900',
  FATAL: 'bg-rose-900 text-white',
};

export default function IncidentsPage() {
  const [rows, setRows] = useState<Inc[]>([]);
  const [filter, setFilter] = useState('OPEN');
  const [form, setForm] = useState({
    incidentNumber: '',
    incidentDate: new Date().toISOString().slice(0, 10),
    incidentType: 'NEAR_MISS',
    severity: 'MEDIUM',
    location: '',
    employeeId: '',
    description: '',
    lostTimeDays: '0',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/hse-compliance/incidents', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function raise() {
    setMessage('');
    const r = await fetch('/api/v1/hse-compliance/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'raise',
        ...form,
        lostTimeDays: Number(form.lostTimeDays),
        employeeId: form.employeeId || undefined,
        description: form.description || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Raised' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function call(action: string, id: string, extra: Record<string, unknown> = {}) {
    const r = await fetch('/api/v1/hse-compliance/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id, ...extra }),
    });
    const p = await r.json();
    setMessage(p.success ? action : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-24 · S09 / S10</p>
            <h1 className="text-2xl font-semibold">Incident Register</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-8">
          <label className="text-sm">
            Inc #
            <input
              value={form.incidentNumber}
              onChange={(e) => setForm((f) => ({ ...f, incidentNumber: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Date
            <input
              type="date"
              value={form.incidentDate}
              onChange={(e) => setForm((f) => ({ ...f, incidentDate: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Type
            <select
              value={form.incidentType}
              onChange={(e) => setForm((f) => ({ ...f, incidentType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {[
                'NEAR_MISS',
                'FIRST_AID',
                'MEDICAL_TREATMENT',
                'LOST_TIME_INJURY',
                'FATALITY',
                'PROPERTY_DAMAGE',
                'ENVIRONMENTAL',
                'OCCUPATIONAL_DISEASE',
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Severity
            <select
              value={form.severity}
              onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'FATAL'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Location
            <input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Employee
            <input
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Lost Days
            <input
              value={form.lostTimeDays}
              onChange={(e) => setForm((f) => ({ ...f, lostTimeDays: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={raise}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Raise
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Inc #</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Lost Days</th>
                <th className="px-3 py-2">GOSI</th>
                <th className="px-3 py-2">Authority</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{i.incidentNumber}</td>
                  <td className="px-3 py-2 text-xs">{i.incidentDate?.slice(0, 10)}</td>
                  <td className="px-3 py-2 text-xs">{i.incidentType}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sevColor[i.severity] ?? ''}`}
                    >
                      {i.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">{i.location ?? '—'}</td>
                  <td className="px-3 py-2 font-mono text-xs">{i.employeeId ?? '—'}</td>
                  <td className="px-3 py-2">{i.lostTimeDays}</td>
                  <td className="px-3 py-2">{i.gosiNotified ? '✓' : '—'}</td>
                  <td className="px-3 py-2">{i.authorityNotified ? '✓' : '—'}</td>
                  <td className="px-3 py-2 text-xs">{i.status}</td>
                  <td className="px-3 py-2">
                    {i.status === 'OPEN' && (
                      <div className="flex flex-wrap gap-1">
                        {!i.gosiNotified && (
                          <button
                            type="button"
                            onClick={() => call('notify-authority', i.id, { kind: 'gosi' })}
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                          >
                            GOSI
                          </button>
                        )}
                        {!i.authorityNotified && (
                          <button
                            type="button"
                            onClick={() => call('notify-authority', i.id, { kind: 'authority' })}
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                          >
                            Authority
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            call('set-root-cause', i.id, {
                              rootCause: window.prompt('Root cause?') ?? '',
                            })
                          }
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                        >
                          RCA
                        </button>
                        <button
                          type="button"
                          onClick={() => call('close', i.id)}
                          className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-3 py-6 text-center text-slate-500">
                    No incidents.
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
