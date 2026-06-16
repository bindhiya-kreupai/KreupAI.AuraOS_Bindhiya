'use client';

import { useEffect, useState } from 'react';

interface Def {
  id: string;
  code: string;
  name: string;
  domain: string;
  unit: string;
  frequency: string;
  direction: string;
  ownerRole: string;
  status: string;
  version: number;
  formula: string;
  description: string;
}

export default function KpiCatalogPage() {
  const [defs, setDefs] = useState<Def[]>([]);
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  async function load() {
    const url = new URL('/api/v1/kpi-scorecard/definitions', window.location.origin);
    if (domain) url.searchParams.set('domain', domain);
    if (status) url.searchParams.set('status', status);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setDefs(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [domain, status]);

  const domains = Array.from(new Set(defs.map((d) => d.domain))).sort();

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-38 · S01–S05</p>
          <h1 className="text-2xl font-semibold">KPI Catalogue</h1>
        </header>
        <section className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <label className="text-sm">
            Domain
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5"
            >
              <option value="">All</option>
              {domains.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5"
            >
              <option value="">All</option>
              {['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'RETIRED'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Domain</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">Frequency</th>
                <th className="px-3 py-2">Direction</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">v</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {defs.map((d) => (
                <tr key={d.id} className="border-b border-slate-100 align-top">
                  <td className="px-3 py-2 font-mono text-xs">{d.code}</td>
                  <td className="px-3 py-2">{d.domain}</td>
                  <td className="px-3 py-2">
                    {d.name}
                    <p className="text-xs text-slate-500">{d.description}</p>
                    <p className="text-xs text-slate-400">Formula: {d.formula}</p>
                  </td>
                  <td className="px-3 py-2">{d.unit}</td>
                  <td className="px-3 py-2">{d.frequency}</td>
                  <td className="px-3 py-2">{d.direction}</td>
                  <td className="px-3 py-2">{d.ownerRole}</td>
                  <td className="px-3 py-2">v{d.version}</td>
                  <td className="px-3 py-2">{d.status}</td>
                </tr>
              ))}
              {defs.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No KPI definitions. Seed from the scorecard home.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
