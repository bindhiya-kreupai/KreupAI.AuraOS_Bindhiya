'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LayoutGrid, RefreshCw } from 'lucide-react';
import { isControlOverdue } from '../_components/risk-bands';

interface Control {
  id: string;
  controlCode: string;
  label: string;
  category: string;
  country: string | null;
  owner: string | null;
  frequency: string;
  lastReviewedAt: string | null;
  status: string;
}

const CATEGORIES: Array<{ key: string; label: string; labelAr: string }> = [
  { key: 'APPROVAL', label: 'Approval Gates', labelAr: 'بوابات الموافقة' },
  { key: 'PERIOD_LOCK', label: 'Period Lock', labelAr: 'قفل الفترة' },
  { key: 'GL_POSTING', label: 'GL Posting', labelAr: 'قيود دفتر الأستاذ' },
  { key: 'BANK_FILE', label: 'Bank File', labelAr: 'ملف البنك' },
  { key: 'RECONCILIATION', label: 'Reconciliation', labelAr: 'التسوية' },
  { key: 'STATUTORY', label: 'Statutory', labelAr: 'الالتزامات القانونية' },
  { key: 'AUDIT_TRAIL', label: 'Audit Trail', labelAr: 'سجل التدقيق' },
  { key: 'SOD', label: 'Segregation of Duties', labelAr: 'الفصل بين المهام' },
];

const isOverdue = (c: Control): boolean => isControlOverdue(c.lastReviewedAt, c.frequency);

export default function GovernanceControls8CategoriesPage() {
  const [rows, setRows] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/v1/payroll-compliance/governance?pageSize=500');
      const p = await r.json();
      if (p.success) {
        setRows((p.data?.items ?? p.data ?? []) as Control[]);
      } else {
        setError(p.error?.message ?? 'Failed to load governance controls');
      }
    } catch {
      setError('Failed to connect to governance service');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const byCategory = useMemo(() => {
    const map: Record<string, Control[]> = {};
    for (const cat of CATEGORIES) map[cat.key] = [];
    for (const c of rows) {
      if (!map[c.category]) map[c.category] = [];
      map[c.category].push(c);
    }
    return map;
  }, [rows]);

  return (
    <div className="space-y-6 pb-6">
      <div>
        <Link
          href="/dashboard/payroll-compliance"
          className="mb-2 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Compliance
        </Link>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
          <LayoutGrid className="h-7 w-7 text-indigo-500" />
          Governance Controls — 8 Categories
          <span className="text-sm font-normal text-slate-500">|</span>
          <span className="text-lg font-semibold text-slate-600 dark:text-slate-400" dir="rtl">
            ضوابط الحوكمة
          </span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Active payroll governance controls grouped by control category
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm text-white dark:bg-slate-700"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
        <Link
          href="/dashboard/payroll-compliance/governance"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600"
        >
          Manage controls
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {CATEGORIES.map((cat) => {
            const controls = byCategory[cat.key] ?? [];
            const overdue = controls.filter(isOverdue).length;
            return (
              <div
                key={cat.key}
                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                      {cat.label}
                    </h2>
                    <span className="text-xs text-slate-400" dir="rtl">
                      {cat.labelAr}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {controls.length} controls
                    </span>
                    {overdue > 0 ? (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                        {overdue} overdue
                      </span>
                    ) : null}
                  </div>
                </div>
                {controls.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-400">
                    No controls in this category.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {controls.map((c) => (
                      <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                        <span>
                          <span className="font-mono text-xs text-slate-500">{c.controlCode}</span>{' '}
                          {c.label}
                        </span>
                        <span
                          className={`text-xs ${isOverdue(c) ? 'text-rose-600' : 'text-emerald-600'}`}
                        >
                          {c.lastReviewedAt ? c.lastReviewedAt.slice(0, 10) : 'never'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
