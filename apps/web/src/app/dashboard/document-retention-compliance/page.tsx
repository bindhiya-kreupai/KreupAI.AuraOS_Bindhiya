'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  activeDocs: number;
  expiringSoonCount: number;
  expiredCount: number;
  litigationHoldCount: number;
  pendingDisposalCount: number;
  openFindingsCount: number;
  criticalFindingsCount: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function DocRetHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());

  async function load() {
    const r = await fetch(`/api/v1/document-retention-compliance/dashboard?period=${period}`);
    const p = await r.json();
    if (p.success) setData(p.data);
  }
  useEffect(() => {
    load();
  }, [period]);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">
              EPIC-30 · Document Retention &amp; HR Audit
            </p>
            <h1 className="text-2xl font-semibold">HR Document Compliance Dashboard</h1>
          </div>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </header>

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-7">
            <Tile label="Active Docs" value={data.activeDocs} />
            <Tile label="Expiring ≤60d" value={data.expiringSoonCount} colour="amber" />
            <Tile label="Expired" value={data.expiredCount} colour="rose" />
            <Tile label="On Hold" value={data.litigationHoldCount} colour="indigo" />
            <Tile label="Pending Disposal" value={data.pendingDisposalCount} colour="amber" />
            <Tile label="Open Findings" value={data.openFindingsCount} colour="amber" />
            <Tile label="CRITICAL" value={data.criticalFindingsCount} colour="rose" />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            Configurable retention schedule per record type / country (CONTRACT 7y, PAYROLL_RECORD
            7y, MEDICAL 30y, …). Document upsert auto-computes retentionUntil from issuedAt +
            schedule. Litigation hold attaches a case to a scope and prevents disposal. Disposal
            workflow refuses any document on hold or before retentionUntil. HR audit cycles raise
            severity-tagged findings (LOW/MEDIUM/HIGH/CRITICAL); the monthly certificate refuses to
            sign while CRITICAL findings, expired docs, or pending disposals remain.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/document-retention-compliance/schedule"
                className="text-blue-700 hover:underline"
              >
                Retention Schedule (S04 / S18)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/document-retention-compliance/documents"
                className="text-blue-700 hover:underline"
              >
                HR Document Register (S02 / S03 / S05 / S09)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/document-retention-compliance/litigation-holds"
                className="text-blue-700 hover:underline"
              >
                Litigation Holds (S10)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/document-retention-compliance/disposal"
                className="text-blue-700 hover:underline"
              >
                Disposal Workflow (S11)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/document-retention-compliance/audit"
                className="text-blue-700 hover:underline"
              >
                HR Audit Cycles &amp; Findings (S12 / S13 / S17)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/document-retention-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly Certificate (S16)
              </a>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}

function Tile({ label, value, colour }: { label: string; value: number; colour?: string }) {
  const cls =
    colour === 'emerald'
      ? 'text-emerald-700'
      : colour === 'rose'
        ? 'text-rose-700'
        : colour === 'amber'
          ? 'text-amber-700'
          : colour === 'indigo'
            ? 'text-indigo-700'
            : 'text-slate-900';
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`text-3xl font-semibold ${cls}`}>{value}</p>
    </div>
  );
}
