'use client';

import { useEffect, useState } from 'react';

interface H {
  id: string;
  caseId: string;
  itemDescription: string;
  itemType: string;
  successorId: string | null;
  completedAt: string | null;
  evidenceUrl: string | null;
  status: string;
}

interface E {
  id: string;
  caseId: string;
  conductedAt: string | null;
  satisfactionScore: number | null;
  reasonCode: string | null;
  willingToRehire: boolean | null;
  status: string;
}

interface ListResponse<T> {
  items?: T[];
}

export default function HandoverPage() {
  const [tab, setTab] = useState<'handover' | 'exit-interview'>('handover');
  const [items, setItems] = useState<H[]>([]);
  const [interviews, setInterviews] = useState<E[]>([]);
  const [completeFor, setCompleteFor] = useState<string | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [caseFilter, setCaseFilter] = useState('');
  const [handoverForm, setHandoverForm] = useState({
    caseId: '',
    itemDescription: '',
    itemType: 'ASSET',
    successorId: '',
  });
  const [interviewForm, setInterviewForm] = useState({
    caseId: '',
    conductedAt: new Date().toISOString().slice(0, 10),
    satisfactionScore: '3',
    reasonCode: 'CAREER',
    reasonDetail: '',
    willingToRehire: true,
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/separation-compliance/handover', window.location.origin);
    url.searchParams.set('resource', tab);
    if (caseFilter) url.searchParams.set('caseId', caseFilter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) {
      if (tab === 'handover') {
        const data = p.data as ListResponse<H> | H[] | undefined;
        setItems(Array.isArray(data) ? data : (data?.items ?? []));
      } else {
        const data = p.data as ListResponse<E> | E[] | undefined;
        setInterviews(Array.isArray(data) ? data : (data?.items ?? []));
      }
    } else {
      setMessage(p.error?.message ?? 'Failed to load');
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, caseFilter]);

  async function addItem() {
    setMessage('');
    const r = await fetch('/api/v1/separation-compliance/handover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add-item',
        ...handoverForm,
        successorId: handoverForm.successorId || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Added' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    if (p.success) {
      setHandoverForm({ caseId: '', itemDescription: '', itemType: 'ASSET', successorId: '' });
      await load();
    }
  }

  async function submitComplete() {
    if (!completeFor) return;
    setMessage('');
    const r = await fetch('/api/v1/separation-compliance/handover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'complete-item',
        id: completeFor,
        evidenceUrl: evidenceUrl || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Completed' : (p.error?.message ?? 'failed'));
    if (p.success) {
      setCompleteFor(null);
      setEvidenceUrl('');
      await load();
    }
  }

  async function saveInterview() {
    setMessage('');
    const r = await fetch('/api/v1/separation-compliance/handover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'exit-interview',
        ...interviewForm,
        satisfactionScore: Number(interviewForm.satisfactionScore),
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    if (p.success) await load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-27 · S14</p>
            <h1 className="text-2xl font-semibold">Handover &amp; Exit Interview</h1>
          </div>
          <div className="flex gap-2">
            <input
              placeholder="filter by caseId"
              value={caseFilter}
              onChange={(e) => setCaseFilter(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm font-mono text-xs"
            />
            <div className="flex rounded-md border border-slate-300 text-sm">
              <button
                type="button"
                onClick={() => setTab('handover')}
                className={`px-3 py-1.5 ${tab === 'handover' ? 'bg-slate-900 text-white' : ''}`}
              >
                Handover
              </button>
              <button
                type="button"
                onClick={() => setTab('exit-interview')}
                className={`px-3 py-1.5 ${tab === 'exit-interview' ? 'bg-slate-900 text-white' : ''}`}
              >
                Exit Interview
              </button>
            </div>
          </div>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        {tab === 'handover' ? (
          <>
            <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-5">
              <label className="text-sm">
                Case ID
                <input
                  value={handoverForm.caseId}
                  onChange={(e) => setHandoverForm((f) => ({ ...f, caseId: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
                />
              </label>
              <label className="text-sm md:col-span-2">
                Description
                <input
                  value={handoverForm.itemDescription}
                  onChange={(e) =>
                    setHandoverForm((f) => ({ ...f, itemDescription: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label className="text-sm">
                Type
                <select
                  value={handoverForm.itemType}
                  onChange={(e) => setHandoverForm((f) => ({ ...f, itemType: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                >
                  {['ASSET', 'KNOWLEDGE', 'DOCUMENT', 'PROJECT', 'OTHER'].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Successor
                <input
                  value={handoverForm.successorId}
                  onChange={(e) => setHandoverForm((f) => ({ ...f, successorId: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
              <button
                type="button"
                onClick={addItem}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white md:col-span-5"
              >
                Add Handover Item
              </button>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Case</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2">Successor</th>
                    <th className="px-3 py-2">Completed</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id} className="border-b border-slate-100">
                      <td className="px-3 py-2 font-mono text-xs">{i.caseId.slice(0, 8)}</td>
                      <td className="px-3 py-2 text-xs">{i.itemType}</td>
                      <td className="px-3 py-2 text-xs">{i.itemDescription}</td>
                      <td className="px-3 py-2 font-mono text-xs">{i.successorId ?? '—'}</td>
                      <td className="px-3 py-2 text-xs">{i.completedAt?.slice(0, 10) ?? '—'}</td>
                      <td className="px-3 py-2 text-xs">{i.status}</td>
                      <td className="px-3 py-2">
                        {i.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => {
                              setCompleteFor(i.id);
                              setEvidenceUrl('');
                            }}
                            className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                        No handover items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </>
        ) : (
          <>
            <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6">
              <label className="text-sm">
                Case ID
                <input
                  value={interviewForm.caseId}
                  onChange={(e) => setInterviewForm((f) => ({ ...f, caseId: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
                />
              </label>
              <label className="text-sm">
                Conducted
                <input
                  type="date"
                  value={interviewForm.conductedAt}
                  onChange={(e) => setInterviewForm((f) => ({ ...f, conductedAt: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label className="text-sm">
                Satisfaction 1-5
                <input
                  value={interviewForm.satisfactionScore}
                  onChange={(e) =>
                    setInterviewForm((f) => ({ ...f, satisfactionScore: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label className="text-sm">
                Reason Code
                <select
                  value={interviewForm.reasonCode}
                  onChange={(e) => setInterviewForm((f) => ({ ...f, reasonCode: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                >
                  {[
                    'CAREER',
                    'COMPENSATION',
                    'MANAGEMENT',
                    'RELOCATION',
                    'HEALTH',
                    'FAMILY',
                    'OTHER',
                  ].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm md:col-span-2">
                Reason Detail
                <input
                  value={interviewForm.reasonDetail}
                  onChange={(e) =>
                    setInterviewForm((f) => ({ ...f, reasonDetail: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={interviewForm.willingToRehire}
                  onChange={(e) =>
                    setInterviewForm((f) => ({ ...f, willingToRehire: e.target.checked }))
                  }
                />
                Willing to rehire
              </label>
              <button
                type="button"
                onClick={saveInterview}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white md:col-span-6"
              >
                Save Exit Interview
              </button>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Case</th>
                    <th className="px-3 py-2">Conducted</th>
                    <th className="px-3 py-2">Score</th>
                    <th className="px-3 py-2">Reason</th>
                    <th className="px-3 py-2">Rehire</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((i) => (
                    <tr key={i.id} className="border-b border-slate-100">
                      <td className="px-3 py-2 font-mono text-xs">{i.caseId.slice(0, 8)}</td>
                      <td className="px-3 py-2 text-xs">{i.conductedAt?.slice(0, 10) ?? '—'}</td>
                      <td className="px-3 py-2">{i.satisfactionScore ?? '—'}</td>
                      <td className="px-3 py-2 text-xs">{i.reasonCode ?? '—'}</td>
                      <td className="px-3 py-2">
                        {i.willingToRehire == null ? '—' : i.willingToRehire ? '✓' : '✗'}
                      </td>
                      <td className="px-3 py-2 text-xs">{i.status}</td>
                    </tr>
                  ))}
                  {interviews.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                        No exit interviews.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </>
        )}
      </div>

      {completeFor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-lg">
            <h3 className="text-base font-semibold">Complete Handover Item</h3>
            <p className="mt-1 text-sm text-slate-600">Attach optional evidence URL.</p>
            <input
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://…"
              className="mt-3 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCompleteFor(null);
                  setEvidenceUrl('');
                }}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitComplete}
                className="rounded-md bg-emerald-700 px-3 py-2 text-sm text-white"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
