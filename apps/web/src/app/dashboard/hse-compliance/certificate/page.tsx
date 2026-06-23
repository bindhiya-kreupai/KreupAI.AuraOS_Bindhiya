'use client';

import { useEffect, useState } from 'react';

interface Cert {
  id: string;
  period: string;
  status: string;
  openRiskAssessments: number;
  highRiskCount: number;
  incidentsOpen: number;
  lostTimeIncidents: number;
  fatalitiesCount: number;
  permitsActive: number;
  permitsOverdue: number;
  trainingExpiringSoon: number;
  trainingExpired: number;
  ltifr: string;
  gatingReason: string | null;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function HseCertPage() {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [period, setPeriod] = useState(periodNow());
  const [hours, setHours] = useState('200000');
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/hse-compliance/certificate');
    const p = await r.json();
    if (p.success) setCerts(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function generate() {
    const r = await fetch('/api/v1/hse-compliance/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate', period, totalHoursWorked: Number(hours) }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Generated' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }
  async function sign(c: Cert) {
    const r = await fetch('/api/v1/hse-compliance/certificate', {
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
            <p className="text-sm uppercase text-slate-500">EPIC-24 · S18 / S19</p>
            <h1 className="text-2xl font-semibold">Monthly HSE Certificate</h1>
          </div>
          <div className="flex gap-2">
            <input
              placeholder="hours worked"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-32 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
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
              Generate
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
                <th className="px-3 py-2">Open Risk</th>
                <th className="px-3 py-2">HIGH/CRIT</th>
                <th className="px-3 py-2">Inc Open</th>
                <th className="px-3 py-2">LTI</th>
                <th className="px-3 py-2">Fatal</th>
                <th className="px-3 py-2">Permits</th>
                <th className="px-3 py-2">Permits Overdue</th>
                <th className="px-3 py-2">Train Expired</th>
                <th className="px-3 py-2">LTIFR</th>
                <th className="px-3 py-2">Gating</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {certs.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{c.period}</td>
                  <td className="px-3 py-2">{c.status}</td>
                  <td className="px-3 py-2">{c.openRiskAssessments}</td>
                  <td className="px-3 py-2 text-rose-700">{c.highRiskCount}</td>
                  <td className="px-3 py-2 text-amber-700">{c.incidentsOpen}</td>
                  <td className="px-3 py-2 text-rose-700">{c.lostTimeIncidents}</td>
                  <td className="px-3 py-2 text-rose-700">{c.fatalitiesCount}</td>
                  <td className="px-3 py-2">{c.permitsActive}</td>
                  <td className="px-3 py-2 text-rose-700">{c.permitsOverdue}</td>
                  <td className="px-3 py-2 text-rose-700">{c.trainingExpired}</td>
                  <td className="px-3 py-2">{c.ltifr}</td>
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
                  <td colSpan={13} className="px-3 py-6 text-center text-slate-500">
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
