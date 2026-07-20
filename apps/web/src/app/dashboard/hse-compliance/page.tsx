'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  openRiskAssessments: number;
  highRiskCount: number;
  incidentsOpen: number;
  lostTimeIncidents: number;
  fatalitiesCount: number;
  permitsActive: number;
  permitsOverdue: number;
  trainingExpiringSoon: number;
  trainingExpired: number;
  ltifr: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function HseHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`/api/v1/hse-compliance/dashboard?period=${period}`);
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
  }, [period]);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">
              EPIC-24 · Health, Safety &amp; Welfare
            </p>
            <h1 className="text-2xl font-semibold">HSE Compliance Dashboard</h1>
          </div>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
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
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg border border-slate-200 bg-slate-100"
              />
            ))}
          </section>
        ) : data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Tile label="Open Risks" value={data.openRiskAssessments} />
            <Tile label="HIGH/CRIT" value={data.highRiskCount} colour="rose" />
            <Tile label="Incidents Open" value={data.incidentsOpen} colour="amber" />
            <Tile label="LTI" value={data.lostTimeIncidents} colour="rose" />
            <Tile label="Fatalities" value={data.fatalitiesCount} colour="rose" />
            <Tile label="Permits Active" value={data.permitsActive} />
            <Tile label="Permits Overdue" value={data.permitsOverdue} colour="rose" />
            <Tile label="Training Exp Soon" value={data.trainingExpiringSoon} colour="amber" />
            <Tile label="Training Expired" value={data.trainingExpired} colour="rose" />
            <Tile label="LTIFR" value={data.ltifr} />
          </section>
        ) : (
          <p className="text-sm text-slate-500">
            No records yet for {period}. Data will appear here once HSE records are captured.
          </p>
        )}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            Risk register stores hazard category (PHYSICAL / CHEMICAL / FIRE / WORKING_AT_HEIGHT /
            HEAT_STRESS etc.) with likelihood × severity (1–5 each) producing inherent and residual
            risk scores (1–25) banded as LOW / MEDIUM / HIGH / CRITICAL. Incident register handles
            NEAR_MISS through FATALITY with severity, lost-time tracking, root-cause and
            corrective-action JSON, GOSI / authority notification flags. Permit-to-work issuance
            covers HOT_WORK / CONFINED_SPACE / WORK_AT_HEIGHT etc. with PPE checklist, isolations
            and RAMS. Training register with validity expiry. LTIFR = (LTI × 1,000,000) / total
            hours worked. Monthly certificate refuses to sign while fatalities, HIGH/CRIT risks
            open, overdue permits, or expired training remain.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/hse-compliance/risk-assessments"
                className="text-blue-700 hover:underline"
              >
                Risk Assessments (S03 / S04)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/hse-compliance/incidents"
                className="text-blue-700 hover:underline"
              >
                Incident Register (S09 / S10)
              </a>
            </li>
            <li>
              <a href="/dashboard/hse-compliance/permits" className="text-blue-700 hover:underline">
                Permit-to-Work (S08)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/hse-compliance/training"
                className="text-blue-700 hover:underline"
              >
                Training Register (S06 / S07)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/hse-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly Certificate (S18 / S19)
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
          : 'text-slate-900';
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`text-3xl font-semibold ${cls}`}>{value}</p>
    </div>
  );
}
