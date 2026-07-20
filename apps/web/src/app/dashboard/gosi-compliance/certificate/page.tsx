'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Calendar,
  FileCheck,
  Plus,
  Check,
  X,
  ShieldAlert,
  Loader2,
  Trash2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    setIsLoading(true);
    try {
      const r = await fetch('/api/v1/gosi-compliance/certificate');
      const p = await r.json();
      if (p.success) setCerts(p.data ?? []);
    } finally {
      setIsLoading(false);
    }
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
    setMessage(p.success ? 'GOSI Certificate generated successfully' : p.error?.message);
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
    setMessage(
      p.success
        ? 'Certificate signed successfully'
        : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    load();
  }

  const filteredCerts = certs.filter((c) => {
    return (
      searchQuery.trim() === '' ||
      c.period.includes(searchQuery) ||
      c.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-8 text-slate-900 dark:text-slate-50 transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header Block */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              EPIC-13 · GOSI COMPLIANCE
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
              GOSI Compliance Certificates
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
              <input
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="YYYY-MM"
                className="w-24 bg-transparent border-0 px-3 py-1.5 text-sm text-center font-semibold focus:outline-none dark:text-white"
              />
              <button
                type="button"
                onClick={generate}
                className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
              >
                Generate
              </button>
            </div>
          </div>
        </header>

        {message ? (
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/50 text-sm text-indigo-750 dark:text-indigo-300 flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-indigo-650" />
            {message}
          </div>
        ) : null}

        {/* Search and Filters Row */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by period YYYY-MM or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>
        </section>

        {/* Results Metadata */}
        <div className="flex items-center justify-between mt-3 mb-1">
          <h2 className="text-xs font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-widest">
            Results ({filteredCerts.length} items)
          </h2>
          <button className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 transition-all shadow-sm">
            Columns
          </button>
        </div>

        {/* Table Panel */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Period</th>
                <th className="px-4 py-3.5">State</th>
                <th className="px-4 py-3.5">Submissions</th>
                <th className="px-4 py-3.5">Open Variances</th>
                <th className="px-4 py-3.5">Critical Variances</th>
                <th className="px-4 py-3.5">Late Submissions</th>
                <th className="px-4 py-3.5">Gating Reason</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={`skel-${i}`} className="animate-pulse">
                      <td colSpan={8} className="px-4 py-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                : filteredCerts.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">
                        {c.period}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                            c.status === 'SIGNED'
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-450 border-emerald-200/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/20'
                          }`}
                        >
                          {c.status === 'SIGNED' ? 'Signed ✓' : c.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-650 dark:text-slate-400">
                        {c.submissionsCount}
                      </td>
                      <td className="px-4 py-4 text-slate-650 dark:text-slate-400">
                        {c.openVariancesCount}
                      </td>
                      <td className="px-4 py-4 text-rose-700 dark:text-rose-400 font-semibold">
                        {c.criticalVariancesCount}
                      </td>
                      <td className="px-4 py-4 text-amber-700 dark:text-amber-450 font-semibold">
                        {c.lateSubmissionsCount}
                      </td>
                      <td className="px-4 py-4 text-xs text-rose-700 dark:text-rose-400 font-medium">
                        {c.gatingReason ?? '—'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {c.status === 'DRAFT' && !c.gatingReason ? (
                          <button
                            type="button"
                            onClick={() => sign(c)}
                            className="rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            Sign
                          </button>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-550 text-xs italic">
                            {c.status === 'SIGNED' ? 'Signed' : 'Blocked'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              {!isLoading && filteredCerts.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-slate-400 dark:text-slate-500 font-medium"
                  >
                    No compliance certificates found.
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
