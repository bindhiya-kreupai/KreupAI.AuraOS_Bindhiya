'use client';

import { useEffect, useState } from 'react';

interface Ev {
  id: string;
  leaveRequestId: string;
  employeeId: string;
  evidenceType: string;
  fileUrl: string | null;
  issuedBy: string | null;
  issuedAt: string | null;
  classification: string;
  retentionUntil: string | null;
  verifiedAt: string | null;
  fraudFlagged: boolean;
}

const classColor: Record<string, string> = {
  CONFIDENTIAL: 'bg-amber-100 text-amber-800',
  RESTRICTED: 'bg-rose-100 text-rose-800',
};

export default function MedicalEvidencePage() {
  const [rows, setRows] = useState<Ev[]>([]);
  const [form, setForm] = useState({
    leaveRequestId: '',
    employeeId: '',
    evidenceType: 'MEDICAL_CERTIFICATE',
    fileUrl: '',
    issuedBy: '',
    retentionYears: '7',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/leave-compliance/medical-evidence');
    const p = await r.json();
    if (p.success) setRows(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
  }
  useEffect(() => {
    load();
  }, []);

  async function capture() {
    setMessage('');
    const r = await fetch('/api/v1/leave-compliance/medical-evidence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'capture',
        ...form,
        retentionYears: Number(form.retentionYears),
        fileUrl: form.fileUrl || undefined,
        issuedBy: form.issuedBy || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Captured' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function call(action: string, id: string) {
    const r = await fetch('/api/v1/leave-compliance/medical-evidence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id }),
    });
    const p = await r.json();
    setMessage(p.success ? action : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-20 · S04 / S18</p>
          <h1 className="text-2xl font-semibold">Medical Evidence Vault</h1>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-7">
          <label className="text-sm">
            Leave Req ID
            <input
              value={form.leaveRequestId}
              onChange={(e) => setForm((f) => ({ ...f, leaveRequestId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
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
          <label className="text-sm">
            Type
            <select
              value={form.evidenceType}
              onChange={(e) => setForm((f) => ({ ...f, evidenceType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['MEDICAL_CERTIFICATE', 'HOSPITAL_REPORT', 'PRESCRIPTION', 'OTHER'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            File URL
            <input
              value={form.fileUrl}
              onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Issued By
            <input
              value={form.issuedBy}
              onChange={(e) => setForm((f) => ({ ...f, issuedBy: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Retention yrs
            <input
              value={form.retentionYears}
              onChange={(e) => setForm((f) => ({ ...f, retentionYears: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={capture}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Capture
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Leave</th>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Issued By</th>
                <th className="px-3 py-2">Class</th>
                <th className="px-3 py-2">Retain Until</th>
                <th className="px-3 py-2">Verified</th>
                <th className="px-3 py-2">Fraud</th>
                <th className="px-3 py-2">File</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{e.leaveRequestId.slice(0, 8)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{e.employeeId}</td>
                  <td className="px-3 py-2 text-xs">{e.evidenceType}</td>
                  <td className="px-3 py-2 text-xs">{e.issuedBy ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${classColor[e.classification] ?? ''}`}
                    >
                      {e.classification}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">{e.retentionUntil?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{e.verifiedAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2">
                    {e.fraudFlagged ? (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-800">
                        FRAUD
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {e.fileUrl ? (
                      <a
                        href={e.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 hover:underline"
                      >
                        open
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      {!e.verifiedAt && (
                        <button
                          type="button"
                          onClick={() => call('verify', e.id)}
                          className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                        >
                          Verify
                        </button>
                      )}
                      {!e.fraudFlagged && (
                        <button
                          type="button"
                          onClick={() => call('flag-fraud', e.id)}
                          className="rounded-md bg-rose-700 px-2 py-1 text-xs text-white"
                        >
                          Fraud
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-slate-500">
                    No evidence.
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
