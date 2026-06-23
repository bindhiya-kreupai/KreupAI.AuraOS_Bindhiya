'use client';

import { useEffect, useState } from 'react';

interface CountryRow {
  id: string;
  countryCode: string;
  isEnabled: boolean;
  defaultCurrency: string;
  defaultTimezone: string;
}

interface LegalEntityRow {
  id: string;
  countryCode: string;
  legalName: string;
  registrationRef: string;
  registrationType: string;
  isActive: boolean;
}

const GCC_OPTIONS = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'];

export default function GccTenancyPage() {
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [entities, setEntities] = useState<LegalEntityRow[]>([]);
  const [country, setCountry] = useState('AE');
  const [legalName, setLegalName] = useState('');
  const [registrationRef, setRegistrationRef] = useState('');
  const [message, setMessage] = useState('');

  async function loadCountries() {
    const r = await fetch('/api/v1/gcc-landscape/countries');
    const p = await r.json();
    if (p.success) setCountries(p.data);
  }
  async function loadEntities() {
    const r = await fetch('/api/v1/gcc-landscape/legal-entities');
    const p = await r.json();
    if (p.success) setEntities(p.data);
  }

  useEffect(() => {
    loadCountries();
    loadEntities();
  }, []);

  async function enableCountry(code: string) {
    setMessage('');
    const r = await fetch('/api/v1/gcc-landscape/countries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ countryCode: code }),
    });
    const p = await r.json();
    setMessage(p.success ? `${code} enabled` : (p.error?.message ?? 'failed'));
    loadCountries();
  }

  async function disableCountry(code: string) {
    const r = await fetch(`/api/v1/gcc-landscape/countries?countryCode=${code}`, {
      method: 'DELETE',
    });
    const p = await r.json();
    setMessage(p.success ? `${code} disabled` : (p.error?.message ?? 'failed'));
    loadCountries();
  }

  async function createEntity() {
    setMessage('');
    const r = await fetch('/api/v1/gcc-landscape/legal-entities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ countryCode: country, legalName, registrationRef }),
    });
    const p = await r.json();
    setMessage(
      p.success ? 'Entity created' : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    if (p.success) {
      setLegalName('');
      setRegistrationRef('');
      loadEntities();
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">GCC Landscape · S01</p>
          <h1 className="text-2xl font-semibold">Countries & Legal Entities</h1>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Enabled Countries</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {GCC_OPTIONS.map((code) => {
              const row = countries.find((c) => c.countryCode === code);
              const enabled = row?.isEnabled;
              return (
                <div
                  key={code}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                    enabled ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <span className="font-semibold">{code}</span>
                  {row ? (
                    <span className="text-xs text-slate-500">
                      {row.defaultCurrency} · {row.defaultTimezone}
                    </span>
                  ) : null}
                  {enabled ? (
                    <button
                      type="button"
                      onClick={() => disableCountry(code)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                    >
                      Disable
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => enableCountry(code)}
                      className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white"
                    >
                      Enable
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {message ? <p className="mt-3 text-sm">{message}</p> : null}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">New Legal Entity</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <label className="text-sm">
              Country
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
              >
                {countries
                  .filter((c) => c.isEnabled)
                  .map((c) => (
                    <option key={c.countryCode}>{c.countryCode}</option>
                  ))}
              </select>
            </label>
            <label className="text-sm md:col-span-2">
              Legal Name
              <input
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              Registration Ref
              <input
                value={registrationRef}
                onChange={(e) => setRegistrationRef(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={createEntity}
            className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          >
            Create Entity
          </button>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Legal Entities</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Registration</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Active</th>
              </tr>
            </thead>
            <tbody>
              {entities.map((e) => (
                <tr key={e.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{e.countryCode}</td>
                  <td className="px-3 py-2">{e.legalName}</td>
                  <td className="px-3 py-2">{e.registrationRef}</td>
                  <td className="px-3 py-2">{e.registrationType}</td>
                  <td className="px-3 py-2">{e.isActive ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {entities.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                    No entities yet.
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
