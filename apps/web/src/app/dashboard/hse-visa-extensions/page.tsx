'use client';

import { useEffect, useState } from 'react';

interface Workspace {
  story: string;
  label: string;
  route: string;
}

interface Dashboard {
  transferProActions: Array<{ code: string; label: string }>;
  workspaces: Workspace[];
}

export default function HseVisaExtensionsPage() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/v1/hse-visa-extensions/dashboard');
      const p = await r.json();
      if (p.success) setData(p.data);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">
            Themes G + H · HSE Sub-domains + Visa-Exit Deep Gaps
          </p>
          <h1 className="text-2xl font-semibold">HSE + Visa-Exit Extensions</h1>
          <p className="mt-1 text-sm text-slate-600">
            Six HSE registers (safety officer, heat-stress, toolbox talk, drill, first-aid, welfare
            inspection) plus four visa-exit deep gaps (TRANSFER PRO chain, dependent register,
            benefits cascade, comm templates).
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

        {data?.transferProActions ? (
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">
              EPIC-29-S04 · TRANSFER scenario PRO action chain
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Seeded canonical action set used when scenario = TRANSFER.
            </p>
            <ol className="mt-3 list-inside list-decimal space-y-1 text-sm">
              {data.transferProActions.map((a) => (
                <li key={a.code} className="text-slate-700">
                  <span className="font-mono text-xs text-slate-500">[{a.code}]</span> {a.label}
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>
    </main>
  );
}
