'use client';

import { useEffect, useState } from 'react';

interface Pack {
  id: string;
  countryCode: string;
  version: number;
  status: string;
  title: string;
  summary: string;
  effectiveFrom: string;
}
interface Risk {
  id: string;
  countryCode: string;
  riskCode: string;
  title: string;
  rating: string;
  score: number;
  status: string;
}
interface Cert {
  id: string;
  countryCode: string;
  period: string;
  status: string;
  gatingReason: string | null;
}

const ratingColor: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-rose-100 text-rose-800',
};

export default function GccRuleLibraryHomePage() {
  const [data, setData] = useState<{
    overview: Array<{ countryCode: string; title: string; summary: string }>;
    risks: Risk[];
    certs: Cert[];
    packs: Pack[];
  } | null>(null);
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/gcc-rule-library/dashboard');
    const p = await r.json();
    if (p.success) setData(p.data);
  }
  useEffect(() => {
    load();
  }, []);

  async function seedAll() {
    setMessage('');
    const themes = await fetch('/api/v1/gcc-rule-library/rule-packs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-themes' }),
    }).then((r) => r.json());
    const packs = await fetch('/api/v1/gcc-rule-library/rule-packs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-authored' }),
    }).then((r) => r.json());
    const risks = await fetch('/api/v1/gcc-rule-library/risk-matrix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-regional' }),
    }).then((r) => r.json());
    setMessage(
      `Themes: ${themes.data?.created?.length ?? 0} · Packs: ${packs.data?.seeded?.length ?? 0} · Risks: ${risks.data?.created?.length ?? 0}`
    );
    load();
  }

  const tools = [
    { href: '/dashboard/gcc-rule-library/rule-packs', label: 'Rule Packs (S01–S04)' },
    { href: '/dashboard/gcc-rule-library/comparisons', label: 'GCC Comparison Tables (S05)' },
    { href: '/dashboard/gcc-rule-library/risk-matrix', label: 'Country Risk Matrix (S06)' },
    { href: '/dashboard/gcc-rule-library/certificates', label: 'Monthly Certificates (S07)' },
    {
      href: '/dashboard/gcc-rule-library/change-requests',
      label: 'Change Requests · Maker-Checker (EPIC-02-S02)',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">
              EPIC-36 · GCC Country Compliance Library
            </p>
            <h1 className="text-2xl font-semibold">Country Rule Library</h1>
          </div>
          <button
            type="button"
            onClick={seedAll}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Seed Library + Risks
          </button>
        </header>
        {message ? <p className="text-sm text-slate-700">{message}</p> : null}

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(data?.overview ?? []).map((o) => (
            <article
              key={o.countryCode}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{o.countryCode}</h3>
                <span className="text-xs text-slate-500">{o.title}</span>
              </div>
              <p className="mt-2 text-xs text-slate-700">{o.summary}</p>
            </article>
          ))}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Top Country Risks</h2>
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {(data?.risks ?? []).slice(0, 8).map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-md border border-slate-200 p-3"
              >
                <div>
                  <p className="text-sm font-semibold">{r.title}</p>
                  <p className="text-xs text-slate-500">
                    {r.countryCode} · {r.riskCode} · {r.status}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${ratingColor[r.rating] ?? ''}`}
                >
                  {r.rating} ({r.score})
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {tools.map((t) => (
              <li key={t.href}>
                <a
                  href={t.href}
                  className="block rounded-md border border-slate-200 px-3 py-2 text-sm hover:border-slate-900 hover:bg-slate-50"
                >
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
