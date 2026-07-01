'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Building2,
  Calculator,
  Users,
  Scale,
  FileText,
  ArrowRight,
  Globe,
} from 'lucide-react';

interface ComplianceCounts {
  controls: number;
  controlsOverdue: number;
  findingsOpen: number;
  risksOpen: number;
  certificates: number;
  certificatesSigned: number;
}

interface StatutoryRecord {
  id: string;
  status?: string;
  dueDate?: string | null;
  completedDate?: string | null;
}

interface StatutorySummary {
  total: number;
  compliant: number;
  overdue: number;
  pending: number;
  healthPct: number;
}

function summarizeStatutory(records: StatutoryRecord[]): StatutorySummary {
  const now = Date.now();
  let compliant = 0;
  let overdue = 0;
  let pending = 0;
  for (const r of records) {
    const status = (r.status || '').toUpperCase();
    const isDone =
      status === 'COMPLIANT' ||
      status === 'COMPLETED' ||
      status === 'CLOSED' ||
      Boolean(r.completedDate);
    if (isDone) {
      compliant += 1;
      continue;
    }
    const due = r.dueDate ? new Date(r.dueDate).getTime() : null;
    if (due !== null && due < now) {
      overdue += 1;
    } else {
      pending += 1;
    }
  }
  const total = records.length;
  const healthPct = total > 0 ? Math.round((compliant / total) * 100) : 0;
  return { total, compliant, overdue, pending, healthPct };
}

const complianceModules = [
  {
    id: 'wps',
    title: 'WPS',
    titleAr: 'حماية الأجور',
    subtitle: 'Wage Protection System',
    subtitleAr: 'نظام حماية الأجور',
    country: 'UAE',
    countryAr: 'الإمارات',
    icon: Shield,
    color: 'bg-emerald-500',
    description: 'Generate SIF files and manage salary payments for UAE compliance',
    descriptionAr: 'إنشاء ملفات SIF وإدارة دفع الرواتب لامتثال الإمارات',
    href: '/dashboard/payroll-compliance/wps',
  },
  {
    id: 'gosi',
    title: 'GOSI',
    titleAr: 'التأمينات',
    subtitle: 'Social Insurance',
    subtitleAr: 'التأمينات الاجتماعية',
    country: 'Saudi Arabia',
    countryAr: 'السعودية',
    icon: Building2,
    color: 'bg-blue-500',
    description: 'Calculate contributions and generate GOSI submission files',
    descriptionAr: 'حساب الاشتراكات وإنشاء ملفات التأمينات',
    href: '/dashboard/payroll-compliance/gosi',
  },
  {
    id: 'mudad',
    title: 'Mudad',
    titleAr: 'مدد',
    subtitle: 'Wage Protection',
    subtitleAr: 'حماية الأجور',
    country: 'Saudi Arabia',
    countryAr: 'السعودية',
    icon: FileText,
    color: 'bg-purple-500',
    description: 'Generate Mudad salary files for HRSD compliance',
    descriptionAr: 'إنشاء ملفات الرواتب لامتثال وزارة الموارد البشرية',
    href: '/dashboard/payroll-compliance/mudad',
  },
  {
    id: 'nitaqat',
    title: 'Nitaqat',
    titleAr: 'نطاقات',
    subtitle: 'Saudization Tracking',
    subtitleAr: 'تتبع التوطين',
    country: 'Saudi Arabia',
    countryAr: 'السعودية',
    icon: Users,
    color: 'bg-green-500',
    description: 'Track and manage workforce nationalization ratios',
    descriptionAr: 'تتبع وإدارة نسب توطين القوى العاملة',
    href: '/dashboard/payroll-compliance/nitaqat',
  },
  {
    id: 'eosb',
    title: 'EOSB Calculator',
    titleAr: 'حاسبة نهاية الخدمة',
    subtitle: 'End of Service Benefits',
    subtitleAr: 'مكافأة نهاية الخدمة',
    country: 'GCC + India',
    countryAr: 'الخليج + الهند',
    icon: Calculator,
    color: 'bg-amber-500',
    description: 'Calculate gratuity and end of service benefits for all countries',
    descriptionAr: 'حساب المكافأة ومستحقات نهاية الخدمة لجميع الدول',
    href: '/dashboard/payroll-compliance/eosb',
  },
  {
    id: 'labour-law',
    title: 'Labour Law',
    titleAr: 'قانون العمل',
    subtitle: 'Country Regulations',
    subtitleAr: 'اللوائح الخاصة بكل دولة',
    country: 'All Countries',
    countryAr: 'جميع الدول',
    icon: Scale,
    color: 'bg-indigo-500',
    description: 'Access labour law configurations and compliance rules',
    descriptionAr: 'الوصول لإعدادات قانون العمل وقواعد الامتثال',
    href: '/dashboard/payroll-compliance/labour-law',
  },
  {
    id: 'india-statutory',
    title: 'India Statutory',
    titleAr: 'الامتثال الهندي',
    subtitle: 'PF / ESI / TDS',
    subtitleAr: 'صندوق الادخار / التأمين الصحي / الضرائب',
    country: 'India',
    countryAr: 'الهند',
    icon: FileText,
    color: 'bg-orange-500',
    description: 'Manage PF, ESI, TDS and Professional Tax compliance',
    descriptionAr: 'إدارة امتثال صندوق الادخار والتأمين الصحي والضرائب',
    href: '/dashboard/payroll-compliance/india-statutory',
  },
];

