'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  sitesTotal: number;
  sitesOvercapacity: number;
  inspectionsDue: number;
  openCriticalFindings: number;
  openComplaints: number;
  complaintsSlaBreached: number;
  averageInspectionScore: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function AccHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());

  async function load() {
    const r = await fetch(`/api/v1/accommodation-compliance/dashboard?period=${period}`);
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
              EPIC-23 · Accommodation &amp; Labour Camps
            </p>
            <h1 className="text-2xl font-semibold">Accommodation Compliance Dashboard</h1>
          </div>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </header>

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-7">
            <Tile label="Sites" value={data.sitesTotal} />
            <Tile label="Over Capacity" value={data.sitesOvercapacity} colour="rose" />
            <Tile label="Inspections Due" value={data.inspectionsDue} colour="amber" />
            <Tile label="CRITICAL Open" value={data.openCriticalFindings} colour="rose" />
            <Tile label="Open Complaints" value={data.openComplaints} colour="amber" />
            <Tile label="SLA Breached" value={data.complaintsSlaBreached} colour="rose" />
            <Tile label="Avg Score" value={data.averageInspectionScore} />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            Site master tracks DORMITORY / HOTEL / APARTMENT / LABOUR_CAMP / VILLA / STAFF_HOUSING
            with capacity, manager, contractor, female-only / family-allowed flags, last + next
            inspection dates. Assignment registers per-employee check-in with room / bed / monthly
            allowance; refuses to over-allocate beyond capacity. Inspection register holds
            severity-banded findings (CRITICAL / MAJOR / MINOR) across HYGIENE / FIRE_SAFETY /
            ELECTRICAL / KITCHEN / MEDICAL / WELFARE / SECURITY categories; auto-schedules next
            inspection 3 months out. Complaint register manages OPEN → IN_PROGRESS → RESOLVED with
            48h default SLA. Monthly certificate refuses to sign while over-capacity sites, open
            CRITICAL findings, SLA-breached complaints, or overdue inspections remain.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/accommodation-compliance/sites"
                className="text-blue-700 hover:underline"
              >
                Site Master (S02 / S14)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/accommodation-compliance/assignments"
                className="text-blue-700 hover:underline"
              >
                Assignment Register (S03 / S04 / S10)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/accommodation-compliance/inspections"
                className="text-blue-700 hover:underline"
              >
                Inspections (S05–S09 / S12)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/accommodation-compliance/complaints"
                className="text-blue-700 hover:underline"
              >
                Complaint Register (S15)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/accommodation-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly Certificate (S17 / S18)
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
