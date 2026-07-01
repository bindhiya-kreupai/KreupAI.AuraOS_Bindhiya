'use client';

import { useCallback, useEffect, useState } from 'react';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

interface CoverageRow {
  id: string;
  title: string;
  category: string;
  version: string;
  acknowledgementsRequired: boolean;
  acknowledged: number;
  coveragePct: number;
}

interface MineRow {
  id: string;
  title: string;
  category: string;
  version: string;
  acknowledged: boolean;
  acknowledgedAt: string | null;
}

interface AckRow {
  id: string;
  employeeId: string;
  acknowledgedAt: string;
  ipAddress: string | null;
}

export default function AcknowledgementsPage() {
  const { user, loading } = useCurrentUser();
  const [total, setTotal] = useState('100');
  const [coverage, setCoverage] = useState<CoverageRow[]>([]);
  const [mine, setMine] = useState<MineRow[]>([]);
  const [selected, setSelected] = useState<CoverageRow | null>(null);
  const [ackRows, setAckRows] = useState<AckRow[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const flash = useCallback((msg: string, isError = false) => {
    setError(isError ? msg : '');
    setMessage(isError ? '' : msg);
    if (!isError) window.setTimeout(() => setMessage(''), 3000);
  }, []);

  const load = useCallback(async () => {
    setLoadingData(true);
    setError('');
    try {
      const [cov, m] = await Promise.all([
        fetch(
          `/api/v1/hr-policies-compliance/acknowledgements?view=coverage&totalEmployees=${total}`
        ),
        fetch('/api/v1/hr-policies-compliance/acknowledgements?view=mine'),
      ]);
      const covJson = await cov.json();
      const mineJson = await m.json();
      if (covJson.success) setCoverage(covJson.data ?? []);
      else setError(covJson.message ?? covJson.error?.message ?? 'Failed to load coverage');
      if (mineJson.success) setMine(mineJson.data ?? []);
    } catch {
      setError('Network error loading acknowledgements');
    } finally {
      setLoadingData(false);
    }
  }, [total]);

  useEffect(() => {
    load();
  }, [load]);

  const openPolicyAcks = useCallback(async (row: CoverageRow) => {
    setSelected(row);
    setAckRows([]);
    try {
      const r = await fetch(
        `/api/v1/hr-policies-compliance/acknowledgements?policyId=${row.id}&pageSize=200`
      );
      const p = await r.json();
      if (p.success) setAckRows(p.data?.items ?? []);
    } catch {
      /* surfaced via empty table */
    }
  }, []);

  async function acknowledge(policyId: string) {
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/v1/hr-policies-compliance/acknowledgements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'acknowledge', policyId }),
      });
      const p = await r.json();
      if (p.success) {
        flash('Acknowledged');
        await load();
        if (selected?.id === policyId) await openPolicyAcks(selected);
      } else {
        flash(p.error?.details?.error ?? p.message ?? p.error?.message ?? 'Failed', true);
      }
    } catch {
      flash('Network error acknowledging policy', true);
    } finally {
      setBusy(false);
    }
  }

  const pendingMine = mine.filter((m) => !m.acknowledged);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-32 · S08</p>
          <h1 className="text-2xl font-semibold">Acknowledgement Coverage</h1>
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
          <label className="text-sm">
            Total employee population for coverage calc
            <input
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="ml-2 w-32 rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-base font-semibold">My acknowledgements</h2>
          {loading ? (
            <p className="text-sm text-slate-500">Loading your session…</p>
          ) : !user?.employeeId ? (
            <p className="text-sm text-slate-500">No employee record linked to your account.</p>
          ) : pendingMine.length === 0 ? (
            <p className="text-sm text-emerald-700">
              You have acknowledged all policies that require it.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {pendingMine.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  <span>
                    {m.title}{' '}
                    <span className="text-xs text-slate-500">
                      ({m.category} · v{m.version})
                    </span>
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => acknowledge(m.id)}
                    className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs text-white disabled:opacity-50"
                  >
                    Acknowledge
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-base font-semibold">Per-policy coverage</h2>
          {loadingData ? (
            <p className="text-sm text-slate-500">Loading coverage…</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Policy</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Ack req</th>
                  <th className="px-3 py-2">Acknowledged</th>
                  <th className="px-3 py-2">Coverage %</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {coverage.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">{c.title}</td>
                    <td className="px-3 py-2 text-xs">{c.category}</td>
                    <td className="px-3 py-2">{c.acknowledgementsRequired ? '✓' : '—'}</td>
                    <td className="px-3 py-2">{c.acknowledged}</td>
                    <td
                      className={`px-3 py-2 font-semibold ${c.coveragePct >= 90 ? 'text-emerald-700' : 'text-rose-700'}`}
                    >
                      {c.coveragePct}%
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => openPolicyAcks(c)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      >
                        View acks
                      </button>
                    </td>
                  </tr>
                ))}
                {coverage.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                      No published policies.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>

        {selected ? (
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base font-semibold">Acknowledgements — {selected.title}</h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs"
              >
                Close
              </button>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Employee</th>
                  <th className="px-3 py-2">Acknowledged at</th>
                  <th className="px-3 py-2">IP</th>
                </tr>
              </thead>
              <tbody>
                {ackRows.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">{a.employeeId}</td>
                    <td className="px-3 py-2 text-xs">
                      {new Date(a.acknowledgedAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-xs">{a.ipAddress ?? '—'}</td>
                  </tr>
                ))}
                {ackRows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-slate-500">
                      No acknowledgements yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        ) : null}
      </div>
    </main>
  );
}
