'use client';

import { useEffect, useState } from 'react';

interface Template {
  id: string;
  code: string;
  name: string;
  domain: string;
  appendixRef: string | null;
  description: string;
  status: string;
  version: number;
  items: Array<{
    code: string;
    controlObjective: string;
    description: string;
    weighting: number;
    isMandatory: boolean;
    redFlagRuleCode: string | null;
  }>;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filterDomain, setFilterDomain] = useState('');

  async function load() {
    const url = new URL('/api/v1/checklist-engine/templates', window.location.origin);
    if (filterDomain) url.searchParams.set('domain', filterDomain);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setTemplates(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filterDomain]);

  const domains = Array.from(new Set(templates.map((t) => t.domain))).sort();

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-37 · S01</p>
          <h1 className="text-2xl font-semibold">Checklist Templates</h1>
        </header>
        <section className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <label className="text-sm">
            Domain
            <select
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5"
            >
              <option value="">All</option>
              {domains.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
        </section>

        <section className="grid gap-3">
          {templates.map((t) => (
            <article key={t.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">
                  {t.name}{' '}
                  <span className="ml-2 font-mono text-xs text-slate-500">
                    {t.code} · v{t.version}
                  </span>
                </h2>
                <span className="text-xs text-slate-500">
                  {t.domain} · {t.appendixRef ?? '—'} · {t.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-700">{t.description}</p>
              <table className="mt-3 w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Control Objective</th>
                    <th className="px-3 py-2">Weight</th>
                    <th className="px-3 py-2">Mandatory</th>
                    <th className="px-3 py-2">Red-Flag Rule</th>
                  </tr>
                </thead>
                <tbody>
                  {(t.items ?? []).map((i) => (
                    <tr key={i.code} className="border-b border-slate-100">
                      <td className="px-3 py-2 font-mono text-xs">{i.code}</td>
                      <td className="px-3 py-2">{i.controlObjective}</td>
                      <td className="px-3 py-2">{i.weighting}</td>
                      <td className="px-3 py-2">{i.isMandatory ? 'Yes' : 'No'}</td>
                      <td className="px-3 py-2 text-xs">{i.redFlagRuleCode ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          ))}
          {templates.length === 0 && <p className="text-sm text-slate-500">No templates.</p>}
        </section>
      </div>
    </main>
  );
}
