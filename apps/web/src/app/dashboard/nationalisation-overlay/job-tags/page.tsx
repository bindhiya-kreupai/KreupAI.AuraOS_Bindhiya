'use client';

import { useEffect, useState } from 'react';

interface Tag {
  id: string;
  targetType: string;
  targetId: string;
  program: string;
  eligibility: string;
  reservedSeats: number;
  professionCode: string | null;
}

const PROGRAMS = ['EMIRATISATION', 'NITAQAT', 'BAHRAINIZATION', 'OMANISATION', 'QATARISATION'];
const TARGETS = ['POSITION', 'JOB_PROFILE', 'JOB_FAMILY'];
const ELIGIBILITIES = ['MANDATORY', 'PREFERRED', 'NEUTRAL', 'EXCLUDED'];

export default function JobTagsPage() {
  const [items, setItems] = useState<Tag[]>([]);
  const [program, setProgram] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState('POSITION');
  const [targetId, setTargetId] = useState('');
  const [newProgram, setNewProgram] = useState('EMIRATISATION');
  const [eligibility, setEligibility] = useState('PREFERRED');
  const [reservedSeats, setReservedSeats] = useState('0');
  const [professionCode, setProfessionCode] = useState('');

  async function load() {
    const qs = program ? `?program=${program}` : '';
    const r = await fetch(`/api/v1/nationalisation-overlay/job-tags${qs}`);
    const p = await r.json();
    if (p.success) setItems(p.data ?? []);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program]);

  async function upsert() {
    setMessage('');
    const r = await fetch('/api/v1/nationalisation-overlay/job-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        targetType,
        targetId,
        program: newProgram,
        eligibility,
        reservedSeats: reservedSeats ? Number(reservedSeats) : 0,
        professionCode: professionCode || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : p.message);
    if (p.success) {
      setTargetId('');
      setReservedSeats('0');
      setProfessionCode('');
      load();
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-16-S08 · EPIC-18-S08</p>
          <h1 className="text-2xl font-semibold">Job / Position Tags · Eligible-Role Tagging</h1>
        </header>

        {message ? <p className="text-sm text-slate-700">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Add / update job tag</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="text-sm font-medium">
              Target type
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              >
                {TARGETS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Target ID
              <input
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
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
              Reserved seats
              <input
                value={reservedSeats}
                onChange={(e) => setReservedSeats(e.target.value)}
                inputMode="numeric"
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm font-medium">
              Profession code (Saudi)
              <input
                value={professionCode}
                onChange={(e) => setProfessionCode(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
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
            <h2 className="text-base font-semibold">Tagged positions / job profiles</h2>
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
                <th className="py-2">Target</th>
                <th>Program</th>
                <th>Eligibility</th>
                <th>Reserved</th>
                <th>Profession</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-t border-slate-100">
                  <td className="py-2 font-mono text-xs">
                    {t.targetType}:{t.targetId}
                  </td>
                  <td className="text-xs">{t.program}</td>
                  <td className="text-xs">{t.eligibility}</td>
                  <td className="text-xs">{t.reservedSeats}</td>
                  <td className="text-xs">{t.professionCode ?? '—'}</td>
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
