'use client';

import { useEffect, useState } from 'react';

interface Connector {
  id: string;
  connectorCode: string;
  label: string;
  kind: string;
  direction: string;
  endpointUrl: string | null;
  authType: string;
  lastRotatedAt: string | null;
  rotationDueAt: string | null;
  lastHealthCheckAt: string | null;
  lastHealthStatus: 'PASS' | 'FAIL' | 'UNKNOWN' | null;
  lastHealthMessage: string | null;
  isActive: boolean;
}

const healthColor: Record<string, string> = {
  PASS: 'bg-emerald-100 text-emerald-900',
  FAIL: 'bg-rose-100 text-rose-900',
  UNKNOWN: 'bg-slate-200 text-slate-800',
};

const KINDS = [
  'PAYROLL_BANK',
  'GOSI',
  'GPSSA',
  'SIO',
  'MOHRE',
  'QIWA',
  'MUDAD',
  'LMRA',
  'GL',
  'OTHER',
];

export default function ConnectorsPage() {
  const [items, setItems] = useState<Connector[]>([]);
  const [message, setMessage] = useState('');
  const [connectorCode, setConnectorCode] = useState('');
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState<string>('QIWA');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [authType, setAuthType] = useState<'OAUTH2' | 'API_KEY' | 'MTLS' | 'NONE'>('OAUTH2');
  const [secretRef, setSecretRef] = useState('');

  async function load() {
    const r = await fetch('/api/v1/hrms-config/connectors');
    const p = await r.json();
    if (p.success) setItems(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function upsert() {
    setMessage('');
    const r = await fetch('/api/v1/hrms-config/connectors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        connectorCode,
        label,
        kind,
        endpointUrl,
        authType,
        secretRef,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : p.message);
    if (p.success) {
      setConnectorCode('');
      setLabel('');
      setEndpointUrl('');
      setSecretRef('');
      load();
    }
  }

  async function markRotated(code: string) {
    setMessage('');
    const r = await fetch('/api/v1/hrms-config/connectors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark-rotated', connectorCode: code }),
    });
    const p = await r.json();
    setMessage(p.success ? `${code} rotated` : p.message);
    load();
  }

  async function recordHealth(code: string, status: 'PASS' | 'FAIL') {
    setMessage('');
    const message = status === 'FAIL' ? (window.prompt('Failure message?') ?? 'failure') : 'ok';
    const r = await fetch('/api/v1/hrms-config/connectors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'record-health', connectorCode: code, status, message }),
    });
    const p = await r.json();
    setMessage(p.success ? `${code} health=${status}` : p.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-34 · S25</p>
          <h1 className="text-2xl font-semibold">Connectors / Integration Endpoints</h1>
          <p className="mt-1 text-sm text-slate-600">
            Authority + downstream integration registry with auth type, secret rotation, and
            last-health status. Failing connectors gate the monthly certificate.
          </p>
        </header>

        {message ? <p className="text-sm text-slate-700">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Add / update connector</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium">
              Code
              <input
                value={connectorCode}
                onChange={(e) => setConnectorCode(e.target.value)}
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
              Kind
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              >
                {KINDS.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Auth type
              <select
                value={authType}
                onChange={(e) => setAuthType(e.target.value as any)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              >
                <option>OAUTH2</option>
                <option>API_KEY</option>
                <option>MTLS</option>
                <option>NONE</option>
              </select>
            </label>
            <label className="text-sm font-medium md:col-span-2">
              Endpoint URL
              <input
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm font-medium md:col-span-2">
              Secret reference (e.g. vault path)
              <input
                value={secretRef}
                onChange={(e) => setSecretRef(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={upsert}
            className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Save connector
          </button>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Registered connectors</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Code</th>
                <th>Kind</th>
                <th>Auth</th>
                <th>Health</th>
                <th>Last rotated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 align-top">
                  <td className="py-2 font-mono text-xs">{c.connectorCode}</td>
                  <td className="text-xs">{c.kind}</td>
                  <td className="text-xs">{c.authType}</td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${healthColor[c.lastHealthStatus ?? 'UNKNOWN'] ?? ''}`}
                    >
                      {c.lastHealthStatus ?? 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="text-xs">{c.lastRotatedAt ?? '—'}</td>
                  <td className="text-xs">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => markRotated(c.connectorCode)}
                        className="rounded-md bg-blue-600 px-2 py-1 text-xs text-white"
                      >
                        Rotated
                      </button>
                      <button
                        type="button"
                        onClick={() => recordHealth(c.connectorCode, 'PASS')}
                        className="rounded-md bg-emerald-600 px-2 py-1 text-xs text-white"
                      >
                        Health PASS
                      </button>
                      <button
                        type="button"
                        onClick={() => recordHealth(c.connectorCode, 'FAIL')}
                        className="rounded-md bg-rose-600 px-2 py-1 text-xs text-white"
                      >
                        Health FAIL
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-xs text-slate-500">
                    No connectors registered.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
