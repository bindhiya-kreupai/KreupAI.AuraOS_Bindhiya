'use client';

import { useEffect, useMemo, useState } from 'react';

const stages = [
  'PRE_JOINING',
  'JOINING_DAY',
  'MASTER_DATA_ACTIVATION',
  'ENROLMENT',
  'PROBATION',
  'COMPLETED',
];

interface OnboardingCase {
  id: string;
  offerId?: string | null;
  candidateName?: string | null;
  candidateEmail?: string | null;
  countryCode: string;
  legalEntityId: string;
  employmentType: string;
  targetJoinDate: string;
  currentStage: string;
  status: string;
  stageOwnerRole: string;
  escalationRole?: string | null;
  slaDueAt?: string | null;
  blockingItems?: Array<{ code: string; reason: string }>;
  histories?: Array<{
    id: string;
    fromStage?: string | null;
    toStage: string;
    reason?: string | null;
  }>;
}

export default function OnboardingCasesPage() {
  const [cases, setCases] = useState<OnboardingCase[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    offerId: '',
    candidateName: '',
    candidateEmail: '',
    countryCode: 'AE',
    legalEntityId: '',
    employmentType: 'FULL_TIME',
    targetJoinDate: new Date().toISOString().slice(0, 10),
  });

  const selected = useMemo(
    () => cases.find((item) => item.id === selectedId) ?? cases[0] ?? null,
    [cases, selectedId]
  );

  async function loadCases() {
    const response = await fetch('/api/v1/onboarding/cases');
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.error?.message ?? 'Unable to load onboarding cases');
    }
    setCases(payload.data ?? []);
  }

  useEffect(() => {
    loadCases().catch((error) => setMessage(error.message));
  }, []);

  async function seedGovernance() {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/v1/onboarding/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed-governance' }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message ?? 'Governance seed failed');
      }
      setMessage('Default governance seeded');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Governance seed failed');
    } finally {
      setLoading(false);
    }
  }

  async function createCase() {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/v1/onboarding/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'offer-accepted',
          ...form,
          offerId: form.offerId || undefined,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(
          payload.error?.details?.error ?? payload.error?.message ?? 'Case creation failed'
        );
      }
      setSelectedId(payload.data.id);
      await loadCases();
      setMessage('Onboarding case created');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Case creation failed');
    } finally {
      setLoading(false);
    }
  }

  async function evaluate() {
    if (!selected) return;
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`/api/v1/onboarding/cases/${selected.id}/transition`);
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message ?? 'Evaluation failed');
      }
      setMessage(
        payload.data.blocked
          ? `Blocked: ${payload.data.blockers.map((item: { reason: string }) => item.reason).join('; ')}`
          : 'Stage exit is clear'
      );
      await loadCases();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Evaluation failed');
    } finally {
      setLoading(false);
    }
  }

  async function advance() {
    if (!selected) return;
    const currentIndex = stages.indexOf(selected.currentStage);
    const targetStage = stages[currentIndex + 1];
    if (!targetStage) {
      setMessage('No next stage available');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`/api/v1/onboarding/cases/${selected.id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'advance', targetStage, reason: 'Advanced from workspace' }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(
          payload.error?.details?.error ?? payload.error?.message ?? 'Advance failed'
        );
      }
      await loadCases();
      setMessage(`Advanced to ${targetStage}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Advance failed');
    } finally {
      setLoading(false);
    }
  }

  async function escalateBreaches() {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/v1/onboarding/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'escalate-breaches' }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message ?? 'Escalation failed');
      }
      await loadCases();
      setMessage(`${payload.data.length} breached cases escalated`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Escalation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-2 border-b border-slate-200 pb-4">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Onboarding Governance
          </p>
          <h1 className="text-2xl font-semibold">Case Workspace</h1>
        </header>

        <section className="grid gap-4 lg:grid-cols-[380px_1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">Accepted Offer Event</h2>
            <div className="mt-3 grid gap-3">
              {(
                [
                  'offerId',
                  'candidateName',
                  'candidateEmail',
                  'countryCode',
                  'legalEntityId',
                  'employmentType',
                  'targetJoinDate',
                ] as const
              ).map((key) => (
                <label key={key} className="text-sm font-medium text-slate-700">
                  {key}
                  <input
                    value={form[key]}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, [key]: event.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                    type={key === 'targetJoinDate' ? 'date' : 'text'}
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={seedGovernance}
                disabled={loading}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium disabled:opacity-50"
              >
                Seed Governance
              </button>
              <button
                type="button"
                onClick={createCase}
                disabled={loading}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Create Case
              </button>
            </div>
            {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Selected Case</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={evaluate}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                >
                  Evaluate
                </button>
                <button
                  type="button"
                  onClick={advance}
                  className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white"
                >
                  Advance
                </button>
                <button
                  type="button"
                  onClick={escalateBreaches}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                >
                  Escalate SLA
                </button>
              </div>
            </div>
            {selected ? (
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs uppercase text-slate-500">Stage</p>
                  <p className="font-semibold">{selected.currentStage}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs uppercase text-slate-500">Status</p>
                  <p className="font-semibold">{selected.status}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs uppercase text-slate-500">Owner</p>
                  <p className="font-semibold">{selected.stageOwnerRole}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs uppercase text-slate-500">Country</p>
                  <p className="font-semibold">{selected.countryCode}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs uppercase text-slate-500">Join Date</p>
                  <p className="font-semibold">{selected.targetJoinDate.slice(0, 10)}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs uppercase text-slate-500">SLA Due</p>
                  <p className="font-semibold">{selected.slaDueAt?.slice(0, 16) ?? '-'}</p>
                </div>
                {selected.blockingItems?.length ? (
                  <div className="rounded-md border border-rose-200 bg-rose-50 p-3 md:col-span-3">
                    <p className="text-xs uppercase text-rose-600">Blocking Items</p>
                    <ul className="mt-2 list-disc pl-5 text-sm text-rose-800">
                      {selected.blockingItems.map((item) => (
                        <li key={item.code}>{item.reason}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-slate-600">Create or select a case.</p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Case Queue</h2>
            <button
              type="button"
              onClick={() => loadCases().catch((error) => setMessage(error.message))}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            >
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Candidate</th>
                  <th className="px-3 py-2">Country</th>
                  <th className="px-3 py-2">Stage</th>
                  <th className="px-3 py-2">Owner</th>
                  <th className="px-3 py-2">SLA</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((item) => (
                  <tr
                    key={item.id}
                    className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                    onClick={() => setSelectedId(item.id)}
                  >
                    <td className="px-3 py-2">
                      {item.candidateName ?? item.candidateEmail ?? item.offerId ?? item.id}
                    </td>
                    <td className="px-3 py-2">{item.countryCode}</td>
                    <td className="px-3 py-2">{item.currentStage}</td>
                    <td className="px-3 py-2">{item.stageOwnerRole}</td>
                    <td className="px-3 py-2">{item.slaDueAt?.slice(0, 10) ?? '-'}</td>
                    <td className="px-3 py-2">{item.status}</td>
                  </tr>
                ))}
                {cases.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-center text-slate-500" colSpan={6}>
                      No onboarding cases found.
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
