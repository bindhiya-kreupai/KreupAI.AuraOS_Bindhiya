'use client';

import React, { useState } from 'react';
import { BookOpen, CheckSquare, Square, CheckCircle2, ShieldX, Calendar } from 'lucide-react';

interface DisclosureInput {
  code: string;
  label: string;
  labelAr?: string;
  mandatory: boolean;
  filed: boolean;
  filedAt?: string;
  cadenceDays?: number;
}

const INITIAL_DISCLOSURES: DisclosureInput[] = [
  {
    code: 'CARBON_AUDIT',
    label: 'Annual Greenhouse Gas Scope 1-3 Audit',
    labelAr: 'تدقيق غازات الاحتباس الحراري السنوي',
    mandatory: true,
    filed: true,
    filedAt: '2026-01-15',
    cadenceDays: 365,
  },
  {
    code: 'GENDER_PAY_GAP',
    label: 'Gender Pay Gap & Equity Disclosures',
    labelAr: 'إفصاحات فجوة الأجور بين الجنسين',
    mandatory: true,
    filed: true,
    filedAt: '2025-06-20',
    cadenceDays: 365,
  },
  {
    code: 'BOARD_CHARTER',
    label: 'Governance Board Charter & S-ESG-01 compliance',
    labelAr: 'ميثاق مجلس الحوكمة والامتثال',
    mandatory: true,
    filed: false,
  },
  {
    code: 'SUPPLIER_DPA',
    label: 'Supplier Data Processing Agreements Audit',
    labelAr: 'تدقيق اتفاقيات معالجة بيانات الموردين',
    mandatory: false,
    filed: true,
    filedAt: '2026-03-10',
    cadenceDays: 180,
  },
  {
    code: 'WHISTLEBLOWER_POLICY',
    label: 'Whistleblower Policy & Grievance Logs Review',
    labelAr: 'مراجعة سياسة الإبلاغ عن المخالفات وسجلات المظالم',
    mandatory: true,
    filed: false,
  },
];

export default function DisclosureChecklistPage() {
  const [disclosures, setDisclosures] = useState<DisclosureInput[]>(INITIAL_DISCLOSURES);
  const [verdict, setVerdict] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleFiled = (index: number) => {
    setDisclosures(
      disclosures.map((d, i) => {
        if (i === index) {
          const nextFiled = !d.filed;
          return {
            ...d,
            filed: nextFiled,
            filedAt: nextFiled ? new Date().toISOString().slice(0, 10) : undefined,
          };
        }
        return d;
      })
    );
  };

  const handleDateChange = (index: number, val: string) => {
    setDisclosures(
      disclosures.map((d, i) => {
        if (i === index) {
          return { ...d, filedAt: val || undefined };
        }
        return d;
      })
    );
  };

  const evaluate = async () => {
    setError('');
    setVerdict(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/esg-compliance/sustainability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disclosure',
          input: {
            disclosures: disclosures.map((d) => ({
              ...d,
              filedAt: d.filedAt ? new Date(d.filedAt).toISOString() : undefined,
            })),
            asOf: new Date().toISOString(),
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.verdict) {
        setVerdict(data.data.verdict);
      } else {
        setError(data.error?.message || 'Evaluation failed');
      }
    } catch (err: any) {
      setError(err.message || 'API error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <p className="text-sm uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">
            EPIC-30 · ESG Sustainability
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Governance Disclosure Checklist
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track mandatory governance, diversity, and environmental reporting submissions against
            corporate cadences.
          </p>
        </header>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 text-rose-800 dark:text-rose-250 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Disclosure List Board */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Required Disclosures Tracker
                  </h2>
                </div>
                <button
                  onClick={evaluate}
                  disabled={loading}
                  className="rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium px-4 py-1.5 text-xs shadow transition-colors"
                >
                  {loading ? 'Evaluating...' : 'Evaluate Checklist'}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-150 dark:border-slate-700 uppercase">
                    <tr>
                      <th className="px-4 py-2.5 w-12 text-center">Status</th>
                      <th className="px-4 py-2.5">Disclosure Code & Label</th>
                      <th className="px-4 py-2.5">Mandatory</th>
                      <th className="px-4 py-2.5">Filing Date</th>
                      <th className="px-4 py-2.5">Cadence (Days)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {disclosures.map((d, index) => (
                      <tr key={d.code} className="hover:bg-slate-50 dark:hover:bg-slate-850/30">
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleFiled(index)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-350 transition-colors"
                          >
                            {d.filed ? (
                              <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-450" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 max-w-sm">
                          <p className="font-semibold text-slate-900 dark:text-white">{d.label}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {d.code}
                          </p>
                          {d.labelAr && (
                            <p
                              className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5"
                              dir="rtl"
                            >
                              {d.labelAr}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              d.mandatory
                                ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-455'
                                : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {d.mandatory ? 'MANDATORY' : 'OPTIONAL'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {d.filed ? (
                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 max-w-[125px]">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <input
                                type="date"
                                value={d.filedAt || ''}
                                onChange={(e) => handleDateChange(index, e.target.value)}
                                className="bg-transparent text-slate-700 dark:text-slate-200 font-medium outline-none text-[10px] w-full"
                              />
                            </div>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 font-mono">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-450">
                          {d.cadenceDays ? `${d.cadenceDays}d` : 'None'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Checklist Verdict Column */}
          <div className="md:col-span-1">
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm h-full flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
                  Checklist Evaluation
                </h2>

                {verdict ? (
                  <div className="space-y-6">
                    {/* Verdict Card */}
                    <div
                      className={`p-4 rounded-xl border flex flex-col gap-2 ${
                        verdict.totals.missing + verdict.totals.stale > 0
                          ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                          : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-250'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase font-bold tracking-wider">
                          Submission Rate
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            verdict.totals.missing + verdict.totals.stale > 0
                              ? 'bg-rose-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {verdict.totals.coveragePct}% COV
                        </span>
                      </div>
                      <p className="text-sm font-bold mt-1">
                        {verdict.totals.missing + verdict.totals.stale > 0
                          ? 'Checklist incomplete or containing stale disclosures'
                          : 'All mandatory disclosures are current and filed'}
                      </p>
                      <p className="text-[10px] opacity-75" dir="rtl">
                        {verdict.totals.missing + verdict.totals.stale > 0
                          ? 'القائمة غير مكتملة أو تحتوي على إفصاحات متأخرة'
                          : 'جميع الإفصاحات الإلزامية حالية ومقدمة'}
                      </p>
                    </div>

                    {/* Breakdown Stats */}
                    <div className="grid grid-cols-2 gap-3 text-xs font-medium pt-2">
                      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg p-3 text-center">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase">
                          Filed
                        </span>
                        <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {verdict.totals.filed} / {verdict.totals.mandatory}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg p-3 text-center">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase">
                          Missing
                        </span>
                        <p className="text-base font-bold text-rose-600 dark:text-rose-455 mt-0.5">
                          {verdict.totals.missing}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg p-3 col-span-2 text-center">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase">
                          Stale / Overdue Reports
                        </span>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {verdict.totals.stale}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-550 text-sm gap-2">
                    <CheckSquare className="w-8 h-8 text-slate-300 dark:text-slate-750" />
                    <p className="text-center">
                      Run the checklist evaluation to check for mandatory disclosure gaps.
                    </p>
                  </div>
                )}
              </div>

              {verdict && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6 text-[10px] text-slate-400 dark:text-slate-500 text-center">
                  Evaluation logs checked against active ESG disclosure cycles.
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
