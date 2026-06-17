'use client';

import { useEffect, useState } from 'react';

interface Workspace {
  story: string;
  label: string;
  route: string;
}

interface Dashboard {
  unifiedWageFileScope: string[];
  grievanceMediationStates: string[];
  executiveDashboardScopes: Record<string, string[]>;
  otFraudSignals: string[];
  workspaces: Workspace[];
}

export default function StructuralExtensionsPage() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/v1/structural-extensions/dashboard');
      const p = await r.json();
      if (p.success) setData(p.data);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">
            Themes J + K · Structural Extensions + Misc Closures
          </p>
          <h1 className="text-2xl font-semibold">Structural Extensions</h1>
          <p className="mt-1 text-sm text-slate-600">
            Closes the remaining structural gaps: job architecture API surface, salary grade bands,
            DoA matrix, payroll calendar control + variance register, fatigue rules, OT fraud
            detection, EOS↔SIO funding link, return-to-work plans, holiday-calendar
            change-management, redundancy batches, separation retention policy, physical file
            locations, audit finding ↔ risk links. Plus service-only closures for unified wage-file
            generator, grievance mediation, classification RBAC, country rollup, and executive
            dashboard RBAC.
          </p>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {(data?.workspaces ?? []).map((w) => (
              <li key={w.story} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
                <p className="font-semibold">{w.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{w.story}</p>
                <p className="mt-1 font-mono text-xs text-slate-500">{w.route}</p>
              </li>
            ))}
          </ul>
        </section>

        {data ? (
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">Service-only closures</h2>
            <div className="mt-3 grid gap-3 text-xs md:grid-cols-2">
              <div>
                <p className="font-semibold">EPIC-11-S05 unified wage-file scope</p>
                <p className="text-slate-600">{data.unifiedWageFileScope.join(' · ')}</p>
              </div>
              <div>
                <p className="font-semibold">EPIC-25-S04 grievance mediation states</p>
                <p className="text-slate-600">{data.grievanceMediationStates.join(' · ')}</p>
              </div>
              <div>
                <p className="font-semibold">EPIC-12-S13 OT fraud signals</p>
                <p className="text-slate-600">{data.otFraudSignals.join(' · ')}</p>
              </div>
              <div>
                <p className="font-semibold">EPIC-31-S14 executive RBAC scopes</p>
                <ul className="text-slate-600">
                  {Object.entries(data.executiveDashboardScopes).map(([role, scopes]) => (
                    <li key={role}>
                      <span className="font-mono">{role}</span>: {scopes.join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
