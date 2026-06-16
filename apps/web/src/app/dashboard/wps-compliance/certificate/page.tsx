'use client';

import { useEffect, useState } from 'react';

interface Cert {
  id: string;
  period: string;
  status: string;
  submissionsCount: number;
  delayFlagsCount: number;
  openExceptionsCount: number;
  openPenaltiesCount: number;
  gatingReason: string | null;
}
interface Doc {
  id: string;
  code: string;
  name: string;
  category: string;
  version: number;
  content: string | null;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function CertificatePage() {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [period, setPeriod] = useState(periodNow());
  const [message, setMessage] = useState('');

  async function load() {
    const c = await fetch('/api/v1/wps-compliance/certificate').then((r) => r.json());
    if (c.success) setCerts(c.data ?? []);
    const d = await fetch('/api/v1/wps-compliance/documents').then((r) => r.json());
    if (d.success) setDocs(d.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function generate() {
    const r = await fetch('/api/v1/wps-compliance/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate', period }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Generated' : p.error?.message);
    load();
  }
  async function sign(c: Cert) {
    const r = await fetch('/api/v1/wps-compliance/certificate', {
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
            <p className="text-sm uppercase text-slate-500">EPIC-11 · S14</p>
            <h1 className="text-2xl font-semibold">Monthly WPS Certificate + Document Library</h1>
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
              Generate
            </button>
          </div>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Certificates</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Submissions</th>
                <th className="px-3 py-2">Delays</th>
                <th className="px-3 py-2">Open Exc</th>
                <th className="px-3 py-2">Open Pen</th>
                <th className="px-3 py-2">Gating</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {certs.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{c.period}</td>
                  <td className="px-3 py-2">{c.status}</td>
                  <td className="px-3 py-2">{c.submissionsCount}</td>
                  <td className="px-3 py-2 text-amber-700">{c.delayFlagsCount}</td>
                  <td className="px-3 py-2">{c.openExceptionsCount}</td>
                  <td className="px-3 py-2 text-rose-700">{c.openPenaltiesCount}</td>
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
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No certificates.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Document Library</h2>
          <ul className="mt-3 grid gap-2">
            {docs.map((d) => (
              <li key={d.id} className="rounded-md border border-slate-200 p-3">
                <p className="text-sm font-semibold">
                  {d.name}{' '}
                  <span className="text-xs text-slate-500">
                    v{d.version} · {d.category}
                  </span>
                </p>
                {d.content ? <p className="mt-1 text-xs text-slate-600">{d.content}</p> : null}
              </li>
            ))}
            {docs.length === 0 && <li className="text-sm text-slate-500">No WPS documents.</li>}
          </ul>
        </section>
      </div>
    </main>
  );
}
