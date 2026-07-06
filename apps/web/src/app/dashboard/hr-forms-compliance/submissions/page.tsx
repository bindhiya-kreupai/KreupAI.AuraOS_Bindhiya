'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

interface SchemaField {
  code: string;
  label: string;
  type: string;
  requiredWhen?: string;
  visibleWhen?: string;
  options?: Array<{ value: string; label: string }>;
}

interface Tpl {
  id: string;
  templateCode: string;
  label: string;
  status: string;
  schemaJson: { fields?: SchemaField[] } | null;
}

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

interface Signature {
  id: string;
  stageOrder: number;
  signerId: string;
  action: string;
  comments: string | null;
  signatureHash: string | null;
  ipAddress: string | null;
  signedAt: string;
}

const statusColor: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-800',
  SUBMITTED: 'bg-sky-100 text-sky-800',
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
  const { user, loading: authLoading } = useCurrentUser();
  const [rows, setRows] = useState<Sub[]>([]);
  const [templates, setTemplates] = useState<Tpl[]>([]);
  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  // Start-submission form.
  const [startOpen, setStartOpen] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const [submissionRef, setSubmissionRef] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [values, setValues] = useState<Record<string, unknown>>({});

  // Reject modal.
  const [rejectTarget, setRejectTarget] = useState<Sub | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Signature drawer.
  const [sigTarget, setSigTarget] = useState<Sub | null>(null);
  const [signatures, setSignatures] = useState<Signature[]>([]);

  useEffect(() => {
    if (user?.employeeId && !employeeId) setEmployeeId(user.employeeId);
  }, [user, employeeId]);

  const loadTemplates = useCallback(async () => {
    const r = await fetch('/api/v1/hr-forms-compliance/templates?pageSize=200&status=PUBLISHED');
    const p = await r.json();
    if (p.success) setTemplates(p.data?.items ?? p.data ?? []);
  }, []);

  const load = useCallback(async () => {
    const url = new URL('/api/v1/hr-forms-compliance/submissions', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data?.items ?? p.data ?? []);
    else setMessage(p.error?.message ?? 'Failed to load');
  }, [filter]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);
  useEffect(() => {
    load();
  }, [load]);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === templateId),
    [templates, templateId]
  );
  const schemaFields = selectedTemplate?.schemaJson?.fields ?? [];

  function setFieldValue(code: string, v: unknown) {
    setValues((prev) => ({ ...prev, [code]: v }));
  }

  async function post(body: Record<string, unknown>, okMsg: string) {
    setBusy(true);
    setMessage('');
    try {
      const r = await fetch('/api/v1/hr-forms-compliance/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const p = await r.json();
      setMessage(p.success ? okMsg : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
      if (p.success) await load();
      return p.success as boolean;
    } catch {
      setMessage('Network error');
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function start() {
    if (!templateId) {
      setMessage('Select a template');
      return;
    }
    if (!submissionRef.trim()) {
      setMessage('Submission reference required');
      return;
    }
    if (!employeeId.trim()) {
      setMessage('Employee id required');
      return;
    }
    const ok = await post(
      {
        action: 'start',
        templateId,
        submissionRef: submissionRef.trim(),
        employeeId: employeeId.trim(),
        payload: values,
      },
      'Submission started'
    );
    if (ok) {
      setStartOpen(false);
      setSubmissionRef('');
      setValues({});
    }
  }

  async function openSignatures(s: Sub) {
    setSigTarget(s);
    setSignatures([]);
    const url = new URL('/api/v1/hr-forms-compliance/signatures', window.location.origin);
    url.searchParams.set('submissionStateId', s.id);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setSignatures(p.data ?? []);
  }

  async function confirmReject() {
    if (!rejectTarget || !rejectReason.trim()) {
      setMessage('Rejection reason required');
      return;
    }
    const ok = await post(
      { action: 'reject', id: rejectTarget.id, reason: rejectReason.trim() },
      'Rejected'
    );
    if (ok) {
      setRejectTarget(null);
      setRejectReason('');
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-33 · S03 / S12</p>
            <h1 className="text-2xl font-semibold">Submissions, Approval &amp; E-Signature</h1>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="IN_REVIEW">IN_REVIEW</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
            <button
              type="button"
              onClick={() => setStartOpen((o) => !o)}
              className="rounded-md bg-blue-700 px-3 py-2 text-sm text-white"
            >
              {startOpen ? 'Hide Form' : 'Start Submission'}
            </button>
          </div>
        </header>

        {startOpen ? (
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <label className="text-sm">
                Template
                <select
                  value={templateId}
                  onChange={(e) => {
                    setTemplateId(e.target.value);
                    setValues({});
                  }}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                >
                  <option value="">Select published template…</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.templateCode} — {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Submission Ref
                <input
                  value={submissionRef}
                  onChange={(e) => setSubmissionRef(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label className="text-sm">
                Employee
                <input
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
                />
              </label>
            </div>

            {templateId ? (
              <div className="mt-4 border-t border-slate-200 pt-4">
                <h3 className="text-sm font-semibold">Form Fields</h3>
                {schemaFields.length === 0 ? (
                  <p className="mt-2 text-xs text-slate-500">
                    This template has no schema fields. Only reference metadata will be captured.
                  </p>
                ) : (
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {schemaFields.map((f) => (
                      <DynamicField
                        key={f.code}
                        field={f}
                        value={values[f.code]}
                        onChange={(v) => setFieldValue(f.code, v)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={start}
                disabled={busy || authLoading}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                Start Submission
              </button>
            </div>
          </section>
        ) : null}
        {message ? <p className="text-sm text-slate-700">{message}</p> : null}

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
                      <button
                        type="button"
                        onClick={() => openSignatures(s)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
                      >
                        Signatures
                      </button>
                      {s.status === 'DRAFT' && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => post({ action: 'submit', id: s.id }, 'Submitted')}
                          className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white disabled:opacity-50"
                        >
                          Submit
                        </button>
                      )}
                      {(s.status === 'IN_REVIEW' || s.status === 'SUBMITTED') && (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => post({ action: 'approve', id: s.id }, 'Approved')}
                            className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white disabled:opacity-50"
                          >
                            Approve Stage
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              setRejectTarget(s);
                              setRejectReason('');
                            }}
                            className="rounded-md bg-rose-700 px-2 py-1 text-xs text-white disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {s.status === 'APPROVED' &&
                        (s.writebackStatus === 'PENDING' || s.writebackStatus === 'FAILED') && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              post({ action: 'writeback', id: s.id }, 'Writeback processed')
                            }
                            className="rounded-md bg-indigo-700 px-2 py-1 text-xs text-white disabled:opacity-50"
                          >
                            Run Writeback
                          </button>
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

      {rejectTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Reject {rejectTarget.submissionRef}</h2>
            <label className="mt-3 block text-sm">
              Rejection reason
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReject}
                disabled={busy}
                className="rounded-md bg-rose-700 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {sigTarget ? (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-slate-900/40">
          <div className="h-full w-full max-w-lg overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-semibold">
                E-Signature Trail · {sigTarget.submissionRef}
              </h2>
              <button
                type="button"
                onClick={() => setSigTarget(null)}
                className="text-sm text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <ol className="mt-4 flex flex-col gap-3">
              {signatures.map((sig) => (
                <li key={sig.id} className="rounded-md border border-slate-200 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      Stage {sig.stageOrder} · {sig.action}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(sig.signedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-slate-600">Signer: {sig.signerId}</p>
                  {sig.comments ? (
                    <p className="mt-1 text-xs text-slate-700">Comment: {sig.comments}</p>
                  ) : null}
                  {sig.signatureHash ? (
                    <p className="mt-1 break-all font-mono text-[10px] text-slate-500">
                      {sig.signatureHash}
                    </p>
                  ) : null}
                  {sig.ipAddress ? (
                    <p className="text-[10px] text-slate-400">IP: {sig.ipAddress}</p>
                  ) : null}
                </li>
              ))}
              {signatures.length === 0 ? (
                <li className="text-sm text-slate-500">No signatures recorded yet.</li>
              ) : null}
            </ol>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function DynamicField({
  field,
  value,
  onChange,
}: {
  field: SchemaField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const base = 'mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5';
  if (field.type === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        {field.label}
      </label>
    );
  }
  if (field.type === 'select' || field.type === 'multiselect') {
    return (
      <label className="text-sm">
        {field.label}
        <select
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        >
          <option value="">—</option>
          {(field.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    );
  }
  const inputType = field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text';
  return (
    <label className="text-sm">
      {field.label}
      <input
        type={inputType}
        value={String(value ?? '')}
        onChange={(e) =>
          onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)
        }
        className={base}
      />
    </label>
  );
}
