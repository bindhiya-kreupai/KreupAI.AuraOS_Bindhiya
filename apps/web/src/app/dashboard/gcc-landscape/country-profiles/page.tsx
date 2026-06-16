'use client';

import { useEffect, useState } from 'react';

interface Profile {
  id: string;
  countryCode: string;
  weekendPattern: string;
  statutoryCurrency: string;
  labourAuthority: string;
  socialInsuranceAuthority: string;
  nationalizationProgramme: string;
  expatProfile: string;
  marketNotes: string;
  version: number;
  effectiveFrom: string;
  status: string;
}

export default function GccCountryProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/gcc-landscape/country-profiles');
    const p = await r.json();
    if (p.success) setProfiles(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function seed() {
    const r = await fetch('/api/v1/gcc-landscape/country-profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-defaults' }),
    });
    const p = await r.json();
    setMessage(
      p.success ? `Seeded ${(p.data?.created ?? []).join(', ') || 'none'}` : p.error?.message
    );
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">GCC Landscape · S02</p>
            <h1 className="text-2xl font-semibold">Country Reference Dataset</h1>
          </div>
          <button
            type="button"
            onClick={seed}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          >
            Seed Defaults
          </button>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}
        <section className="grid gap-4 md:grid-cols-2">
          {profiles.map((p) => (
            <article key={p.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{p.countryCode}</h2>
                <span className="text-xs text-slate-500">
                  v{p.version} · {p.status}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-700">
                <dt>Weekend</dt>
                <dd>{p.weekendPattern}</dd>
                <dt>Currency</dt>
                <dd>{p.statutoryCurrency}</dd>
                <dt>Labour</dt>
                <dd>{p.labourAuthority}</dd>
                <dt>Social</dt>
                <dd>{p.socialInsuranceAuthority}</dd>
                <dt>Programme</dt>
                <dd>{p.nationalizationProgramme}</dd>
                <dt>Expat profile</dt>
                <dd>{p.expatProfile}</dd>
              </dl>
              <p className="mt-3 text-xs text-slate-600">{p.marketNotes}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
