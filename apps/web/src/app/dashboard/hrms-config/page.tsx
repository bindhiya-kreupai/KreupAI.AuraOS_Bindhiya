'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  counts: {
    ruleSets: number;
    ruleSetsByStatus: Record<string, number>;
    approvals: number;
    approvalsActive: number;
    notifications: number;
    notificationsActive: number;
    audits: number;
    domainsCovered: number;
  };
  supportedCountries: string[];
  supportedDomains: string[];
  channels: string[];
}

export default function HrmsConfigHome() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/v1/hrms-config/dashboard');
      const p = await r.json();
      if (p.success) setData(p.data);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-34 · HRMS Configuration</p>
          <h1 className="text-2xl font-semibold">HRMS Configuration for GCC Compliance</h1>
          <p className="mt-1 text-sm text-slate-600">
            Versioned country rule sets, approval workflow templates, notification rules and
            audit-trail capture policies that drive every compliance domain.
          </p>
        </header>

        {data ? (
          <>
            <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Tile label="Country Rule Sets" value={data.counts.ruleSets} />
              <Tile
                label="Published"
                value={data.counts.ruleSetsByStatus.PUBLISHED ?? 0}
                colour="emerald"
              />
              <Tile label="Draft" value={data.counts.ruleSetsByStatus.DRAFT ?? 0} colour="amber" />
              <Tile
                label="Superseded"
                value={data.counts.ruleSetsByStatus.SUPERSEDED ?? 0}
                colour="slate"
              />
              <Tile label="Approval Templates" value={data.counts.approvals} />
              <Tile label="Active" value={data.counts.approvalsActive} colour="emerald" />
              <Tile label="Notification Rules" value={data.counts.notifications} />
              <Tile label="Active" value={data.counts.notificationsActive} colour="emerald" />
              <Tile label="Audit Settings" value={data.counts.audits} />
              <Tile label="Domains Covered" value={data.counts.domainsCovered} colour="emerald" />
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
              <h2 className="text-base font-semibold">Coverage</h2>
              <p className="mt-2 text-xs text-slate-500">Supported countries</p>
              <p>{data.supportedCountries.join(' · ')}</p>
              <p className="mt-2 text-xs text-slate-500">Supported domains</p>
              <p>{data.supportedDomains.join(' · ')}</p>
              <p className="mt-2 text-xs text-slate-500">Notification channels</p>
              <p>{data.channels.join(' · ')}</p>
            </section>
          </>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a href="/dashboard/hrms-config/rule-sets" className="text-blue-700 hover:underline">
                Country Rule Sets (S02)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/hrms-config/approval-templates"
                className="text-blue-700 hover:underline"
              >
                Approval Workflow Templates (S21)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/hrms-config/notification-rules"
                className="text-blue-700 hover:underline"
              >
                Notification Rules (S22)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/hrms-config/audit-settings"
                className="text-blue-700 hover:underline"
              >
                Audit Trail Settings (S23)
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
      : colour === 'amber'
        ? 'text-amber-700'
        : colour === 'slate'
          ? 'text-slate-500'
          : 'text-slate-900';
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`text-3xl font-semibold ${cls}`}>{value}</p>
    </div>
  );
}
