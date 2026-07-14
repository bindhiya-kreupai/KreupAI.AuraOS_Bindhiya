'use client';

import { useEffect, useState } from 'react';

interface CountryRow {
  countryCode: string;
  isEnabled: boolean;
  defaultCurrency: string;
  defaultTimezone: string;
  profile: {
    labourAuthority: string;
    socialInsuranceAuthority: string;
    nationalizationProgramme: string;
    weekendPattern: string;
  } | null;
  kpi: {
    totalHeadcount: number;
    nationalPct: number;
    targetPct: number | null;
    ragStatus: 'GREEN' | 'AMBER' | 'RED' | null;
    snapshotDate: string | null;
  } | null;
}

interface RiskRow {
  id: string;
  riskCode: string;
  title: string;
  rating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  ownerRole: string;
  countryScope: string[];
}

interface DashboardPayload {
  scope: string[] | 'ALL';
  countries: CountryRow[];
  topRisks: RiskRow[];
}

const ragColor: Record<string, string> = {
  GREEN: 'bg-emerald-100 text-emerald-800',
  AMBER: 'bg-amber-100 text-amber-800',
  RED: 'bg-rose-100 text-rose-800',
};

const ratingColor: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-rose-100 text-rose-800',
};

const GCC_OPTIONS = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'];

export default function GccLandscapeDashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [country, setCountry] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function load(countryCode?: string) {
    setIsLoading(true);
    setMessage('');
    try {
      const url = new URL('/api/v1/gcc-landscape/dashboard', window.location.origin);
      if (countryCode) url.searchParams.set('countryCode', countryCode);
      const res = await fetch(url.toString(), { cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.error?.message ?? 'load failed');
      }
      setData(payload.data);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'load failed');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let savedCountry = '';
    if (typeof window !== 'undefined') {
      savedCountry = localStorage.getItem('auraos:gcc-landscape:dashboard-country') || '';
      setCountry(savedCountry);
    }
    load(savedCountry || undefined);
  }, []);

  const tools = [
    { href: '/dashboard/gcc-landscape/tenancy', label: 'Countries & Entities (S01)' },
    { href: '/dashboard/gcc-landscape/country-profiles', label: 'Country Reference Dataset (S02)' },
    { href: '/dashboard/gcc-landscape/classifications', label: 'Workforce Classification (S03)' },
    { href: '/dashboard/gcc-landscape/alerts', label: 'Platform Alerts (S04)' },
    { href: '/dashboard/gcc-landscape/personas', label: 'GCC Personas / RBAC (S05)' },
    { href: '/dashboard/gcc-landscape/risk-register', label: 'Compliance Risk Register (S06)' },
    { href: '/dashboard/gcc-landscape/kpis', label: 'Workforce KPI Baseline (S07)' },
    { href: '/dashboard/gcc-landscape/maturity', label: 'Digital Maturity (S09)' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-2 border-b border-slate-200 pb-4">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            GCC Employment Landscape (EPIC-01)
          </p>
          <h1 className="text-2xl font-semibold">Executive Landscape Dashboard</h1>
          <p className="text-sm text-slate-600">
            Country footprint, workforce mix and top compliance risks across the six GCC markets,
            scoped to your role.
          </p>
        </header>

        <section className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <label className="text-sm font-medium text-slate-700">
            Country
            <select
              value={country}
              disabled={isLoading}
              onChange={(e) => {
                const val = e.target.value;
                setCountry(val);
                if (typeof window !== 'undefined') {
                  if (val) {
                    localStorage.setItem('auraos:gcc-landscape:dashboard-country', val);
                  } else {
                    localStorage.removeItem('auraos:gcc-landscape:dashboard-country');
                  }
                }
                load(val || undefined);
              }}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm disabled:opacity-50"
            >
              <option value="">All</option>
              {data?.countries?.length
                ? data.countries.map((c) => (
                    <option key={c.countryCode} value={c.countryCode}>
                      {c.countryCode}
                    </option>
                  ))
                : GCC_OPTIONS.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => load(country || undefined)}
            disabled={isLoading}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
          {message ? <p className="text-sm text-rose-600">{message}</p> : null}
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading && !data ? (
            <div className="col-span-full py-12 text-center text-sm text-slate-500">
              Loading dashboard data...
            </div>
          ) : (
            <>
              {(data?.countries ?? []).map((c) => (
                <div
                  key={c.countryCode}
                  className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{c.countryCode}</h3>
                    <span className="text-xs uppercase text-slate-500">
                      {c.defaultCurrency} · {c.defaultTimezone}
                    </span>
                  </div>
                  {c.profile ? (
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                      <span className="rounded bg-slate-50 px-2 py-1">
                        Labour: {c.profile.labourAuthority}
                      </span>
                      <span className="rounded bg-slate-50 px-2 py-1">
                        Social: {c.profile.socialInsuranceAuthority}
                      </span>
                      <span className="rounded bg-slate-50 px-2 py-1">
                        Programme: {c.profile.nationalizationProgramme}
                      </span>
                      <span className="rounded bg-slate-50 px-2 py-1">
                        Weekend: {c.profile.weekendPattern}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No country profile seeded.</p>
                  )}
                  {c.kpi ? (
                    <div className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                      <div>
                        <p className="text-xs text-slate-500">Headcount</p>
                        <p className="text-lg font-semibold">{c.kpi.totalHeadcount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">National %</p>
                        <p className="text-lg font-semibold">{c.kpi.nationalPct}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Target</p>
                        <p className="text-lg font-semibold">{c.kpi.targetPct ?? '—'}</p>
                      </div>
                      {c.kpi.ragStatus ? (
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${ragColor[c.kpi.ragStatus] ?? ''}`}
                        >
                          {c.kpi.ragStatus}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No KPI snapshot yet.</p>
                  )}
                </div>
              ))}
              {(!data?.countries || data.countries.length === 0) && (
                <div className="col-span-full rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
                  No GCC countries enabled. Visit “Countries & Entities (S01)” to enable a country.
                </div>
              )}
            </>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Top Compliance Risks</h2>
          {data?.topRisks?.length ? (
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {data.topRisks.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-md border border-slate-200 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{r.title}</p>
                    <p className="text-xs text-slate-500">
                      {r.riskCode} · owner {r.ownerRole} ·{' '}
                      {r.countryScope?.join(', ') || 'all countries'}
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
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              No risks yet. Seed regional risks from the Risk Register page.
            </p>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">GCC Foundation Workspaces</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
