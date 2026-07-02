'use client';

import { useEffect, useState } from 'react';

interface Dependent {
  id: string;
  visaExitCaseId: string;
  dependentName: string;
  relationship: string;
  visaNumber: string | null;
  cancellationStatus: string | null;
  cancelledAt: string | null;
}

function readList<T>(payload: { data?: { items?: T[] } | T[] }): T[] {
  const data = payload.data;
  if (Array.isArray(data)) return data;
  return (data?.items as T[] | undefined) ?? [];
}

const BASE = '/api/v1/hse-visa-extensions';

export default function DependentsRegisterPage() {
  const [message, setMessage] = useState('');
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [caseFilter, setCaseFilter] = useState('');
  const [form, setForm] = useState({
    visaExitCaseId: '',
    dependentName: '',
    relationship: '',
    visaNumber: '',
  });
  const [evidence, setEvidence] = useState<Record<string, string>>({});

  async function load() {
    const url = new URL(`${BASE}/visa-dependents`, window.location.origin);
    if (caseFilter) url.searchParams.set('visaExitCaseId', caseFilter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setDependents(readList<Dependent>(p));
  }

  async function addDependent() {
    const r = await fetch(`${BASE}/visa-dependents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add',
        visaExitCaseId: form.visaExitCaseId,
        dependentName: form.dependentName,
        relationship: form.relationship,
        visaNumber: form.visaNumber || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? (p.message ?? 'Added') : p.error?.message);
    if (p.success) {
      setForm({ visaExitCaseId: '', dependentName: '', relationship: '', visaNumber: '' });
    }
    load();
  }

  async function markCancelled(id: string) {
    const r = await fetch(`${BASE}/visa-dependents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'mark-cancelled',
        id,
        evidenceUrl: evidence[id] || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? (p.message ?? 'Cancelled') : p.error?.message);
    load();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseFilter]);

  const inputCls = 'rounded-md border border-slate-300 px-2 py-1.5 text-sm';
  const btnCls = 'rounded-md bg-slate-900 px-3 py-2 text-sm text-white';

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">Visa-Exit · AURA-447</p>
          <h1 className="text-2xl font-semibold">Dependents Register — Cancellation Cascade</h1>
          {message ? <p className="mt-2 text-sm text-slate-700">{message}</p> : null}
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap gap-2">
            <input
              className={inputCls}
              placeholder="Filter visaExitCaseId"
              value={caseFilter}
              onChange={(e) => setCaseFilter(e.target.value)}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              className={inputCls}
              placeholder="visaExitCaseId"
              value={form.visaExitCaseId}
              onChange={(e) => setForm((f) => ({ ...f, visaExitCaseId: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="dependentName"
              value={form.dependentName}
              onChange={(e) => setForm((f) => ({ ...f, dependentName: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="relationship"
              value={form.relationship}
              onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="visaNumber"
              value={form.visaNumber}
              onChange={(e) => setForm((f) => ({ ...f, visaNumber: e.target.value }))}
            />
            <button type="button" className={btnCls} onClick={addDependent}>
              Add Dependent
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-3">visaExitCaseId</th>
                  <th className="py-2 pr-3">dependentName</th>
                  <th className="py-2 pr-3">relationship</th>
                  <th className="py-2 pr-3">visaNumber</th>
                  <th className="py-2 pr-3">status</th>
                  <th className="py-2 pr-3">cancel</th>
                </tr>
              </thead>
              <tbody>
                {dependents.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100 align-top">
                    <td className="py-2 pr-3">{d.visaExitCaseId}</td>
                    <td className="py-2 pr-3">{d.dependentName}</td>
                    <td className="py-2 pr-3">{d.relationship}</td>
                    <td className="py-2 pr-3">{d.visaNumber ?? '—'}</td>
                    <td className="py-2 pr-3">{d.cancellationStatus ?? '—'}</td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-wrap gap-1">
                        <input
                          className={inputCls}
                          placeholder="evidenceUrl"
                          value={evidence[d.id] ?? ''}
                          onChange={(e) => setEvidence((m) => ({ ...m, [d.id]: e.target.value }))}
                        />
                        <button
                          type="button"
                          className={btnCls}
                          onClick={() => markCancelled(d.id)}
                        >
                          Mark Cancelled
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {dependents.length === 0 ? (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={6}>
                      No dependents yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
