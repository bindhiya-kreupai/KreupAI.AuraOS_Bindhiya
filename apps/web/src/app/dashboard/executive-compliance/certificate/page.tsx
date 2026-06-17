'use client';

import { useEffect, useState } from 'react';

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
  const [certs, setCerts] = useState<Cert[]>([]);
  const [period, setPeriod] = useState(periodNow());
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/executive-compliance/certificate');
    const p = await r.json();
    if (p.success) setCerts(p.data ?? []);
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
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-31 · S12</p>
            <h1 className="text-2xl font-semibold">Executive Monthly Compliance Certificate</h1>
          </div>
          <div className="flex gap-2">
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={generate}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Generate (persists rollup)
            </button>
          </div>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Domains</th>
                <th className="px-3 py-2 text-emerald-700">G</th>
                <th className="px-3 py-2 text-amber-700">A</th>
                <th className="px-3 py-2 text-rose-700">R</th>
                <th className="px-3 py-2">Avg</th>
                <th className="px-3 py-2">Block</th>
                <th className="px-3 py-2">Risks</th>
                <th className="px-3 py-2">Actions Open</th>
                <th className="px-3 py-2">Actions O/D</th>
                <th className="px-3 py-2">Reviews O/D</th>
                <th className="px-3 py-2">Gating</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {certs.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{c.period}</td>
                  <td className="px-3 py-2">{c.status}</td>
                  <td className="px-3 py-2">{c.domainCount}</td>
                  <td className="px-3 py-2 text-emerald-700">{c.greenDomains}</td>
                  <td className="px-3 py-2 text-amber-700">{c.amberDomains}</td>
                  <td className="px-3 py-2 text-rose-700">{c.redDomains}</td>
                  <td className="px-3 py-2 font-semibold">{c.averageScore}</td>
                  <td className="px-3 py-2 text-rose-700">{c.blockingIssuesTotal}</td>
                  <td className="px-3 py-2 text-rose-700">{c.criticalRisksOpen}</td>
                  <td className="px-3 py-2 text-amber-700">{c.correctiveActionsOpen}</td>
                  <td className="px-3 py-2 text-rose-700">{c.correctiveActionsOverdue}</td>
                  <td className="px-3 py-2 text-rose-700">{c.reviewItemsOverdue}</td>
                  <td className="px-3 py-2 text-xs text-rose-700">{c.gatingReason ?? '—'}</td>
                  <td className="px-3 py-2">
                    {c.status === 'DRAFT' && !c.gatingReason ? (
                      <button
                        type="button"
                        onClick={() => sign(c)}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
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
                  <td colSpan={14} className="px-3 py-6 text-center text-slate-500">
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
