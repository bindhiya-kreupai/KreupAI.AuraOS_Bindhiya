'use client';

import { useEffect, useState } from 'react';

const BASE = '/api/v1/structural-extensions';

interface PayrollCalendar {
  id: string;
  periodCode: string;
  country: string;
  periodStart: string | null;
  periodEnd: string | null;
  cutoffAt: string | null;
  lockAt: string | null;
  payAt: string | null;
  status: string;
}

interface VarianceEntry {
  id: string;
  payrollRunId: string;
  period: string;
  varianceCode: string;
  category: string;
  expectedAmount: number;
  actualAmount: number;
  variancePct: number | null;
  status: string;
}

function readList<T>(p: { success?: boolean; data?: unknown }): T[] {
  const d = p.data as { items?: T[] } | T[] | undefined;
  if (Array.isArray(d)) return d;
  return (d?.items as T[]) ?? [];
}

function toIso(local: string): string {
  return local ? new Date(local).toISOString() : '';
}

export default function PayrollCalendarControlVarianceRegisterPage() {
  const [calendars, setCalendars] = useState<PayrollCalendar[]>([]);
  const [variances, setVariances] = useState<VarianceEntry[]>([]);
  const [message, setMessage] = useState('');

  const [cal, setCal] = useState({
    periodCode: '',
    country: '',
    periodStart: '',
    periodEnd: '',
    cutoffAt: '',
    lockAt: '',
    payAt: '',
  });
  const [variance, setVariance] = useState({
    payrollRunId: '',
    period: '',
    varianceCode: '',
    category: '',
    expectedAmount: '',
    actualAmount: '',
    rootCause: '',
    actionPlan: '',
  });
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  async function loadCalendars() {
    const r = await fetch(`${BASE}/payroll-calendar`);
    const p = await r.json();
    if (p.success) setCalendars(readList<PayrollCalendar>(p));
  }
  async function loadVariances() {
    const r = await fetch(`${BASE}/payroll-variance`);
    const p = await r.json();
    if (p.success) setVariances(readList<VarianceEntry>(p));
  }
  useEffect(() => {
    loadCalendars();
    loadVariances();
  }, []);

  async function post(path: string, body: unknown) {
    const r = await fetch(`${BASE}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return r.json();
  }

  async function upsertCalendar() {
    const p = await post('payroll-calendar', {
      action: 'upsert',
      periodCode: cal.periodCode,
      country: cal.country,
      periodStart: toIso(cal.periodStart),
      periodEnd: toIso(cal.periodEnd),
      cutoffAt: toIso(cal.cutoffAt),
      lockAt: toIso(cal.lockAt),
      payAt: toIso(cal.payAt),
    });
    setMessage(p.success ? (p.message ?? 'Saved') : p.error?.message);
    if (p.success) {
      setCal({
        periodCode: '',
        country: '',
        periodStart: '',
        periodEnd: '',
        cutoffAt: '',
        lockAt: '',
        payAt: '',
      });
      loadCalendars();
    }
  }

  async function lockCalendar(id: string) {
    const p = await post('payroll-calendar', { action: 'lock', id });
    setMessage(p.success ? (p.message ?? 'Locked') : p.error?.message);
    if (p.success) loadCalendars();
  }

  async function recordVariance() {
    const p = await post('payroll-variance', {
      action: 'record',
      payrollRunId: variance.payrollRunId,
      period: variance.period,
      varianceCode: variance.varianceCode,
      category: variance.category,
      expectedAmount: Number(variance.expectedAmount),
      actualAmount: Number(variance.actualAmount),
      rootCause: variance.rootCause || undefined,
      actionPlan: variance.actionPlan || undefined,
    });
    setMessage(p.success ? (p.message ?? 'Recorded') : p.error?.message);
    if (p.success) {
      setVariance({
        payrollRunId: '',
        period: '',
        varianceCode: '',
        category: '',
        expectedAmount: '',
        actualAmount: '',
        rootCause: '',
        actionPlan: '',
      });
      loadVariances();
    }
  }

  async function setVarianceStatus(id: string) {
    const status = statuses[id];
    if (!status) {
      setMessage('Status required');
      return;
    }
    const p = await post('payroll-variance', { action: 'set-status', id, status });
    setMessage(p.success ? (p.message ?? 'Updated') : p.error?.message);
    if (p.success) loadVariances();
  }

  const input = 'rounded-md border border-slate-300 px-2 py-1.5 text-sm';
  const btn = 'rounded-md bg-slate-900 px-3 py-2 text-sm text-white';

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">Structural Extensions · AURA-526</p>
          <h1 className="text-2xl font-semibold">
            Payroll Calendar Control &amp; Variance Register
          </h1>
        </header>
        {message ? (
          <p className="rounded-md border border-slate-200 bg-white p-3 text-sm">{message}</p>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Payroll Calendar Control</h2>
          <div className="flex flex-wrap items-end gap-2">
            <input
              className={input}
              placeholder="Period code"
              value={cal.periodCode}
              onChange={(e) => setCal((f) => ({ ...f, periodCode: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Country"
              value={cal.country}
              onChange={(e) => setCal((f) => ({ ...f, country: e.target.value }))}
            />
            <label className="text-xs text-slate-500">
              Start
              <input
                className={`${input} block`}
                type="datetime-local"
                value={cal.periodStart}
                onChange={(e) => setCal((f) => ({ ...f, periodStart: e.target.value }))}
              />
            </label>
            <label className="text-xs text-slate-500">
              End
              <input
                className={`${input} block`}
                type="datetime-local"
                value={cal.periodEnd}
                onChange={(e) => setCal((f) => ({ ...f, periodEnd: e.target.value }))}
              />
            </label>
            <label className="text-xs text-slate-500">
              Cutoff
              <input
                className={`${input} block`}
                type="datetime-local"
                value={cal.cutoffAt}
                onChange={(e) => setCal((f) => ({ ...f, cutoffAt: e.target.value }))}
              />
            </label>
            <label className="text-xs text-slate-500">
              Lock
              <input
                className={`${input} block`}
                type="datetime-local"
                value={cal.lockAt}
                onChange={(e) => setCal((f) => ({ ...f, lockAt: e.target.value }))}
              />
            </label>
            <label className="text-xs text-slate-500">
              Pay
              <input
                className={`${input} block`}
                type="datetime-local"
                value={cal.payAt}
                onChange={(e) => setCal((f) => ({ ...f, payAt: e.target.value }))}
              />
            </label>
            <button type="button" className={btn} onClick={upsertCalendar}>
              Upsert
            </button>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Period</th>
                <th>Country</th>
                <th>Start</th>
                <th>End</th>
                <th>Cutoff</th>
                <th>Lock</th>
                <th>Pay</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {calendars.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="py-2">{c.periodCode}</td>
                  <td>{c.country}</td>
                  <td>{c.periodStart ?? '—'}</td>
                  <td>{c.periodEnd ?? '—'}</td>
                  <td>{c.cutoffAt ?? '—'}</td>
                  <td>{c.lockAt ?? '—'}</td>
                  <td>{c.payAt ?? '—'}</td>
                  <td>{c.status}</td>
                  <td>
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      onClick={() => lockCalendar(c.id)}
                    >
                      Lock
                    </button>
                  </td>
                </tr>
              ))}
              {calendars.length === 0 && (
                <tr>
                  <td className="py-2 text-slate-500" colSpan={9}>
                    No calendars yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Payroll Variance Register</h2>
          <div className="flex flex-wrap items-end gap-2">
            <input
              className={input}
              placeholder="Payroll run ID"
              value={variance.payrollRunId}
              onChange={(e) => setVariance((f) => ({ ...f, payrollRunId: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Period"
              value={variance.period}
              onChange={(e) => setVariance((f) => ({ ...f, period: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Variance code"
              value={variance.varianceCode}
              onChange={(e) => setVariance((f) => ({ ...f, varianceCode: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Category"
              value={variance.category}
              onChange={(e) => setVariance((f) => ({ ...f, category: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Expected"
              type="number"
              value={variance.expectedAmount}
              onChange={(e) => setVariance((f) => ({ ...f, expectedAmount: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Actual"
              type="number"
              value={variance.actualAmount}
              onChange={(e) => setVariance((f) => ({ ...f, actualAmount: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Root cause"
              value={variance.rootCause}
              onChange={(e) => setVariance((f) => ({ ...f, rootCause: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Action plan"
              value={variance.actionPlan}
              onChange={(e) => setVariance((f) => ({ ...f, actionPlan: e.target.value }))}
            />
            <button type="button" className={btn} onClick={recordVariance}>
              Record
            </button>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Run</th>
                <th>Period</th>
                <th>Code</th>
                <th>Category</th>
                <th>Expected</th>
                <th>Actual</th>
                <th>Variance %</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {variances.map((v) => (
                <tr key={v.id} className="border-t border-slate-100">
                  <td className="py-2">{v.payrollRunId}</td>
                  <td>{v.period}</td>
                  <td>{v.varianceCode}</td>
                  <td>{v.category}</td>
                  <td>{v.expectedAmount}</td>
                  <td>{v.actualAmount}</td>
                  <td>{v.variancePct ?? '—'}</td>
                  <td>{v.status}</td>
                  <td className="flex items-center gap-1 py-2">
                    <select
                      className={input}
                      value={statuses[v.id] ?? ''}
                      onChange={(e) => setStatuses((r) => ({ ...r, [v.id]: e.target.value }))}
                    >
                      <option value="">Set status</option>
                      {['OPEN', 'EXPLAINED', 'ACCEPTED', 'CLOSED'].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      onClick={() => setVarianceStatus(v.id)}
                    >
                      Apply
                    </button>
                  </td>
                </tr>
              ))}
              {variances.length === 0 && (
                <tr>
                  <td className="py-2 text-slate-500" colSpan={9}>
                    No variances yet.
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
