'use client';

import { useCallback, useEffect, useState } from 'react';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

interface Attestation {
  field: string;
  value: string;
}

interface Cert {
  id: string;
  period: string;
  status: string;
  templatesPublished: number;
  submissionsTotal: number;
  submissionsApproved: number;
  submissionsRejected: number;
  submissionsPending: number;
  writebackFailures: number;
  slaBreachCount: number;
  gatingReason: string | null;
  attestationsJson: Attestation[] | null;
  generatedAt: string | null;
  signedAt: string | null;
  signedBy: string | null;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const DEFAULT_ATTESTATIONS: Attestation[] = [
  { field: 'All mandatory forms captured', value: 'CONFIRMED' },
  { field: 'No outstanding writeback failures', value: 'CONFIRMED' },
  { field: 'SLA breaches investigated', value: 'CONFIRMED' },
];

export default function HrFormsCertPage() {
  const { user } = useCurrentUser();
  const [certs, setCerts] = useState<Cert[]>([]);
  const [period, setPeriod] = useState(periodNow());
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  // Sign modal state.
  const [signTarget, setSignTarget] = useState<Cert | null>(null);
  const [attestations, setAttestations] = useState<Attestation[]>(DEFAULT_ATTESTATIONS);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/v1/hr-forms-compliance/certificate');
      const p = await r.json();
      if (p.success) setCerts(p.data ?? []);
      else setMessage(p.error?.message ?? 'Failed to load');
    } catch {
      setMessage('Network error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function post(body: Record<string, unknown>, okMsg: string) {
    setBusy(true);
    setMessage('');
    try {
      const r = await fetch('/api/v1/hr-forms-compliance/certificate', {
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

  function openSign(c: Cert) {
    setSignTarget(c);
    setAttestations(
      c.attestationsJson && c.attestationsJson.length > 0
        ? c.attestationsJson
        : DEFAULT_ATTESTATIONS
    );
    setMessage('');
  }

  function updateAttestation(idx: number, patch: Partial<Attestation>) {
    setAttestations((a) => a.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  }
  function addAttestation() {
    setAttestations((a) => [...a, { field: '', value: 'CONFIRMED' }]);
  }
  function removeAttestation(idx: number) {
    setAttestations((a) => a.filter((_, i) => i !== idx));
  }

  async function confirmSign() {
    if (!signTarget) return;
    const clean = attestations.filter((a) => a.field.trim());
    if (clean.length === 0) {
      setMessage('At least one attestation is required');
      return;
    }
    const ok = await post(
      { action: 'sign', period: signTarget.period, attestations: clean },
      'Certificate signed'
    );
    if (ok) setSignTarget(null);
  }

  function downloadCertificate(c: Cert) {
    const html = buildCertificateHtml(c, user?.employeeId ?? c.signedBy ?? '');
    const win = window.open('', '_blank');
    if (!win) {
      setMessage('Popup blocked — allow popups to download the certificate');
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-33 · S14 / S15</p>
            <h1 className="text-2xl font-semibold">Monthly HR Forms Certificate</h1>
          </div>
          <div className="flex gap-2">
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={() => post({ action: 'generate', period }, 'Certificate generated')}
              disabled={busy}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
            >
              Generate
            </button>
          </div>
        </header>
        {message ? <p className="text-sm text-slate-700">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Published Tpl</th>
                <th className="px-3 py-2">Submissions</th>
                <th className="px-3 py-2">Approved</th>
                <th className="px-3 py-2">Rejected</th>
                <th className="px-3 py-2">Pending</th>
                <th className="px-3 py-2">Writeback fail</th>
                <th className="px-3 py-2">SLA breach</th>
                <th className="px-3 py-2">Gating</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {certs.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{c.period}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        c.status === 'SIGNED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-emerald-700">{c.templatesPublished}</td>
                  <td className="px-3 py-2">{c.submissionsTotal}</td>
                  <td className="px-3 py-2 text-emerald-700">{c.submissionsApproved}</td>
                  <td className="px-3 py-2 text-slate-600">{c.submissionsRejected}</td>
                  <td className="px-3 py-2 text-amber-700">{c.submissionsPending}</td>
                  <td className="px-3 py-2 text-rose-700">{c.writebackFailures}</td>
                  <td className="px-3 py-2 text-rose-700">{c.slaBreachCount}</td>
                  <td className="px-3 py-2 text-xs text-rose-700">{c.gatingReason ?? '—'}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {c.status === 'DRAFT' && !c.gatingReason ? (
                        <button
                          type="button"
                          onClick={() => openSign(c)}
                          className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                        >
                          Sign
                        </button>
                      ) : null}
                      {c.status === 'SIGNED' ? (
                        <button
                          type="button"
                          onClick={() => downloadCertificate(c)}
                          className="rounded-md bg-blue-700 px-2 py-1 text-xs text-white"
                        >
                          Download
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {certs.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-3 py-6 text-center text-slate-500">
                    No certificates.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      {signTarget ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-6">
          <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-semibold">Sign Certificate · {signTarget.period}</h2>
              <button
                type="button"
                onClick={() => setSignTarget(null)}
                className="text-sm text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              By signing you attest to the following statements for the period. Each attestation is
              recorded in the certificate audit record.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {attestations.map((a, idx) => (
                <div key={idx} className="grid items-end gap-2 md:grid-cols-12">
                  <label className="text-sm md:col-span-8">
                    Statement
                    <input
                      value={a.field}
                      onChange={(e) => updateAttestation(idx, { field: e.target.value })}
                      className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                    />
                  </label>
                  <label className="text-sm md:col-span-3">
                    Response
                    <select
                      value={a.value}
                      onChange={(e) => updateAttestation(idx, { value: e.target.value })}
                      className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                    >
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="NOT_APPLICABLE">NOT_APPLICABLE</option>
                    </select>
                  </label>
                  <div className="md:col-span-1">
                    <button
                      type="button"
                      onClick={() => removeAttestation(idx)}
                      className="rounded-md bg-rose-100 px-2 py-1.5 text-xs text-rose-700"
                    >
                      Del
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addAttestation}
              className="mt-3 rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
            >
              + Add attestation
            </button>
            <div className="mt-5 flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setSignTarget(null)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSign}
                disabled={busy}
                className="rounded-md bg-emerald-700 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                Sign Certificate
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildCertificateHtml(c: Cert, signer: string): string {
  const rows = (c.attestationsJson ?? [])
    .map(
      (a) =>
        `<tr><td>${escapeHtml(a.field)}</td><td style="text-align:right">${escapeHtml(a.value)}</td></tr>`
    )
    .join('');
  const kpi = (label: string, value: number) =>
    `<tr><td>${label}</td><td style="text-align:right">${value}</td></tr>`;
  return `<!doctype html><html><head><meta charset="utf-8"/><title>HR Forms Certificate ${escapeHtml(
    c.period
  )}</title>
<style>
body{font-family:system-ui,Arial,sans-serif;color:#0f172a;margin:40px;}
h1{font-size:22px;margin-bottom:4px;}
.sub{color:#64748b;font-size:13px;margin-bottom:24px;}
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:13px;}
td{border-bottom:1px solid #e2e8f0;padding:6px 4px;}
.sig{margin-top:32px;border-top:2px solid #0f172a;padding-top:12px;font-size:13px;}
.badge{display:inline-block;background:#dcfce7;color:#166534;padding:2px 8px;border-radius:9999px;font-size:12px;font-weight:600;}
</style></head><body>
<h1>Monthly HR Forms Compliance Certificate</h1>
<div class="sub">Period ${escapeHtml(c.period)} · <span class="badge">${escapeHtml(
    c.status
  )}</span></div>
<h3>Compliance metrics</h3>
<table>
${kpi('Templates published', c.templatesPublished)}
${kpi('Submissions total', c.submissionsTotal)}
${kpi('Approved', c.submissionsApproved)}
${kpi('Rejected', c.submissionsRejected)}
${kpi('Pending', c.submissionsPending)}
${kpi('Writeback failures', c.writebackFailures)}
${kpi('SLA breaches', c.slaBreachCount)}
</table>
<h3>Attestations</h3>
<table>${rows || '<tr><td colspan="2">None recorded</td></tr>'}</table>
<div class="sig">
<div>Signed by: ${escapeHtml(c.signedBy ?? signer)}</div>
<div>Signed at: ${escapeHtml(c.signedAt ? new Date(c.signedAt).toLocaleString() : '')}</div>
</div>
</body></html>`;
}
