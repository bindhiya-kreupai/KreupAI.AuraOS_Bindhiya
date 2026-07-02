'use client';

import { useEffect, useState } from 'react';

const BASE = '/api/v1/structural-extensions';

interface HolidayChange {
  id: string;
  calendarCode: string;
  country: string;
  year: number;
  changeType: string;
  rationale: string | null;
  status: string;
}

interface RedundancyBatch {
  id: string;
  batchCode: string;
  label: string;
  country: string;
  scope: string;
  impactedHeadcount: number | null;
  status: string;
}

function readList<T>(p: { success?: boolean; data?: unknown }): T[] {
  const d = p.data as { items?: T[] } | T[] | undefined;
  if (Array.isArray(d)) return d;
  return (d?.items as T[]) ?? [];
}

export default function HolidayChangeManagementRedundancyBatchesPage() {
  const [changes, setChanges] = useState<HolidayChange[]>([]);
  const [batches, setBatches] = useState<RedundancyBatch[]>([]);
  const [message, setMessage] = useState('');

  const [change, setChange] = useState({
    calendarCode: '',
    country: '',
    year: '',
    changeType: 'ADD',
    changeJson: '',
    rationale: '',
  });
  const [batch, setBatch] = useState({
    batchCode: '',
    label: '',
    country: '',
    scope: '',
    impactedHeadcount: '',
  });
  const [transitions, setTransitions] = useState<Record<string, string>>({});

  async function loadChanges() {
    const r = await fetch(`${BASE}/holiday-changes`);
    const p = await r.json();
    if (p.success) setChanges(readList<HolidayChange>(p));
  }
  async function loadBatches() {
    const r = await fetch(`${BASE}/redundancy`);
    const p = await r.json();
    if (p.success) setBatches(readList<RedundancyBatch>(p));
  }
  useEffect(() => {
    loadChanges();
    loadBatches();
  }, []);

  async function post(path: string, body: unknown) {
    const r = await fetch(`${BASE}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return r.json();
  }

  async function requestChange() {
    let change_: unknown = {};
    if (change.changeJson.trim()) {
      try {
        change_ = JSON.parse(change.changeJson);
      } catch {
        setMessage('Change field must be valid JSON');
        return;
      }
    }
    const p = await post('holiday-changes', {
      action: 'request',
      calendarCode: change.calendarCode,
      country: change.country,
      year: Number(change.year),
      changeType: change.changeType,
      change: change_,
      rationale: change.rationale,
    });
    setMessage(p.success ? (p.message ?? 'Requested') : p.error?.message);
    if (p.success) {
      setChange({
        calendarCode: '',
        country: '',
        year: '',
        changeType: 'ADD',
        changeJson: '',
        rationale: '',
      });
      loadChanges();
    }
  }

  async function changeAction(id: string, action: string) {
    const p = await post('holiday-changes', { action, id });
    setMessage(p.success ? (p.message ?? 'Done') : p.error?.message);
    if (p.success) loadChanges();
  }

  async function upsertBatch() {
    const p = await post('redundancy', {
      action: 'upsert',
      batchCode: batch.batchCode,
      label: batch.label,
      country: batch.country,
      scope: batch.scope,
      impactedHeadcount: batch.impactedHeadcount ? Number(batch.impactedHeadcount) : undefined,
    });
    setMessage(p.success ? (p.message ?? 'Saved') : p.error?.message);
    if (p.success) {
      setBatch({ batchCode: '', label: '', country: '', scope: '', impactedHeadcount: '' });
      loadBatches();
    }
  }

  async function transitionBatch(id: string) {
    const status = transitions[id];
    if (!status) {
      setMessage('Target status required');
      return;
    }
    const p = await post('redundancy', { action: 'transition', id, status });
    setMessage(p.success ? (p.message ?? 'Transitioned') : p.error?.message);
    if (p.success) loadBatches();
  }

  const input = 'rounded-md border border-slate-300 px-2 py-1.5 text-sm';
  const btn = 'rounded-md bg-slate-900 px-3 py-2 text-sm text-white';

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">Structural Extensions · AURA-524</p>
          <h1 className="text-2xl font-semibold">
            Holiday Change Management &amp; Redundancy Batches
          </h1>
        </header>
        {message ? (
          <p className="rounded-md border border-slate-200 bg-white p-3 text-sm">{message}</p>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Holiday Calendar Change Requests</h2>
          <div className="flex flex-wrap items-end gap-2">
            <input
              className={input}
              placeholder="Calendar code"
              value={change.calendarCode}
              onChange={(e) => setChange((f) => ({ ...f, calendarCode: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Country"
              value={change.country}
              onChange={(e) => setChange((f) => ({ ...f, country: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Year"
              type="number"
              value={change.year}
              onChange={(e) => setChange((f) => ({ ...f, year: e.target.value }))}
            />
            <select
              className={input}
              value={change.changeType}
              onChange={(e) => setChange((f) => ({ ...f, changeType: e.target.value }))}
            >
              {['ADD', 'REMOVE', 'MOVE', 'RENAME'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              className={input}
              placeholder='Change JSON e.g. {"name":"National Day"}'
              value={change.changeJson}
              onChange={(e) => setChange((f) => ({ ...f, changeJson: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Rationale"
              value={change.rationale}
              onChange={(e) => setChange((f) => ({ ...f, rationale: e.target.value }))}
            />
            <button type="button" className={btn} onClick={requestChange}>
              Request
            </button>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Calendar</th>
                <th>Country</th>
                <th>Year</th>
                <th>Type</th>
                <th>Rationale</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {changes.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="py-2">{c.calendarCode}</td>
                  <td>{c.country}</td>
                  <td>{c.year}</td>
                  <td>{c.changeType}</td>
                  <td>{c.rationale ?? '—'}</td>
                  <td>{c.status}</td>
                  <td className="flex gap-1 py-2">
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      onClick={() => changeAction(c.id, 'approve')}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      onClick={() => changeAction(c.id, 'publish')}
                    >
                      Publish
                    </button>
                  </td>
                </tr>
              ))}
              {changes.length === 0 && (
                <tr>
                  <td className="py-2 text-slate-500" colSpan={7}>
                    No change requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Redundancy Batches</h2>
          <div className="flex flex-wrap items-end gap-2">
            <input
              className={input}
              placeholder="Batch code"
              value={batch.batchCode}
              onChange={(e) => setBatch((f) => ({ ...f, batchCode: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Label"
              value={batch.label}
              onChange={(e) => setBatch((f) => ({ ...f, label: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Country"
              value={batch.country}
              onChange={(e) => setBatch((f) => ({ ...f, country: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Scope"
              value={batch.scope}
              onChange={(e) => setBatch((f) => ({ ...f, scope: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Impacted headcount"
              type="number"
              value={batch.impactedHeadcount}
              onChange={(e) => setBatch((f) => ({ ...f, impactedHeadcount: e.target.value }))}
            />
            <button type="button" className={btn} onClick={upsertBatch}>
              Upsert
            </button>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Batch</th>
                <th>Label</th>
                <th>Country</th>
                <th>Scope</th>
                <th>Headcount</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id} className="border-t border-slate-100">
                  <td className="py-2">{b.batchCode}</td>
                  <td>{b.label}</td>
                  <td>{b.country}</td>
                  <td>{b.scope}</td>
                  <td>{b.impactedHeadcount ?? '—'}</td>
                  <td>{b.status}</td>
                  <td className="flex items-center gap-1 py-2">
                    <input
                      className={input}
                      placeholder="Target status"
                      value={transitions[b.id] ?? ''}
                      onChange={(e) => setTransitions((r) => ({ ...r, [b.id]: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      onClick={() => transitionBatch(b.id)}
                    >
                      Transition
                    </button>
                  </td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr>
                  <td className="py-2 text-slate-500" colSpan={7}>
                    No batches yet.
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
