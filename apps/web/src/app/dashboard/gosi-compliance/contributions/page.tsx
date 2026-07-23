'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/stores/theme-store';
import { EmployeeSearchableSelect } from '@/components/shared/EmployeeSearchableSelect';
import {
  Search,
  SlidersHorizontal,
  Calendar,
  DollarSign,
  Plus,
  Check,
  X,
  ShieldAlert,
  Loader2,
  Trash2,
  Lock,
  ArrowRight,
  Calculator,
} from 'lucide-react';

interface Contribution {
  id: string;
  employeeId: string;
  period: string;
  nationalityClass: string;
  contributionWage: string;
  annuitiesEmployer: string;
  annuitiesEmployee: string;
  ohEmployer: string;
  totalEmployer: string;
  totalEmployee: string;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function ContributionsPage() {
  const { isDark } = useTheme();
  const [contribs, setContribs] = useState<Contribution[]>([]);
  const [period, setPeriod] = useState(periodNow());
  const [inputPeriod, setInputPeriod] = useState(period);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [wageForm, setWageForm] = useState({
    employeeId: '',
    basicWage: '5000',
    housingAllowance: '1500',
    otherAllowances: '0',
  });
  const [message, setMessage] = useState('');

  async function load() {
    setIsLoading(true);
    try {
      const r = await fetch(`/api/v1/gosi-compliance/contributions?period=${period}`);
      const p = await r.json();
      if (p.success) {
        setContribs(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [period]);

  async function recordWage() {
    setMessage('');
    const r = await fetch('/api/v1/gosi-compliance/wages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: wageForm.employeeId,
        period,
        basicWage: Number(wageForm.basicWage),
        housingAllowance: Number(wageForm.housingAllowance),
        otherAllowances: Number(wageForm.otherAllowances),
      }),
    });
    const p = await r.json();
    setMessage(
      p.success
        ? 'Wage recorded successfully'
        : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
  }

  async function computeOne() {
    setMessage('');
    const r = await fetch('/api/v1/gosi-compliance/contributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: wageForm.employeeId, period }),
    });
    const p = await r.json();
    setMessage(
      p.success
        ? 'Contribution computed successfully'
        : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    load();
  }

  async function deleteContrib(c: Contribution) {
    setMessage('');
    const r = await fetch(
      `/api/v1/gosi-compliance/contributions?employeeId=${c.employeeId}&period=${period}`,
      {
        method: 'DELETE',
      }
    );
    const p = await r.json();
    setMessage(
      p.success ? 'Contribution deleted' : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    load();
  }

  const filteredContribs = contribs.filter((c) => {
    return (
      searchQuery.trim() === '' ||
      c.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nationalityClass.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <main
      className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-8 text-slate-900 dark:text-slate-50 transition-colors duration-200"
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header Block */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              EPIC-13 · GOSI COMPLIANCE
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
              Contribution Wages & Calculation
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
              <input
                value={inputPeriod}
                onChange={(e) => setInputPeriod(e.target.value)}
                placeholder="YYYY-MM"
                className="w-24 bg-transparent border-0 px-3 py-1.5 text-sm text-center font-semibold focus:outline-none dark:text-white"
              />
              <button
                type="button"
                onClick={() => setPeriod(inputPeriod)}
                disabled={isLoading || period === inputPeriod}
                className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                Apply
              </button>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              {showForm ? <X className="h-4 w-4" /> : <Calculator className="h-4 w-4" />}
              {showForm ? 'Cancel Calculator' : 'Compute Wage'}
            </button>
          </div>
        </header>

        {/* Collapsible Calculator Form */}
        {showForm && (
          <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-indigo-650 dark:text-indigo-455" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Record Wage & Compute Contribution
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-4 lg:grid-cols-5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex flex-col gap-1.5 md:col-span-2 lg:col-span-1">
                Employee Name
                <EmployeeSearchableSelect
                  value={wageForm.employeeId}
                  onChange={(val) => setWageForm((f) => ({ ...f, employeeId: val }))}
                  placeholder="Search employee..."
                />
              </label>

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex flex-col gap-1.5">
                Basic Wage
                <input
                  value={wageForm.basicWage}
                  onChange={(e) => setWageForm((f) => ({ ...f, basicWage: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-850 px-3.5 py-2.5 text-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950 text-sm transition-all"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex flex-col gap-1.5">
                Housing Allowance
                <input
                  value={wageForm.housingAllowance}
                  onChange={(e) => setWageForm((f) => ({ ...f, housingAllowance: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-850 px-3.5 py-2.5 text-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950 text-sm transition-all"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex flex-col gap-1.5">
                Other Allowance
                <input
                  value={wageForm.otherAllowances}
                  onChange={(e) => setWageForm((f) => ({ ...f, otherAllowances: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-850 px-3.5 py-2.5 text-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950 text-sm transition-all"
                />
              </label>

              <div className="flex gap-3 items-end md:col-span-4 lg:col-span-1">
                <button
                  type="button"
                  onClick={recordWage}
                  disabled={!wageForm.employeeId}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-3 text-sm font-semibold transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Record
                </button>
                <button
                  type="button"
                  onClick={computeOne}
                  disabled={!wageForm.employeeId}
                  className="flex-1 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 px-4 py-3 text-sm font-semibold transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Compute
                </button>
              </div>
            </div>
          </section>
        )}

        {message ? (
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/50 text-sm text-indigo-750 dark:text-indigo-300 flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
            <ShieldAlert className="h-4 w-4 text-indigo-600" />
            {message}
          </div>
        ) : null}

        {/* Search and Filters Row */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search contributions by Employee ID or Class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>
        </section>

        {/* Results Metadata */}
        <div className="flex items-center justify-between mt-3 mb-1">
          <h2 className="text-xs font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-widest">
            Results ({filteredContribs.length} items)
          </h2>
          <button className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-855 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 transition-all shadow-sm">
            Columns
          </button>
        </div>

        {/* Table Panel */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Employee ID</th>
                <th className="px-4 py-3.5">Class</th>
                <th className="px-4 py-3.5">Contribution Wage</th>
                <th className="px-4 py-3.5">Annuities ER</th>
                <th className="px-4 py-3.5">Annuities EE</th>
                <th className="px-4 py-3.5">OH ER</th>
                <th className="px-4 py-3.5 font-bold">Total ER</th>
                <th className="px-4 py-3.5 font-bold">Total EE</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={`skel-${i}`} className="animate-pulse">
                      <td colSpan={9} className="px-4 py-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                : filteredContribs.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {c.employeeId}
                      </td>
                      <td className="px-4 py-4 text-slate-650 dark:text-slate-400">
                        {c.nationalityClass}
                      </td>
                      <td className="px-4 py-4 text-slate-900 dark:text-white font-semibold">
                        {c.contributionWage}
                      </td>
                      <td className="px-4 py-4 text-slate-650 dark:text-slate-400">
                        {c.annuitiesEmployer}
                      </td>
                      <td className="px-4 py-4 text-slate-650 dark:text-slate-400">
                        {c.annuitiesEmployee}
                      </td>
                      <td className="px-4 py-4 text-slate-650 dark:text-slate-400">
                        {c.ohEmployer}
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">
                        {c.totalEmployer}
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">
                        {c.totalEmployee}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => deleteContrib(c)}
                          className="rounded-xl border border-rose-250 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 font-bold transition-all shadow-sm cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              {!isLoading && filteredContribs.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-slate-400 dark:text-slate-500 font-medium"
                  >
                    No contributions found.
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
