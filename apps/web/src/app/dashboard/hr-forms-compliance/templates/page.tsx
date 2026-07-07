'use client';

import { useCallback, useEffect, useState } from 'react';

interface SchemaField {
  code: string;
  label: string;
  type: string;
  requiredWhen?: string;
  visibleWhen?: string;
}

interface Tpl {
  id: string;
  templateCode: string;
  formGroup: string;
  label: string;
  version: string;
  schemaJson: { fields?: SchemaField[] } | null;
  writebackTarget: string | null;
  isMandatory: boolean;
  countryCode: string | null;
  status: string;
  publishedAt: string | null;
}

const FORM_GROUPS = [
  'RECRUITMENT',
  'EMPLOYMENT',
  'PAYROLL',
  'LEAVE_ATTENDANCE',
  'BENEFITS',
  'EMPLOYEE_RELATIONS',
  'SEPARATION',
  'COMPLIANCE',
];

const FIELD_TYPES = ['text', 'number', 'date', 'boolean', 'select', 'multiselect', 'attachment'];

const statusColor: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-800',
  PUBLISHED: 'bg-emerald-100 text-emerald-800',
  SUPERSEDED: 'bg-slate-100 text-slate-700',
};

const emptyForm = {
  templateCode: '',
  formGroup: 'EMPLOYMENT',
  label: '',
  writebackTarget: '',
  isMandatory: false,
  countryCode: '',
};

