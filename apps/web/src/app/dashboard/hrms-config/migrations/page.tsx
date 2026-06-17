'use client';

import { useEffect, useState } from 'react';

interface Migration {
  id: string;
  planCode: string;
  label: string;
  domainCode: string;
  sourceSystem: string;
  targetEntity: string;
  expectedRows: number | null;
  status: 'PLANNED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';
  lastRunAt: string | null;
  lastRunInserted: number;
  lastRunUpdated: number;
  lastRunSkipped: number;
  lastRunErrors: number;
  validationsPassed: boolean;
  notes: string | null;
}

const statusColor: Record<string, string> = {
  PLANNED: 'bg-slate-200 text-slate-800',
  RUNNING: 'bg-amber-100 text-amber-900',
  COMPLETED: 'bg-emerald-100 text-emerald-900',
  FAILED: 'bg-rose-100 text-rose-900',
  ROLLED_BACK: 'bg-slate-200 text-slate-800',
};

export default function MigrationsPage() {
  const [items, setItems] = useState<Migration[]>([]);
  const [message, setMessage] = useState('');
  const [planCode, setPlanCode] = useState('');
  const [label, setLabel] = useState('');
  const [domainCode, setDomainCode] = useState('EMPLOYEE');
  const [sourceSystem, setSourceSystem] = useState('');
  const [targetEntity, setTargetEntity] = useState('');
  const [expectedRows, setExpectedRows] = useState('');

  async function load() {
    const r = await fetch('/api/v1/hrms-config/migrations');
    const p = await r.json();
    if (p.success) setItems(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function upsert() {
    setMessage('');
    const r = await fetch('/api/v1/hrms-config/migrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        planCode,
        label,
        domainCode,
        sourceSystem,
        targetEntity,
        expectedRows: expectedRows ? Number(expectedRows) : undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Plan saved' : p.message);
    if (p.success) {
      setPlanCode('');
      setLabel('');
      setSourceSystem('');
      setTargetEntity('');
      setExpectedRows('');
      load();
    }
  }

  async function recordRun(code: string, status: Migration['status']) {
    setMessage('');
    const r = await fetch('/api/v1/hrms-config/migrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'record-run',
        planCode: code,
        status,
        validationsPassed: status === 'COMPLETED',
      }),
    });
    const p = await r.json();
    setMessage(p.success ? `${code}: ${status}` : p.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-34 · S26</p>
          <h1 className="text-2xl font-semibold">Data Migration Plans</h1>
          <p className="mt-1 text-sm text-slate-600">
            Per-domain migration plans with run counters and pass/fail validations. FAILED or
            validation-failed plans gate the go-live certificate.
          </p>
        </header>

        {message ? <p className="text-sm text-slate-700">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Add / update plan</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium">
              Plan code
              <input
                value={planCode}
                onChange={(e) => setPlanCode(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm font-medium">
              Label
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm font-medium">
              Domain
              <input
                value={domainCode}
                onChange={(e) => setDomainCode(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm font-medium">
              Expected rows
              <input
                value={expectedRows}
                onChange={(e) => setExpectedRows(e.target.value)}
                inputMode="numeric"
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm font-medium">
              Source system
              <input
                value={sourceSystem}
                onChange={(e) => setSourceSystem(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm font-medium">
              Target entity
              <input
                value={targetEntity}
                onChange={(e) => setTargetEntity(e.target.value)}
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
          <h2 className="text-base font-semibold">Plans</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Code</th>
                <th>Domain</th>
                <th>Status</th>
                <th>Last run</th>
                <th>I / U / S / E</th>
                <th>Validated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id} className="border-t border-slate-100 align-top">
                  <td className="py-2 font-mono text-xs">{m.planCode}</td>
                  <td className="text-xs">{m.domainCode}</td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[m.status] ?? ''}`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="text-xs">{m.lastRunAt ?? '—'}</td>
                  <td className="text-xs">
                    {m.lastRunInserted} / {m.lastRunUpdated} / {m.lastRunSkipped} /{' '}
                    <span className={m.lastRunErrors > 0 ? 'text-rose-700' : ''}>
                      {m.lastRunErrors}
                    </span>
                  </td>
                  <td className="text-xs">{m.validationsPassed ? 'PASS' : 'no'}</td>
                  <td className="text-xs">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => recordRun(m.planCode, 'COMPLETED')}
                        className="rounded-md bg-emerald-600 px-2 py-1 text-xs text-white"
                      >
                        Complete
                      </button>
                      <button
                        type="button"
                        onClick={() => recordRun(m.planCode, 'FAILED')}
                        className="rounded-md bg-rose-600 px-2 py-1 text-xs text-white"
                      >
                        Fail
                      </button>
                    </div>
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
