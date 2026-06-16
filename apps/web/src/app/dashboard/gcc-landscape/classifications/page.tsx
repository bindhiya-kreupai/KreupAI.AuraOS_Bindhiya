'use client';

import { useEffect, useState } from 'react';

interface Classification {
  id: string;
  employeeId: string;
  nationality: string;
  countryOfEmployment: string;
  workforceClass: string;
  isGccNational: boolean;
  isEmiratisationEligible: boolean;
  isCrossGccUnified: boolean;
  classificationVersion: number;
  effectiveFrom: string;
}

export default function GccClassificationsPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [nationality, setNationality] = useState('AE');
  const [country, setCountry] = useState('AE');
  const [reason, setReason] = useState('');
  const [current, setCurrent] = useState<Classification | null>(null);
  const [history, setHistory] = useState<Classification[]>([]);
  const [issues, setIssues] = useState<
    Array<{ employeeId: string; firstName: string; lastName: string }>
  >([]);
  const [message, setMessage] = useState('');

  async function loadIssues() {
    const r = await fetch('/api/v1/gcc-landscape/classifications?action=data-quality');
    const p = await r.json();
    if (p.success) setIssues(p.data ?? []);
  }
  async function loadEmployee() {
    if (!employeeId) return;
    const r1 = await fetch(`/api/v1/gcc-landscape/classifications?employeeId=${employeeId}`);
    const p1 = await r1.json();
    setCurrent(p1.data ?? null);
    const r2 = await fetch(
      `/api/v1/gcc-landscape/classifications?employeeId=${employeeId}&history=true`
    );
    const p2 = await r2.json();
    setHistory(p2.data ?? []);
  }
  useEffect(() => {
    loadIssues();
  }, []);

  async function classify() {
    setMessage('');
    const r = await fetch('/api/v1/gcc-landscape/classifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId,
        nationality,
        countryOfEmployment: country,
        reason,
      }),
    });
    const p = await r.json();
    if (p.success) {
      setMessage(`Classified as ${p.data.workforceClass}`);
      loadEmployee();
      loadIssues();
    } else {
      setMessage(p.error?.details?.error ?? p.error?.message ?? 'failed');
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">GCC Landscape · S03</p>
          <h1 className="text-2xl font-semibold">Workforce Classification</h1>
        </header>

        <section className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">Classify Employee</h2>
            <div className="mt-3 grid gap-3">
              <label className="text-sm">
                Employee ID
                <input
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">
                  Nationality
                  <input
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value.toUpperCase())}
                    maxLength={2}
                    className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
                  />
                </label>
                <label className="text-sm">
                  Country of Employment
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
                  >
                    {['AE', 'SA', 'BH', 'QA', 'OM', 'KW'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="text-sm">
                Reason
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={loadEmployee}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  Load
                </button>
                <button
                  type="button"
                  onClick={classify}
                  className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
                >
                  Save
                </button>
              </div>
              {message ? <p className="text-sm">{message}</p> : null}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">Current Classification</h2>
            {current ? (
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <dt>Class</dt>
                <dd className="font-semibold">{current.workforceClass}</dd>
                <dt>Nationality</dt>
                <dd>{current.nationality}</dd>
                <dt>Country</dt>
                <dd>{current.countryOfEmployment}</dd>
                <dt>GCC National</dt>
                <dd>{current.isGccNational ? 'Yes' : 'No'}</dd>
                <dt>Emiratisation</dt>
                <dd>{current.isEmiratisationEligible ? 'Yes' : 'No'}</dd>
                <dt>Cross-GCC unified</dt>
                <dd>{current.isCrossGccUnified ? 'Yes' : 'No'}</dd>
                <dt>Version</dt>
                <dd>{current.classificationVersion}</dd>
              </dl>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                Load an employee to view classification.
              </p>
            )}
            {history.length > 0 && (
              <details className="mt-4 text-sm">
                <summary>History ({history.length})</summary>
                <ul className="mt-2 list-disc pl-4">
                  {history.map((h) => (
                    <li key={h.id}>
                      v{h.classificationVersion} · {h.workforceClass} ·{' '}
                      {h.effectiveFrom?.slice(0, 10)}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Data Quality – Missing Classifications</h2>
            <button
              type="button"
              onClick={loadIssues}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            >
              Refresh
            </button>
          </div>
          {issues.length === 0 ? (
            <p className="text-sm text-emerald-700">All active employees classified.</p>
          ) : (
            <ul className="grid gap-1 text-sm">
              {issues.map((i) => (
                <li key={i.employeeId}>
                  {i.firstName} {i.lastName}{' '}
                  <span className="text-slate-500">({i.employeeId})</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
