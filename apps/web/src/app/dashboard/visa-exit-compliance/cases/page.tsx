'use client';

import { useEffect, useState } from 'react';

interface Case {
  id: string;
  employeeId: string;
  countryCode: string;
  scenario: string;
  visaNumber: string | null;
  workPermitNumber: string | null;
  lastWorkingDate: string | null;
  graceExpiresAt: string | null;
  status: string;
  subStatus: string | null;
  dependentsCount: number;
  ticketRequired: boolean;
  ticketIssued: boolean;
  finalSettlementId: string | null;
  siClosureRef: string | null;
  absconding: boolean;
}

const statusColor: Record<string, string> = {
  OPEN: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  AWAITING_AUTHORITY: 'bg-amber-100 text-amber-800',
  AWAITING_EMPLOYEE: 'bg-amber-100 text-amber-800',
  CLOSED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-slate-100 text-slate-700',
};

export default function VisaExitCasesPage() {
  const [rows, setRows] = useState<Case[]>([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({
    employeeId: '',
    countryCode: 'UAE',
    scenario: 'RESIGNATION',
    visaNumber: '',
    workPermitNumber: '',
    passportNumber: '',
    lastWorkingDate: new Date().toISOString().slice(0, 10),
    dependentsCount: '0',
    ticketRequired: false,
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/visa-exit-compliance/cases', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function open() {
    setMessage('');
    const r = await fetch('/api/v1/visa-exit-compliance/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'open',
        ...form,
        dependentsCount: Number(form.dependentsCount),
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Opened' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function transition(id: string, next: string) {
    const r = await fetch('/api/v1/visa-exit-compliance/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'transition', id, next }),
    });
    const p = await r.json();
    setMessage(p.success ? next : p.error?.message);
    load();
  }

  async function setTicket(id: string) {
    const r = await fetch('/api/v1/visa-exit-compliance/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set-ticket-issued', id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Ticket issued' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-29 · S03 / S04 / S07 / S08</p>
            <h1 className="text-2xl font-semibold">Exit Case Orchestration</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="AWAITING_AUTHORITY">AWAITING_AUTHORITY</option>
            <option value="AWAITING_EMPLOYEE">AWAITING_EMPLOYEE</option>
            <option value="CLOSED">CLOSED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-8">
          <label className="text-sm">
            Employee
            <input
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Country
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
            Scenario
            <select
              value={form.scenario}
              onChange={(e) => setForm((f) => ({ ...f, scenario: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {[
                'RESIGNATION',
                'TERMINATION',
                'END_OF_CONTRACT',
                'RETIREMENT',
                'TRANSFER',
                'ABSCONDING',
                'DEATH',
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Visa #
            <input
              value={form.visaNumber}
              onChange={(e) => setForm((f) => ({ ...f, visaNumber: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Permit #
            <input
              value={form.workPermitNumber}
              onChange={(e) => setForm((f) => ({ ...f, workPermitNumber: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Last Day
            <input
              type="date"
              value={form.lastWorkingDate}
              onChange={(e) => setForm((f) => ({ ...f, lastWorkingDate: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Dependents
            <input
              value={form.dependentsCount}
              onChange={(e) => setForm((f) => ({ ...f, dependentsCount: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.ticketRequired}
              onChange={(e) => setForm((f) => ({ ...f, ticketRequired: e.target.checked }))}
            />
            Ticket?
          </label>
          <button
            type="button"
            onClick={open}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white md:col-span-8"
          >
            Open Case (auto-seeds PRO actions)
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Scenario</th>
                <th className="px-3 py-2">Visa</th>
                <th className="px-3 py-2">Last Day</th>
                <th className="px-3 py-2">Grace Exp</th>
                <th className="px-3 py-2">Dep</th>
                <th className="px-3 py-2">Ticket</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{c.employeeId}</td>
                  <td className="px-3 py-2">{c.countryCode}</td>
                  <td className="px-3 py-2 text-xs">
                    {c.scenario}
                    {c.absconding ? ' ⚠' : ''}
                  </td>
                  <td className="px-3 py-2 text-xs font-mono">{c.visaNumber ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{c.lastWorkingDate?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{c.graceExpiresAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2">{c.dependentsCount}</td>
                  <td className="px-3 py-2 text-xs">
                    {c.ticketRequired ? (
                      c.ticketIssued ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">
                          ✓
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setTicket(c.id)}
                          className="rounded-md border border-slate-300 px-2 py-0.5"
                        >
                          issue
                        </button>
                      )
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[c.status] ?? ''}`}
                    >
                      {c.status}
                    </span>
                    {c.subStatus ? (
                      <div className="text-xs text-slate-500">{c.subStatus}</div>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">
                    {c.status !== 'CLOSED' && (
                      <select
                        defaultValue=""
                        onChange={(e) => e.target.value && transition(c.id, e.target.value)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      >
                        <option value="">→ transition</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="AWAITING_AUTHORITY">AWAITING_AUTHORITY</option>
                        <option value="AWAITING_EMPLOYEE">AWAITING_EMPLOYEE</option>
                        <option value="CLOSED">CLOSED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
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
