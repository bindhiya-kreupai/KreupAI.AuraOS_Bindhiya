'use client';

import { useEffect, useState } from 'react';

interface Tpl {
  id: string;
  templateCode: string;
  label: string;
  domain: string;
  country: string | null;
  stagesJson: Array<{ index: number; role: string; slaHours?: number }>;
  escalationHours: number;
  isActive: boolean;
}

export default function ApprovalTemplatesPage() {
  const [rows, setRows] = useState<Tpl[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    templateCode: '',
    label: '',
    domain: 'LEAVE',
    country: '',
    stagesJson:
      '[{"index":1,"role":"LINE_MANAGER","slaHours":24},{"index":2,"role":"HR","slaHours":24}]',
    escalationHours: 24,
  });

  async function load() {
    const r = await fetch('/api/v1/hrms-config/approval-templates');
    const p = await r.json();
    if (p.success) setRows(p.data?.items ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    let stages: unknown = [];
    try {
      stages = JSON.parse(form.stagesJson);
    } catch {
      setMessage('stagesJson is not valid JSON');
      return;
    }
    const r = await fetch('/api/v1/hrms-config/approval-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        templateCode: form.templateCode,
        label: form.label,
        domain: form.domain,
        country: form.country || undefined,
        stagesJson: stages,
        escalationHours: form.escalationHours,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function deactivate(id: string) {
    const r = await fetch('/api/v1/hrms-config/approval-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deactivate', id }),
    });
    const p = await r.json();
    setMessage(
      p.success ? 'Deactivated' : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-34 · S21</p>
          <h1 className="text-2xl font-semibold">Approval Workflow Templates</h1>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">New / Update</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
            <input
              value={form.templateCode}
              onChange={(e) => setForm({ ...form, templateCode: e.target.value })}
              placeholder="Code"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Label"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
              placeholder="Domain"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              placeholder="Country (opt)"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <button
              type="button"
              onClick={save}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Save
            </button>
          </div>
          <textarea
            value={form.stagesJson}
            onChange={(e) => setForm({ ...form, stagesJson: e.target.value })}
            rows={3}
            className="mt-3 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
          />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">Domain</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Stages</th>
                <th className="px-3 py-2">Escalation (h)</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{r.templateCode}</td>
                  <td className="px-3 py-2">{r.label}</td>
                  <td className="px-3 py-2">{r.domain}</td>
                  <td className="px-3 py-2">{r.country ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">
                    {(r.stagesJson ?? []).map((s) => `${s.index}.${s.role}`).join(' → ')}
                  </td>
                  <td className="px-3 py-2">{r.escalationHours}</td>
                  <td className="px-3 py-2">{r.isActive ? '✓' : '—'}</td>
                  <td className="px-3 py-2">
                    {r.isActive ? (
                      <button
                        type="button"
                        onClick={() => deactivate(r.id)}
                        className="rounded-md bg-rose-700 px-2 py-1 text-xs text-white"
                      >
                        Deactivate
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No templates.
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
