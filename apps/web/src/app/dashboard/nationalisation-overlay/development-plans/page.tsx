'use client';

import { useEffect, useState } from 'react';

interface Plan {
  id: string;
  employeeId: string;
  program: string;
  planCode: string;
  label: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  completionPct: number;
  startDate: string | null;
  targetEndDate: string | null;
  ownerRole: string | null;
}

const PROGRAMS = ['EMIRATISATION', 'NITAQAT', 'BAHRAINIZATION', 'OMANISATION', 'QATARISATION'];
const STATUSES: Plan['status'][] = ['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

const statusColor: Record<string, string> = {
  PLANNED: 'bg-slate-200 text-slate-800',
  ACTIVE: 'bg-blue-100 text-blue-900',
  COMPLETED: 'bg-emerald-100 text-emerald-900',
  CANCELLED: 'bg-rose-100 text-rose-900',
};

export default function DevelopmentPlansPage() {
  const [items, setItems] = useState<Plan[]>([]);
  const [program, setProgram] = useState('');
  const [message, setMessage] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [newProgram, setNewProgram] = useState('EMIRATISATION');
  const [planCode, setPlanCode] = useState('');
  const [label, setLabel] = useState('');
  const [ownerRole, setOwnerRole] = useState('');

  async function load() {
    const qs = program ? `?program=${program}` : '';
    const r = await fetch(`/api/v1/nationalisation-overlay/development-plans${qs}`);
    const p = await r.json();
    if (p.success) setItems(p.data ?? []);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program]);

  async function upsert() {
    setMessage('');
    const r = await fetch('/api/v1/nationalisation-overlay/development-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        employeeId,
        program: newProgram,
        planCode,
        label,
        ownerRole: ownerRole || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : p.message);
    if (p.success) {
      setEmployeeId('');
      setPlanCode('');
      setLabel('');
      setOwnerRole('');
      load();
    }
  }

  async function setStatus(id: string, status: Plan['status']) {
    setMessage('');
    const r = await fetch('/api/v1/nationalisation-overlay/development-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set-status', id, status }),
    });
    const p = await r.json();
    setMessage(p.success ? `Set ${status}` : p.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-16-S13 · EPIC-18-S15</p>
          <h1 className="text-2xl font-semibold">National L&amp;D Development Plans</h1>
        </header>

        {message ? <p className="text-sm text-slate-700">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Add / update plan</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="text-sm font-medium">
              Employee
              <input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm font-medium">
              Program
              <select
                value={newProgram}
                onChange={(e) => setNewProgram(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              >
                {PROGRAMS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Plan code
              <input
                value={planCode}
                onChange={(e) => setPlanCode(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm font-medium md:col-span-2">
              Label
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm font-medium">
              Owner role
              <input
                value={ownerRole}
                onChange={(e) => setOwnerRole(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={upsert}
            className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Save plan
          </button>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Plans</h2>
            <label className="text-sm font-medium">
              Program:
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="ml-2 rounded-md border border-slate-300 px-2 py-1.5"
              >
                <option value="">All</option>
                {PROGRAMS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Employee</th>
                <th>Program</th>
                <th>Plan</th>
                <th>Label</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((pl) => (
                <tr key={pl.id} className="border-t border-slate-100">
                  <td className="py-2 font-mono text-xs">{pl.employeeId}</td>
                  <td className="text-xs">{pl.program}</td>
                  <td className="text-xs">{pl.planCode}</td>
                  <td className="text-xs">{pl.label}</td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[pl.status] ?? ''}`}
                    >
                      {pl.status}
                    </span>
                  </td>
                  <td className="text-xs">{pl.completionPct}%</td>
                  <td className="text-xs">
                    <select
                      value={pl.status}
                      onChange={(e) => setStatus(pl.id, e.target.value as Plan['status'])}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-xs text-slate-500">
                    No plans yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
