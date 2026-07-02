'use client';

import { useEffect, useState } from 'react';

interface CommTemplate {
  id: string;
  templateCode: string;
  trigger: string;
  label: string;
  channelsJson: string[] | null;
  isActive: boolean | null;
}

function readList<T>(payload: { data?: { items?: T[] } | T[] }): T[] {
  const data = payload.data;
  if (Array.isArray(data)) return data;
  return (data?.items as T[] | undefined) ?? [];
}

const BASE = '/api/v1/hse-visa-extensions';

export default function CommTemplatesPage() {
  const [message, setMessage] = useState('');
  const [templates, setTemplates] = useState<CommTemplate[]>([]);
  const [triggerFilter, setTriggerFilter] = useState('');
  const [form, setForm] = useState({
    templateCode: '',
    trigger: '',
    label: '',
    channels: '',
    subjectEn: '',
    subjectAr: '',
    bodyEn: '',
    bodyAr: '',
    isActive: true,
  });

  async function load() {
    const url = new URL(`${BASE}/comm-templates`, window.location.origin);
    if (triggerFilter) url.searchParams.set('trigger', triggerFilter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setTemplates(readList<CommTemplate>(p));
  }

  async function upsert() {
    const channels = form.channels
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    const r = await fetch(`${BASE}/comm-templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        templateCode: form.templateCode,
        trigger: form.trigger,
        label: form.label,
        channels: channels.length > 0 ? channels : undefined,
        subjectEn: form.subjectEn || undefined,
        subjectAr: form.subjectAr || undefined,
        bodyEn: form.bodyEn || undefined,
        bodyAr: form.bodyAr || undefined,
        isActive: form.isActive,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? (p.message ?? 'Saved') : p.error?.message);
    if (p.success) {
      setForm({
        templateCode: '',
        trigger: '',
        label: '',
        channels: '',
        subjectEn: '',
        subjectAr: '',
        bodyEn: '',
        bodyAr: '',
        isActive: true,
      });
    }
    load();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerFilter]);

  const inputCls = 'rounded-md border border-slate-300 px-2 py-1.5 text-sm';
  const btnCls = 'rounded-md bg-slate-900 px-3 py-2 text-sm text-white';
  const areaCls = 'rounded-md border border-slate-300 px-2 py-1.5 text-sm';

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">Visa-Exit · AURA-446</p>
          <h1 className="text-2xl font-semibold">
            Comm Templates (Bilingual) — TRANSFER PRO Chain
          </h1>
          {message ? <p className="mt-2 text-sm text-slate-700">{message}</p> : null}
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap gap-2">
            <input
              className={inputCls}
              placeholder="Filter trigger (e.g. TRANSFER_PRO_CHAIN)"
              value={triggerFilter}
              onChange={(e) => setTriggerFilter(e.target.value)}
            />
          </div>
          <div className="mt-4 grid gap-3">
            <div className="flex flex-wrap gap-2">
              <input
                className={inputCls}
                placeholder="templateCode"
                value={form.templateCode}
                onChange={(e) => setForm((f) => ({ ...f, templateCode: e.target.value }))}
              />
              <input
                className={inputCls}
                placeholder="trigger (free-text)"
                value={form.trigger}
                onChange={(e) => setForm((f) => ({ ...f, trigger: e.target.value }))}
              />
              <input
                className={inputCls}
                placeholder="label"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              />
              <input
                className={inputCls}
                placeholder="channels (comma-separated)"
                value={form.channels}
                onChange={(e) => setForm((f) => ({ ...f, channels: e.target.value }))}
              />
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                isActive
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                Subject EN
                <input
                  className={inputCls}
                  value={form.subjectEn}
                  onChange={(e) => setForm((f) => ({ ...f, subjectEn: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm" dir="rtl">
                الموضوع (AR)
                <input
                  className={inputCls}
                  value={form.subjectAr}
                  onChange={(e) => setForm((f) => ({ ...f, subjectAr: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Body EN
                <textarea
                  className={areaCls}
                  rows={4}
                  value={form.bodyEn}
                  onChange={(e) => setForm((f) => ({ ...f, bodyEn: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm" dir="rtl">
                النص (AR)
                <textarea
                  className={areaCls}
                  rows={4}
                  value={form.bodyAr}
                  onChange={(e) => setForm((f) => ({ ...f, bodyAr: e.target.value }))}
                />
              </label>
            </div>
            <div>
              <button type="button" className={btnCls} onClick={upsert}>
                Save Template
              </button>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-3">templateCode</th>
                  <th className="py-2 pr-3">trigger</th>
                  <th className="py-2 pr-3">label</th>
                  <th className="py-2 pr-3">channels</th>
                  <th className="py-2 pr-3">isActive</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3">{t.templateCode}</td>
                    <td className="py-2 pr-3">{t.trigger}</td>
                    <td className="py-2 pr-3">{t.label}</td>
                    <td className="py-2 pr-3">{(t.channelsJson ?? []).join(', ') || '—'}</td>
                    <td className="py-2 pr-3">{t.isActive ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
                {templates.length === 0 ? (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={5}>
                      No templates yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
