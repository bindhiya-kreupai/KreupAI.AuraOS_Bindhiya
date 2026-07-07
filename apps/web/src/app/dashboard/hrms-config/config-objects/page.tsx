'use client';

import { useEffect, useState } from 'react';

interface Workspace {
  storyId: string;
  domainCode: string;
  label: string;
  description: string;
  objectTypes: string[];
  defaultObjectType: string;
}

interface ConfigObject {
  id: string;
  domainCode: string;
  objectType: string;
  objectKey: string;
  label: string;
  scope: string;
  country: string | null;
  legalEntityId: string | null;
  version: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'RETIRED';
  effectiveFrom: string;
  effectiveTo: string | null;
  rationale: string | null;
  sourceReference: string | null;
  requestedBy: string;
  approvedBy: string | null;
}

const statusColor: Record<string, string> = {
  DRAFT: 'bg-slate-200 text-slate-800',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-900',
  ACTIVE: 'bg-emerald-100 text-emerald-900',
  RETIRED: 'bg-rose-100 text-rose-900',
};

export default function ConfigObjectsPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [items, setItems] = useState<ConfigObject[]>([]);
  const [domain, setDomain] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Create-draft form
  const [objectKey, setObjectKey] = useState('');
  const [label, setLabel] = useState('');
  const [scope, setScope] = useState<'GLOBAL' | 'COUNTRY' | 'LEGAL_ENTITY' | 'DOMAIN'>('GLOBAL');
  const [country, setCountry] = useState('');
  const [rationale, setRationale] = useState('');
  const [sourceReference, setSourceReference] = useState('');
  const [payloadJson, setPayloadJson] = useState('{}');

  async function loadWorkspaces() {
    const r = await fetch('/api/v1/hrms-config/workspaces');
    const p = await r.json();
    if (p.success) setWorkspaces(p.data ?? []);
  }
  async function loadItems() {
    const qs = new URLSearchParams();
    if (domain) qs.set('domainCode', domain);
    if (statusFilter) qs.set('status', statusFilter);
    const r = await fetch(`/api/v1/hrms-config/config-objects?${qs}`);
    const p = await r.json();
    if (p.success) setItems(p.data?.items ?? []);
  }
  useEffect(() => {
    loadWorkspaces();
  }, []);
  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain, statusFilter]);

  const active = workspaces.find((w) => w.domainCode === domain);

  async function createDraft() {
    setMessage('');
    let payload: unknown = {};
    try {
      payload = JSON.parse(payloadJson);
    } catch {
      setMessage('Invalid JSON in payload');
      return;
    }
    const r = await fetch('/api/v1/hrms-config/config-objects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create-draft',
        domainCode: domain,
        objectType: active?.defaultObjectType ?? 'POLICY',
        objectKey,
        label,
        scope,
        country: country || undefined,
        rationale,
        sourceReference,
        effectiveFrom: new Date().toISOString(),
        payload,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Draft created' : p.message || 'Failed');
    if (p.success) {
      setObjectKey('');
      setLabel('');
      setRationale('');
      setSourceReference('');
      setPayloadJson('{}');
      loadItems();
    }
  }

  async function act(
    id: string,
    action: 'submit' | 'approve' | 'reject' | 'retire',
    reason?: string
  ) {
    if (action === 'reject' && !reason?.trim()) {
      setMessage('Rejection reason is required · سبب الرفض مطلوب');
      return;
    }
    setMessage('');
    const r = await fetch('/api/v1/hrms-config/config-objects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id, reason: reason?.trim() }),
    });
    const p = await r.json();
    setMessage(p.success ? `${action}: OK` : p.message || 'Failed');
    if (p.success) {
      setRejectingId(null);
      setRejectReason('');
    }
    loadItems();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">
            EPIC-34 · S01, S03–S20, S24 — Config Object Workspaces
          </p>
          <h1 className="text-2xl font-semibold">HRMS Configuration Workspaces</h1>
          <p className="mt-1 text-sm text-slate-600">
            Generic config object registry with scope resolution (GLOBAL → COUNTRY → LEGAL_ENTITY →
            DOMAIN), versioning, effective-dating and maker-checker. Pick a workspace below to see
            and manage its objects.
          </p>
        </header>

        {message ? (
          <div className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm">
            {message}
          </div>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Pick a workspace</h2>
          <ul className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((w) => (
              <li key={w.domainCode}>
                <button
                  type="button"
                  onClick={() => setDomain(w.domainCode)}
                  className={`block w-full rounded-md border p-3 text-left text-sm hover:border-slate-900 ${
                    w.domainCode === domain ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{w.label}</span>
                    <span className="text-xs text-slate-500">{w.storyId}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{w.description}</p>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {active ? (
          <>
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-base font-semibold">Create draft — {active.label}</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-sm font-medium">
                  Object key
                  <input
                    value={objectKey}
                    onChange={(e) => setObjectKey(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                  />
                </label>
                <label className="text-sm font-medium">
                  Label
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                  />
                </label>
                <label className="text-sm font-medium">
                  Scope
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value as any)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                  >
                    <option value="GLOBAL">GLOBAL</option>
                    <option value="COUNTRY">COUNTRY</option>
                    <option value="LEGAL_ENTITY">LEGAL_ENTITY</option>
                    <option value="DOMAIN">DOMAIN</option>
                  </select>
                </label>
                <label className="text-sm font-medium">
                  Country (if COUNTRY scope)
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="AE / SA / BH / QA / OM / KW"
                    className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                  />
                </label>
                <label className="text-sm font-medium md:col-span-2">
                  Rationale
                  <textarea
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                  />
                </label>
                <label className="text-sm font-medium md:col-span-2">
                  Source reference
                  <input
                    value={sourceReference}
                    onChange={(e) => setSourceReference(e.target.value)}
                    placeholder="Decree, gazette URL, RFC ticket"
                    className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                  />
                </label>
                <label className="text-sm font-medium md:col-span-2">
                  Payload (JSON)
                  <textarea
                    value={payloadJson}
                    onChange={(e) => setPayloadJson(e.target.value)}
                    rows={4}
                    className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={createDraft}
                className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
              >
                Create draft
              </button>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">{active.label} objects</h2>
                <label className="text-sm font-medium">
                  Status:
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="ml-2 rounded-md border border-slate-300 px-2 py-1.5"
                  >
                    <option value="">All</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="RETIRED">RETIRED</option>
                  </select>
                </label>
              </div>
              <table className="mt-3 w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2">Key</th>
                    <th>Label</th>
                    <th>Scope</th>
                    <th>v</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-t border-slate-100 align-top">
                      <td className="py-2 font-mono text-xs">{it.objectKey}</td>
                      <td className="text-xs">{it.label}</td>
                      <td className="text-xs">
                        {it.scope}
                        {it.country ? ` · ${it.country}` : ''}
                      </td>
                      <td className="text-xs">v{it.version}</td>
                      <td>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[it.status] ?? ''}`}
                        >
                          {it.status}
                        </span>
                      </td>
                      <td className="text-xs">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            {it.status === 'DRAFT' ? (
                              <button
                                type="button"
                                onClick={() => act(it.id, 'submit')}
                                className="rounded-md bg-blue-600 px-2 py-1 text-xs text-white"
                              >
                                Submit
                              </button>
                            ) : null}
                            {it.status === 'PENDING_APPROVAL' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => act(it.id, 'approve')}
                                  className="rounded-md bg-emerald-600 px-2 py-1 text-xs text-white"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingId(rejectingId === it.id ? null : it.id);
                                    setRejectReason('');
                                  }}
                                  className="rounded-md bg-rose-600 px-2 py-1 text-xs text-white"
                                >
                                  Reject
                                </button>
                              </>
                            ) : null}
                            {it.status === 'ACTIVE' ? (
                              <button
                                type="button"
                                onClick={() => act(it.id, 'retire')}
                                className="rounded-md bg-slate-700 px-2 py-1 text-xs text-white"
                              >
                                Retire
                              </button>
                            ) : null}
                          </div>
                          {rejectingId === it.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Rejection reason · سبب الرفض"
                                className="w-48 rounded-md border border-slate-300 px-2 py-1 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => act(it.id, 'reject', rejectReason)}
                                disabled={!rejectReason.trim()}
                                className="rounded-md bg-rose-700 px-2 py-1 text-xs text-white disabled:opacity-40"
                              >
                                Confirm
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-xs text-slate-500">
                        No objects for this filter.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
