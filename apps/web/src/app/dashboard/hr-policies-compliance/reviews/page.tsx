'use client';

import { useEffect, useState } from 'react';

interface Review {
  id: string;
  policyId: string;
  dueAt: string;
  intervalMonths: number;
  lastReviewedAt: string | null;
  outcome: string | null;
  status: string;
}

export default function ReviewsPage() {
  const [rows, setRows] = useState<Review[]>([]);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/hr-policies-compliance/reviews', window.location.origin);
    if (overdueOnly) url.searchParams.set('overdueOnly', 'true');
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [overdueOnly]);

  async function complete(policyId: string) {
    const outcome = window.prompt('Outcome (NO_CHANGE / MINOR_UPDATE / MAJOR_REWRITE)?') ?? '';
    if (!outcome) return;
    const notes = window.prompt('Reviewer notes?') ?? '';
    const r = await fetch('/api/v1/hr-policies-compliance/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete', policyId, outcome, notes }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Reviewed' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-32 · S11</p>
            <h1 className="text-2xl font-semibold">Scheduled Reviews</h1>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
            />
            Overdue only
          </label>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Policy</th>
                <th className="px-3 py-2">Due</th>
                <th className="px-3 py-2">Interval</th>
                <th className="px-3 py-2">Last Reviewed</th>
                <th className="px-3 py-2">Outcome</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const overdue = new Date(r.dueAt) < new Date();
                return (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">{r.policyId.slice(0, 8)}</td>
                    <td
                      className={`px-3 py-2 text-xs ${overdue ? 'font-semibold text-rose-700' : ''}`}
                    >
                      {r.dueAt?.slice(0, 10)}
                    </td>
                    <td className="px-3 py-2">{r.intervalMonths}mo</td>
                    <td className="px-3 py-2 text-xs">{r.lastReviewedAt?.slice(0, 10) ?? '—'}</td>
                    <td className="px-3 py-2 text-xs">{r.outcome ?? '—'}</td>
                    <td className="px-3 py-2 text-xs">{r.status}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => complete(r.policyId)}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                      >
                        Complete Review
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No scheduled reviews.
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
