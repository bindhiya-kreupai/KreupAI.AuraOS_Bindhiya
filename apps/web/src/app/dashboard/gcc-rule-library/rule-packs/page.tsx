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
  registeredAt: string | null;
}
interface Rule {
  id: string;
  domain: string;
  ruleKey: string;
  value: unknown;
  authority: string | null;
  citation: string | null;
}

const GCC = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'];

export default function RulePacksPage() {
  const [country, setCountry] = useState('AE');
  const [versions, setVersions] = useState<Pack[]>([]);
  const [active, setActive] = useState<(Pack & { rules?: Rule[] }) | null>(null);

  async function load() {
    const r1 = await fetch(
      `/api/v1/gcc-rule-library/rule-packs?action=versions&countryCode=${country}`
    );
    const p1 = await r1.json();
    if (p1.success) setVersions(p1.data ?? []);
    const r2 = await fetch(
      `/api/v1/gcc-rule-library/rule-packs?action=active&countryCode=${country}`
    );
    const p2 = await r2.json();
    if (p2.success) setActive(p2.data);
  }
  useEffect(() => {
    load();
  }, [country]);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-36 · S01–S04</p>
          <h1 className="text-2xl font-semibold">Country Rule Packs</h1>
        </header>

        <section className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <label className="text-sm font-medium">
            Country
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5"
            >
              {GCC.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </section>

        {active ? (
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{active.title}</h2>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                v{active.version} · {active.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-700">{active.summary}</p>
            <h3 className="mt-4 text-sm font-semibold uppercase text-slate-500">Rules</h3>
            <table className="mt-2 w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Domain</th>
                  <th className="px-3 py-2">Key</th>
                  <th className="px-3 py-2">Value</th>
                  <th className="px-3 py-2">Authority</th>
                  <th className="px-3 py-2">Citation</th>
                </tr>
              </thead>
              <tbody>
                {(active.rules ?? []).map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">{r.domain}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.ruleKey}</td>
                    <td className="px-3 py-2 text-xs">{JSON.stringify(r.value)}</td>
                    <td className="px-3 py-2 text-xs">{r.authority ?? '—'}</td>
                    <td className="px-3 py-2 text-xs">{r.citation ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : (
          <p className="text-sm text-slate-600">No active pack — seed from the dashboard.</p>
        )}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Versions</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Version</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Effective from</th>
                <th className="px-3 py-2">Registered</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v) => (
                <tr key={v.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">v{v.version}</td>
                  <td className="px-3 py-2">{v.status}</td>
                  <td className="px-3 py-2">{v.title}</td>
                  <td className="px-3 py-2">{v.effectiveFrom?.slice(0, 10)}</td>
                  <td className="px-3 py-2">{v.registeredAt?.slice(0, 10) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
