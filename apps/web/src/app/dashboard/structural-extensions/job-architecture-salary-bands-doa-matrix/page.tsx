'use client';

import { useEffect, useState } from 'react';

const BASE = '/api/v1/structural-extensions';

interface JobProfile {
  code?: string;
  title?: string;
  level?: string | number;
}

interface JobFamily {
  code: string;
  label?: string;
  jobProfiles?: JobProfile[];
}

interface SalaryBand {
  id: string;
  gradeCode: string;
  label: string;
  country: string | null;
  currency: string | null;
  minSalary: number;
  midSalary: number;
  maxSalary: number;
  effectiveFrom: string | null;
  isActive: boolean;
}

interface DoaEntry {
  id: string;
  domain: string;
  actionCode: string;
  label: string;
  level: number;
  minRole: string;
  thresholdAmount: number | null;
  currency: string | null;
  country: string | null;
}

function readList<T>(p: { success?: boolean; data?: unknown }): T[] {
  const d = p.data as { items?: T[] } | T[] | undefined;
  if (Array.isArray(d)) return d;
  return (d?.items as T[]) ?? [];
}

export default function JobArchitectureSalaryBandsDoaMatrixPage() {
  const [families, setFamilies] = useState<JobFamily[]>([]);
  const [bands, setBands] = useState<SalaryBand[]>([]);
  const [doa, setDoa] = useState<DoaEntry[]>([]);
  const [message, setMessage] = useState('');

  const [band, setBand] = useState({
    gradeCode: '',
    label: '',
    country: '',
    currency: '',
    minSalary: '',
    midSalary: '',
    maxSalary: '',
    effectiveFrom: '',
  });
  const [entry, setEntry] = useState({
    domain: '',
    actionCode: '',
    label: '',
    level: '',
    minRole: '',
    thresholdAmount: '',
    currency: '',
    country: '',
    effectiveFrom: '',
  });

  async function loadFamilies() {
    const r = await fetch(`${BASE}/job-architecture`);
    const p = await r.json();
    if (p.success) setFamilies(readList<JobFamily>(p));
  }
  async function loadBands() {
    const r = await fetch(`${BASE}/salary-bands`);
    const p = await r.json();
    if (p.success) setBands(readList<SalaryBand>(p));
  }
  async function loadDoa() {
    const r = await fetch(`${BASE}/doa`);
    const p = await r.json();
    if (p.success) setDoa(readList<DoaEntry>(p));
  }
  useEffect(() => {
    loadFamilies();
    loadBands();
    loadDoa();
  }, []);

  async function post(path: string, body: unknown) {
    const r = await fetch(`${BASE}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return r.json();
  }

  async function upsertBand() {
    const p = await post('salary-bands', {
      action: 'upsert',
      gradeCode: band.gradeCode,
      label: band.label,
      country: band.country || undefined,
      currency: band.currency || undefined,
      minSalary: Number(band.minSalary),
      midSalary: Number(band.midSalary),
      maxSalary: Number(band.maxSalary),
      effectiveFrom: band.effectiveFrom,
    });
    setMessage(p.success ? (p.message ?? 'Saved') : p.error?.message);
    if (p.success) {
      setBand({
        gradeCode: '',
        label: '',
        country: '',
        currency: '',
        minSalary: '',
        midSalary: '',
        maxSalary: '',
        effectiveFrom: '',
      });
      loadBands();
    }
  }

  async function upsertDoa() {
    const p = await post('doa', {
      action: 'upsert',
      domain: entry.domain,
      actionCode: entry.actionCode,
      label: entry.label,
      level: Number(entry.level),
      minRole: entry.minRole,
      thresholdAmount: entry.thresholdAmount ? Number(entry.thresholdAmount) : undefined,
      currency: entry.currency || undefined,
      country: entry.country || undefined,
      effectiveFrom: entry.effectiveFrom,
    });
    setMessage(p.success ? (p.message ?? 'Saved') : p.error?.message);
    if (p.success) {
      setEntry({
        domain: '',
        actionCode: '',
        label: '',
        level: '',
        minRole: '',
        thresholdAmount: '',
        currency: '',
        country: '',
        effectiveFrom: '',
      });
      loadDoa();
    }
  }

  const input = 'rounded-md border border-slate-300 px-2 py-1.5 text-sm';
  const btn = 'rounded-md bg-slate-900 px-3 py-2 text-sm text-white';

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">Structural Extensions · AURA-525</p>
          <h1 className="text-2xl font-semibold">
            Job Architecture, Salary Bands &amp; DoA Matrix
          </h1>
        </header>
        {message ? (
          <p className="rounded-md border border-slate-200 bg-white p-3 text-sm">{message}</p>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Job Architecture</h2>
          <div className="grid gap-3">
            {families.map((fam) => (
              <div key={fam.code} className="rounded border border-slate-100 p-3">
                <p className="font-semibold">
                  {fam.label ?? fam.code}{' '}
                  <span className="ml-2 font-mono text-xs text-slate-500">{fam.code}</span>
                </p>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
                  {(fam.jobProfiles ?? []).map((jp, i) => (
                    <li key={jp.code ?? i}>
                      {jp.title ?? jp.code ?? 'Profile'}
                      {jp.level != null ? ` · L${jp.level}` : ''}
                    </li>
                  ))}
                  {(fam.jobProfiles ?? []).length === 0 && (
                    <li className="text-slate-500">No profiles.</li>
                  )}
                </ul>
              </div>
            ))}
            {families.length === 0 && (
              <p className="text-sm text-slate-500">No job families yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Salary Grade Bands</h2>
          <div className="flex flex-wrap items-end gap-2">
            <input
              className={input}
              placeholder="Grade code"
              value={band.gradeCode}
              onChange={(e) => setBand((f) => ({ ...f, gradeCode: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Label"
              value={band.label}
              onChange={(e) => setBand((f) => ({ ...f, label: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Country"
              value={band.country}
              onChange={(e) => setBand((f) => ({ ...f, country: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Currency"
              value={band.currency}
              onChange={(e) => setBand((f) => ({ ...f, currency: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Min"
              type="number"
              value={band.minSalary}
              onChange={(e) => setBand((f) => ({ ...f, minSalary: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Mid"
              type="number"
              value={band.midSalary}
              onChange={(e) => setBand((f) => ({ ...f, midSalary: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Max"
              type="number"
              value={band.maxSalary}
              onChange={(e) => setBand((f) => ({ ...f, maxSalary: e.target.value }))}
            />
            <input
              className={input}
              type="date"
              value={band.effectiveFrom}
              onChange={(e) => setBand((f) => ({ ...f, effectiveFrom: e.target.value }))}
            />
            <button type="button" className={btn} onClick={upsertBand}>
              Upsert
            </button>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Grade</th>
                <th>Label</th>
                <th>Country</th>
                <th>Currency</th>
                <th>Min</th>
                <th>Mid</th>
                <th>Max</th>
                <th>Effective</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {bands.map((b) => (
                <tr key={b.id} className="border-t border-slate-100">
                  <td className="py-2">{b.gradeCode}</td>
                  <td>{b.label}</td>
                  <td>{b.country ?? '—'}</td>
                  <td>{b.currency ?? '—'}</td>
                  <td>{b.minSalary}</td>
                  <td>{b.midSalary}</td>
                  <td>{b.maxSalary}</td>
                  <td>{b.effectiveFrom ?? '—'}</td>
                  <td>{b.isActive ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {bands.length === 0 && (
                <tr>
                  <td className="py-2 text-slate-500" colSpan={9}>
                    No bands yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">DoA Matrix</h2>
          <div className="flex flex-wrap items-end gap-2">
            <input
              className={input}
              placeholder="Domain"
              value={entry.domain}
              onChange={(e) => setEntry((f) => ({ ...f, domain: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Action code"
              value={entry.actionCode}
              onChange={(e) => setEntry((f) => ({ ...f, actionCode: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Label"
              value={entry.label}
              onChange={(e) => setEntry((f) => ({ ...f, label: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Level"
              type="number"
              min={1}
              value={entry.level}
              onChange={(e) => setEntry((f) => ({ ...f, level: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Min role"
              value={entry.minRole}
              onChange={(e) => setEntry((f) => ({ ...f, minRole: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Threshold amount"
              type="number"
              value={entry.thresholdAmount}
              onChange={(e) => setEntry((f) => ({ ...f, thresholdAmount: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Currency"
              value={entry.currency}
              onChange={(e) => setEntry((f) => ({ ...f, currency: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Country"
              value={entry.country}
              onChange={(e) => setEntry((f) => ({ ...f, country: e.target.value }))}
            />
            <input
              className={input}
              type="date"
              value={entry.effectiveFrom}
              onChange={(e) => setEntry((f) => ({ ...f, effectiveFrom: e.target.value }))}
            />
            <button type="button" className={btn} onClick={upsertDoa}>
              Upsert
            </button>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Domain</th>
                <th>Action</th>
                <th>Label</th>
                <th>Level</th>
                <th>Min Role</th>
                <th>Threshold</th>
                <th>Currency</th>
                <th>Country</th>
              </tr>
            </thead>
            <tbody>
              {doa.map((d) => (
                <tr key={d.id} className="border-t border-slate-100">
                  <td className="py-2">{d.domain}</td>
                  <td>{d.actionCode}</td>
                  <td>{d.label}</td>
                  <td>{d.level}</td>
                  <td>{d.minRole}</td>
                  <td>{d.thresholdAmount ?? '—'}</td>
                  <td>{d.currency ?? '—'}</td>
                  <td>{d.country ?? '—'}</td>
                </tr>
              ))}
              {doa.length === 0 && (
                <tr>
                  <td className="py-2 text-slate-500" colSpan={8}>
                    No DoA entries yet.
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
