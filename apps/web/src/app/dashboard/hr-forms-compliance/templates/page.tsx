'use client';

import { useEffect, useState } from 'react';

interface Tpl {
  id: string;
  templateCode: string;
  formGroup: string;
  label: string;
  version: string;
  writebackTarget: string | null;
  isMandatory: boolean;
  countryCode: string | null;
  status: string;
  publishedAt: string | null;
}

const statusColor: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-800',
  PUBLISHED: 'bg-emerald-100 text-emerald-800',
  SUPERSEDED: 'bg-slate-100 text-slate-700',
};

export default function TemplatesPage() {
  const [rows, setRows] = useState<Tpl[]>([]);
  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/hr-forms-compliance/templates', window.location.origin);
    if (filter) url.searchParams.set('formGroup', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function seed() {
    setMessage('');
    const r = await fetch('/api/v1/hr-forms-compliance/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-defaults' }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Seeded' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function publish(id: string) {
    const r = await fetch('/api/v1/hr-forms-compliance/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'publish', id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Published' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-33 · S01 / S02 / S04–S11</p>
            <h1 className="text-2xl font-semibold">HR Form Template Catalogue</h1>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">All groups</option>
              {[
                'RECRUITMENT',
                'EMPLOYMENT',
                'PAYROLL',
                'LEAVE_ATTENDANCE',
                'BENEFITS',
                'EMPLOYEE_RELATIONS',
                'SEPARATION',
                'COMPLIANCE',
              ].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={seed}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Seed Default Templates
            </button>
          </div>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Group</th>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">Version</th>
                <th className="px-3 py-2">Writeback</th>
                <th className="px-3 py-2">Mandatory</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{t.templateCode}</td>
                  <td className="px-3 py-2 text-xs">{t.formGroup}</td>
                  <td className="px-3 py-2">{t.label}</td>
                  <td className="px-3 py-2">{t.version}</td>
                  <td className="px-3 py-2 font-mono text-xs">{t.writebackTarget ?? '—'}</td>
                  <td className="px-3 py-2">{t.isMandatory ? '✓' : '—'}</td>
                  <td className="px-3 py-2">{t.countryCode ?? '*'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[t.status] ?? ''}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {t.status === 'DRAFT' && (
                      <button
                        type="button"
                        onClick={() => publish(t.id)}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                      >
                        Publish
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No templates. Click &quot;Seed Default Templates&quot; to bootstrap.
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
