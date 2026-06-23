'use client';

import { useEffect, useState } from 'react';

interface Rule {
  id: string;
  code: string;
  name: string;
  categoryCode: string;
  countryCode: string | null;
  cadence: string;
  dayOfMonth: number | null;
  monthOfYear: number | null;
  ownerRole: string;
  escalationRole: string | null;
  leadDays: number;
  tierAlerts: number[];
}

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);

  async function load() {
    const r = await fetch('/api/v1/compliance-calendar/rules');
    const p = await r.json();
    if (p.success) setRules(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-35 · S01–S06, S09</p>
          <h1 className="text-2xl font-semibold">Recurrence Rules</h1>
        </header>
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Cadence</th>
                <th className="px-3 py-2">DOM</th>
                <th className="px-3 py-2">MOY</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Alerts</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{r.code}</td>
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2">{r.categoryCode}</td>
                  <td className="px-3 py-2">{r.countryCode ?? '—'}</td>
                  <td className="px-3 py-2">{r.cadence}</td>
                  <td className="px-3 py-2">{r.dayOfMonth ?? '—'}</td>
                  <td className="px-3 py-2">{r.monthOfYear ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{r.ownerRole}</td>
                  <td className="px-3 py-2 text-xs">{(r.tierAlerts ?? []).join(', ')}</td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No rules. Seed from the dashboard.
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
