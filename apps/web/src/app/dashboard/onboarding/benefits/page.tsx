'use client';

import { useEffect, useMemo, useState } from 'react';

interface PlanSummary {
  id: string;
  planCode: string;
  planName: string;
  carrierName: string;
  planTier?: string | null;
}

interface Enrollment {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  status: string;
  coverageLevel: string;
  vendorReference?: string | null;
  insuranceCardStatus: string;
  insuranceCardIssuedAt?: string | null;
  enrolledDependents?: unknown[];
  plan?: PlanSummary;
}

interface GateResult {
  blocked: boolean;
  reasons: string[];
  enrollment?: Enrollment | null;
  evaluated?: {
    countryCode?: string;
    regionCode?: string;
    gradeCode?: string;
    mandatory?: boolean;
    authority?: string;
    selectedPlan?: PlanSummary | null;
    dependentCount?: number;
    eligiblePlanCount?: number;
  };
}

export default function BenefitsOnboardingPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [dependentIds, setDependentIds] = useState('');
  const [vendorReference, setVendorReference] = useState('');
  const [rows, setRows] = useState<Enrollment[]>([]);
  const [gate, setGate] = useState<GateResult | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedEnrollment = useMemo(() => {
    return rows.find((row) => row.employeeId === employeeId) ?? gate?.enrollment ?? null;
  }, [employeeId, gate?.enrollment, rows]);

  async function loadRows() {
    const response = await fetch('/api/v1/onboarding/benefits');
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.error?.message ?? 'Unable to load benefits enrollments');
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
        `/api/v1/onboarding/benefits?action=completion-gate&employeeId=${encodeURIComponent(
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

  async function initiate() {
    if (!employeeId.trim()) {
      setMessage('Employee ID is required');
      return;
    }
    const ids = dependentIds
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/v1/onboarding/benefits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employeeId.trim(), dependentIds: ids }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message ?? 'Enrollment creation failed');
      }
      await loadRows();
      await evaluate();
      setMessage('Medical benefits enrollment initiated');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Enrollment creation failed');
    } finally {
      setLoading(false);
    }
  }

  async function markCardIssued() {
    if (!selectedEnrollment?.id) {
      setMessage('Select or initiate an enrollment first');
      return;
    }
    if (!vendorReference.trim()) {
      setMessage('Vendor policy/card reference is required');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(
        `/api/v1/onboarding/benefits/${selectedEnrollment.id}/issue-card`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vendorReference: vendorReference.trim(),
            insuranceCardStatus: 'ISSUED',
          }),
        }
      );
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message ?? 'Card status update failed');
      }
      await loadRows();
      await evaluate();
      setVendorReference('');
      setMessage('Insurance card issued');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Card status update failed');
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
          <h1 className="text-2xl font-semibold">Medical Benefits Enrollment</h1>
        </header>

        <section className="grid gap-4 lg:grid-cols-[380px_1fr]">
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

            <label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="dependentIds">
              Dependent IDs
            </label>
            <input
              id="dependentIds"
              value={dependentIds}
              onChange={(event) => setDependentIds(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              placeholder="optional comma-separated UUIDs"
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
                onClick={initiate}
                disabled={loading}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium disabled:opacity-50"
              >
                Initiate
              </button>
            </div>

            <label
              className="mt-5 block text-sm font-medium text-slate-700"
              htmlFor="vendorReference"
            >
              Vendor Policy/Card Reference
            </label>
            <input
              id="vendorReference"
              value={vendorReference}
              onChange={(event) => setVendorReference(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              placeholder="policy or card reference"
            />
            <button
              type="button"
              onClick={markCardIssued}
              disabled={loading}
              className="mt-3 w-full rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Mark Card Issued
            </button>

            {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">Completion Gate</h2>
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
                  <p className="text-xs uppercase text-slate-500">Authority</p>
                  <p className="font-semibold">{gate.evaluated?.authority ?? '-'}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs uppercase text-slate-500">Selected Plan</p>
                  <p className="font-semibold">
                    {gate.evaluated?.selectedPlan?.planName ?? 'No eligible plan'}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs uppercase text-slate-500">Dependents</p>
                  <p className="font-semibold">{gate.evaluated?.dependentCount ?? 0}</p>
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
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">Evaluate an employee to see blockers.</p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Enrollment Queue</h2>
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
                  <th className="px-3 py-2">Plan</th>
                  <th className="px-3 py-2">Coverage</th>
                  <th className="px-3 py-2">Vendor Ref</th>
                  <th className="px-3 py-2">Card</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">
                      <div className="font-medium">{row.employeeName}</div>
                      <div className="text-xs text-slate-500">{row.employeeCode}</div>
                    </td>
                    <td className="px-3 py-2">{row.plan?.planName ?? '-'}</td>
                    <td className="px-3 py-2">{row.coverageLevel}</td>
                    <td className="px-3 py-2">{row.vendorReference ?? '-'}</td>
                    <td className="px-3 py-2">{row.insuranceCardStatus}</td>
                    <td className="px-3 py-2">{row.status}</td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-center text-slate-500" colSpan={6}>
                      No medical benefits onboarding enrollments found.
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
