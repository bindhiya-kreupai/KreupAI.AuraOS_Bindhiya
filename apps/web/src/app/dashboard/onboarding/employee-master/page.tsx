'use client';

import { useEffect, useMemo, useState } from 'react';

const sampleMasterData = {
  identity: {
    firstName: 'Sara',
    lastName: 'Al Mansoori',
    email: 'sara.al.mansoori@example.com',
    nationality: 'AE',
    isLocalNational: true,
    identifiers: [{ type: 'EMIRATES_ID', value: '784-1990-1234567-1', isPrimary: true }],
  },
  job: {
    companyId: '',
    departmentId: '',
    locationId: '',
    jobProfileId: '',
    gradeId: '',
    typeId: '',
    joiningDate: '2026-06-01',
  },
  contract: {
    contractType: 'INDEFINITE',
    contractStartDate: '2026-06-01',
  },
  compliance: {
    countryCode: 'AE',
    bankName: 'Emirates Bank',
    bankAccountNumber: '123456789',
    bankIBAN: 'AE070331234567890123456',
    bankRoutingCode: '033',
    labourCardNumber: 'LC-12345',
    emiratesId: '784-1990-1234567-1',
    socialInsuranceEligible: true,
  },
  compensation: {
    basicSalary: 20000,
    houseRentAllowance: 5000,
    transportAllowance: 1000,
    otherAllowances: [],
    grossSalary: 30000,
    ctc: 360000,
    payFrequency: 'MONTHLY',
  },
};

interface DraftRow {
  id: string;
  employeeId?: string | null;
  status: string;
  masterData: typeof sampleMasterData;
  validationSnapshot?: { missing?: string[]; valid?: boolean } | null;
  duplicateSnapshot?: { blocking?: Array<{ identifierType: string; employeeId: string }> } | null;
  createdBy: string;
  submittedBy?: string | null;
  approvedBy?: string | null;
}

export default function EmployeeMasterOnboardingPage() {
  const [payload, setPayload] = useState(JSON.stringify(sampleMasterData, null, 2));
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? rows[0] ?? null,
    [rows, selectedId]
  );

  async function loadRows() {
    const response = await fetch('/api/v1/onboarding/employee-master');
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error?.message ?? 'Unable to load employee master drafts');
    }
    setRows(data.data ?? []);
  }

  useEffect(() => {
    loadRows().catch((error) => setMessage(error.message));
  }, []);

  function parsePayload() {
    try {
      return JSON.parse(payload);
    } catch {
      throw new Error('Master data JSON is invalid');
    }
  }

  async function createDraft() {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/v1/onboarding/employee-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsePayload()),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error?.details?.error ?? data.error?.message ?? 'Create failed');
      }
      setSelectedId(data.data.id);
      await loadRows();
      setMessage('Draft created');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Create failed');
    } finally {
      setLoading(false);
    }
  }

  async function transition(action: 'submit' | 'approve' | 'activate') {
    if (!selected?.id) {
      setMessage('Select a draft first');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`/api/v1/onboarding/employee-master/${selected.id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error?.details?.error ?? data.error?.message ?? `${action} failed`);
      }
      await loadRows();
      setMessage(`${action} complete`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `${action} failed`);
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
          <h1 className="text-2xl font-semibold">Employee Master Activation</h1>
        </header>

        <section className="grid gap-4 lg:grid-cols-[minmax(420px,520px)_1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <label className="text-sm font-medium text-slate-700" htmlFor="payload">
              Master Data Payload
            </label>
            <textarea
              id="payload"
              value={payload}
              onChange={(event) => setPayload(event.target.value)}
              className="mt-2 h-[520px] w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:border-slate-900"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={createDraft}
                disabled={loading}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Create Draft
              </button>
              <button
                type="button"
                onClick={() => transition('submit')}
                disabled={loading}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium disabled:opacity-50"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => transition('approve')}
                disabled={loading}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => transition('activate')}
                disabled={loading}
                className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Activate
              </button>
            </div>
            {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}
          </div>

          <div className="flex flex-col gap-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-base font-semibold">Selected Draft</h2>
              {selected ? (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs uppercase text-slate-500">Status</p>
                    <p className="font-semibold">{selected.status}</p>
                  </div>
                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs uppercase text-slate-500">Employee</p>
                    <p className="font-semibold">{selected.employeeId ?? 'Not activated'}</p>
                  </div>
                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs uppercase text-slate-500">Prepared By</p>
                    <p className="font-semibold">{selected.createdBy}</p>
                  </div>
                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs uppercase text-slate-500">Approved By</p>
                    <p className="font-semibold">{selected.approvedBy ?? '-'}</p>
                  </div>
                  {selected.validationSnapshot?.missing?.length ? (
                    <div className="rounded-md border border-rose-200 bg-rose-50 p-3 md:col-span-2">
                      <p className="text-xs uppercase text-rose-600">Missing Required Fields</p>
                      <ul className="mt-2 list-disc pl-5 text-sm text-rose-800">
                        {selected.validationSnapshot.missing.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {selected.duplicateSnapshot?.blocking?.length ? (
                    <div className="rounded-md border border-rose-200 bg-rose-50 p-3 md:col-span-2">
                      <p className="text-xs uppercase text-rose-600">Duplicate Blockers</p>
                      <ul className="mt-2 list-disc pl-5 text-sm text-rose-800">
                        {selected.duplicateSnapshot.blocking.map((item) => (
                          <li key={`${item.identifierType}-${item.employeeId}`}>
                            {item.identifierType} matches {item.employeeId}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">Create or select a draft.</p>
              )}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold">Draft Queue</h2>
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
                      <th className="px-3 py-2">Candidate</th>
                      <th className="px-3 py-2">Country</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Employee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.id}
                        className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                        onClick={() => setSelectedId(row.id)}
                      >
                        <td className="px-3 py-2">
                          {row.masterData.identity.firstName} {row.masterData.identity.lastName}
                        </td>
                        <td className="px-3 py-2">{row.masterData.compliance.countryCode}</td>
                        <td className="px-3 py-2">{row.status}</td>
                        <td className="px-3 py-2">{row.employeeId ?? '-'}</td>
                      </tr>
                    ))}
                    {rows.length === 0 ? (
                      <tr>
                        <td className="px-3 py-6 text-center text-slate-500" colSpan={4}>
                          No employee master drafts found.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
