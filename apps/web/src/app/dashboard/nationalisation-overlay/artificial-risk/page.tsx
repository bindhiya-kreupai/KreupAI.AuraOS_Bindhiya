'use client';

import { useEffect, useState } from 'react';

interface Flag {
  id: string;
  employeeId: string;
  program: string;
  evidenceMonth: string;
  signalsJson: string[];
  signalCount: number;
  riskBand: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isResolved: boolean;
  resolvedBy: string | null;
  resolutionReason: string | null;
}

const PROGRAMS = ['EMIRATISATION', 'NITAQAT', 'BAHRAINIZATION', 'OMANISATION', 'QATARISATION'];

const bandColour: Record<string, string> = {
  LOW: 'bg-slate-200 text-slate-800',
  MEDIUM: 'bg-amber-100 text-amber-900',
  HIGH: 'bg-orange-200 text-orange-900',
  CRITICAL: 'bg-rose-200 text-rose-900',
};

export default function ArtificialRiskPage() {
  const [items, setItems] = useState<Flag[]>([]);
  const [signals, setSignals] = useState<string[]>([]);
  const [program, setProgram] = useState('');
  const [bandFilter, setBandFilter] = useState('');
  const [message, setMessage] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [newProgram, setNewProgram] = useState('EMIRATISATION');
  const [evidenceMonth, setEvidenceMonth] = useState(new Date().toISOString().slice(0, 7));
  const [chosen, setChosen] = useState<Set<string>>(new Set());

  async function load() {
    const qs = new URLSearchParams();
    if (program) qs.set('program', program);
    if (bandFilter) qs.set('riskBand', bandFilter);
    const r = await fetch(`/api/v1/nationalisation-overlay/artificial-risk?${qs}`);
    const p = await r.json();
    if (p.success) setItems(p.data ?? []);
    const sr = await fetch('/api/v1/nationalisation-overlay/artificial-risk?action=signals');
    const sp = await sr.json();
    if (sp.success) setSignals(sp.data);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program, bandFilter]);

  function toggle(s: string) {
    setChosen((prev) => {
      const n = new Set(prev);
      if (n.has(s)) n.delete(s);
      else n.add(s);
      return n;
    });
  }

  async function record() {
    setMessage('');
    const r = await fetch('/api/v1/nationalisation-overlay/artificial-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        employeeId,
        program: newProgram,
        evidenceMonth,
        triggeredSignals: Array.from(chosen),
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Flag recorded' : p.message);
    if (p.success) {
      setEmployeeId('');
      setChosen(new Set());
      load();
    }
  }

  async function resolve(id: string) {
    const reason = window.prompt('Resolution reason?')?.trim();
    if (!reason) return;
    const r = await fetch('/api/v1/nationalisation-overlay/artificial-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resolve', id, resolutionReason: reason }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Resolved' : p.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-16-S06 · EPIC-17-S13</p>
          <h1 className="text-2xl font-semibold">Fake / Artificial Nationalisation Detection</h1>
          <p className="mt-1 text-sm text-slate-600">
            Cross-system signals from GPSSA × payroll × WPS × attendance. Risk band derives from
            signal count: 0–1 LOW, 2 MEDIUM, 3 HIGH, ≥4 CRITICAL.
          </p>
        </header>

        {message ? <p className="text-sm text-slate-700">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Raise flag</h2>
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
              Evidence month (YYYY-MM)
              <input
                value={evidenceMonth}
                onChange={(e) => setEvidenceMonth(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
          </div>
          <fieldset className="mt-3 rounded-md border border-slate-200 p-3">
            <legend className="px-2 text-xs font-semibold uppercase text-slate-500">
              Signals triggered ({chosen.size})
            </legend>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {signals.map((s) => (
                <label key={s} className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={chosen.has(s)} onChange={() => toggle(s)} />
                  {s}
                </label>
              ))}
            </div>
          </fieldset>
          <button
            type="button"
            onClick={record}
            className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Record flag
          </button>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Flag register</h2>
            <div className="flex gap-3">
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
              <label className="text-sm font-medium">
                Band:
                <select
                  value={bandFilter}
                  onChange={(e) => setBandFilter(e.target.value)}
                  className="ml-2 rounded-md border border-slate-300 px-2 py-1.5"
                >
                  <option value="">All</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </label>
            </div>
          </div>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Employee</th>
                <th>Program</th>
                <th>Month</th>
                <th>Signals</th>
                <th>Band</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((f) => (
                <tr key={f.id} className="border-t border-slate-100 align-top">
                  <td className="py-2 font-mono text-xs">{f.employeeId}</td>
                  <td className="text-xs">{f.program}</td>
                  <td className="text-xs">{f.evidenceMonth}</td>
                  <td className="text-xs">
                    {Array.isArray(f.signalsJson) ? f.signalsJson.join(', ') : f.signalCount}
                  </td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${bandColour[f.riskBand] ?? ''}`}
                    >
                      {f.riskBand}
                    </span>
                  </td>
                  <td className="text-xs">
                    {f.isResolved ? `RESOLVED by ${f.resolvedBy}` : 'OPEN'}
                  </td>
                  <td className="text-xs">
                    {!f.isResolved ? (
                      <button
                        type="button"
                        onClick={() => resolve(f.id)}
                        className="rounded-md bg-emerald-600 px-2 py-1 text-xs text-white"
                      >
                        Resolve
                      </button>
                    ) : (
                      (f.resolutionReason ?? '—')
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-xs text-slate-500">
                    No flags for this filter.
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
