'use client';

import { useCallback, useEffect, useState } from 'react';

interface Item {
  id: string;
  title: string;
  domain: string;
  category: string | null;
  ownerId: string | null;
  dueAt: string;
  frequency: string;
  lastCompletedAt: string | null;
  status: string;
}

export default function ComplianceReviewCalendarPage() {
  const [rows, setRows] = useState<Item[]>([]);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [form, setForm] = useState({
    title: '',
    domain: '',
    category: '',
    dueAt: new Date().toISOString().slice(0, 10),
    frequency: 'MONTHLY',
  });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const url = new URL('/api/v1/executive-compliance/review-calendar', window.location.origin);
    if (overdueOnly) url.searchParams.set('overdueOnly', 'true');
    const r = await fetch(url.toString());
    const p = await r.json();
    // List API returns a paginated envelope { items, total, ... }.
    if (p.success) setRows(p.data?.items ?? []);
  }, [overdueOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  async function post(body: Record<string, unknown>, okMsg: string) {
    setBusy(true);
    setMessage('');
    try {
      const r = await fetch('/api/v1/executive-compliance/review-calendar', {
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

  function save() {
    if (!form.title || !form.domain) {
      setMessage('Title and domain are required.');
      return;
    }
    void post({ action: 'upsert', ...form, category: form.category || undefined }, 'Saved');
  }

  function complete(id: string) {
    void post({ action: 'complete', id }, 'Rolled forward');
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-31 · S13</p>
            <h1 className="text-2xl font-semibold">Compliance Review Calendar</h1>
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

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6">
          <label className="text-sm md:col-span-2">
            Title
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Domain
            <input
              value={form.domain}
              onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Due
            <input
              type="date"
              value={form.dueAt}
              onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Frequency
            <select
              value={form.frequency}
              onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Save
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Domain</th>
                <th className="px-3 py-2">Due</th>
                <th className="px-3 py-2">Frequency</th>
                <th className="px-3 py-2">Last Completed</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => {
                const overdue = new Date(i.dueAt) < new Date();
                return (
                  <tr key={i.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">{i.title}</td>
                    <td className="px-3 py-2 font-mono text-xs">{i.domain}</td>
                    <td
                      className={`px-3 py-2 text-xs ${overdue ? 'font-semibold text-rose-700' : ''}`}
                    >
                      {i.dueAt?.slice(0, 10)}
                    </td>
                    <td className="px-3 py-2 text-xs">{i.frequency}</td>
                    <td className="px-3 py-2 text-xs">{i.lastCompletedAt?.slice(0, 10) ?? '—'}</td>
                    <td className="px-3 py-2 text-xs">{i.status}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => complete(i.id)}
                        disabled={busy}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white disabled:opacity-50"
                      >
                        Complete &amp; roll forward
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No items.
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
