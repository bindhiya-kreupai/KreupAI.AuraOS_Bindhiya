'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CalendarDays, Moon, Sun, Loader2, Plane, Sparkles } from 'lucide-react';

interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName?: string;
  formatted?: string;
}

interface IslamicHoliday {
  name: string;
  nameAr?: string;
  gregorianDate?: string;
  hijriDate?: string;
}

const CALENDAR_SYSTEMS = [
  {
    name: 'Gregorian',
    type: 'Primary',
    desc: 'Standard business calendar.',
    icon: Sun,
  },
  {
    name: 'Hijri (Islamic)',
    type: 'Secondary',
    desc: 'Umm al-Qura calendar for MENA religious holidays.',
    icon: Moon,
  },
];

function formatRange(start?: string, end?: string): string {
  const fmt = (d?: string) => {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };
  if (start && end) return `${fmt(start)} → ${fmt(end)}`;
  return fmt(start || end);
}

type ToolKey = 'eidAlFitr' | 'eidAlAdha' | 'hajjSeason' | 'ramadanPeriod' | 'format';

function IslamicCalendarTools() {
  const [hijriYear, setHijriYear] = useState('');
  const [formatDate, setFormatDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState<ToolKey | null>(null);
  const [results, setResults] = useState<Partial<Record<ToolKey, string>>>({});
  const [error, setError] = useState<string | null>(null);

  // Default the year input to the current Hijri year
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/compliance/hijri-calendar?action=currentYear');
        const json = await res.json().catch(() => ({}));
        if (!cancelled && json?.success && json.data?.hijriYear) {
          setHijriYear(String(json.data.hijriYear));
        }
      } catch {
        /* leave blank — API will fall back to current year */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const runTool = async (tool: ToolKey) => {
    setBusy(tool);
    setError(null);
    try {
      const params = new URLSearchParams({ action: tool });
      if (tool === 'format') {
        params.set('date', formatDate);
        params.set('locale', 'ar');
      } else if (hijriYear) {
        params.set('hijriYear', hijriYear);
      }
      const res = await fetch(`/api/compliance/hijri-calendar?${params.toString()}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        const msg = json?.error || json?.message || 'Request failed';
        const msgAr = json?.errorAr || json?.messageAr;
        throw new Error(msgAr ? `${msg} — ${msgAr}` : msg);
      }
      const data = json.data;
      let display = '';
      if (tool === 'format') {
        display = data?.formatted ?? JSON.stringify(data);
      } else if (tool === 'ramadanPeriod') {
        display = `${formatRange(data?.startDate, data?.endDate)}  ·  ${data?.totalDays ?? '?'} days`;
      } else {
        // eidAlFitr / eidAlAdha / hajjSeason -> { start, end }
        display = formatRange(data?.start, data?.end);
      }
      setResults((prev) => ({ ...prev, [tool]: display }));
    } catch (e: any) {
      setError(e?.message || 'Failed to load Islamic calendar data.');
    } finally {
      setBusy(null);
    }
  };

  const TOOLS: { key: ToolKey; label: string; labelAr: string; icon: React.ReactNode }[] = [
    {
      key: 'ramadanPeriod',
      label: 'Ramadan Period',
      labelAr: 'شهر رمضان',
      icon: <Moon className="w-4 h-4" />,
    },
    {
      key: 'eidAlFitr',
      label: 'Eid al-Fitr',
      labelAr: 'عيد الفطر',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      key: 'eidAlAdha',
      label: 'Eid al-Adha',
      labelAr: 'عيد الأضحى',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      key: 'hajjSeason',
      label: 'Hajj Season',
      labelAr: 'موسم الحج',
      icon: <Plane className="w-4 h-4" />,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
      <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
        <Moon className="w-5 h-5 text-indigo-500" /> Islamic Calendar Tools
      </h3>
      <p className="text-sm text-slate-500 mb-4">
        Look up key Islamic dates for a given Hijri year using the Umm al-Qura calendar.
      </p>

      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-500 mb-1">Hijri Year</label>
        <input
          type="number"
          value={hijriYear}
          onChange={(e) => setHijriYear(e.target.value)}
          placeholder="e.g. 1447"
          className="w-40 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {TOOLS.map((t) => (
          <div
            key={t.key}
            className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center flex-shrink-0">
                {t.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{t.label}</div>
                {results[t.key] ? (
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-mono truncate">
                    {results[t.key]}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400" dir="rtl">
                    {t.labelAr}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => runTool(t.key)}
              disabled={busy === t.key}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-60 flex-shrink-0"
            >
              {busy === t.key ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CalendarDays className="w-3.5 h-3.5" />
              )}
              Fetch
            </button>
          </div>
        ))}

        {/* Format a Gregorian date to Hijri */}
        <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">Format Date → Hijri</div>
              {results.format ? (
                <div className="text-xs text-indigo-600 dark:text-indigo-400 truncate" dir="rtl">
                  {results.format}
                </div>
              ) : (
                <div className="text-xs text-slate-400">
                  Formats the selected date in Arabic Hijri
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={formatDate}
              onChange={(e) => setFormatDate(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={() => runTool('format')}
              disabled={busy === 'format'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-60 flex-shrink-0"
            >
              {busy === 'format' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CalendarDays className="w-3.5 h-3.5" />
              )}
              Format
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalendarTypesPage() {
  const [hijriToday, setHijriToday] = useState<HijriDate | null>(null);
  const [holidays, setHolidays] = useState<IslamicHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [todayRes, holidaysRes] = await Promise.all([
        fetch('/api/compliance/hijri-calendar?action=toHijri'),
        fetch('/api/compliance/hijri-calendar?action=holidays'),
      ]);
      if (!todayRes.ok || !holidaysRes.ok) {
        throw new Error('Failed to load Hijri calendar data');
      }
      const todayJson = await todayRes.json();
      const holidaysJson = await holidaysRes.json();
      setHijriToday(todayJson.data ?? null);
      setHolidays(Array.isArray(holidaysJson.data) ? holidaysJson.data : []);
    } catch (err) {
      console.error('Failed to load calendar data:', err);
      setError('Unable to load Hijri calendar data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  return (
    <div className="space-y-4 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-500" />
            Calendar Types
          </h1>
          <p className="text-slate-500 text-sm">
            Gregorian and Hijri calendar systems with live Umm al-Qura conversion.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 space-y-4">
          {CALENDAR_SYSTEMS.map((cal) => (
            <div
              key={cal.name}
              className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                  <cal.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-lg">{cal.name}</div>
                  <div className="text-sm text-slate-500">{cal.desc}</div>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-bold ${
                  cal.type === 'Primary'
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {cal.type}
              </span>
            </div>
          ))}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-500" /> Upcoming Islamic Holidays
            </h3>
            {loading ? (
              <div className="flex items-center gap-2 py-6 text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading holidays...
              </div>
            ) : holidays.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-sm">
                No Islamic holidays available for this year.
              </div>
            ) : (
              <div className="space-y-2">
                {holidays.map((h, i) => (
                  <div
                    key={`${h.name}-${i}`}
                    className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                  >
                    <div>
                      <div className="font-bold text-sm">{h.name}</div>
                      {h.nameAr && (
                        <div className="text-xs text-slate-500" dir="rtl">
                          {h.nameAr}
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-mono text-slate-500 text-right">
                      {h.gregorianDate && <div>{h.gregorianDate}</div>}
                      {h.hijriDate && <div className="text-indigo-500">{h.hijriDate}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <IslamicCalendarTools />
        </div>

        <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl">
          <h3 className="font-bold text-lg mb-4">Today (Umm al-Qura)</h3>
          {loading ? (
            <div className="flex items-center gap-2 text-indigo-100">
              <Loader2 className="w-4 h-4 animate-spin" /> Converting...
            </div>
          ) : hijriToday ? (
            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-xl">
                <div className="text-3xl font-bold">
                  {hijriToday.day} {hijriToday.monthName ?? `Month ${hijriToday.month}`}
                </div>
                <div className="text-sm text-indigo-200 mt-1">{hijriToday.year} AH</div>
              </div>
              {hijriToday.formatted && (
                <div className="p-4 bg-white/10 rounded-xl text-sm" dir="rtl">
                  {hijriToday.formatted}
                </div>
              )}
            </div>
          ) : (
            <p className="text-indigo-100 text-sm">Hijri date unavailable.</p>
          )}
          <p className="text-indigo-100 text-xs mt-6">
            Hijri dates are subject to moon sighting (±1 day) across jurisdictions.
          </p>
        </div>
      </div>
    </div>
  );
}
