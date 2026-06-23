'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  publishedCount: number;
  draftCount: number;
  overdueReviewsCount: number;
  pendingExceptionsCount: number;
  ackCoveragePct: number;
  ackBelowThresholdCount: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function HrPoliciesHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());

  async function load() {
    const r = await fetch(`/api/v1/hr-policies-compliance/dashboard?period=${period}`);
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
            <p className="text-sm uppercase text-slate-500">EPIC-32 · HR Policies Compliance</p>
            <h1 className="text-2xl font-semibold">HR Policies Dashboard</h1>
          </div>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </header>

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-6">
            <Tile label="Published" value={data.publishedCount} colour="emerald" />
            <Tile label="Draft" value={data.draftCount} />
            <Tile label="Overdue Reviews" value={data.overdueReviewsCount} colour="rose" />
            <Tile label="Pending Exceptions" value={data.pendingExceptionsCount} colour="amber" />
            <Tile label="Ack Coverage %" value={data.ackCoveragePct} />
            <Tile label="Below 90% Ack" value={data.ackBelowThresholdCount} colour="rose" />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            Layers over the existing PolicyDocument + PolicyAcknowledgement models to add a publish
            lifecycle that auto-creates a HrPolicyReview (default interval 12 months), an exception
            register (PENDING → APPROVED / REJECTED / CLOSED), and a monthly compliance certificate.
            Certificate refuses to sign while overdue reviews, pending exceptions, or policies below
            90% ack coverage remain.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/hr-policies-compliance/policies"
                className="text-blue-700 hover:underline"
              >
                Policy Lifecycle (S01 / S02 / S07)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/hr-policies-compliance/acknowledgements"
                className="text-blue-700 hover:underline"
              >
                Acknowledgement Coverage (S08)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/hr-policies-compliance/exceptions"
                className="text-blue-700 hover:underline"
              >
                Exception Register (S10)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/hr-policies-compliance/reviews"
                className="text-blue-700 hover:underline"
              >
                Scheduled Reviews (S11)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/hr-policies-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly Certificate (S13 / S14)
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
