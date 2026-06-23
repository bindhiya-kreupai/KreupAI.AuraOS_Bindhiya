'use client';

import { useEffect, useState } from 'react';

interface ChecklistItem {
  id: string;
  phase: string;
  category: string;
  code: string;
  label: string;
  owner: string | null;
  ownerRole: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'WAIVED';
  isMandatory: boolean;
  dueDate: string | null;
  evidenceUrl: string | null;
  notes: string | null;
}

const statusColor: Record<string, string> = {
  OPEN: 'bg-slate-200 text-slate-800',
  IN_PROGRESS: 'bg-amber-100 text-amber-900',
  COMPLETED: 'bg-emerald-100 text-emerald-900',
  WAIVED: 'bg-slate-100 text-slate-600',
};

const PHASES = ['DISCOVERY', 'DESIGN', 'BUILD', 'TEST', 'GO_LIVE', 'POST_GO_LIVE'];

export default function ImplementationPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [phase, setPhase] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const qs = phase ? `?phase=${phase}` : '';
    const r = await fetch(`/api/v1/hrms-config/implementation${qs}`);
    const p = await r.json();
    if (p.success) setItems(p.data ?? []);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  async function seed() {
    setMessage('');
    const r = await fetch('/api/v1/hrms-config/implementation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed' }),
    });
    const p = await r.json();
    setMessage(p.success ? `Seeded ${p.data?.created?.length ?? 0} items` : p.message);
    load();
  }

  async function setStatus(code: string, status: ChecklistItem['status']) {
    setMessage('');
    const r = await fetch('/api/v1/hrms-config/implementation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', code, status }),
    });
    const p = await r.json();
    setMessage(p.success ? `Set ${code} → ${status}` : p.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-34 · S27</p>
            <h1 className="text-2xl font-semibold">Implementation Checklist / Control Sheet</h1>
            <p className="mt-1 text-sm text-slate-600">
              Mandatory items must be COMPLETED before the go-live certificate can be signed.
            </p>
          </div>
          <button
            type="button"
            onClick={seed}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Seed default
          </button>
        </header>

        {message ? <p className="text-sm text-slate-700">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <label className="text-sm font-medium">
            Phase:
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5"
            >
              <option value="">All</option>
              {PHASES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Phase</th>
                <th>Code</th>
                <th>Item</th>
                <th>Owner role</th>
                <th>Status</th>
                <th>Mandatory</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t border-slate-100 align-top">
                  <td className="py-2 text-xs">{it.phase}</td>
                  <td className="font-mono text-xs">{it.code}</td>
                  <td className="text-xs">{it.label}</td>
                  <td className="text-xs">{it.ownerRole ?? '—'}</td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[it.status] ?? ''}`}
                    >
                      {it.status}
                    </span>
                  </td>
                  <td className="text-xs">{it.isMandatory ? 'YES' : 'no'}</td>
                  <td className="text-xs">
                    {it.status !== 'COMPLETED' ? (
                      <button
                        type="button"
                        onClick={() => setStatus(it.code, 'COMPLETED')}
                        className="rounded-md bg-emerald-600 px-2 py-1 text-xs text-white"
                      >
                        Complete
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setStatus(it.code, 'OPEN')}
                        className="rounded-md bg-slate-700 px-2 py-1 text-xs text-white"
                      >
                        Reopen
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-xs text-slate-500">
                    No items. Click &ldquo;Seed default&rdquo; to load the standard checklist.
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
