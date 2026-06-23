'use client';

import { useEffect, useState } from 'react';

interface Flag {
  id: string;
  ruleCode: string;
  domain: string;
  severity: string;
  sourceType: string;
  sourceId: string;
  status: string;
  raisedAt: string;
}
interface Rule {
  id: string;
  code: string;
  name: string;
  domain: string;
  severity: string;
  expression: string;
}

const sevColor: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-rose-100 text-rose-800',
};

export default function RedFlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [tab, setTab] = useState<'flags' | 'rules'>('flags');

  async function load() {
    const f = await fetch('/api/v1/checklist-engine/red-flags').then((r) => r.json());
    if (f.success) setFlags(f.data ?? []);
    const r = await fetch('/api/v1/checklist-engine/red-flags?action=rules').then((r) => r.json());
    if (r.success) setRules(r.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-37 · S03–S05</p>
          <h1 className="text-2xl font-semibold">Red Flags</h1>
        </header>
        <section className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab('flags')}
            className={`rounded-md px-3 py-1.5 text-sm ${tab === 'flags' ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}
          >
            Instances ({flags.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('rules')}
            className={`rounded-md px-3 py-1.5 text-sm ${tab === 'rules' ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}
          >
            Rules ({rules.length})
          </button>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          {tab === 'flags' ? (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Rule</th>
                  <th className="px-3 py-2">Domain</th>
                  <th className="px-3 py-2">Severity</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Raised</th>
                </tr>
              </thead>
              <tbody>
                {flags.map((f) => (
                  <tr key={f.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">{f.ruleCode}</td>
                    <td className="px-3 py-2">{f.domain}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sevColor[f.severity] ?? ''}`}
                      >
                        {f.severity}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {f.sourceType}/{f.sourceId}
                    </td>
                    <td className="px-3 py-2">{f.status}</td>
                    <td className="px-3 py-2 text-xs">{f.raisedAt?.slice(0, 10)}</td>
                  </tr>
                ))}
                {flags.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                      No red flags.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Domain</th>
                  <th className="px-3 py-2">Severity</th>
                  <th className="px-3 py-2">Expression</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">{r.code}</td>
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2">{r.domain}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sevColor[r.severity] ?? ''}`}
                      >
                        {r.severity}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{r.expression}</td>
                  </tr>
                ))}
                {rules.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                      No rules.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
