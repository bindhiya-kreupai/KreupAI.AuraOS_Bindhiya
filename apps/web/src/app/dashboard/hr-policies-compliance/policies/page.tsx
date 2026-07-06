'use client';

import { useCallback, useEffect, useState } from 'react';

interface Policy {
  id: string;
  title: string;
  category: string;
  version: string;
  status: string;
  applicableTo: string;
  acknowledgementsRequired: boolean;
  summary: string | null;
  contentMarkdown: string | null;
  effectiveDate: string | null;
  publishedAt: string | null;
  ownerName: string | null;
}

const statusColor: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-800',
  PUBLISHED: 'bg-emerald-100 text-emerald-800',
  ARCHIVED: 'bg-slate-100 text-slate-700',
};

const emptyForm = {
  title: '',
  category: '',
  version: '1.0',
  applicableTo: 'ALL_EMPLOYEES',
  ownerName: '',
  summary: '',
  contentMarkdown: '',
  acknowledgementsRequired: true,
  effectiveDate: '',
};
type PolicyForm = typeof emptyForm;

export default function PoliciesPage() {
  const [rows, setRows] = useState<Policy[]>([]);
  const [filter, setFilter] = useState('');
  const [interval, setInterval] = useState('12');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PolicyForm>(emptyForm);
  const [viewing, setViewing] = useState<Policy | null>(null);

  const flash = useCallback((msg: string, isError = false) => {
    setError(isError ? msg : '');
    setMessage(isError ? '' : msg);
    if (!isError) window.setTimeout(() => setMessage(''), 3000);
  }, []);

  const load = useCallback(async () => {
    setError('');
    const url = new URL('/api/v1/hr-policies-compliance/policies', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    url.searchParams.set('pageSize', '200');
    try {
      const r = await fetch(url.toString());
      const p = await r.json();
      if (p.success) setRows(p.data?.items ?? []);
      else setError(p.message ?? p.error?.message ?? 'Failed to load policies');
    } catch {
      setError('Network error loading policies');
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  // Honour deep-links from the dashboard / reviews page:
  //   ?status=PUBLISHED  → pre-filter the table
  //   ?id=<policyId>     → open the document viewer for that policy
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    if (status) setFilter(status);
    const id = params.get('id');
    if (!id) return;
    (async () => {
      try {
        const r = await fetch(
          `/api/v1/hr-policies-compliance/policies?id=${encodeURIComponent(id)}`
        );
        const p = await r.json();
        if (p.success) setViewing(p.data);
      } catch {
        /* ignore deep-link failure */
      }
    })();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(p: Policy) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      category: p.category,
      version: p.version,
      applicableTo: p.applicableTo,
      ownerName: p.ownerName ?? '',
      summary: p.summary ?? '',
      contentMarkdown: p.contentMarkdown ?? '',
      acknowledgementsRequired: p.acknowledgementsRequired,
      effectiveDate: p.effectiveDate ? p.effectiveDate.slice(0, 10) : '',
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.title.trim() || !form.category.trim()) {
      flash('Title and category are required', true);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/v1/hr-policies-compliance/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editingId ? 'update' : 'create',
          ...(editingId ? { policyId: editingId } : {}),
          ...form,
          effectiveDate: form.effectiveDate || undefined,
        }),
      });
      const p = await r.json();
      if (p.success) {
        setShowForm(false);
        flash(editingId ? 'Policy updated' : 'Policy created');
        await load();
      } else {
        flash(p.error?.details?.error ?? p.message ?? p.error?.message ?? 'Save failed', true);
      }
    } catch {
      flash('Network error saving policy', true);
    } finally {
      setBusy(false);
    }
  }

  async function mutate(action: 'publish' | 'archive', id: string) {
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/v1/hr-policies-compliance/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          policyId: id,
          ...(action === 'publish' ? { intervalMonths: Number(interval) } : {}),
        }),
      });
      const p = await r.json();
      if (p.success) {
        flash(action === 'publish' ? 'Published' : 'Archived');
        await load();
      } else {
        flash(p.message ?? p.error?.message ?? `${action} failed`, true);
      }
    } catch {
      flash(`Network error during ${action}`, true);
    } finally {
      setBusy(false);
    }
  }

  function download(p: Policy) {
    const md = p.contentMarkdown ?? p.summary ?? '(no document content)';
    const header = `# ${p.title}\n\nCategory: ${p.category}\nVersion: ${p.version}\nStatus: ${p.status}\n\n`;
    const blob = new Blob([header + md], { type: 'text/markdown;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = `${p.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-v${p.version}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-32 · S01 / S02 / S07</p>
            <h1 className="text-2xl font-semibold">Policy Lifecycle</h1>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600">Review every (months)</label>
            <input
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-16 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
            <button
              type="button"
              onClick={openCreate}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              New policy
            </button>
          </div>
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

        {showForm ? (
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-base font-semibold">
              {editingId ? 'Edit policy' : 'New policy (draft)'}
            </h2>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="text-sm md:col-span-2">
                Title *
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label className="text-sm">
                Category *
                <input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label className="text-sm">
                Version
                <input
                  value={form.version}
                  onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label className="text-sm">
                Applicable to
                <input
                  value={form.applicableTo}
                  onChange={(e) => setForm((f) => ({ ...f, applicableTo: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label className="text-sm">
                Owner name
                <input
                  value={form.ownerName}
                  onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label className="text-sm">
                Effective date
                <input
                  type="date"
                  value={form.effectiveDate}
                  onChange={(e) => setForm((f) => ({ ...f, effectiveDate: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label className="flex items-center gap-2 self-end text-sm">
                <input
                  type="checkbox"
                  checked={form.acknowledgementsRequired}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, acknowledgementsRequired: e.target.checked }))
                  }
                />
                Requires acknowledgement
              </label>
              <label className="text-sm md:col-span-3">
                Summary
                <input
                  value={form.summary}
                  onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label className="text-sm md:col-span-3">
                Document (markdown)
                <textarea
                  value={form.contentMarkdown}
                  onChange={(e) => setForm((f) => ({ ...f, contentMarkdown: e.target.value }))}
                  rows={6}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
                />
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={save}
                className="rounded-md bg-emerald-700 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                {busy ? 'Saving…' : editingId ? 'Save changes' : 'Create draft'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Version</th>
                <th className="px-3 py-2">Applicable</th>
                <th className="px-3 py-2">Ack req</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Published</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{p.title}</td>
                  <td className="px-3 py-2 text-xs">{p.category}</td>
                  <td className="px-3 py-2">{p.version}</td>
                  <td className="px-3 py-2 text-xs">{p.applicableTo}</td>
                  <td className="px-3 py-2">{p.acknowledgementsRequired ? '✓' : '—'}</td>
                  <td className="px-3 py-2 text-xs">{p.ownerName ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{p.publishedAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[p.status] ?? ''}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => setViewing(p)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => download(p)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      >
                        Download
                      </button>
                      {p.status === 'DRAFT' && (
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                        >
                          Edit
                        </button>
                      )}
                      {p.status !== 'PUBLISHED' && p.status !== 'ARCHIVED' && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => mutate('publish', p.id)}
                          className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white disabled:opacity-50"
                        >
                          Publish
                        </button>
                      )}
                      {p.status === 'PUBLISHED' && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => mutate('archive', p.id)}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs disabled:opacity-50"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No policies.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      {viewing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{viewing.title}</h2>
                <p className="text-xs text-slate-500">
                  {viewing.category} · v{viewing.version} · {viewing.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="rounded-md border border-slate-300 px-2 py-1 text-sm"
              >
                Close
              </button>
            </div>
            {viewing.summary ? (
              <p className="mb-3 text-sm text-slate-700">{viewing.summary}</p>
            ) : null}
            <pre className="whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
              {viewing.contentMarkdown ?? '(no document content)'}
            </pre>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => download(viewing)}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
              >
                Download markdown
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
