'use client';

import { useEffect, useState } from 'react';

interface Template {
  id: string;
  code: string;
  name: string;
  domain: string;
  appendixRef: string | null;
  status: string;
  version: number;
  items: Array<{ code: string; controlObjective: string }>;
}

export default function ChecklistEngineHomePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/checklist-engine/templates?status=ACTIVE');
    const p = await r.json();
    if (p.success) setTemplates(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function seed() {
    setMessage('');
    const r1 = await fetch('/api/v1/checklist-engine/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-red-flag-rules' }),
    }).then((r) => r.json());
    const r2 = await fetch('/api/v1/checklist-engine/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-templates' }),
    }).then((r) => r.json());
    setMessage(
      `Rules: ${r1.data?.created?.length ?? 0} · Templates: ${r2.data?.created?.length ?? 0}`
    );
    load();
  }

  const tools = [
    { href: '/dashboard/checklist-engine/templates', label: 'Checklist Templates (S01)' },
    { href: '/dashboard/checklist-engine/runs', label: 'Run Workspace (S02)' },
    { href: '/dashboard/checklist-engine/red-flags', label: 'Red Flags (S03–S05)' },
    { href: '/dashboard/checklist-engine/exceptions', label: 'Exception Register (S06–S08)' },
    { href: '/dashboard/checklist-engine/certificate', label: 'Compliance Certificates (S10–S12)' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">
              EPIC-37 · Compliance Checklist & Red-Flag Engine
            </p>
            <h1 className="text-2xl font-semibold">Checklist & Red-Flag Engine</h1>
          </div>
          <button
            type="button"
            onClick={seed}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Seed Templates + Rules
          </button>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <article key={t.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{t.name}</h3>
                <span className="text-xs text-slate-500">v{t.version}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {t.domain} · {t.appendixRef ?? '—'} · {t.items?.length ?? 0} items
              </p>
              <p className="mt-2 font-mono text-xs">{t.code}</p>
            </article>
          ))}
          {templates.length === 0 && (
            <p className="col-span-full text-sm text-slate-500">No active templates. Seed first.</p>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((t) => (
              <li key={t.href}>
                <a
                  href={t.href}
                  className="block rounded-md border border-slate-200 px-3 py-2 text-sm hover:border-slate-900 hover:bg-slate-50"
                >
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
