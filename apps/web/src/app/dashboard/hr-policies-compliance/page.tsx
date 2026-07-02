'use client';

import { useCallback, useEffect, useState } from 'react';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`/api/v1/hr-policies-compliance/dashboard?period=${period}`);
      const p = await r.json();
      if (p.success) setData(p.data);
      else setError(p.message ?? p.error?.message ?? 'Failed to load dashboard');
    } catch {
      setError('Network error loading dashboard');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

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
          <section className="grid grid-cols-2 gap-4 md:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg border border-slate-200 bg-slate-100"
              />
            ))}
          </section>
        ) : data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-6">
            <Tile
              label="Published"
              value={data.publishedCount}
              colour="emerald"
              href="/dashboard/hr-policies-compliance/policies?status=PUBLISHED"
            />
            <Tile
              label="Draft"
              value={data.draftCount}
              href="/dashboard/hr-policies-compliance/policies?status=DRAFT"
            />
            <Tile
              label="Overdue Reviews"
              value={data.overdueReviewsCount}
              colour="rose"
              href="/dashboard/hr-policies-compliance/reviews?overdueOnly=true"
            />
            <Tile
              label="Pending Exceptions"
              value={data.pendingExceptionsCount}
              colour="amber"
              href="/dashboard/hr-policies-compliance/exceptions?status=PENDING"
            />
            <Tile
              label="Ack Coverage %"
              value={data.ackCoveragePct}
              href="/dashboard/hr-policies-compliance/acknowledgements"
            />
            <Tile
              label="Below 90% Ack"
              value={data.ackBelowThresholdCount}
              colour="rose"
              href="/dashboard/hr-policies-compliance/acknowledgements"
            />
          </section>
        ) : (
          <p className="text-sm text-slate-500">No dashboard data available.</p>
        )}

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

function Tile({
  label,
  value,
  colour,
  href,
}: {
  label: string;
  value: number;
  colour?: string;
  href?: string;
}) {
  const cls =
    colour === 'emerald'
      ? 'text-emerald-700'
      : colour === 'rose'
        ? 'text-rose-700'
        : colour === 'amber'
          ? 'text-amber-700'
          : 'text-slate-900';
  const body = (
    <>
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`text-3xl font-semibold ${cls}`}>{value}</p>
    </>
  );
  if (href) {
    return (
      <a
        href={href}
        className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-400 hover:shadow-sm"
      >
        {body}
      </a>
    );
  }
  return <div className="rounded-lg border border-slate-200 bg-white p-4">{body}</div>;
}
