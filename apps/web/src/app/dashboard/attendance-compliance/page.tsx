'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  punchesTotal: number;
  missingPunchCount: number;
  lateCount: number;
  regularizationsPending: number;
  fraudFlagsOpen: number;
  absconding3DayCount: number;
  consentMissingCount: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function AttHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());

  async function load() {
    const r = await fetch(`/api/v1/attendance-compliance/dashboard?period=${period}`);
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
            <p className="text-sm uppercase text-slate-500">EPIC-19 · GCC Attendance Compliance</p>
            <h1 className="text-2xl font-semibold">Attendance Compliance Dashboard</h1>
          </div>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </header>

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-7">
            <Tile label="Punches" value={data.punchesTotal} />
            <Tile label="Missing Punch" value={data.missingPunchCount} colour="amber" />
            <Tile label="Late" value={data.lateCount} colour="amber" />
            <Tile label="Reg Pending" value={data.regularizationsPending} colour="amber" />
            <Tile label="Fraud Open" value={data.fraudFlagsOpen} colour="rose" />
            <Tile label="Absconding 3+d" value={data.absconding3DayCount} colour="rose" />
            <Tile label="Consent Missing" value={data.consentMissingCount} colour="rose" />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            Compliance layer on top of the existing AttendancePunch / AttendanceRecord / Shift /
            Roster / AttendanceRegularization models. Country × grade policy defines tolerances,
            SLAs, fraud thresholds, biometric and consent requirements. Fraud register flags
            BUDDY_PUNCH (identical-second twin punches), GEO_MISMATCH (outside geofence), SHARED_IP,
            TIME_DRIFT (&gt;5 min clock skew), GHOST_PRESENCE (no biometric). Consent register
            tracks BIOMETRIC / GEOLOCATION / PHOTO_VERIFICATION grant + revoke. Monthly certificate
            refuses to sign while open fraud flags, absconding cases, missing consents, or pending
            regularizations remain.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/attendance-compliance/policies"
                className="text-blue-700 hover:underline"
              >
                Attendance Policy (S02 / S03 / S04 / S12)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/attendance-compliance/fraud-flags"
                className="text-blue-700 hover:underline"
              >
                Fraud Register (S16)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/attendance-compliance/consents"
                className="text-blue-700 hover:underline"
              >
                Biometric/Geolocation Consent (S17)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/attendance-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly Certificate (S19 / S21)
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
