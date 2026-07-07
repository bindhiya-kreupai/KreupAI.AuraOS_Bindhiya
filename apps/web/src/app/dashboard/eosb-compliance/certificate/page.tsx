'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/stores/theme-store';

interface Cert {
  id: string;
  period: string;
  status: string;
  calcsCount: number;
  calcsTotalAmount: string;
  accrualsCount: number;
  accrualsTotalAmount: string;
  openDisputesCount: number;
  unsettledCount: number;
  gatingReason: string | null;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function EosbCertificatePage() {
  const { isDark } = useTheme();
  const [certs, setCerts] = useState<Cert[]>([]);
  const [period, setPeriod] = useState(periodNow());
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/eosb-compliance/certificate');
    const p = await r.json();
    if (p.success) setCerts(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function generate() {
    const r = await fetch('/api/v1/eosb-compliance/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate', period }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Generated' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }
  async function sign(c: Cert) {
    const r = await fetch('/api/v1/eosb-compliance/certificate', {
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
    <main 
      className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50 transition-colors duration-200"
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500 dark:text-slate-400">EPIC-28 · S17 / S19 / S29</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Monthly EOSB Compliance Certificate</h1>
          </div>
          <div className="flex gap-2">
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-md border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={generate}
              className="rounded-md bg-slate-900 dark:bg-slate-750 hover:bg-slate-800 dark:hover:bg-slate-650 px-3 py-2 text-sm text-white transition-colors"
            >
              Generate
            </button>
          </div>
        </header>
        {message ? <p className="text-sm text-amber-600 dark:text-amber-400">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Calcs</th>
                <th className="px-3 py-2">Settlement Total</th>
                <th className="px-3 py-2">Accruals</th>
                <th className="px-3 py-2">Liability Total</th>
                <th className="px-3 py-2">Open Disputes</th>
                <th className="px-3 py-2">Unsettled</th>
                <th className="px-3 py-2">Gating</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {certs.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                  <td className="px-3 py-2 text-slate-800 dark:text-slate-200">{c.period}</td>
                  <td className="px-3 py-2 text-slate-800 dark:text-slate-200">{c.status}</td>
                  <td className="px-3 py-2 text-slate-800 dark:text-slate-200">{c.calcsCount}</td>
                  <td className="px-3 py-2 text-slate-800 dark:text-slate-200">{c.calcsTotalAmount}</td>
                  <td className="px-3 py-2 text-slate-800 dark:text-slate-200">{c.accrualsCount}</td>
                  <td className="px-3 py-2 text-slate-800 dark:text-slate-200">{c.accrualsTotalAmount}</td>
                  <td className="px-3 py-2 text-amber-700 dark:text-amber-450 font-medium">{c.openDisputesCount}</td>
                  <td className="px-3 py-2 text-rose-700 dark:text-rose-450 font-medium">{c.unsettledCount}</td>
                  <td className="px-3 py-2 text-xs text-rose-700 dark:text-rose-455 font-medium">{c.gatingReason ?? '—'}</td>
                  <td className="px-3 py-2">
                    {c.status === 'DRAFT' && !c.gatingReason ? (
                      <button
                        type="button"
                        onClick={() => sign(c)}
                        className="rounded-md bg-emerald-700 dark:bg-emerald-650 hover:bg-emerald-800 dark:hover:bg-emerald-555 px-2 py-1 text-xs text-white transition-colors"
                      >
                        Sign
                      </button>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {certs.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
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
