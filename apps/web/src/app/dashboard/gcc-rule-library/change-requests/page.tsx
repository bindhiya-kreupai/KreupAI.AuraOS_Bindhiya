'use client';

import { useEffect, useState } from 'react';

interface ChangeRequest {
  id: string;
  rulePackId: string;
  action: 'PUBLISH' | 'RETIRE' | 'ROLLBACK';
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'ROLLED_BACK';
  rationale: string;
  sourceReference: string;
  requestedBy: string;
  requestedAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectedBy: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  previousVersion: number | null;
}

const statusColor: Record<string, string> = {
  PENDING_APPROVAL: 'bg-amber-100 text-amber-900',
  APPROVED: 'bg-emerald-100 text-emerald-900',
  REJECTED: 'bg-rose-100 text-rose-900',
  ROLLED_BACK: 'bg-slate-200 text-slate-800',
};

const actionColor: Record<string, string> = {
  PUBLISH: 'bg-blue-100 text-blue-900',
  RETIRE: 'bg-slate-200 text-slate-800',
  ROLLBACK: 'bg-purple-100 text-purple-900',
};

const GCC = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'];

export default function RuleChangeRequestsPage() {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [message, setMessage] = useState('');
  const [rulePackId, setRulePackId] = useState('');
  const [rationale, setRationale] = useState('');
  const [sourceReference, setSourceReference] = useState('');
  const [changeAction, setChangeAction] = useState<'PUBLISH' | 'RETIRE'>('PUBLISH');
  const [rollbackCountry, setRollbackCountry] = useState('AE');
  const [rollbackRationale, setRollbackRationale] = useState('');
  const [rollbackSource, setRollbackSource] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const qs = statusFilter ? `?status=${statusFilter}` : '';
    try {
      const r = await fetch(`/api/v1/gcc-rule-library/rule-change-requests${qs}`);
      const p = await r.json();
      if (p.success) {
        setRequests(p.data ?? []);
      } else {
        setMessage(p.message || 'Failed to load change requests');
      }
    } catch {
      setMessage('Failed to load change requests');
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function submitRequest() {
    setMessage('');
    const r = await fetch('/api/v1/gcc-rule-library/rule-change-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'request',
        rulePackId,
        changeAction,
        rationale,
        sourceReference,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Change request raised' : p.message || 'Failed');
    if (p.success) {
      setRulePackId('');
      setRationale('');
      setSourceReference('');
      load();
    }
  }

  async function approve(id: string) {
    setMessage('');
    setBusyId(id);
    try {
      const r = await fetch('/api/v1/gcc-rule-library/rule-change-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', requestId: id }),
      });
      const p = await r.json();
      setMessage(p.success ? 'Approved' : p.message || 'Failed');
      if (p.success) await load();
    } finally {
      setBusyId(null);
    }
  }

  function beginReject(id: string) {
    setRejectingId(id);
    setRejectReason('');
    setMessage('');
  }

  function cancelReject() {
    setRejectingId(null);
    setRejectReason('');
  }

  async function confirmReject() {
    const id = rejectingId;
    const reason = rejectReason.trim();
    if (!id || !reason) {
      setMessage('A rejection reason is required.');
      return;
    }
    setMessage('');
    setBusyId(id);
    try {
      const r = await fetch('/api/v1/gcc-rule-library/rule-change-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', requestId: id, reason }),
      });
      const p = await r.json();
      setMessage(p.success ? 'Rejected' : p.message || 'Failed');
      if (p.success) {
        setRejectingId(null);
        setRejectReason('');
        await load();
      }
    } finally {
      setBusyId(null);
    }
  }

  async function submitRollback() {
    setMessage('');
    const r = await fetch('/api/v1/gcc-rule-library/rule-change-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'rollback',
        countryCode: rollbackCountry,
        rationale: rollbackRationale,
        sourceReference: rollbackSource,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Rollback recorded' : p.message || 'Failed');
    if (p.success) {
      setRollbackRationale('');
      setRollbackSource('');
      load();
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-02 · S02 — Rule Change Governance</p>
          <h1 className="text-2xl font-semibold">Rule Pack Change Requests</h1>
          <p className="mt-1 text-sm text-slate-600">
            Maker-checker workflow over the country rule pack publish / retire lifecycle. Requires
            rationale, source reference, and an approver distinct from the requester.
          </p>
        </header>

        {message ? (
          <div className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm">
            {message}
          </div>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Raise a change request</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium">
              Rule Pack ID
              <input
                value={rulePackId}
                onChange={(e) => setRulePackId(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                placeholder="pack uuid"
              />
            </label>
            <label className="text-sm font-medium">
              Action
              <select
                value={changeAction}
                onChange={(e) => setChangeAction(e.target.value as 'PUBLISH' | 'RETIRE')}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              >
                <option value="PUBLISH">PUBLISH (DRAFT → ACTIVE)</option>
                <option value="RETIRE">RETIRE (ACTIVE → RETIRED)</option>
              </select>
            </label>
            <label className="text-sm font-medium md:col-span-2">
              Rationale
              <textarea
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                placeholder="Why is this change needed?"
              />
            </label>
            <label className="text-sm font-medium md:col-span-2">
              Source reference
              <input
                value={sourceReference}
                onChange={(e) => setSourceReference(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                placeholder="Decree / gazette URL / RFC"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={submitRequest}
            className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Submit request
          </button>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Pending &amp; recent requests</h2>
            <label className="text-sm font-medium">
              Status filter:
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="ml-2 rounded-md border border-slate-300 px-2 py-1.5"
              >
                <option value="">All</option>
                <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="ROLLED_BACK">ROLLED_BACK</option>
              </select>
            </label>
          </div>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Action</th>
                <th>Status</th>
                <th>Rule Pack</th>
                <th>Requested By</th>
                <th>Rationale</th>
                <th>Source</th>
                <th>Decision</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-t border-slate-100 align-top">
                  <td className="py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${actionColor[req.action] ?? ''}`}
                    >
                      {req.action}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[req.status] ?? ''}`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="font-mono text-xs">{req.rulePackId.slice(0, 8)}…</td>
                  <td className="text-xs">{req.requestedBy}</td>
                  <td className="text-xs">{req.rationale}</td>
                  <td className="text-xs">{req.sourceReference}</td>
                  <td className="text-xs">
                    {req.status === 'PENDING_APPROVAL' ? (
                      rejectingId === req.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={2}
                            placeholder="Rejection reason (required)"
                            className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={confirmReject}
                              disabled={busyId === req.id || !rejectReason.trim()}
                              className="rounded-md bg-rose-600 px-2 py-1 text-xs text-white disabled:opacity-50"
                            >
                              Confirm reject
                            </button>
                            <button
                              type="button"
                              onClick={cancelReject}
                              disabled={busyId === req.id}
                              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => approve(req.id)}
                            disabled={busyId === req.id}
                            className="rounded-md bg-emerald-600 px-2 py-1 text-xs text-white disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => beginReject(req.id)}
                            disabled={busyId === req.id}
                            className="rounded-md bg-rose-600 px-2 py-1 text-xs text-white disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )
                    ) : req.status === 'APPROVED' ? (
                      <span>by {req.approvedBy ?? '—'}</span>
                    ) : req.status === 'REJECTED' ? (
                      <span>{req.rejectionReason ?? '—'}</span>
                    ) : (
                      <span>v{req.previousVersion ?? '?'} reverted</span>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-xs text-slate-500">
                    No change requests for this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-rose-200 bg-rose-50 p-4">
          <h2 className="text-base font-semibold text-rose-900">Emergency rollback</h2>
          <p className="mt-1 text-sm text-rose-800">
            Reverts the currently ACTIVE rule pack for a country to its immediately preceding
            RETIRED version. Records a ROLLBACK row on this register.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="text-sm font-medium">
              Country
              <select
                value={rollbackCountry}
                onChange={(e) => setRollbackCountry(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              >
                {GCC.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium md:col-span-2">
              Source reference
              <input
                value={rollbackSource}
                onChange={(e) => setRollbackSource(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                placeholder="Incident / ticket / regulator notice"
              />
            </label>
            <label className="text-sm font-medium md:col-span-3">
              Rationale
              <textarea
                value={rollbackRationale}
                onChange={(e) => setRollbackRationale(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                placeholder="Why are we rolling back?"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={submitRollback}
            className="mt-3 rounded-md bg-rose-700 px-3 py-2 text-sm text-white"
          >
            Roll back ACTIVE pack
          </button>
        </section>
      </div>
    </main>
  );
}
