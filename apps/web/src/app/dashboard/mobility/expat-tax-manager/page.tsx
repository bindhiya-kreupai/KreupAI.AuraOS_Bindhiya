'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Calculator, Globe, Loader2 } from 'lucide-react';

interface TaxProfile {
  id: string;
  employeeName: string;
  homeCountry: string;
  hostCountry: string;
  taxYear: number;
  filingStatus: string;
  filingType: string | null;
  filingDueDate: string | null;
}

interface EstimateResult {
  hypoTax: number;
  hostTax: number;
  companyCost: number;
  currency: string;
}

const COUNTRIES = [
  { code: 'US', label: 'United States' },
  { code: 'UK', label: 'United Kingdom' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'SG', label: 'Singapore' },
  { code: 'AE', label: 'United Arab Emirates' },
  { code: 'SA', label: 'Saudi Arabia' },
  { code: 'QA', label: 'Qatar' },
  { code: 'JP', label: 'Japan' },
];

const FILING_STATUS_STYLE: Record<string, string> = {
  FILED: 'bg-emerald-100 text-emerald-600',
  COMPLETED: 'bg-emerald-100 text-emerald-600',
  PENDING: 'bg-amber-100 text-amber-600',
  IN_REVIEW: 'bg-indigo-100 text-indigo-600',
};

function money(n: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ExpatTaxManagerPage() {
  const [homeCountry, setHomeCountry] = useState('US');
  const [hostCountry, setHostCountry] = useState('AE');
  const [salary, setSalary] = useState('100000');
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState('');

  const [profiles, setProfiles] = useState<TaxProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setListError('');
    try {
      const res = await fetch('/api/mobility/expat-tax-profiles?limit=100');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message ?? 'Failed to load tax profiles');
      }
      setProfiles(json.items ?? []);
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Failed to load tax profiles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const calculate = useCallback(async () => {
    setCalculating(true);
    setCalcError('');
    try {
      const res = await fetch('/api/mobility/expat-tax-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'estimate',
          homeCountry,
          hostCountry,
          baseSalary: Number(salary.replace(/[^0-9.]/g, '')) || 0,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message ?? 'Failed to calculate');
      }
      setEstimate(json.data);
    } catch (e) {
      setCalcError(e instanceof Error ? e.message : 'Failed to calculate');
    } finally {
      setCalculating(false);
    }
  }, [homeCountry, hostCountry, salary]);

  // Auto-calculate on input change (debounced).
  useEffect(() => {
    const t = setTimeout(() => {
      calculate();
    }, 400);
    return () => clearTimeout(t);
  }, [calculate]);

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="w-6 h-6 text-indigo-500" />
            Expat Tax Manager
          </h1>
          <p className="text-slate-500 text-sm">
            Handle tax equalization and compliance for assignees.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Calculator Widget */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-500" />
            Tax Equalization Estimator
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Home Country</label>
                <select
                  value={homeCountry}
                  onChange={(e) => setHomeCountry(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Host Country</label>
                <select
                  value={hostCountry}
                  onChange={(e) => setHostCountry(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">
                Annual Base Salary
              </label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
                placeholder="100000"
              />
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              {calcError && <p className="text-xs text-rose-600 mb-2">{calcError}</p>}
              {calculating ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm py-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> Calculating...
                </div>
              ) : estimate ? (
                <>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-500">
                      Estimated Home Tax Liability (Hypo)
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {money(estimate.hypoTax, estimate.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-500">Host Country Tax</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {money(estimate.hostTax, estimate.currency)}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between p-3 rounded-lg font-bold ${
                      estimate.companyCost <= 0
                        ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400'
                        : 'bg-rose-50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    <span>Company Cost Differential</span>
                    <span>{money(estimate.companyCost, estimate.currency)}</span>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Compliance Status — live filing profiles */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Compliance Deadlines</h3>
            <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-1 rounded">
              Tax Year {new Date().getFullYear()}
            </span>
          </div>
          {listError && <p className="text-sm text-rose-600 mb-3">{listError}</p>}
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm py-8">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          ) : profiles.length === 0 ? (
            <p className="text-sm text-slate-400 py-6">No expat tax profiles on record.</p>
          ) : (
            <div className="space-y-4">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-r-xl border-l-4 border-l-indigo-500 flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-sm">{p.employeeName}</div>
                    <div className="text-xs text-slate-500">
                      {p.filingType ?? `${p.homeCountry} → ${p.hostCountry}`}
                      {p.filingDueDate
                        ? ` · Due ${new Date(p.filingDueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: '2-digit',
                          })}`
                        : ''}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                      FILING_STATUS_STYLE[p.filingStatus] ?? 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {p.filingStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
