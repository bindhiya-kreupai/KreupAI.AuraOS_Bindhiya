'use client';

import { useCallback, useEffect, useState } from 'react';

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

interface TplOption {
  id: string;
  templateCode: string;
  label: string;
  status: string;
}

const APPROVER_ROLES = [
  'HR_MANAGER',
  'LINE_MANAGER',
  'DEPARTMENT_HEAD',
  'FINANCE',
  'CEO',
  'COMPLIANCE_OFFICER',
];

export default function RoutingsPage() {
  const [templates, setTemplates] = useState<TplOption[]>([]);
  const [rows, setRows] = useState<Stage[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    stageOrder: '1',
    stageLabel: '',
    approverRole: 'HR_MANAGER',
    slaHours: '48',
    isParallel: false,
  });

  const loadTemplates = useCallback(async () => {
    const r = await fetch(
      '/api/v1/hr-forms-compliance/templates?pageSize=200&status=PUBLISHED',
      {}
    );
    const p = await r.json();
    if (p.success) setTemplates(p.data?.items ?? p.data ?? []);
  }, []);

  const loadStages = useCallback(async () => {
    if (!selectedTemplate) {
      setRows([]);
      return;
    }
    const url = new URL('/api/v1/hr-forms-compliance/routings', window.location.origin);
    url.searchParams.set('templateId', selectedTemplate);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) {
      setRows(p.data ?? []);
      // Default next stage order.
      const next = (p.data ?? []).length + 1;
      setForm((f) => ({ ...f, stageOrder: String(next) }));
    }
  }, [selectedTemplate]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);
  useEffect(() => {
    loadStages();
  }, [loadStages]);

  async function post(body: Record<string, unknown>, okMsg: string) {
    setBusy(true);
    setMessage('');
    try {
      const r = await fetch('/api/v1/hr-forms-compliance/routings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const p = await r.json();
      setMessage(p.success ? okMsg : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
      if (p.success) await loadStages();
    } catch {
      setMessage('Network error');
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!selectedTemplate) {
      setMessage('Select a template first');
      return;
    }
    if (!form.stageLabel.trim()) {
      setMessage('Stage label required');
      return;
    }
    await post(
      {
        action: 'upsert-stage',
        templateId: selectedTemplate,
        stageOrder: Number(form.stageOrder),
        stageLabel: form.stageLabel,
        approverRole: form.approverRole,
        slaHours: Number(form.slaHours),
        isParallel: form.isParallel,
      },
      'Stage saved'
    );
    setForm((f) => ({ ...f, stageLabel: '' }));
  }

  const selectedTpl = templates.find((t) => t.id === selectedTemplate);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-33 · S03</p>
            <h1 className="text-2xl font-semibold">Routing &amp; SLA Config</h1>
          </div>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">Select a published template…</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.templateCode} — {t.label}
              </option>
            ))}
          </select>
        </header>

        {templates.length === 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            No published templates found. Publish a template first in the Template Catalogue.
          </div>
        ) : null}

        {selectedTemplate ? (
          <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6">
            <div className="text-sm md:col-span-6">
              Adding stage to <span className="font-semibold">{selectedTpl?.templateCode}</span>
            </div>
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
              <select
                value={form.approverRole}
                onChange={(e) => setForm((f) => ({ ...f, approverRole: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              >
                {APPROVER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              SLA Hours
              <input
                value={form.slaHours}
                onChange={(e) => setForm((f) => ({ ...f, slaHours: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="flex items-end gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isParallel}
                onChange={(e) => setForm((f) => ({ ...f, isParallel: e.target.checked }))}
                className="mb-2"
              />
              Parallel
            </label>
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
            >
              Save Stage
            </button>
          </section>
        ) : null}
        {message ? <p className="text-sm text-slate-700">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">Approver</th>
                <th className="px-3 py-2">SLA hrs</th>
                <th className="px-3 py-2">Parallel</th>
                <th className="px-3 py-2">Reorder</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s, i) => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{s.stageOrder}</td>
                  <td className="px-3 py-2">{s.stageLabel}</td>
                  <td className="px-3 py-2 text-xs">{s.approverRole ?? s.approverId ?? '—'}</td>
                  <td className="px-3 py-2">{s.slaHours}h</td>
                  <td className="px-3 py-2">{s.isParallel ? '✓' : '—'}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={busy || i === 0}
                        onClick={() =>
                          post({ action: 'reorder-stage', id: s.id, direction: 'up' }, 'Reordered')
                        }
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs disabled:opacity-30"
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={busy || i === rows.length - 1}
                        onClick={() =>
                          post(
                            { action: 'reorder-stage', id: s.id, direction: 'down' },
                            'Reordered'
                          )
                        }
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs disabled:opacity-30"
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => post({ action: 'delete-stage', id: s.id }, 'Stage deleted')}
                      className="rounded-md bg-rose-100 px-2 py-1 text-xs text-rose-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    {selectedTemplate ? 'No stages yet.' : 'Select a template to view stages.'}
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
