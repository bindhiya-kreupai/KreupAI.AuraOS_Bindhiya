'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe2,
  Type,
  Map,
  ShieldCheck,
  FileText,
  Calendar,
  ArrowLeftRight,
  Search,
  ChevronRight,
  Clock,
  Loader2,
  Languages,
} from 'lucide-react';
import { cn } from '@aura/ui/utils';

interface TermPair {
  key: string;
  context: string;
  en: string;
  ar: string;
}

// Standard HR terminology keys resolved live via the i18n service.
const TERM_KEYS: { key: string; context: string }[] = [
  { key: 'payroll.basicSalary', context: 'Payroll Registry' },
  { key: 'nav.leave', context: 'Employee ESS' },
  { key: 'label.department', context: 'Org Hierarchy' },
  { key: 'nav.attendance', context: 'Time & Attendance' },
  { key: 'nav.compliance', context: 'Compliance' },
  { key: 'nav.benefits', context: 'Benefits' },
];

const CONFIG_ACTIONS = [
  { label: 'Date/Time Formats', icon: Clock, href: '/localization/date-time-formats' },
  { label: 'Address Formats', icon: Map, href: '/localization/address-formats' },
  { label: 'Multi-Currency', icon: ArrowLeftRight, href: '/localization/multi-currency' },
  { label: 'Multi-Language', icon: Languages, href: '/localization/multi-language' },
  { label: 'Government Reports', icon: FileText, href: '/localization/government-reports' },
  { label: 'Country-Specific Fields', icon: Globe2, href: '/localization/country-specific-fields' },
];

export default function LocalizationPage() {
  const router = useRouter();
  const [isRTL, setIsRTL] = useState(false);
  const [terms, setTerms] = useState<TermPair[]>([]);
  const [search, setSearch] = useState('');
  const [hijriYear, setHijriYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const termResults = await Promise.all(
        TERM_KEYS.map(async ({ key, context }) => {
          const res = await fetch(`/api/i18n?action=bilingual&key=${encodeURIComponent(key)}`);
          if (!res.ok) {
            return null;
          }
          const json = await res.json();
          return { key, context, en: json.data?.en ?? key, ar: json.data?.ar ?? '' };
        })
      );
      setTerms(termResults.filter((t): t is TermPair => t !== null));

      const hijriRes = await fetch('/api/compliance/hijri-calendar?action=currentYear');
      if (hijriRes.ok) {
        const hijriJson = await hijriRes.json();
        setHijriYear(hijriJson.data?.hijriYear ?? null);
      }
    } catch (err) {
      console.error('Failed to load localization data:', err);
      setError('Unable to load localization data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTerms = terms.filter(
    (t) =>
      t.en.toLowerCase().includes(search.toLowerCase()) ||
      t.ar.includes(search) ||
      t.context.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={cn(
        'p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700',
        isRTL ? 'text-right' : 'text-left'
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-cloud dark:border-nebula-purple/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest">
            <Globe2 className="w-4 h-4" /> MENA Native Engine
          </div>
          <h1 className="text-4xl font-extrabold text-ink-black dark:text-pearl tracking-tight">
            Localization{' '}
            <span className="text-indigo-600 dark:text-indigo-400">&amp; Compliance</span>
          </h1>
          <p className="text-silver-mist text-sm max-w-2xl leading-relaxed">
            Configure jurisdiction-specific compliance, RTL orchestration, and native Arabic
            terminology sourced live from the localization service.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setIsRTL(!isRTL)}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border',
              isRTL
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/20'
                : 'bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl border-cloud dark:border-nebula-purple/30 hover:bg-slate-50'
            )}
          >
            <ArrowLeftRight className="w-4 h-4" /> {isRTL ? 'English Mode' : 'Toggle RTL (Arabic)'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-3">
                <Type className="w-6 h-6 text-indigo-500" /> Arabic Terminology Mapping
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search labels..."
                  className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs w-48 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center gap-2 py-10 text-silver-mist justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading terminology...
                </div>
              ) : filteredTerms.length === 0 ? (
                <div className="py-10 text-center text-silver-mist text-sm">
                  No terminology matches your search.
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-cloud dark:border-nebula-purple/10">
                      <th className="px-4 py-3 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                        Global Field Name
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                        Arabic Native Label
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                        Context
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cloud dark:divide-nebula-purple/5">
                    {filteredTerms.map((term) => (
                      <tr
                        key={term.key}
                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="text-xs font-bold text-ink-black dark:text-pearl">
                            {term.en}
                          </div>
                        </td>
                        <td className="px-4 py-4 font-arabic">
                          <div
                            className="text-sm font-bold text-indigo-600 dark:text-indigo-400"
                            dir="rtl"
                          >
                            {term.ar}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-[10px] font-bold text-silver-mist uppercase tracking-widest">
                            {term.context}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-600/30 relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2 text-indigo-200 font-bold text-xs uppercase tracking-widest">
                <Calendar className="w-4 h-4" /> Timekeeping Engine
              </div>
              <div>
                <h3 className="text-2xl font-black mb-2">Umm al-Qura Calendar</h3>
                <p className="text-indigo-100/70 text-sm leading-relaxed">
                  Current Hijri year, resolved live from the compliance calendar service.
                </p>
              </div>
              <div className="p-4 bg-white/10 rounded-xl">
                {loading ? (
                  <span className="text-indigo-100 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Resolving...
                  </span>
                ) : (
                  <span className="text-3xl font-black">
                    {hijriYear ? `${hijriYear} AH` : 'Unavailable'}
                  </span>
                )}
              </div>
              <button
                onClick={() => router.push('/localization/calendar-types')}
                className="w-full py-3 bg-white text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95"
              >
                Manage Calendars
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" /> Regional Config
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {CONFIG_ACTIONS.map((action) => (
                <button
                  key={action.href}
                  onClick={() => router.push(action.href)}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-ink-black dark:text-pearl border border-transparent hover:border-cloud dark:hover:border-nebula-purple/20"
                >
                  <span className="flex items-center gap-3">
                    <action.icon className="w-4 h-4 text-silver-mist" />
                    {action.label}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-silver-mist" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
