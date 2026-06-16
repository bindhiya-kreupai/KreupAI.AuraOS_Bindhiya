'use client';

import { useEffect, useState } from 'react';

interface Plan {
  id: string;
  year: number;
  title: string;
  scope: string;
  areasJson: string[];
  ownerRole: string;
  status: string;
  approvedAt: string | null;
}

export default function AuditPlanPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [title, setTitle] = useState('Annual HR Compliance Audit');
  const [scope, setScope] = useState(
    'All entities, payroll/WPS/social-insurance/immigration/records'
  );
  const [areas, setAreas] = useState(
    'PAYROLL,WPS,SOCIAL_INSURANCE,IMMIGRATION,NATIONALIZATION,RECORDS'
  );
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/compliance-calendar/audit-plan');
    const p = await r.json();
    if (p.success) setPlans(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function createPlan() {
    setMessage('');
    const r = await fetch('/api/v1/compliance-calendar/audit-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        year,
        title,
        scope,
        areas: areas.split(',').map((s) => s.trim()),
        ownerRole: 'INTERNAL_AUDITOR',
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Plan drafted' : p.error?.message);
    load();
  }
  async function approve(id: string) {
    const r = await fetch('/api/v1/compliance-calendar/audit-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', planId: id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Approved' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-35 · S07–S08</p>
          <h1 className="text-2xl font-semibold">Annual Audit Plan</h1>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Draft a Plan</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              Year
              <input
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm">
              Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm md:col-span-2">
              Scope
              <input
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm md:col-span-2">
              Areas (comma-separated)
              <input
                value={areas}
                onChange={(e) => setAreas(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={createPlan}
            className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Draft Plan
          </button>
          {message ? <p className="mt-3 text-sm">{message}</p> : null}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Year</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Areas</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{p.year}</td>
                  <td className="px-3 py-2">{p.title}</td>
                  <td className="px-3 py-2 text-xs">
                    {Array.isArray(p.areasJson) ? p.areasJson.join(', ') : '—'}
                  </td>
                  <td className="px-3 py-2">{p.status}</td>
                  <td className="px-3 py-2">
                    {p.status === 'DRAFT' ? (
                      <button
                        type="button"
                        onClick={() => approve(p.id)}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                      >
                        Approve
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                    No audit plans.
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
