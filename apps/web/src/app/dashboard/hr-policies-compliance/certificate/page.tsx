'use client';

import { useCallback, useEffect, useState } from 'react';

interface Attestation {
  field: string;
  value: string;
}

interface Cert {
  id: string;
  period: string;
  status: string;
  publishedCount: number;
  draftCount: number;
  overdueReviewsCount: number;
  pendingExceptionsCount: number;
  ackCoveragePct: string;
  ackBelowThresholdCount: number;
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
  { field: 'All published policies reviewed within their scheduled interval', value: '' },
  { field: 'All outstanding policy exceptions have been assessed', value: '' },
  { field: 'Acknowledgement coverage meets the required threshold', value: '' },
];

export default function PolicyCertPage() {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [period, setPeriod] = useState(periodNow());
  const [total, setTotal] = useState('100');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const [signing, setSigning] = useState<Cert | null>(null);
  const [attestations, setAttestations] = useState<Attestation[]>(DEFAULT_ATTESTATIONS);
  const [viewing, setViewing] = useState<Cert | null>(null);

  const flash = useCallback((msg: string, isError = false) => {
    setError(isError ? msg : '');
    setMessage(isError ? '' : msg);
    if (!isError) window.setTimeout(() => setMessage(''), 3000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/v1/hr-policies-compliance/certificate');
      const p = await r.json();
      if (p.success) setCerts(p.data ?? []);
      else setError(p.message ?? p.error?.message ?? 'Failed to load certificates');
    } catch {
      setError('Network error loading certificates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function generate() {
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/v1/hr-policies-compliance/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', period, totalEmployees: Number(total) }),
      });
      const p = await r.json();
      if (p.success) {
        flash('Certificate generated');
        await load();
      } else {
        flash(p.error?.details?.error ?? p.message ?? p.error?.message ?? 'Failed', true);
      }
    } catch {
      flash('Network error generating certificate', true);
    } finally {
      setBusy(false);
    }
  }

  function openSign(c: Cert) {
    setSigning(c);
    setAttestations(DEFAULT_ATTESTATIONS.map((a) => ({ ...a })));
  }

  async function confirmSign() {
    if (!signing) return;
    if (attestations.some((a) => !a.value.trim())) {
      flash('Confirm every attestation before signing', true);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/v1/hr-policies-compliance/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sign', period: signing.period, attestations }),
      });
      const p = await r.json();
      if (p.success) {
        setSigning(null);
        flash('Certificate signed');
        await load();
      } else {
        flash(p.error?.details?.error ?? p.message ?? p.error?.message ?? 'Failed', true);
      }
    } catch {
      flash('Network error signing certificate', true);
    } finally {
      setBusy(false);
    }
  }

  function exportCert(c: Cert) {
    const lines = [
      `HR POLICY COMPLIANCE CERTIFICATE`,
      `================================`,
      ``,
      `Period:                ${c.period}`,
      `Status:                ${c.status}`,
      `Generated at:          ${c.generatedAt ?? '—'}`,
      `Signed at:             ${c.signedAt ?? '—'}`,
      `Signed by:             ${c.signedBy ?? '—'}`,
      ``,
      `Published policies:    ${c.publishedCount}`,
      `Draft policies:        ${c.draftCount}`,
      `Overdue reviews:       ${c.overdueReviewsCount}`,
      `Pending exceptions:    ${c.pendingExceptionsCount}`,
      `Ack coverage:          ${c.ackCoveragePct}%`,
      `Policies < 90% ack:    ${c.ackBelowThresholdCount}`,
      `Gating reason:         ${c.gatingReason ?? 'none'}`,
      ``,
      `Attestations:`,
      ...(c.attestationsJson ?? []).map((a) => `  - ${a.field}: ${a.value}`),
      '',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = `hr-policy-certificate-${c.period}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-32 · S13 / S14</p>
            <h1 className="text-2xl font-semibold">Monthly HR Policy Certificate</h1>
          </div>
          <div className="flex gap-2">
            <input
              placeholder="population"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              disabled={busy}
              onClick={generate}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
            >
              Generate
            </button>
          </div>
        </header>

        {error ? (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          {loading ? (
            <p className="text-sm text-slate-500">Loading certificates…</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Period</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Published</th>
                  <th className="px-3 py-2">Draft</th>
                  <th className="px-3 py-2">Overdue Reviews</th>
                  <th className="px-3 py-2">Pending Ex</th>
                  <th className="px-3 py-2">Ack %</th>
                  <th className="px-3 py-2">&lt; 90% Ack</th>
                  <th className="px-3 py-2">Gating</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {certs.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">{c.period}</td>
                    <td className="px-3 py-2">{c.status}</td>
                    <td className="px-3 py-2 text-emerald-700">{c.publishedCount}</td>
                    <td className="px-3 py-2">{c.draftCount}</td>
                    <td className="px-3 py-2 text-rose-700">{c.overdueReviewsCount}</td>
                    <td className="px-3 py-2 text-amber-700">{c.pendingExceptionsCount}</td>
                    <td className="px-3 py-2">{c.ackCoveragePct}</td>
                    <td className="px-3 py-2 text-rose-700">{c.ackBelowThresholdCount}</td>
                    <td className="px-3 py-2 text-xs text-rose-700">{c.gatingReason ?? '—'}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {c.status === 'DRAFT' && !c.gatingReason && (
                          <button
                            type="button"
                            onClick={() => openSign(c)}
                            className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                          >
                            Sign
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setViewing(c)}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => exportCert(c)}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                        >
                          Export
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {certs.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-3 py-6 text-center text-slate-500">
                      No certificates.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {signing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Sign certificate — {signing.period}</h2>
            <p className="mb-3 text-sm text-slate-600">
              Confirm each attestation to sign this compliance certificate.
            </p>
            <ul className="flex flex-col gap-3">
              {attestations.map((a, i) => (
                <li key={a.field} className="text-sm">
                  <p className="mb-1">{a.field}</p>
                  <select
                    value={a.value}
                    onChange={(e) =>
                      setAttestations((prev) =>
                        prev.map((x, j) => (j === i ? { ...x, value: e.target.value } : x))
                      )
                    }
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5"
                  >
                    <option value="">— Select —</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CONFIRMED_WITH_NOTES">Confirmed with notes</option>
                  </select>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={confirmSign}
                className="rounded-md bg-emerald-700 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                {busy ? 'Signing…' : 'Sign certificate'}
              </button>
              <button
                type="button"
                onClick={() => setSigning(null)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {viewing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-3 flex items-start justify-between">
              <h2 className="text-lg font-semibold">Certificate — {viewing.period}</h2>
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="rounded-md border border-slate-300 px-2 py-1 text-sm"
              >
                Close
              </button>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-slate-500">Status</dt>
              <dd>{viewing.status}</dd>
              <dt className="text-slate-500">Published</dt>
              <dd>{viewing.publishedCount}</dd>
              <dt className="text-slate-500">Overdue reviews</dt>
              <dd>{viewing.overdueReviewsCount}</dd>
              <dt className="text-slate-500">Pending exceptions</dt>
              <dd>{viewing.pendingExceptionsCount}</dd>
              <dt className="text-slate-500">Ack coverage</dt>
              <dd>{viewing.ackCoveragePct}%</dd>
              <dt className="text-slate-500">Signed at</dt>
              <dd>{viewing.signedAt ?? '—'}</dd>
              <dt className="text-slate-500">Signed by</dt>
              <dd className="font-mono text-xs">{viewing.signedBy ?? '—'}</dd>
            </dl>
            {viewing.attestationsJson && viewing.attestationsJson.length > 0 ? (
              <div className="mt-4">
                <h3 className="mb-1 text-sm font-semibold">Attestations</h3>
                <ul className="flex flex-col gap-1 text-sm">
                  {viewing.attestationsJson.map((a) => (
                    <li key={a.field} className="flex justify-between gap-4">
                      <span className="text-slate-700">{a.field}</span>
                      <span className="font-semibold text-emerald-700">{a.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => exportCert(viewing)}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
              >
                Export certificate
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
