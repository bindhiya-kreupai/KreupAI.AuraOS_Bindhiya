'use client';

import { useEffect, useState } from 'react';

interface Summary {
  totalConfigObjects: number;
  activeConfigObjects: number;
  pendingApprovalCount: number;
  openImplementationItems: number;
  failingConnectors: number;
  failingMigrations: number;
  domainsCovered: string[];
  certificateGated: boolean;
  gatingReason: string | null;
}

interface Certificate {
  id: string;
  period: string;
  certificateType: 'MONTHLY' | 'GO_LIVE';
  status: 'DRAFT' | 'READY_TO_SIGN' | 'SIGNED' | 'GATED';
  gatingReason: string | null;
  signedBy: string | null;
  signedAt: string | null;
  totalConfigObjects: number;
  activeConfigObjects: number;
  pendingApprovalCount: number;
  openImplementationItems: number;
  failingConnectors: number;
  failingMigrations: number;
}

const statusColor: Record<string, string> = {
  DRAFT: 'bg-slate-200 text-slate-800',
  READY_TO_SIGN: 'bg-amber-100 text-amber-900',
  SIGNED: 'bg-emerald-100 text-emerald-900',
  GATED: 'bg-rose-100 text-rose-900',
};

export default function CertificatePage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [message, setMessage] = useState('');
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [certificateType, setCertificateType] = useState<'MONTHLY' | 'GO_LIVE'>('MONTHLY');

  async function load() {
    const r1 = await fetch('/api/v1/hrms-config/certificates?action=dashboard');
    const p1 = await r1.json();
    if (p1.success) setSummary(p1.data);
    const r2 = await fetch('/api/v1/hrms-config/certificates');
    const p2 = await r2.json();
    if (p2.success) setCerts(p2.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function generate() {
    setMessage('');
    const r = await fetch('/api/v1/hrms-config/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate', period, certificateType }),
    });
    const p = await r.json();
    setMessage(p.success ? `Generated ${certificateType} cert for ${period}` : p.message);
    load();
  }

  async function sign() {
    setMessage('');
    const r = await fetch('/api/v1/hrms-config/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sign', period, certificateType }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Signed' : p.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-34 · S28 + S29</p>
          <h1 className="text-2xl font-semibold">HRMS Config Certificate</h1>
          <p className="mt-1 text-sm text-slate-600">
            Monthly and go-live sign-off. Signing is gated by pending approvals, open implementation
            items (go-live only), failing connectors, or failed migrations.
          </p>
        </header>

        {message ? <p className="text-sm text-slate-700">{message}</p> : null}

        {summary ? (
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">Current state</h2>
            <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
              <Tile label="Total config objects" value={summary.totalConfigObjects} />
              <Tile label="Active" value={summary.activeConfigObjects} colour="emerald" />
              <Tile
                label="Pending approval"
                value={summary.pendingApprovalCount}
                colour={summary.pendingApprovalCount > 0 ? 'amber' : undefined}
              />
              <Tile
                label="Open mandatory checklist"
                value={summary.openImplementationItems}
                colour={summary.openImplementationItems > 0 ? 'amber' : undefined}
              />
              <Tile
                label="Failing connectors"
                value={summary.failingConnectors}
                colour={summary.failingConnectors > 0 ? 'rose' : undefined}
              />
              <Tile
                label="Failed migrations"
                value={summary.failingMigrations}
                colour={summary.failingMigrations > 0 ? 'rose' : undefined}
              />
              <Tile
                label="Domains covered"
                value={summary.domainsCovered.length}
                colour="emerald"
              />
              <Tile
                label="Gated?"
                value={summary.certificateGated ? 1 : 0}
                colour={summary.certificateGated ? 'rose' : 'emerald'}
              />
            </div>
            {summary.gatingReason ? (
              <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-900">
                Gating: {summary.gatingReason}
              </p>
            ) : null}
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Generate / sign</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="text-sm font-medium">
              Period (YYYY-MM)
              <input
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm font-medium">
              Certificate type
              <select
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value as any)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              >
                <option value="MONTHLY">MONTHLY</option>
                <option value="GO_LIVE">GO_LIVE</option>
              </select>
            </label>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={generate}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
              >
                Generate
              </button>
              <button
                type="button"
                onClick={sign}
                className="rounded-md bg-emerald-700 px-3 py-2 text-sm text-white"
              >
                Sign
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Certificate register</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Period</th>
                <th>Type</th>
                <th>Status</th>
                <th>Active</th>
                <th>Pending</th>
                <th>Gating</th>
                <th>Signed</th>
              </tr>
            </thead>
            <tbody>
              {certs.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 align-top">
                  <td className="py-2 text-xs">{c.period}</td>
                  <td className="text-xs">{c.certificateType}</td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[c.status] ?? ''}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="text-xs">{c.activeConfigObjects}</td>
                  <td className="text-xs">{c.pendingApprovalCount}</td>
                  <td className="text-xs">{c.gatingReason ?? '—'}</td>
                  <td className="text-xs">{c.signedBy ? `${c.signedBy} @ ${c.signedAt}` : '—'}</td>
                </tr>
              ))}
              {certs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-xs text-slate-500">
                    No certificates yet.
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

function Tile({
  label,
  value,
  colour,
}: {
  label: string;
  value: number;
  colour?: 'emerald' | 'amber' | 'rose';
}) {
  const cls =
    colour === 'emerald'
      ? 'text-emerald-700'
      : colour === 'amber'
        ? 'text-amber-700'
        : colour === 'rose'
          ? 'text-rose-700'
          : 'text-slate-900';
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`text-3xl font-semibold ${cls}`}>{value}</p>
    </div>
  );
}
