'use client';

import { useEffect, useState } from 'react';

interface Stage {
  id: string;
  templateId: string;
  stageOrder: number;
  stageLabel: string;
  approverRole: string | null;
  approverId: string | null;
  slaHours: number;
  isParallel: boolean;
}

export default function RoutingsPage() {
  const [rows, setRows] = useState<Stage[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [form, setForm] = useState({
    templateId: '',
    stageOrder: '1',
    stageLabel: '',
    approverRole: 'HR_MANAGER',
    slaHours: '48',
    isParallel: false,
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/hr-forms-compliance/routings', window.location.origin);
    if (templateId) url.searchParams.set('templateId', templateId);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [templateId]);

  async function save() {
    setMessage('');
    const r = await fetch('/api/v1/hr-forms-compliance/routings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert-stage',
        templateId: form.templateId,
        stageOrder: Number(form.stageOrder),
        stageLabel: form.stageLabel,
        approverRole: form.approverRole,
        slaHours: Number(form.slaHours),
        isParallel: form.isParallel,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-33 · S03</p>
            <h1 className="text-2xl font-semibold">Routing &amp; SLA Config</h1>
          </div>
          <input
            placeholder="filter by templateId"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm font-mono text-xs"
          />
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6">
          <label className="text-sm">
            Template ID
            <input
              value={form.templateId}
              onChange={(e) => setForm((f) => ({ ...f, templateId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Stage Order
            <input
              value={form.stageOrder}
              onChange={(e) => setForm((f) => ({ ...f, stageOrder: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Stage Label
            <input
              value={form.stageLabel}
              onChange={(e) => setForm((f) => ({ ...f, stageLabel: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Approver Role
            <input
              value={form.approverRole}
              onChange={(e) => setForm((f) => ({ ...f, approverRole: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            SLA Hours
            <input
              value={form.slaHours}
              onChange={(e) => setForm((f) => ({ ...f, slaHours: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={save}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Save Stage
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Template</th>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">Approver</th>
                <th className="px-3 py-2">SLA hrs</th>
                <th className="px-3 py-2">Parallel</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{s.templateId.slice(0, 8)}</td>
                  <td className="px-3 py-2">{s.stageOrder}</td>
                  <td className="px-3 py-2">{s.stageLabel}</td>
                  <td className="px-3 py-2 text-xs">{s.approverRole ?? s.approverId ?? '—'}</td>
                  <td className="px-3 py-2">{s.slaHours}h</td>
                  <td className="px-3 py-2">{s.isParallel ? '✓' : '—'}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    No stages.
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
