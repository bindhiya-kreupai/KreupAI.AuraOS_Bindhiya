'use client';

import { useEffect, useState } from 'react';

interface Cert {
  id: string;
  period: string;
  status: string;
  submissionsCount: number;
  openVariancesCount: number;
  criticalVariancesCount: number;
  lateSubmissionsCount: number;
  gatingReason: string | null;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function CertificatePage() {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [period, setPeriod] = useState(periodNow());
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/gosi-compliance/certificate');
    const p = await r.json();
    if (p.success) setCerts(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function generate() {
    const r = await fetch('/api/v1/gosi-compliance/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate', period }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Generated' : p.error?.message);
    load();
  }
  async function sign(c: Cert) {
    const r = await fetch('/api/v1/gosi-compliance/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sign',
        period: c.period,
        attestations: [{ field: 'attest', value: 'OK' }],
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Signed' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500 dark:text-slate-400 font-semibold">EPIC-13 · S19–S20</p>
            <h1 className="text-2xl font-semibold dark:text-white">Monthly GOSI Compliance Certificate</h1>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="YYYY-MM"
              className="w-24 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-center dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <button
              type="button"
              onClick={generate}
              className="rounded-md bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 px-3 py-2 text-sm text-white dark:text-slate-900 font-semibold transition-colors whitespace-nowrap"
            >
              Generate
            </button>
          </div>
        </header>
        {message ? <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Subs</th>
                <th className="px-3 py-2">Open Var</th>
                <th className="px-3 py-2">Crit Var</th>
                <th className="px-3 py-2">Late</th>
                <th className="px-3 py-2">Gating</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {certs.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                  <td className="px-3 py-2 dark:text-slate-300">{c.period}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${c.status === 'SIGNED' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-450' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 dark:text-slate-300">{c.submissionsCount}</td>
                  <td className="px-3 py-2 dark:text-slate-300">{c.openVariancesCount}</td>
                  <td className="px-3 py-2 text-rose-700 dark:text-rose-400 font-semibold">{c.criticalVariancesCount}</td>
                  <td className="px-3 py-2 text-amber-700 dark:text-amber-400 font-semibold">{c.lateSubmissionsCount}</td>
                  <td className="px-3 py-2 text-xs text-rose-700 dark:text-rose-450">{c.gatingReason ?? '—'}</td>
                  <td className="px-3 py-2">
                    {c.status === 'DRAFT' && !c.gatingReason ? (
                      <button
                        type="button"
                        onClick={() => sign(c)}
                        className="rounded-md bg-emerald-700 hover:bg-emerald-600 px-2 py-1 text-xs text-white font-semibold transition-colors"
                      >
                        Sign
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
              {certs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
                    No certificates.
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
