'use client';

import { useEffect, useState } from 'react';

interface G {
  id: string;
  caseNumber: string;
  channel: string;
  grievanceType: string;
  severity: string;
  subject: string;
  isWhistleblower: boolean;
  raisedAt: string;
  slaDays: number;
  status: string;
  outcome: string | null;
  labourAuthorityRef: string | null;
}

const sevColor: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-rose-100 text-rose-800',
  CRITICAL: 'bg-rose-200 text-rose-900',
};

const statusColor: Record<string, string> = {
  OPEN: 'bg-rose-100 text-rose-800',
  IN_PROGRESS: 'bg-amber-100 text-amber-800',
  RESOLVED: 'bg-emerald-100 text-emerald-800',
  REFERRED_TO_AUTHORITY: 'bg-indigo-100 text-indigo-800',
};

export default function GrievancesPage() {
  const [rows, setRows] = useState<G[]>([]);
  const [filter, setFilter] = useState('OPEN');
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    caseNumber: '',
    channel: 'PORTAL',
    grievanceType: 'HARASSMENT',
    severity: 'MEDIUM',
    subject: '',
    description: '',
    isWhistleblower: false,
    slaDays: '30',
  });
  const [message, setMessage] = useState('');

  async function load() {
    setIsLoading(true);
    try {
      const url = new URL('/api/v1/er-compliance/grievances', window.location.origin);
      if (filter) url.searchParams.set('status', filter);
      const r = await fetch(url.toString());
      const p = await r.json();
      if (p.success) {
        setRows(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
      }
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function raise() {
    setMessage('');
    const r = await fetch('/api/v1/er-compliance/grievances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'raise', ...form, slaDays: Number(form.slaDays) }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Raised' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function call(action: string, id: string, extra: Record<string, unknown> = {}) {
    const r = await fetch('/api/v1/er-compliance/grievances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id, ...extra }),
    });
    const p = await r.json();
    setMessage(p.success ? action : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500 dark:text-slate-400">
              EPIC-25 · S02 / S10 / S11
            </p>
            <h1 className="text-2xl font-semibold">Grievance Register</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="REFERRED_TO_AUTHORITY">REFERRED</option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:grid-cols-8">
          <label className="text-sm">
            Case #
            <input
              value={form.caseNumber}
              onChange={(e) => setForm((f) => ({ ...f, caseNumber: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Channel
            <select
              value={form.channel}
              onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1.5"
            >
              {['EMAIL', 'PORTAL', 'HOTLINE', 'IN_PERSON', 'ANONYMOUS', 'WHISTLEBLOWER'].map(
                (c) => (
                  <option key={c}>{c}</option>
                )
              )}
            </select>
          </label>
          <label className="text-sm">
            Type
            <select
              value={form.grievanceType}
              onChange={(e) => setForm((f) => ({ ...f, grievanceType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1.5"
            >
              {[
                'HARASSMENT',
                'DISCRIMINATION',
                'BULLYING',
                'RETALIATION',
                'MANAGEMENT_DISPUTE',
                'WORKING_CONDITIONS',
                'PAY',
                'OTHER',
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
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1.5"
            >
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-sm md:col-span-2">
            Subject
            <input
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            SLA days
            <input
              value={form.slaDays}
              onChange={(e) => setForm((f) => ({ ...f, slaDays: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={raise}
            className="rounded-md bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 text-sm text-white"
          >
            Raise
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Case #</th>
                <th className="px-3 py-2">Raised</th>
                <th className="px-3 py-2">Channel</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Sev</th>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2">SLA</th>
                <th className="px-3 py-2">Authority</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={`skel-${i}`} className="animate-pulse">
                      <td colSpan={10} className="px-3 py-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                : rows.map((g) => {
                    const ageDays =
                      (Date.now() - new Date(g.raisedAt).getTime()) / (24 * 3600 * 1000);
                    const breached = g.status !== 'RESOLVED' && ageDays > g.slaDays;
                    return (
                      <tr key={g.id} className="border-b border-slate-100 dark:border-slate-800/50">
                        <td className="px-3 py-2 font-mono text-xs">{g.caseNumber}</td>
                        <td className="px-3 py-2 text-xs">{g.raisedAt?.slice(0, 10)}</td>
                        <td className="px-3 py-2 text-xs">{g.channel}</td>
                        <td className="px-3 py-2 text-xs">{g.grievanceType}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sevColor[g.severity] ?? ''}`}
                          >
                            {g.severity}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs">{g.subject}</td>
                        <td
                          className={`px-3 py-2 text-xs ${breached ? 'font-semibold text-rose-700 dark:text-rose-400' : ''}`}
                        >
                          {g.slaDays}d{breached ? ' ⚠' : ''}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {g.labourAuthorityRef ?? '—'}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[g.status] ?? ''}`}
                          >
                            {g.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {g.status === 'OPEN' && (
                              <button
                                type="button"
                                onClick={() =>
                                  call('assign', g.id, {
                                    assigneeId: window.prompt('Assignee ID?') ?? '',
                                  })
                                }
                                className="rounded-md border border-slate-300 dark:border-slate-700 dark:hover:bg-slate-800 px-2 py-1 text-xs"
                              >
                                Assign
                              </button>
                            )}
                            {(g.status === 'OPEN' || g.status === 'IN_PROGRESS') && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    call('resolve', g.id, {
                                      outcome: window.prompt('Outcome?') ?? '',
                                    })
                                  }
                                  className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                                >
                                  Resolve
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    call('refer-to-authority', g.id, {
                                      reference: window.prompt('Authority ref?') ?? '',
                                    })
                                  }
                                  className="rounded-md bg-indigo-700 px-2 py-1 text-xs text-white"
                                >
                                  Refer
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-slate-500">
                    No grievances.
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
