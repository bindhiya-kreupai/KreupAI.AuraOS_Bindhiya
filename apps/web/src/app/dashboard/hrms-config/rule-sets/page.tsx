'use client';

import { useEffect, useState } from 'react';

interface RuleSet {
  id: string;
  country: string;
  domain: string;
  version: string;
  status: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  publishedAt: string | null;
}

export default function RuleSetsPage() {
  const [rows, setRows] = useState<RuleSet[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    country: 'UAE',
    domain: 'WPS',
    version: 'v1',
    effectiveFrom: new Date().toISOString().slice(0, 10),
    rulesJson: '{}',
  });

  async function load() {
    const r = await fetch('/api/v1/hrms-config/rule-sets');
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function saveDraft() {
    let rules: unknown = {};
    try {
      rules = JSON.parse(form.rulesJson);
    } catch {
      setMessage('rulesJson is not valid JSON');
      return;
    }
    const r = await fetch('/api/v1/hrms-config/rule-sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert-draft',
        country: form.country,
        domain: form.domain,
        version: form.version,
        effectiveFrom: form.effectiveFrom,
        rulesJson: rules,
      }),
    });
    const p = await r.json();
    setMessage(
      p.success ? 'Draft saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    load();
  }

  async function publish(id: string) {
    const r = await fetch('/api/v1/hrms-config/rule-sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'publish', id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Published' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-34 · S02</p>
          <h1 className="text-2xl font-semibold">Country Rule Sets</h1>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">New Draft</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['UAE', 'KSA', 'BH', 'QA', 'OM', 'KW', 'IN'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
              placeholder="Domain"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              value={form.version}
              onChange={(e) => setForm({ ...form, version: e.target.value })}
              placeholder="Version"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              type="date"
              value={form.effectiveFrom}
              onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <button
              type="button"
              onClick={saveDraft}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Save Draft
            </button>
          </div>
          <textarea
            value={form.rulesJson}
            onChange={(e) => setForm({ ...form, rulesJson: e.target.value })}
            rows={5}
            className="mt-3 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
          />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Domain</th>
                <th className="px-3 py-2">Version</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Effective</th>
                <th className="px-3 py-2">Published</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{r.country}</td>
                  <td className="px-3 py-2">{r.domain}</td>
                  <td className="px-3 py-2">{r.version}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        r.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'DRAFT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {r.effectiveFrom?.slice(0, 10)}
                    {r.effectiveTo ? ` → ${r.effectiveTo.slice(0, 10)}` : ''}
                  </td>
                  <td className="px-3 py-2 text-xs">{r.publishedAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2">
                    {r.status === 'DRAFT' ? (
                      <button
                        type="button"
                        onClick={() => publish(r.id)}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                      >
                        Publish
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No rule sets.
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
