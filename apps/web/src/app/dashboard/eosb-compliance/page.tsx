'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  calcsCount: number;
  calcsTotalAmount: number;
  accrualsCount: number;
  accrualsTotalAmount: number;
  openDisputesCount: number;
  unsettledCount: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function EosbHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());

  async function load() {
    const r = await fetch(`/api/v1/eosb-compliance/dashboard?period=${period}`);
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
            <p className="text-sm uppercase text-slate-500">EPIC-28 · GCC EOSB Compliance</p>
            <h1 className="text-2xl font-semibold">EOSB Compliance Dashboard</h1>
          </div>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </header>

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-6">
            <Tile label="Settlements" value={data.calcsCount} />
            <Tile label="Settlement Total" value={data.calcsTotalAmount} />
            <Tile label="Accruals" value={data.accrualsCount} />
            <Tile label="Accrual Liability" value={data.accrualsTotalAmount} />
            <Tile label="Open Disputes" value={data.openDisputesCount} colour="amber" />
            <Tile label="Unsettled" value={data.unsettledCount} colour="rose" />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            Country-specific EOSB math (UAE 21→30 days/yr, KSA award, BH/QA/OM/KW
            gratuity/indemnity, IN) is wrapped by a persistence layer that finalizes at-separation
            calculations (DRAFT → APPROVED → SETTLED), accrues monthly liability for GL, manages a
            dispute register, and produces a monthly compliance certificate that refuses to sign
            while disputes are open or settlements unpaid.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/eosb-compliance/calculations"
                className="text-blue-700 hover:underline"
              >
                Finalized Calculations (S03 / S06 / S12)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/eosb-compliance/accruals"
                className="text-blue-700 hover:underline"
              >
                Monthly Accruals &amp; GL (S11 / S17)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/eosb-compliance/disputes"
                className="text-blue-700 hover:underline"
              >
                Dispute Register (S13 / S20 / S28)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/eosb-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly Certificate (S17 / S19 / S29)
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
