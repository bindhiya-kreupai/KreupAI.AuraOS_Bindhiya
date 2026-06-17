'use client';

import { useEffect, useState } from 'react';

interface C {
  id: string;
  caseNumber: string;
  employeeId: string;
  country: string;
  separationType: string;
  noticeRequiredDays: number;
  noticeServedDays: number;
  noticeBuyout: boolean;
  gardenLeave: boolean;
  abandonmentDays: number;
  lastWorkingDate: string | null;
  settlementAgreementSigned: boolean;
  settlementAmount: string | null;
  itAccessRevoked: boolean;
  deathInService: boolean;
  status: string;
}

const statusColor: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-800',
  SUBMITTED: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-indigo-100 text-indigo-800',
  IN_CLEARANCE: 'bg-amber-100 text-amber-800',
  CLOSED: 'bg-emerald-100 text-emerald-800',
  WITHDRAWN: 'bg-slate-100 text-slate-700',
};

export default function CasesPage() {
  const [rows, setRows] = useState<C[]>([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({
    caseNumber: '',
    employeeId: '',
    country: 'UAE',
    separationType: 'RESIGNATION',
    reason: '',
    lastWorkingDate: '',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/separation-compliance/cases', window.location.origin);
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
    const r = await fetch('/api/v1/separation-compliance/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'open',
        ...form,
        reason: form.reason || undefined,
        lastWorkingDate: form.lastWorkingDate || undefined,
      }),
    });
    const p = await r.json();
    setMessage(
      p.success
        ? 'Opened (clearance checklists seeded)'
        : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    load();
  }

  async function call(action: string, id: string, extra: Record<string, unknown> = {}) {
    const r = await fetch('/api/v1/separation-compliance/cases', {
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
            <p className="text-sm uppercase text-slate-500">EPIC-27 · S01–S08 / S10–S13 / S15</p>
            <h1 className="text-2xl font-semibold">Separation Case Orchestration</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="DRAFT">DRAFT</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-7">
          <label className="text-sm">
            Case #
            <input
              value={form.caseNumber}
              onChange={(e) => setForm((f) => ({ ...f, caseNumber: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
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
            Country
            <select
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['UAE', 'KSA', 'BAHRAIN', 'QATAR', 'OMAN', 'KUWAIT'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Type
            <select
              value={form.separationType}
              onChange={(e) => setForm((f) => ({ ...f, separationType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {[
                'RESIGNATION',
                'EMPLOYER_TERMINATION',
                'TERMINATION_FOR_CAUSE',
                'MUTUAL_SEPARATION',
                'REDUNDANCY',
                'END_OF_CONTRACT',
                'PROBATION_END',
                'ABANDONMENT',
                'DEATH',
                'RETIREMENT',
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="text-sm md:col-span-2">
            Reason
            <input
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
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
          <button
            type="button"
            onClick={open}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white md:col-span-7"
          >
            Open Case (auto-seed clearance)
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Case #</th>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Notice</th>
                <th className="px-3 py-2">Last Day</th>
                <th className="px-3 py-2">Settlement</th>
                <th className="px-3 py-2">IT</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const noticeOk = c.noticeBuyout || c.noticeServedDays >= c.noticeRequiredDays;
                return (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">{c.caseNumber}</td>
                    <td className="px-3 py-2 font-mono text-xs">{c.employeeId}</td>
                    <td className="px-3 py-2">{c.country}</td>
                    <td className="px-3 py-2 text-xs">
                      {c.separationType}
                      {c.deathInService ? ' ✝' : ''}
                    </td>
                    <td className={`px-3 py-2 text-xs ${noticeOk ? '' : 'text-rose-700'}`}>
                      {c.noticeServedDays}/{c.noticeRequiredDays}d
                      {c.noticeBuyout ? ' (buyout)' : ''}
                      {c.gardenLeave ? ' GL' : ''}
                    </td>
                    <td className="px-3 py-2 text-xs">{c.lastWorkingDate?.slice(0, 10) ?? '—'}</td>
                    <td className="px-3 py-2 text-xs">
                      {c.settlementAgreementSigned ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">
                          ✓ {c.settlementAmount ?? ''}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {c.itAccessRevoked ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">
                          ✓ revoked
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => call('revoke-it', c.id)}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[c.status] ?? ''}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {c.status === 'DRAFT' && (
                          <button
                            type="button"
                            onClick={() => call('submit', c.id)}
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                          >
                            Submit
                          </button>
                        )}
                        {c.status === 'SUBMITTED' && (
                          <button
                            type="button"
                            onClick={() => call('approve', c.id)}
                            className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                          >
                            Approve
                          </button>
                        )}
                        {c.status !== 'CLOSED' && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                call('set-notice', c.id, {
                                  days: Number(window.prompt('Notice days served?') ?? '0'),
                                  buyout: window.confirm('Buyout?'),
                                  buyoutAmount: window.prompt('Buyout amount?') ?? undefined,
                                })
                              }
                              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                            >
                              Notice
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                call('set-settlement', c.id, {
                                  signed: true,
                                  amount: window.prompt('Settlement amount?') ?? undefined,
                                  eosbCalculationId: window.prompt('EOSB calc ID?') ?? undefined,
                                })
                              }
                              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                            >
                              Settle
                            </button>
                          </>
                        )}
                        {c.status === 'APPROVED' && (
                          <button
                            type="button"
                            onClick={() => call('close', c.id)}
                            className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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
