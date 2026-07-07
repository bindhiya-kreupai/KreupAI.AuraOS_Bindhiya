'use client';

import { useCallback, useEffect, useState } from 'react';

interface Exception {
  id: string;
  employeeId: string;
  benefitCode: string;
  exceptionType: string;
  reason: string | null;
  status: string;
  raisedAt: string;
  expiresAt: string | null;
}

interface GapItem {
  benefitCode: string;
  benefitType?: string;
  reason?: string;
}

const statusColor: Record<string, string> = {
  OPEN: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  CLOSED: 'bg-slate-100 text-slate-700',
};

export default function ExceptionsGapPage() {
  const [rows, setRows] = useState<Exception[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({
    employeeId: '',
    benefitCode: 'MEDICAL_INSURANCE_UAE',
    exceptionType: 'OPT_OUT',
    reason: '',
    expiresAt: '',
  });
  const [gapEmployeeId, setGapEmployeeId] = useState('');
  const [gaps, setGaps] = useState<GapItem[] | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const url = new URL('/api/v1/benefits-compliance/enrollments', window.location.origin);
    url.searchParams.set('resource', 'exceptions');
    if (statusFilter) url.searchParams.set('status', statusFilter);
    const r = await fetch(url.toString());
    const p = await r.json();
    // Exception list returns a plain array.
    if (p.success) setRows(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function post(body: Record<string, unknown>, okMsg: string) {
    setBusy(true);
    setMessage('');
    try {
      const r = await fetch('/api/v1/benefits-compliance/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const p = await r.json();
      setMessage(p.success ? okMsg : (p.error?.details?.error ?? p.error?.message ?? 'Failed'));
      if (p.success) await load();
    } finally {
      setBusy(false);
    }
  }

  function raiseException() {
    if (!form.employeeId) {
      setMessage('Employee is required.');
      return;
    }
    void post(
      {
        action: 'raise-exception',
        ...form,
        reason: form.reason || undefined,
        expiresAt: form.expiresAt || undefined,
      },
      'Exception raised'
    );
  }

  function closeException(id: string) {
    void post({ action: 'close-exception', id }, 'Exception closed');
  }

  async function detectGaps() {
    if (!gapEmployeeId) {
      setMessage('Enter an employee ID to detect mandatory gaps.');
      return;
    }
    setBusy(true);
    setMessage('');
    setGaps(null);
    try {
      const r = await fetch('/api/v1/benefits-compliance/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'findMandatoryGaps',
          employeeId: gapEmployeeId,
          context: { employee: { id: gapEmployeeId } },
        }),
      });
      const p = await r.json();
      if (p.success) {
        const uncovered: GapItem[] = p.data?.uncovered ?? [];
        setGaps(uncovered);
        setMessage(
          uncovered.length === 0
            ? 'No mandatory coverage gaps detected.'
            : `${uncovered.length} mandatory gap(s) detected.`
        );
      } else {
        setMessage(p.error?.details?.error ?? p.error?.message ?? 'Failed');
      }
    } finally {
      setBusy(false);
    }
  }

  function prefillFromGap(g: GapItem) {
    setForm((f) => ({
      ...f,
      employeeId: gapEmployeeId,
      benefitCode: g.benefitCode,
      exceptionType: 'GAP',
      reason: g.reason ?? 'Mandatory coverage gap detected',
    }));
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-22 · S14 / S16</p>
            <h1 className="text-2xl font-semibold">Exceptions &amp; Mandatory-Gap Detection</h1>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="APPROVED">APPROVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Mandatory-Gap Detection</h2>
          <p className="mt-1 text-sm text-slate-500">
            Evaluate an employee against the mandatory benefit catalogue and surface uncovered
            coverages.
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="text-sm">
              Employee ID
              <input
                value={gapEmployeeId}
                onChange={(e) => setGapEmployeeId(e.target.value)}
                className="mt-1 w-64 rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <button
              type="button"
              onClick={detectGaps}
              disabled={busy}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
            >
              Detect Gaps
            </button>
          </div>
          {gaps && gaps.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm">
              {gaps.map((g) => (
                <li
                  key={g.benefitCode}
                  className="flex items-center justify-between rounded-md border border-rose-200 bg-rose-50 px-3 py-2"
                >
                  <span className="font-mono text-xs">{g.benefitCode}</span>
                  <button
                    type="button"
                    onClick={() => prefillFromGap(g)}
                    className="rounded-md border border-rose-300 px-2 py-1 text-xs text-rose-800"
                  >
                    Raise exception
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6">
          <label className="text-sm">
            Employee
            <input
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Benefit Code
            <input
              value={form.benefitCode}
              onChange={(e) => setForm((f) => ({ ...f, benefitCode: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Type
            <select
              value={form.exceptionType}
              onChange={(e) => setForm((f) => ({ ...f, exceptionType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['OPT_OUT', 'GRACE_PERIOD', 'GAP', 'OTHER'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="text-sm md:col-span-2">
            Reason
            <input
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={raiseException}
            disabled={busy}
            className="self-end rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Raise Exception
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Raised</th>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Benefit</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Reason</th>
                <th className="px-3 py-2">Expires</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((x) => (
                <tr key={x.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 text-xs">{x.raisedAt?.slice(0, 10)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{x.employeeId}</td>
                  <td className="px-3 py-2 font-mono text-xs">{x.benefitCode}</td>
                  <td className="px-3 py-2 text-xs">{x.exceptionType}</td>
                  <td className="px-3 py-2 text-xs">{x.reason ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{x.expiresAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[x.status] ?? ''}`}
                    >
                      {x.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {x.status !== 'CLOSED' && (
                      <button
                        type="button"
                        onClick={() => closeException(x.id)}
                        disabled={busy}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs disabled:opacity-50"
                      >
                        Close
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No exceptions.
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
