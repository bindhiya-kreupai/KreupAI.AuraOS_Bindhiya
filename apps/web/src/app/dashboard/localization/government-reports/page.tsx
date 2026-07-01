'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Calendar, Loader2, ArrowRight } from 'lucide-react';

interface Country {
  id: string;
  isoCode: string;
  name: string;
  currency: string;
}

interface FilingDefinition {
  name: string;
  frequency: string;
  authority: string;
}

/**
 * Statutory filing catalog keyed by ISO code. Config-driven — the country list is
 * loaded from the real /api/master-data/countries endpoint. "Prepare" routes to the
 * real compliance module that generates the filing (no mock report records).
 */
const FILING_CATALOG: Record<string, { module: string; filings: FilingDefinition[] }> = {
  IN: {
    module: '/dashboard/payroll-compliance/india-statutory',
    filings: [
      { name: 'Form 16 (TDS Certificate)', frequency: 'Annual', authority: 'Income Tax Dept' },
      { name: 'Form 24Q (TDS Return)', frequency: 'Quarterly', authority: 'Income Tax Dept' },
      { name: 'EPF ECR Return', frequency: 'Monthly', authority: 'EPFO' },
      { name: 'ESI Return', frequency: 'Monthly', authority: 'ESIC' },
    ],
  },
  AE: {
    module: '/dashboard/payroll-compliance/wps',
    filings: [{ name: 'WPS SIF File', frequency: 'Monthly', authority: 'MoHRE' }],
  },
  SA: {
    module: '/dashboard/payroll-compliance/gosi',
    filings: [
      { name: 'GOSI Contribution File', frequency: 'Monthly', authority: 'GOSI' },
      { name: 'Mudad Salary File', frequency: 'Monthly', authority: 'HRSD' },
    ],
  },
};

export default function GovernmentReportsPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedIso, setSelectedIso] = useState<string>('');
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
      const list: Country[] = result.data ?? [];
      setCountries(list);
      if (list.length > 0) {
        const withCatalog = list.find((c) => FILING_CATALOG[c.isoCode]);
        setSelectedIso((withCatalog ?? list[0]).isoCode);
      }
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

  const selectedCountry = countries.find((c) => c.isoCode === selectedIso);
  const catalog = selectedIso ? FILING_CATALOG[selectedIso] : undefined;

  const handlePrepare = () => {
    if (catalog) {
      router.push(catalog.module);
    }
  };

  return (
    <div className="space-y-4 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" />
            Government Reports
          </h1>
          <p className="text-slate-500 text-sm">
            Statutory filings required for local authorities per country.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedIso}
            onChange={(e) => setSelectedIso(e.target.value)}
            disabled={loading || countries.length === 0}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-sm"
          >
            {countries.map((c) => (
              <option key={c.id} value={c.isoCode}>
                {c.name}
              </option>
            ))}
          </select>
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
      ) : !catalog ? (
        <div className="py-16 text-center text-slate-500">
          No statutory filing catalog configured for {selectedCountry?.name ?? 'this country'}.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Required Filings — {selectedCountry?.name}</h3>
            <button
              onClick={handlePrepare}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2 text-sm"
            >
              Open Compliance Module <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {catalog.filings.map((form) => (
              <div
                key={form.name}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
              >
                <div className="font-bold">{form.name}</div>
                <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3" /> {form.frequency}
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="px-2 py-1 rounded text-xs font-bold bg-indigo-100 text-indigo-600">
                    {form.authority}
                  </span>
                  <button
                    onClick={handlePrepare}
                    className="text-sm font-bold text-indigo-600 hover:underline"
                  >
                    Prepare
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
