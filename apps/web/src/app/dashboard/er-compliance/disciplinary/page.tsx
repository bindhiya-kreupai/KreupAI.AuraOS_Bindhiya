'use client';

import { useEffect, useState } from 'react';
import { EmployeeSearchableSelect } from '@/components/shared/EmployeeSearchableSelect';

interface A {
  id: string;
  actionNumber: string;
  employeeId: string;
  misconductType: string;
  severity: string;
  actionType: string;
  warningCount: number;
  suspensionDays: number;
  salaryDeductionDays: number;
  salaryDeductionPct: string;
  hearingHeld: boolean;
  hearingDate: string | null;
  responseRecorded: boolean;
  country: string | null;
  status: string;
  effectiveFrom: string | null;
}

const statusColor: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-800',
  ISSUED: 'bg-emerald-100 text-emerald-800',
};

export default function DisciplinaryPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    actionNumber: '',
    employeeId: '',
    misconductType: '',
    severity: 'MEDIUM',
    actionType: 'WRITTEN_WARNING',
    salaryDeductionPct: '0',
    country: 'UAE',
  });
  const [message, setMessage] = useState('');

  async function load() {
    setIsLoading(true);
    try {
      const url = new URL('/api/v1/er-compliance/disciplinary', window.location.origin);
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

  async function draft() {
    setMessage('');
    const r = await fetch('/api/v1/er-compliance/disciplinary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'draft',
        ...form,
        salaryDeductionPct: Number(form.salaryDeductionPct),
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Drafted' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function call(action: string, id: string, extra: Record<string, unknown> = {}) {
    const r = await fetch('/api/v1/er-compliance/disciplinary', {
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
              EPIC-26 · S02 / S05 / S06
            </p>
            <h1 className="text-2xl font-semibold">Disciplinary Action Register</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ISSUED">ISSUED</option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:grid-cols-7">
          <label className="text-sm">
            Action #
            <input
              value={form.actionNumber}
              onChange={(e) => setForm((f) => ({ ...f, actionNumber: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm flex flex-col gap-1">
            Employee Name
            <EmployeeSearchableSelect
              value={form.employeeId}
              onChange={(val) => setForm((f) => ({ ...f, employeeId: val }))}
              placeholder="Search employee..."
            />
          </label>
          <label className="text-sm">
            Misconduct
            <input
              value={form.misconductType}
              onChange={(e) => setForm((f) => ({ ...f, misconductType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Action Type
            <select
              value={form.actionType}
              onChange={(e) => setForm((f) => ({ ...f, actionType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1.5"
            >
              {[
                'VERBAL_WARNING',
                'WRITTEN_WARNING',
                'FINAL_WARNING',
                'SUSPENSION',
                'DEMOTION',
                'SALARY_DEDUCTION',
                'TERMINATION',
              ].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Sal Ded %
            <input
              value={form.salaryDeductionPct}
              onChange={(e) => setForm((f) => ({ ...f, salaryDeductionPct: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Country
            <select
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1.5"
            >
              {['UAE', 'KSA', 'BAHRAIN', 'QATAR', 'OMAN', 'KUWAIT'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={draft}
            className="rounded-md bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 text-sm text-white"
          >
            Draft
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Action #</th>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Misconduct</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Hearing</th>
                <th className="px-3 py-2">Sal Ded %</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr
                      key={`skel-${i}`}
                      className="border-b border-slate-100 dark:border-slate-800/50 animate-pulse"
                    >
                      <td colSpan={9} className="px-3 py-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                : rows.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800/50">
                      <td className="px-3 py-2 font-mono text-xs">{a.actionNumber}</td>
                      <td className="px-3 py-2 font-semibold">
                        <div>{a.employeeName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{a.employeeId}</div>
                      </td>
                      <td className="px-3 py-2 text-xs">{a.misconductType}</td>
                      <td className="px-3 py-2 text-xs">{a.actionType}</td>
                      <td className="px-3 py-2 text-xs">
                        {a.hearingHeld ? `✓ ${a.hearingDate?.slice(0, 10)}` : '—'}
                      </td>
                      <td className="px-3 py-2">{a.salaryDeductionPct}%</td>
                      <td className="px-3 py-2">{a.country ?? '—'}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[a.status] ?? ''}`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {a.status === 'DRAFT' && !a.hearingHeld && (
                            <button
                              type="button"
                              onClick={() =>
                                call('record-hearing', a.id, {
                                  hearingDate: new Date().toISOString().slice(0, 10),
                                })
                              }
                              className="rounded-md border border-slate-300 dark:border-slate-700 dark:hover:bg-slate-800 px-2 py-1 text-xs"
                            >
                              Record Hearing
                            </button>
                          )}
                          {a.status === 'DRAFT' && a.hearingHeld && (
                            <button
                              type="button"
                              onClick={() =>
                                call('issue', a.id, {
                                  effectiveFrom: new Date().toISOString().slice(0, 10),
                                })
                              }
                              className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                            >
                              Issue
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-6 text-center text-slate-500 dark:text-slate-400"
                  >
                    No actions.
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