const supportedCountries = [
  { code: 'AE', name: 'UAE', nameAr: 'الإمارات', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', nameAr: 'السعودية', flag: '🇸🇦' },
  { code: 'BH', name: 'Bahrain', nameAr: 'البحرين', flag: '🇧🇭' },
  { code: 'QA', name: 'Qatar', nameAr: 'قطر', flag: '🇶🇦' },
  { code: 'OM', name: 'Oman', nameAr: 'عمان', flag: '🇴🇲' },
  { code: 'KW', name: 'Kuwait', nameAr: 'الكويت', flag: '🇰🇼' },
  { code: 'IN', name: 'India', nameAr: 'الهند', flag: '🇮🇳' },
];

export default function PayrollCompliancePage() {
  const [counts, setCounts] = useState<ComplianceCounts | null>(null);
  const [statutory, setStatutory] = useState<StatutorySummary | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [dashRes, recordsRes] = await Promise.all([
          fetch('/api/v1/payroll-compliance/dashboard'),
          fetch('/api/compliance/records?pageSize=500'),
        ]);
        const dashBody = await dashRes.json();
        if (active && dashBody?.success && dashBody?.data?.counts) {
          setCounts(dashBody.data.counts as ComplianceCounts);
        }
        const recordsBody = await recordsRes.json();
        const records: StatutoryRecord[] =
          recordsBody?.data?.items ?? recordsBody?.items ?? recordsBody?.data ?? [];
        if (active && Array.isArray(records)) {
          setStatutory(summarizeStatutory(records));
        }
      } catch {
        // Non-fatal: hub still renders navigation without live governance counts.
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <Globe className="w-7 h-7 text-indigo-500" />
            Payroll Compliance
            <span className="text-sm font-normal text-slate-500 mr-2">|</span>
            <span className="text-lg font-semibold text-slate-600 dark:text-slate-400" dir="rtl">
              امتثال الرواتب
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage payroll compliance across MENA region and India
            <span className="mx-2">•</span>
            <span dir="rtl">إدارة امتثال الرواتب في منطقة الشرق الأوسط والهند</span>
          </p>
        </div>
      </div>

      {/* Supported Countries */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
          Supported Countries
          <span className="text-sm font-normal text-slate-500 mr-2"> | </span>
          <span className="text-base font-medium text-slate-600 dark:text-slate-400" dir="rtl">
            الدول المدعومة
          </span>
        </h2>
        <div className="flex flex-wrap gap-3">
          {supportedCountries.map((country) => (
            <div
              key={country.code}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <span className="text-xl">{country.flag}</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{country.name}</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600 dark:text-slate-400" dir="rtl">
                {country.nameAr}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Statutory Compliance Status (live, aggregated from real compliance records) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-500" />
            Statutory Compliance Status
            <span className="text-sm font-normal text-slate-500 mr-2"> | </span>
            <span className="text-base font-medium text-slate-600 dark:text-slate-400" dir="rtl">
              حالة الامتثال القانوني
            </span>
          </h2>
          {statutory && (
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                statutory.healthPct >= 80
                  ? 'bg-emerald-100 text-emerald-600'
                  : statutory.healthPct >= 50
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-red-100 text-red-600'
              }`}
            >
              {statutory.healthPct}% Compliant
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {statutory ? statutory.total : '—'}
            </div>
            <div className="text-sm text-slate-500">Total Requirements</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30">
            <div className="text-2xl font-bold text-emerald-600">
              {statutory ? statutory.compliant : '—'}
            </div>
            <div className="text-sm text-slate-500">Compliant</div>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
            <div className="text-2xl font-bold text-amber-600">
              {statutory ? statutory.pending : '—'}
            </div>
            <div className="text-sm text-slate-500">Pending</div>
          </div>
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30">
            <div className="text-2xl font-bold text-red-600">
              {statutory ? statutory.overdue : '—'}
            </div>
            <div className="text-sm text-slate-500">Overdue</div>
          </div>
        </div>
        {counts && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
            <span>
              Controls overdue:{' '}
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {counts.controlsOverdue}
              </span>
            </span>
            <span>
              Certificates signed:{' '}
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {counts.certificatesSigned}/{counts.certificates}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Compliance Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {complianceModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.id}
              href={module.href}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 ${module.color} rounded-xl flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400">
                  {module.country}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                {module.title}
                <span className="text-sm font-normal text-slate-500 mr-2"> | </span>
                <span
                  className="text-base font-medium text-slate-600 dark:text-slate-400"
                  dir="rtl"
                >
                  {module.titleAr}
                </span>
              </h3>
              <p className="text-sm text-slate-500 mb-3">
                {module.subtitle}
                <span className="mx-1">•</span>
                <span dir="rtl">{module.subtitleAr}</span>
              </p>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {module.description}
              </p>

              <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-medium group-hover:gap-2 transition-all">
                <span>Open Module</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Governance Snapshot (live) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
          <div className="text-3xl font-bold">{supportedCountries.length}</div>
          <div className="text-sm opacity-90">Countries Supported</div>
          <div className="text-xs opacity-75 mt-1" dir="rtl">
            دول مدعومة
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
          <div className="text-3xl font-bold">{counts ? counts.controls : '—'}</div>
          <div className="text-sm opacity-90">Active Controls</div>
          <div className="text-xs opacity-75 mt-1" dir="rtl">
            ضوابط نشطة
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white">
          <div className="text-3xl font-bold">{counts ? counts.findingsOpen : '—'}</div>
          <div className="text-sm opacity-90">Open Findings</div>
          <div className="text-xs opacity-75 mt-1" dir="rtl">
            نتائج مفتوحة
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white">
          <div className="text-3xl font-bold">{counts ? counts.risksOpen : '—'}</div>
          <div className="text-sm opacity-90">Open Risks</div>
          <div className="text-xs opacity-75 mt-1" dir="rtl">
            مخاطر مفتوحة
          </div>
        </div>
      </div>
    </div>
  );
}
