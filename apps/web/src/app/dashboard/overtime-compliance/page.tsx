'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  totalHours: number;
  totalAmount: number;
  actualsCount: number;
  fraudCount: number;
  exceedsCount: number;
  budgetBreachCount: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function OvertimeHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());

  async function load() {
    const r = await fetch(`/api/v1/overtime-compliance/dashboard?period=${period}`);
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
            <p className="text-sm uppercase text-slate-500">EPIC-12 · GCC Overtime Compliance</p>
            <h1 className="text-2xl font-semibold">Overtime Dashboard</h1>
          </div>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </header>

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-6">
            <Tile label="Actuals" value={data.actualsCount} />
            <Tile label="Total Hours" value={data.totalHours} />
            <Tile label="Total Amount" value={data.totalAmount} />
            <Tile label="Fraud-Flagged" value={data.fraudCount} colour="rose" />
            <Tile label="Daily Cap Breach" value={data.exceedsCount} colour="amber" />
            <Tile label="Budget Breach" value={data.budgetBreachCount} colour="rose" />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            Overtime enforces eligibility + daily/monthly caps per country & grade, applies
            country-specific multipliers via rate cards (WEEKDAY, NIGHT, REST_DAY, HOLIDAY,
            RAMADAN), requires pre-approval, and detects fraud (GHOST_HOURS, EXCESSIVE_DAILY,
            EXCESSIVE_MONTHLY, DUPLICATE_DATE).
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/overtime-compliance/policies"
                className="text-blue-700 hover:underline"
              >
                OT Policies (S01 / S02 / S06)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/overtime-compliance/rate-cards"
                className="text-blue-700 hover:underline"
              >
                Rate Cards (S03 / S07 / S09)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/overtime-compliance/requests"
                className="text-blue-700 hover:underline"
              >
                OT Requests (S04 / S17)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/overtime-compliance/actuals"
                className="text-blue-700 hover:underline"
              >
                Actuals &amp; Fraud (S05 / S13 / S14)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/overtime-compliance/budgets"
                className="text-blue-700 hover:underline"
              >
                Budget Control (S11)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/overtime-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly Certificate (S15 / S17)
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
