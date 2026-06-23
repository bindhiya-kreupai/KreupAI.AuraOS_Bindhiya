'use client';

import { useEffect, useState } from 'react';

interface Cert {
  id: string;
  countryCode: string;
  period: string;
  status: string;
  domainStatus: Array<{ domain: string; status: string }>;
  criticalOpenRisks: number;
  gatingReason: string | null;
  generatedAt: string | null;
  signedAt: string | null;
}

const GCC = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'];

const monthOptions = () => {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
};

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [country, setCountry] = useState('AE');
  const [period, setPeriod] = useState(monthOptions()[0]);
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch(`/api/v1/gcc-rule-library/certificates?period=${period}`);
    const p = await r.json();
    if (p.success) setCerts(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [period]);

  async function generate() {
    setMessage('');
    const r = await fetch('/api/v1/gcc-rule-library/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate',
        countryCode: country,
        period,
        domainStatus: [
          { domain: 'PAYROLL', status: 'PASS' },
          { domain: 'WPS', status: 'PASS' },
          { domain: 'SOCIAL_INSURANCE', status: 'PASS' },
          { domain: 'NATIONALIZATION', status: 'WARN' },
          { domain: 'IMMIGRATION', status: 'PASS' },
          { domain: 'RECORDS', status: 'PASS' },
        ],
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Generated' : p.error?.message);
    load();
  }

  async function sign(cert: Cert) {
    setMessage('');
    const r = await fetch('/api/v1/gcc-rule-library/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sign',
        countryCode: cert.countryCode,
        period: cert.period,
        attestations: [{ field: 'attestationByCompliance', value: 'Confirmed' }],
      }),
    });
    const p = await r.json();
    setMessage(p.success ? `${cert.countryCode} ${cert.period} signed` : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-36 · S07</p>
          <h1 className="text-2xl font-semibold">Monthly Country Compliance Certificate</h1>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
          <label className="text-sm">
            Country
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {GCC.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Period
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {monthOptions().map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={generate}
            className="md:col-span-2 rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Generate Certificate
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Gating</th>
                <th className="px-3 py-2">Generated</th>
                <th className="px-3 py-2">Signed</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {certs.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{c.countryCode}</td>
                  <td className="px-3 py-2">{c.period}</td>
                  <td className="px-3 py-2">{c.status}</td>
                  <td className="px-3 py-2 text-xs text-rose-700">{c.gatingReason ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{c.generatedAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{c.signedAt?.slice(0, 10) ?? '—'}</td>
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
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {certs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No certificates yet for this period.
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
