'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  templatesPublished: number;
  submissionsTotal: number;
  submissionsApproved: number;
  submissionsRejected: number;
  submissionsPending: number;
  writebackFailures: number;
  slaBreachCount: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function HrFormsHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`/api/v1/hr-forms-compliance/dashboard?period=${period}`);
      const p = await r.json();
      if (p.success) {
        setData(p.data);
      } else {
        setError(p.error?.message ?? 'Failed to load dashboard');
      }
    } catch {
      setError('Network error while loading dashboard');
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
            <p className="text-sm uppercase text-slate-500">EPIC-33 · HR Forms &amp; Templates</p>
            <h1 className="text-2xl font-semibold">HR Forms Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={load}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
            >
              Refresh
            </button>
          </div>
        </header>

        {error ? (
          <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <span>{error}</span>
            <button
              type="button"
              onClick={load}
              className="rounded-md bg-rose-700 px-3 py-1.5 text-xs text-white"
            >
              Retry
            </button>
          </div>
        ) : null}

        {loading ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-7" aria-busy="true">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg border border-slate-200 bg-slate-100"
              />
            ))}
          </section>
        ) : data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-7">
            <Tile
              label="Published Tpl"
              value={data.templatesPublished}
              colour="emerald"
              href="/dashboard/hr-forms-compliance/templates?status=PUBLISHED"
            />
            <Tile
              label="Submissions"
              value={data.submissionsTotal}
              href="/dashboard/hr-forms-compliance/submissions"
            />
            <Tile
              label="Approved"
              value={data.submissionsApproved}
              colour="emerald"
              href="/dashboard/hr-forms-compliance/submissions?status=APPROVED"
            />
            <Tile
              label="Rejected"
              value={data.submissionsRejected}
              colour="slate"
              href="/dashboard/hr-forms-compliance/submissions?status=REJECTED"
            />
            <Tile
              label="Pending"
              value={data.submissionsPending}
              colour="amber"
              href="/dashboard/hr-forms-compliance/submissions?status=IN_REVIEW"
            />
            <Tile
              label="Writeback Failures"
              value={data.writebackFailures}
              colour="rose"
              href="/dashboard/hr-forms-compliance/submissions?writeback=FAILED"
            />
            <Tile
              label="SLA Breaches"
              value={data.slaBreachCount}
              colour="rose"
              href="/dashboard/hr-forms-compliance/certificate"
            />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            Template catalogue groups forms by lifecycle band (RECRUITMENT, EMPLOYMENT, PAYROLL,
            LEAVE_ATTENDANCE, BENEFITS, EMPLOYEE_RELATIONS, SEPARATION, COMPLIANCE), with versioned
            schema and optional write-back target. Routing config defines an ordered stage list with
            approver role / id and SLA hours. Submissions transition DRAFT → SUBMITTED → IN_REVIEW →
            APPROVED/REJECTED, with every stage transition recorded as an e-signature (action / hash
            / IP / UA). Monthly certificate refuses to sign while writeback failures or SLA breaches
            remain.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <Link
                href="/dashboard/hr-forms-compliance/templates"
                className="text-blue-700 hover:underline"
              >
                Template Catalogue (S01 / S02 / S04–S11)
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/hr-forms-compliance/routings"
                className="text-blue-700 hover:underline"
              >
                Routing &amp; SLA Config (S03)
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/hr-forms-compliance/submissions"
                className="text-blue-700 hover:underline"
              >
                Submissions, Approval &amp; E-Signature (S03 / S12)
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/hr-forms-compliance/signatures"
                className="text-blue-700 hover:underline"
              >
                E-Signature Audit Trail
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/hr-forms-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly Compliance Certificate (S14 / S15)
              </Link>
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
          : colour === 'slate'
            ? 'text-slate-600'
            : 'text-slate-900';
  const inner = (
    <div className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-400 hover:shadow-sm">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`text-3xl font-semibold ${cls}`}>{value}</p>
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
