'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  counts: {
    matrixItems: number;
    countriesCovered: number;
    alertsExpired: number;
    alerts7d: number;
    alerts30d: number;
    alerts60d: number;
    transfersRequested: number;
    transfersOverdue: number;
    checklist: number;
    checklistOverdue: number;
    checklistFailingHighOrCritical: number;
    risksOpen: number;
    certificates: number;
    certificatesSigned: number;
  };
  countries: string[];
  transferTypes: string[];
}

export default function ImmigrationCompliancePage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/v1/immigration-compliance/dashboard');
      const p = await r.json();
      if (p.success) setData(p.data);
      else setError(p.error?.message ?? p.message ?? 'Failed to load dashboard');
    } catch {
      setError('Network error while loading dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">
            EPIC-07 · Immigration & Work Authorization
          </p>
          <h1 className="text-2xl font-semibold">Immigration Compliance Command Centre</h1>
          <p className="mt-1 text-sm text-slate-600">
            Authorization matrix per country, 60/30/7-day renewal alert ladder, transfer/mobility
            workflow, audit checklist and risk register. Monthly compliance certificate refuses to
            sign while expired documents, 7-day alerts, overdue transfers, HIGH/CRITICAL findings or
            critical risks remain.
          </p>
        </header>

        {error ? (
          <div className="flex items-center justify-between rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span>{error}</span>
            <button
              type="button"
              onClick={load}
              className="rounded-md border border-rose-300 px-3 py-1.5 text-xs"
            >
              Retry
            </button>
          </div>
        ) : null}

        {loading ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg border border-slate-200 bg-slate-100"
              />
            ))}
          </section>
        ) : data ? (
          <>
            <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <Tile label="Matrix Items" value={data.counts.matrixItems} />
              <Tile label="Countries" value={data.counts.countriesCovered} />
              <Tile label="EXPIRED" value={data.counts.alertsExpired} colour="rose" />
              <Tile label="≤7d" value={data.counts.alerts7d} colour="rose" />
              <Tile label="≤30d" value={data.counts.alerts30d} colour="amber" />
              <Tile label="≤60d" value={data.counts.alerts60d} colour="amber" />
              <Tile label="Transfers Open" value={data.counts.transfersRequested} />
              <Tile label="Transfers O/D" value={data.counts.transfersOverdue} colour="rose" />
              <Tile
                label="Chk Fail H/C"
                value={data.counts.checklistFailingHighOrCritical}
                colour="rose"
              />
              <Tile label="Chk Overdue" value={data.counts.checklistOverdue} colour="rose" />
              <Tile label="Risks Open" value={data.counts.risksOpen} colour="amber" />
              <Tile label="Signed Certs" value={data.counts.certificatesSigned} colour="emerald" />
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
              <h2 className="text-base font-semibold">Coverage</h2>
              <p className="mt-2 text-xs text-slate-500">Countries</p>
              <p>{data.countries.join(' · ')}</p>
              <p className="mt-2 text-xs text-slate-500">Transfer types</p>
              <p>{data.transferTypes.join(' · ')}</p>
            </section>
          </>
        ) : (
          <p className="text-sm text-slate-500">
            No records yet. Data will appear here once immigration records are captured.
          </p>
        )}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/immigration-compliance/authorization-matrix"
                className="text-blue-700 hover:underline"
              >
                Country Authorization Matrix (S02/S03)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/immigration-compliance/renewal-alerts"
                className="text-blue-700 hover:underline"
              >
                Renewal Alerts 60/30/7-day (S08)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/immigration-compliance/transfer-case"
                className="text-blue-700 hover:underline"
              >
                Transfer & Mobility Cases (S06)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/immigration-compliance/audit-checklist"
                className="text-blue-700 hover:underline"
              >
                Immigration Audit Checklist (S11)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/immigration-compliance/risk-register"
                className="text-blue-700 hover:underline"
              >
                Immigration Risk Register (S13)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/immigration-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly Compliance Certificate
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
