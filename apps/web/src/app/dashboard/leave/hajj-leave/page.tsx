'use client';

import React, { useState } from 'react';
import { Palmtree, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const COUNTRIES: Array<{ code: string; label: string }> = [
  { code: 'AE', label: 'United Arab Emirates' },
  { code: 'SA', label: 'Saudi Arabia' },
  { code: 'BH', label: 'Bahrain' },
  { code: 'QA', label: 'Qatar' },
  { code: 'OM', label: 'Oman' },
  { code: 'KW', label: 'Kuwait' },
];

interface HajjResult {
  isEligible: boolean;
  days: number;
  countryCode: string;
}

export default function HajjLeavePage() {
  const [countryCode, setCountryCode] = useState('AE');
  const [yearsOfService, setYearsOfService] = useState('1');
  const [isMuslim, setIsMuslim] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HajjResult | null>(null);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/compliance/labour-law', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode,
          action: 'isEligibleForHajjLeave',
          params: {
            yearsOfService: Number(yearsOfService) || 0,
            isMuslim,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to check Hajj leave eligibility');
      }
      setResult(data.data as HajjResult);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to check Hajj leave eligibility';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-6 text-slate-900 dark:text-slate-100">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Palmtree className="w-6 h-6 text-amber-500" />
          Hajj Leave Eligibility
        </h1>
        <p className="text-slate-500 text-sm">
          Check statutory Hajj leave entitlement based on country labour law, years of service, and
          religion.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="font-bold text-lg">Eligibility Check</h2>

          <div>
            <label htmlFor="hajj-country" className="block text-xs font-bold text-slate-500 mb-1">
              Country
            </label>
            <select
              id="hajj-country"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="hajj-years" className="block text-xs font-bold text-slate-500 mb-1">
              Years of Service
            </label>
            <input
              id="hajj-years"
              type="number"
              min={0}
              value={yearsOfService}
              onChange={(e) => setYearsOfService(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={isMuslim}
              onChange={(e) => setIsMuslim(e.target.checked)}
              className="accent-indigo-600"
            />
            <span className="text-sm font-bold">Employee is Muslim</span>
          </label>

          <button
            type="button"
            onClick={handleCheck}
            disabled={loading}
            className="w-full px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Checking...' : 'Check Eligibility'}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="font-bold text-lg mb-4">Result</h2>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-rose-50 text-rose-700 border border-rose-200"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {!error && !result && (
            <p className="text-sm text-slate-500">
              Enter the details and check eligibility to see the statutory Hajj leave entitlement.
            </p>
          )}

          {result && (
            <div className="space-y-4">
              <div
                className={`flex items-center gap-3 p-4 rounded-xl ${
                  result.isEligible
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600'
                }`}
              >
                {result.isEligible ? (
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 shrink-0" />
                )}
                <div>
                  <p className="font-bold">
                    {result.isEligible ? 'Eligible for Hajj Leave' : 'Not Eligible'}
                  </p>
                  <p className="text-xs">Country: {result.countryCode}</p>
                </div>
              </div>

              {result.isEligible && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                  <p className="text-3xl font-black text-indigo-600">{result.days}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Entitled Days
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
