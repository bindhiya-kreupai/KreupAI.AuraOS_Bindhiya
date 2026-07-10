'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/stores/theme-store';
import { FileCheck, Sparkles, AlertTriangle } from 'lucide-react';

interface Cert {
  id: string;
  period: string;
  status: string;
  domainCount: number;
  greenDomains: number;
  amberDomains: number;
  redDomains: number;
  blockingIssuesTotal: number;
  averageScore: string;
  criticalRisksOpen: number;
  correctiveActionsOpen: number;
  correctiveActionsOverdue: number;
  reviewItemsOverdue: number;
  gatingReason: string | null;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function ExecCertPage() {
  const { isDark } = useTheme();
  const [certs, setCerts] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(periodNow());
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/v1/executive-compliance/certificate');
      const p = await r.json();
      if (p.success) {
        setCerts(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
      }
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function generate() {
    const r = await fetch('/api/v1/executive-compliance/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate', period }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Generated' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }
  async function sign(c: Cert) {
    const r = await fetch('/api/v1/executive-compliance/certificate', {
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
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              EPIC-31 · S12
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
              Executive Monthly Certificate
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="YYYY-MM"
              className="w-28 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-center font-mono text-slate-700 dark:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
            <button
              type="button"
              onClick={generate}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 px-4 py-2.5 text-sm text-white dark:text-slate-900 font-bold shadow-sm transition-all whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4" />
              Generate
            </button>
          </div>
        </header>

        {message ? (
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {message}
          </div>
        ) : null}

        {/* Certificates Table */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              Certificate History
            </h2>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-400">
              {certs.length} certificates
            </span>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 flex-1 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                  <tr>
                    <th className="px-5 py-3">Period</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Domains</th>
                    <th className="px-5 py-3 text-emerald-700 dark:text-emerald-400">G</th>
                    <th className="px-5 py-3 text-amber-700 dark:text-amber-400">A</th>
                    <th className="px-5 py-3 text-rose-700 dark:text-rose-400">R</th>
                    <th className="px-5 py-3">Avg</th>
                    <th className="px-5 py-3">Block</th>
                    <th className="px-5 py-3">Risks</th>
                    <th className="px-5 py-3">Actions Open</th>
                    <th className="px-5 py-3">Actions O/D</th>
                    <th className="px-5 py-3">Reviews O/D</th>
                    <th className="px-5 py-3">Gating</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {certs.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {c.period}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${c.status === 'SIGNED' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                        {c.domainCount}
                      </td>
                      <td className="px-5 py-3 text-emerald-700 dark:text-emerald-400 font-bold">
                        {c.greenDomains}
                      </td>
                      <td className="px-5 py-3 text-amber-700 dark:text-amber-400 font-bold">
                        {c.amberDomains}
                      </td>
                      <td className="px-5 py-3 text-rose-700 dark:text-rose-400 font-bold">
                        {c.redDomains}
                      </td>
                      <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">
                        {c.averageScore}
                      </td>
                      <td className="px-5 py-3 text-rose-700 dark:text-rose-400 font-bold">
                        {c.blockingIssuesTotal}
                      </td>
                      <td className="px-5 py-3 text-rose-700 dark:text-rose-400 font-bold">
                        {c.criticalRisksOpen}
                      </td>
                      <td className="px-5 py-3 text-amber-700 dark:text-amber-400 font-bold">
                        {c.correctiveActionsOpen}
                      </td>
                      <td className="px-5 py-3 text-rose-700 dark:text-rose-400 font-bold">
                        {c.correctiveActionsOverdue}
                      </td>
                      <td className="px-5 py-3 text-rose-700 dark:text-rose-400 font-bold">
                        {c.reviewItemsOverdue}
                      </td>
                      <td className="px-5 py-3 text-xs text-rose-700 dark:text-rose-400">
                        {c.gatingReason ?? '—'}
                      </td>
                      <td className="px-5 py-3">
                        {c.status === 'DRAFT' && !c.gatingReason ? (
                          <button
                            type="button"
                            onClick={() => sign(c)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1.5 text-xs text-white font-bold transition-colors shadow-sm"
                          >
                            <FileCheck className="h-3 w-3" />
                            Sign
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {certs.length === 0 && (
                    <tr>
                      <td
                        colSpan={14}
                        className="px-5 py-10 text-center text-slate-400 dark:text-slate-500"
                      >
                        No certificates found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
