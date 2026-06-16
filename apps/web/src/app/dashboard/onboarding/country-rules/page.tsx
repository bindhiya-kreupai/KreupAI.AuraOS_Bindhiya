'use client';

import { useEffect, useState } from 'react';

interface CountryRule {
  id?: string | null;
  countryCode: string;
  ruleCode: string;
  version: string;
  status?: string;
  ruleSet: {
    authorityReferences?: string[];
    tasks?: Array<{ code: string; name: string; blockingStage: string; documents?: string[] }>;
  };
}

interface InstantiationResult {
  instance: { id: string; countryCode: string; countryRuleVersion: string; totalTasks: number };
  tasks: Array<{ id: string; taskName: string; ruleTaskCode: string; blockingStage: string }>;
  rule: CountryRule;
}

export default function CountryRulesPage() {
  const [countryCode, setCountryCode] = useState('SA');
  const [employeeId, setEmployeeId] = useState('');
  const [rules, setRules] = useState<CountryRule[]>([]);
  const [result, setResult] = useState<InstantiationResult | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadRules() {
    const response = await fetch('/api/v1/onboarding/country-rules');
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.error?.message ?? 'Unable to load country rules');
    }
    setRules(payload.data ?? []);
  }

  useEffect(() => {
    loadRules().catch((error) => setMessage(error.message));
  }, []);

  async function seedDefaults() {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/v1/onboarding/country-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed-defaults' }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message ?? 'Seeding failed');
      }
      await loadRules();
      setMessage('Default GCC onboarding rules seeded');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Seeding failed');
    } finally {
      setLoading(false);
    }
  }

  async function resolveRule() {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(
        `/api/v1/onboarding/country-rules?action=resolve&countryCode=${encodeURIComponent(
          countryCode
        )}`
      );
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message ?? 'Resolve failed');
      }
      setRules([payload.data]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Resolve failed');
    } finally {
      setLoading(false);
    }
  }

  async function instantiate() {
    if (!employeeId.trim()) {
      setMessage('Employee ID is required');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/v1/onboarding/country-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'instantiate', employeeId: employeeId.trim() }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message ?? 'Instantiation failed');
      }
      setResult(payload.data);
      setMessage('Country onboarding tasks instantiated');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Instantiation failed');
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
          <h1 className="text-2xl font-semibold">Country Rule Engine</h1>
        </header>

        <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
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
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Seed Defaults
              </button>
              <button
                type="button"
                onClick={resolveRule}
                disabled={loading}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium disabled:opacity-50"
              >
                Resolve
              </button>
            </div>

            <label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="employeeId">
              Employee ID
            </label>
            <input
              id="employeeId"
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              placeholder="employee UUID"
            />
            <button
              type="button"
              onClick={instantiate}
              disabled={loading}
              className="mt-3 w-full rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Instantiate Tasks
            </button>

            {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">Latest Instantiation</h2>
            {result ? (
              <div className="mt-3 space-y-3">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs uppercase text-slate-500">Instance</p>
                    <p className="font-semibold">{result.instance.id}</p>
                  </div>
                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs uppercase text-slate-500">Rule Version</p>
                    <p className="font-semibold">{result.instance.countryRuleVersion}</p>
                  </div>
                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs uppercase text-slate-500">Tasks</p>
                    <p className="font-semibold">{result.instance.totalTasks}</p>
                  </div>
                </div>
                <ul className="divide-y divide-slate-100 rounded-md border border-slate-200">
                  {result.tasks.map((task) => (
                    <li key={task.id} className="p-3 text-sm">
                      <span className="font-medium">{task.ruleTaskCode}</span>
                      {' - '}
                      {task.taskName}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                Instantiate a case to see generated tasks.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Country Rules</h2>
            <button
              type="button"
              onClick={() => loadRules().catch((error) => setMessage(error.message))}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            >
              Refresh
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rules.map((rule) => (
              <article
                key={`${rule.countryCode}-${rule.version}`}
                className="rounded-md border border-slate-200 p-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{rule.countryCode}</h3>
                  <span className="text-xs text-slate-500">{rule.version}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {(rule.ruleSet.authorityReferences ?? []).join(', ')}
                </p>
                <p className="mt-3 text-sm font-medium">{rule.ruleSet.tasks?.length ?? 0} tasks</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
