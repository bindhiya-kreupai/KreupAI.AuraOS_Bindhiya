'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Globe2, Loader2, Contact } from 'lucide-react';

interface Country {
  id: string;
  isoCode: string;
  name: string;
  currency: string;
}

/**
 * Statutory / identity fields that must be captured for employees per country.
 * Config-driven (keyed by ISO code) — the country list itself is real DB data
 * loaded from /api/master-data/countries.
 */
const COUNTRY_FIELD_CONFIG: Record<string, string[]> = {
  AE: ['Emirates ID', 'Labour Card No', 'Passport No', 'IBAN'],
  SA: ['Iqama / National ID', 'GOSI No', 'Passport No', 'IBAN'],
  BH: ['CPR Number', 'CPR Expiry', 'Passport No', 'IBAN'],
  QA: ['Qatar ID (QID)', 'Passport No', 'IBAN'],
  OM: ['Civil ID', 'Passport No', 'IBAN'],
  KW: ['Civil ID', 'Passport No', 'IBAN'],
  IN: ['PAN', 'Aadhaar', 'UAN (PF)', 'ESIC No', 'IFSC + Account No'],
  US: ['SSN', 'Federal Tax ID', 'State ID', 'Routing + Account No'],
  GB: ['National Insurance No', 'Passport No', 'Sort Code + Account No'],
};

const DEFAULT_FIELDS = ['National ID', 'Passport No', 'Bank Account No'];

export default function CountrySpecificFieldsPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCountries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/master-data/countries?limit=100');
      if (!response.ok) {
        throw new Error('Failed to load countries');
      }
      const result = await response.json();
      setCountries(result.data ?? []);
    } catch (err) {
      console.error('Failed to fetch countries:', err);
      setError('Unable to load countries. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  return (
    <div className="space-y-4 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-indigo-500" />
            Country-Specific Fields
          </h1>
          <p className="text-slate-500 text-sm">
            Statutory and identity fields required for employees in each configured country.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading countries...
        </div>
      ) : countries.length === 0 ? (
        <div className="py-16 text-center text-slate-500">
          No countries configured. Add countries under Master Data.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {countries.map((country) => {
            const fields = COUNTRY_FIELD_CONFIG[country.isoCode] ?? DEFAULT_FIELDS;
            return (
              <div
                key={country.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{country.name}</h3>
                    <p className="text-xs font-mono text-slate-400 uppercase">
                      {country.isoCode} · {country.currency}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
                    <Contact className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">
                  Required Fields
                </div>
                <ul className="space-y-1">
                  {fields.map((field) => (
                    <li key={field} className="text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {field}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
