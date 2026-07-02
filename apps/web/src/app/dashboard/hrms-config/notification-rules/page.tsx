'use client';

import { useEffect, useState } from 'react';

interface Rule {
  id: string;
  ruleCode: string;
  label: string;
  domain: string;
  trigger: string;
  channelsJson: string[];
  recipientRoles: string[];
  severity: string;
  isActive: boolean;
}

const sevColor: Record<string, string> = {
  INFO: 'bg-blue-100 text-blue-800',
  WARNING: 'bg-amber-100 text-amber-800',
  CRITICAL: 'bg-rose-100 text-rose-800',
};

export default function NotificationRulesPage() {
  const [rows, setRows] = useState<Rule[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    ruleCode: '',
    label: '',
    domain: 'WPS',
    trigger: 'CERTIFICATE_GATED',
    channels: 'EMAIL,IN_APP',
    roles: 'HR_ADMIN,COMPLIANCE_OFFICER',
    severity: 'WARNING',
    templateText: '',
    templateTextAr: '',
  });

  async function load() {
    const r = await fetch('/api/v1/hrms-config/notification-rules');
    const p = await r.json();
    if (p.success) setRows(p.data?.items ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    const r = await fetch('/api/v1/hrms-config/notification-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        ruleCode: form.ruleCode,
        label: form.label,
        domain: form.domain,
        trigger: form.trigger,
        channelsJson: form.channels
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        recipientRoles: form.roles
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        severity: form.severity,
        templateText: form.templateText || undefined,
        templateTextAr: form.templateTextAr || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function deactivate(id: string) {
    const r = await fetch('/api/v1/hrms-config/notification-rules', {
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
          <p className="text-sm uppercase text-slate-500">EPIC-34 · S22</p>
          <h1 className="text-2xl font-semibold">Notification Rules</h1>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">New / Update</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <input
              value={form.ruleCode}
              onChange={(e) => setForm({ ...form, ruleCode: e.target.value })}
              placeholder="Rule code"
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
              value={form.trigger}
              onChange={(e) => setForm({ ...form, trigger: e.target.value })}
              placeholder="Trigger"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              value={form.channels}
              onChange={(e) => setForm({ ...form, channels: e.target.value })}
              placeholder="Channels (CSV)"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              value={form.roles}
              onChange={(e) => setForm({ ...form, roles: e.target.value })}
              placeholder="Recipient roles (CSV)"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
              className="rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['INFO', 'WARNING', 'CRITICAL'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={save}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Save
            </button>
          </div>
          <textarea
            value={form.templateText}
            onChange={(e) => setForm({ ...form, templateText: e.target.value })}
            rows={2}
            placeholder="Template (EN)"
            className="mt-3 w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
          />
          <textarea
            value={form.templateTextAr}
            onChange={(e) => setForm({ ...form, templateTextAr: e.target.value })}
            rows={2}
            placeholder="Template (AR)"
            dir="rtl"
            className="mt-3 w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
          />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">Domain</th>
                <th className="px-3 py-2">Trigger</th>
                <th className="px-3 py-2">Channels</th>
                <th className="px-3 py-2">Roles</th>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{r.ruleCode}</td>
                  <td className="px-3 py-2">{r.label}</td>
                  <td className="px-3 py-2">{r.domain}</td>
                  <td className="px-3 py-2 text-xs">{r.trigger}</td>
                  <td className="px-3 py-2 text-xs">{(r.channelsJson ?? []).join(', ')}</td>
                  <td className="px-3 py-2 text-xs">{(r.recipientRoles ?? []).join(', ')}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sevColor[r.severity] ?? ''}`}
                    >
                      {r.severity}
                    </span>
                  </td>
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
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No rules.
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
