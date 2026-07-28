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

  // Message separation
  const [countryMessage, setCountryMessage] = useState('');
  const [countryMessageType, setCountryMessageType] = useState<'success' | 'error'>('success');
  const [entityMessage, setEntityMessage] = useState('');
  const [entityMessageType, setEntityMessageType] = useState<'success' | 'error'>('success');

  // Loading states
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<{
    legalName?: string;
    registrationRef?: string;
  }>({});

  // Filtering
  const [filterCountry, setFilterCountry] = useState('');

  async function loadCountries() {
    setIsLoadingCountries(true);
    try {
      const r = await fetch('/api/v1/gcc-landscape/countries', { cache: 'no-store' });
      const p = await r.json();
      if (p.success) {
        setCountries(p.data);
        // Sync selected country in creation form if current selected is not enabled
        const enabled = p.data.filter((c: CountryRow) => c.isEnabled);
        if (enabled.length > 0 && !enabled.some((e: CountryRow) => e.countryCode === country)) {
          setCountry(enabled[0].countryCode);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCountries(false);
    }
  }

  async function loadEntities(code?: string) {
    setIsLoadingEntities(true);
    try {
      const url = new URL('/api/v1/gcc-landscape/legal-entities', window.location.origin);
      if (code) url.searchParams.set('countryCode', code);
      const r = await fetch(url.toString(), { cache: 'no-store' });
      const p = await r.json();
      if (p.success) setEntities(p.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingEntities(false);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    setCountryMessage('');
    setEntityMessage('');
    setValidationErrors({});
    try {
      await Promise.all([loadCountries(), loadEntities(filterCountry || undefined)]);
      setCountryMessage('Data refreshed');
      setCountryMessageType('success');
    } catch (err) {
      setCountryMessage(err instanceof Error ? err.message : 'failed to refresh');
      setCountryMessageType('error');
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('auraos:gcc-landscape:filter-country');
      if (saved) {
        setFilterCountry(saved);
        loadEntities(saved);
      } else {
        loadEntities();
      }
    } else {
      loadEntities();
    }
    loadCountries();
  }, []);

  async function enableCountry(code: string) {
    setCountryMessage('');
    const r = await fetch('/api/v1/gcc-landscape/countries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ countryCode: code }),
    });
    const p = await r.json();
    setCountryMessage(p.success ? `${code} enabled` : (p.error?.message ?? 'failed'));
    setCountryMessageType(p.success ? 'success' : 'error');
    loadCountries();
    loadEntities(filterCountry || undefined);
  }

  async function disableCountry(code: string) {
    const r = await fetch(`/api/v1/gcc-landscape/countries?countryCode=${code}`, {
      method: 'DELETE',
    });
    const p = await r.json();
    setCountryMessage(p.success ? `${code} disabled` : (p.error?.message ?? 'failed'));
    setCountryMessageType(p.success ? 'success' : 'error');
    loadCountries();

    if (filterCountry === code) {
      setFilterCountry('');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auraos:gcc-landscape:filter-country');
      }
      loadEntities();
    } else {
      loadEntities(filterCountry || undefined);
    }
  }

  async function createEntity() {
    setEntityMessage('');
    const errors: { legalName?: string; registrationRef?: string } = {};
    if (!legalName.trim()) {
      errors.legalName = 'Legal Name is required';
    }
    if (!registrationRef.trim()) {
      errors.registrationRef = 'Registration Ref is required';
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});

    const r = await fetch('/api/v1/gcc-landscape/legal-entities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ countryCode: country, legalName, registrationRef }),
    });
    const p = await r.json();
    setEntityMessage(
      p.success ? 'Entity created' : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    setEntityMessageType(p.success ? 'success' : 'error');
    if (p.success) {
      setLegalName('');
      setRegistrationRef('');
      loadEntities(filterCountry || undefined);
    }
  }

  async function deactivateEntity(id: string) {
    setEntityMessage('');
    const r = await fetch(`/api/v1/gcc-landscape/legal-entities?id=${id}`, {
      method: 'DELETE',
    });
    const p = await r.json();
    setEntityMessage(
      p.success ? 'Entity deactivated' : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    setEntityMessageType(p.success ? 'success' : 'error');
    if (p.success) {
      loadEntities(filterCountry || undefined);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">GCC Landscape · S01</p>
            <h1 className="text-2xl font-semibold">Countries & Legal Entities</h1>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoadingCountries || isLoadingEntities}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
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
                      disabled={isLoadingCountries}
                      onClick={() => disableCountry(code)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs disabled:opacity-50"
                    >
                      Disable
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isLoadingCountries}
                      onClick={() => enableCountry(code)}
                      className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white disabled:opacity-50"
                    >
                      Enable
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {countryMessage ? (
            <p
              className={`mt-3 text-sm font-medium ${countryMessageType === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}
            >
              {countryMessage}
            </p>
          ) : null}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">New Legal Entity</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <label className="text-sm">
              Country
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={isLoadingEntities}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-sm disabled:opacity-50"
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
                onChange={(e) => {
                  setLegalName(e.target.value);
                  if (e.target.value.trim()) {
                    setValidationErrors((prev) => ({ ...prev, legalName: undefined }));
                  }
                }}
                className={`mt-1 w-full rounded-md border px-2 py-2 text-sm ${
                  validationErrors.legalName ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                }`}
              />
              {validationErrors.legalName && (
                <p className="mt-1 text-xs text-rose-600">{validationErrors.legalName}</p>
              )}
            </label>
            <label className="text-sm">
              Registration Ref
              <input
                value={registrationRef}
                onChange={(e) => {
                  setRegistrationRef(e.target.value);
                  if (e.target.value.trim()) {
                    setValidationErrors((prev) => ({ ...prev, registrationRef: undefined }));
                  }
                }}
                className={`mt-1 w-full rounded-md border px-2 py-2 text-sm ${
                  validationErrors.registrationRef
                    ? 'border-rose-500 bg-rose-50/50'
                    : 'border-slate-300'
                }`}
              />
              {validationErrors.registrationRef && (
                <p className="mt-1 text-xs text-rose-600">{validationErrors.registrationRef}</p>
              )}
            </label>
          </div>
          <button
            type="button"
            onClick={createEntity}
            disabled={isLoadingEntities}
            className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isLoadingEntities ? 'Creating...' : 'Create Entity'}
          </button>
          {entityMessage ? (
            <p
              className={`mt-3 text-sm font-medium ${entityMessageType === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}
            >
              {entityMessage}
            </p>
          ) : null}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold">Legal Entities</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Filter by Country:</span>
              <select
                value={filterCountry}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilterCountry(val);
                  if (typeof window !== 'undefined') {
                    if (val) {
                      localStorage.setItem('auraos:gcc-landscape:filter-country', val);
                    } else {
                      localStorage.removeItem('auraos:gcc-landscape:filter-country');
                    }
                  }
                  loadEntities(val || undefined);
                }}
                disabled={isLoadingEntities}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs disabled:opacity-50"
              >
                <option value="">All</option>
                {countries
                  .filter((c) => c.isEnabled)
                  .map((c) => (
                    <option key={c.countryCode} value={c.countryCode}>
                      {c.countryCode}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Registration</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2 text-right">Actions</th>
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
                  <td className="px-3 py-2 text-right">
                    {e.isActive && (
                      <button
                        type="button"
                        onClick={() => deactivateEntity(e.id)}
                        disabled={isLoadingEntities}
                        className="rounded bg-rose-50 px-2 py-1 text-xs font-medium text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors disabled:opacity-50"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {entities.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    {isLoadingEntities ? 'Loading...' : 'No entities found.'}
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
