'use client';

import { useEffect, useState } from 'react';

interface Tag {
  id: string;
  requisitionId: string;
  program: string;
  eligibility: string;
  isReservedSeat: boolean;
  targetShareNationals: number | null;
  sourceChannel: string | null;
  notes: string | null;
}

const PROGRAMS = ['EMIRATISATION', 'NITAQAT', 'BAHRAINIZATION', 'OMANISATION', 'QATARISATION'];
const ELIGIBILITIES = ['MANDATORY', 'PREFERRED', 'NEUTRAL', 'EXCLUDED'];

export default function RequisitionTagsPage() {
  const [items, setItems] = useState<Tag[]>([]);
  const [program, setProgram] = useState('');
  const [message, setMessage] = useState('');
  const [requisitionId, setRequisitionId] = useState('');
  const [newProgram, setNewProgram] = useState('EMIRATISATION');
  const [eligibility, setEligibility] = useState('PREFERRED');
  const [isReservedSeat, setIsReservedSeat] = useState(false);
  const [targetShare, setTargetShare] = useState('');

  async function load() {
    const qs = program ? `?program=${program}` : '';
    const r = await fetch(`/api/v1/nationalisation-overlay/requisition-tags${qs}`);
    const p = await r.json();
    if (p.success) setItems(p.data ?? []);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program]);

  async function upsert() {
    setMessage('');
    const r = await fetch('/api/v1/nationalisation-overlay/requisition-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        requisitionId,
        program: newProgram,
        eligibility,
        isReservedSeat,
        targetShareNationals: targetShare ? Number(targetShare) : undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : p.message);
    if (p.success) {
      setRequisitionId('');
      setTargetShare('');
      load();
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">
            EPIC-16-S07 · EPIC-17-S11 · EPIC-18-S07
          </p>
          <h1 className="text-2xl font-semibold">Requisition Tags · TA Pipeline Overlay</h1>
        </header>

        {message ? <p className="text-sm text-slate-700">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Add / update tag</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="text-sm font-medium">
              Requisition ID
              <input
                value={requisitionId}
                onChange={(e) => setRequisitionId(e.target.value)}
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
              Eligibility
              <select
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              >
                {ELIGIBILITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Target share of nationals (%)
              <input
                value={targetShare}
                onChange={(e) => setTargetShare(e.target.value)}
                inputMode="numeric"
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={isReservedSeat}
                onChange={(e) => setIsReservedSeat(e.target.checked)}
              />
              Reserved seat
            </label>
          </div>
          <button
            type="button"
            onClick={upsert}
            className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Save tag
          </button>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Tagged requisitions</h2>
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
                <th className="py-2">Requisition</th>
                <th>Program</th>
                <th>Eligibility</th>
                <th>Reserved?</th>
                <th>Target %</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-t border-slate-100">
                  <td className="py-2 font-mono text-xs">{t.requisitionId}</td>
                  <td className="text-xs">{t.program}</td>
                  <td className="text-xs">{t.eligibility}</td>
                  <td className="text-xs">{t.isReservedSeat ? 'YES' : 'no'}</td>
                  <td className="text-xs">{t.targetShareNationals ?? '—'}</td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-xs text-slate-500">
                    No tags yet.
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
