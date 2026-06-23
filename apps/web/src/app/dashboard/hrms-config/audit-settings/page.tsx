'use client';

import { useEffect, useState } from 'react';

interface Setting {
  id: string;
  domain: string;
  captureReads: boolean;
  captureWrites: boolean;
  captureExports: boolean;
  retentionYears: number;
  piiClassification: string;
  isActive: boolean;
}

export default function AuditSettingsPage() {
  const [rows, setRows] = useState<Setting[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    domain: 'WPS',
    captureReads: false,
    captureWrites: true,
    captureExports: true,
    retentionYears: 7,
    piiClassification: 'CONFIDENTIAL',
  });

  async function load() {
    const r = await fetch('/api/v1/hrms-config/audit-settings');
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    const r = await fetch('/api/v1/hrms-config/audit-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', ...form }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-34 · S23</p>
          <h1 className="text-2xl font-semibold">Audit Trail Settings</h1>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Configure Domain</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-6">
            <input
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
              placeholder="Domain"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.captureReads}
                onChange={(e) => setForm({ ...form, captureReads: e.target.checked })}
              />
              Reads
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.captureWrites}
                onChange={(e) => setForm({ ...form, captureWrites: e.target.checked })}
              />
              Writes
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.captureExports}
                onChange={(e) => setForm({ ...form, captureExports: e.target.checked })}
              />
              Exports
            </label>
            <input
              type="number"
              value={form.retentionYears}
              onChange={(e) => setForm({ ...form, retentionYears: Number(e.target.value) })}
              placeholder="Retention yrs"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <select
              value={form.piiClassification}
              onChange={(e) => setForm({ ...form, piiClassification: e.target.value })}
              className="rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={save}
            className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Save
          </button>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Domain</th>
                <th className="px-3 py-2">Reads</th>
                <th className="px-3 py-2">Writes</th>
                <th className="px-3 py-2">Exports</th>
                <th className="px-3 py-2">Retention</th>
                <th className="px-3 py-2">PII Class</th>
                <th className="px-3 py-2">Active</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{r.domain}</td>
                  <td className="px-3 py-2">{r.captureReads ? '✓' : '—'}</td>
                  <td className="px-3 py-2">{r.captureWrites ? '✓' : '—'}</td>
                  <td className="px-3 py-2">{r.captureExports ? '✓' : '—'}</td>
                  <td className="px-3 py-2">{r.retentionYears}y</td>
                  <td className="px-3 py-2 text-xs">{r.piiClassification}</td>
                  <td className="px-3 py-2">{r.isActive ? '✓' : '—'}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No settings.
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
