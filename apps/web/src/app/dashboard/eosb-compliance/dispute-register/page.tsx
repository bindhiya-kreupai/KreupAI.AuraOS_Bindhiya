'use client';

import { useCallback, useEffect, useState } from 'react';

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

export default function DisputeRegisterPage() {
  const [rows, setRows] = useState<Dispute[]>([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({
    employeeId: '',
    calculationId: '',
    subject: '',
    claimedAmount: '',
    calculatedAmount: '',
    currency: 'AED',
    category: 'SALARY_BASIS',
  });
  // Inline per-row resolution notes — no window.prompt().
  const [rowNotes, setRowNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const url = new URL('/api/v1/eosb-compliance/disputes', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    // List API returns a paginated envelope { items, total, ... }.
    if (p.success) setRows(p.data?.items ?? []);
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function post(body: Record<string, unknown>, okMsg: string) {
    setBusy(true);
    setMessage('');
    try {
      const r = await fetch('/api/v1/eosb-compliance/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const p = await r.json();
      setMessage(p.success ? okMsg : (p.error?.details?.error ?? p.error?.message ?? 'Failed'));
      if (p.success) await load();
    } finally {
      setBusy(false);
    }
  }

  function raise() {
    if (!form.employeeId || !form.subject) {
      setMessage('Employee and subject are required.');
      return;
    }
    void post(
      {
        action: 'raise',
        ...form,
        calculationId: form.calculationId || undefined,
        claimedAmount: form.claimedAmount ? Number(form.claimedAmount) : undefined,
        calculatedAmount: form.calculatedAmount ? Number(form.calculatedAmount) : undefined,
      },
      'Raised'
    );
  }

  function transition(id: string, next: string) {
    void post({ action: 'transition', id, next, resolutionNotes: rowNotes[id] || undefined }, next);
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
          <label className="text-sm">
            Employee
            <input
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
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
            disabled={busy}
            className="self-end rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50 md:col-span-7"
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
              {rows.map((d) => (
                <tr key={d.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 text-xs">{d.raisedAt?.slice(0, 10)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{d.employeeId}</td>
                  <td className="px-3 py-2">{d.subject}</td>
                  <td className="px-3 py-2 text-xs">{d.category}</td>
                  <td className="px-3 py-2">
                    {d.claimedAmount ?? '—'} {d.currency}
                  </td>
                  <td className="px-3 py-2">
                    {d.calculatedAmount ?? '—'} {d.currency}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[d.status] ?? ''}`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {(d.status === 'OPEN' || d.status === 'UNDER_REVIEW') && (
                      <div className="flex flex-col gap-1">
                        <input
                          value={rowNotes[d.id] ?? ''}
                          onChange={(e) => setRowNotes((m) => ({ ...m, [d.id]: e.target.value }))}
                          placeholder="Resolution notes"
                          className="w-44 rounded-md border border-slate-300 px-2 py-1 text-xs"
                        />
                        <div className="flex gap-1">
                          {d.status === 'OPEN' && (
                            <button
                              type="button"
                              onClick={() => transition(d.id, 'UNDER_REVIEW')}
                              disabled={busy}
                              className="rounded-md border border-slate-300 px-2 py-1 text-xs disabled:opacity-50"
                            >
                              Review
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => transition(d.id, 'RESOLVED')}
                            disabled={busy}
                            className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white disabled:opacity-50"
                          >
                            Resolve
                          </button>
                          <button
                            type="button"
                            onClick={() => transition(d.id, 'REJECTED')}
                            disabled={busy}
                            className="rounded-md bg-rose-700 px-2 py-1 text-xs text-white disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
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
