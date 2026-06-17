'use client';

import { useEffect, useState } from 'react';

interface Cycle {
  id: string;
  label: string;
  sampleSize: number;
  startedAt: string;
  status: string;
  findingsCount: number;
  findingsClosedCount: number;
}
interface Finding {
  id: string;
  auditCycleId: string;
  documentId: string | null;
  employeeId: string | null;
  severity: string;
  category: string;
  title: string;
  description: string | null;
  remediation: string | null;
  status: string;
  raisedAt: string;
}

const sevColor: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-rose-100 text-rose-800',
  CRITICAL: 'bg-rose-200 text-rose-900',
};

export default function AuditPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [cycleId, setCycleId] = useState('');
  const [openCycleForm, setOpenCycleForm] = useState({ label: '', sampleSize: '20' });
  const [findingForm, setFindingForm] = useState({
    auditCycleId: '',
    documentId: '',
    employeeId: '',
    severity: 'MEDIUM',
    category: 'RETENTION',
    title: '',
    description: '',
    remediation: '',
  });
  const [message, setMessage] = useState('');

  async function loadCycles() {
    const r = await fetch('/api/v1/document-retention-compliance/audit');
    const p = await r.json();
    if (p.success) setCycles(p.data ?? []);
  }
  async function loadFindings() {
    const url = new URL('/api/v1/document-retention-compliance/audit', window.location.origin);
    url.searchParams.set('resource', 'findings');
    if (cycleId) url.searchParams.set('auditCycleId', cycleId);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setFindings(p.data ?? []);
  }
  useEffect(() => {
    loadCycles();
  }, []);
  useEffect(() => {
    loadFindings();
  }, [cycleId]);

  async function openCycle() {
    const r = await fetch('/api/v1/document-retention-compliance/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'open-cycle',
        label: openCycleForm.label,
        sampleSize: Number(openCycleForm.sampleSize),
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Cycle opened' : p.error?.message);
    loadCycles();
  }
  async function closeCycle(id: string) {
    const r = await fetch('/api/v1/document-retention-compliance/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'close-cycle', id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Closed' : p.error?.message);
    loadCycles();
  }
  async function raiseFinding() {
    const r = await fetch('/api/v1/document-retention-compliance/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'raise-finding',
        ...findingForm,
        documentId: findingForm.documentId || undefined,
        employeeId: findingForm.employeeId || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Finding raised' : p.error?.message);
    loadFindings();
    loadCycles();
  }
  async function closeFinding(id: string) {
    const r = await fetch('/api/v1/document-retention-compliance/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'close-finding', id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Finding closed' : p.error?.message);
    loadFindings();
    loadCycles();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-30 · S12 / S13 / S17</p>
          <h1 className="text-2xl font-semibold">HR Audit Cycles &amp; Findings</h1>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Audit Cycles</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <label className="text-sm md:col-span-2">
              Label
              <input
                value={openCycleForm.label}
                onChange={(e) => setOpenCycleForm((f) => ({ ...f, label: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm">
              Sample Size
              <input
                value={openCycleForm.sampleSize}
                onChange={(e) => setOpenCycleForm((f) => ({ ...f, sampleSize: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <button
              type="button"
              onClick={openCycle}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Open Cycle
            </button>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">Started</th>
                <th className="px-3 py-2">Sample</th>
                <th className="px-3 py-2">Findings</th>
                <th className="px-3 py-2">Closed</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {cycles.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{c.label}</td>
                  <td className="px-3 py-2 text-xs">{c.startedAt?.slice(0, 10)}</td>
                  <td className="px-3 py-2">{c.sampleSize}</td>
                  <td className="px-3 py-2">{c.findingsCount}</td>
                  <td className="px-3 py-2 text-emerald-700">{c.findingsClosedCount}</td>
                  <td className="px-3 py-2">{c.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setCycleId(c.id);
                          setFindingForm((f) => ({ ...f, auditCycleId: c.id }));
                        }}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      >
                        Select
                      </button>
                      {c.status === 'OPEN' && (
                        <button
                          type="button"
                          onClick={() => closeCycle(c.id)}
                          className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">
            Findings {cycleId ? `for cycle ${cycleId.slice(0, 8)}` : ''}
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-7">
            <label className="text-sm">
              Cycle
              <input
                value={findingForm.auditCycleId}
                onChange={(e) => setFindingForm((f) => ({ ...f, auditCycleId: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
              />
            </label>
            <label className="text-sm">
              Severity
              <select
                value={findingForm.severity}
                onChange={(e) => setFindingForm((f) => ({ ...f, severity: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              >
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Category
              <input
                value={findingForm.category}
                onChange={(e) => setFindingForm((f) => ({ ...f, category: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm md:col-span-2">
              Title
              <input
                value={findingForm.title}
                onChange={(e) => setFindingForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm">
              Doc ID
              <input
                value={findingForm.documentId}
                onChange={(e) => setFindingForm((f) => ({ ...f, documentId: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
              />
            </label>
            <button
              type="button"
              onClick={raiseFinding}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Raise
            </button>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Raised</th>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Doc</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f) => (
                <tr key={f.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 text-xs">{f.raisedAt?.slice(0, 10)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sevColor[f.severity] ?? ''}`}
                    >
                      {f.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">{f.category}</td>
                  <td className="px-3 py-2">{f.title}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {f.documentId?.slice(0, 8) ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-xs">{f.status}</td>
                  <td className="px-3 py-2">
                    {f.status === 'OPEN' && (
                      <button
                        type="button"
                        onClick={() => closeFinding(f.id)}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                      >
                        Close
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {findings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No findings.
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
