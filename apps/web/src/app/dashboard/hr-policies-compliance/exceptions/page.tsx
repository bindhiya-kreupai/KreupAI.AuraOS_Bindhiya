'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

interface Ex {
  id: string;
  policyId: string;
  policyTitle: string | null;
  employeeId: string | null;
  scopeLabel: string | null;
  reason: string;
  status: string;
  raisedAt: string;
  expiresAt: string | null;
}

interface PolicyOption {
  id: string;
  title: string;
  category: string;
  version: string;
  status: string;
}

const statusColor: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-slate-100 text-slate-700',
  CLOSED: 'bg-slate-100 text-slate-700',
};

export default function ExceptionsPage() {
  const [rows, setRows] = useState<Ex[]>([]);
  const [policies, setPolicies] = useState<PolicyOption[]>([]);
  const [filter, setFilter] = useState('');
  const [policySearch, setPolicySearch] = useState('');
  const [form, setForm] = useState({
    policyId: '',
    employeeId: '',
    scopeLabel: '',
    reason: '',
    expiresAt: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const flash = useCallback((msg: string, isError = false) => {
    setError(isError ? msg : '');
    setMessage(isError ? '' : msg);
    if (!isError) window.setTimeout(() => setMessage(''), 3000);
  }, []);

  const load = useCallback(async () => {
    setError('');
    const url = new URL('/api/v1/hr-policies-compliance/exceptions', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    try {
      const r = await fetch(url.toString());
      const p = await r.json();
      if (p.success) setRows(p.data ?? []);
      else setError(p.message ?? p.error?.message ?? 'Failed to load exceptions');
    } catch {
      setError('Network error loading exceptions');
    }
  }, [filter]);

  const loadPolicies = useCallback(async () => {
    try {
      const r = await fetch('/api/v1/hr-policies-compliance/policies?pageSize=200');
      const p = await r.json();
      if (p.success) setPolicies(p.data?.items ?? []);
    } catch {
      /* non-fatal; picker just stays empty */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  const filteredPolicies = useMemo(() => {
    const q = policySearch.trim().toLowerCase();
    if (!q) return policies;
    return policies.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [policies, policySearch]);

  async function raise() {
    if (!form.policyId) {
      flash('Select a policy', true);
      return;
    }
    if (!form.reason.trim()) {
      flash('Reason is required', true);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/v1/hr-policies-compliance/exceptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'raise',
          policyId: form.policyId,
          reason: form.reason,
          employeeId: form.employeeId || undefined,
          scopeLabel: form.scopeLabel || undefined,
          expiresAt: form.expiresAt || undefined,
        }),
      });
      const p = await r.json();
      if (p.success) {
        flash('Exception raised');
        setForm({ policyId: '', employeeId: '', scopeLabel: '', reason: '', expiresAt: '' });
        setPolicySearch('');
        await load();
      } else {
        flash(p.error?.details?.error ?? p.message ?? p.error?.message ?? 'Failed', true);
      }
    } catch {
      flash('Network error raising exception', true);
    } finally {
      setBusy(false);
    }
  }

  async function action(id: string, name: 'approve' | 'reject' | 'close') {
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/v1/hr-policies-compliance/exceptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: name, id }),
      });
      const p = await r.json();
      if (p.success) {
        flash(`Exception ${name}d`);
        await load();
      } else {
        flash(p.message ?? p.error?.message ?? `${name} failed`, true);
      }
    } catch {
      flash(`Network error during ${name}`, true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-32 · S10</p>
            <h1 className="text-2xl font-semibold">Policy Exception Register</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
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

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6">
          <div className="text-sm md:col-span-2">
            <label htmlFor="policy-search">Policy *</label>
            <input
              id="policy-search"
              placeholder="Search policies…"
              value={policySearch}
              onChange={(e) => setPolicySearch(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
            <select
              value={form.policyId}
              onChange={(e) => setForm((f) => ({ ...f, policyId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              <option value="">— Select a policy —</option>
              {filteredPolicies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.category} · v{p.version} · {p.status})
                </option>
              ))}
            </select>
          </div>
          <label className="text-sm">
            Employee
            <input
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Scope
            <input
              value={form.scopeLabel}
              onChange={(e) => setForm((f) => ({ ...f, scopeLabel: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Expires
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm md:col-span-5">
            Reason *
            <input
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={raise}
            className="self-end rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Raise
          </button>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Raised</th>
                <th className="px-3 py-2">Policy</th>
                <th className="px-3 py-2">Scope / Employee</th>
                <th className="px-3 py-2">Reason</th>
                <th className="px-3 py-2">Expires</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 text-xs">{r.raisedAt?.slice(0, 10)}</td>
                  <td className="px-3 py-2 text-xs">
                    {r.policyTitle ?? <span className="font-mono">{r.policyId.slice(0, 8)}</span>}
                  </td>
                  <td className="px-3 py-2 text-xs">{r.employeeId ?? r.scopeLabel ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{r.reason}</td>
                  <td className="px-3 py-2 text-xs">{r.expiresAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[r.status] ?? ''}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {r.status === 'PENDING' && (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => action(r.id, 'approve')}
                          className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => action(r.id, 'reject')}
                          className="rounded-md bg-rose-700 px-2 py-1 text-xs text-white disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {r.status === 'APPROVED' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => action(r.id, 'close')}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs disabled:opacity-50"
                      >
                        Close
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No exceptions.
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
