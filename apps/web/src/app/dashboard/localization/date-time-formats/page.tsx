'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Globe, Loader2 } from 'lucide-react';

interface Country {
  id: string;
  isoCode: string;
  name: string;
  currency: string;
}

interface DateTimeFormat {
  date: string;
  time: string;
  locale: string;
}

/**
 * Date/time display formats keyed by ISO code. Config-driven — the country list
 * is loaded from the real /api/master-data/countries endpoint, and the preview is
 * rendered live using the browser Intl API for the country's locale.
 */
const DATETIME_FORMAT_CONFIG: Record<string, DateTimeFormat> = {
  US: { date: 'MM/DD/YYYY', time: '12-hour (AM/PM)', locale: 'en-US' },
  GB: { date: 'DD/MM/YYYY', time: '24-hour', locale: 'en-GB' },
  AE: { date: 'DD/MM/YYYY', time: '12-hour (AM/PM)', locale: 'ar-AE' },
  SA: { date: 'DD/MM/YYYY', time: '12-hour (AM/PM)', locale: 'ar-SA' },
  IN: { date: 'DD-MM-YYYY', time: '12-hour (AM/PM)', locale: 'en-IN' },
  JP: { date: 'YYYY/MM/DD', time: '24-hour', locale: 'ja-JP' },
};

const DEFAULT_FORMAT: DateTimeFormat = {
  date: 'DD/MM/YYYY',
  time: '24-hour',
  locale: 'en-GB',
};

function livePreview(locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
  } catch {
    return new Date().toLocaleString();
  }
}

export default function DateTimeFormatsPage() {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-500" />
            Date &amp; Time Formats
          </h1>
          <p className="text-slate-500 text-sm">
            Configure display formats for each country locale.
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {countries.map((country) => {
            const fmt = DATETIME_FORMAT_CONFIG[country.isoCode] ?? DEFAULT_FORMAT;
            return (
              <div
                key={country.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">{country.name}</div>
                    <div className="text-xs font-mono text-slate-400">{fmt.locale}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="text-sm font-bold text-slate-500">Date Format</span>
                    <span className="font-mono font-bold">{fmt.date}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="text-sm font-bold text-slate-500">Time Format</span>
                    <span className="font-bold">{fmt.time}</span>
                  </div>
                  <div className="p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center">
                    <span className="text-xs text-slate-400 block mb-1">Live Preview</span>
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {livePreview(fmt.locale)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
