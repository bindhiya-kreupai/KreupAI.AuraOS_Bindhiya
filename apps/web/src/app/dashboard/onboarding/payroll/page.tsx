'use client';

import { useEffect, useMemo, useState } from 'react';

interface PayrollProfile {
  id: string;
  employeeId: string;
  countryCode: string;
  readinessStatus: string;
  approvalStatus: string;
  firstPayrollMonth: string;
  firstPeriodPaidDays: number;
  firstPeriodCalendarDays: number;
  firstPeriodProrationFactor: number;
  firstPeriodGrossProrated: number;
  firstPayDueAt: string;
  blockReasons: string[];
  alertReasons?: string[];
  bankIBAN?: string | null;
  bankRoutingCode?: string | null;
  labourCardNumber?: string | null;
  costCenterCode?: string | null;
}

interface GateResult {
  blocked: boolean;
  reasons: string[];
  profile?: PayrollProfile | null;
  evaluated?: Partial<PayrollProfile> & {
    salaryComponents?: Record<string, unknown>;
  };
}

export default function PayrollOnboardingPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [rows, setRows] = useState<PayrollProfile[]>([]);
  const [gate, setGate] = useState<GateResult | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedProfile = useMemo(() => {
    return rows.find((row) => row.employeeId === employeeId) ?? gate?.profile ?? null;
  }, [employeeId, gate?.profile, rows]);

  async function loadRows() {
    const response = await fetch('/api/v1/onboarding/payroll');
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.error?.message ?? 'Unable to load payroll profiles');
    }
    setRows(payload.data ?? []);
  }

  useEffect(() => {
    loadRows().catch((error) => setMessage(error.message));
  }, []);

  async function evaluate() {
    if (!employeeId.trim()) {
      setMessage('Employee ID is required');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(
        `/api/v1/onboarding/payroll?action=completion-gate&employeeId=${encodeURIComponent(
          employeeId.trim()
        )}`
      );
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message ?? 'Evaluation failed');
      }
      setGate(payload.data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Evaluation failed');
    } finally {
      setLoading(false);
    }
  }

  async function createOrRefresh() {
    if (!employeeId.trim()) {
      setMessage('Employee ID is required');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/v1/onboarding/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employeeId.trim() }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message ?? 'Payroll profile creation failed');
      }
      await loadRows();
      await evaluate();
      setMessage('Payroll profile refreshed');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Payroll profile creation failed');
    } finally {
      setLoading(false);
    }
  }

  async function approve() {
    if (!selectedProfile?.id) {
      setMessage('Create or select a payroll profile first');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`/api/v1/onboarding/payroll/${selectedProfile.id}/approve`, {
        method: 'POST',
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message ?? 'Payroll profile approval failed');
      }
      await loadRows();
      await evaluate();
      setMessage('Payroll profile approved');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Payroll profile approval failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-2 border-b border-slate-200 pb-4">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Onboarding Compliance
          </p>
          <h1 className="text-2xl font-semibold">Payroll Readiness</h1>
        </header>

        <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <label className="text-sm font-medium text-slate-700" htmlFor="employeeId">
              Employee ID
            </label>
            <input
              id="employeeId"
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              placeholder="employee UUID"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={evaluate}
                disabled={loading}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Evaluate
              </button>
              <button
                type="button"
                onClick={createOrRefresh}
                disabled={loading}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium disabled:opacity-50"
              >
                Refresh Profile
              </button>
            </div>

            <button
              type="button"
              onClick={approve}
              disabled={loading}
              className="mt-3 w-full rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Approve Payroll Profile
            </button>

            {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">Payroll Gate</h2>
            {gate ? (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs uppercase text-slate-500">Status</p>
                  <p
                    className={
                      gate.blocked
                        ? 'font-semibold text-rose-700'
                        : 'font-semibold text-emerald-700'
                    }
                  >
                    {gate.blocked ? 'Blocked' : 'Clear'}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs uppercase text-slate-500">First Payroll</p>
                  <p className="font-semibold">
                    {gate.profile?.firstPayrollMonth ?? gate.evaluated?.firstPayrollMonth ?? '-'}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs uppercase text-slate-500">Proration</p>
                  <p className="font-semibold">
                    {gate.profile?.firstPeriodPaidDays ?? gate.evaluated?.firstPeriodPaidDays ?? 0}
                    {' / '}
                    {gate.profile?.firstPeriodCalendarDays ??
                      gate.evaluated?.firstPeriodCalendarDays ??
                      0}
                    {' days'}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs uppercase text-slate-500">Prorated Gross</p>
                  <p className="font-semibold">
                    {gate.profile?.firstPeriodGrossProrated ??
                      gate.evaluated?.firstPeriodGrossProrated ??
                      '-'}
                  </p>
                </div>
                {gate.reasons.length ? (
                  <div className="rounded-md border border-rose-200 bg-rose-50 p-3 md:col-span-2">
                    <p className="text-xs uppercase text-rose-600">Blockers</p>
                    <ul className="mt-2 list-disc pl-5 text-sm text-rose-800">
                      {gate.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {selectedProfile?.alertReasons?.length ? (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 md:col-span-2">
                    <p className="text-xs uppercase text-amber-700">Alerts</p>
                    <ul className="mt-2 list-disc pl-5 text-sm text-amber-800">
                      {selectedProfile.alertReasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">Evaluate an employee to see readiness.</p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Payroll Profile Queue</h2>
            <button
              type="button"
              onClick={() => loadRows().catch((error) => setMessage(error.message))}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            >
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Employee</th>
                  <th className="px-3 py-2">Country</th>
                  <th className="px-3 py-2">Readiness</th>
                  <th className="px-3 py-2">Approval</th>
                  <th className="px-3 py-2">First Pay</th>
                  <th className="px-3 py-2">Cost Centre</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">{row.employeeId}</td>
                    <td className="px-3 py-2">{row.countryCode}</td>
                    <td className="px-3 py-2">{row.readinessStatus}</td>
                    <td className="px-3 py-2">{row.approvalStatus}</td>
                    <td className="px-3 py-2">{row.firstPayDueAt?.slice(0, 10)}</td>
                    <td className="px-3 py-2">{row.costCenterCode ?? '-'}</td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-center text-slate-500" colSpan={6}>
                      No payroll onboarding profiles found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
