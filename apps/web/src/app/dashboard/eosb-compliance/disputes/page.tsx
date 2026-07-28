'use client';

import { useEffect, useState } from 'react';
import { EmployeeSearchableSelect } from '@/components/shared/EmployeeSearchableSelect';

interface Dispute {
  id: string;
  employeeId: string;
  calculationId: string | null;
  raisedAt: string;
  subject: string;
  claimedAmount: string | null;
  calculatedAmount: string | null;
  currency: string;
  category: string;
  status: string;
  resolutionNotes: string | null;
}

const statusColor: Record<string, string> = {
  OPEN: 'bg-rose-100 text-rose-800',
  UNDER_REVIEW: 'bg-amber-100 text-amber-800',
  RESOLVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-slate-100 text-slate-700',
  WITHDRAWN: 'bg-slate-100 text-slate-700',
};

export default function EosbDisputesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    employeeId: '',
    calculationId: '',
    subject: '',
    claimedAmount: '',
    calculatedAmount: '',
    currency: 'AED',
    category: 'SALARY_BASIS',
  });
  const [message, setMessage] = useState('');

  async function load() {
    setIsLoading(true);
    try {
      const url = new URL('/api/v1/eosb-compliance/disputes', window.location.origin);
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
    const r = await fetch('/api/v1/eosb-compliance/disputes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'raise',
        ...form,
        calculationId: form.calculationId || undefined,
        claimedAmount: form.claimedAmount ? Number(form.claimedAmount) : undefined,
        calculatedAmount: form.calculatedAmount ? Number(form.calculatedAmount) : undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Raised' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function transition(id: string, next: string) {
    const notes =
      next === 'RESOLVED' || next === 'REJECTED' ? (window.prompt('Resolution notes?') ?? '') : '';
    const r = await fetch('/api/v1/eosb-compliance/disputes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'transition', id, next, resolutionNotes: notes }),
    });
    const p = await r.json();
    setMessage(p.success ? next : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-28 · S13 / S20 / S28</p>
            <h1 className="text-2xl font-semibold">EOSB Dispute Register</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="OPEN">OPEN</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="WITHDRAWN">WITHDRAWN</option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-7">
          <label className="text-sm flex flex-col gap-1">
            Employee Name
            <EmployeeSearchableSelect
              value={form.employeeId}
              onChange={(val) => setForm((f) => ({ ...f, employeeId: val }))}
              placeholder="Search employee..."
            />
          </label>
          <label className="text-sm">
            Calc ID
            <input
              value={form.calculationId}
              onChange={(e) => setForm((f) => ({ ...f, calculationId: e.target.value }))}
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
            Category
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {[
                'SALARY_BASIS',
                'SERVICE_PERIOD',
                'TERMINATION_TYPE',
                'UNPAID_LEAVE',
                'SI_OFFSET',
                'OTHER',
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Claimed
            <input
              value={form.claimedAmount}
              onChange={(e) => setForm((f) => ({ ...f, claimedAmount: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Calculated
            <input
              value={form.calculatedAmount}
              onChange={(e) => setForm((f) => ({ ...f, calculatedAmount: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={raise}
            className="self-end rounded-md bg-slate-900 px-3 py-2 text-sm text-white md:col-span-7"
          >
            Raise Dispute
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Raised</th>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Claimed</th>
                <th className="px-3 py-2">Calc</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={`skel-${i}`} className="animate-pulse">
                      <td colSpan={8} className="px-3 py-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                : rows.map((d) => (
                    <tr key={d.id} className="border-b border-slate-100">
                      <td className="px-3 py-2 text-xs">{d.raisedAt?.slice(0, 10)}</td>
                      <td className="px-3 py-2 font-semibold">
                        <div>{d.employeeName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{d.employeeId}</div>
                      </td>
                      <td className="px-3 py-2">{d.subject}</td>
                      <td className="px-3 py-2 text-xs">{d.category}</td>
                      <td className="px-3 py-2 font-medium">
                        {d.claimedAmount != null ? `${d.claimedAmount} AED` : '—'}
                      </td>
                      <td className="px-3 py-2 font-medium">
                        {d.calculatedAmount != null ? `${d.calculatedAmount} AED` : '—'}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[d.status] ?? ''}`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {d.status === 'OPEN' && (
                          <button
                            type="button"
                            onClick={() => transition(d.id, 'UNDER_REVIEW')}
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                          >
                            Review
                          </button>
                        )}
                        {(d.status === 'OPEN' || d.status === 'UNDER_REVIEW') && (
                          <div className="mt-1 flex gap-1">
                            <button
                              type="button"
                              onClick={() => transition(d.id, 'RESOLVED')}
                              className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                            >
                              Resolve
                            </button>
                            <button
                              type="button"
                              onClick={() => transition(d.id, 'REJECTED')}
                              className="rounded-md bg-rose-700 px-2 py-1 text-xs text-white"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No disputes.
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
