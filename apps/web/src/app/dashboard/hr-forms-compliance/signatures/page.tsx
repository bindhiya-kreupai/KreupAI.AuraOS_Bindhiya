'use client';

import { useCallback, useEffect, useState } from 'react';

interface Sub {
  id: string;
  submissionRef: string;
  employeeId: string;
  status: string;
  currentStage: number;
  totalStages: number;
}

interface Signature {
  id: string;
  stageOrder: number;
  signerId: string;
  action: string;
  comments: string | null;
  signatureHash: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  signedAt: string;
}

const actionColor: Record<string, string> = {
  SUBMIT: 'bg-sky-100 text-sky-800',
  APPROVE: 'bg-emerald-100 text-emerald-800',
  REJECT: 'bg-rose-100 text-rose-800',
  SIGN: 'bg-indigo-100 text-indigo-800',
};

export default function SignaturesPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [selected, setSelected] = useState<Sub | null>(null);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [sigLoading, setSigLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSubs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/v1/hr-forms-compliance/submissions?pageSize=200');
      const p = await r.json();
      if (p.success) setSubs(p.data?.items ?? p.data ?? []);
      else setError(p.error?.message ?? 'Failed to load submissions');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubs();
  }, [loadSubs]);

  const loadSignatures = useCallback(async (s: Sub) => {
    setSelected(s);
    setSigLoading(true);
    setSignatures([]);
    try {
      const url = new URL('/api/v1/hr-forms-compliance/signatures', window.location.origin);
      url.searchParams.set('submissionStateId', s.id);
      const r = await fetch(url.toString());
      const p = await r.json();
      if (p.success) setSignatures(p.data ?? []);
      else setError(p.error?.message ?? 'Failed to load signatures');
    } catch {
      setError('Network error');
    } finally {
      setSigLoading(false);
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-33 · S12</p>
          <h1 className="text-2xl font-semibold">E-Signature Audit Trail</h1>
          <p className="mt-1 text-sm text-slate-600">
            Tamper-evident HMAC-SHA256 signatures for every stage transition. Select a submission to
            inspect its chain of signatures.
          </p>
        </header>

        {error ? (
          <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <span>{error}</span>
            <button
              type="button"
              onClick={loadSubs}
              className="rounded-md bg-rose-700 px-3 py-1.5 text-xs text-white"
            >
              Retry
            </button>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">Submissions</h2>
            {loading ? (
              <div className="mt-3 space-y-2" aria-busy="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-md bg-slate-100" />
                ))}
              </div>
            ) : (
              <table className="mt-3 w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-2 py-2">Ref</th>
                    <th className="px-2 py-2">Employee</th>
                    <th className="px-2 py-2">Stage</th>
                    <th className="px-2 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => loadSignatures(s)}
                      className={`cursor-pointer border-b border-slate-100 hover:bg-slate-50 ${
                        selected?.id === s.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-2 py-2 font-mono text-xs">{s.submissionRef}</td>
                      <td className="px-2 py-2 font-mono text-xs">{s.employeeId}</td>
                      <td className="px-2 py-2">
                        {s.currentStage}/{s.totalStages}
                      </td>
                      <td className="px-2 py-2 text-xs">{s.status}</td>
                    </tr>
                  ))}
                  {subs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-2 py-6 text-center text-slate-500">
                        No submissions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">
              {selected ? `Trail · ${selected.submissionRef}` : 'Signature Trail'}
            </h2>
            {!selected ? (
              <p className="mt-3 text-sm text-slate-500">Select a submission on the left.</p>
            ) : sigLoading ? (
              <div className="mt-3 space-y-2" aria-busy="true">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-md bg-slate-100" />
                ))}
              </div>
            ) : (
              <ol className="mt-3 flex flex-col gap-3">
                {signatures.map((sig) => (
                  <li key={sig.id} className="rounded-md border border-slate-200 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Stage {sig.stageOrder}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            actionColor[sig.action] ?? 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {sig.action}
                        </span>
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
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
