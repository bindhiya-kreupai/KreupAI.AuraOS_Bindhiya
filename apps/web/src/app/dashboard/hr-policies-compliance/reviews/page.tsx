'use client';

import { useCallback, useEffect, useState } from 'react';

interface Review {
  id: string;
  policyId: string;
  policyTitle: string | null;
  dueAt: string;
  intervalMonths: number;
  lastReviewedAt: string | null;
  outcome: string | null;
  status: string;
}

const OUTCOMES = [
  { value: 'NO_CHANGE', label: 'No change' },
  { value: 'MINOR_UPDATE', label: 'Minor update' },
  { value: 'MAJOR_REWRITE', label: 'Major rewrite' },
] as const;

export default function ReviewsPage() {
  const [rows, setRows] = useState<Review[]>([]);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState<Review | null>(null);
  const [outcome, setOutcome] = useState<string>('NO_CHANGE');
  const [notes, setNotes] = useState('');

  const flash = useCallback((msg: string, isError = false) => {
    setError(isError ? msg : '');
    setMessage(isError ? '' : msg);
    if (!isError) window.setTimeout(() => setMessage(''), 3000);
  }, []);

  const load = useCallback(async () => {
    setError('');
    const url = new URL('/api/v1/hr-policies-compliance/reviews', window.location.origin);
    if (overdueOnly) url.searchParams.set('overdueOnly', 'true');
    url.searchParams.set('pageSize', '200');
    try {
      const r = await fetch(url.toString());
      const p = await r.json();
      if (p.success) setRows(p.data?.items ?? []);
      else setError(p.message ?? p.error?.message ?? 'Failed to load reviews');
    } catch {
      setError('Network error loading reviews');
    }
  }, [overdueOnly]);

  useEffect(() => {
    load();
  }, [load]);

  function openComplete(review: Review) {
    setActive(review);
    setOutcome('NO_CHANGE');
    setNotes('');
  }

  async function submitComplete() {
    if (!active) return;
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/v1/hr-policies-compliance/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          policyId: active.policyId,
          outcome,
          notes: notes.trim() || undefined,
        }),
      });
      const p = await r.json();
      if (p.success) {
        setActive(null);
        flash('Review recorded');
        await load();
      } else {
        flash(p.message ?? p.error?.message ?? 'Failed to record review', true);
      }
    } catch {
      flash('Network error recording review', true);
    } finally {
      setBusy(false);
    }
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

        {error ? (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}

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
                    <td className="px-3 py-2 text-xs">
                      <a
                        href={`/dashboard/hr-policies-compliance/policies?id=${r.policyId}`}
                        className="text-blue-700 hover:underline"
                      >
                        {r.policyTitle ?? r.policyId.slice(0, 8)}
                      </a>
                    </td>
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
                        onClick={() => openComplete(r)}
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

      {active ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Complete review</h2>
            <p className="mb-4 text-sm text-slate-600">{active.policyTitle ?? active.policyId}</p>
            <label className="block text-sm">
              Outcome
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              >
                {OUTCOMES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-sm">
              Reviewer notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={submitComplete}
                className="rounded-md bg-emerald-700 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                {busy ? 'Saving…' : 'Record review'}
              </button>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
