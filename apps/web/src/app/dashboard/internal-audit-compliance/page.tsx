'use client';

import Link from 'next/link';
import {
  BadgeCheck,
  ClipboardCheck,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Target,
} from 'lucide-react';

const modules = [
  {
    title: 'Control test cadence',
    titleAr: 'دورية اختبار الضوابط',
    description: 'Track whether in-scope controls are tested on time.',
    descriptionAr: 'تتبع ما إذا كانت الضوابط في النطاق قد خضعت للاختبار في الوقت المناسب.',
    href: '/dashboard/internal-audit-compliance/control-tests',
    icon: ClipboardCheck,
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Finding closure SLA',
    titleAr: 'إغلاق الملاحظات ضمن SLA',
    description: 'Measure open and closed findings against severity-based SLAs.',
    descriptionAr: 'قياس الملاحظات المفتوحة والمغلقة مقابل حدود SLA وفقًا لدرجة الخطورة.',
    href: '/dashboard/internal-audit-compliance/finding-sla',
    icon: AlertTriangle,
    accent: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Repeat finding detector',
    titleAr: 'كشف الملاحظات المتكررة',
    description: 'Surface recurring issues by control and category for root-cause review.',
    descriptionAr: 'إظهار المشكلات المتكررة حسب الضابط والفئة لإجراء مراجعة سببية.',
    href: '/dashboard/internal-audit-compliance/repeat-findings',
    icon: Target,
    accent: 'from-rose-500 to-pink-600',
  },
];

export default function InternalAuditCompliancePage() {
  return (
    <div className="space-y-6 pb-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
              <ShieldCheck className="h-4 w-4" />
              Internal Audit Compliance
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Internal Audit Compliance
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Review control testing, audit finding SLAs, and repeat-risk patterns from one place.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
            <BadgeCheck className="h-4 w-4" />
            Audit readiness overview
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.href}
              href={module.href}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div
                className={`inline-flex rounded-2xl bg-gradient-to-br ${module.accent} p-3 text-white`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {module.title}
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {module.description}
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400" dir="rtl">
                {module.descriptionAr}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
                Open module
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
