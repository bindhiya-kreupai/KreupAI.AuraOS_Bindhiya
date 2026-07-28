'use client';

import { useEffect, useState } from 'react';

interface Snap {
  id: string;
  legalEntityId: string | null;
  snapshotDate: string;
  saudizationPct: string;
  band: string;
}

interface GateResult {
  allowed: boolean;
  band?: string;
  reason?: string;
}

const bandColor: Record<string, string> = {
  PLATINUM: 'bg-indigo-100 text-indigo-800',
  GREEN: 'bg-emerald-100 text-emerald-800',
  YELLOW: 'bg-amber-100 text-amber-800',
  RED: 'bg-rose-100 text-rose-800',
};

const PRIVILEGES: { value: string; label: string }[] = [
  { value: 'hireExpat', label: 'Hire expat worker' },
  { value: 'renewVisa', label: 'Renew visa' },
  { value: 'transferWorker', label: 'Transfer worker' },
];

export default function NitaqatPrivilegeCheckPage() {
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [legalEntityId, setLegalEntityId] = useState('');
  const [privilege, setPrivilege] = useState('hireExpat');
  const [result, setResult] = useState<GateResult | null>(null);
  const [message, setMessage] = useState('');
  const [checking, setChecking] = useState(false);

  async function load() {
    const r = await fetch('/api/v1/nitaqat-compliance/snapshots');
    const p = await r.json();
    if (p.success) setSnaps(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
  }
  useEffect(() => {
    load();
  }, []);

  async function check() {
    setChecking(true);
    setMessage('');
    setResult(null);
    try {
      const r = await fetch('/api/v1/nitaqat-compliance/privilege-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privilege,
          legalEntityId: legalEntityId || null,
        }),
      });
      const p = await r.json();
      if (p.success) {
        setResult(p.data as GateResult);
      } else {
        setMessage(p.error?.message ?? p.message ?? 'Check failed');
      }
    } catch {
      setMessage('Check failed');
    } finally {
      setChecking(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-17 · Nitaqat privileges</p>
          <h1 className="text-2xl font-semibold">Privilege Check</h1>
          <p className="mt-1 text-sm text-slate-600">
            Nitaqat bands gate Qiwa work-permit privileges. RED and YELLOW bands lose the ability to
            hire expats, renew visas, or transfer workers. Run a live privilege check against the
            establishment&apos;s latest band snapshot before initiating a Qiwa transaction.
          </p>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
          <label className="text-sm md:col-span-2">
            Legal Entity ID (blank = tenant default)
            <input
              value={legalEntityId}
              onChange={(e) => setLegalEntityId(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              placeholder="optional"
            />
          </label>
          <label className="text-sm">
            Privilege
            <select
              value={privilege}
              onChange={(e) => setPrivilege(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {PRIVILEGES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={check}
              disabled={checking}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
            >
              {checking ? 'Checking…' : 'Check privilege'}
            </button>
          </div>
        </section>

        {message ? <p className="text-sm text-rose-700">{message}</p> : null}

        {result ? (
          <section
            className={`rounded-lg border p-4 ${
              result.allowed ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
            }`}
          >
            <p className="text-base font-semibold">
              {result.allowed ? 'Privilege permitted' : 'Privilege blocked'}
            </p>
            {result.band ? (
              <p className="mt-1 text-sm text-slate-700">
                Current band:{' '}
                <span
                  className={`rounded px-1.5 py-0.5 ${bandColor[result.band] ?? 'bg-slate-100 text-slate-700'}`}
                >
                  {result.band}
                </span>
              </p>
            ) : null}
            {result.reason ? <p className="mt-1 text-sm text-slate-700">{result.reason}</p> : null}
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Latest band snapshots</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Legal entity</th>
                <th>Date</th>
                <th>Saudization %</th>
                <th>Band</th>
              </tr>
            </thead>
            <tbody>
              {snaps.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="py-2 font-mono text-xs">{s.legalEntityId ?? 'default'}</td>
                  <td className="text-xs">{s.snapshotDate.slice(0, 10)}</td>
                  <td className="text-xs">{s.saudizationPct}</td>
                  <td className="text-xs">
                    <span
                      className={`rounded px-1.5 py-0.5 ${bandColor[s.band] ?? 'bg-slate-100 text-slate-700'}`}
                    >
                      {s.band}
                    </span>
                  </td>
                </tr>
              ))}
              {snaps.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-xs text-slate-500">
                    No snapshots yet. Take a band snapshot first.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
