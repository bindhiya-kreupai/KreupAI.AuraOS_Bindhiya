'use client';

import { useEffect, useMemo, useState } from 'react';

interface Registration {
  id: string;
  employeeId: string;
  countryCode: string;
  authority: string;
  scheme: string;
  status: string;
  contributionWage: number;
  currency: string;
  registrationReference?: string | null;
  deadlineAt: string;
  mandatory: boolean;
  ruleVersion: string;
}

interface GateResult {
  blocked: boolean;
  reasons: string[];
  registration?: Registration | null;
  evaluated?: Partial<Registration> & {
    applicable?: boolean;
    blockCompletion?: boolean;
    reason?: string;
  };
}

export default function SocialInsuranceOnboardingPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [reference, setReference] = useState('');
  const [rows, setRows] = useState<Registration[]>([]);
  const [gate, setGate] = useState<GateResult | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedRegistration = useMemo(() => {
    return rows.find((row) => row.employeeId === employeeId) ?? gate?.registration ?? null;
  }, [employeeId, gate?.registration, rows]);

  async function loadRows() {
    const response = await fetch('/api/v1/onboarding/social-insurance');
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.error?.message ?? 'Unable to load registrations');
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
        `/api/v1/onboarding/social-insurance?action=completion-gate&employeeId=${encodeURIComponent(
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
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/v1/onboarding/social-insurance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employeeId.trim(), status: 'IN_PROGRESS' }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message ?? 'Registration creation failed');
      }
      await loadRows();
      await evaluate();
      setMessage('Registration initiated');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Registration creation failed');
    } finally {
      setLoading(false);
    }
  }

  async function markRegistered() {
    if (!selectedRegistration?.id) {
      setMessage('Select or initiate a registration first');
      return;
    }
    if (!reference.trim()) {
      setMessage('Authority reference is required');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(
        `/api/v1/onboarding/social-insurance/${selectedRegistration.id}/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registrationReference: reference.trim() }),
        }
      );
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message ?? 'Registration update failed');
      }
      await loadRows();
      await evaluate();
      setReference('');
      setMessage('Registration completed');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Registration update failed');
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
          <h1 className="text-2xl font-semibold">Social Insurance Registration</h1>
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
                onClick={initiate}
                disabled={loading}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium disabled:opacity-50"
              >
                Initiate
              </button>
            </div>

            <label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="reference">
              Authority Reference
            </label>
            <input
              id="reference"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              placeholder="GOSI / GPSSA / SIO reference"
            />
            <button
              type="button"
              onClick={markRegistered}
              disabled={loading}
              className="mt-3 w-full rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Mark Registered
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
                  <p className="font-semibold">{gate.evaluated?.authority ?? 'Not applicable'}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs uppercase text-slate-500">Scheme</p>
                  <p className="font-semibold">{gate.evaluated?.scheme ?? '-'}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs uppercase text-slate-500">Contribution Wage</p>
                  <p className="font-semibold">
                    {gate.evaluated?.contributionWage ?? '-'} {gate.evaluated?.currency ?? ''}
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
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No employee evaluated.</p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <h2 className="text-base font-semibold">Registration Queue</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Authority</th>
                  <th className="px-4 py-3">Scheme</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3">Reference</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">{row.employeeId}</td>
                    <td className="px-4 py-3">{row.countryCode}</td>
                    <td className="px-4 py-3">{row.authority}</td>
                    <td className="px-4 py-3">{row.scheme}</td>
                    <td className="px-4 py-3">{row.status}</td>
                    <td className="px-4 py-3">{new Date(row.deadlineAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{row.registrationReference ?? '-'}</td>
                  </tr>
                ))}
                {!rows.length ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={7}>
                      No registrations found.
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
