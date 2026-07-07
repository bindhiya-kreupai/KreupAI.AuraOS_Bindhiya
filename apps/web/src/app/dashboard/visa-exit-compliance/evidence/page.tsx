'use client';

import { useEffect, useState } from 'react';

interface Evidence {
  id: string;
  caseId: string;
  portal: string;
  referenceNumber: string | null;
  evidenceType: string;
  fileUrl: string | null;
  capturedAt: string;
  validUntil: string | null;
  notes: string | null;
}

export default function EvidencePage() {
  const [rows, setRows] = useState<Evidence[]>([]);
  const [caseFilter, setCaseFilter] = useState('');
  const [form, setForm] = useState({
    caseId: '',
    portal: 'GDRFA',
    referenceNumber: '',
    evidenceType: 'CANCELLATION_CERTIFICATE',
    fileUrl: '',
    validUntil: '',
    notes: '',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/visa-exit-compliance/evidence', window.location.origin);
    if (caseFilter) url.searchParams.set('caseId', caseFilter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data?.items ?? []);
  }
  useEffect(() => {
    load();
  }, [caseFilter]);

  async function capture() {
    setMessage('');
    const r = await fetch('/api/v1/visa-exit-compliance/evidence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        validUntil: form.validUntil || undefined,
        referenceNumber: form.referenceNumber || undefined,
        fileUrl: form.fileUrl || undefined,
        notes: form.notes || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Captured' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-29 · S14</p>
            <h1 className="text-2xl font-semibold">Authority Portal Evidence Capture</h1>
          </div>
          <input
            placeholder="filter by caseId"
            value={caseFilter}
            onChange={(e) => setCaseFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-7">
          <label className="text-sm md:col-span-2">
            Case ID
            <input
              value={form.caseId}
              onChange={(e) => setForm((f) => ({ ...f, caseId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Portal
            <select
              value={form.portal}
              onChange={(e) => setForm((f) => ({ ...f, portal: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['GDRFA', 'MOHRE', 'QIWA', 'MUDAD', 'LMRA', 'GAMCA', 'MOI', 'OTHER'].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Ref #
            <input
              value={form.referenceNumber}
              onChange={(e) => setForm((f) => ({ ...f, referenceNumber: e.target.value }))}
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
              {[
                'CANCELLATION_CERTIFICATE',
                'EXIT_STAMP',
                'ABSCONDING_REPORT',
                'DEPENDENT_CANCELLATION',
                'PORTAL_SCREENSHOT',
                'OTHER',
              ].map((t) => (
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
          <button
            type="button"
            onClick={capture}
            className="self-end rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Capture
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Captured</th>
                <th className="px-3 py-2">Case</th>
                <th className="px-3 py-2">Portal</th>
                <th className="px-3 py-2">Ref #</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">File</th>
                <th className="px-3 py-2">Valid Until</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 text-xs">{e.capturedAt?.slice(0, 10)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{e.caseId.slice(0, 8)}</td>
                  <td className="px-3 py-2">{e.portal}</td>
                  <td className="px-3 py-2 font-mono text-xs">{e.referenceNumber ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{e.evidenceType}</td>
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
                  <td className="px-3 py-2 text-xs">{e.validUntil?.slice(0, 10) ?? '—'}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
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
