'use client';

import { useEffect, useState } from 'react';

interface Sub {
  id: string;
  templateId: string;
  submissionRef: string;
  employeeId: string;
  currentStage: number;
  totalStages: number;
  status: string;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  writebackStatus: string;
  writebackRef: string | null;
}

const statusColor: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-800',
  IN_REVIEW: 'bg-indigo-100 text-indigo-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-800',
};

const wbColor: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  SUCCESS: 'bg-emerald-100 text-emerald-800',
  FAILED: 'bg-rose-100 text-rose-800',
};

export default function SubmissionsPage() {
  const [rows, setRows] = useState<Sub[]>([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({
    templateId: '',
    submissionRef: '',
    employeeId: '',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/hr-forms-compliance/submissions', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function start() {
    setMessage('');
    const r = await fetch('/api/v1/hr-forms-compliance/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', ...form }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Started' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }
  async function call(action: string, id: string, extra: Record<string, unknown> = {}) {
    const r = await fetch('/api/v1/hr-forms-compliance/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id, ...extra }),
    });
    const p = await r.json();
    setMessage(p.success ? action : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-33 · S03 / S12</p>
            <h1 className="text-2xl font-semibold">Submissions, Approval &amp; E-Signature</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="DRAFT">DRAFT</option>
            <option value="IN_REVIEW">IN_REVIEW</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
          <label className="text-sm">
            Template ID
            <input
              value={form.templateId}
              onChange={(e) => setForm((f) => ({ ...f, templateId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Submission Ref
            <input
              value={form.submissionRef}
              onChange={(e) => setForm((f) => ({ ...f, submissionRef: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Employee
            <input
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={start}
            className="self-end rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Start Submission
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Ref</th>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Stage</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Writeback</th>
                <th className="px-3 py-2">Rejection</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{s.submissionRef}</td>
                  <td className="px-3 py-2 font-mono text-xs">{s.employeeId}</td>
                  <td className="px-3 py-2">
                    {s.currentStage}/{s.totalStages}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[s.status] ?? ''}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${wbColor[s.writebackStatus] ?? ''}`}
                    >
                      {s.writebackStatus}
                    </span>
                    {s.writebackRef ? (
                      <span className="ml-1 font-mono text-xs">{s.writebackRef}</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-xs text-rose-700">{s.rejectionReason ?? '—'}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {s.status === 'DRAFT' && (
                        <button
                          type="button"
                          onClick={() => call('submit', s.id)}
                          className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white"
                        >
                          Submit
                        </button>
                      )}
                      {s.status === 'IN_REVIEW' && (
                        <>
                          <button
                            type="button"
                            onClick={() => call('approve', s.id)}
                            className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                          >
                            Approve Stage
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              call('reject', s.id, {
                                reason: window.prompt('Reason?') ?? '',
                              })
                            }
                            className="rounded-md bg-rose-700 px-2 py-1 text-xs text-white"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {s.status === 'APPROVED' && s.writebackStatus === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              call('mark-writeback', s.id, {
                                status: 'SUCCESS',
                                writebackRef: window.prompt('Writeback ref?') ?? '',
                              })
                            }
                            className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                          >
                            Writeback ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => call('mark-writeback', s.id, { status: 'FAILED' })}
                            className="rounded-md bg-rose-700 px-2 py-1 text-xs text-white"
                          >
                            Writeback ✗
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No submissions.
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
