'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  publishedHolidaysCount: number;
  provisionalCount: number;
  workApprovalsTotal: number;
  workApprovalsPending: number;
  compOffAvailableDays: number;
  compOffExpiringSoon: number;
  unapprovedHolidayWorkCount: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function HolidaysHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`/api/v1/holidays-compliance/dashboard?period=${period}`);
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
              EPIC-21 · Public &amp; Religious Holidays
            </p>
            <h1 className="text-2xl font-semibold">Holiday Compliance Dashboard</h1>
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
          <section className="grid grid-cols-2 gap-4 md:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg border border-slate-200 bg-slate-100"
              />
            ))}
          </section>
        ) : data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-7">
            <Tile label="Published" value={data.publishedHolidaysCount} colour="emerald" />
            <Tile label="Provisional" value={data.provisionalCount} colour="amber" />
            <Tile label="Approvals Total" value={data.workApprovalsTotal} />
            <Tile label="Approvals Pending" value={data.workApprovalsPending} colour="amber" />
            <Tile label="Comp-Off Avail" value={data.compOffAvailableDays} />
            <Tile label="Comp-Off ≤30d" value={data.compOffExpiringSoon} colour="rose" />
            <Tile label="Unapproved Work" value={data.unapprovedHolidayWorkCount} colour="rose" />
          </section>
        ) : (
          <p className="text-sm text-slate-500">
            No records yet for {period}. Data will appear here once holidays and approvals are
            recorded.
          </p>
        )}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            Layered over existing Holiday + HolidayCalendar models. Country × holiday-class pay rule
            (NATIONAL / RELIGIOUS / EID / ISLAMIC_NEW_YEAR / RAMADAN / SPECIAL / SECTOR) seeded with
            default base 1× + OT 2× (UAE/QA 2.5×) and 1d comp-off accrual. Work-on-holiday approval
            workflow auto-accrues comp-off (6-month expiry) on approve. Comp-off ledger tracks days
            accrued vs consumed with status AVAILABLE/CONSUMED. Monthly certificate refuses to sign
            while pending approvals, unapproved past-date holiday work, or comp-off expiring ≤30
            days remain.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/holidays-compliance/pay-rules"
                className="text-blue-700 hover:underline"
              >
                Holiday Pay Rules (S06 / S07)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/holidays-compliance/work-approvals"
                className="text-blue-700 hover:underline"
              >
                Holiday Work Approvals (S05 / S17)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/holidays-compliance/comp-off"
                className="text-blue-700 hover:underline"
              >
                Comp-Off Ledger (S07)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/holidays-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly Certificate (S14 / S16)
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
