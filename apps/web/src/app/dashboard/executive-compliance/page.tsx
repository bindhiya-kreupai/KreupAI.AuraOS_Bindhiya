'use client';

import { useEffect, useState } from 'react';

interface Domain {
  domain: string;
  label: string;
  score: number;
  ragStatus: string;
  blockingIssues: number;
  certificateStatus: string | null;
  certificateGatingReason: string | null;
}

interface Dashboard {
  period: string;
  domainCount: number;
  greenDomains: number;
  amberDomains: number;
  redDomains: number;
  blockingIssuesTotal: number;
  averageScore: number;
  criticalRisksOpen: number;
  correctiveActionsOpen: number;
  correctiveActionsOverdue: number;
  reviewItemsOverdue: number;
  domainBreakdown: Domain[];
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const ragColor: Record<string, string> = {
  GREEN: 'bg-emerald-100 text-emerald-800',
  AMBER: 'bg-amber-100 text-amber-800',
  RED: 'bg-rose-100 text-rose-800',
};

export default function ExecHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch(`/api/v1/executive-compliance/dashboard?period=${period}`);
    const p = await r.json();
    if (p.success) setData(p.data);
  }
  useEffect(() => {
    load();
  }, [period]);

  async function persistSnapshot() {
    const r = await fetch('/api/v1/executive-compliance/rollup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'persist', period }),
    });
    const p = await r.json();
    setMessage(
      p.success ? 'Snapshot persisted' : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-31 · Executive HR Compliance</p>
            <h1 className="text-2xl font-semibold">Executive Compliance Rollup</h1>
          </div>
          <div className="flex gap-2">
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={persistSnapshot}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Persist Snapshot
            </button>
          </div>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        {data ? (
          <>
            <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <Tile label="Domains" value={data.domainCount} />
              <Tile label="GREEN" value={data.greenDomains} colour="emerald" />
              <Tile label="AMBER" value={data.amberDomains} colour="amber" />
              <Tile label="RED" value={data.redDomains} colour="rose" />
              <Tile label="Avg Score" value={data.averageScore} />
              <Tile label="Blocking Issues" value={data.blockingIssuesTotal} colour="rose" />
              <Tile label="HIGH/CRIT Risks" value={data.criticalRisksOpen} colour="rose" />
              <Tile label="Actions Open" value={data.correctiveActionsOpen} colour="amber" />
              <Tile label="Actions Overdue" value={data.correctiveActionsOverdue} colour="rose" />
              <Tile label="Reviews Overdue" value={data.reviewItemsOverdue} colour="rose" />
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-base font-semibold">Domain Status</h2>
              <table className="mt-3 w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Domain</th>
                    <th className="px-3 py-2">Score</th>
                    <th className="px-3 py-2">RAG</th>
                    <th className="px-3 py-2">Cert Status</th>
                    <th className="px-3 py-2">Blocking</th>
                    <th className="px-3 py-2">Gating Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {data.domainBreakdown.map((d) => (
                    <tr key={d.domain} className="border-b border-slate-100">
                      <td className="px-3 py-2">{d.label}</td>
                      <td className="px-3 py-2 font-semibold">{d.score}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ragColor[d.ragStatus] ?? ''}`}
                        >
                          {d.ragStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">{d.certificateStatus ?? '—'}</td>
                      <td className="px-3 py-2 text-rose-700">{d.blockingIssues}</td>
                      <td className="px-3 py-2 text-xs text-rose-700">
                        {d.certificateGatingReason ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/executive-compliance/risk-heatmap"
                className="text-blue-700 hover:underline"
              >
                Compliance Risk Heatmap (S10)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/executive-compliance/corrective-actions"
                className="text-blue-700 hover:underline"
              >
                Corrective Action Register (S11)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/executive-compliance/review-calendar"
                className="text-blue-700 hover:underline"
              >
                Compliance Review Calendar (S13)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/executive-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Executive Monthly Certificate (S12)
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
