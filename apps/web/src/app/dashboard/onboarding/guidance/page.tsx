'use client';

import { useEffect, useState } from 'react';

interface Guidance {
  id: string;
  contentKey: string;
  countryCode: string;
  version: number;
  status: string;
  title: string;
  introduction: string;
  objectives: string[];
  keyTakeaways: string[];
  obligations: Array<{ code: string; label: string; deadline?: string }>;
}

export default function OnboardingGuidancePage() {
  const [countryCode, setCountryCode] = useState('AE');
  const [rows, setRows] = useState<Guidance[]>([]);
  const [active, setActive] = useState<Guidance | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState({
    title: 'GCC onboarding compliance overview',
    introduction:
      'Use this workspace to complete country-specific onboarding obligations before activation and first pay.',
    objectives: 'Complete documents\nPrepare payroll and benefits\nPreserve audit evidence',
    keyTakeaways:
      'Country obligations are stage gates\nWPS and social insurance deadlines affect readiness\nEvery guidance version is recoverable',
  });

  async function loadRows() {
    const response = await fetch('/api/v1/onboarding/guidance');
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.error?.message ?? 'Unable to load guidance content');
    }
    setRows(payload.data ?? []);
  }

  useEffect(() => {
    loadRows().catch((error) => setMessage(error.message));
  }, []);

  async function seedDefaults() {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/v1/onboarding/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed-defaults' }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message ?? 'Seed failed');
      }
      await loadRows();
      setMessage('Default guidance seeded');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Seed failed');
    } finally {
      setLoading(false);
    }
  }

  async function resolveActive() {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(
        `/api/v1/onboarding/guidance?action=resolve&countryCode=${encodeURIComponent(countryCode)}`
      );
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message ?? 'Resolve failed');
      }
      setActive(payload.data);
      setMessage(`Loaded ${payload.data.countryCode} v${payload.data.version}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Resolve failed');
    } finally {
      setLoading(false);
    }
  }

  async function publishVersion() {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/v1/onboarding/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentKey: 'ONBOARDING_OVERVIEW',
          countryCode,
          title: draft.title,
          introduction: draft.introduction,
          objectives: draft.objectives
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
          keyTakeaways: draft.keyTakeaways
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
          publish: true,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message ?? 'Publish failed');
      }
      await loadRows();
      setActive(payload.data);
      setMessage(`Published v${payload.data.version}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Publish failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-2 border-b border-slate-200 pb-4">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Onboarding Compliance
          </p>
          <h1 className="text-2xl font-semibold">Guidance Content</h1>
        </header>

        <section className="grid gap-4 lg:grid-cols-[380px_1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <label className="text-sm font-medium text-slate-700" htmlFor="countryCode">
              Country Code
            </label>
            <input
              id="countryCode"
              value={countryCode}
              onChange={(event) => setCountryCode(event.target.value.toUpperCase())}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={seedDefaults}
                disabled={loading}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                Seed Defaults
              </button>
              <button
                type="button"
                onClick={resolveActive}
                disabled={loading}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
              >
                Resolve Active
              </button>
            </div>
            <label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="intro">
              Introduction
            </label>
            <textarea
              id="intro"
              value={draft.introduction}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, introduction: event.target.value }))
              }
              className="mt-2 h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="objectives">
              Objectives
            </label>
            <textarea
              id="objectives"
              value={draft.objectives}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, objectives: event.target.value }))
              }
              className="mt-2 h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="takeaways">
              Key Takeaways
            </label>
            <textarea
              id="takeaways"
              value={draft.keyTakeaways}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, keyTakeaways: event.target.value }))
              }
              className="mt-2 h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={publishVersion}
              disabled={loading}
              className="mt-4 w-full rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white"
            >
              Publish New Version
            </button>
            {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">Active Guidance</h2>
            {active ? (
              <div className="mt-3 space-y-4">
                <div>
                  <p className="text-xs uppercase text-slate-500">
                    {active.countryCode} v{active.version}
                  </p>
                  <h3 className="text-xl font-semibold">{active.title}</h3>
                  <p className="mt-2 text-sm text-slate-700">{active.introduction}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs uppercase text-slate-500">Objectives</p>
                    <ul className="mt-2 list-disc pl-5 text-sm">
                      {active.objectives.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs uppercase text-slate-500">Key Takeaways</p>
                    <ul className="mt-2 list-disc pl-5 text-sm">
                      {active.keyTakeaways.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                Resolve a country to preview published content.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-base font-semibold">Versions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Country</th>
                  <th className="px-3 py-2">Key</th>
                  <th className="px-3 py-2">Version</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Title</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">{row.countryCode}</td>
                    <td className="px-3 py-2">{row.contentKey}</td>
                    <td className="px-3 py-2">{row.version}</td>
                    <td className="px-3 py-2">{row.status}</td>
                    <td className="px-3 py-2">{row.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
