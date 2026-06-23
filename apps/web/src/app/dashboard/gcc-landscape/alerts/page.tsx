'use client';

import { useEffect, useState } from 'react';

interface AlertRule {
  id: string;
  code: string;
  name: string;
  eventType: string;
  thresholds: Array<{ days: number; channel: string }>;
  isActive: boolean;
}
interface AlertInstance {
  id: string;
  alertRuleId: string;
  thresholdDays: number;
  resourceType: string | null;
  resourceId: string | null;
  triggeredFor: string;
  firedAt: string;
  channel: string;
  status: string;
}

export default function GccAlertsPage() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [instances, setInstances] = useState<AlertInstance[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const [r1, r2] = await Promise.all([
      fetch('/api/v1/gcc-landscape/alert-rules'),
      fetch('/api/v1/gcc-landscape/alert-instances'),
    ]);
    const [p1, p2] = await Promise.all([r1.json(), r2.json()]);
    if (p1.success) setRules(p1.data ?? []);
    if (p2.success) setInstances(p2.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function seed() {
    const r = await fetch('/api/v1/gcc-landscape/alert-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-default-ladders' }),
    });
    const p = await r.json();
    setMessage(p.success ? `Seeded: ${(p.data?.seeded ?? []).join(', ')}` : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">GCC Landscape · S04</p>
            <h1 className="text-2xl font-semibold">Platform Alerts</h1>
          </div>
          <button
            type="button"
            onClick={seed}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Seed Default Ladders
          </button>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Alert Rules</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Thresholds</th>
                <th className="px-3 py-2">Active</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{r.code}</td>
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2">{r.eventType}</td>
                  <td className="px-3 py-2 text-xs">
                    {r.thresholds.map((t) => `${t.days}d/${t.channel}`).join(' · ')}
                  </td>
                  <td className="px-3 py-2">{r.isActive ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                    No alert rules.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Recent Fired Instances</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Rule</th>
                <th className="px-3 py-2">Threshold</th>
                <th className="px-3 py-2">Resource</th>
                <th className="px-3 py-2">Triggered For</th>
                <th className="px-3 py-2">Channel</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {instances.map((i) => (
                <tr key={i.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">
                    {rules.find((r) => r.id === i.alertRuleId)?.code ?? '-'}
                  </td>
                  <td className="px-3 py-2">{i.thresholdDays}d</td>
                  <td className="px-3 py-2">
                    {i.resourceType}/{i.resourceId}
                  </td>
                  <td className="px-3 py-2">{i.triggeredFor?.slice(0, 10)}</td>
                  <td className="px-3 py-2">{i.channel}</td>
                  <td className="px-3 py-2">{i.status}</td>
                </tr>
              ))}
              {instances.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    No fired alerts.
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