export default function TemplatesPage() {
  const [rows, setRows] = useState<Tpl[]>([]);
  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [fields, setFields] = useState<SchemaField[]>([]);

  const load = useCallback(async () => {
    const url = new URL('/api/v1/hr-forms-compliance/templates', window.location.origin);
    if (filter) url.searchParams.set('formGroup', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data?.items ?? p.data ?? []);
    else setMessage(p.error?.message ?? 'Failed to load');
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFields([]);
    setMessage('');
    setEditorOpen(true);
  }

  function openEdit(t: Tpl) {
    setEditingId(t.id);
    setForm({
      templateCode: t.templateCode,
      formGroup: t.formGroup,
      label: t.label,
      writebackTarget: t.writebackTarget ?? '',
      isMandatory: t.isMandatory,
      countryCode: t.countryCode ?? '',
    });
    setFields(t.schemaJson?.fields ?? []);
    setMessage('');
    setEditorOpen(true);
  }

  function addField() {
    setFields((f) => [...f, { code: '', label: '', type: 'text' }]);
  }
  function updateField(idx: number, patch: Partial<SchemaField>) {
    setFields((f) => f.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  }
  function removeField(idx: number) {
    setFields((f) => f.filter((_, i) => i !== idx));
  }

  async function submitEditor() {
    setBusy(true);
    setMessage('');
    const cleanFields = fields.filter((f) => f.code.trim() && f.label.trim());
    const body = editingId
      ? {
          action: 'update',
          id: editingId,
          label: form.label,
          writebackTarget: form.writebackTarget || null,
          isMandatory: form.isMandatory,
          countryCode: form.countryCode || null,
          schemaJson: { fields: cleanFields },
        }
      : {
          action: 'create',
          templateCode: form.templateCode,
          formGroup: form.formGroup,
          label: form.label,
          writebackTarget: form.writebackTarget || null,
          isMandatory: form.isMandatory,
          countryCode: form.countryCode || null,
          schemaJson: { fields: cleanFields },
        };
    try {
      const r = await fetch('/api/v1/hr-forms-compliance/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const p = await r.json();
      if (p.success) {
        setMessage(editingId ? 'Template updated' : 'Template created');
        setEditorOpen(false);
        await load();
      } else {
        setMessage(p.error?.details?.error ?? p.error?.message ?? 'failed');
      }
    } catch {
      setMessage('Network error');
    } finally {
      setBusy(false);
    }
  }

  async function post(body: Record<string, unknown>, okMsg: string) {
    setBusy(true);
    setMessage('');
    try {
      const r = await fetch('/api/v1/hr-forms-compliance/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const p = await r.json();
      setMessage(p.success ? okMsg : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
      if (p.success) await load();
    } catch {
      setMessage('Network error');
    } finally {
      setBusy(false);
    }
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
              {FORM_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={openCreate}
              className="rounded-md bg-blue-700 px-3 py-2 text-sm text-white disabled:opacity-50"
              disabled={busy}
            >
              New Template
            </button>
            <button
              type="button"
              onClick={() => post({ action: 'seed-defaults' }, 'Seeded default templates')}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
              disabled={busy}
            >
              Seed Defaults
            </button>
          </div>
        </header>
        {message ? <p className="text-sm text-slate-700">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Group</th>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">Version</th>
                <th className="px-3 py-2">Fields</th>
                <th className="px-3 py-2">Writeback</th>
                <th className="px-3 py-2">Mandatory</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{t.templateCode}</td>
                  <td className="px-3 py-2 text-xs">{t.formGroup}</td>
                  <td className="px-3 py-2">{t.label}</td>
                  <td className="px-3 py-2">{t.version}</td>
                  <td className="px-3 py-2">{t.schemaJson?.fields?.length ?? 0}</td>
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
                    <div className="flex flex-wrap gap-1">
                      {t.status === 'DRAFT' && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEdit(t)}
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => post({ action: 'publish', id: t.id }, 'Published')}
                            className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white disabled:opacity-50"
                            disabled={busy}
                          >
                            Publish
                          </button>
                        </>
                      )}
                      {t.status === 'PUBLISHED' && (
                        <button
                          type="button"
                          onClick={() =>
                            post(
                              { action: 'supersede-version', id: t.id },
                              'New draft version created'
                            )
                          }
                          className="rounded-md bg-amber-600 px-2 py-1 text-xs text-white disabled:opacity-50"
                          disabled={busy}
                        >
                          Supersede
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-slate-500">
                    No templates. Click &quot;Seed Defaults&quot; or &quot;New Template&quot; to
                    bootstrap.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      {editorOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-6">
          <div className="w-full max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-semibold">
                {editingId ? 'Edit Template' : 'New Template'}
              </h2>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="text-sm text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm">
                Template Code
                <input
                  value={form.templateCode}
                  disabled={!!editingId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, templateCode: e.target.value.toUpperCase() }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs disabled:bg-slate-100"
                />
              </label>
              <label className="text-sm">
                Form Group
                <select
                  value={form.formGroup}
                  disabled={!!editingId}
                  onChange={(e) => setForm((f) => ({ ...f, formGroup: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 disabled:bg-slate-100"
                >
                  {FORM_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm md:col-span-2">
                Label
                <input
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label className="text-sm">
                Writeback Target
                <input
                  value={form.writebackTarget}
                  placeholder="e.g. leave.request"
                  onChange={(e) => setForm((f) => ({ ...f, writebackTarget: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
                />
              </label>
              <label className="text-sm">
                Country Code
                <input
                  value={form.countryCode}
                  placeholder="blank = all"
                  onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isMandatory}
                  onChange={(e) => setForm((f) => ({ ...f, isMandatory: e.target.checked }))}
                />
                Mandatory form
              </label>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Form Schema Fields</h3>
                <button
                  type="button"
                  onClick={addField}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
                >
                  + Add Field
                </button>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {fields.map((f, idx) => (
                  <div
                    key={idx}
                    className="grid items-end gap-2 rounded-md border border-slate-200 p-2 md:grid-cols-12"
                  >
                    <label className="text-xs md:col-span-2">
                      Code
                      <input
                        value={f.code}
                        onChange={(e) => updateField(idx, { code: e.target.value })}
                        className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 font-mono text-xs"
                      />
                    </label>
                    <label className="text-xs md:col-span-3">
                      Label
                      <input
                        value={f.label}
                        onChange={(e) => updateField(idx, { label: e.target.value })}
                        className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1"
                      />
                    </label>
                    <label className="text-xs md:col-span-2">
                      Type
                      <select
                        value={f.type}
                        onChange={(e) => updateField(idx, { type: e.target.value })}
                        className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1"
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs md:col-span-4">
                      requiredWhen (DSL, optional)
                      <input
                        value={f.requiredWhen ?? ''}
                        placeholder="values.action == 'TERMINATE'"
                        onChange={(e) => updateField(idx, { requiredWhen: e.target.value })}
                        className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 font-mono text-xs"
                      />
                    </label>
                    <div className="md:col-span-1">
                      <button
                        type="button"
                        onClick={() => removeField(idx)}
                        className="rounded-md bg-rose-100 px-2 py-1 text-xs text-rose-700"
                      >
                        Del
                      </button>
                    </div>
                  </div>
                ))}
                {fields.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No fields yet. Fields drive the dynamic submission form and conditional logic.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitEditor}
                disabled={busy}
                className="rounded-md bg-blue-700 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                {editingId ? 'Save Changes' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
