'use client';

import { useEffect, useState } from 'react';

interface Run {
  id: string;
  templateCode: string;
  period: string;
  countryCode: string | null;
  status: string;
  totalItems: number;
  compliantItems: number;
  nonCompliantItems: number;
  weightedScore: string | null;
}
interface RunItem {
  id: string;
  itemCode: string;
  controlObjective: string;
  status: string;
  evidenceUrl: string | null;
  weighting: number;
  autoEvaluated: boolean;
}

const statusColor: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-700',
  COMPLIANT: 'bg-emerald-100 text-emerald-800',
  NON_COMPLIANT: 'bg-rose-100 text-rose-800',
  NA: 'bg-blue-100 text-blue-800',
};

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function RunsPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState<{ items: RunItem[] } | null>(null);
  const [templateCode, setTemplateCode] = useState('CHK_PAYROLL_MASTER');
  const [period, setPeriod] = useState(periodNow());
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/checklist-engine/runs');
    const p = await r.json();
    if (p.success) setRuns(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function loadDetail(id: string) {
    setSelectedId(id);
    const r = await fetch(`/api/v1/checklist-engine/runs?runId=${id}`);
    const p = await r.json();
    if (p.success) setDetail(p.data);
  }

  async function start() {
    const r = await fetch('/api/v1/checklist-engine/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', templateCode, period }),
    });
    const p = await r.json();
    setMessage(
      p.success ? 'Run started' : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    if (p.success) {
      await load();
      await loadDetail(p.data.id);
    }
  }

  async function assess(itemCode: string, status: 'COMPLIANT' | 'NON_COMPLIANT' | 'NA') {
    if (!selectedId) return;
    const evidenceUrl =
      status === 'COMPLIANT' ? 'https://docs.aura.example/evidence/auto-attached' : undefined;
    const r = await fetch('/api/v1/checklist-engine/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'assess', runId: selectedId, itemCode, status, evidenceUrl }),
    });
    const p = await r.json();
    setMessage(
      p.success
        ? `Item ${itemCode} → ${status}`
        : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    await loadDetail(selectedId);
    await load();
  }

  async function submit() {
    if (!selectedId) return;
    const r = await fetch('/api/v1/checklist-engine/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'submit', runId: selectedId }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Submitted' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }
  async function approve() {
    if (!selectedId) return;
    const r = await fetch('/api/v1/checklist-engine/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', runId: selectedId }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Approved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-37 · S02</p>
          <h1 className="text-2xl font-semibold">Checklist Run Workspace</h1>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3">
          <label className="text-sm">
            Template Code
            <input
              value={templateCode}
              onChange={(e) => setTemplateCode(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Period
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={start}
            className="self-end rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Start Run
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="grid gap-4 md:grid-cols-[1fr_2fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">Runs</h2>
            <ul className="mt-3 grid gap-2">
              {runs.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => loadDetail(r.id)}
                    className={`w-full rounded-md border border-slate-200 px-3 py-2 text-left text-sm ${
                      selectedId === r.id ? 'border-slate-900 bg-slate-50' : ''
                    }`}
                  >
                    <span className="font-mono text-xs">{r.templateCode}</span>{' '}
                    <span className="text-xs text-slate-500">
                      {r.period} · {r.status} · {r.compliantItems}/{r.totalItems}
                    </span>
                  </button>
                </li>
              ))}
              {runs.length === 0 ? <li className="text-sm text-slate-500">No runs.</li> : null}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Items</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={submit}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={approve}
                  className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm text-white"
                >
                  Approve
                </button>
              </div>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Objective</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Auto</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {(detail?.items ?? []).map((i) => (
                  <tr key={i.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">{i.itemCode}</td>
                    <td className="px-3 py-2">{i.controlObjective}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[i.status] ?? ''}`}
                      >
                        {i.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">{i.autoEvaluated ? 'Yes' : '—'}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => assess(i.itemCode, 'COMPLIANT')}
                          className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => assess(i.itemCode, 'NON_COMPLIANT')}
                          className="rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs"
                        >
                          ✗
                        </button>
                        <button
                          type="button"
                          onClick={() => assess(i.itemCode, 'NA')}
                          className="rounded-md border border-slate-300 bg-slate-50 px-2 py-1 text-xs"
                        >
                          N/A
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!detail && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                      Select a run.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
