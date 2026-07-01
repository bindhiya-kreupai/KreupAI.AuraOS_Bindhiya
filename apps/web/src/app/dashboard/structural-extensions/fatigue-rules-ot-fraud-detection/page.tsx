'use client';

import { useEffect, useState } from 'react';

const BASE = '/api/v1/structural-extensions';

interface FatigueRule {
  id: string;
  ruleCode: string;
  country: string | null;
  maxConsecutiveDays: number | null;
  minRestHoursBetweenShifts: number | null;
  maxWeeklyHours: number | null;
  appliesTo: string | null;
  isActive: boolean;
}

interface OtFraudFlag {
  id: string;
  employeeId: string;
  evidencePeriod: string;
  signal: string;
  severity: string | null;
  isResolved: boolean;
  resolutionReason: string | null;
}

function readList<T>(p: { success?: boolean; data?: unknown }): T[] {
  const d = p.data as { items?: T[] } | T[] | undefined;
  if (Array.isArray(d)) return d;
  return (d?.items as T[]) ?? [];
}

export default function FatigueRulesOtFraudDetectionPage() {
  const [rules, setRules] = useState<FatigueRule[]>([]);
  const [flags, setFlags] = useState<OtFraudFlag[]>([]);
  const [signals, setSignals] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  const [rule, setRule] = useState({
    ruleCode: '',
    country: '',
    maxConsecutiveDays: '',
    minRestHoursBetweenShifts: '',
    maxWeeklyHours: '',
    appliesTo: '',
  });
  const [flag, setFlag] = useState({
    employeeId: '',
    evidencePeriod: '',
    signal: '',
    details: '',
    severity: 'MEDIUM',
  });
  const [reasons, setReasons] = useState<Record<string, string>>({});

  async function loadRules() {
    const r = await fetch(`${BASE}/fatigue-rules`);
    const p = await r.json();
    if (p.success) setRules(readList<FatigueRule>(p));
  }
  async function loadFlags() {
    const r = await fetch(`${BASE}/ot-fraud`);
    const p = await r.json();
    if (p.success) setFlags(readList<OtFraudFlag>(p));
  }
  async function loadSignals() {
    const r = await fetch(`${BASE}/ot-fraud?action=signals`);
    const p = await r.json();
    if (p.success) setSignals(readList<string>(p));
  }
  useEffect(() => {
    loadRules();
    loadFlags();
    loadSignals();
  }, []);

  async function post(path: string, body: unknown) {
    const r = await fetch(`${BASE}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return r.json();
  }

  async function upsertRule() {
    const p = await post('fatigue-rules', {
      action: 'upsert',
      ruleCode: rule.ruleCode,
      country: rule.country || undefined,
      maxConsecutiveDays: rule.maxConsecutiveDays ? Number(rule.maxConsecutiveDays) : undefined,
      minRestHoursBetweenShifts: rule.minRestHoursBetweenShifts
        ? Number(rule.minRestHoursBetweenShifts)
        : undefined,
      maxWeeklyHours: rule.maxWeeklyHours ? Number(rule.maxWeeklyHours) : undefined,
      appliesTo: rule.appliesTo || undefined,
    });
    setMessage(p.success ? (p.message ?? 'Saved') : p.error?.message);
    if (p.success) {
      setRule({
        ruleCode: '',
        country: '',
        maxConsecutiveDays: '',
        minRestHoursBetweenShifts: '',
        maxWeeklyHours: '',
        appliesTo: '',
      });
      loadRules();
    }
  }

  async function raiseFlag() {
    const p = await post('ot-fraud', {
      action: 'raise',
      employeeId: flag.employeeId,
      evidencePeriod: flag.evidencePeriod,
      signal: flag.signal,
      details: flag.details || undefined,
      severity: flag.severity || undefined,
    });
    setMessage(p.success ? (p.message ?? 'Raised') : p.error?.message);
    if (p.success) {
      setFlag({ employeeId: '', evidencePeriod: '', signal: '', details: '', severity: 'MEDIUM' });
      loadFlags();
    }
  }

  async function resolveFlag(id: string) {
    const reason = reasons[id];
    if (!reason) {
      setMessage('Resolution reason required');
      return;
    }
    const p = await post('ot-fraud', { action: 'resolve', id, reason });
    setMessage(p.success ? (p.message ?? 'Resolved') : p.error?.message);
    if (p.success) loadFlags();
  }

  const fallbackSignals = [
    'DUPLICATE_PUNCHES',
    'REPEAT_OVER_CAP',
    'LATE_NIGHT_FLAG',
    'MGR_SELF_APPROVE',
    'NO_LEADER_ATTENDANCE',
    'OUT_OF_BAND_RATE',
  ];
  const signalOptions = signals.length ? signals : fallbackSignals;

  const input = 'rounded-md border border-slate-300 px-2 py-1.5 text-sm';
  const btn = 'rounded-md bg-slate-900 px-3 py-2 text-sm text-white';

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">Structural Extensions · AURA-523</p>
          <h1 className="text-2xl font-semibold">Fatigue Rules &amp; OT Fraud Detection</h1>
        </header>
        {message ? (
          <p className="rounded-md border border-slate-200 bg-white p-3 text-sm">{message}</p>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Fatigue Rules</h2>
          <div className="flex flex-wrap items-end gap-2">
            <input
              className={input}
              placeholder="Rule code"
              value={rule.ruleCode}
              onChange={(e) => setRule((f) => ({ ...f, ruleCode: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Country"
              value={rule.country}
              onChange={(e) => setRule((f) => ({ ...f, country: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Max consecutive days"
              type="number"
              value={rule.maxConsecutiveDays}
              onChange={(e) => setRule((f) => ({ ...f, maxConsecutiveDays: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Min rest hours"
              type="number"
              value={rule.minRestHoursBetweenShifts}
              onChange={(e) =>
                setRule((f) => ({ ...f, minRestHoursBetweenShifts: e.target.value }))
              }
            />
            <input
              className={input}
              placeholder="Max weekly hours"
              type="number"
              value={rule.maxWeeklyHours}
              onChange={(e) => setRule((f) => ({ ...f, maxWeeklyHours: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Applies to"
              value={rule.appliesTo}
              onChange={(e) => setRule((f) => ({ ...f, appliesTo: e.target.value }))}
            />
            <button type="button" className={btn} onClick={upsertRule}>
              Upsert
            </button>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Rule</th>
                <th>Country</th>
                <th>Max Days</th>
                <th>Min Rest</th>
                <th>Max Weekly</th>
                <th>Applies To</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="py-2">{r.ruleCode}</td>
                  <td>{r.country ?? '—'}</td>
                  <td>{r.maxConsecutiveDays ?? '—'}</td>
                  <td>{r.minRestHoursBetweenShifts ?? '—'}</td>
                  <td>{r.maxWeeklyHours ?? '—'}</td>
                  <td>{r.appliesTo ?? '—'}</td>
                  <td>{r.isActive ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr>
                  <td className="py-2 text-slate-500" colSpan={7}>
                    No rules yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">OT Fraud Flags</h2>
          <div className="flex flex-wrap items-end gap-2">
            <input
              className={input}
              placeholder="Employee ID"
              value={flag.employeeId}
              onChange={(e) => setFlag((f) => ({ ...f, employeeId: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Evidence period"
              value={flag.evidencePeriod}
              onChange={(e) => setFlag((f) => ({ ...f, evidencePeriod: e.target.value }))}
            />
            <select
              className={input}
              value={flag.signal}
              onChange={(e) => setFlag((f) => ({ ...f, signal: e.target.value }))}
            >
              <option value="">Select signal</option>
              {signalOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              className={input}
              value={flag.severity}
              onChange={(e) => setFlag((f) => ({ ...f, severity: e.target.value }))}
            >
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              className={input}
              placeholder="Details"
              value={flag.details}
              onChange={(e) => setFlag((f) => ({ ...f, details: e.target.value }))}
            />
            <button type="button" className={btn} onClick={raiseFlag}>
              Raise
            </button>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Employee</th>
                <th>Period</th>
                <th>Signal</th>
                <th>Severity</th>
                <th>Resolved</th>
                <th>Reason</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {flags.map((f) => (
                <tr key={f.id} className="border-t border-slate-100">
                  <td className="py-2">{f.employeeId}</td>
                  <td>{f.evidencePeriod}</td>
                  <td>{f.signal}</td>
                  <td>{f.severity ?? '—'}</td>
                  <td>{f.isResolved ? 'Yes' : 'No'}</td>
                  <td>{f.resolutionReason ?? '—'}</td>
                  <td className="flex items-center gap-1 py-2">
                    {f.isResolved ? null : (
                      <>
                        <input
                          className={input}
                          placeholder="Reason"
                          value={reasons[f.id] ?? ''}
                          onChange={(e) => setReasons((r) => ({ ...r, [f.id]: e.target.value }))}
                        />
                        <button
                          type="button"
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                          onClick={() => resolveFlag(f.id)}
                        >
                          Resolve
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {flags.length === 0 && (
                <tr>
                  <td className="py-2 text-slate-500" colSpan={7}>
                    No flags yet.
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
